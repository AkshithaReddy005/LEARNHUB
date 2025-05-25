const mongoose = require('mongoose');

const codingPlatformSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    platform_name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    profile_url: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

// Update the updated_at field before saving
codingPlatformSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

module.exports = mongoose.model('CodingPlatform', codingPlatformSchema); 