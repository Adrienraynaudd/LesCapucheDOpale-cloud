import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AdventurerService } from './adventurer.service';
import { Adventurer, AdventurerFormData } from '../../models/models';
import { provideHttpClient } from '@angular/common/http';

describe('AdventurerService', () => {
  let service: AdventurerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdventurerService, provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(AdventurerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Vérifie qu’aucune requête HTTP n’est restée ouverte
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a new adventurer via POST', () => {
    const formData: AdventurerFormData = {
      name: 'Aragorn',
      specialty: 1,
      equipmentType: [1, 2],
      consumableType: [3],
      dailyRate: 500
    };

    const mockResponse: Adventurer = {
      id: 1,
      name: 'Aragorn',
      specialty: { id: 1, name: 'Warrior' },
      equipmentType: [
        { id: 1, name: 'Sword' },
        { id: 2, name: 'Shield' }
      ],
      consumableType: [
        { id: 3, name: 'Health Potion' }
      ],
      dailyRate: 500
    };

    service.createAdventurer(formData).subscribe((adventurer) => {
      expect(adventurer).toEqual(mockResponse);
      expect(adventurer.name).toBe('Aragorn');
    });

    const req = httpMock.expectOne(`/api/adventurers`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(formData);

    req.flush(mockResponse); // Simule la réponse du serveur
  });
});
