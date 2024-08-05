// partnercenter_backend/routes/countryRoutes.js
const express = require('express');
const commonController = require('../controllers/commonController');
// const { verifyToken } = require('../middlewares/authMiddleware');
const router = express.Router();

// Get all countries
// router.get('/getcountries', commonController.getAllCountries);
router.get('/get-countries', commonController.getAllCountries);

module.exports = router;
