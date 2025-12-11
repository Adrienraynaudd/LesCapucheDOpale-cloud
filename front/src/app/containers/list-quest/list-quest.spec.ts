import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ListQuest } from './list-quest';
import { QuestService } from '../../services/quest/quest.service';
import { Router, provideRouter } from '@angular/router';
import { Quest } from '../../models/models';
import { throwError } from 'rxjs';

describe('ListQuest (Angular 20)', () => {
  let component: ListQuest;
  let fixture: ComponentFixture<ListQuest>;
  let questServiceSpy: jasmine.SpyObj<QuestService>;
  let router: Router;

  const mockQuests: Quest[] = [
    { id: 1, name: 'Rescue the Princess', description: 'Save the princess from the tower', reward: 100, finalDate: '2024-12-31', statusId: 1, status: { id: 1, name: 'Open' }, UserId: 1, estimatedDuration: 3, recommendedXP: 356, adventurers: [] },
    { id: 2, name: 'Slay the Dragon', description: 'Defeat the dragon threatening the kingdom', reward: 200, finalDate: '2024-12-31', statusId: 1, status: { id: 1, name: 'Open' }, UserId: 1, estimatedDuration: 5, recommendedXP: 500, adventurers: [] },
  ];

  beforeEach(async () => {
    questServiceSpy = jasmine.createSpyObj('QuestService', ['getAllQuests']);
    questServiceSpy.getAllQuests.and.returnValue(of(mockQuests));

    await TestBed.configureTestingModule({
      imports: [ListQuest],
      providers: [
        { provide: QuestService, useValue: questServiceSpy },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListQuest);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load quests on init', () => {
    fixture.detectChanges();
    expect(questServiceSpy.getAllQuests).toHaveBeenCalled();
    expect(component.quests).toEqual(mockQuests);
  });

  it('should navigate to quest details when onQuestClick is called', () => {
    fixture.detectChanges();
    const navigateSpy = spyOn(router, 'navigate');
    const questId = 1;

    component.onQuestClick(questId);

    expect(navigateSpy).toHaveBeenCalledWith(['/quest', questId]);
  });

  it('should have an empty quest list before init', () => {
    expect(component.quests.length).toBe(0);
  });

  it('should log an error if getAllQuests fails', () => {
    const consoleSpy = spyOn(console, 'error');
    questServiceSpy.getAllQuests.and.returnValue(throwError(() => new Error('Server error')));

    fixture = TestBed.createComponent(ListQuest);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Erreur lors du chargement des quêtes',
      jasmine.any(Error)
    );
  });
});
