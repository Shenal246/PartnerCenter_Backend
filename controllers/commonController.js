const db = require('../config/database');

/**
 * Get all countries
 */
exports.getAllCountries = async (req, res) => {
  try {
    const [rows] = await db.promise().query('SELECT * FROM country');
    res.status(200).json(rows);
  } catch (error) {
    errorHandler(error, req, res);
    console.log(error);
  }
};