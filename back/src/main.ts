import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { dump as yamlDump } from 'js-yaml';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  const config = new DocumentBuilder()
    .setTitle('API "Les kips AH"')
    .setDescription(
      'This is the API information regarding the project "Les capuches d\'Opale".\n\nC\'est un outil de gestion d\'aventurier pour une guilde.',
    )
    .setVersion('1.0.0')
    .setTermsOfService('https://swagger.io/terms/')
    .setLicense('Apache 2.0', 'https://www.apache.org/licenses/LICENSE-2.0.html')
    .addBearerAuth()
    .build();

  const rawDocument = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });

  const document = (() => {
    const d = JSON.parse(JSON.stringify(rawDocument));
    if (d.components?.schemas) {
      delete d.components.schemas;
      if (Object.keys(d.components).length === 0) {
        delete d.components;
      }
    }
    return d;
  })();

  SwaggerModule.setup('docs', app, document);

  try {
    const docsDir = join(process.cwd(), 'docs');
    mkdirSync(docsDir, { recursive: true });
    const yaml = yamlDump(document, { noRefs: true, skipInvalid: true });
    writeFileSync(join(docsDir, 'openapi.yaml'), yaml, 'utf8');
    console.log('✅ OpenAPI écrit dans docs/openapi.yaml');
  } catch (e) {
    console.error('Erreur écriture OpenAPI:', e);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`🚀 Server ready at http://localhost:${port}`);
  console.log(`📚 Swagger UI: http://localhost:${port}/docs`);
}

void bootstrap();
