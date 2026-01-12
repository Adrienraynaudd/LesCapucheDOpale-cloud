import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateEquipmentStockDto } from '../dto/create-equipment-stock.dto';
import { UpdateEquipmentStockDto } from '../dto/update-equipment-stock.dto';
import { equipmentStockInclude } from '../dbo/equipment-stock.dbo';

@Injectable()
export class EquipmentStocksService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEquipmentStockDto) {
    const equipment = await this.findEquipment(dto.equipmentId);
    return this.prisma.equipmentStock.create({
      data: {
        equipmentId: dto.equipmentId,
        durability: equipment.maxDurability,
        quantity: dto.quantity ?? 1,
      },
      include: equipmentStockInclude,
    });
  }

  findAll() {
    return this.prisma.equipmentStock.findMany({
      include: equipmentStockInclude,
    });
  }

  async findOne(id: number) {
    const row = await this.prisma.equipmentStock.findUnique({
      where: { id },
      include: equipmentStockInclude,
    });
    if (!row) throw new NotFoundException('EquipmentStock not found');
    return row;
  }

  async update(id: number, dto: UpdateEquipmentStockDto) {
    if (dto.equipmentId) await this.findEquipment(dto.equipmentId);
    try {
      return await this.prisma.equipmentStock.update({
        where: { id },
        data: dto,
        include: equipmentStockInclude,
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('EquipmentStock not found');
      }
      throw e;
    }
  }

  async delete(id: number) {
    try {
      return await this.prisma.equipmentStock.delete({ where: { id } });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('EquipmentStock not found');
      }
      throw e;
    }
  }

  async repair(id: number) {
    const stock = await this.prisma.equipmentStock.findUnique({
      where: { id },
      include: { equipment: true },
    });
    if (!stock) throw new NotFoundException('EquipmentStock not found');

    return this.prisma.equipmentStock.update({
      where: { id },
      data: {
        durability: stock.equipment.maxDurability,
        statusId: 1, // AVAILABLE
      },
      include: equipmentStockInclude,
    });
  }

  async updateStatus(id: number, statusId: number) {
    try {
      return await this.prisma.equipmentStock.update({
        where: { id },
        data: { statusId },
        include: equipmentStockInclude,
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('EquipmentStock not found');
      }
      throw e;
    }
  }

  private async findEquipment(equipmentId: number) {
    const e = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
    });
    if (!e) throw new NotFoundException(`Equipment ${equipmentId} not found`);
    return e;
  }
}
