# OpalProject - Frontend

Application Angular pour la gestion des aventuriers et des quêtes du projet Les Capuche d'Opale.

## Prérequis

- Node.js (version LTS recommandée)
- npm (version 6 ou supérieure)
- Angular CLI 20.3.5

## Installation

Installer les dépendances du projet :

```bash
npm install
```

## Développement

### Démarrer le serveur de développement

Le serveur de développement utilise un proxy pour communiquer avec le backend :

```bash
npm start
```

ou

```bash
ng serve --proxy-config proxy.conf.json
```

L'application sera accessible à l'adresse `http://localhost:4200/`. Elle se rechargera automatiquement lors de modifications du code source.

### Configuration du proxy

Le fichier `proxy.conf.json` permet de rediriger les appels API vers le backend pendant le développement.

## Build

### Build de développement

```bash
ng build
```

### Build de production

```bash
ng build --configuration production
```

Les fichiers générés seront placés dans le répertoire `dist/opal-project/`.

### Mode watch

Pour compiler automatiquement lors des modifications :

```bash
npm run watch
```

## Tests

### Exécuter les tests unitaires

Lancer les tests avec Karma et générer le rapport de coverage :

```bash
ng test --code-coverage
```

### Tests en CI/CD

Pour exécuter les tests en environnement d'intégration continue :

```bash
npm run testCi
```

Cette commande exécute les tests sans surveillance, sans progression affichée et utilise Chrome en mode headless.

## Coverage

Le rapport de couverture de code est généré automatiquement lors de l'exécution des tests avec l'option `--code-coverage`.

### Consulter le rapport de coverage

Après avoir exécuté les tests, ouvrez le fichier suivant dans votre navigateur :

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

### Structure du rapport

Le rapport de coverage se trouve dans le dossier `coverage/` et inclut :

- **Statements** : Pourcentage d'instructions exécutées
- **Branches** : Pourcentage de branches conditionnelles testées
- **Functions** : Pourcentage de fonctions appelées
- **Lines** : Pourcentage de lignes de code couvertes

### Fichier de coverage

Le fichier `lcov.info` dans le dossier `coverage/` peut être utilisé pour intégrer le coverage dans des outils d'analyse de code ou des plateformes CI/CD.

## Génération de code

Angular CLI permet de générer automatiquement des composants, services, modules, etc.

### Générer un composant

```bash
ng generate component nom-du-composant
```

ou la version courte :

```bash
ng g c nom-du-composant
```

### Générer un service

```bash
ng generate service nom-du-service
```

### Autres générateurs disponibles

```bash
ng generate --help
```

Les générateurs disponibles incluent : `component`, `directive`, `pipe`, `service`, `class`, `guard`, `interface`, `enum`, `module`, etc.

## Technologies utilisées

- **Angular** : 20.3.4
- **TypeScript** : 5.8.3
- **RxJS** : 7.8.0
- **Karma** : 6.4.0
- **Jasmine** : 5.1.0

## Structure du projet

```
src/
├── app/           # Code source de l'application
├── assets/        # Ressources statiques (images, etc.)
├── index.html     # Point d'entrée HTML
├── main.ts        # Point d'entrée de l'application
└── styles.scss    # Styles globaux
```

## Ressources supplémentaires

- [Documentation Angular](https://angular.dev)
- [Angular CLI](https://angular.dev/tools/cli)
- [Guide de style Angular](https://angular.dev/style-guide)
