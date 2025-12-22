// AgeMaster Initialization Script
document.addEventListener('DOMContentLoaded', function() {
    console.log('AgeMaster Initializing...');
    
    // Initialize everything
    setupDateInputs();
    setupCalculateButton();
    setupQuickDateButtons();
    setupThemeToggle();
    setupTabs();
    setupModals();
    setupFeatureNavigation();
    
    // Check for URL parameters
    checkUrlParameters();
    
    console.log('AgeMaster Initialized!');
});

// Setup date inputs
function setupDateInputs() {
    const today = new Date().toISOString().split('T')[0];
    const birthDateInput = document.getElementById('birthDate');
    const targetDateInput = document.getElementById('targetDate');
    
    if (birthDateInput) {
        birthDateInput.max = today;
        // Set default to 20 years ago
        const defaultDate = new Date();
        defaultDate.setFullYear(defaultDate.getFullYear() - 20);
        birthDateInput.value = defaultDate.toISOString().split('T')[0];
    }
    
    if (targetDateInput) {
        targetDateInput.max = today;
        targetDateInput.value = today;
    }
}

// Setup calculate button
function setupCalculateButton() {
    const calculateBtn = document.getElementById('calculateBtn');
    if (!calculateBtn) return;
    
    calculateBtn.addEventListener('click', async function() {
        console.log('Calculate button clicked!');
        
        const birthDate = document.getElementById('birthDate')?.value;
        const targetDate = document.getElementById('targetDate')?.value;
        
        if (!birthDate) {
            showNotification('Please select your birth date!', 'error');
            return;
        }
        
        // Show loading state
        const originalText = calculateBtn.innerHTML;
        calculateBtn.innerHTML = '<span class="loading"></span> Calculating...';
        calculateBtn.disabled = true;
        
        try {
            // Make API call
            const response = await fetch('/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    birth_date: birthDate,
                    target_date: targetDate
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Display results
                displayResults(data);
                showResultsSection();
                showNotification('Age calculated successfully! 🎉', 'success');
            } else {
                showNotification(data.error || 'Calculation failed', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Network error. Please try again.', 'error');
        } finally {
            // Reset button
            calculateBtn.innerHTML = originalText;
            calculateBtn.disabled = false;
        }
    });
}

// Setup quick date buttons
function setupQuickDateButtons() {
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const years = parseInt(this.dataset.years);
            const date = new Date();
            date.setFullYear(date.getFullYear() - years);
            
            const birthDateInput = document.getElementById('birthDate');
            if (birthDateInput) {
                birthDateInput.value = date.toISOString().split('T')[0];
                
                // Auto-calculate
                document.getElementById('calculateBtn')?.click();
            }
        });
    });
}

// Setup theme toggle
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement; // Change from body to html
    
    if (!themeToggle) return;
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme); // Set on html
    updateThemeIcon(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme'); // Get from html
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-theme', newTheme); // Set on html
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
    
    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        themeToggle.querySelector('span').textContent = 
            theme === 'light' ? 'Dark Mode' : 'Light Mode';
    }
}

// Setup tabs
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show corresponding content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId + '-content') {
                    content.classList.add('active');
                }
            });
        });
    });
}

// Setup modals
function setupModals() {
    // Help button
    document.getElementById('helpBtn')?.addEventListener('click', function() {
        const modal = document.getElementById('helpModal');
        if (modal) modal.style.display = 'block';
    });
    
    // Close modals
    document.querySelectorAll('.modal-close, .modal').forEach(element => {
        element.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal')) {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.style.display = 'none';
                });
            }
        });
    });
}
// Add this to your init.js (around line 150, after setupTabs())
function setupFeatureNavigation() {
    // Check if we should auto-calculate from URL
    const urlParams = new URLSearchParams(window.location.search);
    const autoTab = urlParams.get('tab');
    
    if (autoTab && document.getElementById('resultsSection')?.classList.contains('hidden')) {
        // We have a tab parameter but no results - auto-calculate
        setTimeout(() => {
            autoCalculateForTab(autoTab);
        }, 1000);
    }
}

// Helper function
function autoCalculateForTab(tabId) {
    const birthDateInput = document.getElementById('birthDate');
    const calculateBtn = document.getElementById('calculateBtn');
    
    if (!birthDateInput || !calculateBtn) return;
    
    // Set default age (20 years ago)
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() - 20);
    birthDateInput.value = defaultDate.toISOString().split('T')[0];
    
    // Calculate
    setTimeout(() => {
        calculateBtn.click();
        
        // Switch to tab after calculation
        setTimeout(() => {
            if (window.footerNavigation) {
                window.footerNavigation.switchToTab(tabId);
            }
        }, 1500);
    }, 500);
}


// Check URL parameters
function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const birthdate = urlParams.get('birthdate');
    
    if (birthdate) {
        const birthDateInput = document.getElementById('birthDate');
        if (birthDateInput) {
            birthDateInput.value = birthdate;
            // Auto-calculate after a short delay
            setTimeout(() => {
                document.getElementById('calculateBtn')?.click();
            }, 500);
        }
    }
}

// Display results function
function displayResults(data) {
    console.log('Displaying results:', data);
    
    // Update main age display
    setElementText('mainAge', data.age_data.years);
    setElementText('exactAge', data.age_data.exact_years.toFixed(7));
    
    // Update detailed age cards
    setElementText('ageMonths', data.age_data.months);
    setElementText('ageDays', data.age_data.days);
    setElementText('ageWeeks', data.age_data.total_weeks);
    setElementText('ageHours', formatNumber(data.age_data.total_hours));
    setElementText('ageMinutes', formatNumber(data.age_data.total_minutes));
    setElementText('ageSeconds', formatNumber(data.age_data.total_seconds));
    
    // Update zodiac info
    setElementText('zodiacSign', data.zodiac_sign);
    setElementText('chineseZodiac', data.chinese_zodiac);
    setElementText('nextBirthday', data.next_birthday);
    setElementText('weekdayBorn', data.weekday_born);
    
    // Update dates
    setElementText('birthDateDisplay', data.birth_date_formatted);
    setElementText('targetDateDisplay', data.target_date_formatted);
    
    // Update planetary ages
    updatePlanetaryAges(data.planetary_ages);
    
    // Update life calendar
    updateLifeCalendar(data.life_calendar);
    

    // Update quote and fun fact with age context
    updateResultsQuote(data.age_data);
    updateFunFact();
    
    
    // Update fun fact
    setElementText('funFactText', data.fun_fact.fact);
    setElementText('funFactIcon', data.fun_fact.icon);
    
    // Update time perception
    setElementText('timeFactor', data.time_perception.toFixed(1) + 'x');
}


// Helper function to set element text
function setElementText(id, text) {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
}

// Update planetary ages
function updatePlanetaryAges(planetaryAges) {
    const container = document.getElementById('planetsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    const planetInfo = {
        mercury: { name: 'Mercury', emoji: '☿' },
        venus: { name: 'Venus', emoji: '♀' },
        mars: { name: 'Mars', emoji: '♂' },
        jupiter: { name: 'Jupiter', emoji: '♃' },
        saturn: { name: 'Saturn', emoji: '♄' }
    };
    
    Object.entries(planetaryAges).forEach(([planet, age]) => {
        const info = planetInfo[planet] || { name: planet.charAt(0).toUpperCase() + planet.slice(1), emoji: '🪐' };
        
        const div = document.createElement('div');
        div.className = 'planet-card';
        div.innerHTML = `
            <div class="planet-icon">${info.emoji}</div>
            <h3>${info.name}</h3>
            <div class="age-value">${age}</div>
            <div class="age-label">Years</div>
        `;
        container.appendChild(div);
    });
}

// Update life calendar
function updateLifeCalendar(lifeCalendar) {
    setElementText('weeksLived', lifeCalendar.weeks_lived.toLocaleString());
    setElementText('weeksRemaining', lifeCalendar.weeks_remaining.toLocaleString());
    setElementText('percentageLived', lifeCalendar.percentage_lived);
    
    // Update progress bar
    const progressBar = document.getElementById('lifeProgress');
    if (progressBar) {
        progressBar.style.width = lifeCalendar.percentage_lived + '%';
    }
}

// Show results section
function showResultsSection() {
    const resultsSection = document.getElementById('resultsSection');
    if (!resultsSection) return;
    
    // Show the section
    resultsSection.classList.remove('hidden');
    
    // Add animation
    resultsSection.classList.add('results-slide-in');
    
    // Scroll to results
    setTimeout(() => {
        resultsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start'
        });
    }, 300);
}

// Format large numbers with commas
function formatNumber(num) {
    return num.toLocaleString();
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        animation: slideIn 0.3s ease;
    `;
    
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Add CSS for animations
(function addNotificationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 2px solid rgba(255,255,255,.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .results-slide-in {
            animation: slideInUp 0.5s ease forwards;
        }
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
})();


// ======================
// GLOBAL QUOTE FUNCTIONS
// ======================

async function updateResultsQuote() {
    try {
        // Show loading state
        const quoteText = document.getElementById('quoteText');
        const quoteAuthor = document.getElementById('quoteAuthor');
        
        if (quoteText) {
            quoteText.classList.add('fade');
            setTimeout(() => {
                quoteText.textContent = 'Loading inspiring quote...';
                quoteText.classList.remove('fade');
            }, 200);
        }
        if (quoteAuthor) quoteAuthor.textContent = '';
        
        // Get a fresh quote from the manager
        if (window.quoteManager) {
            const quote = await window.quoteManager.getResultsQuote();
            
            // Add fade animation
            if (quoteText) quoteText.classList.add('fade');
            
            setTimeout(() => {
                setElementText('quoteText', `"${quote.text}"`);
                setElementText('quoteAuthor', `- ${quote.author}`);
                
                if (quoteText) {
                    setTimeout(() => {
                        quoteText.classList.remove('fade');
                    }, 50);
                }
            }, 400);
        } else {
            // Fallback if manager isn't available
            setElementText('quoteText', '"The years teach much which the days never know."');
            setElementText('quoteAuthor', '- Ralph Waldo Emerson');
        }
    } catch (error) {
        console.error('Error updating results quote:', error);
        setElementText('quoteText', '"Age is an issue of mind over matter. If you don\'t mind, it doesn\'t matter."');
        setElementText('quoteAuthor', '- Mark Twain');
    }
}

async function refreshResultsQuote() {
    const btn = document.getElementById('refreshQuoteBtn');
    if (!btn) return;
    
    const originalHtml = btn.innerHTML;
    
    try {
        // Show loading state
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        btn.disabled = true;
        
        await updateResultsQuote();
        
        // Show success message
        btn.innerHTML = '<i class="fas fa-check"></i> Updated!';
        setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.disabled = false;
        }, 1500);
    } catch (error) {
        console.error('Error refreshing quote:', error);
        btn.innerHTML = '<i class="fas fa-exclamation"></i> Error';
        setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.disabled = false;
        }, 2000);
    }
}


// ======================
// SIMPLE QUOTE SYSTEM (USING YOUR BACKEND)
// ======================

// Update hero quote from your backend
async function updateHeroQuote() {
    try {
        const response = await fetch('/api/quotes/random');
        const quote = await response.json();
        
        const quoteElement = document.getElementById('ageQuote');
        const authorElement = document.getElementById('quoteAuthor');
        
        if (quoteElement && authorElement) {
            quoteElement.textContent = `"${quote.text}"`;
            authorElement.textContent = `- ${quote.author}`;
        }
    } catch (error) {
        console.error('Error fetching hero quote:', error);
        // Fallback to default quote
        const quoteElement = document.getElementById('ageQuote');
        const authorElement = document.getElementById('quoteAuthor');
        if (quoteElement && authorElement) {
            quoteElement.textContent = '"The years teach much which the days never know."';
            authorElement.textContent = '- Ralph Waldo Emerson';
        }
    }
}

// Update results quote from your backend
// Update results quote - try AI first
async function updateResultsQuote(ageData = null) {
    try {
        let quote;
        
        // Try AI endpoint if we have age data
        if (ageData) {
            try {
                const response = await fetch('/api/quotes/ai', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ age_data: ageData })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    quote = result.quote;
                    console.log('Using AI-generated quote');
                } else {
                    throw new Error(result.error);
                }
            } catch (aiError) {
                console.log('AI quote failed, using regular:', aiError);
                // Fallback to regular quote
                const response = await fetch('/api/quotes/random');
                quote = await response.json();
            }
        } else {
            // No age data, use regular quote
            const response = await fetch('/api/quotes/random');
            quote = await response.json();
        }
        
        // Display the quote
        setElementText('quoteText', `"${quote.text}"`);
        setElementText('quoteAuthor', `- ${quote.author}`);
        
        // Add AI badge if from AI
        if (quote.source === 'ai') {
            const authorElement = document.getElementById('quoteAuthor');
            if (authorElement) {
                authorElement.innerHTML = `- ${quote.author} <span class="ai-badge">🤖 AI</span>`;
            }
        }
        
    } catch (error) {
        console.error('Error fetching quote:', error);
        // Fallback to default
        setElementText('quoteText', '"The years teach much which the days never know."');
        setElementText('quoteAuthor', '- Ralph Waldo Emerson');
    }
}

// Refresh results quote (for button click)
async function refreshResultsQuote() {
    const btn = document.getElementById('refreshQuoteBtn');
    if (!btn) return;
    
    const originalHtml = btn.innerHTML;
    
    try {
        // Show loading state
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        btn.disabled = true;
        
        await updateResultsQuote();
        
        // Show success briefly
        btn.innerHTML = '<i class="fas fa-check"></i> Updated!';
        setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.disabled = false;
        }, 1500);
    } catch (error) {
        console.error('Error refreshing quote:', error);
        btn.innerHTML = '<i class="fas fa-exclamation"></i> Error';
        setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.disabled = false;
        }, 2000);
    }
}

// Update fun fact from your backend
async function updateFunFact() {
    try {
        const response = await fetch('/api/facts/random');
        const fact = await response.json();
        
        setElementText('funFactText', fact.fact);
        setElementText('funFactIcon', fact.icon || '💡');
    } catch (error) {
        console.error('Error fetching fun fact:', error);
        // Fallback
        setElementText('funFactText', 'Did you know? Your heart beats about 100,000 times per day!');
        setElementText('funFactIcon', '❤️');
    }
}

// Initialize quotes on page load
document.addEventListener('DOMContentLoaded', function() {
    // Update hero quote
    updateHeroQuote();
    
    // Set up auto-refresh for hero quote every 30 seconds
    setInterval(updateHeroQuote, 30000);
    
    // Set up refresh button listener
    const refreshBtn = document.getElementById('refreshQuoteBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshResultsQuote);
    }
    
    // If results are already visible, update them too
    const resultsSection = document.getElementById('resultsSectionWrapper');
    if (resultsSection && !resultsSection.classList.contains('hidden')) {
        updateResultsQuote();
        updateFunFact();
    }
});

// Make functions available globally
window.updateResultsQuote = updateResultsQuote;
window.updateHeroQuote = updateHeroQuote;
window.refreshResultsQuote = refreshResultsQuote;
window.updateFunFact = updateFunFact;

// JavaScript formatting
function formatOverviewNumbers(ageData) {
    const formats = {
        months: (n) => n.toLocaleString(),
        days: (n) => n >= 10000 ? (n/1000).toFixed(1) + 'K' : n.toLocaleString(),
        weeks: (n) => n >= 10000 ? (n/1000).toFixed(1) + 'K' : n.toLocaleString(),
        hours: (n) => n >= 1000000 ? (n/1000000).toFixed(1) + 'M' : 
                     n >= 1000 ? (n/1000).toFixed(1) + 'K' : n.toLocaleString(),
        minutes: (n) => n >= 1000000 ? (n/1000000).toFixed(1) + 'M' : 
                       n >= 1000 ? (n/1000).toFixed(1) + 'K' : n.toLocaleString(),
        seconds: (n) => n >= 1000000000 ? (n/1000000000).toFixed(2) + 'B' : 
                       n >= 1000000 ? (n/1000000).toFixed(1) + 'M' : 
                       n >= 1000 ? (n/1000).toFixed(1) + 'K' : n.toLocaleString()
    };
    
    document.getElementById('ageMonths').textContent = formats.months(ageData.months);
    document.getElementById('ageDays').textContent = formats.days(ageData.days);
    document.getElementById('ageWeeks').textContent = formats.weeks(ageData.weeks);
    document.getElementById('ageHours').textContent = formats.hours(ageData.total_hours);
    document.getElementById('ageMinutes').textContent = formats.minutes(ageData.total_minutes);
    document.getElementById('ageSeconds').textContent = formats.seconds(ageData.total_seconds);
}