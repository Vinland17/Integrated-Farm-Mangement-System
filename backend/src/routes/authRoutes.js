const express = require('express');
const {
  register,
  login,
  logout,
  getMe
} = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// Public Authentication Routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected Authentication Route
router.get('/me', protect, getMe);

module.exports = router;
