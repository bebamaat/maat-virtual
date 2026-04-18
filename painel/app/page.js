"use client";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import data from "../data/maat-virtual.json";

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
    critical: "var(--vermelho)", high: "var(--laranja)", medium: "#3b82f6", low: "var(--cinza-500)"
  };

  return (
    <div className={`macro-card ${allDone ? "macro-done" : ""}`} style={{ borderLeft: `4px solid ${priorityColor[task.priority] || "var(--cinza-300)"}` }}>
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
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${progressPct}%`, background: allDone ? "var(--folha)" : (priorityColor[task.priority] || "var(--cinza-300)") }}></div></div>
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
        <div className="question-answer">
          <strong>Resposta:</strong> {q.answer}
        </div>
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
        <textarea
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="Digite sua resposta..."
          rows={2}
        />
        <button type="submit" disabled={sending || !answer.trim()} className="btn-answer">
          {sending ? "Enviando..." : "Responder"}
        </button>
      </form>
    </div>
  );
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("overview");
  const [state, setState] = useState({ completedTasks: [], questions: [] });
  const [loading, setLoading] = useState(true);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/state");
      if (res.ok) {
        const data = await res.json();
        setState(data);
      }
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
  const doneMicros = data.tasks.filter(t => t.type !== "macro" && t.status === "done");
  const humanMacros = macroTasks.filter(t => t.assigneeType === "human");
  const agentMacros = macroTasks.filter(t => t.assigneeType === "agent");
  const subAgents = data.subAgents || [];
  const phases = data.phases || [];

  const pendingQuestions = state.questions.filter(q => q.status === "pending");
  const answeredQuestions = state.questions.filter(q => q.status === "answered");

  const humanPendingSubtasks = humanMacros.flatMap(t => (t.subtasks || []).filter(s => !state.completedTasks.includes(s.id)));
  const pendingCount = humanPendingSubtasks.length + pendingQuestions.length;

  const tabs = [
    { id: "fundacao", label: "Fundacao" },
    { id: "overview", label: "Visao Geral" },
    { id: "pendencias", label: `Pendencias`, alert: pendingCount },
    { id: "agents", label: "Agentes" },
    { id: "projects", label: "Projetos" },
    { id: "tasks", label: "Todas Tarefas" },
    { id: "org", label: "Organograma" },
  ];

  return (
    <>
      <div className="header">
        <h1>MAAT <span>VIRTUAL</span></h1>
        <div className="header-right">
          <span className="header-badge">CRESCIMENTO</span>
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

        {/* ===== VISAO GERAL ===== */}
        {activeTab === "overview" && (
          <div>
            <div className="stats">
              <div className="stat"><div className="stat-value" style={{ color: "var(--laranja)" }}>{data.agents.length}</div><div className="stat-label">Diretores IA</div></div>
              <div className="stat"><div className="stat-value" style={{ color: "var(--roxo)" }}>{subAgents.length}</div><div className="stat-label">Sub-Agentes</div></div>
              <div className="stat"><div className="stat-value" style={{ color: "var(--folha)" }}>{data.humans.length}</div><div className="stat-label">Humanos</div></div>
              <div className="stat"><div className="stat-value" style={{ color: "#3b82f6" }}>{data.projects.length}</div><div className="stat-label">Projetos</div></div>
              <div className="stat clickable" onClick={() => setActiveTab("pendencias")} style={{ cursor: "pointer" }}>
                <div className="stat-value" style={{ color: pendingCount > 0 ? "var(--vermelho)" : "var(--folha)" }}>{pendingCount}</div>
                <div className="stat-label">{pendingCount > 0 ? "Pendencias Humanas" : "Tudo em dia"}</div>
              </div>
            </div>

            {pendingCount > 0 && (
              <div className="alert-banner" onClick={() => setActiveTab("pendencias")} style={{ cursor: "pointer" }}>
                <strong>{pendingCount} pendencia{pendingCount !== 1 ? "s" : ""}</strong> esperando resposta ou acao dos humanos
              </div>
            )}

            {phases.length > 0 && (
              <>
                <div className="section-title">Plano de Execucao — 4 Fases</div>
                <div className="grid-2" style={{ marginBottom: "2rem" }}>
                  {phases.map(p => (
                    <div key={p.id} className="card" style={{ borderLeft: `4px solid ${p.status === "active" ? "var(--laranja)" : "var(--cinza-300)"}` }}>
                      <div className="card-header">
                        <div className="card-title">{p.name}</div>
                        <span className={`badge ${p.status === "active" ? "badge-orange" : "badge-gray"}`}>{p.status === "active" ? "Ativa" : "Proxima"}</span>
                      </div>
                      <p style={{ fontSize: "0.82rem", color: "var(--cinza-700)", marginBottom: "0.5rem" }}>{p.description}</p>
                      <div style={{ fontSize: "0.7rem", color: "var(--cinza-500)" }}>{p.timeline}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="grid-2">
              <div className="card">
                <div className="card-header"><div className="card-title">Prioridade #1: E-commerce B2C</div><span className="badge badge-orange">Em Andamento</span></div>
                <p style={{ fontSize: "0.82rem", color: "var(--cinza-700)", marginBottom: "1rem" }}>Lancar bebamaat.com.br e vender muito. Staging v0.2.0 pronto para revisao.</p>
                <div className="progress-bar"><div className="progress-fill" style={{ width: "85%", background: "var(--laranja)" }}></div></div>
                <div className="progress-label"><span>Progresso</span><span>85%</span></div>
              </div>

              <div className="card">
                <div className="card-header"><div className="card-title">Equipe</div></div>
                <div style={{ marginTop: "0.3rem" }}>
                  {[...humanMacros, ...agentMacros].map(t => (
                    <div key={t.id} style={{ fontSize: "0.8rem", display: "flex", justifyContent: "space-between", padding: "0.35rem 0", borderBottom: "1px solid var(--cinza-100)" }}>
                      <span><strong>{t.assignee}</strong> <span style={{ color: "var(--cinza-500)", fontSize: "0.7rem" }}>({t.assigneeType === "human" ? data.humans.find(h => h.name === t.assignee)?.role : data.agents.find(a => a.name === t.assignee)?.role})</span></span>
                      <span style={{ fontSize: "0.7rem", maxWidth: "55%", textAlign: "right", color: "var(--cinza-700)" }}>{t.title.substring(0, 50)}{t.title.length > 50 ? "..." : ""}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== PENDENCIAS ===== */}
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

        {/* ===== AGENTES ===== */}
        {activeTab === "agents" && (
          <div>
            <div className="section-title">Diretoria Virtual <span className="count">{data.agents.length}</span></div>
            <div className="grid-2" style={{ marginBottom: "2rem" }}>
              {data.agents.map(a => {
                const macro = macroTasks.find(t => t.assignee === a.name && t.status !== "done");
                return (
                  <div key={a.name} className="agent-card" style={{ borderLeftColor: a.color }}>
                    <div className="agent-avatar" style={{ background: a.color }}>{a.initials}</div>
                    <div className="agent-name">{a.name}</div>
                    <div className="agent-role">{a.role}</div>
                    <div className="agent-desc">{a.description}</div>
                    {macro && <div className="agent-macro"><strong>Objetivo:</strong> {macro.title}</div>}
                    <div className="agent-tags">{a.tags.map(t => <span key={t} className="agent-tag">{t}</span>)}</div>
                    <div style={{ marginTop: "0.7rem" }}>
                      <BadgeStatus status={a.status} />
                      {macro && <>{" "}<span className="badge badge-gray">{macro.subtasks?.length || 0} tarefas</span></>}
                    </div>
                  </div>
                );
              })}
            </div>

            {subAgents.length > 0 && (
              <>
                <div className="section-title">Sub-Agentes Operacionais <span className="count">{subAgents.length}</span></div>
                <div className="grid-3" style={{ marginBottom: "2rem" }}>
                  {subAgents.map(s => (
                    <div key={s.name} className="agent-card" style={{ borderLeftColor: s.color }}>
                      <div className="agent-avatar" style={{ background: s.color }}>{s.initials}</div>
                      <div className="agent-name">{s.name}</div>
                      <div className="agent-role">{s.role}</div>
                      <div className="agent-desc">{s.description}</div>
                      <div className="agent-tags">{s.tags.map(t => <span key={t} className="agent-tag">{t}</span>)}</div>
                      <div style={{ marginTop: "0.7rem", fontSize: "0.7rem", color: "var(--cinza-500)" }}>
                        Criado por <strong>{s.createdBy}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="section-title">Equipe Humana <span className="count">{data.humans.length}</span></div>
            <div className="grid-2">
              {data.humans.map(h => {
                const macro = macroTasks.find(t => t.assignee === h.name && t.status !== "done");
                return (
                  <div key={h.name} className="agent-card" style={{ borderLeftColor: "var(--cinza-300)", background: "var(--cinza-100)" }}>
                    <div className="agent-name">{h.name}</div>
                    <div className="agent-role">{h.role}</div>
                    <div className="agent-desc">{h.scope}</div>
                    {macro && <div className="agent-macro"><strong>Objetivo:</strong> {macro.title}</div>}
                    <span className="badge badge-green">Humano</span>
                    {macro && <>{" "}<span className="badge badge-gray">{macro.subtasks?.length || 0} tarefas</span></>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== PROJETOS ===== */}
        {activeTab === "projects" && (
          <div>
            <div className="section-title">Projetos <span className="count">{data.projects.length}</span></div>
            <div className="grid-2">
              {data.projects.map(p => (
                <div key={p.id} className="card" style={{ borderTop: `4px solid ${p.id === "ecommerce-b2c" ? "var(--laranja)" : "var(--roxo)"}` }}>
                  <div className="card-header"><div className="card-title">{p.name}</div><BadgeStatus status={p.status} /></div>
                  <p style={{ fontSize: "0.82rem", color: "var(--cinza-700)", marginBottom: "1rem" }}>{p.description}</p>
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
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${p.progress}%`, background: p.id === "ecommerce-b2c" ? "var(--laranja)" : "#3b82f6" }}></div></div>
                    <div className="progress-label"><span>Progresso</span><span>{p.progress}%</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== TODAS TAREFAS ===== */}
        {activeTab === "tasks" && (
          <div>
            <div className="section-title">Humanos <span className="count">{humanMacros.length}</span></div>
            {humanMacros.map(t => <MacroCard key={t.id} task={t} completedTasks={state.completedTasks} onToggle={toggleTask} showAssignee />)}

            <div className="section-title" style={{ marginTop: "2rem" }}>Agentes <span className="count">{agentMacros.length}</span></div>
            {agentMacros.map(t => <MacroCard key={t.id} task={t} completedTasks={state.completedTasks} onToggle={toggleTask} showAssignee />)}

            {doneMicros.length > 0 && (
              <>
                <div className="section-title" style={{ marginTop: "2rem" }}>Entregas Concluidas <span className="count">{doneMicros.length}</span></div>
                <div className="card">
                  {doneMicros.map(t => (
                    <div key={t.id} className="subtask-item">
                      <div className="subtask-check done" />
                      <span className="subtask-title done">{t.title}</span>
                      <span style={{ fontSize: "0.7rem", color: "var(--cinza-500)" }}>{t.assignee}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ===== FUNDACAO ===== */}
        {activeTab === "fundacao" && (
          <div>
            <div className="section-title">Frente A — Fundacao Conceitual</div>
            <DocViewer src="/docs/frente-a.md" />
          </div>
        )}

        {/* ===== ORGANOGRAMA ===== */}
        {activeTab === "org" && (
          <div>
            <div className="section-title">Organograma MAAT (Humanos + Virtual)</div>
            <div className="card">
              <div className="org-chart">
                <div className="org-label">Lideranca Estrategica (Humanos)</div>
                <div className="org-level">
                  <div className="org-node"><div className="org-node-name">Lucas</div><div className="org-node-role">Co-CEO</div></div>
                  <div className="org-node"><div className="org-node-name">Julia</div><div className="org-node-role">Co-CEO</div></div>
                </div>
                <div className="org-divider">|</div>
                <div className="org-label">Tecnologia + Coordenacao</div>
                <div className="org-level">
                  <div className="org-node"><div className="org-node-name">Cleber</div><div className="org-node-role">Head de Tecnologia</div></div>
                  <div className="org-node ai"><div className="org-node-name">Claudio</div><div className="org-node-role">Chief of Staff</div></div>
                </div>
                <div className="org-divider">|</div>
                <div className="org-label">Diretoria Virtual</div>
                <div className="org-level">
                  {data.agents.filter(a => a.name !== "Claudio").map(a => (
                    <div key={a.name} className="org-node ai" style={{ borderColor: a.color }}>
                      <div className="org-node-name">{a.name}</div>
                      <div className="org-node-role">{a.role}</div>
                    </div>
                  ))}
                </div>
                {subAgents.length > 0 && (
                  <>
                    <div className="org-divider">|</div>
                    <div className="org-label">Sub-Agentes Operacionais</div>
                    <div className="org-level">
                      {subAgents.map(s => (
                        <div key={s.name} className="org-node ai" style={{ borderColor: s.color }}>
                          <div className="org-node-name">{s.name}</div>
                          <div className="org-node-role">{s.role}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <div className="org-divider">|</div>
                <div className="org-label">Operacoes</div>
                <div className="org-level">
                  <div className="org-node"><div className="org-node-name">Paula</div><div className="org-node-role">Logistica</div></div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      <div style={{ textAlign: "center", padding: "2rem", fontSize: "0.7rem", color: "var(--cinza-500)" }}>
        MAAT Virtual — Atualizado por Claudio em {data.lastUpdated.split("T")[0]}
      </div>
    </>
  );
}
