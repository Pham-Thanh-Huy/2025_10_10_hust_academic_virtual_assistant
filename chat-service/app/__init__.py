"""
    *** 27/11/2025
    *** this package will init application with fast_api
"""
from fastapi import FastAPI

from app.apis import chat_router, embedding_router


def init_fast_api_app():
    app = FastAPI()

    app.include_router(chat_router, prefix="/api/v1")
    app.include_router(embedding_router, prefix="/api/v1")
    return app

app = init_fast_api_app()
