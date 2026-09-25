const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

/**
 * Register a new user.
 * @param {object} userData - { name, email, password, role }
 * @returns {object} { user, token }
 */
const registerUser = async ({ name, email, password, role }) => {
  // Normalize email
  const normalizedEmail = email ? email.toLowerCase().trim() : '';

  // Check if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error('User already exists with this email address');
    error.statusCode = 409;
    throw error;
  }

  // Create new user (password hashing is handled in User pre-save hook)
  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    role: role || 'Worker'
  });

  // Generate token
  const token = generateToken(user._id.toString(), user.role);

  return {
    user: user.toSafeObject(),
    token
  };
};

/**
 * Login user with credentials.
 * @param {object} credentials - { email, password }
 * @returns {object} { user, token }
 */
const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error('Please provide both email and password');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Find user and explicitly include password field
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Check if account is active
  if (!user.isActive) {
    const error = new Error('Account is inactive. Please contact an administrator.');
    error.statusCode = 401;
    throw error;
  }

  // Compare passwords
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Generate token
  const token = generateToken(user._id.toString(), user.role);

  return {
    user: user.toSafeObject(),
    token
  };
};

/**
 * Get profile of currently authenticated user.
 * @param {string} userId - User ID from auth middleware
 * @returns {object} safe user object
 */
const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Account is inactive');
    error.statusCode = 401;
    throw error;
  }

  return user.toSafeObject();
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser
};
