'use client';

import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Créer une instance axios avec la configuration de base
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Pour envoyer les cookies avec les requêtes
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Si l'erreur est 401 (non autorisé) et que nous n'avons pas déjà essayé de rafraîchir le token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Essayer de rafraîchir le token
        const refreshResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        const { token } = refreshResponse.data;
        
        // Stocker le nouveau token
        localStorage.setItem('token', token);
        
        // Mettre à jour le header d'autorisation
        if (api.defaults.headers.common) {
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
        }
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        
        // Réessayer la requête originale
        return api(originalRequest);
      } catch (refreshError) {
        // Si le rafraîchissement échoue, rediriger vers la page de connexion
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          window.location.href = '/';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// API d'authentification
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('token');
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  
  updateProfile: async (userData: {
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    avatar?: string;
    status?: string;
  }) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },
  
  changePassword: async (passwords: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await api.put('/auth/change-password', passwords);
    return response.data;
  },
  
  requestPasswordReset: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  
  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  },
};

// API des utilisateurs
export const userAPI = {
  getUsers: async (search?: string) => {
    const response = await api.get('/users', {
      params: { search },
    });
    return response.data;
  },
  
  getUserById: async (userId: string) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
  
  updateUserStatus: async (status: string) => {
    const response = await api.put('/users/status', { status });
    return response.data;
  },
};

// API des conversations
export const conversationAPI = {
  getConversations: async () => {
    const response = await api.get('/conversations');
    return response.data;
  },
  
  getConversationById: async (conversationId: string) => {
    const response = await api.get(`/conversations/${conversationId}`);
    return response.data;
  },
  
  createConversation: async (userIds: string[]) => {
    const response = await api.post('/conversations', { userIds });
    return response.data;
  },
  
  updateConversation: async (
    conversationId: string,
    data: { name?: string; isGroup?: boolean }
  ) => {
    const response = await api.put(`/conversations/${conversationId}`, data);
    return response.data;
  },
  
  deleteConversation: async (conversationId: string) => {
    const response = await api.delete(`/conversations/${conversationId}`);
    return response.data;
  },
  
  addUserToConversation: async (conversationId: string, userId: string) => {
    const response = await api.post(`/conversations/${conversationId}/users`, {
      userId,
    });
    return response.data;
  },
  
  removeUserFromConversation: async (conversationId: string, userId: string) => {
    const response = await api.delete(
      `/conversations/${conversationId}/users/${userId}`
    );
    return response.data;
  },
};

// API des messages
export const messageAPI = {
  getMessages: async (conversationId: string, page = 1, limit = 20) => {
    const response = await api.get(`/messages`, {
      params: { conversationId, page, limit },
    });
    return response.data;
  },
  
  sendMessage: async (conversationId: string, content: string) => {
    const response = await api.post('/messages', {
      conversationId,
      content,
    });
    return response.data;
  },
  
  updateMessage: async (messageId: string, content: string) => {
    const response = await api.put(`/messages/${messageId}`, { content });
    return response.data;
  },
  
  deleteMessage: async (messageId: string) => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  },
  
  addReaction: async (messageId: string, emoji: string) => {
    const response = await api.post(`/messages/${messageId}/reactions`, {
      emoji,
    });
    return response.data;
  },
  
  removeReaction: async (messageId: string, reactionId: string) => {
    const response = await api.delete(
      `/messages/${messageId}/reactions/${reactionId}`
    );
    return response.data;
  },
  
  markAsRead: async (messageId: string) => {
    const response = await api.put(`/messages/${messageId}/read`);
    return response.data;
  },
};

export default api;