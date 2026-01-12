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
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FindAdventurersQueryDto } from '../dto/find-adventurers-query.dto';

@ApiTags('Adventurers')
@ApiBearerAuth()
@Controller('adventurers')
export class AdventurersController {
  constructor(private readonly adventurersService: AdventurersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiOkResponse({
    description: 'List of adventurers (avec filtres et tri)',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'Aria Stormblade' },
          specialityId: { type: 'number', example: 3 },
          dailyRate: { type: 'number', example: 150 },
          experience: { type: 'number', example: 120 },
          availableUntil: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2025-12-31T23:59:59.000Z',
          },
        },
      },
    },
  })
  findAll(@Query() query: FindAdventurersQueryDto) {
    return this.adventurersService.findAll(query);
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
        specialityId: { type: 'number', example: 3 },
        dailyRate: { type: 'number', example: 150 },
        experience: { type: 'number', example: 120 },
        availableUntil: {
          type: 'string',
          format: 'date-time',
          nullable: true,
          example: '2025-12-31T23:59:59.000Z',
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
        dailyRate: { type: 'number', example: 100 },
        equipmentTypeIds: {
          type: 'array',
          items: { type: 'number' },
          example: [1, 2],
        },
        consumableTypeIds: {
          type: 'array',
          items: { type: 'number' },
          example: [1],
        },
      },
      required: ['name', 'specialityId', 'dailyRate'],
    },
  })
  @ApiCreatedResponse({
    description: 'Adventurer created',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 42 },
        name: { type: 'string', example: 'Aria Stormblade' },
        specialityId: { type: 'number', example: 3 },
        dailyRate: { type: 'number', example: 100 },
        experience: { type: 'number', example: 0 },
        availableUntil: {
          type: 'string',
          format: 'date-time',
          nullable: true,
          example: null,
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
        dailyRate: { type: 'number', example: 180 },
        specialityId: { type: 'number', example: 2 },
        equipmentTypeIds: {
          type: 'array',
          items: { type: 'number' },
          example: [1, 3],
        },
        consumableTypeIds: {
          type: 'array',
          items: { type: 'number' },
          example: [2],
        },
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
        specialityId: { type: 'number', example: 2 },
        dailyRate: { type: 'number', example: 180 },
        experience: { type: 'number', example: 120 },
        availableUntil: {
          type: 'string',
          format: 'date-time',
          nullable: true,
          example: '2025-12-31T23:59:59.000Z',
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
