import { Injectable } from '@angular/core';
import { ConsumableType } from '../../models/models';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ConsumableService {
  private readonly baseUrlType = `/api/consumable-types`;

  constructor(private readonly http: HttpClient) { }

  getConsumables(): Observable<ConsumableType[]> {
    return this.http.get<ConsumableType[]>(this.baseUrlType);
  }
}
