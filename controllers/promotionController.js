const db = require("../config/database");
const authMiddleware = require("../middlewares/authMiddleware");

exports.listPromo = async (req, res, next) => {
    try {
        const [rows] = await db.promise().query('SELECT * FROM promotion');
        res.json(rows);
      } catch (err) {
        next(err);
      }
};

exports.addPromo = async (req, res, next) => {

    const promoData = req.body;

  if (!promoData) {
    return res.status(400).json({ message: 'Promo array is required' });
  }

  const title=promoData.altDescription;
  const details=promoData.details;
  const product_id=promoData;
  const status_id=promoData.status;
  const country_id=promoData;
  const upload_date=promoData.uploadedDate;
};

exports.aupdatePromo = async (req, res, next) => {};