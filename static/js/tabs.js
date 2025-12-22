// Tab Switching Functionality
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Add click event to each tab button
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Remove active class from all buttons
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Hide all tab contents
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            
            // Show the selected tab content
            const selectedTab = document.getElementById(`${tabId}-content`);
            if (selectedTab) {
                selectedTab.classList.add('active');
                
                // Trigger any tab-specific initialization
                handleTabSwitch(tabId);
            }
        });
    });
}

// Handle tab-specific functionality
function handleTabSwitch(tabId) {
    switch(tabId) {
        case 'charts':
            // Initialize charts if needed
            if (typeof initCharts === 'function') initCharts();
            break;
        case 'planets':
            // Initialize planet visualization if needed
            if (typeof initPlanets === 'function') initPlanets();
            break;
        case 'share':
            // Initialize share functionality
            if (typeof initShare === 'function') initShare();
            break;
        // Add other cases as needed
    }
}

// Initialize tabs when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initTabs();
    
    // If results are shown on page load (for testing), show first tab
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection && !resultsSection.classList.contains('hidden')) {
        const overviewTab = document.querySelector('.tab-btn[data-tab="overview"]');
        if (overviewTab) {
            overviewTab.click();
        }
    }
});

// Make functions available globally
window.initTabs = initTabs;
window.handleTabSwitch = handleTabSwitch;