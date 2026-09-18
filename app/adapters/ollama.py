import httpx


class OllamaAdapter:
    name = "ollama"

    def __init__(self, base_url: str, model: str):
        self.base_url = base_url.rstrip("/")
        self.model = model

    async def execute(self, prompt: str, project: str, ref: str) -> str:
        payload = {"model": self.model, "prompt": prompt, "stream": False, "keep_alive": "5m"}
        async with httpx.AsyncClient(timeout=180) as client:
            response = await client.post(f"{self.base_url}/api/generate", json=payload)
            response.raise_for_status()
            return response.json()["response"]
