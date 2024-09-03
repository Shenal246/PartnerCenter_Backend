const db = require('../../config/database2');


exports.getActiveVendorslogo = async (req, res) => {
    const cnt = req.headers.cnt;
  
    try {
      const [rows] = await db.promise().query(`SELECT image_data FROM vendor where cnt=? and status='enabled'`, [cnt]);
  
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

  exports.getActiveNews = async (req, res) => {
    const cnt = req.headers.cnt;

    try {
      const [rows] = await db.promise().query(`SELECT * FROM news WHERE cnt=? and status='enabled';`, [cnt]);
  
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

  exports.getActiveNewsByType = async (req, res) => {
    const cnt = req.headers.cnt;
    const type = req.headers.type;
  
    try {
      const [rows] = await db.promise().query(`SELECT * FROM news WHERE type=? and status='enabled' AND cnt=? order by id desc;`, [type,cnt]);
  
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
  exports.getActiveBlogs = async (req, res) => {
    const cnt = req.headers.cnt;
  
    try {
      const [rows] = await db.promise().query(`SELECT * FROM blog WHERE cnt = ? and status='enabled';`, [cnt]);
  
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

  exports.getActiveUpcomingEvent = async (req, res) => {
    const cnt = req.headers.cnt;
  
    try {
      const [rows] = await db.promise().query(`SELECT * FROM upcomingevents WHERE status='enabled' and cnt= ? ;`, [cnt]);
  
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

  exports.getActiveUpcomingEventSeat = async (req, res) => {
    const cnt = req.headers.cnt;
  
    try {
      const [rows] = await db.promise().query(`SELECT seats FROM upcomingevents WHERE id = ?;`, [cnt]);
  
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

  exports.addUpcommingEventRegister = async (req, res) => {
    const { upcomingid,title,name,designation,companyname,email,contactno,province,city,cnt } = req.body;
    const image = req.file ? req.file.buffer : null;

    console.log(cnt);
    try {
        const [result] = await db.promise().query(
            `INSERT INTO upcomingregister(upcomingid,title,name,designation,companyname,email,contactno,province,city,cnt) VALUES (?,?,?,?,?,?,?,?,?,?)`,
            [upcomingid,title,name,designation,companyname,email,contactno,province,city,cnt]
        );

        res.status(200).json({ message: 'added successfully',});
    } catch (err) {
        console.error("Error adding vendor:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.addNewChat = async (req, res) => {
    const { name,problem,tpno,statusid,time } = req.body;
    const image = req.file ? req.file.buffer : null;
    const cnt = req.headers.cnt;

    try {
        const [result] = await db.promise().query(
            `INSERT INTO chat(name,problem,tpno,countryid,statusid,time) VALUES (?,?,?,?,?,?)`,
            [name,problem,tpno,cnt,statusid,time]
        );

        res.status(200).json({ message: 'added successfully',});
    } catch (err) {
        console.error("Error adding vendor:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.addNewContactUs = async (req, res) => {
    const {firstname, lastname, company, tpno,email,comment } = req.body;
    const image = req.file ? req.file.buffer : null;
    const cnt = req.headers.cnt;
    

    try {
        const [result] = await db.promise().query(
            `INSERT INTO contactus(firstname, lastname, company, tpno,email,comment,countryid,statusid) VALUES (?,?,?,?,?,?,?,?)`,
            [firstname, lastname, company, tpno,email,comment,cnt,'new']
        );

        res.status(200).json({ message: 'added successfully',});
    } catch (err) {
        console.error("Error adding vendor:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateUpconingSeat = async (req, res) => {
    const { id } = req.params;
    const { seat} = req.body;
    const image_data = req.file ? req.file.buffer : null;

    try {
        const [result] = await db.promise().query(
            `UPDATE upcomingevents SET seats = ? WHERE id= ?`,
            [seat,id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'not found' });
        }

        res.status(200).json({ message: 'updated successfully' });
    } catch (err) {
        console.error("Error updating vendor:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.getActiveVendorspillor1 = async (req, res) => {
    const cnt = req.headers.cnt;
  
    try {
      const [rows] = await db.promise().query(`SELECT * FROM vendor WHERE Perimeter_and_internal_security='true' and  cnt = ? and status='enabled'  ;`, [cnt]);
  
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

  exports.getActiveVendorspillor2 = async (req, res) => {
    const cnt = req.headers.cnt;
  
    try {
      const [rows] = await db.promise().query(`SELECT * FROM vendor WHERE Cyber_Security_Governance_Compliance='true' and  cnt = ? and status='enabled'  ;`, [cnt]);
  
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

  exports.getActiveVendorspillor3 = async (req, res) => {
    const cnt = req.headers.cnt;
  
    try {
      const [rows] = await db.promise().query(`SELECT * FROM vendor WHERE Authentication_Identity_Management='true' and  cnt = ? and status='enabled'  ;`, [cnt]);
  
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

  exports.getActiveVendorspillor4 = async (req, res) => {
    const cnt = req.headers.cnt;
  
    try {
      const [rows] = await db.promise().query(`SELECT * FROM vendor WHERE Security_Management='true' and  cnt = ? and status='enabled'  ;`, [cnt]);
  
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

  exports.getActiveVendorspillor5 = async (req, res) => {
    const cnt = req.headers.cnt;
  
    try {
      const [rows] = await db.promise().query(`SELECT * FROM vendor WHERE Endpoint_Security='true' and  cnt = ? and status='enabled'  ;`, [cnt]);
  
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

  exports.getActiveVendorspillor6 = async (req, res) => {
    const cnt = req.headers.cnt;
  
    try {
      const [rows] = await db.promise().query(`SELECT * FROM vendor WHERE Networking ='true' and  cnt = ? and status='enabled'  ;`, [cnt]);
  
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
  exports.getActiveVendorspillor7 = async (req, res) => {
    const cnt = req.headers.cnt;
  
    try {
      const [rows] = await db.promise().query(`SELECT * FROM vendor WHERE Data_Center_Infrastructure_and_Infrastructure_Monitoring ='true' and  cnt = ? and status='enabled'  ;`, [cnt]);
  
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
  exports.getActiveVendorspillor8 = async (req, res) => {
    const cnt = req.headers.cnt;
  
    try {
      const [rows] = await db.promise().query(`SELECT * FROM vendor WHERE Server_Storage_Backup_Solutions ='true' and  cnt = ? and status='enabled'  ;`, [cnt]);
  
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