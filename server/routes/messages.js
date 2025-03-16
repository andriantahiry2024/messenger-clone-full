const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/authMiddleware');
const {
  getMessages,
  sendMessage,
  updateMessage,
  deleteMessage,
  addReaction,
  removeReaction
} = require('../controllers/messageController');

// Routes pour les messages d'une conversation
// /api/conversations/:conversationId/messages
router.route('/')
  .get(protect, getMessages)
  .post(protect, sendMessage);

// Routes pour un message spécifique
// /api/messages/:id
router.route('/:id')
  .put(protect, updateMessage)
  .delete(protect, deleteMessage);

// Routes pour les réactions
// /api/messages/:id/reactions
router.route('/:id/reactions')
  .post(protect, addReaction)
  .delete(protect, removeReaction);

module.exports = router; 