// Enhanced Calendar Component
class EnhancedCalendar {
    constructor(elementId, options = {}) {
        this.container = document.getElementById(elementId);
        this.date = options.date || new Date();
        this.onSelect = options.onSelect || (() => {});
        this.selectedDate = options.selectedDate;
        this.minDate = options.minDate;
        this.maxDate = options.maxDate;
        
        this.init();
    }
    
    init() {
        this.render();
        this.addEventListeners();
    }
    
    render() {
        const year = this.date.getFullYear();
        const month = this.date.getMonth();
        
        this.container.innerHTML = `
            <div class="calendar-header">
                <button class="nav-btn prev-year" title="Previous Year">
                    <i class="fas fa-angle-double-left"></i>
                </button>
                <button class="nav-btn prev-month" title="Previous Month">
                    <i class="fas fa-angle-left"></i>
                </button>
                
                <div class="current-month">
                    <span class="month">${this.getMonthName(month)}</span>
                    <span class="year">${year}</span>
                </div>
                
                <button class="nav-btn next-month" title="Next Month">
                    <i class="fas fa-angle-right"></i>
                </button>
                <button class="nav-btn next-year" title="Next Year">
                    <i class="fas fa-angle-double-right"></i>
                </button>
            </div>
            
            <div class="calendar-weekdays">
                ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                    .map(day => `<div class="weekday">${day}</div>`)
                    .join('')}
            </div>
            
            <div class="calendar-days">
                ${this.generateDaysHTML(year, month)}
            </div>
            
            <div class="calendar-footer">
                <button class="today-btn">
                    <i class="fas fa-calendar-day"></i> Today
                </button>
                <button class="clear-btn">
                    <i class="fas fa-times"></i> Clear
                </button>
            </div>
        `;
        
        this.highlightSelectedDate();
    }
    
    generateDaysHTML(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        
        let html = '';
        
        // Previous month days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDay - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            html += `<div class="day other-month" data-date="${new Date(year, month - 1, day).toISOString()}">${day}</div>`;
        }
        
        // Current month days
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = this.isSameDate(date, today);
            const isSelected = this.selectedDate && this.isSameDate(date, this.selectedDate);
            const isPast = date < this.minDate;
            const isFuture = this.maxDate && date > this.maxDate;
            
            let classes = 'day';
            if (isToday) classes += ' today';
            if (isSelected) classes += ' selected';
            if (isPast) classes += ' disabled';
            if (isFuture) classes += ' disabled';
            
            html += `<div class="${classes}" data-date="${date.toISOString()}">${day}</div>`;
        }
        
        // Next month days
        const totalCells = 42; // 6 weeks
        const nextMonthDays = totalCells - (startingDay + daysInMonth);
        for (let day = 1; day <= nextMonthDays; day++) {
            html += `<div class="day other-month" data-date="${new Date(year, month + 1, day).toISOString()}">${day}</div>`;
        }
        
        return html;
    }
    
    getMonthName(month) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[month];
    }
    
    isSameDate(date1, date2) {
        if (!date1 || !date2) return false;
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
    
    addEventListeners() {
        // Navigation
        this.container.querySelector('.prev-year').addEventListener('click', () => {
            this.date.setFullYear(this.date.getFullYear() - 1);
            this.render();
        });
        
        this.container.querySelector('.prev-month').addEventListener('click', () => {
            this.date.setMonth(this.date.getMonth() - 1);
            this.render();
        });
        
        this.container.querySelector('.next-month').addEventListener('click', () => {
            this.date.setMonth(this.date.getMonth() + 1);
            this.render();
        });
        
        this.container.querySelector('.next-year').addEventListener('click', () => {
            this.date.setFullYear(this.date.getFullYear() + 1);
            this.render();
        });
        
        // Day selection
        this.container.addEventListener('click', (e) => {
            const dayElement = e.target.closest('.day:not(.disabled)');
            if (dayElement) {
                const dateString = dayElement.dataset.date;
                this.selectDate(new Date(dateString));
            }
        });
        
        // Today button
        this.container.querySelector('.today-btn').addEventListener('click', () => {
            this.selectDate(new Date());
            this.date = new Date();
            this.render();
        });
        
        // Clear button
        this.container.querySelector('.clear-btn').addEventListener('click', () => {
            this.selectedDate = null;
            this.onSelect(null);
            this.render();
        });
    }
    
    selectDate(date) {
        this.selectedDate = date;
        this.highlightSelectedDate();
        this.onSelect(date);
    }
    
    highlightSelectedDate() {
        this.container.querySelectorAll('.day.selected').forEach(day => {
            day.classList.remove('selected');
        });
        
        if (this.selectedDate) {
            const selectedDay = this.container.querySelector(`.day[data-date="${this.selectedDate.toISOString()}"]`);
            if (selectedDay) {
                selectedDay.classList.add('selected');
            }
        }
    }
    
    setDate(date) {
        this.selectedDate = date;
        if (date) {
            this.date = new Date(date);
        }
        this.render();
    }
}

// Initialize calendar when needed
function initCalendar() {
    const calendarContainer = document.getElementById('calendarContainer');
    if (calendarContainer) {
        const calendar = new EnhancedCalendar('calendarContainer', {
            onSelect: (date) => {
                if (date) {
                    const dateInput = document.getElementById('birthDate');
                    dateInput.value = date.toISOString().split('T')[0];
                }
            },
            minDate: new Date(1900, 0, 1),
            maxDate: new Date()
        });
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalendar);
} else {
    initCalendar();
}