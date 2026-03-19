// parameters.prod.bicepparam - Paramètres pour l'environnement de production
using '../main.bicep'

param projectName = 'capuchesdopale'
param environment = 'prod'
param location = 'francecentral'

// Ces valeurs doivent être fournies lors du déploiement via des secrets GitHub
param sqlAdminUsername = ''
param sqlAdminPassword = ''
param jwtSecret = ''
param jwtSecretAdmin = ''
param githubClientId = ''
param githubClientSecret = ''
param githubCallbackUrl = ''
param frontendOAuthSuccessUrl = ''
param containerRegistryUrl = ''
param containerRegistryUsername = ''
param containerRegistryPassword = ''
param backendImageTag = 'latest'
param frontendImageTag = 'latest'
param appGatewayWafMode = 'Prevention'
param appGatewayBlockedIpAddresses = []
param appGatewayBlockedCountryCodes = []
param appGatewayRateLimitThreshold = 120
