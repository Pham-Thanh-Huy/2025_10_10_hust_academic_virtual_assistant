from chromadb import Client
from chromadb.config import Settings
import os
from pathlib import Path

def init_chroma_db(collection_name):
    # Lấy thư mục gốc của project
    ROOT_DIR = Path(__file__).resolve().parents[3]

    # Thư mục lưu trữ vector DB
    VECTOR_DB_DIR = ROOT_DIR / "vector_db"
    VECTOR_DB_DIR.mkdir(exist_ok=True)

    client = Client(Settings(
        persist_directory=str(VECTOR_DB_DIR),
        is_persistent=True
    ))

    collection = client.get_or_create_collection(name=collection_name)
    return collection, client
