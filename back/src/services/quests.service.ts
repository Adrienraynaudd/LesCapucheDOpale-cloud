import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestDto } from '../dto/create-quest.dto';
import { UpdateQuestDto } from '../dto/update-quest.dto';

@Injectable()
export class QuestsService {
  constructor(private prisma: PrismaService) {}

  private async getPendingStatusId() {
    const name = 'waiting for validation';
    const found = await this.prisma.status.findFirst({ where: { name } });
    if (found) return found.id;
    const created = await this.prisma.status.create({ data: { name } });
    return created.id;
  }

  async findAll() {
    return this.prisma.quest.findMany({
      include: {
        status: true,
        adventurers: true,
        questStockEquipments: true,
        user: true,
      },
      orderBy: { id: 'desc' },
    });
  }


  async findOne(id: number) {
    const quest = await this.prisma.quest.findUnique({
      where: { id },
      include: {
        status: true,
        adventurers: true,
        questStockEquipments: true,
        user: true,
      },
    });
    if (!quest) throw new NotFoundException('Quest not found');
    return quest;
  }

  async updateStatus(questId: number, opts: { statusId?: number; statusName?: string }) {
    const { statusId, statusName } = opts || {};
    if (!statusId && !statusName) {
      throw new BadRequestException('Provide statusId or statusName');
    }

    let targetStatusId = statusId ?? null;

    if (!targetStatusId && statusName) {
      const status = await this.prisma.status.findFirst({ where: { name: statusName } });
      if (!status) throw new NotFoundException(`Status not found: ${statusName}`);
      targetStatusId = status.id;
    }

    try {
      return await this.prisma.quest.update({
        where: { id: questId },
        data: { statusId: targetStatusId! },
        include: {
          status: true,
          adventurers: true,
          questStockEquipments: true,
          user: true,
        },
      });
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundException('Quest not found');
      throw e;
    }
  }

  async create(userId: number, dto: CreateQuestDto) {
    const pendingStatusId = await this.getPendingStatusId();

    if (dto.adventurerIds?.length) {
      const found = await this.prisma.adventurer.findMany({
        where: { id: { in: dto.adventurerIds } },
        select: { id: true },
      });
      if (found.length !== dto.adventurerIds.length) {
        const foundSet = new Set(found.map(a => a.id));
        const missing = dto.adventurerIds.filter(id => !foundSet.has(id));
        throw new NotFoundException(`Adventurer id(s) not found: ${missing.join(', ')}`);
      }
    }

    if (dto.equipmentStockIds?.length) {
      const found = await this.prisma.equipmentStock.findMany({
        where: { id: { in: dto.equipmentStockIds } },
        select: { id: true },
      });
      if (found.length !== dto.equipmentStockIds.length) {
        const foundSet = new Set(found.map(e => e.id));
        const missing = dto.equipmentStockIds.filter(id => !foundSet.has(id));
        throw new NotFoundException(`EquipmentStock id(s) not found: ${missing.join(', ')}`);
      }
    }

    return this.prisma.quest.create({
      data: {
        name: dto.name,
        description: dto.description,
        finalDate: dto.finalDate,
        reward: dto.reward,
        estimatedDuration: dto.estimatedDuration,
        recommendedXP: dto.recommendedXP,
        statusId: pendingStatusId,
        UserId: userId,
        adventurers: dto.adventurerIds?.length
          ? { connect: dto.adventurerIds.map(id => ({ id })) }
          : undefined,
        questStockEquipments: dto.equipmentStockIds?.length
          ? { create: dto.equipmentStockIds.map(equipmentStockId => ({ equipmentStockId })) }
          : undefined,
      },
      include: {
        status: true,
        adventurers: true,
        questStockEquipments: true,
        user: true,
      },
    });
  }

  async update(id: number, dto: UpdateQuestDto) {
    const pendingStatusId = await this.getPendingStatusId();

    if (Array.isArray(dto.adventurerIds) && dto.adventurerIds.length > 0) {
      const found = await this.prisma.adventurer.findMany({
        where: { id: { in: dto.adventurerIds } },
        select: { id: true },
      });
      if (found.length !== dto.adventurerIds.length) {
        const foundSet = new Set(found.map(a => a.id));
        const missing = dto.adventurerIds.filter(x => !foundSet.has(x));
        throw new NotFoundException(`Adventurer id(s) not found: ${missing.join(', ')}`);
      }
    }

    if (Array.isArray(dto.equipmentStockIds) && dto.equipmentStockIds.length > 0) {
      const found = await this.prisma.equipmentStock.findMany({
        where: { id: { in: dto.equipmentStockIds } },
        select: { id: true },
      });
      if (found.length !== dto.equipmentStockIds.length) {
        const foundSet = new Set(found.map(e => e.id));
        const missing = dto.equipmentStockIds.filter(x => !foundSet.has(x));
        throw new NotFoundException(`EquipmentStock id(s) not found: ${missing.join(', ')}`);
      }
    }

    const data: any = {
  statusId: pendingStatusId,
};

if (dto.name !== undefined) data.name = dto.name;
if (dto.description !== undefined) data.description = dto.description;
if (dto.finalDate !== undefined) data.finalDate = dto.finalDate;
if (dto.reward !== undefined) data.reward = dto.reward;
if (dto.estimatedDuration !== undefined) data.estimatedDuration = dto.estimatedDuration;
if (dto.recommendedXP !== undefined) data.recommendedXP = dto.recommendedXP;

if (Array.isArray(dto.adventurerIds)) {
  data.adventurers = {
    set: dto.adventurerIds.map(id => ({ id })),
  };
}

if (Array.isArray(dto.equipmentStockIds)) {
  data.questStockEquipments = {
    set: dto.equipmentStockIds.map(id => ({ id })),
  };
}


    try {
      return await this.prisma.quest.update({
        where: { id },
        data,
        include: {
          status: true,
          adventurers: true,
          questStockEquipments: true,
          user: true,
        },
      });
    } catch (e: any) {
      if (e.code === 'P2025') {
        throw new NotFoundException('Quest not found');
      }
      throw e;
    }
  }

  // Helpers
  private async findEquipmentStocksExist(ids: number[]) {
    if (!ids?.length) return;
    const found = await this.prisma.equipmentStock.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
    if (found.length !== ids.length) {
      const set = new Set(found.map(f => f.id));
      const missing = ids.filter(x => !set.has(x));
      throw new NotFoundException(`EquipmentStock id(s) not found: ${missing.join(', ')}`);
    }
  }

  private async findAdventurersExist(ids: number[]) {
    if (!ids?.length) return;
    const found = await this.prisma.adventurer.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
    if (found.length !== ids.length) {
      const set = new Set(found.map(f => f.id));
      const missing = ids.filter(x => !set.has(x));
      throw new NotFoundException(`Adventurer id(s) not found: ${missing.join(', ')}`);
    }
  }

  // Adventurers attach/detach/set (many-to-many implicite)
  async attachAdventurers(questId: number, adventurerIds: number[]) {
    await this.findAdventurersExist(adventurerIds);
    try {
      return await this.prisma.quest.update({
        where: { id: questId },
        data: { adventurers: { connect: adventurerIds.map(id => ({ id })) } },
        include: { status: true, adventurers: true, questStockEquipments: true, user: true },
      });
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundException('Quest not found');
      throw e;
    }
  }

  async detachAdventurers(questId: number, adventurerIds: number[]) {
    await this.findAdventurersExist(adventurerIds);
    try {
      return await this.prisma.quest.update({
        where: { id: questId },
        data: { adventurers: { disconnect: adventurerIds.map(id => ({ id })) } },
        include: { status: true, adventurers: true, questStockEquipments: true, user: true },
      });
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundException('Quest not found');
      throw e;
    }
  }

  async setAdventurers(questId: number, adventurerIds: number[]) {
    await this.findAdventurersExist(adventurerIds);
    try {
      return await this.prisma.quest.update({
        where: { id: questId },
        data: { adventurers: { set: adventurerIds.map(id => ({ id })) } },
        include: { status: true, adventurers: true, questStockEquipments: true, user: true },
      });
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundException('Quest not found');
      throw e;
    }
  }

  async attachEquipmentStocks(questId: number, equipmentStockIds: number[]) {
    await this.findEquipmentStocksExist(equipmentStockIds);
    const existing = await this.prisma.questStockEquipment.findMany({
      where: { questId, equipmentStockId: { in: equipmentStockIds } },
      select: { equipmentStockId: true },
    });
    const existingSet = new Set(existing.map(e => e.equipmentStockId));
    const toInsert = equipmentStockIds.filter(id => !existingSet.has(id));

    if (toInsert.length) {
      await this.prisma.questStockEquipment.createMany({
        data: toInsert.map(equipmentStockId => ({ questId, equipmentStockId })),
      });
    }
    return this.findOne(questId);
  }
  async detachEquipmentStocks(questId: number, equipmentStockIds: number[]) {
    await this.findEquipmentStocksExist(equipmentStockIds);
    await this.prisma.questStockEquipment.deleteMany({
      where: { questId, equipmentStockId: { in: equipmentStockIds } },
    });
    return this.findOne(questId);
  }
  async setEquipmentStocks(questId: number, equipmentStockIds: number[]) {
    await this.findEquipmentStocksExist(equipmentStockIds);
    await this.prisma.$transaction([
      this.prisma.questStockEquipment.deleteMany({ where: { questId } }),
      equipmentStockIds.length
        ? this.prisma.questStockEquipment.createMany({
            data: equipmentStockIds.map(equipmentStockId => ({ questId, equipmentStockId })),
          })
        : Promise.resolve(),
    ] as any);
    return this.findOne(questId);
  }

}