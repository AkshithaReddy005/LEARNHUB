const mongoose = require('mongoose');
const LearningPath = require('../models/LearningPath');
const MockInterview = require('../models/MockInterview');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/learning_hub', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Sample learning paths
const learningPaths = [
    {
        title: 'Web Development',
        description: 'Master web development from basics to advanced concepts',
        category: 'Web Development',
        roadmap: [
            {
                topic: 'HTML & CSS',
                description: 'Learn the fundamentals of web structure and styling',
                resources: [
                    { type: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
                    { type: 'freeCodeCamp', url: 'https://www.freecodecamp.org' }
                ],
                practiceSites: [
                    { name: 'CodePen', url: 'https://codepen.io' },
                    { name: 'Frontend Mentor', url: 'https://www.frontendmentor.io' }
                ],
                completed: false
            },
            {
                topic: 'JavaScript',
                description: 'Learn programming fundamentals and DOM manipulation',
                resources: [
                    { type: 'JavaScript.info', url: 'https://javascript.info' },
                    { type: 'Eloquent JavaScript', url: 'https://eloquentjavascript.net' }
                ],
                practiceSites: [
                    { name: 'CodeWars', url: 'https://www.codewars.com' },
                    { name: 'LeetCode', url: 'https://leetcode.com' }
                ],
                completed: false
            }
        ]
    },
    {
        title: 'Python Programming',
        description: 'Learn Python programming and its applications',
        category: 'Python',
        roadmap: [
            {
                topic: 'Python Basics',
                description: 'Learn Python syntax and basic programming concepts',
                resources: [
                    { type: 'Python Documentation', url: 'https://docs.python.org' },
                    { type: 'Real Python', url: 'https://realpython.com' }
                ],
                practiceSites: [
                    { name: 'HackerRank', url: 'https://www.hackerrank.com' },
                    { name: 'Exercism', url: 'https://exercism.org' }
                ],
                completed: false
            }
        ]
    }
];

// Sample mock interview questions
const mockInterviews = [
    {
        category: 'Web Development',
        questions: [
            {
                question: 'What is the difference between let, const, and var in JavaScript?',
                answer: 'let and const are block-scoped, while var is function-scoped. const variables cannot be reassigned, while let variables can be. var variables can be redeclared, while let and const cannot.',
                difficulty: 'Easy',
                tips: [
                    'Understand scope in JavaScript',
                    'Know about hoisting',
                    'Explain temporal dead zone'
                ]
            },
            {
                question: 'Explain the concept of closures in JavaScript',
                answer: 'A closure is a function that has access to its own scope, the outer function\'s variables, and global variables. It "closes over" the variables it references.',
                difficulty: 'Medium',
                tips: [
                    'Understand lexical scoping',
                    'Explain practical use cases',
                    'Discuss memory management'
                ]
            }
        ]
    },
    {
        category: 'Python',
        questions: [
            {
                question: 'What are Python decorators?',
                answer: 'Decorators are functions that modify the behavior of other functions. They take a function as input and return a modified version of that function.',
                difficulty: 'Medium',
                tips: [
                    'Understand function as first-class objects',
                    'Know about @ syntax',
                    'Explain common use cases'
                ]
            }
        ]
    }
];

// Initialize database
async function initializeDatabase() {
    try {
        // Clear existing data
        await LearningPath.deleteMany({});
        await MockInterview.deleteMany({});

        // Insert new data
        await LearningPath.insertMany(learningPaths);
        await MockInterview.insertMany(mockInterviews);

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        mongoose.connection.close();
    }
}

initializeDatabase(); 