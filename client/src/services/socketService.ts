'use client';

import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  // Méthode pour se connecter au socket
  connect(token: string) {
    if (this.socket && this.socket.connected) {
      this.disconnect();
    }

    this.token = token;
    
    const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    
    this.socket = io(socketServerUrl, {
      auth: {
        token
      },
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      console.log('Connecté au serveur socket');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Erreur de connexion socket:', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Déconnecté du serveur socket:', reason);
    });

    return this.socket;
  }

  // Méthode pour se déconnecter du socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Récupérer l'instance du socket
  getSocket() {
    return this.socket;
  }

  // Vérifier si le socket est connecté
  isConnected() {
    return this.socket && this.socket.connected;
  }

  // Abonner à un événement
  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Désabonner d'un événement
  off(event: string) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  // Émettre un événement
  emit(event: string, data: any, callback?: (response: any) => void) {
    if (this.socket) {
      if (callback) {
        this.socket.emit(event, data, callback);
      } else {
        this.socket.emit(event, data);
      }
    }
  }
}

// Exporter une instance unique du service
export const socketService = new SocketService(); 