import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateEquipmentTypeDto } from '../dto/create-equipment-type.dto';
import { UpdateEquipmentTypeDto } from '../dto/update-equipment-type.dto';

@Injectable()
export class EquipmentTypesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEquipmentTypeDto) {
    const exists = await this.prisma.equipmentType.findFirst({
      where: { name: dto.name },
    });
    if (exists) throw new ConflictException('EquipmentType already exists');
    return this.prisma.equipmentType.create({ data: dto });
  }

  async update(id: number, dto: UpdateEquipmentTypeDto) {
    try {
      return await this.prisma.equipmentType.update({
        where: { id },
        data: dto,
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('EquipmentType not found');
      }
      throw e;
    }
  }

  async findAll() {
    return this.prisma.equipmentType.findMany();
  }

  async findOne(id: number) {
    const equipmentType = await this.prisma.equipmentType.findUnique({
      where: { id },
    });
    if (!equipmentType) throw new NotFoundException('EquipmentType not found');
    return equipmentType;
  }

  async delete(id: number) {
    try {
      return await this.prisma.equipmentType.delete({ where: { id } });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('EquipmentType not found');
      }
      throw e;
    }
  }
}
