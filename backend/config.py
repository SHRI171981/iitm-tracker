from dotenv import load_dotenv
import os
import json

# Load environment variables from .env file.
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
GEMINI_MODEL_NAME = os.getenv("GEMINI_MODEL_NAME")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
IITM_WEBSITE_URL = os.getenv("IITM_WEBSITE_URL")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
YOUTUBE_PLAYLIST_ITEMS_URL = os.getenv("YOUTUBE_PLAYLIST_ITEMS_URL")
YOUTUBE_VIDEOS_URL = os.getenv("YOUTUBE_VIDEOS_URL")


LEVEL_LIST = [
    "Foundation",
    "Diploma in Data Science",
    "Diploma in Programming",
    "Degree"
]

# Mapping for course levels to schema naming
COURSE_LEVEL_MAPPING = {
    "foundational": "Foundation",
    "programming": "Diploma in Programming",
    "data science": "Diploma in Data Science",
    "core option i": "Degree",
    "core option ii": "Degree",
    "mandatory": "Degree",
    "elective": "Degree"
}
