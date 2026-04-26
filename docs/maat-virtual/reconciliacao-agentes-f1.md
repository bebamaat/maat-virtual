# Reconciliação de Agentes F1

Mapeamento dos agentes antigos do maat-inteligencia-digital (dicionário AGENTS do MAAT_Inteligencia_Digital.html) para os agentes mitológicos atuais do painel Virtual. Usada durante a F1 (fusão de dados) e consultada em todas as fases seguintes que precisam referenciar agentes.

## Frente 1 — Proprietárias (Claude Code)

| ID antigo | Mitológico atual | Função |
|---|---|---|
| pcp | Uzume | PCP (Planejamento Produção) |
| pd | Saraswati | P&D (Pesquisa & Desenvolvimento) |
| supply | Abundantia | Supply (Fornecedores) |
| logistica | Hina | Logística de Produto |
| design | Neftis + Oxum | Design Digital + Design Produto |
| social | Nut | Insta + TikTok Orgânico |
| governanca | Têmis | Governança |
| juridico | Nêmesis | Jurídico |
| biagent | Sofia | BI Estratégico |

## Frente 2 — Squad Operacional

| ID antigo | Mitológico atual | Função |
|---|---|---|
| ag_gads | Atena | Google Ads |
| ag_meta | Odoyá | Meta Ads |
| ag_tiktok | Iansã | TikTok Ads |
| ag_ga4 | Maia | GA4 / GTM |
| ag_klaviyo | Deméter | Klaviyo |
| ag_pipedrive | Seshat | Pipedrive CRM |
| ag_shopify | Hathor | Shopify |
| ag_ml | Iemanjá | Mercado Livre |
| ag_bling | Laxmi + Juno | Bling-Tesouraria + Bling-Controladoria |
| ag_make | Iris | Make / n8n |

## Agente-Mestre

| ID antigo | Mitológico atual |
|---|---|
| mestre / orquestrador | Sol |

## Notas

- Divisões 1-para-2 (design → Neftis+Oxum; ag_bling → Laxmi+Juno) foram feitas semanticamente: Neftis herda UI/digital, Oxum herda embalagem/físico; Laxmi herda tesouraria, Juno herda controladoria.
- 10 especialistas atuais não têm correspondência no mapa antigo (Oxum, Iemanjá-Isis-Key Accounts, Governança Técnica x5, Trade, Mercado Externo).
- Campo origemMapID nos especialistas[] do maat-virtual.json rastreia essa migração.
