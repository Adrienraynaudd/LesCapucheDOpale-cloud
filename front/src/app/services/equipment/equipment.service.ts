import { Injectable } from '@angular/core';
import { EquipmentType } from '../../models/equipment-type';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Equipment, EquipmentFormData, StockEquipment } from '../../models/models';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  private readonly baseUrl = `${environment.apiUrl}/equipment-types`;

  constructor(private readonly http: HttpClient) { }

  getEquipmentType(): Observable<EquipmentType[]> {
    return this.http.get<EquipmentType[]>(this.baseUrl);
  }

  addEquipmentType(name: string): Observable<EquipmentType> {
    return this.http.post<EquipmentType>(this.baseUrl, { name });
  }

  createEquipment(data: EquipmentFormData) {
    return this.http.post<EquipmentFormData>(`${environment.apiUrl}/equipment`, data);
  }

  updateEquipment(data: EquipmentFormData, id: number) {
    return this.http.patch<EquipmentFormData>(`${environment.apiUrl}/equipment/${id}`, data);
  }

  getAllEquipment() {
    return this.http.get<Equipment[]>(`${environment.apiUrl}/equipment`);
  }

  getEquipmentById(equipmentId: number) {
    return this.http.get<EquipmentFormData>(`${environment.apiUrl}/equipment/${equipmentId}`);
  }

  getStockEquipments() {
    return this.http.get<StockEquipment[]>(`${environment.apiUrl}/equipment-stocks`);
  }

  createEquipmentStock(equipmentId: number, quantity: number) {
    return this.http.post(`${environment.apiUrl}/equipment-stocks`, {
      equipmentId,
      quantity,
    });
  }

  assignEquipment(questId: number, equipmentId: number): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/quests/${questId}/equipment-stocks/attach`, { "ids": [equipmentId] });
  }

  unassignEquipment(questId: number, equipmentId: number): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/quests/${questId}/equipment-stocks/detach`, { "ids": [equipmentId] });
  }
}
