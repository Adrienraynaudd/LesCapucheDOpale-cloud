import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SpecialitiesService } from '../services/specialities.service';
import { CreateSpecialityDto } from '../dto/create-speciality.dto';
import { UpdateSpecialityDto } from '../dto/update-speciality.dto';

@Controller('specialities')
export class SpecialitiesController {
  constructor(private readonly specialitiesService: SpecialitiesService) {}

  @Post()
  create(@Body() dto: CreateSpecialityDto) {
    return this.specialitiesService.create(dto);
  }

  @Get()
  findAll() {
    return this.specialitiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.specialitiesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateSpecialityDto) {
    return this.specialitiesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.specialitiesService.delete(id);
  }
}
