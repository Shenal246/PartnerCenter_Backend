


const express = require('express');
const marketingDashboardController = require('../controllers/marketingDashboardController');

// const { verifyToken } = require('../middlewares/authMiddleware');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');


// Get all partners count
router.get('/get-dashboardDetails',authMiddleware.verifyTokenforStaffFunctions, marketingDashboardController.getdashboardDetails);
router.get('/get-partnerRq',authMiddleware.verifyTokenforStaffFunctions, marketingDashboardController.getdashboardDetails);

// /get-partnerRq
module.exports = router; 
