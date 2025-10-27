import {Body, Controller, Param, ParseIntPipe, Patch, Post} from '@nestjs/common';
import { AdventurersService } from '../services/adventurers.service';
import { CreateAdventurerDto } from '../dto/create-adventurer.dto';
import { UpdateAdventurerDto } from '../dto/update-adventurer.dto';

@Controller('adventurers')
export class AdventurersController {
    constructor(private readonly adventurersService: AdventurersService) {}

    @Post()
    create(@Body() createAdventurerDto: CreateAdventurerDto) {
        return this.adventurersService.create(createAdventurerDto);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateAdventurerDto: UpdateAdventurerDto
    ) {
        return this.adventurersService.update(id, updateAdventurerDto);
    }
}
