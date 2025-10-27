import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ConsumableTypesService } from '../services/consumable-types.service';
import { CreateConsumableTypeDto } from '../dto/create-consumable-type.dto';
import { UpdateConsumableTypeDto } from '../dto/update-consumable-type.dto';

@Controller('consumable-types')
export class ConsumableTypesController {
    constructor(private readonly consumableTypesService: ConsumableTypesService) {}

    @Post()
    create(@Body() dto: CreateConsumableTypeDto) {
        return this.consumableTypesService.create(dto);
    }

    @Get()
    findAll() {
        return this.consumableTypesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.consumableTypesService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateConsumableTypeDto) {
        return this.consumableTypesService.update(+id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.consumableTypesService.remove(+id);
    }
}
