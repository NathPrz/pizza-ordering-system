# Système de Commande de Pizzas - Projet Virtualisation

Ce projet implémente un système de commande de pizzas en ligne avec une architecture microservices déployée sur Kubernetes.

## Architecture

Le système est composé de plusieurs services:
1. **Service de Commande (Backend)**: API REST développée en Node.js qui gère les pizzas et les commandes
2. **Service de Notification**: Service qui envoie des notifications aux clients
3. **Base de données MySQL**: Stocke les informations des pizzas et des commandes
4. **Frontend**: Interface utilisateur développée en React

## Technologies utilisées

- **Backend**: Node.js, Express
- **Frontend**: React
- **Base de données**: MySQL
- **Conteneurisation**: Docker
- **Orchestration**: Kubernetes
- **Service Mesh**: Istio
- **Gestion des déploiements**: Helm

## Déploiement

### Prérequis

- Docker
- Minikube
- kubectl
- Istio
- Helm

### Installation locale

1. Cloner le dépôt:
```
git clone https://github.com/NathPrz/pizza-ordering-system.git
cd pizza-ordering-system
```

2. Démarrer Minikube:
```
minikube start
```

3. Déployer l'application avec Kubernetes (méthode traditionnelle):
```
kubectl apply -f kubernetes/mysql-secret.yaml
kubectl apply -f kubernetes/mysql-pv.yaml
kubectl apply -f kubernetes/mysql-deployment.yaml
kubectl apply -f kubernetes/backend-deployment.yaml
kubectl apply -f kubernetes/notification-deployment.yaml
kubectl apply -f kubernetes/frontend-deployment.yaml
kubectl apply -f kubernetes/ingress.yaml
```

4. Istio:
```
kubectl apply -f kubernetes/gateway.yaml
```

### Déploiement avec Helm (recommandé)

1. Installation standard:
```
helm install pizza-app ./helm-chart/pizza-app
```

2. Installation avec valeurs personnalisées:
```
helm install pizza-app ./helm-chart/pizza-app --set replicaCount.frontend=3,service.type=NodePort
```

3. Ou avec un fichier de valeurs personnalisé:
```
helm install pizza-app ./helm-chart/pizza-app -f myvalues.yaml
```

4. Mise à jour d'un déploiement existant:
```
helm upgrade pizza-app ./helm-chart/pizza-app
```

5. Désinstallation:
```
helm uninstall pizza-app
```

### Configuration Helm

La configuration Helm permet de personnaliser facilement le déploiement:

| Paramètre | Description | Valeur par défaut |
|-----------|-------------|-------------------|
| `replicaCount.frontend` | Nombre de réplicas pour le frontend | 2 |
| `replicaCount.backend` | Nombre de réplicas pour le backend | 2 |
| `replicaCount.notification` | Nombre de réplicas pour le service de notification | 1 |
| `image.registry` | Registre Docker | docker.io |
| `image.repository.frontend` | Image Docker du frontend | nathprz/pizza-frontend |
| `image.repository.backend` | Image Docker du backend | nathprz/pizza-service |
| `image.tag.frontend` | Tag de l'image frontend | 1.0 |
| `service.type` | Type de service Kubernetes | ClusterIP |
| `mysql.storage` | Taille du stockage MySQL | 1Gi |
| `istio.enabled` | Activer/désactiver Istio | true |
| `ingress.host` | Nom d'hôte pour l'ingress | pizza.local |

5. Obtenir l'URL d'accès:
```
kubectl get svc
```

Si vous utilisez Minikube:
```
minikube service pizza-app-pizza-frontend
```

## Structure du projet

```
pizza-ordering-system/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
├── notification-service/
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
├── database/
│   ├── init.sql
│   └── Dockerfile
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── kubernetes/
│   ├── backend-deployment.yaml
│   ├── notification-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── ingress.yaml
│   ├── gateway.yaml
│   ├── mysql-deployment.yaml
│   ├── mysql-pv.yaml
│   └── mysql-secret.yaml
└── helm-chart/
    └── pizza-app/
        ├── Chart.yaml
        ├── values.yaml
        └── templates/
            ├── backend-deployment.yaml
            ├── frontend-deployment.yaml
            ├── notification-deployment.yaml
            ├── mysql-deployment.yaml
            ├── mysql-pv.yaml
            ├── mysql-secret.yaml
            ├── ingress.yaml
            └── gateway.yaml
```

## Captures d'écran

[Insérez ici des captures d'écran de l'application en fonctionnement]

## Déploiement dans le cloud

Pour déployer dans Google Cloud Platform:

1. Créer un cluster GKE:
```
gcloud container clusters create pizza-cluster --zone europe-west1-b --num-nodes 3
```

2. Configurer kubectl:
```
gcloud container clusters get-credentials pizza-cluster --zone europe-west1-b
```

3. Déployer l'application avec Helm:
```
helm install pizza-app ./helm-chart/pizza-app
```

## Tests

Pour tester l'application, accédez à l'URL frontend et essayez de:
1. Parcourir le menu de pizzas
2. Ajouter des pizzas au panier
3. Passer une commande avec vos coordonnées
4. Vérifier que vous recevez une confirmation