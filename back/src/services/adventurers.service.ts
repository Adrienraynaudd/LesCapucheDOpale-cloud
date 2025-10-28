import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdventurerDto } from '../dto/create-adventurer.dto';
import { UpdateAdventurerDto } from '../dto/update-adventurer.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdventurersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.adventurer.findMany();
  }

  async findOne(id: number) {
    const adventurer = await this.prisma.adventurer.findUnique({
      where: { id },
    });
    if (!adventurer) throw new NotFoundException('Adventurer not found');
    return adventurer;
  }

  async create(createAdventurerDto: CreateAdventurerDto) {
    const {
      name,
      specialityId,
      dailyRate,
      equipmentTypeIds = [],
      consumableTypeIds = [],
    } = createAdventurerDto;

    const specialityEntity = await this.prisma.speciality.findUnique({
      where: { id: specialityId },
      select: { id: true },
    });
    if (!specialityEntity) {
      throw new NotFoundException('Speciality not found');
    }

    if (equipmentTypeIds.length) {
      const found = await this.prisma.equipmentType.findMany({
        where: { id: { in: equipmentTypeIds } },
        select: { id: true },
      });
      if (found.length !== equipmentTypeIds.length) {
        const foundSet = new Set(found.map((e) => e.id));
        const missing = equipmentTypeIds.filter((id) => !foundSet.has(id));
        throw new NotFoundException(
          `EquipmentType id(s) not found: ${missing.join(', ')}`,
        );
      }
    }

    if (consumableTypeIds.length) {
      const found = await this.prisma.consumableType.findMany({
        where: { id: { in: consumableTypeIds } },
        select: { id: true },
      });
      if (found.length !== consumableTypeIds.length) {
        const foundSet = new Set(found.map((e) => e.id));
        const missing = consumableTypeIds.filter((id) => !foundSet.has(id));
        throw new NotFoundException(
          `ConsumableType id(s) not found: ${missing.join(', ')}`,
        );
      }
    }

    return this.prisma.adventurer.create({
      data: {
        name,
        specialityId,
        dailyRate,
        experience: 0,
        equipmentTypes: equipmentTypeIds.length
          ? { connect: equipmentTypeIds.map((id) => ({ id })) }
          : undefined,
        consumableTypes: consumableTypeIds.length
          ? { connect: consumableTypeIds.map((id) => ({ id })) }
          : undefined,
      },
      include: {
        speciality: true,
        equipmentTypes: true,
        consumableTypes: true,
      },
    });
  }

  async update(id: number, dto: UpdateAdventurerDto) {
    const { specialityId, equipmentTypeIds, consumableTypeIds, ...scalars } =
      dto;

    if (typeof specialityId === 'number') {
      const spec = await this.prisma.speciality.findUnique({
        where: { id: specialityId },
        select: { id: true },
      });
      if (!spec) {
        throw new NotFoundException('Speciality not found');
      }
    }

    if (Array.isArray(equipmentTypeIds) && equipmentTypeIds.length > 0) {
      const found = await this.prisma.equipmentType.findMany({
        where: { id: { in: equipmentTypeIds } },
        select: { id: true },
      });
      if (found.length !== equipmentTypeIds.length) {
        const foundSet = new Set(found.map((e) => e.id));
        const missing = equipmentTypeIds.filter((x) => !foundSet.has(x));
        throw new NotFoundException(
          `EquipmentType id(s) not found: ${missing.join(', ')}`,
        );
      }
    }

    if (Array.isArray(consumableTypeIds) && consumableTypeIds.length > 0) {
      const found = await this.prisma.consumableType.findMany({
        where: { id: { in: consumableTypeIds } },
        select: { id: true },
      });
      if (found.length !== consumableTypeIds.length) {
        const foundSet = new Set(found.map((e) => e.id));
        const missing = consumableTypeIds.filter((x) => !foundSet.has(x));
        throw new NotFoundException(
          `ConsumableType id(s) not found: ${missing.join(', ')}`,
        );
      }
    }

    const data: Prisma.AdventurerUpdateInput = {
      ...scalars,
      ...(typeof specialityId === 'number' ? { specialityId } : {}),
      ...(Array.isArray(equipmentTypeIds)
        ? { equipmentTypes: { set: equipmentTypeIds.map((id) => ({ id })) } }
        : {}),
      ...(Array.isArray(consumableTypeIds)
        ? { consumableTypes: { set: consumableTypeIds.map((id) => ({ id })) } }
        : {}),
    };

    try {
      return await this.prisma.adventurer.update({
        where: { id },
        data,
        include: {
          speciality: true,
          equipmentTypes: true,
          consumableTypes: true,
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('Adventurer not found');
      }
      throw e;
    }
  }
}
