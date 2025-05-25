const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: String,
    link: String,
    type: {
        type: String,
        enum: ['video', 'article', 'practice']
    }
});

const learningPathSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    resources: [resourceSchema],
    steps: [String]
}, {
    timestamps: true
});

module.exports = mongoose.model('LearningPath', learningPathSchema); 