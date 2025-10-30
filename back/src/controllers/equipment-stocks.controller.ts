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
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Equipment Stocks')
@ApiBearerAuth()
@Controller('equipment-stocks')
export class EquipmentStocksController {
  constructor(private readonly service: EquipmentStocksService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiOkResponse({
    description: 'List of equipment stocks',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          equipmentId: { type: 'number', example: 12 },
          quantity: { type: 'number', example: 25 },
          available: { type: 'number', example: 20 },
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
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 1, description: 'Equipment stock ID' })
  @ApiOkResponse({
    description: 'Equipment stock by id',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        equipmentId: { type: 'number', example: 12 },
        quantity: { type: 'number', example: 25 },
        available: { type: 'number', example: 20 },
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
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiBody({
    description: 'New equipment stock payload',
    required: true,
    schema: {
      type: 'object',
      properties: {
        equipmentId: { type: 'number', example: 12 },
        quantity: { type: 'number', example: 25 },
      },
      required: ['equipmentId', 'quantity'],
      additionalProperties: false,
    },
  })
  @ApiCreatedResponse({
    description: 'Equipment stock created',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 3 },
        equipmentId: { type: 'number', example: 12 },
        quantity: { type: 'number', example: 25 },
        available: { type: 'number', example: 25 },
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
  create(@Body() dto: CreateEquipmentStockDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 3, description: 'Equipment stock ID' })
  @ApiBody({
    description: 'Fields to update (partial)',
    schema: {
      type: 'object',
      properties: {
        equipmentId: { type: 'number', example: 15 },
        quantity: { type: 'number', example: 30 },
        available: { type: 'number', example: 28 },
      },
      additionalProperties: false,
    },
  })
  @ApiOkResponse({
    description: 'Updated equipment stock',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 3 },
        equipmentId: { type: 'number', example: 15 },
        quantity: { type: 'number', example: 30 },
        available: { type: 'number', example: 28 },
        createdAt: {
          type: 'string',
          format: 'date-time',
          example: '2025-10-30T12:00:00.000Z',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          example: '2025-10-30T12:45:00.000Z',
        },
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEquipmentStockDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 3, description: 'Equipment stock ID' })
  @ApiOkResponse({
    description: 'Delete result',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 3 },
        deleted: { type: 'boolean', example: true },
      },
    },
  })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
