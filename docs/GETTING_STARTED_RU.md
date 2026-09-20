# Гайд по подъёму Personal Agent Harness

Этот документ описывает локальный запуск Personal Agent Harness: Python API, web-монитора, корпоративной OpenAI-compatible модели и Ollama на Windows.

## 1. Что получится после запуска

В проекте работают два процесса:

```text
Web monitor  http://localhost:3000
Python API   http://localhost:8080
```

API принимает задачи через `POST /v1/tasks`, выбирает контур по уровню чувствительности и вызывает один из adapters. Web-монитор сейчас показывает рабочее пространство, состояния агентов, ленту событий и форму новой задачи.

## 2. Предварительные требования

На Ubuntu/macOS нужны:

- Git;
- Python 3.11 или новее;
- Node.js 20 или новее и npm;
- Docker Desktop (опционально, если API запускается контейнером).

Для локального контура на Windows нужен [Ollama](https://ollama.com/download/windows). Корпоративный API должен поддерживать OpenAI-совместимый endpoint `/v1/chat/completions`.

Проверка инструментов:

```bash
git --version
python3 --version
node --version
npm --version
docker --version
```

## 3. Получение проекта

```bash
git clone https://github.com/eshneesh/personal-agent-harness.git
cd personal-agent-harness
```

Если репозиторий будет перенесён в корпоративный GitLab, замените URL в команде `git clone`.

## 4. Конфигурация

Создайте локальный файл конфигурации:

```bash
cp .env.example .env
```

Заполните `.env`:

```dotenv
GITLAB_URL=https://it.gitlab.mgts.com
GITLAB_TOKEN=

CORP_AI_BASE_URL=https://corporate-ai.example.ru/v1
CORP_AI_API_KEY=замените-на-секрет
CORP_AI_MODEL=corporate-default

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5-coder:14b

DATABASE_URL=sqlite:///./orchestrator.db
APP_ENV=local
```

Не коммитьте `.env`. API-ключи лучше хранить в Vault или в secret manager операционной системы.

## 5. Запуск Ollama на Windows

В PowerShell установите модель:

```powershell
ollama pull qwen2.5-coder:14b
ollama list
```

Проверьте API:

```powershell
curl http://localhost:11434/api/tags
```

Если Python API работает в Docker Desktop, используйте в `.env` адрес:

```dotenv
OLLAMA_BASE_URL=http://host.docker.internal:11434
```

Если API работает напрямую на Ubuntu, Windows должен быть доступен по сетевому адресу машины, например:

```dotenv
OLLAMA_BASE_URL=http://192.168.1.50:11434
```

Не открывайте Ollama в интернет. Разрешайте доступ только от доверенного хоста или через VPN.

## 6. Вариант A: запуск API через Docker

```bash
docker compose up --build
```

Проверка:

```bash
curl http://localhost:8080/health
```

Ожидаемый ответ:

```json
{"status":"ok","environment":"local"}
```

Swagger API доступен по адресу [http://localhost:8080/docs](http://localhost:8080/docs).

Остановка:

```bash
docker compose down
```

## 7. Вариант B: запуск API напрямую в Python

Создайте виртуальное окружение и установите зависимости:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Запустите API:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

Для Windows PowerShell активация окружения выглядит так:

```powershell
.venv\Scripts\Activate.ps1
```

## 8. Запуск web-монитора

В отдельном терминале:

```bash
cd web
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

Для production-сборки:

```bash
npm run build
npm run start
```

## 9. Быстрая проверка маршрутизации

Обычная задача должна уйти в Codex adapter:

```bash
curl -X POST http://localhost:8080/v1/tasks \
  -H 'Content-Type: application/json' \
  -d '{"project":"demo/analytics","prompt":"Составь план анализа продаж","sensitivity":"internal"}'
```

Чувствительная задача должна уйти в корпоративный API:

```bash
curl -X POST http://localhost:8080/v1/tasks \
  -H 'Content-Type: application/json' \
  -d '{"project":"demo/analytics","prompt":"Проверь внутренний отчёт","sensitivity":"sensitive"}'
```

Локальная задача должна уйти в Ollama:

```bash
curl -X POST http://localhost:8080/v1/tasks \
  -H 'Content-Type: application/json' \
  -d '{"project":"demo/analytics","prompt":"Найди дубли в таблице","sensitivity":"local_only"}'
```

Если классификация не указана, задача отправляется в корпоративный контур.

## 10. Codex и Claude

На первом этапе `codex` и `claude` в MVP работают через mock adapter. Это позволяет поднять UI и проверить маршрутизацию без выдачи агентам прав на GitLab.

Для подключения реальных CLI нужно добавить Ubuntu worker, который:

1. получает задачу из очереди;
2. создаёт отдельный Git worktree;
3. запускает Codex или Claude в sandbox;
4. собирает diff и результаты тестов;
5. возвращает результат в API;
6. создаёт ветку или Merge Request после проверки.

Не подключайте production-репозитории до появления этого worker и ручного approval.

## 11. Проверки перед первым использованием

```bash
python3 -m compileall -q app
cd web && npm run build
```

Если установлен pytest:

```bash
python -m pytest -q
```

Проверьте также, что:

- `.env` отсутствует в `git status`;
- API-ключи не попадают в логи;
- Ollama не доступен из внешнего интернета;
- sensitive-задачи не передаются в Codex или Claude;
- ветка `main` защищена в GitLab/GitHub;
- для публикации отчёта требуется ручное подтверждение.

## 12. Типовые проблемы

### `Connection refused` на `localhost:8080`

API не запущен. Запустите Docker Compose или `uvicorn` из раздела 6/7.

### Ollama не отвечает из контейнера

Вместо `localhost` используйте `host.docker.internal` и проверьте, что Ollama запущен на Windows.

### Корпоративный API отвечает 401/403

Проверьте `CORP_AI_BASE_URL`, ключ, имя модели и доступность API из Ubuntu/Docker-сети.

### В web-мониторе нет реальных событий

Текущая UI-версия использует демонстрационные данные. Подключение SSE/WebSocket и реальных worker events выполняется следующим этапом.

## 13. Обновление проекта

```bash
git pull --ff-only
docker compose up --build
```

Для web-монитора после обновления зависимостей:

```bash
cd web
npm install
npm run build
```
