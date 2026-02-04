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

@description('Date de déploiement (générée automatiquement)')
param deploymentDate string = utcNow('yyyy-MM-dd')

// ============================================================================
// Variables
// ============================================================================
var resourcePrefix = '${projectName}-${environment}'
var resourcePrefixClean = replace(resourcePrefix, '-', '') // Pour Storage Account (pas de tirets)

var tags = {
  Project: 'LesCapuchesDOpale'
  Environment: environment
  ManagedBy: 'Bicep'
  DeployedAt: deploymentDate
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

// Variables pour les connection strings (construites ici pour éviter les secrets dans les outputs)
var sqlConnectionString = 'Server=tcp:${database.outputs.serverFqdn},1433;Initial Catalog=${database.outputs.databaseName};Persist Security Info=False;User ID=${sqlAdminLogin};Password=${sqlAdminPassword};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;'

// Web App - App Service pour héberger NestJS (Backend) et Angular (Frontend)
module webApp 'modules/webapp.bicep' = {
  name: 'deploy-webapp'
  params: {
    appServicePlanName: 'plan-${resourcePrefix}'
    backendAppName: 'api-${resourcePrefix}'
    frontendAppName: 'web-${resourcePrefix}'
    location: location
    tags: tags
    databaseConnectionString: sqlConnectionString
    storageAccountName: storage.outputs.storageAccountName
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
        value: sqlConnectionString
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
