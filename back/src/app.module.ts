import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users.module';
import { AdventurersModule } from './modules/adventurers.module';
import { SpecialitiesModule } from './modules/specialities.module';
import { EquipmentTypesModule } from './modules/equipment-types.module';
import { ConsumablesModule } from './modules/consumables.module';
import { ConsumableTypesModule } from './modules/consumable-types.module';
import { PrismaModule } from './prisma/prisma.service';
import { QuestsModule } from './modules/quests.module';
import { EquipmentModule } from './modules/equipment.module';
import { EquipmentStocksModule } from './modules/equipment-stocks.module';
import { QuestStockEquipmentModule } from './modules/quest-stock-equipment.module';
import { StatusesModule } from './modules/statuses.module';
import { AuthModule } from './modules/auth.module';
import { RolesModule } from './modules/roles.module';
import { FinancesModule } from './modules/finances.module';
import { AdventurerAvailabilityModule } from './modules/adventurer-availability.module';
import { UploadModule } from './modules/upload.module';
import { AzureKeyVaultModule } from './modules/azure-keyvault.module';
import { RemoteLoggerService } from './services/remote-logger.service';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

@Module({
  imports: [
    PrismaModule,
    AzureKeyVaultModule,
    AuthModule,
    UsersModule,
    QuestsModule,
    AdventurersModule,
    SpecialitiesModule,
    EquipmentTypesModule,
    ConsumablesModule,
    ConsumableTypesModule,
    EquipmentModule,
    EquipmentStocksModule,
    QuestStockEquipmentModule,
    StatusesModule,
    RolesModule,
    FinancesModule,
    AdventurerAvailabilityModule,
    UploadModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RemoteLoggerService,
    {
      provide: 'LoggerService',
      useExisting: RemoteLoggerService,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
  exports: [RemoteLoggerService],
})
export class AppModule {}
