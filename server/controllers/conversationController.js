const asyncHandler = require('express-async-handler');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { supabase } = require('../config/supabase');

// @desc    Récupérer toutes les conversations de l'utilisateur
// @route   GET /api/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
  try {
    // Récupérer les conversations de l'utilisateur
    const conversations = await Conversation.getUserConversations(req.user.id);
    
    // Pour chaque conversation, récupérer les participants et le dernier message
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conversation) => {
        // Récupérer les participants
        const participants = await Conversation.getParticipants(conversation.id);
        
        // Récupérer le dernier message
        const { data: lastMessages, error: messagesError } = await supabase
          .from('messages')
          .select(`
            id,
            content,
            content_type,
            is_read,
            created_at,
            sender:sender_id (
              id,
              username,
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (messagesError) throw messagesError;
        
        return {
          ...conversation,
          participants,
          lastMessage: lastMessages.length > 0 ? lastMessages[0] : null
        };
      })
    );
    
    res.status(200).json(conversationsWithDetails);
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des conversations', error: error.message });
  }
});

// @desc    Créer une nouvelle conversation
// @route   POST /api/conversations
// @access  Private
const createConversation = asyncHandler(async (req, res) => {
  try {
    const { participantIds, isGroupChat, name } = req.body;
    
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({ message: 'Les participants sont requis' });
    }
    
    // Vérifier si tous les participants existent
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .in('id', participantIds);
    
    if (usersError) throw usersError;
    
    if (users.length !== participantIds.length) {
      return res.status(400).json({ message: 'Un ou plusieurs participants n\'existent pas' });
    }
    
    // Ajouter l'utilisateur actuel aux participants s'il n'y est pas déjà
    if (!participantIds.includes(req.user.id)) {
      participantIds.push(req.user.id);
    }
    
    // Vérifier si une conversation non-groupe existe déjà entre ces participants
    if (!isGroupChat && participantIds.length === 2) {
      // Récupérer les conversations auxquelles l'utilisateur participe
      const { data: userParticipations, error: userPartError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', req.user.id);
      
      if (userPartError) throw userPartError;
      
      if (userParticipations.length > 0) {
        const userConversationIds = userParticipations.map(p => p.conversation_id);
        
        // Récupérer les conversations auxquelles l'autre participant participe
        const { data: otherParticipations, error: otherPartError } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', participantIds.find(id => id !== req.user.id))
          .in('conversation_id', userConversationIds);
        
        if (otherPartError) throw otherPartError;
        
        if (otherParticipations.length > 0) {
          // Vérifier si l'une de ces conversations est une conversation non-groupe
          const { data: existingConversations, error: convError } = await supabase
            .from('conversations')
            .select('*')
            .in('id', otherParticipations.map(p => p.conversation_id))
            .eq('is_group_chat', false);
          
          if (convError) throw convError;
          
          if (existingConversations.length > 0) {
            // Une conversation existe déjà, récupérer les détails
            const existingConversation = existingConversations[0];
            const participants = await Conversation.getParticipants(existingConversation.id);
            
            return res.status(200).json({
              ...existingConversation,
              participants,
              message: 'Conversation existante récupérée'
            });
          }
        }
      }
    }
    
    // Créer une nouvelle conversation
    const conversation = await Conversation.create({
      name: isGroupChat ? name : null,
      isGroupChat,
      createdBy: req.user.id,
      participantIds
    });
    
    // Récupérer les détails des participants
    const participants = await Conversation.getParticipants(conversation.id);
    
    res.status(201).json({
      ...conversation,
      participants
    });
  } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la conversation', error: error.message });
  }
});

// @desc    Récupérer une conversation par ID
// @route   GET /api/conversations/:id
// @access  Private
const getConversationById = asyncHandler(async (req, res) => {
  try {
    const conversationId = req.params.id;
    
    // Vérifier si l'utilisateur est un participant de la conversation
    const { data: participation, error: partError } = await supabase
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', req.user.id)
      .single();
    
    if (partError || !participation) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à accéder à cette conversation' });
    }
    
    // Récupérer la conversation
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }
    
    // Récupérer les participants
    const participants = await Conversation.getParticipants(conversationId);
    
    // Récupérer les messages
    const messages = await Message.getConversationMessages(conversationId);
    
    // Marquer tous les messages comme lus
    await Message.markAllAsRead(conversationId, req.user.id);
    
    res.status(200).json({
      ...conversation,
      participants,
      messages
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la conversation:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la conversation', error: error.message });
  }
});

// @desc    Mettre à jour une conversation
// @route   PUT /api/conversations/:id
// @access  Private
const updateConversation = asyncHandler(async (req, res) => {
  try {
    const conversationId = req.params.id;
    const { name, isGroupChat } = req.body;
    
    // Vérifier si l'utilisateur est un participant de la conversation
    const { data: participation, error: partError } = await supabase
      .from('conversation_participants')
      .select('is_admin')
      .eq('conversation_id', conversationId)
      .eq('user_id', req.user.id)
      .single();
    
    if (partError || !participation) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à modifier cette conversation' });
    }
    
    // Pour les conversations de groupe, vérifier si l'utilisateur est admin
    const conversation = await Conversation.findById(conversationId);
    
    if (conversation.is_group_chat && !participation.is_admin) {
      return res.status(403).json({ message: 'Seuls les administrateurs peuvent modifier cette conversation' });
    }
    
    // Mettre à jour la conversation
    const updatedConversation = await Conversation.update(conversationId, {
      name,
      isGroupChat
    });
    
    res.status(200).json(updatedConversation);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la conversation:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la conversation', error: error.message });
  }
});

// @desc    Supprimer une conversation
// @route   DELETE /api/conversations/:id
// @access  Private
const deleteConversation = asyncHandler(async (req, res) => {
  try {
    const conversationId = req.params.id;
    
    // Vérifier si l'utilisateur est un participant de la conversation
    const { data: participation, error: partError } = await supabase
      .from('conversation_participants')
      .select('is_admin')
      .eq('conversation_id', conversationId)
      .eq('user_id', req.user.id)
      .single();
    
    if (partError || !participation) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à supprimer cette conversation' });
    }
    
    // Pour les conversations de groupe, vérifier si l'utilisateur est admin
    const conversation = await Conversation.findById(conversationId);
    
    if (conversation.is_group_chat && !participation.is_admin) {
      return res.status(403).json({ message: 'Seuls les administrateurs peuvent supprimer cette conversation' });
    }
    
    // Supprimer la conversation
    await Conversation.delete(conversationId);
    
    res.status(200).json({ message: 'Conversation supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la conversation:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la conversation', error: error.message });
  }
});

// @desc    Ajouter un participant à une conversation
// @route   POST /api/conversations/:id/participants
// @access  Private
const addParticipant = asyncHandler(async (req, res) => {
  try {
    const conversationId = req.params.id;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'L\'ID de l\'utilisateur est requis' });
    }
    
    // Vérifier si l'utilisateur est un participant admin de la conversation
    const { data: participation, error: partError } = await supabase
      .from('conversation_participants')
      .select('is_admin')
      .eq('conversation_id', conversationId)
      .eq('user_id', req.user.id)
      .single();
    
    if (partError || !participation || !participation.is_admin) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à ajouter des participants à cette conversation' });
    }
    
    // Vérifier si l'utilisateur à ajouter existe
    const userToAdd = await User.findById(userId);
    
    if (!userToAdd) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Vérifier si l'utilisateur est déjà un participant
    const { data: existingParticipation, error: existingError } = await supabase
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .single();
    
    if (!existingError && existingParticipation) {
      return res.status(400).json({ message: 'L\'utilisateur est déjà un participant de cette conversation' });
    }
    
    // Ajouter le participant
    await Conversation.addParticipant(conversationId, userId);
    
    // Récupérer les participants mis à jour
    const participants = await Conversation.getParticipants(conversationId);
    
    res.status(200).json({
      message: 'Participant ajouté avec succès',
      participants
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du participant:', error);
    res.status(500).json({ message: 'Erreur lors de l\'ajout du participant', error: error.message });
  }
});

// @desc    Supprimer un participant d'une conversation
// @route   DELETE /api/conversations/:id/participants/:userId
// @access  Private
const removeParticipant = asyncHandler(async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.params.userId;
    
    // Vérifier si l'utilisateur est un participant admin de la conversation
    const { data: participation, error: partError } = await supabase
      .from('conversation_participants')
      .select('is_admin')
      .eq('conversation_id', conversationId)
      .eq('user_id', req.user.id)
      .single();
    
    if (partError || !participation) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à supprimer des participants de cette conversation' });
    }
    
    // Si l'utilisateur n'est pas admin, il ne peut supprimer que lui-même
    if (!participation.is_admin && userId !== req.user.id) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à supprimer d\'autres participants' });
    }
    
    // Supprimer le participant
    await Conversation.removeParticipant(conversationId, userId);
    
    // Récupérer les participants mis à jour
    const participants = await Conversation.getParticipants(conversationId);
    
    res.status(200).json({
      message: 'Participant supprimé avec succès',
      participants
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du participant:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du participant', error: error.message });
  }
});

module.exports = {
  getConversations,
  createConversation,
  getConversationById,
  updateConversation,
  deleteConversation,
  addParticipant,
  removeParticipant
}; 