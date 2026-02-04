import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Transaction,
  FinanceStats,
  BalanceResponse,
  HistoryResponse,
  CreateTransactionDto
} from '../../models/finance';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FinancesService {
  private readonly baseUrl = `${environment.apiUrl}/finances`;

  constructor(private readonly http: HttpClient) { }

  getBalance(): Observable<BalanceResponse> {
    return this.http.get<BalanceResponse>(`${this.baseUrl}/balance`);
  }

  /**
   * Récupère l'historique des transactions avec pagination
   * @param skip Nombre de transactions à ignorer (pagination)
   * @param take Nombre de transactions à récupérer
   */
  getHistory(skip?: number, take?: number): Observable<HistoryResponse> {
    let params = new HttpParams();
    if (skip !== undefined) {
      params = params.set('skip', skip.toString());
    }
    if (take !== undefined) {
      params = params.set('take', take.toString());
    }
    return this.http.get<HistoryResponse>(`${this.baseUrl}/history`, { params });
  }


  getStatistics(): Observable<FinanceStats> {
    return this.http.get<FinanceStats>(`${this.baseUrl}/statistics`);
  }


  postTransaction(transaction: CreateTransactionDto): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.baseUrl}/transaction`, transaction);
  }
}
