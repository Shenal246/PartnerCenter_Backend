const express = require('express');
const router = express.Router();
const partnerUserController = require('../controllers/partnerUserController');
const staffUserController = require('../controllers/staffUserController');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const authMiddlewaree = require('../middlewares/authMiddleware');


// Login route
router.post('/login', partnerUserController.login);
router.post('/change-password', partnerUserController.changePassword);

//Staff Login route
router.post('/stafflogin', staffUserController.login);
router.post('/change-password-staff', staffUserController.changePassword);

//Staff logout route
router.post('/stafflogout', staffUserController.logout);

// Logout route
router.post('/logout', partnerUserController.logout);

// Example of a protected route
router.get('/protected', isAuthenticated, (req, res) => {
  res.status(200).json({ message: 'Welcome to the protected route!' });
});

//Verifytoken
router.get('/verifytoken', authMiddlewaree.verifyToken);

//VerifytokenFor Partner
router.get('/verifytoken_partner', authMiddlewaree.verifyTokenforPartner);

// Get partner User details
router.get('/getuserdetailsapi', authMiddlewaree.verifyTokenforFunctions, partnerUserController.getUserDetails);

module.exports = router;
