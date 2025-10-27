import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpecialtyDto } from '../dto/create-specialty.dto';
import { UpdateSpecialtyDto } from '../dto/update-specialty.dto';

@Injectable()
export class SpecialtiesService {
    constructor(private prisma: PrismaService) {}

    async create(dto: CreateSpecialtyDto) {
        const exists = await this.prisma.specialty.findFirst({ where: { name: dto.name } });
        if (exists) throw new ConflictException('Specialty already exists');
        return this.prisma.specialty.create({ data: dto });
    }

    async update(id: number, dto: UpdateSpecialtyDto) {
        try {
            return await this.prisma.specialty.update({ where: { id }, data: dto });
        } catch (e: any) {
            if (e.code === 'P2025') throw new NotFoundException('Specialty not found');
            throw e;
        }
    }

    async findAll() {
        return this.prisma.specialty.findMany();
    }

    async findOne(id: number) {
        const specialty = await this.prisma.specialty.findUnique({ where: { id } });
        if (!specialty) throw new NotFoundException('Specialty not found');
        return specialty;
    }

    async remove(id: number) {
        try {
            return await this.prisma.specialty.delete({ where: { id } });
        } catch (e: any) {
            if (e.code === 'P2025') throw new NotFoundException('Specialty not found');
            throw e;
        }
    }
}
