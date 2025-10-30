import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { QuestsService } from '../services/quests.service';
import { CreateQuestDto } from '../dto/create-quest.dto';
import { UpdateQuestDto } from '../dto/update-quest.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { UpdateStatusDto } from '../dto/update-quest-status.dto';
import { IdsDto } from '../dto/quest_id.dto';
import { UserDto } from 'src/dto/user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

export interface AuthenticatedRequest extends Request {
  user: UserDto & { sub: number };
}
@ApiTags('Quests')
@ApiBearerAuth()
@Controller('quests')
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiOkResponse({
    description: 'List of quests',
    schema: {
      type: 'array',
      items: { type: 'object', additionalProperties: true },
      example: [
        {
          id: 1,
          title: 'Rescue the Merchant',
          statusId: 1,
          createdAt: '2025-10-30T12:00:00.000Z',
          updatedAt: '2025-10-30T12:34:56.000Z',
        },
      ],
    },
  })
  findAll() {
    return this.questsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 1, description: 'Quest ID' })
  @ApiOkResponse({
    description: 'Quest by id',
    schema: {
      type: 'object',
      additionalProperties: true,
      example: {
        id: 1,
        title: 'Rescue the Merchant',
        description: 'Escort the merchant safely to the city.',
        statusId: 1,
        createdAt: '2025-10-30T12:00:00.000Z',
        updatedAt: '2025-10-30T12:34:56.000Z',
      },
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.questsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiBody({
    description: 'New quest payload',
    required: true,
    schema: {
      type: 'object',
      additionalProperties: true,
      example: {
        title: 'Rescue the Merchant',
        description: 'Escort the merchant safely to the city.',
        statusId: 1,
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Quest created',
    schema: {
      type: 'object',
      additionalProperties: true,
      example: {
        id: 42,
        title: 'Rescue the Merchant',
        description: 'Escort the merchant safely to the city.',
        statusId: 1,
        createdAt: '2025-10-30T12:00:00.000Z',
        updatedAt: '2025-10-30T12:00:00.000Z',
      },
    },
  })
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateQuestDto) {
    const userId = req.user.sub;
    return this.questsService.create(userId, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 42, description: 'Quest ID' })
  @ApiBody({
    description: 'Fields to update (partial)',
    schema: {
      type: 'object',
      additionalProperties: true,
      example: {
        title: 'Rescue the Merchant (Hard)',
        description: 'Hard mode variant.',
        statusId: 2,
      },
    },
  })
  @ApiOkResponse({
    description: 'Updated quest',
    schema: {
      type: 'object',
      additionalProperties: true,
      example: {
        id: 42,
        title: 'Rescue the Merchant (Hard)',
        description: 'Hard mode variant.',
        statusId: 2,
        createdAt: '2025-10-30T12:00:00.000Z',
        updatedAt: '2025-10-30T12:45:00.000Z',
      },
    },
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateQuestDto) {
    return this.questsService.update(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 42, description: 'Quest ID' })
  @ApiBody({
    description: 'Update quest status',
    schema: {
      type: 'object',
      additionalProperties: true,
      example: { statusId: 3 },
    },
  })
  @ApiOkResponse({
    description: 'Quest status updated',
    schema: {
      type: 'object',
      additionalProperties: true,
      example: {
        id: 42,
        statusId: 3,
        updatedAt: '2025-10-30T12:50:00.000Z',
      },
    },
  })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.questsService.updateStatus(id, dto);
  }

  @Patch(':id/adventurers/attach')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 42, description: 'Quest ID' })
  @ApiBody({
    description: 'Attach adventurers to quest',
    schema: {
      type: 'object',
      additionalProperties: true,
      example: { ids: [1, 2, 3] },
    },
  })
  @ApiOkResponse({
    description: 'Adventurers attached',
    schema: {
      type: 'object',
      additionalProperties: true,
      example: { id: 42, adventurerIds: [1, 2, 3] },
    },
  })
  attachAdventurers(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: IdsDto,
  ) {
    return this.questsService.attachAdventurers(id, body.ids);
  }

  @Patch(':id/adventurers/detach')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 42, description: 'Quest ID' })
  @ApiBody({
    description: 'Detach adventurers from quest',
    schema: {
      type: 'object',
      additionalProperties: true,
      example: { ids: [2] },
    },
  })
  @ApiOkResponse({
    description: 'Adventurers detached',
    schema: {
      type: 'object',
      additionalProperties: true,
      example: { id: 42, adventurerIds: [1, 3] },
    },
  })
  detachAdventurers(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: IdsDto,
  ) {
    return this.questsService.detachAdventurers(id, body.ids);
  }

  @Patch(':id/adventurers/set')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 42, description: 'Quest ID' })
  @ApiBody({
    description: 'Replace all adventurers for quest',
    schema: {
      type: 'object',
      additionalProperties: true,
      example: { ids: [4, 5] },
    },
  })
  @ApiOkResponse({
    description: 'Adventurers set',
    schema: {
      type: 'object',
      additionalProperties: true,
      example: { id: 42, adventurerIds: [4, 5] },
    },
  })
  setAdventurers(@Param('id', ParseIntPipe) id: number, @Body() body: IdsDto) {
    return this.questsService.setAdventurers(id, body.ids);
  }

  @Patch(':id/equipment-stocks/attach')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 42, description: 'Quest ID' })
  @ApiBody({
    description: 'Attach equipment stocks to quest',
    schema: {
      type: 'object',
      additionalProperties: true,
      example: { ids: [3, 8] },
    },
  })
  @ApiOkResponse({
    description: 'Equipment stocks attached',
    schema: {
      type: 'object',
      additionalProperties: true,
      example: { id: 42, equipmentStockIds: [3, 8] },
    },
  })
  attachEquipment(@Param('id', ParseIntPipe) id: number, @Body() body: IdsDto) {
    return this.questsService.attachEquipmentStocks(id, body.ids);
  }

  @Patch(':id/equipment-stocks/detach')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 42, description: 'Quest ID' })
  @ApiBody({
    description: 'Detach equipment stocks from quest',
    schema: {
      type: 'object',
      additionalProperties: true,
      example: { ids: [3] },
    },
  })
  @ApiOkResponse({
    description: 'Equipment stocks detached',
    schema: {
      type: 'object',
      additionalProperties: true,
      example: { id: 42, equipmentStockIds: [8] },
    },
  })
  detachEquipment(@Param('id', ParseIntPipe) id: number, @Body() body: IdsDto) {
    return this.questsService.detachEquipmentStocks(id, body.ids);
  }

  @Patch(':id/equipment-stocks/set')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 42, description: 'Quest ID' })
  @ApiBody({
    description: 'Replace all equipment stocks for quest',
    schema: {
      type: 'object',
      additionalProperties: true,
      example: { ids: [9, 11] },
    },
  })
  @ApiOkResponse({
    description: 'Equipment stocks set',
    schema: {
      type: 'object',
      additionalProperties: true,
      example: { id: 42, equipmentStockIds: [9, 11] },
    },
  })
  setEquipment(@Param('id', ParseIntPipe) id: number, @Body() body: IdsDto) {
    return this.questsService.setEquipmentStocks(id, body.ids);
  }
}
