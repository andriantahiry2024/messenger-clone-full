const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

/**
 * Middleware pour protéger les routes
 * Vérifie le token JWT et attache l'utilisateur à la requête
 */
exports.protect = async (req, res, next) => {
  let token;

  // Vérifier si le token est présent dans les headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extraire le token du header
      token = req.headers.authorization.split(' ')[1];

      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Récupérer l'utilisateur sans le mot de passe
      const { data: user, error } = await supabase
        .from('users')
        .select('id, username, email, first_name, last_name, avatar_url, status, created_at, updated_at')
        .eq('id', decoded.id)
        .single();

      if (error || !user) {
        return res.status(401).json({ message: 'Non autorisé, utilisateur non trouvé' });
      }

      // Attacher l'utilisateur à la requête
      req.user = user;
      next();
    } catch (error) {
      console.error('Erreur d\'authentification:', error);
      return res.status(401).json({ message: 'Non autorisé, token invalide' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Non autorisé, token manquant' });
  }
};

/**
 * Middleware pour vérifier si l'utilisateur est administrateur
 */
exports.admin = (req, res, next) => {
  if (req.user && req.user.is_admin) {
    next();
  } else {
    res.status(403).json({ message: 'Non autorisé, accès administrateur requis' });
  }
}; 