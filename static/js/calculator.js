// ============================
// ENHANCED SECURITY & VALIDATION
// ============================

// 1. Input Sanitization Function
function sanitizeDateInput(input) {
    if (!input || typeof input !== 'string') return '';
    
    // Remove any HTML tags to prevent XSS
    let sanitized = input.replace(/[<>]/g, '');
    
    // Remove any non-date characters except digits, slashes, and hyphens
    sanitized = sanitized.replace(/[^\d\/\-]/g, '');
    
    // Limit length to prevent buffer overflow
    if (sanitized.length > 20) {
        sanitized = sanitized.substring(0, 20);
    }
    
    return sanitized.trim();
}

// 2. Date Parsing Function (supports multiple formats)
function parseDate(dateString) {
    if (!dateString) return null;
    
    const sanitized = sanitizeDateInput(dateString);
    
    // Try ISO format first (YYYY-MM-DD from date inputs)
    if (/^\d{4}-\d{2}-\d{2}$/.test(sanitized)) {
        const date = new Date(sanitized);
        if (!isNaN(date.getTime())) return date;
    }
    
    // Try DD/MM/YYYY format
    const match = sanitized.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
    if (match) {
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1;
        const year = parseInt(match[3], 10);
        
        // Validate ranges
        if (year < 1000 || year > 9999) return null;
        if (month < 0 || month > 11) return null;
        if (day < 1 || day > 31) return null;
        
        const date = new Date(year, month, day);
        
        // Validate actual date (e.g., not 31/02/2000)
        if (date.getFullYear() === year && 
            date.getMonth() === month && 
            date.getDate() === day) {
            return date;
        }
    }
    
    return null;
}

// 3. Enhanced Input Validation
function validateInputs(birthDate, targetDate) {
    // Check if dates are valid
    if (!(birthDate instanceof Date) || isNaN(birthDate.getTime())) {
        throw new Error('Invalid birth date format');
    }
    
    if (!(targetDate instanceof Date) || isNaN(targetDate.getTime())) {
        throw new Error('Invalid target date format');
    }
    
    // Prevent dates too far in future/past
    const maxPastDate = new Date(1900, 0, 1);
    const maxFutureDate = new Date(2100, 11, 31, 23, 59, 59);
    
    if (birthDate < maxPastDate) {
        throw new Error('Birth date cannot be before 1900');
    }
    if (targetDate > maxFutureDate) {
        throw new Error('Target date cannot be after 2100');
    }
    
    // Check if birth date is in the future - THIS IS THE SPECIFIC CHECK YOU WANT
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Compare only dates, not times
    
    const birthDateOnly = new Date(birthDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    
    if (birthDateOnly > today) {
        throw new Error('Birth date cannot be in the future!');
    }
    
    // Check if birth date is after target date
    const targetDateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    
    if (birthDateOnly > targetDateOnly) {
        throw new Error('Birth date cannot be after target date!');
    }
    
    // Prevent unrealistic ages
    const maxAge = 150;
    const ageInYears = (targetDate - birthDate) / (1000 * 60 * 60 * 24 * 365.25);
    
    if (ageInYears > maxAge) {
        throw new Error(`Age cannot exceed ${maxAge} years`);
    }
    
    // Additional validation for impossible dates
    const birthYear = birthDate.getFullYear();
    const birthMonth = birthDate.getMonth();
    const birthDay = birthDate.getDate();
    
    const reconstructedBirthDate = new Date(birthYear, birthMonth, birthDay);
    if (reconstructedBirthDate.getDate() !== birthDay || 
        reconstructedBirthDate.getMonth() !== birthMonth || 
        reconstructedBirthDate.getFullYear() !== birthYear) {
        throw new Error('Invalid birth date (e.g., 31/02/2000 is not valid)');
    }
    
    return true;
}

// 4. Safe Calculation Function (prevents arithmetic overflow)
function safeAgeCalculation(birthDate, targetDate) {
    const ageInMilliseconds = targetDate - birthDate;
    
    // Validate the calculation isn't insane
    if (ageInMilliseconds < 0) {
        throw new Error('Birth date cannot be after target date');
    }
    
    // Prevent extremely large values
    const maxMillis = 1000 * 60 * 60 * 24 * 365.25 * 200; // 200 years in milliseconds
    if (ageInMilliseconds > maxMillis) {
        throw new Error('Age calculation produced unrealistic result');
    }
    
    const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
    const ageInMonths = ageInYears * 12;
    const ageInDays = ageInMilliseconds / (1000 * 60 * 60 * 24);
    const ageInWeeks = ageInDays / 7;
    const ageInHours = ageInDays * 24;
    const ageInMinutes = ageInHours * 60;
    const ageInSeconds = ageInMinutes * 60;
    
    return {
        ageInYears,
        ageInMonths,
        ageInDays,
        ageInWeeks,
        ageInHours,
        ageInMinutes,
        ageInSeconds
    };
}

// 5. Safe Display Update (prevents XSS)
function safeUpdateDisplay(results) {
    const elements = {
        'mainAge': Math.floor(results.ageInYears),
        'exactAge': results.ageInYears.toFixed(7),
        'ageMonths': Math.floor(results.ageInMonths),
        'ageDays': Math.floor(results.ageInDays),
        'ageWeeks': Math.floor(results.ageInWeeks),
        'ageHours': Math.floor(results.ageInHours).toLocaleString(),
        'ageMinutes': Math.floor(results.ageInMinutes).toLocaleString(),
        'ageSeconds': Math.floor(results.ageInSeconds).toLocaleString()
    };
    
    // Use textContent to prevent XSS
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

// ============================
// MAIN CALCULATOR FUNCTIONALITY
// ============================

// When calculate button is clicked
document.getElementById('calculateBtn').addEventListener('click', function() {
    // Add loading state
    const originalText = this.innerHTML;
    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
    this.disabled = true;
    
    // Use setTimeout to prevent blocking and add slight delay for security
    setTimeout(() => {
        try {
            // 1. GET INPUT VALUES
            const birthDateInput = document.getElementById('birthDate');
            const targetDateInput = document.getElementById('targetDate');
            
            // 2. SANITIZE INPUTS
            const birthDateStr = sanitizeDateInput(birthDateInput.value);
            const targetDateStr = sanitizeDateInput(targetDateInput.value);
            
            // 3. BASIC VALIDATION - Check if birth date is empty
            if (!birthDateStr) {
                alert('Please enter your birth date');
                resetButton(this, originalText);
                return;
            }
            
            // 4. PARSE DATES
            const birthDate = parseDate(birthDateStr);
            if (!birthDate) {
                alert('Please enter a valid birth date (format: YYYY-MM-DD or DD/MM/YYYY)');
                resetButton(this, originalText);
                return;
            }
            
            const targetDate = targetDateStr ? parseDate(targetDateStr) : new Date();
            if (targetDateStr && !targetDate) {
                alert('Please enter a valid target date (format: YYYY-MM-DD or DD/MM/YYYY)');
                resetButton(this, originalText);
                return;
            }
            
            // 5. QUICK CHECK: Is birth date in the future?
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const birthDateOnly = new Date(birthDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
            
            if (birthDateOnly > today) {
                alert('Birth date cannot be in the future!');
                resetButton(this, originalText);
                return;
            }
            
            // 6. QUICK CHECK: Is birth date after target date?
            const targetDateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
            if (birthDateOnly > targetDateOnly) {
                alert('Birth date cannot be after target date!');
                resetButton(this, originalText);
                return;
            }
            
            // 7. ADVANCED VALIDATION (more specific checks)
            try {
                validateInputs(birthDate, targetDate);
            } catch (error) {
                // Show the SPECIFIC error message from validateInputs
                alert(error.message);
                resetButton(this, originalText);
                return;
            }
            
            // 8. SAFE CALCULATION
            const ageResults = safeAgeCalculation(birthDate, targetDate);
            
            // 9. SAFE DISPLAY UPDATE
            safeUpdateDisplay(ageResults);

            // 9.5. SAVE CALCULATION DATA FOR ANALYTICS
            if (typeof window.dataManager !== 'undefined' && typeof window.dataManager.saveCalculation === 'function') {
                window.dataManager.saveCalculation({
                    birthDate: birthDateInput.value,
                    targetDate: targetDateInput.value || 'today',
                    age: ageResults.ageInYears,
                    ageData: {
                        years: Math.floor(ageResults.ageInYears),
                        months: Math.floor(ageResults.ageInMonths),
                        days: Math.floor(ageResults.ageInDays),
                        hours: Math.floor(ageResults.ageInHours),
                        minutes: Math.floor(ageResults.ageInMinutes),
                        seconds: Math.floor(ageResults.ageInSeconds)
                    },
                    timestamp: new Date().toISOString()
                });
            }
                        
            // 10. SHOW RESULTS SECTION
            document.getElementById('resultsSectionWrapper').classList.remove('hidden');
            
            // 11. INITIALIZE TABS
            if (typeof initTabs === 'function') {
                initTabs();
                
                // Show overview tab by default
                const overviewTab = document.querySelector('.tab-btn[data-tab="overview"]');
                if (overviewTab) {
                    overviewTab.click();
                }
            }
            
            // 12. SCROLL TO RESULTS WITH HEADER OFFSET
            const header = document.querySelector('.header');
            const results = document.getElementById('resultsSectionWrapper');
            
            if (header && results) {
                const headerHeight = header.offsetHeight;
                
                setTimeout(() => {
                    const resultsTop = results.getBoundingClientRect().top + window.pageYOffset;
                    window.scrollTo({
                        top: resultsTop - headerHeight - 20,
                        behavior: 'smooth'
                    });
                }, 100);
            }
            
        } catch (error) {
            // Catch any unexpected errors
            console.error('Unexpected calculation error:', error);
            alert('An unexpected error occurred. Please try again.');
            
        } finally {
            resetButton(this, originalText);
        }
    }, 100);
});

// Helper function to reset button
function resetButton(button, originalText) {
    button.innerHTML = originalText;
    button.disabled = false;
}

// ============================
// QUICK DATES FUNCTIONALITY
// ============================

document.querySelectorAll('.quick-btn').forEach(button => {
    button.addEventListener('click', function() {
        const yearsAgo = parseInt(this.getAttribute('data-years'));
        
        // Validate the data attribute
        if (isNaN(yearsAgo) || yearsAgo < 1 || yearsAgo > 150) {
            alert('Invalid quick date selection');
            return;
        }
        
        const today = new Date();
        const pastDate = new Date(
            today.getFullYear() - yearsAgo,
            today.getMonth(),
            today.getDate()
        );
        
        // Validate the generated date
        if (isNaN(pastDate.getTime())) {
            alert('Error generating date');
            return;
        }
        
        // Format date as YYYY-MM-DD for date input
        const year = pastDate.getFullYear();
        const month = String(pastDate.getMonth() + 1).padStart(2, '0');
        const day = String(pastDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        
        // Set the birth date input
        document.getElementById('birthDate').value = formattedDate;
        
        // Clear target date to use today's date
        document.getElementById('targetDate').value = '';
        
        // Trigger calculation
        document.getElementById('calculateBtn').click();
    });
});

// ============================
// INPUT VALIDATION ON THE FLY
// ============================

function setupRealTimeValidation() {
    const birthDateInput = document.getElementById('birthDate');
    const targetDateInput = document.getElementById('targetDate');
    
    if (!birthDateInput || !targetDateInput) return;
    
    // Add visual feedback for invalid inputs
    function markInputValid(input) {
        input.style.borderColor = '';
        input.style.backgroundColor = '';
        input.title = '';
    }
    
    function markInputInvalid(input, message) {
        input.style.borderColor = '#ef4444';
        input.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
        input.title = message;
    }
    
    // Validate on blur - Birth Date
    birthDateInput.addEventListener('blur', function() {
        const value = sanitizeDateInput(this.value);
        if (!value) {
            markInputValid(this);
            return;
        }
        
        const date = parseDate(value);
        if (!date) {
            markInputInvalid(this, 'Invalid date format. Use YYYY-MM-DD or DD/MM/YYYY');
            return;
        }
        
        // Check if birth date is in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        if (dateOnly > today) {
            markInputInvalid(this, 'Birth date cannot be in the future!');
            return;
        }
        
        markInputValid(this);
    });
    
    // Validate on blur - Target Date
    targetDateInput.addEventListener('blur', function() {
        const value = sanitizeDateInput(this.value);
        if (!value) {
            markInputValid(this);
            return;
        }
        
        const date = parseDate(value);
        if (!date) {
            markInputInvalid(this, 'Invalid date format. Use YYYY-MM-DD or DD/MM/YYYY');
            return;
        }
        
        const birthValue = sanitizeDateInput(birthDateInput.value);
        if (!birthValue) {
            markInputInvalid(this, 'Please enter birth date first');
            return;
        }
        
        const birthDate = parseDate(birthValue);
        if (!birthDate) {
            markInputInvalid(this, 'Birth date is invalid');
            return;
        }
        
        // Check if target date is before birth date
        const birthDateOnly = new Date(birthDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        const targetDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        if (targetDateOnly < birthDateOnly) {
            markInputInvalid(this, 'Target date cannot be before birth date!');
            return;
        }
        
        markInputValid(this);
    });
}

// ============================
// INITIALIZATION
// ============================

document.addEventListener('DOMContentLoaded', function() {
    // Your existing theme initialization
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update theme icon if exists
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        const text = themeToggle.querySelector('span');
        
        if (icon) {
            icon.className = savedTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
        if (text) {
            text.textContent = savedTheme === 'light' ? 'Dark Mode' : 'Light Mode';
        }
    }
    
    // Setup real-time validation
    setupRealTimeValidation();
    
    // Add today's date as placeholder for target date
    const targetDateInput = document.getElementById('targetDate');
    if (targetDateInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        targetDateInput.placeholder = `${year}-${month}-${day} (or leave empty for today)`;
    }
});

// ============================
// ADDITIONAL SECURITY MEASURES
// ============================

// Prevent form submission via Enter key if you have a form
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        e.preventDefault();
        document.getElementById('calculateBtn').click();
    }
});

// Add some security-focused CSS
const securityCSS = `
    .error-border {
        border-color: #ef4444 !important;
        background-color: rgba(239, 68, 68, 0.05) !important;
    }
    
    .date-input input:invalid {
        border-color: #ef4444 !important;
    }
    
    button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
    
    .fa-spinner {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

// Inject security CSS
const style = document.createElement('style');
style.textContent = securityCSS;
document.head.appendChild(style);