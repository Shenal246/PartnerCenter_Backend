// routes/partnerRoutes.js
const express = require('express');
const partnerController = require('../controllers/becomePartnerController');
const companyController = require('../controllers/companyController');
const authmiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/becomePartner', partnerController.uploadFiles, partnerController.becomePartner);
router.post('/becomePartnerRegister', authmiddleware.verifyTokenforStaffFunctions, companyController.registerPartnerCompany);

// Get become a partner details
router.get('/get-becomePartner', partnerController.getPartnerApplications);

router.post('/becomePartnerRejectApi', authmiddleware.verifyTokenforStaffFunctions, partnerController.rejectpartnerfunction);


// Update become_a_partner's becomestatus_id
// router.put('/becomepartner-update-status/:id', verifyToken, partnerController.updateStatus);

module.exports = router;

