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
import { SpecialitiesService } from '../services/specialities.service';
import { CreateSpecialityDto } from '../dto/create-speciality.dto';
import { UpdateSpecialityDto } from '../dto/update-speciality.dto';
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

@ApiTags('Specialities')
@ApiBearerAuth()
@Controller('specialities')
export class SpecialitiesController {
  constructor(private readonly specialitiesService: SpecialitiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiBody({
    description: 'New speciality payload',
    required: true,
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Mage' },
        description: { type: 'string', example: 'Uses arcane powers.' },
      },
      required: ['name'],
      additionalProperties: false,
    },
  })
  @ApiCreatedResponse({
    description: 'Speciality created',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 5 },
        name: { type: 'string', example: 'Mage' },
        description: { type: 'string', example: 'Uses arcane powers.' },
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
  create(@Body() dto: CreateSpecialityDto) {
    return this.specialitiesService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiOkResponse({
    description: 'List of specialities',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'Warrior' },
          description: {
            type: 'string',
            example: 'Frontline melee combatant.',
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
    return this.specialitiesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 5, description: 'Speciality ID' })
  @ApiOkResponse({
    description: 'Speciality by id',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 5 },
        name: { type: 'string', example: 'Mage' },
        description: { type: 'string', example: 'Uses arcane powers.' },
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
    return this.specialitiesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 5, description: 'Speciality ID' })
  @ApiBody({
    description: 'Fields to update (partial)',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Battlemage' },
        description: { type: 'string', example: 'Combines melee and magic.' },
      },
      additionalProperties: false,
    },
  })
  @ApiOkResponse({
    description: 'Updated speciality',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 5 },
        name: { type: 'string', example: 'Battlemage' },
        description: { type: 'string', example: 'Combines melee and magic.' },
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
  update(@Param('id') id: number, @Body() dto: UpdateSpecialityDto) {
    return this.specialitiesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 5, description: 'Speciality ID' })
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
  remove(@Param('id') id: number) {
    return this.specialitiesService.delete(id);
  }
}
