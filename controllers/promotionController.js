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
         DATE_FORMAT(upload_date, '%Y-%m-%d') AS upload_date,
          DATE_FORMAT(expire_date, '%Y-%m-%d') AS expire_date 
        FROM 
        promotion
    `);

    res.json(rows);

  } catch (err) {
    next(err);
  }
};

exports.addPromo = async (req, res, next) => {
  const promoData = req.body; // All other data is still received via req.body


  if (!req.file || !promoData) {
      return res.status(400).json({ message: 'All data including image file is required' });
  }

  const title = promoData.altDescription;
  const details = promoData.details;
  const product_id = promoData.productid;
  const status_id = promoData.status;
  const country_id = 1; // Assuming this is still hard-coded or however you handle it
  const upload_date = promoData.uploadedDate;
  const expire_date = promoData.expireDate;
  const promotiontype_id = promoData.promotiontypeid;
  const image = req.file; // Path where the image is saved

  try {
    const imagePath = `/uploads/promotion/${image.filename}`;

      // Insert the new promo into the database with the image file path
      const [result] = await db.promise().query(
          'INSERT INTO promotion (title, details, proimage, product_id, status_id, country_id, upload_date, promotiontype_id, expire_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [title, details, imagePath, product_id, status_id, country_id, upload_date, promotiontype_id, expire_date]
      );
      const promoId = result.insertId;

      // Log action in stafflogs
      await db.promise().query(
          'INSERT INTO stafflogs (timestamp, action, staff_user_id) VALUES (NOW(), ?, ?)',
          [`New Promo Data: ${promoId}`, req.user.id]
      );

      return res.status(200).json({ message: 'Promo added successfully', promoId });
  } catch (error) {
      console.error('Failed to add promo:', error);
      console.log(error)
      res.status(500).json({ error: error.message });
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

exports.listPromoforpartners = async (req, res, next) => {
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
        DATE_FORMAT(upload_date, '%Y-%m-%d') AS upload_date,
        promotiontype_id,
        DATE_FORMAT(expire_date, '%Y-%m-%d') AS expire_date
      FROM 
        promotion
      WHERE 
        status_id = 1 
        AND (expire_date IS NULL OR expire_date > NOW())
    `);

    res.status(200).json(rows);

  } catch (err) {
    next(err);
  }
};

exports.addpromotionrequestbypartner = async (req, res, next) => {

  const promotioid = req.body.prmotionid;

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

    // Check if the promotion request already exists for this company
    const [existingPromotion] = await db.promise().query(
      `SELECT * FROM promotionrequests 
       WHERE promotion_id = ? AND company_id = ?`,
      [promotioid, companyId]
    );

    if (existingPromotion.length > 0) {
      return res.status(409).json({ message: 'Promotion request already exists' });
    }

    // Add promotion request to the database
    const [promotionInsertResult] = await db.promise().query(
      `INSERT INTO promotionrequests (promotion_id, promotionrequeststatus_id, company_id, date) VALUES (?, ?, ?, NOW())`,
      [promotioid, 1, companyId]
    );

    // if (promotionInsertResult.affectedRows === 0) {
    //   return res.status(500).json({ message: 'Failed to add promotion request' });
    // }

    await db.promise().query(
      'INSERT INTO partnerlogs (timestamp, action, partner_user_id) VALUES (NOW(), ?, ?)',
      [` Requested a Promotion : ${promotioid}`, req.user.id]
    );

    res.status(200).json({ message: 'Promotion request added successfully' });

  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log(err);

  }
};

exports.getPromotypes = async (req, res, next) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT
      id, 
      name
      FROM 
        promotiontype
    `);

    res.status(200).json(rows);

  } catch (err) {
    next(err);
  }
};
