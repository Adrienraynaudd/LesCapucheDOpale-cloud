import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateQuestDto } from '../dto/create-quest.dto';
import { UpdateQuestDto } from '../dto/update-quest.dto';

@Injectable()
export class QuestsService {
  constructor(private prisma: PrismaService) {}

  private async getPendingStatusId(): Promise<number> {
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

  async updateStatus(
    questId: number,
    opts: { statusId?: number; statusName?: string },
  ) {
    const { statusId, statusName } = opts || {};
    if (!statusId && !statusName) {
      throw new BadRequestException('Provide statusId or statusName');
    }

    let targetStatusId = statusId ?? null;

    if (!targetStatusId && statusName) {
      const status = await this.prisma.status.findFirst({
        where: { name: statusName },
      });
      if (!status)
        throw new NotFoundException(`Status not found: ${statusName}`);
      targetStatusId = status.id;
    }

    try {
      return await this.prisma.quest.update({
        where: { id: questId },
        data: { status: { connect: { id: targetStatusId! } } },
        include: {
          status: true,
          adventurers: true,
          questStockEquipments: true,
          user: true,
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('Quest not found');
      }
      throw e;
    }
  }

  async create(userId: number, dto: CreateQuestDto) {
    const pendingStatusId = await this.getPendingStatusId();

    if (dto.adventurerIds?.length) {
      await this.findAdventurersExist(dto.adventurerIds);
    }

    if (dto.equipmentStockIds?.length) {
      await this.findEquipmentStocksExist(dto.equipmentStockIds);
    }

    return this.prisma.quest.create({
      data: {
        name: dto.name,
        description: dto.description,
        finalDate: dto.finalDate,
        reward: dto.reward,
        estimatedDuration: dto.estimatedDuration,
        recommendedXP: 0,
        statusId: pendingStatusId,
        UserId: userId,
        adventurers: dto.adventurerIds?.length
          ? { connect: dto.adventurerIds.map((id) => ({ id })) }
          : undefined,
        questStockEquipments: dto.equipmentStockIds?.length
          ? {
              create: dto.equipmentStockIds.map((equipmentStockId) => ({
                equipmentStockId,
              })),
            }
          : undefined,
      },
      include: {
        adventurers: true,
        questStockEquipments: true,
        user: true,
      },
    });
  }

  async update(id: number, dto: UpdateQuestDto) {
    const pendingStatusId = await this.getPendingStatusId();

    if (dto.adventurerIds?.length) {
      await this.findAdventurersExist(dto.adventurerIds);
    }

    if (dto.equipmentStockIds?.length) {
      await this.findEquipmentStocksExist(dto.equipmentStockIds);
    }

    const data: Prisma.QuestUpdateInput = {
      status: { connect: { id: pendingStatusId } },
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.finalDate !== undefined && { finalDate: dto.finalDate }),
      ...(dto.reward !== undefined && { reward: dto.reward }),
      ...(dto.estimatedDuration !== undefined && {
        estimatedDuration: dto.estimatedDuration,
      }),
      ...(dto.adventurerIds && {
        adventurers: { set: dto.adventurerIds.map((id) => ({ id })) },
      }),
      ...(dto.equipmentStockIds && {
        questStockEquipments: {
          set: dto.equipmentStockIds.map((id) => ({ id })),
        },
      }),
    };

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
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('Quest not found');
      }
      throw e;
    }
  }

  private async findEquipmentStocksExist(ids: number[]) {
    if (!ids?.length) return;
    const found = await this.prisma.equipmentStock.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
    const missing = ids.filter((x) => !found.some((f) => f.id === x));
    if (missing.length)
      throw new NotFoundException(
        `EquipmentStock id(s) not found: ${missing.join(', ')}`,
      );
  }

  private async findAdventurersExist(ids: number[]) {
    if (!ids?.length) return;
    const found = await this.prisma.adventurer.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
    const missing = ids.filter((x) => !found.some((f) => f.id === x));
    if (missing.length)
      throw new NotFoundException(
        `Adventurer id(s) not found: ${missing.join(', ')}`,
      );
  }

  async attachAdventurers(questId: number, adventurerIds: number[]) {
    await this.findAdventurersExist(adventurerIds);
    try {
      return await this.prisma.quest.update({
        where: { id: questId },
        data: { adventurers: { connect: adventurerIds.map((id) => ({ id })) } },
        include: {
          status: true,
          adventurers: true,
          questStockEquipments: true,
          user: true,
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('Quest not found');
      }
      throw e;
    }
  }

  async detachAdventurers(questId: number, adventurerIds: number[]) {
    await this.findAdventurersExist(adventurerIds);
    return this.prisma.quest.update({
      where: { id: questId },
      data: {
        adventurers: { disconnect: adventurerIds.map((id) => ({ id })) },
      },
      include: {
        status: true,
        adventurers: true,
        questStockEquipments: true,
        user: true,
      },
    });
  }

  async setAdventurers(questId: number, adventurerIds: number[]) {
    await this.findAdventurersExist(adventurerIds);
    return this.prisma.quest.update({
      where: { id: questId },
      data: { adventurers: { set: adventurerIds.map((id) => ({ id })) } },
      include: {
        status: true,
        adventurers: true,
        questStockEquipments: true,
        user: true,
      },
    });
  }

  async attachEquipmentStocks(questId: number, equipmentStockIds: number[]) {
    await this.findEquipmentStocksExist(equipmentStockIds);
    const existing = await this.prisma.questStockEquipment.findMany({
      where: { questId, equipmentStockId: { in: equipmentStockIds } },
      select: { equipmentStockId: true },
    });
    const toInsert = equipmentStockIds.filter(
      (id) => !existing.some((e) => e.equipmentStockId === id),
    );
    if (toInsert.length) {
      await this.prisma.questStockEquipment.createMany({
        data: toInsert.map((equipmentStockId) => ({
          questId,
          equipmentStockId,
        })),
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
    const deletePromise = this.prisma.questStockEquipment.deleteMany({
      where: { questId },
    });
    const tx = equipmentStockIds.length
      ? [
          deletePromise,
          this.prisma.questStockEquipment.createMany({
            data: equipmentStockIds.map((equipmentStockId) => ({
              questId,
              equipmentStockId,
            })),
          }),
        ]
      : [deletePromise];
    await this.prisma.$transaction(tx);
    return this.findOne(questId);
  }
}
