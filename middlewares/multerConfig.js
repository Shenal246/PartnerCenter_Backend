// middlewares/multerConfig.js
const multer = require('multer');
const path = require('path');

// Set up storage for images
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Define the folder to save the images
    cb(null, 'uploads/vender/');
    
  },
  filename: function(req, file, cb) {
    // Create a unique filename for the image
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File size limit and file type filtering
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // Set the file size limit to 10MB
  fileFilter: function (req, file, cb) {
    // Only allow image file types (jpeg, jpg, png, gif)
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

module.exports = upload;
