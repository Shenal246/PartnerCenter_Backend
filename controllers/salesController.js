const db = require("../config/database");

exports.getActivepromo = async (req, res) => {
  const id = req.headers.id;

  try {
    const [rows] = await db.promise().query(`SELECT pr.date as pdate ,pr.id as prtid,s3.name as status, p.proimage as image_data, part.name as pname,part.email as pemail ,part.mobileno as pmobileno,p.id as pid ,p.details as pdetails,p.title as ptitle,pr.promotionrequeststatus_id as prstatus ,prod.name as prodname FROM promotionrequests pr JOIN promotion p ON pr.promotion_id = p.id JOIN product prod ON p.product_id = prod.id JOIN status s1 ON prod.status_id = s1.id JOIN company com ON pr.company_id = com.id JOIN partner part on com.id=part.company_id JOIN status s2 ON part.status_id = s2.id JOIN promotionrequeststatus s3 ON pr.promotionrequeststatus_id = s3.id JOIN status s4 ON p.status_id = s4.id join staff staf on staf.id = prod.pm_id where staf.id=${id} ORDER by pr.id;`);

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

exports.getActivedeal = async (req, res, next) => {
  try {
    // Query to get the staff_id from the staff_user table
    const [user] = await db.promise().query(`SELECT staff_id FROM staff_user WHERE id=?`, 1);

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
    s.id = ?`,
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


exports.getActiveprod = async (req, res) => {
  const id = req.headers.id;

  try {
    const [rows] = await db.promise().query(`SELECT pr.id as id , com.company_name as companyname,prt.email as email,prt.mobileno as mbno ,p.id as prdid, p.name as prdname,s.name as status ,p.image as prdimage,prt.photo as ppimage,ven.id as venid ,ven.name as venname ,ven.vendorlogo as logo , s.name as status FROM productrequests pr JOIN product p on pr.product_id=p.id JOIN company com on com.id=pr.company_id JOIN partner prt on prt.company_id=com.id JOIN vendor ven on ven.id = p.vendor_id JOIN prodrequeststatus s on s.id = pr.prodrequeststatus_id join staff staf on staf.id = p.pm_id where staf.id=1  ORDER by id ASC`);

    const vendors = rows.map(row => ({
      ...row,
      logo: row.logo ? row.logo.toString('base64') : null,
      prdimage: row.prdimage ? row.prdimage.toString('base64') : null, // Convert the image data to base64
    }));

    res.status(200).json(vendors);
  } catch (err) {
    console.error("Error fetching :", err);
    res.status(500).json({ error: err.message });
  }
};
exports.getActivepass = async (req, res) => {
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
  ;

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

exports.getActiveresdll = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`SELECT * FROM reconsiderdll`);

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

exports.getActivevendors = async (req, res) => {
  ;

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

exports.updateProdoreq = async (req, res) => {
  const { id } = req.params;
  const status = req.headers.status;
  try {
    const [result] = await db.promise().query(
      `UPDATE productrequests SET prodrequeststatus_id=? WHERE id=?;`,
      [status, id]
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
      `INSERT INTO reconsider (promoreqid,reason) VALUES (?,?);`,
      [id, reason]
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

