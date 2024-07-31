// controllers/productController.js
const pool = require('../config/database');

exports.listProducts = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};
