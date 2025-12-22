import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'age-master-secret-key-2024'
    SESSION_PERMANENT = True
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max upload
    
    # API Keys (if needed later)
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
    
    # App settings
    APP_NAME = "AgeMaster"
    VERSION = "2.0.0"
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'