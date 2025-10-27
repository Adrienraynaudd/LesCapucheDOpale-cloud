import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SpecialityService } from './speciality.service';
import { Specialty } from '../../models/models';
import { provideHttpClient } from '@angular/common/http';

describe('SpecialityService', () => {
  let service: SpecialityService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SpecialityService, provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(SpecialityService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Vérifie qu'aucune requête HTTP inattendue n'est restée en suspens
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve specialties from the API via GET', () => {
    const mockSpecialties: Specialty[] = [
      { id: 1, name: 'Cardiology' },
      { id: 2, name: 'Neurology' },
    ];

    service.getSpecialties().subscribe((specialties) => {
      expect(specialties).toEqual(mockSpecialties);
      expect(specialties.length).toBe(2);
      expect(specialties[0].name).toBe('Cardiology');
    });

    const req = httpMock.expectOne(`/api/specialties`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSpecialties);
  });
});
