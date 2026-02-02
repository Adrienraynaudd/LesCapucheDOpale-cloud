import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FinancesComponent } from './finances.component';
import { FinancesService } from '../../services/finances/finances.service';
import { QuestService } from '../../services/quest/quest.service';
import { of } from 'rxjs';
import { Transaction, FinanceStats, BalanceResponse, HistoryResponse } from '../../models/finance';
import { Quest } from '../../models/quest';

describe('FinancesComponent', () => {
  let component: FinancesComponent;
  let fixture: ComponentFixture<FinancesComponent>;
  let financesServiceSpy: jasmine.SpyObj<FinancesService>;
  let questServiceSpy: jasmine.SpyObj<QuestService>;

  const mockBalance: BalanceResponse = { balance: 1500 };

  const mockTransactions: Transaction[] = [
    { id: 1, amount: 500, description: 'Récompense quête #1', date: '2026-01-15T10:00:00.000Z', total: 1500 },
    { id: 2, amount: -200, description: 'Salaires quête #1', date: '2026-01-15T09:00:00.000Z', total: 1000 }
  ];

  const mockHistoryResponse: HistoryResponse = {
    transactions: mockTransactions,
    totalCount: 2,
    skip: 0,
    take: 10
  };

  const mockStatistics: FinanceStats = {
    totalIncome: 5000,
    totalExpenses: 3500,
    balance: 1500,
    transactionCount: 10
  };

  const mockQuests: Quest[] = [
    {
      id: 1,
      name: 'Quête du dragon',
      description: 'Vaincre le dragon',
      finalDate: '2026-02-28',
      reward: 200,
      statusId: 4,
      estimatedDuration: 5,
      recommendedXP: 100,
      UserId: 1,
      status: { id: 4, name: 'En cours' },
      adventurers: [
        {
          id: 1,
          name: 'Aragorn',
          speciality: { id: 1, name: 'Guerrier' },
          specialityId: 1,
          equipmentTypes: [],
          equipmentTypeIds: [],
          consumableTypes: [],
          consumableTypeIds: [],
          dailyRate: 10,
          experience: 100
        }
      ],
      questStockEquipments: []
    }
  ];

  beforeEach(async () => {
    financesServiceSpy = jasmine.createSpyObj('FinancesService', [
      'getBalance',
      'getHistory',
      'getStatistics',
      'postTransaction'
    ]);
    questServiceSpy = jasmine.createSpyObj('QuestService', ['getAllQuests']);

    financesServiceSpy.getBalance.and.returnValue(of(mockBalance));
    financesServiceSpy.getHistory.and.returnValue(of(mockHistoryResponse));
    financesServiceSpy.getStatistics.and.returnValue(of(mockStatistics));
    questServiceSpy.getAllQuests.and.returnValue(of(mockQuests));

    await TestBed.configureTestingModule({
      imports: [FinancesComponent],
      providers: [
        { provide: FinancesService, useValue: financesServiceSpy },
        { provide: QuestService, useValue: questServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FinancesComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load balance on init', () => {
    component.ngOnInit();

    expect(financesServiceSpy.getBalance).toHaveBeenCalled();
    expect(component.balance).toBe(1500);
  });

  it('should load history on init', () => {
    component.ngOnInit();

    expect(financesServiceSpy.getHistory).toHaveBeenCalledWith(0, 10);
    expect(component.transactions).toEqual(mockTransactions);
    expect(component.totalCount).toBe(2);
  });

  it('should load statistics on init', () => {
    component.ngOnInit();

    expect(financesServiceSpy.getStatistics).toHaveBeenCalled();
    expect(component.statistics).toEqual(mockStatistics);
  });

  it('should load pending quests on init', () => {
    component.ngOnInit();

    expect(questServiceSpy.getAllQuests).toHaveBeenCalled();
    expect(component.pendingQuests.length).toBe(1);
    expect(component.pendingQuests[0].statusId).toBe(4);
  });

  it('should calculate total pending rewards correctly', () => {
    component.ngOnInit();

    expect(component.totalPendingRewards).toBe(200);
  });

  it('should submit transaction and reload data', () => {
    const newTransaction = { amount: 100, description: 'Test transaction' };
    financesServiceSpy.postTransaction.and.returnValue(of({
      id: 3,
      amount: 100,
      description: 'Test transaction',
      date: '2026-02-02T10:00:00.000Z',
      total: 1600
    }));

    component.newTransaction = newTransaction;
    component.submitTransaction();

    expect(financesServiceSpy.postTransaction).toHaveBeenCalledWith(newTransaction);
    expect(financesServiceSpy.getBalance).toHaveBeenCalled();
    expect(financesServiceSpy.getHistory).toHaveBeenCalled();
    expect(financesServiceSpy.getStatistics).toHaveBeenCalled();
  });

  it('should not submit transaction if description is empty', () => {
    component.newTransaction = { amount: 100, description: '' };
    component.submitTransaction();

    expect(financesServiceSpy.postTransaction).not.toHaveBeenCalled();
  });

  it('should not submit transaction if amount is 0', () => {
    component.newTransaction = { amount: 0, description: 'Test' };
    component.submitTransaction();

    expect(financesServiceSpy.postTransaction).not.toHaveBeenCalled();
  });

  it('should go to next page', () => {
    component.totalCount = 25;
    component.skip = 0;
    component.take = 10;

    component.nextPage();

    expect(component.skip).toBe(10);
    expect(financesServiceSpy.getHistory).toHaveBeenCalledWith(10, 10);
  });

  it('should not go to next page if already at last page', () => {
    component.totalCount = 10;
    component.skip = 0;
    component.take = 10;
    financesServiceSpy.getHistory.calls.reset();

    component.nextPage();

    expect(component.skip).toBe(0);
    expect(financesServiceSpy.getHistory).not.toHaveBeenCalled();
  });

  it('should go to previous page', () => {
    component.skip = 10;
    component.take = 10;

    component.previousPage();

    expect(component.skip).toBe(0);
    expect(financesServiceSpy.getHistory).toHaveBeenCalledWith(0, 10);
  });

  it('should not go to previous page if already at first page', () => {
    component.skip = 0;
    financesServiceSpy.getHistory.calls.reset();

    component.previousPage();

    expect(component.skip).toBe(0);
    expect(financesServiceSpy.getHistory).not.toHaveBeenCalled();
  });

  it('should format date correctly', () => {
    const dateString = '2026-01-15T10:30:00.000Z';
    const formatted = component.formatDate(dateString);

    expect(formatted).toContain('15');
    expect(formatted).toContain('01');
    expect(formatted).toContain('2026');
  });

  it('should filter only started quests (statusId = 4)', () => {
    const mixedQuests: Quest[] = [
      { ...mockQuests[0], id: 1, statusId: 4 },
      { ...mockQuests[0], id: 2, statusId: 1 },
      { ...mockQuests[0], id: 3, statusId: 4 },
      { ...mockQuests[0], id: 4, statusId: 2 }
    ];
    questServiceSpy.getAllQuests.and.returnValue(of(mixedQuests));

    component.loadPendingQuests();

    expect(component.pendingQuests.length).toBe(2);
    expect(component.pendingQuests.every(q => q.statusId === 4)).toBeTrue();
  });

  it('should calculate prediction with salary costs', () => {
    component.balance = 1000;
    component.pendingQuests = mockQuests;

    component.updatePredictionChart();

    // totalPendingRewards = 200
    // totalSalaryCost = 10 * 5 = 50
    // optimisticGain = (200 * 0.8) - 50 = 160 - 50 = 110
    // pessimisticGain = -(50 * 0.4) = -20
    expect(component.totalPendingRewards).toBe(200);

    const datasets = component.predictionChartData.datasets;
    expect(datasets.length).toBe(3);

    // Optimiste: 1000 + 110 = 1110
    expect(datasets[0].data[0]).toBe(1110);
    // Pessimiste: 1000 - 20 = 980
    expect(datasets[2].data[0]).toBe(980);
  });
});
