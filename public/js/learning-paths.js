document.addEventListener('DOMContentLoaded', () => {
    const pathsGrid = document.querySelector('.learning-paths-grid');
    const modal = document.getElementById('pathModal');
    const closeBtn = document.querySelector('.close');
    const languageToggle = document.getElementById('languageToggle');

    // Language translations
    const translations = {
        en: {
            title: 'Learning Paths',
            roadmap: 'Roadmap',
            resources: 'Resources',
            practiceSites: 'Practice Sites',
            toggleLanguage: 'हिंदी'
        },
        hi: {
            title: 'सीखने के रास्ते',
            roadmap: 'रोडमैप',
            resources: 'संसाधन',
            practiceSites: 'अभ्यास साइट्स',
            toggleLanguage: 'English'
        }
    };

    let currentLanguage = 'en';

    // Load learning paths
    async function loadLearningPaths() {
        try {
            const response = await fetch('/api/learning-paths');
            const paths = await response.json();
            displayLearningPaths(paths);
        } catch (error) {
            console.error('Error loading learning paths:', error);
        }
    }

    // Display learning paths
    function displayLearningPaths(paths) {
        pathsGrid.innerHTML = paths.map(path => `
            <div class="learning-path-card" data-category="${path.category}">
                <h2>${path.title}</h2>
                <p>${path.description}</p>
                <div class="progress">
                    <div class="progress-bar" style="width: ${calculateProgress(path)}%"></div>
                </div>
            </div>
        `).join('');

        // Add click event listeners to cards
        document.querySelectorAll('.learning-path-card').forEach(card => {
            card.addEventListener('click', () => openPathModal(card.dataset.category));
        });
    }

    // Calculate progress
    function calculateProgress(path) {
        const completed = path.roadmap.filter(topic => topic.completed).length;
        return (completed / path.roadmap.length) * 100;
    }

    // Open path modal
    async function openPathModal(category) {
        try {
            const response = await fetch(`/api/learning-paths/${category}`);
            const path = await response.json();
            
            document.getElementById('pathTitle').textContent = path.title;
            
            // Display roadmap
            const roadmapList = document.getElementById('roadmapList');
            roadmapList.innerHTML = path.roadmap.map(topic => `
                <li>
                    <input type="checkbox" ${topic.completed ? 'checked' : ''} 
                           onchange="updateProgress('${category}', '${topic.topic}', this.checked)">
                    <span>${topic.topic}</span>
                </li>
            `).join('');

            // Display resources
            const resourcesList = document.getElementById('resourcesList');
            resourcesList.innerHTML = path.roadmap.flatMap(topic => 
                topic.resources.map(resource => `
                    <a href="${resource.url}" target="_blank">${resource.type}</a>
                `)
            ).join('');

            // Display practice sites
            const practiceSitesList = document.getElementById('practiceSitesList');
            practiceSitesList.innerHTML = path.roadmap.flatMap(topic => 
                topic.practiceSites.map(site => `
                    <a href="${site.url}" target="_blank">${site.name}</a>
                `)
            ).join('');

            modal.style.display = 'block';
        } catch (error) {
            console.error('Error opening path modal:', error);
        }
    }

    // Update progress
    async function updateProgress(category, topic, completed) {
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/learning-paths/${category}/progress`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ topic, completed })
            });
            loadLearningPaths(); // Refresh the paths
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    }

    // Close modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
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
        document.querySelector('.roadmap h3').textContent = trans.roadmap;
        document.querySelector('.resources h3').textContent = trans.resources;
        document.querySelector('.practice-sites h3').textContent = trans.practiceSites;
        languageToggle.textContent = trans.toggleLanguage;
    }

    // Initialize
    loadLearningPaths();
    updateLanguage();
}); 