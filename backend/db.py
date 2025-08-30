# db.py

from pymongo import MongoClient
from config import Config

class DB:
    def __init__(self):
        try:
            self.client = MongoClient(Config.MONGO_URI)
            self.db = self.client[Config.DATABASE_NAME]
            print("Successfully connected to MongoDB!")
        except Exception as e:
            print(f"Failed to connect to MongoDB: {e}")
            self.client = None
            self.db = None

db_connection = DB()