import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiTags('Health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  healthCheck(): { 
    status: string; 
    timestamp: string; 
    service: string; 
    database: { connected: boolean; status: string };
  } {
    const dbConnected = this.prisma.isDatabaseConnected();
    return {
      status: dbConnected ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'capuchesdopale-api',
      database: {
        connected: dbConnected,
        status: dbConnected ? 'connected' : 'disconnected',
      },
    };
  }

  @Get('health/db')
  @ApiTags('Health')
  @ApiOperation({ summary: 'Database ping endpoint' })
  @ApiResponse({ status: 200, description: 'Database ping result' })
  async pingDatabase(): Promise<{
    success: boolean;
    latency?: number;
    error?: string;
    connectionString?: string;
  }> {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1 as ping`;
      return {
        success: true,
        latency: Date.now() - start,
        connectionString: this.maskConnectionString(process.env.DATABASE_URL),
      };
    } catch (error) {
      return {
        success: false,
        latency: Date.now() - start,
        error: error instanceof Error ? error.message : String(error),
        connectionString: this.maskConnectionString(process.env.DATABASE_URL),
      };
    }
  }

  private maskConnectionString(connectionString?: string): string {
    if (!connectionString) return 'NOT_SET';
    return connectionString.replace(/password=[^;]+/gi, 'password=***');
  }
}
