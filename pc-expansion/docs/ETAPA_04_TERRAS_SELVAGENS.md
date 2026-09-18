# ARENA 5.0 — Etapa 4: Terras Selvagens

## Conteúdo desta entrega

A expansão continua o jogo ilustrado para PC, a partir da Etapa 3. Não substitui
os gladiadores pelo protótipo antigo do GitHub. A navegação **Explorar** leva ao
atlas de quatro rotas. Cada escolha abre um encontro real, individual e persistente.
A criatura surge no habitat e luta contra o mesmo personagem articulado e equipado
da arena clássica. As oito espécies estão distribuídas entre as rotas.

| Rota | Faixa de nível | Liberação |
| --- | --- | --- |
| Bosque Viridiano | 1–3 | Núcleo despertado |
| Terras Rubras | 3–5 | 2 expedições vencidas ou campeão da primeira arena |
| Picos da Tormenta | 5–7 | 4 expedições vencidas ou campeão da segunda arena |
| Ruínas do Eclipse | 7–9 | 6 expedições vencidas ou campeão da terceira arena |

Derrotar ou capturar uma fera conta como expedição vencida. Recuo, derrota do
jogador e fuga da fera não contam. Nenhuma dessas ações remove o ouro ou o equipamento
que já existiam. O jogador retorna com a saúde restaurada no próximo encontro.
As rotas não são um mundo aberto de caminhada livre: o atlas seleciona habitats e
cada encontro usa uma área lateral de combate, com movimento contínuo.

## Combate e subjugação

A/D ou setas movem; J executa o combo leve; K, pesado; L ou Shift mantidos erguem
a guarda; W/seta para cima salta; espaço esquiva; E usa fúria completa. A colisão da
lâmina é amostrada durante a animação contra zonas da cabeça e corpo da fera.
Há preparação visível de ataques, avanço, investidas, recuperação, voo e projétil,
conforme a anatomia. O jogador sofre dano, pode aparar, bloquear ou perder o confronto.

**R — Focar:** canalização vulnerável de 1,1 segundo, consome 18 vigor e reduz
23 pontos de vontade quando completa em alcance. Receber dano interrompe o foco.
O aparo no momento certo reduz 20 de vontade sem ferir a fera.

**B — Subjugar:** disponível com vida da fera entre 1 e 40%, vontade até 60%,
jogador vivo e distância inferior a 285 unidades. Atingir zero de vida mata a
possibilidade de capturar naquele encontro: há recompensa de vitória, sem indivíduo.

O confronto espiritual suspende a física. **Enter** ou **Selar pulso** executa
cada um dos três pulsos. Pontuação do pulso: `max(0, 100 − abs(agulha−50) × 2,2)`.
A média mais o bônus deve atingir 60. O bônus soma natureza compatível (+8), arquétipo
compatível (+5), reino (até +12) e enfraquecimento (até +10). Não há rolagem escondida
de sucesso após os pulsos. O pulso não respondido em 10 segundos vale zero.
Falhar restaura parte da vontade e retoma o combate. Na terceira rejeição a fera foge.

## Identidade, registro e recompensas

O bilhete do encontro é criado antes de entrar na luta. Espécie, nível, potencial,
linhagem, temperamento e semente já pertencem a esse indivíduo. Reabrir não sorteia
outro; a ação disponível é **Retomar expedição**. Só existe um encontro pendente.
O primeiro contato registra a espécie no Compêndio; apenas a captura adiciona uma
fera ao Santuário. A nova fera não substitui o companheiro nem ativa assimilação.

Vitória/captura concedem `18 + perigo × 8` de ouro e `12 + perigo × 6` de essência.
Esses valores são aplicados ao clicar em **Registrar resultado**, consumindo o
bilhete na mesma transação. Não há segundo botão de coleta após o registro.
São mantidos os últimos 16 registros do diário e os totais de todas as expedições.

## Arquitetura

- `WildTypes.ts`: bilhete, checkpoint de simulação, resultado e progresso de exploração.
- `WildWorld.ts`: quatro regiões, geração determinística, disponibilidade,
  validação defensiva e transação de captura/recompensa.
- `WildCombatEngine.ts`: simulação de animais e pacto, composição com o ArenaEngine
  original para os controles e o corpo humano. Sem timers, React ou armazenamento.
- `WildRig.ts`: tamanhos, anatomias, pose raiz, zonas de dano e contatos por espécie.
- `WildScenery.ts`: quatro habitats procedurais em camadas, atmosfera, efeitos e
  renderização do gladiador original. Não são imagens baixadas de terceiros.
- `ArenaWildBattle.tsx/.module.css`: HUD, controles, animação SVG das criaturas,
  palco Canvas, pausa, três pulsos, resultado e retomada.
- `ArenaExpeditions.tsx/.module.css`: atlas com paisagens SVG, requisitos e diário.
- `WorldTypes`, `ArenaSaveV5`, `ArenaExpansion`, `pages/_index`: integração ao Save v5,
  checkpoint pré-Etapa 4, atualização atômica e navegação.
- `ArenaBeasts`: acesso à exploração e rótulo de origem para capturas.

O código de `ArenaEngine`, `ArenaCharacter`, `ArenaRenderer`, `ArenaBattle` e
as nove ilustrações originais não foram alterados. A suíte compara seus hashes.

## Persistência e limites explícitos

O checkpoint é escrito a cada 2 segundos e também ao pausar, selar pulsos ou mudar
de fase. Fechar abruptamente pode perder até aproximadamente 2 segundos de simulação;
não recupera o mesmo resultado duas vezes. Batalhas não avançam com o jogo fechado.
Cada retomada volta a uma pose neutra/recuperação, preservando os danos, tempo,
identidade, vontade, rejeições e pulsos salvos; a velocidade e cada subframe não
são serializados. Pausar voluntariamente zera o foco em andamento.

A coleção aceita até 128 indivíduos. Dados continuam locais e editáveis, sem servidor
anti-trapaça; não se promete resistência à alteração manual de backups ou relógio.
Use uma aba por personagem. Em falha de escrita, o jogo mantém o estado em memória
e avisa para exportar um backup. Saves ARENA3/ARENA5 anteriores continuam aceitos.

Esta etapa não ativa assimilação, bônus de companheiros, domínio, evolução ou
transformações. Essas funções permanecem na sequência prevista das etapas 5 a 9.

## Verificação reproduzível

`npm ci`, `npm run typecheck`, `npm run build`, `npm test`.
Os testes de lógica incluem regressões das etapas 1–3, mecânica das oito espécies,
colisão, controles, foco, pausa, pactos, rejeições, migrações e recompensas únicas.
`python tests/browser_stage3.py` verifica o Santuário/fluxo anteriores e
`python tests/browser_stage4.py` verifica a nova UI usando o HTML real compilado.
Os relatórios guardam as contagens efetivamente executadas.

O ambiente de teste proíbe navegar em `file://`; o HTML real é injetado em um
Chromium isolado, com localStorage e relógio civil controlados e rede desativada.
A animação, teclado, ponteiro, colisão e timers de combate são executados de verdade.
Não equivale a teste em um Windows físico nem a teste em um iPhone real.
