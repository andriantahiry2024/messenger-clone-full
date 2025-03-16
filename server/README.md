# MessengerClone - Backend

Backend pour l'application MessengerClone, une application de messagerie instantanée similaire à Facebook Messenger.

## Technologies utilisées

- **Node.js** et **Express.js** pour le serveur API REST
- **Socket.IO** pour la communication en temps réel
- **Supabase** pour la base de données et l'authentification
- **JWT** pour l'authentification des utilisateurs

## Prérequis

- Node.js (v14 ou supérieur)
- Compte Supabase avec une base de données configurée

## Installation

1. Cloner le dépôt
```bash
git clone <url-du-repo>
cd messenger-clone/server
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
Créer un fichier `.env` à la racine du dossier server avec les variables suivantes :
```
PORT=5001
JWT_SECRET=votre_secret_jwt
SUPABASE_URL=votre_url_supabase
SUPABASE_KEY=votre_cle_supabase
CLIENT_URL=http://localhost:3000
```

4. Initialiser la base de données
Exécuter le script SQL dans la console SQL de Supabase ou via l'API :
```bash
# Le script se trouve dans le dossier sql
# Vous pouvez le copier-coller dans la console SQL de Supabase
```

5. Démarrer le serveur
```bash
# Mode développement
npm run dev

# Mode production
npm start
```

## Structure du projet

```
server/
├── config/           # Configuration (Supabase, etc.)
├── controllers/      # Contrôleurs pour les routes
├── middleware/       # Middleware (auth, etc.)
├── models/           # Modèles de données
├── routes/           # Routes API
├── sql/              # Scripts SQL pour Supabase
├── .env              # Variables d'environnement
├── package.json      # Dépendances
├── server.js         # Point d'entrée
└── README.md         # Documentation
```

## API Endpoints

### Authentification

- `POST /api/auth/register` - Inscription d'un nouvel utilisateur
- `POST /api/auth/login` - Connexion d'un utilisateur
- `GET /api/auth/profile` - Récupérer le profil de l'utilisateur connecté
- `PUT /api/auth/profile` - Mettre à jour le profil de l'utilisateur connecté
- `POST /api/auth/forgot-password` - Demander une réinitialisation de mot de passe
- `POST /api/auth/reset-password` - Réinitialiser le mot de passe

### Utilisateurs

- `GET /api/users` - Récupérer tous les utilisateurs
- `GET /api/users/:id` - Récupérer un utilisateur par son ID
- `PUT /api/users/status` - Mettre à jour le statut de l'utilisateur
- `GET /api/users/contacts` - Récupérer les contacts de l'utilisateur
- `POST /api/users/contacts` - Ajouter un contact
- `DELETE /api/users/contacts/:id` - Supprimer un contact

### Conversations

- `GET /api/conversations` - Récupérer toutes les conversations de l'utilisateur
- `POST /api/conversations` - Créer une nouvelle conversation
- `GET /api/conversations/:id` - Récupérer une conversation par son ID
- `PUT /api/conversations/:id` - Mettre à jour une conversation
- `DELETE /api/conversations/:id` - Supprimer une conversation
- `POST /api/conversations/:id/participants` - Ajouter un participant à une conversation
- `DELETE /api/conversations/:id/participants/:userId` - Supprimer un participant d'une conversation

### Messages

- `GET /api/conversations/:conversationId/messages` - Récupérer les messages d'une conversation
- `POST /api/conversations/:conversationId/messages` - Envoyer un message dans une conversation
- `PUT /api/messages/:id` - Mettre à jour un message
- `DELETE /api/messages/:id` - Supprimer un message
- `POST /api/messages/:id/reactions` - Ajouter une réaction à un message
- `DELETE /api/messages/:id/reactions` - Supprimer une réaction d'un message

## Socket.IO Events

### Émis par le client

- `message:send` - Envoyer un message
- `message:react` - Réagir à un message
- `message:read` - Marquer les messages comme lus
- `typing` - Indiquer que l'utilisateur est en train d'écrire

### Émis par le serveur

- `message:new` - Nouveau message reçu
- `message:reaction` - Nouvelle réaction à un message
- `message:read` - Messages marqués comme lus
- `user:typing` - Un utilisateur est en train d'écrire
- `user:status` - Changement de statut d'un utilisateur
- `error` - Erreur

## Licence

ISC 