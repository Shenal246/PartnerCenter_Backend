// my-b2b-app/controllers/becomePartnerController.js
const db = require('../config/database');
const { errorHandler } = require('../middlewares/errorHandler');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

// File upload middleware
exports.uploadFiles = upload.fields([
  { name: 'brFile' },
  { name: 'vatFile' },
  { name: 'forn20' }
]);

// Function to trim all string inputs
const trimData = (data) => {
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

// Function to handle file paths
const getFilePath = (files, fileName) => {
  return files[fileName] ? files[fileName][0].path : null;
};

exports.becomePartner = async (req, res) => {
  try {
    const data = trimData(req.body);
    const brFile = getFilePath(req.files, 'brFile');
    const vatFile = getFilePath(req.files, 'vatFile');
    const forn20 = getFilePath(req.files, 'forn20');

    // Check if a record with the same BR number already exists
    const [existingRecord] = await db.promise().query(`
      SELECT id FROM become_a_partner WHERE company_brno = ?
    `, [data.brNumber]);

    if (existingRecord.length > 0) {
      res.status(210).json({ message: 'A partner with this BR number already exists.' });
    } else {
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
    }

  } catch (err) {
    console.error('Error submitting partner application:', err);
    res.status(500).json({ message: 'An error occurred while submitting the application. Please try again later.' });
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