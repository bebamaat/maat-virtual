const STATUS_VALIDOS = new Set(["planejado", "em-construcao", "em-operacao", "autonomo"]);
const STATUS_FERRAMENTA_VALIDOS = new Set(["implementado", "em-implementacao", "nao-iniciado"]);
const CATEGORIA_FERRAMENTA_VALIDOS = new Set(["receita", "marketing", "operacoes", "integracoes"]);
const PRIORIDADE_PENDENCIA_VALIDOS = new Set(["critical", "high", "medium", "low"]);
const STATUS_PENDENCIA_VALIDOS = new Set(["aberta", "em-andamento", "resolvida"]);
const TIPO_ITEM_ROADMAP_VALIDOS = new Set(["ferramenta", "agente", "humano"]);

function err(ctx, msg) {
  return `[${ctx}] ${msg}`;
}

function isStr(v) { return typeof v === "string" && v.length > 0; }

export function validateMaatVirtual(data) {
  const errs = [];

  if (!data || typeof data !== "object") {
    throw new Error("maat-virtual.json: payload nao e objeto");
  }

  const humanos = Array.isArray(data.humanos) ? data.humanos : null;
  const mestre = data.agenteMestre;
  const coordenadores = Array.isArray(data.coordenadores) ? data.coordenadores : null;
  const especialistas = Array.isArray(data.especialistas) ? data.especialistas : null;
  const govTecnica = Array.isArray(data.governancaTecnica) ? data.governancaTecnica : null;

  if (!humanos) errs.push(err("humanos", "deve ser array"));
  if (!mestre || typeof mestre !== "object") errs.push(err("agenteMestre", "obrigatorio"));
  if (!coordenadores) errs.push(err("coordenadores", "deve ser array"));
  if (!especialistas) errs.push(err("especialistas", "deve ser array"));
  if (!govTecnica) errs.push(err("governancaTecnica", "deve ser array"));

  if (errs.length > 0) throw new Error(`maat-virtual.json invalido:\n  - ${errs.join("\n  - ")}`);

  const humanoIds = new Set();
  humanos.forEach((h, i) => {
    const ctx = `humanos[${i}${h && h.id ? ` id=${h.id}` : ""}]`;
    if (!isStr(h.id)) errs.push(err(ctx, "id obrigatorio"));
    if (!isStr(h.nome)) errs.push(err(ctx, "nome obrigatorio"));
    if (!isStr(h.papel)) errs.push(err(ctx, "papel obrigatorio"));
    if (!Array.isArray(h.areas)) errs.push(err(ctx, "areas deve ser array"));
    if (h.id && humanoIds.has(h.id)) errs.push(err(ctx, `id duplicado: ${h.id}`));
    if (h.id) humanoIds.add(h.id);
  });

  const coordIds = new Set();
  coordenadores.forEach((c, i) => {
    const ctx = `coordenadores[${i}${c && c.id ? ` id=${c.id}` : ""}]`;
    if (!isStr(c.id)) errs.push(err(ctx, "id obrigatorio"));
    if (!isStr(c.nomeMitologico)) errs.push(err(ctx, "nomeMitologico obrigatorio"));
    if (!isStr(c.area)) errs.push(err(ctx, "area obrigatoria"));
    if (!Array.isArray(c.donoNegocio) || c.donoNegocio.length < 1) errs.push(err(ctx, "donoNegocio deve ter >= 1 item"));
    if (c.donoTecnico !== "cleber") errs.push(err(ctx, "donoTecnico deve ser 'cleber'"));
    if (!STATUS_VALIDOS.has(c.status)) errs.push(err(ctx, `status invalido: ${c.status}`));
    if (c.id && coordIds.has(c.id)) errs.push(err(ctx, `id duplicado: ${c.id}`));
    if (c.id) coordIds.add(c.id);
  });

  const espIds = new Set();
  especialistas.forEach((e, i) => {
    const ctx = `especialistas[${i}${e && e.id ? ` id=${e.id}` : ""}]`;
    if (!isStr(e.id)) errs.push(err(ctx, "id obrigatorio"));
    if (!isStr(e.nomeMitologico)) errs.push(err(ctx, "nomeMitologico obrigatorio"));
    if (!isStr(e.funcao)) errs.push(err(ctx, "funcao obrigatoria"));
    if (!isStr(e.coordenador)) errs.push(err(ctx, "coordenador obrigatorio"));
    else if (!coordIds.has(e.coordenador)) errs.push(err(ctx, `coordenador referencia id inexistente: ${e.coordenador}`));
    if (!STATUS_VALIDOS.has(e.status)) errs.push(err(ctx, `status invalido: ${e.status}`));
    if (e.id && espIds.has(e.id)) errs.push(err(ctx, `id duplicado: ${e.id}`));
    if (e.id) espIds.add(e.id);
  });

  const govIds = new Set();
  govTecnica.forEach((g, i) => {
    const ctx = `governancaTecnica[${i}${g && g.id ? ` id=${g.id}` : ""}]`;
    if (!isStr(g.id)) errs.push(err(ctx, "id obrigatorio"));
    if (!isStr(g.nomeMitologico)) errs.push(err(ctx, "nomeMitologico obrigatorio"));
    if (!Array.isArray(g.donoNegocio) || g.donoNegocio.length < 1) errs.push(err(ctx, "donoNegocio >= 1"));
    if (g.donoTecnico !== "cleber") errs.push(err(ctx, "donoTecnico deve ser 'cleber'"));
    if (!STATUS_VALIDOS.has(g.status)) errs.push(err(ctx, `status invalido: ${g.status}`));
    if (g.id && govIds.has(g.id)) errs.push(err(ctx, `id duplicado: ${g.id}`));
    if (g.id) govIds.add(g.id);
  });

  if (!isStr(mestre.id)) errs.push(err("agenteMestre", "id obrigatorio"));
  if (!isStr(mestre.nomeMitologico)) errs.push(err("agenteMestre", "nomeMitologico obrigatorio"));
  if (!Array.isArray(mestre.donoNegocio) || mestre.donoNegocio.length < 1) errs.push(err("agenteMestre", "donoNegocio >= 1"));
  if (mestre.donoTecnico !== "cleber") errs.push(err("agenteMestre", "donoTecnico deve ser 'cleber'"));
  if (!STATUS_VALIDOS.has(mestre.status)) errs.push(err("agenteMestre", `status invalido: ${mestre.status}`));

  const allAgentIds = new Set([...coordIds, ...espIds, ...govIds, mestre.id]);

  function checkDono(lista, labelPrefix) {
    lista.forEach((a, i) => {
      const donos = a.donoNegocio || [];
      donos.forEach(d => {
        if (!humanoIds.has(d) && !allAgentIds.has(d)) {
          errs.push(err(`${labelPrefix}[${i} id=${a.id}]`, `donoNegocio referencia id inexistente: ${d}`));
        }
      });
    });
  }
  checkDono(coordenadores, "coordenadores");
  checkDono(govTecnica, "governancaTecnica");
  mestre.donoNegocio?.forEach(d => {
    if (!humanoIds.has(d) && !allAgentIds.has(d)) {
      errs.push(err("agenteMestre", `donoNegocio referencia id inexistente: ${d}`));
    }
  });

  // ───────────────────────────────────────────────────────────────
  // NOVO em F1: ferramentas, fluxoOperacional, roadmap, pendencias
  // ───────────────────────────────────────────────────────────────
  const ferramentas = Array.isArray(data.ferramentas) ? data.ferramentas : [];
  const fluxo = data.fluxoOperacional || null;
  const roadmap = data.roadmap || null;
  const pendenciasHumanas = Array.isArray(data.pendenciasHumanas) ? data.pendenciasHumanas : [];
  const marcosConcluidos = Array.isArray(data.marcosConcluidos) ? data.marcosConcluidos : [];

  const ferramentaIds = new Set();
  ferramentas.forEach((f, i) => {
    const ctx = `ferramentas[${i}${f && f.id ? ` id=${f.id}` : ""}]`;
    if (!isStr(f.id)) errs.push(err(ctx, "id obrigatorio"));
    if (!isStr(f.nome)) errs.push(err(ctx, "nome obrigatorio"));
    if (!CATEGORIA_FERRAMENTA_VALIDOS.has(f.categoria)) errs.push(err(ctx, `categoria invalida: ${f.categoria}`));
    if (!STATUS_FERRAMENTA_VALIDOS.has(f.statusImplementacao)) errs.push(err(ctx, `statusImplementacao invalido: ${f.statusImplementacao}`));
    if (f.id && ferramentaIds.has(f.id)) errs.push(err(ctx, `id duplicado: ${f.id}`));
    if (f.id) ferramentaIds.add(f.id);
  });

  if (fluxo) {
    const canais = Array.isArray(fluxo.canais) ? fluxo.canais : [];
    canais.forEach((c, i) => {
      const ctx = `fluxoOperacional.canais[${i}${c && c.id ? ` id=${c.id}` : ""}]`;
      if (!isStr(c.id)) errs.push(err(ctx, "id obrigatorio"));
      if (!isStr(c.nome)) errs.push(err(ctx, "nome obrigatorio"));
      const etapas = Array.isArray(c.etapas) ? c.etapas : [];
      etapas.forEach((e, j) => {
        const ectx = `${ctx}.etapas[${j}${e && e.id ? ` id=${e.id}` : ""}]`;
        if (!isStr(e.id)) errs.push(err(ectx, "id obrigatorio"));
        if (!isStr(e.nome)) errs.push(err(ectx, "nome obrigatorio"));
      });
    });
  }

  if (roadmap) {
    const prioridades = Array.isArray(roadmap.prioridades) ? roadmap.prioridades : [];
    const allAgentIdsRoad = new Set([...coordIds, ...espIds, ...govIds, mestre.id]);
    prioridades.forEach((p, i) => {
      const ctx = `roadmap.prioridades[${i}]`;
      if (typeof p.nivel !== "number") errs.push(err(ctx, "nivel obrigatorio (number)"));
      if (!isStr(p.titulo)) errs.push(err(ctx, "titulo obrigatorio"));
      const itens = Array.isArray(p.itens) ? p.itens : [];
      itens.forEach((it, j) => {
        const ictx = `${ctx}.itens[${j} id=${it.id}]`;
        if (!isStr(it.id)) errs.push(err(ictx, "id obrigatorio"));
        if (!isStr(it.titulo)) errs.push(err(ictx, "titulo obrigatorio"));
        if (!TIPO_ITEM_ROADMAP_VALIDOS.has(it.tipo)) errs.push(err(ictx, `tipo invalido: ${it.tipo}`));
        if (it.agente && !allAgentIdsRoad.has(it.agente) && !ferramentaIds.has(it.agente)) {
          errs.push(err(ictx, `agente referencia id inexistente: ${it.agente}`));
        }
        (it.destrava || []).forEach(d => {
          if (!allAgentIdsRoad.has(d) && !ferramentaIds.has(d)) {
            errs.push(err(ictx, `destrava referencia id inexistente: ${d}`));
          }
        });
      });
    });

    const projecao = Array.isArray(roadmap.projecao) ? roadmap.projecao : [];
    projecao.forEach((m, i) => {
      const ctx = `roadmap.projecao[${i}]`;
      if (typeof m.progressoPct !== "number" || m.progressoPct < 0 || m.progressoPct > 100) {
        errs.push(err(ctx, `progressoPct deve ser numero entre 0 e 100: ${m.progressoPct}`));
      }
    });
  }

  pendenciasHumanas.forEach((p, i) => {
    const ctx = `pendenciasHumanas[${i} id=${p.id}]`;
    if (!isStr(p.id)) errs.push(err(ctx, "id obrigatorio"));
    if (!isStr(p.titulo)) errs.push(err(ctx, "titulo obrigatorio"));
    if (!humanoIds.has(p.responsavel)) errs.push(err(ctx, `responsavel nao e humano valido: ${p.responsavel}`));
    if (!PRIORIDADE_PENDENCIA_VALIDOS.has(p.prioridade)) errs.push(err(ctx, `prioridade invalida: ${p.prioridade}`));
    if (!STATUS_PENDENCIA_VALIDOS.has(p.status)) errs.push(err(ctx, `status invalido: ${p.status}`));
  });

  marcosConcluidos.forEach((m, i) => {
    const ctx = `marcosConcluidos[${i} id=${m.id}]`;
    if (!isStr(m.id)) errs.push(err(ctx, "id obrigatorio"));
    if (!isStr(m.titulo)) errs.push(err(ctx, "titulo obrigatorio"));
  });

  if (errs.length > 0) {
    throw new Error(`maat-virtual.json invalido (${errs.length} erro(s)):\n  - ${errs.join("\n  - ")}`);
  }

  return {
    humanos,
    agenteMestre: mestre,
    coordenadores,
    especialistas,
    governancaTecnica: govTecnica,
    ferramentas,
    fluxoOperacional: fluxo,
    roadmap,
    pendenciasHumanas,
    marcosConcluidos,
    counts: {
      humanos: humanos.length,
      humanosReais: humanos.filter(h => !h.placeholder).length,
      representantes: humanos.filter(h => h.placeholder).length,
      coordenadores: coordenadores.length,
      especialistas: especialistas.length,
      governancaTecnica: govTecnica.length,
      agenteMestre: 1,
      ferramentas: ferramentas.length,
      pendenciasAbertas: pendenciasHumanas.filter(p => p.status === "aberta").length,
      marcosConcluidos: marcosConcluidos.length,
      itensRoadmap: roadmap ? roadmap.prioridades.reduce((a, p) => a + (p.itens?.length || 0), 0) : 0,
    },
  };
}

export const STATUS_LABEL = {
  "planejado": "Planejado",
  "em-construcao": "Em construcao",
  "em-operacao": "Em operacao",
  "autonomo": "Autonomo",
};

export const STATUS_BADGE = {
  "planejado": "badge-gray",
  "em-construcao": "badge-orange",
  "em-operacao": "badge-green",
  "autonomo": "badge-blue",
};

export function agruparPorCoordenador(especialistas) {
  const mapa = {};
  for (const e of especialistas) {
    mapa[e.coordenador] = mapa[e.coordenador] || [];
    mapa[e.coordenador].push(e);
  }
  return mapa;
}
