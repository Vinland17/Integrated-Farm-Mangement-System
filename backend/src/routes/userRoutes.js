const express = require('express');
const { getMe } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get currently authenticated user's profile
 * @access  Private (Protected by authMiddleware)
 */
router.get('/profile', protect, getMe);

module.exports = router;
