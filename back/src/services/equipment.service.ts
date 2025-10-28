import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEquipmentDto } from '../dto/create-equipment.dto';
import { UpdateEquipmentDto } from '../dto/update-equipment.dto';
import { equipmentInclude } from '../dto/equipment.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class EquipmentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEquipmentDto) {
    await this.findEquipmentType(dto.equipmentTypeId);
    return this.prisma.equipment.create({
      data: {
        name: dto.name,
        cost: dto.cost,
        maxDurability: dto.maxDurability,
        currentDurability: dto.maxDurability,
        equipmentTypeId: dto.equipmentTypeId,
      },
      include: equipmentInclude,
    });
  }

  findAll() {
    return this.prisma.equipment.findMany({ include: equipmentInclude });
  }

  async findOne(id: number) {
    const row = await this.prisma.equipment.findUnique({
      where: { id },
      include: equipmentInclude,
    });
    if (!row) throw new NotFoundException('Equipment not found');
    return row;
  }

  async update(id: number, dto: UpdateEquipmentDto) {
    if (dto.equipmentTypeId) await this.findEquipmentType(dto.equipmentTypeId);

    try {
      return await this.prisma.equipment.update({
        where: { id },
        data: dto,
        include: equipmentInclude,
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('Equipment not found');
      }
      throw e;
    }
  }

  async delete(id: number) {
    try {
      return await this.prisma.equipment.delete({ where: { id } });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('Equipment not found');
      }
      throw e;
    }
  }

  private async findEquipmentType(equipmentTypeId: number) {
    const et = await this.prisma.equipmentType.findUnique({
      where: { id: equipmentTypeId },
    });
    if (!et)
      throw new NotFoundException(`EquipmentType ${equipmentTypeId} not found`);
  }
}
