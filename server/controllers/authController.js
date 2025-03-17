const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { supabase } = require('../config/supabase');

// Enregistrer un nouvel utilisateur
exports.register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, avatarUrl } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
    
    // Vérifier si le nom d'utilisateur existe déjà
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà utilisé' });
    }
    
    // Créer l'utilisateur
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      avatarUrl
    });
    
    // Générer un token JWT
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Retourner les informations de l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json({
      ...userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error);
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement', error: error.message });
  }
};

// Connecter un utilisateur
exports.login = async (req, res) => {
  try {
    console.log('Tentative de connexion avec:', { email: req.body.email, passwordProvided: !!req.body.password });
    
    const { email, password } = req.body;
    
    // Vérifier si les données sont valides
    if (!email || !password) {
      console.log('Données invalides:', { email: !!email, password: !!password });
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }
    
    // Mode développement (contournement pour tester sans Supabase)
    if (process.env.NODE_ENV === 'development' && 
        (email === 'test@example.com' && password === 'password123')) {
      console.log('Mode développement: connexion de test acceptée');
      
      // Créer un utilisateur de test
      const testUser = {
        id: '123456',
        username: 'testuser',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        avatar_url: '',
        status: 'online',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Générer un token JWT
      const token = jwt.sign(
        { id: testUser.id },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );
      
      console.log('Connexion de test réussie');
      
      return res.status(200).json({
        ...testUser,
        token
      });
    }
    
    // Mode production - utiliser Supabase
    console.log('Recherche de l\'utilisateur par email...');
    const user = await User.findByEmail(email);
    
    if (!user) {
      console.log('Utilisateur non trouvé:', email);
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    console.log('Utilisateur trouvé, vérification du mot de passe...');
    
    // Vérifier le mot de passe
    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      console.log('Mot de passe incorrect pour:', email);
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    console.log('Mot de passe correct, mise à jour du statut...');
    
    // Mettre à jour le statut de l'utilisateur
    await User.updateStatus(user.id, 'online');
    
    console.log('Génération du token JWT...');
    
    // Générer un token JWT
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    console.log('Token généré avec succès, préparation de la réponse...');
    
    // Retourner les informations de l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;
    
    console.log('Connexion réussie pour:', email);
    
    res.status(200).json({
      ...userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Erreur détaillée lors de la connexion:', error);
    console.error('Stack trace:', error.stack);
    
    // Vérifier les erreurs liées à Supabase
    if (error.code) {
      console.error('Code d\'erreur Supabase:', error.code);
      console.error('Message d\'erreur Supabase:', error.message);
      console.error('Détails d\'erreur Supabase:', error.details);
    }
    
    // Vérifier les erreurs JWT
    if (error.name === 'JsonWebTokenError') {
      console.error('Erreur JWT:', error.message);
      return res.status(500).json({ message: 'Erreur de génération du token', error: error.message });
    }
    
    res.status(500).json({ message: 'Erreur lors de la connexion', error: error.message });
  }
};

// Récupérer le profil de l'utilisateur
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Retourner les informations de l'utilisateur sans le mot de passe
    const { password, ...userWithoutPassword } = user;
    
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du profil', error: error.message });
  }
};

// Mettre à jour le profil de l'utilisateur
exports.updateProfile = async (req, res) => {
  try {
    const { username, firstName, lastName, avatarUrl } = req.body;
    
    // Vérifier si le nom d'utilisateur existe déjà
    if (username) {
      const existingUsername = await User.findByUsername(username);
      if (existingUsername && existingUsername.id !== req.user.id) {
        return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà utilisé' });
      }
    }
    
    // Mettre à jour l'utilisateur
    const updatedUser = await User.update(req.user.id, {
      username,
      firstName,
      lastName,
      avatarUrl
    });
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Retourner les informations de l'utilisateur sans le mot de passe
    const { password, ...userWithoutPassword } = updatedUser;
    
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil', error: error.message });
  }
};

// Mot de passe oublié
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Aucun compte associé à cet email' });
    }
    
    // Générer un token de réinitialisation
    const resetToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Enregistrer le token dans la base de données
    await User.update(user.id, { resetToken });
    
    // Dans une application réelle, envoyer un email avec le lien de réinitialisation
    // Pour cet exemple, nous retournons simplement le token
    res.status(200).json({ 
      message: 'Instructions de réinitialisation envoyées',
      resetToken // À supprimer en production
    });
  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error);
    res.status(500).json({ message: 'Erreur lors de la demande de réinitialisation', error: error.message });
  }
};

// Réinitialiser le mot de passe
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    // Vérifier le token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ message: 'Token invalide ou expiré' });
    }
    
    // Vérifier si l'utilisateur existe
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Vérifier si le token correspond
    if (user.resetToken !== token) {
      return res.status(400).json({ message: 'Token invalide' });
    }
    
    // Mettre à jour le mot de passe
    await User.updatePassword(user.id, password);
    
    // Effacer le token de réinitialisation
    await User.update(user.id, { resetToken: null });
    
    res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    res.status(500).json({ message: 'Erreur lors de la réinitialisation du mot de passe', error: error.message });
  }
}; 