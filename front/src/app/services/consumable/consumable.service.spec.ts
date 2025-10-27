import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ConsumableService } from './consumable.service';
import { ConsumableType } from '../../models/models';
import { provideHttpClient } from '@angular/common/http';

describe('ConsumableService', () => {
  let service: ConsumableService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConsumableService, provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(ConsumableService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Vérifie qu’aucune requête HTTP n’est restée en attente
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve consumables from the API via GET', () => {
    const mockConsumables: ConsumableType[] = [
      { id: 1, name: 'Gloves' },
      { id: 2, name: 'Syringes' },
    ];

    service.getConsumables().subscribe((consumables) => {
      expect(consumables).toEqual(mockConsumables);
      expect(consumables.length).toBe(2);
      expect(consumables[0].name).toBe('Gloves');
    });

    const req = httpMock.expectOne(`/api/consumable-types`);
    expect(req.request.method).toBe('GET');
    req.flush(mockConsumables); // Simule la réponse du serveur
  });
});
