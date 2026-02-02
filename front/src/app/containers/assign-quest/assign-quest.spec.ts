import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssignQuest } from './assign-quest';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestService } from '../../services/quest/quest.service';
import { AdventurerService } from '../../services/adventurer/adventurer.service';
import { EquipmentService } from '../../services/equipment/equipment.service';
import { ConsumableService } from '../../services/consumable/consumable.service';
import { of } from 'rxjs';
import { Quest, Adventurer } from '../../models/models';

describe('AssignQuest', () => {
  let component: AssignQuest;
  let fixture: ComponentFixture<AssignQuest>;

  let mockQuestService: jasmine.SpyObj<QuestService>;
  let mockAdventurerService: jasmine.SpyObj<AdventurerService>;
  let mockEquipmentService: jasmine.SpyObj<EquipmentService>;
  let mockConsumableService: jasmine.SpyObj<ConsumableService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockQuest: Quest = {
    id: 1,
    name: 'Test Quest',
    reward: 250,
    recommendedXP: 100,
    estimatedDuration: 2,
    statusId: 2,
    adventurers: [
      { id: 1, name: 'A1', experience: 80, dailyRate: 10, speciality: { id: 1, name: 'Warrior' }, specialityId: 1, equipmentTypes: [], equipmentTypeIds: [], consumableTypes: [], consumableTypeIds: [] }
    ],
    questStockEquipments: [],
    description: 'A sample quest',
    finalDate: '2023-12-31',
    UserId: 1,
    status: { id: 3, name: 'Ready' }
  };

  const mockAdventurers: Adventurer[] = [
    { id: 1, name: 'A1', experience: 80, dailyRate: 10, speciality: { id: 1, name: 'Warrior' }, specialityId: 1, equipmentTypes: [], equipmentTypeIds: [], consumableTypes: [], consumableTypeIds: [] },
    { id: 2, name: 'A2', experience: 120, dailyRate: 20, speciality: { id: 2, name: 'Mage' }, specialityId: 2, equipmentTypes: [], equipmentTypeIds: [], consumableTypes: [], consumableTypeIds: [] }
  ];

  beforeEach(async () => {
    mockQuestService = jasmine.createSpyObj('QuestService', [
      'getQuestById', 'assignAdventurer', 'unassignAdventurer', 'startQuest'
    ]);
    mockAdventurerService = jasmine.createSpyObj('AdventurerService', [
      'getAll'
    ]);
    mockEquipmentService = jasmine.createSpyObj('EquipmentService', [
      'getStockEquipments', 'assignEquipment', 'unassignEquipment'
    ]);
    mockConsumableService = jasmine.createSpyObj('ConsumableService', [
      'getAllConsumables', 'setConsumableToQuest'
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockQuestService.getQuestById.and.returnValue(of(mockQuest));
    mockAdventurerService.getAll.and.returnValue(of(mockAdventurers));
    mockEquipmentService.getStockEquipments.and.returnValue(of([]));
    mockConsumableService.getAllConsumables.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AssignQuest],
      providers: [
        { provide: QuestService, useValue: mockQuestService },
        { provide: AdventurerService, useValue: mockAdventurerService },
        { provide: EquipmentService, useValue: mockEquipmentService },
        { provide: ConsumableService, useValue: mockConsumableService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => '1' } }
          }
        },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AssignQuest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // -----------------------------------------------------
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // -----------------------------------------------------
  it('should load quest, adventurers and equipment on init', () => {
    expect(component.quest).toEqual(mockQuest);
    expect(component.adventurers.length).toBe(2);
    expect(component.selectedAdventurerIds.has(1)).toBeTrue();
    expect(component.cost).toBe(20); // 10 * 2 days
  });

  // -----------------------------------------------------
  it('should redirect if quest not assignable (statusId !== 2)', () => {
    mockQuestService.getQuestById.and.returnValue(
      of({ ...mockQuest, statusId: 3 })
    );

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [AssignQuest],
      providers: [
        { provide: QuestService, useValue: mockQuestService },
        { provide: AdventurerService, useValue: mockAdventurerService },
        { provide: EquipmentService, useValue: mockEquipmentService },
        { provide: ConsumableService, useValue: mockConsumableService },
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

  // -----------------------------------------------------
  it('should assign an adventurer when toggled and not selected', () => {
    const newAdv = mockAdventurers[1];
    mockQuestService.assignAdventurer.and.returnValue(of({} as any));

    component.onToggleAdventurer(newAdv);

    expect(mockQuestService.assignAdventurer)
      .toHaveBeenCalledWith(1, 2);
    expect(component.selectedAdventurerIds.has(2)).toBeTrue();
    expect(component.cost).toBe(20 + 40);
    expect(component.successRateForAdventurer[2]).toBe(1);
  });

  // -----------------------------------------------------
  it('should unassign an adventurer when toggled and selected', () => {
    const existingAdv = mockAdventurers[0];
    mockQuestService.unassignAdventurer.and.returnValue(of({} as any));

    component.onToggleAdventurer(existingAdv);

    expect(mockQuestService.unassignAdventurer)
      .toHaveBeenCalledWith(1, 1);
    expect(component.selectedAdventurerIds.has(1)).toBeFalse();
    expect(component.cost).toBe(0);
    expect(component.successRateForAdventurer[1]).toBeUndefined();
  });

  // -----------------------------------------------------
  it('should compute costBreakdown correctly', () => {
    component.cost = 123;
    expect(component.costBreakdown).toEqual({ po: 1, pa: 2, pc: 3 });
  });

  // -----------------------------------------------------
  it('should compute rewardBreakdown correctly', () => {
    expect(component.rewardBreakdown).toEqual({ po: 2, pa: 5, pc: 0 });
  });

  // -----------------------------------------------------
  it('should calculate successRate correctly', () => {
    expect(component.successRate).toBe(64);
  });

  // -----------------------------------------------------
  it('should assign equipment when toggled and not selected', () => {
    const equipment = { id: 10 };
    mockEquipmentService.assignEquipment.and.returnValue(of({} as any));

    component.onToggleEquipment(equipment);

    expect(mockEquipmentService.assignEquipment).toHaveBeenCalledWith(1, 10);
    expect(component.selectedEquipmentIds.has(10)).toBeTrue();
  });

  // -----------------------------------------------------
  it('should unassign equipment when toggled and selected', () => {
    component.selectedEquipmentIds.add(10);
    const equipment = { id: 10 };
    mockEquipmentService.unassignEquipment.and.returnValue(of({} as any));

    component.onToggleEquipment(equipment);

    expect(mockEquipmentService.unassignEquipment).toHaveBeenCalledWith(1, 10);
    expect(component.selectedEquipmentIds.has(10)).toBeFalse();
  });

  // -----------------------------------------------------
  it('should update consumable quantity on valid input', () => {
    mockConsumableService.setConsumableToQuest.and.returnValue(of({} as any));
    const event = { target: { value: '5' } } as unknown as Event;

    component.onConsumableQuantityChange(1, event);

    expect(component.selectedConsumableQuantities[1]).toBe(5);
    expect(mockConsumableService.setConsumableToQuest).toHaveBeenCalledWith(1, [{ consumableId: 1, quantity: 5 }]);
  });

  // -----------------------------------------------------
  it('should remove consumable quantity on invalid input', () => {
    component.selectedConsumableQuantities[1] = 5;
    mockConsumableService.setConsumableToQuest.and.returnValue(of({} as any));
    const event = { target: { value: '-1' } } as unknown as Event;

    component.onConsumableQuantityChange(1, event);

    expect(component.selectedConsumableQuantities[1]).toBeUndefined();
  });

  // -----------------------------------------------------
  it('should start quest and navigate', () => {
    mockQuestService.startQuest.and.returnValue(of({} as any));

    component.startQuest();

    expect(mockQuestService.startQuest).toHaveBeenCalledWith(1);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/quest/', 1]);
  });

});
