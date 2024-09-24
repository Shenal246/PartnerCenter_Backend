


const express = require('express');
const marketingDashboardController = require('../controllers/marketingDashboardController');
const salesDashboardController = require('../controllers/salesDashboardController');

// const { verifyToken } = require('../middlewares/authMiddleware');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');


// Get all partners count
router.get('/get-marketingDashboardDetails',authMiddleware.verifyTokenforStaffFunctions, marketingDashboardController.getdashboardDetails);
router.get('/get-partnerRq',authMiddleware.verifyTokenforStaffFunctions, marketingDashboardController.getpartnerRq);

// /get-partnerRq
router.get('/get-salesDashboardDetails',authMiddleware.verifyTokenforStaffFunctions, salesDashboardController.getdashboardDetails);


module.exports = router; 
