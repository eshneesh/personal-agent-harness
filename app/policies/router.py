from app.models import Sensitivity


def classify_and_route(sensitivity: Sensitivity | None, requested_provider: str | None) -> tuple[str, str]:
    """Return provider and explanation. Unknown data is treated as sensitive."""
    if requested_provider:
        if sensitivity in (Sensitivity.SENSITIVE, Sensitivity.LOCAL_ONLY) and requested_provider in {"codex", "claude"}:
            return "corp", "external coding agents are forbidden for sensitive/local-only tasks"
        return requested_provider, "provider explicitly requested and allowed"
    if sensitivity in (Sensitivity.SENSITIVE, None):
        return "corp", "sensitive or unclassified task"
    if sensitivity == Sensitivity.LOCAL_ONLY:
        return "ollama", "local-only task"
    return "codex", "standard development task"
