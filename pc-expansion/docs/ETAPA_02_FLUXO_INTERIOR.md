# ARENA 5.0 — Etapa 2: O Fluxo Interior

Base: pc-stage-01-awakening, Edição Ilustrada exportada do Floot.
Esta alteração é aditiva; a simulação marcial, rig, renderização e as nove artes
foram preservados byte a byte conforme preservation-baseline.json.

## Contratos de domínio

`CultivationFlow.ts` implementa transições puras e sem timers, DOM ou storage.
- initialize: ativa o cursor a partir da instalação; sem crédito retroativo.
- settle: calcula integração temporal, frações, meditação e limite de 12h.
- rate/breakdown: decomposição única para simulação e interface.
- meridianCost/advancement: custos, requisitos, alvo e mensagens de validação.
- command: transação de iniciar/encerrar meditação, abrir/refinar/avançar.

`CultivationTypes.Model.flow` é opcional no v5 legado, normalizado na retomada.
O bloco guarda version=2, enabledAt, fraction, meditation e sessionsCompleted.
A identidade Core não é recalculada. Uma meditação guarda início/fim, não um
intervalo JavaScript; este é apenas um agendador de render/flush da interface.
Um tick não é uma moeda: receita vem do intervalo de tempo ainda não contabilizado.

A taxa antiga é liquidada antes de cada alteração. Nenhum investimento muda
retroativamente a produção. O cursor só avança. O intervalo além do teto é
consumido sem crédito. A contabilização é idempotente no mesmo timestamp.
Metadados e timestamps têm monotonicidade; um relógio para trás não rende.

## Integração

ArenaExpansion expõe transições no Save v5 e mantém os domínios marcial/feras.
A página hospeda o relógio, persiste a cada até 5s e imediatamente nas ações,
importação, exportação e pagehide/visibilitychange. Um evento de outra aba
suspende escritas desta sessão para impedir sobreposição automática. Alterações
locais ainda podem ser exportadas; não há fusão automática de duas abas.
Falhas de quota mantêm estado na sessão e exibem aviso explícito de backup.

ArenaSaveV5 valida sessões/frações e cria o checkpoint stage-2 uma única vez.
A UI renderiza quatro abas e investimento confirmado; não altera essência
por conta própria. O palco reutiliza o ArenaCharacter articulado, com partículas
espirituais adicionadas apenas no componente do Santuário.

## Balanceamento

Base12/min × (1 + .07*(qualidade-1) + .04*abertos + .06*refinados
+ .12*índiceReino + .02*(estrela-1)). Meditação é 6× por 30s.
Custo abrir: 60+12*id. Custo refinar:110+18*id (id0..11).
Custos de estrela/ruptura:[90,140,200,280,480] × 2.2^índiceReino.
Rupturas requerem abertos:[4,6,8,10,12,12] e refinados:[0,1,3,5,8,12].
Ao satisfazer todos os requisitos, a ruptura é determinística: sem sorteio,
sem chance de destruir progresso. Transcendente5 não aceita novos gastos.

## Escopo futuro

Atributos marciais e custos da loja seguem os originais. A essência produzida
vem do cultivo, não de bônus de combate ainda não lançados. Natureza/arquétipo/
aspecto/traço ficam preservados para sinergias nas próximas etapas.
Offline usa relógio local; não promete resistência a edição manual de saves.
Não há garantia de armazenamento entre caminhos file:// distintos.
