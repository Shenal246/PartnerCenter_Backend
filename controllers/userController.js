// controllers/userController.js
const pool = require('../config/database');

exports.getProfile = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, email, name FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};
