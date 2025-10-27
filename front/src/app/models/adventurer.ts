import { ConsumableType, EquipmentType, Specialty } from "./models";

export interface Adventurer {
  id?: number;
  name: string;
  specialty: Specialty;
  equipmentType: EquipmentType[];
  consumableType: ConsumableType[];
  dailyRate: number; // in copper pieces
}

export interface AdventurerFormData {
  name: string;
  specialty: number;
  equipmentType: number[];
  consumableType: number[];
  dailyRate: number; // in copper pieces
}