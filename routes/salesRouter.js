// routes/partnerRoutes.js
const express = require('express');
const sales = require('../controllers/salesController.js');
const authmiddleware = require('../middlewares/authMiddleware');

const router = express.Router();



router.get('/promo',authmiddleware.verifyTokenforStaffFunctions, authmiddleware.verifyTokenforStaffFunctions, sales.getActivepromo);
router.get('/prod',authmiddleware.verifyTokenforStaffFunctions, sales.getActiveprod);
router.get('/vendor',authmiddleware.verifyTokenforStaffFunctions, authmiddleware.verifyTokenforStaffFunctions, sales.getActivevendors);

router.get('/deal',authmiddleware.verifyTokenforStaffFunctions,  sales.getActivedeal);

router.get('/res', authmiddleware.verifyTokenforStaffFunctions, sales.getActiveres);

router.get('/resprd', authmiddleware.verifyTokenforStaffFunctions, sales.getActiveresprd);



// router.get('/resdll', authmiddleware.verifyTokenforStaffFunctions, sales.getActiveresdll);


router.get('/status', authmiddleware.verifyTokenforStaffFunctions, sales.getActivestatus);

router.get('/pass', authmiddleware.verifyTokenforStaffFunctions, sales.getActivepassword);




router.put('/status/:id',authmiddleware.verifyTokenforStaffFunctions, sales.updatePromoreq);
router.put('/statusprd/:id',authmiddleware.verifyTokenforStaffFunctions, sales.updateProdoreq); 
router.put('/statusdll/:id',authmiddleware.verifyTokenforStaffFunctions, sales.updatedealoreq);


router.post('/reason',authmiddleware.verifyTokenforStaffFunctions, sales.addreason);
router.post('/reasondll',authmiddleware.verifyTokenforStaffFunctions, sales.addreasondll);
// router.post('/reasonprd',authmiddleware.verifyTokenforStaffFunctions, sales.addreasonprd);



// Update become_a_partner's becomestatus_id
// router.put('/becomepartner-update-status/:id', verifyToken, partnerController.updateStatus);

module.exports = router;