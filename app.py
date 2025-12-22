from flask import Flask, render_template, request, jsonify, send_from_directory
from datetime import datetime, date
from dateutil.relativedelta import relativedelta
import json
import os
import random
import re
import requests
from dotenv import load_dotenv
from ai_service import ai_service
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Load environment variables
load_dotenv()
# Get Grok API key
GROK_API_KEY = os.getenv('GROK_API_KEY')
GROK_API_URL = "https://api.x.ai/v1/chat/completions"

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secure-secret-key-change-in-production')

# ============================
# RATE LIMITING CONFIGURATION
# ============================
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
    strategy="fixed-window",
    headers_enabled=True,
    on_breach=lambda request_limit: jsonify({
        'error': 'Rate limit exceeded',
        'message': f'Please try again later. Limit: {request_limit.limit}'
    })
)

# ============================
# SECURITY HELPER FUNCTIONS
# ============================
def sanitize_input(text, max_length=100):
    """Sanitize input to prevent XSS and injection attacks"""
    if not text or not isinstance(text, str):
        return ""
    
    # Remove HTML tags
    text = re.sub(r'<[^>]*>', '', text)
    
    # Remove dangerous characters
    text = re.sub(r'[<>\"\';()&|$`]', '', text)
    
    # Limit length
    if len(text) > max_length:
        text = text[:max_length]
    
    return text.strip()

def validate_date_string(date_str, allow_empty=False):
    """Validate date string format and range"""
    if not date_str:
        return allow_empty, None
    
    # Check format
    if not re.match(r'^\d{4}-\d{2}-\d{2}$', date_str):
        return False, "Date must be in YYYY-MM-DD format"
    
    try:
        # Parse date
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        
        # Validate range (1900-2100)
        if date_obj.year < 1900:
            return False, "Date cannot be before 1900"
        if date_obj.year > 2100:
            return False, "Date cannot be after 2100"
        
        # Validate actual date (e.g., not 2023-02-30)
        if date_obj.month < 1 or date_obj.month > 12:
            return False, "Invalid month"
        if date_obj.day < 1 or date_obj.day > 31:
            return False, "Invalid day"
        
        # Check for valid day in month
        last_day_of_month = (date_obj.replace(month=date_obj.month % 12 + 1, day=1) - 
                           relativedelta(days=1)).day
        if date_obj.day > last_day_of_month:
            return False, f"Invalid date: {date_str}"
        
        return True, date_obj
    except ValueError as e:
        return False, f"Invalid date: {str(e)}"
    except Exception as e:
        return False, "Invalid date format"

def validate_age_calculation(birth_date, target_date):
    """Validate age calculation parameters"""
    # Check if dates are valid
    if not isinstance(birth_date, datetime) or not isinstance(target_date, datetime):
        return False, "Invalid date objects"
    
    # Birth date cannot be in the future
    if birth_date > datetime.now():
        return False, "Birth date cannot be in the future"
    
    # Birth date cannot be after target date
    if birth_date > target_date:
        return False, "Birth date cannot be after target date"
    
    # Calculate age in years
    age_delta = target_date - birth_date
    age_in_years = age_delta.days / 365.25
    
    # Validate age range
    if age_in_years < 0:
        return False, "Negative age calculated"
    if age_in_years > 150:
        return False, "Age exceeds 150 years"
    
    return True, None

# ============================
# DATA LOADING FUNCTIONS
# ============================
def load_json_data(filename):
    """Safely load JSON data"""
    try:
        filepath = os.path.join('data', filename)
        if not os.path.exists(filepath):
            return []
        
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        # Validate loaded data structure
        if not isinstance(data, list):
            return []
            
        return data
    except (json.JSONDecodeError, IOError, PermissionError) as e:
        print(f"Error loading {filename}: {str(e)}")
        return []
    except Exception as e:
        print(f"Unexpected error loading {filename}: {str(e)}")
        return []

quotes_data = load_json_data('quotes.json')
fun_facts_data = load_json_data('fun_facts.json')

# ============================
# HELPER FUNCTIONS
# ============================
def calculate_age(birth_date, target_date=None):
    """Calculate precise age with validation"""
    if not target_date:
        target_date = datetime.now()
    
    # Ensure we're working with datetime objects
    if isinstance(birth_date, str):
        try:
            birth_date = datetime.strptime(birth_date, '%Y-%m-%d')
        except ValueError:
            raise ValueError("Invalid birth date format")
    
    if isinstance(target_date, str):
        try:
            target_date = datetime.strptime(target_date, '%Y-%m-%d')
        except ValueError:
            raise ValueError("Invalid target date format")
    
    # Validate before calculation
    is_valid, error_msg = validate_age_calculation(birth_date, target_date)
    if not is_valid:
        raise ValueError(error_msg)
    
    delta = relativedelta(target_date, birth_date)
    
    total_days = (target_date - birth_date).days
    total_seconds = int((target_date - birth_date).total_seconds())
    
    # Add bounds checking
    if total_days < 0 or total_days > 365.25 * 200:  # 200 years max
        raise ValueError("Invalid age range")
    
    return {
        'years': delta.years,
        'months': delta.months,
        'days': delta.days,
        'hours': delta.hours,
        'minutes': delta.minutes,
        'seconds': delta.seconds,
        'total_days': total_days,
        'total_hours': int(total_seconds / 3600),
        'total_minutes': int(total_seconds / 60),
        'total_seconds': total_seconds,
        'total_weeks': int(total_days / 7),
        'total_months': delta.years * 12 + delta.months,
        'exact_years': total_days / 365.25
    }

def get_zodiac_sign(month, day):
    """Calculate zodiac sign"""
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
    return "Unknown"

def get_chinese_zodiac(year):
    """Calculate Chinese zodiac"""
    if year < 1900 or year > 2100:
        return "Unknown"
    
    zodiac_animals = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", 
                     "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"]
    return zodiac_animals[(year - 1900) % 12]

def get_planet_age(birth_date, planet):
    """Calculate age on different planets"""
    planet_orbital_periods = {
        'mercury': 87.97,
        'venus': 224.70,
        'earth': 365.25,
        'mars': 686.98,
        'jupiter': 4332.82,
        'saturn': 10755.70,
        'uranus': 30687.15,
        'neptune': 60190.03,
        'pluto': 90520.00
    }
    
    if planet.lower() not in planet_orbital_periods:
        return 0
    
    earth_days = (datetime.now() - birth_date).days
    if earth_days <= 0 or earth_days > 365.25 * 200:
        return 0
    
    planet_years = earth_days / planet_orbital_periods.get(planet.lower(), 365.25)
    
    return round(planet_years, 2)

def get_next_birthday(birth_date):
    """Calculate days until next birthday"""
    today = date.today()
    
    # Validate birth_date
    if not isinstance(birth_date, (datetime, date)):
        return 0
    
    try:
        next_birthday = date(today.year, birth_date.month, birth_date.day)
        
        if next_birthday < today:
            next_birthday = date(today.year + 1, birth_date.month, birth_date.day)
        
        days_until = (next_birthday - today).days
        return max(0, min(days_until, 365))  # Cap at 365 days
    except ValueError:
        return 0

def get_weekday_of_birth(birth_date):
    """Get weekday when born"""
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    
    if not isinstance(birth_date, (datetime, date)):
        return "Unknown"
    
    try:
        return days[birth_date.weekday()]
    except:
        return "Unknown"

def get_time_perception_factor(age):
    """Calculate time perception factor"""
    if not isinstance(age, (int, float)) or age < 0 or age > 150:
        return 1.0
    
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

# ============================
# ROUTES WITH RATE LIMITING
# ============================
@app.route('/')
def index():
    """Main page - no rate limiting needed"""
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
@limiter.limit("15 per minute")  # 15 requests per minute per IP
def calculate_age_endpoint():
    """Calculate age endpoint with rate limiting"""
    try:
        # Get and validate JSON data
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
        
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return jsonify({'error': 'Invalid JSON data'}), 400
        
        # Sanitize inputs
        birth_date_str = sanitize_input(data.get('birth_date', ''), max_length=20)
        target_date_str = sanitize_input(data.get('target_date', ''), max_length=20)
        
        # Validate birth date
        if not birth_date_str:
            return jsonify({'error': 'Birth date is required'}), 400
        
        is_valid_birth, birth_date_or_error = validate_date_string(birth_date_str)
        if not is_valid_birth:
            return jsonify({'error': birth_date_or_error}), 400
        
        birth_date = birth_date_or_error
        
        # Validate target date
        if target_date_str:
            is_valid_target, target_date_or_error = validate_date_string(target_date_str)
            if not is_valid_target:
                return jsonify({'error': target_date_or_error}), 400
            target_date = target_date_or_error
        else:
            target_date = datetime.now()
        
        # Additional validation
        if birth_date > datetime.now():
            return jsonify({'error': 'Birth date cannot be in the future'}), 400
        
        if birth_date > target_date:
            return jsonify({'error': 'Birth date cannot be after target date'}), 400
        
        # Calculate age with error handling
        try:
            age_data = calculate_age(birth_date, target_date)
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        
        # Validate calculated age
        age_in_years = age_data['exact_years']
        if age_in_years < 0 or age_in_years > 150:
            return jsonify({'error': 'Invalid age calculated'}), 400
        
        # Additional calculations
        zodiac = get_zodiac_sign(birth_date.month, birth_date.day)
        chinese_zodiac = get_chinese_zodiac(birth_date.year)
        next_birthday = get_next_birthday(birth_date)
        weekday_born = get_weekday_of_birth(birth_date)
        
        # Calculate planetary ages
        planets = ['mercury', 'venus', 'mars', 'jupiter', 'saturn']
        planetary_ages = {}
        for planet in planets:
            planetary_ages[planet] = get_planet_age(birth_date, planet)
        
        # Life calendar with validation
        life_expectancy = 80
        weeks_lived = int(age_data['exact_years'] * 52.143)
        total_weeks = life_expectancy * 52.143
        
        if weeks_lived < 0 or weeks_lived > total_weeks:
            weeks_lived = 0
            total_weeks = 0
        
        weeks_remaining = max(0, int(total_weeks - weeks_lived))
        percentage_lived = min(100, max(0, (weeks_lived / total_weeks * 100) if total_weeks > 0 else 0))
        
        # Time perception
        time_perception = get_time_perception_factor(age_data['years'])
        
        # Get random quote safely
        random_quote = random.choice(quotes_data) if quotes_data else {
            'text': 'The years teach much which the days never know.',
            'author': 'Ralph Waldo Emerson'
        }
        
        # Get fun fact safely
        random_fact = random.choice(fun_facts_data) if fun_facts_data else {
            'fact': 'Your heart beats about 100,000 times per day!',
            'icon': '❤️'
        }
        
        # Build response with sanitized data
        response = {
            'success': True,
            'age_data': age_data,
            'zodiac_sign': zodiac,
            'chinese_zodiac': chinese_zodiac,
            'next_birthday': next_birthday,
            'weekday_born': weekday_born,
            'planetary_ages': planetary_ages,
            'life_calendar': {
                'weeks_lived': weeks_lived,
                'weeks_remaining': weeks_remaining,
                'percentage_lived': round(percentage_lived, 1),
                'life_expectancy': life_expectancy
            },
            'time_perception': time_perception,
            'quote': random_quote,
            'fun_fact': random_fact,
            'birth_date_formatted': birth_date.strftime('%B %d, %Y'),
            'target_date_formatted': target_date.strftime('%B %d, %Y')
        }
        
        return jsonify(response)
        
    except Exception as e:
        # Log the error but don't expose details to user
        print(f"Error in calculate endpoint: {str(e)}")
        return jsonify({'error': 'An error occurred while processing your request'}), 500

@app.route('/api/quotes/random')
@limiter.limit("30 per minute")
def random_quote():
    """Get random quote - try AI first, then fallback"""
    try:
        # Try AI first if available
        if hasattr(ai_service, 'ai_available') and ai_service.ai_available and not getattr(ai_service, 'quota_exceeded', False):
            try:
                ai_quote = ai_service.generate_quote()
                if ai_quote and isinstance(ai_quote, dict):
                    # Sanitize AI quote
                    if 'text' in ai_quote:
                        ai_quote['text'] = sanitize_input(ai_quote['text'], max_length=500)
                    if 'author' in ai_quote:
                        ai_quote['author'] = sanitize_input(ai_quote['author'], max_length=100)
                    return jsonify(ai_quote)
            except Exception as e:
                print(f"AI quote failed, using fallback: {e}")
        
        # Fallback to local quote
        quote = random.choice(quotes_data) if quotes_data else {
            'text': 'The years teach much which the days never know.',
            'author': 'Ralph Waldo Emerson',
            'category': 'wisdom',
            'source': 'fallback'
        }
        
        return jsonify(quote)
        
    except Exception as e:
        print(f"Error in random_quote: {str(e)}")
        return jsonify({
            'text': 'The years teach much which the days never know.',
            'author': 'Ralph Waldo Emerson',
            'category': 'fallback',
            'source': 'error'
        })

@app.route('/api/quotes/ai', methods=['POST'])
@limiter.limit("5 per minute")  # Strict limit for AI calls
def generate_ai_quote():
    """Generate AI quote with age context"""
    try:
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
        
        data = request.get_json() or {}
        age_data = data.get('age_data')
        
        # Validate age_data structure if provided
        if age_data and isinstance(age_data, dict):
            # Sanitize age_data values
            sanitized_age_data = {}
            for key, value in age_data.items():
                if isinstance(value, (str, int, float)):
                    if isinstance(value, str):
                        sanitized_age_data[key] = sanitize_input(str(value), max_length=50)
                    else:
                        sanitized_age_data[key] = value
        
        if hasattr(ai_service, 'available') and ai_service.available:
            quote = ai_service.generate_quote(age_data)
            if quote and isinstance(quote, dict):
                return jsonify({
                    'success': True,
                    'quote': quote,
                    'source': 'ai'
                })
        
        # Fallback
        quote = random.choice(quotes_data) if quotes_data else {
            'text': 'The years teach much which the days never know.',
            'author': 'Ralph Waldo Emerson',
            'category': 'wisdom'
        }
        return jsonify({
            'success': True,
            'quote': quote,
            'source': 'fallback'
        })
        
    except Exception as e:
        print(f"Error in generate_ai_quote: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to generate quote'
        }), 400

@app.route('/api/facts/random')
@limiter.limit("30 per minute")
def random_fact():
    """Get random fun fact"""
    try:
        fact = random.choice(fun_facts_data) if fun_facts_data else {
            'fact': 'Your heart beats about 100,000 times per day!',
            'icon': '❤️'
        }
        
        # Sanitize fact
        if isinstance(fact, dict) and 'fact' in fact:
            fact['fact'] = sanitize_input(fact['fact'], max_length=500)
        
        return jsonify(fact)
    except Exception as e:
        print(f"Error in random_fact: {str(e)}")
        return jsonify({
            'fact': 'Your heart beats about 100,000 times per day!',
            'icon': '❤️'
        })

@app.route('/compare', methods=['POST'])
@limiter.limit("10 per minute")
def compare_ages():
    """Compare multiple ages"""
    try:
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
        
        data = request.get_json()
        persons = data.get('persons', [])
        
        if not isinstance(persons, list) or len(persons) > 10:  # Limit to 10 persons
            return jsonify({'error': 'Invalid persons data or too many persons'}), 400
        
        results = []
        for person in persons:
            if not isinstance(person, dict):
                continue
            
            # Sanitize inputs
            name = sanitize_input(person.get('name', 'Person'), max_length=50)
            birth_date_str = sanitize_input(person.get('birth_date', ''), max_length=20)
            
            if not birth_date_str:
                continue
            
            # Validate date
            is_valid, birth_date_or_error = validate_date_string(birth_date_str)
            if not is_valid:
                continue
            
            birth_date = birth_date_or_error
            
            # Calculate age
            try:
                age_data = calculate_age(birth_date)
            except:
                continue
            
            zodiac = get_zodiac_sign(birth_date.month, birth_date.day)
            
            results.append({
                'name': name,
                'age_data': age_data,
                'zodiac': zodiac,
                'birth_year': birth_date.year
            })
        
        if not results:
            return jsonify({'error': 'No valid persons to compare'}), 400
        
        return jsonify({'success': True, 'comparison': results})
        
    except Exception as e:
        print(f"Error in compare_ages: {str(e)}")
        return jsonify({'error': 'Failed to compare ages'}), 400

@app.route('/milestones', methods=['POST'])
@limiter.limit("10 per minute")
def calculate_milestones():
    """Calculate life milestones"""
    try:
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
        
        data = request.get_json()
        birth_date_str = sanitize_input(data.get('birth_date', ''), max_length=20)
        
        if not birth_date_str:
            return jsonify({'error': 'Birth date is required'}), 400
        
        # Validate date
        is_valid, birth_date_or_error = validate_date_string(birth_date_str)
        if not is_valid:
            return jsonify({'error': birth_date_or_error}), 400
        
        birth_date = birth_date_or_error
        today = datetime.now()
        
        # Validate birth date is not in future
        if birth_date > today:
            return jsonify({'error': 'Birth date cannot be in the future'}), 400
        
        milestones = [
            {'name': 'First Birthday', 'date': birth_date.replace(year=birth_date.year + 1)},
            {'name': '5 Years Old', 'date': birth_date.replace(year=birth_date.year + 5)},
            {'name': '10 Years Old', 'date': birth_date.replace(year=birth_date.year + 10)},
            {'name': '13 Years Old (Teenager)', 'date': birth_date.replace(year=birth_date.year + 13)},
            {'name': '16 Years Old', 'date': birth_date.replace(year=birth_date.year + 16)},
            {'name': '18 Years Old (Adult)', 'date': birth_date.replace(year=birth_date.year + 18)},
            {'name': '21 Years Old', 'date': birth_date.replace(year=birth_date.year + 21)},
            {'name': '25 Years Old (Quarter Life)', 'date': birth_date.replace(year=birth_date.year + 25)},
            {'name': '30 Years Old', 'date': birth_date.replace(year=birth_date.year + 30)},
            {'name': '40 Years Old', 'date': birth_date.replace(year=birth_date.year + 40)},
            {'name': '50 Years Old', 'date': birth_date.replace(year=birth_date.year + 50)},
            {'name': '65 Years Old (Retirement)', 'date': birth_date.replace(year=birth_date.year + 65)},
            {'name': '100 Years Old (Centenarian)', 'date': birth_date.replace(year=birth_date.year + 100)},
            {'name': '110 Years Old (Supercentenarian)', 'date': birth_date.replace(year=birth_date.year + 110)},
            {'name': '116 Years Old (Oldest Man)', 'date': birth_date.replace(year=birth_date.year + 116)},
            {'name': '118 Years Old (As of 2025)', 'date': birth_date.replace(year=birth_date.year + 118)},
            {'name': '120 Years Old (Near record)', 'date': birth_date.replace(year=birth_date.year + 120)},
            {'name': '122 Years Old (World Record)', 'date': birth_date.replace(year=birth_date.year + 122)},
            {'name': '150 Years Old (Theoretical Max)', 'date': birth_date.replace(year=birth_date.year + 150)},
        ]
        
        valid_milestones = []
        for milestone in milestones:
            milestone_date = milestone['date']
            
            # Validate milestone date
            if milestone_date.year > 2200:  # Reasonable upper limit
                continue
            
            if milestone_date < today:
                milestone['status'] = 'passed'
                milestone['days_ago'] = (today - milestone_date).days
            else:
                milestone['status'] = 'upcoming'
                milestone['days_until'] = (milestone_date - today).days
            
            milestone['date_formatted'] = milestone_date.strftime('%B %d, %Y')
            valid_milestones.append(milestone)
        
        return jsonify({'success': True, 'milestones': valid_milestones})
        
    except Exception as e:
        print(f"Error in calculate_milestones: {str(e)}")
        return jsonify({'error': 'Failed to calculate milestones'}), 400

# ============================
# STATIC FILE SERVING (No rate limiting needed)
# ============================
@app.route('/static/<path:path>')
def serve_static(path):
    """Serve static files with security headers"""
    response = send_from_directory('static', path)
    
    # Add security headers
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    
    # Cache static files (1 hour)
    if path.endswith(('.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.ico')):
        response.headers['Cache-Control'] = 'public, max-age=3600'
    
    return response

@app.route('/robots.txt')
def robots():
    """Serve robots.txt"""
    return send_from_directory('.', 'robots.txt')

@app.route('/sitemap.xml')
def sitemap():
    """Serve sitemap.xml"""
    return send_from_directory('.', 'sitemap.xml')

# ============================
# ERROR HANDLERS
# ============================
@app.errorhandler(404)
def not_found_error(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(405)
def method_not_allowed_error(error):
    """Handle 405 errors"""
    return jsonify({'error': 'Method not allowed'}), 405

@app.errorhandler(429)
def ratelimit_handler(e):
    """Handle rate limit exceeded"""
    return jsonify({
        'error': 'Rate limit exceeded',
        'message': 'Too many requests. Please try again later.'
    }), 429

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    print(f"Internal server error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/errors', methods=['POST'])
def log_error():
    try:
        error_data = request.json
        # Log to file or monitoring service
        print(f"CLIENT ERROR: {error_data}")
        return jsonify({'success': True})
    except:
        return jsonify({'success': False}), 500

# ============================
# APPLICATION START
# ==========================

if __name__ == "__main__":
    # Apply production-only security settings
    if os.getenv("FLASK_ENV") == "production":
        app.config.update(
            SESSION_COOKIE_SECURE=True,
            SESSION_COOKIE_HTTPONLY=True,
            SESSION_COOKIE_SAMESITE="Lax",
            PERMANENT_SESSION_LIFETIME=3600,
            MAX_CONTENT_LENGTH=16 * 1024 * 1024,  # 16MB
        )

    app.run(
        debug=os.getenv("FLASK_DEBUG", "false").lower() == "true",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5000)),
    )




