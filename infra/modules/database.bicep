// ============================================================================
// Azure SQL Database Module
// Optimisé pour Azure for Students
// ============================================================================

@description('Nom du serveur SQL')
param serverName string

@description('Nom de la base de données')
param databaseName string

@description('Région Azure')
param location string

@description('Tags des ressources')
param tags object

@description('Login administrateur')
@secure()
param administratorLogin string

@description('Mot de passe administrateur')
@secure()
param administratorPassword string

// ============================================================================
// SQL Server
// ============================================================================
resource sqlServer 'Microsoft.Sql/servers@2023-05-01-preview' = {
  name: serverName
  location: location
  tags: tags
  properties: {
    administratorLogin: administratorLogin
    administratorLoginPassword: administratorPassword
    version: '12.0'
    minimalTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
  }
}

// ============================================================================
// SQL Database - Basic tier (le moins cher pour Azure Student)
// ============================================================================
resource sqlDatabase 'Microsoft.Sql/servers/databases@2023-05-01-preview' = {
  parent: sqlServer
  name: databaseName
  location: location
  tags: tags
  sku: {
    name: 'Basic'           // ~5€/mois - le moins cher
    tier: 'Basic'
    capacity: 5
  }
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
    maxSizeBytes: 2147483648  // 2 GB
    catalogCollation: 'SQL_Latin1_General_CP1_CI_AS'
    zoneRedundant: false
    readScale: 'Disabled'
    requestedBackupStorageRedundancy: 'Local'
  }
}

// ============================================================================
// Firewall Rules
// ============================================================================

// Autoriser les services Azure
resource firewallAzureServices 'Microsoft.Sql/servers/firewallRules@2023-05-01-preview' = {
  parent: sqlServer
  name: 'AllowAllAzureIps'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// Autoriser toutes les IPs (pour le développement - à restreindre en production)
resource firewallAllowAll 'Microsoft.Sql/servers/firewallRules@2023-05-01-preview' = {
  parent: sqlServer
  name: 'AllowAllIPs'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '255.255.255.255'
  }
}

// ============================================================================
// Outputs
// ============================================================================
output serverFqdn string = sqlServer.properties.fullyQualifiedDomainName
output databaseName string = sqlDatabase.name
output connectionString string = 'Server=tcp:${sqlServer.properties.fullyQualifiedDomainName},1433;Initial Catalog=${databaseName};Persist Security Info=False;User ID=${administratorLogin};Password=${administratorPassword};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;'
