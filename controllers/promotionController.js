const db = require("../config/database");
const authMiddleware = require("../middlewares/authMiddleware");

exports.listPromo = async (req, res, next) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT
      id, 
        title, 
        details, 
        proimage, 
        product_id, 
        status_id, 
        country_id, 
         DATE_FORMAT(upload_date, '%Y-%m-%d') AS upload_date 
      FROM 
        promotion
    `);
    
    res.json(rows);
    
  } catch (err) {
    next(err);
  }
};

exports.addPromo = async (req, res, next) => {
  const promoData = req.body;
  console.log(promoData);

  if (!promoData) {
    return res.status(400).json({ message: 'Promo data is required' });
  }

  const title = promoData.altDescription;
  const details = promoData.details;
  const product_id = promoData.productid;
  const status_id = promoData.status;
  const country_id = 1;
  const upload_date = promoData.uploadedDate;
  const proimage = promoData.imageUrl;

  try {
    // Handle the base64 image data
    if (!proimage || !proimage.startsWith('data:image')) {
      return res.status(400).json({ message: 'Invalid image data' });
    }

    // Remove the base64 prefix and convert to buffer
    const base64Data = proimage.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    // Insert the new promo into the database
    const [result] = await db.promise().query(
      'INSERT INTO promotion (title, details, proimage, product_id, status_id, country_id, upload_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, details, buffer, product_id, status_id, country_id, upload_date]
    );
    const productId = result.insertId;

    // Insert a log into the stafflogs table
    await db.promise().query(
      'INSERT INTO stafflogs (timestamp, action, staff_user_id) VALUES (NOW(), ?, ?)',
      [` New Promo Data : ${productId}`, req.user.id]
    );



    return res.status(200).json({ message: 'Promo added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error);
  }
};

exports.updatePromo = async (req, res, next) => {
  const updatePromoData = req.body;

  if (!updatePromoData) {
    return res.status(400).json({ message: 'Promo data is required' });

  }
  try {
    // Update product information in the database
    await db.promise().query(
      'UPDATE promotion SET status_id = ? WHERE id = ?',
      [updatePromoData.status_id, updatePromoData.id]
    );

    // Insert a log into the stafflogs table
    await db.promise().query(
      'INSERT INTO stafflogs (timestamp, action, staff_user_id) VALUES (NOW(), ?, ?)',
      [` Update PromoData : ${updatePromoData.id}`, req.user.id]
    );

    // Return a success response
    res.status(200).json({ message: 'Promotion updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });

  }

};