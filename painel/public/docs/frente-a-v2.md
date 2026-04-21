# MAAT Virtual — Frente A v2 (fundação conceitual)

Documento fechado em 20/04/2026. Source-of-truth para Frente B (Job Descriptions dos agentes).

**Mudanças vs v1** (consolidadas a partir das JDs humanas de Julia, Lucas, Cleber, Paula):
1. Introdução de **dono de transição × dono de estado-alvo** — reconhece que o organograma descreve o destino, não a foto atual
2. Introdução de **dono de negócio × dono técnico** — Cleber como CTIO transversal responde pela camada técnica de todos os agentes
3. Inteligência Digital aberta em C1 (operacional) e C2 (Engenharia & Governança Técnica)

---

## A1 · Manifesto

A MAAT Virtual é a empresa-operadora AI-first da MAAT Agroflorestal. Não vende produtos nem serviços: executa, com agentes de IA supervisionados por humanos, toda a infraestrutura digital que leva erva-mate orgânica regenerativa da floresta ao consumidor. Cada agente tem um dono — humano ou outro agente — mas toda cadeia de responsabilidade termina numa pessoa. A Virtual não substitui humanos: multiplica o alcance deles. Somos uma empresa de produto físico que opera como software.

---

## A2 · Organograma

**Núcleo humano**: 4 sócios + 2 representantes (supervisores gerais ao lado do núcleo — JDs dos representantes pendentes, não bloqueiam Frente B).

**Agente-Mestre** (dono: Cleber · transversal) — orquestração **operacional**: delega tarefas para agentes, consolida outputs, reporta ao núcleo.

### (1) Estratégia — dono: Julia

- A. Governança (Julia) → Agente Governança
- B. Planejamento (Julia) → Agente BI (estratégico)
- C. Inteligência Digital (Cleber)
  - **C1. Int. Digital Operacional** → GA4/GTM · Make/n8n
  - **C2. Engenharia & Governança Técnica** → Agente QA · Agente Docs · Agente Security · Agente Tests · Agente Governança Técnica
    *(transversais — operam sobre todos os outros agentes garantindo qualidade, docs, segurança, testes)*

### (2) Adm Financeiro — dono: Julia

- A. Tesouraria (Paula) → Agente Bling (fluxo)
- B. Controladoria (Julia) → Agente Bling (reports) · BI financeiro
- C. Jurídico (Paula) → Agente Jurídico

### (3) Produção — dono: Lucas

- A. Operações (Paula)
  - A1. Supply (Paula + Lucas) → Agente Supply
  - A2. Copacking (Paula + Lucas) → Agente PCP
  - A3. P&D (Lucas) → Agente P&D
- B. Logística (Paula) → Agente Logística
  - B1. Insumos · B2. Produto · B3. Vendas

### (4) Receita — donos: Julia + Lucas

- A. Vendas (Julia + Lucas) → Pipedrive · Shopify · Mercado Livre
  - A1 Key Accounts · A2 Rep SC · A3 E-commerce
- B. Marketing (Julia + Lucas) → Google Ads · Meta Ads · TikTok Ads · Insta+TikTok · Klaviyo · Design
  - B1 Digital · B2 Produto · B3 Trade *(sem agente dedicado — pendência)*

---

## A3 · Taxonomia de status

| Nível | Metáfora humana | Significado |
|---|---|---|
| Planejado | Vaga aberta · JD escrita | Ideia + especificação prontas, sem construção |
| Em construção | Em treinamento | Sendo construído ativamente |
| Em operação | Trabalhando com supervisão | Roda, humano valida outputs |
| Autônomo | Sênior decide sozinho | Roda com alertas automáticos em desvio de KPI |

---

## Modelo de posse

Cada agente tem posse em **duas dimensões** independentes:

### Dimensão 1 — Estado da posse no tempo

| Tipo | Significado | Exemplo |
|---|---|---|
| **Dono de transição** | Quem opera hoje, enquanto o agente não existe ou não está maduro | Lucas opera Shopify hoje |
| **Dono de estado-alvo** | Quem deve supervisionar quando o agente estiver em operação estável | Julia+Lucas (Receita) |

Quando `dono de transição = dono de estado-alvo`, omitir o campo. A diferença entre eles é o trabalho da Frente B.

### Dimensão 2 — Tipo de posse

| Tipo | Responsabilidade | Quem |
|---|---|---|
| **Dono de negócio** | Define escopo, valida output, responde por KPIs de resultado | Varia por agente (Julia · Lucas · Paula) |
| **Dono técnico** | Arquitetura, qualidade de código, integrações, segurança, testes, documentação | Cleber (transversal a todos os agentes) |

**Cleber é dono técnico de todos os agentes da MAAT Virtual**, independentemente de quem é o dono de negócio. Os agentes da camada C2 (QA · Docs · Security · Tests · Gov Técnica) são a forma como Cleber escala essa responsabilidade.

---

## Regras estruturais

- Todo agente tem 1+ dono de negócio (humano ou agente) + 1 dono técnico (Cleber).
- Cadeia de donos de negócio termina em humano — zero ciclos permitidos.
- Dono de negócio responde por: escopo, validação, KPIs de resultado, status.
- Dono técnico responde por: qualidade de código, integrações, segurança, docs, testes.
- Orquestração ≠ posse. Agente-Mestre orquestra workflows cross-área mas não é dono dos agentes.
- Estado da posse evolui: de transição → estado-alvo conforme agentes estabilizam.

---

## Pendências registradas

- Nomes e JDs dos 2 representantes (não bloqueia Frente B)
- Agente dedicado a Trade (B3) ou decisão de cobertura via Pipedrive
- Distribuição de carga: Julia aparece em 3 áreas + 4 setores — priorizar JDs que aliviam Julia cedo
- Paula ainda em onboarding: seus agentes precisam de supervisor de escalação claro (Lucas ou Julia) para decisões que ultrapassem a autonomia dela

---

## Próxima sessão — Frente B (JDs dos agentes)

Sequência atualizada pós-leitura das 4 JDs humanas, critério "maior alívio compartilhado + viabilidade técnica":

1. **Agente Insta+TikTok** (Em construção · dono de negócio: Julia+Lucas · dono técnico: Cleber) — alívio crítico de Lucas (edição/postagem/DM) + insumo de growth da Julia. Subiu de #5 pra #1.
2. **Agente Bling-Tesouraria + Fluxo de Caixa Projetado** (Planejado · dono: Julia+Paula · dono técnico: Cleber) — alívio da Paula (fluxo de caixa projetado), Julia (tesouraria), Lucas (P&L).
3. **Agente Supply** (Planejado · dono: Paula+Lucas · dono técnico: Cleber) — escopo bem definido por Paula (orçamentos, prospecção, comparação).
4. **Agente-Mestre** (Planejado · dono: Cleber) — tem que existir antes dos outros virarem *Em operação*, pra orquestrar workflows.
5. **Agente Governança Técnica** (Planejado · dono: Cleber) — meta-agente que garante qualidade dos demais; acelera toda a Frente B.

Notas sobre a nova sequência:
- Pipedrive e Shopify saem da posição priorizada — já estão em construção com tração, JDs podem ser escritas em paralelo sem urgência
- C2 (Engenharia & Governança Técnica) entra cedo porque é investimento em infra que acelera todo o resto
