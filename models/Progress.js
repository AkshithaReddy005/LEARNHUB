const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    path_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LearningPath',
        required: true
    },
    completed_steps: [Number],
    percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    last_updated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Progress', progressSchema); 