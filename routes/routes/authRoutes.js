const express = require('express');
const router = express.Router();

const UserLogin = require('../../controllers/controllers/UserLogin');
// const { isAuthenticated } = require('../middlewares/authMiddleware');
const authMiddlewaree = require('../../middlewares/authMiddleware');



//Staff Login route
router.post('/login', UserLogin.login);

//Staff logout route
router.post('/logout', authMiddlewaree.verifyTokenforFunctions, UserLogin.logout);
router.get('/user/:id', authMiddlewaree.verifyTokenforFunctions, UserLogin.getUserinfo);
router.put('/user/change-password', authMiddlewaree.verifyTokenforFunctions, UserLogin.changePassword);





//Verifytoken
router.get('/verifytoken', authMiddlewaree.verifyToken);

module.exports = router;
