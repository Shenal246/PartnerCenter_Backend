// routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');
const staffUserController = require('../controllers/staffUserController');
const partnerUserController = require('../controllers/partnerUserController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/profile', authMiddleware.verifyToken, userController.getProfile);


router.get('/getStaffPrivileges', authMiddleware.verifyTokenforStaffFunctions, staffUserController.getPrivilegesFunctionforstaff);
router.get('/getPartnerPrivileges', authMiddleware.verifyTokenforPartnerFunctions, partnerUserController.getPrivilegesFunctionforpartner);

module.exports = router;
