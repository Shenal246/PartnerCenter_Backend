// server.js
const express = require('express');
const bodyParser = require('body-parser');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const partnerRoutes = require('./routes/becomePartnerRoutes');
const commonRoutes = require('./routes/commonRoutes');
const videoRoutes = require('./routes/videoRoutes');
const sessionConfig = require('./config/sessionConfig');
const cors = require('cors');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Use CORS middleware
app.use(cors({
  // origin: 'http://localhost:3001', // Allow only requests from this origin
  // credentials: true // Allow cookies to be sent with requests
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(sessionConfig);

// Routes
app.use(authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/products', productRoutes);
app.use(partnerRoutes);
app.use(commonRoutes);
app.use(videoRoutes);

// Error handler middleware
// app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
