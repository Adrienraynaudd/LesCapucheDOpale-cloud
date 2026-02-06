@description('Nom du workspace Log Analytics')
param name string

@description('Localisation')
param location string

@description('Tags des ressources')
param tags object

// LOG ANALYTICS WORKSPACE

resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: name
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
    workspaceCapping: {
      dailyQuotaGb: 1
    }
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}


@description('ID du workspace Log Analytics')
output workspaceId string = logAnalyticsWorkspace.id

@description('Nom du workspace Log Analytics')
output workspaceName string = logAnalyticsWorkspace.name

@description('ID du client Log Analytics')
output customerId string = logAnalyticsWorkspace.properties.customerId

