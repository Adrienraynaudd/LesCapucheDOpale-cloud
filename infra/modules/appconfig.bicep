// appconfig.bicep - Module Azure App Configuration pour la centralisation des paramètres

@description('Nom de l\'App Configuration')
param name string

@description('Localisation')
param location string

@description('Tags des ressources')
param tags object

@description('Environnement')
param environment string

@description('Nom du Key Vault associé')
param keyVaultName string

// ============================================================================
// APP CONFIGURATION
// ============================================================================

resource appConfiguration 'Microsoft.AppConfiguration/configurationStores@2023-03-01' = {
  name: name
  location: location
  tags: tags
  sku: {
    name: 'free'
  }
  properties: {
    publicNetworkAccess: 'Enabled'
    disableLocalAuth: false
  }
}

// ============================================================================
// KEY-VALUES (Configuration Settings)
// ============================================================================

// Configuration de l'environnement
resource envConfig 'Microsoft.AppConfiguration/configurationStores/keyValues@2023-03-01' = {
  parent: appConfiguration
  name: 'App:Environment'
  properties: {
    value: environment
    contentType: 'text/plain'
  }
}

// Configuration des uploads
resource maxFileSizeConfig 'Microsoft.AppConfiguration/configurationStores/keyValues@2023-03-01' = {
  parent: appConfiguration
  name: 'App:Upload:MaxFileSizeMB'
  properties: {
    value: '10'
    contentType: 'text/plain'
  }
}

resource allowedExtensionsConfig 'Microsoft.AppConfiguration/configurationStores/keyValues@2023-03-01' = {
  parent: appConfiguration
  name: 'App:Upload:AllowedExtensions'
  properties: {
    value: '.jpg,.jpeg,.png,.gif,.webp,.pdf,.json,.txt,.csv'
    contentType: 'text/plain'
  }
}

// Configuration JWT
resource jwtExpirationConfig 'Microsoft.AppConfiguration/configurationStores/keyValues@2023-03-01' = {
  parent: appConfiguration
  name: 'App:Auth:JwtExpirationHours'
  properties: {
    value: '24'
    contentType: 'text/plain'
  }
}

// Feature Flags
resource featureLoggingEnabled 'Microsoft.AppConfiguration/configurationStores/keyValues@2023-03-01' = {
  parent: appConfiguration
  name: '.appconfig.featureflag~2FLoggingEnabled'
  properties: {
    value: '{"id":"LoggingEnabled","description":"Enable Azure Function logging","enabled":true}'
    contentType: 'application/vnd.microsoft.appconfig.ff+json;charset=utf-8'
  }
}

resource featureMaintenanceMode 'Microsoft.AppConfiguration/configurationStores/keyValues@2023-03-01' = {
  parent: appConfiguration
  name: '.appconfig.featureflag~2FMaintenanceMode'
  properties: {
    value: '{"id":"MaintenanceMode","description":"Enable maintenance mode","enabled":false}'
    contentType: 'application/vnd.microsoft.appconfig.ff+json;charset=utf-8'
  }
}

resource featureNewQuestSystem 'Microsoft.AppConfiguration/configurationStores/keyValues@2023-03-01' = {
  parent: appConfiguration
  name: '.appconfig.featureflag~2FNewQuestSystem'
  properties: {
    value: '{"id":"NewQuestSystem","description":"Enable new quest management system","enabled":${environment == 'dev' ? 'true' : 'false'}}'
    contentType: 'application/vnd.microsoft.appconfig.ff+json;charset=utf-8'
  }
}

// Référence au Key Vault
resource keyVaultReference 'Microsoft.AppConfiguration/configurationStores/keyValues@2023-03-01' = {
  parent: appConfiguration
  name: 'App:KeyVault:Name'
  properties: {
    value: keyVaultName
    contentType: 'text/plain'
  }
}

// ============================================================================
// OUTPUTS
// ============================================================================

@description('Endpoint de l\'App Configuration')
output endpoint string = appConfiguration.properties.endpoint

@description('Nom de l\'App Configuration')
output name string = appConfiguration.name

@description('ID de la ressource App Configuration')
output id string = appConfiguration.id
