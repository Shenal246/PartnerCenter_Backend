// server.js
const express = require('express');
const bodyParser = require('body-parser');
// const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/authRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const productRoutes = require('./routes/productRoutes.js');
const partnerRoutes = require('./routes/becomePartnerRoutes.js');
const commonRoutes = require('./routes/commonRoutes.js');
const videoRoutes = require('./routes/videoRoutes.js');
const staffRoutes = require('./routes/staffRoutes.js');
const vendorRoutes = require('./routes/vendorRoutes.js');
const dealregistrationRoutes = require('./routes/dealRegistrationRoutes.js');
const promotionRoutes = require('./routes/promotionRoutes.js');

// const sessionConfig = require('./config/sessionConfig');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cookieParser());

// Logging middleware
app.use(morgan('tiny'));

// Use CORS middleware
app.use(cors({
  origin: ['http://192.168.13.218:3001', 'http://192.168.13.218:3002'], // Allow only requests from this origin
  credentials: true // Allow cookies to be sent with requests
}));

// Increase the payload size limit for JSON and URL-encoded data
app.use(bodyParser.json({ limit: '50mb' })); // Set the limit as needed
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // Set the limit as needed

// Session configuration
// app.use(sessionConfig);

// Routes
app.use(authRoutes);
app.use('/api/user', userRoutes);
app.use(productRoutes);
app.use(partnerRoutes);
app.use(commonRoutes);
app.use(videoRoutes);
app.use(staffRoutes);
app.use(vendorRoutes);
app.use(dealregistrationRoutes);
app.use(promotionRoutes);

// Error handler middleware
// app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
