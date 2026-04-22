"use client";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import data from "../data/maat-virtual.json";
import { STATUS_LABEL, STATUS_BADGE, agruparPorCoordenador } from "../lib/validate.js";

const humanosMap = Object.fromEntries(data.humanos.map(h => [h.id, h]));
const coordenadoresMap = Object.fromEntries(data.coordenadores.map(c => [c.id, c]));
const especialistasMap = Object.fromEntries(data.especialistas.map(e => [e.id, e]));
const govMap = Object.fromEntries(data.governancaTecnica.map(g => [g.id, g]));
const agentesMap = {
  ...coordenadoresMap,
  ...especialistasMap,
  ...govMap,
  [data.agenteMestre.id]: data.agenteMestre,
};

function labelDono(id) {
  if (humanosMap[id]) return humanosMap[id].nome;
  if (agentesMap[id]) return agentesMap[id].nomeMitologico;
  return id;
}

function findHumanByName(name) {
  return data.humanos.find(h => h.nome === name);
}

function ThemeToggle() {
  const [theme, setThemeState] = useState("light");
  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    setThemeState(current);
  }, []);
  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("maat-virtual-theme", next); } catch (e) {}
    setThemeState(next);
  }
  const label = theme === "light" ? "Ativar modo escuro" : "Ativar modo claro";
  return (
    <button className="btn-theme" onClick={toggle} aria-label={label} title={label}>
      {theme === "light" ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      )}
    </button>
  );
}

function DocViewer({ src }) {
  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    let cancelled = false;
    fetch(src)
      .then(r => r.ok ? r.text() : Promise.reject(r.status))
      .then(t => { if (!cancelled) setContent(t); })
      .catch(e => { if (!cancelled) setError(String(e)); });
    return () => { cancelled = true; };
  }, [src]);
  if (error) return <div className="card">Erro ao carregar documento ({error}).</div>;
  if (content === null) return <div className="card">Carregando...</div>;
  return (
    <div className="card markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

function BadgeStatus({ status }) {
  const map = {
    done: "badge-green", missing: "badge-red", default: "badge-orange",
    partial: "badge-orange", in_progress: "badge-orange", pending: "badge-gray",
    active: "badge-green",
  };
  const labels = {
    done: "Pronto", missing: "Faltando", default: "Default Shopify",
    partial: "Parcial", in_progress: "Em Andamento", pending: "Pendente",
    active: "Ativo",
  };
  return <span className={`badge ${map[status] || "badge-gray"}`}>{labels[status] || status}</span>;
}

function BadgePriority({ priority }) {
  const map = { critical: "badge-red", high: "badge-orange", medium: "badge-blue", low: "badge-gray" };
  const labels = { critical: "Critica", high: "Alta", medium: "Media", low: "Baixa" };
  return <span className={`badge ${map[priority] || "badge-gray"}`}>{labels[priority] || priority}</span>;
}

function SubtaskCheckbox({ task, isCompleted, onToggle }) {
  return (
    <div className="subtask-item">
      <button
        className={`subtask-check-btn ${isCompleted ? "done" : ""}`}
        onClick={() => onToggle(task.id)}
        title={isCompleted ? "Desmarcar" : "Marcar como feito"}
      />
      <span className={`subtask-title ${isCompleted ? "done" : ""}`}>{task.title}</span>
      <BadgePriority priority={task.priority} />
    </div>
  );
}

function SubtaskReadonly({ task }) {
  const checkClass = task.status === "done" ? "done" : task.status === "in_progress" ? "in-progress" : "";
  return (
    <div className="subtask-item">
      <div className={`subtask-check ${checkClass}`} />
      <span className={`subtask-title ${task.status === "done" ? "done" : ""}`}>{task.title}</span>
      <BadgePriority priority={task.priority} />
    </div>
  );
}

function MacroCard({ task, completedTasks, onToggle, showAssignee }) {
  const [expanded, setExpanded] = useState(false);
  const subtasks = task.subtasks || [];
  const isHuman = task.assigneeType === "human";
  const doneCount = isHuman
    ? subtasks.filter(s => completedTasks.includes(s.id)).length
    : subtasks.filter(s => s.status === "done").length;
  const totalCount = subtasks.length;
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const allDone = totalCount > 0 && doneCount === totalCount;
  const priorityColor = {
    critical: "var(--accent-alerta)",
    high: "var(--accent-atencao)",
    medium: "var(--text-secondary)",
    low: "var(--text-muted)",
  };
  return (
    <div className={`macro-card ${allDone ? "macro-done" : ""}`} style={{ borderLeft: `4px solid ${priorityColor[task.priority] || "var(--border-strong)"}` }}>
      <div className="macro-header" onClick={() => setExpanded(!expanded)} style={{ cursor: "pointer" }}>
        <div className="macro-header-left">
          <div className={`macro-title ${allDone ? "done" : ""}`}>{task.title}</div>
          <div className="macro-meta">
            {showAssignee && <span className="macro-assignee">{task.assignee}</span>}
            <BadgePriority priority={task.priority} />
            {allDone ? <span className="badge badge-green">Concluido</span> : <BadgeStatus status={task.status} />}
            <span className="macro-project">{task.project}</span>
          </div>
        </div>
        <div className="macro-header-right">
          {totalCount > 0 && <span className="macro-counter">{doneCount}/{totalCount}</span>}
          <span className="macro-expand">{expanded ? "−" : "+"}</span>
        </div>
      </div>
      {task.description && <div className="macro-desc">{task.description}</div>}
      {totalCount > 0 && (
        <div style={{ marginTop: "0.7rem" }}>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPct}%`, background: allDone ? "var(--accent-sucesso)" : (priorityColor[task.priority] || "var(--border-strong)") }} />
          </div>
        </div>
      )}
      {expanded && subtasks.length > 0 && (
        <div className="subtask-list">
          {isHuman
            ? subtasks.map(s => <SubtaskCheckbox key={s.id} task={s} isCompleted={completedTasks.includes(s.id)} onToggle={onToggle} />)
            : subtasks.map(s => <SubtaskReadonly key={s.id} task={s} />)
          }
        </div>
      )}
    </div>
  );
}

function QuestionCard({ q, onAnswer }) {
  const [answer, setAnswer] = useState("");
  const [sending, setSending] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    if (!answer.trim()) return;
    setSending(true);
    await onAnswer(q.id, answer.trim());
    setSending(false);
  }
  if (q.status === "answered") {
    return (
      <div className="question-card answered">
        <div className="question-from">{q.from}</div>
        <div className="question-to">Para: <strong>{q.to}</strong></div>
        <div className="question-text">{q.question}</div>
        <div className="question-answer"><strong>Resposta:</strong> {q.answer}</div>
        <div className="question-date">Respondido em {new Date(q.answeredAt).toLocaleDateString("pt-BR")}</div>
      </div>
    );
  }
  return (
    <div className="question-card pending">
      <div className="question-from">{q.from}</div>
      <div className="question-to">Para: <strong>{q.to}</strong></div>
      <div className="question-text">{q.question}</div>
      <form onSubmit={handleSubmit} className="question-form">
        <textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Digite sua resposta..." rows={2} />
        <button type="submit" disabled={sending || !answer.trim()} className="btn-answer">
          {sending ? "Enviando..." : "Responder"}
        </button>
      </form>
    </div>
  );
}

function AgenteCard({ a, className, showFuncao = true }) {
  return (
    <div className={`organograma-card ${className || ""}`}>
      <div className="organograma-card-name">{a.nomeMitologico}</div>
      {showFuncao && (a.funcao || a.areaLabel) && (
        <div className="organograma-card-funcao">{a.funcao || a.areaLabel}</div>
      )}
      <div className="organograma-card-desc">{a.descricao}</div>
      <div className="organograma-card-meta">
        <span className={`badge ${STATUS_BADGE[a.status]}`}>{STATUS_LABEL[a.status]}</span>
        {a.donoNegocio && a.donoNegocio.length > 0 && (
          <span className="organograma-card-dono">{a.donoNegocio.map(labelDono).join(" · ")}</span>
        )}
      </div>
      {a.ferramentas && a.ferramentas.length > 0 && (
        <div className="organograma-esp-ferramentas">
          {a.ferramentas.map(f => <span key={f} className="organograma-esp-ferramenta">{f}</span>)}
        </div>
      )}
      {a.pendencias && a.pendencias.length > 0 && (
        <div className="organograma-card-pend">Pendente: {a.pendencias.join(" / ")}</div>
      )}
    </div>
  );
}

function frenteDoAgente(a) {
  if (!a || !a.origemMapID) return "Frente 1 · MAAT Virtual (a desenvolver)";
  return a.origemMapID.startsWith("ag_")
    ? "Frente 2 · Squad operacional"
    : "Frente 1 · Ferramenta proprietaria";
}

function AgenteModal({ agente, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!agente) return null;

  const skills = agente.skills || [];
  const mcpTools = agente.mcpTools || [];
  const skillsReady = skills.filter(s => s.s === "ready").length;
  const skillsTodo = skills.filter(s => s.s !== "ready").length;
  const temDesc = !!agente.descricaoDetalhada;
  const temDeps = !!agente.dependencias;

  return (
    <div className="tv-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="tv-modal" role="dialog" aria-modal="true" aria-label={agente.nomeMitologico}>
        <button className="tv-modal-close" onClick={onClose} aria-label="Fechar">×</button>

        <div className="tv-modal-head">
          <div className="tv-modal-name">{agente.nomeMitologico}</div>
          <div className="tv-modal-funcao">{agente.funcao}</div>
          <div className="tv-modal-meta">
            <span className="tv-modal-frente">{frenteDoAgente(agente)}</span>
            <span className={`badge ${STATUS_BADGE[agente.status]}`}>{STATUS_LABEL[agente.status]}</span>
          </div>
        </div>

        <section className="tv-modal-sec">
          <div className="tv-modal-label">Descricao detalhada</div>
          <div className="tv-modal-desc">
            {temDesc ? agente.descricaoDetalhada : <span className="tv-tbd">A definir</span>}
          </div>
        </section>

        <section className="tv-modal-sec">
          <div className="tv-modal-label">
            Skills
            {skills.length > 0 && (
              <span className="tv-modal-count">{skillsReady} pronta{skillsReady !== 1 ? "s" : ""} · {skillsTodo} a desenvolver</span>
            )}
          </div>
          <div className="tv-tag-wrap">
            {skills.length > 0
              ? skills.map(s => (
                  <span key={s.n} className={`tv-tag ${s.s === "ready" ? "tv-tag-ready" : "tv-tag-todo"}`}>
                    <span className="tv-tag-dot" />
                    {s.n}
                  </span>
                ))
              : <span className="tv-tbd">A definir</span>
            }
          </div>
        </section>

        <section className="tv-modal-sec">
          <div className="tv-modal-label">
            MCP Tools
            {mcpTools.length > 0 && (
              <span className="tv-modal-count">{mcpTools.length} conectada{mcpTools.length !== 1 ? "s" : ""}</span>
            )}
          </div>
          <div className="tv-tag-wrap">
            {mcpTools.length > 0
              ? mcpTools.map(m => (
                  <span key={m.n} className="tv-tag tv-tag-mcp">
                    <span className="tv-tag-dot" />
                    {m.n}
                  </span>
                ))
              : <span className="tv-tbd">A definir</span>
            }
          </div>
        </section>

        <section className="tv-modal-sec">
          <div className="tv-modal-label">Depende de</div>
          <div className="tv-modal-desc">
            {temDeps ? agente.dependencias : <span className="tv-tbd">A definir</span>}
          </div>
        </section>

        {agente.pendencias && agente.pendencias.length > 0 && (
          <section className="tv-modal-sec">
            <div className="tv-modal-label">Pendencias</div>
            <div className="tv-modal-desc tv-modal-pend">
              {agente.pendencias.join(" · ")}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function TimeVirtualView() {
  const { coordenadores, especialistas } = data;
  const porCoord = agruparPorCoordenador(especialistas);
  const [agenteAberto, setAgenteAberto] = useState(null);

  return (
    <div className="tv-catalogo">
      {coordenadores.map(c => {
        const esps = porCoord[c.id] || [];
        return (
          <div key={c.id} className="tv-grupo">
            <div className="tv-grupo-head">
              <div className="tv-grupo-area">{c.areaLabel}</div>
              <div className="tv-grupo-coord">{c.nomeMitologico}</div>
              <div className="tv-grupo-count">{esps.length} especialista{esps.length !== 1 ? "s" : ""}</div>
            </div>
            <div className="tv-cards">
              {esps.map(e => {
                const tools = (e.ferramentas || []).slice(0, 3);
                return (
                  <button key={e.id} type="button" className="tv-card" onClick={() => setAgenteAberto(e)}>
                    <div className="tv-card-name">{e.nomeMitologico}</div>
                    <div className="tv-card-funcao">{e.funcao}</div>
                    <div className="tv-card-desc">{e.descricao}</div>
                    {tools.length > 0 && (
                      <div className="tv-card-tools">
                        {tools.map(t => <span key={t} className="tv-card-tool">{t}</span>)}
                      </div>
                    )}
                    <span className={`badge ${STATUS_BADGE[e.status]} tv-card-status`}>{STATUS_LABEL[e.status]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <AgenteModal agente={agenteAberto} onClose={() => setAgenteAberto(null)} />
    </div>
  );
}

function HierarquiaView() {
  const { humanos, agenteMestre: mestre, coordenadores, especialistas, governancaTecnica } = data;
  const porCoord = agruparPorCoordenador(especialistas);
  const [openCoords, setOpenCoords] = useState({});
  const toggle = (id) => setOpenCoords(s => ({ ...s, [id]: !s[id] }));

  return (
    <div className="organograma">
      <div className="organograma-layer">
        <div className="organograma-layer-title">Nucleo Humano</div>
        <div className="organograma-humanos">
          {humanos.map(h => (
            <div key={h.id} className={`organograma-humano ${h.placeholder ? "pending" : ""}`}>
              <div className="organograma-humano-name">{h.nome}</div>
              <div className="organograma-humano-role">{h.papel}</div>
              {h.areas && h.areas.length > 0 && (
                <div className="organograma-humano-areas">{h.areas.join(" · ")}</div>
              )}
            </div>
          ))}
        </div>
        <div className="organograma-mestre-wrap">
          <div className="organograma-card organograma-mestre">
            <div className="organograma-card-name">{mestre.nomeMitologico}</div>
            <div className="organograma-card-funcao">{mestre.funcao}</div>
            <div className="organograma-card-desc">{mestre.descricao}</div>
            <div className="organograma-card-meta">
              <span className={`badge ${STATUS_BADGE[mestre.status]}`}>{STATUS_LABEL[mestre.status]}</span>
              <span className="organograma-card-dono">Dono: {labelDono(mestre.donoNegocio[0])}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="organograma-layer">
        <div className="organograma-layer-title">Coordenadores ({coordenadores.length}) · Especialistas ({especialistas.length})</div>
        <div className="organograma-layer-hint">Toque no coordenador pra expandir os especialistas</div>
        <div className="organograma-coords">
          {coordenadores.map(c => {
            const esps = porCoord[c.id] || [];
            const isOpen = !!openCoords[c.id];
            return (
              <div key={c.id} className={`organograma-coord-group ${isOpen ? "open" : ""}`}>
                <button className="organograma-coord" onClick={() => toggle(c.id)} type="button">
                  <div className="organograma-coord-area">{c.areaLabel}</div>
                  <div className="organograma-card-name">{c.nomeMitologico}</div>
                  <div className="organograma-card-desc">{c.descricao}</div>
                  <div className="organograma-card-meta">
                    <span className={`badge ${STATUS_BADGE[c.status]}`}>{STATUS_LABEL[c.status]}</span>
                    <span className="organograma-card-dono">{c.donoNegocio.map(labelDono).join(" · ")}</span>
                  </div>
                  <div className="organograma-coord-counter">{esps.length} especialista{esps.length !== 1 ? "s" : ""}</div>
                </button>
                <div className="organograma-esps">
                  {esps.map(e => <AgenteCard key={e.id} a={e} className="organograma-esp" />)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="organograma-layer organograma-gov-layer">
        <div className="organograma-layer-title">Governanca Tecnica · Transversal (Cleber)</div>
        <div className="organograma-gov-row">
          {governancaTecnica.map(g => <AgenteCard key={g.id} a={g} className="organograma-gov-card" />)}
        </div>
      </div>
    </div>
  );
}

const DEV_SESSION = process.env.NODE_ENV === "development"
  ? { user: { name: "Dev Local", email: "dev@bebamaat.com.br", image: null } }
  : null;

export default function Dashboard() {
  const { data: realSession } = useSession();
  const session = realSession || DEV_SESSION;
  const [activeTab, setActiveTab] = useState("overview");
  const [state, setState] = useState({ completedTasks: [], questions: [] });
  const [loading, setLoading] = useState(true);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/state");
      if (res.ok) setState(await res.json());
    } catch (e) {
      console.error("Erro ao carregar estado:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchState(); }, [fetchState]);

  async function toggleTask(taskId) {
    const prev = state.completedTasks.includes(taskId)
      ? state.completedTasks.filter(id => id !== taskId)
      : [...state.completedTasks, taskId];
    setState(s => ({ ...s, completedTasks: prev }));
    try {
      const res = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggleTask", taskId }),
      });
      if (res.ok) setState(await res.json());
    } catch (e) {
      console.error("Erro ao salvar:", e);
      fetchState();
    }
  }

  async function answerQuestion(questionId, answer) {
    try {
      const res = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "answerQuestion", questionId, answer }),
      });
      if (res.ok) setState(await res.json());
    } catch (e) {
      console.error("Erro ao responder:", e);
      fetchState();
    }
  }

  if (!session) return null;

  const macroTasks = data.tasks.filter(t => t.type === "macro");
  const humanMacros = macroTasks.filter(t => t.assigneeType === "human");
  const doneMicros = data.tasks.filter(t => t.type !== "macro" && t.status === "done");
  const phases = data.phases || [];

  const pendingQuestions = state.questions.filter(q => q.status === "pending");
  const answeredQuestions = state.questions.filter(q => q.status === "answered");
  const humanPendingSubtasks = humanMacros.flatMap(t => (t.subtasks || []).filter(s => !state.completedTasks.includes(s.id)));
  const pendingCount = humanPendingSubtasks.length + pendingQuestions.length;

  const humanosReais = data.humanos.filter(h => !h.placeholder);
  const representantes = data.humanos.filter(h => h.placeholder);

  const tabs = [
    { id: "fundacao", label: "Fundação" },
    { id: "overview", label: "Visao Geral" },
    { id: "org", label: "Organograma" },
    { id: "agents", label: "Time Virtual" },
    { id: "projects", label: "Projetos" },
    { id: "tasks", label: "Todas Tarefas" },
    { id: "pendencias", label: "Pendencias", alert: pendingCount },
  ];

  return (
    <>
      <div className="header">
        <div className="header-brand">
          <img src="/logos/maat-horizontal-branco.png" alt="MAAT" className="header-logo" />
          <span className="header-sub">VIRTUAL</span>
        </div>
        <div className="header-right">
          <span className="header-badge">CRESCIMENTO</span>
          <ThemeToggle />
          <div className="user-info">
            {session.user?.image && <img className="user-avatar" src={session.user.image} alt="" />}
            <span className="user-name">{session.user?.name}</span>
          </div>
          <button className="btn-logout" onClick={() => signOut()}>Sair</button>
        </div>
      </div>

      <div className="tabs">
        {tabs.map(t => (
          <button key={t.id} className={`tab ${activeTab === t.id ? "active" : ""} ${t.alert > 0 ? "highlight" : ""}`}
            onClick={() => setActiveTab(t.id)}>
            {t.label}
            {t.alert > 0 && <span className="tab-alert">{t.alert}</span>}
          </button>
        ))}
      </div>

      <div className="content">

        {activeTab === "fundacao" && (
          <div>
            <div className="section-title">Frente A v2 — Fundação Conceitual</div>
            <DocViewer src="/docs/frente-a-v2.md" />
          </div>
        )}

        {activeTab === "overview" && (
          <div>
            <div className="stats">
              <div className="stat">
                <div className="stat-value">1</div>
                <div className="stat-label">Agente-Mestre</div>
              </div>
              <div className="stat">
                <div className="stat-value">{data.coordenadores.length}</div>
                <div className="stat-label">Coordenadores</div>
              </div>
              <div className="stat">
                <div className="stat-value">{data.especialistas.length}</div>
                <div className="stat-label">Especialistas</div>
              </div>
              <div className="stat">
                <div className="stat-value">{data.governancaTecnica.length}</div>
                <div className="stat-label">Governanca Tecnica</div>
              </div>
              <div className="stat">
                <div className="stat-value">{humanosReais.length}<span style={{ opacity: 0.35 }}> + {representantes.length}</span></div>
                <div className="stat-label">Humanos + Representantes</div>
              </div>
              <div className="stat">
                <div className="stat-value">{data.projects.length}</div>
                <div className="stat-label">Projetos</div>
              </div>
              <div className="stat clickable" onClick={() => setActiveTab("pendencias")}>
                <div className="stat-value" style={{ color: pendingCount > 0 ? "var(--accent-alerta)" : "var(--accent-sucesso)" }}>{pendingCount}</div>
                <div className="stat-label">{pendingCount > 0 ? "Pendencias Humanas" : "Tudo em dia"}</div>
              </div>
            </div>

            {pendingCount > 0 && (
              <div className="alert-banner" onClick={() => setActiveTab("pendencias")}>
                <strong>{pendingCount} pendencia{pendingCount !== 1 ? "s" : ""}</strong> esperando resposta ou acao dos humanos
              </div>
            )}

            {phases.length > 0 && (
              <>
                <div className="section-title">Plano de Execucao — 4 Fases</div>
                <div className="grid-2" style={{ marginBottom: "2rem" }}>
                  {phases.map(p => (
                    <div key={p.id} className="card" style={{ borderLeft: `4px solid ${p.status === "active" ? "var(--accent-atencao)" : "var(--border-strong)"}` }}>
                      <div className="card-header">
                        <div className="card-title">{p.name}</div>
                        <span className={`badge ${p.status === "active" ? "badge-orange" : "badge-gray"}`}>{p.status === "active" ? "Ativa" : "Proxima"}</span>
                      </div>
                      <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>{p.description}</p>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{p.timeline}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="grid-2">
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Prioridade #1: E-commerce B2C</div>
                  <span className="badge badge-orange">Em Andamento</span>
                </div>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>Lancar bebamaat.com.br e vender muito. Staging v0.2.0 pronto para revisao.</p>
                <div className="progress-bar"><div className="progress-fill" style={{ width: "85%", background: "var(--accent-atencao)" }} /></div>
                <div className="progress-label"><span>Progresso</span><span>85%</span></div>
              </div>

              <div className="card">
                <div className="card-header"><div className="card-title">Nucleo Humano</div></div>
                <div style={{ marginTop: "0.3rem" }}>
                  {data.humanos.map(h => (
                    <div key={h.id} style={{ fontSize: "0.8rem", display: "flex", justifyContent: "space-between", padding: "0.45rem 0", borderBottom: "1px solid var(--border)", opacity: h.placeholder ? 0.5 : 1 }}>
                      <span><strong>{h.nome}</strong> <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>({h.papel})</span></span>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{(h.areas || []).join(" · ")}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "org" && (
          <div>
            <div className="section-title">Organograma MAAT Virtual</div>
            <HierarquiaView />
          </div>
        )}

        {activeTab === "pendencias" && (
          <div>
            {pendingQuestions.length > 0 && (
              <>
                <div className="section-title">Perguntas Aguardando Resposta <span className="count alert">{pendingQuestions.length}</span></div>
                {pendingQuestions.map(q => <QuestionCard key={q.id} q={q} onAnswer={answerQuestion} />)}
              </>
            )}

            <div className="section-title" style={{ marginTop: pendingQuestions.length > 0 ? "2rem" : 0 }}>
              Tarefas dos Humanos <span className="count">{humanMacros.length}</span>
            </div>
            {humanMacros.map(t => (
              <MacroCard key={t.id} task={t} completedTasks={state.completedTasks} onToggle={toggleTask} showAssignee />
            ))}

            {answeredQuestions.length > 0 && (
              <>
                <div className="section-title" style={{ marginTop: "2rem" }}>Perguntas Respondidas <span className="count">{answeredQuestions.length}</span></div>
                {answeredQuestions.map(q => <QuestionCard key={q.id} q={q} onAnswer={answerQuestion} />)}
              </>
            )}
          </div>
        )}

        {activeTab === "agents" && (
          <div>
            <div className="section-title">Time Virtual <span className="count">{data.especialistas.length}</span></div>
            <TimeVirtualView />
          </div>
        )}

        {activeTab === "projects" && (
          <div>
            <div className="section-title">Projetos <span className="count">{data.projects.length}</span></div>
            <div className="grid-2">
              {data.projects.map(p => (
                <div key={p.id} className="card" style={{ borderTop: `4px solid ${p.id === "ecommerce-b2c" ? "var(--accent-atencao)" : "var(--text-secondary)"}` }}>
                  <div className="card-header"><div className="card-title">{p.name}</div><BadgeStatus status={p.status} /></div>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>{p.description}</p>
                  {p.stagingVersion && (
                    <div style={{ fontSize: "0.78rem", marginBottom: "0.5rem" }}>
                      <span className="badge badge-purple">Staging {p.stagingVersion}</span>{" "}
                      <span className="badge badge-blue">Producao {p.productionVersion}</span>
                    </div>
                  )}
                  <table>
                    <thead><tr><th>Componente</th><th>Status</th></tr></thead>
                    <tbody>
                      {p.components.map(c => (
                        <tr key={c.name}><td>{c.name}</td><td><BadgeStatus status={c.status} /></td></tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ marginTop: "1rem" }}>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${p.progress}%`, background: p.id === "ecommerce-b2c" ? "var(--accent-atencao)" : "var(--text-primary)" }} /></div>
                    <div className="progress-label"><span>Progresso</span><span>{p.progress}%</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "tasks" && (
          <div>
            <div className="section-title">Humanos <span className="count">{humanMacros.length}</span></div>
            {humanMacros.map(t => <MacroCard key={t.id} task={t} completedTasks={state.completedTasks} onToggle={toggleTask} showAssignee />)}

            {doneMicros.length > 0 && (
              <>
                <div className="section-title" style={{ marginTop: "2rem" }}>Entregas Concluidas <span className="count">{doneMicros.length}</span></div>
                <div className="card">
                  {doneMicros.map(t => (
                    <div key={t.id} className="subtask-item">
                      <div className="subtask-check done" />
                      <span className="subtask-title done">{t.title}</span>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{t.assignee}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

      </div>

      <div style={{ textAlign: "center", padding: "2rem", fontSize: "0.7rem", color: "var(--text-muted)" }}>
        MAAT Virtual — Atualizado em {data.lastUpdated.split("T")[0]}
      </div>
    </>
  );
}
