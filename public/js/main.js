// DOM Elements
const homeSection = document.getElementById('home-section');
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const tabBtns = document.querySelectorAll('.tab-btn');
const addCourseModal = document.getElementById('add-course-modal');
const addNoteModal = document.getElementById('add-note-modal');
const closeBtns = document.querySelectorAll('.close');
const addCourseForm = document.getElementById('add-course-form');
const addNoteForm = document.getElementById('add-note-form');
const courseList = document.querySelector('.course-list');
const notesList = document.querySelector('.notes-list');
const searchInput = document.querySelector('.search-bar input');
const getStartedBtn = document.getElementById('get-started-btn');
const navLinks = document.querySelectorAll('.nav-links li');
const dashboardContents = document.querySelectorAll('.dashboard-content');

// Global variables
let courses = [];
let notes = [];
let bookmarks = [];
let settings = {
    theme: 'dark',
    notifications: true,
    aiRecommendations: true,
    calendarIntegration: false
};

// Authentication state
let isAuthenticated = false;
let currentUser = null;

// Add this at the beginning of the file
let notificationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
let timerSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

// Timer Variables
let timerInterval;
let timeLeft;
let isRunning = false;
let isBreak = false;
let studyDuration = 25;
let breakDuration = 5;
let longBreakDuration = 15;
let sessionsBeforeLongBreak = 4;
let completedSessions = 0;

// Study Groups Functions
let currentGroupId = null;

// Navigation Functions
function showSection(sectionId) {
    // Hide all dashboard contents
    document.querySelectorAll('.dashboard-content').forEach(content => {
        content.classList.add('hidden');
        content.style.display = 'none';
    });

    // Show the selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.remove('hidden');
        selectedSection.style.display = 'block';
    }

    // Update active state in navigation
    document.querySelectorAll('.nav-links li').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });
}

// Initialize navigation
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-links li');
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const sectionId = link.getAttribute('data-section');
            if (sectionId) {
                showSection(sectionId);
                
                // Load section-specific data
                if (sectionId === 'courses-content') {
                    loadCourses();
                }
            }
        });
    });
}

// Course Management Functions
function initializeCourses() {
    const addCourseBtn = document.getElementById('add-course-btn');
    const addCourseModal = document.getElementById('add-course-modal');
    const addCourseForm = document.getElementById('add-course-form');
    const closeBtns = document.querySelectorAll('.close');

    // Ensure modal is hidden by default
    addCourseModal.classList.add('hidden');

    // Open modal
    addCourseBtn.addEventListener('click', () => {
        addCourseModal.classList.remove('hidden');
    });

    // Close modal
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            addCourseModal.classList.add('hidden');
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === addCourseModal) {
            addCourseModal.classList.add('hidden');
        }
    });

    // Handle form submission
    addCourseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const courseData = {
            title: document.getElementById('course-name').value,
            link: document.getElementById('course-link').value,
            platform: document.getElementById('course-platform').value,
            category: document.getElementById('course-category').value,
            difficulty: 'Beginner', // Default value
            priority: document.getElementById('course-priority').value,
            status: document.getElementById('course-status').value
        };

        try {
            const response = await fetch('/api/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(courseData)
            });

            if (response.ok) {
                const newCourse = await response.json();
                courses.push(newCourse);
                displayCourses();
                addCourseModal.classList.add('hidden');
                addCourseForm.reset();
                showNotification('Course added successfully!', 'success');
            } else {
                throw new Error('Failed to add course');
            }
        } catch (error) {
            console.error('Error adding course:', error);
            showNotification(error.message, 'error');
        }
    });
}

async function loadCourses() {
    try {
        const response = await fetch('/api/courses', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            courses = await response.json();
            displayCourses();
        } else {
            throw new Error('Failed to load courses');
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        showNotification(error.message, 'error');
    }
}

function displayCourses() {
    const coursesList = document.getElementById('courses-list');
    coursesList.innerHTML = '';

    courses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        courseCard.innerHTML = `
            <div class="course-header">
                <h3>${course.name}</h3>
                <div class="course-actions">
                    <button class="btn-edit" onclick="editCourse('${course._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteCourse('${course._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="course-body">
                <a href="${course.link}" target="_blank" class="course-link">
                    <i class="fas fa-external-link-alt"></i> Open Course
                </a>
                <div class="course-info">
                    <span class="badge platform">${course.platform}</span>
                    <span class="badge category">${course.category}</span>
                    <span class="badge status">${course.status}</span>
                    <span class="badge priority">${course.priority}</span>
                </div>
            </div>
        `;
        coursesList.appendChild(courseCard);
    });
}

async function editCourse(courseId) {
    const course = courses.find(c => c._id === courseId);
    if (!course) return;

    const addCourseModal = document.getElementById('add-course-modal');
    const addCourseForm = document.getElementById('add-course-form');

    // Populate form with course data
    document.getElementById('course-platform').value = course.platform;
    document.getElementById('course-link').value = course.link;
    document.getElementById('course-name').value = course.name;
    document.getElementById('course-category').value = course.category;
    document.getElementById('course-status').value = course.status;
    document.getElementById('course-priority').value = course.priority;

    // Show modal
    addCourseModal.classList.remove('hidden');

    // Update form submission handler for edit
    const originalSubmitHandler = addCourseForm.onsubmit;
    addCourseForm.onsubmit = async (e) => {
        e.preventDefault();
        
        const updatedCourse = {
            platform: document.getElementById('course-platform').value,
            link: document.getElementById('course-link').value,
            name: document.getElementById('course-name').value,
            category: document.getElementById('course-category').value,
            status: document.getElementById('course-status').value,
            priority: document.getElementById('course-priority').value
        };

        try {
            const response = await fetch(`/api/courses/${courseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(updatedCourse)
            });

            if (response.ok) {
                const updated = await response.json();
                const index = courses.findIndex(c => c._id === courseId);
                courses[index] = updated;
                displayCourses();
                addCourseModal.classList.add('hidden');
                addCourseForm.reset();
                showNotification('Course updated successfully!', 'success');
            } else {
                throw new Error('Failed to update course');
            }
        } catch (error) {
            console.error('Error updating course:', error);
            showNotification(error.message, 'error');
        }

        // Restore original submit handler
        addCourseForm.onsubmit = originalSubmitHandler;
    };
}

async function deleteCourse(courseId) {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
        const response = await fetch(`/api/courses/${courseId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            courses = courses.filter(c => c._id !== courseId);
            displayCourses();
            showNotification('Course deleted successfully!', 'success');
        } else {
            throw new Error('Failed to delete course');
        }
    } catch (error) {
        console.error('Error deleting course:', error);
        showNotification(error.message, 'error');
    }
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize navigation
    initializeNavigation();
    
    // Initialize courses
    initializeCourses();
    
    // Show dashboard content by default
    showSection('dashboard-content');

    // Get Started button click handler
    getStartedBtn.addEventListener('click', () => {
        homeSection.style.display = 'none';
        authSection.style.display = 'block';
        // Show login form by default
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    });

    // Back to home button click handler
    document.getElementById('back-to-home').addEventListener('click', () => {
        authSection.style.display = 'none';
        homeSection.style.display = 'block';
    });

    // Show login form
    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    });

    // Show register form
    document.getElementById('show-register').addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });

    // Login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Store token and user data
                localStorage.setItem('token', data.token);
                currentUser = {
                    id: data.id,
                    username: data.username,
                    email: data.email
                };
                isAuthenticated = true;

                // Update UI
                document.getElementById('display-username').textContent = data.username;
                
                // Hide auth section and show dashboard
                authSection.style.display = 'none';
                dashboardSection.classList.remove('hidden');
                dashboardSection.style.display = 'block';
                
                // Show the dashboard content by default
                document.getElementById('dashboard-content').classList.add('active');
                document.getElementById('dashboard-content').style.display = 'block';
                
                // Load user data
                loadCourses();
                showNotification('Welcome back! 👋', 'success');
            } else {
                throw new Error(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            showNotification(error.message, 'error');
        }
    });

    // Register form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Store token and user data
                localStorage.setItem('token', data.token);
                currentUser = {
                    id: data.id,
                    username: data.username,
                    email: data.email
                };
                isAuthenticated = true;

                // Update UI
                document.getElementById('display-username').textContent = data.username;
                
                // Hide auth section and show dashboard
                authSection.style.display = 'none';
                dashboardSection.classList.remove('hidden');
                dashboardSection.style.display = 'block';
                
                // Show the dashboard content by default
                document.getElementById('dashboard-content').classList.add('active');
                document.getElementById('dashboard-content').style.display = 'block';
                
                showNotification('Welcome to StudyBuddy! 🎉', 'success');
            } else {
                throw new Error(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showNotification(error.message, 'error');
        }
    });
});
