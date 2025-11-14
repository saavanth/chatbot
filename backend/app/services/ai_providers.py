import asyncio
import os
import google.generativeai as genai
from anthropic import Anthropic
import subprocess
import aiohttp
import json

# ---------------------------
# Configure Providers
# ---------------------------

# Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
GEMINI_MODELS = {
    "Gemini Flash": "models/gemini-1.5-flash",
    "Gemini Pro": "models/gemini-1.5-pro",
}

# Anthropic (Claude)
anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# ---------------------------
# OpenAI Placeholder
# ---------------------------
async def openai_stream(prompt: str):
    tokens = ["Hello", " ", "from OpenAI!"]
    for token in tokens:
        yield token
        await asyncio.sleep(0.2)

# ---------------------------
# Claude Placeholder
# ---------------------------
async def anthropic_stream(prompt: str, model: str = "claude-3-sonnet-20240229"):
    try:
        with anthropic_client.messages.stream(
            model=model,
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}]
        ) as stream:
            for event in stream:
                if event.type == "content_block_delta":
                    yield event.delta["text"]
    except Exception as e:
        yield f"[ERROR: {str(e)}]"

# ---------------------------
# Gemini Stream
# ---------------------------
async def gemini_stream(prompt: str, model: str = "Gemini Flash"):
    model_name = GEMINI_MODELS.get(model, "models/gemini-1.5-flash")
    gemini_model = genai.GenerativeModel(model_name)

    response = gemini_model.generate_content(prompt, stream=True)

    for chunk in response:
        if chunk.text:
            for token in chunk.text.split(" "):
                yield token + " "
                await asyncio.sleep(0.05)
# ---------------------------
# Ollama Local Stream (Updated)
# ---------------------------

async def ollama_stream(prompt: str, model: str = "llama3"):
    url = "http://localhost:11434/api/generate"
    payload = {"model": model, "prompt": prompt, "stream": True}

    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload) as resp:
            if resp.status != 200:
                yield f"[ERROR: Ollama returned {resp.status}]"
                return

            async for line in resp.content:
                if not line:
                    continue

                try:
                    data = line.decode("utf-8").strip()
                    if not data:
                        continue

                    chunk = json.loads(data)

                    # ✅ stream the token
                    if "response" in chunk:
                        yield chunk["response"]

                    # ✅ stop when Ollama says done
                    if chunk.get("done", False):
                        break

                except Exception as e:
                    yield f"[ERROR parsing Ollama response: {str(e)}]"

    # ✅ final signal for EventSourceResponse
    yield "[DONE]"