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

export interface AuthenticatedRequest extends Request {
  user: UserDto & { sub: number };
}
@Controller('quests')
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  findAll() {
    return this.questsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.questsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateQuestDto) {
    const userId = req.user.sub;
    return this.questsService.create(userId, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateQuestDto) {
    return this.questsService.update(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.questsService.updateStatus(id, dto);
  }

  @Patch(':id/adventurers/attach')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  attachAdventurers(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: IdsDto,
  ) {
    return this.questsService.attachAdventurers(id, body.ids);
  }

  @Patch(':id/adventurers/detach')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  detachAdventurers(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: IdsDto,
  ) {
    return this.questsService.detachAdventurers(id, body.ids);
  }

  @Patch(':id/adventurers/set')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  setAdventurers(@Param('id', ParseIntPipe) id: number, @Body() body: IdsDto) {
    return this.questsService.setAdventurers(id, body.ids);
  }

  @Patch(':id/equipment-stocks/attach')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  attachEquipment(@Param('id', ParseIntPipe) id: number, @Body() body: IdsDto) {
    return this.questsService.attachEquipmentStocks(id, body.ids);
  }

  @Patch(':id/equipment-stocks/detach')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  detachEquipment(@Param('id', ParseIntPipe) id: number, @Body() body: IdsDto) {
    return this.questsService.detachEquipmentStocks(id, body.ids);
  }

  @Patch(':id/equipment-stocks/set')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  setEquipment(@Param('id', ParseIntPipe) id: number, @Body() body: IdsDto) {
    return this.questsService.setEquipmentStocks(id, body.ids);
  }
}
