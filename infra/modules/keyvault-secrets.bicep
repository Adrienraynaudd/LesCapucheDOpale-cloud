// ============================================================================
// Key Vault Secrets Module
// Stockage des secrets dans le Key Vault
// ============================================================================

@description('Nom du Key Vault')
param keyVaultName string

@description('Liste des secrets à stocker')
param secrets array

// Référence au Key Vault existant
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' existing = {
  name: keyVaultName
}

// Créer chaque secret
resource keyVaultSecrets 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = [for secret in secrets: {
  parent: keyVault
  name: secret.name
  properties: {
    value: secret.value
    contentType: 'text/plain'
  }
}]
