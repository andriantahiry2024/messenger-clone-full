const { supabase } = require('../config/supabase');

class Message {
  /**
   * Créer un nouveau message
   * @param {Object} messageData - Données du message
   * @returns {Object} Message créé
   */
  static async create({ conversationId, senderId, content, contentType = 'text' }) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content,
          content_type: contentType,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la création du message:', error);
      throw error;
    }
  }

  /**
   * Récupérer un message par son ID
   * @param {string} id - ID du message
   * @returns {Object} Message trouvé
   */
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération du message:', error);
      throw error;
    }
  }

  /**
   * Récupérer les messages d'une conversation
   * @param {string} conversationId - ID de la conversation
   * @param {number} limit - Nombre de messages à récupérer
   * @param {number} offset - Offset pour la pagination
   * @returns {Array} Messages trouvés
   */
  static async getConversationMessages(conversationId, limit = 50, offset = 0) {
    try {
      // Récupérer les messages
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id (
            id,
            username,
            first_name,
            last_name,
            avatar_url
          ),
          reactions (
            id,
            user_id,
            reaction,
            created_at
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Pour chaque message, récupérer les informations des utilisateurs qui ont réagi
      const messagesWithReactionUsers = await Promise.all(
        messages.map(async (message) => {
          if (message.reactions && message.reactions.length > 0) {
            const userIds = [...new Set(message.reactions.map(r => r.user_id))];
            
            const { data: users, error: usersError } = await supabase
              .from('users')
              .select('id, username, first_name, last_name, avatar_url')
              .in('id', userIds);
            
            if (usersError) throw usersError;
            
            // Ajouter les informations des utilisateurs aux réactions
            const reactionsWithUsers = message.reactions.map(reaction => {
              const user = users.find(u => u.id === reaction.user_id);
              return {
                ...reaction,
                user
              };
            });
            
            return {
              ...message,
              reactions: reactionsWithUsers
            };
          }
          
          return message;
        })
      );

      return messagesWithReactionUsers;
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un message
   * @param {string} id - ID du message
   * @param {Object} updateData - Données à mettre à jour
   * @returns {Object} Message mis à jour
   */
  static async update(id, updateData) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du message:', error);
      throw error;
    }
  }

  /**
   * Supprimer un message
   * @param {string} id - ID du message
   * @returns {boolean} Succès de la suppression
   */
  static async delete(id) {
    try {
      // Supprimer d'abord les réactions associées
      const { error: reactionsError } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', id);

      if (reactionsError) throw reactionsError;

      // Puis supprimer le message
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error);
      throw error;
    }
  }

  /**
   * Ajouter une réaction à un message
   * @param {string} messageId - ID du message
   * @param {string} userId - ID de l'utilisateur
   * @param {string} reaction - Emoji de réaction
   * @returns {Object} Réaction créée
   */
  static async addReaction(messageId, userId, reaction) {
    try {
      // Vérifier si la réaction existe déjà
      const { data: existingReaction, error: checkError } = await supabase
        .from('message_reactions')
        .select('*')
        .eq('message_id', messageId)
        .eq('user_id', userId)
        .eq('reaction', reaction)
        .single();

      if (!checkError && existingReaction) {
        return existingReaction;
      }

      // Créer la réaction
      const { data, error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: userId,
          reaction,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la réaction:', error);
      throw error;
    }
  }

  /**
   * Supprimer une réaction d'un message
   * @param {string} messageId - ID du message
   * @param {string} userId - ID de l'utilisateur
   * @param {string} reaction - Emoji de réaction à supprimer
   * @returns {boolean} Succès de la suppression
   */
  static async removeReaction(messageId, userId, reaction) {
    try {
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', userId)
        .eq('reaction', reaction);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la réaction:', error);
      throw error;
    }
  }

  /**
   * Marquer tous les messages d'une conversation comme lus pour un utilisateur
   * @param {string} conversationId - ID de la conversation
   * @param {string} userId - ID de l'utilisateur
   * @returns {boolean} Succès de l'opération
   */
  static async markAllAsRead(conversationId, userId) {
    try {
      // Récupérer tous les messages non lus de la conversation
      const { data: unreadMessages, error: fetchError } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .not('read_by', 'cs', `{${userId}}`);

      if (fetchError) throw fetchError;

      // Si aucun message non lu, retourner
      if (!unreadMessages || unreadMessages.length === 0) {
        return true;
      }

      // Pour chaque message, ajouter l'utilisateur à la liste des lecteurs
      const updatePromises = unreadMessages.map(async (message) => {
        const { data: currentMessage, error: getError } = await supabase
          .from('messages')
          .select('read_by')
          .eq('id', message.id)
          .single();

        if (getError) throw getError;

        const readBy = currentMessage.read_by || [];
        if (!readBy.includes(userId)) {
          readBy.push(userId);

          const { error: updateError } = await supabase
            .from('messages')
            .update({ read_by: readBy })
            .eq('id', message.id);

          if (updateError) throw updateError;
        }
      });

      await Promise.all(updatePromises);
      return true;
    } catch (error) {
      console.error('Erreur lors du marquage des messages comme lus:', error);
      throw error;
    }
  }
}

module.exports = Message; 