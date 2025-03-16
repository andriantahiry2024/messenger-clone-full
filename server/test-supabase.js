const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Récupération des variables d'environnement
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Afficher les informations de connexion (partiellement masquées pour la sécurité)
console.log(`URL Supabase: ${supabaseUrl}`);
console.log(`Clé Supabase: ${supabaseKey.substring(0, 5)}...${supabaseKey.substring(supabaseKey.length - 5)}`);

// Initialisation du client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction pour tester la connexion à Supabase
const testConnection = async () => {
  try {
    // Tester la connexion en récupérant la session
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Erreur de connexion à Supabase:', error.message);
      return false;
    }
    
    console.log('Connexion à Supabase réussie!');
    
    // Vérifier si la table users existe
    const { data: usersTable, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError && usersError.code === '42P01') {
      console.log('La table users n\'existe pas encore, elle sera créée.');
    } else if (usersError) {
      console.error('Erreur lors de la vérification de la table users:', usersError.message);
    } else {
      console.log('La table users existe déjà.');
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors du test de connexion:', error.message);
    return false;
  }
};

// Fonction pour créer les tables nécessaires
const createTables = async () => {
  try {
    // Créer la table users si elle n'existe pas
    console.log('Création de la table users...');
    
    // Vérifier si la table users existe déjà
    const { error: checkUsersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (checkUsersError && checkUsersError.code === '42P01') {
      // Créer la table users via l'API Supabase
      const { error: createUserError } = await supabase
        .from('users')
        .insert([
          {
            username: 'admin',
            email: 'admin@example.com',
            password: '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Hachage fictif
            first_name: 'Admin',
            last_name: 'User',
            status: 'online'
          }
        ]);
      
      if (createUserError) {
        console.error('Erreur lors de la création de la table users:', createUserError.message);
      } else {
        console.log('Table users créée avec succès!');
      }
    } else if (checkUsersError) {
      console.error('Erreur lors de la vérification de la table users:', checkUsersError.message);
    } else {
      console.log('La table users existe déjà.');
    }
    
    // Vérifier si la table conversations existe déjà
    console.log('Création de la table conversations...');
    const { error: checkConversationsError } = await supabase
      .from('conversations')
      .select('id')
      .limit(1);
    
    if (checkConversationsError && checkConversationsError.code === '42P01') {
      // Créer la table conversations via l'API Supabase
      const { error: createConversationError } = await supabase
        .from('conversations')
        .insert([
          {
            name: 'Conversation test',
            is_group_chat: false
          }
        ]);
      
      if (createConversationError) {
        console.error('Erreur lors de la création de la table conversations:', createConversationError.message);
      } else {
        console.log('Table conversations créée avec succès!');
      }
    } else if (checkConversationsError) {
      console.error('Erreur lors de la vérification de la table conversations:', checkConversationsError.message);
    } else {
      console.log('La table conversations existe déjà.');
    }
    
    // Vérifier si la table conversation_participants existe déjà
    console.log('Création de la table conversation_participants...');
    const { error: checkParticipantsError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .limit(1);
    
    if (checkParticipantsError && checkParticipantsError.code === '42P01') {
      // Nous ne pouvons pas créer cette table directement via l'API
      console.log('La table conversation_participants doit être créée via SQL.');
    } else if (checkParticipantsError) {
      console.error('Erreur lors de la vérification de la table conversation_participants:', checkParticipantsError.message);
    } else {
      console.log('La table conversation_participants existe déjà.');
    }
    
    // Vérifier si la table messages existe déjà
    console.log('Création de la table messages...');
    const { error: checkMessagesError } = await supabase
      .from('messages')
      .select('id')
      .limit(1);
    
    if (checkMessagesError && checkMessagesError.code === '42P01') {
      // Créer la table messages via l'API Supabase
      const { error: createMessageError } = await supabase
        .from('messages')
        .insert([
          {
            content: 'Message test',
            content_type: 'text',
            is_read: false
          }
        ]);
      
      if (createMessageError) {
        console.error('Erreur lors de la création de la table messages:', createMessageError.message);
      } else {
        console.log('Table messages créée avec succès!');
      }
    } else if (checkMessagesError) {
      console.error('Erreur lors de la vérification de la table messages:', checkMessagesError.message);
    } else {
      console.log('La table messages existe déjà.');
    }
    
    // Vérifier si la table message_reactions existe déjà
    console.log('Création de la table message_reactions...');
    const { error: checkReactionsError } = await supabase
      .from('message_reactions')
      .select('message_id')
      .limit(1);
    
    if (checkReactionsError && checkReactionsError.code === '42P01') {
      // Nous ne pouvons pas créer cette table directement via l'API
      console.log('La table message_reactions doit être créée via SQL.');
    } else if (checkReactionsError) {
      console.error('Erreur lors de la vérification de la table message_reactions:', checkReactionsError.message);
    } else {
      console.log('La table message_reactions existe déjà.');
    }
    
    console.log('Vérification des tables terminée.');
    return true;
  } catch (error) {
    console.error('Erreur lors de la création des tables:', error.message);
    return false;
  }
};

// Fonction principale pour exécuter les tests
const runTests = async () => {
  const isConnected = await testConnection();
  
  if (isConnected) {
    await createTables();
  }
};

// Exécuter les tests
runTests(); 