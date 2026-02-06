@description('Nom du Key Vault')
param name string

@description('Localisation')
param location string

@description('Tags des ressources')
param tags object

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

// KEY VAULT

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: name
  location: location
  tags: tags
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enabledForDeployment: true
    enabledForDiskEncryption: true
    enabledForTemplateDeployment: true
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 7
    publicNetworkAccess: 'Enabled'
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
    }
  }
}


resource sqlAdminUsernameSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'sql-admin-username'
  properties: {
    value: sqlAdminUsername
    contentType: 'text/plain'
    attributes: {
      enabled: true
    }
  }
}

resource sqlAdminPasswordSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'sql-admin-password'
  properties: {
    value: sqlAdminPassword
    contentType: 'text/plain'
    attributes: {
      enabled: true
    }
  }
}

resource jwtSecretResource 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'jwt-secret'
  properties: {
    value: jwtSecret
    contentType: 'text/plain'
    attributes: {
      enabled: true
    }
  }
}

resource jwtSecretAdminResource 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'jwt-secret-admin'
  properties: {
    value: jwtSecretAdmin
    contentType: 'text/plain'
    attributes: {
      enabled: true
    }
  }
}


@description('Nom du Key Vault')
output keyVaultName string = keyVault.name

@description('URI du Key Vault')
output keyVaultUri string = keyVault.properties.vaultUri

@description('ID de la ressource Key Vault')
output keyVaultId string = keyVault.id
