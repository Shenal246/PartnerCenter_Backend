// routes/userRoutes.js
const express = require('express');
const partnerUserController = require('../controllers/partnerUserController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/partnerProfileConfig');

const router = express.Router();

router.get('/getcompanymembersforaccess', authMiddleware.verifyTokenforPartnerFunctions, partnerUserController.getCompanymembersForAccessManagement);
router.get('/getpartnermodule', authMiddleware.verifyTokenforPartnerFunctions, partnerUserController.fetchmodules);

router.post('/addnewmembertosamecompany', authMiddleware.verifyTokenforPartnerFunctions, upload.single('photo'), partnerUserController.addnewpartnertosamecompany);

router.put('/updateCompanyMember/:id', authMiddleware.verifyTokenforPartnerFunctions, upload.single('photo'), partnerUserController.updatePartnerAndPrivileges);

module.exports = router;