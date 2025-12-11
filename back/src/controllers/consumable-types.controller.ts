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
import { ConsumableTypesService } from '../services/consumable-types.service';
import { CreateConsumableTypeDto } from '../dto/create-consumable-type.dto';
import { UpdateConsumableTypeDto } from '../dto/update-consumable-type.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import {
  ApiTags,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Consumable Types')
@Controller('consumable-types')
export class ConsumableTypesController {
  constructor(
    private readonly consumableTypesService: ConsumableTypesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiBearerAuth()
  @ApiBody({
    description: 'New consumable type payload',
    required: true,
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Health Potion' },
      },
      required: ['name'],
      additionalProperties: false,
    },
  })
  @ApiCreatedResponse({
    description: 'Consumable type created',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 5 },
        name: { type: 'string', example: 'Health Potion' },
      },
    },
  })
  create(@Body() dto: CreateConsumableTypeDto) {
    return this.consumableTypesService.create(dto);
  }

  @Get()
  @ApiOkResponse({
    description: 'List of consumable types',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'Health Potion' },
        },
      },
    },
  })
  findAll() {
    return this.consumableTypesService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', example: 5, description: 'Consumable type ID' })
  @ApiOkResponse({
    description: 'Consumable type by id',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 5 },
        name: { type: 'string', example: 'Health Potion' },
      },
    },
  })
  findOne(@Param('id') id: number) {
    return this.consumableTypesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', example: 5, description: 'Consumable type ID' })
  @ApiBody({
    description: 'Fields to update (partial)',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Greater Health Potion' },
      },
      additionalProperties: false,
    },
  })
  @ApiOkResponse({
    description: 'Updated consumable type',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 5 },
        name: { type: 'string', example: 'Greater Health Potion' },
      },
    },
  })
  update(@Param('id') id: number, @Body() dto: UpdateConsumableTypeDto) {
    return this.consumableTypesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', example: 5, description: 'Consumable type ID' })
  @ApiOkResponse({
    description: 'Delete result',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 5 },
        deleted: { type: 'boolean', example: true },
      },
    },
  })
  delete(@Param('id') id: number) {
    return this.consumableTypesService.delete(id);
  }
}
