from dotenv import load_dotenv
import os
import json

# Load environment variables from .env file.
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
GEMINI_MODEL_NAME = os.getenv("GEMINI_MODEL_NAME")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")