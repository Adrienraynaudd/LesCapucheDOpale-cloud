@description('Nom de l\'environnement Container Apps')
param name string

@description('Localisation')
param location string

@description('Tags des ressources')
param tags object

@description('ID du workspace Log Analytics')
param logAnalyticsWorkspaceId string

// CONTAINER APPS ENVIRONMENT

resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: name
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: reference(logAnalyticsWorkspaceId, '2022-10-01').customerId
        sharedKey: listKeys(logAnalyticsWorkspaceId, '2022-10-01').primarySharedKey
      }
    }
    zoneRedundant: false
    workloadProfiles: [
      {
        name: 'Consumption'
        workloadProfileType: 'Consumption'
      }
    ]
  }
}

// OUTPUTS

@description('ID de l\'environnement Container Apps')
output environmentId string = containerAppsEnvironment.id

@description('Nom de l\'environnement Container Apps')
output environmentName string = containerAppsEnvironment.name

@description('Domaine par défaut de l\'environnement')
output defaultDomain string = containerAppsEnvironment.properties.defaultDomain

@description('Adresse IP statique')
output staticIp string = containerAppsEnvironment.properties.staticIp
