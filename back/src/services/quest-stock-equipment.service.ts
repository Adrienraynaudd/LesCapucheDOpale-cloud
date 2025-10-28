import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestStockEquipmentDto } from '../dto/create-quest-stock-equipment.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class QuestStockEquipmentService {
  constructor(private prisma: PrismaService) {}

  async attach(dto: CreateQuestStockEquipmentDto) {
    await this.findQuest(dto.questId);
    await this.findEquipmentStock(dto.equipmentStockId);

    return this.prisma.questStockEquipment.create({
      data: {
        questId: dto.questId,
        equipmentStockId: dto.equipmentStockId,
      },
      include: { quest: true, equipmentStock: true },
    });
  }

  findAll(questId?: number) {
    return this.prisma.questStockEquipment.findMany({
      where: questId ? { questId } : undefined,
      include: { quest: true, equipmentStock: true },
    });
  }

  async delete(id: number) {
    try {
      return await this.prisma.questStockEquipment.delete({ where: { id } });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('Link not found');
      }
      throw e;
    }
  }

  private async findQuest(id: number) {
    const q = await this.prisma.quest.findUnique({ where: { id } });
    if (!q) throw new NotFoundException(`Quest ${id} not found`);
  }

  private async findEquipmentStock(id: number) {
    const es = await this.prisma.equipmentStock.findUnique({ where: { id } });
    if (!es) throw new NotFoundException(`EquipmentStock ${id} not found`);
  }
}
