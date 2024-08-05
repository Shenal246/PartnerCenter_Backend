// my-b2b-app/routes/videoRoutes.js
const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const authMiddleware = require('../middlewares/authMiddleware');

// Route to get video information
router.post('/get-video-info', authMiddleware.verifyToken, videoController.getVideoInfo);

module.exports = router;
