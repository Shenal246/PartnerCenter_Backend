// controllers/productController.js
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
