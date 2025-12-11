import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
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
import { ValidateQuestDto } from '../dto/validate-quest.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

export interface AuthenticatedRequest extends Request {
  user: UserDto & { sub: number };
}

// Interface pour typer les Query Params entrant (toujours des strings ou undefined)
interface FindQuestsQueryDto {
  rewardMin?: string;
  rewardMax?: string;
  statusId?: string;
  statusName?: string;
  finalDateBefore?: string;
  finalDateAfter?: string;
  userId?: string;
  avgXpMin?: string;
  avgXpMax?: string;
  sortBy?: 'reward' | 'finalDate' | 'avgExperience' | 'createdAt';
  order?: 'asc' | 'desc';
}

@ApiTags('Quests')
@ApiBearerAuth()
@Controller('quests')
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiQuery({
    name: 'rewardMin',
    required: false,
    description: 'Prime minimale (incluse)',
    example: 100,
    type: Number,
  })
  @ApiQuery({
    name: 'rewardMax',
    required: false,
    description: 'Prime maximale (incluse)',
    example: 1000,
    type: Number,
  })
  @ApiQuery({
    name: 'statusId',
    required: false,
    description: 'Filtrer par identifiant de statut',
    example: 2,
    type: Number,
  })
  @ApiQuery({
    name: 'statusName',
    required: false,
    description: 'Filtrer par nom de statut (ex: validée, commencée)',
    example: 'validée',
    type: String,
  })
  @ApiQuery({
    name: 'finalDateBefore',
    required: false,
    description: "Date d'échéance avant (ISO 8601)",
    example: '2025-12-31',
    type: String,
  })
  @ApiQuery({
    name: 'finalDateAfter',
    required: false,
    description: "Date d'échéance après (ISO 8601)",
    example: '2025-01-01',
    type: String,
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filtrer par commanditaire (ID utilisateur)',
    example: 5,
    type: Number,
  })
  @ApiQuery({
    name: 'avgXpMin',
    required: false,
    description: "Niveau d'expérience moyen minimal des aventuriers",
    example: 10,
    type: Number,
  })
  @ApiQuery({
    name: 'avgXpMax',
    required: false,
    description: "Niveau d'expérience moyen maximal des aventuriers",
    example: 100,
    type: Number,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Champ de tri',
    enum: ['reward', 'finalDate', 'avgExperience', 'createdAt'],
    example: 'reward',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    description: 'Ordre de tri',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @ApiOkResponse({
    description: 'List of quests (avec filtres et tri)',
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
  findAll(@Query() q: FindQuestsQueryDto) {
    const validSortFields = [
      'reward',
      'finalDate',
      'avgExperience',
      'createdAt',
    ] as const;

    return this.questsService.findAll({
      rewardMin: q.rewardMin ? Number(q.rewardMin) : undefined,
      rewardMax: q.rewardMax ? Number(q.rewardMax) : undefined,
      statusId: q.statusId ? Number(q.statusId) : undefined,
      statusName: q.statusName,
      finalDateBefore: q.finalDateBefore,
      finalDateAfter: q.finalDateAfter,
      userId: q.userId ? Number(q.userId) : undefined,
      avgXpMin: q.avgXpMin ? Number(q.avgXpMin) : undefined,
      avgXpMax: q.avgXpMax ? Number(q.avgXpMax) : undefined,
      sortBy:
        q.sortBy && validSortFields.includes(q.sortBy) ? q.sortBy : undefined,
      order: q.order === 'asc' || q.order === 'desc' ? q.order : undefined,
    });
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

  @Patch(':id/validate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 42, description: 'Quest ID' })
  @ApiBody({
    description: "Valider la quête et définir l'XP recommandée",
    required: true,
    schema: {
      type: 'object',
      additionalProperties: true,
      example: { xp: 150 },
    },
  })
  @ApiOkResponse({
    description: 'Quête validée',
    schema: {
      type: 'object',
      additionalProperties: true,
      example: {
        id: 42,
        recommendedXP: 150,
        statusId: 2,
        updatedAt: '2025-10-30T13:15:00.000Z',
      },
    },
  })
  validate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ValidateQuestDto,
  ) {
    return this.questsService.validateQuest(id, dto.xp);
  }

  @Patch(':id/invalidate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 42, description: 'Quest ID' })
  @ApiOkResponse({
    description:
      'Quête dévalidée (retour en attente, XP remise à 0, aventuriers/équipements/consommables vidés)',
    schema: {
      type: 'object',
      additionalProperties: true,
      example: {
        id: 42,
        recommendedXP: 0,
        statusId: 1,
        adventurerIds: [],
        equipmentStockIds: [],
        updatedAt: '2025-10-30T13:20:00.000Z',
      },
    },
  })
  invalidate(@Param('id', ParseIntPipe) id: number) {
    return this.questsService.invalidateQuest(id);
  }

  @Patch(':id/start')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 42, description: 'Quest ID' })
  @ApiOkResponse({
    description: 'Quête démarrée (désélection impossible après démarrage)',
    schema: {
      type: 'object',
      additionalProperties: true,
      example: {
        id: 42,
        statusId: 3,
        updatedAt: '2025-10-30T13:25:00.000Z',
      },
    },
  })
  start(@Param('id', ParseIntPipe) id: number) {
    return this.questsService.startQuest(id);
  }

  @Patch(':id/refuse')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 42, description: 'Quest ID' })
  @ApiOkResponse({
    description: 'Quête refusée',
    schema: {
      type: 'object',
      additionalProperties: true,
      example: {
        id: 42,
        status: { name: 'refusée' },
        updatedAt: '2025-10-30T13:30:00.000Z',
      },
    },
  })
  refuse(@Param('id', ParseIntPipe) id: number) {
    return this.questsService.refuseQuest(id);
  }

  @Patch(':id/abandon')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 42, description: 'Quest ID' })
  @ApiOkResponse({
    description:
      "Quête abandonnée (peut être abandonnée uniquement si elle n'est pas validée ou commencée, typiquement en statut 'en attente')",
    schema: {
      type: 'object',
      additionalProperties: true,
      example: {
        id: 42,
        status: { name: 'abandonnée' },
        updatedAt: '2025-10-30T13:35:00.000Z',
      },
    },
  })
  abandon(@Param('id', ParseIntPipe) id: number) {
    return this.questsService.abandonQuest(id);
  }
}
