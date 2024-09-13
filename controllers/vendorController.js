const db = require('../config/database');

exports.getVendors = async (req, res, next) => {
  try {
    const [rows] = await db.promise().query('SELECT * FROM vendor');
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getVendorswithCategory = async (req, res, next) => {
  try {
    const [rows] = await db.promise().query(`SELECT v.*,
GROUP_CONCAT(DISTINCT c.name ORDER BY c.name ASC) AS categories
      FROM partnercenter_connex.vendor v
      LEFT JOIN partnercenter_connex.product p ON v.id = p.vendor_id
      LEFT JOIN partnercenter_connex.category c ON p.category_id = c.id
      WHERE v.status_id=1
      GROUP BY 
        v.id; `);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getProductsByVendor = async (req, res, next) => {
  const vendorId = req.params.vendorId;
  console.log("vendorID---", vendorId);

  try {
    const query = `
        SELECT p.id, p.name, p.image, p.videolink, p.modelno, c.name AS category, 
               GROUP_CONCAT(f.name SEPARATOR ', ') AS features
        FROM product p
        JOIN category c ON p.category_id = c.id
        LEFT JOIN product_category_feature pcf ON p.id = pcf.product_id
        LEFT JOIN feature f ON pcf.feature_id = f.id
        WHERE p.vendor_id = ?
        GROUP BY p.id, p.name, p.image, p.videolink, p.modelno, c.name;
      `;
    const [rows] = await db.promise().query(query, [vendorId]);

    // Convert each image from buffer to base64
    const products = rows.map(product => {
      const base64Image = product.image ? product.image.toString('base64') : null;
      const imageUrl = base64Image ? `data:image/jpeg;base64,${base64Image}` : null; // Adjust MIME type if necessary

      return {
        ...product,
        image: imageUrl, // Include the base64-encoded image
      };
    });

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getProductById = async (req, res, next) => {
  const productId = req.params.productId;

  try {
    const query = `
          SELECT p.id, p.name, p.image, p.videolink, p.modelno, p.description, c.name AS category, 
                 GROUP_CONCAT(f.name SEPARATOR ', ') AS features
          FROM product p
          JOIN category c ON p.category_id = c.id
          LEFT JOIN product_category_feature pcf ON p.id = pcf.product_id
          LEFT JOIN feature f ON pcf.feature_id = f.id
          WHERE p.id = ?
          GROUP BY p.id, p.name, p.image, p.videolink, p.modelno, p.description, c.name;
      `;
    const [rows] = await db.promise().query(query, [productId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getHotProductsByVendor = async (req, res, next) => {
  const vendorId = req.params.vendorId;

  try {
    const query = `
          SELECT p.id, p.name, p.image, p.videolink, p.modelno, p.description, c.name AS category, 
                 GROUP_CONCAT(f.name SEPARATOR ', ') AS features
          FROM product p
          JOIN category c ON p.category_id = c.id
          LEFT JOIN product_category_feature pcf ON p.id = pcf.product_id
          LEFT JOIN feature f ON pcf.feature_id = f.id
          WHERE p.vendor_id = ? AND p.isHot = 1
          GROUP BY p.id, p.name, p.image, p.videolink, p.modelno, p.description, c.name;
      `;
    const [rows] = await db.promise().query(query, [vendorId]);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProducts = async (req, res, next) => {

  try {
    const query = `
           SELECT * FROM product
        `;
    const [rows] = await db.promise().query(query);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addVendor = async (req, res, next) => {
  const { name, status } = req.body;  // Get vendor name and status from request body
  const image = req.file;             // Get the uploaded image from Multer

  // Check if all required fields are provided
  if (!name || !status || !image) {
    return res.status(400).json({ message: 'All fields are required (name, status, image)' });
  }

  try {

    const [existing] = await db.promise().query(
      'SELECT name FROM vendor WHERE name = ?',
      [name]
    );

    // If a vendor with the same name exists, respond with an error message
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Vendor with the same name already exists' });
    }

    // Construct the image path to store in the database (using Multer's uploaded file info)
    const imagePath = `/uploads/vender/${image.filename}`;

    // Insert the new vendor into the database
    const [result] = await db.promise().query(
      'INSERT INTO vendor (name, vendorlogo, status_id, country_id) VALUES (?, ?, ?, ?)',
      [name, imagePath, status, 1]  // Assuming country_id is 1 as a default value
    );
    const vendorId = result.insertId;

    // Insert a log into the stafflogs table
    await db.promise().query(
      'INSERT INTO stafflogs (timestamp, action, staff_user_id) VALUES (NOW(), ?, ?)',
      [`New vendor added: ${vendorId}`, req.user.id]
    );

    // Respond with success message
    return res.status(200).json({ message: 'Vendor added successfully', vendorId });
  } catch (error) {
    console.error('Failed to add vendor:', error);
    res.status(500).json({ message: error.message });
  }
};


exports.updatevendor = async (req, res, next) => {
  const updatevendorData = req.body;

  if (!updatevendorData) {
    return res.status(400).json({ message: 'vendor data is required' });

  }
  try {
    // Update product information in the database
    await db.promise().query(
      'UPDATE vendor SET status_id = ? WHERE id = ?',
      [updatevendorData.status_id, updatevendorData.id]
    );

    // Insert a log into the stafflogs table
    await db.promise().query(
      'INSERT INTO stafflogs (timestamp, action, staff_user_id) VALUES (NOW(), ?, ?)',
      [` Update vendorData : ${updatevendorData.id}`, req.user.id]
    );

    // Return a success response
    res.status(200).json({ message: 'Vendor updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });

  }

};

