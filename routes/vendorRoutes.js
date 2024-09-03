// routes/productRoutes.js
const express = require('express');
const vendorController = require('../controllers/vendorController.js');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/get-vendors-srilanka', authMiddleware.verifyTokenforFunctions, vendorController.getVendors);
router.get('/getproductsbyvendors/:vendorId', authMiddleware.verifyTokenforPartnerFunctions, vendorController.getProductsByVendor);
router.get('/vendors/:vendorId/hot-products', authMiddleware.verifyTokenforFunctions, vendorController.getHotProductsByVendor);
router.get('/products/:productId', authMiddleware.verifyTokenforFunctions, vendorController.getProductById);
router.get('/get-productslist', authMiddleware.verifyTokenforFunctions, vendorController.getProducts);

router.get('/get-vendorswithCategories-srilanka', authMiddleware.verifyTokenforPartnerFunctions, vendorController.getVendorswithCategory);
router.post('/add-vendorapi', authMiddleware.verifyTokenforStaffFunctions, vendorController.addVendor);

router.put('/update-vendor', authMiddleware.verifyTokenforStaffFunctions, vendorController.updatevendor);


module.exports = router;