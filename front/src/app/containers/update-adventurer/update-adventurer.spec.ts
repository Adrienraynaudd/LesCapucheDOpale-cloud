import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { UpdateAdventurer } from './update-adventurer';
import { AdventurerService } from '../../services/adventurer/adventurer.service';
import { AdventurerFormData } from '../../models/adventurer';

class MockAdventurerService {
  getAdventurerById = jasmine.createSpy('getAdventurerById').and.returnValue(of({
    id: 1,
    name: 'Lara',
    speciality: { id: 2, name: 'Rogue' },
    equipmentType: [{ id: 3, name: 'Dagger' }],
    consumableType: [{ id: 4, name: 'Potion' }],
    dailyRate: 200
  }));

  updateAdventurer = jasmine.createSpy('updateAdventurer').and.returnValue(of({
    id: 1,
    name: 'Updated Lara',
    speciality: { id: 2, name: 'Rogue' },
    equipmentType: [{ id: 3, name: 'Dagger' }],
    consumableType: [{ id: 4, name: 'Potion' }],
    dailyRate: 250
  }));
}

describe('UpdateAdventurer', () => {
  let component: UpdateAdventurer;
  let fixture: ComponentFixture<UpdateAdventurer>;
  let adventurerService: MockAdventurerService;
  let route: ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateAdventurer],
      providers: [
        { provide: AdventurerService, useClass: MockAdventurerService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: new Map([['id', '1']]) }
          }
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateAdventurer);
    component = fixture.componentInstance;
    adventurerService = TestBed.inject(AdventurerService) as any;
    route = TestBed.inject(ActivatedRoute);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load adventurer data on init when ID is valid', () => {
    expect(adventurerService.getAdventurerById).toHaveBeenCalledWith(1);
    expect(component.adventurer).toEqual({
      name: 'Lara',
      speciality: 2,
      equipmentType: [3],
      consumableType: [4],
      dailyRate: 200
    });
  });

  it('should call updateAdventurer when form is submitted', () => {
    const mockFormData: AdventurerFormData = {
      name: 'Updated Lara',
      speciality: 2,
      equipmentType: [3],
      consumableType: [4],
      dailyRate: 250
    };

    const consoleSpy = spyOn(console, 'log');
    component.id = 1;

    (component as any).onFormSubmitted(mockFormData);

    expect(adventurerService.updateAdventurer).toHaveBeenCalledWith(1, mockFormData);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Adventurer updated successfully:',
      jasmine.objectContaining({ name: 'Updated Lara' })
    );
  });

  it('should handle error when updateAdventurer fails', () => {
    const mockFormData: AdventurerFormData = {
      name: 'Error Lara',
      speciality: 2,
      equipmentType: [3],
      consumableType: [4],
      dailyRate: 200
    };

    const consoleErrorSpy = spyOn(console, 'error');
    component.id = 1;
    adventurerService.updateAdventurer.and.returnValue(throwError(() => new Error('Update failed')));

    (component as any).onFormSubmitted(mockFormData);

    expect(adventurerService.updateAdventurer).toHaveBeenCalledWith(1, mockFormData);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error updating adventurer:',
      jasmine.any(Error)
    );
  });

  describe('invalid ID scenarios', () => {
    beforeEach(() => {
      spyOn(console, 'error');
      adventurerService.getAdventurerById.calls.reset();
    });

    it('should not call service if id is null', () => {
      (route.snapshot.paramMap as any).get = () => null;
      component.ngOnInit();
      expect(adventurerService.getAdventurerById).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Invalid adventurer ID');
    });

    it('should not call service if id is not numeric', () => {
      (route.snapshot.paramMap as any).get = () => 'abc';
      component.ngOnInit();
      expect(adventurerService.getAdventurerById).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Invalid adventurer ID');
    });

    it('should not call service if id is negative', () => {
      (route.snapshot.paramMap as any).get = () => '-5';
      component.ngOnInit();
      expect(adventurerService.getAdventurerById).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Invalid adventurer ID');
    });

    it('should not call service if id is NaN', () => {
      (route.snapshot.paramMap as any).get = () => 'NaN';
      component.ngOnInit();
      expect(adventurerService.getAdventurerById).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Invalid adventurer ID');
    });
  });
});
