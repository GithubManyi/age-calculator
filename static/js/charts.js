// Chart Visualizations for AgeMaster
let ageChart = null;
let planetChart = null;
let lifeCalendarChart = null;

function initCharts() {
    console.log('Initializing charts...');
    
    // Initialize Chart.js defaults
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary');
    
    // Destroy existing charts
    if (window.ageChart) {
        window.ageChart.destroy();
        window.ageChart = null;
    }
    if (window.planetChart) {
        window.planetChart.destroy();
        window.planetChart = null;
    }
    if (window.lifeCalendarChart) {
        window.lifeCalendarChart.destroy();
        window.lifeCalendarChart = null;
    }
    
    // Create age chart if canvas exists
    const ageChartCanvas = document.getElementById('ageChart');
    if (ageChartCanvas) {
        console.log('Creating age chart...');
        window.ageChart = new Chart(ageChartCanvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Age Progression',
                    data: [],
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-blue'),
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: getChartOptions('Age Progression Over Time')
        });
    }
    
    // Create planet chart if canvas exists
    const planetChartCanvas = document.getElementById('planetChart');
    if (planetChartCanvas) {
        console.log('Creating planet chart...');
        window.planetChart = new Chart(planetChartCanvas.getContext('2d'), {
            type: 'radar',
            data: {
                labels: ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn'],
                datasets: [{
                    label: 'Planetary Age',
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-green'),
                    borderWidth: 2,
                    pointBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-green')
                }]
            },
            options: getRadarChartOptions('Planetary Ages Comparison')
        });
    }
    
    // Create life calendar chart if canvas exists
    const lifeChartCanvas = document.getElementById('lifeCalendarChart');
    if (lifeChartCanvas) {
        console.log('Creating life calendar chart...');
        window.lifeCalendarChart = new Chart(lifeChartCanvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Weeks Lived', 'Weeks Remaining'],
                datasets: [{
                    data: [0, 100],
                    backgroundColor: [
                        getComputedStyle(document.documentElement).getPropertyValue('--primary-blue'),
                        getComputedStyle(document.documentElement).getPropertyValue('--border')
                    ],
                    borderWidth: 0,
                    hoverOffset: 15
                }]
            },
            options: getDoughnutChartOptions('Life Calendar')
        });
    }
    
    console.log('Charts initialized!');
}
function createChartCanvases() {
    // Age distribution chart
    const ageChartCanvas = document.getElementById('ageChart');
    if (ageChartCanvas) {
        ageChart = new Chart(ageChartCanvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Age Progression',
                    data: [],
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-blue'),
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: getChartOptions('Age Progression Over Time')
        });
    }
    
    // Planetary ages chart
    const planetChartCanvas = document.getElementById('planetChart');
    if (planetChartCanvas) {
        planetChart = new Chart(planetChartCanvas.getContext('2d'), {
            type: 'radar',
            data: {
                labels: ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn'],
                datasets: [{
                    label: 'Planetary Age',
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-green'),
                    borderWidth: 2,
                    pointBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-green')
                }]
            },
            options: getRadarChartOptions('Planetary Ages Comparison')
        });
    }
    
    // Life calendar chart
    const lifeChartCanvas = document.getElementById('lifeCalendarChart');
    if (lifeChartCanvas) {
        lifeCalendarChart = new Chart(lifeChartCanvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Weeks Lived', 'Weeks Remaining'],
                datasets: [{
                    data: [0, 100],
                    backgroundColor: [
                        getComputedStyle(document.documentElement).getPropertyValue('--primary-blue'),
                        getComputedStyle(document.documentElement).getPropertyValue('--border')
                    ],
                    borderWidth: 0,
                    hoverOffset: 15
                }]
            },
            options: getDoughnutChartOptions('Life Calendar')
        });
    }
}

function getChartOptions(title) {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
    
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: textColor,
                    font: {
                        size: 14
                    }
                }
            },
            title: {
                display: true,
                text: title,
                color: textColor,
                font: {
                    size: 16,
                    weight: 'bold'
                },
                padding: {
                    top: 10,
                    bottom: 30
                }
            },
            tooltip: {
                backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                titleColor: isDark ? '#fff' : '#000',
                bodyColor: isDark ? '#fff' : '#000',
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-blue'),
                borderWidth: 1,
                cornerRadius: 8,
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} years`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: gridColor
                },
                ticks: {
                    color: textColor
                }
            },
            y: {
                grid: {
                    color: gridColor
                },
                ticks: {
                    color: textColor,
                    callback: function(value) {
                        return value + ' years';
                    }
                }
            }
        },
        animation: {
            duration: 2000,
            easing: 'easeOutQuart'
        }
    };
}

function getRadarChartOptions(title) {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
    
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            },
            title: {
                display: true,
                text: title,
                color: textColor,
                font: {
                    size: 16,
                    weight: 'bold'
                }
            }
        },
        scales: {
            r: {
                angleLines: {
                    color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                },
                grid: {
                    color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                },
                pointLabels: {
                    color: textColor,
                    font: {
                        size: 12
                    }
                },
                ticks: {
                    color: textColor,
                    backdropColor: 'transparent'
                }
            }
        }
    };
}

function getDoughnutChartOptions(title) {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
    
    return {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: textColor,
                    padding: 20,
                    font: {
                        size: 12
                    }
                }
            },
            title: {
                display: true,
                text: title,
                color: textColor,
                font: {
                    size: 16,
                    weight: 'bold'
                },
                padding: {
                    bottom: 20
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${value.toLocaleString()} weeks (${percentage}%)`;
                    }
                }
            }
        },
        animation: {
            animateScale: true,
            animateRotate: true
        }
    };
}

function updateCharts(data) {
    // Update age progression chart
    if (ageChart) {
        const birthYear = new Date(data.birth_date_formatted).getFullYear();
        const currentYear = new Date().getFullYear();
        const years = [];
        const ages = [];
        
        for (let year = birthYear; year <= currentYear; year++) {
            years.push(year.toString());
            ages.push(year - birthYear);
        }
        
        ageChart.data.labels = years;
        ageChart.data.datasets[0].data = ages;
        ageChart.update();
    }
    
    // Update planetary ages chart
    if (planetChart) {
        const planetaryData = [
            data.planetary_ages.mercury || 0,
            data.planetary_ages.venus || 0,
            data.age_data.exact_years, // Earth
            data.planetary_ages.mars || 0,
            data.planetary_ages.jupiter || 0,
            data.planetary_ages.saturn || 0
        ];
        
        planetChart.data.datasets[0].data = planetaryData;
        planetChart.update();
    }
    
    // Update life calendar chart
    if (lifeCalendarChart) {
        const weeksLived = data.life_calendar.weeks_lived;
        const weeksTotal = data.life_calendar.life_expectancy * 52.143;
        const weeksRemaining = weeksTotal - weeksLived;
        
        lifeCalendarChart.data.datasets[0].data = [weeksLived, weeksRemaining];
        lifeCalendarChart.update();
    }
    
    // Create time perception gauge
    createTimePerceptionGauge(data.time_perception);
    
    // Create milestone timeline
    createMilestoneTimeline(data.age_data.years);
}

function createTimePerceptionGauge(factor) {
    const gaugeContainer = document.getElementById('timePerceptionGauge');
    if (!gaugeContainer) return;
    
    gaugeContainer.innerHTML = '';
    
    const width = 300;
    const height = 200;
    const radius = Math.min(width, height * 2) / 2;
    
    const svg = d3.select('#timePerceptionGauge')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2}, ${height})`);
    
    // Arc generator
    const arc = d3.arc()
        .innerRadius(radius * 0.6)
        .outerRadius(radius)
        .startAngle(-Math.PI / 2)
        .endAngle(d => -Math.PI / 2 + d * Math.PI);
    
    // Background arc
    svg.append('path')
        .datum(1)
        .style('fill', getComputedStyle(document.documentElement).getPropertyValue('--border'))
        .attr('d', arc);
    
    // Foreground arc (time perception)
    const foreground = svg.append('path')
        .datum(factor / 2) // Scale factor to fit 0-2 range into 0-1
        .style('fill', getComputedStyle(document.documentElement).getPropertyValue('--primary-blue'))
        .attr('d', arc);
    
    // Add text
    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '-1.5em')
        .style('font-size', '24px')
        .style('font-weight', 'bold')
        .style('fill', getComputedStyle(document.documentElement).getPropertyValue('--text-primary'))
        .text(`${factor.toFixed(1)}x`);
    
    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.5em')
        .style('font-size', '12px')
        .style('fill', getComputedStyle(document.documentElement).getPropertyValue('--text-secondary'))
        .text('Time Perception Factor');
    
    // Animate the arc
    foreground.transition()
        .duration(2000)
        .attrTween('d', function(d) {
            const interpolate = d3.interpolate(0, d);
            return function(t) {
                return arc(interpolate(t));
            };
        });
}

function createMilestoneTimeline(age) {
    const timelineContainer = document.getElementById('milestoneTimeline');
    if (!timelineContainer) return;
    
    const milestones = [
        { age: 0, label: 'Birth', icon: '👶' },
        { age: 1, label: 'First Steps', icon: '🚶' },
        { age: 5, label: 'Start School', icon: '🎒' },
        { age: 13, label: 'Teenager', icon: '👦' },
        { age: 16, label: 'Sweet Sixteen', icon: '🎂' },
        { age: 18, label: 'Adult', icon: '👨' },
        { age: 21, label: 'Legal Adult', icon: '🍷' },
        { age: 25, label: 'Quarter Life', icon: '🎯' },
        { age: 30, label: 'Thirties', icon: '🏃' },
        { age: 40, label: 'Mid Life', icon: '🎭' },
        { age: 50, label: 'Half Century', icon: '🎉' },
        { age: 65, label: 'Retirement', icon: '🏖️' },
        { age: 100, label: 'Century', icon: '🎊' }
    ];
    
    let html = '<div class="timeline">';
    
    milestones.forEach(milestone => {
        const isPassed = age >= milestone.age;
        const isCurrent = Math.abs(age - milestone.age) < 1;
        
        let className = 'timeline-item';
        if (isPassed) className += ' passed';
        if (isCurrent) className += ' current';
        
        html += `
            <div class="${className}">
                <div class="timeline-marker">
                    <span class="milestone-icon">${milestone.icon}</span>
                </div>
                <div class="timeline-content">
                    <h4>${milestone.label}</h4>
                    <p>Age ${milestone.age}</p>
                    ${isPassed ? '<span class="badge">✓ Achieved</span>' : 
                      `<span class="badge upcoming">In ${milestone.age - age} years</span>`}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    timelineContainer.innerHTML = html;
    
    // Add animation to current milestone
    const currentItem = timelineContainer.querySelector('.timeline-item.current');
    if (currentItem) {
        currentItem.classList.add('pulse');
    }
}

// Update charts when theme changes
document.addEventListener('themeChanged', () => {
    if (ageChart) ageChart.update();
    if (planetChart) planetChart.update();
    if (lifeCalendarChart) lifeCalendarChart.update();
});

// Initialize charts on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCharts);
} else {
    initCharts();
}