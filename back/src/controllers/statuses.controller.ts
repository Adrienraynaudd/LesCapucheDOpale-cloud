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
import { StatusesService } from '../services/statuses.service';
import { CreateStatusDto } from '../dto/create-status.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';
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

@ApiTags('Statuses')
@ApiBearerAuth()
@Controller('statuses')
export class StatusesController {
  constructor(private readonly service: StatusesService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiOkResponse({
    description: 'List of statuses',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'Pending' },
        },
      },
    },
  })
  list() {
    return this.service.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiBody({
    description: 'New status payload',
    required: true,
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'In Progress' },
      },
      required: ['name'],
      additionalProperties: false,
    },
  })
  @ApiCreatedResponse({
    description: 'Status created',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 3 },
        name: { type: 'string', example: 'In Progress' },
      },
    },
  })
  create(@Body() dto: CreateStatusDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 3, description: 'Status ID' })
  @ApiBody({
    description: 'Fields to update (partial)',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Completed' },
      },
      additionalProperties: false,
    },
  })
  @ApiOkResponse({
    description: 'Updated status',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 3 },
        name: { type: 'string', example: 'Completed' },
      },
    },
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStatusDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 3, description: 'Status ID' })
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
