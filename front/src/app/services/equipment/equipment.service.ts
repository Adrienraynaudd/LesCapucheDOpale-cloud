import { Injectable } from '@angular/core';
import { EquipmentType } from '../../models/equipment-type';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  private readonly baseUrl = `/api/equipment-types`;

  constructor(private readonly http: HttpClient) { }

  getEquipment(): Observable<EquipmentType[]> {
    return this.http.get<EquipmentType[]>(this.baseUrl);
  }
}
