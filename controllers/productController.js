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

  if (!features) {
    return res.status(400).json({ message: 'Features are required' });
  }

  try {
    const results = [];
    for (let index = 0; index < features.length; index++) {
      console.log("Features", features[index].name);

      // Insert the new feature into the database
      const [result] = await db.promise().query(
        'INSERT INTO feature (name, category_id) VALUES (?, ?)',
        [features[index].name, features[index].category]
      );

      // Save each result
      results.push(result);

      // Insert a log into the stafflogs table
      await db.promise().query(
        'INSERT INTO stafflogs (timestamp, action, staff_user_id) VALUES (NOW(), ?, ?)',
        [`Add new feature : ${features[index].name}`, req.user.id]
      );
    }

    // Return a success response with all results
    res.status(200).json({ message: 'Features added successfully', results: results });

  } catch (err) {
    console.error("Error adding features:", err);
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
  console.log("cat ID ---", catID.categoryId);

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
  // console.log('rEQ bODY:', req.body);

  const productData = req.body;

  if (!productData) {
    return res.status(400).json({ message: 'Product data is required' });
  }

  const productname = productData.name;
  const prodcategory = productData.category;
  const vendorid = productData.vendor.id;
  const pmid = productData.productManager.id;
  const modelno = productData.modelNo;
  const statusid = productData.status.id;
  const features = productData.features;
  const videolink = productData.videoLink;
  const images = productData.images;// This will contain the uploaded images

  console.log(productData);

  try {

    // Assuming that you want to store only one image in the product table, let's take the first image
    const base64Data = images[0].replace(/^data:image\/\w+;base64,/, ""); // Remove base64 prefix
    const buffer = Buffer.from(base64Data, 'base64'); // Convert base64 string to buffer


    // Insert the new product into the database
    const [result] = await db.promise().query(
      'INSERT INTO product (name,image, videolink, modelno, country_id, status_id, category_id, pm_id, vendor_id) VALUES (?,?,?,?,?,?,?,?,?)',
      [productname, buffer, videolink, modelno, 1, statusid, prodcategory, pmid, vendorid]
    );

    const productId = result.insertId;

    // Insert features
    const addedAllFeatures = [];
    for (const [featureId, value] of Object.entries(features)) {
      const [addedfeatures] = await db.promise().query(
        'INSERT INTO product_category_feature (product_id, feature_id, value) VALUES (?,?,?)',
        [productId, featureId, value]
      );
      addedAllFeatures.push(addedfeatures);
    }


    // Insert a log into the stafflogs table
    await db.promise().query(
      'INSERT INTO stafflogs (timestamp, action, staff_user_id) VALUES (NOW(), ?, ?)',
      [`New product added: ${productId}`, req.user.id]
    );

    // Return a success response
    res.status(200).json({ message: 'Product added successfully', newproductid: productId });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log(err);

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

// For update product
exports.updateProduct = async (req, res, next) => {
  const productId = req.params.id;
  const productData = req.body;

  if (!productData) {
    return res.status(400).json({ message: 'Product data is required' });
  }

  const productname = productData.name;
  const prodcategory = productData.category;
  const vendorid = productData.vendor.id;
  const pmid = productData.productManager.id;
  const modelno = productData.modelNo;
  const statusid = productData.status.id;
  const features = productData.features;
  const videolink = productData.videoLink;
  const images = productData.images;

  try {
    // Update product information in the database
    await db.promise().query(
      'UPDATE product SET name = ?, image = ?, videolink = ?, modelno = ?, category_id = ?, vendor_id = ?, pm_id = ?, status_id = ? WHERE id = ?',
      [productname, images, videolink, modelno, prodcategory, vendorid, pmid, statusid, productId]
    );

    // Update product features
    for (const [featureId, value] of Object.entries(features)) {
      await db.promise().query(
        'REPLACE INTO product_category_feature (product_id, feature_id, value) VALUES (?,?,?)',
        [productId, featureId, value]
      );
    }

    // Insert a log into the stafflogs table
    await db.promise().query(
      'INSERT INTO stafflogs (timestamp, action, staff_user_id) VALUES (NOW(), ?, ?)',
      [`Product updated: ${productname}`, req.user.id]
    );

    // Return a success response
    res.status(200).json({ message: 'Product updated successfully', productId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


