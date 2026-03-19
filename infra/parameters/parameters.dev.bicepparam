// parameters.dev.bicepparam - Paramètres pour l'environnement de développement
using '../main.bicep'

param projectName = 'capuchesdopale'
param environment = 'dev'
param location = 'francecentral'

// Ces valeurs doivent être fournies lors du déploiement via des secrets GitHub
param sqlAdminUsername = ''
param sqlAdminPassword = ''
param jwtSecret = ''
param jwtSecretAdmin = ''
param containerRegistryUrl = ''
param containerRegistryUsername = ''
param containerRegistryPassword = ''
param backendImageTag = 'latest'
param frontendImageTag = 'latest'
