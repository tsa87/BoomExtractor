import google.generativeai as genai
import config

# Test the API key
print(f"API Key: {config.GEMINI_API_KEY[:10]}...")

try:
    genai.configure(api_key=config.GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash-latest')

    response = model.generate_content("What is 2+2?")
    print(f"SUCCESS: {response.text}")

except Exception as e:
    print(f"ERROR: {e}")
    print(f"ERROR TYPE: {type(e)}")
