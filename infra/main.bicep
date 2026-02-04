// main.bicep - Infrastructure principale Azure pour Les Capuches d'Opale
// Architecture 3-tiers : Frontend (Container App) + Backend (Container App) + Database (Azure SQL)

targetScope = 'resourceGroup'

// ============================================================================
// PARAMETERS
// ============================================================================

@description('Nom du projet')
param projectName string = 'capuchesdopale'

@description('Environnement de déploiement')
@allowed(['dev', 'staging', 'prod'])
param environment string = 'dev'

@description('Localisation des ressources')
param location string = 'francecentral'

@description('Nom d\'utilisateur administrateur SQL')
@secure()
param sqlAdminUsername string

@description('Mot de passe administrateur SQL')
@secure()
param sqlAdminPassword string

@description('Secret JWT')
@secure()
param jwtSecret string

@description('Secret JWT Admin')
@secure()
param jwtSecretAdmin string

@description('Tag de l\'image Docker pour le backend')
param backendImageTag string = 'latest'

@description('Tag de l\'image Docker pour le frontend')
param frontendImageTag string = 'latest'

@description('URL du registre de conteneurs')
param containerRegistryUrl string

@description('Nom d\'utilisateur du registre de conteneurs')
@secure()
param containerRegistryUsername string

@description('Mot de passe du registre de conteneurs')
@secure()
param containerRegistryPassword string

// ============================================================================
// VARIABLES
// ============================================================================

var resourcePrefix = '${projectName}-${environment}'
var tags = {
  project: projectName
  environment: environment
  managedBy: 'bicep'
}

// ============================================================================
// MODULES
// ============================================================================

// Module Key Vault pour la gestion des secrets
module keyVault 'modules/keyvault.bicep' = {
  name: 'keyVault-deployment'
  params: {
    name: 'kv-${replace(resourcePrefix, '-', '')}${uniqueString(resourceGroup().id)}'
    location: location
    tags: tags
    sqlAdminUsername: sqlAdminUsername
    sqlAdminPassword: sqlAdminPassword
    jwtSecret: jwtSecret
    jwtSecretAdmin: jwtSecretAdmin
  }
}

// Module App Configuration pour la centralisation des paramètres
module appConfig 'modules/appconfig.bicep' = {
  name: 'appConfig-deployment'
  params: {
    name: 'appconfig-${resourcePrefix}'
    location: location
    tags: tags
    environment: environment
    keyVaultName: keyVault.outputs.keyVaultName
  }
}

// Module Storage Account pour le Blob Storage
module storage 'modules/storage.bicep' = {
  name: 'storage-deployment'
  params: {
    name: 'st${replace(resourcePrefix, '-', '')}'
    location: location
    tags: tags
  }
}

// Module Azure SQL Database
module sqlDatabase 'modules/sqldatabase.bicep' = {
  name: 'sqlDatabase-deployment'
  params: {
    serverName: 'sql-${resourcePrefix}'
    databaseName: 'guild-db'
    location: location
    tags: tags
    adminUsername: sqlAdminUsername
    adminPassword: sqlAdminPassword
  }
}

// Module Log Analytics pour la surveillance
module logAnalytics 'modules/loganalytics.bicep' = {
  name: 'logAnalytics-deployment'
  params: {
    name: 'log-${resourcePrefix}'
    location: location
    tags: tags
  }
}

// Module Container Apps Environment
module containerAppsEnv 'modules/container-apps-env.bicep' = {
  name: 'containerAppsEnv-deployment'
  params: {
    name: 'cae-${resourcePrefix}'
    location: location
    tags: tags
    logAnalyticsWorkspaceId: logAnalytics.outputs.workspaceId
  }
}

// Module Backend Container App
module backendApp 'modules/container-app-backend.bicep' = {
  name: 'backendApp-deployment'
  params: {
    name: 'ca-${resourcePrefix}-api'
    location: location
    tags: tags
    containerAppsEnvironmentId: containerAppsEnv.outputs.environmentId
    containerRegistryUrl: containerRegistryUrl
    containerRegistryUsername: containerRegistryUsername
    containerRegistryPassword: containerRegistryPassword
    imageTag: backendImageTag
    databaseConnectionString: sqlDatabase.outputs.connectionString
    jwtSecret: jwtSecret
    jwtSecretAdmin: jwtSecretAdmin
    storageConnectionString: storage.outputs.connectionString
    appConfigEndpoint: appConfig.outputs.endpoint
  }
}

// Module Frontend Container App
module frontendApp 'modules/container-app-frontend.bicep' = {
  name: 'frontendApp-deployment'
  params: {
    name: 'ca-${resourcePrefix}-web'
    location: location
    tags: tags
    containerAppsEnvironmentId: containerAppsEnv.outputs.environmentId
    containerRegistryUrl: containerRegistryUrl
    containerRegistryUsername: containerRegistryUsername
    containerRegistryPassword: containerRegistryPassword
    imageTag: frontendImageTag
    backendUrl: backendApp.outputs.fqdn
  }
}

// Module Azure Function App pour le logging
module functionApp 'modules/function-app.bicep' = {
  name: 'functionApp-deployment'
  params: {
    name: 'func-${resourcePrefix}'
    location: location
    tags: tags
    storageAccountName: storage.outputs.storageAccountName
    storageAccountKey: storage.outputs.storageAccountKey
    logAnalyticsWorkspaceId: logAnalytics.outputs.workspaceId
  }
}

// ============================================================================
// OUTPUTS
// ============================================================================

@description('URL du frontend')
output frontendUrl string = 'https://${frontendApp.outputs.fqdn}'

@description('URL du backend API')
output backendUrl string = 'https://${backendApp.outputs.fqdn}'

@description('URL de la Function App')
output functionAppUrl string = functionApp.outputs.functionAppUrl

@description('Endpoint App Configuration')
output appConfigEndpoint string = appConfig.outputs.endpoint

@description('Nom du Key Vault')
output keyVaultName string = keyVault.outputs.keyVaultName

@description('Nom du Storage Account')
output storageAccountName string = storage.outputs.storageAccountName

@description('Nom du serveur SQL')
output sqlServerName string = sqlDatabase.outputs.serverName
