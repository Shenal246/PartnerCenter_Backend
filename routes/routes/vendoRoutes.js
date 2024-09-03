const express = require('express');
const multer = require('multer');
const vendorController = require('../../controllers/controllers/vendorController');
const authMiddleware = require('../../middlewares/authMiddleware');

const router = express.Router();

// Configure multer for file upload handling
const storage = multer.memoryStorage(); // Store the uploaded file in memory as a Buffer
const upload = multer({ storage: storage });


// Add a new vendor with image upload
router.post('/vendor', authMiddleware.verifyTokenforFunctions, upload.single('image'), vendorController.addVendor);

// Get all active vendors
router.get('/vendors', authMiddleware.verifyTokenforFunctions, vendorController.getActiveVendors);

// Update a vendor with image upload
router.put('/vendor/:id', authMiddleware.verifyTokenforFunctions, upload.single('image'), vendorController.updateVendor);

module.exports = router;
