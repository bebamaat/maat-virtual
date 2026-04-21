const STATUS = ["planejado", "em-construcao", "em-operacao", "autonomo"];
const CAMADAS = ["agente-mestre", "coordenador", "especialista", "governanca-tecnica"];
const AREAS = ["estrategia", "financeiro", "producao", "operacoes", "comunidade", "vendas", "marketing", "inteligencia-digital"];

function isSlug(s) {
  return typeof s === "string" && /^[a-z0-9-]+$/.test(s);
}

function validateHumano(h, i) {
  const errs = [];
  const prefix = `humanos[${i}]`;
  if (!h || typeof h !== "object") return [`${prefix}: nao e objeto`];
  if (!isSlug(h.id)) errs.push(`${prefix}.id invalido: ${JSON.stringify(h.id)}`);
  if (typeof h.nome !== "string" || !h.nome) errs.push(`${prefix}.nome obrigatorio`);
  if (typeof h.papel !== "string" || !h.papel) errs.push(`${prefix}.papel obrigatorio`);
  if (!Array.isArray(h.areas)) errs.push(`${prefix}.areas deve ser array`);
  if (!Array.isArray(h.coordenadoresSob)) errs.push(`${prefix}.coordenadoresSob deve ser array`);
  return errs;
}

function validateAgente(a, i) {
  const errs = [];
  const prefix = `agentes[${i}${a && a.id ? ` id=${a.id}` : ""}]`;
  if (!a || typeof a !== "object") return [`${prefix}: nao e objeto`];
  if (!isSlug(a.id)) errs.push(`${prefix}.id invalido: ${JSON.stringify(a.id)}`);
  if (typeof a.nome !== "string" || !a.nome) errs.push(`${prefix}.nome obrigatorio`);
  if (!CAMADAS.includes(a.camada)) errs.push(`${prefix}.camada invalida: ${a.camada}`);
  if (typeof a.descricaoCurta !== "string" || !a.descricaoCurta) errs.push(`${prefix}.descricaoCurta obrigatoria`);
  if (a.descricaoCurta && a.descricaoCurta.length > 140) errs.push(`${prefix}.descricaoCurta excede 140 chars`);
  if (!Array.isArray(a.donoNegocio) || a.donoNegocio.length < 1) errs.push(`${prefix}.donoNegocio deve ter ao menos 1 item`);
  if (a.donoTecnico !== "cleber") errs.push(`${prefix}.donoTecnico deve ser "cleber"`);
  if (!STATUS.includes(a.status)) errs.push(`${prefix}.status invalido: ${a.status}`);
  if (a.camada === "especialista" && !isSlug(a.coordenadorPai)) errs.push(`${prefix}.coordenadorPai obrigatorio pra especialista`);
  if (a.camada === "coordenador" && !AREAS.includes(a.areaFrenteA)) errs.push(`${prefix}.areaFrenteA invalida: ${a.areaFrenteA}`);
  if (a.ferramentas !== undefined && !Array.isArray(a.ferramentas)) errs.push(`${prefix}.ferramentas deve ser array`);
  if (a.pendencias !== undefined && !Array.isArray(a.pendencias)) errs.push(`${prefix}.pendencias deve ser array`);
  return errs;
}

function validateIntegridade(humanos, agentes) {
  const errs = [];
  const humanoIds = new Set(humanos.map(h => h.id));
  const agenteIds = new Set(agentes.map(a => a.id));

  const idsVistos = new Set();
  for (const a of agentes) {
    if (idsVistos.has(a.id)) errs.push(`agente duplicado: ${a.id}`);
    idsVistos.add(a.id);
  }
  const hIdsVistos = new Set();
  for (const h of humanos) {
    if (hIdsVistos.has(h.id)) errs.push(`humano duplicado: ${h.id}`);
    hIdsVistos.add(h.id);
  }

  for (const a of agentes) {
    if (a.camada === "especialista") {
      if (!agenteIds.has(a.coordenadorPai)) {
        errs.push(`especialista ${a.id} aponta pra coordenadorPai inexistente: ${a.coordenadorPai}`);
      } else {
        const pai = agentes.find(x => x.id === a.coordenadorPai);
        if (pai && pai.camada !== "coordenador") {
          errs.push(`especialista ${a.id}.coordenadorPai (${a.coordenadorPai}) nao e camada=coordenador`);
        }
      }
    }
    for (const d of a.donoNegocio || []) {
      if (!humanoIds.has(d) && !agenteIds.has(d)) {
        errs.push(`agente ${a.id}.donoNegocio referencia id inexistente: ${d}`);
      }
    }
  }

  for (const h of humanos) {
    for (const cid of h.coordenadoresSob || []) {
      if (!agenteIds.has(cid)) {
        errs.push(`humano ${h.id}.coordenadoresSob referencia agente inexistente: ${cid}`);
      } else {
        const coord = agentes.find(x => x.id === cid);
        if (coord && coord.camada !== "coordenador") {
          errs.push(`humano ${h.id}.coordenadoresSob inclui nao-coordenador: ${cid}`);
        }
      }
    }
  }

  return errs;
}

export function validateOrganograma(raw) {
  const errs = [];
  if (!raw || typeof raw !== "object") return ["payload nao e objeto"];
  const humanos = Array.isArray(raw.humanos) ? raw.humanos : null;
  const agentes = Array.isArray(raw.agentes) ? raw.agentes : null;
  if (!humanos) errs.push("humanos: deve ser array");
  if (!agentes) errs.push("agentes: deve ser array");
  if (!humanos || !agentes) return errs;

  humanos.forEach((h, i) => errs.push(...validateHumano(h, i)));
  agentes.forEach((a, i) => errs.push(...validateAgente(a, i)));
  if (errs.length === 0) errs.push(...validateIntegridade(humanos, agentes));
  return errs;
}

export function agruparEspecialistasPorCoordenador(agentes) {
  const mapa = {};
  for (const a of agentes) {
    if (a.camada === "coordenador") mapa[a.id] = mapa[a.id] || [];
  }
  for (const a of agentes) {
    if (a.camada === "especialista" && a.coordenadorPai) {
      mapa[a.coordenadorPai] = mapa[a.coordenadorPai] || [];
      mapa[a.coordenadorPai].push(a);
    }
  }
  return mapa;
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
