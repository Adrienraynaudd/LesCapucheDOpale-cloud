import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  AdventurerAvailability, 
  AdventurerRest, 
  CreateAdventurerRestData, 
  DayStatus 
} from '../../models/adventurer-availability';
import { Adventurer } from '../../models/adventurer';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdventurerAvailabilityService {
  private readonly baseUrl = `${environment.apiUrl}/adventurer-availability`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Check if an adventurer is available for a given period
   */
  checkAvailability(adventurerId: number, startDate: string, endDate: string): Observable<AdventurerAvailability> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<AdventurerAvailability>(`${this.baseUrl}/${adventurerId}/check`, { params });
  }

  /**
   * Get the schedule of an adventurer for a given period
   */
  getSchedule(adventurerId: number, startDate: string, endDate: string): Observable<DayStatus[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<DayStatus[]>(`${this.baseUrl}/${adventurerId}/schedule`, { params });
  }

  /**
   * Get all available adventurers for a given period
   */
  findAvailableAdventurers(startDate: string, endDate: string): Observable<Adventurer[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<Adventurer[]>(`${this.baseUrl}/available`, { params });
  }

  /**
   * Get all rest periods for an adventurer
   */
  getRestPeriods(adventurerId: number): Observable<AdventurerRest[]> {
    return this.http.get<AdventurerRest[]>(`${this.baseUrl}/${adventurerId}/rests`);
  }

  /**
   * Create a new rest period
   */
  createRestPeriod(data: CreateAdventurerRestData): Observable<AdventurerRest> {
    return this.http.post<AdventurerRest>(`${this.baseUrl}/rests`, data);
  }

  /**
   * Update a rest period
   */
  updateRestPeriod(id: number, data: Partial<CreateAdventurerRestData>): Observable<AdventurerRest> {
    return this.http.patch<AdventurerRest>(`${this.baseUrl}/rests/${id}`, data);
  }

  /**
   * Delete a rest period
   */
  deleteRestPeriod(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/rests/${id}`);
  }
}
