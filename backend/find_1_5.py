import urllib.request
import json
import ssl

GEMINI_API_KEY = "AIzaSyCGkW-IwazOjwRNU5VL2fgs59kTzKkMM4w"
url = f"https://generativelanguage.googleapis.com/v1beta/models?key={GEMINI_API_KEY}"

req = urllib.request.Request(url, headers={'Content-Type': 'application/json'})
context = ssl._create_unverified_context()

try:
    with urllib.request.urlopen(req, context=context) as response:
        result = json.loads(response.read().decode('utf-8'))
        for m in result.get('models', []):
            if "1.5" in m.get('name'):
                print(m.get('name'))
except Exception as e:
    print(f"Error: {e}")
