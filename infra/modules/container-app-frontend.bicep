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

@description('URL du backend')
param backendUrl string

// CONTAINER APP - FRONTEND

resource frontendApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: name
  location: location
  tags: tags
  properties: {
    managedEnvironmentId: containerAppsEnvironmentId
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 80
        transport: 'http'
        allowInsecure: false
      }
      secrets: [
        {
          name: 'registry-password'
          value: containerRegistryPassword
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
          name: 'web'
          image: '${containerRegistryUrl}/capuchesdopale-web:${imageTag}'
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          env: [
            {
              name: 'API_URL'
              value: 'https://${backendUrl}'
            }
          ]
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/'
                port: 80
              }
              initialDelaySeconds: 10
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
                concurrentRequests: '200'
              }
            }
          }
        ]
      }
    }
  }
}

@description('FQDN du Container App Frontend')
output fqdn string = frontendApp.properties.configuration.ingress.fqdn

@description('URL du Container App Frontend')
output url string = 'https://${frontendApp.properties.configuration.ingress.fqdn}'

@description('ID du Container App')
output id string = frontendApp.id

@description('Nom du Container App')
output name string = frontendApp.name
