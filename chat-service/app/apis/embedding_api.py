from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.services.embedding import process_course

embedding_router = APIRouter()

@embedding_router.post("/embeddings-course")
def embedding_course():
    res = process_course()
    return JSONResponse(content=res, status_code=res.get("status").get("code"))