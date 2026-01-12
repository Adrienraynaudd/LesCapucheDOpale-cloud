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
import { IdsDto } from '../dto/ids.dto';
import { UserDto } from 'src/dto/user.dto';
import { ValidateQuestDto } from '../dto/validate-quest.dto';
import { FinishQuestDto } from '../dto/finish-quest.dto';
import { QuestConsumablesDto } from '../dto/quest-consumable.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FindQuestsQueryDto } from '../dto/find-quests-query.dto';

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
    description: 'List of quests (avec filtres et tri)',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'Rescue the Merchant' },
          description: { type: 'string', example: 'Escort mission' },
          finalDate: {
            type: 'string',
            format: 'date-time',
            example: '2025-12-31T23:59:59.000Z',
          },
          reward: { type: 'number', example: 500 },
          estimatedDuration: { type: 'number', example: 5 },
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
  findAll(@Query() query: FindQuestsQueryDto) {
    return this.questsService.findAll(query);
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
        name: 'Rescue the Merchant',
        description: 'Escort the merchant safely to the city.',
        finalDate: '2025-12-31T23:59:59.000Z',
        reward: 500,
        estimatedDuration: 5,
        adventurerIds: [1, 2],
        equipmentStockIds: [10, 11],
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
        name: 'Rescue the Merchant',
        description: 'Escort the merchant safely to the city.',
        finalDate: '2025-12-31T23:59:59.000Z',
        reward: 500,
        estimatedDuration: 5,
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
        name: 'Rescue the Merchant (Hard)',
        description: 'Hard mode variant.',
        reward: 750,
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
        name: 'Rescue the Merchant (Hard)',
        description: 'Hard mode variant.',
        reward: 750,
        statusId: 1,
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

  @Patch(':id/finish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 42, description: 'Quest ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isSuccess: {
          type: 'boolean',
          example: true,
          description: 'true = succès (XP + 80% récompense), false = échec (40% salaires uniquement)',
        },
      },
      example: { isSuccess: true },
    },
  })
  @ApiOkResponse({
   schema: {
      type: 'object',
      additionalProperties: true,
      example: {
        id: 42,
        name: 'Quête du Dragon',
        statusId: 7,
        startDate: '2026-01-01T10:00:00.000Z',
        adventurers: [
          {
            id: 1,
            name: 'Aria',
            experience: 80,
            dailyRate: 50,
            availableUntil: '2026-01-15T10:00:00.000Z',
          },
        ],
        questStockEquipments: [
          {
            equipmentStock: {
              id: 10,
              durability: 8,
              statusId: 1,
            },
          },
        ],
        totalCost: 600,
      },
    },
  })
  finish(@Param('id', ParseIntPipe) id: number, @Body() dto: FinishQuestDto) {
    return this.questsService.finishQuest(id, dto.isSuccess);
  }

  @Patch(':id/refuse')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 42, description: 'Quest ID' })
  @ApiBody({
    description: 'Aucun body requis',
    required: false,
    schema: {
      type: 'object',
      properties: {},
    },
  })
  @ApiOkResponse({
    description: 'Quête refusée',
    schema: {
      type: 'object',
      additionalProperties: true,
      example: {
        id: 42,
        statusId: 4,
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
  @ApiBody({
    description: 'Aucun body requis',
    required: false,
    schema: {
      type: 'object',
      properties: {},
    },
  })
  @ApiOkResponse({
    description:
      "Quête abandonnée (peut être abandonnée uniquement si elle n'est pas validée ou commencée, typiquement en statut 'en attente')",
    schema: {
      type: 'object',
      additionalProperties: true,
      example: {
        id: 42,
        statusId: 5,
        updatedAt: '2025-10-30T13:35:00.000Z',
      },
    },
  })
  abandon(@Param('id', ParseIntPipe) id: number) {
    return this.questsService.abandonQuest(id);
  }

  // ================== CONSUMABLES MANAGEMENT ==================

  @Patch(':id/consumables/attach')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 42, description: 'Quest ID' })
  @ApiBody({
    description:
      'Liste des consommables à attacher avec leurs quantités. Si le consommable est déjà dans la quête, la quantité est ajoutée.',
    schema: {
      type: 'object',
      properties: {
        consumables: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              consumableId: { type: 'number', example: 1 },
              quantity: { type: 'number', example: 5 },
            },
          },
        },
      },
      example: {
        consumables: [
          { consumableId: 1, quantity: 5 },
          { consumableId: 2, quantity: 3 },
        ],
      },
    },
  })
  @ApiOkResponse({
    description: 'Consommables attachés à la quête',
    schema: {
      type: 'object',
      additionalProperties: true,
      example: {
        id: 42,
        name: 'Quête du Dragon',
        questConsumables: [
          { consumableId: 1, quantity: 5 },
          { consumableId: 2, quantity: 3 },
        ],
      },
    },
  })
  attachConsumables(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: QuestConsumablesDto,
  ) {
    return this.questsService.attachConsumables(id, dto.consumables);
  }

  @Patch(':id/consumables/detach')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 42, description: 'Quest ID' })
  @ApiBody({
    description:
      'Liste des consommables à détacher avec leurs quantités. Si la quantité résultante <= 0, le consommable est complètement retiré.',
    schema: {
      type: 'object',
      properties: {
        consumables: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              consumableId: { type: 'number', example: 1 },
              quantity: { type: 'number', example: 2 },
            },
          },
        },
      },
      example: {
        consumables: [
          { consumableId: 1, quantity: 2 },
          { consumableId: 2, quantity: 3 },
        ],
      },
    },
  })
  @ApiOkResponse({
    description: 'Consommables détachés de la quête',
    schema: {
      type: 'object',
      additionalProperties: true,
      example: {
        id: 42,
        name: 'Quête du Dragon',
        questConsumables: [{ consumableId: 1, quantity: 3 }],
      },
    },
  })
  detachConsumables(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: QuestConsumablesDto,
  ) {
    return this.questsService.detachConsumables(id, dto.consumables);
  }

  @Patch(':id/consumables/set')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 42, description: 'Quest ID' })
  @ApiBody({
    description:
      'Remplace tous les consommables de la quête par cette nouvelle liste',
    schema: {
      type: 'object',
      properties: {
        consumables: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              consumableId: { type: 'number', example: 3 },
              quantity: { type: 'number', example: 10 },
            },
          },
        },
      },
      example: {
        consumables: [{ consumableId: 3, quantity: 10 }],
      },
    },
  })
  @ApiOkResponse({
    description: 'Consommables de la quête mis à jour',
    schema: {
      type: 'object',
      additionalProperties: true,
      example: {
        id: 42,
        name: 'Quête du Dragon',
        questConsumables: [{ consumableId: 3, quantity: 10 }],
      },
    },
  })
  setConsumables(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: QuestConsumablesDto,
  ) {
    return this.questsService.setConsumables(id, dto.consumables);
  }
}
