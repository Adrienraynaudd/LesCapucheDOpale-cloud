// storage.bicep - Module Azure Storage Account pour le Blob Storage

@description('Nom du Storage Account (doit être unique globalement)')
param name string

@description('Localisation')
param location string

@description('Tags des ressources')
param tags object

// ============================================================================
// STORAGE ACCOUNT
// ============================================================================

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: name
  location: location
  tags: tags
  kind: 'StorageV2'
  sku: {
    name: 'Standard_LRS'
  }
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess: true
    allowSharedKeyAccess: true
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    encryption: {
      services: {
        blob: {
          enabled: true
          keyType: 'Account'
        }
        file: {
          enabled: true
          keyType: 'Account'
        }
        table: {
          enabled: true
          keyType: 'Account'
        }
        queue: {
          enabled: true
          keyType: 'Account'
        }
      }
      keySource: 'Microsoft.Storage'
    }
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
    }
  }
}

// ============================================================================
// BLOB SERVICES
// ============================================================================

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    cors: {
      corsRules: [
        {
          allowedHeaders: ['*']
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS']
          allowedOrigins: ['*']
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
// CONTAINERS
// ============================================================================

resource uploadsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobService
  name: 'uploads'
  properties: {
    publicAccess: 'Blob'
    metadata: {
      description: 'Container for user uploads'
    }
  }
}

resource avatarsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobService
  name: 'avatars'
  properties: {
    publicAccess: 'Blob'
    metadata: {
      description: 'Container for adventurer avatars'
    }
  }
}

resource documentsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobService
  name: 'documents'
  properties: {
    publicAccess: 'None'
    metadata: {
      description: 'Container for private documents'
    }
  }
}

resource questFilesContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobService
  name: 'quest-files'
  properties: {
    publicAccess: 'None'
    metadata: {
      description: 'Container for quest-related files'
    }
  }
}

// ============================================================================
// TABLE SERVICES (pour les logs Azure Function)
// ============================================================================

resource tableService 'Microsoft.Storage/storageAccounts/tableServices@2023-01-01' = {
  parent: storageAccount
  name: 'default'
  properties: {}
}

resource logsTable 'Microsoft.Storage/storageAccounts/tableServices/tables@2023-01-01' = {
  parent: tableService
  name: 'ApplicationLogs'
  properties: {}
}

// ============================================================================
// OUTPUTS
// ============================================================================

@description('Nom du Storage Account')
output storageAccountName string = storageAccount.name

@description('ID du Storage Account')
output storageAccountId string = storageAccount.id

@description('Endpoint du Blob Storage')
output blobEndpoint string = storageAccount.properties.primaryEndpoints.blob

@description('Endpoint du Table Storage')
output tableEndpoint string = storageAccount.properties.primaryEndpoints.table

#disable-next-line outputs-should-not-contain-secrets
@description('Chaîne de connexion du Storage Account')
output connectionString string = 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=${environment().suffixes.storage}'

#disable-next-line outputs-should-not-contain-secrets
@description('Clé du Storage Account')
output storageAccountKey string = storageAccount.listKeys().keys[0].value
