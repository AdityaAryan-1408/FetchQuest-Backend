const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
    // Core Info
    requesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    itemsList: {
        type: String,
        required: [true, 'Please provide a list of items.'],
        trim: true,
    },
    deliveryLocation: {
        type: String,
        required: [true, 'Please provide a delivery location.'],
        trim: true,
    },
    estimatedCost: {
        type: Number,
        required: [true, 'Please provide an estimated cost.'],
    },
    tip: {
        type: Number,
        required: [true, 'Please provide a tip amount.'],
    },
    // Lifecycle
    status: {
        type: String,
        enum: ['open', 'accepted', 'completed', 'rated'],
        default: 'open',
    },
    // Runner Info
    runnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
}, { timestamps: true });

module.exports = mongoose.model('Request', RequestSchema);