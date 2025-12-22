// Theme Switcher with proper results section handling
function initThemeSwitcher() {
    const themeToggle = document.querySelector('.theme-toggle');
    const themeToggleBtn = document.getElementById('themeToggle');
    
    if (!themeToggle && !themeToggleBtn) return;
    
    const toggleElement = themeToggle || themeToggleBtn;
    
    // Check saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update toggle button state
    updateThemeToggle(savedTheme);
    
    // Add click event
    toggleElement.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Update theme
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update toggle button
        updateThemeToggle(newTheme);
        
        // Force update results section (important!)
        updateResultsSectionTheme(newTheme);
    });
}

function updateThemeToggle(theme) {
    const icon = document.querySelector('.theme-toggle i') || document.querySelector('#themeToggle i');
    const text = document.querySelector('.theme-toggle span') || document.querySelector('#themeToggle span');
    
    if (icon) {
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
    if (text) {
        text.textContent = theme === 'light' ? 'Dark Mode' : 'Light Mode';
    }
}

function updateResultsSectionTheme(theme) {
    const resultsSection = document.querySelector('.results-section');
    if (!resultsSection) return;
    
    // Force a reflow to ensure CSS variables update
    resultsSection.style.display = 'none';
    setTimeout(() => {
        resultsSection.style.display = '';
        
        // Update specific elements that might not update automatically
        const ageCards = document.querySelectorAll('.age-card');
        ageCards.forEach(card => {
            card.style.backgroundColor = ''; // Reset to inherit from CSS variable
            card.style.borderColor = ''; // Reset to inherit from CSS variable
        });
        
        const ageValues = document.querySelectorAll('.age-value');
        ageValues.forEach(value => {
            value.style.color = ''; // Reset to inherit from CSS variable
        });
    }, 10);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initThemeSwitcher();
    
    // Also check if results are already visible and apply theme
    const resultsSection = document.querySelector('.results-section');
    if (resultsSection) {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        updateResultsSectionTheme(currentTheme);
    }
    
    // Listen for when results section becomes visible
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const resultsWrapper = document.getElementById('resultsSectionWrapper');
                if (resultsWrapper && !resultsWrapper.classList.contains('hidden')) {
                    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
                    updateResultsSectionTheme(currentTheme);
                }
            }
        });
    });
    
    const resultsWrapper = document.getElementById('resultsSectionWrapper');
    if (resultsWrapper) {
        observer.observe(resultsWrapper, { attributes: true });
    }
});