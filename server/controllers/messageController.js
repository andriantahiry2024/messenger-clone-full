const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { supabase } = require('../config/supabase');

// @desc    Récupérer les messages d'une conversation
// @route   GET /api/conversations/:id/messages
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
  try {
    const conversationId = req.params.id;
    const { limit = 50, offset = 0 } = req.query;
    
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
    
    // Récupérer les messages
    const messages = await Message.getConversationMessages(
      conversationId,
      parseInt(limit),
      parseInt(offset)
    );
    
    // Marquer les messages comme lus
    await Message.markAllAsRead(conversationId, req.user.id);
    
    res.status(200).json(messages);
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des messages', error: error.message });
  }
});

// @desc    Envoyer un message dans une conversation
// @route   POST /api/conversations/:id/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  try {
    const conversationId = req.params.id;
    const { content, contentType = 'text' } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Le contenu du message est requis' });
    }
    
    // Vérifier si l'utilisateur est un participant de la conversation
    const { data: participation, error: partError } = await supabase
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', req.user.id)
      .single();
    
    if (partError || !participation) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à envoyer des messages dans cette conversation' });
    }
    
    // Créer le message
    const message = await Message.create({
      conversationId,
      senderId: req.user.id,
      content,
      contentType
    });
    
    // Mettre à jour la date du dernier message dans la conversation
    await Conversation.updateLastMessageTime(conversationId);
    
    // Récupérer les détails de l'expéditeur
    const { data: sender, error: senderError } = await supabase
      .from('users')
      .select('id, username, first_name, last_name, avatar_url')
      .eq('id', req.user.id)
      .single();
    
    if (senderError) throw senderError;
    
    // Ajouter les détails de l'expéditeur au message
    const messageWithSender = {
      ...message,
      sender
    };
    
    res.status(201).json(messageWithSender);
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    res.status(500).json({ message: 'Erreur lors de l\'envoi du message', error: error.message });
  }
});

// @desc    Mettre à jour un message
// @route   PUT /api/messages/:id
// @access  Private
const updateMessage = asyncHandler(async (req, res) => {
  try {
    const messageId = req.params.id;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Le contenu du message est requis' });
    }
    
    // Récupérer le message
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }
    
    // Vérifier si l'utilisateur est l'expéditeur du message
    if (message.sender_id !== req.user.id) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à modifier ce message' });
    }
    
    // Mettre à jour le message
    const updatedMessage = await Message.update(messageId, { content });
    
    res.status(200).json(updatedMessage);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du message:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du message', error: error.message });
  }
});

// @desc    Supprimer un message
// @route   DELETE /api/messages/:id
// @access  Private
const deleteMessage = asyncHandler(async (req, res) => {
  try {
    const messageId = req.params.id;
    
    // Récupérer le message
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }
    
    // Vérifier si l'utilisateur est l'expéditeur du message
    if (message.sender_id !== req.user.id) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à supprimer ce message' });
    }
    
    // Supprimer le message
    await Message.delete(messageId);
    
    res.status(200).json({ message: 'Message supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du message:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du message', error: error.message });
  }
});

// @desc    Ajouter une réaction à un message
// @route   POST /api/messages/:id/reactions
// @access  Private
const addReaction = asyncHandler(async (req, res) => {
  try {
    const messageId = req.params.id;
    const { reaction } = req.body;
    
    if (!reaction) {
      return res.status(400).json({ message: 'La réaction est requise' });
    }
    
    // Récupérer le message
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }
    
    // Vérifier si l'utilisateur est un participant de la conversation
    const { data: participation, error: partError } = await supabase
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', message.conversation_id)
      .eq('user_id', req.user.id)
      .single();
    
    if (partError || !participation) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à réagir à ce message' });
    }
    
    // Ajouter la réaction
    const newReaction = await Message.addReaction(messageId, req.user.id, reaction);
    
    res.status(201).json(newReaction);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la réaction:', error);
    res.status(500).json({ message: 'Erreur lors de l\'ajout de la réaction', error: error.message });
  }
});

// @desc    Supprimer une réaction d'un message
// @route   DELETE /api/messages/:id/reactions/:reactionId
// @access  Private
const removeReaction = asyncHandler(async (req, res) => {
  try {
    const messageId = req.params.id;
    const { reaction } = req.body;
    
    if (!reaction) {
      return res.status(400).json({ message: 'La réaction est requise' });
    }
    
    // Récupérer le message
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }
    
    // Supprimer la réaction
    await Message.removeReaction(messageId, req.user.id, reaction);
    
    res.status(200).json({ message: 'Réaction supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la réaction:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la réaction', error: error.message });
  }
});

module.exports = {
  getMessages,
  sendMessage,
  updateMessage,
  deleteMessage,
  addReaction,
  removeReaction
}; 