# Messenger Clone

Application de messagerie instantanée similaire à Messenger avec React, Next.js, Express et Supabase.

## 📋 Fonctionnalités

- Authentification des utilisateurs (inscription, connexion, déconnexion)
- Conversations en temps réel
- Envoi et réception de messages instantanés
- Recherche d'utilisateurs
- Création et gestion de conversations
- Interface utilisateur responsive et moderne
- Mode sombre/clair
- Statut en ligne/hors ligne des utilisateurs

## 🛠️ Technologies utilisées

### Frontend (dossier `/client`)
- Next.js (React)
- TypeScript
- Tailwind CSS
- Socket.IO (client)
- Axios

### Backend (dossier `/server`)
- Node.js
- Express.js
- Socket.IO
- Supabase (base de données)
- JWT pour l'authentification

## 🚀 Installation et démarrage

### Prérequis
- Node.js v18+
- npm ou yarn
- Compte Supabase (pour la base de données)

### Configuration

1. Cloner le dépôt
```bash
git clone https://github.com/andriantahiry2024/messenger-clone-full.git
cd messenger-clone-full
```

2. Configuration du backend
```bash
cd server
npm install
# Copier le fichier .env.example et le renommer en .env
# Remplir les variables d'environnement avec vos identifiants Supabase
npm run dev
```

3. Configuration du frontend
```bash
cd client
npm install
# Copier le fichier .env.local.example et le renommer en .env.local
# Remplir les variables d'environnement
npm run dev
```

4. Accéder à l'application
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🗃️ Structure du projet

```
messenger-clone/
├── client/              # Application frontend Next.js
│   ├── public/          # Fichiers statiques
│   ├── src/             # Code source
│   │   ├── app/         # Pages et composants
│   │   ├── components/  # Composants réutilisables
│   │   ├── contexts/    # Contextes React
│   │   ├── hooks/       # Hooks personnalisés
│   │   ├── services/    # Services d'API
│   │   └── types/       # Types TypeScript
│   └── ...
│
└── server/              # Serveur backend Express.js
    ├── controllers/     # Contrôleurs
    ├── middlewares/     # Middlewares
    ├── models/          # Modèles
    ├── routes/          # Routes API
    ├── socket/          # Logique Socket.IO
    ├── sql/             # Scripts SQL pour Supabase
    └── ...
```

## 📝 License

MIT 