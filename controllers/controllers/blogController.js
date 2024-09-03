const db = require('../../config/database2');

// Add a New Vendor
exports.addVendor = async (req, res) => {
    const { title, firstText, description,cnt, statusid = 'enabled' } = req.body;
    const image = req.file ? req.file.buffer : null;

    try {
        const [result] = await db.promise().query(
            `INSERT INTO blog (title, firstText,countryid,description, image_data, statusid) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [title, firstText,cnt, description,image, statusid]
        );

        res.status(200).json({ message: 'Vendor added successfully', vendorId: result.insertId });
    } catch (err) {
        console.error("Error adding vendor:", err);
        res.status(500).json({ error: err.message });
    }
};

// Get All Vendors
exports.getActiveVendors = async (req, res) => {
    const cnt = req.headers.cnt;
  
    try {
      const [rows] = await db.promise().query('SELECT * FROM `blog` WHERE countryid = ? ORDER by id asc', [cnt]);
  
      const vendors = rows.map(row => ({
        ...row,
        image_data: row.image_data ? row.image_data.toString('base64') : null // Convert the image data to base64
      }));
  
      res.status(200).json(vendors);
    } catch (err) {
      console.error("Error fetching vendors:", err);
      res.status(500).json({ error: err.message });
    }
  };

// Update Vendor
exports.updateVendor = async (req, res) => {
    const { id } = req.params;
    const { title, firstText, description, statusid } = req.body;
    const image_data = req.file ? req.file.buffer : null;

    try {
        const [result] = await db.promise().query(
            `UPDATE blog 
             SET title = ?, firstText = ?, description = ?, image_data = COALESCE(?, image_data), statusid = ? 
             WHERE id = ?`,
            [title, firstText, description, image_data, statusid, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        res.status(200).json({ message: 'Vendor updated successfully' });
    } catch (err) {
        console.error("Error updating vendor:", err);
        res.status(500).json({ error: err.message });
    }
};
