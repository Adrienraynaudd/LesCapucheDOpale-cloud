# Rapport Technique - Les Capuches d'Opale
## Application Web 3-Tiers sur Microsoft Azure

---

**Projet** : Les Capuches d'Opale - Système de Gestion de Guilde  
**Date** : Février 2026  
**Auteurs** : [Équipe du projet]  
**Repository** : https://github.com/MaxChevalier/LesCapucheDOpale-cloud

---

## Table des matières

1. [Introduction](#1-introduction)
2. [Choix techniques et justifications](#2-choix-techniques-et-justifications)
3. [Architecture déployée sur Azure](#3-architecture-déployée-sur-azure)
4. [Infrastructure as Code (Bicep)](#4-infrastructure-as-code-bicep)
5. [Pipeline CI/CD](#5-pipeline-cicd)
6. [Fonctionnalité de Logging (FaaS)](#6-fonctionnalité-de-logging-faas)
7. [Gestion des secrets et configurations](#7-gestion-des-secrets-et-configurations)
8. [Difficultés rencontrées et solutions](#8-difficultés-rencontrées-et-solutions)
9. [Estimation des coûts Azure](#9-estimation-des-coûts-azure)
10. [Conclusion](#10-conclusion)

---

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