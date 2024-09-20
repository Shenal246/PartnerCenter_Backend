// routes/partnerRoutes.js
const express = require('express');
const sales = require('../controllers/salesController.js');
const authmiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

<<<<<<< Updated upstream
router.get('/promo', sales.getActivepromo); 
router.get('/prod', authmiddleware.verifyTokenforStaffFunctions, sales.getActiveprod);
=======
// statusprd

router.get('/promo', authmiddleware.verifyTokenforStaffFunctions, sales.getActivepromo);
router.get('/prod', sales.getActiveprod);
>>>>>>> Stashed changes
router.get('/vendor', authmiddleware.verifyTokenforStaffFunctions, sales.getActivevendors);
router.get('/deal',authmiddleware.verifyTokenforStaffFunctions,  sales.getActivedeal);
router.get('/res', authmiddleware.verifyTokenforStaffFunctions, sales.getActiveres);
router.get('/resprd', authmiddleware.verifyTokenforStaffFunctions, sales.getActiveresprd);
router.get('/resdll', authmiddleware.verifyTokenforStaffFunctions, sales.getActiveresdll);
router.get('/status', authmiddleware.verifyTokenforStaffFunctions, sales.getActivestatus);
router.get('/pass', authmiddleware.verifyTokenforStaffFunctions, sales.getActivepass);
router.put('/status/:id',authmiddleware.verifyTokenforFunctions, sales.updatePromoreq);

router.put('/statusprd/:id',authmiddleware.verifyTokenforFunctions, sales.updateProdoreq); 

//now
router.put('/statusdll/:id',authmiddleware.verifyTokenforFunctions, sales.updatedealoreq);


router.post('/reason',authmiddleware.verifyTokenforFunctions, sales.addreason);
router.post('/reasondll',authmiddleware.verifyTokenforFunctions, sales.addreasondll);
router.post('/reasonprd',authmiddleware.verifyTokenforFunctions, sales.addreasonprd);



// Update become_a_partner's becomestatus_id
// router.put('/becomepartner-update-status/:id', verifyToken, partnerController.updateStatus);

module.exports = router;