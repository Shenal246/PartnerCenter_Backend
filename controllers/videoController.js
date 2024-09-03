// my-b2b-app/controllers/videoController.js
const db = require('../config/database');

// Controller function to get video information
exports.getVideoInfo = async (req, res) => {
    try {
        // Query to fetch video information
        const [videos] = await db.promise().query(`
           SELECT 
                id,  
                description, 
                title, 
                link, 
                status_id, 
                country_id, 
                DATE_FORMAT(uploaded_date, '%Y-%m-%d') AS uploaded_date 
            FROM video
        `);

        // Check if videos are found
        if (videos.length === 0) {
            return res.status(404).json({ message: 'No videos found' });
        }

        // Send the list of videos as a JSON response
        res.status(200).json(videos);
    } catch (err) {
        console.error('Error fetching video information:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
        console.log(err);
        


    }
};

exports.addNewVideo = async (req, res) => {
    const VideoData = req.body;
    if (!VideoData) {
        return res.status(400).json({ message: 'Video Data array is required' });
    }

    try {
        const [result] = await db.promise().query('INSERT INTO video (description, title, link, status_id, country_id, uploaded_date) VALUES (?,?,?,?,?,?)',
            [VideoData.description, VideoData.title, VideoData.videoUrl, VideoData.status, 1, VideoData.uploadedDate]);

        res.status(200).json({ message: 'Video added successfully', newvideoid: result.insertId });
    } catch (error) {
        console.error('Error fetching VideoData information:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
}

// Controller function to get video information
exports.getVideoInfoforPartner = async (req, res) => {
    try {
        // Query to fetch video information
        const [videos] = await db.promise().query(`
           SELECT 
                id,  
                description, 
                title, 
                link, 
                status_id, 
                country_id, 
                DATE_FORMAT(uploaded_date, '%Y-%m-%d') AS uploaded_date 
            FROM video WHERE status_id=1
        `);

        // Check if videos are found
        if (videos.length === 0) {
            return res.status(404).json({ message: 'No videos found' });
        }

        // Send the list of videos as a JSON response
        res.status(200).json(videos);
    } catch (err) {
        console.error('Error fetching video information:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });


    }
};



// Controller function to get video information
exports.updateVideo = async (req, res) => {
    // Controller function to update video status
  const updateVideoData = req.body;
  
  if (!updateVideoData) {
    return res.status(400).json({ message: 'Video data is required' });
  
  }
  try {
    // Update product information in the database
    await db.promise().query(
      'UPDATE video SET status_id = ? WHERE id = ?',
      [updateVideoData.status_id, updateVideoData.id]
    );
  
    // Insert a log into the stafflogs table
    // await db.promise().query(
    //   'INSERT INTO stafflogs (timestamp, action, staff_user_id) VALUES (NOW(), ?, ?)',
    //   [` Update PromoData : ${updateVideoData.id}`, req.user.id]
    // );
  
    // Return a success response
    res.status(200).json({ message: 'Promotion updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  
  }
  };
