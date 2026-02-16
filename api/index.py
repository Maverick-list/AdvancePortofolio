import sys
import os

# Add root directory to sys.path
# On Vercel, the function directory is usually /var/task/api
# We want /var/task to be in the path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

try:
    from backend.server import app
except ImportError as e:
    from fastapi import FastAPI
    app = FastAPI()
    @app.get("/api/health")
    def health():
        return {"status": "error", "message": f"Could not import backend.server: {str(e)}"}

# Vercel's @vercel/python builder looks for 'app' or 'handler'
handler = app
