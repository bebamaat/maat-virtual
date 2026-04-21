#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { validateOrganograma } from "../lib/organograma.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const jsonPath = path.resolve(here, "../data/organograma.json");

let raw;
try {
  raw = JSON.parse(readFileSync(jsonPath, "utf-8"));
} catch (e) {
  console.error(`[organograma] falha ao ler ${jsonPath}: ${e.message}`);
  process.exit(1);
}

const errs = validateOrganograma(raw);

if (errs.length > 0) {
  console.error(`[organograma] INVALIDO (${errs.length} erro(s)):`);
  for (const e of errs) console.error(`  - ${e}`);
  process.exit(1);
}

const nHumanos = raw.humanos.length;
const nAgentes = raw.agentes.length;
const porCamada = raw.agentes.reduce((acc, a) => {
  acc[a.camada] = (acc[a.camada] || 0) + 1;
  return acc;
}, {});
console.log(`[organograma] OK · ${nHumanos} humanos · ${nAgentes} agentes`);
console.log(`  camadas: ${JSON.stringify(porCamada)}`);
