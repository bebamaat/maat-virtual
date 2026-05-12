# Changelog — MAAT Virtual

## 2026-05-12

### Limpeza pos-refator + lapidacao da base
- Removidos 13 arquivos legacy da diretoria antiga em `agentes/diretoria/*.md` e `agentes/operacionais/*.md` — substituidos no refator mitologico de 2026-04-21 mas nunca deletados. Pastas `agentes/diretoria/`, `agentes/operacionais/` e `agentes/` removidas.
- Removidos perfis humanos curtos duplicados em `humanos/*.md`. Fonte unica agora e `docs/maat-virtual/pessoas/<nome>.md`. Pasta `humanos/` removida.
- `MAAT Virtual — Frente A (fundação conceitual) .pages` movido pra `materiais/` (gitignored) — versao markdown viva em `docs/maat-virtual/frente-a*.md` e a fonte.
- `painel/index-static-backup.html` removido (backup orfao sem referencias).
- Sincronizado `sessao-2026-04-27.md` em `painel/public/docs/` (estava dessync).
- `CLAUDE.md` reescrito: regra do `.eu` ganhou clausula de "confirmacao por contexto" (memoria/email) ao inves de sempre mostrar as 4 opcoes; path do perfil corrigido pra `docs/maat-virtual/pessoas/<nome>.md`; arvore de pastas atualizada; nova secao "Time Virtual" com lista completa dos 44 agentes mitologicos (1 Sol + 7 coordenadores + 31 especialistas + 5 governanca); novo bloco "Modelo de posse" (Frente A v2); nota sobre `validate.js` no boot do layout; nova secao "Skills" com regra constitucional de `maat-legal-compliance` como dependencia; equipe humana atualizada (Lucas Co-CEO+Diretor Virtual+Producao+Co-Receita; Julia Co-CEO Estrategia+Financeiro+Co-Receita; Cleber CTIO·Diretor Virtual; Paula Head Ops & Comunidade); visibilidade do repo corrigida pra **public**.
- Registrada ata em `docs/maat-virtual/sessao-2026-05-12.md` + copia em `painel/public/docs/`.

## 2026-04-21

### Refator completo — 41 agentes mitologicos + DM Sans + dark toggle + Time Virtual

- **Estrutura de agentes:** substituicao total da diretoria virtual antiga (Claudio, Theo, Helena, Dante, Rafael, Marina, Sofia) e dos 6 sub-agentes (Nexus, Luna, Vitor, Atlas, Iris, Otto) pela nova hierarquia:
  - 1 Agente-Mestre (Sol)
  - 7 Coordenadores (Mercurio, Venus, Netuno, Marte, Jupiter, Saturno, Urano)
  - 31 Especialistas (deusas de varias mitologias)
  - 5 Governanca Tecnica (Dike, Clio, Egide, Heket, Ananke)
- **Humanos recalibrados:** Lucas como Co-CEO + Co-Diretor Virtual + Co-Estrategia + Producao + Co-Receita; Cleber como CTIO · Diretor Virtual; Paula como Head de Operacoes & Comunidade; Julia como Co-CEO (Estrategia + Financeiro + Co-Receita). Adicionados 2 representantes placeholder (vaga aberta).
- **Aba "Agentes" renomeada para "Time Virtual"** com UI em 4 blocos (Nucleo Humano + Agente-Mestre / Coordenadores / Especialistas colapsaveis no mobile / Governanca Tecnica transversal).
- **Aba Organograma** continua sendo a fonte unica do organograma, agora lendo do `data/maat-virtual.json` (o arquivo `data/organograma.json` separado foi deletado).
- **Aba Fundacao** passa a renderizar `frente-a-v2.md` e a secao "A2 · Organograma" foi removida do doc (duplicacao com a aba Organograma).
- **Menu reordenado:** Fundacao · Visao Geral · Organograma · Pendencias · Time Virtual · Projetos · Todas Tarefas.
- **Contadores da Visao Geral** reescritos pros 7 novos cards (1 Agente-Mestre, 7 Coordenadores, 31 Especialistas, 5 Governanca Tecnica, 4+2 Humanos, N Projetos, N Pendencias).
- **Fonte:** Larken removida (`@font-face`, arquivos `.otf` em `public/fonts/larken/`, todos os `font-family: 'Larken'` no CSS). DM Sans agora carregada via `next/font/google` com pesos 400/500/700, declarada como fonte unica dominante.
- **Dark mode:** adicionado toggle sol/lua no header com persistencia em `localStorage` (chave `maat-virtual-theme`) e fallback pro `prefers-color-scheme` do sistema. Bootstrap inline no `<head>` evita flash de tema errado no primeiro render.
- **CSS semantico:** `globals.css` reescrito com variaveis semanticas (`--bg-primary`, `--text-primary`, `--border`, `--accent-*`, `--status-*`) definidas em `:root` (light) e `[data-theme="dark"]` (dark). Tokens fisicos antigos (`--preto`, `--branco`, etc.) mantidos como aliases pra compatibilidade.
- **Terminologia:** "sub-agente(s)" substituido por "agente(s)" ou "especialista(s)" em todo o painel.
- **Validacao runtime:** novo `lib/validate.js` com `validateMaatVirtual(data)` que checa integridade referencial (especialistas apontam pra coordenadores existentes, `donoNegocio` aponta pra humano ou agente existente, todos os agentes tem `donoTecnico: "cleber"`). Chamado no `layout.js` — build crasha se os dados estiverem inconsistentes.
- **Limpeza:** arquivos obsoletos deletados (`data/organograma.json`, `lib/organograma.mjs`, `scripts/validate-organograma.mjs`, `public/fonts/larken/`). Script `validate:organograma` removido do `package.json` — validacao agora acontece no carregamento do layout.
- **state.json:** perguntas pendentes migradas dos agentes ficticios antigos (Marina, Theo, Dante, Helena, Rafael) pros agentes mitologicos equivalentes (Netuno, Hathor, Laxmi, Maia, Nut, Saturno).

## 2026-04-21 (manha)

- `feat(painel): refazer organograma conforme Frente A v2` — primeira versao do organograma com 6 humanos + 44 agentes usando nomes tecnicos (`coord-vendas`, `esp-pipedrive`, etc.). Substituido pela versao mitologica na refatoracao da tarde.

## 2026-04-20

- `docs: ata da sessao 2026-04-20` — nova identidade visual + Frente A v2 + JDs humanas fechadas.

## 2026-04-17

- `docs: ata da sessao 2026-04-17 + CLAUDE.md com fluxo de deploy e sync`.
