const express = require('express');
const router = express.Router();

const { getCurrentUser, updateUser, uploadProfilePicture, deleteUser, updatePhone } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.route('/me').get(authMiddleware, getCurrentUser);

router.route('/update').patch(authMiddleware, updateUser);

router.route('/upload').post(authMiddleware, uploadProfilePicture);

router.route('/delete').delete(authMiddleware, deleteUser);

router.route('/update-phone').patch(authMiddleware, updatePhone);

module.exports = router;