import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { UpdateQuest } from './update-quest';
import { QuestService } from '../../services/quest/quest.service';
import { QuestForm } from '../../models/quest';

describe('UpdateQuest', () => {
  let component: UpdateQuest;
  let fixture: ComponentFixture<UpdateQuest>;
  let questServiceSpy: jasmine.SpyObj<QuestService>;
  let routeStub: Partial<ActivatedRoute>;

  const mockQuest: QuestForm = {
    name: 'Test Quest',
    description: 'A sample quest',
    finalDate: '2023-12-31',
    estimatedDuration: 7,
    reward: 1500
  };

  beforeEach(async () => {
    questServiceSpy = jasmine.createSpyObj('QuestService', ['getQuestById', 'updateQuest']);

    routeStub = {
      snapshot: {
        paramMap: new Map([['id', '1']]) as any
      }
    } as any;

    await TestBed.configureTestingModule({
      imports: [UpdateQuest],
      providers: [
        { provide: QuestService, useValue: questServiceSpy },
        { provide: ActivatedRoute, useValue: routeStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateQuest);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should parse valid id from route', () => {
    questServiceSpy.getQuestById.and.returnValue(of(mockQuest) as any);

    component.ngOnInit();

    expect(component.id).toBe(1);
    expect(questServiceSpy.getQuestById).toHaveBeenCalledWith(1);
  });

  it('should assign quest after service returns data', () => {
    questServiceSpy.getQuestById.and.returnValue(of(mockQuest) as any);

    component.ngOnInit();

    expect(component.quest).toEqual(mockQuest);
  });

  it('should log error if id is invalid (non-numeric)', () => {
    spyOn(console, 'error');
    routeStub.snapshot = { paramMap: new Map([['id', 'abc']])} as any;

    component = new UpdateQuest(questServiceSpy, routeStub as ActivatedRoute);
    component.ngOnInit();

    expect(console.error).toHaveBeenCalledWith('Invalid adventurer ID');
    expect(questServiceSpy.getQuestById).not.toHaveBeenCalled();
  });

  it('should call updateQuest when form is submitted', () => {
    questServiceSpy.updateQuest.and.returnValue(of(mockQuest) as any);

    component.id = 1;
    component.onFormSubmitted(mockQuest);

    expect(questServiceSpy.updateQuest).toHaveBeenCalledWith(1, mockQuest);
  });
});
