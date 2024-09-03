const express = require('express');
const multer = require('multer');
const newsController = require('../../controllers/controllers/newsController');
const authMiddleware = require('../../middlewares/authMiddleware');
const router = express.Router();

// Configure multer for file upload handling
const storage = multer.memoryStorage(); // Store the uploaded file in memory as a Buffer
const upload = multer({ storage: storage });

// Routes
router.post('/news',authMiddleware.verifyTokenforFunctions, upload.single('image'), newsController.addNews);
router.get('/news',authMiddleware.verifyTokenforFunctions, newsController.getNews);
router.put('/news/:id',authMiddleware.verifyTokenforFunctions, upload.single('image'), newsController.updateNews);

module.exports = router;
