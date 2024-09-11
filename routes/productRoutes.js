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


router.get('/get-PM-srilanka', authMiddleware.verifyTokenforFunctions, productController.getProductManagers);

// For Products
router.post('/add-product', authMiddleware.verifyTokenforStaffFunctions, productController.addProduct);

router.get('/get-products-id',authMiddleware.verifyTokenforStaffFunctions, productController.getAllProductIdes);

router.get('/get-products', authMiddleware.verifyTokenforStaffFunctions, productController.getAllProductDetails);
router.put('/update-products', authMiddleware.verifyTokenforStaffFunctions, productController.updateProduct);
router.get('/get-AllproductsforPartner-notrequested', authMiddleware.verifyTokenforPartnerFunctions, productController.getAllProductDetailsForPartnernotrequested);
router.get('/get-AllproductsforPartner-requested', authMiddleware.verifyTokenforPartnerFunctions, productController.fetchMyProductsFunction);


// For status
router.get('/get-status', authMiddleware.verifyTokenforFunctions, productController.getStatus);
router.post('/partnerproductrequest', authMiddleware.verifyTokenforPartnerFunctions, productController.partnerProductRequest);

router.get('/getproductsbyvendors/:id', authMiddleware.verifyTokenforPartnerFunctions, productController.getProductsbyVendorForDeal);

module.exports = router;
