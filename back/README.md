# Guild Backend - Les Capuche d'Opale

API REST développée avec NestJS pour la gestion des aventuriers, quêtes et équipements de la guilde Les Capuche d'Opale.

## Prérequis

- Node.js (version LTS recommandée)
- npm (version 6 ou supérieure)
- PostgreSQL (ou base de données compatible Prisma)

## Installation

Installer les dépendances du projet :

```bash
npm install
```

## Configuration

### Variables d'environnement

Créer un fichier `.env` à la racine du projet avec les variables suivantes :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/database_name"
JWT_SECRET="votre_secret_jwt"
PORT=3000
```

### Base de données

#### Initialiser Prisma

```bash
npx prisma generate
```

#### Appliquer les migrations

```bash
npx prisma migrate dev
```

#### Vérifier le statut des migrations

```bash
npx prisma migrate status
```

#### Réinitialiser la base de données (développement uniquement)

```bash
npx prisma migrate reset
```

## Développement

### Démarrer le serveur de développement

```bash
npm run start:dev
```

Le serveur sera accessible à l'adresse `http://localhost:3000/`.

### Autres modes de démarrage

```bash
# Mode standard
npm start

# Mode debug
npm run start:debug

# Mode production
npm run start:prod
```

## Build

Compiler le projet pour la production :

```bash
npm run build
```

Les fichiers compilés seront placés dans le répertoire `dist/`.

## Documentation API

### OpenAPI/Swagger

La documentation interactive de l'API est disponible via Swagger :

```
http://localhost:3000/api
```

Le fichier de spécification OpenAPI se trouve dans `docs/openapi.yaml`.

## Tests

### Tests unitaires

Exécuter les tests unitaires :

```bash
npm test
```

### Tests en mode watch

```bash
npm run test:watch
```

### Tests end-to-end

```bash
npm run test:e2e
```

### Tests avec debug

```bash
npm run test:debug
```

## Coverage

### Générer le rapport de coverage

```bash
npm run test:cov
```

Cette commande exécute les tests et génère un rapport de couverture de code.

### Consulter le rapport de coverage

Le rapport de coverage est généré dans le dossier `coverage/` :

- **Linux** :
    ```bash
    xdg-open coverage/index.html
    ```
- **Windows** :
    ```bash
    start coverage/index.html
    ```
- **macOS** :
    ```bash
    open coverage/index.html
    ```

### Configuration du coverage

La configuration Jest dans `package.json` définit :

- **collectCoverageFrom** : Fichiers inclus dans le coverage (exclut `main.ts`, modules, fichiers Prisma et config)
- **coverageDirectory** : Dossier de sortie (`coverage/`)
- **coverageReporters** : Formats de rapport (`text`, `lcov`, `html`)

### Métriques du rapport

- **Statements** : Pourcentage d'instructions exécutées
- **Branches** : Pourcentage de branches conditionnelles testées
- **Functions** : Pourcentage de fonctions appelées
- **Lines** : Pourcentage de lignes de code couvertes

Le fichier `coverage/lcov.info` peut être utilisé pour l'intégration CI/CD.

## Linting et Formatage

### Linter le code

```bash
npm run lint
```

### Formater le code

```bash
npm run format
```

## Base de données avec Prisma Studio

Ouvrir Prisma Studio pour visualiser et gérer les données :

```bash
npx prisma studio
```

L'interface sera accessible à `http://localhost:5555/`.

## Technologies utilisées

- **NestJS** : 11.0.1
- **TypeScript** : 5.7.3
- **Prisma** : 6.17.0
- **Passport JWT** : 4.0.1
- **Swagger** : 11.2.1
- **Jest** : 30.0.0
- **bcrypt** : 6.0.0

## Structure du projet

```
src/
├── controllers/        # Contrôleurs REST
├── dto/               # Data Transfer Objects
├── guards/            # Guards d'authentification/autorisation
├── modules/           # Modules NestJS
├── prisma/            # Service Prisma
├── services/          # Services métier
├── tests/             # Tests unitaires
├── utils/             # Utilitaires
├── app.module.ts      # Module principal
└── main.ts            # Point d'entrée

prisma/
├── schema.prisma      # Schéma de base de données
└── migrations/        # Historique des migrations
```

## Ressources supplémentaires

- [Documentation NestJS](https://docs.nestjs.com)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation Swagger](https://swagger.io/docs/)
- [Documentation Passport JWT](http://www.passportjs.org/packages/passport-jwt/)
