# ARENA — Filhos da Areia: expansão 5.0 em dez entregas

## Base preservada

Esta expansão usa a exportação ilustrada para PC do projeto Floot `99acc7d3-ea06-4526-be68-86475e56cd5b`, versão de origem `1789690036364`. Não usa os HTMLs simplificados de 9 KB. ArenaEngine, ArenaCharacter, ArenaRenderer, ArenaBattle e as nove ilustrações são preservados por comparação de SHA-256 (`preservation-baseline.json`).

O repositório `thiagoandrade78-prog/rpg` contém as ideias de núcleo, oito espécies, captura, assimilação, transformações e campanha. Esses módulos são protótipos de referência, não dependências de execução. Integramos cada domínio ao Save v5 tipado e ao motor original por etapas; não injetamos scripts globais ou substituímos o loop de animação.

| Etapa | Entrega | Critério de aceitação |
|---|---|---|
| 1 — O Despertar | Santuário, núcleo individual permanente, visualização dos 12 meridianos, migração e backups defensivos | Revelar uma vez; preservar personagem, economia, campanha e núcleo após salvar/importar; nenhum dano ou bônus novo no combate |
| 2 — O fluxo interior | Meditação, essência, abertura/refinamento, estrelas, rupturas e cultivo offline | Ganho baseado em tempo, teto offline e cursor único; não multiplicar recompensas por recarga ou por trocar relógio |
| 3 — Feras espirituais | Oito espécies originais, indivíduos, potencial, linhagens, bestiário e santuário | Coleção validada, identidades únicas e criaturas desenhadas; não usar emojis como animação final |
| 4 — Terras selvagens | Habitais, encontros reais, combate com feras, subjugação e pactos | Enfraquecer uma entidade no motor; captura coerente, rejeição/fuga; salvar o indivíduo efetivamente encontrado |
| 5 — Ressonância | Assimilação, afinidade, sinergia, Domínio I–V e bônus de cultivo | Uma referência ativa válida, fórmula explicável, bônus aplicado de fato; não explorar troca para ganhar afinidade infinita |
| 6 — Poder herdado | Passivas, técnicas específicas, custos, recargas e supremas | Habilidades alcançam/colidem com alvos, consomem recurso uma vez e possuem efeitos próprios testados |
| 7 — Metamorfose | Manifestação, híbridos e Avatares | Rig, anatomia, animação e hurtboxes coerentes por espécie, sem cobrir um humano com um emoji |
| 8 — Convergência | Técnicas arma+fera, modificadores e inimigos cultivadores | Equipamento continua útil; IA usa os mesmos limites; controles e ações funcionam simultaneamente |
| 9 — Sangue ancestral | Evoluções ramificadas, linhagens, NPCs, missões e chefes de mundo | Evolução não repetível, requisitos reais, recompensas únicas e chefes lutados no motor — não sorteio de vitória |
| 10 — As novas lendas | Balanceamento, arte, áudio, acessibilidade, testes e pacote portátil | Campanha completa sem bloqueios, regressões verificadas, backup transferível e um HTML sem dependências de rede |

Somente a etapa 1 está implementada neste pacote. Cada próxima entrega deve manter uma build estável e passar novamente nos testes de preservação.

## Referências verificadas no GitHub

- `arena-ultimate.html`, blob `5e65a8499f244f73aa1c5b860107282010110c9c`: proposta de despertar e atributos espirituais.
- `stage4-poketpets.js`, blob `ab25864fba4b214ba848cd177196a98a77f9b161`: catálogo de oito espécies e montagem prototípica.
- `stage6-assimilation.js`, blob `194228f60f245bf7e218270b3993421866dabd70`: natureza, arquétipo, linhagem, afinidade, potencial e Domínio.
- `stage5-world.js`, `stage7-transformations.js`, `stage8-combat5.js`, `stage9-campaign.js`: referência para próximas etapas; sem carregamento no HTML final desta entrega.

## Etapa 1 — arquitetura implementada

- `CultivationEngine`: gerador determinístico existente preservado; `isAwakened`, transição idempotente `awaken`, validação consistente e timestamps monotônicos.
- `ArenaExpansion`: transição atômica do Save v5; não depende de React ou de armazenamento.
- `ArenaCultivation.tsx/.module.css`: página Núcleo / Meridianos / Jornada; usa o personagem articulado original em um palco próprio, com a arte existente.
- `ExpansionRoadmap`: roteiro tipado das dez entregas, apresentado também dentro do jogo.
- `pages/_index`: entrada no ludus e navegação persistente; sincronia entre estado de UI, save canônico e adaptador do combate.
- `ArenaSaveV5`: checkpoint único, fallback que não troca um save válido por personagem novo quando a escrita falha, importação de JSON além de códigos e rejeição de raiz sem personagem.
- `AssimilationEngine`: coleção vazia não significa permissão de vincular feras inexistentes.

A natureza, o aspecto, a qualidade, o arquétipo, o traço e os canais do núcleo já existem no save antes da revelação. Renomear, equipar e lutar não mudam essa identidade. O despertar abre de 1 a 7 canais iniciais e passa a Desperto, uma estrela, sem dar ouro, essência ou poder artificial. Não há ainda cálculo de meditação/offline nem habilidades espirituais no combate.

## Salvamento

Chave canônica: `arena-save-v5`. Importações: `ARENA5:`, `ARENA3:` e JSON v3/v5. O v3 anterior permanece compatível. Antes do primeiro carregamento desta etapa sobre um v5 existente, a cópia bruta é guardada em `arena-save-v5-before-stage-1`, sem sobrescrever cópia anterior.

O arquivo não acessa o save de outra origem/navegador automaticamente. Exporte do jogo antigo antes de mudar de HTML. Saves AU5/AU10 dos protótipos simplificados têm formato diferente e não são importados por esta etapa; não tente renomear suas chaves manualmente.

## Validação

`npm ci`, `npm run typecheck`, `npm run build`, `npm test`.

Testes de browser opcionais: Python + Playwright + Chromium, `python tests/browser_stage1.py`. O teste tenta file:// e documenta fallback quando o navegador gerenciado proíbe essa navegação. No ambiente desta entrega foi usado o HTML real em about:blank, rede bloqueada e localStorage de teste. Isso não equivale a um teste em um iPhone físico.

O runtime final não usa servidores, CDN, bibliotecas remotas nem fontes externas. A ferramenta de build usa as dependências fixadas no lockfile. Não se embutem arquivos de fontes.
