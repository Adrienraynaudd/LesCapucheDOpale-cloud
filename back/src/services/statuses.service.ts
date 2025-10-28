import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStatusDto } from '../dto/create-status.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';

@Injectable()
export class StatusesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateStatusDto) {
    return this.prisma.status.create({ data: { name: dto.name } });
  }

  findAll() {
    return this.prisma.status.findMany({ orderBy: { id: 'asc' } });
  }

  async update(id: number, dto: UpdateStatusDto) {
    try {
      return await this.prisma.status.update({ where: { id }, data: dto });
    } catch (e: unknown) {
      if (isPrismaNotFoundError(e)) {
        throw new NotFoundException('Status not found');
      }
      throw e;
    }
  }

  async delete(id: number) {
    try {
      return await this.prisma.status.delete({ where: { id } });
    } catch (e: unknown) {
      if (isPrismaNotFoundError(e)) {
        throw new NotFoundException('Status not found');
      }
      throw e;
    }
  }
}

function isPrismaNotFoundError(error: unknown): error is { code: 'P2025' } {
  if (typeof error !== 'object' || error === null) return false;

  if (!('code' in error)) return false;

  const maybeError = error as { code?: unknown };
  return maybeError.code === 'P2025';
}
