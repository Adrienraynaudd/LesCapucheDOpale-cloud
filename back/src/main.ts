import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { dump as yamlDump } from 'js-yaml';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
// GlobalExceptionFilter is now registered via APP_FILTER in AppModule

async function loadKeyVaultSecrets(): Promise<void> {
  const logger = new Logger('KeyVault');
  const vaultUrl = process.env.AZURE_KEYVAULT_URI;

  if (!vaultUrl) {
    logger.warn('AZURE_KEYVAULT_URI not set - skipping Key Vault initialization');
    return;
  }

  try {
    logger.log(`Connecting to Key Vault: ${vaultUrl}`);
    const credential = new DefaultAzureCredential();
    const client = new SecretClient(vaultUrl, credential);

    const secretMappings: Record<string, string> = {
      'SqlConnectionString': 'DATABASE_URL',
      'JwtSecret': 'JWT_SECRET',
      'StorageConnectionString': 'AZURE_STORAGE_CONNECTION_STRING',
    };

    for (const [secretName, envVarName] of Object.entries(secretMappings)) {
      try {
        if (!process.env[envVarName]) {
          const secret = await client.getSecret(secretName);
          if (secret.value) {
            process.env[envVarName] = secret.value;
            logger.log(`Loaded secret: ${secretName} -> ${envVarName}`);
          }
        }
      } catch (error) {
        logger.warn(`Could not load secret ${secretName}: ${error}`);
      }
    }

    logger.log('Key Vault secrets loaded successfully');
  } catch (error) {
    logger.error('Failed to initialize Key Vault:', error);
  }
}

async function bootstrap() {
  await loadKeyVaultSecrets();

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

  // GlobalExceptionFilter is registered via APP_FILTER in AppModule for dependency injection

  app.enableCors();

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`🚀 Server ready at http://localhost:${port}`);
  console.log(`📚 Swagger UI: http://localhost:${port}/docs`);
}

// Global error handlers to prevent crashes
const logger = new Logger('Bootstrap');

process.on('uncaughtException', (error: Error) => {
  logger.error(`Uncaught Exception: ${error.message}`, error.stack);
  // Don't exit - keep the server running
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error(`Unhandled Rejection: ${reason}`);
  // Don't exit - keep the server running
});

void bootstrap().catch((error) => {
  logger.error('Failed to start application:', error);
  // Exit only if bootstrap fails completely
  process.exit(1);
});
