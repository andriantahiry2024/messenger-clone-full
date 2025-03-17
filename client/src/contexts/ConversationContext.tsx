'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { socketService } from '../services/socketService';
import { useAuth } from './AuthContext';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  senderName?: string;
  senderAvatar?: string;
}

export interface Conversation {
  id: string;
  name: string;
  participants: Array<{
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    status?: string;
  }>;
  lastMessage?: Message;
  unreadCount: number;
  isGroup: boolean;
  avatar?: string;
  isOnline?: boolean;
}

export interface ConversationContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  loadConversations: () => Promise<void>;
  loadConversation: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  markAsRead: (conversationId: string, messageId: string) => Promise<void>;
  createConversation: (participantIds: string[], name?: string, isGroup?: boolean) => Promise<Conversation>;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const ConversationProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Abonnement aux événements socket
  useEffect(() => {
    if (!isAuthenticated || !socketService.isConnected()) return;

    // Écouter les nouveaux messages
    socketService.on('new_message', (message: Message) => {
      // Mettre à jour les messages si on est dans la conversation concernée
      if (currentConversation && currentConversation.id === message.conversationId) {
        setMessages(prevMessages => [...prevMessages, message]);
      }

      // Mettre à jour la liste des conversations
      setConversations(prevConversations => 
        prevConversations.map(conv => {
          if (conv.id === message.conversationId) {
            return {
              ...conv,
              lastMessage: message,
              unreadCount: user && message.senderId !== user.id 
                ? (conv.unreadCount || 0) + 1 
                : conv.unreadCount
            };
          }
          return conv;
        })
      );
    });

    // Écouter les changements de statut en ligne/hors ligne
    socketService.on('user_status_changed', ({ userId, status }) => {
      // Mettre à jour le statut dans les conversations
      setConversations(prevConversations => 
        prevConversations.map(conv => {
          // Pour les conversations non groupées, vérifier si l'autre participant est l'utilisateur concerné
          if (!conv.isGroup && conv.participants.some(p => p.id === userId)) {
            return {
              ...conv,
              isOnline: status === 'online'
            };
          }
          return conv;
        })
      );
    });

    // Nettoyage des écouteurs lors du démontage
    return () => {
      socketService.off('new_message');
      socketService.off('user_status_changed');
    };
  }, [isAuthenticated, currentConversation, user]);

  // Charger toutes les conversations
  const loadConversations = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await api.get('/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger une conversation spécifique avec ses messages
  const loadConversation = async (conversationId: string) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      // Charger les détails de la conversation
      const convResponse = await api.get(`/conversations/${conversationId}`);
      setCurrentConversation(convResponse.data);
      
      // Charger les messages de la conversation
      const messagesResponse = await api.get(`/conversations/${conversationId}/messages`);
      setMessages(messagesResponse.data);
      
      // Marquer tous les messages non lus comme lus
      if (user) {
        await api.post(`/conversations/${conversationId}/read`);
        
        // Mettre à jour le compteur de messages non lus
        setConversations(prevConversations => 
          prevConversations.map(conv => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                unreadCount: 0
              };
            }
            return conv;
          })
        );
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  // Envoyer un message
  const sendMessage = async (conversationId: string, content: string): Promise<void> => {
    if (!isAuthenticated || !user) return;
    
    try {
      const response = await api.post(`/conversations/${conversationId}/messages`, { content });
      
      // Ajouter le message à la liste des messages
      const newMessage: Message = {
        ...response.data,
        senderName: `${user.firstName} ${user.lastName}`,
        senderAvatar: user.avatarUrl
      };
      
      setMessages(prevMessages => [...prevMessages, newMessage]);
      
      // Mettre à jour la dernière activité de la conversation
      setConversations(prevConversations => 
        prevConversations.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              lastMessage: newMessage
            };
          }
          return conv;
        })
      );
      
      // Émettre le message via socket pour les destinataires
      socketService.emit('send_message', newMessage);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw error;
    }
  };

  // Marquer un message comme lu
  const markAsRead = async (conversationId: string, messageId: string) => {
    if (!isAuthenticated) return;
    
    try {
      await api.post(`/conversations/${conversationId}/messages/${messageId}/read`);
      
      // Mettre à jour le statut du message
      setMessages(prevMessages => 
        prevMessages.map(msg => {
          if (msg.id === messageId) {
            return {
              ...msg,
              isRead: true
            };
          }
          return msg;
        })
      );
      
      // Mettre à jour le compteur de messages non lus
      setConversations(prevConversations => 
        prevConversations.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              unreadCount: Math.max(0, (conv.unreadCount || 0) - 1)
            };
          }
          return conv;
        })
      );
    } catch (error) {
      console.error('Erreur lors du marquage du message comme lu:', error);
    }
  };

  // Créer une nouvelle conversation
  const createConversation = async (
    participantIds: string[], 
    name?: string, 
    isGroup: boolean = false
  ): Promise<Conversation> => {
    if (!isAuthenticated) throw new Error('Non authentifié');
    
    try {
      const response = await api.post('/conversations', {
        participantIds,
        name,
        isGroup
      });
      
      const newConversation = response.data;
      
      // Ajouter la nouvelle conversation à la liste
      setConversations(prevConversations => [newConversation, ...prevConversations]);
      
      return newConversation;
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      throw error;
    }
  };

  // Charger les conversations au montage
  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    }
  }, [isAuthenticated]);

  return (
    <ConversationContext.Provider
      value={{
        conversations,
        currentConversation,
        messages,
        loading,
        loadConversations,
        loadConversation,
        sendMessage,
        markAsRead,
        createConversation
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = () => {
  const context = useContext(ConversationContext);
  
  if (context === undefined) {
    throw new Error('useConversation doit être utilisé à l\'intérieur d\'un ConversationProvider');
  }
  
  return context;
}; 