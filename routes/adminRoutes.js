// routes/partnerRoutes.js
const express = require('express');
const partnerController = require('../controllers/becomePartnerController');
const adminController = require('../controllers/adminController');
const authmiddleware = require('../middlewares/authMiddleware');
const staffRegisterController = require('../controllers/staffRegisterController');
const upload = require('../middlewares/userProfileConfig');

const router = express.Router();

router.post('/addStaffDetails', authmiddleware.verifyTokenforStaffFunctions, upload.single('photo'), adminController.registerStaffxx);
router.get('/getstaffdetails', authmiddleware.verifyTokenforStaffFunctions, adminController.getAllStaffDetails);

router.post('/connexStaffRegister', authmiddleware.verifyTokenforStaffFunctions, staffRegisterController.staffRegister);

router.get('/getstafflogs', authmiddleware.verifyTokenforStaffFunctions, adminController.getAllStafflogs);
router.get('/getpartnerlogs', authmiddleware.verifyTokenforStaffFunctions, adminController.getAllPartnerlogs);

module.exports = router;

