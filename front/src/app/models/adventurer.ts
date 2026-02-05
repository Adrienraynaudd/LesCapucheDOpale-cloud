import { ConsumableType, EquipmentType, Speciality } from "./models";

export interface Adventurer {
  id: number;
  name: string;
  imageUrl?: string;
  speciality: Speciality;
  specialityId: number;
  equipmentTypes: EquipmentType[];
  equipmentTypeIds: number[];
  consumableTypes: ConsumableType[];
  consumableTypeIds: number[];
  dailyRate: number; // in copper pieces
  experience: number;
}

export interface AdventurerFormData {
  name: string;
  imageUrl?: string;
  specialityId: number;
  equipmentTypeIds: number[];
  consumableTypeIds: number[];
  dailyRate: number; // in copper pieces
}