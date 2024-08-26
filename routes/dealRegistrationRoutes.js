const express = require('express');
const dealRegistrationController = require('../controllers/dealRegistrationController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/get-currencyunits', authMiddleware.verifyTokenforPartnerFunctions, dealRegistrationController.getCurrencyUnits);
router.get('/get-types', authMiddleware.verifyTokenforPartnerFunctions, dealRegistrationController.getTypeOptions);
router.post('/add-dealregistration', authMiddleware.verifyTokenforPartnerFunctions, dealRegistrationController.addDealRegistration);
router.get('/get-dealregistrationdetails', authMiddleware.verifyTokenforPartnerFunctions, dealRegistrationController.getDealRegistrations);

router.get('/deal-pendingstatus-counts', authMiddleware.verifyTokenforPartnerFunctions, dealRegistrationController.getDealRegistrationApproveCount);
router.get('/deal-win-counts', authMiddleware.verifyTokenforPartnerFunctions, dealRegistrationController.getDealRegistrationWinCount);
router.get('/completed-deals-count', authMiddleware.verifyTokenforPartnerFunctions, dealRegistrationController.getDealRegistrationCompletedCount);

module.exports = router;