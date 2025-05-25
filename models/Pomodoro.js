const mongoose = require('mongoose');

const pomodoroSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    work_duration: {
        type: Number,
        required: true,
        default: 25 // in minutes
    },
    break_duration: {
        type: Number,
        required: true,
        default: 5 // in minutes
    },
    long_break_duration: {
        type: Number,
        required: true,
        default: 15 // in minutes
    },
    sessions_before_long_break: {
        type: Number,
        required: true,
        default: 4
    },
    completed_sessions: {
        type: Number,
        default: 0
    },
    is_active: {
        type: Boolean,
        default: false
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
pomodoroSchema.pre('save', function(next) {
    this.updated_at = new Date();
    next();
});

const Pomodoro = mongoose.model('Pomodoro', pomodoroSchema);

module.exports = Pomodoro; 