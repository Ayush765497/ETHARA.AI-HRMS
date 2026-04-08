import os
from dotenv import load_dotenv
from sqlalchemy.pool import NullPool

load_dotenv()

# Use SQLite by default so the app runs without PostgreSQL
_default_db = 'sqlite:///hrms.db'

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'nextai-secret-key-dev')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', _default_db)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
    "connect_args": {
        "check_same_thread": False,
        "timeout": 30
    },
    "poolclass": NullPool   # 🔥 VERY IMPORTANT
}
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'nextai-jwt-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 hours
    REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
    CLOUDINARY_CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME', '')
    CLOUDINARY_API_KEY = os.environ.get('CLOUDINARY_API_KEY', '')
    CLOUDINARY_API_SECRET = os.environ.get('CLOUDINARY_API_SECRET', '')
    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    CORS_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']
