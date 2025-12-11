import { Controller, Get, Param } from '@nestjs/common';
import { RolesService } from '../services/roles.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOkResponse({
    description: 'List of all roles',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'Admin' },
        },
      },
    },
  })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: 'number', description: 'Role ID' })
  @ApiOkResponse({
    description: 'Role found',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Admin' },
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }
}
