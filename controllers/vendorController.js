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

// Add Vendor
exports.addVendor = async (req, res, next) => {
  const vendorData = req.body;

  if (!vendorData) {
    return res.status(400).json({ message: 'vendor data is required' });
  }

  const name = vendorData.name;
  const status_id = vendorData.status;
  const country_id = 1;
  const proimage = vendorData.imageUrl;
  try {
    // Handle the base64 image data
    if (!proimage || !proimage.startsWith('data:image')) {
      return res.status(400).json({ message: 'Invalid image data' });
    }

    // Remove the base64 prefix and convert to buffer
    const base64Data = proimage.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    // Insert the new vendor into the database
    const [result] = await db.promise().query(
      'INSERT INTO vendor (name, vendorlogo, status_id, country_id) VALUES (?, ?, ?, ?)',
      [name, buffer, status_id, country_id]
    );
    const vendorId = result.insertId;

    // Insert a log into the stafflogs table
    await db.promise().query(
      'INSERT INTO stafflogs (timestamp, action, staff_user_id) VALUES (NOW(), ?, ?)',
      [` New vendor Added : ${vendorId}`, req.user.id]
    );

    return res.status(200).json({ message: 'vendor added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error);
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

