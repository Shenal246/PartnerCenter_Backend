const express = require('express');
const multer = require('multer');
const BlogController = require('../../controllers/controllers/blogController');
const authMiddleware = require('../../middlewares/authMiddleware');

const router = express.Router();

// Configure multer for file upload handling
const storage = multer.memoryStorage(); // Store the uploaded file in memory as a Buffer
const upload = multer({ storage: storage });

// Routes
router.post('/blogs',authMiddleware.verifyTokenforFunctions, upload.single('image'), BlogController.addVendor);
router.get('/blogs',authMiddleware.verifyTokenforFunctions, BlogController.getActiveVendors);
router.put('/blogs/:id',authMiddleware.verifyTokenforFunctions, BlogController.updateVendor);

module.exports = router;
