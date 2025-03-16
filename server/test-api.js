const axios = require('axios');

const API_URL = 'http://localhost:5001/api';
let token = null;

// Fonction pour afficher les réponses
const logResponse = (title, data) => {
  console.log(`\n=== ${title} ===`);
  console.log(JSON.stringify(data, null, 2));
};

// Fonction pour gérer les erreurs
const handleError = (error, title) => {
  console.error(`\n!!! ERREUR - ${title} !!!`);
  if (error.response) {
    console.error(`Status: ${error.response.status}`);
    console.error('Data:', error.response.data);
  } else if (error.request) {
    console.error('Pas de réponse reçue du serveur');
  } else {
    console.error('Erreur:', error.message);
  }
  console.error('Stack:', error.stack);
};

// Fonction pour enregistrer un utilisateur
const registerUser = async () => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      username: `user_${Date.now()}`,
      email: `user_${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    });
    
    logResponse('Enregistrement utilisateur', response.data);
    token = response.data.token;
    return response.data;
  } catch (error) {
    handleError(error, 'Enregistrement utilisateur');
    return null;
  }
};

// Fonction pour connecter un utilisateur
const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    
    logResponse('Connexion utilisateur', response.data);
    token = response.data.token;
    return response.data;
  } catch (error) {
    handleError(error, 'Connexion utilisateur');
    return null;
  }
};

// Fonction pour récupérer le profil utilisateur
const getUserProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    logResponse('Profil utilisateur', response.data);
    return response.data;
  } catch (error) {
    handleError(error, 'Profil utilisateur');
    return null;
  }
};

// Fonction pour créer une conversation
const createConversation = async (participantIds) => {
  try {
    const response = await axios.post(
      `${API_URL}/conversations`,
      {
        participantIds,
        isGroupChat: false
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    logResponse('Création conversation', response.data);
    return response.data;
  } catch (error) {
    handleError(error, 'Création conversation');
    return null;
  }
};

// Fonction pour envoyer un message
const sendMessage = async (conversationId, content) => {
  try {
    const response = await axios.post(
      `${API_URL}/conversations/${conversationId}/messages`,
      {
        content,
        contentType: 'text'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    logResponse('Envoi message', response.data);
    return response.data;
  } catch (error) {
    handleError(error, 'Envoi message');
    return null;
  }
};

// Fonction pour récupérer les messages d'une conversation
const getMessages = async (conversationId) => {
  try {
    const response = await axios.get(
      `${API_URL}/conversations/${conversationId}/messages`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    logResponse('Messages conversation', response.data);
    return response.data;
  } catch (error) {
    handleError(error, 'Messages conversation');
    return null;
  }
};

// Fonction principale pour exécuter les tests
const runTests = async () => {
  console.log('=== DÉBUT DES TESTS API ===');
  
  // Enregistrer un utilisateur
  const user = await registerUser();
  if (!user) {
    console.log('Échec de l\'enregistrement, tentative de connexion avec un utilisateur existant...');
    await loginUser('user_test@example.com', 'password123');
  }
  
  // Si nous avons un token, continuer les tests
  if (token) {
    // Récupérer le profil
    const profile = await getUserProfile();
    
    // Créer une conversation (avec soi-même pour le test)
    const conversation = await createConversation([profile._id]);
    
    if (conversation) {
      // Envoyer un message
      const message = await sendMessage(
        conversation.id,
        'Ceci est un message de test!'
      );
      
      // Récupérer les messages
      if (message) {
        await getMessages(conversation.id);
      }
    }
  }
  
  console.log('\n=== FIN DES TESTS API ===');
};

// Exécuter les tests
runTests(); 