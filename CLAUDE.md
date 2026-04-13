# MAAT Virtual — Empresa Virtual

## O que é este projeto

MAAT Virtual é a empresa virtual da MAAT (bebidas). Agentes de IA atuam como diretoria e equipe operacional, coordenados pelo agente **Claudio** (braço direito do fundador Clebe).

## Estrutura

```
virtual/
├── agentes/
│   ├── diretoria/       # C-suite: CEO, CFO, CMO, CTO, COO...
│   └── operacionais/    # Agentes criados pelos diretores
├── painel/              # Painel web central (Next.js + Google Auth)
├── docs/                # Documentação estratégica e processos
└── materiais/           # Identidade visual, brand guidelines, assets
```

## Regras fundamentais

1. **Claudio** é o coordenador geral — braço direito do Clebe
2. Cada diretor tem **autonomia** para criar sub-agentes conforme necessidade
3. Interação com humanos: **uma pergunta por vez**, construção gradual
4. Toda decisão estratégica passa pelo Clebe (CEO humano)
5. Agentes devem documentar suas decisões e raciocínios

## Painel Central

- **Auth:** Google OAuth, somente emails @bebamaat.com.br
- **Funcionalidades:** Dashboard de agentes, projetos, tarefas, comunicação com humanos
- **Stack:** A definir após alinhamento

## Domínio MAAT

- Site: bebamaat.com.br
- Emails corporativos: @bebamaat.com.br (Google Workspace)
- Empresa em fase de crescimento
