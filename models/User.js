const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    enrolled_courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    notes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note'
    }],
    reminders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reminder'
    }],
    groups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    }],
    coding_platforms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CodingPlatform'
    }],
    progress: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Progress'
    }],
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Update the updated_at field before saving
userSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User; 