// Footer Navigation Functionality
class FooterNavigation {
    constructor() {
        this.init();
    }
    
    init() {
        this.bindFooterLinks();
        this.bindFeatureCards();
        this.setupModals();
    }
    
    bindFooterLinks() {
        // Bind feature links (tab navigation)
        document.querySelectorAll('.footer-link[data-tab]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = link.getAttribute('data-tab');
                this.navigateToTab(tabId);
            });
        });
        
        // Bind action links (modal navigation)
        document.querySelectorAll('.footer-link[data-action]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const action = link.getAttribute('data-action');
                this.handleAction(action);
            });
        });
        
        // Bind calculate age link
        document.querySelectorAll('.footer-link[data-action="calculate"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToCalculator();
            });
        });
    }
    
    bindFeatureCards() {
        document.querySelectorAll('.feature-card[data-tab]').forEach(card => {
            card.style.cursor = 'pointer';
            
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = card.getAttribute('data-tab');
                this.navigateToTab(tabId);
            });
        });
    }
    
    navigateToTab(tabId) {
        console.log(`Navigating to tab: ${tabId}`);
        
        // First check if we need to trigger age calculation
        const birthDate = document.getElementById('birthDate')?.value;
        const resultsSectionWrapper = document.getElementById('resultsSectionWrapper');
        const resultsSection = document.getElementById('resultsSection');
        
        // Check if results are hidden or don't exist
        const isResultsHidden = resultsSectionWrapper?.classList.contains('hidden') || 
                            resultsSection?.classList.contains('hidden') ||
                            !resultsSection;
        
        if (!birthDate || isResultsHidden) {
            // No birth date or results hidden - scroll to calculator
            this.scrollToCalculator();
            
            // Auto-fill with sample date and trigger calculation
            setTimeout(() => {
                this.autoCalculateForDemo(tabId);
            }, 800);
            
            return;
        }
        
        // Results exist - switch to the tab
        this.switchToTab(tabId);
    }

    // Add this new method
    autoCalculateForDemo(tabId) {
        console.log('Auto-calculating for demo...');
        
        const birthDateInput = document.getElementById('birthDate');
        const calculateBtn = document.getElementById('calculateBtn');
        
        if (!birthDateInput || !calculateBtn) return;
        
        // Set a sample date (20 years ago by default)
        const sampleDate = new Date();
        sampleDate.setFullYear(sampleDate.getFullYear() - 20);
        
        // Format as YYYY-MM-DD
        const formattedDate = sampleDate.toISOString().split('T')[0];
        
        // Set the date
        birthDateInput.value = formattedDate;
        
        // Show notification
        this.showNotification(`Sample date set to ${formattedDate}. Calculating...`, 'info');
        
        // Trigger calculation
        setTimeout(() => {
            calculateBtn.click();
            
            // After calculation, switch to the requested tab
            setTimeout(() => {
                if (window.tabEnhancer && window.tabEnhancer.currentData) {
                    this.switchToTab(tabId);
                }
            }, 1500);
        }, 1000);
    }
    
    switchToTab(tabId) {
        console.log(`Switching to tab: ${tabId}`);
        
        // First, make sure results section is visible
        const resultsSectionWrapper = document.getElementById('resultsSectionWrapper');
        const resultsSection = document.getElementById('resultsSection');
        
        if (resultsSectionWrapper && resultsSectionWrapper.classList.contains('hidden')) {
            resultsSectionWrapper.classList.remove('hidden');
        }
        
        if (resultsSection && resultsSection.classList.contains('hidden')) {
            resultsSection.classList.remove('hidden');
            
            // Add animation
            resultsSection.classList.add('results-slide-in');
        }
        
        // Scroll to results section
        setTimeout(() => {
            if (resultsSection) {
                resultsSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        }, 100);
        
        // Find the tab button
        const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        if (!tabBtn) {
            console.error(`Tab ${tabId} not found`);
            return;
        }
        
        // Remove active class from all tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Add active class to target tab
        tabBtn.classList.add('active');
        
        // Show corresponding content
        const tabContent = document.getElementById(`${tabId}-content`);
        if (tabContent) {
            tabContent.classList.add('active');
        }
        
        // Load tab content if using enhanced tabs
        if (window.tabEnhancer) {
            setTimeout(() => {
                window.tabEnhancer.loadTabContent(tabId);
            }, 300);
        }
        
        // Show success notification
        this.showNotification(`Showing ${this.getTabName(tabId)}`, 'success');
    }
        
    getTabName(tabId) {
        const tabNames = {
            'overview': 'Overview',
            'details': 'Details',
            'planets': 'Planetary Ages',
            'milestones': 'Milestones',
            'comparison': 'Comparison',
            'charts': 'Charts',
            'share': 'Share'
        };
        return tabNames[tabId] || tabId;
    }
    
    scrollToCalculator() {
        const calculatorSection = document.querySelector('.calculator-wrapper');
        if (calculatorSection) {
            calculatorSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center'
            });
            
            // Focus on birth date input
            setTimeout(() => {
                const birthDateInput = document.getElementById('birthDate');
                if (birthDateInput) {
                    birthDateInput.focus();
                }
            }, 300);
        }
    }
    
    handleAction(action) {
        switch(action) {
            case 'about':
                this.showAboutModal();
                break;
            case 'privacy':
                this.showPrivacyModal();
                break;
            case 'terms':
                this.showTermsModal();
                break;
        }
    }
    
    setupModals() {
        // Create modals if they don't exist
        this.createAboutModal();
        this.createPrivacyModal();
        this.createTermsModal();
        
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }
    
    createAboutModal() {
        if (document.getElementById('aboutModal')) return;
        
        const modal = document.createElement('div');
        modal.id = 'aboutModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <h2>About AgeMaster</h2>
                <div class="modal-body">
                    <p>AgeMaster is the ultimate age calculator that reveals your age in ways you never imagined.</p>
                    
                    <h3>🌟 Features</h3>
                    <ul>
                        <li><strong>Precise Age Calculation</strong>: Calculate your exact age down to the second</li>
                        <li><strong>Planetary Ages</strong>: Discover your age on other planets</li>
                        <li><strong>Life Milestones</strong>: See important life events and future milestones</li>
                        <li><strong>Visual Analytics</strong>: Beautiful charts and visualizations of your age data</li>
                        <li><strong>Share Insights</strong>: Share your age analysis with friends and family</li>
                    </ul>
                    
                    <h3>🎯 Our Mission</h3>
                    <p>To help people appreciate the passage of time and celebrate every moment of life through insightful age analysis.</p>
                    
                    <h3>📊 How It Works</h3>
                    <p>Simply enter your birth date, and AgeMaster will calculate your age in multiple formats, provide interesting facts, and create visual representations of your life journey.</p>
                    
                    <div class="modal-footer">
                        <p>Made with ❤️ for time enthusiasts everywhere.</p>
                        <p><small>Version 1.0.0</small></p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.bindModalClose(modal);
    }
    
    createPrivacyModal() {
        if (document.getElementById('privacyModal')) return;
        
        const modal = document.createElement('div');
        modal.id = 'privacyModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <h2>Privacy Policy</h2>
                <div class="modal-body">
                    <p><strong>Last Updated: December 2025</strong></p>
                    
                    <h3>🔒 Your Privacy Matters</h3>
                    <p>AgeMaster is committed to protecting your privacy. This Privacy Policy explains how we handle your information.</p>
                    
                    <h3>📝 Information We Collect</h3>
                    <p><strong>Age Calculation Data</strong>: When you calculate your age, we process your birth date and target date. This data is processed locally in your browser and is not stored on our servers.</p>
                    
                    <p><strong>Local Storage</strong>: We use your browser's local storage to save preferences like theme settings and share statistics. This data never leaves your device.</p>
                    
                    <p><strong>Analytics</strong>: We may collect anonymous usage statistics to improve the application.</p>
                    
                    <h3>🚫 What We Don't Collect</h3>
                    <ul>
                        <li>We do not collect personally identifiable information</li>
                        <li>We do not store your birth date on our servers</li>
                        <li>We do not share your data with third parties</li>
                        <li>We do not use cookies for tracking</li>
                    </ul>
                    
                    <h3>🛡️ Data Security</h3>
                    <p>All age calculations happen locally in your web browser. Your birth date never leaves your device unless you choose to share it.</p>
                    
                    <h3>👥 Children's Privacy</h3>
                    <p>AgeMaster is suitable for all ages. We encourage parents to guide their children in using age calculation tools responsibly.</p>
                    
                    <h3>📧 Contact Us</h3>
                    <p>If you have questions about this Privacy Policy, contact us at: <strong>privacy@agemaster.com</strong></p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.bindModalClose(modal);
    }
    
    createTermsModal() {
        if (document.getElementById('termsModal')) return;
        
        const modal = document.createElement('div');
        modal.id = 'termsModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <h2>Terms of Service</h2>
                <div class="modal-body">
                    <p><strong>Last Updated: December 2025</strong></p>
                    
                    <h3>📋 Agreement to Terms</h3>
                    <p>By using AgeMaster, you agree to these Terms of Service. If you disagree, please do not use our service.</p>
                    
                    <h3>⚖️ Age Calculation Disclaimer</h3>
                    <p>AgeMaster provides age calculations for entertainment and informational purposes only. The calculations are approximate and should not be used for legal, medical, or official purposes.</p>
                    
                    <p><strong>Accuracy Disclaimer</strong>: While we strive for accuracy, we cannot guarantee that all calculations are 100% precise. Planetary ages are based on average orbital periods.</p>
                    
                    <h3>✅ Acceptable Use</h3>
                    <p>You agree to use AgeMaster for lawful purposes only. You may not:</p>
                    <ul>
                        <li>Use the service to harass or deceive others</li>
                        <li>Attempt to reverse engineer or hack the application</li>
                        <li>Use automated systems to access the service excessively</li>
                        <li>Claim AgeMaster's calculations as your own without attribution</li>
                    </ul>
                    
                    <h3>📄 Intellectual Property</h3>
                    <p>All content, design, and code on AgeMaster are protected by copyright. You may not copy, modify, or distribute our content without permission.</p>
                    
                    <h3>⚠️ Limitation of Liability</h3>
                    <p>AgeMaster is provided "as is" without warranties. We are not liable for any damages resulting from the use of our service.</p>
                    
                    <h3>🌐 Third-Party Services</h3>
                    <p>AgeMaster may integrate with third-party services (social media platforms, etc.). Your use of these services is governed by their respective terms.</p>
                    
                    <h3>📝 Changes to Terms</h3>
                    <p>We may update these terms. Continued use after changes constitutes acceptance of the new terms.</p>
                    
                    <h3>🇰🇪 Governing Law</h3>
                    <p>These terms are governed by the laws of Kenya. Any disputes shall be resolved in Mombasa, Kenya.</p>
                    
                    <h3>📞 Contact</h3>
                    <p>For questions about these terms: <strong>legal@agemaster.com</strong></p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.bindModalClose(modal);
    }
    
    bindModalClose(modal) {
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
    }
    
    showAboutModal() {
        const modal = document.getElementById('aboutModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }
    
    showPrivacyModal() {
        const modal = document.getElementById('privacyModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }
    
    showTermsModal() {
        const modal = document.getElementById('termsModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }
    
    showNotification(message, type = 'info') {
        // Use existing notification system or create simple one
        if (window.showNotification) {
            window.showNotification(message, type);
        } else if (window.socialSharing && window.socialSharing.showNotification) {
            window.socialSharing.showNotification(message, type);
        } else {
            // Create simple notification
            const notification = document.createElement('div');
            notification.className = 'footer-notification';
            notification.innerHTML = `
                <div class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</div>
                <div class="notification-message">${message}</div>
            `;
            
            notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: ${type === 'success' ? '#10b981' : 
                           type === 'error' ? '#ef4444' : 
                           '#3b82f6'};
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 9999;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                animation: slideUp 0.3s ease;
                font-family: Inter, sans-serif;
                font-size: 0.9rem;
            `;
            
            // Add animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideUp {
                    from { transform: translateX(-50%) translateY(100%); opacity: 0; }
                    to { transform: translateX(-50%) translateY(0); opacity: 1; }
                }
                @keyframes slideDown {
                    from { transform: translateX(-50%) translateY(0); opacity: 1; }
                    to { transform: translateX(-50%) translateY(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
            
            document.body.appendChild(notification);
            
            // Auto-remove after 3 seconds
            setTimeout(() => {
                notification.style.animation = 'slideDown 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.footerNavigation = new FooterNavigation();
    console.log('Footer navigation initialized');
});

// Add CSS for footer links
const footerStyles = document.createElement('style');
footerStyles.textContent = `
    /* Footer link enhancements */
    .footer-links {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    
    .footer-links li {
        margin-bottom: 0.5rem;
    }
    
    .footer-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-secondary);
        text-decoration: none;
        padding: 0.4rem 0;
        transition: all 0.2s;
        border-radius: 4px;
    }
    
    .footer-link:hover {
        color: var(--primary-blue);
        background: rgba(67, 97, 238, 0.05);
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        transform: translateX(3px);
    }
    
    .footer-link i {
        width: 20px;
        text-align: center;
        font-size: 0.9rem;
    }
    
    .contact-link {
        color: var(--text-secondary);
    }
    
    .contact-link:hover {
        color: var(--primary-green);
    }
    
    .contact-text {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-secondary);
    }
    
    .social-links {
        display: flex;
        gap: 0.75rem;
        margin-top: 1rem;
    }
    
    .social-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        background: var(--background);
        border: 1px solid var(--border);
        border-radius: 50%;
        color: var(--text-secondary);
        transition: all 0.3s;
    }
    
    .social-link:hover {
        background: var(--primary-blue);
        color: white;
        border-color: var(--primary-blue);
        transform: translateY(-2px);
    }
    
    /* Feature Cards Styling */
    .feature-card {
        cursor: pointer;
        position: relative;
    }
    
    .feature-card:hover {
        border-color: var(--primary-blue);
        transform: translateY(-8px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
    }
    
    .feature-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: var(--gradient-primary);
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.3s ease;
    }
    
    .feature-card:hover::before {
        transform: scaleX(1);
    }
    
    .feature-action {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--primary-blue);
        font-weight: 600;
        font-size: 0.9rem;
        margin-top: 1rem;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s ease;
    }
    
    .feature-card:hover .feature-action {
        opacity: 1;
        transform: translateY(0);
    }
    
    .feature-card:hover .feature-action i {
        transform: translateX(5px);
        transition: transform 0.3s ease;
    }
    
    .feature-icon {
        transition: all 0.3s;
    }
    
    .feature-card:hover .feature-icon {
        transform: scale(1.1) rotate(5deg);
    }
    
    /* Feature card specific colors */
    .feature-card[data-tab="planets"] .feature-icon {
        background: linear-gradient(135deg, #4361ee, #7209b7) !important;
    }
    
    .feature-card[data-tab="overview"] .feature-icon {
        background: linear-gradient(135deg, #10b981, #059669) !important;
    }
    
    .feature-card[data-tab="milestones"] .feature-icon {
        background: linear-gradient(135deg, #f59e0b, #d97706) !important;
    }
    
    .feature-card[data-tab="share"] .feature-icon {
        background: linear-gradient(135deg, #8b5cf6, #7c3aed) !important;
    }
    
    /* Modal content styling */
    .modal-body {
        max-height: 60vh;
        overflow-y: auto;
        padding-right: 1rem;
    }
    
    .modal-body::-webkit-scrollbar {
        width: 6px;
    }
    
    .modal-body::-webkit-scrollbar-track {
        background: var(--background);
        border-radius: 3px;
    }
    
    .modal-body::-webkit-scrollbar-thumb {
        background: var(--border);
        border-radius: 3px;
    }
    
    .modal-body h3 {
        margin-top: 1.5rem;
        margin-bottom: 0.75rem;
        color: var(--text-primary);
        font-size: 1.1rem;
    }
    
    .modal-body ul {
        padding-left: 1.5rem;
        margin-bottom: 1rem;
    }
    
    .modal-body li {
        margin-bottom: 0.5rem;
        color: var(--text-secondary);
    }
    
    .modal-body strong {
        color: var(--text-primary);
    }
    
    .modal-footer {
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border);
        color: var(--text-secondary);
        font-size: 0.9rem;
    }
    
    /* Responsive footer */
    @media (max-width: 768px) {
        .footer-content {
            grid-template-columns: 1fr;
            gap: 2rem;
        }
        
        .footer-section {
            text-align: center;
        }
        
        .social-links {
            justify-content: center;
        }
        
        .footer-link {
            justify-content: center;
        }
        
        .features-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
        }
    }
    
    @media (max-width: 480px) {
        .features-grid {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(footerStyles);