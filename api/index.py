import sys
import os

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from backend.server import app
except Exception as e:
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    import traceback
    app = FastAPI()
    
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def catch_all(path: str):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        parent_dir = os.path.dirname(current_dir)
        files_in_root = os.listdir(parent_dir) if os.path.exists(parent_dir) else []
        return JSONResponse(
            status_code=500,
            content={
                "error": f"Startup error: {str(e)}",
                "traceback": traceback.format_exc(),
                "path": path,
                "debug": {
                    "current_dir": current_dir,
                    "parent_dir": parent_dir,
                    "root_files": files_in_root,
                    "sys_path": sys.path
                }
            }
        )

# This is necessary for Vercel to find the app instance
handler = app
