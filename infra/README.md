# Rapport Technique - Les Capuches d'Opale
## Application Web 3-Tiers sur Microsoft Azure


## 1. Introduction

### 1.1 Contexte du projet

Les Capuches d'Opale est une application web de gestion d'une guilde d'aventuriers médiévale-fantastique. L'application permet de :

- Gérer les aventuriers (inscription, profils, spécialités)
- Organiser les quêtes (création, attribution, suivi)
- Gérer l'inventaire (équipements, consommables)
- Administrer la guilde (interface d'administration)

### 1.2 Objectifs du déploiement Azure

- Déployer une architecture 3-tiers complète et fonctionnelle
- Utiliser l'Infrastructure as Code avec Bicep
- Implémenter un pipeline CI/CD automatisé
- Utiliser les services PaaS/CaaS d'Azure
- Sécuriser l'application avec Key Vault et App Configuration

---

## 2. Choix techniques et justifications

### 2.1 Frontend : Angular

| Critère | Choix | Justification |
|---------|-------|---------------|
| Framework | Angular 20 | Framework robuste avec TypeScript natif, architecture modulaire, CLI puissante |
| Styling | SCSS | Préprocesseur CSS avec variables et mixins |
| Tests | Karma + Jasmine | Intégration native avec Angular CLI |
| Build | Angular CLI | Optimisation de production automatique |

**Avantages** :
- Architecture MVC claire et maintenable
- Injection de dépendances native
- RxJS pour la gestion des flux asynchrones
- Large écosystème et documentation


### 2.2 Backend : NestJS

| Critère | Choix | Justification |
|---------|-------|---------------|
| Framework | NestJS 11 | Architecture modulaire inspirée d'Angular, TypeScript natif |
| ORM | Prisma 6 | Type-safe, migrations automatiques, excellent DX |
| Auth | Passport JWT | Standard de l'industrie pour l'authentification stateless |
| Documentation | Swagger | Documentation API interactive générée automatiquement |

**Avantages** :
- Architecture modulaire et testable
- Décorateurs pour une syntaxe claire
- Support natif de TypeScript
- Intégration facile avec Azure services

### 2.3 Base de données : Azure SQL Database

| Critère | Choix | Justification |
|---------|-------|---------------|
| Service | Azure SQL Database | Service managé, haute disponibilité, sauvegardes automatiques |
| Tier | Basic (5 DTU) | Suffisant pour le développement, coût minimal |
| Connexion | Prisma + SQL Server driver | Support natif dans Prisma |

**Avantages** :
- Compatibilité SQL Server (existant dans le schéma Prisma)
- Service entièrement managé
- Scaling facile vers des tiers supérieurs
- Sécurité intégrée (TLS, firewall)

### 2.4 Modèle de déploiement : CaaS

## Modèle de déploiement : CaaS (Container as a Service)

| Critère | Choix | Justification |
|---------|-------|---------------|
| **Service Azure** | Azure Container Apps | Serverless containers sans gérer de cluster Kubernetes |
| **Mode de facturation** | Consumption (à la demande) | Paye uniquement pour les ressources consommées (vCPU-h, RAM-h) |
| **Scaling** | Auto-scaling HTTP (1-5 replicas) | Scale automatique basé sur le nombre de requêtes concurrentes |
| **Orchestration** | Managed Environment | Azure gère le load balancer, le réseau et les révisions |
| **Déploiement** | Révisions immutables | Support blue-green deployment et rollback instantané |
| **Registry** | Azure Container Registry | Images Docker privées, intégration native avec Container Apps |
| **Réseau** | Ingress HTTPS intégré | TLS automatique, pas de configuration nginx/traefik |
| **Logs** | Log Analytics natif | Tous les logs stdout/stderr envoyés automatiquement |
| **Sécurité** | Secrets managés | Injection sécurisée des variables d'environnement |

## 3. Architecture et déploiement Azure

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    AZURE CLOUD                                           │
│                              Resource Group: capuchesdopale-dev                          │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │                        CONTAINER APPS ENVIRONMENT                                │    │
│  │  ┌─────────────────────────────────┐    ┌─────────────────────────────────┐     │    │
│  │  │      FRONTEND (Angular)         │    │       BACKEND (NestJS)          │     │    │
│  │  │   ca-capuchesdopale-dev-web     │───▶│   ca-capuchesdopale-dev-api     │     │    │
│  │  │   Port: 80 | CPU: 0.25 | 0.5Gi  │    │   Port: 3000 | CPU: 0.5 | 1Gi   │     │    │
│  │  │   Replicas: 1-3                 │    │   Replicas: 1-5                 │     │    │
│  │  └─────────────────────────────────┘    └──────────────┬──────────────────┘     │    │
│  └────────────────────────────────────────────────────────┼─────────────────────────┘    │
│                                                           │                              │
│       ┌───────────────────────────────────────────────────┼──────────────────────────┐   │
│       │                                                   │                          │   │
│       ▼                                                   ▼                          ▼   │
│  ┌─────────────┐                              ┌─────────────────┐          ┌───────────┐ │
│  │  STORAGE    │                              │  SQL DATABASE   │          │ FUNCTION  │ │
│  │  Containers:│                              │  guild-db       │          │   APP     │ │
│  │  - uploads  │                              │  Basic (5 DTU)  │          │ log-      │ │
│  │  - avatars  │                              │                 │          │ receiver  │ │
│  └──────┬──────┘                              └─────────────────┘          └─────┬─────┘ │
│         │                    ┌─────────────────┐                                 │       │
│         └────────────────────│  TABLE STORAGE  │◀────────────────────────────────┘       │
│                              │ ApplicationLogs │                                         │
│                              └─────────────────┘                                         │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │                              SERVICES DE SUPPORT                                  │    │
│  │  ┌─────────────┐     ┌─────────────────┐     ┌─────────────────────────────┐     │    │
│  │  │  KEY VAULT  │     │  APP CONFIG     │     │     LOG ANALYTICS           │     │    │
│  │  │ - SQL creds │     │ - Pagination    │     │  + Application Insights     │     │    │
│  │  │ - JWT keys  │     │ - Upload limits │     │  Rétention: 30 jours        │     │    │
│  │  └─────────────┘     └─────────────────┘     └─────────────────────────────┘     │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Ressources deployées :

|Service|Nom|Rôle|
|---------|-------|---------------|
|Container Apps Env|cae-capuchesdopale-dev|Réseau partagé containers
|Container App|ca-capuchesdopale-dev-web|Frontend Angular
|Container App|ca-capuchesdopale-dev-api|Backend NestJS
|SQL Server|sql-capuchesdopale-dev|Serveur BDD
|SQL Database|guild-db|Base relationnelle
|Storage Account|stcapuchesdopaledev|Blobs + Tables
|Function App|func-capuchesdopale-dev|Logging FaaS
|Key Vault|kv-capuchesdopale|Secrets
|App Configuration|appconfig-capuchesdopale-dev|Paramètres
|Log Analytics|log-capuchesdopale-dev|Monitoring

## 4. Difficultés rencontrées et solutions

### 4.1 Communication entre le Backend et le Logger (Function App)

| Aspect | Détail |
|--------|--------|
| **Problème** | Le backend ne parvenait pas à envoyer les logs vers la Function App après déploiement |
| **Cause** | L'URL de la Function App (`LOG_FUNCTION_URL`) n'était pas correctement transmise au container backend lors du déploiement |
| **Solution** | Configuration dans Bicep pour récupérer l'URL de la Function App via les outputs du module et l'injecter automatiquement comme variable d'environnement dans le container backend |

### 4.2 Migration de PostgreSQL vers SQL Server

| Aspect | Détail |
|--------|--------|
| **Problème** | Le build CI/CD réussissait (frontend + backend) mais l'application crashait au démarrage lors des health checks |
| **Cause** | Le schéma Prisma était configuré pour PostgreSQL, incompatible avec Azure SQL Server (syntaxe, types de données différents) |
| **Solution** | Modification du provider Prisma de `postgresql` vers `sqlserver`, adaptation de la connection string avec les paramètres TLS requis (`encrypt=true;trustServerCertificate=false`), et re-génération du client Prisma |

### 4.3 Récupération des URLs et authentification Azure

| Aspect | Détail |
|--------|--------|
| **Problème** | Difficulté à récupérer les URLs des ressources créées dynamiquement par le déploiement Bicep dans le pipeline CI/CD |
| **Cause** | Les outputs Bicep n'étaient pas correctement capturés, et l'authentification au CLI Azure nécessitait une configuration spécifique du Service Principal |
| **Solution** | Configuration des credentials Azure via `AZURE_CREDENTIALS` (Service Principal JSON) dans les secrets GitHub, et utilisation de `az deployment group show --query properties.outputs` pour extraire les URLs générées |

### 4.4 Optimisation et réduction des coûts

| Aspect | Détail |
|--------|--------|
| **Problème** | Difficulté à comprendre la structure de facturation Azure et identifier les leviers de réduction des coûts |
| **Cause** | Multiplicité des services (Container Apps, SQL, Storage, Functions) avec des modèles de facturation différents |
| **Solutions appliquées** | <ul><li>Choix du tier **Basic** pour SQL Database (~5€/mois vs ~15€ Standard)</li><li>Mode **Consumption** pour Container Apps (facturation à l'usage)</li><li>Tier **Free** pour App Configuration</li><li>Réduction de la rétention des logs à **30 jours**</li><li>Limitation du quota Log Analytics à **1 GB/jour**</li></ul> | 

## 5. Estimation des coûts mensuels 

### 5.1 Couts pour l'environnement de développement

|Service|SKU|Prix unitaire|Coût estimé/mois|
|---------|-------|---------------|---------------|
|Container Apps Frontend|Consumption|0.24€/vCPU-h|~5-10€|
|Container Apps Backend|Consumption|0.24€/vCPU-h|~10-20€|
|Azure SQL Database|Basic (5 DTU)|~5€/mois|~5€|
|Storage Account|Standard LRS|0.02€/GB|~1-3€|
|Function App|Consumption|0.169€/million exec|~0-2€|
|Key Vault|Standard|0.03€/secret|~1€|
|App Configuration|Free|0€|0€|
|Log Analytics|Pay-per-GB|2.30€/GB|~2-5€|
|TOTAL DEV| | |~25-45€/mois|

### 5.2 Couts pour l'environnement de production

|Service|SKU|Coût estimé/mois|
|---------|-------|---------------|
|Container Apps (3 replicas chaque)|Consumption|~45-90€|
|Azure SQL Database|Standard S0 (10 DTU)|~15€|
|Storage Account|Standard GRS|~5-10€|
|Function App|Consumption|~5-10€|
|Key Vault + App Config|Standard|~3€|
|Log Analytics|Pay-per-GB|~10-20€|
|TOTAL PROD| |~80-150€/mois|

## 6. CI/CD mise en place

### 6.1 Vue d'ensemble des workflows

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              WORKFLOWS GITHUB ACTIONS                                    │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐  │
│  │  workflow_pr_main.yml   │  │  azure-deploy.yml       │  │ deploy-infra-only.yml   │  │
│  │                         │  │                         │  │                         │  │
│  │  Déclencheur:           │  │  Déclencheur:           │  │  Déclencheur:           │  │
│  │  PR → main              │  │  Push main / Manuel     │  │  Manuel uniquement      │  │
│  │                         │  │                         │  │                         │  │
│  │  Actions:               │  │  Actions:               │  │  Actions:               │  │
│  │  • Tests Frontend       │  │  • Tests                │  │  • Validate Bicep       │  │
│  │  • Tests Backend        │  │  • Build Images Docker  │  │  • What-If preview      │  │
│  │  • Docker Compose Test  │  │  • Deploy Infrastructure│  │  • Deploy Bicep         │  │
│  │                         │  │  • Deploy Function App  │  │                         │  │
│  │                         │  │  • Database Migration   │  │                         │  │
│  │                         │  │  • Smoke Tests          │  │                         │  │
│  └─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘  │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```


### 6.2 Workflow CI sur les Pull Requests

| Job | Description |
|-----|-------------|
|Front|Build image Docker de test, exécute les tests Angular|
|Back|Build image Docker de test, exécute les tests NestJS|
|Docker-Compose-Test|Démarre tous les services via docker-compose, vérifie qu'ils fonctionnent |

### 6.3 Workflow de deploiement complet

**Déclencheur** : Push sur main ou manuel

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PHASE 1 : Build & Test (parallèle)                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐ │
│  │ test-backend  │  │ test-frontend │  │ build-backend │  │build-frontend │ │
│  │               │  │               │  │    -image     │  │    -image     │ │
│  │ • npm ci      │  │ • npm ci      │  │               │  │               │ │
│  │ • npm lint    │  │ • npm testCi  │  │ • Docker build│  │ • Docker build│ │
│  │ • npm test    │  │               │  │ • Push to ACR │  │ • Push to ACR │ │
│  └───────────────┘  └───────────────┘  └───────┬───────┘  └───────┬───────┘ │
│                                                │                  │         │
│  ┌───────────────┐                             │                  │         │
│  │build-functions│                             │                  │         │
│  │               │                             │                  │         │
│  │ • npm ci      │                             │                  │         │
│  │ • npm build   │                             │                  │         │
│  │ • Upload art. │                             │                  │         │
│  └───────┬───────┘                             │                  │         │
│          │                                     │                  │         │
└──────────┼─────────────────────────────────────┼──────────────────┼─────────┘
           │                                     │                  │
           │         ┌───────────────────────────┴──────────────────┘
           │         │
           │         ▼
┌──────────┼─────────────────────────────────────────────────────────────────┐
│          │              PHASE 2 : Deploy Infrastructure                    │
├──────────┼─────────────────────────────────────────────────────────────────┤
│          │  ┌─────────────────────────────────────────────────────────┐    │
│          │  │               deploy-infrastructure                      │    │
│          │  │                                                          │    │
│          │  │  • az login (Service Principal)                         │    │
│          │  │  • az group create (Resource Group)                     │    │
│          │  │  • az deployment (Bicep → Azure)                        │    │
│          │  │    - Container Apps                                      │    │
│          │  │    - SQL Database                                        │    │
│          │  │    - Storage Account                                     │    │
│          │  │    - Key Vault, App Config, Log Analytics               │    │
│          │  └──────────────────────────┬──────────────────────────────┘    │
│          │                             │                                    │
└──────────┼─────────────────────────────┼────────────────────────────────────┘
           │                             │
           │    ┌────────────────────────┴────────────────────────┐
           │    │                                                 │
           ▼    ▼                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PHASE 3 : Post-deploy (parallèle)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────┐              ┌────────────────────────┐         │
│  │    deploy-function     │              │   database-migration   │         │
│  │                        │              │                        │         │
│  │ • Download artifact    │              │ • prisma generate      │         │
│  │ • az functions deploy  │              │ • prisma db push       │         │
│  │                        │              │ • prisma db seed       │         │
│  └────────────┬───────────┘              └────────────┬───────────┘         │
│               │                                       │                      │
│               └───────────────────┬───────────────────┘                      │
│                                   ▼                                          │
│                    ┌────────────────────────┐                               │
│                    │      smoke-tests       │                               │
│                    │                        │                               │
│                    │ • Get URLs from Azure  │                               │
│                    │ • Health check Backend │                               │
│                    │ • Health check Frontend│                               │
│                    │ • Generate Summary     │                               │
│                    └────────────────────────┘                               │
└─────────────────────────────────────────────────────────────────────────────┘
```


### 6.4 Workflow Infrastructure seule

**Déclencheur** : Manuel uniquement

|Étapes|Description|
|------|-----------|
|Validate Bicep|Vérifie la syntaxe des templates|
|What-If|Prévisualise les changements sans les appliquer|
|Create Resource Group|Crée le groupe de ressources si inexistant|
|Deploy Bicep|Applique les templates d'infrastructure|
|Output Results|	Affiche les URLs générées dans le summary|

**Secrets Github requis** :

|Secret|Description|
|------|-----------|
|```AZURE_CREDENTIALS```|JSON du Service Principal Azure|
|```ACR_LOGIN_SERVER```|URL du Container Registry|
|```ACR_USERNAME```|Username du registry|
|```ACR_PASSWORD```|Password du registry|
|```SQL_ADMIN_USERNAME```|Administrateur SQL|
|```SQL_ADMIN_PASSWORD```|Mot de passe SQL|
|```JWT_SECRET```|Secret pour signer les JWT|
|```JWT_SECRET_ADMIN```|Secret JWT admin|

