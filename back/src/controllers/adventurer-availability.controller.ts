import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdventurerAvailabilityService } from '../services/adventurer-availability.service';
import { CreateAdventurerRestDto } from '../dto/create-adventurer-rest.dto';
import { UpdateAdventurerRestDto } from '../dto/update-adventurer-rest.dto';
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

@ApiTags('Adventurer Availability')
@ApiBearerAuth()
@Controller('adventurer-availability')
export class AdventurerAvailabilityController {
  constructor(
    private readonly availabilityService: AdventurerAvailabilityService,
  ) {}

  @Get(':adventurerId/check')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'adventurerId', example: 1, description: 'Adventurer ID' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    example: '2026-02-01',
    description: 'Start date of the period',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    example: '2026-02-28',
    description: 'End date of the period',
  })
  @ApiOkResponse({
    description: 'Adventurer availability status',
    schema: {
      type: 'object',
      properties: {
        adventurerId: { type: 'number', example: 1 },
        adventurerName: { type: 'string', example: 'Aria Stormblade' },
        isAvailable: { type: 'boolean', example: false },
        events: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              startDate: {
                type: 'string',
                example: '2026-02-05T00:00:00.000Z',
              },
              endDate: { type: 'string', example: '2026-02-10T00:00:00.000Z' },
              type: { type: 'string', example: 'mission' },
              reason: { type: 'string', example: 'Quest: Dragon Hunt' },
            },
          },
        },
      },
    },
  })
  checkAvailability(
    @Param('adventurerId', ParseIntPipe) adventurerId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.availabilityService.checkAvailability(
      adventurerId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':adventurerId/schedule')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'adventurerId', example: 1, description: 'Adventurer ID' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    example: '2026-02-01',
    description: 'Start date of the period',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    example: '2026-02-28',
    description: 'End date of the period',
  })
  @ApiOkResponse({
    description: 'Adventurer schedule with daily status',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: { type: 'string', example: '2026-02-05' },
          status: {
            type: 'string',
            enum: [
              'available',
              'mission',
              'rest',
              'unavailable',
              'mission_rest',
            ],
          },
          events: { type: 'array', items: { type: 'object' } },
        },
      },
    },
  })
  getSchedule(
    @Param('adventurerId', ParseIntPipe) adventurerId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.availabilityService.getSchedule(
      adventurerId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('available')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiQuery({
    name: 'startDate',
    required: true,
    example: '2026-02-01',
    description: 'Start date of the period',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    example: '2026-02-28',
    description: 'End date of the period',
  })
  @ApiOkResponse({
    description: 'List of available adventurers for the period',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'Aria Stormblade' },
          specialityId: { type: 'number', example: 3 },
          dailyRate: { type: 'number', example: 150 },
        },
      },
    },
  })
  findAvailableAdventurers(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.availabilityService.findAvailableAdventurers(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':adventurerId/rests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'adventurerId', example: 1, description: 'Adventurer ID' })
  @ApiOkResponse({
    description: 'List of rest periods for the adventurer',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          adventurerId: { type: 'number', example: 1 },
          startDate: { type: 'string', example: '2026-02-05T00:00:00.000Z' },
          endDate: { type: 'string', example: '2026-02-10T00:00:00.000Z' },
          reason: { type: 'string', example: 'Repos après mission' },
          type: { type: 'string', example: 'rest' },
        },
      },
    },
  })
  findAllRests(@Param('adventurerId', ParseIntPipe) adventurerId: number) {
    return this.availabilityService.findAllRests(adventurerId);
  }

  @Post('rests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiBody({
    description: 'Create a new rest period',
    required: true,
    schema: {
      type: 'object',
      properties: {
        adventurerId: { type: 'number', example: 1 },
        startDate: { type: 'string', example: '2026-02-05T00:00:00.000Z' },
        endDate: { type: 'string', example: '2026-02-10T00:00:00.000Z' },
        reason: { type: 'string', example: 'Repos après mission' },
        type: {
          type: 'string',
          enum: ['rest', 'unavailable', 'mission_rest'],
          example: 'rest',
        },
      },
      required: ['adventurerId', 'startDate', 'endDate', 'reason', 'type'],
    },
  })
  @ApiCreatedResponse({
    description: 'Rest period created',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        adventurerId: { type: 'number', example: 1 },
        startDate: { type: 'string', example: '2026-02-05T00:00:00.000Z' },
        endDate: { type: 'string', example: '2026-02-10T00:00:00.000Z' },
        reason: { type: 'string', example: 'Repos après mission' },
        type: { type: 'string', example: 'rest' },
      },
    },
  })
  createRest(@Body() dto: CreateAdventurerRestDto) {
    return this.availabilityService.createRest(dto);
  }

  @Patch('rests/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 1, description: 'Rest period ID' })
  @ApiBody({
    description: 'Update a rest period',
    schema: {
      type: 'object',
      properties: {
        startDate: { type: 'string', example: '2026-02-06T00:00:00.000Z' },
        endDate: { type: 'string', example: '2026-02-12T00:00:00.000Z' },
        reason: { type: 'string', example: 'Repos prolongé' },
        type: { type: 'string', enum: ['rest', 'unavailable', 'mission_rest'] },
      },
    },
  })
  @ApiOkResponse({ description: 'Updated rest period' })
  updateRest(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdventurerRestDto,
  ) {
    return this.availabilityService.updateRest(id, dto);
  }

  @Delete('rests/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 1, description: 'Rest period ID' })
  @ApiOkResponse({ description: 'Rest period deleted' })
  deleteRest(@Param('id', ParseIntPipe) id: number) {
    return this.availabilityService.deleteRest(id);
  }
}
