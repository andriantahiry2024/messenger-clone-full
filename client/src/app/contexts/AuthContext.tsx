'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '../services/api';
import socketService from '../services/socketService';

// Définir le type pour l'utilisateur
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

// Définir le type pour le contexte d'authentification
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (userData: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
}

// Créer le contexte d'authentification
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Props pour le fournisseur d'authentification
interface AuthProviderProps {
  children: ReactNode;
}

// Fournisseur d'authentification
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Vérifier si l'utilisateur est authentifié au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        const userData = await authAPI.getProfile();
        setUser(userData);
        setIsAuthenticated(true);
        
        // Connecter le socket avec le token
        socketService.connect(token, {
          onConnect: () => {
            console.log('Socket connected in AuthContext');
          },
          onDisconnect: () => {
            console.log('Socket disconnected in AuthContext');
          },
          onError: (error) => {
            console.error('Socket error in AuthContext:', error);
          }
        });
      } catch (error) {
        console.error('Error checking authentication:', error);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Nettoyer le socket à la déconnexion
    return () => {
      socketService.disconnect();
    };
  }, []);

  // Fonction de connexion
  const login = async (email: string, password: string, remember = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { user, token } = await authAPI.login(email, password);
      
      // Stocker le token dans le localStorage ou sessionStorage selon l'option "remember"
      if (remember) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }
      
      setUser(user);
      setIsAuthenticated(true);
      
      // Connecter le socket avec le token
      socketService.connect(token);
      
      // Rediriger vers la page de chat
      router.push('/chat');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction d'inscription
  const register = async (userData: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { user, token } = await authAPI.register(userData);
      
      // Stocker le token dans le localStorage
      localStorage.setItem('token', token);
      
      setUser(user);
      setIsAuthenticated(true);
      
      // Connecter le socket avec le token
      socketService.connect(token);
      
      // Rediriger vers la page de chat
      router.push('/chat');
    } catch (error: any) {
      console.error('Register error:', error);
      setError(error.response?.data?.message || 'Erreur d\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    setIsLoading(true);
    
    try {
      await authAPI.logout();
      
      // Supprimer le token du localStorage et sessionStorage
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      
      // Déconnecter le socket
      socketService.disconnect();
      
      setUser(null);
      setIsAuthenticated(false);
      
      // Rediriger vers la page de connexion
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de mise à jour du profil
  const updateProfile = async (userData: Partial<User>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedUser = await authAPI.updateProfile(userData);
      setUser(updatedUser);
    } catch (error: any) {
      console.error('Update profile error:', error);
      setError(error.response?.data?.message || 'Erreur de mise à jour du profil');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour effacer les erreurs
  const clearError = () => {
    setError(null);
  };

  // Valeur du contexte
  const value = {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    updateProfile,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 