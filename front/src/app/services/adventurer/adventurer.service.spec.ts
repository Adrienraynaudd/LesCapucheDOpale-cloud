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
      speciality: 1,
      equipmentType: [1, 2],
      consumableType: [3],
      dailyRate: 500
    };

    const mockResponse: Adventurer = {
      id: 1,
      name: 'Aragorn',
      speciality: { id: 1, name: 'Warrior' },
      equipmentType: [
        { id: 1, name: 'Sword' },
        { id: 2, name: 'Shield' }
      ],
      consumableType: [
        { id: 3, name: 'Health Potion' }
      ],
      dailyRate: 500,
      experience: 0
    };

    service.createAdventurer(formData).subscribe((adventurer) => {
      expect(adventurer).toEqual(mockResponse);
      expect(adventurer.name).toBe('Aragorn');
    });

    const req = httpMock.expectOne(`/api/adventurers`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(formData);

    req.flush(mockResponse);
  });

  it('should retrieve all adventurers via GET', () => {
    const mockAdventurers: Adventurer[] = [
      { id: 1, name: 'Aragorn', speciality: { id: 1, name: 'Warrior' }, equipmentType: [], consumableType: [], dailyRate: 500, experience: 100 },
      { id: 2, name: 'Legolas', speciality: { id: 2, name: 'Archer' }, equipmentType: [], consumableType: [], dailyRate: 600, experience: 150 }
    ];

    service.getAll().subscribe((adventurers) => {
      expect(adventurers.length).toBe(2);
      expect(adventurers).toEqual(mockAdventurers);
    });

    const req = httpMock.expectOne(`/api/adventurers`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAdventurers);
  });

  it('should retrieve an adventurer by id via GET', () => {
    const mockAdventurer: Adventurer = {
      id: 1,
      name: 'Gimli',
      speciality: { id: 3, name: 'Dwarf Warrior' },
      equipmentType: [],
      consumableType: [],
      dailyRate: 400,
      experience: 200
    };

    service.getAdventurerById(1).subscribe((adventurer) => {
      expect(adventurer).toEqual(mockAdventurer);
      expect(adventurer.id).toBe(1);
    });

    const req = httpMock.expectOne(`/api/adventurers/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAdventurer);
  });

  it('should update an adventurer via PUT', () => {
    const updateData: AdventurerFormData = {
      name: 'Gimli the Brave',
      speciality: 3,
      equipmentType: [2],
      consumableType: [3],
      dailyRate: 450
    };

    const mockResponse: Adventurer = {
      id: 1,
      name: 'Gimli the Brave',
      speciality: { id: 3, name: 'Dwarf Warrior' },
      equipmentType: [{ id: 2, name: 'Axe' }],
      consumableType: [{ id: 3, name: 'Beer' }],
      dailyRate: 450,
      experience: 250
    };

    service.updateAdventurer(1, updateData).subscribe((adventurer) => {
      expect(adventurer).toEqual(mockResponse);
      expect(adventurer.name).toBe('Gimli the Brave');
    });

    const req = httpMock.expectOne(`/api/adventurers/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateData);
    req.flush(mockResponse);
  });
});
