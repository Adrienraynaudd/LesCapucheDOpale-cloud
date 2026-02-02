import { Adventurer } from './adventurer';
import { Status } from './status';
import { StockEquipment } from './stock-equipment';

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
    questStockEquipments: QuestStockEquipment[];
    questConsumables?: any[];
}

interface QuestStockEquipment {
    equipmentStock: StockEquipment;
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