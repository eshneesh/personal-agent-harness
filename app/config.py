from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    gitlab_url: str = "https://it.gitlab.mgts.com"
    gitlab_token: str = ""
    corp_ai_base_url: str = "http://corporate-ai.internal/v1"
    corp_ai_api_key: str = ""
    corp_ai_model: str = "corporate-default"
    ollama_base_url: str = "http://host.docker.internal:11434"
    ollama_model: str = "llama3.1"
    database_url: str = "sqlite:///./orchestrator.db"
    app_env: str = "local"
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
