// routes/productRoutes.js
const express = require('express');
const vendorController = require('../controllers/vendorController.js');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/get-vendors-srilanka', authMiddleware.verifyTokenforFunctions, vendorController.getVendors);

module.exports = router;