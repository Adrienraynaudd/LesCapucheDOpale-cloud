targetScope = 'resourceGroup'

@description('Nom du projet')
param projectName string = 'capuchesdopale'

@description('Environnement de déploiement')
@allowed(['dev', 'staging', 'prod'])
param environment string = 'dev'

@description('Localisation des ressources')
param location string = 'francecentral'

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

@description('GitHub OAuth Client ID')
param githubClientId string

@description('GitHub OAuth Client Secret')
@secure()
param githubClientSecret string

@description('URL de callback OAuth GitHub')
param githubCallbackUrl string = ''

@description('URL de redirection frontend apres succes OAuth')
param frontendOAuthSuccessUrl string = ''

@description('Tag de l\'image Docker pour le backend')
param backendImageTag string = 'latest'

@description('Tag de l\'image Docker pour le frontend')
param frontendImageTag string = 'latest'

@description('URL du registre de conteneurs')
param containerRegistryUrl string

@description('Nom d\'utilisateur du registre de conteneurs')
@secure()
param containerRegistryUsername string

@description('Mot de passe du registre de conteneurs')
@secure()
param containerRegistryPassword string

@description('Mode WAF de l\'Application Gateway: Detection ou Prevention')
@allowed(['Detection', 'Prevention'])
param appGatewayWafMode string = 'Detection'

@description('Liste d\'IP a bloquer via regle WAF personnalisee')
param appGatewayBlockedIpAddresses array = []

@description('Liste des codes pays ISO a bloquer via regle WAF personnalisee')
param appGatewayBlockedCountryCodes array = []

@description('Seuil de rate limiting par minute et par IP')
param appGatewayRateLimitThreshold int = 600

@description('Active la regle WAF de rate limiting')
param appGatewayEnableRateLimit bool = false


var resourcePrefix = '${projectName}-${environment}'
var tags = {
  project: projectName
  environment: environment
  managedBy: 'bicep'
}
var storageAccountName = 'st${replace(resourcePrefix, '-', '')}'
var sqlConnectionString = 'sqlserver://${sqlDatabase.outputs.serverFqdn}:1433;database=${sqlDatabase.outputs.databaseName};user=${sqlAdminUsername}@${sqlDatabase.outputs.serverName};password=${sqlAdminPassword};encrypt=true;trustServerCertificate=false;connectionTimeout=30'


// Module Key Vault
module keyVault 'modules/keyvault.bicep' = {
  name: 'keyVault-deployment'
  params: {
    name: 'kv${take(replace(resourcePrefix, '-', ''), 11)}${take(uniqueString(resourceGroup().id), 5)}'
    location: location
    tags: tags
    sqlAdminUsername: sqlAdminUsername
    sqlAdminPassword: sqlAdminPassword
    jwtSecret: jwtSecret
    jwtSecretAdmin: jwtSecretAdmin
  }
}

// Module App Configuration 
module appConfig 'modules/appconfig.bicep' = {
  name: 'appConfig-deployment'
  params: {
    name: 'appconfig-${resourcePrefix}'
    location: location
    tags: tags
    environment: environment
    keyVaultName: keyVault.outputs.keyVaultName
  }
}

// Module Storage Account
module storage 'modules/storage.bicep' = {
  name: 'storage-deployment'
  params: {
    name: storageAccountName
    location: location
    tags: tags
  }
}

// Module Azure SQL Database
module sqlDatabase 'modules/sqldatabase.bicep' = {
  name: 'sqlDatabase-deployment'
  params: {
    serverName: 'sql-${resourcePrefix}'
    databaseName: 'guild-db'
    location: location
    tags: tags
    adminUsername: sqlAdminUsername
    adminPassword: sqlAdminPassword
  }
}

// Module Log Analytics
module logAnalytics 'modules/loganalytics.bicep' = {
  name: 'logAnalytics-deployment'
  params: {
    name: 'log-${resourcePrefix}'
    location: location
    tags: tags
  }
}

// Module Container Apps Environment
module containerAppsEnv 'modules/container-apps-env.bicep' = {
  name: 'containerAppsEnv-deployment'
  params: {
    name: 'cae-${resourcePrefix}'
    location: location
    tags: tags
    logAnalyticsWorkspaceId: logAnalytics.outputs.workspaceId
  }
}

// Module Backend Container App
module backendApp 'modules/container-app-backend.bicep' = {
  name: 'backendApp-deployment'
  params: {
    name: 'ca-${resourcePrefix}-api'
    location: location
    tags: tags
    containerAppsEnvironmentId: containerAppsEnv.outputs.environmentId
    containerRegistryUrl: containerRegistryUrl
    containerRegistryUsername: containerRegistryUsername
    containerRegistryPassword: containerRegistryPassword
    imageTag: backendImageTag
    databaseConnectionString: sqlConnectionString
    jwtSecret: jwtSecret
    jwtSecretAdmin: jwtSecretAdmin
    storageAccountName: storage.outputs.storageAccountName
    appConfigEndpoint: appConfig.outputs.endpoint
    logFunctionUrl: 'https://func-${resourcePrefix}.azurewebsites.net/api/log-receiver'
    githubClientId: githubClientId
    githubClientSecret: githubClientSecret
    githubCallbackUrl: githubCallbackUrl
    frontendOAuthSuccessUrl: frontendOAuthSuccessUrl
  }
}

// Module Frontend Container App
module frontendApp 'modules/container-app-frontend.bicep' = {
  name: 'frontendApp-deployment'
  params: {
    name: 'ca-${resourcePrefix}-web'
    location: location
    tags: tags
    containerAppsEnvironmentId: containerAppsEnv.outputs.environmentId
    containerRegistryUrl: containerRegistryUrl
    containerRegistryUsername: containerRegistryUsername
    containerRegistryPassword: containerRegistryPassword
    imageTag: frontendImageTag
    apiBaseUrl: '/api'
  }
}

// Module Application Gateway avec routage par chemin et WAF
module applicationGateway 'modules/application-gateway.bicep' = {
  name: 'applicationGateway-deployment'
  params: {
    name: 'agw-${resourcePrefix}'
    location: location
    tags: tags
    frontendFqdn: frontendApp.outputs.fqdn
    backendFqdn: backendApp.outputs.fqdn
    wafMode: appGatewayWafMode
    blockedIpAddresses: appGatewayBlockedIpAddresses
    blockedCountryCodes: appGatewayBlockedCountryCodes
    rateLimitThreshold: appGatewayRateLimitThreshold
    enableRateLimit: appGatewayEnableRateLimit
  }
}

// Module Azure Function App pour le logging
module functionApp 'modules/function-app.bicep' = {
  name: 'functionApp-deployment'
  params: {
    name: 'func-${resourcePrefix}'
    location: location
    tags: tags
    storageAccountName: storage.outputs.storageAccountName
    logAnalyticsWorkspaceId: logAnalytics.outputs.workspaceId
  }
}


@description('URL du frontend')
output frontendUrl string = applicationGateway.outputs.frontendUrl

@description('URL du backend API')
output backendUrl string = applicationGateway.outputs.apiUrl

@description('URL publique de callback GitHub OAuth')
output githubCallbackUrl string = 'http://${applicationGateway.outputs.publicIpAddress}/api/auth/github/callback'

@description('URL publique de retour frontend apres OAuth')
output frontendOAuthSuccessUrl string = 'http://${applicationGateway.outputs.publicIpAddress}/auth/callback'

@description('IP publique de l\'Application Gateway')
output appGatewayPublicIp string = applicationGateway.outputs.publicIpAddress

@description('URL de la Function App')
output functionAppUrl string = functionApp.outputs.functionAppUrl

@description('Endpoint App Configuration')
output appConfigEndpoint string = appConfig.outputs.endpoint

@description('Nom du Key Vault')
output keyVaultName string = keyVault.outputs.keyVaultName

@description('Nom du Storage Account')
output storageAccountName string = storage.outputs.storageAccountName

@description('Nom du serveur SQL')
output sqlServerName string = sqlDatabase.outputs.serverName
