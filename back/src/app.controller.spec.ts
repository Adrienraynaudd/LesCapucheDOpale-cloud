import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;

  const mockPrismaService = {
    isDatabaseConnected: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status when database is connected', () => {
      mockPrismaService.isDatabaseConnected.mockReturnValue(true);
      const result = appController.healthCheck();
      
      expect(result.status).toBe('healthy');
      expect(result.service).toBe('capuchesdopale-api');
      expect(result.database.connected).toBe(true);
      expect(result.database.status).toBe('connected');
    });

    it('should return degraded status when database is disconnected', () => {
      mockPrismaService.isDatabaseConnected.mockReturnValue(false);
      const result = appController.healthCheck();
      
      expect(result.status).toBe('degraded');
      expect(result.database.connected).toBe(false);
      expect(result.database.status).toBe('disconnected');
    });
  });
});
