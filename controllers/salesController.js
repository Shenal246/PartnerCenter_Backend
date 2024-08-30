const db = require("../config/database");

exports.getActivepromo = async (req, res) => {
    const cnt = req.headers.cnt;
  
    try {
      const [rows] = await db.promise().query(`SELECT pr.date as pdate ,pr.id as prtid,s3.name as status, p.proimage as image_data, part.name as pname,part.email as pemail ,part.mobileno as pmobileno,p.id as pid ,p.details as pdetails,p.title as ptitle,pr.status_id as prstatus ,prod.name as prodname FROM promotionrequest pr JOIN promotion p ON pr.promotion_id = p.id JOIN product prod ON p.product_id = prod.id JOIN status s1 ON prod.status_id = s1.id JOIN partner part ON pr.partner_id = part.id JOIN status s2 ON part.status_id = s2.id JOIN status s3 ON pr.status_id = s3.id JOIN status s4 ON p.status_id = s4.id ORDER by pr.id;`);
  
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
      const [rows] = await db.promise().query(`SELECT * FROM status`);
  
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
  exports.updatePromoreq = async (req, res) => {
    const { id } = req.params;
    const status = req.headers.status;
    try {
        const [result] = await db.promise().query(
            `UPDATE promotionrequest SET status_id=? WHERE id=?;`,
            [status,id]
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

exports.addreason = async (req, res) => {
  
  const reason = req.headers.reason;
  const id = req.headers.id;
  try {
      const [result] = await db.promise().query(
          `INSERT INTO reconsider (promoreqid,reason) VALUES (?,?);`,
          [id,reason]
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

