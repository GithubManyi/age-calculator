// Tab Enhancement - Makes Milestones, Charts, Comparison, Share tabs work
class TabEnhancer {
    constructor() {
        this.currentData = null;
        this.charts = {};
        this.secondsTimer = null;
        this.initialSeconds = 0;
        this.startTime = null;
        this.init();
    }
    
    init() {
        this.enhanceTabs();
        this.setupLazyLoading();
        this.setupSecondsCounter();
    }
    
    enhanceTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = btn.getAttribute('data-tab');
                this.loadTabContent(tabId);
                
                // Update active tab styling
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update tab content visibility
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(`${tabId}-content`)?.classList.add('active');
            });
        });
    }
    
    setupLazyLoading() {
        // Store data when results are calculated
        const originalDisplayResults = window.displayResults;
        window.displayResults = (data) => {
            // Call original function
            if (originalDisplayResults) {
                originalDisplayResults(data);
            }
            
            // Store data for tab loading
            this.currentData = data;
            
            // Start the seconds counter with initial seconds
            this.startSecondsCounter(data.age_data.total_seconds);
            
            // Initialize tabs with data
            this.initializeTabsWithData(data);
        };
    }
    
    setupSecondsCounter() {
        // Initialize the counter when Overview tab is loaded
        const overviewBtn = document.querySelector('[data-tab="overview"]');
        if (overviewBtn) {
            overviewBtn.addEventListener('click', () => {
                if (this.currentData) {
                    // Restart counter when overview tab is viewed
                    this.startSecondsCounter(this.currentData.age_data.total_seconds);
                }
            });
        }
        
        // Stop counter when switching away from Overview tab
        document.querySelectorAll('.tab-btn:not([data-tab="overview"])').forEach(btn => {
            btn.addEventListener('click', () => {
                this.stopSecondsCounter();
            });
        });
    }
    
    startSecondsCounter(initialSeconds) {
        // Clear any existing timer
        this.stopSecondsCounter();
        
        // Store initial values
        this.initialSeconds = initialSeconds;
        this.startTime = Date.now();
        
        // Start the timer
        this.secondsTimer = setInterval(() => {
            this.updateSecondsCounter();
        }, 1000);
        
        // Update immediately
        this.updateSecondsCounter();
    }
    
    stopSecondsCounter() {
        if (this.secondsTimer) {
            clearInterval(this.secondsTimer);
            this.secondsTimer = null;
        }
    }
    
    updateSecondsCounter() {
        if (!this.startTime) return;
        
        // Calculate elapsed seconds since calculation
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - this.startTime) / 1000);
        const currentSeconds = this.initialSeconds + elapsedSeconds;
        
        // Update all time units based on current seconds
        this.updateAllTimeUnits(currentSeconds);
    }
    
    updateAllTimeUnits(totalSeconds) {
        // Calculate all time units
        const minutes = Math.floor(totalSeconds / 60);
        const hours = Math.floor(totalSeconds / 3600);
        const days = Math.floor(totalSeconds / 86400);
        const weeks = Math.floor(totalSeconds / 604800);
        const months = Math.floor(totalSeconds / 2629746);
        const years = totalSeconds / 31556952;
        
        // Update the display with full numbers and proper sizing
        this.updateAgeCard('ageMonths', Math.floor(months).toLocaleString());
        this.updateAgeCard('ageDays', Math.floor(days).toLocaleString());
        this.updateAgeCard('ageWeeks', Math.floor(weeks).toLocaleString());
        this.updateAgeCard('ageHours', Math.floor(hours).toLocaleString());
        this.updateAgeCard('ageMinutes', Math.floor(minutes).toLocaleString());
        
        // Update seconds (counting up)
        this.updateAgeCard('ageSeconds', totalSeconds.toLocaleString());
        
        // Add counting animation to seconds
        const secondsElement = document.getElementById('ageSeconds');
        if (secondsElement) {
            secondsElement.classList.add('counting');
            setTimeout(() => {
                secondsElement.classList.remove('counting');
            }, 300);
        }
    }
    
    // New method to update age card with proper font sizing
    updateAgeCard(elementId, value) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        // Set the text
        element.textContent = value;
        
        // Remove all size classes first
        element.classList.remove('large-number', 'very-large-number', 'massive-number');
        
        // Count the number of digits (remove commas for counting)
        const numLength = value.toString().replace(/,/g, '').length;
        
        // Apply appropriate class based on length
        if (numLength >= 9) { // 1,000,000,000+ (1B+)
            element.classList.add('massive-number');
        } else if (numLength >= 7) { // 10,000,000+ (10M+)
            element.classList.add('very-large-number');
        } else if (numLength >= 5) { // 100,000+ (100K+)
            element.classList.add('large-number');
        }
        // No class for smaller numbers - they use default size
    }
    
    formatNumber(num, type) {
        if (typeof num !== 'number') {
            // Try to parse if it's a string
            if (typeof num === 'string') {
                // Check if it has K, M, B suffixes
                const match = num.match(/([\d,.]+)([KMB]?)/);
                if (match) {
                    const numberPart = parseFloat(match[1].replace(/,/g, ''));
                    const suffix = match[2];
                    
                    // Multiply based on suffix
                    if (suffix === 'K') return Math.round(numberPart * 1000).toLocaleString();
                    if (suffix === 'M') return Math.round(numberPart * 1000000).toLocaleString();
                    if (suffix === 'B') return Math.round(numberPart * 1000000000).toLocaleString();
                    return numberPart.toLocaleString();
                }
            }
            return num || '0';
        }
        
        // For numbers, round to nearest integer and format with commas
        return Math.round(num).toLocaleString();
    }
    
    initializeTabsWithData(data) {
        console.log("Initializing tabs with data:", data);
        
        // Update Share tab with your existing share.js
        if (window.updateShareData && data) {
            window.updateShareData(data);
        }
        
        // Format initial overview numbers
        this.updateOverviewDisplay(data.age_data);
        
        // Initialize all tabs but load content only when clicked
        this.setupTabData(data);
    }
    
    setupTabData(data) {
        // Store data for each tab
        this.currentData = data;
        
        // Pre-create planet cards if planets tab exists
        if (document.getElementById('planetsContainer')) {
            this.createPlanetCards();
        }
    }
    
    async loadTabContent(tabId) {
        console.log(`Loading tab content for: ${tabId}`);
        
        if (!this.currentData) {
            console.error("No data available for tabs");
            return;
        }
        
        // Start or stop seconds counter based on tab
        if (tabId === 'overview') {
            this.startSecondsCounter(this.currentData.age_data.total_seconds);
        } else {
            this.stopSecondsCounter();
        }
        
        switch(tabId) {
            case 'milestones':
                await this.loadMilestones();
                break;
            case 'charts':
                this.loadCharts();
                break;
            case 'comparison':
                this.loadComparison();
                break;
            case 'share':
                this.loadShare();
                break;
            case 'planets':
                this.createPlanetCards();
                break;
            case 'overview':
                // Overview tab is already handled by setupSecondsCounter
                break;
            default:
                console.log(`Tab ${tabId} loaded`);
        }
    }
    
    updateOverviewDisplay(ageData) {
        // Update all time units with full numbers
        this.updateAgeCard('ageMonths', this.formatNumber(ageData.months));
        this.updateAgeCard('ageDays', this.formatNumber(ageData.days));
        this.updateAgeCard('ageWeeks', this.formatNumber(ageData.weeks));
        this.updateAgeCard('ageHours', this.formatNumber(ageData.total_hours));
        this.updateAgeCard('ageMinutes', this.formatNumber(ageData.total_minutes));
        this.updateAgeCard('ageSeconds', this.formatNumber(ageData.total_seconds));
        
        // Update the main age display if on Overview tab
        const overviewTab = document.getElementById('overview-content');
        if (overviewTab && overviewTab.classList.contains('active')) {
            const mainAge = document.getElementById('mainAge');
            if (mainAge) {
                // Update years (only show integer part for main display)
                const years = typeof ageData.years === 'number' ? ageData.years : parseFloat(ageData.years);
                mainAge.textContent = Math.floor(years);
                
                // Update exact age with more precision
                const exactAge = document.getElementById('exactAge');
                if (exactAge) {
                    exactAge.textContent = years.toFixed(7);
                }
            }
        }
    }
    
    createPlanetCards() {
        const container = document.getElementById('planetsContainer');
        if (!container || !this.currentData?.planetary_ages) {
            console.log("Planets container or data not found");
            return;
        }
        
        console.log("Creating planet cards with data:", this.currentData.planetary_ages);
        
        const planets = this.currentData.planetary_ages;
        const earthAge = this.currentData.age_data.years;
        
        container.innerHTML = '';
        
        const planetData = {
            mercury: { name: 'Mercury', icon: '☿', year: 88, description: 'Fastest orbit' },
            venus: { name: 'Venus', icon: '♀', year: 225, description: 'Hottest planet' },
            earth: { name: 'Earth', icon: '♁', year: 365.25, description: 'Our home' },
            mars: { name: 'Mars', icon: '♂', year: 687, description: 'Red planet' },
            jupiter: { name: 'Jupiter', icon: '♃', year: 4333, description: 'Largest planet' },
            saturn: { name: 'Saturn', icon: '♄', year: 10759, description: 'Ringed beauty' },
            uranus: { name: 'Uranus', icon: '♅', year: 30687, description: 'Ice giant' },
            neptune: { name: 'Neptune', icon: '♆', year: 60190, description: 'Windy planet' }
        };
        
        Object.entries(planets).forEach(([planet, age]) => {
            const info = planetData[planet];
            if (!info) return;
            
            const card = document.createElement('div');
            card.className = 'planet-card';
            card.setAttribute('data-planet', planet);
            
            card.innerHTML = `
                <div class="planet-icon">${info.icon}</div>
                <div class="planet-name">${info.name}</div>
                <div class="planet-age">${age.toFixed(2)}</div>
                <div class="planet-details">
                    <div>${info.description}</div>
                    <div>1 ${info.name} year = ${info.year} Earth days</div>
                    <div class="comparison">
                        ${age > earthAge ? 'Older' : 'Younger'} than Earth age
                    </div>
                </div>
            `;
            
            container.appendChild(card);
        });
        
        // Also create the planet chart
        this.createPlanetaryAgesChart();
    }
    
    async loadMilestones() {
        const container = document.getElementById('milestonesContainer');
        const timeline = document.getElementById('milestoneTimeline');
        
        if (!container || !this.currentData) {
            console.log("Milestones container or data not found");
            return;
        }
        
        try {
            // Show loading
            container.innerHTML = '<div class="loading">Loading milestones...</div>';
            
            // Fetch from your backend
            const response = await fetch('/milestones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    birth_date: document.getElementById('birthDate')?.value 
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.displayMilestones(result.milestones, container, timeline);
            } else {
                container.innerHTML = '<p class="error">Failed to load milestones</p>';
            }
        } catch (error) {
            console.error('Error loading milestones:', error);
            container.innerHTML = '<p class="error">Failed to load milestones</p>';
        }
    }
    
    displayMilestones(milestones, container, timeline) {
        if (!milestones || milestones.length === 0) {
            container.innerHTML = '<p class="error">No milestones found</p>';
            return;
        }
        
        container.innerHTML = '';
        
        milestones.forEach(milestone => {
            const div = document.createElement('div');
            div.className = 'milestone-card';
            div.innerHTML = `
                <div class="milestone-icon">${this.getMilestoneIcon(milestone.name)}</div>
                <div class="milestone-content">
                    <h4>${milestone.name}</h4>
                    <p>${milestone.date_formatted}</p>
                    <span class="milestone-status ${milestone.status}">
                        ${milestone.status === 'passed' 
                            ? `✓ ${milestone.days_ago} days ago` 
                            : `⏳ In ${milestone.days_until} days`}
                    </span>
                </div>
            `;
            container.appendChild(div);
        });
        
        // Update timeline if exists
        if (timeline) {
            this.updateTimeline(milestones, timeline);
        }
    }
    
    getMilestoneIcon(name) {
        const newLocal = '';
        const icons = {
            'First Birthday': '🎂',
            '5 Years Old': '👶',
            '10 Years Old': '🧒',
            '13 Years Old (Teenager)': '👦',
            '16 Years Old': '🚗',
            '18 Years Old (Adult)': '🎓',
            '21 Years Old': '🍻',
            '25 Years Old (Quarter Life)': '🏙️',
            '30 Years Old': '👨',
            '40 Years Old': '👨‍💼',
            '50 Years Old': '👴',
            '65 Years Old (Retirement)': '🏖️',
            '100 Years Old(Centenarian)': '🎉',
            '110 Years Old(Supercentenarian)': '🌟',
            '116 Years Old(Oldest Man)': '👴',
            '118 Years Old(As of 2025)': '👴',
            '120 Years Old(Near record)': '🏆',
            '122 Years Old(As per World Records)': '👑🏆',
            '150 Years Old(Theoretical Max)': '🧬'
            
        };
        return icons[name] || '🎯';
    }
    
    updateTimeline(milestones, timeline) {
        const passed = milestones.filter(m => m.status === 'passed');
        const upcoming = milestones.filter(m => m.status === 'upcoming');
        
        timeline.innerHTML = `
            <div class="timeline-visual">
                <div class="timeline-line">
                    <div class="timeline-progress" 
                         style="width: ${(passed.length / milestones.length) * 100}%"></div>
                </div>
                <div class="timeline-markers">
                    ${milestones.map((m, i) => `
                        <div class="timeline-marker ${m.status}" 
                             style="left: ${(i / (milestones.length - 1)) * 100}%">
                            <div class="marker-dot" title="${m.name}"></div>
                            <span class="marker-label">${m.name.split(' ')[0]}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="timeline-stats">
                <span class="stat">${passed.length} passed</span>
                <span class="stat">${upcoming.length} upcoming</span>
            </div>
        `;
    }
    
    loadCharts() {
        if (!window.Chart) {
            console.error("Chart.js not loaded");
            return;
        }
        
        if (!this.currentData) {
            console.error("No data available for charts");
            return;
        }
        
        console.log("Loading charts...");
        
        // Age Progression Chart
        this.createAgeProgressionChart();
        
        // Planetary Ages Chart
        this.createPlanetaryAgesChart();
        
        // Life Calendar Chart
        this.createLifeCalendarChart();
        
        // Time Perception Gauge
        this.createTimePerceptionGauge();
    }
    
    createAgeProgressionChart() {
        const ctx = document.getElementById('ageProgressionChart')?.getContext('2d');
        if (!ctx) {
            console.log("Age progression chart canvas not found");
            return;
        }
        
        // Destroy previous chart
        if (this.charts.ageProgression) {
            this.charts.ageProgression.destroy();
        }
        
        const age = this.currentData.age_data.years;
        this.charts.ageProgression = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['0', '10', '20', '30', '40', '50', '60', '70', '80'],
                datasets: [{
                    label: 'Your Age',
                    data: [0, 10, 20, age, 40, 50, 60, 70, 80],
                    borderColor: '#4361ee',
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { 
                        display: true, 
                        text: 'Age Progression',
                        font: { size: 14 }
                    }
                }
            }
        });
    }
    
    createPlanetaryAgesChart() {
        const ctx = document.getElementById('planetaryAgesChart')?.getContext('2d');
        if (!ctx || !this.currentData.planetary_ages) {
            console.log("Planetary ages chart canvas or data not found");
            return;
        }
        
        if (this.charts.planetaryAges) {
            this.charts.planetaryAges.destroy();
        }
        
        const planets = Object.keys(this.currentData.planetary_ages);
        const ages = Object.values(this.currentData.planetary_ages);
        
        this.charts.planetaryAges = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: planets.map(p => p.charAt(0).toUpperCase() + p.slice(1)),
                datasets: [{
                    label: 'Age (Years)',
                    data: ages,
                    backgroundColor: ['#4361ee', '#7209b7', '#f72585', '#4cc9f0', '#4895ef', '#3a0ca3', '#4361ee', '#7209b7']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { 
                        display: true, 
                        text: 'Your Age Across Planets',
                        font: { size: 14 }
                    }
                }
            }
        });
    }
    
    createLifeCalendarChart() {
        const ctx = document.getElementById('lifeCalendarChart')?.getContext('2d');
        if (!ctx || !this.currentData.life_calendar) {
            console.log("Life calendar chart canvas or data not found");
            return;
        }
        
        if (this.charts.lifeCalendar) {
            this.charts.lifeCalendar.destroy();
        }
        
        const lived = this.currentData.life_calendar.weeks_lived;
        const remaining = this.currentData.life_calendar.weeks_remaining;
        
        this.charts.lifeCalendar = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Weeks Lived', 'Weeks Remaining'],
                datasets: [{
                    data: [lived, remaining],
                    backgroundColor: ['#10b981', '#3b82f6']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { 
                        display: true, 
                        text: 'Life Calendar',
                        font: { size: 14 }
                    }
                }
            }
        });
    }
    
    createTimePerceptionGauge() {
        const container = document.getElementById('timePerceptionGauge');
        if (!container || !this.currentData?.time_perception) {
            console.log("Time perception gauge container or data not found");
            return;
        }
        
        const factor = this.currentData.time_perception;
        
        // Clear container
        container.innerHTML = '';
        
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300;
        container.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        
        // Create circular gauge
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 100;
        
        // Draw background circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(67, 97, 238, 0.05)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(67, 97, 238, 0.1)';
        ctx.stroke();
        
        // Draw gauge arc
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + (Math.PI * 2 * ((factor - 0.3) / 1.7));
        
        // Gradient for the gauge
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, '#10b981');
        gradient.addColorStop(0.5, '#eab308');
        gradient.addColorStop(1, '#ef4444');
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 10, startAngle, endAngle);
        ctx.lineWidth = 20;
        ctx.strokeStyle = gradient;
        ctx.stroke();
        
        // Draw center value
        ctx.font = 'bold 32px Inter, sans-serif';
        ctx.fillStyle = '#374151';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${factor.toFixed(1)}x`, centerX, centerY);
        
        // Draw label
        ctx.font = '14px Inter, sans-serif';
        ctx.fillStyle = '#6b7280';
        ctx.fillText('Time Perception', centerX, centerY + 40);
        
        // Add scale markers
        this.drawGaugeMarkers(ctx, centerX, centerY, radius);
        
        // Add description below
        const description = document.createElement('div');
        description.className = 'gauge-description';
        description.innerHTML = `
            <p style="margin: 1rem 0 0.5rem; font-weight: 500; color: #374151;">
                Age ${this.currentData.age_data.years}: ${this.getTimePerceptionDescription(factor)}
            </p>
            <p style="font-size: 0.9rem; color: #6b7280;">
                ${this.getFactorMeaning(factor)}. ${this.getTimeComparison(factor)}
            </p>
        `;
        container.appendChild(description);
    }
    
    drawGaugeMarkers(ctx, centerX, centerY, radius) {
        for (let i = 0; i <= 5; i++) {
            const angle = -Math.PI / 2 + (i * Math.PI * 2) / 5;
            const value = (0.3 + (i * 1.7 / 5)).toFixed(1);
            
            const x1 = centerX + (radius - 15) * Math.cos(angle);
            const y1 = centerY + (radius - 15) * Math.sin(angle);
            const x2 = centerX + (radius + 5) * Math.cos(angle);
            const y2 = centerY + (radius + 5) * Math.sin(angle);
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#e5e7eb';
            ctx.stroke();
            
            const labelX = centerX + (radius + 25) * Math.cos(angle);
            const labelY = centerY + (radius + 25) * Math.sin(angle);
            
            ctx.font = '10px Inter, sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(value, labelX, labelY);
        }
    }
    
    getTimePerceptionDescription(factor) {
        if (factor < 0.5) return "Time feels slow";
        if (factor < 0.8) return "Time feels normal";
        if (factor < 1.2) return "Time feels steady";
        if (factor < 1.5) return "Time feels fast";
        return "Time feels very fast";
    }
    
    getFactorMeaning(factor) {
        if (factor < 1) return "Slower than childhood";
        if (factor === 1) return "Similar to childhood";
        return "Faster than childhood";
    }
    
    getTimeComparison(factor) {
        const childhoodYears = 10;
        const perceivedYears = childhoodYears * factor;
        return `10 childhood years feel like ${perceivedYears.toFixed(1)} years now`;
    }
    
    loadComparison() {
        const container = document.getElementById('comparisonContainer');
        const chartCanvas = document.getElementById('ageComparisonChart');
        
        if (!container || !this.currentData) {
            console.log("Comparison container or data not found");
            return;
        }
        
        const age = this.currentData.age_data.years;
        const comparisons = [
            { name: 'You', age: age, color: '#4361ee' },
            { name: 'Average Person', age: 31, color: '#6b7280' },
            { name: 'Historical Figure', age: this.getHistoricalAge(age), color: '#10b981' },
            { name: 'Movie Character', age: this.getMovieCharacterAge(age), color: '#f59e0b' }
        ];
        
        container.innerHTML = `
            <div class="comparison-cards">
                ${comparisons.map(comp => `
                    <div class="comparison-card">
                        <div class="comp-name">${comp.name}</div>
                        <div class="comp-age">${comp.age} years</div>
                        <div class="comp-difference">
                            ${comp.name === 'You' ? '—' : 
                              age > comp.age ? `${age - comp.age} years older` : 
                              `${comp.age - age} years younger`}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        this.createComparisonChart(comparisons, chartCanvas);
    }
    
    getHistoricalAge(yourAge) {
        if (yourAge < 30) return 56;
        if (yourAge < 50) return 42;
        return 67;
    }
    
    getMovieCharacterAge(yourAge) {
        if (yourAge < 18) return 17;
        if (yourAge < 35) return 29;
        if (yourAge < 55) return 45;
        return 62;
    }
    
    createComparisonChart(comparisons, canvas) {
        if (!canvas || !window.Chart) {
            console.log("Comparison chart canvas or Chart.js not found");
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        if (this.charts.comparison) {
            this.charts.comparison.destroy();
        }
        
        this.charts.comparison = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: comparisons.map(c => c.name),
                datasets: [{
                    label: 'Age (Years)',
                    data: comparisons.map(c => c.age),
                    backgroundColor: comparisons.map(c => c.color)
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { 
                        display: true, 
                        text: 'Age Comparison',
                        font: { size: 14 }
                    }
                }
            }
        });
    }
    
    loadShare() {
        const birthDate = document.getElementById('birthDate')?.value;
        if (!birthDate) return;
        
        const shareUrl = `${window.location.origin}?birthdate=${birthDate}`;
        const urlInput = document.getElementById('shareUrl');
        if (urlInput) {
            urlInput.value = shareUrl;
        }
    }
    
    // Cleanup when leaving page
    cleanup() {
        this.stopSecondsCounter();
        
        // Destroy all charts
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.tabEnhancer = new TabEnhancer();
    
    // Cleanup when page is unloaded
    window.addEventListener('beforeunload', () => {
        if (window.tabEnhancer) {
            window.tabEnhancer.cleanup();
        }
    });
});