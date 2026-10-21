# ARENA ULTIMATE

RPG de arena, cultivo e assimilação de feras feito para rodar diretamente no Safari/iPhone.

## Arquitetura

O código-fonte será modular durante o desenvolvimento, mas a distribuição final gera um `arena-ultimate.html` autocontido.

### 10 etapas
1. Fundação: runtime, save, game loop, telas, input, render e modelos futuros.
2. Núcleo de cultivo.
3. Cultivo e meridianos.
4. PoketPets.
5. Exploração e captura.
6. Assimilação e sinergia.
7. Transformações.
8. Combate 5.0.
9. Evolução, mundo e campanha.
10. Conteúdo, balanceamento e polimento.

## Etapa 1

A primeira versão já possui boot, menu, criação de personagem, save local, hub, arena Canvas, lutadores articulados, movimento multitouch, ataque leve/pesado, bloqueio, stamina, colisão por alcance, IA, pausa e arquitetura de dados preparada para cultivo e feras.

---

# FORMIGUEIRO QUIMERA (protótipo 8-bit)

Jogo separado em `formigueiro-quimera.html`: um arquivo só, que abre direto no Safari/iPhone ou no navegador do PC. Funciona como o Spore, com estágios de evolução e um editor de criatura, mas aqui você é uma formiga quimera no deserto. Toda a pixel art é original e gerada em código, sem nenhum asset externo.

## Estágios
1. **Larva**: coma insetos no chão do formigueiro. Cada espécie nova libera um gene (fagogênese). Encha a barra CRESCER e evolua.
2. **Soldado**: cace no deserto aberto e leve comida ao ninho. Enfrente formigas vermelhas, cobras e falcões, e derrote o Leão Alfa. O Nen é um ataque em área que carrega a cada abate.
3. **Colônia**: vista em corte do formigueiro. A rainha põe ovos de operária e de soldado, as operárias cavam câmaras e você invade 6 territórios no mapa. Os soldados nascem com o seu design.
4. **O Rei**: conquiste o Palácio das Areias e o Rei nasce.

**Criador Quimera**: 5 encaixes (cabeça, garras, costas, cauda e patas), 4 cores e 12 genes. Assimilar uma parte custa DNA. Algumas partes dão habilidades: dash, veneno ou regeneração.

## Controles
- Toque: arraste na metade esquerda para andar. Use MORDER, DASH e NEN.
- Teclado: setas/WASD para andar, Espaço/J morde, K dash, L nen.
