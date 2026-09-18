# ARENA 5.0 — Etapa 3/10: Feras Espirituais

Base: a exportação ilustrada para PC e a Etapa 2 (O Fluxo Interior). Versão: 5.0.0-alpha.3. O HTML é autocontido: código, bibliotecas, nove ilustrações originais e as novas figuras SVG estão incorporados. Não há fontes externas ou arquivos de fonte distribuídos.

## Disponível

- Santuário das Feras integrado ao Ludus e à navegação, com acolhimento inicial, coleção individual e Compêndio de Lyra.
- Oito espécies originais catalogadas: Pyrofang, Stormhawk, Stoneback, Tideclaw, Thornstag, Nightlynx, Sunmane e Mistwyrm. Cada espécie possui natureza, arquétipo, aspecto, raridade, família, habitat, descrição, observação de comportamento e fichas de técnicas/evoluções futuras.
- Oito anatomias vetoriais diferentes, em camadas articuladas, com respiração, cabeça, cauda, garras, asas, guelras ou corpo serpentino, conforme a espécie. Comandos OBSERVAR/MOVIMENTAR alteram a animação de exibição. Efeitos reduzidos e prefers-reduced-motion são respeitados.
- Uma oferta de acolhimento de Lyra, grátis e única por jornada, após o despertar: escolha Pyrofang, Stoneback ou Thornstag. Não é captura selvagem. Os candidatos são determinísticos por identidade do save e espécie; o relógio, nome e reabertura não sorteiam outro potencial.
- Os indivíduos têm identidade, nível, XP, afinidade, potencial, linhagem base/primordial, temperamento, procedência e dados preservados de domínio/evolução. A linhagem soma 100%; nomes, cuidados e treino não a alteram.
- Cuidar: 15 de ouro, +6 afinidade, intervalo de 60 s, limite de 100. A interface confirma o custo. Cliques repetidos são rejeitados na camada de domínio.
- Treinar: custo de 20 + 8 × nível em essência, uma sessão por santuário, duração de 30 s; concluir concede 60 XP e 3 de afinidade uma única vez. O prazo persiste no save; fechar e reabrir não perde nem multiplica a recompensa. Nível máximo de treino: 50; progressão legada acima disso é preservada. Treinar não aumenta domínio de assimilação.
- Renomear, selecionar/recolher companheiro, estudar registros gratuitamente e filtrar/pesquisar o compêndio. Estudar não concede um indivíduo.

## Fronteiras explícitas

Captura selvagem: etapa 4. Assimilação/sinergia funcional: etapa 5. Poderes de fera no combate: etapa 6. Metamorfoses de combate: etapa 7. Evoluções: etapa 9. Nomes de técnicas e evoluções nesta entrega são dados de catálogo, não habilidades ativadas. O companheiro escolhido não concede bônus de combate ou de cultivo e não é uma invocação de combate.

## Arquivos principais

`src/helpers/BeastSpecies.ts`: catálogo tipado.
`src/helpers/BeastTypes.tsx`: modelos estendidos de forma compatível.
`src/helpers/BeastEngine.tsx`: geração determinística, validação, XP e invariantes da coleção.
`src/helpers/BeastSanctuary.ts`: transações imutáveis de acolhimento, estudo, cuidado, treino e nomes.
`src/components/BeastPortrait.tsx` e CSS: oito desenhos e animações.
`src/components/ArenaBeasts.tsx` e CSS: santuário, registros e fichas.
`src/pages/_index.tsx`: rota/navegação/transações e sincronização com o save/cultivo.
`src/helpers/ArenaSaveV5.tsx`: checkpoint local anterior à Etapa 3.
`tests/expansion-stage3.cjs`: testes do novo domínio.
`tests/browser_stage3.py`: jornada real da interface, arquivo injetado em Chromium.

## Persistência e segurança dos dados

O formato continua Save v5. Campos de santuário são opcionais nos dados antigos. Espécies futuras/desconhecidas são mantidas e recebem representação de reserva. Referências inválidas de companheiro/treino são removidas sem apagar indivíduos válidos. IDs são normalizados antes da deduplicação. O v5 anterior é copiado uma única vez para `arena-save-v5-before-stage-3`, sem sobrescrever a cópia. Mantidas as proteções de quota indisponível, backup e conflito de outra aba. Custos e recompensas de cada ação são uma única transação de raiz. Ao falhar a gravação, a sessão mantém os dados e pede exportação de backup.

O relógio é local; não existe proteção contra edição intencional do arquivo de save ou manipulação do relógio por servidor. Os testes verificam cooldowns e prazos, não alegam segurança anti-cheat.

## Preservação

Os arquivos `ArenaEngine`, `ArenaCharacter`, `ArenaRenderer`, `ArenaBattle` e seu CSS são idênticos à base ilustrada, verificados por SHA-256. As nove imagens originais também são idênticas. Continuam as três arenas, doze adversários e 26 equipamentos. A Etapa 2 permanece jogável e foi novamente submetida aos testes de lógica e interface.

## Verificação

193 testes de lógica: 37 da base + 34 da Etapa 1 + 59 da Etapa 2 + 63 da Etapa 3. TypeScript sem erros.
77 verificações de interface da Etapa 3 e 46 verificações de regressão da Etapa 2. Quatro resoluções: 1366×768, 1024×768, 390×844, 844×390. Movimento verificado também por comparação de pixels entre frames; ausência de emojis como corpo das feras; modo de efeitos reduzidos. Sem erros JavaScript e sem solicitações externas observadas.

Limite do ambiente: a navegação por file:// é bloqueada administrativamente. Os mesmos bytes do HTML foram carregados em blocos em about:blank, em Chromium, com armazenamento e relógio controlados nos cenários automatizados. Não houve teste num Windows físico nem no Safari de um iPhone real. As imagens de demonstração usam fixtures de teste, não o save pessoal do usuário.

Os testes legados de identificação foram adaptados somente para aceitar a versão atual (etapa >= 2 e roteiro com etapas 1, 2, 3); as verificações de mecânicas permanecem.

## Compilação

`npm ci`
`npm run typecheck`
`npm run build`
`npm test`

Para testar a interface: instalar Playwright Python e Chromium; ajustar o executável se necessário. `python tests/browser_stage3.py` e `python tests/browser_stage2.py`. O código monta o HTML em blocos para evitar o gargalo de instrumentação do ambiente em strings maiores que 20 MB.
