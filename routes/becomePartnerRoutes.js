// routes/partnerRoutes.js
const express = require('express');
const partnerController = require('../controllers/becomePartnerController');

const router = express.Router();

router.post('/become-partner', partnerController.becomePartner);

module.exports = router;
