// routes/promotionRoutes.js
const express = require('express');
const promotionController = require('../controllers/promotionController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

//for promotions
router.get('/get-promotions',promotionController.listPromo);
router.post('/add-promotions',promotionController.addPromo);





module.exports = router;