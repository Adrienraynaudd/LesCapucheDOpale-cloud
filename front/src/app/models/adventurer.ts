import { ConsumableType, EquipmentType, Speciality } from "./models";

export interface Adventurer {
  id: number;
  name: string;
  speciality: Speciality;
  equipmentType: EquipmentType[];
  consumableType: ConsumableType[];
  dailyRate: number; // in copper pieces
  experience: number;
}

export interface AdventurerFormData {
  name: string;
  speciality: number;
  equipmentType: number[];
  consumableType: number[];
  dailyRate: number; // in copper pieces
}