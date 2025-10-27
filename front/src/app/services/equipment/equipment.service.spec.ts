import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EquipmentService } from './equipment.service';
import { EquipmentType } from '../../models/equipment-type';
import { provideHttpClient } from '@angular/common/http';

describe('EquipmentService', () => {
  let service: EquipmentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EquipmentService, provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(EquipmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Vérifie qu’aucune requête HTTP n’est restée en suspens
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve equipment from the API via GET', () => {
    const mockEquipment: EquipmentType[] = [
      { id: 1, name: 'ECG' },
      { id: 2, name: 'MRI' },
    ];

    service.getEquipment().subscribe((equipment) => {
      expect(equipment).toEqual(mockEquipment);
      expect(equipment.length).toBe(2);
      expect(equipment[0].name).toBe('ECG');
    });

    const req = httpMock.expectOne(`/api/equipment-types`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEquipment); // Simule la réponse du serveur
  });
});
