const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendMail');
const crypto = require('crypto');

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body
        if (!name || !email || !password) {
            return res.status(400).json({ msg: 'Please provide all values' })
        }

        const userAlreadyExist = await User.findOne({ email });
        if (userAlreadyExist) {
            return res.status(400).json({ msg: 'Email already in use' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        const verificationToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_LIFETIME }
        )

        const origin = process.env.CLIENT_URL;

        const verificationLink = `${origin}/verify-email?token=${verificationToken}`;

        const message = `<p>Please confirm your email by clicking on the following link: <a href="${verificationLink}">Verify Email</a></p>`;

        await sendEmail({
            to: user.email,
            subject: 'FetchQuest Email Confirmation',
            html: `<h4>Hello, ${user.name}</h4>
            ${message}
            `,
        });
        res.status(201).json({
            msg: 'Success! Please check your email to verify your account.',
            user: { name: user.name, email: user.email },
            verificationToken: verificationToken
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });

    }
};

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ msg: 'Verification Token is required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({ _id: decoded.userId });

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });

        }

        user.isVerified = true;
        await user.save();

        res.status(200).json({ msg: 'Email verified successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Invalid or expired verification token' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Basic validation
        if (!email || !password) {
            return res.status(400).json({ msg: 'Please provide email and password' });
        }

        // 2. Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ msg: 'Invalid credentials' });
        }

        // 3. Compare passwords
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ msg: 'Invalid credentials' });
        }

        // 4. Check if user is verified
        if (!user.isVerified) {
            return res.status(401).json({ msg: 'Please verify your email first' });
        }

        // 5. Create session token
        const token = jwt.sign(
            { userId: user._id, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_LIFETIME }
        );

        res.status(200).json({
            user: { name: user.name, email: user.email },
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
};


const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ msg: 'Please provide a valid email' });
        }

        const user = await User.findOne({ email });

        if (user) {
            const passwordToken = crypto.randomBytes(70).toString('hex');

            const tenMinutes = 1000 * 60 * 10;
            user.passwordResetTokenExpirationDate = new Date(Date.now() + tenMinutes);

            const hashedToken = crypto.createHash('sha256').update(passwordToken).digest('hex');
            user.passwordResetToken = hashedToken;
            await user.save();

            const origin = process.env.CLIENT_URL;
            const resetURL = `${origin}/reset-password?token=${passwordToken}&email=${user.email}`;
            const message = `<p>Please reset your password by clicking on the following link: <a href="${resetURL}">Reset Password</a></p>`;

            await sendEmail({
                to: user.email,
                subject: 'FetchQuest Password Reset',
                html: `<h4>Hello, ${user.name}</h4>${message}`,
            });
        }
        res.status(200).json({ msg: 'If an account with that email exists, a password reset link has been sent.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, email, password } = req.body;
        if (!token || !email || !password) {
            return res.status(400).json({ msg: 'Please provide all values' });
        }

        const user = await User.findOne({ email });

        if (user) {
            const currentDate = new Date();


            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

            if (user.passwordResetToken === hashedToken && user.passwordResetTokenExpirationDate > currentDate) {

                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);


                user.passwordResetToken = null;
                user.passwordResetTokenExpirationDate = null;

                await user.save();
                return res.status(200).json({ msg: 'Success! Password has been reset.' });
            }
        }
        return res.status(400).json({ msg: 'Invalid or expired reset token.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
};
module.exports = { register, verifyEmail, login, forgotPassword, resetPassword, };
