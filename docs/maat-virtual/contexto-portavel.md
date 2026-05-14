# Contexto portável — leitura obrigatória pro Claude Code em outra máquina

Este documento existe pra que um Claude Code rodando em **outro computador** (que não tem acesso à memória persistente local da Julia) possa entrar em uma sessão da MAAT com contexto suficiente pra trabalhar bem desde o primeiro turno. Atualizado em 2026-05-14.

**Como usar:** ao iniciar uma sessão em qualquer máquina, leia este arquivo logo depois do `CLAUDE.md` do `maat-virtual`. Ele consolida conhecimento que historicamente vivia só na memória do Claude Code local da Julia (`~/.claude/projects/.../memory/`).

---

## 1. Usuária — Julia (alo@bebamaat.com.br)

- **Papel:** Co-CEO + sócia-fundadora MAAT Agroflorestal. Estratégia + Financeiro + Co-Receita.
- **Modo de trabalho:** vibe-coding com Claude Code. Prefere iteração rápida — fazer e revisar — em vez de revisão prévia em texto.
- **Prazo crítico:** Go-Live bebamaat.com.br Shopify em **2026-05-30**.
- **Tom:** direta, prática, focada em entregar.

Há um perfil mais completo em `docs/maat-virtual/pessoas/julia.md` (canônico).

---

## 2. Mapa de repos `bebamaat` (15 repos sincronizados)

Raiz local da Julia: `/Users/juliamaggion/Desktop/02 I MAAT/01 I Inteligência Digital/`.

```
01 I Inteligência Digital/
├── maat-virtual/                  PUBLIC   — este repo. Painel virtual.bebamaat.com.br (ativo)
├── maat-shopify-theme/            PRIVATE  — tema Horizon da loja bebamaat.com.br (ativo, branch develop)
├── tesouraria-maat/               PRIVATE  — MVP contas a pagar/receber (ex-financeiro-maat, pausado ate pos go-live)
└── Projetos/
    ├── maat-bar                   PRIVATE
    ├── maat-bling-migration       PRIVATE  — scripts NCM/fiscal + fechamento mensal
    ├── maat-inteligencia-digital  PUBLIC   — meta-doc do projeto Inteligencia Digital
    ├── maat-pipedrive             PRIVATE  — webhook + scripts pipedrive
    ├── maat-prevenda              PRIVATE  — pre-venda B2C
    ├── maat-prevenda-staging      PRIVATE
    ├── maat-prevenda-cnpj         PRIVATE  — pre-venda B2B/CNPJ
    ├── maat-prevenda-cnpj-staging PRIVATE
    ├── maat-tiktok-tracking       PRIVATE  — pixel/eventos TikTok
    ├── maat-vendas-bot            PRIVATE  — APP de Vendas (Telegram hoje). branch=master
    ├── maat-vendas-bot-v1         PRIVATE  — versao legacy do bot
    └── pedidos-app                PRIVATE  — emissor de pedido via APP de Vendas
```

Pra clonar do zero numa máquina nova:
```bash
mkdir -p ~/Desktop/02\ I\ MAAT/01\ I\ Inteligência\ Digital/Projetos
cd ~/Desktop/02\ I\ MAAT/01\ I\ Inteligência\ Digital
for repo in maat-virtual maat-shopify-theme tesouraria-maat; do
  gh repo clone bebamaat/$repo
done
cd Projetos
for repo in maat-bar maat-bling-migration maat-inteligencia-digital maat-pipedrive \
            maat-prevenda maat-prevenda-staging maat-prevenda-cnpj maat-prevenda-cnpj-staging \
            maat-tiktok-tracking maat-vendas-bot maat-vendas-bot-v1 pedidos-app; do
  gh repo clone bebamaat/$repo
done
```

Atalhos importantes:
- `maat-vendas-bot` usa branch `master` (não `main`)
- `maat-shopify-theme` usa branch `develop` (não `main`)
- Push direto a `main` em alguns repos exige autorização explícita da Julia (sandbox bloqueia por padrão)

---

## 3. Loja Shopify — Horizon (NÃO Dawn)

- **Tema vigente:** **Horizon** (ID prod `186517422370`, staging `186765967650`).
- **Dawn:** existe no admin como **backup unpublished** — nunca editar.
- **Loja:** bebamaat.com.br
- **Auth:** Shopify Customer Accounts (nativo) — **a loja NÃO usa Clerk**. Clerk é só pra projetos Next.js custom da Julia.

**Tracking/analytics — apps oficiais, nunca tracking manual:**
- GA4 `G-YF08E5DT8J` via app **Google & YouTube**.
- Meta Pixel `945842924956473` via app **Facebook & Instagram**.
- TikTok Events API server — em setup, ainda não em produção (repo `maat-tiktok-tracking`).
- Microsoft Clarity — instalado via Shopify Admin / GTM (Cleber tem o Project ID).

Eventos commerce (view_item, add_to_cart, begin_checkout) implementados em 14/05 direto no tema Horizon. Purchase event configurado pra Order Status page.

**Skill `maat-shopify-config` está desatualizada** — não confiar nela. Diz Dawn/Syne e CNPJ antigo. A fonte canônica do tema é o `CLAUDE.md` do repo `bebamaat/maat-shopify-theme`.

---

## 4. Stack default (projetos Next.js custom)

Pra projetos novos custom da Julia (NÃO a loja Shopify):

- **Framework:** Next.js 14+ (App Router) + TypeScript
- **Deploy:** Vercel
- **DB:** Neon (Postgres) com Drizzle ORM
- **Auth:** Clerk (apenas custom apps)
- **Storage:** Vercel Blob quando preciso
- **UI:** shadcn/ui + Tailwind

Repos que seguem este stack: `tesouraria-maat`, `maat-pipedrive`, `pedidos-app`, `maat-vendas-bot` (Telegram).

**Cuidado:**
- Loja Shopify NÃO segue este stack (é tema Horizon Liquid + apps).
- maat-virtual usa Next.js + NextAuth (não Clerk) por ser painel impessoal compartilhado.

---

## 5. Regras de UI/UX mobile pt-BR

Erros que Julia já corrigiu múltiplas vezes — **nunca repetir**:

- **NUNCA usar `hyphens: auto` em CSS** — quebra palavras pt-BR em sílabas erradas (ex.: "regenerati-vas" no meio de "regenerativas"). Sempre `hyphens: manual` ou `none`.
- **Sempre adicionar espaço antes de `<br>`** quando o break separa duas palavras inline.
- **Evitar `<br>` fixos em mobile** — usa media queries pra esconder em viewports estreitos.
- **Lata fantasma no hero mobile:** evitar overflow horizontal causado por `<br>` ou imagens que ultrapassam viewport.
- **Imagens lifestyle têm prioridade no PDP mobile** — sticky CTA "Quero a Minha" no rodapé.

Detalhes em `feedback_mobile_typography_pt_br.md` da memória local (144 linhas).

---

## 6. Pricing & Logística

- **Frete grátis MAAT = R$ 299,00** (NÃO R$ 300). Sempre R$ 299,00 em qualquer config/copy/regra da loja, Pipedrive, Klaviyo.
- **Operador logístico SP — SKAE / Eduardo Uchita** — despacha bebamaat.com.br, SLA D+2.
- **Sede MAAT:** Garopaba/SC.

---

## 7. Projetos ativos & prioridades

### Prioridade #1 — Go-Live bebamaat.com.br Shopify (alvo 2026-05-30)

- Relançamento mobile-first
- Integrações: BLING ERP, Pipedrive CRM, GA4, Meta Pixel
- Loja: `bebamaat.com.br` (cuidado: **`maat-docs.vercel.app` é só documentação, NÃO a loja**)
- Repo principal: `maat-shopify-theme`
- Status: 85% pronto, staging v0.2.0 pronto pra revisão (segundo painel `maat-virtual`)

### Tesouraria-MAAT (PAUSADO até pós-go-live)

- MVP contas a pagar/receber integrado ao BLING
- Sprint 1 pausou em 2026-04-29
- Retomar só APÓS go-live Shopify (30/05) + revisão fiscal BLING
- Stack: Next.js + Vercel + Neon + Clerk + Drizzle (default)
- Repo: `bebamaat/tesouraria-maat` (era `financeiro-maat`, renomeado 14/05)

### MAAT Virtual (este repo, sem prazo crítico)

- Painel virtual.bebamaat.com.br
- 44 agentes mitológicos (1 Sol + 7 coordenadores + 31 especialistas + 5 governança técnica)
- Detalhes no `CLAUDE.md` do `maat-virtual`

---

## 8. Fiscal — referência

Detalhes técnicos (NCMs, CFOPs, CSOSNs, CSTs, naturezas de operação) **vivem no repo privado `bebamaat/maat-bling-migration`**:

- Scripts NCM-fix em `maat-bling-migration/` (raiz): `11-fix-ncm-bebida.mjs`, `12-fix-ncm-virtuais.mjs`
- Fechamento mensal em `_fechamento-04-2026/` (12 scripts, exemplo de fluxo: explorar → listar NFes → detalhar → analisar → gerar XLSX → cancelar)
- Última revisão com contador: **2026-04-29**
- Decisão fiscal-chave: NF-e históricas com NCM 2101.20.10 ficam imutáveis. Daqui pra frente todos os 11 SKUs usam **NCM 2202.99.00**.

Não vou replicar NCMs/CFOPs aqui — sempre consultar o repo privado `maat-bling-migration` pra ter o número certo.

---

## 9. Comandos úteis pra retomar trabalho

```bash
# verificar sync de todos os repos
ROOT="$HOME/Desktop/02 I MAAT/01 I Inteligência Digital"
find "$ROOT" -maxdepth 5 -name ".git" -type d | sed 's|/.git$||' | while read r; do
  cd "$r"
  changes=$(git status --porcelain | wc -l | tr -d ' ')
  ahead=$(git rev-list --count @{u}..HEAD 2>/dev/null || echo "?")
  behind=$(git rev-list --count HEAD..@{u} 2>/dev/null || echo "?")
  echo "$(basename "$r") → $changes mods, $ahead ahead, $behind behind"
done

# dev local do painel maat-virtual
cd "$ROOT/maat-virtual/painel"
cp .env.local.example .env.local   # preencher credenciais (so primeira vez)
npm install
npm run dev

# deploy do painel (manual)
cd "$ROOT/maat-virtual/painel"
vercel --prod

# build + validacao (se mexer no JSON canonico)
cd "$ROOT/maat-virtual/painel"
npm run build   # validate.js valida JSON; build crasha se inconsistente
```

---

## 10. Memórias locais que NÃO foram portadas (sensibilidade)

Estas vivem só na máquina principal da Julia (`~/.claude/projects/.../memory/`). Se outro Claude Code precisar:
- Pedir à Julia pra abrir o arquivo e colar o conteúdo.
- Ou clonar `maat-bling-migration` (privado) pra acessar a documentação fiscal completa.

Arquivos não portados:
- `fiscal_maat_bling.md` (73 linhas) — referência fiscal detalhada
- `integrations_maat_shopify_apps.md` (56 linhas) — IDs específicos de integrações
- IDs/tokens de Pipedrive workflows
- IDs/templates de Klaviyo flows

---

## Última atualização

2026-05-14 — sessão da noite (Julia + Claude Opus 4.7). Criado depois da sincronização geral dos 15 repos + atualização Status/Roadmap/Marcos do painel.
