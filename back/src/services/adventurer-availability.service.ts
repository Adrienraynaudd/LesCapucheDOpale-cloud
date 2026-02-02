import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdventurerRestDto } from '../dto/create-adventurer-rest.dto';
import { UpdateAdventurerRestDto } from '../dto/update-adventurer-rest.dto';

export interface ScheduleEvent {
  id: number;
  startDate: Date;
  endDate: Date;
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

export interface DayStatus {
  date: string;
  status: 'available' | 'mission' | 'rest' | 'unavailable' | 'mission_rest';
  events: ScheduleEvent[];
}

@Injectable()
export class AdventurerAvailabilityService {
  constructor(private prisma: PrismaService) {}

  private readonly STATUS_ID_STARTED = 4;
  private readonly STATUS_ID_VALIDATED = 2;

  /**
   * Check if an adventurer is available for a given period
   */
  async checkAvailability(
    adventurerId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<AdventurerAvailability> {
    const adventurer = await this.prisma.adventurer.findUnique({
      where: { id: adventurerId },
      include: {
        rests: true,
      },
    });

    if (!adventurer) {
      throw new NotFoundException('Adventurer not found');
    }

    const events: ScheduleEvent[] = [];
    let isAvailable = true;

    for (const rest of adventurer.rests) {
      if (
        this.periodsOverlap(startDate, endDate, rest.startDate, rest.endDate)
      ) {
        isAvailable = false;
        events.push({
          id: rest.id,
          startDate: rest.startDate,
          endDate: rest.endDate,
          type: rest.type as
            | 'mission'
            | 'rest'
            | 'unavailable'
            | 'mission_rest',
          reason: rest.reason,
          questId: rest.questId ?? undefined,
        });
      }
    }

    return {
      adventurerId,
      adventurerName: adventurer.name,
      isAvailable,
      events,
    };
  }

  /**
   * Get the schedule of an adventurer for a given period
   */
  async getSchedule(
    adventurerId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<DayStatus[]> {
    const availability = await this.checkAvailability(
      adventurerId,
      startDate,
      endDate,
    );
    const dayStatuses: DayStatus[] = [];

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      // Normaliser les dates pour comparer uniquement les jours (sans les heures)
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const dayEvents = availability.events.filter((event) => {
        const eventStart = new Date(event.startDate);
        eventStart.setHours(0, 0, 0, 0);
        const eventEnd = new Date(event.endDate);
        eventEnd.setHours(23, 59, 59, 999);
        return this.periodsOverlap(dayStart, dayEnd, eventStart, eventEnd);
      });

      let status: DayStatus['status'] = 'available';
      if (dayEvents.length > 0) {
        if (dayEvents.some((e) => e.type === 'mission')) {
          status = 'mission';
        } else if (dayEvents.some((e) => e.type === 'mission_rest')) {
          status = 'mission_rest';
        } else if (dayEvents.some((e) => e.type === 'unavailable')) {
          status = 'unavailable';
        } else {
          status = 'rest';
        }
      }

      dayStatuses.push({
        date: this.formatDateLocal(currentDate),
        status,
        events: dayEvents,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dayStatuses;
  }

  private formatDateLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  }

  async findAllRests(adventurerId: number) {
    const adventurer = await this.prisma.adventurer.findUnique({
      where: { id: adventurerId },
    });

    if (!adventurer) {
      throw new NotFoundException('Adventurer not found');
    }

    return this.prisma.adventurerRest.findMany({
      where: { adventurerId },
      orderBy: { startDate: 'asc' },
      include: { adventurer: true },
    });
  }

  async createRest(dto: CreateAdventurerRestDto) {
    const adventurer = await this.prisma.adventurer.findUnique({
      where: { id: dto.adventurerId },
    });

    if (!adventurer) {
      throw new NotFoundException('Adventurer not found');
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    const overlapping = await this.prisma.adventurerRest.findFirst({
      where: {
        adventurerId: dto.adventurerId,
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
    });

    if (overlapping) {
      throw new BadRequestException(
        'Rest period overlaps with an existing rest period',
      );
    }

    return this.prisma.adventurerRest.create({
      data: {
        adventurerId: dto.adventurerId,
        startDate,
        endDate,
        reason: dto.reason,
        type: dto.type,
      },
      include: { adventurer: true },
    });
  }

  async updateRest(id: number, dto: UpdateAdventurerRestDto) {
    const rest = await this.prisma.adventurerRest.findUnique({
      where: { id },
    });

    if (!rest) {
      throw new NotFoundException('Rest period not found');
    }

    const startDate = dto.startDate ? new Date(dto.startDate) : rest.startDate;
    const endDate = dto.endDate ? new Date(dto.endDate) : rest.endDate;

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    const overlapping = await this.prisma.adventurerRest.findFirst({
      where: {
        adventurerId: rest.adventurerId,
        id: { not: id },
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
    });

    if (overlapping) {
      throw new BadRequestException(
        'Rest period overlaps with an existing rest period',
      );
    }

    return this.prisma.adventurerRest.update({
      where: { id },
      data: {
        startDate,
        endDate,
        reason: dto.reason ?? rest.reason,
        type: dto.type ?? rest.type,
      },
      include: { adventurer: true },
    });
  }

  async deleteRest(id: number) {
    const rest = await this.prisma.adventurerRest.findUnique({
      where: { id },
    });

    if (!rest) {
      throw new NotFoundException('Rest period not found');
    }

    return this.prisma.adventurerRest.delete({
      where: { id },
    });
  }

  async findAvailableAdventurers(startDate: Date, endDate: Date) {
    const adventurers = await this.prisma.adventurer.findMany({
      include: {
        speciality: true,
        quests: {
          where: {
            statusId: {
              in: [this.STATUS_ID_STARTED, this.STATUS_ID_VALIDATED],
            },
          },
        },
        rests: true,
      },
    });

    const availableAdventurers: typeof adventurers = [];

    for (const adventurer of adventurers) {
      let isAvailable = true;

      for (const quest of adventurer.quests) {
        const questStart = quest.startDate || quest.finalDate;
        const questEnd = new Date(questStart);
        questEnd.setDate(questEnd.getDate() + quest.estimatedDuration);

        if (this.periodsOverlap(startDate, endDate, questStart, questEnd)) {
          isAvailable = false;
          break;
        }
      }

      if (isAvailable) {
        for (const rest of adventurer.rests) {
          if (
            this.periodsOverlap(
              startDate,
              endDate,
              rest.startDate,
              rest.endDate,
            )
          ) {
            isAvailable = false;
            break;
          }
        }
      }

      if (isAvailable) {
        availableAdventurers.push(adventurer);
      }
    }

    return availableAdventurers;
  }

  private periodsOverlap(
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date,
  ): boolean {
    return start1 <= end2 && end1 >= start2;
  }
}
