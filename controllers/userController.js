const User = require('../models/User');
const Request = require('../models/Request');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const bcrypt = require('bcryptjs');

const { encrypt, decrypt } = require('../utils/crypto');

const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const userObject = user.toObject(); 
        if (userObject.phone) {
            try {
                userObject.phone = decrypt(userObject.phone);
            } catch (e) {
                console.error('Failed to decrypt phone for user:', user._id);
                userObject.phone = ''; 
            }
        }

        res.status(200).json({ user: userObject });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
};

const updateUser = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ msg: 'Name field cannot be empty' });
        }

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { name: name },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

    
        const userObject = user.toObject();
        if (userObject.phone) {
            userObject.phone = decrypt(userObject.phone);
        }

        res.status(200).json({ user: userObject, msg: 'Profile updated successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
};


const updatePhone = async (req, res) => {
    try {
        const { phone } = req.body;

        // Basic validation
        if (phone === null || typeof phone === 'undefined') {
            return res.status(400).json({ msg: 'Phone number field cannot be empty.' });
        }

        // Encrypt the phone number
        const encryptedPhone = encrypt(phone);

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { phone: encryptedPhone },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Decrypt the phone number before sending it back
        const userObject = user.toObject();
        if (userObject.phone) {
            userObject.phone = decrypt(userObject.phone);
        }

        res.status(200).json({
            msg: 'Phone number updated successfully!',
            user: userObject,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
};


const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.files || !req.files.image) {
            return res.status(400).json({ msg: 'No image file uploaded.' });
        }

        const profileImage = req.files.image;

        if (!profileImage.mimetype.startsWith('image')) {
            return res.status(400).json({ msg: 'Please upload an image file.' });
        }

        const result = await cloudinary.uploader.upload(profileImage.tempFilePath, {
            folder: 'fetchquest_profiles',
            public_id: `${req.user.userId}_profile`,
            overwrite: true,
            transformation: [{ width: 200, height: 200, crop: 'fill' }],
        });

        fs.unlinkSync(profileImage.tempFilePath);

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { profilePictureUrl: result.secure_url },
            { new: true }
        ).select('-password');

        // Decrypt phone number for consistent user object
        const userObject = user.toObject();
        if (userObject.phone) {
            userObject.phone = decrypt(userObject.phone);
        }

        res.status(200).json({
            msg: 'Profile picture updated successfully!',
            user: userObject,
        });

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ msg: 'Server Error during image upload.' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ msg: 'Password is required for confirmation.' });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ msg: 'Invalid credentials. Deletion failed.' });
        }

        await Request.deleteMany({ requesterId: req.user.userId });

        if (user.profilePictureUrl) {
            const publicId = `${req.user.userId}_profile`;
            await cloudinary.uploader.destroy(`fetchquest_profiles/${publicId}`);
        }

        await User.findByIdAndDelete(req.user.userId);

        res.status(200).json({ msg: 'Your account has been successfully deleted.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
};


module.exports = {
    getCurrentUser,
    updateUser,
    uploadProfilePicture,
    deleteUser,
    updatePhone,
};