const db = require('../config/database');

exports.getVendors = async (req, res, next) => {
    try {
      const [rows] = await db.promise().query('SELECT * FROM vendor');
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
  
