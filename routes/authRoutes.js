const express = require('express');
const router = express.Router();
const partnerUserController = require('../controllers/partnerUserController');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const authMiddlewaree = require('../middlewares/authMiddleware');


// Login route
router.post('/login', partnerUserController.login);
router.post('/change-password', partnerUserController.changePassword);

// Logout route
router.post('/logout', partnerUserController.logout);

// Example of a protected route
router.get('/protected', isAuthenticated, (req, res) => {
  res.status(200).json({ message: 'Welcome to the protected route!' });
});

module.exports = router;
