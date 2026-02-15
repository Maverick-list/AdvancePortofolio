import urllib.request
import json
import ssl

GEMINI_API_KEY = "AIzaSyCGkW-IwazOjwRNU5VL2fgs59kTzKkMM4w"
url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"

payload = {
    "contents": [
        {
            "role": "user",
            "parts": [{"text": "Hello, who are you?"}]
        }
    ]
}

req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
context = ssl._create_unverified_context()

try:
    with urllib.request.urlopen(req, context=context) as response:
        result = json.loads(response.read().decode('utf-8'))
        print(json.dumps(result, indent=2))
except Exception as e:
    print(f"Error: {e}")
    if hasattr(e, 'read'):
        print(e.read().decode('utf-8'))
