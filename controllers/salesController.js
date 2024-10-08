const db = require("../config/database");



//get  promotions 
exports.getActivepromo = async (req, res, next) => { 
  try {
    // Retrieve staff_id from staff_user table using req.user.id
    const [users] = await db.promise().query(`SELECT staff_id FROM staff_user WHERE id=?`, [req.user.id]);

    // Check if the user was found
    if (users.length === 0) {
      return res.status(404).json({ message: "Staff user not found" });
    }

    // Extract staff_id from the first row of the results
    const staffId = users[0].staff_id;

    // Query to get promotion requests where the pm_id (product manager ID) matches the staff_id
    const [requests] = await db.promise().query(
      `SELECT 
      pr.id,
        p.proimage,
        prod.name AS product_name,
        p.title AS promotion_name,
        prod.name AS product_name,
        c.company_name,
        c.company_email,
        c.company_telephone,
        prreq.name AS request_status,
        pr.date,
        pr.note
      FROM 
        promotionrequests pr
        JOIN promotion p ON pr.promotion_id = p.id
        JOIN product prod ON p.product_id = prod.id
        JOIN company c ON pr.company_id = c.id
        JOIN promotionrequeststatus prreq ON pr.promotionrequeststatus_id = prreq.id
      WHERE 
        prod.pm_id = ?`,
      [staffId]
    );

    // Check if we have results and return them
    if (requests.length > 0) {
      res.status(200).json(requests);
    } else {
      res.status(404).json({ message: "No promotion requests found for this staff member." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// get  deals
exports.getActivedeal = async (req, res, next) => { 
  try {
    // Query to get the staff_id from the staff_user table
    const [user] = await db.promise().query(`SELECT staff_id FROM staff_user WHERE id=?`, [req.user.id]);

    // Check if the user was found
    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract staff_id from the first row of the results
    const staffId = user[0].staff_id;

    // Query to get deal registrations associated with the staff_id, including the status name
    const [rows, fields] = await db.promise().query(
      `SELECT 
    dr.id,
    dr.projectname,
    dr.companyname,
    dr.contactno,
    dr.designation,
    dr.email,
    dr.reason,
    DATE_FORMAT(dr.closetimeline, '%Y-%m-%d ') AS closetimeline,
    dr.budget,
    dr.specialrequest,
    DATE_FORMAT(dr.date, '%Y-%m-%d ') AS date,
    dr.compititor,
    cu.name AS currency_name,
    t.name AS type_name,
    p.name AS product_name,
    pa.name AS partner_name,
    c.name AS country_name,
    ds.name AS deal_status_name,
    v.name AS vendor_name
FROM 
    dealregistration dr
    JOIN product p ON dr.product_id = p.id
    JOIN staff s ON p.pm_id = s.id
    LEFT JOIN currencyunit cu ON dr.currencyunit_id = cu.id
    LEFT JOIN type t ON dr.type_id = t.id
    LEFT JOIN partner pa ON dr.partner_id = pa.id
    LEFT JOIN country c ON dr.country_id = c.id
    LEFT JOIN dealstatus ds ON dr.dealstatus_id = ds.id
    LEFT JOIN vendor v ON dr.vendor_id = v.id
WHERE 
    p.pm_id = ?`,
      [staffId]
    );

    // Check if we have results and return them
    if (rows.length > 0) {
      res.status(200).json(rows);
    } else {
      res.status(404).json({ message: "No deal registrations found for this user." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getActiveprod = async (req, res, next) => {
  try {
    // Step 1: Query to get the staff_id from staff_user table using the user's ID
    const [user] = await db.promise().query(`SELECT staff_id FROM staff_user WHERE id=?`, [req.user.id]);

    // Step 2: Check if the user was found
    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract staff_id from the first row of the results
    const staffId = user[0].staff_id;

    // Step 3: Query to get product requests associated with the staff_id
    const [rows] = await db.promise().query(
      `SELECT 
        pr.id,
        pr.date,
        pr.note,
        p.name AS product_name,
        s.name AS staff_name,
        c.company_name,
        c.company_email,
        c.company_telephone,
        v.name AS vendor_name,
        p.image,
        prodr.name AS request_status
      FROM 
        productrequests pr
        JOIN product p ON pr.product_id = p.id
        JOIN staff s ON p.pm_id = s.id
        JOIN company c ON pr.company_id = c.id
        JOIN vendor v ON p.vendor_id = v.id
        JOIN prodrequeststatus prodr ON pr.prodrequeststatus_id = prodr.id
      WHERE 
        p.pm_id = 1`,
     
    );

    // Step 4: Check if we have results and return them
    if (rows.length > 0) {
      res.status(200).json(rows);
    } else {
      res.status(404).json({ message: "No product requests found for this user." });
    }
  } catch (err) {
    console.error(err); // Log the error for debugging purposes
    res.status(500).json({ error: err.message });
  }
};


exports.getActivepassword = async (req, res) => {
  const id = req.headers.id;

  try {
    const [rows] = await db.promise().query(`SELECT password FROM staff_user WHERE id = ?`, [id]);

    if (rows.length > 0) {
      const password = rows[0].password; // Extract the password from the first row
      res.status(200).send(password); // Send the password as plain text
    } else {
      res.status(404).send('Password not found'); // Handle the case where no password is found
    }
  } catch (err) {
    console.error("Error fetching password:", err);
    res.status(500).send('Server error'); // Send a generic error message
  }
};

exports.getActivestatus = async (req, res) => {
  const cnt = req.headers.cnt;

  try {
    const [rows] = await db.promise().query(`SELECT * FROM promotionrequeststatus`);

    const vendors = rows.map(row => ({
      ...row,
      image_data: row.image_data ? row.image_data.toString('base64') : null // Convert the image data to base64
    }));

    res.status(200).json(vendors);
  } catch (err) {
    console.error("Error fetching :", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getActiveres = async (req, res) => {
  

  try {
    const [rows] = await db.promise().query(`SELECT * FROM reconsider`);

    const vendors = rows.map(row => ({
      ...row,
      image_data: row.image_data ? row.image_data.toString('base64') : null // Convert the image data to base64
    }));

    res.status(200).json(vendors);
  } catch (err) {
    console.error("Error fetching :", err);
    res.status(500).json({ error: err.message });
  }
};
exports.getActiveresprd = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`SELECT * FROM reconsiderprd`);

    const vendors = rows.map(row => ({
      ...row,
      image_data: row.image_data ? row.image_data.toString('base64') : null // Convert the image data to base64
    }));

    res.status(200).json(vendors);
  } catch (err) {
    console.error("Error fetching :", err);
    res.status(500).json({ error: err.message });
  }
};

// exports.getActiveresdll = async (req, res) => {
//   try {
//     const [rows] = await db.promise().query(`SELECT * FROM reconsiderdll`);

//     const vendors = rows.map(row => ({
//       ...row,
//       image_data: row.image_data ? row.image_data.toString('base64') : null // Convert the image data to base64
//     }));

//     res.status(200).json(vendors);
//   } catch (err) {
//     console.error("Error fetching :", err);
//     res.status(500).json({ error: err.message });
//   }
// };

exports.getActivevendors = async (req, res) => {
 
  try {
    const [rows] = await db.promise().query(`SELECT * FROM vendor`);

    const vendors = rows.map(row => ({
      ...row,
      vendorlogo: row.vendorlogo ? row.vendorlogo.toString('base64') : null // Convert the image data to base64
    }));

    res.status(200).json(vendors);
  } catch (err) {
    console.error("Error fetching :", err);
    res.status(500).json({ error: err.message });
  }
}
exports.updatePromoreq = async (req, res) => {
  const { id } = req.params;
  const status = req.headers.status;
  
  try {
    const [result] = await db.promise().query(
      `UPDATE promotionrequests SET promotionrequeststatus_id=? WHERE id=?;`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: ' not found' });
    }

    res.status(200).json({ message: ' updated successfully' });
  } catch (err) {
    console.error("Error updating vendor:", err);
    res.status(500).json({ error: err.message });
  }
};

//now weda 
exports.updateProdoreq = async (req, res) => {
  const { id } = req.params;
  const status = req.headers.status;

  const reason=req.headers.reason
  try {

    const [rows] = await db.promise().query(
      'SELECT id FROM staff_user WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid User' });
    }


    const [result] = await db.promise().query(
      `UPDATE productrequests SET prodrequeststatus_id=?, note=? ,action_by_id=? WHERE id=?;`,
      [status, reason,rows[0].id ,id]
    );
    

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'not_found' });
    }

    res.status(200).json({ message: ' updated successfully' });
  } catch (err) {
    console.error("Error updating vendor:", err);
    res.status(500).json({ error: err.message });
  }
};

//not dealstatus_id
exports.updatedealoreq = async (req, res) => {
  const { id } = req.params;
  const status = req.headers.status;

  try {
    const [rows] = await db.promise().query(
      'SELECT id FROM staff_user WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid User' });
    }

    // Extract the user ID from the query result
    const userId = rows[0].id;

    let winloststatus_id = null; // Initialize with null or default value

    // Determine winloststatus_id based on the status value
    if (status === '2') {
      winloststatus_id = 1;
    } else if (status === '4') {
      winloststatus_id = 1;
    } else if (status === '3') {
      winloststatus_id = 2;
    }

    const [result] = await db.promise().query(
      `UPDATE dealregistration SET dealstatus_id=?, winloststatus_id=?, approvedby_id=? WHERE id=?;`,
      [status, winloststatus_id, userId, id]  // Use userId instead of userid
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'not_found' });
    }

        // Log action in stafflogs
        await db.promise().query(
          'INSERT INTO stafflogs (timestamp, action, staff_user_id) VALUES (NOW(), ?, ?)',
          [`update dealregistration status: ${status}`, req.user.id]
      );

    res.status(200).json({ message: 'updated successfully' });
  } catch (err) {
    console.error("Error updating vendor:", err);
    res.status(500).json({ error: err.message });
  }
};


//ok
exports.addreason = async (req, res) => {

  const reason = req.headers.reason;
  const id = req.headers.id;

 
  
  try {
    const [result] = await db.promise().query(
      `UPDATE promotionrequests SET note = ? WHERE id = ?`,
      [reason, id]
    );    

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: ' not found' });
    }

    res.status(200).json({ message: ' updated successfully' });
  } catch (err) {
    console.error("Error updating vendor:", err);
    res.status(500).json({ error: err.message });
  }
};
//ok
exports.addreasonprd = async (req, res) => {

  const reason = req.headers.reason;
  const id = req.headers.id;
  try {
    const [result] = await db.promise().query(
      `INSERT INTO reconsiderprd (prodreqid,reason) VALUES (?,?);`,
      [id, reason]


      // UPDATE promotionrequests SET note = 'This is a sample note' WHERE id = 10;
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: ' not found' });
    }

    res.status(200).json({ message: ' updated successfully' });
  } catch (err) {
    console.error("Error updating vendor:", err);
    res.status(500).json({ error: err.message });
  }
};
//deal registration 
exports.addreasondll = async (req, res) => {
  const reason = req.headers.reason;
  const id = req.headers.id;

  try {
    const [result] = await db.promise().query(
      `UPDATE dealregistration SET reason = ? WHERE id = ?`,
      [reason, id]
    );
    

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: ' not found' });
    }
    
      // Log action in stafflogs
      await db.promise().query(
        'INSERT INTO stafflogs (timestamp, action, staff_user_id) VALUES (NOW(), ?, ?)',
        [`update dealregistration reason `, req.user.id]
    );

    res.status(200).json({ message: ' updated successfully' });
  } catch (err) {
    console.error("Error updating vendor:", err);
    res.status(500).json({ error: err.message });
  }
};

