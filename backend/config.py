# config.py

import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'A_REALLY_SECRET_AND_HARD_TO_GUESS_KEY'
    MONGO_URI = 'mongodb://localhost:27017/'
    DATABASE_NAME = 'AttendanceDB'