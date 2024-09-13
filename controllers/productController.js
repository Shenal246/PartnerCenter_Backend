// controllers/productController.js
const { json } = require('body-parser');
const db = require('../config/database');
const authMiddleware = require('../middlewares/authMiddleware');

exports.listProducts = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.addCategory = async (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  try {
    // Insert the new category into the database
    const [result] = await db.promise().query('INSERT INTO category (name) VALUES (?)', [name]);

    // Insert a log into the stafflogs table
    await db.promise().query(
      'INSERT INTO stafflogs (timestamp, action, staff_user_id) VALUES (NOW(), ?, ?)',
      [`Add category Name: ${name}`, req.user.id]
    );

    // Return a success response
    res.status(200).json({ message: 'Category added successfully', categoryId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategories = async (req, res, next) => {

  try {
    const [rows] = await db.promise().query('SELECT * FROM category');
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCategory = async (req, res, next) => {
  const { id } = req.params; // Get the category ID from the URL
  const { name } = req.body; // Get the new name from the request body

  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  try {
    // Update the category in the database
    const [result] = await db.promise().query('UPDATE category SET name = ? WHERE id = ?', [name, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Insert a log into the stafflogs table
    await db.promise().query(
      'INSERT INTO stafflogs (timestamp, action, staff_user_id) VALUES (NOW(), ?, ?)',
      [`Updated category Name : ${name}`, req.user.id]
    );

    // Return a success response
    res.status(200).json({ message: 'Category updated successfully' });
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ error: err.message });
  }
};


// Add Feature
exports.addFeature = async (req, res) => {
  const features = req.body;

  console.log(features);

  if (!features) {
    return res.status(400).json({ message: 'Features are required' });
  }

  try {
    const results = [];
    for (let index = 0; index < features.length; index++) {
      const featureName = features[index].name;
      const categoryId = features[index].category;

      // Check if the feature already exists for the category
      const [existingFeature] = await db.promise().query(
        'SELECT * FROM feature WHERE name = ? AND category_id = ?',
        [featureName, categoryId]
      );

      if (existingFeature.length > 0) {
        // If feature exists, skip adding and send a message
        return res.status(404).json({message: `Feature '${featureName}' already exists For Selected Category` });
      
      }

      // Insert the new feature into the database
      const [result] = await db.promise().query(
        'INSERT INTO feature (name, category_id) VALUES (?, ?)',
        [featureName, categoryId]
      );

      // Save each result
      results.push({ message: `Feature '${featureName}' added successfully`, status: 'added', result });

      // Insert a log into the stafflogs table
      await db.promise().query(
        'INSERT INTO stafflogs (timestamp, action, staff_user_id) VALUES (NOW(), ?, ?)',
        [`Added new feature: ${featureName}`, req.user.id]
      );
    }

    // Return a success response with all results
    res.status(200).json({ message: 'Features processed', results });

  } catch (err) {
    console.error('Error adding features:', err);
    res.status(500).json({ error: err.message });
  }
};


// Get Features to given categoryid
exports.getFeatures = async (req, res, next) => {

  try {
    const [rows] = await db.promise().query('SELECT * FROM feature');

    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Features to given categoryid
exports.getFeaturestoCat = async (req, res, next) => {
  const catID = req.body;

  try {
    const [rows] = await db.promise().query('SELECT * FROM feature WHERE category_id=(?)', catID.categoryId);

    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Product managers
exports.getProductManagers = async (req, res, next) => {

  try {
    const [rows] = await db.promise().query('SELECT id,name FROM staff WHERE designation="PM"');
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.addProduct = async (req, res, next) => {
  const productData = req.body;

  if (!productData) {
    return res.status(400).json({ message: 'Product data is required' });
  }

  const {
    name: productname,
    category: prodcategory,
    vendor: vendorid,
    productManager: pmid,
    modelNo: modelno,
    status: statusid,
    features: rawFeatures,
    videoLink: videolink
  } = productData;

  const images = req.file; // This will contain the uploaded images

  // Start a database transaction
  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Check if file is provided
    const imagePath = images ? `/uploads/product/${images.filename}` : null;

    // Check if product with same model number already exists
    const [product] = await connection.query(
      'SELECT * FROM product WHERE modelno = ?',
      [modelno]
    );

    if (product.length) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ message: 'Product Already Exists' });
    }

    // Insert the new product into the database
    const [result] = await connection.query(
      'INSERT INTO product (name, image, videolink, modelno, country_id, status_id, category_id, pm_id, vendor_id) VALUES (?,?,?,?,?,?,?,?,?)',
      [productname, imagePath, videolink, modelno, 1, statusid, prodcategory, pmid, vendorid]
    );

    const productId = result.insertId;

    // Parse and insert features
    const features = JSON.parse(rawFeatures);
    for (const [featureId, value] of Object.entries(features)) {
      if (isNaN(parseInt(featureId))) {
        console.error(`Invalid feature ID: ${featureId}`);
        continue; // Skip invalid feature ID but do not rollback here as it's a non-critical error
      }

      await connection.query(
        'INSERT INTO product_category_feature (product_id, feature_id, value) VALUES (?,?,?)',
        [productId, featureId, value]
      );
    }

    // Insert a log into the stafflogs table
    await connection.query(
      'INSERT INTO stafflogs (timestamp, action, staff_user_id) VALUES (NOW(), ?, ?)',
      [`New product added: ${productId}`, req.user.id]
    );

    // Commit the transaction
    await connection.commit();
    connection.release();

    // Return a success response
    res.status(200).json({ message: 'Product added successfully', newProductId: productId });
  } catch (err) {
    console.error('Failed to add product:', err);
    await connection.rollback(); // Rollback the transaction on error
    connection.release();
    res.status(500).json({ error: err.message });
  }
};



// Get Status
exports.getStatus = async (req, res, next) => {

  try {
    const [rows] = await db.promise().query('SELECT id,name FROM status');
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Products
exports.getAllProductDetails = async (req, res, next) => {
  try {
    // Fetch all products with their category, vendor, product manager, and status details
    const [products] = await db.promise().query(
      `SELECT p.id, p.name, p.image, p.videolink, p.modelno, p.country_id, 
              c.name as category_name, 
              v.name as vendor_name, 
              pm.name as product_manager_name, 
              s.name as status_name 
       FROM product p
       JOIN category c ON p.category_id = c.id
       JOIN vendor v ON p.vendor_id = v.id
       JOIN staff pm ON p.pm_id = pm.id
       JOIN status s ON p.status_id = s.id`
    );

    // Fetch all features for all products
    const [features] = await db.promise().query(
      `SELECT pcf.product_id, f.id as feature_id, f.name as feature_name, pcf.value 
       FROM product_category_feature pcf
       JOIN feature f ON pcf.feature_id = f.id`
    );

    // Combine product details and features into a single response array
    const productsWithFeatures = products.map(product => {
      // Filter features that belong to the current product
      const productFeatures = features.filter(feature => feature.product_id === product.id);

      // Convert the feature array to an object with feature names as keys
      const featuresObj = productFeatures.reduce((acc, feature) => {
        acc[feature.feature_name] = feature.value;
        return acc;
      }, {});

      // Return the product details with the features object included
      return {
        ...product,
        features: featuresObj
      };
    });

    // Return all product details
    res.status(200).json(productsWithFeatures);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Products Ides
exports.getAllProductIdes = async (req, res, next) => {

  try {
    // Fetch all products with their category, vendor, product manager, and status details
    const [rows] = await db.promise().query('SELECT id ,name FROM product');
    res.status(200).json(rows);

    // Return all product details
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// For update product
exports.updateProduct = async (req, res, next) => {

  const productData = req.body;

  if (!productData.id || !productData.status_id) {
    return res.status(400).json({ message: 'Product data is required' });
  }


  try {
    // Update product information in the database
    await db.promise().query(
      'UPDATE product SET  status_id = ? WHERE id = ?',
      [productData.status_id, productData.id]
    );

    // Insert a log into the stafflogs table
    // await db.promise().query(
    //   'INSERT INTO stafflogs (timestamp, action, staff_user_id) VALUES (NOW(), ?, ?)',
    //   [`Product updated: ${productData.id}`, req.user.id]
    // );

    // Return a success response

    res.status(200).json({ message: 'Product updated successfully', productData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Products
// exports.getAllProductDetailsForPartner = async (req, res, next) => {
//   try {
//     // Fetch all products with their category, vendor, product manager, and status details
//     const [products] = await db.promise().query(
//       `SELECT p.id, p.name, p.image, p.videolink, p.modelno, p.country_id, 
//               c.name as category_name, 
//               v.id as vendor_id, 
//               v.name as vendor_name, 
//               pm.name as product_manager_name, 
//               s.name as status_name 
//        FROM product p
//        JOIN category c ON p.category_id = c.id
//        JOIN vendor v ON p.vendor_id = v.id
//        JOIN staff pm ON p.pm_id = pm.id
//        JOIN status s ON p.status_id = s.id
//        WHERE p.status_id=1
//        `
//     );

//     // Fetch all features for all products
//     const [features] = await db.promise().query(
//       `SELECT pcf.product_id, f.id as feature_id, f.name as feature_name, pcf.value 
//        FROM product_category_feature pcf
//        JOIN feature f ON pcf.feature_id = f.id`
//     );

//     // Combine product details and features into a single response array
//     const productsWithFeatures = products.map(product => {
//       // Filter features that belong to the current product
//       const productFeatures = features.filter(feature => feature.product_id === product.id);

//       // Convert the feature array to an object with feature names as keys
//       const featuresObj = productFeatures.reduce((acc, feature) => {
//         acc[feature.feature_name] = feature.value;
//         return acc;
//       }, {});

//       // Return the product details with the features object included
//       return {
//         ...product,
//         features: featuresObj
//       };
//     });

//     // Return all product details
//     res.status(200).json(productsWithFeatures);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// Get Products that haven't been requested by a partner
exports.getAllProductDetailsForPartnernotrequested = async (req, res, next) => {
  try {
    // Fetch partner's company_id using partner's user id
    const [partnerResult] = await db.promise().query(
      `SELECT partner.company_id 
       FROM partner 
       JOIN partner_user pu ON partner.id = pu.partner_id 
       WHERE pu.id = ?`,
      [req.user.id]
    );

    if (partnerResult.length === 0) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    const companyId = partnerResult[0].company_id;

    // Fetch products that have been requested by the partner's company
    const [requestedProducts] = await db.promise().query(
      `SELECT pr.product_id 
       FROM productrequests pr
       WHERE pr.company_id = ?`,
      [companyId]
    );

    // Create a set of requested product IDs for easy lookup
    const requestedProductIds = new Set(requestedProducts.map((prod) => prod.product_id));

    // Fetch all products with their category, vendor, product manager, and status details
    const [products] = await db.promise().query(
      `SELECT p.id, p.name, p.image, p.videolink, p.modelno, p.country_id, 
              c.name as category_name, 
              v.id as vendor_id, 
              v.name as vendor_name, 
              pm.name as product_manager_name, 
              s.name as status_name 
       FROM product p
       JOIN category c ON p.category_id = c.id
       JOIN vendor v ON p.vendor_id = v.id
       JOIN staff pm ON p.pm_id = pm.id
       JOIN status s ON p.status_id = s.id
       WHERE p.status_id = 1`
    );

    // Filter products that haven't been requested by the partner
    const availableProducts = products.filter((product) => !requestedProductIds.has(product.id));

    // Fetch all features for all products
    const [features] = await db.promise().query(
      `SELECT pcf.product_id, f.id as feature_id, f.name as feature_name, pcf.value 
       FROM product_category_feature pcf
       JOIN feature f ON pcf.feature_id = f.id`
    );

    // Combine product details and features into a single response array
    const productsWithFeatures = availableProducts.map(product => {
      // Filter features that belong to the current product
      const productFeatures = features.filter(feature => feature.product_id === product.id);

      // Convert the feature array to an object with feature names as keys
      const featuresObj = productFeatures.reduce((acc, feature) => {
        acc[feature.feature_name] = feature.value;
        return acc;
      }, {});

      // Return the product details with the features object included
      return {
        ...product,
        features: featuresObj
      };
    });


    // Return all available product details (excluding requested ones)
    res.status(200).json(productsWithFeatures);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log(err);

  }
};

// Add Product Request
exports.partnerProductRequest = async (req, res, next) => {
  const { id: productID } = req.body;

  try {

    // Fetch partner's company_id using partner's user id
    const [partnerResult] = await db.promise().query(
      `SELECT partner.company_id 
       FROM partner 
       JOIN partner_user pu ON partner.id = pu.partner_id 
       WHERE pu.id = ?`,
      [req.user.id]
    );

    if (partnerResult.length === 0) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    const companyId = partnerResult[0].company_id;

    // Add a record to productrequests table
    const [result] = await db.promise().query(
      'INSERT INTO productrequests (product_id, prodrequeststatus_id, company_id) VALUES (?, ?, ?)',
      [productID, 1, companyId]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ message: 'Product request failed' });
    }

    // Insert a log into the partnerlogs table
    const [resultpartner] = await db.promise().query(
      'INSERT INTO partnerlogs (timestamp, action, partner_user_id) VALUES (NOW(), ?, ?)',
      [`Product Requested: ${productID}`, req.user.id]
    );

    if (resultpartner.affectedRows === 0) {
      return res.status(500).json({ message: 'Logging Error' });
    }

    res.status(200).json({ message: 'Product Request Successfull' });

  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log(err);
  }

};


// Fetch My Products
exports.fetchMyProductsFunction = async (req, res, next) => {

  try {
    // Fetch partner's company_id using partner's user id
    const [partnerResult] = await db.promise().query(
      `SELECT partner.company_id 
       FROM partner 
       JOIN partner_user pu ON partner.id = pu.partner_id 
       WHERE pu.id = ?`,
      [req.user.id]
    );

    if (partnerResult.length === 0) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    const companyId = partnerResult[0].company_id;

    // Fetch products that have been requested by the partner's company
    const [requestedProducts] = await db.promise().query(
      `SELECT pr.product_id 
       FROM productrequests pr
       WHERE pr.company_id = ?`,
      [companyId]
    );

    // Create a set of requested product IDs for easy lookup
    const requestedProductIds = new Set(requestedProducts.map((prod) => prod.product_id));

    // Fetch all products with their category, vendor, product manager, and status details
    const [products] = await db.promise().query(
      `SELECT p.id, p.name, p.image, p.videolink, p.modelno, p.country_id, 
              c.name as category_name, 
              v.id as vendor_id, 
              v.name as vendor_name, 
              v.vendorlogo as vendor_logo, 
              v.status_id as vendor_status, 
              pm.name as product_manager_name, 
              s.name as status_name 
       FROM product p
       JOIN category c ON p.category_id = c.id
       JOIN vendor v ON p.vendor_id = v.id
       JOIN staff pm ON p.pm_id = pm.id
       JOIN status s ON p.status_id = s.id
       WHERE p.status_id = 1`
    );

    // Filter products that have been requested by the partner
    const reqProducts = products.filter((product) => requestedProductIds.has(product.id));

    // Fetch all features for all products
    const [features] = await db.promise().query(
      `SELECT pcf.product_id, f.id as feature_id, f.name as feature_name, pcf.value 
       FROM product_category_feature pcf
       JOIN feature f ON pcf.feature_id = f.id`
    );

    // Combine product details and features into a single response array
    const productsWithFeatures = reqProducts.map(product => {
      // Filter features that belong to the current product
      const productFeatures = features.filter(feature => feature.product_id === product.id);

      // Convert the feature array to an object with feature names as keys
      const featuresObj = productFeatures.reduce((acc, feature) => {
        acc[feature.feature_name] = feature.value;
        return acc;
      }, {});

      // Return the product details with the features object included
      return {
        ...product,
        features: featuresObj
      };
    });




    // Return registered product details (excluding requested ones)
    res.status(200).json(productsWithFeatures);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log(err);

  }

};


exports.getProductsbyVendorForDeal = async (req, res, next) => {
  const { id } = req.params; // Get the category ID from the URL

  if (!id) {
    return res.status(400).json({ message: 'Vendor name is required' });
  }

  try {

    // Select products by vendorid
    const [rows] = await db.promise().query(
      'SELECT id,name FROM product WHERE vendor_id=?',
      [id]
    );


    // Return a success response
    res.status(200).json({ rows });
  } catch (err) {
    console.log(err);
    console.error('Error updating category:', err);
    res.status(500).json({ error: err.message });


  }
};



