from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import secrets
from emergentintegrations.llm.openai import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'miryam_portfolio')]

# Emergent LLM Key for AI Agent
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Create the main app
app = FastAPI(title="Miryam Portfolio API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBasic()

# Admin credentials (hardcoded as requested)
ADMIN_USERNAME = "MiryamAbida07"
ADMIN_PASSWORD = "Miryam07_"

# Session storage (in-memory for simplicity)
active_sessions = {}

# ==================== MODELS ====================

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    token: Optional[str] = None
    message: str

class Portfolio(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = "Miryam Abida"
    title: str = "Creative Developer & Designer"
    bio: str = "Passionate about creating beautiful digital experiences that inspire and delight."
    avatar_url: str = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400"
    hero_image: str = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920"
    skills: List[Dict[str, Any]] = []
    experience: List[Dict[str, Any]] = []
    projects: List[Dict[str, Any]] = []
    contact: Dict[str, str] = {}
    sections_order: List[str] = ["hero", "about", "skills", "experience", "projects", "contact"]
    sections_visible: Dict[str, bool] = {}
    theme: str = "light"
    accent_color: str = "#6A00FF"
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Task(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = ""
    deadline: Optional[datetime] = None
    reminder_time: Optional[datetime] = None
    priority: str = "medium"  # low, medium, high
    completed: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    deadline: Optional[str] = None
    reminder_time: Optional[str] = None
    priority: str = "medium"

class AIMemory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # conversation, preference, note
    content: str
    context: Optional[str] = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AIMessage(BaseModel):
    message: str

class Article(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    excerpt: Optional[str] = ""
    cover_image: Optional[str] = ""
    published: bool = False
    likes: int = 0
    comments: List[Dict[str, Any]] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ArticleCreate(BaseModel):
    title: str
    content: str
    excerpt: Optional[str] = ""
    cover_image: Optional[str] = ""

class Comment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    author_name: str
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GalleryPhoto(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    url: str
    caption: Optional[str] = ""
    visible: bool = True
    order: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Notification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    message: str
    type: str = "info"  # info, reminder, ai
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== HELPER FUNCTIONS ====================

def verify_token(token: str) -> bool:
    return token in active_sessions

async def get_current_admin(token: str = Query(...)):
    if not verify_token(token):
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return True

async def init_default_data():
    """Initialize default portfolio data if not exists"""
    portfolio = await db.portfolio.find_one({})
    if not portfolio:
        default_portfolio = Portfolio(
            name="Miryam Abida",
            title="Creative Developer & Designer",
            bio="I'm a passionate developer who loves creating beautiful, functional digital experiences. With expertise in web development, UI/UX design, and creative problem-solving, I bring ideas to life with code and creativity.",
            skills=[
                {"name": "React", "level": 90, "category": "Frontend"},
                {"name": "Python", "level": 85, "category": "Backend"},
                {"name": "UI/UX Design", "level": 88, "category": "Design"},
                {"name": "TypeScript", "level": 82, "category": "Frontend"},
                {"name": "Node.js", "level": 80, "category": "Backend"},
                {"name": "Figma", "level": 85, "category": "Design"},
            ],
            experience=[
                {
                    "id": str(uuid.uuid4()),
                    "title": "Senior Frontend Developer",
                    "company": "Tech Innovators Inc.",
                    "period": "2022 - Present",
                    "description": "Leading frontend development for enterprise applications."
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "UI/UX Designer",
                    "company": "Creative Studio",
                    "period": "2020 - 2022",
                    "description": "Designed user interfaces for mobile and web applications."
                },
            ],
            projects=[
                {
                    "id": str(uuid.uuid4()),
                    "title": "E-Commerce Platform",
                    "description": "A modern shopping experience with AI recommendations.",
                    "image": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600",
                    "tags": ["React", "Node.js", "MongoDB"],
                    "link": "#"
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "Portfolio Dashboard",
                    "description": "Analytics dashboard for creative professionals.",
                    "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
                    "tags": ["Vue.js", "Python", "D3.js"],
                    "link": "#"
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "Social Media App",
                    "description": "Community platform for artists and designers.",
                    "image": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600",
                    "tags": ["React Native", "Firebase"],
                    "link": "#"
                },
            ],
            contact={
                "email": "miryam@example.com",
                "phone": "+1 234 567 890",
                "location": "San Francisco, CA",
                "linkedin": "https://linkedin.com/in/miryam",
                "github": "https://github.com/miryam",
                "twitter": "https://twitter.com/miryam"
            },
            sections_visible={
                "hero": True,
                "about": True,
                "skills": True,
                "experience": True,
                "projects": True,
                "contact": True
            }
        )
        doc = default_portfolio.model_dump()
        doc['updated_at'] = doc['updated_at'].isoformat()
        await db.portfolio.insert_one(doc)
    
    # Initialize gallery with placeholders
    gallery_count = await db.gallery.count_documents({})
    if gallery_count == 0:
        placeholder_photos = [
            {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600", "caption": "Portrait in Nature", "visible": True, "order": 0, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600", "caption": "Creative Workspace", "visible": True, "order": 1, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600", "caption": "Urban Vibes", "visible": True, "order": 2, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600", "caption": "Coffee & Coding", "visible": True, "order": 3, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600", "caption": "Sunset Thoughts", "visible": True, "order": 4, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600", "caption": "Tech Conference", "visible": True, "order": 5, "created_at": datetime.now(timezone.utc).isoformat()},
        ]
        await db.gallery.insert_many(placeholder_photos)

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    if request.username == ADMIN_USERNAME and request.password == ADMIN_PASSWORD:
        token = secrets.token_urlsafe(32)
        active_sessions[token] = {
            "username": request.username,
            "created_at": datetime.now(timezone.utc)
        }
        return LoginResponse(success=True, token=token, message="Login successful")
    raise HTTPException(status_code=401, detail="Invalid credentials")

@api_router.post("/auth/logout")
async def logout(token: str = Query(...)):
    if token in active_sessions:
        del active_sessions[token]
    return {"success": True, "message": "Logged out successfully"}

@api_router.get("/auth/verify")
async def verify_auth(token: str = Query(...)):
    if verify_token(token):
        return {"valid": True, "username": active_sessions[token]["username"]}
    raise HTTPException(status_code=401, detail="Invalid token")

# ==================== PORTFOLIO ROUTES ====================

@api_router.get("/portfolio")
async def get_portfolio():
    await init_default_data()
    portfolio = await db.portfolio.find_one({}, {"_id": 0})
    if portfolio and isinstance(portfolio.get('updated_at'), str):
        portfolio['updated_at'] = datetime.fromisoformat(portfolio['updated_at'])
    return portfolio

@api_router.put("/portfolio")
async def update_portfolio(portfolio_data: dict, _: bool = Depends(get_current_admin)):
    portfolio_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    await db.portfolio.update_one({}, {"$set": portfolio_data}, upsert=True)
    return {"success": True, "message": "Portfolio updated"}

# ==================== TASKS ROUTES ====================

@api_router.get("/tasks", response_model=List[dict])
async def get_tasks(_: bool = Depends(get_current_admin)):
    tasks = await db.tasks.find({}, {"_id": 0}).to_list(1000)
    return tasks

@api_router.post("/tasks")
async def create_task(task: TaskCreate, _: bool = Depends(get_current_admin)):
    task_dict = task.model_dump()
    task_obj = Task(**task_dict)
    doc = task_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    if doc['deadline']:
        doc['deadline'] = doc['deadline'].isoformat() if isinstance(doc['deadline'], datetime) else doc['deadline']
    if doc['reminder_time']:
        doc['reminder_time'] = doc['reminder_time'].isoformat() if isinstance(doc['reminder_time'], datetime) else doc['reminder_time']
    await db.tasks.insert_one(doc)
    return {"success": True, "task": doc}

@api_router.put("/tasks/{task_id}")
async def update_task(task_id: str, task_data: dict, _: bool = Depends(get_current_admin)):
    task_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    await db.tasks.update_one({"id": task_id}, {"$set": task_data})
    return {"success": True, "message": "Task updated"}

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, _: bool = Depends(get_current_admin)):
    await db.tasks.delete_one({"id": task_id})
    return {"success": True, "message": "Task deleted"}

# ==================== AI AGENT ROUTES ====================

@api_router.get("/ai/memory")
async def get_ai_memory(_: bool = Depends(get_current_admin)):
    memories = await db.ai_memory.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return memories

@api_router.post("/ai/memory")
async def save_ai_memory(memory: dict, _: bool = Depends(get_current_admin)):
    memory['id'] = str(uuid.uuid4())
    memory['created_at'] = datetime.now(timezone.utc).isoformat()
    await db.ai_memory.insert_one(memory)
    return {"success": True, "memory": memory}

@api_router.delete("/ai/memory/{memory_id}")
async def delete_ai_memory(memory_id: str, _: bool = Depends(get_current_admin)):
    await db.ai_memory.delete_one({"id": memory_id})
    return {"success": True, "message": "Memory deleted"}

@api_router.delete("/ai/memory")
async def clear_ai_memory(_: bool = Depends(get_current_admin)):
    await db.ai_memory.delete_many({})
    return {"success": True, "message": "All memories cleared"}

@api_router.post("/ai/chat")
async def chat_with_ai(message: AIMessage, _: bool = Depends(get_current_admin)):
    try:
        # Get memories for context
        memories = await db.ai_memory.find({}, {"_id": 0}).sort("created_at", -1).to_list(20)
        memory_context = "\n".join([f"- {m.get('content', '')}" for m in memories])
        
        # Get tasks for context
        tasks = await db.tasks.find({"completed": False}, {"_id": 0}).to_list(10)
        tasks_context = ""
        if tasks:
            tasks_context = "\n\nUpcoming Tasks:\n" + "\n".join([
                f"- {t['title']} (Priority: {t.get('priority', 'medium')}, Deadline: {t.get('deadline', 'No deadline')})"
                for t in tasks
            ])
        
        # Build system prompt
        system_prompt = f"""You are a helpful, friendly, and proactive AI personal assistant for Miryam. You help manage tasks, provide reminders, and offer productivity suggestions. You have a warm, supportive personality and speak in a professional yet friendly manner.

Your memory/context about Miryam:
{memory_context if memory_context else "No previous memories stored yet."}
{tasks_context}

Guidelines:
- Be proactive about reminding about upcoming tasks and deadlines
- Suggest productivity improvements when relevant
- Remember personal preferences and details shared
- Be encouraging and supportive
- Keep responses concise but helpful
- If there are tasks due today or soon, mention them
- You can help with creating new tasks, notes, and reminders"""

        response = openai_client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message.message}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        ai_response = response.choices[0].message.content
        
        # Save this conversation to memory
        await db.ai_memory.insert_one({
            "id": str(uuid.uuid4()),
            "type": "conversation",
            "content": f"User: {message.message}\nAssistant: {ai_response}",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {"response": ai_response, "success": True}
    except Exception as e:
        logging.error(f"AI Chat Error: {str(e)}")
        return {"response": f"I apologize, I'm having trouble connecting right now. Please try again in a moment. Error: {str(e)}", "success": False}

@api_router.get("/ai/suggestions")
async def get_ai_suggestions(_: bool = Depends(get_current_admin)):
    """Get proactive AI suggestions based on tasks and context"""
    try:
        tasks = await db.tasks.find({"completed": False}, {"_id": 0}).to_list(10)
        
        suggestions = []
        now = datetime.now(timezone.utc)
        
        for task in tasks:
            deadline = task.get('deadline')
            if deadline:
                try:
                    deadline_dt = datetime.fromisoformat(deadline.replace('Z', '+00:00')) if isinstance(deadline, str) else deadline
                    if deadline_dt <= now + timedelta(days=1):
                        suggestions.append({
                            "type": "urgent",
                            "message": f"⚠️ Task '{task['title']}' is due soon!",
                            "task_id": task['id']
                        })
                    elif deadline_dt <= now + timedelta(days=3):
                        suggestions.append({
                            "type": "reminder",
                            "message": f"📅 Don't forget: '{task['title']}' is coming up.",
                            "task_id": task['id']
                        })
                except:
                    pass
        
        if len(tasks) > 5:
            suggestions.append({
                "type": "productivity",
                "message": "💡 You have quite a few tasks. Consider prioritizing the top 3 to focus on today."
            })
        
        if not tasks:
            suggestions.append({
                "type": "encouragement",
                "message": "✨ All caught up! Great job staying on top of things."
            })
        
        return {"suggestions": suggestions}
    except Exception as e:
        return {"suggestions": [], "error": str(e)}

# ==================== ARTICLES ROUTES ====================

@api_router.get("/articles")
async def get_articles(published_only: bool = False):
    query = {"published": True} if published_only else {}
    articles = await db.articles.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return articles

@api_router.get("/articles/{article_id}")
async def get_article(article_id: str):
    article = await db.articles.find_one({"id": article_id}, {"_id": 0})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article

@api_router.post("/articles")
async def create_article(article: ArticleCreate, _: bool = Depends(get_current_admin)):
    article_dict = article.model_dump()
    article_obj = Article(**article_dict)
    doc = article_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.articles.insert_one(doc)
    return {"success": True, "article": doc}

@api_router.put("/articles/{article_id}")
async def update_article(article_id: str, article_data: dict, _: bool = Depends(get_current_admin)):
    article_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    await db.articles.update_one({"id": article_id}, {"$set": article_data})
    return {"success": True, "message": "Article updated"}

@api_router.delete("/articles/{article_id}")
async def delete_article(article_id: str, _: bool = Depends(get_current_admin)):
    await db.articles.delete_one({"id": article_id})
    return {"success": True, "message": "Article deleted"}

@api_router.post("/articles/{article_id}/like")
async def like_article(article_id: str):
    await db.articles.update_one({"id": article_id}, {"$inc": {"likes": 1}})
    return {"success": True}

@api_router.post("/articles/{article_id}/comment")
async def add_comment(article_id: str, comment: Comment):
    comment_dict = comment.model_dump()
    comment_dict['created_at'] = comment_dict['created_at'].isoformat()
    await db.articles.update_one(
        {"id": article_id},
        {"$push": {"comments": comment_dict}}
    )
    return {"success": True, "comment": comment_dict}

# ==================== GALLERY ROUTES ====================

@api_router.get("/gallery")
async def get_gallery(visible_only: bool = False):
    await init_default_data()
    query = {"visible": True} if visible_only else {}
    photos = await db.gallery.find(query, {"_id": 0}).sort("order", 1).to_list(100)
    return photos

@api_router.put("/gallery/{photo_id}")
async def update_photo(photo_id: str, photo_data: dict, _: bool = Depends(get_current_admin)):
    await db.gallery.update_one({"id": photo_id}, {"$set": photo_data})
    return {"success": True, "message": "Photo updated"}

@api_router.put("/gallery/reorder")
async def reorder_gallery(order_data: dict, _: bool = Depends(get_current_admin)):
    for photo_id, new_order in order_data.get('order', {}).items():
        await db.gallery.update_one({"id": photo_id}, {"$set": {"order": new_order}})
    return {"success": True, "message": "Gallery reordered"}

@api_router.delete("/gallery/{photo_id}")
async def delete_photo(photo_id: str, _: bool = Depends(get_current_admin)):
    await db.gallery.delete_one({"id": photo_id})
    return {"success": True, "message": "Photo deleted"}

# ==================== NOTIFICATIONS ROUTES ====================

@api_router.get("/notifications")
async def get_notifications(_: bool = Depends(get_current_admin)):
    notifications = await db.notifications.find({}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return notifications

@api_router.post("/notifications")
async def create_notification(notification: dict, _: bool = Depends(get_current_admin)):
    notification['id'] = str(uuid.uuid4())
    notification['created_at'] = datetime.now(timezone.utc).isoformat()
    notification['read'] = False
    await db.notifications.insert_one(notification)
    return {"success": True, "notification": notification}

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, _: bool = Depends(get_current_admin)):
    await db.notifications.update_one({"id": notification_id}, {"$set": {"read": True}})
    return {"success": True}

@api_router.delete("/notifications/{notification_id}")
async def delete_notification(notification_id: str, _: bool = Depends(get_current_admin)):
    await db.notifications.delete_one({"id": notification_id})
    return {"success": True}

# ==================== STATS ROUTES ====================

@api_router.get("/stats")
async def get_stats(_: bool = Depends(get_current_admin)):
    tasks_count = await db.tasks.count_documents({})
    completed_tasks = await db.tasks.count_documents({"completed": True})
    articles_count = await db.articles.count_documents({})
    published_articles = await db.articles.count_documents({"published": True})
    gallery_count = await db.gallery.count_documents({})
    memories_count = await db.ai_memory.count_documents({})
    
    return {
        "tasks": {"total": tasks_count, "completed": completed_tasks},
        "articles": {"total": articles_count, "published": published_articles},
        "gallery": {"total": gallery_count},
        "ai_memories": {"total": memories_count}
    }

# ==================== ROOT ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "Miryam Portfolio API", "version": "1.0.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await init_default_data()
    logger.info("Default data initialized")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
