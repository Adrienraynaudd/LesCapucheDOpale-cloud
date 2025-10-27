import { Injectable } from '@angular/core';
import { Adventurer, AdventurerFormData } from '../../models/models';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdventurerService {
  private readonly baseUrl = `/api/adventurers`;

  constructor(private readonly http: HttpClient) { }

  createAdventurer(data: AdventurerFormData): Observable<Adventurer> {
    return this.http.post<Adventurer>(this.baseUrl, data);
  }

  getAll(): Observable<Adventurer[]> {
    return this.http.get<Adventurer[]>(this.baseUrl);
  }

  getAdventurerById(id: number): Observable<Adventurer> {
    return this.http.get<Adventurer>(`${this.baseUrl}/${id}`);
  }

  updateAdventurer(id: number, data: AdventurerFormData): Observable<Adventurer> {
    return this.http.put<Adventurer>(`${this.baseUrl}/${id}`, data);
  }
}
