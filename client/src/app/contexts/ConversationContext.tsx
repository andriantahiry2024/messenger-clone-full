'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Types
interface Message {
  id: string;
  content: string;
  time: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  isRead: boolean;
  reactions: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: string;
  isOnline: boolean;
  unreadCount: number;
  isActive: boolean;
}

interface ConversationContextType {
  conversations: Conversation[];
  currentConversation: string | null;
  messages: Record<string, Message[]>;
  isLoading: boolean;
  error: string | null;
  setCurrentConversation: (id: string) => void;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  markAsRead: (conversationId: string, messageId: string) => Promise<void>;
  addReaction: (conversationId: string, messageId: string, emoji: string) => Promise<void>;
  createConversation: (participantIds: string[]) => Promise<string>;
  searchUsers: (query: string) => Promise<any[]>;
}

// Contexte
const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

// Données de test pour les conversations
const testConversations = [
  {
    id: "1",
    name: "Pierre Bernard",
    avatar: "",
    participants: ["user1", "user2"],
    lastMessage: "Bonjour, comment ça va ?",
    lastMessageTime: "10:30",
    isOnline: true,
    unreadCount: 2,
    isActive: true,
  },
  {
    id: "2",
    name: "Marie Dupont",
    avatar: "",
    participants: ["user1", "user3"],
    lastMessage: "Tu as vu le dernier film ?",
    lastMessageTime: "Hier",
    isOnline: false,
    unreadCount: 0,
    isActive: false,
  },
  {
    id: "3",
    name: "Jean Martin",
    avatar: "",
    participants: ["user1", "user4"],
    lastMessage: "On se retrouve demain ?",
    lastMessageTime: "Lun",
    isOnline: true,
    unreadCount: 0,
    isActive: false,
  },
];

// Données de test pour les messages
const testMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "1",
      content: "Bonjour, comment ça va ?",
      time: "10:30",
      senderId: "user2",
      senderName: "Pierre Bernard",
      senderAvatar: "",
      isRead: true,
      reactions: [{ emoji: "👍", count: 1, users: ["user1"] }],
    },
    {
      id: "2",
      content: "Très bien, merci ! Et toi ?",
      time: "10:32",
      senderId: "user1",
      senderName: "Moi",
      senderAvatar: "",
      isRead: true,
      reactions: [],
    },
    {
      id: "3",
      content: "Je voulais te demander si tu étais disponible pour une réunion demain à 14h ?",
      time: "10:33",
      senderId: "user2",
      senderName: "Pierre Bernard",
      senderAvatar: "",
      isRead: true,
      reactions: [],
    },
    {
      id: "4",
      content: "Oui, pas de problème. Je serai disponible.",
      time: "10:35",
      senderId: "user1",
      senderName: "Moi",
      senderAvatar: "",
      isRead: false,
      reactions: [{ emoji: "👍", count: 1, users: ["user2"] }],
    },
  ],
  "2": [
    {
      id: "1",
      content: "Tu as vu le dernier film ?",
      time: "Hier",
      senderId: "user3",
      senderName: "Marie Dupont",
      senderAvatar: "",
      isRead: true,
      reactions: [],
    },
  ],
  "3": [
    {
      id: "1",
      content: "On se retrouve demain ?",
      time: "Lun",
      senderId: "user4",
      senderName: "Jean Martin",
      senderAvatar: "",
      isRead: true,
      reactions: [],
    },
  ],
};

export function ConversationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les conversations de l'utilisateur
  useEffect(() => {
    const loadConversations = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Dans une application réelle, nous ferions un appel API ici
        // Pour l'instant, utilisons les données de test
        setConversations(testConversations);
        setMessages(testMessages);
      } catch (err) {
        setError('Erreur lors du chargement des conversations');
        console.error('Erreur lors du chargement des conversations:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [isAuthenticated, user]);

  // Envoyer un message
  const sendMessage = async (conversationId: string, content: string) => {
    if (!user) return;

    try {
      // Dans une application réelle, nous ferions un appel API ici
      const newMessage: Message = {
        id: `${Date.now()}`,
        content,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        senderId: user.id,
        senderName: `${user.firstName} ${user.lastName}`,
        senderAvatar: user.avatar,
        isRead: false,
        reactions: [],
      };

      // Mettre à jour les messages localement
      setMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), newMessage],
      }));

      // Mettre à jour la dernière conversation
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? {
                ...conv,
                lastMessage: content,
                lastMessageTime: newMessage.time,
                isActive: true,
              }
            : conv
        )
      );
    } catch (err) {
      setError('Erreur lors de l\'envoi du message');
      console.error('Erreur lors de l\'envoi du message:', err);
    }
  };

  // Marquer un message comme lu
  const markAsRead = async (conversationId: string, messageId: string) => {
    try {
      // Dans une application réelle, nous ferions un appel API ici
      setMessages(prev => ({
        ...prev,
        [conversationId]: prev[conversationId].map(msg =>
          msg.id === messageId ? { ...msg, isRead: true } : msg
        ),
      }));

      // Mettre à jour le compteur de messages non lus
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? {
                ...conv,
                unreadCount: Math.max(0, conv.unreadCount - 1),
              }
            : conv
        )
      );
    } catch (err) {
      setError('Erreur lors du marquage du message comme lu');
      console.error('Erreur lors du marquage du message comme lu:', err);
    }
  };

  // Ajouter une réaction à un message
  const addReaction = async (conversationId: string, messageId: string, emoji: string) => {
    if (!user) return;

    try {
      // Dans une application réelle, nous ferions un appel API ici
      setMessages(prev => ({
        ...prev,
        [conversationId]: prev[conversationId].map(msg => {
          if (msg.id === messageId) {
            const existingReaction = msg.reactions.find(r => r.emoji === emoji);
            if (existingReaction) {
              // Si l'utilisateur a déjà réagi avec cet emoji, supprimer sa réaction
              if (existingReaction.users.includes(user.id)) {
                return {
                  ...msg,
                  reactions: msg.reactions.map(r =>
                    r.emoji === emoji
                      ? {
                          ...r,
                          count: r.count - 1,
                          users: r.users.filter(id => id !== user.id),
                        }
                      : r
                  ).filter(r => r.count > 0),
                };
              }
              // Sinon, ajouter sa réaction
              return {
                ...msg,
                reactions: msg.reactions.map(r =>
                  r.emoji === emoji
                    ? {
                        ...r,
                        count: r.count + 1,
                        users: [...r.users, user.id],
                      }
                    : r
                ),
              };
            }
            // Si cet emoji n'a pas encore été utilisé, ajouter une nouvelle réaction
            return {
              ...msg,
              reactions: [
                ...msg.reactions,
                { emoji, count: 1, users: [user.id] },
              ],
            };
          }
          return msg;
        }),
      }));
    } catch (err) {
      setError('Erreur lors de l\'ajout de la réaction');
      console.error('Erreur lors de l\'ajout de la réaction:', err);
    }
  };

  // Créer une nouvelle conversation
  const createConversation = async (participantIds: string[]): Promise<string> => {
    if (!user) throw new Error('Utilisateur non authentifié');

    try {
      // Dans une application réelle, nous ferions un appel API ici
      const newConversationId = `new-${Date.now()}`;
      const newConversation: Conversation = {
        id: newConversationId,
        name: "Nouvelle conversation", // À remplacer par le nom du participant
        avatar: "",
        participants: [user.id, ...participantIds],
        lastMessage: "",
        lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOnline: false,
        unreadCount: 0,
        isActive: true,
      };

      setConversations(prev => [newConversation, ...prev]);
      setMessages(prev => ({
        ...prev,
        [newConversationId]: [],
      }));

      return newConversationId;
    } catch (err) {
      setError('Erreur lors de la création de la conversation');
      console.error('Erreur lors de la création de la conversation:', err);
      throw err;
    }
  };

  // Rechercher des utilisateurs
  const searchUsers = async (query: string): Promise<any[]> => {
    try {
      // Dans une application réelle, nous ferions un appel API ici
      // Pour l'instant, retournons des données de test
      if (query.trim() === "") return [];

      return [
        { id: "101", name: "Sophie Martin", username: "sophie.martin", avatar: "" },
        { id: "102", name: "Thomas Dubois", username: "thomas.dubois", avatar: "" },
        { id: "103", name: "Julie Leroy", username: "julie.leroy", avatar: "" },
      ].filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) || 
        user.username.toLowerCase().includes(query.toLowerCase())
      );
    } catch (err) {
      setError('Erreur lors de la recherche d\'utilisateurs');
      console.error('Erreur lors de la recherche d\'utilisateurs:', err);
      return [];
    }
  };

  return (
    <ConversationContext.Provider
      value={{
        conversations,
        currentConversation,
        messages,
        isLoading,
        error,
        setCurrentConversation,
        sendMessage,
        markAsRead,
        addReaction,
        createConversation,
        searchUsers,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const context = useContext(ConversationContext);
  
  if (context === undefined) {
    throw new Error('useConversation doit être utilisé à l\'intérieur d\'un ConversationProvider');
  }
  
  return context;
}