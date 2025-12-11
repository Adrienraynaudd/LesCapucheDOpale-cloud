import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UpdateQuest } from './update-quest';
import { QuestService } from '../../services/quest/quest.service';
import { QuestForm } from '../../models/quest';

describe('UpdateQuest', () => {
  let component: UpdateQuest;
  let fixture: ComponentFixture<UpdateQuest>;
  let questServiceSpy: jasmine.SpyObj<QuestService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteStub: Partial<ActivatedRoute>;

  const mockQuest: QuestForm = {
    name: 'Test Quest',
    description: 'A sample quest',
    finalDate: '2023-12-31',
    estimatedDuration: 7,
    reward: 1500
  };

  beforeEach(async () => {
    questServiceSpy = jasmine.createSpyObj('QuestService', [
      'getQuestById',
      'updateQuest',
      'validateQuest',
      'refuseQuest',
      'abandonQuest'
    ]);

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    activatedRouteStub = {
      snapshot: {
        paramMap: new Map([['id', '1']]) as any
      }
    } as any;

    await TestBed.configureTestingModule({
      imports: [UpdateQuest],
      providers: [
        { provide: QuestService, useValue: questServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateQuest);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should parse valid id from route and call getQuestById', () => {
    questServiceSpy.getQuestById.and.returnValue(of(mockQuest as any));
    component.ngOnInit();
    expect(component.id).toBe(1);
    expect(questServiceSpy.getQuestById).toHaveBeenCalledWith(1);
  });

  it('should assign quest after service returns data', () => {
    questServiceSpy.getQuestById.and.returnValue(of(mockQuest as any));
    component.ngOnInit();
    expect(component.quest).toEqual(mockQuest);
  });

  it('should log error if id is invalid', () => {
    spyOn(console, 'error');
    activatedRouteStub.snapshot = { paramMap: new Map([['id', 'abc']]) } as any;

    component = new UpdateQuest(questServiceSpy, activatedRouteStub as ActivatedRoute, routerSpy);
    component.ngOnInit();

    expect(console.error).toHaveBeenCalledWith('Invalid quest ID');
    expect(questServiceSpy.getQuestById).not.toHaveBeenCalled();
  });

  it('should call updateQuest and navigate on success', () => {
    questServiceSpy.updateQuest.and.returnValue(of(mockQuest as any));
    component.id = 1;
    component.onFormSubmitted(mockQuest);

    expect(questServiceSpy.updateQuest).toHaveBeenCalledWith(1, mockQuest);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/quests']);
  });

  it('should log error if updateQuest fails', () => {
    spyOn(console, 'error');
    questServiceSpy.updateQuest.and.returnValue(throwError(() => 'Server error'));
    component.id = 1;
    component.onFormSubmitted(mockQuest);
    expect(console.error).toHaveBeenCalledWith('Error updating quest:', 'Server error');
  });

  // ----- Tests des rôles -----

  it('should return true for isAssistant when role=1', () => {
    spyOn(localStorage, 'getItem').and.returnValue('1');
    expect(component.isAssistant()).toBeTrue();
  });

  it('should return true for isClient when role=2', () => {
    spyOn(localStorage, 'getItem').and.returnValue('2');
    expect(component.isClient()).toBeTrue();
  });

  // ----- Validation -----

  it('should call validateQuest and navigate if assistant', () => {
    spyOn(localStorage, 'getItem').and.returnValue('1');
    questServiceSpy.validateQuest.and.returnValue(of({} as any));
    component.id = 1;
    component.form.setValue({ recommendedXP: 200 });
    component.onValidate();
    expect(questServiceSpy.validateQuest).toHaveBeenCalledWith(1, 200);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/quests']);
  });

  it('should log error if validateQuest fails', () => {
    spyOn(localStorage, 'getItem').and.returnValue('1');
    spyOn(console, 'error');
    questServiceSpy.validateQuest.and.returnValue(throwError(() => 'validation error'));
    component.id = 1;
    component.form.setValue({ recommendedXP: 100 });
    component.onValidate();
    expect(console.error).toHaveBeenCalledWith('Error validating quest:', 'validation error');
  });

  // ----- Refus -----

  it('should call refuseQuest and navigate if assistant', () => {
    spyOn(localStorage, 'getItem').and.returnValue('1');
    questServiceSpy.refuseQuest.and.returnValue(of({} as any));
    component.id = 1;
    component.onRefuse();
    expect(questServiceSpy.refuseQuest).toHaveBeenCalledWith(1);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/quests']);
  });

  it('should log error if refuseQuest fails', () => {
    spyOn(localStorage, 'getItem').and.returnValue('1');
    spyOn(console, 'error');
    questServiceSpy.refuseQuest.and.returnValue(throwError(() => 'refuse error'));
    component.id = 1;
    component.onRefuse();
    expect(console.error).toHaveBeenCalledWith('Error refusing quest:', 'refuse error');
  });

  // ----- Abandon -----

  it('should call abandonQuest and navigate if client', () => {
    spyOn(localStorage, 'getItem').and.returnValue('2');
    questServiceSpy.abandonQuest.and.returnValue(of({} as any));
    component.id = 1;
    component.onAbandon();
    expect(questServiceSpy.abandonQuest).toHaveBeenCalledWith(1);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/quests']);
  });

  it('should log error if abandonQuest fails', () => {
    spyOn(localStorage, 'getItem').and.returnValue('2');
    spyOn(console, 'error');
    questServiceSpy.abandonQuest.and.returnValue(throwError(() => 'abandon error'));
    component.id = 1;
    component.onAbandon();
    expect(console.error).toHaveBeenCalledWith('Error abandoning quest:', 'abandon error');
  });
});
