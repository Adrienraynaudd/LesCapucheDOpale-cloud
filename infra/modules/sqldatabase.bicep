// sqldatabase.bicep - Module Azure SQL Database

@description('Nom du serveur SQL')
param serverName string

@description('Nom de la base de données')
param databaseName string

@description('Localisation')
param location string

@description('Tags des ressources')
param tags object

@description('Nom d\'utilisateur administrateur')
@secure()
param adminUsername string

@description('Mot de passe administrateur')
@secure()
param adminPassword string

// ============================================================================
// SQL SERVER
// ============================================================================

resource sqlServer 'Microsoft.Sql/servers@2023-05-01-preview' = {
  name: serverName
  location: location
  tags: tags
  properties: {
    administratorLogin: adminUsername
    administratorLoginPassword: adminPassword
    version: '12.0'
    minimalTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
  }
}

// ============================================================================
// FIREWALL RULES
// ============================================================================

// Autoriser les services Azure
resource allowAzureServices 'Microsoft.Sql/servers/firewallRules@2023-05-01-preview' = {
  parent: sqlServer
  name: 'AllowAllAzureIps'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// Autoriser toutes les IPs (à restreindre en production)
resource allowAllIps 'Microsoft.Sql/servers/firewallRules@2023-05-01-preview' = {
  parent: sqlServer
  name: 'AllowAllIps'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '255.255.255.255'
  }
}

// ============================================================================
// DATABASE
// ============================================================================

resource sqlDatabase 'Microsoft.Sql/servers/databases@2023-05-01-preview' = {
  parent: sqlServer
  name: databaseName
  location: location
  tags: tags
  sku: {
    name: 'Basic'
    tier: 'Basic'
    capacity: 5
  }
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
    maxSizeBytes: 2147483648 // 2 GB
    catalogCollation: 'SQL_Latin1_General_CP1_CI_AS'
    zoneRedundant: false
    readScale: 'Disabled'
    requestedBackupStorageRedundancy: 'Local'
    isLedgerOn: false
  }
}

// ============================================================================
// OUTPUTS
// ============================================================================

@description('Nom du serveur SQL')
output serverName string = sqlServer.name

@description('FQDN du serveur SQL')
output serverFqdn string = sqlServer.properties.fullyQualifiedDomainName

@description('Nom de la base de données')
output databaseName string = sqlDatabase.name

@description('Chaîne de connexion ADO.NET')
output connectionStringAdoNet string = 'Server=tcp:${sqlServer.properties.fullyQualifiedDomainName},1433;Initial Catalog=${databaseName};Persist Security Info=False;User ID=${adminUsername};Password=${adminPassword};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;'

@description('Chaîne de connexion Prisma SQL Server')
output connectionString string = 'sqlserver://${sqlServer.properties.fullyQualifiedDomainName}:1433;database=${databaseName};user=${adminUsername};password=${adminPassword};encrypt=true;trustServerCertificate=true;connectionTimeout=30'
