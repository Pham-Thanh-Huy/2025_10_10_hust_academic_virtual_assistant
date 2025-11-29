from app.utils.open_ai_util import init_open_ai

client = init_open_ai()

"""
    28/11/2025
    GET course in db, check exist, embedding and save vector db!
"""
def embedding_course():
    client.embeddings.create(
        model= "text-embedding-ada-002",
        input = "Kìa màn đêm hiu hắt mang tên em"
    )