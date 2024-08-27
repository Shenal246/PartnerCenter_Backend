const db = require('../config/database');
const { errorHandler } = require('../middlewares/errorHandler');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// File upload middleware
exports.uploadFiles = upload.fields([
  { name: 'brFile' },
  { name: 'vatFile' },
  { name: 'forn20' }
]);

// Function to trim and sanitize all string inputs
const trimAndSanitizeData = (data) => {
  const trimmedData = {};
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'string') {
      trimmedData[key] = data[key].trim();
    } else {
      trimmedData[key] = data[key];
    }
  });
  return trimmedData;
};

// Function to handle file paths, return null if no file is uploaded
const getFilePath = (files, fileName) => {
  return files && files[fileName] ? files[fileName][0].path : null;
};

// Function to check if a record exists by BR number
const checkExistingBR = async (brNumber) => {
  const [existingRecord] = await db.promise().query(
    'SELECT id FROM become_a_partner WHERE company_brno = ?',
    [brNumber]
  );
  return existingRecord.length > 0;
};

exports.becomePartner = async (req, res) => {
  try {
    const data = trimAndSanitizeData(req.body);
    const brFile = getFilePath(req.files, 'brFile');
    const vatFile = getFilePath(req.files, 'vatFile');
    const forn20 = getFilePath(req.files, 'forn20');

    // Check if a partner with the same BR number already exists
    const isExisting = await checkExistingBR(data.brNumber);
    if (isExisting) {
      return res.status(210).json({ message: 'A partner with this BR number already exists.' });
    }

    // Insert data into the database
    await db.promise().query(`
      INSERT INTO become_a_partner 
      (fillname, fillemail, filldesignation, fillmobile, filldepartment, company_name, 
      company_address, company_city, company_website, company_email, company_mobile, 
      companycountry_id, company_wtsapp, company_brno, company_vatno, company_br, company_vat, 
      directorname, directoremail, directormobile, directorwtsapp, form20submit, date, country_id, becomestatus_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.personalName, data.personalEmail, data.designation, data.personalMobile, data.department,
      data.companyName, data.address, data.city, data.websiteLink, data.companyEmail,
      data.telephone, data.country, data.whatsappBusiness, data.brNumber, data.vatNumber,
      brFile, vatFile, data.directorName, data.directorEmail, data.directorMobile,
      data.directorWhatsapp, forn20, new Date(), 1, 1
    ]);

    res.status(201).json({ message: 'Partner application submitted successfully' });
  } catch (err) {
    console.error('Error submitting partner application:', err);
    res.status(500).json({ message: 'An error occurred while submitting the application. Please try again later.' });
  }
};

exports.getPartnerApplications = async (req, res) => {
  try {
    const query = `
      SELECT 
        bp.id,
        bp.fillname AS personalName,
        bp.fillemail AS personalEmail,
        bp.filldesignation AS designation,
        bp.fillmobile AS personalMobile,
        bp.filldepartment AS department,
        bp.company_name AS companyName,
        bp.company_address AS companyAddress,
        bp.company_city AS companyCity,
        bp.company_website AS companyWebsite,
        bp.company_email AS companyEmail,
        bp.company_mobile AS companyMobile,
        bp.company_wtsapp AS whatsappBusiness,
        bp.company_brno AS brNumber,
        bp.company_vatno AS vatNumber,
        bp.company_br AS brFile,
        bp.company_vat AS vatFile,
        bp.directorname AS directorName,
        bp.directoremail AS directorEmail,
        bp.directormobile AS directorMobile,
        bp.directorwtsapp AS directorWhatsapp,
        bp.form20submit AS form20File,
        bp.date,
        JSON_OBJECT('id', c.id, 'name', c.name) AS country,
        JSON_OBJECT('id', bs.id, 'name', bs.name) AS becomeStatus
      FROM 
        become_a_partner bp
      JOIN 
        country c ON bp.companycountry_id = c.id
      JOIN 
        becomestatus bs ON bp.becomestatus_id = bs.id
      ORDER BY 
        bp.date DESC
    `;

    const [rows] = await db.promise().query(query);

    // Send response as JSON
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching partner applications:', err);
    res.status(500).json({ message: 'An error occurred while retrieving the partner applications. Please try again later.' });
  }
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { becomestatus_id } = req.body;

  if (!becomestatus_id) {
    return res.status(400).json({ message: 'becomestatus_id is required' });
  }

  try {
    const [result] = await db.promise().query(
      'UPDATE become_a_partner SET becomestatus_id = ? WHERE id = ?',
      [becomestatus_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    res.status(200).json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating partner status:', error);
    errorHandler(error, req, res);
  }
};

exports.rejectpartnerfunction = async (req, res) => {

  const { id, password, note } = req.body;

  if (!id || !password || !note) {
    return res.status(400).json({ message: 'Partner ID, Password, Note are required' });
  }

  const becomepartnerID = id;

  try {
    // Check password
    const [getuser] = await db.promise().query(`
      SELECT * FROM staff_user WHERE id = ?
  `, [req.user.id]);

    if (getuser.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const match = await bcrypt.compare(password, getuser[0].password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Fetch partner details from the become_a_partner table
    const [partnerData] = await db.promise().query(`
      SELECT * FROM become_a_partner WHERE id = ?
  `, [becomepartnerID]);

    if (partnerData.length === 0) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    const partner = partnerData[0];

    // Change the become a partner status
    await db.promise().query(
      'UPDATE become_a_partner SET becomestatus_id = ?, approvedby_id = ?, note = ? WHERE id = ?',
      [3, req.user.id, note, becomepartnerID]
    );

    await db.promise().query(
      'INSERT INTO stafflogs (timestamp, action, staff_user_id) VALUES (NOW(), ?, ?)',
      [`Rejected a new partner: BR No = ${partner.company_brno}`, req.user.id]
    );

    res.status(200).json({
      message: 'Partner Registration Rejected'
    });


  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
    console.log(err);
    
  }


};