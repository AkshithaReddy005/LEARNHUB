document.addEventListener('DOMContentLoaded', () => {
    const categoryButtons = document.querySelector('.category-buttons');
    const difficultyButtons = document.querySelectorAll('.difficulty-buttons button');
    const questionsContainer = document.querySelector('.questions-container');
    const languageToggle = document.getElementById('languageToggle');

    // Language translations
    const translations = {
        en: {
            title: 'Mock Interviews',
            categories: 'Interview Categories',
            filter: 'Filter by Difficulty',
            all: 'All',
            easy: 'Easy',
            medium: 'Medium',
            hard: 'Hard',
            toggleLanguage: 'हिंदी'
        },
        hi: {
            title: 'मॉक इंटरव्यू',
            categories: 'इंटरव्यू श्रेणियाँ',
            filter: 'कठिनाई के अनुसार फ़िल्टर करें',
            all: 'सभी',
            easy: 'आसान',
            medium: 'मध्यम',
            hard: 'कठिन',
            toggleLanguage: 'English'
        }
    };

    let currentLanguage = 'en';
    let currentCategory = null;
    let currentDifficulty = 'all';

    // Load categories
    async function loadCategories() {
        try {
            const response = await fetch('/api/mock-interviews/categories');
            const categories = await response.json();
            displayCategories(categories);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    // Display categories
    function displayCategories(categories) {
        categoryButtons.innerHTML = categories.map(category => `
            <button class="${category === currentCategory ? 'active' : ''}" 
                    data-category="${category}">
                ${category}
            </button>
        `).join('');

        // Add click event listeners
        document.querySelectorAll('.category-buttons button').forEach(button => {
            button.addEventListener('click', () => {
                currentCategory = button.dataset.category;
                document.querySelectorAll('.category-buttons button').forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
                loadQuestions();
            });
        });
    }

    // Load questions
    async function loadQuestions() {
        if (!currentCategory) return;

        try {
            const endpoint = currentDifficulty === 'all' 
                ? `/api/mock-interviews/${currentCategory}`
                : `/api/mock-interviews/${currentCategory}/${currentDifficulty}`;

            const response = await fetch(endpoint);
            const questions = await response.json();
            displayQuestions(questions);
        } catch (error) {
            console.error('Error loading questions:', error);
        }
    }

    // Display questions
    function displayQuestions(questions) {
        questionsContainer.innerHTML = questions.map(question => `
            <div class="question-card">
                <h3>${question.question}</h3>
                <span class="difficulty ${question.difficulty.toLowerCase()}">
                    ${question.difficulty}
                </span>
                <div class="answer">
                    <p>${question.answer}</p>
                </div>
                ${question.tips ? `
                    <div class="tips">
                        <h4>Tips</h4>
                        <ul>
                            ${question.tips.map(tip => `<li>${tip}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    // Difficulty filter
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            difficultyButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentDifficulty = button.dataset.difficulty;
            loadQuestions();
        });
    });

    // Language toggle
    languageToggle.addEventListener('click', () => {
        currentLanguage = currentLanguage === 'en' ? 'hi' : 'en';
        updateLanguage();
    });

    // Update language
    function updateLanguage() {
        const trans = translations[currentLanguage];
        document.querySelector('h1').textContent = trans.title;
        document.querySelector('.categories h2').textContent = trans.categories;
        document.querySelector('.difficulty-filter h3').textContent = trans.filter;
        document.querySelector('[data-difficulty="all"]').textContent = trans.all;
        document.querySelector('[data-difficulty="easy"]').textContent = trans.easy;
        document.querySelector('[data-difficulty="medium"]').textContent = trans.medium;
        document.querySelector('[data-difficulty="hard"]').textContent = trans.hard;
        languageToggle.textContent = trans.toggleLanguage;
    }

    // Initialize
    loadCategories();
    updateLanguage();
}); 