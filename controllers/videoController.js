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

        console.log(VideoData);
        res.status(200).json({ message: 'Video added successfully', newvideoid: result.insertId });
    } catch (error) {
        console.error('Error fetching VideoData information:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
}
