// routes/productRoutes.js
const express = require('express');
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/products', authMiddleware.verifyToken, productController.listProducts);

// For Categories
router.get('/get-categories-srilanka', authMiddleware.verifyTokenforFunctions, productController.getCategories);
router.post('/add-category-srilanka', authMiddleware.verifyTokenforFunctions, productController.addCategory);
router.put('/update-category-srilanka/:id', authMiddleware.verifyTokenforFunctions, productController.updateCategory);

// For Features
router.post('/add-features-srilanka', authMiddleware.verifyTokenforFunctions, productController.addFeature);
router.get('/get-featuresforcat-srilanka', authMiddleware.verifyTokenforFunctions, productController.getFeatures);
// router.post('/get-featuresforcat-srilanka',productController.getFeatures);

module.exports = router;
