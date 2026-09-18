"use client";

import { useMemo, useState } from "react";

const agents = [
  { id: "analyst", name: "Analyst", role: "разбирает задачу и строит гипотезы", state: "working", model: "Corporate AI", color: "amber", task: "Проверка динамики инфраструктурных затрат" },
  { id: "data", name: "Data Quality", role: "ищет пропуски, выбросы и дубли", state: "ready", model: "Ollama · qwen2.5", color: "mint", task: "Ожидает файл для проверки" },
  { id: "writer", name: "Report Writer", role: "собирает выводы в отчёт", state: "sleeping", model: "Claude", color: "violet", task: "Последний отчёт готов 12 мин назад" },
  { id: "reviewer", name: "Reviewer", role: "проверяет расчёты и формулировки", state: "review", model: "Codex", color: "blue", task: "Ждёт результаты Analyst" }
];

const events = [
  ["10:42", "Analyst", "собрал 4 источника и выделил 3 драйвера", "amber"],
  ["10:39", "Data Quality", "проверил 18 402 строки · ошибок не найдено", "mint"],
  ["10:34", "Analyst", "сформировал срез по подразделениям", "amber"],
  ["10:28", "You", "запустили анализ инфраструктурного отчёта", "white"]
];

function Dot({ color }) { return <span className={`dot ${color}`} />; }

export default function Home() {
  const [view, setView] = useState("overview");
  const [prompt, setPrompt] = useState("");
  const [running, setRunning] = useState(false);
  const [toast, setToast] = useState("");
  const active = useMemo(() => agents.filter((a) => a.state !== "sleeping"), []);

  function runTask() {
    if (!prompt.trim()) return;
    setRunning(true); setToast("Задача отправлена Analyst");
    setTimeout(() => { setRunning(false); setPrompt(""); setToast("Analyst принял задачу и начал работу"); }, 900);
  }

  return <main className="shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">✦</span><span>agent desk</span></div>
      <div className="workspace"><span className="workspace-dot" /> personal analytics <span className="chevron">⌄</span></div>
      <nav>
        <button className={view === "overview" ? "nav-item active" : "nav-item"} onClick={() => setView("overview")}><span>◈</span> Обзор</button>
        <button className={view === "agents" ? "nav-item active" : "nav-item"} onClick={() => setView("agents")}><span>✣</span> Агенты <b>4</b></button>
        <button className={view === "artifacts" ? "nav-item active" : "nav-item"} onClick={() => setView("artifacts")}><span>▱</span> Артефакты <b>7</b></button>
        <button className={view === "memory" ? "nav-item active" : "nav-item"} onClick={() => setView("memory")}><span>⌘</span> Память</button>
      </nav>
      <div className="side-bottom"><div className="connection"><span className="pulse" /> все системы онлайн</div><div className="profile"><span className="avatar">А</span><span><strong>Анастасия</strong><small>личное пространство</small></span><span className="more">•••</span></div></div>
    </aside>

    <section className="content">
      <header className="topbar"><div><p className="eyebrow">СРЕДА · 19 СЕНТЯБРЯ 2026</p><h1>{view === "overview" ? "Добрый день, Анастасия" : view[0].toUpperCase() + view.slice(1)}</h1></div><div className="top-actions"><button className="icon-btn">⌕</button><button className="icon-btn">?</button><button className="run-button" onClick={() => document.getElementById("task-box")?.focus()}>+ новая задача</button></div></header>

      {view === "overview" && <>
        <section className="hero"><div><span className="live-label"><Dot color="amber" /> LIVE SESSION</span><h2>Рабочий стол<br /><em>аналитика</em></h2><p>4 агента готовы помочь с данными, исследованиями и отчётами.</p></div><div className="hero-orbit"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit-core">✦</div><span className="orbit-tag tag-one">data</span><span className="orbit-tag tag-two">review</span><span className="orbit-tag tag-three">insight</span></div></section>
        <div className="section-heading"><div><p className="eyebrow">СЕЙЧАС</p><h3>Команда в работе</h3></div><span className="muted">{active.length} активных · обновлено только что</span></div>
        <section className="agent-grid">{agents.map((agent) => <article className={`agent-card ${agent.state}`} key={agent.id}><div className="card-top"><span className={`agent-icon ${agent.color}`}>{agent.name[0]}</span><span className={`status ${agent.state}`}><Dot color={agent.color} />{agent.state === "working" ? "работает" : agent.state === "ready" ? "готов" : agent.state === "review" ? "на проверке" : "отдыхает"}</span><button className="dots">•••</button></div><h4>{agent.name}</h4><p>{agent.role}</p><div className="task-line"><span>{agent.state === "working" ? "↗" : "—"}</span>{agent.task}</div><div className="card-footer"><span>{agent.model}</span>{agent.state === "working" && <span className="progress"><i /></span>}</div></article>)}</section>
        <section className="lower-grid"><div className="panel timeline"><div className="panel-heading"><div><p className="eyebrow">ЖУРНАЛ</p><h3>Лента работы</h3></div><button className="text-button">вся история →</button></div>{events.map(([time, who, text, color]) => <div className="event" key={time}><time>{time}</time><Dot color={color} /><div><strong>{who}</strong><span>{text}</span></div></div>)}</div><div className="panel composer"><div className="panel-heading"><div><p className="eyebrow">БЫСТРЫЙ СТАРТ</p><h3>Что исследуем?</h3></div><span className="shortcut">⌘ ↵</span></div><textarea id="task-box" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Например: сравни расходы по кварталам и найди главные отклонения…" /><div className="composer-bottom"><span className="attach">＋ файл</span><button className="send" disabled={running || !prompt.trim()} onClick={runTask}>{running ? "запускаем…" : "запустить  ↗"}</button></div>{toast && <div className="toast">{toast}</div>}</div></section>
      </>}
      {view !== "overview" && <section className="empty-view"><span className="empty-icon">{view === "agents" ? "✣" : view === "artifacts" ? "▱" : "⌘"}</span><h2>{view === "agents" ? "Ваши агенты" : view === "artifacts" ? "Артефакты" : "Память workspace"}</h2><p>Этот раздел уже подключён к структуре harness. Здесь появятся данные после первой сессии.</p><button className="run-button" onClick={() => setView("overview")}>вернуться к обзору</button></section>}
    </section>
  </main>;
}
