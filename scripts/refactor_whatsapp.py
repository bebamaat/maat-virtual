#!/usr/bin/env python3
"""Refatora canal whatsapp em fluxoOperacional.canais para 3 trilhas (Rep/PF/PJ) e adiciona pendência ph-lucas-04."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JSON_PATH = ROOT / "painel" / "data" / "maat-virtual.json"

NOVO_CANAL_WHATSAPP = {
    "id": "whatsapp",
    "nome": "WhatsApp Business",
    "descricao": "Canal conversacional para vendas B2B/B2C e relacionamento com representantes. Menu inicial classifica o tipo de contato e direciona pra trilha correta sem intervenção humana. Cada perfil (Rep / PF / PJ) tem ritmo, ferramentas e ciclo próprios.",
    "trilhas": [
        {
            "id": "wa-rep",
            "nome": "Representantes",
            "subtitulo": "Bot-Rep — alto giro, tabela fixa de transferência",
            "corPrincipal": "#085041",
            "etapas": [
                {
                    "id": "rep_atr",
                    "nome": "Atração — Rep",
                    "icone": "📡",
                    "corAcento": "#085041",
                    "detalheNegocio": "Representante autorizado abre conversa no número da MAAT. Pelo cadastro prévio (telefone whitelistado), o sistema identifica que é rep e dispara fluxo direto sem passar pelo menu padrão.",
                    "detalheTecnico": [
                        {"t": "WhatsApp Business API", "b": "Recebe mensagem, identifica perfil rep pelo telefone cadastrado em whitelist."},
                        {"t": "Pipedrive", "b": "Verifica cadastro do rep, carrega histórico e tabela de preços de transferência (a definir — Pipedrive já tem pipelines separados B2C/B2B; tabela específica pra rep precisa ser configurada ou usar a tabela PJ atual)."},
                        {"t": "Make / n8n", "b": "Trigger: rep autenticado → dispara envio do formulário de pedido com tabela atualizada."}
                    ],
                    "maatVirtualNota": "Sol identifica perfil rep e delega pra Seshat que prepara contexto comercial."
                },
                {
                    "id": "rep_ped",
                    "nome": "Pedido — Formulário",
                    "icone": "📋",
                    "corAcento": "#085041",
                    "detalheNegocio": "Rep recebe link de formulário com produtos, quantidades e tabela de transferência fixa. Preenche pedido e submete. Sistema valida estoque e cria pedido de venda no Bling.",
                    "detalheTecnico": [
                        {"t": "Formulário web (Tally ou similar)", "b": "Captura SKU, quantidades, endereço de entrega e dados do rep. Valida campos obrigatórios."},
                        {"t": "Bling ERP", "b": "Cria pedido com tabela de preços do canal Rep (a definir — Bling já tem produtos PJ vs PF separados; produto Rep precisa ser configurado ou reusar produto PJ)."},
                        {"t": "Pipedrive", "b": "Cria deal no pipeline Rep com stage 'Pedido recebido'."},
                        {"t": "Make / n8n", "b": "Scenario: form submit → Bling pedido → Pipedrive deal → WA confirmação ao rep."}
                    ],
                    "maatVirtualNota": "Seshat registra deal no pipeline Rep. Laxmi prepara cobrança."
                },
                {
                    "id": "rep_pag",
                    "nome": "Pagamento — Rep",
                    "icone": "💳",
                    "corAcento": "#085041",
                    "detalheNegocio": "Pagamento via Pix ou boleto, conforme termo do rep. Confirmação automática integra ao Bling e libera operações.",
                    "detalheTecnico": [
                        {"t": "Bling ERP", "b": "Webhook pix_pago ou boleto_pago atualiza pedido pra 'Pago'. Inicia emissão de NF-e."},
                        {"t": "WhatsApp Business API", "b": "Mensagem automática de confirmação ao rep com dados da NF-e."},
                        {"t": "Make / n8n", "b": "Scenario: pagamento confirmado → atualiza Pipedrive → notifica rep → libera ops."}
                    ],
                    "maatVirtualNota": "Sol recebe sinal e delega pra ops (Hina + Laxmi)."
                },
                {
                    "id": "rep_ops",
                    "nome": "Operações — Rep",
                    "icone": "📦",
                    "corAcento": "#085041",
                    "detalheNegocio": "NF-e emitida com dados do rep (PJ ou MEI). Estoque baixado. Etiqueta gerada conforme volume — pequenos volumes via Melhor Envio, grandes via transportadora parceira.",
                    "detalheTecnico": [
                        {"t": "Bling ERP", "b": "Emite NF-e do rep. Baixa estoque do CD correspondente."},
                        {"t": "Melhor Envio / Transportadora", "b": "Roteamento por volume: até X caixas via Melhor Envio, acima via transportadora parceira."},
                        {"t": "Make / n8n", "b": "Scenario: NF emitida → etiqueta → notificação WA com rastreio."}
                    ],
                    "maatVirtualNota": "Hina decide roteamento de frete por volume."
                },
                {
                    "id": "rep_ent",
                    "nome": "Entrega — Rep",
                    "icone": "🚚",
                    "corAcento": "#085041",
                    "detalheNegocio": "Notificações de entrega no WhatsApp do rep a cada mudança de status. Volumes maiores: contato direto sobre coleta e prazo.",
                    "detalheTecnico": [
                        {"t": "Bling ERP / Transportadora", "b": "Status de entrega via webhook ou integração nativa."},
                        {"t": "WhatsApp Business API", "b": "Notificações: coletado, em trânsito, entregue."},
                        {"t": "Make / n8n", "b": "Scenario: status_entregue → WA confirmação → Pipedrive fecha deal."}
                    ],
                    "maatVirtualNota": "Hina registra entrega. Seshat fecha deal e arma trigger de recompra."
                },
                {
                    "id": "rep_fup",
                    "nome": "Follow-up + Recompra — Rep",
                    "icone": "🔄",
                    "corAcento": "#085041",
                    "detalheNegocio": "Recompra é cíclica e previsível. Sistema dispara follow-up calculado pelo histórico de compra (D+25/D+30 conforme rep). Rep recebe lembrete com sugestão de pedido baseada no padrão anterior.",
                    "detalheTecnico": [
                        {"t": "Pipedrive", "b": "Pipeline Rep: tarefa automática D+25 com sugestão de pedido baseada em histórico."},
                        {"t": "WhatsApp Business API", "b": "Mensagem personalizada: 'Olá [rep], baseado no teu giro, sugerimos novo pedido de [X caixas]. Confirma?'"},
                        {"t": "Make / n8n", "b": "Scenario: D+25 → WA mensagem → se sim, dispara form de pedido pré-preenchido."}
                    ],
                    "maatVirtualNota": "Seshat calcula timing ideal de recompra por rep com base no padrão histórico."
                }
            ]
        },
        {
            "id": "wa-pf",
            "nome": "Pessoa Física",
            "subtitulo": "Cliente final descobre via WA, redireciona pro Shopify",
            "corPrincipal": "#0C447C",
            "etapas": [
                {
                    "id": "pf_atr",
                    "nome": "Atração — PF",
                    "icone": "📡",
                    "corAcento": "#0C447C",
                    "detalheNegocio": "Cliente PF entra em contato via WhatsApp por interesse na marca (anúncio, indicação, busca). Sistema identifica perfil PF (sem cadastro prévio nem intenção de volume) e prepara redirecionamento.",
                    "detalheTecnico": [
                        {"t": "WhatsApp Business API", "b": "Recebe mensagem de número não cadastrado. Classifica como PF baseado em heurística (linguagem, contexto)."},
                        {"t": "Pipedrive", "b": "Cria contato no pipeline B2C com tag origem:whatsapp."},
                        {"t": "Make / n8n", "b": "Trigger: novo PF identificado → dispara mensagem de boas-vindas com link Shopify."}
                    ],
                    "maatVirtualNota": "Sol identifica PF e delega pra Hathor que assume a conversão via Shopify."
                },
                {
                    "id": "pf_red",
                    "nome": "Redirect — Shopify",
                    "icone": "🔗",
                    "corAcento": "#0C447C",
                    "detalheNegocio": "Cliente PF recebe link direto do Shopify (bebamaat.com.br) com mensagem de boas-vindas e cupom de primeira compra (opcional). A partir desse ponto, segue o fluxo do canal Shopify B2C/B2B.",
                    "detalheTecnico": [
                        {"t": "WhatsApp Business API", "b": "Mensagem com link Shopify + cupom (se aplicável). Continua disponível pra dúvidas."},
                        {"t": "Klaviyo", "b": "PF entra na lista de leads WA→Shopify pra remarketing se não converter em 24h."},
                        {"t": "Pipedrive", "b": "Tag rastreio:wa-pf no contato. Se converter no Shopify, deal é atualizado com origem WA."}
                    ],
                    "maatVirtualNota": "Hathor monitora conversão. Se cliente não fechou em 24h, Maia entra com remarketing dedicado."
                },
                {
                    "id": "pf_acomp",
                    "nome": "Acompanhamento — PF",
                    "icone": "💬",
                    "corAcento": "#0C447C",
                    "detalheNegocio": "Durante a jornada no Shopify, cliente pode voltar ao WhatsApp pra tirar dúvidas (frete, sabor, cupom, prazo). Atendimento conversacional dá suporte sem tirar o cliente do Shopify.",
                    "detalheTecnico": [
                        {"t": "WhatsApp Business API", "b": "Conversa contínua. Bot responde dúvidas frequentes ou escala pra atendente."},
                        {"t": "Pipedrive", "b": "Histórico de interações registrado no contato pra contexto futuro."}
                    ],
                    "maatVirtualNota": "Hathor acompanha. Se cliente fica >48h sem converter, dispara remarketing."
                },
                {
                    "id": "pf_pos",
                    "nome": "Pós-venda — PF",
                    "icone": "✅",
                    "corAcento": "#0C447C",
                    "detalheNegocio": "Após compra no Shopify, cliente PF recebe notificações de status pelo WhatsApp (pago, enviado, entregue) e fluxo de pós-venda padrão Shopify (review, NPS, recompra).",
                    "detalheTecnico": [
                        {"t": "WhatsApp Business API", "b": "Notificações de status do pedido. Mensagem de NPS após entrega."},
                        {"t": "Klaviyo", "b": "Cliente entra nos fluxos LC3 e LC7 (recompra)."},
                        {"t": "Judge.me", "b": "Convite pra avaliação 7 dias após entrega."}
                    ],
                    "maatVirtualNota": "Hathor + Maia gerenciam pós-venda integrado entre WA e Shopify."
                }
            ]
        },
        {
            "id": "wa-pj",
            "nome": "Pessoa Jurídica",
            "subtitulo": "Cliente empresarial — alta margem, alto volume, ciclo lento",
            "corPrincipal": "#5B297D",
            "etapas": [
                {
                    "id": "pj_atr",
                    "nome": "Atração — PJ",
                    "icone": "📡",
                    "corAcento": "#5B297D",
                    "detalheNegocio": "Cliente PJ (lojista, distribuidor, evento, rede) abre conversa interessado em volume. Pode vir de outbound (lista do squad), indicação de rep, ou inbound qualificado. Perfil identificado por menu ou pelo conteúdo da primeira mensagem.",
                    "detalheTecnico": [
                        {"t": "WhatsApp Business API", "b": "Recebe mensagem. Classifica como PJ por palavra-chave (volume, atacado, revenda, evento) ou seleção de menu."},
                        {"t": "Pipedrive", "b": "Cria deal no pipeline B2B com stage 'Lead'. Tag origem:whatsapp."},
                        {"t": "Make / n8n", "b": "Trigger: PJ identificado → cria deal → notifica squad comercial."}
                    ],
                    "maatVirtualNota": "Sol delega pra Seshat que conduz negociação B2B. Lucas é notificado pra leads quentes."
                },
                {
                    "id": "pj_neg",
                    "nome": "Negociação — PJ",
                    "icone": "🤝",
                    "corAcento": "#5B297D",
                    "detalheNegocio": "Squad B2B (Lucas + Seshat) qualifica o cliente PJ via conversa: tipo de negócio, volume estimado, frequência, perfil tributário. Ajusta a proposta dentro da política comercial PJ.",
                    "detalheTecnico": [
                        {"t": "WhatsApp Business API", "b": "Conversa de qualificação. Coleta CNPJ, volume, prazo."},
                        {"t": "Pipedrive", "b": "Deal avança pra stage 'Qualificado'. Campos custom preenchidos: volume, cnpj, segmento."},
                        {"t": "Make / n8n", "b": "Scenario: deal qualificado → notifica Lucas → prepara dados pra geração de proposta."}
                    ],
                    "maatVirtualNota": "Seshat estrutura proposta com base nos dados. Decisões sobre desconto e prazo passam por Lucas."
                },
                {
                    "id": "pj_prop",
                    "nome": "Proposta + Pix — PJ",
                    "icone": "📋",
                    "corAcento": "#5B297D",
                    "detalheNegocio": "Proposta gerada com produto PJ (R$117/caixa), volume negociado e condições. Link Pix enviado direto no chat. Aguarda confirmação do cliente.",
                    "detalheTecnico": [
                        {"t": "Pipedrive", "b": "Gera proposta com produto PJ, quantidade e preço acordado. Deal avança pra 'Proposta enviada'."},
                        {"t": "Bling ERP", "b": "Pedido criado com tabela PJ. Gera link de cobrança Pix."},
                        {"t": "WhatsApp Business API", "b": "Envia proposta formatada + link de pagamento Pix. Mantém conversa aberta."},
                        {"t": "Make / n8n", "b": "Scenario: 24h sem pagamento → lembrete; 48h → escalation pro squad."}
                    ],
                    "maatVirtualNota": "Seshat monitora SLA. Lucas é notificado se cliente PJ alto valor demora pra confirmar."
                },
                {
                    "id": "pj_pag",
                    "nome": "Pagamento — PJ",
                    "icone": "💳",
                    "corAcento": "#5B297D",
                    "detalheNegocio": "Pix confirmado pelo Bling. Pedido entra em ops com prioridade B2B. Cliente recebe confirmação imediata + dados da NF-e.",
                    "detalheTecnico": [
                        {"t": "Bling ERP", "b": "Webhook pix_pago atualiza pedido pra 'Pago'. Emite NF-e PJ."},
                        {"t": "Pipedrive", "b": "Deal avança pra 'Pago'. Tag status:pago."},
                        {"t": "WhatsApp Business API", "b": "Mensagem de confirmação + link da NF-e em PDF."},
                        {"t": "Make / n8n", "b": "Scenario: pago → atualiza Pipedrive → WA confirma → libera ops B2B."}
                    ],
                    "maatVirtualNota": "Sol recebe sinal e delega pra ops B2B (Hina avalia logística de volume)."
                },
                {
                    "id": "pj_ops",
                    "nome": "Operações — PJ",
                    "icone": "📦",
                    "corAcento": "#5B297D",
                    "detalheNegocio": "Volume PJ tipicamente exige logística diferenciada. NF-e emitida com CNPJ. Roteamento de frete via transportadora parceira pra volumes grandes (>X caixas), Melhor Envio pra menores. Estoque debitado do CD correto.",
                    "detalheTecnico": [
                        {"t": "Bling ERP", "b": "Emite NF-e PJ. Baixa estoque do CD correspondente. Gera ordem de coleta se aplicável."},
                        {"t": "Transportadora parceira", "b": "Aciona coleta direta pra volumes acima do threshold."},
                        {"t": "Melhor Envio", "b": "Etiqueta padrão pra volumes menores PJ."},
                        {"t": "Make / n8n", "b": "Scenario: volume_calculado → roteia frete → WA notifica cliente."}
                    ],
                    "maatVirtualNota": "Hina decide roteamento por volume. Cliente PJ é notificado proativamente sobre logística."
                },
                {
                    "id": "pj_ent",
                    "nome": "Entrega — PJ",
                    "icone": "🚚",
                    "corAcento": "#5B297D",
                    "detalheNegocio": "Comunicação proativa em cada etapa: coleta agendada, em trânsito, entregue. Squad B2B disponível pra resolver intercorrências de volume (avaria, atraso, divergência).",
                    "detalheTecnico": [
                        {"t": "Bling ERP / Transportadora", "b": "Status via webhook ou integração nativa."},
                        {"t": "WhatsApp Business API", "b": "Notificações: coleta agendada, coletado, em trânsito, entregue. Squad disponível 24h em horário comercial pra PJ."},
                        {"t": "Make / n8n", "b": "Scenario: status_entregue → WA confirmação → Pipedrive fecha deal → arma trigger de recompra B2B."}
                    ],
                    "maatVirtualNota": "Hina registra entrega B2B. Seshat fecha deal."
                },
                {
                    "id": "pj_fup",
                    "nome": "Follow-up + Recompra — PJ",
                    "icone": "🔄",
                    "corAcento": "#5B297D",
                    "detalheNegocio": "Recompra B2B é gerenciada pelo squad. Pipedrive calcula data estimada de reposição com base no giro do cliente PJ. Squad entra antes do estoque zerar pra renovar pedido — relacionamento mais próximo que B2C.",
                    "detalheTecnico": [
                        {"t": "Pipedrive", "b": "Pipeline B2B: tarefa pro squad D+25 com dados do cliente, último pedido e sugestão de volume."},
                        {"t": "WhatsApp Business API", "b": "Mensagem do squad: 'Olá [empresa], faz [X dias] do último pedido. Estamos prontos pra preparar o próximo. Vamos conversar?'"},
                        {"t": "Make / n8n", "b": "Scenario: D+25 → tarefa Pipedrive → WA squad → se cliente confirma, reabre fluxo de proposta."}
                    ],
                    "maatVirtualNota": "Seshat aciona squad no timing certo. Squad B2B conduz negociação de recompra autônoma até nova proposta."
                }
            ]
        }
    ]
}

NOVA_PENDENCIA = {
    "id": "ph-lucas-04",
    "titulo": "Validar fluxos WhatsApp Rep/PF/PJ + escolher form Rep",
    "responsavel": ["lucas", "cleber"],
    "prioridade": "high",
    "bloqueia": ["Implementação fluxo WhatsApp Rep/PF/PJ"],
    "dataAbertura": "2026-04-27",
    "descricao": "Fluxos WhatsApp foram desmembrados em 3 trilhas (Rep, PF, PJ) com ferramentas adaptadas. Antes de implementar: (1) revisar com Cleber as 3 trilhas pra checar se faltou etapa; (2) escolher ferramenta de formulário pro pedido do rep (Tally, Typeform, Google Forms ou form custom no Shopify); (3) confirmar pipelines Pipedrive separados (B2C/B2B/Rep) e tabelas Bling correspondentes — memórias indicam que Pipedrive já tem pipelines separados e Bling já tem produtos PJ vs PF. Decisão pendente: criar tabela/produto específico pra Rep no Bling/Pipedrive, ou usar tabela PJ pra rep também?",
    "status": "aberta"
}


def main() -> None:
    raw = JSON_PATH.read_text(encoding="utf-8")
    data = json.loads(raw)

    canais = data["fluxoOperacional"]["canais"]
    idx = next(i for i, c in enumerate(canais) if c["id"] == "whatsapp")
    canais[idx] = NOVO_CANAL_WHATSAPP

    pendencias = data["pendenciasHumanas"]
    if not any(p["id"] == "ph-lucas-04" for p in pendencias):
        pendencias.append(NOVA_PENDENCIA)
    else:
        for i, p in enumerate(pendencias):
            if p["id"] == "ph-lucas-04":
                pendencias[i] = NOVA_PENDENCIA
                break

    out = json.dumps(data, ensure_ascii=False, indent=2)
    JSON_PATH.write_text(out, encoding="utf-8")
    print(f"OK — JSON atualizado. Canal whatsapp: {len(NOVO_CANAL_WHATSAPP['trilhas'])} trilhas. Pendências: {len(pendencias)}.")


if __name__ == "__main__":
    main()
