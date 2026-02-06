@description('Nom du Container App')
param name string

@description('Localisation')
param location string

@description('Tags des ressources')
param tags object

@description('ID de l\'environnement Container Apps')
param containerAppsEnvironmentId string

@description('URL du registre de conteneurs')
param containerRegistryUrl string

@description('Nom d\'utilisateur du registre')
@secure()
param containerRegistryUsername string

@description('Mot de passe du registre')
@secure()
param containerRegistryPassword string

@description('Tag de l\'image')
param imageTag string

@description('Chaîne de connexion à la base de données')
@secure()
param databaseConnectionString string

@description('Secret JWT')
@secure()
param jwtSecret string

@description('Secret JWT Admin')
@secure()
param jwtSecretAdmin string

@description('Chaîne de connexion Storage')
@secure()
param storageConnectionString string

@description('Endpoint App Configuration')
param appConfigEndpoint string

@description('URL de la Function App pour les logs')
param logFunctionUrl string = ''

// CONTAINER APP - BACKEND API

resource backendApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: name
  location: location
  tags: tags
  properties: {
    managedEnvironmentId: containerAppsEnvironmentId
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 3000
        transport: 'http'
        allowInsecure: false
        corsPolicy: {
          allowedOrigins: ['*']
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
          allowedHeaders: ['*']
          exposeHeaders: ['*']
          maxAge: 3600
          allowCredentials: true
        }
      }
      secrets: [
        {
          name: 'registry-password'
          value: containerRegistryPassword
        }
        {
          name: 'database-url'
          value: databaseConnectionString
        }
        {
          name: 'jwt-secret'
          value: jwtSecret
        }
        {
          name: 'jwt-secret-admin'
          value: jwtSecretAdmin
        }
        {
          name: 'storage-connection'
          value: storageConnectionString
        }
      ]
      registries: [
        {
          server: containerRegistryUrl
          username: containerRegistryUsername
          passwordSecretRef: 'registry-password'
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'api'
          image: '${containerRegistryUrl}/capuchesdopale-api:${imageTag}'
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            {
              name: 'NODE_ENV'
              value: 'production'
            }
            {
              name: 'PORT'
              value: '3000'
            }
            {
              name: 'DATABASE_URL'
              secretRef: 'database-url'
            }
            {
              name: 'JWT_SECRET'
              secretRef: 'jwt-secret'
            }
            {
              name: 'JWT_SECRET_ADMIN'
              secretRef: 'jwt-secret-admin'
            }
            {
              name: 'AZURE_STORAGE_CONNECTION_STRING'
              secretRef: 'storage-connection'
            }
            {
              name: 'AZURE_APP_CONFIG_ENDPOINT'
              value: appConfigEndpoint
            }
            {
              name: 'LOG_FUNCTION_URL'
              value: logFunctionUrl
            }
          ]
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/health'
                port: 3000
              }
              initialDelaySeconds: 30
              periodSeconds: 10
              failureThreshold: 3
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '100'
              }
            }
          }
        ]
      }
    }
  }
}


@description('FQDN du Container App Backend')
output fqdn string = backendApp.properties.configuration.ingress.fqdn

@description('URL du Container App Backend')
output url string = 'https://${backendApp.properties.configuration.ingress.fqdn}'

@description('ID du Container App')
output id string = backendApp.id

@description('Nom du Container App')
output name string = backendApp.name
