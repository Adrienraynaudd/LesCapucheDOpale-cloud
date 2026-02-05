import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdventurerDto } from '../dto/create-adventurer.dto';
import { UpdateAdventurerDto } from '../dto/update-adventurer.dto';
import { FindAdventurersQueryDto } from '../dto/find-adventurers-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdventurersService {
  constructor(private prisma: PrismaService) {}

  async findAll(options: FindAdventurersQueryDto = {}) {
    const { name, specialityId, experienceMin, experienceMax, dailyRateOrder } =
      options;

    const where: Prisma.AdventurerWhereInput = {
      ...(name ? { name: { contains: name } } : {}),
      ...(typeof specialityId === 'number' ? { specialityId } : {}),
      ...(experienceMin != null || experienceMax != null
        ? {
            experience: {
              ...(experienceMin != null ? { gte: experienceMin } : {}),
              ...(experienceMax != null ? { lte: experienceMax } : {}),
            },
          }
        : {}),
    };
    const whereClause = Object.keys(where).length ? where : undefined;

    return this.prisma.adventurer.findMany({
      where: whereClause,
      orderBy: dailyRateOrder ? { dailyRate: dailyRateOrder } : undefined,
      include: {
        speciality: true,
        equipmentTypes: true,
        consumableTypes: true,
        rests: true,
      },
    });
  }

  async findOne(id: number) {
    const adventurer = await this.prisma.adventurer.findUnique({
      where: { id },
      include: {
        speciality: true,
        equipmentTypes: true,
        consumableTypes: true,
        rests: true,
      },
    });
    if (!adventurer) throw new NotFoundException('Adventurer not found');
    return adventurer;
  }

  async create(createAdventurerDto: CreateAdventurerDto) {
    const {
      name,
      imageUrl,
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
        imageUrl,
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
