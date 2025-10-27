import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewAdventurerComponent } from './new-adventurer.component';
import { AdventurerService } from '../../services/adventurer/adventurer.service';
import { Adventurer, AdventurerFormData } from '../../models/models';
import { of, throwError } from 'rxjs';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('NewAdventurerComponent', () => {
  let component: NewAdventurerComponent;
  let fixture: ComponentFixture<NewAdventurerComponent>;
  let adventurerServiceSpy: jasmine.SpyObj<AdventurerService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AdventurerService', ['createAdventurer']);

    await TestBed.configureTestingModule({
      imports: [NewAdventurerComponent],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: AdventurerService, useValue: spy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NewAdventurerComponent);
    component = fixture.componentInstance;
    adventurerServiceSpy = TestBed.inject(
      AdventurerService
    ) as jasmine.SpyObj<AdventurerService>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call AdventurerService.createAdventurer() on form submission', () => {
    // Arrange
    const mockFormData: AdventurerFormData = {
      name: 'Aragorn',
      specialty: 1,
      equipmentType: [],
      consumableType: [],
      dailyRate: 123,
    };

    const mockResponse: Adventurer = {
      name: 'Aragorn',
      specialty: { id: 1, name: 'Guerrier' },
      equipmentType: [],
      consumableType: [],
      dailyRate: 123,
    };

    adventurerServiceSpy.createAdventurer.and.returnValue(of(mockResponse));

    // Act
    component['onFormSubmitted'](mockFormData);

    // Assert
    expect(adventurerServiceSpy.createAdventurer).toHaveBeenCalledOnceWith(
      mockFormData
    );
  });

  it('should handle service error gracefully', () => {
    // Arrange
    const mockFormData: AdventurerFormData = {
      name: 'Legolas',
      specialty: 2,
      equipmentType: [],
      consumableType: [],
      dailyRate: 150,
    };

    const consoleErrorSpy = spyOn(console, 'error');
    adventurerServiceSpy.createAdventurer.and.returnValue(
      throwError(() => new Error('Network error'))
    );

    // Act
    component['onFormSubmitted'](mockFormData);

    // Assert
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error creating adventurer:',
      jasmine.any(Error)
    );
  });
});
