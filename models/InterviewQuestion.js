const mongoose = require('mongoose');

const interviewQuestionSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('InterviewQuestion', interviewQuestionSchema); 