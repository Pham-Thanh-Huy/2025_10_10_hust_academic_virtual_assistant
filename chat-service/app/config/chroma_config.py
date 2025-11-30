from chromadb import Client
from chromadb.config import Settings
import os

def init_chroma_db(collection_name):
    project_dir = os.path.dirname(os.path.abspath(__file__))
    db_dir = os.path.join(project_dir, "chroma_db")
    os.makedirs(db_dir, exist_ok=True)

    client = Client(Settings(
        persist_directory=db_dir,
        is_persistent=True
    ))

    collection = client.get_or_create_collection(name=collection_name)
    return collection, client
