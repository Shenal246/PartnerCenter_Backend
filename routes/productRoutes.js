// routes/productRoutes.js
const express = require('express');
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/products', authMiddleware.verifyToken, productController.listProducts);

router.get('/get-categories-srilanka', authMiddleware.verifyTokenforFunctions, productController.getCategories);
router.post('/add-category-srilanka', authMiddleware.verifyTokenforFunctions, productController.addCategory);

module.exports = router;
