// ============================================================================
// Main Bicep Template - Les Capuches d'Opale
// Architecture 3-tiers : Frontend Angular + Backend NestJS + Database + Storage
// Optimisé pour Azure for Students (France Central)
// ============================================================================

@description('Nom du projet (utilisé comme préfixe pour les ressources)')
param projectName string = 'capucheopale'

@description('Environnement de déploiement')
@allowed(['dev', 'prod'])
param environment string = 'dev'

@description('Région Azure - France Central pour Azure Student')
param location string = 'francecentral'

@description('Login administrateur SQL Server')
@secure()
param sqlAdminLogin string

@description('Mot de passe administrateur SQL Server')
@secure()
param sqlAdminPassword string

@description('Secret JWT pour l\'authentification')
@secure()
param jwtSecret string

// ============================================================================
// Variables
// ============================================================================
var resourcePrefix = '${projectName}-${environment}'
var resourcePrefixClean = replace(resourcePrefix, '-', '') // Pour Storage Account (pas de tirets)

var tags = {
  Project: 'LesCapuchesDOpale'
  Environment: environment
  ManagedBy: 'Bicep'
  DeployedAt: utcNow('yyyy-MM-dd')
}

// ============================================================================
// Modules
// ============================================================================

// Key Vault - Stockage sécurisé des secrets
module keyVault 'modules/keyvault.bicep' = {
  name: 'deploy-keyvault'
  params: {
    keyVaultName: 'kv-${resourcePrefix}'
    location: location
    tags: tags
  }
}

// Storage Account - Blob Storage pour les fichiers
module storage 'modules/storage.bicep' = {
  name: 'deploy-storage'
  params: {
    storageAccountName: 'st${resourcePrefixClean}'
    location: location
    tags: tags
  }
}

// SQL Database - Base de données Azure SQL
module database 'modules/database.bicep' = {
  name: 'deploy-database'
  params: {
    serverName: 'sql-${resourcePrefix}'
    databaseName: 'guilddb'
    location: location
    tags: tags
    administratorLogin: sqlAdminLogin
    administratorPassword: sqlAdminPassword
  }
}

// Web App - App Service pour héberger NestJS (Backend) et Angular (Frontend)
module webApp 'modules/webapp.bicep' = {
  name: 'deploy-webapp'
  params: {
    appServicePlanName: 'plan-${resourcePrefix}'
    backendAppName: 'api-${resourcePrefix}'
    frontendAppName: 'web-${resourcePrefix}'
    location: location
    tags: tags
    databaseConnectionString: database.outputs.connectionString
    storageConnectionString: storage.outputs.connectionString
    storageBlobEndpoint: storage.outputs.blobEndpoint
    jwtSecret: jwtSecret
    keyVaultUri: keyVault.outputs.keyVaultUri
  }
}

// Stocker les secrets dans Key Vault
module keyVaultSecrets 'modules/keyvault-secrets.bicep' = {
  name: 'deploy-keyvault-secrets'
  params: {
    keyVaultName: keyVault.outputs.keyVaultName
    secrets: [
      {
        name: 'SqlConnectionString'
        value: database.outputs.connectionString
      }
      {
        name: 'StorageConnectionString'
        value: storage.outputs.connectionString
      }
      {
        name: 'JwtSecret'
        value: jwtSecret
      }
    ]
  }
}

// ============================================================================
// Outputs - URLs et informations de déploiement
// ============================================================================
output frontendUrl string = webApp.outputs.frontendUrl
output backendUrl string = webApp.outputs.backendUrl
output sqlServerFqdn string = database.outputs.serverFqdn
output storageAccountName string = storage.outputs.storageAccountName
output keyVaultUri string = keyVault.outputs.keyVaultUri
