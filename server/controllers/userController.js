const User = require('../models/User');
const { supabase } = require('../config/supabase');

// @desc    Récupérer tous les utilisateurs
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    let users;
    
    if (search) {
      // Rechercher des utilisateurs par nom, email, etc.
      users = await User.search(search);
    } else {
      // Récupérer tous les utilisateurs
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(50);
      
      if (error) throw error;
      users = data;
    }
    
    // Exclure le mot de passe des résultats
    const usersWithoutPassword = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.status(200).json(usersWithoutPassword);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs', error: error.message });
  }
};

// @desc    Récupérer un utilisateur par ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Exclure le mot de passe
    const { password, ...userWithoutPassword } = user;
    
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur', error: error.message });
  }
};

// @desc    Mettre à jour le statut de l'utilisateur
// @route   PUT /api/users/status
// @access  Private
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Le statut est requis' });
    }
    
    const updatedUser = await User.updateStatus(req.user.id, status);
    
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut', error: error.message });
  }
};

// @desc    Récupérer les contacts de l'utilisateur
// @route   GET /api/users/contacts
// @access  Private
const getUserContacts = async (req, res) => {
  try {
    // Récupérer les contacts de l'utilisateur
    const { data: userContacts, error: contactsError } = await supabase
      .from('user_contacts')
      .select('contact_id')
      .eq('user_id', req.user.id);
    
    if (contactsError) throw contactsError;
    
    if (userContacts.length === 0) {
      return res.status(200).json([]);
    }
    
    // Récupérer les détails des contacts
    const contactIds = userContacts.map(contact => contact.contact_id);
    
    const { data: contacts, error: usersError } = await supabase
      .from('users')
      .select('id, username, email, first_name, last_name, avatar_url, status, last_active')
      .in('id', contactIds);
    
    if (usersError) throw usersError;
    
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Erreur lors de la récupération des contacts:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des contacts', error: error.message });
  }
};

// @desc    Ajouter un contact
// @route   POST /api/users/contacts
// @access  Private
const addUserContact = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'L\'ID de l\'utilisateur est requis' });
    }
    
    // Vérifier si l'utilisateur existe
    const contactUser = await User.findById(userId);
    if (!contactUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Vérifier si le contact existe déjà
    const { data: existingContact, error: checkError } = await supabase
      .from('user_contacts')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('contact_id', userId)
      .single();
    
    if (!checkError && existingContact) {
      return res.status(400).json({ message: 'Ce contact existe déjà' });
    }
    
    // Ajouter le contact
    const { data, error } = await supabase
      .from('user_contacts')
      .insert([{
        user_id: req.user.id,
        contact_id: userId,
        created_at: new Date().toISOString()
      }])
      .select();
    
    if (error) throw error;
    
    // Récupérer les détails du contact ajouté
    const { password, ...contactWithoutPassword } = contactUser;
    
    res.status(201).json({
      message: 'Contact ajouté avec succès',
      contact: contactWithoutPassword
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du contact:', error);
    res.status(500).json({ message: 'Erreur lors de l\'ajout du contact', error: error.message });
  }
};

// @desc    Supprimer un contact
// @route   DELETE /api/users/contacts/:id
// @access  Private
const removeUserContact = async (req, res) => {
  try {
    const contactId = req.params.id;
    
    // Supprimer le contact
    const { error } = await supabase
      .from('user_contacts')
      .delete()
      .eq('user_id', req.user.id)
      .eq('contact_id', contactId);
    
    if (error) throw error;
    
    res.status(200).json({ message: 'Contact supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du contact:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du contact', error: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUserStatus,
  getUserContacts,
  addUserContact,
  removeUserContact
}; 