
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
    {
        questId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Request',
            required: true,
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
    },
    { timestamps: true } 
);

module.exports = mongoose.model('Message', MessageSchema);