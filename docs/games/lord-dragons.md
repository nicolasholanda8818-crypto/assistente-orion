# Lord Dragons: The Lost Kingdom

## Escopo do Ticket

Criar um RPG 2D pixel art jogavel em Phaser.js, JavaScript, HTML5 e CSS3, compatível com navegador, PWA, Windows e futuras embalagens Capacitor para Android e iOS.

## Como Executar

1. Servir a pasta `frontend/` por HTTP local.
2. Abrir `/game.html`.
3. Jogar com teclado, mouse ou controles touch.

## Controles

- Movimento: `WASD`, setas ou direcional touch.
- Ataque basico: `Espaco`, botao `Atacar` ou botao rapido `Atacar`.
- Ataque pesado: botao `Golpe Forte`, botao rapido `Forte` ou painel lateral.
- Ataque giratorio: `R`, botao rapido `Giro` ou painel lateral.
- Esquiva: `Q`, botao `Esquivar` ou botao mobile `Esquiva`.
- Especial: `F`, botao `Especial` ou botao mobile `Hab. 3`, com natureza misteriosa nos primeiros capitulos.
- Interagir: `E`, botao `Interagir` ou botao mobile `Interagir`.
- Bolsa: `I`, botao `Bolsa` ou painel lateral.
- Mapa: botao `Mapa`, botao rapido `Mapa`, minimapa ou painel lateral.
- Save manual: botao `Salvar`; save automatico ocorre ao fechar a pagina e em eventos importantes.

## Sistemas Criados

- Capitulo 1: O Filho do Mago, com introducao, tutorial, primeiros monstros, primeiros NPCs, primeiras missoes, primeiro bau, primeira loja e primeiro ferreiro.
- Pilar de experiencia: exploracao, descoberta, progressao, historia e recompensa constante acima de combate puro.
- Sistema de descobertas: marcos investigaveis, fragmentos de lore, diario de descobertas, pistas no HUD e recompensas por exploracao.
- Cronicas do Reino: registra monstros encontrados, chefes derrotados, historia dos reinos, dragoes e demonios.
- Sistema de historia em paineis ilustrados: preparado para substituir paineis por videos futuramente.
- Combate expandido: ataque leve, Golpe Forte, esquiva e habilidades especiais.
- Jogabilidade top-down inspirada em Zelda classico: Ryden fica visivel, camera segue suavemente e o mundo transita sem tela lateral.
- Controles mobile: joystick virtual esquerdo e botoes direitos principais para ataque, esquiva, tres habilidades e interacao.
- Botoes completos de jogo: barra rapida no PC, painel lateral completo e comandos mobile essenciais sem cobrir o mapa.
- Ataques com espada: a lamina aparece durante golpes, com corte, faisca, impacto visual e feedback sonoro simples.
- Espada fisica persistente: quando equipada fica visivel nas costas de Ryden; ao atacar passa para a mao durante toda a animacao e depois retorna para as costas.
- Sprites oficiais em pixel art: Ryden possui pele morena, cabelos ruivos, olhos dourados, roupa medieval, corpo atletico e espada nas costas; Altheron possui barba branca longa, cajado e tunica azul escura.
- Animacoes procedurais direcionais: frontal, traseira, lateral esquerda e lateral direita para parado, andando, correndo, atacando, recebendo dano, esquivando e usando habilidade.
- Spritesheet leve: movimento, corrida, ataque, esquiva e habilidade alternam frames por direcao.
- Mapa inicial: Vale dos Dragoes, contendo Casa do Mago, vila inicial, Floresta Inicial, Caverna Antiga, Ponte Antiga, Acampamento, Cidade de Valoria, Academia dos Guerreiros e castelo em ruinas.
- Casa do Mago oficial: cabana medieval de fantasia com cama, mesa de estudos, livros, estantes, pocoes, pergaminhos, lareira e iluminacao quente.
- Base Zelda-like: tileset procedural, tilemap top-down, colisao por area solida, objetos interativos e recompensas de exploracao.
- Mapa mundial visual: Valoria, Sylvandor, Kar-Dur, Drakhar e Umbraxis.
- Capitulo 2: Ecos de Valoria, com investigacao na cidade, Academia dos Guerreiros e novas pistas sem revelar a origem real de Ryden.
- Narrativa: Ryden, Altheron, Mordrake, Lyra, Elandor, Azgorath e ruptura entre dragoes e demonios.
- Tela inicial: menu principal com acesso a jornada, mapa mundial e status.
- Progressao: vida, poder, nivel, XP, ouro, equipamentos e ganho de atributos por nivel.
- Transformacoes visuais: formas futuras permanecem ocultas ate a revelacao correta da campanha.
- Combate: ataque basico, esquiva, dano, derrota, respawn seguro e chefe inicial Boost.
- Chefe final: Azgorath no Portao do Submundo, encerrando o arco de Mordrake.
- Inventario: itens consumiveis, materiais, armas, armaduras e equipamentos.
- Economia: drops, baus, loja do Mercador, Ferreiro, Alquimista e Estalajadeiro.
- Missoes: cadeia inicial ate a Academia e gancho para Azgorath.
- PWA: Phaser local cacheado pelo service worker para uso offline apos instalacao.
- Visual premium: molduras douradas, paineis medievais, biomas com tons quentes/frios/demonicos, particulas, sombras, auras e ciclo dia/noite.
- Direcao visual de referencia: telas, menus, mapa, HUD e cenarios seguem uma estetica top-down de RPG 2D pixel art classico, com molduras escuras/douradas, mapa em pergaminho, contrastes fortes e iluminacao dramatica.
- Tela inicial oficial: a arte anexada foi incorporada como composicao principal da abertura, mantendo logo, Ryden, Altheron, Lyra, Elandor, Mordrake e demais personagens na primeira tela.
- Menu principal premium: Novo Jogo, Continuar, Carregar Jogo, Configuracoes, Creditos e Sair, com brilho dourado, profundidade visual, sons de selecao e clique.
- Tela inicial cinematografica: o menu deixou de ser painel lateral separado e passou a ficar integrado a capa, com parallax, luz dinamica, particulas, vento, nevoa, fumaca, respiracao/piscada do dragao, brilho dos olhos e pulsacao do logo.
- Navegacao do menu: mouse, teclado (`W/S`, setas, `Enter`, `Esc`) e controle com selecao visual persistente.
- Criacao de personagem: Novo Jogo abre formulario funcional para nome, sexo, aparencia, cabelo, olhos e classe.
- Classes iniciais: Guerreiro, Mago, Arqueiro, Paladino, Assassino e Invocador, com atributos de vida, poder/mana, stamina, ataque e defesa.
- Configuracoes do menu: volume de musica, volume de efeitos, resolucao, tela cheia, idioma, controles e persistencia em `localStorage`.
- Save/load da abertura: Novo Jogo cria estado limpo, Continuar e Carregar Jogo leem o save real com nivel, ouro, equipamentos, localizacao, progresso da historia e missoes.
- Trilha e efeitos de interface: tema sintetico leve e tons de selecao/click gerados pelo navegador, respeitando os volumes configurados.
- Trilha sonora dinamica: diretor musical em `audio.js` troca faixas automaticamente por exploracao, cidade, taverna, floresta, caverna, batalha, chefes, vitoria, derrota e historia.
- Faixas contextuais: exploracao usa clima de aventura/misterio; cidades usam seguranca e cotidiano; taverna usa alaude/flautas sinteticos; floresta usa vento/passaros; caverna usa tensao sombria.
- Combate musical: monstros detectados iniciam batalha, a intensidade cresce conforme ameaca e chefes importantes possuem temas proprios, incluindo Boost e Azgorath.
- Momentos narrativos: paineis de misterio e revelacao chamam vinhetas especificas sem revelar cedo demais a origem de Ryden.
- Direcao artistica oficial dark fantasy: o jogo usa pixel art retro detalhada com paleta sombria, sombras fortes, nevoa, fogo, ruinas, florestas escuras, cavernas profundas e fantasia medieval decadente.
- Eventos narrativos cinematograficos: descobertas importantes, sonhos, revelacoes e encontros com chefes pausam a jogabilidade, exibem arte grande e usam caixa de dialogo inferior com avanco manual.
- Ambientes sombrios: Floresta Inicial recebeu copa escura, Ponte Antiga recebeu ruinas antigas dos dragoes, Academia recebeu castelo em ruinas e Portao do Submundo recebeu caverna profunda.
- Monstros de horror retro: inimigos receberam silhuetas mais escuras, olhos vermelhos, sombras e dentes para reduzir a leitura cartunesca.
- Interface limpa: a capa, o mundo, Ryden e o cenario passaram a ser o foco visual principal; HUD, minimapa, controles e painel ocupam pouco espaco.
- Tela inicial reorganizada: o menu principal fica integrado ao cenario da capa sem retornar ao painel lateral separado e inclui Novo Jogo, Continuar, Carregar Jogo, Multiplayer, Configuracoes, Creditos e Sair.
- Multiplayer local preparatorio: a opcao Multiplayer cria uma sessao local persistida para evoluir futuramente para cooperativo real.
- Minimap: marcador de Ryden no canto superior direito, com alternancia entre visual compacto e expandido.
- Painel lateral discreto: status detalhados, acoes e log ficam em gaveta recolhida por padrao, aberta pelo botao Menu.
- Controles mobile limpos: joystick virtual esquerdo e botoes semitransparentes de Ataque, Esquiva, Hab. 1, Hab. 2, Hab. 3 e Interagir no lado direito.
- Atmosfera de exploracao: luz dinamica ao redor de Ryden, reflexo sutil na agua e particulas de nevoa reforcam o mapa sem poluir a leitura.
- Campanha mestre: estrutura completa com comeco, meio e fim, indo de O Filho do Mago ate o Castelo de Azgorath.
- Cooperativo local preparado: roster oficial para ate quatro jogadores com Ryden, Lyra, Elandor e Duran; personagens nao escolhidos continuam como NPCs.
- Arvore de habilidades: ramos Fogo, Guerreiro e Dragao, com habilidades sensiveis escondidas ate os capitulos corretos.
- Capitulo 3: Ruinas de Drakhar, primeira dungeon principal com armadilhas, puzzle das tres runas, espiritos, esqueletos, baus e Guardiao de Drakhar.
- Progressao de dungeon: Aco Lunar, Fragmento Osseo, Reliquia Antiga, Lamina de Drakhar e Armadura de Brasas.
- Feedback de nivel: ao subir de nivel, Ryden recebe animacao visual no mapa alem do registro no diario.
- PWA atualizado: scripts e estilos do jogo usam estrategia network-first para evitar mistura de arquivos antigos com modulos novos apos atualizacoes.
- Demo jogavel do Vale dos Dragoes: o jogador pode criar personagem, entrar no mapa inicial, andar, falar com NPCs, abrir inventario, receber missoes, salvar e carregar progresso.
- Recursos do heroi expandidos: vida, poder/mana e stamina ficam persistidos no estado para evoluir o combate e a progressao futura.
- Pacote Web da demo: `dist/lord-dragons-web-demo-v20.zip`, pronto para servir como raiz estatica em navegador/PWA.

## Criterios de Aceitacao Conferidos

- O Capitulo 1 apresenta uma introducao ao iniciar a jornada.
- A Casa do Mago transmite visualmente que Altheron vive ali como mago, com mobiliario, biblioteca, alquimia e luz quente.
- O tutorial orienta movimento, interacao, combate, inventario e save.
- O HUD mostra uma pista de algo interessante logo adiante.
- O jogador pode investigar descobertas como Diario de Altheron, Marca Queimada, Pedra do Caminho Antigo e Eco Selado.
- O inicio nao revela diretamente que Ryden e um dragao nem explica quem e o guerreiro selado.
- O menu Cronicas registra informacoes gradualmente conforme o jogador encontra criaturas e historia.
- A sequencia inicial inclui Altheron, Tomas, Sella e Brann.
- O primeiro bau completa uma missao e entrega recursos iniciais.
- As Fagulhas Selvagens funcionam como primeiros monstros.
- Sella abre a primeira loja e Brann abre o primeiro ferreiro.
- O jogo abre em `/game.html`.
- Ryden se move por teclado e touch.
- A barra rapida de PC aciona combate, interacao, bolsa e mapa sem depender do painel lateral.
- Os botoes mobile direitos acionam ataque leve, esquiva, Hab. 1, Hab. 2, Hab. 3 e interacao; bolsa e mapa permanecem acessiveis por PC, minimapa ou painel lateral.
- Ryden usa sprites direcionais detalhados em vez de boneco temporario simples.
- Altheron possui sprite proprio de mago velho, diferente dos moradores genericos.
- O HUD exibe vida, poder, nivel, XP, ouro e periodo do dia.
- O HUD compacto permanente exibe vida, poder, nivel, ouro e missao atual sobre a area de jogo.
- A tela inicial e menus de inventario, equipamentos, missoes, status, habilidades e mapa mundial estao acessiveis.
- A interface usa paineis escuros com bordas douradas, mapa mundial ilustrado e etiquetas de reinos.
- Valoria, Floresta Inicial, estrada e Casa do Mago seguem a proporcao top-down e a ambientacao de RPG classico da referencia visual.
- O Vale dos Dragoes funciona como mapa inicial jogavel com vila, floresta, caverna, ruina, NPCs, inimigos, baus e pontos de descoberta.
- Chao, agua, madeira, pedra, arvores, arbustos, placas, potes e portas usam tiles 2D consistentes.
- Colisoes bloqueiam limites, agua, paredes, arvores, casas e objetos solidos.
- Placas, potes, arbustos e portas podem ser investigados com recompensas e pistas.
- NPCs possuem dialogos e funcoes dinamicas.
- Monstros concedem XP, ouro e materiais.
- Boost libera uma chama misteriosa e a receita da Espada Flamejante, sem revelar a origem de Ryden.
- Azgorath existe como chefe final jogavel no Portao do Submundo.
- Save manual e automatico persistem em `localStorage`.
- A tela inicial oficial usa a imagem versionada `frontend/assets/images/lord-dragons/official-title-reference.jpeg`.
- A tela inicial cinematografica integra os botoes a arte da capa, sem painel lateral separado.
- A abertura possui camadas animadas de parallax, luz, vento, nevoa, particulas, fumaca e olhos do dragao.
- O menu principal navega por mouse, teclado e controle, com `W/S`, setas, `Enter` e `Esc`.
- Novo Jogo abre criacao de personagem antes de iniciar a demo.
- A criacao de personagem salva nome, sexo, aparencia, cabelo, olhos e classe.
- O menu inicial salva configuracoes em `lord-dragons-settings-v1`.
- Novo Jogo faz transicao cinematografica e abre a introducao do Capitulo 1.
- Continuar fica desabilitado quando nao existe save.
- A musica muda para floresta ao entrar na Floresta Inicial, cidade ao entrar em Valoria/Academia, taverna perto do estalajadeiro e caverna no Portao do Submundo.
- Monstros proximos ativam musica de batalha; Boost e Azgorath ativam temas exclusivos.
- Ao derrotar chefe, toca vinheta de vitoria; ao morrer, toca tema triste e aparece tela de derrota.
- Eventos cinematograficos pausam movimento, inimigos e combate ate o jogador avancar manualmente o dialogo.
- A interface usa molduras medievais escuras, bordas douradas envelhecidas e paineis profissionais.
- A capa inicial continua sendo a primeira leitura visual e o menu fica integrado ao cenario sem ocupar uma lateral desconectada da arte.
- A HUD compacta fica no canto superior esquerdo e exibe Vida, Poder, Nivel, Ouro e Missao Atual.
- O minimapa fica no canto superior direito, pode ser expandido/reduzido e acompanha a posicao de Ryden.
- O painel completo do jogo fica recolhido por padrao e nao reserva uma coluna fixa da tela.
- Em mobile, os controles ficam nos cantos inferiores e mantem NPCs, monstros, baus e Ryden visiveis, com comandos rapidos para combate, interacao, bolsa e mapa.
- A opcao Multiplayer cria uma sessao local persistida em `localStorage` sem exigir servidor externo e registra roster de ate 4 jogadores.
- O menu Missoes mostra o capitulo ativo e oculta detalhes futuros ate o progresso adequado.
- O Capitulo 3 pode ser iniciado ao entrar nas Ruinas de Drakhar apos reunir pistas em Valoria.
- Drakhar possui armadilha de lanca, puzzle das tres runas, altar, runa investigavel, mural selado e baus proprios.
- O Guardiao de Drakhar funciona como chefe de dungeon e registra progresso ao ser derrotado.
- A trilha de Drakhar usa clima de caverna/dungeon.
- A origem de Ryden permanece sem revelacao direta antes da metade da campanha.
- Apos atualizacao, `/assets/js/` e `/assets/css/` sao buscados primeiro pela rede e apenas usam cache se o jogo estiver offline.
- O service worker usa cache `orion-pwa-v20` para entregar a tela inicial cinematografica atualizada.

## Validacao Manual

1. Abrir `/game.html`.
2. Conferir que a tela inicial usa a arte oficial anexada como composicao principal.
3. Confirmar que o menu principal esta integrado a capa e que nao existe painel lateral separado.
4. Observar parallax, nevoa, vento, particulas, brilho do logo, olhos/fumaca do dragao e pulsacao suave.
5. Passar o mouse sobre os botoes para conferir brilho dourado, profundidade e som de selecao.
6. Navegar pelo menu com `W/S`, setas e `Enter`; usar `Esc` para fechar paineis.
7. Abrir Configuracoes, alterar volumes/resolucao e salvar.
8. Abrir Carregar Jogo sem save e confirmar mensagem de ausencia de save.
9. Clicar em Novo Jogo e confirmar abertura da criacao de personagem.
10. Preencher nome, sexo, aparencia, cabelo, olhos e classe; confirmar que o jogo inicia apos Comecar jornada.
11. Conferir fade cinematografico, criacao de save e abertura da introducao do Capitulo 1.
12. Conferir que a introducao abre em arte grande, com caixa de dialogo inferior e botao Avancar.
13. Tentar mover Ryden durante a cena e confirmar que a jogabilidade permanece pausada.
14. Avancar todas as falas manualmente e confirmar que a jogabilidade volta ao fechar.
15. Recarregar a pagina e conferir que Continuar fica disponivel quando existe save.
16. Clicar ou pressionar uma tecla para liberar audio do navegador.
17. Caminhar pelo Vale dos Dragoes, vila inicial e Casa do Mago, confirmando a trilha de exploracao.
18. Entrar na Floresta Inicial e confirmar clima de floresta com natureza/misterio e visual mais escuro.
19. Investigar a Marca Queimada e confirmar evento cinematografico de descoberta importante.
20. Aproximar-se de monstros e confirmar troca para batalha.
21. Aproximar-se de Boost e confirmar tema exclusivo de chefe e evento cinematografico.
22. Derrotar Boost e confirmar vinheta curta de vitoria.
23. Ir a Valoria/Academia e confirmar musica tranquila de cidade e castelo em ruinas.
24. Aproximar-se do estalajadeiro/taverneiro e confirmar musica alegre de taverna.
25. Ir ao Portao do Submundo e confirmar musica sombria de caverna e caverna profunda.
26. Permitir que Ryden caia em combate e confirmar tema triste e tela de derrota.
27. Conferir que mapa, HUD e dialogos usam molduras escuras/douradas e contraste de fantasia medieval.
28. Falar com Altheron.
29. Conferir a cabana de Altheron: cama, mesa, estantes, livros, pocoes, pergaminhos, lareira e luz quente.
30. Abrir o primeiro bau na Casa do Mago.
31. Falar com Tomas, Maia e Orin na regiao inicial.
32. Caminhar ate a estrada da Floresta Inicial para concluir o tutorial de movimento.
33. Abrir o menu Descobertas e conferir o fragmento registrado.
34. Derrotar duas Fagulhas Selvagens.
35. Falar com Sella e abrir a primeira loja.
36. Falar com Brann e abrir o primeiro ferreiro.
37. Caminhar para cima, baixo, esquerda e direita, conferindo os sprites direcionais de Ryden.
38. Atacar, correr e receber dano para conferir estados visuais sem retorno a boneco temporario.
39. Confirmar que Altheron aparece como mago velho com barba, cajado e tunica azul escura.
40. Usar a barra rapida de PC para ataque, golpe forte, esquiva, giro, especial, interacao, bolsa e mapa.
41. Em viewport mobile, usar joystick esquerdo e botoes direitos de combate, interacao, bolsa e mapa.
42. Abrir inventario, equipamentos, status, habilidades e missoes.
43. Interagir com placas, potes, arbustos e pedra entalhada para conferir recompensas e pistas.
44. Testar colisao contra arvores, agua, casas, paredes e objetos solidos.
45. Falar com Lyra no Acampamento.
46. Ir a Valoria e tentar forjar a Espada Flamejante no Ferreiro.
47. Investigar a placa de Valoria e falar com Elandor para iniciar o Capitulo 2.
48. Ir ao Portao do Submundo e derrotar Azgorath.
49. Salvar, recarregar a pagina e conferir persistencia de personagem, status, inventario e missao.
50. Conferir na tela inicial que Multiplayer aparece entre Carregar Jogo e Configuracoes.
51. Abrir Multiplayer, criar uma sessao local e confirmar que o resumo passa a exibir o identificador da sessao.
52. Iniciar ou continuar a jornada e confirmar que a HUD compacta nao cobre Ryden nem o caminho principal.
53. Clicar no botao do minimapa e confirmar alternancia entre modo compacto e expandido.
54. Clicar em Menu e confirmar que o painel lateral abre como gaveta, sem tirar o jogo da tela cheia.
55. Em viewport mobile, confirmar joystick no canto inferior esquerdo e botoes semitransparentes no canto inferior direito.
56. Caminhar perto de agua e areas de nevoa para verificar reflexos, luz em Ryden e particulas discretas.
57. Abrir Multiplayer e confirmar que a sessao local lista Ryden como ativo e Lyra, Elandor e Duran como NPCs ate escolha.
58. Abrir Missoes e confirmar que a campanha possui capitulos ate o final sem revelar detalhes bloqueados cedo demais.
59. Falar com Elandor e Duran para registrar aliados e liberar a rota narrativa de Drakhar.
60. Entrar nas Ruinas de Drakhar e confirmar evento cinematografico do Capitulo 3.
61. Interagir com a Armadilha de Lanca e confirmar dano, registro no diario e progressao de missao.
62. Resolver o Puzzle das Tres Runas e confirmar recompensa e abertura narrativa.
63. Investigar a Runa de Drakhar e o Mural Selado para registrar pistas sem revelar a origem completa.
64. Derrotar Esqueletos, Espiritos e o Guardiao de Drakhar.
65. Subir de nivel e confirmar o efeito visual `Nivel X!` sobre Ryden.
66. Recarregar `/game.html` apos uma alteracao e confirmar que nao ha erro de modulo antigo no console.
67. Confirmar que o jogo ainda abre offline depois de ter sido cacheado pelo PWA.

## Arquivos Modificados

- `frontend/game.html`
- `frontend/service-worker.js`
- `frontend/assets/css/lord-dragons.css`
- `frontend/assets/js/lord-dragons/content.js`
- `frontend/assets/js/lord-dragons/main.js`
- `frontend/assets/js/lord-dragons/state.js`
- `frontend/assets/js/lord-dragons/scenes/WorldScene.js`
- `BACKLOG.md`
- `TODO.md`
- `PROJECT_STATUS.md`
- `docs/games/lord-dragons.md`
- `tests/test_lord_dragons.py`
- `tests/test_design_system.py`
