import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users.module';
import { AdventurersModule } from "./modules/adventurers.module";
import { SpecialtiesModule } from "./modules/specialties.module";
import { EquipmentTypesModule } from "./modules/equipment-types.module";
import { ConsumableTypesModule } from "./modules/consumable-types.module";
import { PrismaModule } from './prisma/prisma.service';

@Module({
  imports: [
      PrismaModule,
      UsersModule,
      AdventurersModule,
      SpecialtiesModule,
      EquipmentTypesModule,
      ConsumableTypesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
