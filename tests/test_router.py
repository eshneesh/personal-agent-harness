from app.models import Sensitivity
from app.policies.router import classify_and_route


def test_unknown_is_corporate():
    assert classify_and_route(None, None)[0] == "corp"


def test_sensitive_cannot_use_codex():
    provider, reason = classify_and_route(Sensitivity.SENSITIVE, "codex")
    assert provider == "corp"
    assert "forbidden" in reason


def test_local_only_uses_ollama():
    assert classify_and_route(Sensitivity.LOCAL_ONLY, None)[0] == "ollama"
