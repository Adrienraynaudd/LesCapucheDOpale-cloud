import { Injectable } from '@angular/core';
import { ConsumableType } from '../../models/models';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConsumableService {
  private readonly baseUrlType = `${environment.apiUrl}/consumable-types`;
  private readonly baseUrl = `${environment.apiUrl}/consumables`;

  constructor(private readonly http: HttpClient) { }

  getConsumableTypes(): Observable<ConsumableType[]> {
    return this.http.get<ConsumableType[]>(this.baseUrlType);
  }

  addConsumableType(name: string): Observable<ConsumableType> {
    return this.http.post<ConsumableType>(this.baseUrlType, { name });
  }

  createConsumable(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, data);
  }

  updateConsumable(data: any, id: number): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/${id}`, data);
  }

  deleteConsumable(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getAllConsumables(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  getConsumableById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  purchaseConsumable(id: number, quantity: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/purchase`, { quantity });
  }

  setConsumableToQuest(questId: number, data: {consumableId: number, quantity: number}[]): Observable<any> {
    return this.http.patch<any>(`${environment.apiUrl}/quests/${questId}/consumables/set`, {consumables: data});
  }
}
