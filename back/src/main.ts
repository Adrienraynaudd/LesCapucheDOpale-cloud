import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerDocument = YAML.load(
    path.join(process.cwd(), 'docs', 'openapi.yaml'),
  );

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Server ready at http://localhost:${port}`);
}

void bootstrap();
