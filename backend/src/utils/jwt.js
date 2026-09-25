const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT token containing userId and role.
 * @param {string} userId - User MongoDB ObjectId string
 * @param {string} role - User role (Admin | Farm Manager | Worker)
 * @returns {string} Signed JWT token string
 */
const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not configured');
  }

  return jwt.sign(
    {
      userId,
      role
    },
    secret,
    {
      expiresIn
    }
  );
};

/**
 * Verifies a JWT token using JWT_SECRET.
 * @param {string} token - JWT token string
 * @returns {object} Decoded token payload
 */
const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not configured');
  }

  return jwt.verify(token, secret);
};

module.exports = {
  generateToken,
  verifyToken
};
