# AI Agent Orchestrator

MVP-оркестратор для маршрутизации задач разработки между Codex/Claude в Ubuntu под WSL2, корпоративной OpenAI-compatible моделью и локальными моделями Ollama на Windows.

## Быстрый запуск

```bash
cp .env.example .env
docker compose up --build
```

API: `http://localhost:8080/docs`

Подробный русскоязычный гайд: [docs/GETTING_STARTED_RU.md](docs/GETTING_STARTED_RU.md).

## Web monitor

The personal monitor is a small Next.js app with no multi-user backend:

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:3000`. The UI is intentionally useful without an API connection: it provides the workspace shape, agent states, activity timeline and a task composer. The next integration step is wiring the composer and live events to `/v1/tasks` and a local event stream.

## Маршрутизация

- `public` / `internal` → Ubuntu worker (Codex или Claude)
- `sensitive` → корпоративный API
- `local_only` → Ollama worker
- неизвестная классификация → `sensitive` (безопасное поведение по умолчанию)

Перед production нужно подключить GitLab webhook, Vault, OPA и реальный worker runner.
