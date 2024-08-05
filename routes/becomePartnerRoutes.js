// routes/partnerRoutes.js
const express = require('express');
const partnerController = require('../controllers/becomePartnerController');
const companyController = require('../controllers/companyController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/becomePartner', partnerController.uploadFiles, partnerController.becomePartner);
router.post('/becomePartnerRegister', companyController.registerPartnerCompany);

// Update become_a_partner's becomestatus_id
// router.put('/becomepartner-update-status/:id', verifyToken, partnerController.updateStatus);

module.exports = router;

