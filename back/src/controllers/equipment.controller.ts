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
import { EquipmentService } from '../services/equipment.service';
import { CreateEquipmentDto } from '../dto/create-equipment.dto';
import { UpdateEquipmentDto } from '../dto/update-equipment.dto';
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

@ApiTags('Equipment')
@ApiBearerAuth()
@Controller('equipment')
export class EquipmentController {
  constructor(private readonly service: EquipmentService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiOkResponse({
    description: 'List of equipment',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 10 },
          name: { type: 'string', example: 'Longsword' },
          equipmentTypeId: { type: 'number', example: 7 },
          cost: { type: 'number', example: 100 },
          maxDurability: { type: 'number', example: 50 },
          currentDurability: { type: 'number', example: 50 },
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
  @ApiParam({ name: 'id', example: 10, description: 'Equipment ID' })
  @ApiOkResponse({
    description: 'Equipment by id',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 10 },
        name: { type: 'string', example: 'Longsword' },
        equipmentTypeId: { type: 'number', example: 7 },
        cost: { type: 'number', example: 100 },
        maxDurability: { type: 'number', example: 50 },
        currentDurability: { type: 'number', example: 50 },
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
    description: 'New equipment payload',
    required: true,
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Longsword' },
        equipmentTypeId: { type: 'number', example: 7 },
        cost: { type: 'number', example: 100 },
        maxDurability: { type: 'number', example: 50 },
      },
      required: ['name', 'equipmentTypeId', 'cost', 'maxDurability'],
      additionalProperties: false,
    },
  })
  @ApiCreatedResponse({
    description: 'Equipment created',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 10 },
        name: { type: 'string', example: 'Longsword' },
        equipmentTypeId: { type: 'number', example: 7 },
        cost: { type: 'number', example: 100 },
        maxDurability: { type: 'number', example: 50 },
        currentDurability: { type: 'number', example: 50 },
      },
    },
  })
  create(@Body() dto: CreateEquipmentDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 10, description: 'Equipment ID' })
  @ApiBody({
    description: 'Fields to update (partial)',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Enchanted Longsword' },
        equipmentTypeId: { type: 'number', example: 8 },
        cost: { type: 'number', example: 150 },
        maxDurability: { type: 'number', example: 60 },
        currentDurability: { type: 'number', example: 45 },
      },
      additionalProperties: false,
    },
  })
  @ApiOkResponse({
    description: 'Updated equipment',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 10 },
        name: { type: 'string', example: 'Enchanted Longsword' },
        equipmentTypeId: { type: 'number', example: 8 },
        cost: { type: 'number', example: 150 },
        maxDurability: { type: 'number', example: 60 },
        currentDurability: { type: 'number', example: 45 },
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEquipmentDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 10, description: 'Equipment ID' })
  @ApiOkResponse({
    description: 'Delete result',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 10 },
        deleted: { type: 'boolean', example: true },
      },
    },
  })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
