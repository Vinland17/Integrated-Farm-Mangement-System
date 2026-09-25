const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');

/**
 * Authentication Middleware.
 * 1. Reads JWT from HTTP-only cookie (`token`) or Authorization header (`Bearer <token>`).
 * 2. Verifies the token and extracts user ID.
 * 3. Finds user in database.
 * 4. Checks isActive flag.
 * 5. Attaches authenticated user to req.user.
 * 6. Passes execution to next().
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Extract token from cookies or Authorization header
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: Token missing or invalid cookie'
    });
  }

  try {
    // 2. Verify token
    const decoded = verifyToken(token);

    // 3. Find user by ID
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: User no longer exists'
      });
    }

    // 4. Check isActive flag
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: User account is inactive'
      });
    }

    // 5. Attach safe user object to request
    req.user = user.toSafeObject();

    // 6. Continue
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: Token verification failed'
    });
  }
};

module.exports = protect;
