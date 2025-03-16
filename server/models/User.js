const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Initialisation du client Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Modèle User pour Supabase
class User {
  // Créer un nouvel utilisateur
  static async create(userData) {
    try {
      // Hachage du mot de passe
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Préparation des données utilisateur
      const newUser = {
        username: userData.username,
        email: userData.email.toLowerCase(),
        password: hashedPassword,
        first_name: userData.firstName || '',
        last_name: userData.lastName || '',
        avatar_url: userData.avatarUrl || '',
        status: 'online',
        last_active: new Date().toISOString()
      };
      
      // Insertion dans Supabase
      const { data, error } = await supabase
        .from('users')
        .insert([newUser])
        .select();
      
      if (error) throw error;
      
      return data[0];
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  }
  
  // Trouver un utilisateur par son ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Erreur lors de la recherche de l\'utilisateur par ID:', error);
      throw error;
    }
  }
  
  // Trouver un utilisateur par son email
  static async findByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      return data;
    } catch (error) {
      console.error('Erreur lors de la recherche de l\'utilisateur par email:', error);
      throw error;
    }
  }
  
  // Trouver un utilisateur par son nom d'utilisateur
  static async findByUsername(username) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      return data;
    } catch (error) {
      console.error('Erreur lors de la recherche de l\'utilisateur par nom d\'utilisateur:', error);
      throw error;
    }
  }
  
  // Mettre à jour un utilisateur
  static async update(id, updateData) {
    try {
      // Si le mot de passe est fourni, le hacher
      if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(updateData.password, salt);
      }
      
      // Conversion des noms de champs camelCase vers snake_case
      const formattedData = {};
      if (updateData.firstName) formattedData.first_name = updateData.firstName;
      if (updateData.lastName) formattedData.last_name = updateData.lastName;
      if (updateData.avatarUrl) formattedData.avatar_url = updateData.avatarUrl;
      if (updateData.status) formattedData.status = updateData.status;
      if (updateData.password) formattedData.password = updateData.password;
      
      // Ajout de la date de mise à jour
      formattedData.updated_at = new Date().toISOString();
      
      // Mise à jour dans Supabase
      const { data, error } = await supabase
        .from('users')
        .update(formattedData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      return data[0];
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw error;
    }
  }
  
  // Mettre à jour le statut d'un utilisateur
  static async updateStatus(id, status) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          status,
          last_active: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      return data[0];
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de l\'utilisateur:', error);
      throw error;
    }
  }
  
  // Rechercher des utilisateurs
  static async search(query, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`username.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(limit);
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Erreur lors de la recherche d\'utilisateurs:', error);
      throw error;
    }
  }
  
  // Vérifier le mot de passe
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
  
  // Supprimer un utilisateur
  static async delete(id) {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      throw error;
    }
  }
}

module.exports = User; 