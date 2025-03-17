require('dotenv').config();
const { supabase, testConnection } = require('./config/supabase');

// Vérifier les variables d'environnement
console.log('Vérification des variables d\'environnement:');
console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Défini' : '❌ Non défini');
console.log('- SUPABASE_KEY:', process.env.SUPABASE_KEY ? '✅ Défini' : '❌ Non défini');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '✅ Défini' : '❌ Non défini');

// Si les variables essentielles ne sont pas définies, suggérer une solution
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY || !process.env.JWT_SECRET) {
  console.log('\n⚠️ ATTENTION: Certaines variables d\'environnement ne sont pas définies.');
  console.log('Veuillez modifier le fichier .env avec vos propres valeurs:');
  console.log(`
SUPABASE_URL=votre-url-supabase
SUPABASE_KEY=votre-clé-supabase
JWT_SECRET=une-clé-secrète-pour-jwt
`);
  console.log('Pour un test rapide, vous pouvez utiliser:');
  console.log('JWT_SECRET=messenger-clone-secret-key-for-testing');
  process.exit(1);
}

// Tester la connexion à Supabase
console.log('\nTest de connexion à Supabase...');
testConnection()
  .then(async (isConnected) => {
    if (isConnected) {
      console.log('✅ Connexion à Supabase réussie!');
      
      // Vérifier les tables requises
      console.log('\nVérification des tables:');
      const tables = ['users', 'conversations', 'conversation_participants', 'messages', 'message_reactions'];
      
      for (const table of tables) {
        try {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          if (error) {
            console.log(`- ${table}: ❌ Erreur: ${error.message}`);
          } else {
            console.log(`- ${table}: ✅ OK (${count} enregistrements)`);
          }
        } catch (err) {
          console.log(`- ${table}: ❌ Erreur: ${err.message}`);
        }
      }
      
      console.log('\nTout est prêt! Vous pouvez démarrer le serveur avec "npm run dev".');
    } else {
      console.log('❌ Échec de la connexion à Supabase.');
      console.log('Vérifiez vos identifiants Supabase dans le fichier .env.');
    }
  })
  .catch((error) => {
    console.error('❌ Erreur lors du test:', error);
  }); 