import { Adventurer } from './adventurer';

export type RestType = 'rest' | 'unavailable' | 'mission_rest';

export interface AdventurerRest {
  id: number;
  adventurerId: number;
  adventurer?: Adventurer;
  startDate: string;
  endDate: string;
  reason: string;
  type: RestType;
}

export interface CreateAdventurerRestData {
  adventurerId: number;
  startDate: string;
  endDate: string;
  reason: string;
  type: RestType;
}

export interface ScheduleEvent {
  id: number;
  startDate: string;
  endDate: string;
  type: 'mission' | 'rest' | 'unavailable' | 'mission_rest';
  reason: string;
  questId?: number;
  questName?: string;
}

export interface AdventurerAvailability {
  adventurerId: number;
  adventurerName: string;
  isAvailable: boolean;
  events: ScheduleEvent[];
}

export type DayStatusType = 'available' | 'mission' | 'rest' | 'unavailable' | 'mission_rest';

export interface DayStatus {
  date: string;
  status: DayStatusType;
  events: ScheduleEvent[];
}
