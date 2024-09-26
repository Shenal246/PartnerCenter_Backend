// routes/partnerRoutes.js
const express = require('express');
const partnerController = require('../controllers/becomePartnerController');
const adminController = require('../controllers/adminController');
const authmiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/userProfileConfig'); 

const router = express.Router();

router.post('/addStaffDetails',authmiddleware.verifyTokenforStaffFunctions, upload.single('photo'), adminController.registerStaffxx);
router.get('/getstaffdetails',authmiddleware.verifyTokenforStaffFunctions, adminController.getAllStaffDetails);

module.exports = router;

