import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Get,
  Patch,
  Post,
  UseGuards,
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
} from '@nestjs/swagger';

@Controller('adventurers')
export class AdventurersController {
  constructor(private readonly adventurersService: AdventurersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiOkResponse({
    description: 'List of adventurers',
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
  findAll() {
    return this.adventurersService.findAll();
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
