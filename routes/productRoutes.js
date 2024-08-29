// routes/productRoutes.js
const express = require('express');
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// router.get('/products', authMiddleware.verifyToken, productController.listProducts);

// For Categories
router.get('/get-categories-srilanka', authMiddleware.verifyTokenforFunctions, productController.getCategories);
router.post('/add-category-srilanka', authMiddleware.verifyTokenforFunctions, productController.addCategory);
router.put('/update-category-srilanka/:id', authMiddleware.verifyTokenforFunctions, productController.updateCategory);

// For Features
router.post('/add-features-srilanka', authMiddleware.verifyTokenforFunctions, productController.addFeature);
router.get('/get-features-srilanka', authMiddleware.verifyTokenforFunctions, productController.getFeatures);
router.post('/get-featuresforcat-srilanka', authMiddleware.verifyTokenforFunctions, productController.getFeaturestoCat);
// router.post('/get-featuresforcat-srilanka',productController.getFeatures);

// For Products
router.get('/get-PM-srilanka', authMiddleware.verifyTokenforFunctions, productController.getProductManagers);

router.post('/add-product', authMiddleware.verifyTokenforFunctions, productController.addProduct);
router.get('/get-products', authMiddleware.verifyTokenforStaffFunctions, productController.getAllProductDetails);

router.get('/get-AllproductsforPartner-notrequested', authMiddleware.verifyTokenforPartnerFunctions, productController.getAllProductDetailsForPartnernotrequested);
router.get('/get-AllproductsforPartner-requested', authMiddleware.verifyTokenforPartnerFunctions, productController.fetchMyProductsFunction);


// For status
router.get('/get-status', authMiddleware.verifyTokenforFunctions, productController.getStatus);

router.post('/partnerproductrequest', authMiddleware.verifyTokenforPartnerFunctions, productController.partnerProductRequest);

module.exports = router;
