// routes/partnerRoutes.js
const express = require('express');
const partnerController = require('../controllers/becomePartnerController');
const companyController = require('../controllers/companyController');
const authmiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/becomePartner', partnerController.uploadFiles, partnerController.becomePartner);
router.post('/becomePartnerRegister', authmiddleware.verifyTokenforStaffFunctions, companyController.registerPartnerCompany);

// Get become a partner details
router.get('/get-becomePartner', authmiddleware.verifyTokenforStaffFunctions, partnerController.getPartnerApplications);

router.post('/becomePartnerRejectApi', authmiddleware.verifyTokenforStaffFunctions, partnerController.rejectpartnerfunction);

//getexpertise & getindustries
router.get('/getexpertise', partnerController.getExpertise);
router.get('/getindustries', partnerController.getIndustries);


// Update become_a_partner's
router.put('/updatePartnerRqData', partnerController.uploadFiles, partnerController.updatePartnerdata);

module.exports = router;

