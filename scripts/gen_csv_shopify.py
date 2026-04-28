#!/usr/bin/env python3
"""Extrai tarefas de implementação do canal Shopify B2C/B2B do JSON do painel para CSV."""
import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JSON_PATH = ROOT / "painel" / "data" / "maat-virtual.json"
CSV_PATH = ROOT / "implementacao-b2c-shopify.csv"

VERB_MAP = {
    "registra": "registrar",
    "dispara": "disparar",
    "rastreia": "rastrear",
    "atribui": "atribuir",
    "grava": "gravar",
    "gerencia": "gerenciar",
    "retorna": "retornar",
    "processa": "processar",
    "recebe": "receber",
    "aciona": "acionar",
    "orquestra": "orquestrar",
    "emite": "emitir",
    "gera": "gerar",
    "envia": "enviar",
    "atualiza": "atualizar",
    "coleta": "coletar",
    "publica": "publicar",
    "webhook": "webhook",
}

STATUS_OVERRIDE_BY_TOOL = {
    "Make / n8n": "Em andamento",
    "Mercado Pago": "Em andamento",
}

STATUS_PT = {
    "implementado": "Concluído",
    "em-implementacao": "Em andamento",
    "nao-iniciado": "Não iniciado",
}


def normalize_tool_name(name: str) -> str:
    if name.startswith("Melhor Envio"):
        return "Melhor Envio"
    if name in ("Shopify Checkout", "Shopify"):
        return "Shopify Advanced"
    if name == "Pipedrive":
        return "Pipedrive CRM"
    if name == "WhatsApp Business API":
        return "WhatsApp Business + Bot"
    return name


def to_action(desc: str) -> str:
    text = " ".join(desc.split())
    text = text.rstrip(".")
    parts = text.split(" ", 1)
    first = parts[0]
    rest = parts[1] if len(parts) > 1 else ""
    key = first.lower()
    if key in VERB_MAP:
        first_out = VERB_MAP[key]
    else:
        first_out = first[0].lower() + first[1:] if first else first
    return f"{first_out} {rest}".strip()


def main() -> None:
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    ferramentas = {f["nome"]: f.get("statusImplementacao", "nao-iniciado") for f in data.get("ferramentas", [])}
    shopify = next(c for c in data["fluxoOperacional"]["canais"] if c.get("id") == "shopify")

    rows = []
    for etapa in shopify["etapas"]:
        fase = re.sub(r"\s*—\s*Shopify\s*$", "", etapa["nome"]).strip()
        for item in etapa.get("detalheTecnico", []):
            tool = item["t"]
            desc = item["b"]
            tarefa = f"Implementar {tool} — {to_action(desc)}"

            if tool in STATUS_OVERRIDE_BY_TOOL:
                status = STATUS_OVERRIDE_BY_TOOL[tool]
            else:
                key = normalize_tool_name(tool)
                status_raw = ferramentas.get(key, "nao-iniciado")
                status = STATUS_PT.get(status_raw, "Não iniciado")

            rows.append({
                "Fase": fase,
                "Tarefa": tarefa,
                "Responsável": "",
                "Status": status,
                "Prazo": "",
            })

    with CSV_PATH.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["Fase", "Tarefa", "Responsável", "Status", "Prazo"], quoting=csv.QUOTE_MINIMAL)
        writer.writeheader()
        writer.writerows(rows)

    print(f"OK — {len(rows)} linhas escritas em {CSV_PATH.relative_to(ROOT)}")
    print()
    print("Primeiras 6 linhas:")
    for line in CSV_PATH.read_text(encoding="utf-8").splitlines()[:6]:
        print(f"  {line}")


if __name__ == "__main__":
    main()
