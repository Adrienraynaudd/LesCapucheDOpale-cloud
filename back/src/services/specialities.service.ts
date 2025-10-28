import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpecialityDto } from '../dto/create-speciality.dto';
import { UpdateSpecialityDto } from '../dto/update-speciality.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SpecialitiesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSpecialityDto) {
    const exists = await this.prisma.speciality.findFirst({
      where: { name: dto.name },
    });
    if (exists) throw new ConflictException('Speciality already exists');
    return this.prisma.speciality.create({ data: dto });
  }

  async update(id: number, dto: UpdateSpecialityDto) {
    try {
      return await this.prisma.speciality.update({ where: { id }, data: dto });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('Speciality not found');
      }
      throw e;
    }
  }

  async delete(id: number) {
    try {
      return await this.prisma.speciality.delete({ where: { id } });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('Speciality not found');
      }
      throw e;
    }
  }

  async findAll() {
    return this.prisma.speciality.findMany();
  }

  async findOne(id: number) {
    const speciality = await this.prisma.speciality.findUnique({
      where: { id },
    });
    if (!speciality) throw new NotFoundException('Speciality not found');
    return speciality;
  }
}
