# MAAT Virtual — Empresa Virtual

## O que e este projeto

MAAT Virtual e a empresa virtual da MAAT Agroflorestal (bebidas regenerativas). Agentes de IA atuam como diretoria e equipe operacional, supervisionados por 4 humanos. O projeto inclui um painel web central em virtual.bebamaat.com.br.

## Identificacao do humano

**IMPORTANTE — executar ANTES de qualquer outra coisa:**

Ao iniciar uma conversa, verificar se existe o arquivo `.eu` na raiz do projeto.

- **Se `.eu` existe:** ler o conteudo e carregar o perfil correspondente de `docs/maat-virtual/pessoas/<nome>.md`. Cumprimentar a pessoa pelo nome e dizer que esta pronto para trabalhar.

- **Se `.eu` NAO existe mas ha contexto identificando a pessoa** (memoria persistente do Claude, email do shell tipo `alo@bebamaat.com.br` → Julia, instrucao explicita): confirmar com pergunta curta sim/nao ("Voce e a Julia, certo?") e criar `.eu` na confirmacao. Se a pessoa negar, cair no fluxo de pergunta com as 4 opcoes abaixo.

- **Se `.eu` NAO existe e nao ha contexto:** perguntar "Ola! Com quem estou falando?" e mostrar as opcoes:
  1. Cleber (CTIO · Diretor Virtual)
  2. Lucas (Co-CEO · Co-Diretor Virtual · Producao · Co-Receita)
  3. Julia (Co-CEO · Estrategia · Financeiro · Co-Receita)
  4. Paula (Head de Operacoes & Comunidade)

  Apos a pessoa se identificar, criar `.eu` com o nome em minusculo (ex: `cleber`). Carregar o perfil de `docs/maat-virtual/pessoas/<nome>.md` e adaptar o tom e as respostas conforme as instrucoes do perfil.

O arquivo `.eu` e local (esta no `.gitignore`) — cada maquina tem o seu.

## Estrutura

```
virtual/
├── docs/maat-virtual/
│   ├── pessoas/                    # 4 perfis humanos (fonte unica) — cleber/julia/lucas/paula.md
│   ├── frente-a.md                 # fundacao conceitual v1 (historico)
│   ├── frente-a-v2.md              # fundacao conceitual v2 (vigente)
│   ├── frente-b.md                 # JDs dos agentes (em construcao)
│   ├── constituicao.md             # camada juridica
│   ├── reconciliacao-agentes-f1.md # mapeamento agentes antigos → mitologicos
│   └── sessao-*.md                 # atas por data
├── painel/                         # Next.js 14 + NextAuth + Vercel
│   ├── data/maat-virtual.json      # fonte unica do organograma + roadmap + pendencias
│   ├── data/state.json             # estado vivo (perguntas, edits do painel web)
│   ├── lib/validate.js             # valida JSON no boot do layout — build crasha se inconsistente
│   └── public/docs/*.md            # copia servida pro painel (sync via `npm run sync-docs`)
├── skills/<nome>/SKILL.md          # skills operacionais
├── scripts/                        # utilitarios ad-hoc (Python, etc.)
├── CHANGELOG.md
├── CLAUDE.md
└── materiais/                      # local-only (.gitignored): .pages, brand assets, ativos pesados
```

## Regras fundamentais

1. **Saber com quem esta falando** — sempre verificar `.eu` antes de tudo
2. **Adaptar ao perfil** — Cleber e tecnico; Lucas e estrategico/producao/receita; Julia e estrategica/financeiro/receita; Paula e operacional/comunidade
3. **Uma pergunta por vez** — nunca bombardear com multiplas perguntas
4. **Cada coordenador (planeta) tem autonomia** para evoluir seus especialistas conforme a Frente B
5. **Toda decisao estrategica passa pelo Cleber** (e por Lucas/Julia quando necessario)
6. **Documentar tudo** — decisoes, contexto, raciocinio em `docs/maat-virtual/sessao-AAAA-MM-DD.md`
7. **Commit e push sempre** — toda alteracao de codigo ou docs deve ir pro GitHub imediatamente

## Time Virtual (estrutura mitologica)

Refator de 2026-04-21: 1 Agente-Mestre + 7 Coordenadores planetarios + 31 Especialistas (deusas de varias mitologias) + 5 Governanca Tecnica transversal.

**Fonte unica e validada:** `painel/data/maat-virtual.json` (validado por `painel/lib/validate.js` no boot do layout — build crasha se referencias quebrarem). A lista abaixo e referencia humana, nao substitui o JSON.

### Agente-Mestre
- **Sol** — orquestra tarefas cross-area, delega entre coordenadores, consolida outputs.

### Coordenadores (7)

| Planeta | Area |
|---|---|
| Mercurio | Vendas |
| Venus | Marketing |
| Netuno | Operacoes |
| Marte | Producao |
| Jupiter | Estrategia |
| Saturno | Financeiro |
| Urano | Comunidade |

### Especialistas (31) por coordenador

- **Mercurio:** Seshat, Hathor, Iemanja, Isis
- **Venus:** Atena, Odoya, Iansa, Nut, Demeter, Neftis, Oxum, Brigid
- **Netuno:** Tefnut, Hina, Oia
- **Marte:** Abundantia, Uzume, Saraswati
- **Jupiter:** Temis, Sofia, Maia, Iris, Fortuna
- **Saturno:** Laxmi, Juno, Veritas, Nemesis
- **Urano:** Vesta, Freya, Caliope, Pele

### Governanca Tecnica (5, transversal — `donoTecnico` = Cleber)

- **Dike** (QA) · **Clio** (Docs) · **Egide** (Security) · **Heket** (Tests) · **Ananke** (Gov Tecnica geral)

## Modelo de posse (Frente A v2)

Cada agente tem posse em duas dimensoes (detalhe em `docs/maat-virtual/frente-a-v2.md`):

1. **Estado da posse no tempo:**
   - *Dono de transicao* — quem opera hoje, enquanto o agente nao existe ou nao esta maduro.
   - *Dono de estado-alvo* — quem supervisiona quando o agente estiver em operacao estavel.
2. **Tipo de posse:**
   - *Dono de negocio* — define escopo, valida output, responde por KPIs. Varia por agente.
   - *Dono tecnico* — arquitetura, qualidade de codigo, integracoes, seguranca, testes, docs. **Sempre Cleber** (hard-coded em `validate.js`).

Cadeia de donos de negocio termina sempre em humano. Zero ciclos permitidos. A camada de Governanca Tecnica e como Cleber escala a responsabilidade tecnica.

## Painel Central

- **URL:** virtual.bebamaat.com.br
- **Auth:** Google OAuth via NextAuth (somente @bebamaat.com.br)
- **Login compartilhado:** todos os humanos usam o mesmo email — o painel e impessoal
- **Stack:** Next.js 14 + NextAuth + Vercel + DM Sans (via `next/font/google`)
- **Backend de estado:** GitHub API (`painel/data/state.json` no repo)
- **Validacao runtime:** `lib/validate.js` roda em `app/layout.js` no boot. Se o JSON tiver inconsistencia referencial (especialista apontando pra coordenador inexistente, `donoTecnico != "cleber"`, status invalido, etc.), o build crasha.
- **Dark mode:** toggle sol/lua no header com persistencia em `localStorage` (chave `maat-virtual-theme`).
- **Abas:** Fundacao · Visao Geral · Organograma · Pendencias · Time Virtual · Projetos · Todas Tarefas.

### Dev local do painel
```bash
cd painel
cp .env.local.example .env.local   # preencher credenciais
npm install
npm run dev
```

### Deploy do painel
Auto-deploy via GitHub esta **desligado** no projeto Vercel `painel`. Sempre subir manual:
```bash
cd painel
vercel link --project painel   # so na primeira vez na maquina
vercel --prod
```

### Docs renderizados no painel
- Fonte canonica: `docs/maat-virtual/*.md`
- Copia servida: `painel/public/docs/*.md` (commitada)
- `npm run sync-docs` (roda sozinho em `predev`/`prebuild`) copia uma para a outra
- Ao editar um doc: commitar os **dois** arquivos e rodar `vercel --prod`

## Skills

Skills operacionais ficam em `skills/<nome>/SKILL.md`.

**Regra constitucional (`docs/maat-virtual/constituicao.md`):** toda skill operacional deve carregar `maat-legal-compliance` como dependencia. Garante que outputs de agentes respeitam a base juridica da MAAT (LGPD, MAPA, ANVISA, tributario).

Skills existentes:
- **maat-legal-compliance** — base juridica MAAT

## Repositorio

- **GitHub:** github.com/bebamaat/maat-virtual (**public**)
- **Branch:** main
- **Deploy:** Vercel manual via `vercel --prod` (ver acima)

## Contexto da MAAT

- MAAT Agroflorestal — primeira bebida regenerativa do Brasil (yerba mate + limao + melaco + demerara)
- Fundada por Lucas e Julia, sede em Garopaba/SC
- Mote: "Vai com Tudo"
- Fase: Crescimento
- Prioridade #1: Lancar e-commerce B2C e vender muito
- Equipe humana:
  - **Lucas** — Co-CEO + Co-Diretor Virtual + Producao + Co-Receita
  - **Julia** — Co-CEO (Estrategia + Financeiro + Co-Receita)
  - **Cleber** — CTIO · Diretor Virtual
  - **Paula** — Head de Operacoes & Comunidade
  - +2 representantes placeholder (vagas abertas — ver `painel/data/maat-virtual.json#humanos`)
