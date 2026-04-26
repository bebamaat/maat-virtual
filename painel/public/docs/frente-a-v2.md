# MAAT Virtual — Frente A (fundação conceitual)

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

A estrutura completa (Núcleo Humano → Agente-Mestre → Coordenadores → Especialistas → Governança Técnica) vive na aba **Organograma** do painel, que é a fonte única e sempre reflete o estado atual. Aqui na Fundação ficam só os princípios conceituais.

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
