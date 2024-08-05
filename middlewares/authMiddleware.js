// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const jwtUtils = require('../utils/jwtUtils');

exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwtUtils.verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

exports.isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};
