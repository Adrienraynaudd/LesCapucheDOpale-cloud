import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users.module';
import { AdventurersModule } from "./modules/adventurers.module";
import { SpecialitiesModule } from "./modules/specialities.module";
import { EquipmentTypesModule } from "./modules/equipment-types.module";
import { ConsumableTypesModule } from "./modules/consumable-types.module";
import { PrismaModule } from './prisma/prisma.service';
import { AuthModule } from './modules/auth.module';

@Module({
  imports: [
      PrismaModule,
      AuthModule,
      UsersModule,
      AdventurersModule,
      SpecialitiesModule,
      EquipmentTypesModule,
      ConsumableTypesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
