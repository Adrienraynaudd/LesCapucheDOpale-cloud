// ============================================================================
// Azure Storage Account Module - Blob Storage
// Optimisé pour Azure for Students
// ============================================================================

@description('Nom du compte de stockage (3-24 caractères, minuscules et chiffres uniquement)')
param storageAccountName string

@description('Région Azure')
param location string

@description('Tags des ressources')
param tags object

// ============================================================================
// Storage Account
// ============================================================================
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  tags: tags
  kind: 'StorageV2'
  sku: {
    name: 'Standard_LRS'    // Le moins cher - stockage local uniquement
  }
  properties: {
    accessTier: 'Hot'
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    allowSharedKeyAccess: true
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
    }
  }
}

// ============================================================================
// Blob Service
// ============================================================================
resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    cors: {
      corsRules: [
        {
          allowedOrigins: ['*']
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
          allowedHeaders: ['*']
          exposedHeaders: ['*']
          maxAgeInSeconds: 3600
        }
      ]
    }
    deleteRetentionPolicy: {
      enabled: true
      days: 7
    }
  }
}

// ============================================================================
// Blob Containers
// ============================================================================

// Container pour les uploads généraux
resource uploadsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobService
  name: 'uploads'
  properties: {
    publicAccess: 'None'
  }
}

// Container pour les documents de quêtes
resource questsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobService
  name: 'quest-documents'
  properties: {
    publicAccess: 'None'
  }
}

// Container pour les profils d'aventuriers
resource adventurersContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobService
  name: 'adventurer-profiles'
  properties: {
    publicAccess: 'None'
  }
}

// ============================================================================
// Outputs
// ============================================================================
output storageAccountId string = storageAccount.id
output storageAccountName string = storageAccount.name
output blobEndpoint string = storageAccount.properties.primaryEndpoints.blob

// Note: La connection string est construite dans le module webapp via listKeys()
