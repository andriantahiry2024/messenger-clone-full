const { supabase } = require('../config/supabase');

class Conversation {
  /**
   * Créer une nouvelle conversation
   * @param {Object} conversationData - Données de la conversation
   * @returns {Object} Conversation créée
   */
  static async create({ name, isGroup, creatorId, participantIds }) {
    try {
      // S'assurer que le créateur est inclus dans les participants
      if (!participantIds.includes(creatorId)) {
        participantIds.push(creatorId);
      }

      // Créer la conversation
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({
          name,
          is_group: isGroup,
          creator_id: creatorId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Ajouter les participants
      const participantsData = participantIds.map(userId => ({
        conversation_id: conversation.id,
        user_id: userId,
        is_admin: userId === creatorId, // Le créateur est admin
        joined_at: new Date().toISOString()
      }));

      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert(participantsData);

      if (participantsError) throw participantsError;

      // Récupérer la conversation avec les participants
      return this.findById(conversation.id);
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      throw error;
    }
  }

  /**
   * Récupérer une conversation par son ID
   * @param {string} id - ID de la conversation
   * @returns {Object} Conversation trouvée
   */
  static async findById(id) {
    try {
      // Récupérer la conversation
      const { data: conversation, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Récupérer les participants
      const { data: participants, error: participantsError } = await supabase
        .from('conversation_participants')
        .select(`
          *,
          user:user_id (
            id,
            username,
            first_name,
            last_name,
            avatar_url,
            status
          )
        `)
        .eq('conversation_id', id);

      if (participantsError) throw participantsError;

      // Récupérer le dernier message
      const { data: lastMessage, error: lastMessageError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id (
            id,
            username,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('conversation_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Combiner les données
      return {
        ...conversation,
        participants: participants.map(p => ({
          ...p,
          user: p.user
        })),
        lastMessage: lastMessageError ? null : lastMessage
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la conversation:', error);
      throw error;
    }
  }

  /**
   * Récupérer toutes les conversations d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @returns {Array} Conversations trouvées
   */
  static async findByUserId(userId) {
    try {
      // Récupérer les IDs des conversations auxquelles l'utilisateur participe
      const { data: participations, error: participationsError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', userId);

      if (participationsError) throw participationsError;

      if (!participations || participations.length === 0) {
        return [];
      }

      const conversationIds = participations.map(p => p.conversation_id);

      // Récupérer les conversations
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('*')
        .in('id', conversationIds)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Pour chaque conversation, récupérer les participants et le dernier message
      const conversationsWithDetails = await Promise.all(
        conversations.map(async (conversation) => {
          // Récupérer les participants
          const { data: participants, error: participantsError } = await supabase
            .from('conversation_participants')
            .select(`
              *,
              user:user_id (
                id,
                username,
                first_name,
                last_name,
                avatar_url,
                status
              )
            `)
            .eq('conversation_id', conversation.id);

          if (participantsError) throw participantsError;

          // Récupérer le dernier message
          const { data: lastMessage, error: lastMessageError } = await supabase
            .from('messages')
            .select(`
              *,
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
            .limit(1)
            .maybeSingle();

          // Récupérer le nombre de messages non lus
          const { data: unreadCount, error: unreadCountError } = await supabase
            .from('messages')
            .select('id', { count: 'exact' })
            .eq('conversation_id', conversation.id)
            .neq('sender_id', userId)
            .not('read_by', 'cs', `{${userId}}`);

          if (unreadCountError) throw unreadCountError;

          // Combiner les données
          return {
            ...conversation,
            participants: participants.map(p => ({
              ...p,
              user: p.user
            })),
            lastMessage: lastMessageError || !lastMessage ? null : lastMessage,
            unreadCount: unreadCount.length
          };
        })
      );

      return conversationsWithDetails;
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations de l\'utilisateur:', error);
      throw error;
    }
  }

  /**
   * Trouver une conversation entre deux utilisateurs
   * @param {string} userId1 - ID du premier utilisateur
   * @param {string} userId2 - ID du deuxième utilisateur
   * @returns {Object|null} Conversation trouvée ou null
   */
  static async findBetweenUsers(userId1, userId2) {
    try {
      // Récupérer les conversations du premier utilisateur
      const { data: user1Conversations, error: user1Error } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', userId1);

      if (user1Error) throw user1Error;

      if (!user1Conversations || user1Conversations.length === 0) {
        return null;
      }

      const user1ConversationIds = user1Conversations.map(c => c.conversation_id);

      // Récupérer les conversations du deuxième utilisateur qui sont aussi dans celles du premier
      const { data: user2Conversations, error: user2Error } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', userId2)
        .in('conversation_id', user1ConversationIds);

      if (user2Error) throw user2Error;

      if (!user2Conversations || user2Conversations.length === 0) {
        return null;
      }

      const commonConversationIds = user2Conversations.map(c => c.conversation_id);

      // Récupérer les conversations non-groupe parmi les conversations communes
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('*')
        .in('id', commonConversationIds)
        .eq('is_group', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!conversations || conversations.length === 0) {
        return null;
      }

      // Vérifier que chaque conversation a exactement 2 participants
      for (const conversation of conversations) {
        const { count, error: countError } = await supabase
          .from('conversation_participants')
          .select('*', { count: 'exact' })
          .eq('conversation_id', conversation.id);

        if (countError) throw countError;

        if (count === 2) {
          // C'est une conversation directe entre les deux utilisateurs
          return this.findById(conversation.id);
        }
      }

      return null;
    } catch (error) {
      console.error('Erreur lors de la recherche de conversation entre utilisateurs:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour une conversation
   * @param {string} id - ID de la conversation
   * @param {Object} updateData - Données à mettre à jour
   * @returns {Object} Conversation mise à jour
   */
  static async update(id, updateData) {
    try {
      const { data, error } = await supabase
        .from('conversations')
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
      console.error('Erreur lors de la mise à jour de la conversation:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour la date du dernier message
   * @param {string} id - ID de la conversation
   * @returns {boolean} Succès de la mise à jour
   */
  static async updateLastMessageTime(id) {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la date du dernier message:', error);
      throw error;
    }
  }

  /**
   * Ajouter un participant à une conversation
   * @param {string} conversationId - ID de la conversation
   * @param {string} userId - ID de l'utilisateur à ajouter
   * @param {boolean} isAdmin - Si l'utilisateur est admin
   * @returns {Object} Participant ajouté
   */
  static async addParticipant(conversationId, userId, isAdmin = false) {
    try {
      // Vérifier si l'utilisateur est déjà participant
      const { data: existingParticipant, error: checkError } = await supabase
        .from('conversation_participants')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .single();

      if (!checkError && existingParticipant) {
        return existingParticipant;
      }

      // Ajouter le participant
      const { data, error } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: conversationId,
          user_id: userId,
          is_admin: isAdmin,
          joined_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du participant:', error);
      throw error;
    }
  }

  /**
   * Supprimer un participant d'une conversation
   * @param {string} conversationId - ID de la conversation
   * @param {string} userId - ID de l'utilisateur à supprimer
   * @returns {boolean} Succès de la suppression
   */
  static async removeParticipant(conversationId, userId) {
    try {
      const { error } = await supabase
        .from('conversation_participants')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du participant:', error);
      throw error;
    }
  }

  /**
   * Vérifier si un utilisateur est admin d'une conversation
   * @param {string} conversationId - ID de la conversation
   * @param {string} userId - ID de l'utilisateur
   * @returns {boolean} Si l'utilisateur est admin
   */
  static async isUserAdmin(conversationId, userId) {
    try {
      const { data, error } = await supabase
        .from('conversation_participants')
        .select('is_admin')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data.is_admin;
    } catch (error) {
      console.error('Erreur lors de la vérification du statut d\'admin:', error);
      return false;
    }
  }

  /**
   * Supprimer une conversation
   * @param {string} id - ID de la conversation
   * @returns {boolean} Succès de la suppression
   */
  static async delete(id) {
    try {
      // Supprimer d'abord les participants
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .delete()
        .eq('conversation_id', id);

      if (participantsError) throw participantsError;

      // Supprimer les réactions aux messages
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', id);

      if (messagesError) throw messagesError;

      if (messages && messages.length > 0) {
        const messageIds = messages.map(m => m.id);
        
        const { error: reactionsError } = await supabase
          .from('message_reactions')
          .delete()
          .in('message_id', messageIds);

        if (reactionsError) throw reactionsError;

        // Supprimer les messages
        const { error: deleteMessagesError } = await supabase
          .from('messages')
          .delete()
          .eq('conversation_id', id);

        if (deleteMessagesError) throw deleteMessagesError;
      }

      // Supprimer la conversation
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la conversation:', error);
      throw error;
    }
  }
}

module.exports = Conversation; 