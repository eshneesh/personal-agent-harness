from enum import StrEnum
from pydantic import BaseModel, Field


class Sensitivity(StrEnum):
    PUBLIC = "public"
    INTERNAL = "internal"
    SENSITIVE = "sensitive"
    LOCAL_ONLY = "local_only"


class TaskRequest(BaseModel):
    project: str = Field(..., description="GitLab project path, e.g. platform/api")
    prompt: str
    sensitivity: Sensitivity | None = None
    provider: str | None = None
    ref: str = "main"
    write_mode: str = "branch_only"


class TaskResult(BaseModel):
    task_id: str
    provider: str
    status: str
    output: str
    policy_reason: str
