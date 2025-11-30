import httpx
from openai import OpenAI


def init_open_ai():
    client = httpx.Client(
        verify=False
    )

    client = OpenAI(http_client=client)
    return  client