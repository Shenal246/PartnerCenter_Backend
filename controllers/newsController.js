const db = require('../config/database');

exports.addNews = async (req, res) => {
    const { title, link, type, status } = req.body;
    const image_data = req.file ? req.file.buffer : null;
    const cnt = req.body.cnt || req.headers.cnt;
  
    if (!title || !link || !type || !cnt) {
      return res.status(400).json({ message: 'Title, Video Link, News Type, and cnt are required' });
    }
  
    try {
      const [result] = await db.promise().query(
        `INSERT INTO news(title,link,type,status,cnt,image_data)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [title, link, type, status, cnt, image_data]
      );
  
      res.status(200).json({ message: 'News added successfully', newsId: result.insertId });
    } catch (err) {
      console.error("Error adding news:", err);
      res.status(500).json({ error: err.message });
    }
  };

  exports.getNews = async (req, res) => {
    const cnt = req.headers.cnt;
  
    if (!cnt) {
      return res.status(400).json({ message: 'cnt is required' });
    }
  
    try {
      const [rows] = await db.promise().query(
        'SELECT * FROM `news` WHERE cnt = ? ORDER BY id ASC', 
        [cnt]
      );
  
      const news = rows.map(row => ({
        ...row,
        image_data: row.image_data ? row.image_data.toString('base64') : null // Convert the image data to base64 // Convert image to base64
      }));
  
      res.status(200).json(news);
    } catch (err) {
      console.error("Error fetching news:", err);
      res.status(500).json({ error: err.message });
    }
  };

  exports.updateNews = async (req, res) => {
    const { id } = req.params;
    const { title, link, type, status } = req.body;
    const image_data = req.file ? req.file.buffer : null;
    const cnt = req.body.cnt || req.headers.cnt;
  
    if (!cnt) {
      return res.status(400).json({ message: 'cnt is required' });
    }
  
    try {
      const [result] = await db.promise().query(
        `UPDATE news SET title = ?, link = ?, image_data = COALESCE(?, image_data), 
        type = ?, status = ? 
        WHERE id = ?`,
        [title, link, image_data, type, status, id]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'News not found or cnt mismatch' });
      }
  
      res.status(200).json({ message: 'News updated successfully' });
    } catch (err) {
      console.error("Error updating news:", err);
      res.status(500).json({ error: err.message });
    }
  };
  