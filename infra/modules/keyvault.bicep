// ============================================================================
// Azure Key Vault Module
// Stockage sécurisé des secrets
// ============================================================================

@description('Nom du Key Vault')
param keyVaultName string

@description('Région Azure')
param location string

@description('Tags des ressources')
param tags object

// ============================================================================
// Key Vault
// ============================================================================
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  tags: tags
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true       // Utiliser RBAC au lieu des access policies
    enableSoftDelete: true
    softDeleteRetentionInDays: 7        // Minimum pour réduire les coûts
    enablePurgeProtection: false        // Désactivé pour dev (permet de supprimer rapidement)
    publicNetworkAccess: 'Enabled'
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
    }
  }
}

// ============================================================================
// Outputs
// ============================================================================
output keyVaultId string = keyVault.id
output keyVaultUri string = keyVault.properties.vaultUri
output keyVaultName string = keyVault.name
