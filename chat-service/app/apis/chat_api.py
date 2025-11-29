from fastapi import APIRouter
from fastapi.responses import JSONResponse

chat_router = APIRouter()
import app.services.chat_service as chat_service

@chat_router.post("/chat")
async def chat():
    res = chat_service.chat()
    return JSONResponse(content=res, status_code= res.get("status"))