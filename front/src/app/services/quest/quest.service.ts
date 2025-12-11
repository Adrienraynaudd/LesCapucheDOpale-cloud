import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QuestForm, Quest } from '../../models/models';

@Injectable({
  providedIn: 'root'
})
export class QuestService {
  private readonly baseUrl = `/api/quests`;

  constructor(private readonly http: HttpClient) { }

  getAllQuests(): Observable<Quest[]> {
    return this.http.get<Quest[]>(this.baseUrl);
  }

  getQuestById(id: number): Observable<Quest> {
    return this.http.get<Quest>(`${this.baseUrl}/${id}`);
  }

  createQuest(quest: QuestForm): Observable<Quest> {
    return this.http.post<Quest>(this.baseUrl, quest);
  }

  updateQuest(id: number, quest: QuestForm): Observable<Quest> {
    return this.http.patch<Quest>(`${this.baseUrl}/${id}`, quest);
  }

  validateQuest(id: number, xp: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/validate`, { xp });
  }

  refuseQuest(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/refuse`, {});
  }

  abandonQuest(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/abandon`, {});
  }

  assignAdventurer(questId: number, adventurerId: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${questId}/adventurers/attach`, { "ids": [adventurerId] });
  }

  unassignAdventurer(questId: number, adventurerId: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${questId}/adventurers/detach`, { "ids": [adventurerId] });
  }
}
