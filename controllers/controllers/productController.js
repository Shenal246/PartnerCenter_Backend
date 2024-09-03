// controllers/productController.js
const db = require('../../config/database2');
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

// Add Products
exports.addProduct = async (req, res, next) => {
  const productData = req.body;

  if (!productData) {
    return res.status(400).json({ message: 'Product array is required' });
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

  // console.log("Product name----", productname);
  // console.log("Product cat----", prodcategory);
  // console.log("Product vendor----", vendorid);
  // console.log("Product pmid----", pmid);
  // console.log("Product modelno----", modelno);
  // console.log("Product status----", statusid);
  // console.log("Product features----", features);
  // console.log("Product video----", videolink);
  // console.log("Product images----", images);

  try {
    // Insert the new category into the database
    const [result] = await db.promise().query('INSERT INTO product (name, image, videolink, modelno, country_id, status_id, category_id, pm_id, vendor_id) VALUES (?,?,?,?,?,?,?,?,?)',
      [productname, images, videolink, modelno, 1, statusid, prodcategory, pmid, vendorid]);

    const addedAllFeatures = [];

    // Insert features
    for (const [featureId, value] of Object.entries(features)) {
      // Insert features into product_category_feature
      const [addedfeatures] = await db.promise().query('INSERT INTO product_category_feature (product_id, feature_id, value) VALUES (?,?,?)',
        [result.insertId, featureId, value]);
      // Save each result
      addedAllFeatures.push(addedfeatures);
    }

    // Insert a log into the stafflogs table
    await db.promise().query(
      'INSERT INTO stafflogs (timestamp, action, staff_user_id) VALUES (NOW(), ?, ?)',
      [`New product added: ${productname}`, req.user.id]
    );

    // Return a success response
    res.status(200).json({ message: 'Product added successfully', newproductid: result.insertId });
  } catch (err) {
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
exports.getProductDetails = async (req, res, next) => {
  const productId = req.params.id;

  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  try {
    // Fetch product details from the product table along with category, vendor, and product manager details
    const [product] = await db.promise().query(
      `SELECT p.*, 
              c.name as category_name, 
              v.name as vendor_name, 
              pm.name as product_manager_name, 
              s.name as status_name 
       FROM product p
       JOIN category c ON p.category_id = c.id
       JOIN vendor v ON p.vendor_id = v.id
       JOIN product_manager pm ON p.pm_id = pm.id
       JOIN status s ON p.status_id = s.id
       WHERE p.id = ?`,
      [productId]
    );

    if (product.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Fetch the features associated with the product from product_category_feature and feature tables
    const [features] = await db.promise().query(
      `SELECT f.id as feature_id, f.name as feature_name, pcf.value 
       FROM product_category_feature pcf
       JOIN feature f ON pcf.feature_id = f.id
       WHERE pcf.product_id = ?`,
      [productId]
    );

    // Combine product details and features into a single response object
    const productDetails = {
      ...product[0],
      features: features.reduce((acc, feature) => {
        acc[feature.feature_name] = feature.value;
        return acc;
      }, {}),
    };

    // Return the product details
    res.status(200).json(productDetails);
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


