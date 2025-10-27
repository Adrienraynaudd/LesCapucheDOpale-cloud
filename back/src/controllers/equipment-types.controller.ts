import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EquipmentTypesService } from '../services/equipment-types.service';
import { CreateEquipmentTypeDto } from '../dto/create-equipment-type.dto';
import { UpdateEquipmentTypeDto } from '../dto/update-equipment-type.dto';

@Controller('equipment-types')
export class EquipmentTypesController {
    constructor(private readonly equipmentTypesService: EquipmentTypesService) {}

    @Post()
    create(@Body() dto: CreateEquipmentTypeDto) {
        return this.equipmentTypesService.create(dto);
    }

    @Get()
    findAll() {
        return this.equipmentTypesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.equipmentTypesService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateEquipmentTypeDto) {
        return this.equipmentTypesService.update(+id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.equipmentTypesService.remove(+id);
    }
}
