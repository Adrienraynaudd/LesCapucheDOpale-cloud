// ============================================================================
// Azure App Service Module - Web Apps pour Backend et Frontend
// Optimisé pour Azure for Students
// Note: B1 (Basic) permet plusieurs sites par plan (~13€/mois, couvert par crédits Student)
// ============================================================================

@description('Nom du App Service Plan')
param appServicePlanName string

@description('Nom de l\'application backend (NestJS)')
param backendAppName string

@description('Nom de l\'application frontend (Angular)')
param frontendAppName string

@description('Région Azure')
param location string

@description('Tags des ressources')
param tags object

@description('Connection string vers la base de données')
@secure()
param databaseConnectionString string

@description('Nom du Storage Account')
param storageAccountName string

@description('Endpoint Blob Storage')
param storageBlobEndpoint string

@description('Secret JWT')
@secure()
param jwtSecret string

@description('URI du Key Vault')
param keyVaultUri string

// ============================================================================
// App Service Plan (Linux) - B1 Basic pour Azure Student
// B1 permet plusieurs sites et always-on (~13€/mois)
// ============================================================================
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: appServicePlanName
  location: location
  tags: tags
  kind: 'linux'
  sku: {
    name: 'B1'      // Basic - permet plusieurs sites
    tier: 'Basic'
  }
  properties: {
    reserved: true  // Required for Linux
  }
}

// ============================================================================
// Backend App Service (NestJS API)
// ============================================================================
resource backendApp 'Microsoft.Web/sites@2023-01-01' = {
  name: backendAppName
  location: location
  tags: tags
  kind: 'app,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      alwaysOn: false           // Requis pour tier Free F1
      http20Enabled: true
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      appCommandLine: 'node dist/src/main.js'
      appSettings: [
        {
          name: 'NODE_ENV'
          value: 'production'
        }
        {
          name: 'DATABASE_URL'
          value: databaseConnectionString
        }
        {
          name: 'JWT_SECRET'
          value: jwtSecret
        }
        {
          name: 'AZURE_STORAGE_ACCOUNT_NAME'
          value: storageAccountName
        }
        {
          name: 'AZURE_STORAGE_BLOB_ENDPOINT'
          value: storageBlobEndpoint
        }
        {
          name: 'AZURE_KEYVAULT_URI'
          value: keyVaultUri
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'false'
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1'
        }
      ]
      cors: {
        allowedOrigins: [
          'https://${frontendAppName}.azurewebsites.net'
          'http://localhost:4200'
        ]
        supportCredentials: true
      }
    }
  }
}

// ============================================================================
// Frontend App Service (Angular)
// ============================================================================
resource frontendApp 'Microsoft.Web/sites@2023-01-01' = {
  name: frontendAppName
  location: location
  tags: tags
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      alwaysOn: false           // Requis pour tier Free F1
      http20Enabled: true
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      appCommandLine: 'pm2 serve /home/site/wwwroot --no-daemon --spa'
      appSettings: [
        {
          name: 'API_URL'
          value: 'https://${backendAppName}.azurewebsites.net'
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'false'
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1'
        }
      ]
    }
  }
}

// ============================================================================
// Outputs
// ============================================================================
output backendUrl string = 'https://${backendApp.properties.defaultHostName}'
output frontendUrl string = 'https://${frontendApp.properties.defaultHostName}'
output backendAppName string = backendApp.name
output frontendAppName string = frontendApp.name
output backendPrincipalId string = backendApp.identity.principalId
