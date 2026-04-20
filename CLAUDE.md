# MAAT Virtual — Empresa Virtual

## O que e este projeto

MAAT Virtual e a empresa virtual da MAAT Agroflorestal (bebidas regenerativas). Agentes de IA atuam como diretoria e equipe operacional. O projeto inclui um painel web central em virtual.bebamaat.com.br.

## Identificacao do humano

**IMPORTANTE — executar ANTES de qualquer outra coisa:**

Ao iniciar uma conversa, verificar se existe o arquivo `.eu` na raiz do projeto.

- **Se `.eu` existe:** ler o conteudo e carregar o perfil correspondente de `humanos/<nome>.md`. Cumprimentar a pessoa pelo nome e dizer que esta pronto para trabalhar.
- **Se `.eu` NAO existe:** perguntar "Ola! Com quem estou falando?" e mostrar as opcoes:
  1. Cleber (Head de Tecnologia)
  2. Lucas (Co-CEO)
  3. Julia (Co-CEO)
  4. Paula (Logistica)

  Apos a pessoa se identificar, criar `.eu` com o nome em minusculo (ex: `cleber`). Carregar o perfil de `humanos/<nome>.md` e adaptar o tom e as respostas conforme as instrucoes do perfil.

O arquivo `.eu` e local (esta no `.gitignore`) — cada maquina tem o seu.

## Estrutura

```
virtual/
├── agentes/
│   ├── diretoria/       # 7 diretores: Claudio, Theo, Helena, Dante, Rafael, Marina, Sofia
│   └── operacionais/    # 6 sub-agentes: Nexus, Luna, Vitor, Atlas, Iris, Otto
├── humanos/             # Perfis dos 4 humanos: Cleber, Lucas, Julia, Paula
├── painel/              # Painel web (Next.js + Google OAuth) — virtual.bebamaat.com.br
├── docs/                # Documentacao estrategica e atas de reuniao
└── materiais/           # Identidade visual, brand guidelines (so local, fora do git)
```

## Regras fundamentais

1. **Saber com quem esta falando** — sempre verificar `.eu` antes de tudo
2. **Adaptar ao perfil** — Cleber e tecnico, Lucas e Julia sao estrategicos, Paula e operacional
3. **Uma pergunta por vez** — nunca bombardear com multiplas perguntas
4. **Cada diretor tem autonomia** para criar sub-agentes conforme necessidade
5. **Toda decisao estrategica passa pelo Cleber** (e por Lucas/Julia quando necessario)
6. **Documentar tudo** — decisoes, contexto, raciocinio
7. **Commit e push sempre** — toda alteracao de codigo ou docs deve ir pro GitHub imediatamente

## Diretoria Virtual

| Agente | Cargo | Foco |
|--------|-------|------|
| Claudio | Chief of Staff | Coordenacao geral, ponte entre humanos e agentes |
| Theo | CTO | Shopify, integracoes tecnicas, performance |
| Helena | CMO | Marketing, conteudo, Klaviyo, Social Snowball |
| Dante | CRO | Analytics, CRM, Mercado Livre, BI |
| Rafael | CFO | Unit economics, margens, fluxo de caixa |
| Marina | COO | Bling ERP, fulfillment, operacoes |
| Sofia | CSO | WhatsApp commerce, atendimento, pos-venda |

## Painel Central

- **URL:** virtual.bebamaat.com.br
- **Auth:** Google OAuth (somente @bebamaat.com.br)
- **Login compartilhado:** todos os humanos usam o mesmo email — painel e impessoal
- **Stack:** Next.js 14 + NextAuth + Vercel
- **Backend de estado:** GitHub API (state.json no repo)
- **Funcionalidades:** visao geral, pendencias com alerta, perguntas/respostas, tarefas macro/micro, fundacao (renderiza `docs/maat-virtual/*.md`)

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
- `npm run sync-docs` (roda sozinho em predev/prebuild) copia uma para a outra
- Ao editar um doc: commitar os **dois** arquivos e rodar `vercel --prod`

## Repositorio

- **GitHub:** github.com/bebamaat/maat-virtual (privado)
- **Branch:** main
- **Deploy:** Vercel manual via `vercel --prod` (ver acima)

## Contexto da MAAT

- MAAT Agroflorestal — primeira bebida regenerativa do Brasil (yerba mate + limao + melaco + demerara)
- Fundada por Lucas e Julia, sede em Garopaba/SC
- Mote: "Vai com Tudo"
- Fase: Crescimento
- Prioridade #1: Lancar e-commerce B2C e vender muito
- Equipe humana: Lucas + Julia (Co-CEOs), Cleber (Head Tech), Paula (Logistica)
