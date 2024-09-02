// routes/partnerRoutes.js
const express = require('express');
const sales = require('../controllers/salesController.js');
const authmiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/promo', authmiddleware.verifyTokenforStaffFunctions, sales.getActivepromo);
router.get('/prod', authmiddleware.verifyTokenforStaffFunctions, sales.getActiveprod);
router.get('/vendor', authmiddleware.verifyTokenforStaffFunctions, sales.getActivevendors);
router.get('/res', authmiddleware.verifyTokenforStaffFunctions, sales.getActiveres);
router.get('/resprd', authmiddleware.verifyTokenforStaffFunctions, sales.getActiveresprd);
router.get('/status', authmiddleware.verifyTokenforStaffFunctions, sales.getActivestatus);
router.get('/pass', authmiddleware.verifyTokenforStaffFunctions, sales.getActivepass);
router.put('/status/:id',authmiddleware.verifyTokenforFunctions, sales.updatePromoreq);
router.put('/statusprd/:id',authmiddleware.verifyTokenforFunctions, sales.updateProdoreq);
router.post('/reason',authmiddleware.verifyTokenforFunctions, sales.addreason);
router.post('/reasonprd',authmiddleware.verifyTokenforFunctions, sales.addreasonprd);




// Update become_a_partner's becomestatus_id
// router.put('/becomepartner-update-status/:id', verifyToken, partnerController.updateStatus);

module.exports = router;