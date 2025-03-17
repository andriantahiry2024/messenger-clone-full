'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { socketService } from '../services/socketService';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatarUrl?: string;
  status?: string;
  bio?: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const storedToken = localStorage.getItem('authToken');
        
        if (storedToken) {
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          const response = await api.get('/auth/me');
          setUser(response.data);
          setIsAuthenticated(true);
          
          // Connecter au service de socket avec le token
          socketService.connect(storedToken);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du statut d'authentification:", error);
        localStorage.removeItem('authToken');
        api.defaults.headers.common['Authorization'] = '';
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
    
    return () => {
      // Déconnecter du service de socket lors du nettoyage
      socketService.disconnect();
    };
  }, []);
  
  const register = async (data: RegisterData) => {
    try {
      const response = await api.post('/auth/register', data);
      const { token, user } = response.data;
      
      localStorage.setItem('authToken', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setIsAuthenticated(true);
      
      // Connecter au service de socket avec le token
      socketService.connect(token);
    } catch (error: any) {
      if (error.response && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Une erreur est survenue lors de l\'inscription');
    }
  };
  
  const login = async (data: LoginData) => {
    try {
      const response = await api.post('/auth/login', data);
      const { token, user } = response.data;
      
      localStorage.setItem('authToken', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setIsAuthenticated(true);
      
      // Connecter au service de socket avec le token
      socketService.connect(token);
    } catch (error: any) {
      if (error.response && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Email ou mot de passe incorrect');
    }
  };
  
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('authToken');
      api.defaults.headers.common['Authorization'] = '';
      
      setUser(null);
      setIsAuthenticated(false);
      
      // Déconnecter du service de socket
      socketService.disconnect();
    }
  };
  
  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await api.put('/users/profile', data);
      setUser(response.data);
    } catch (error: any) {
      if (error.response && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Une erreur est survenue lors de la mise à jour du profil');
    }
  };
  
  const forgotPassword = async (email: string) => {
    try {
      await api.post('/auth/forgot-password', { email });
    } catch (error: any) {
      if (error.response && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Une erreur est survenue lors de l\'envoi de l\'email de réinitialisation');
    }
  };
  
  const resetPassword = async (token: string, password: string) => {
    try {
      await api.post('/auth/reset-password', { token, password });
    } catch (error: any) {
      if (error.response && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Une erreur est survenue lors de la réinitialisation du mot de passe');
    }
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      register,
      login,
      logout,
      updateProfile,
      forgotPassword,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  
  return context;
}; 