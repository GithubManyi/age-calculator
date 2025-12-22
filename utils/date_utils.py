from datetime import datetime, date, timedelta
import pytz
from dateutil.relativedelta import relativedelta
import math

class DateUtils:
    @staticmethod
    def calculate_age(birth_date, target_date=None):
        """Calculate precise age in years, months, days, etc."""
        if not target_date:
            target_date = datetime.now()
        
        if isinstance(birth_date, str):
            birth_date = datetime.strptime(birth_date, '%Y-%m-%d')
        if isinstance(target_date, str):
            target_date = datetime.strptime(target_date, '%Y-%m-%d')
        
        delta = relativedelta(target_date, birth_date)
        
        return {
            'years': delta.years,
            'months': delta.months,
            'days': delta.days,
            'hours': delta.hours,
            'minutes': delta.minutes,
            'seconds': delta.seconds,
            'total_days': (target_date - birth_date).days,
            'total_hours': int((target_date - birth_date).total_seconds() / 3600),
            'total_minutes': int((target_date - birth_date).total_seconds() / 60),
            'total_seconds': int((target_date - birth_date).total_seconds()),
            'total_weeks': int((target_date - birth_date).days / 7),
            'total_months': delta.years * 12 + delta.months,
            'exact_years': (target_date - birth_date).days / 365.25
        }
    
    @staticmethod
    def get_zodiac_sign(month, day):
        """Calculate zodiac sign based on birth date"""
        zodiac_signs = [
            ("Capricorn", (1, 1), (1, 19)),
            ("Aquarius", (1, 20), (2, 18)),
            ("Pisces", (2, 19), (3, 20)),
            ("Aries", (3, 21), (4, 19)),
            ("Taurus", (4, 20), (5, 20)),
            ("Gemini", (5, 21), (6, 20)),
            ("Cancer", (6, 21), (7, 22)),
            ("Leo", (7, 23), (8, 22)),
            ("Virgo", (8, 23), (9, 22)),
            ("Libra", (9, 23), (10, 22)),
            ("Scorpio", (10, 23), (11, 21)),
            ("Sagittarius", (11, 22), (12, 21)),
            ("Capricorn", (12, 22), (12, 31))
        ]
        
        for sign, start, end in zodiac_signs:
            if (month == start[0] and day >= start[1]) or (month == end[0] and day <= end[1]):
                return sign
    
    @staticmethod
    def get_chinese_zodiac(year):
        """Calculate Chinese zodiac sign based on birth year"""
        zodiac_animals = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", 
                         "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"]
        return zodiac_animals[(year - 1900) % 12]
    
    @staticmethod
    def get_planet_age(birth_date, planet):
        """Calculate age on different planets"""
        planet_orbital_periods = {
            'mercury': 87.97,      # Earth days
            'venus': 224.70,
            'earth': 365.25,
            'mars': 686.98,
            'jupiter': 4332.82,
            'saturn': 10755.70,
            'uranus': 30687.15,
            'neptune': 60190.03,
            'pluto': 90520.00
        }
        
        earth_days = (datetime.now() - birth_date).days
        planet_years = earth_days / planet_orbital_periods.get(planet.lower(), 365.25)
        
        return round(planet_years, 2)
    
    @staticmethod
    def get_next_birthday(birth_date):
        """Calculate days until next birthday"""
        today = date.today()
        next_birthday = date(today.year, birth_date.month, birth_date.day)
        
        if next_birthday < today:
            next_birthday = date(today.year + 1, birth_date.month, birth_date.day)
        
        days_until = (next_birthday - today).days
        return days_until
    
    @staticmethod
    def get_weekday_of_birth(birth_date):
        """Get the day of week when born"""
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        return days[birth_date.weekday()]
    
    @staticmethod
    def get_life_calendar(birth_date, life_expectancy=80):
        """Generate life calendar visualization data"""
        lived_years = (datetime.now() - birth_date).days / 365.25
        weeks_lived = int(lived_years * 52.143)
        total_weeks = life_expectancy * 52.143
        
        return {
            'weeks_lived': weeks_lived,
            'weeks_remaining': int(total_weeks - weeks_lived),
            'percentage_lived': (weeks_lived / total_weeks) * 100,
            'life_expectancy': life_expectancy
        }
    
    @staticmethod
    def get_time_perception_factor(age):
        """Calculate how fast time seems to pass at different ages"""
        if age < 10:
            return 0.3
        elif age < 20:
            return 0.6
        elif age < 30:
            return 0.8
        elif age < 50:
            return 1.2
        elif age < 70:
            return 1.5
        else:
            return 2.0
    
    @staticmethod
    def get_historical_events(birth_year):
        """Get major events around birth year (simplified)"""
        events_db = {
            1990: ["World Wide Web invented", "Hubble Space Telescope launched"],
            2000: ["Y2K bug concern", "Human genome sequenced"],
            2010: ["iPad released", "Instagram launched"],
            2020: ["COVID-19 pandemic", "Mars Perseverance rover launched"]
        }
        
        return events_db.get(birth_year, [f"Born in {birth_year} - a year of change and growth"])