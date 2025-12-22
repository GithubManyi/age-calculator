// Features Navigation - FIXED VERSION
class FeaturesNavigation {
    constructor() {
        this.currentAge = null;
        this.init();
    }
    
    init() {
        this.bindFeatureCards();
        this.setupAgeListener();
    }
    
    setupAgeListener() {
        // Listen for age calculation
        const calculateBtn = document.getElementById('calculateBtn');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => {
                // Get the current age from the main display
                const mainAge = document.getElementById('mainAge');
                if (mainAge && mainAge.textContent !== '0') {
                    this.currentAge = parseInt(mainAge.textContent);
                    console.log('Current age updated:', this.currentAge);
                }
            });
        }
        
        // Also check if age is already calculated on page load
        this.updateCurrentAge();
    }
    
    updateCurrentAge() {
        const mainAge = document.getElementById('mainAge');
        if (mainAge && mainAge.textContent !== '0') {
            this.currentAge = parseInt(mainAge.textContent);
        }
    }
    
    bindFeatureCards() {
        const featureCards = document.querySelectorAll('.feature-card[data-tab]');
        
        featureCards.forEach(card => {
            // Add cursor pointer
            card.style.cursor = 'pointer';
            
            // Add click event
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = card.getAttribute('data-tab');
                this.navigateToFeature(tabId);
            });
            
            // Add keyboard support
            card.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const tabId = card.getAttribute('data-tab');
                    this.navigateToFeature(tabId);
                }
            });
            
            // Make it keyboard focusable
            card.setAttribute('tabindex', '0');
            
            // Add hover effect via JS
            card.addEventListener('mouseenter', () => {
                card.classList.add('feature-hover');
            });
            
            card.addEventListener('mouseleave', () => {
                card.classList.remove('feature-hover');
            });
        });
    }
    
    navigateToFeature(tabId) {
        console.log(`Navigating to feature: ${tabId}, Current age: ${this.currentAge}`);
        
        // First check if we need to calculate age
        const birthDate = document.getElementById('birthDate')?.value;
        const resultsSection = document.getElementById('resultsSectionWrapper');
        
        if (!birthDate || (resultsSection && resultsSection.classList.contains('hidden'))) {
            // No calculation yet, scroll to calculator
            this.scrollToCalculator();
            
            // Show message
            this.showFeatureMessage(`Calculate your age first to explore ${this.getFeatureName(tabId)}`);
            return;
        }
        
        // Make sure tabs enhancer has current data
        if (window.tabEnhancer && !window.tabEnhancer.currentData) {
            // Try to trigger calculation with current data
            this.triggerCalculationWithCurrentAge();
        }
        
        // Navigate to the tab
        this.switchToTab(tabId);
    }
    
    triggerCalculationWithCurrentAge() {
        const birthDateInput = document.getElementById('birthDate');
        const targetDateInput = document.getElementById('targetDate');
        
        if (!birthDateInput.value) return;
        
        // Create a mock calculation to populate data
        const birthDate = new Date(birthDateInput.value);
        const targetDate = targetDateInput.value ? new Date(targetDateInput.value) : new Date();
        
        // Calculate age
        const ageInMilliseconds = targetDate - birthDate;
        const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
        
        // Store current age
        this.currentAge = Math.floor(ageInYears);
        
        // If tabs enhancer exists but has no data, manually create some
        if (window.tabEnhancer) {
            // Create minimal data structure
            window.tabEnhancer.currentData = {
                age_data: {
                    years: ageInYears,
                    months: Math.floor(ageInYears * 12),
                    days: Math.floor(ageInMilliseconds / (1000 * 60 * 60 * 24)),
                    weeks: Math.floor(ageInMilliseconds / (1000 * 60 * 60 * 24 * 7)),
                    total_hours: Math.floor(ageInMilliseconds / (1000 * 60 * 60)),
                    total_minutes: Math.floor(ageInMilliseconds / (1000 * 60)),
                    total_seconds: Math.floor(ageInMilliseconds / 1000)
                },
                planetary_ages: this.generatePlanetaryAges(ageInYears),
                time_perception: this.calculateTimePerception(ageInYears)
            };
        }
    }
    
    generatePlanetaryAges(earthAge) {
        // Planetary orbital periods in Earth years
        const orbitalPeriods = {
            mercury: 0.2408467,
            venus: 0.61519726,
            earth: 1,
            mars: 1.8808158,
            jupiter: 11.862615,
            saturn: 29.447498,
            uranus: 84.016846,
            neptune: 164.79132
        };
        
        const planetaryAges = {};
        Object.keys(orbitalPeriods).forEach(planet => {
            planetaryAges[planet] = earthAge / orbitalPeriods[planet];
        });
        
        return planetaryAges;
    }
    
    calculateTimePerception(age) {
        // Simple time perception calculation
        if (age < 10) return 0.3;
        if (age < 20) return 0.6;
        if (age < 30) return 0.8;
        if (age < 40) return 1.0;
        if (age < 50) return 1.2;
        if (age < 60) return 1.5;
        return 1.8;
    }
    
    scrollToCalculator() {
        const calculator = document.querySelector('.calculator-card');
        if (calculator) {
            calculator.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Highlight the calculator
            calculator.classList.add('calculator-highlight');
            setTimeout(() => {
                calculator.classList.remove('calculator-highlight');
            }, 2000);
        }
    }
    
    switchToTab(tabId) {
        // Update current age before switching
        this.updateCurrentAge();
        
        // Show results section if hidden
        const resultsWrapper = document.getElementById('resultsSectionWrapper');
        if (resultsWrapper && resultsWrapper.classList.contains('hidden')) {
            resultsWrapper.classList.remove('hidden');
            
            // Scroll to results after a short delay
            setTimeout(() => {
                resultsWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
        
        // Switch to the tab
        const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        if (tabBtn) {
            // Use the existing tab enhancement system
            if (window.tabEnhancer) {
                window.tabEnhancer.loadTabContent(tabId);
                
                // Update active tab styling
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                tabBtn.classList.add('active');
                
                // Update tab content visibility
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(`${tabId}-content`)?.classList.add('active');
            }
            
            // Scroll to results
            const results = document.querySelector('.results-section');
            if (results) {
                setTimeout(() => {
                    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 300);
            }
        } else {
            console.error(`Tab button not found for: ${tabId}`);
        }
    }
    
    getFeatureName(tabId) {
        const names = {
            'planets': 'Planetary Ages',
            'overview': 'Detailed Analytics', 
            'milestones': 'Life Milestones',
            'share': 'Sharing Features',
            'details': 'Age Details',
            'comparison': 'Age Comparison',
            'charts': 'Visual Charts'
        };
        return names[tabId] || tabId;
    }
    
    showFeatureMessage(message) {
        // Remove any existing message
        const existingMessage = document.querySelector('.feature-message');
        if (existingMessage) existingMessage.remove();
        
        // Show a temporary message
        const messageEl = document.createElement('div');
        messageEl.className = 'feature-message';
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--primary-blue);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 9999;
            animation: slideUp 0.3s ease;
            font-family: 'Inter', sans-serif;
            font-weight: 500;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        `;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => messageEl.remove(), 300);
        }, 3000);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.featuresNavigation = new FeaturesNavigation();
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes slideDown {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
    }
    
    .calculator-highlight {
        animation: pulseHighlight 2s ease;
    }
    
    @keyframes pulseHighlight {
        0%, 100% {
            box-shadow: 0 0 0 0 rgba(67, 97, 238, 0.4);
        }
        50% {
            box-shadow: 0 0 0 20px rgba(67, 97, 238, 0);
        }
    }
    
    .feature-hover {
        transform: translateY(-5px) !important;
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15) !important;
    }
`;
document.head.appendChild(style);