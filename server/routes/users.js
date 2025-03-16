const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getUsers,
  getUserById,
  updateUserStatus,
  getUserContacts,
  addUserContact,
  removeUserContact
} = require('../controllers/userController');

// Routes pour les utilisateurs
router.route('/')
  .get(protect, getUsers);

router.route('/:id')
  .get(protect, getUserById);

router.route('/status')
  .put(protect, updateUserStatus);

// Routes pour les contacts
router.route('/contacts')
  .get(protect, getUserContacts)
  .post(protect, addUserContact);

router.route('/contacts/:id')
  .delete(protect, removeUserContact);

module.exports = router; 