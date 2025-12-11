import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Get,
  Patch,
  Post,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AdventurersService } from '../services/adventurers.service';
import { CreateAdventurerDto } from '../dto/create-adventurer.dto';
import { UpdateAdventurerDto } from '../dto/update-adventurer.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import {
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

// Interface pour typer les paramètres de requête (Query Params)
// Les query params arrivent généralement sous forme de string via HTTP
interface AdventurerQueryDto {
  name?: string;
  specialityId?: string;
  xpMin?: string;
  xpMax?: string;
  dailyRateOrder?: 'asc' | 'desc';
}

@Controller('adventurers')
export class AdventurersController {
  constructor(private readonly adventurersService: AdventurersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filtrer par nom (contains, insensible à la casse)',
    example: 'aria',
    type: String,
  })
  @ApiQuery({
    name: 'specialityId',
    required: false,
    description: 'Filtrer par identifiant de spécialité',
    example: 3,
    type: Number,
  })
  @ApiQuery({
    name: 'xpMin',
    required: false,
    description: 'Expérience minimale (incluse)',
    example: 10,
    type: Number,
  })
  @ApiQuery({
    name: 'xpMax',
    required: false,
    description: 'Expérience maximale (incluse)',
    example: 50,
    type: Number,
  })
  @ApiQuery({
    name: 'dailyRateOrder',
    required: false,
    description: 'Tri par taux journalier',
    enum: ['asc', 'desc'],
    example: 'asc',
  })
  @ApiOkResponse({
    description: 'List of adventurers (avec filtres et tri)',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'Aria Stormblade' },
          level: { type: 'number', example: 12 },
          specialityId: { type: 'number', example: 3 },
          statusId: { type: 'number', example: 1 },
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
  findAll(@Query() q: AdventurerQueryDto) {
    return this.adventurersService.findAll({
      name: q.name,
      specialityId: q.specialityId ? Number(q.specialityId) : undefined,
      experienceMin: q.xpMin ? Number(q.xpMin) : undefined,
      experienceMax: q.xpMax ? Number(q.xpMax) : undefined,
      dailyRateOrder:
        q.dailyRateOrder === 'desc'
          ? 'desc'
          : q.dailyRateOrder === 'asc'
            ? 'asc'
            : undefined,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 1, description: 'Adventurer ID' })
  @ApiOkResponse({
    description: 'Adventurer by id',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Aria Stormblade' },
        level: { type: 'number', example: 12 },
        specialityId: { type: 'number', example: 3 },
        statusId: { type: 'number', example: 1 },
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
    return this.adventurersService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiBody({
    description: 'New adventurer payload',
    required: true,
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Aria Stormblade' },
        specialityId: { type: 'number', example: 3 },
        level: { type: 'number', example: 1 },
        statusId: { type: 'number', example: 1 },
      },
      required: ['name', 'specialityId'],
    },
  })
  @ApiCreatedResponse({
    description: 'Adventurer created',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 42 },
        name: { type: 'string', example: 'Aria Stormblade' },
        level: { type: 'number', example: 1 },
        specialityId: { type: 'number', example: 3 },
        statusId: { type: 'number', example: 1 },
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
  create(@Body() createAdventurerDto: CreateAdventurerDto) {
    return this.adventurersService.create(createAdventurerDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 42, description: 'Adventurer ID' })
  @ApiBody({
    description: 'Fields to update (partial)',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Aria Nightwind' },
        specialityId: { type: 'number', example: 2 },
        level: { type: 'number', example: 13 },
        statusId: { type: 'number', example: 2 },
      },
      additionalProperties: false,
    },
  })
  @ApiOkResponse({
    description: 'Updated adventurer',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 42 },
        name: { type: 'string', example: 'Aria Nightwind' },
        level: { type: 'number', example: 13 },
        specialityId: { type: 'number', example: 2 },
        statusId: { type: 'number', example: 2 },
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
    @Body() updateAdventurerDto: UpdateAdventurerDto,
  ) {
    return this.adventurersService.update(id, updateAdventurerDto);
  }
}

export type FindAdventurersOptions = {
  name?: string;
  specialityId?: number;
  experienceMin?: number;
  experienceMax?: number;
  dailyRateOrder?: 'asc' | 'desc';
};
