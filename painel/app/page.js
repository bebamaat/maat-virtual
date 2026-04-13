"use client";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import data from "../data/maat-virtual.json";

function getFirstName(email) {
  if (!email) return "";
  const map = {
    "cleber@bebamaat.com.br": "Cleber",
    "alo@bebamaat.com.br": "Cleber",
    "lucas@bebamaat.com.br": "Lucas",
    "julia@bebamaat.com.br": "Julia",
    "paula@bebamaat.com.br": "Paula",
  };
  return map[email.toLowerCase()] || email.split("@")[0];
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

function SubtaskItem({ task }) {
  const checkClass = task.status === "done" ? "done" : task.status === "in_progress" ? "in-progress" : "";
  return (
    <div className="subtask-item">
      <div className={`subtask-check ${checkClass}`}></div>
      <span className={`subtask-title ${task.status === "done" ? "done" : ""}`}>{task.title}</span>
      <BadgePriority priority={task.priority} />
    </div>
  );
}

function MacroTaskCard({ task, showAssignee }) {
  const [expanded, setExpanded] = useState(false);
  const subtasks = task.subtasks || [];
  const doneCount = subtasks.filter(s => s.status === "done").length;
  const totalCount = subtasks.length;
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const priorityColor = {
    critical: "var(--vermelho)", high: "var(--laranja)", medium: "#3b82f6", low: "var(--cinza-500)"
  };

  return (
    <div className="macro-card" style={{ borderLeft: `4px solid ${priorityColor[task.priority] || "var(--cinza-300)"}` }}>
      <div className="macro-header" onClick={() => setExpanded(!expanded)} style={{ cursor: "pointer" }}>
        <div className="macro-header-left">
          <div className="macro-title">{task.title}</div>
          <div className="macro-meta">
            {showAssignee && <span><strong>{task.assignee}</strong></span>}
            <BadgePriority priority={task.priority} />
            <BadgeStatus status={task.status} />
            <span className="macro-project">{task.project}</span>
          </div>
        </div>
        <div className="macro-header-right">
          {totalCount > 0 && <span className="macro-counter">{doneCount}/{totalCount}</span>}
          <span className="macro-expand">{expanded ? "−" : "+"}</span>
        </div>
      </div>
      {task.description && (
        <div className="macro-desc">{task.description}</div>
      )}
      {totalCount > 0 && (
        <div style={{ marginTop: "0.7rem" }}>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${progressPct}%`, background: priorityColor[task.priority] || "var(--cinza-300)" }}></div></div>
        </div>
      )}
      {expanded && subtasks.length > 0 && (
        <div className="subtask-list">
          {subtasks.map(s => <SubtaskItem key={s.id} task={s} />)}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("mytasks");

  if (!session) return null;

  const userName = getFirstName(session.user?.email);

  const macroTasks = data.tasks.filter(t => t.type === "macro");
  const doneTasks = data.tasks.filter(t => t.type !== "macro" && t.status === "done");

  const myMacros = macroTasks.filter(t => t.assignee === userName && t.status !== "done");
  const myDoneMacros = macroTasks.filter(t => t.assignee === userName && t.status === "done");
  const humanMacros = macroTasks.filter(t => t.assigneeType === "human" && t.status !== "done");
  const agentMacros = macroTasks.filter(t => t.assigneeType === "agent" && t.status !== "done");
  const allPendingMacros = macroTasks.filter(t => t.status !== "done");

  const nextMacro = myMacros.find(t => t.priority === "critical") || myMacros.find(t => t.priority === "high") || myMacros[0];

  const subAgents = data.subAgents || [];
  const phases = data.phases || [];

  const tabs = [
    { id: "mytasks", label: `Meu Foco (${myMacros.length})`, highlight: true },
    { id: "overview", label: "Visao Geral" },
    { id: "agents", label: "Agentes" },
    { id: "projects", label: "Projetos" },
    { id: "tasks", label: "Todas Tarefas" },
    { id: "org", label: "Organograma" },
  ];

  return (
    <>
      {/* HEADER */}
      <div className="header">
        <h1>MAAT <span>VIRTUAL</span></h1>
        <div className="header-right">
          <span className="header-badge">CRESCIMENTO</span>
          <div className="user-info">
            {session.user?.image && <img className="user-avatar" src={session.user.image} alt="" />}
            <span className="user-name">{session.user?.name || userName}</span>
          </div>
          <button className="btn-logout" onClick={() => signOut()}>Sair</button>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs">
        {tabs.map(t => (
          <button key={t.id} className={`tab ${activeTab === t.id ? "active" : ""} ${t.highlight ? "highlight" : ""}`}
            onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="content">

        {/* ===== MEU FOCO ===== */}
        {activeTab === "mytasks" && (
          <div>
            <div className="my-tasks-hero">
              <h2>Ola, {userName}!</h2>
              <p>Voce tem {myMacros.length} objetivo{myMacros.length !== 1 ? "s" : ""} em andamento.</p>
              {nextMacro && (
                <div className="my-tasks-next">
                  <strong>Seu foco principal</strong>
                  {nextMacro.title}
                </div>
              )}
            </div>

            <div className="section-title">Objetivos Ativos <span className="count">{myMacros.length}</span></div>
            {myMacros.length === 0 && <div className="card"><p style={{ color: "var(--cinza-500)", fontSize: "0.85rem" }}>Nenhum objetivo pendente. Parabens!</p></div>}
            {myMacros.map(t => <MacroTaskCard key={t.id} task={t} />)}

            {myDoneMacros.length > 0 && (
              <>
                <div className="section-title" style={{ marginTop: "1.5rem" }}>Concluidos <span className="count">{myDoneMacros.length}</span></div>
                {myDoneMacros.map(t => <MacroTaskCard key={t.id} task={t} />)}
              </>
            )}

            {doneTasks.filter(t => t.assignee === userName).length > 0 && (
              <>
                <div className="section-title" style={{ marginTop: "1.5rem" }}>Entregas Concluidas <span className="count">{doneTasks.filter(t => t.assignee === userName).length}</span></div>
                <div className="card">
                  {doneTasks.filter(t => t.assignee === userName).map(t => (
                    <div key={t.id} className="subtask-item">
                      <div className="subtask-check done"></div>
                      <span className="subtask-title done">{t.title}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ===== VISAO GERAL ===== */}
        {activeTab === "overview" && (
          <div>
            <div className="stats">
              <div className="stat"><div className="stat-value" style={{ color: "var(--laranja)" }}>{data.agents.length}</div><div className="stat-label">Diretores</div></div>
              <div className="stat"><div className="stat-value" style={{ color: "var(--roxo)" }}>{subAgents.length}</div><div className="stat-label">Sub-Agentes</div></div>
              <div className="stat"><div className="stat-value" style={{ color: "var(--folha)" }}>{data.humans.length}</div><div className="stat-label">Humanos</div></div>
              <div className="stat"><div className="stat-value" style={{ color: "#3b82f6" }}>{data.projects.length}</div><div className="stat-label">Projetos</div></div>
              <div className="stat"><div className="stat-value" style={{ color: "var(--vermelho)" }}>{allPendingMacros.length}</div><div className="stat-label">Objetivos Ativos</div></div>
            </div>

            {phases.length > 0 && (
              <>
                <div className="section-title">Plano de Execucao</div>
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
                <div className="card-header"><div className="card-title">Objetivos por Area</div></div>
                <table>
                  <tbody>
                    <tr><td style={{ fontWeight: 600 }}>Humanos</td><td>{humanMacros.length} objetivos</td></tr>
                    <tr><td style={{ fontWeight: 600 }}>Agentes</td><td>{agentMacros.length} objetivos</td></tr>
                  </tbody>
                </table>
                <div style={{ marginTop: "1rem" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>Por pessoa:</div>
                  {[...new Set(allPendingMacros.map(t => t.assignee))].map(name => {
                    const macro = allPendingMacros.find(t => t.assignee === name);
                    const subtotalSub = macro?.subtasks?.length || 0;
                    return (
                      <div key={name} style={{ fontSize: "0.8rem", display: "flex", justifyContent: "space-between", padding: "0.3rem 0" }}>
                        <span>{name}</span>
                        <span style={{ fontWeight: 700 }}>1 obj / {subtotalSub} tarefas</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
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
                    {macro && (
                      <div className="agent-macro">
                        <strong>Objetivo:</strong> {macro.title}
                      </div>
                    )}
                    <div className="agent-tags">{a.tags.map(t => <span key={t} className="agent-tag">{t}</span>)}</div>
                    <div style={{ marginTop: "0.7rem" }}>
                      <BadgeStatus status={a.status} />
                      {macro && <>
                        {" "}
                        <span className="badge badge-gray">{macro.subtasks?.length || 0} tarefas</span>
                      </>}
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
                    {macro && (
                      <div className="agent-macro">
                        <strong>Objetivo:</strong> {macro.title}
                      </div>
                    )}
                    <span className="badge badge-green">Humano</span>
                    {macro && <>
                      {" "}
                      <span className="badge badge-gray">{macro.subtasks?.length || 0} tarefas</span>
                    </>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== PROJETOS ===== */}
        {activeTab === "projects" && (
          <div>
            <div className="section-title">Projetos Ativos <span className="count">{data.projects.length}</span></div>
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
            {humanMacros.map(t => <MacroTaskCard key={t.id} task={t} showAssignee />)}

            <div className="section-title" style={{ marginTop: "2rem" }}>Agentes <span className="count">{agentMacros.length}</span></div>
            {agentMacros.map(t => <MacroTaskCard key={t.id} task={t} showAssignee />)}

            {doneTasks.length > 0 && (
              <>
                <div className="section-title" style={{ marginTop: "2rem" }}>Entregas Concluidas <span className="count">{doneTasks.length}</span></div>
                <div className="card">
                  {doneTasks.map(t => (
                    <div key={t.id} className="subtask-item">
                      <div className="subtask-check done"></div>
                      <span className="subtask-title done">{t.title}</span>
                      <span style={{ fontSize: "0.7rem", color: "var(--cinza-500)" }}>{t.assignee}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
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
