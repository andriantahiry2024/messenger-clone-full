const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getConversations,
  createConversation,
  getConversationById,
  updateConversation,
  deleteConversation,
  addParticipant,
  removeParticipant
} = require('../controllers/conversationController');
const messageRoutes = require('./messages');

// Utiliser les routes de messages pour les messages d'une conversation
router.use('/:conversationId/messages', (req, res, next) => {
  req.params.conversationId = req.params.conversationId;
  next();
}, messageRoutes);

// Routes pour les conversations
router.route('/')
  .get(protect, getConversations)
  .post(protect, createConversation);

router.route('/:id')
  .get(protect, getConversationById)
  .put(protect, updateConversation)
  .delete(protect, deleteConversation);

// Routes pour les participants
router.route('/:id/participants')
  .post(protect, addParticipant);

router.route('/:id/participants/:userId')
  .delete(protect, removeParticipant);

module.exports = router; 