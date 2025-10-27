import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SpecialtiesService } from '../services/specialties.service';
import { CreateSpecialtyDto } from '../dto/create-specialty.dto';
import { UpdateSpecialtyDto } from '../dto/update-specialty.dto';

@Controller('specialties')
export class SpecialtiesController {
    constructor(private readonly specialtiesService: SpecialtiesService) {}

    @Post()
    create(@Body() dto: CreateSpecialtyDto) {
        return this.specialtiesService.create(dto);
    }

    @Get()
    findAll() {
        return this.specialtiesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.specialtiesService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateSpecialtyDto) {
        return this.specialtiesService.update(+id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.specialtiesService.remove(+id);
    }
}
