// File: fetchquest-server/models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // Core Info
    name: {
        type: String,
        required: [true, 'Please provide a name.'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email.'],
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide a valid email.',
        ],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password.'],
    },
    // Profile Info
    profilePictureUrl: {
        type: String,
        default: '',
    },
    upiId: {
        type: String,
        default: '',
    },
    phone: {
        type: String, // Will store the encrypted phone number
        default: '',
    },

    // Reputation
    ratings: {
        type: [Number],
        default: [],
    },
    averageRating: {
        type: Number,
        default: 0,
    },
    numberOfRatings: {
        type: Number,
        default: 0,
    },
    // Stats
    requestsMade: {
        type: Number,
        default: 0,
    },
    runsCompleted: {
        type: Number,
        default: 0,
    },
    // Security
    isVerified: {
        type: Boolean,
        default: false,
    },

    passwordResetToken: {
        type: String,
    },
    passwordResetTokenExpirationDate: {
        type: Date,
    },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);