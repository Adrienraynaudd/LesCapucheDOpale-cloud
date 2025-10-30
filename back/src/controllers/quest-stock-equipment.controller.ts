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
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Quest Stock Equipment')
@ApiBearerAuth()
@Controller('quest-stock-equipment')
export class QuestStockEquipmentController {
  constructor(private readonly service: QuestStockEquipmentService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiQuery({
    name: 'questId',
    required: false,
    description: 'Filter by quest ID',
    schema: { type: 'number', example: 12 },
  })
  @ApiOkResponse({
    description: 'List of quest-stock-equipment',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 101 },
          questId: { type: 'number', example: 12 },
          equipmentStockId: { type: 'number', example: 3 },
          quantity: { type: 'number', example: 2 },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-10-30T12:00:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-10-30T12:34:56.000Z',
          },
        },
      },
    },
  })
  list(@Query('questId') questId?: number) {
    return this.service.findAll(questId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiBody({
    description: 'Attach equipment stock to a quest',
    required: true,
    schema: {
      type: 'object',
      properties: {
        questId: { type: 'number', example: 12 },
        equipmentStockId: { type: 'number', example: 3 },
        quantity: { type: 'number', example: 2 },
      },
      required: ['questId', 'equipmentStockId', 'quantity'],
      additionalProperties: false,
    },
  })
  @ApiCreatedResponse({
    description: 'Attachment created',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 101 },
        questId: { type: 'number', example: 12 },
        equipmentStockId: { type: 'number', example: 3 },
        quantity: { type: 'number', example: 2 },
        createdAt: {
          type: 'string',
          format: 'date-time',
          example: '2025-10-30T12:00:00.000Z',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          example: '2025-10-30T12:00:00.000Z',
        },
      },
    },
  })
  attach(@Body() dto: CreateQuestStockEquipmentDto) {
    return this.service.attach(dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 101, description: 'Attachment ID' })
  @ApiOkResponse({
    description: 'Delete result',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 101 },
        deleted: { type: 'boolean', example: true },
      },
    },
  })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
