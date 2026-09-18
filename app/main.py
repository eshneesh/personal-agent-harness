from uuid import uuid4
from fastapi import FastAPI, HTTPException
from app.config import settings
from app.models import TaskRequest, TaskResult
from app.policies.router import classify_and_route
from app.adapters.openai_compatible import OpenAICompatibleAdapter
from app.adapters.ollama import OllamaAdapter
from app.adapters.mock import MockAdapter

app = FastAPI(title="AI Agent Orchestrator", version="0.1.0")


def adapter_for(provider: str):
    if provider == "corp":
        return OpenAICompatibleAdapter(settings.corp_ai_base_url, settings.corp_ai_api_key, settings.corp_ai_model)
    if provider == "ollama":
        return OllamaAdapter(settings.ollama_base_url, settings.ollama_model)
    if provider in {"codex", "claude"}:
        # Production implementation will submit to an Ubuntu worker queue.
        return MockAdapter(provider)
    raise HTTPException(status_code=400, detail=f"unknown provider: {provider}")


@app.get("/health")
async def health():
    return {"status": "ok", "environment": settings.app_env}


@app.post("/v1/tasks", response_model=TaskResult)
async def create_task(task: TaskRequest):
    provider, reason = classify_and_route(task.sensitivity, task.provider)
    adapter = adapter_for(provider)
    output = await adapter.execute(task.prompt, task.project, task.ref)
    return TaskResult(task_id=str(uuid4()), provider=provider, status="completed", output=output, policy_reason=reason)
