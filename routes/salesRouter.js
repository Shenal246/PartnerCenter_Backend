// routes/partnerRoutes.js
const express = require('express');
const sales = require('../controllers/salesController.js');
const authmiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/promo', authmiddleware.verifyTokenforStaffFunctions, sales.getActivepromo);
router.get('/res', authmiddleware.verifyTokenforStaffFunctions, sales.getActiveres);
router.get('/status', authmiddleware.verifyTokenforStaffFunctions, sales.getActivestatus);
router.get('/pass', authmiddleware.verifyTokenforStaffFunctions, sales.getActivepass);
router.put('/status/:id',authmiddleware.verifyTokenforFunctions, sales.updatePromoreq);
router.post('/reason',authmiddleware.verifyTokenforFunctions, sales.addreason);




// Update become_a_partner's becomestatus_id
// router.put('/becomepartner-update-status/:id', verifyToken, partnerController.updateStatus);

module.exports = router;