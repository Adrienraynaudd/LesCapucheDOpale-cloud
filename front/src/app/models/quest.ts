import { Adventurer } from './adventurer';
import { Status } from './status';

export interface Quest {
    id: number;
    name: string;
    description: string;
    finalDate: string;
    reward: number;
    statusId: number;
    estimatedDuration: number;
    recommendedXP: number;
    UserId: number;
    status: Status;
    adventurers: Adventurer[];
}

export interface QuestForm {
    name: string;
    description: string;
    finalDate: string;
    estimatedDuration: number;
    reward: number;
    recommendedXP?: number;
    statusId?: number;
}