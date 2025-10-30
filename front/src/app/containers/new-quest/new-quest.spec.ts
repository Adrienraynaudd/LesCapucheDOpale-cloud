import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewQuest } from './new-quest';
import { QuestService } from '../../services/quest/quest.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { QuestForm } from '../../models/models';

describe('NewQuest', () => {
  let component: NewQuest;
  let fixture: ComponentFixture<NewQuest>;
  let questServiceSpy: jasmine.SpyObj<QuestService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    questServiceSpy = jasmine.createSpyObj('QuestService', ['createQuest']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [NewQuest],
      providers: [
        { provide: QuestService, useValue: questServiceSpy },
        { provide: Router, useValue: routerSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NewQuest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call QuestService.createQuest and navigate on success', () => {
    // Arrange
    const mockForm: QuestForm = { name: 'Test Quest', description: 'Some description', finalDate: '2023-12-31', estimatedDuration: 120, reward: 500 };
    questServiceSpy.createQuest.and.returnValue(of({} as any));

    // Act
    component['onFormSubmitted'](mockForm);

    // Assert
    expect(questServiceSpy.createQuest).toHaveBeenCalledWith(mockForm);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/quests']);
  });

  it('should handle error on createQuest failure', () => {
    // Arrange
    const mockForm: QuestForm = { name: 'Test Quest', description: 'Some description', finalDate: '2023-12-31', estimatedDuration: 120, reward: 500 };
    const mockError = { status: 500, message: 'Server Error' };
    questServiceSpy.createQuest.and.returnValue(throwError(() => mockError));

    spyOn(console, 'error');
    spyOn(window, 'alert');

    // Act
    component['onFormSubmitted'](mockForm);

    // Assert
    expect(questServiceSpy.createQuest).toHaveBeenCalledWith(mockForm);
    expect(console.error).toHaveBeenCalledWith('Erreur lors de la création de la quête :', mockError);
    expect(window.alert).toHaveBeenCalledWith('Une erreur est survenue lors de la création de la quête.');
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});
