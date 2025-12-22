// Help Modal Functionality
function setupHelpModal() {
    const helpBtn = document.getElementById('helpBtn');
    const helpModal = document.getElementById('helpModal');
    const modalClose = helpModal?.querySelector('.modal-close');
    
    if (!helpBtn || !helpModal) return;
    
    // Open modal when help button is clicked
    helpBtn.addEventListener('click', function(e) {
        e.preventDefault();
        helpModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        
        // Add click animation
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
    });
    
    // Close modal when X is clicked
    if (modalClose) {
        modalClose.addEventListener('click', function() {
            helpModal.style.display = 'none';
            document.body.style.overflow = '';
        });
    }
    
    // Close modal when clicking outside
    helpModal.addEventListener('click', function(e) {
        if (e.target === this) {
            helpModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
    
    // Setup help tabs
    setupHelpTabs();
    
    // Logo click functionality
    const logoBtn = document.getElementById('logoBtn');
    if (logoBtn) {
        logoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            helpModal.style.display = 'block';
            
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    }
}

function setupHelpTabs() {
    const tabBtns = document.querySelectorAll('.help-tab-btn');
    const tabContents = document.querySelectorAll('.help-tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-help-tab');
            
            // Remove active class from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding content
            const content = document.getElementById(`${tabId}-content`);
            if (content) {
                content.classList.add('active');
            }
            
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setupHelpModal();
    console.log('Help modal initialized');
});

// Keyboard shortcut for help (F1 or Ctrl+?)
document.addEventListener('keydown', function(e) {
    if (e.key === 'F1' || (e.ctrlKey && e.key === '?')) {
        e.preventDefault();
        const helpModal = document.getElementById('helpModal');
        if (helpModal) {
            helpModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Close modal with Escape key
    if (e.key === 'Escape') {
        const helpModal = document.getElementById('helpModal');
        if (helpModal && helpModal.style.display === 'block') {
            helpModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
});

function fixHelpModalTextColors() {
    const helpModal = document.getElementById('helpModal');
    if (!helpModal) return;
    
    // Check if light mode is active
    const isLightMode = document.body.classList.contains('light-mode') || 
                       document.documentElement.classList.contains('light-theme') ||
                       document.body.style.backgroundColor === 'white' ||
                       window.getComputedStyle(document.body).backgroundColor === 'rgb(255, 255, 255)';
    
    if (isLightMode) {
        // Force dark text colors
        const textElements = helpModal.querySelectorAll(
            'h2, h3, h4, p, span, li, .step-content, .feature-category, .tip-content, .faq-item'
        );
        
        textElements.forEach(el => {
            // Skip elements that already have explicit colors
            if (!el.style.color || el.style.color.includes('var(')) {
                // Set appropriate colors based on element type
                if (el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'H4') {
                    el.style.color = '#000000';
                } else if (el.classList.contains('help-footer')) {
                    el.style.color = '#666666';
                } else {
                    el.style.color = '#333333';
                }
            }
        });
        
        // Also force tab button colors
        const tabBtns = helpModal.querySelectorAll('.help-tab-btn');
        tabBtns.forEach(btn => {
            if (!btn.style.color) {
                btn.style.color = '#666666';
            }
        });
        
        const activeTab = helpModal.querySelector('.help-tab-btn.active');
        if (activeTab && !activeTab.style.color) {
            activeTab.style.color = '#4361ee';
        }
    }
}

// Call this when opening the modal
function setupHelpModal() {
    const helpBtn = document.getElementById('helpBtn');
    const helpModal = document.getElementById('helpModal');
    
    if (!helpBtn || !helpModal) return;
    
    helpBtn.addEventListener('click', function(e) {
        e.preventDefault();
        helpModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Fix text colors after showing modal
        setTimeout(fixHelpModalTextColors, 10);
    });
    
    // ... rest of your modal setup code
}

// Also fix when theme changes
document.addEventListener('DOMContentLoaded', function() {
    // Monitor theme changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class' || mutation.attributeName === 'style') {
                const helpModal = document.getElementById('helpModal');
                if (helpModal && helpModal.style.display === 'block') {
                    setTimeout(fixHelpModalTextColors, 10);
                }
            }
        });
    });
    
    observer.observe(document.body, { attributes: true });
    observer.observe(document.documentElement, { attributes: true });
});

// Fix for light mode text visibility - IMPROVED VERSION
function fixLightModeText() {
    const helpModal = document.getElementById('helpModal');
    if (!helpModal || helpModal.style.display !== 'block') return;
    
    // Check if we're in light mode MORE ACCURATELY
    const body = document.body;
    const html = document.documentElement;
    
    // Better detection of light mode
    const isLightMode = 
        body.classList.contains('light-mode') ||
        body.classList.contains('light-theme') ||
        html.classList.contains('light-mode') ||
        html.classList.contains('light-theme') ||
        html.getAttribute('data-theme') === 'light' ||
        (!body.classList.contains('dark-mode') && 
         !body.classList.contains('dark-theme') &&
         !html.classList.contains('dark-mode') &&
         !html.classList.contains('dark-theme') &&
         html.getAttribute('data-theme') !== 'dark');
    
    console.log('Is light mode?', isLightMode); // Debug
    
    if (isLightMode) {
        console.log('Applying light mode fix to help modal');
        // Force all text to be dark IN LIGHT MODE ONLY
        const allTextElements = helpModal.querySelectorAll('*');
        allTextElements.forEach(el => {
            if (el.tagName !== 'I' && el.tagName !== 'IMG' && el.tagName !== 'SVG' && el.tagName !== 'PATH') {
                const currentColor = window.getComputedStyle(el).color;
                // Only change white/very light text
                if (currentColor === 'rgb(255, 255, 255)' || 
                    currentColor === 'rgba(255, 255, 255, 1)' ||
                    currentColor.includes('255, 255, 255') ||
                    currentColor === 'rgb(245, 245, 245)' ||
                    currentColor === 'rgb(250, 250, 250)') {
                    
                    if (el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'H4') {
                        el.style.color = '#000000';
                    } else if (el.classList.contains('help-footer')) {
                        el.style.color = '#666666';
                    } else if (el.classList.contains('help-tab-btn') && !el.classList.contains('active')) {
                        el.style.color = '#666666';
                    } else if (el.classList.contains('help-tab-btn') && el.classList.contains('active')) {
                        el.style.color = '#4361ee';
                    } else {
                        el.style.color = '#333333';
                    }
                }
            }
        });
    } else {
        // In dark mode, REMOVE any inline styles we added
        console.log('Dark mode - removing inline styles');
        const allTextElements = helpModal.querySelectorAll('*');
        allTextElements.forEach(el => {
            if (el.style.color && 
                (el.style.color === '#000000' || 
                 el.style.color === '#333333' || 
                 el.style.color === '#666666' ||
                 el.style.color === '#4361ee')) {
                el.style.color = ''; // Remove inline style
            }
        });
    }
}

// Also fix for dark mode when switching from light mode
function fixDarkModeText() {
    const helpModal = document.getElementById('helpModal');
    if (!helpModal || helpModal.style.display !== 'block') return;
    
    // Check if we're in dark mode
    const isDarkMode = 
        document.body.classList.contains('dark-mode') ||
        document.documentElement.classList.contains('dark-mode') ||
        document.documentElement.classList.contains('dark-theme') ||
        document.documentElement.getAttribute('data-theme') === 'dark';
    
    if (isDarkMode) {
        console.log('Dark mode - ensuring text is light');
        // Remove any light mode fixes
        const allTextElements = helpModal.querySelectorAll('*');
        allTextElements.forEach(el => {
            // Remove inline color styles that we might have added
            if (el.style.color && 
                (el.style.color === '#000000' || 
                 el.style.color === '#333333' || 
                 el.style.color === '#666666')) {
                el.style.color = ''; // Remove inline style
            }
        });
    }
}

// Better theme detection and fixing
function fixModalTextForCurrentTheme() {
    const helpModal = document.getElementById('helpModal');
    if (!helpModal || helpModal.style.display !== 'block') return;
    
    const body = document.body;
    const html = document.documentElement;
    
    // Determine current theme
    const isDarkMode = 
        body.classList.contains('dark-mode') ||
        body.classList.contains('dark-theme') ||
        html.classList.contains('dark-mode') ||
        html.classList.contains('dark-theme') ||
        html.getAttribute('data-theme') === 'dark' ||
        window.getComputedStyle(body).backgroundColor === 'rgb(18, 18, 18)' ||
        window.getComputedStyle(body).backgroundColor === 'rgb(0, 0, 0)';
    
    if (isDarkMode) {
        console.log('Current theme: Dark - removing light mode fixes');
        // Remove any light-mode color overrides
        const styledElements = helpModal.querySelectorAll('[style*="color"]');
        styledElements.forEach(el => {
            if (el.style.color.includes('#000') || 
                el.style.color.includes('#333') || 
                el.style.color.includes('#666')) {
                el.style.color = '';
            }
        });
    } else {
        console.log('Current theme: Light - applying text visibility fix');
        // Apply light mode fix
        fixLightModeText();
    }
}

// Run this when modal opens
document.addEventListener('DOMContentLoaded', function() {
    const helpBtn = document.getElementById('helpBtn');
    if (helpBtn) {
        helpBtn.addEventListener('click', function() {
            setTimeout(fixModalTextForCurrentTheme, 100);
        });
    }
    
    // Also run when theme changes
    const themeToggle = document.querySelector('.theme-toggle, [data-theme-toggle]');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            setTimeout(fixModalTextForCurrentTheme, 300);
        });
    }
    
    // Fix if modal is already open on page load
    setTimeout(() => {
        const helpModal = document.getElementById('helpModal');
        if (helpModal && helpModal.style.display === 'block') {
            fixModalTextForCurrentTheme();
        }
    }, 500);
});