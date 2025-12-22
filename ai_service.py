# ai_service.py - FIXED VERSION (No SSL issues)
import os
import json
import random
import time
from datetime import datetime
from dotenv import load_dotenv
import warnings

# Suppress SSL warnings
warnings.filterwarnings('ignore')

# Try to load AI library with error handling
AI_LIBRARY_AVAILABLE = False
try:
    import google as genai
    AI_LIBRARY_AVAILABLE = True
    print("Google GenAI library loaded successfully")
except ImportError as e:
    print(f"Google GenAI not installed: {e}")
except Exception as e:
    print(f"Failed to load Google GenAI: {e}")

# Load environment variables
load_dotenv()

class AIService:
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
        self.model_name = os.getenv('WORKING_MODEL', 'gemini-1.5-flash')
        
        # AI is available if library installed AND API key exists
        self.ai_available = AI_LIBRARY_AVAILABLE and bool(self.api_key)
        self.client = None
        self.last_ai_request = None
        self.ai_min_interval = 30  # Increased to 30 seconds between AI requests
        
        # Quota tracking
        self.quota_exceeded = False
        self.quota_reset_time = None
        self.error_count = 0
        
        if self.ai_available:
            try:
                # Configure with simple settings
                genai.configure(api_key=self.api_key)
                self.client = genai
                print(f"AI Service: Configured with model {self.model_name}")
            except Exception as e:
                print(f"Failed to configure AI service: {e}")
                self.ai_available = False
                self.quota_exceeded = True
        else:
            print("AI Service: Running in local mode only")
    
    def generate_quote(self, age_data=None):
        """Generate a quote - smart AI/local mix"""
        # Only try AI 30% of the time to reduce quota usage
        if self.ai_available and not self.quota_exceeded:
            if self.last_ai_request:
                time_since = time.time() - self.last_ai_request
                if time_since < self.ai_min_interval:
                    # Too soon, use local
                    return self._get_local_quote(age_data)
            
            # 30% chance to try AI
            try_ai = random.random() < 0.3
            
            if try_ai:
                ai_quote = self._generate_ai_quote(age_data)
                if ai_quote:
                    return ai_quote
        
        # Use local quote (fallback)
        return self._get_local_quote(age_data)
    
    def _generate_ai_quote(self, age_data=None):
        """Generate AI quote with robust error handling"""
        if not self.client or self.quota_exceeded:
            return None
        
        # Update request time
        self.last_ai_request = time.time()
        
        try:
            # Prepare prompt
            prompt_parts = ["Create a short, meaningful quote about time or aging."]
            
            if age_data:
                years = age_data.get('years', 0)
                days = age_data.get('total_days', 0)
                prompt_parts.append(f"The person is {years} years old ({days:,} days).")
            
            prompt_parts.append("Make it personal, positive, and philosophical. 1 sentence max.")
            prompt_parts.append("Return only the quote text, no JSON, no formatting.")
            
            prompt = " ".join(prompt_parts)
            
            # Generate content
            model = genai.GenerativeModel(self.model_name)
            response = model.generate_content(prompt)
            
            # Extract quote text
            quote_text = response.text.strip()
            
            # Create quote object
            quote_data = {
                'text': quote_text,
                'author': 'AI Wisdom',
                'category': random.choice(['wisdom', 'time', 'life', 'reflection']),
                'source': 'ai',
                'ai_generated': True,
                'model': self.model_name
            }
            
            # Reset error count on success
            self.error_count = 0
            
            return quote_data
            
        except Exception as e:
            error_msg = str(e)
            print(f"AI quote error: {error_msg}")
            
            # Increment error count
            self.error_count += 1
            
            # Check for quota errors
            if "429" in error_msg or "quota" in error_msg.lower() or "exceeded" in error_msg.lower():
                self.quota_exceeded = True
                self.quota_reset_time = time.time() + (24 * 60 * 60)  # 24 hours
            
            # After 5 consecutive errors, disable AI temporarily
            if self.error_count >= 5:
                self.quota_exceeded = True
                print("Too many AI errors, disabling AI temporarily")
            
            return None
    
    def _get_local_quote(self, age_data=None):
        """Get quote from local JSON database"""
        try:
            with open('data/quotes.json', 'r', encoding='utf-8') as f:
                all_quotes = json.load(f)
            
            # If we have age data, try to find age-relevant quotes
            selected_quotes = all_quotes
            
            if age_data:
                years = age_data.get('years', 0)
                
                # Age-based categories
                if years < 20:
                    keywords = ['youth', 'growth', 'future', 'learning', 'dream']
                elif years < 40:
                    keywords = ['experience', 'opportunity', 'journey', 'discovery']
                elif years < 60:
                    keywords = ['wisdom', 'midlife', 'reflection', 'purpose']
                else:
                    keywords = ['wisdom', 'legacy', 'time', 'life', 'memory']
                
                # Filter quotes with relevant keywords
                relevant = []
                for quote in all_quotes:
                    text_lower = quote.get('text', '').lower()
                    category_lower = quote.get('category', '').lower()
                    
                    if any(keyword in text_lower or keyword in category_lower 
                          for keyword in keywords):
                        relevant.append(quote)
                
                # Use relevant quotes if found, otherwise all quotes
                if relevant:
                    selected_quotes = relevant
            
            # Select random quote
            quote = random.choice(selected_quotes)
            
            # Add metadata
            quote['source'] = 'local'
            quote['ai_generated'] = False
            
            return quote
            
        except Exception as e:
            print(f"Error loading local quotes: {e}")
            # Ultimate fallback
            return {
                'text': 'The years teach much which the days never know.',
                'author': 'Ralph Waldo Emerson',
                'category': 'wisdom',
                'source': 'fallback',
                'ai_generated': False
            }
    
    def generate_fun_fact(self, age_data):
        """Generate fun fact - always use local for now"""
        return self._get_local_fact(age_data)
    
    def _get_local_fact(self, age_data):
        """Get local fun fact"""
        try:
            with open('data/fun_facts.json', 'r', encoding='utf-8') as f:
                facts = json.load(f)
            
            fact = random.choice(facts)
            fact['source'] = 'local'
            
            return fact
            
        except Exception as e:
            print(f"Error loading fun facts: {e}")
            # Generate calculated fact based on age
            years = age_data.get('years', 0)
            days = age_data.get('total_days', 0)
            
            facts = [
                {
                    'fact': f'In {years} years, your heart has beaten approximately {days * 100000:,} times!',
                    'icon': '❤️',
                    'source': 'calculated'
                },
                {
                    'fact': f'You have blinked about {days * 15000:,} times in {years} years!',
                    'icon': '👁️',
                    'source': 'calculated'
                },
                {
                    'fact': f'You have lived through {years * 365:,} sunrises and sunsets!',
                    'icon': '🌅',
                    'source': 'calculated'
                }
            ]
            
            return random.choice(facts)
    
    def check_quota_status(self):
        """Check and reset quota if time has passed"""
        if self.quota_exceeded and self.quota_reset_time:
            if time.time() > self.quota_reset_time:
                self.quota_exceeded = False
                self.error_count = 0
                print("AI quota reset, AI available again")

# Create global instance
ai_service = AIService()

# Test the service
if __name__ == "__main__":
    print(f"AI Available: {ai_service.ai_available}")
    print(f"Quota Exceeded: {ai_service.quota_exceeded}")
    
    # Test quote generation
    test_age = {'years': 25, 'total_days': 9125}
    quote = ai_service.generate_quote(test_age)
    print(f"\nGenerated Quote: {quote['text']}")
    print(f"Author: {quote['author']}")
    print(f"Source: {quote['source']}")