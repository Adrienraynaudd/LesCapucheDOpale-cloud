import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FinancesService } from './finances.service';
import { provideHttpClient } from '@angular/common/http';
import { Transaction, FinanceStats, BalanceResponse, HistoryResponse, CreateTransactionDto } from '../../models/finance';

describe('FinancesService', () => {
  let service: FinancesService;
  let httpMock: HttpTestingController;

  const mockBalance: BalanceResponse = { balance: 15000 };

  const mockTransactions: Transaction[] = [
    { id: 1, amount: 1000, description: 'Avance 20% quête #5', date: '2026-01-12T10:00:00.000Z', total: 15000 },
    { id: 2, amount: -500, description: 'Salaires quête #4', date: '2026-01-11T14:00:00.000Z', total: 14000 }
  ];

  const mockHistoryResponse: HistoryResponse = {
    transactions: mockTransactions,
    totalCount: 100,
    skip: 0,
    take: 50
  };

  const mockStatistics: FinanceStats = {
    totalIncome: 50000,
    totalExpenses: 35000,
    balance: 15000,
    transactionCount: 100
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FinancesService, provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(FinancesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getBalance', () => {
    it('should return the current balance', () => {
      service.getBalance().subscribe((response) => {
        expect(response).toEqual(mockBalance);
        expect(response.balance).toBe(15000);
      });

      const req = httpMock.expectOne('/api/finances/balance');
      expect(req.request.method).toBe('GET');
      req.flush(mockBalance);
    });
  });

  describe('getHistory', () => {
    it('should return transaction history without pagination', () => {
      service.getHistory().subscribe((response) => {
        expect(response).toEqual(mockHistoryResponse);
        expect(response.transactions.length).toBe(2);
      });

      const req = httpMock.expectOne('/api/finances/history');
      expect(req.request.method).toBe('GET');
      req.flush(mockHistoryResponse);
    });

    it('should return transaction history with skip parameter', () => {
      service.getHistory(10).subscribe((response) => {
        expect(response).toEqual(mockHistoryResponse);
      });

      const req = httpMock.expectOne('/api/finances/history?skip=10');
      expect(req.request.method).toBe('GET');
      req.flush(mockHistoryResponse);
    });

    it('should return transaction history with skip and take parameters', () => {
      service.getHistory(20, 25).subscribe((response) => {
        expect(response).toEqual(mockHistoryResponse);
      });

      const req = httpMock.expectOne('/api/finances/history?skip=20&take=25');
      expect(req.request.method).toBe('GET');
      req.flush(mockHistoryResponse);
    });
  });

  describe('getStatistics', () => {
    it('should return financial statistics', () => {
      service.getStatistics().subscribe((response) => {
        expect(response).toEqual(mockStatistics);
        expect(response.totalIncome).toBe(50000);
        expect(response.totalExpenses).toBe(35000);
        expect(response.balance).toBe(15000);
        expect(response.transactionCount).toBe(100);
      });

      const req = httpMock.expectOne('/api/finances/statistics');
      expect(req.request.method).toBe('GET');
      req.flush(mockStatistics);
    });
  });

  describe('postTransaction', () => {
    it('should create a new positive transaction (income)', () => {
      const newTransaction: CreateTransactionDto = {
        amount: 1000,
        description: 'Vente équipement'
      };

      const createdTransaction: Transaction = {
        id: 42,
        amount: 1000,
        description: 'Vente équipement',
        date: '2026-01-12T10:00:00.000Z',
        total: 16000
      };

      service.postTransaction(newTransaction).subscribe((response) => {
        expect(response).toEqual(createdTransaction);
        expect(response.id).toBe(42);
        expect(response.amount).toBe(1000);
      });

      const req = httpMock.expectOne('/api/finances/transaction');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newTransaction);
      req.flush(createdTransaction);
    });

    it('should create a new negative transaction (expense)', () => {
      const newTransaction: CreateTransactionDto = {
        amount: -500,
        description: 'Achat fournitures'
      };

      const createdTransaction: Transaction = {
        id: 43,
        amount: -500,
        description: 'Achat fournitures',
        date: '2026-01-12T11:00:00.000Z',
        total: 14500
      };

      service.postTransaction(newTransaction).subscribe((response) => {
        expect(response).toEqual(createdTransaction);
        expect(response.amount).toBe(-500);
      });

      const req = httpMock.expectOne('/api/finances/transaction');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newTransaction);
      req.flush(createdTransaction);
    });
  });
});
