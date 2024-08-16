const db = require('../config/database');

exports.getVendors = async (req, res, next) => {
    try {
      const [rows] = await db.promise().query('SELECT * FROM vendor');
      res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
  };