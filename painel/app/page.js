"use client";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useCallback, Fragment } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import data from "../data/maat-virtual.json";
import { STATUS_LABEL, STATUS_BADGE, agruparPorCoordenador } from "../lib/validate.js";

const humanosMap = Object.fromEntries(data.humanos.map(h => [h.id, h]));
const coordenadoresMap = Object.fromEntries(data.coordenadores.map(c => [c.id, c]));
const especialistasMap = Object.fromEntries(data.especialistas.map(e => [e.id, e]));
const govMap = Object.fromEntries(data.governancaTecnica.map(g => [g.id, g]));
const ferramentasMap = Object.fromEntries(data.ferramentas.map(f => [f.id, f]));
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
    if (!agente) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [agente, onClose]);

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
                  <button key={e.id} id={`agente-${e.id}`} type="button" className="tv-card" onClick={() => setAgenteAberto(e)}>
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

const STATUS_IMPL_LABEL = {
  "implementado": "Implementado",
  "em-implementacao": "Em implementação",
  "nao-iniciado": "Não iniciado",
};
const STATUS_IMPL_CLASS = {
  "implementado": "me-status-ok",
  "em-implementacao": "me-status-wip",
  "nao-iniciado": "me-status-idle",
};

function ToolModal({ ferramenta, onClose }) {
  useEffect(() => {
    if (!ferramenta) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [ferramenta, onClose]);

  if (!ferramenta) return null;

  const deps = ferramenta.dependencias || [];

  return (
    <div className="tv-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="tv-modal" role="dialog" aria-modal="true" aria-label={ferramenta.nome}>
        <button className="tv-modal-close" onClick={onClose} aria-label="Fechar">×</button>

        <div className="tv-modal-head">
          <div className="tv-modal-name">{ferramenta.nome}</div>
          <div className="tv-modal-funcao">Categoria: {ferramenta.categoria}</div>
          <div className="tv-modal-meta">
            <span className={`me-pill ${STATUS_IMPL_CLASS[ferramenta.statusImplementacao] || ""}`}>
              <span className="me-tool-dot" />
              {STATUS_IMPL_LABEL[ferramenta.statusImplementacao] || ferramenta.statusImplementacao}
            </span>
          </div>
        </div>

        <section className="tv-modal-sec">
          <div className="tv-modal-label">Descrição</div>
          <div className="tv-modal-desc">
            {ferramenta.descricao || <span className="tv-tbd">A definir</span>}
          </div>
        </section>

        <section className="tv-modal-sec">
          <div className="tv-modal-label">
            Dependências
            {deps.length > 0 && <span className="tv-modal-count">{deps.length}</span>}
          </div>
          <div className="tv-tag-wrap">
            {deps.length > 0
              ? deps.map(d => (
                  <span key={d} className="tv-tag">
                    <span className="tv-tag-dot" />
                    {d}
                  </span>
                ))
              : <span className="tv-tbd">Nenhuma</span>
            }
          </div>
        </section>

        {ferramenta.notaStatus && (
          <section className="tv-modal-sec">
            <div className="tv-modal-label">Nota de implementação</div>
            <div className="tv-modal-desc">{ferramenta.notaStatus}</div>
          </section>
        )}
      </div>
    </div>
  );
}

function MapaEstrategicoView({ setActiveTab }) {
  const { mapaEstrategico, ferramentas } = data;
  const [toolOpen, setToolOpen] = useState(null);
  const [statusFilter, setStatusFilter] = useState(["implementado", "em-implementacao", "nao-iniciado"]);

  function toggleStatus(s) {
    setStatusFilter(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  function renderTool(toolId) {
    const f = ferramentasMap[toolId];
    if (!f) return null;
    const active = statusFilter.includes(f.statusImplementacao);
    return (
      <button
        key={toolId}
        type="button"
        className={`me-tool ${STATUS_IMPL_CLASS[f.statusImplementacao] || ""} ${active ? "" : "me-tool-dim"}`}
        onClick={() => setToolOpen(f)}
        title={f.nome}
      >
        <span className="me-tool-dot" />
        {f.nome}
      </button>
    );
  }

  function renderSetor(s) {
    return (
      <div key={s.nome} className="me-setor">
        <div className="me-setor-nome">{s.nome}</div>
        {s.subsetores ? (
          <div className="me-subsetores">
            {s.subsetores.map(ss => (
              <div key={ss.nome} className="me-subsetor">
                <div className="me-subsetor-nome">{ss.nome}</div>
                <div className="me-tool-list">
                  {ss.ferramentas.map(renderTool)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="me-tool-list">
            {(s.ferramentas || []).map(renderTool)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="me-root">
      <div className="me-org-head">
        <div className="me-org-nome">MAAT Agroflorestal LTDA</div>
        <div className="me-org-sub">{mapaEstrategico.areas.length} áreas · {ferramentas.length} ferramentas</div>
      </div>

      <div className="me-areas">
        {mapaEstrategico.areas.map(a => (
          <div key={a.id} className="me-area">
            <div className="me-area-head">{a.nome}</div>
            <div className="me-setores">
              {a.setores.map(renderSetor)}
            </div>
          </div>
        ))}
      </div>

      <div className="me-legenda">
        <span className="me-legenda-title">Legenda · clique para filtrar</span>
        {["implementado", "em-implementacao", "nao-iniciado"].map(s => (
          <button
            key={s}
            type="button"
            className={`me-legenda-item ${STATUS_IMPL_CLASS[s]} ${statusFilter.includes(s) ? "" : "me-legenda-off"}`}
            onClick={() => toggleStatus(s)}
          >
            <span className="me-tool-dot" />
            {STATUS_IMPL_LABEL[s]}
          </button>
        ))}
      </div>

      <div className="me-conector">{mapaEstrategico.conector}</div>

      <div className="me-virtual-links">
        <button type="button" className="card me-virtual-link" onClick={() => setActiveTab("org")}>
          <div className="me-virtual-title">Ver organograma completo</div>
          <div className="me-virtual-sub">→ aba Organograma</div>
        </button>
        <button type="button" className="card me-virtual-link" onClick={() => setActiveTab("agents")}>
          <div className="me-virtual-title">Ver os 44 agentes</div>
          <div className="me-virtual-sub">→ aba Time Virtual</div>
        </button>
      </div>

      <ToolModal ferramenta={toolOpen} onClose={() => setToolOpen(null)} />
    </div>
  );
}

const FLUXO_FASES = [
  { id: "atr", label: "Atração" },
  { id: "ped", label: "Pedido" },
  { id: "pag", label: "Pagamento" },
  { id: "ops", label: "Operações" },
  { id: "ent", label: "Entrega" },
  { id: "pos", label: "Pós-venda" },
];

function faseDeEtapa(etapaId) {
  const sufixo = (etapaId.split("_")[1] || "");
  if (sufixo === "atr") return "atr";
  if (sufixo === "ped" || sufixo === "menu" || sufixo === "prop") return "ped";
  if (sufixo === "pag") return "pag";
  if (sufixo === "ops") return "ops";
  if (sufixo === "ent") return "ent";
  if (sufixo.startsWith("pos")) return "pos";
  return null;
}

function StepModal({ etapa, canalNome, onClose }) {
  useEffect(() => {
    if (!etapa) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [etapa, onClose]);

  if (!etapa) return null;

  const tech = etapa.detalheTecnico || [];

  return (
    <div className="tv-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="tv-modal" role="dialog" aria-modal="true" aria-label={etapa.nome}>
        <button className="tv-modal-close" onClick={onClose} aria-label="Fechar">×</button>

        <div className="tv-modal-head">
          <div className="tv-modal-name">
            <span style={{ marginRight: "0.5rem" }}>{etapa.icone}</span>
            {etapa.nome}
          </div>
          <div className="tv-modal-funcao">Canal: {canalNome}</div>
        </div>

        <section className="tv-modal-sec">
          <div className="tv-modal-label">Detalhe de negócio</div>
          <div className="tv-modal-desc">{etapa.detalheNegocio}</div>
        </section>

        {tech.length > 0 && (
          <section className="tv-modal-sec">
            <div className="tv-modal-label">
              Stack técnico
              <span className="tv-modal-count">{tech.length}</span>
            </div>
            <div className="fluxo-tech-grid">
              {tech.map((t, i) => (
                <div key={i} className="fluxo-tech-card">
                  <div className="fluxo-tech-title">{t.t}</div>
                  <div className="fluxo-tech-body">{t.b}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {etapa.maatVirtualNota && (
          <section className="tv-modal-sec">
            <div className="tv-modal-label">MAAT Virtual</div>
            <div className="fluxo-virtual-note">{etapa.maatVirtualNota}</div>
          </section>
        )}
      </div>
    </div>
  );
}

function FluxoOperacionalView() {
  const { fluxoOperacional } = data;
  const [open, setOpen] = useState(null);

  return (
    <div className="fluxo-root">
      <div className="fluxo-grid">
        <div className="fluxo-head-cell" aria-hidden="true" />
        {FLUXO_FASES.map(f => (
          <div key={f.id} className="fluxo-fase-head">{f.label}</div>
        ))}
        {fluxoOperacional.canais.map(canal => (
          <Fragment key={canal.id}>
            <div className="fluxo-canal-head">
              <div className="fluxo-canal-nome">{canal.nome}</div>
              <div className="fluxo-canal-desc">{canal.descricao}</div>
            </div>
            {FLUXO_FASES.map(f => {
              const etapas = canal.etapas.filter(e => faseDeEtapa(e.id) === f.id);
              return (
                <div key={f.id} className="fluxo-cell" data-fase={f.label}>
                  {etapas.map(e => (
                    <button
                      key={e.id}
                      type="button"
                      className="fluxo-step"
                      onClick={() => setOpen({ etapa: e, canalNome: canal.nome })}
                      title={e.nome}
                    >
                      <span className="fluxo-step-icon" aria-hidden="true">{e.icone}</span>
                      <span className="fluxo-step-name">{e.nome.split(" — ")[0]}</span>
                    </button>
                  ))}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>

      <div className="fluxo-convergencia">
        <div className="fluxo-convergencia-label">Convergência crítica</div>
        <div className="fluxo-convergencia-text">{fluxoOperacional.convergenciaCritica}</div>
      </div>

      <StepModal
        etapa={open?.etapa}
        canalNome={open?.canalNome}
        onClose={() => setOpen(null)}
      />
    </div>
  );
}

const TIER_LABEL = { alto: "Alto", medio: "Médio", baixo: "Baixo" };

function ImpactoPill({ tier, eixo }) {
  if (!tier) return null;
  return (
    <span className={`pill-tier pill-tier-${tier}`}>
      {TIER_LABEL[tier]} impacto {eixo}
    </span>
  );
}

function RoadmapItem({ item }) {
  const hasPre = (item.prerequisitos || []).length > 0;
  const hasDestrava = (item.destrava || []).length > 0;
  return (
    <div className="roadmap-item">
      <div className="roadmap-item-head">
        <span className="roadmap-item-id">{item.id}</span>
        <span className="roadmap-item-titulo">{item.titulo}</span>
      </div>
      <div className="roadmap-item-pills">
        <ImpactoPill tier={item.impactoDireto} eixo="direto" />
        <ImpactoPill tier={item.impactoCadeia} eixo="cadeia" />
      </div>
      {hasPre && (
        <div className="roadmap-item-meta">
          <span className="roadmap-item-meta-label">Pré-requisitos:</span>
          <span className="roadmap-item-meta-val">{item.prerequisitos.join(" · ")}</span>
        </div>
      )}
      {hasDestrava && (
        <div className="roadmap-item-meta">
          <span className="roadmap-item-meta-label">Destrava:</span>
          <span className="roadmap-item-meta-val">{item.destrava.join(" · ")}</span>
        </div>
      )}
      {item.nota && <div className="roadmap-item-nota">{item.nota}</div>}
    </div>
  );
}

function RoadmapBloco({ p }) {
  return (
    <div className={`roadmap-bloco roadmap-bloco-n${p.nivel}`}>
      <div className="roadmap-bloco-head">
        <div className="roadmap-bloco-num">P{p.nivel}</div>
        <div>
          <div className="roadmap-bloco-titulo">{p.titulo}</div>
          <div className="roadmap-bloco-sprint">{p.sprint}</div>
        </div>
      </div>
      <div className="roadmap-itens">
        {p.itens.map(i => <RoadmapItem key={i.id} item={i} />)}
      </div>
    </div>
  );
}

function RoadmapP5Bloco({ p, navigateToAgent }) {
  return (
    <div className={`roadmap-bloco roadmap-bloco-n${p.nivel}`}>
      <div className="roadmap-bloco-head">
        <div className="roadmap-bloco-num">P{p.nivel}</div>
        <div>
          <div className="roadmap-bloco-titulo">{p.titulo}</div>
          <div className="roadmap-bloco-sprint">{p.sprint}</div>
        </div>
      </div>
      {p.notaFrenteB && (
        <div className="roadmap-frenteb-nota">
          <div className="roadmap-frenteb-label">Frente B</div>
          <div className="roadmap-frenteb-text">{p.notaFrenteB}</div>
        </div>
      )}
      <ol className="roadmap-p5-list">
        {p.itens.map(i => {
          const hasPre = (i.prerequisitos || []).length > 0;
          return (
            <li key={i.id} className="roadmap-p5-item">
              <button
                type="button"
                className="roadmap-p5-btn"
                onClick={() => navigateToAgent(i.agente)}
                title="Abrir no Time Virtual"
              >
                <span className="roadmap-item-id">{i.id}</span>
                <span className="roadmap-p5-titulo">{i.titulo}</span>
                <span className="roadmap-pill roadmap-pill-dev">dev</span>
                {hasPre && (
                  <span className="roadmap-p5-pre">após {i.prerequisitos.join(" · ")}</span>
                )}
                {i.nota && <span className="roadmap-p5-nota">{i.nota}</span>}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function TimelineProjecao({ projecao }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div className="roadmap-timeline">
      <div className="roadmap-timeline-head">Projeção</div>
      {projecao.map((m, i) => (
        <div key={i} className={`roadmap-timeline-row ${m.atual ? "roadmap-timeline-row-atual" : ""}`}>
          <div className="roadmap-timeline-dot" aria-hidden="true" />
          <div className="roadmap-timeline-label">{m.milestone}</div>
          <div className="roadmap-timeline-bar">
            <div
              className="roadmap-timeline-fill"
              style={{ width: animated ? `${m.progressoPct}%` : "0%" }}
            />
          </div>
          <div className="roadmap-timeline-pct">{m.progressoPct}%</div>
        </div>
      ))}
    </div>
  );
}

function FrentesGlossario({ b2 }) {
  return (
    <section className="roadmap-header-bloco">
      <h3 className="roadmap-header-h3">{b2.titulo}</h3>
      <div className="roadmap-glossario-grid">
        <div className="roadmap-glossario-col">
          <div className="roadmap-glossario-col-titulo">{b2.colunaAgentes.titulo}</div>
          {b2.colunaAgentes.itens.map(i => (
            <div key={i.rotulo} className="roadmap-glossario-item">
              <span className="roadmap-glossario-rotulo">{i.rotulo}</span> — {i.texto}
            </div>
          ))}
        </div>
        <div className="roadmap-glossario-col">
          <div className="roadmap-glossario-col-titulo">{b2.colunaTrabalho.titulo}</div>
          {b2.colunaTrabalho.itens.map(i => (
            <div key={i.rotulo} className="roadmap-glossario-item">
              <span className="roadmap-glossario-rotulo">{i.rotulo}</span> — {i.texto}
            </div>
          ))}
        </div>
      </div>
      <div className="roadmap-glossario-nota">{b2.nota}</div>
    </section>
  );
}

function TimelineHorizontal({ b3 }) {
  return (
    <section className="roadmap-header-bloco">
      <h3 className="roadmap-header-h3">{b3.titulo}</h3>
      <div className="roadmap-timeline-h">
        {b3.marcos.map((m, i) => (
          <div key={i} className={`roadmap-timeline-h-marco ${m.atual ? "roadmap-timeline-h-marco-atual" : ""}`}>
            <div className="roadmap-timeline-h-periodo">{m.periodo}</div>
            <div className="roadmap-timeline-h-dot" aria-hidden="true" />
            <div className="roadmap-timeline-h-titulo">{m.titulo}</div>
            <div className="roadmap-timeline-h-sub">{m.subtitulo}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RoadmapHeader({ header }) {
  return (
    <div className="roadmap-header">
      <section className="roadmap-header-bloco">
        <h2 className="roadmap-header-h2">{header.bloco1.titulo}</h2>
        <p className="roadmap-header-prose">{header.bloco1.paragrafo}</p>
      </section>
      <FrentesGlossario b2={header.bloco2} />
      <TimelineHorizontal b3={header.bloco3} />
      <section className="roadmap-header-bloco">
        <h3 className="roadmap-header-h3">{header.bloco4.titulo}</h3>
        <p className="roadmap-header-prose">{header.bloco4.paragrafo}</p>
      </section>
    </div>
  );
}

function RoadmapView({ navigateToAgent }) {
  const { prioridades, projecao, formulaImpacto, header } = data.roadmap;
  return (
    <div className="roadmap-root">
      {header && <RoadmapHeader header={header} />}

      <div className="roadmap-legenda">
        <span className="roadmap-legenda-title">Legenda</span>
        <span className="pill-tier pill-tier-alto">Alto impacto</span>
        <span className="pill-tier pill-tier-medio">Médio impacto</span>
        <span className="pill-tier pill-tier-baixo">Baixo impacto</span>
        <span className="roadmap-legenda-formula">{formulaImpacto}</span>
      </div>

      <div className="roadmap-blocos">
        {prioridades.map(p => (
          p.nivel === 5
            ? <RoadmapP5Bloco key={p.nivel} p={p} navigateToAgent={navigateToAgent} />
            : <RoadmapBloco key={p.nivel} p={p} />
        ))}
      </div>

      <TimelineProjecao projecao={projecao} />
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
  const [scrollToAgentId, setScrollToAgentId] = useState(null);

  useEffect(() => {
    if (activeTab !== "agents" || !scrollToAgentId) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(`agente-${scrollToAgentId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("agente-highlight");
        setTimeout(() => el.classList.remove("agente-highlight"), 2000);
      }
      setScrollToAgentId(null);
    }, 120);
    return () => clearTimeout(timer);
  }, [activeTab, scrollToAgentId]);

  const navigateToAgent = useCallback((agenteId) => {
    setActiveTab("agents");
    setScrollToAgentId(agenteId);
  }, []);

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
  const totalAgentes = 1 + data.coordenadores.length + data.especialistas.length + data.governancaTecnica.length;
  const totalItensRoadmap = data.roadmap.prioridades.reduce((acc, p) => acc + p.itens.length, 0);
  const ferramentasImplementadas = data.ferramentas.filter(f => f.statusImplementacao === "implementado").length;
  const ferramentasEmImplementacao = data.ferramentas.filter(f => f.statusImplementacao === "em-implementacao").length;
  const progressoPct = data.ferramentas.length > 0
    ? Math.round(((ferramentasImplementadas * 1.0 + ferramentasEmImplementacao * 0.5) / data.ferramentas.length) * 100)
    : 0;

  const tabs = [
    { id: "fundacao", label: "Fundação" },
    { id: "overview", label: "Visao Geral" },
    { id: "org", label: "Organograma" },
    { id: "agents", label: "Time Virtual" },
    { id: "mapa", label: "Mapa Estratégico" },
    { id: "fluxo", label: "Fluxo Operacional" },
    { id: "roadmap", label: "Roadmap" },
    { id: "projects", label: "Projetos" },
    { id: "pendencias", label: "Pendencias", alert: pendingCount },
    { id: "tasks", label: "Todas Tarefas" },
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
                <div className="stat-value">{humanosReais.length}<span style={{ opacity: 0.35 }}> + {representantes.length}</span></div>
                <div className="stat-label">Humanos</div>
              </div>
              <div className="stat">
                <div className="stat-value">{totalAgentes}</div>
                <div className="stat-label">Agentes</div>
              </div>
              <div className="stat">
                <div className="stat-value">{data.ferramentas.length}</div>
                <div className="stat-label">Ferramentas</div>
              </div>
              <div className="stat">
                <div className="stat-value">{totalItensRoadmap}</div>
                <div className="stat-label">Itens no Roadmap</div>
              </div>
              <div className="stat clickable" onClick={() => setActiveTab("pendencias")}>
                <div className="stat-value" style={{ color: pendingCount > 0 ? "var(--accent-alerta)" : "var(--accent-sucesso)" }}>{pendingCount}</div>
                <div className="stat-label">Pendências Humanas</div>
              </div>
              <div className="stat">
                <div className="stat-value">{progressoPct}%</div>
                <div className="stat-label">Progresso</div>
              </div>
            </div>

            {pendingCount > 0 && (
              <div className="alert-banner" onClick={() => setActiveTab("pendencias")}>
                <strong>{pendingCount} pendencia{pendingCount !== 1 ? "s" : ""}</strong> esperando resposta ou acao dos humanos
              </div>
            )}

            <div className="section-title">Roadmap — {data.roadmap.prioridades.length} Prioridades</div>
            <a href="/roadmap" className="card roadmap-card" style={{ display: "block", marginBottom: "2rem", textDecoration: "none", color: "inherit" }}>
              <div className="card-header">
                <div className="card-title">Roadmap estratégico</div>
                <span className="badge badge-gray">Em construção</span>
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                {data.roadmap.prioridades.length} prioridades · {totalItensRoadmap} itens. Detalhamento completo em /roadmap (em breve).
              </p>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                {data.roadmap.prioridades.map(p => `${p.nivel}. ${p.titulo}`).join(" · ")}
              </div>
            </a>

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

        {activeTab === "mapa" && (
          <div>
            <div className="section-title">Mapa Estratégico</div>
            <MapaEstrategicoView setActiveTab={setActiveTab} />
          </div>
        )}

        {activeTab === "fluxo" && (
          <div>
            <div className="section-title">Fluxo Operacional</div>
            <FluxoOperacionalView />
          </div>
        )}

        {activeTab === "roadmap" && (
          <div>
            <div className="section-title">Roadmap</div>
            <RoadmapView navigateToAgent={navigateToAgent} />
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
