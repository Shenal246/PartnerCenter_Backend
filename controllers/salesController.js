const db = require("../config/database");

exports.getActivepromo = async (req, res) => {
    const id = req.headers.id;
  
    try {
      const [rows] = await db.promise().query(`SELECT pr.date as pdate ,pr.id as prtid,s3.name as status, p.proimage as image_data, part.name as pname,part.email as pemail ,part.mobileno as pmobileno,p.id as pid ,p.details as pdetails,p.title as ptitle,pr.status_id as prstatus ,prod.name as prodname FROM promotionrequest pr JOIN promotion p ON pr.promotion_id = p.id JOIN product prod ON p.product_id = prod.id JOIN status s1 ON prod.status_id = s1.id JOIN partner part ON pr.partner_id = part.id JOIN status s2 ON part.status_id = s2.id JOIN status s3 ON pr.status_id = s3.id JOIN status s4 ON p.status_id = s4.id join staff staf on staf.id = prod.pm_id where staf.id=${id} ORDER by pr.id;`);
  
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
  
  exports.getActivedeal = async (req, res) => {
    const id = req.headers.id;
  
    try {
      const [rows] = await db.promise().query(`SELECT dr.designation as des, dr.id as id,dr.closetimeline as closetimeline,dr.compititor as compettitor,dr.specialrequest as spr, dr.projectname as projectname,dr.companyname as comname,dr.email as email,tp.name as type,p.name as product,crn.name as curency ,dr.budget as budegt, st.name as status  FROM dealregistration dr join status st on st.id = dr.pm_status join type tp on tp.id = dr.type_id join product p on p.id = dr.product_id join staff staf on staf.id = p.pm_id  JOIN currencyunit crn on crn.id=dr.currencyunit_id where p.pm_id=${id} ORDER by dr.id ASC`);
  
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

  exports.getActiveprod= async (req, res) => {
    const id = req.headers.id;
  
    try {
      const [rows] = await db.promise().query(`SELECT pr.id as id , cm.company_name as companyname,pp.email as email,pp.mobileno as mbno ,p.id as prdid, p.name as prdname,pr.status_id as status ,p.image as prdimage,pp.photo as ppimage,ven.id as venid ,ven.name as venname ,ven.vendorlogo as logo , s.name as status FROM productrequests pr JOIN product p on pr.product_id=p.id JOIN partner pp on pp.id=pr.partner_id JOIN company cm on cm.id=pp.company_id JOIN vendor ven on ven.id = p.vendor_id JOIN status s on s.id = pr.status_id join staff staf on staf.id = p.pm_id where staf.id=${id}  ORDER by id ASC`);
  
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

exports.updateProdoreq = async (req, res) => {
  const { id } = req.params;
  const status = req.headers.status;
  try {
      const [result] = await db.promise().query(
          `UPDATE productrequests SET status_id=? WHERE id=?;`,
          [status,id]
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


exports.updatedealoreq = async (req, res) => {
  const { id } = req.params;
  const status = req.headers.status;
  try {
      const [result] = await db.promise().query(
          `UPDATE dealregistration SET pm_status=? WHERE id=?;`,
          [status,id]
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

exports.addreasonprd = async (req, res) => {
  
  const reason = req.headers.reason;
  const id = req.headers.id;
  try {
      const [result] = await db.promise().query(
          `INSERT INTO reconsiderprd (prodreqid,reason) VALUES (?,?);`,
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

exports.addreasondll = async (req, res) => {
  
  const reason = req.headers.reason;
  const id = req.headers.id;
  try {
      const [result] = await db.promise().query(
          `INSERT INTO reconsiderdll(dealregistration_id, reason) VALUES (?,?)`,
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

