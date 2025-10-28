import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EquipmentStocksService } from '../services/equipment-stocks.service';
import { CreateEquipmentStockDto } from '../dto/create-equipment-stock.dto';
import { UpdateEquipmentStockDto } from '../dto/update-equipment-stock.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';

@Controller('equipment-stocks')
export class EquipmentStocksController {
  constructor(private readonly service: EquipmentStocksService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  create(@Body() dto: CreateEquipmentStockDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEquipmentStockDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
