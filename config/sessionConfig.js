const session = require('express-session');

module.exports = session({
  secret: process.env.SESSION_SECRET || 'your-secret-key', // Replace with a secure key
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Ensure HTTPS is used in production
    maxAge: 1000 * 60 * 60, // 1 hour
  }
});
