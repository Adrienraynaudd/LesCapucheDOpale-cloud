import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssignQuest } from './assign-quest';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestService } from '../../services/quest/quest.service';
import { AdventurerService } from '../../services/adventurer/adventurer.service';
import { of } from 'rxjs';
import { Quest, Adventurer } from '../../models/models';

describe('AssignQuest', () => {
  let component: AssignQuest;
  let fixture: ComponentFixture<AssignQuest>;

  let mockQuestService: jasmine.SpyObj<QuestService>;
  let mockAdventurerService: jasmine.SpyObj<AdventurerService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockQuest: Quest = {
    id: 1,
    name: 'Test Quest',
    reward: 250,
    recommendedXP: 100,
    estimatedDuration: 2,
    statusId: 3,
    adventurers: [
      { id: 1, name: 'A1', experience: 80, dailyRate: 10, speciality: { id: 1, name: 'Warrior' }, specialityId: 1, equipmentTypes: [], equipmentTypeIds: [], consumableTypes: [], consumableTypeIds: [] }
    ],
    description: 'A sample quest',
    finalDate: '2023-12-31',
    UserId: 1,
    status: { id: 3, name: 'Ready for Assignment' }
  };

  const mockAdventurers: Adventurer[] = [
    { id: 1, name: 'A1', experience: 80, dailyRate: 10, speciality: { id: 1, name: 'Warrior' }, specialityId: 1, equipmentTypes: [], equipmentTypeIds: [], consumableTypes: [], consumableTypeIds: [] },
    { id: 2, name: 'A2', experience: 120, dailyRate: 20, speciality: { id: 2, name: 'Mage' }, specialityId: 2, equipmentTypes: [], equipmentTypeIds: [], consumableTypes: [], consumableTypeIds: [] }
  ];

  beforeEach(async () => {
    mockQuestService = jasmine.createSpyObj('QuestService', [
      'getQuestById', 'assignAdventurer', 'unassignAdventurer'
    ]);
    mockAdventurerService = jasmine.createSpyObj('AdventurerService', [
      'getAll'
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [AssignQuest],
      providers: [
        { provide: QuestService, useValue: mockQuestService },
        { provide: AdventurerService, useValue: mockAdventurerService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => '1' } }
          }
        },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    mockQuestService.getQuestById.and.returnValue(of(mockQuest));
    mockAdventurerService.getAll.and.returnValue(of(mockAdventurers));

    fixture = TestBed.createComponent(AssignQuest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ---------------------------------------------
  //              BASIC CREATION
  // ---------------------------------------------
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ---------------------------------------------
  //              INIT LOGIC
  // ---------------------------------------------
  it('should load quest and adventurers on init', () => {
    expect(component.quest).toEqual(mockQuest);
    expect(component.adventurers.length).toBe(2);
    expect(component.selectedAdventurerIds.has(1)).toBeTrue();
    expect(component.cost).toBe(20); // dailyRate 10 * 2 days
  });

  // ---------------------------------------------
  //        Redirect if quest.statusId !== 3
  // ---------------------------------------------
  it('should redirect if quest not assignable', () => {
    mockQuestService.getQuestById.and.returnValue(
      of({ ...mockQuest, statusId: 2 })
    );

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [AssignQuest],
      providers: [
        { provide: QuestService, useValue: mockQuestService },
        { provide: AdventurerService, useValue: mockAdventurerService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } }
        },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    const fixture2 = TestBed.createComponent(AssignQuest);
    fixture2.detectChanges();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/quest/', 1]);
  });

  // ---------------------------------------------
  //        TOGGLE ADD ADVENTURER
  // ---------------------------------------------
  it('should assign an adventurer when toggled and not selected', () => {
    const newAdv = mockAdventurers[1]; // id = 2
    mockQuestService.assignAdventurer.and.returnValue(of({} as any));

    component.onToggleAdventurer(newAdv);

    expect(mockQuestService.assignAdventurer)
      .toHaveBeenCalledWith(1, 2);
    expect(component.selectedAdventurerIds.has(2)).toBeTrue();
    expect(component.cost).toBe(20 + newAdv.dailyRate * mockQuest.estimatedDuration); // 20 + 40
    expect(component.successRateForAdventurer[2]).toBe(1);
  });

  // ---------------------------------------------
  //        TOGGLE REMOVE ADVENTURER
  // ---------------------------------------------
  it('should unassign an adventurer when toggled and selected', () => {
    mockQuestService.unassignAdventurer.and.returnValue(of({} as any));

    const existingAdv = mockAdventurers[0]; // id = 1
    component.onToggleAdventurer(existingAdv);

    expect(mockQuestService.unassignAdventurer)
      .toHaveBeenCalledWith(1, 1);
    expect(component.selectedAdventurerIds.has(1)).toBeFalse();
    expect(component.cost).toBe(0);
    expect(component.successRateForAdventurer[1]).toBeUndefined();
  });

  // ---------------------------------------------
  //         COST BREAKDOWN
  // ---------------------------------------------
  it('should compute costBreakdown correctly', () => {
    component.cost = 123; // 1po / 2pa / 3pc
    expect(component.costBreakdown).toEqual({ po: 1, pa: 2, pc: 3 });
  });

  // ---------------------------------------------
  //         REWARD BREAKDOWN
  // ---------------------------------------------
  it('should compute rewardBreakdown correctly', () => {
    expect(component.rewardBreakdown).toEqual({ po: 2, pa: 5, pc: 0 });
  });

  // ---------------------------------------------
  //         SUCCESS RATE
  // ---------------------------------------------
  it('should calculate successRate correctly', () => {
    // A1: 80/100 = 0.8
    expect(component.successRate).toBe(
      Math.round((0.8 * 80) * 100) / 100
    );
  });
});
