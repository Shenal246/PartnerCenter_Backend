// routes/promotionRoutes.js
const express = require('express');
const promotionController = require('../controllers/promotionController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/promotionImageConfig'); 
const router = express.Router();

//for promotions
router.get('/get-promotions', authMiddleware.verifyTokenforStaffFunctions, promotionController.listPromo);
router.post('/add-promotions', authMiddleware.verifyTokenforStaffFunctions,upload.single('image'), promotionController.addPromo);

router.put('/update-promotions', authMiddleware.verifyTokenforStaffFunctions, promotionController.updatePromo);

router.get('/get-promotionsforpartner', authMiddleware.verifyTokenforPartnerFunctions, promotionController.listPromoforpartners);

router.post('/add-promotionrequest', authMiddleware.verifyTokenforPartnerFunctions, promotionController.addpromotionrequestbypartner);

router.get('/getpromotiontypeapi', authMiddleware.verifyTokenforStaffFunctions, promotionController.getPromotypes);


module.exports = router;