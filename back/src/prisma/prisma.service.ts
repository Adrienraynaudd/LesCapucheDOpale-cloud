import { Global, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Global()
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}

import { Module } from '@nestjs/common';
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
