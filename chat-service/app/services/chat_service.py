from app.utils.open_ai_util import init_open_ai

client = init_open_ai()

def chat() -> dict:
    res = client.responses.create(
        model = "gpt-4.1-mini",
        input = "Code tôi 1 đoạn python two sum"
    )

    return {
        "answer": res.output_text,
        "status": 200
    }