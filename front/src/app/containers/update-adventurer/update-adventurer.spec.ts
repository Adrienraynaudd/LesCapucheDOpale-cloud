import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { UpdateAdventurer } from './update-adventurer';
import { AdventurerService } from '../../services/adventurer/adventurer.service';
import { AdventurerFormData } from '../../models/adventurer';

class MockAdventurerService {
  getAdventurerById = jasmine.createSpy('getAdventurerById').and.returnValue(of({
    id: 1,
    name: 'Lara',
    speciality: { id: 2, name: 'Rogue' },
    specialityId: 2,
    equipmentTypes: [{ id: 3, name: 'Dagger' }],
    equipmentTypeIds: [3],
    consumableTypes: [{ id: 4, name: 'Potion' }],
    consumableTypeIds: [4],
    dailyRate: 200
  }));

  updateAdventurer = jasmine.createSpy('updateAdventurer').and.returnValue(of({
    id: 1,
    name: 'Updated Lara',
    speciality: { id: 2, name: 'Rogue' },
    specialityId: 2,
    equipmentTypes: [{ id: 3, name: 'Dagger' }],
    equipmentTypeIds: [3],
    consumableTypes: [{ id: 4, name: 'Potion' }],
    consumableTypeIds: [4],
    dailyRate: 250
  }));
}

describe('UpdateAdventurer', () => {
  let component: UpdateAdventurer;
  let fixture: ComponentFixture<UpdateAdventurer>;
  let adventurerService: MockAdventurerService;
  let route: ActivatedRoute;
  let router: Router;
  let mockParamMap: any;

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  beforeEach(async () => {
    mockParamMap = {
      get: jasmine.createSpy('get').and.callFake((key: string) => key === 'id' ? '1' : null),
      has: jasmine.createSpy('has').and.returnValue(true),
      getAll: jasmine.createSpy('getAll').and.returnValue(['1']),
      keys: []
    };
    
    await TestBed.configureTestingModule({
      imports: [UpdateAdventurer],
      providers: [
        { provide: AdventurerService, useClass: MockAdventurerService },
        provideRouter([]),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: mockParamMap
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateAdventurer);
    component = fixture.componentInstance;
    adventurerService = TestBed.inject(AdventurerService) as any;
    route = TestBed.inject(ActivatedRoute);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load adventurer data on init when ID is valid', () => {
    expect(adventurerService.getAdventurerById).toHaveBeenCalledWith(1);
    expect(component.adventurer).toEqual({
      name: 'Lara',
      specialityId: 2,
      equipmentTypeIds: [3],
      consumableTypeIds: [4],
      dailyRate: 200
    });
  });

  it('should call updateAdventurer and navigate on success', () => {
    const mockFormData: AdventurerFormData = {
      name: 'Updated Lara',
      specialityId: 2,
      equipmentTypeIds: [3],
      consumableTypeIds: [4],
      dailyRate: 250
    };

    component.id = 1;
    (component as any).onFormSubmitted(mockFormData);

    expect(adventurerService.updateAdventurer).toHaveBeenCalledWith(1, mockFormData);
    expect(router.navigate).toHaveBeenCalledWith(['/adventurers']);
  });

  it('should handle error when updateAdventurer fails', () => {
    const mockFormData: AdventurerFormData = {
      name: 'Error Lara',
      specialityId: 2,
      equipmentTypeIds: [3],
      consumableTypeIds: [4],
      dailyRate: 200
    };

    const consoleErrorSpy = spyOn(console, 'error');
    component.id = 1;
    adventurerService.updateAdventurer.and.returnValue(throwError(() => new Error('Update failed')));

    (component as any).onFormSubmitted(mockFormData);

    expect(adventurerService.updateAdventurer).toHaveBeenCalledWith(1, mockFormData);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating adventurer:', jasmine.any(Error));
  });

  describe('invalid ID scenarios', () => {
    beforeEach(() => {
      spyOn(console, 'error');
      adventurerService.getAdventurerById.calls.reset();
    });

    it('should not call service if id is null', () => {
      mockParamMap.get.and.returnValue(null);
      component.ngOnInit();
      expect(adventurerService.getAdventurerById).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Invalid adventurer ID');
    });

    it('should not call service if id is not numeric', () => {
      mockParamMap.get.and.returnValue('abc');
      component.ngOnInit();
      expect(adventurerService.getAdventurerById).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Invalid adventurer ID');
    });

    it('should not call service if id is negative', () => {
      mockParamMap.get.and.returnValue('-5');
      component.ngOnInit();
      expect(adventurerService.getAdventurerById).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Invalid adventurer ID');
    });

    it('should not call service if id is NaN', () => {
      mockParamMap.get.and.returnValue('NaN');
      component.ngOnInit();
      expect(adventurerService.getAdventurerById).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Invalid adventurer ID');
    });
  });
});
