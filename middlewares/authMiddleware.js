// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const jwtUtils = require('../utils/jwtUtils');

exports.verifyToken = (req, res, next) => {
  // Retrieve token from the 'token' cookie
  const token = req.cookies.token;

  console.log("wsedds-----", token);


  // If no token is found, return 401 Unauthorized
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token
    const decoded = jwtUtils.verifyToken(token);
    req.user = decoded; // Attach decoded token data to req.user
    res.status(200).json("Token Verified");
    console.log("Token Verified");

    next(); // Proceed to the next middleware/route handler
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};


exports.isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};
