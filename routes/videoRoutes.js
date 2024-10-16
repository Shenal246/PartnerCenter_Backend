// my-b2b-app/routes/videoRoutes.js
const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const authMiddleware = require('../middlewares/authMiddleware');

// Route to get video information for partner
router.get('/get-video-info-partners', authMiddleware.verifyTokenforPartnerFunctions, videoController.getVideoInfoforPartner);

// Route to get video information
router.get('/get-video-info',authMiddleware.verifyTokenforStaffFunctions, videoController.getVideoInfo);
router.post('/add-video-info',authMiddleware.verifyTokenforStaffFunctions, videoController.addNewVideo);
router.put('/update-video-info',authMiddleware.verifyTokenforStaffFunctions, videoController.updateVideo);

// update-video

module.exports = router;
