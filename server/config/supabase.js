const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Récupération des variables d'environnement
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Vérification des variables d'environnement
if (!supabaseUrl || !supabaseKey) {
  console.error('Erreur: Les variables d\'environnement SUPABASE_URL et SUPABASE_KEY doivent être définies.');
  process.exit(1);
}

// Initialisation du client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction pour tester la connexion à Supabase
const testConnection = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Erreur de connexion à Supabase:', error.message);
      return false;
    }
    
    console.log('Connexion à Supabase réussie!');
    
    // Vérifier si la table users existe
    const { count, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    console.log('Supabase connecté, nombre d\'utilisateurs:', count);
    
    return true;
  } catch (error) {
    console.error('Erreur lors du test de connexion:', error.message);
    return false;
  }
};

// Exporter le client Supabase et la fonction de test
module.exports = {
  supabase,
  testConnection
}; 