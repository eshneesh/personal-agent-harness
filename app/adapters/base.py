from typing import Protocol


class AgentAdapter(Protocol):
    name: str

    async def execute(self, prompt: str, project: str, ref: str) -> str: ...
