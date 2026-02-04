# Infrastructure Azure - Les Capuches d'Opale

## 📁 Structure des fichiers Bicep

```
infra/
├── main.bicep                    # Template principal (orchestrateur)
└── modules/
    ├── webapp.bicep              # App Service Plan + Backend + Frontend
    ├── database.bicep            # Azure SQL Database
    ├── storage.bicep             # Blob Storage
    ├── keyvault.bicep            # Key Vault
    └── keyvault-secrets.bicep    # Secrets dans Key Vault
```

## 🏗️ Architecture déployée

```
┌─────────────────────────────────────────────────────────────────┐
│                Resource Group (France Central)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              App Service Plan (F1 - Gratuit)             │   │
│  │  ┌──────────────────┐    ┌──────────────────┐           │   │
│  │  │  web-capucheopale │    │  api-capucheopale │           │   │
│  │  │    (Angular)      │    │    (NestJS)       │           │   │
│  │  └──────────────────┘    └──────────────────┘           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                │                                 │
│                                ▼                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │  Key Vault   │    │  SQL Database │    │ Blob Storage │      │
│  │  (Secrets)   │    │   (Basic)     │    │ (Standard)   │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 Configuration requise

### Secrets GitHub à configurer

Dans **Settings > Secrets and variables > Actions** :

| Secret | Description | Exemple |
|--------|-------------|---------|
| `AZURE_CREDENTIALS` | JSON du Service Principal | `{"clientId":"..."}` |
| `SQL_ADMIN_LOGIN` | Login admin SQL Server | `sqladmin` |
| `SQL_ADMIN_PASSWORD` | Mot de passe SQL (fort!) | `P@ssw0rd123!` |
| `JWT_SECRET` | Clé secrète JWT | `my-super-secret-key` |

### Créer le Service Principal Azure

```bash
# 1. Connexion à Azure
az login

# 2. Créer le Service Principal
az ad sp create-for-rbac \
  --name "sp-capucheopale-github" \
  --role contributor \
  --scopes /subscriptions/<SUBSCRIPTION_ID> \
  --sdk-auth

# 3. Copier le JSON généré dans AZURE_CREDENTIALS
```

## 🚀 Déploiement manuel (si besoin)

```bash
# 1. Connexion Azure
az login

# 2. Créer le Resource Group
az group create \
  --name rg-capucheopale-dev \
  --location francecentral

# 3. Déployer l'infrastructure
az deployment group create \
  --resource-group rg-capucheopale-dev \
  --template-file infra/main.bicep \
  --parameters \
    projectName=capucheopale \
    environment=dev \
    sqlAdminLogin=sqladmin \
    sqlAdminPassword='VotreMotDePasse123!' \
    jwtSecret='votre-secret-jwt'
```

## 💰 Estimation des coûts (Azure Student)

| Service | SKU | Coût/mois |
|---------|-----|-----------|
| App Service Plan | F1 (Gratuit) | **0€** |
| SQL Database | Basic | ~5€ |
| Storage Account | Standard LRS | ~0.50€ |
| Key Vault | Standard | ~0.03€ |
| **Total** | | **~6€/mois** |

> ✅ Compatible avec le crédit Azure Student (~100$/an)

## 🌐 URLs après déploiement

- **Frontend**: `https://web-capucheopale-dev.azurewebsites.net`
- **Backend API**: `https://api-capucheopale-dev.azurewebsites.net`
- **Swagger**: `https://api-capucheopale-dev.azurewebsites.net/docs`
