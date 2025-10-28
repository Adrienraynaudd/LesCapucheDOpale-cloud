import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateConsumableTypeDto } from '../dto/create-consumable-type.dto';
import { UpdateConsumableTypeDto } from '../dto/update-consumable-type.dto';

@Injectable()
export class ConsumableTypesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateConsumableTypeDto) {
    const exists = await this.prisma.consumableType.findFirst({
      where: { name: dto.name },
    });
    if (exists) throw new ConflictException('ConsumableType already exists');
    return this.prisma.consumableType.create({ data: dto });
  }

  async update(id: number, dto: UpdateConsumableTypeDto) {
    try {
      return await this.prisma.consumableType.update({
        where: { id },
        data: dto,
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('ConsumableType not found');
      }
      throw e;
    }
  }

  async findAll() {
    return this.prisma.consumableType.findMany();
  }

  async findOne(id: number) {
    const consumableType = await this.prisma.consumableType.findUnique({
      where: { id },
    });
    if (!consumableType)
      throw new NotFoundException('ConsumableType not found');
    return consumableType;
  }

  async delete(id: number) {
    try {
      return await this.prisma.consumableType.delete({ where: { id } });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('ConsumableType not found');
      }
      throw e;
    }
  }
}
