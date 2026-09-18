class MockAdapter:
    def __init__(self, name: str):
        self.name = name

    async def execute(self, prompt: str, project: str, ref: str) -> str:
        return f"[{self.name} mock] task accepted for {project}@{ref}: {prompt[:200]}"
