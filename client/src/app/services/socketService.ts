'use client';

import { io, Socket } from 'socket.io-client';

interface SocketServiceOptions {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onReconnect?: () => void;
  onReconnectAttempt?: (attempt: number) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private options: SocketServiceOptions = {};
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.setupSocketEvents = this.setupSocketEvents.bind(this);
  }

  // Initialiser la connexion Socket.IO
  connect(token: string, options: SocketServiceOptions = {}) {
    if (this.socket && this.isConnected) {
      console.log('Socket already connected');
      return;
    }

    this.options = options;

    // Créer une nouvelle instance Socket.IO
    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5002', {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    this.setupSocketEvents();
  }

  // Configurer les événements Socket.IO
  private setupSocketEvents() {
    if (!this.socket) return;

    // Événement de connexion
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      if (this.options.onConnect) {
        this.options.onConnect();
      }
    });

    // Événement de déconnexion
    this.socket.on('disconnect', (reason: string) => {
      console.log(`Socket disconnected: ${reason}`);
      this.isConnected = false;
      
      if (this.options.onDisconnect) {
        this.options.onDisconnect();
      }
    });

    // Événement d'erreur
    this.socket.on('error', (error: Error) => {
      console.error('Socket error:', error);
      
      if (this.options.onError) {
        this.options.onError(error);
      }
    });

    // Événement de reconnexion
    this.socket.on('reconnect', () => {
      console.log('Socket reconnected');
      this.isConnected = true;
      
      if (this.options.onReconnect) {
        this.options.onReconnect();
      }
    });

    // Événement de tentative de reconnexion
    this.socket.on('reconnect_attempt', (attempt: number) => {
      console.log(`Socket reconnect attempt: ${attempt}`);
      this.reconnectAttempts = attempt;
      
      if (this.options.onReconnectAttempt) {
        this.options.onReconnectAttempt(attempt);
      }
    });

    // Événement d'échec de reconnexion
    this.socket.on('reconnect_failed', () => {
      console.log('Socket reconnect failed');
      this.isConnected = false;
    });
  }

  // Se déconnecter du serveur Socket.IO
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('Socket disconnected by client');
    }
  }

  // Écouter un événement
  on<T>(event: string, callback: (data: T) => void) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    this.socket.on(event, callback);
  }

  // Arrêter d'écouter un événement
  off(event: string) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    this.socket.off(event);
  }

  // Émettre un événement
  emit<T>(event: string, data: T) {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit(event, data);
  }

  // Vérifier si le socket est connecté
  isSocketConnected() {
    return this.isConnected;
  }

  // Obtenir le nombre de tentatives de reconnexion
  getReconnectAttempts() {
    return this.reconnectAttempts;
  }
}

// Exporter une instance unique du service
const socketService = new SocketService();
export default socketService; 