const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cookieParser = require('cookie-parser');
const { supabase, testConnection } = require('./config/supabase');
const routes = require('./routes');
const { protect } = require('./middleware/authMiddleware');
const jwt = require('jsonwebtoken');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const conversationRoutes = require('./routes/conversations');
const messageRoutes = require('./routes/messages');

// Middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Charger les variables d'environnement
dotenv.config();

// Initialiser l'application Express
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes API
app.use('/api', routes);

// Route de test
app.get('/', (req, res) => {
  res.send('API MessengerClone est en ligne!');
});

// Initialiser Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware Socket.IO pour l'authentification
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Non autorisé - Token manquant'));
    }

    // Vérifier le token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Récupérer l'utilisateur
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, first_name, last_name, avatar_url, status')
      .eq('id', decoded.id)
      .single();
    
    if (error || !user) {
      return next(new Error('Non autorisé - Utilisateur non trouvé'));
    }
    
    socket.user = user;
    next();
  } catch (error) {
    console.error('Erreur d\'authentification Socket.IO:', error);
    next(new Error('Non autorisé - Token invalide'));
  }
});

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
  console.log(`Utilisateur connecté: ${socket.user.username} (${socket.id})`);
  
  // Mettre à jour le statut de l'utilisateur à "online"
  supabase
    .from('users')
    .update({ status: 'online', updated_at: new Date().toISOString() })
    .eq('id', socket.user.id)
    .then(() => {
      // Informer les autres utilisateurs du changement de statut
      socket.broadcast.emit('user:status', {
        userId: socket.user.id,
        status: 'online'
      });
    });
  
  // Rejoindre les salles pour chaque conversation de l'utilisateur
  supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', socket.user.id)
    .then(({ data, error }) => {
      if (!error && data) {
        data.forEach(participant => {
          socket.join(`conversation:${participant.conversation_id}`);
        });
      }
    });
  
  // Écouter les nouveaux messages
  socket.on('message:send', async (data) => {
    try {
      const { conversationId, content, contentType = 'text' } = data;
      
      // Vérifier si l'utilisateur est un participant de la conversation
      const { data: participation, error: partError } = await supabase
        .from('conversation_participants')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('user_id', socket.user.id)
        .single();
      
      if (partError || !participation) {
        socket.emit('error', { message: 'Vous n\'êtes pas autorisé à envoyer des messages dans cette conversation' });
        return;
      }
      
      // Créer le message
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: socket.user.id,
          content,
          content_type: contentType,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Mettre à jour la date du dernier message dans la conversation
      await supabase
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);
      
      // Ajouter les détails de l'expéditeur au message
      const messageWithSender = {
        ...message,
        sender: {
          id: socket.user.id,
          username: socket.user.username,
          first_name: socket.user.first_name,
          last_name: socket.user.last_name,
          avatar_url: socket.user.avatar_url
        }
      };
      
      // Émettre le message à tous les participants de la conversation
      io.to(`conversation:${conversationId}`).emit('message:new', messageWithSender);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      socket.emit('error', { message: 'Erreur lors de l\'envoi du message' });
    }
  });
  
  // Écouter les réactions aux messages
  socket.on('message:react', async (data) => {
    try {
      const { messageId, reaction } = data;
      
      // Récupérer le message
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .select('conversation_id')
        .eq('id', messageId)
        .single();
      
      if (messageError || !message) {
        socket.emit('error', { message: 'Message non trouvé' });
        return;
      }
      
      // Vérifier si l'utilisateur est un participant de la conversation
      const { data: participation, error: partError } = await supabase
        .from('conversation_participants')
        .select('*')
        .eq('conversation_id', message.conversation_id)
        .eq('user_id', socket.user.id)
        .single();
      
      if (partError || !participation) {
        socket.emit('error', { message: 'Vous n\'êtes pas autorisé à réagir à ce message' });
        return;
      }
      
      // Vérifier si la réaction existe déjà
      const { data: existingReaction, error: checkError } = await supabase
        .from('message_reactions')
        .select('*')
        .eq('message_id', messageId)
        .eq('user_id', socket.user.id)
        .eq('reaction', reaction)
        .single();
      
      let reactionData;
      
      if (!checkError && existingReaction) {
        // Supprimer la réaction existante
        await supabase
          .from('message_reactions')
          .delete()
          .eq('id', existingReaction.id);
        
        reactionData = {
          messageId,
          userId: socket.user.id,
          reaction,
          action: 'remove'
        };
      } else {
        // Ajouter la nouvelle réaction
        const { data: newReaction, error } = await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: socket.user.id,
            reaction,
            created_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) throw error;
        
        reactionData = {
          messageId,
          userId: socket.user.id,
          reaction,
          action: 'add',
          user: {
            id: socket.user.id,
            username: socket.user.username,
            first_name: socket.user.first_name,
            last_name: socket.user.last_name,
            avatar_url: socket.user.avatar_url
          }
        };
      }
      
      // Émettre la réaction à tous les participants de la conversation
      io.to(`conversation:${message.conversation_id}`).emit('message:reaction', reactionData);
    } catch (error) {
      console.error('Erreur lors de la réaction au message:', error);
      socket.emit('error', { message: 'Erreur lors de la réaction au message' });
    }
  });
  
  // Écouter les changements de statut de lecture des messages
  socket.on('message:read', async (data) => {
    try {
      const { conversationId } = data;
      
      // Vérifier si l'utilisateur est un participant de la conversation
      const { data: participation, error: partError } = await supabase
        .from('conversation_participants')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('user_id', socket.user.id)
        .single();
      
      if (partError || !participation) {
        socket.emit('error', { message: 'Vous n\'êtes pas autorisé à accéder à cette conversation' });
        return;
      }
      
      // Récupérer tous les messages non lus de la conversation
      const { data: unreadMessages, error: fetchError } = await supabase
        .from('messages')
        .select('id, read_by')
        .eq('conversation_id', conversationId)
        .neq('sender_id', socket.user.id)
        .not('read_by', 'cs', `{${socket.user.id}}`);
      
      if (fetchError) throw fetchError;
      
      // Si aucun message non lu, retourner
      if (!unreadMessages || unreadMessages.length === 0) {
        return;
      }
      
      // Pour chaque message, ajouter l'utilisateur à la liste des lecteurs
      const updatePromises = unreadMessages.map(async (message) => {
        const readBy = message.read_by || [];
        if (!readBy.includes(socket.user.id)) {
          readBy.push(socket.user.id);
          
          await supabase
            .from('messages')
            .update({ read_by: readBy })
            .eq('id', message.id);
        }
      });
      
      await Promise.all(updatePromises);
      
      // Émettre l'événement de lecture à tous les participants de la conversation
      io.to(`conversation:${conversationId}`).emit('message:read', {
        conversationId,
        userId: socket.user.id
      });
    } catch (error) {
      console.error('Erreur lors du marquage des messages comme lus:', error);
      socket.emit('error', { message: 'Erreur lors du marquage des messages comme lus' });
    }
  });
  
  // Écouter les événements de frappe
  socket.on('typing', (data) => {
    const { conversationId, isTyping } = data;
    
    // Émettre l'événement de frappe à tous les participants de la conversation sauf l'émetteur
    socket.to(`conversation:${conversationId}`).emit('user:typing', {
      conversationId,
      userId: socket.user.id,
      username: socket.user.username,
      isTyping
    });
  });
  
  // Gérer la déconnexion
  socket.on('disconnect', () => {
    console.log(`Utilisateur déconnecté: ${socket.user.username} (${socket.id})`);
    
    // Mettre à jour le statut de l'utilisateur à "offline"
    supabase
      .from('users')
      .update({
        status: 'offline',
        updated_at: new Date().toISOString()
      })
      .eq('id', socket.user.id)
      .then(() => {
        // Informer les autres utilisateurs du changement de statut
        socket.broadcast.emit('user:status', {
          userId: socket.user.id,
          status: 'offline'
        });
      });
  });
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
  
  // Tester la connexion à Supabase
  try {
    await testConnection();
    console.log('Connexion à Supabase établie avec succès');
  } catch (error) {
    console.error('Erreur de connexion à Supabase:', error);
  }
});

// Gérer les erreurs non gérées
process.on('unhandledRejection', (err) => {
  console.error('Erreur non gérée:', err);
  // Ne pas fermer le serveur en production
  if (process.env.NODE_ENV === 'development') {
    server.close(() => process.exit(1));
  }
});

module.exports = { app, server, io }; 