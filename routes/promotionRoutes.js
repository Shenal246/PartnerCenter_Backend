// routes/promotionRoutes.js
const express = require('express');
const promotionController = require('../controllers/promotionController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

//for promotions
router.get('/get-promotions',authMiddleware.verifyTokenforStaffFunctions,promotionController.listPromo);
router.post('/add-promotions',authMiddleware.verifyTokenforStaffFunctions,promotionController.addPromo);

router.put('/update-promotions',authMiddleware.verifyTokenforStaffFunctions,promotionController.updatePromo)



module.exports = router;