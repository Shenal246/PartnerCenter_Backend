// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const jwtUtils = require('../utils/jwtUtils');
const db = require('../config/database');

exports.verifyToken = (req, res, next) => {
  // Retrieve token from the 'token' cookie
  const token = req.cookies.token;
  

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token
    const decoded = jwtUtils.verifyToken(token);
    req.user = decoded; // Attach decoded token data to req.user


    res.status(200).json("Token Verified");

    // next(); // Proceed to the next middleware/route handler
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

exports.verifyTokenforPartner =async (req, res, next) => {
  // Retrieve token from the 'token' cookie
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token
    const decoded = jwtUtils.verifyToken(token);
    req.user = decoded; // Attach decoded token data to req.user

    const portalid = await db.promise().query(
      'SELECT portal_id FROM partner_user WHERE id = ?',
      [req.user.id]
  );

  if (portalid.length === 0) {
      return res.status(401).json({ message: 'Invalid User' });
  }

  if (!(portalid[0][0].portal_id === decoded.portalID)) {
    return res.status(401).json({ message: 'Unauthorized' });
}
    
    res.status(200).json("Token Verified");

    // next(); // Proceed to the next middleware/route handler
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

exports.verifyTokenforPartnerFunctions =async (req, res, next) => {
  // Retrieve token from the 'token' cookie
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token
    const decoded = jwtUtils.verifyToken(token);
    req.user = decoded; // Attach decoded token data to req.user

    const portalid = await db.promise().query(
      'SELECT portal_id FROM partner_user WHERE id = ?',
      [req.user.id]
  );

  if (portalid.length === 0) {
      return res.status(401).json({ message: 'Invalid User' });
  }

  if (!(portalid[0][0].portal_id === decoded.portalID)) {
    return res.status(401).json({ message: 'Unauthorized' });
}

    next(); // Proceed to the next middleware/route handler
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

exports.verifyTokenforFunctions = (req, res, next) => {
  // Retrieve token from the 'token' cookie
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token
    const decoded = jwtUtils.verifyToken(token);
    req.user = decoded; // Attach decoded token data to req.user
    // res.status(200).json("Token Verified");

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
