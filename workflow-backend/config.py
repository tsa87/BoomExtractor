import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = "AIzaSyCCv6Gl6XbRFEQk3P39JgdhD3UqyTjM4I4"
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", "52428800"))  # 50MB
ALLOWED_EXTENSIONS = os.getenv("ALLOWED_EXTENSIONS", "pdf").split(",")

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
