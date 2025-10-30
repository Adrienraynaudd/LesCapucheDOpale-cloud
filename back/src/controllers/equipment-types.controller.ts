import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { EquipmentTypesService } from '../services/equipment-types.service';
import { CreateEquipmentTypeDto } from '../dto/create-equipment-type.dto';
import { UpdateEquipmentTypeDto } from '../dto/update-equipment-type.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Equipment Types')
@ApiBearerAuth()
@Controller('equipment-types')
export class EquipmentTypesController {
  constructor(private readonly equipmentTypesService: EquipmentTypesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiBody({
    description: 'New equipment type payload',
    required: true,
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Weapon' },
        description: {
          type: 'string',
          example: 'Offensive equipment like swords or bows.',
        },
      },
      required: ['name'],
      additionalProperties: false,
    },
  })
  @ApiCreatedResponse({
    description: 'Equipment type created',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 7 },
        name: { type: 'string', example: 'Weapon' },
        description: {
          type: 'string',
          example: 'Offensive equipment like swords or bows.',
        },
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
  create(@Body() dto: CreateEquipmentTypeDto) {
    return this.equipmentTypesService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiOkResponse({
    description: 'List of equipment types',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'Armor' },
          description: {
            type: 'string',
            example: 'Defensive equipment such as shields or helmets.',
          },
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
    return this.equipmentTypesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 7, description: 'Equipment type ID' })
  @ApiOkResponse({
    description: 'Equipment type by id',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 7 },
        name: { type: 'string', example: 'Weapon' },
        description: {
          type: 'string',
          example: 'Offensive equipment like swords or bows.',
        },
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
  findOne(@Param('id') id: number) {
    return this.equipmentTypesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 7, description: 'Equipment type ID' })
  @ApiBody({
    description: 'Fields to update (partial)',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Ranged Weapon' },
        description: {
          type: 'string',
          example: 'Bows, crossbows, and similar weapons.',
        },
      },
      additionalProperties: false,
    },
  })
  @ApiOkResponse({
    description: 'Updated equipment type',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 7 },
        name: { type: 'string', example: 'Ranged Weapon' },
        description: {
          type: 'string',
          example: 'Bows, crossbows, and similar weapons.',
        },
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
  update(@Param('id') id: number, @Body() dto: UpdateEquipmentTypeDto) {
    return this.equipmentTypesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 7, description: 'Equipment type ID' })
  @ApiOkResponse({
    description: 'Delete result',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 7 },
        deleted: { type: 'boolean', example: true },
      },
    },
  })
  delete(@Param('id') id: number) {
    return this.equipmentTypesService.delete(id);
  }
}
