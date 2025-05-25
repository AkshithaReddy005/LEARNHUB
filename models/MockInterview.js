const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
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
    },
    tips: [String]
});

const mockInterviewSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['Web Development', 'Python', 'Data Science', 'Machine Learning', 'Mobile Development']
    },
    questions: [questionSchema]
});

module.exports = mongoose.model('MockInterview', mockInterviewSchema); 