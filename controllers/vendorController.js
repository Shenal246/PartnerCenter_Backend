const db = require('../config/database');

// Add a New Vendor
exports.addVendor = async (req, res) => {
  const {
    name,
    des = '',
    wlink = '',
    status = 'enabled',
    Perimeter_and_internal_security = false, // Expecting 0 or 1 from frontend
    Cyber_Security_Governance_Compliance = false,
    Authentication_Identity_Management = false,
    Security_Management = false,
    Endpoint_Security = false,
    Networking = false,
    Data_Center_Infrastructure_and_Infrastructure_Monitoring = false,
    Server_Storage_Backup_Solutions = false,
  } = req.body;

  const image_data = req.file ? req.file.buffer : null;
  const cnt = req.body.cnt || req.headers.cnt;

  if (!name || !cnt) {
    return res.status(400).json({ message: 'Vendor name and cnt are required' });
  }

  try {
    const [result] = await db.promise().query(
      `INSERT INTO vendor 
        (name, des, wlink, image_data, status, Perimeter_and_internal_security, 
        Cyber_Security_Governance_Compliance, Authentication_Identity_Management, 
        Security_Management, Endpoint_Security, Networking, 
        Data_Center_Infrastructure_and_Infrastructure_Monitoring, 
        Server_Storage_Backup_Solutions, cnt) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, des, wlink, image_data, status, Perimeter_and_internal_security,
        Cyber_Security_Governance_Compliance, Authentication_Identity_Management,
        Security_Management, Endpoint_Security, Networking,
        Data_Center_Infrastructure_and_Infrastructure_Monitoring,
        Server_Storage_Backup_Solutions, cnt
      ]
    );

    res.status(200).json({ message: 'Vendor added successfully', vendorId: result.insertId });
  } catch (err) {
    console.error("Error adding vendor:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get Vendors with `cnt` value of '1'
exports.getActiveVendors = async (req, res) => {
  const cnt = req.headers.cnt;

  try {
    const [rows] = await db.promise().query('SELECT * FROM `vendor` WHERE cnt = ? ORDER by id asc', [cnt]);

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
  const {
    name, des, wlink, status, Perimeter_and_internal_security,
    Cyber_Security_Governance_Compliance, Authentication_Identity_Management,
    Security_Management, Endpoint_Security, Networking,
    Data_Center_Infrastructure_and_Infrastructure_Monitoring, Server_Storage_Backup_Solutions
  } = req.body;

  const image_data = req.file ? req.file.buffer : null; // Handle the uploaded image file

  try {
    const [result] = await db.promise().query(
      `UPDATE vendor 
      SET name = ?, des = ?, wlink = ?, image_data = COALESCE(?, image_data), status = ?, 
          Perimeter_and_internal_security = ?, Cyber_Security_Governance_Compliance = ?, 
          Authentication_Identity_Management = ?, Security_Management = ?, 
          Endpoint_Security = ?, Networking = ?, 
          Data_Center_Infrastructure_and_Infrastructure_Monitoring = ?, 
          Server_Storage_Backup_Solutions = ? 
      WHERE id = ?`,
      [
        name, des, wlink, image_data, status, Perimeter_and_internal_security,
        Cyber_Security_Governance_Compliance, Authentication_Identity_Management,
        Security_Management, Endpoint_Security, Networking,
        Data_Center_Infrastructure_and_Infrastructure_Monitoring,
        Server_Storage_Backup_Solutions, id
      ]
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
