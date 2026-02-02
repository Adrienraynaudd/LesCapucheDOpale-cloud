import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateQuestDto } from '../dto/create-quest.dto';
import { UpdateQuestDto } from '../dto/update-quest.dto';
import { FindQuestsQueryDto } from '../dto/find-quests-query.dto';

@Injectable()
export class QuestsService {
  constructor(private prisma: PrismaService) {}

  // Status IDs
  private readonly STATUS_ID_WAITING = 1;
  private readonly STATUS_ID_VALIDATED = 2;
  private readonly STATUS_ID_FAILED = 3;
  private readonly STATUS_ID_STARTED = 4;
  private readonly STATUS_ID_ABANDONED = 5;
  private readonly STATUS_ID_REFUSED = 6;
  private readonly STATUS_ID_SUCCEEDED = 7;

  // Equipment Status IDs
  private readonly EQUIPMENT_STATUS_ID_AVAILABLE = 1;
  private readonly EQUIPMENT_STATUS_ID_BORROWED = 2;
  private readonly EQUIPMENT_STATUS_ID_BROKEN = 3;

  // Helper to check if error is a Prisma P2025 error (works with both real and mock errors)
  private isPrismaNotFoundError(e: unknown): boolean {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2025'
    ) {
      return true;
    }
    // Also check for mock errors used in tests
    const err = e as { code?: string; name?: string };
    return (
      err?.code === 'P2025' && err?.name === 'PrismaClientKnownRequestError'
    );
  }

  private async isStarted(questId: number): Promise<boolean> {
    const q = await this.prisma.quest.findUnique({
      where: { id: questId },
      select: { statusId: true },
    });
    if (!q) throw new NotFoundException('Quest not found');
    return q.statusId === this.STATUS_ID_STARTED;
  }

  async findAll(options: FindQuestsQueryDto = {}) {
    const {
      rewardMin,
      rewardMax,
      statusId,
      finalDateBefore,
      finalDateAfter,
      userId,
      avgXpMin,
      avgXpMax,
      sortBy,
      order,
    } = options;

    const where: Prisma.QuestWhereInput = {
      ...(rewardMin != null || rewardMax != null
        ? {
            reward: {
              ...(rewardMin != null ? { gte: rewardMin } : {}),
              ...(rewardMax != null ? { lte: rewardMax } : {}),
            },
          }
        : {}),
      ...(typeof statusId === 'number' ? { statusId } : {}),
      ...(finalDateBefore || finalDateAfter
        ? {
            finalDate: {
              ...(finalDateAfter ? { gte: new Date(finalDateAfter) } : {}),
              ...(finalDateBefore ? { lte: new Date(finalDateBefore) } : {}),
            },
          }
        : {}),
      ...(typeof userId === 'number' ? { UserId: userId } : {}),
    };

    let orderBy: Prisma.QuestOrderByWithRelationInput | undefined;
    if (sortBy === 'reward') {
      orderBy = { reward: order ?? 'desc' };
    } else if (sortBy === 'finalDate') {
      orderBy = { finalDate: order ?? 'asc' };
    } else {
      orderBy = { id: 'desc' };
    }

    const quests = await this.prisma.quest.findMany({
      where,
      include: {
        status: true,
        adventurers: true,
        questStockEquipments: true,
        user: true,
      },
      orderBy,
    });

    if (avgXpMin == null && avgXpMax == null && sortBy !== 'avgExperience') {
      return quests;
    }

    let result = quests.map((quest) => {
      const adventurers = quest.adventurers ?? [];
      const avgExperience =
        adventurers.length > 0
          ? adventurers.reduce((sum, a) => sum + (a.experience ?? 0), 0) /
            adventurers.length
          : 0;
      return { ...quest, avgExperience };
    });

    // Filter by avgXpMin / avgXpMax
    if (avgXpMin != null) {
      result = result.filter((q) => q.avgExperience >= avgXpMin);
    }
    if (avgXpMax != null) {
      result = result.filter((q) => q.avgExperience <= avgXpMax);
    }

    // Sort by avgExperience if requested
    if (sortBy === 'avgExperience') {
      result.sort((a, b) =>
        order === 'asc'
          ? a.avgExperience - b.avgExperience
          : b.avgExperience - a.avgExperience,
      );
    }

    return result;
  }

  async findOne(id: number) {
    const quest = await this.prisma.quest.findUnique({
      where: { id },
      include: {
        status: true,
        adventurers: {
          include: {
            speciality: true,
            equipmentTypes: true,
            consumableTypes: true,
          },
        },
        questStockEquipments: {
          include: {
            equipmentStock: {
              include: {
                equipment: {
                  include: {
                    equipmentType: true,
                  },
                },
              },
            },
          },
        },
        questConsumables: {
          include: {
            consumable: { include: { consumableType: true } },
          },
        },
        user: true,
      },
    });
    if (!quest) throw new NotFoundException('Quest not found');
    return quest;
  }

  async updateStatus(questId: number, opts: { statusId: number }) {
    const { statusId } = opts || {};
    if (!statusId) {
      throw new BadRequestException('Provide statusId');
    }

    const targetStatusId = statusId;

    try {
      const quest = await this.prisma.quest.update({
        where: { id: questId },
        data: { status: { connect: { id: targetStatusId } } },
        include: {
          status: true,
          adventurers: true,
          questStockEquipments: true,
          user: true,
        },
      });

      return quest;
    } catch (e) {
      if (this.isPrismaNotFoundError(e)) {
        throw new NotFoundException('Quest not found');
      }
      throw e;
    }
  }

  async create(userId: number, dto: CreateQuestDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const status = await this.prisma.status.findUnique({
      where: { id: this.STATUS_ID_WAITING },
    });
    if (!status) {
      throw new NotFoundException(
        `Status with id ${this.STATUS_ID_WAITING} not found`,
      );
    }

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
        statusId: this.STATUS_ID_WAITING,
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
    const isStarted = await this.isStarted(id);

    if (isStarted && (dto.adventurerIds || dto.equipmentStockIds)) {
      throw new BadRequestException(
        'Quest is started: cannot change adventurers or equipment selections',
      );
    }

    const pendingStatusId = isStarted ? undefined : this.STATUS_ID_WAITING;

    if (dto.adventurerIds?.length) {
      await this.findAdventurersExist(dto.adventurerIds);
      await this.checkAdventurersAvailability(dto.adventurerIds);
    }

    if (dto.equipmentStockIds?.length) {
      await this.findEquipmentStocksExist(dto.equipmentStockIds);
    }

    const data: Prisma.QuestUpdateInput = {
      ...(pendingStatusId && { status: { connect: { id: pendingStatusId } } }),
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
      if (this.isPrismaNotFoundError(e)) {
        throw new NotFoundException('Quest not found');
      }
      throw e;
    }
  }

  private async findEquipmentStocksExist(ids: number[]) {
    if (!ids?.length) return;
    const found = await this.prisma.equipmentStock.findMany({
      where: { id: { in: ids } },
      select: { id: true, durability: true },
    });
    const missing = ids.filter((x) => !found.some((f) => f.id === x));
    if (missing.length)
      throw new NotFoundException(
        `EquipmentStock id(s) not found: ${missing.join(', ')}`,
      );
  }

  private async checkEquipmentStocksDurability(ids: number[]) {
    if (!ids?.length) return;
    const stocks = await this.prisma.equipmentStock.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        durability: true,
        equipment: { select: { name: true } },
      },
    });
    const broken = stocks.filter((s) => s.durability <= 0);
    if (broken.length) {
      const names = broken
        .map((s) => `${s.equipment.name} (id: ${s.id})`)
        .join(', ');
      throw new BadRequestException(
        `Les équipements suivants sont cassés (durabilité <= 0): ${names}`,
      );
    }
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

  private async checkAdventurersAvailability(ids: number[]) {
    if (!ids?.length) return;

    const onActiveQuest = await this.prisma.adventurer.findMany({
      where: {
        id: { in: ids },
        quests: {
          some: {
            statusId: this.STATUS_ID_STARTED,
          },
        },
      },
      select: {
        id: true,
        name: true,
        quests: {
          where: { statusId: this.STATUS_ID_STARTED },
          select: { id: true, name: true },
        },
      },
    });

    if (onActiveQuest.length) {
      const names = onActiveQuest
        .map(
          (a) =>
            `${a.name} (en mission sur: ${a.quests.map((q) => q.name).join(', ')})`,
        )
        .join(', ');
      throw new BadRequestException(
        `Les aventuriers suivants sont en mission: ${names}`,
      );
    }

    const now = new Date();

    const inRest = await this.prisma.adventurerRest.findMany({
      where: {
        adventurerId: { in: ids },
        startDate: { lte: now },
        endDate: { gt: now },
      },
      include: { adventurer: { select: { id: true, name: true } } },
    });

    if (inRest.length) {
      const names = inRest
        .map(
          (r) =>
            `${r.adventurer.name} (en repos jusqu'au ${r.endDate.toLocaleDateString('fr-FR')})`,
        )
        .join(', ');
      throw new BadRequestException(
        `Les aventuriers suivants sont en repos: ${names}`,
      );
    }
  }

  async attachAdventurers(questId: number, adventurerIds: number[]) {
    await this.findAdventurersExist(adventurerIds);
    await this.checkAdventurersAvailability(adventurerIds);
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
      if (this.isPrismaNotFoundError(e)) {
        throw new NotFoundException('Quest not found');
      }
      throw e;
    }
  }

  async detachAdventurers(questId: number, adventurerIds: number[]) {
    if (await this.isStarted(questId)) {
      throw new BadRequestException(
        'Quest is started: cannot detach adventurers',
      );
    }
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
    if (await this.isStarted(questId)) {
      throw new BadRequestException(
        'Quest is started: cannot change adventurers',
      );
    }
    await this.findAdventurersExist(adventurerIds);
    await this.checkAdventurersAvailability(adventurerIds);
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
    await this.checkEquipmentStocksDurability(equipmentStockIds);
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
    if (await this.isStarted(questId)) {
      throw new BadRequestException(
        'Quest is started: cannot detach equipment',
      );
    }
    await this.findEquipmentStocksExist(equipmentStockIds);
    await this.prisma.questStockEquipment.deleteMany({
      where: { questId, equipmentStockId: { in: equipmentStockIds } },
    });
    return this.findOne(questId);
  }

  async setEquipmentStocks(questId: number, equipmentStockIds: number[]) {
    if (await this.isStarted(questId)) {
      throw new BadRequestException(
        'Quest is started: cannot change equipment',
      );
    }
    await this.findEquipmentStocksExist(equipmentStockIds);
    await this.checkEquipmentStocksDurability(equipmentStockIds);
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

  async validateQuest(questId: number, xp: number) {
    try {
      return await this.prisma.quest.update({
        where: { id: questId },
        data: {
          status: { connect: { id: this.STATUS_ID_VALIDATED } },
          recommendedXP: xp,
        },
        include: {
          status: true,
          adventurers: true,
          questStockEquipments: true,
          user: true,
        },
      });
    } catch (e) {
      if (this.isPrismaNotFoundError(e)) {
        throw new NotFoundException('Quest not found');
      }
      throw e;
    }
  }

  async invalidateQuest(questId: number) {
    if (await this.isStarted(questId)) {
      throw new BadRequestException('Quest is started: cannot invalidate');
    }

    await this.prisma.$transaction([
      this.prisma.quest.update({
        where: { id: questId },
        data: {
          status: { connect: { id: this.STATUS_ID_WAITING } },
          recommendedXP: 0,
          adventurers: { set: [] },
        },
      }),
      this.prisma.questStockEquipment.deleteMany({ where: { questId } }),
    ]);

    return this.findOne(questId);
  }

  async startQuest(questId: number) {
    const quest = await this.prisma.quest.findUnique({
      where: { id: questId },
      select: {
        statusId: true,
        estimatedDuration: true,
        reward: true,
        adventurers: { select: { id: true } },
        questStockEquipments: { select: { equipmentStockId: true } },
      },
    });
    if (!quest) throw new NotFoundException('Quest not found');

    if (quest.statusId !== this.STATUS_ID_VALIDATED) {
      throw new BadRequestException(
        'Quest must be validated before it can be started',
      );
    }

    const adventurerIds = quest.adventurers.map((a) => a.id);
    await this.checkAdventurersAvailability(adventurerIds);

    // Calculer la date de fin d'indisponibilité (date actuelle + durée estimée en jours)
    const availableUntil = new Date();
    availableUntil.setDate(availableUntil.getDate() + quest.estimatedDuration);

    const equipmentStockIds = quest.questStockEquipments.map(
      (qse) => qse.equipmentStockId,
    );

    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      // Créer des entrées de type 'mission' dans adventurer_rest pour les aventuriers
      if (adventurerIds.length) {
        const questData = await tx.quest.findUnique({
          where: { id: questId },
          select: { name: true },
        });

        await Promise.all(
          adventurerIds.map((adventurerId) =>
            tx.adventurerRest.create({
              data: {
                adventurerId,
                questId,
                startDate: now,
                endDate: availableUntil,
                type: 'mission',
                reason: `En mission: ${questData?.name || 'Quête #' + questId}`,
              },
            }),
          ),
        );
      }

      // Mettre à jour le statut des équipements en "BORROWED"
      if (equipmentStockIds.length) {
        await tx.equipmentStock.updateMany({
          where: { id: { in: equipmentStockIds } },
          data: { statusId: this.EQUIPMENT_STATUS_ID_BORROWED },
        });
      }

      // Enregistrer une transaction de 20% de la récompense au démarrage
      const advancePayment = quest.reward * 0.2;
      const lastTransaction = await tx.transaction.findFirst({
        orderBy: { id: 'desc' },
        select: { total: true },
      });
      const previousTotal = lastTransaction?.total ?? 0;

      await tx.transaction.create({
        data: {
          amount: advancePayment,
          description: `Avance 20% quête #${questId}`,
          date: now,
          total: previousTotal + advancePayment,
        },
      });

      // Mettre à jour la quête avec le statut "started" et la date de début
      await tx.quest.update({
        where: { id: questId },
        data: {
          status: { connect: { id: this.STATUS_ID_STARTED } },
          startDate: now,
        },
      });
    });

    return this.prisma.quest.findUnique({
      where: { id: questId },
      include: {
        status: true,
        adventurers: true,
        questStockEquipments: {
          include: { equipmentStock: true },
        },
        user: true,
      },
    });
  }

  async refuseQuest(questId: number) {
    const quest = await this.prisma.quest.findUnique({
      where: { id: questId },
      select: { statusId: true },
    });
    if (!quest) throw new NotFoundException('Quest not found');

    if (
      quest.statusId === this.STATUS_ID_VALIDATED ||
      quest.statusId === this.STATUS_ID_STARTED
    ) {
      throw new BadRequestException(
        'Quest cannot be refused when accepted or started',
      );
    }

    return await this.prisma.quest.update({
      where: { id: questId },
      data: { status: { connect: { id: this.STATUS_ID_REFUSED } } },
      include: {
        status: true,
        adventurers: true,
        questStockEquipments: true,
        user: true,
      },
    });
  }

  async abandonQuest(questId: number) {
    const quest = await this.prisma.quest.findUnique({
      where: { id: questId },
      select: { statusId: true },
    });
    if (!quest) throw new NotFoundException('Quest not found');

    if (
      quest.statusId === this.STATUS_ID_VALIDATED ||
      quest.statusId === this.STATUS_ID_STARTED
    ) {
      throw new BadRequestException(
        'Quest cannot be abandoned when accepted or started',
      );
    }

    return this.prisma.quest.update({
      where: { id: questId },
      data: { status: { connect: { id: this.STATUS_ID_ABANDONED } } },
      include: {
        status: true,
        adventurers: true,
        questStockEquipments: true,
        user: true,
      },
    });
  }

  private calculateRestDuration(
    recommendedXP: number,
    adventurerXP: number,
    questDuration: number,
  ): number {
    if (adventurerXP <= 0) {
      return questDuration;
    }
    const restDays = 0.5 * (recommendedXP / adventurerXP) * questDuration;
    return Math.ceil(restDays); // Arrondi au jour supérieur
  }

  async finishQuest(questId: number, isSuccess: boolean) {
    const quest = await this.prisma.quest.findUnique({
      where: { id: questId },
      select: {
        name: true,
        statusId: true,
        startDate: true,
        estimatedDuration: true,
        recommendedXP: true,
        reward: true,
        adventurers: {
          select: { id: true, experience: true, dailyRate: true },
        },
        questStockEquipments: {
          select: {
            equipmentStockId: true,
            equipmentStock: {
              select: { id: true, durability: true },
            },
          },
        },
      },
    });
    if (!quest) throw new NotFoundException('Quest not found');

    if (quest.statusId !== this.STATUS_ID_STARTED) {
      throw new BadRequestException(
        'Quest must be started before it can be finished',
      );
    }

    if (!quest.startDate) {
      throw new BadRequestException('Quest has no start date recorded');
    }

    // Calculer la durée en jours (date actuelle - startDate)
    const now = new Date();
    const startDate = new Date(quest.startDate);
    const diffTime = now.getTime() - startDate.getTime();
    const duration = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24))); // Au moins 1 jour

    let totalSalaryCost = 0;

    // Calculer le coût des salaires
    for (const adventurer of quest.adventurers) {
      totalSalaryCost += adventurer.dailyRate * duration;
    }

    await this.prisma.$transaction(async (tx) => {
      // Supprimer les entrées "mission" des aventuriers pour cette quête
      await tx.adventurerRest.deleteMany({
        where: {
          questId,
          type: 'mission',
        },
      });

      if (isSuccess) {
        for (const adventurer of quest.adventurers) {
          await tx.adventurer.update({
            where: { id: adventurer.id },
            data: {
              experience: adventurer.experience + quest.recommendedXP,
            },
          });
        }
      }

      for (const qse of quest.questStockEquipments) {
        const stock = qse.equipmentStock;
        // Réduire la durabilité de 1 par jour de quête
        const newDurability = Math.max(0, stock.durability - duration);
        const newStatusId =
          newDurability <= 0
            ? this.EQUIPMENT_STATUS_ID_BROKEN
            : this.EQUIPMENT_STATUS_ID_AVAILABLE;

        await tx.equipmentStock.update({
          where: { id: stock.id },
          data: {
            durability: newDurability,
            statusId: newStatusId,
          },
        });
      }

      for (const adventurer of quest.adventurers) {
        const currentXP = isSuccess
          ? adventurer.experience + quest.recommendedXP
          : adventurer.experience;

        const restDays = this.calculateRestDuration(
          quest.recommendedXP,
          currentXP,
          duration,
        );
        const restEndDate = new Date(now);
        restEndDate.setDate(restEndDate.getDate() + restDays);

        await tx.adventurerRest.create({
          data: {
            adventurerId: adventurer.id,
            questId,
            startDate: now,
            endDate: restEndDate,
            type: 'mission_rest',
            reason: `Repos post-mission: ${quest.name}`,
          },
        });
      }

      // Enregistrer les transactions financières
      const lastTransaction = await tx.transaction.findFirst({
        orderBy: { id: 'desc' },
        select: { total: true },
      });
      let previousTotal = lastTransaction?.total ?? 0;

      // Enregistrer le salaire
      if (totalSalaryCost > 0) {
        const salaryCost = isSuccess ? totalSalaryCost : totalSalaryCost * 0.4;
        await tx.transaction.create({
          data: {
            amount: -salaryCost,
            description: `Salaires quête #${questId} (${duration} jours, ${quest.adventurers.length} aventuriers)${isSuccess ? '' : ' - Échec: 40%'}`,
            date: now,
            total: previousTotal - salaryCost,
          },
        });
        previousTotal -= salaryCost;
      }

      // Si succès, ajouter 80% de la récompense
      if (isSuccess) {
        const finalReward = quest.reward * 0.8;
        await tx.transaction.create({
          data: {
            amount: finalReward,
            description: `Récompense finale 80% quête #${questId}`,
            date: now,
            total: previousTotal + finalReward,
          },
        });
      }

      const finalStatusId = isSuccess
        ? this.STATUS_ID_SUCCEEDED
        : this.STATUS_ID_FAILED;

      await tx.quest.update({
        where: { id: questId },
        data: { status: { connect: { id: finalStatusId } } },
      });
    });

    const updatedQuest = await this.prisma.quest.findUnique({
      where: { id: questId },
      include: {
        status: true,
        adventurers: true,
        questStockEquipments: {
          include: { equipmentStock: true },
        },
        user: true,
      },
    });

    return {
      ...updatedQuest,
      totalCost: totalSalaryCost,
    };
  }

  // ================== CONSUMABLES MANAGEMENT ==================

  private async findConsumablesExist(ids: number[]) {
    if (!ids?.length) return;
    const found = await this.prisma.consumable.findMany({
      where: { id: { in: ids } },
      select: { id: true, quantity: true },
    });
    const missing = ids.filter((x) => !found.some((f) => f.id === x));
    if (missing.length) {
      throw new NotFoundException(
        `Consumable id(s) not found: ${missing.join(', ')}`,
      );
    }
  }

  async attachConsumables(
    questId: number,
    consumables: { consumableId: number; quantity: number }[],
  ) {
    const consumableIds = consumables.map((c) => c.consumableId);
    await this.findConsumablesExist(consumableIds);

    // Récupérer les stocks disponibles
    const stocks = await this.prisma.consumable.findMany({
      where: { id: { in: consumableIds } },
      select: { id: true, quantity: true, name: true },
    });

    // Récupérer les quantités déjà assignées à cette quête
    const existing = await this.prisma.questConsumable.findMany({
      where: { questId, consumableId: { in: consumableIds } },
      select: { consumableId: true, quantity: true },
    });

    // Vérifier que les quantités sont disponibles (stock - quantité déjà assignée >= quantité demandée)
    for (const item of consumables) {
      const stock = stocks.find((s) => s.id === item.consumableId);
      const existingItem = existing.find(
        (e) => e.consumableId === item.consumableId,
      );
      const alreadyAssigned = existingItem?.quantity ?? 0;

      if (stock && stock.quantity - alreadyAssigned < item.quantity) {
        throw new BadRequestException(
          `Stock insuffisant pour ${stock.name}: ${stock.quantity - alreadyAssigned} disponible(s) (${alreadyAssigned} déjà assigné(s)), ${item.quantity} demandé(s)`,
        );
      }
    }

    // Insérer les nouveaux ou mettre à jour (ajouter la quantité)
    const toInsert = consumables.filter(
      (c) => !existing.some((e) => e.consumableId === c.consumableId),
    );
    const toUpdate = consumables.filter((c) =>
      existing.some((e) => e.consumableId === c.consumableId),
    );

    if (toInsert.length) {
      await this.prisma.questConsumable.createMany({
        data: toInsert.map((c) => ({
          questId,
          consumableId: c.consumableId,
          quantity: c.quantity,
        })),
      });
    }

    // Pour les existants, ajouter la quantité demandée à la quantité actuelle
    for (const c of toUpdate) {
      const existingItem = existing.find(
        (e) => e.consumableId === c.consumableId,
      );
      const newQuantity = (existingItem?.quantity ?? 0) + c.quantity;

      await this.prisma.questConsumable.update({
        where: {
          questId_consumableId: { questId, consumableId: c.consumableId },
        },
        data: { quantity: newQuantity },
      });
    }

    return this.findOne(questId);
  }

  async detachConsumables(
    questId: number,
    consumables: { consumableId: number; quantity: number }[],
  ) {
    if (await this.isStarted(questId)) {
      throw new BadRequestException(
        'Quest is started: cannot detach consumables',
      );
    }

    const consumableIds = consumables.map((c) => c.consumableId);
    await this.findConsumablesExist(consumableIds);

    // Récupérer les quantités actuelles dans la quête
    const existing = await this.prisma.questConsumable.findMany({
      where: { questId, consumableId: { in: consumableIds } },
      select: { consumableId: true, quantity: true },
    });

    for (const item of consumables) {
      const existingItem = existing.find(
        (e) => e.consumableId === item.consumableId,
      );

      if (!existingItem) {
        // Le consommable n'est pas dans la quête, on ignore
        continue;
      }

      const newQuantity = existingItem.quantity - item.quantity;

      if (newQuantity <= 0) {
        // Supprimer complètement le consommable de la quête
        await this.prisma.questConsumable.delete({
          where: {
            questId_consumableId: { questId, consumableId: item.consumableId },
          },
        });
      } else {
        // Mettre à jour avec la nouvelle quantité
        await this.prisma.questConsumable.update({
          where: {
            questId_consumableId: { questId, consumableId: item.consumableId },
          },
          data: { quantity: newQuantity },
        });
      }
    }

    return this.findOne(questId);
  }

  async setConsumables(
    questId: number,
    consumables: { consumableId: number; quantity: number }[],
  ) {
    if (await this.isStarted(questId)) {
      throw new BadRequestException(
        'Quest is started: cannot change consumables',
      );
    }

    const consumableIds = consumables.map((c) => c.consumableId);
    if (consumableIds.length) {
      await this.findConsumablesExist(consumableIds);

      // Vérifier les stocks
      const stocks = await this.prisma.consumable.findMany({
        where: { id: { in: consumableIds } },
        select: { id: true, quantity: true, name: true },
      });

      for (const item of consumables) {
        const stock = stocks.find((s) => s.id === item.consumableId);
        if (stock && stock.quantity < item.quantity) {
          throw new BadRequestException(
            `Stock insuffisant pour ${stock.name}: ${stock.quantity} disponible(s), ${item.quantity} demandé(s)`,
          );
        }
      }
    }

    // Supprimer tous les consommables existants et recréer
    await this.prisma.questConsumable.deleteMany({ where: { questId } });

    if (consumables.length) {
      await this.prisma.questConsumable.createMany({
        data: consumables.map((c) => ({
          questId,
          consumableId: c.consumableId,
          quantity: c.quantity,
        })),
      });
    }

    return this.findOne(questId);
  }
}
