import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QuestStockEquipmentService } from '../services/quest-stock-equipment.service';
import { CreateQuestStockEquipmentDto } from '../dto/create-quest-stock-equipment.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';

@Controller('quest-stock-equipment')
export class QuestStockEquipmentController {
  constructor(private readonly service: QuestStockEquipmentService) {}

  @Get()
  list(@Query('questId') questId?: number) {
    return this.service.findAll(questId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  attach(@Body() dto: CreateQuestStockEquipmentDto) {
    return this.service.attach(dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
