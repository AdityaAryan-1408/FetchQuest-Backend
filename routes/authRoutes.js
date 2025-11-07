const express = require('express');
const router = express.Router();
const { register, verifyEmail, login, forgotPassword, resetPassword } = require('../controllers/authController.js');

router.post('/register', register);
router.get('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;