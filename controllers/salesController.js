const db = require("../config/database");

exports.getActivepromo = async (req, res) => {
    const cnt = req.headers.cnt;
  
    try {
      const [rows] = await db.promise().query(`SELECT  part.id as prtid,s3.name as status, p.proimage as image_data, part.name as pname,part.email as pemail ,part.mobileno as pmobileno,p.id as pid ,p.details as pdetails,p.title as ptitle,pr.status_id as prstatus ,prod.name as prodname FROM promotionrequest pr JOIN promotion p ON pr.promotion_id = p.id JOIN product prod ON p.product_id = prod.id JOIN status s1 ON prod.status_id = s1.id JOIN partner part ON pr.partner_id = part.id JOIN status s2 ON part.status_id = s2.id JOIN status s3 ON pr.status_id = s3.id JOIN status s4 ON p.status_id = s4.id ORDER by pr.id;`);
  
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