import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConsumableDto } from '../dto/create-consumable.dto';
import { UpdateConsumableDto } from '../dto/update-consumable.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ConsumablesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateConsumableDto) {
    return this.prisma.consumable.create({
      data: dto,
      include: { consumableType: true },
    });
  }

  async findAll() {
    return this.prisma.consumable.findMany({
      include: { consumableType: true },
    });
  }

  async findOne(id: number) {
    const consumable = await this.prisma.consumable.findUnique({
      where: { id },
      include: { consumableType: true },
    });
    if (!consumable) throw new NotFoundException('Consumable not found');
    return consumable;
  }

  async update(id: number, dto: UpdateConsumableDto) {
    try {
      return await this.prisma.consumable.update({
        where: { id },
        data: dto,
        include: { consumableType: true },
      });
    } catch (e: unknown) {
      if (
        (e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2025') ||
        (typeof e === 'object' &&
          e !== null &&
          'code' in e &&
          (e as { code?: string }).code === 'P2025')
      ) {
        throw new NotFoundException('Consumable not found');
      }
      throw e;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.consumable.delete({ where: { id } });
    } catch (e: unknown) {
      if (
        (e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2025') ||
        (typeof e === 'object' &&
          e !== null &&
          'code' in e &&
          (e as { code?: string }).code === 'P2025')
      ) {
        throw new NotFoundException('Consumable not found');
      }
      if (
        (e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2003') ||
        (typeof e === 'object' &&
          e !== null &&
          'code' in e &&
          (e as { code?: string }).code === 'P2003')
      ) {
        throw new BadRequestException(
          'Consumable is referenced and cannot be deleted',
        );
      }
      throw e;
    }
  }

  async purchase(id: number, qty: number) {
    if (!Number.isFinite(qty) || qty <= 0) {
      throw new BadRequestException('Quantity must be > 0');
    }

    return this.prisma.$transaction(async (tx) => {
      const item = await tx.consumable.findUnique({
        where: { id },
        select: { id: true, quantity: true },
      });
      if (!item) throw new NotFoundException('Consumable not found');

      return tx.consumable.update({
        where: { id },
        data: { quantity: { increment: qty } },
        include: { consumableType: true },
      });
    });
  }
}
