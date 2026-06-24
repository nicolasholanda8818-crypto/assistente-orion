# ORION TODO

## Gate G0 - Planejamento

- [x] Criar documentacao arquitetural.
- [x] Criar backlog incremental.
- [x] Documentar seguranca, testes, backup e atualizacao.
- [x] Registrar riscos e dependencias.
- [x] Configurar CI/CD com lint, testes, seguranca e build.
- [x] Criar baseline E2E isolado com Playwright para fluxos criticos planejados.
- [x] Criar Threat Model STRIDE para ataques locais, remotos, uploads, WebSockets e plugins.
- [x] Criar politica de segredos e endurecer scanner da CI.
- [x] Criar baseline seguro do Orion Brain com cinco componentes separados.
- [x] Preparar arquitetura para Linux, macOS, Android, iOS e Web.
- [x] Criar baseline do Tool System com registro obrigatorio e deny by default.
- [x] Preparar Model Runtime multi-provider sem habilitar inferencia.
- [x] Criar baseline do Design System com temas e acessibilidade.
- [x] Criar onboarding bootstrap criptografado para primeira execucao.
- [x] Criar assistente de configuracao inicial com senha administrativa e edicao posterior.
- [x] Registrar migracao idempotente do perfil inicial e validar desktop/mobile.
- [x] Criar Wiki interna gerada para APIs, banco, plugins e eventos.
- [x] Criar changelog automatico com fragmentos, drift check e integracao ao build.
- [x] Criar Release Candidate com auditoria, performance, seguranca, checksum e manifesto.
- [x] Preparar gate de distribuicao 1.0 com relatorio bloqueante.
- [x] Ajustar site/PWA principal com Orion 2D animado e chat continuo.
- [x] Executar correcao total do site/PWA, chat continuo, canvas 3D/fallback e relatorios finais.
- [x] Criar Orion Living Avatar com personalidade visual, falas dinamicas, acoes espontaneas e cenario interativo.
- [x] Criar modo persistente Windows para manter Orion online e reconectar WebSocket continuamente.
- [x] Implementar memoria de usuario por navegador com nome, preferencias, projetos e assuntos nao sensiveis.
- [x] Implementar camera, arquivos por usuario, analise local basica e memoria de arquivos.
- [x] Implementar inteligencia conversacional Fase 1 com continuidade, objetivos, emocoes contextuais e iniciativa leve.
- [x] Implementar Fase 4 com web conversacional, noticias, clima, busca tecnica, fontes, resumos e voz sincronizada.
- [x] Implementar Fase 5 com Avatar Studio, Minha Skin, analise visual local e Cerebro Cosmico.
- [x] Implementar Fase 3 com arquivos, documentos, PDF, apostilas, trabalhos e flashcards.
- [x] Fortalecer inteligencia conversacional com vendas, negociacao, consultor, busca web forte e voz masculina BR.
- [ ] Vendorizar Three.js localmente para PWA offline completo.
- [ ] Endurecer WebSocket com autenticacao, origin check, rate limit e quotas.
- [ ] Criar E2E automatizado para o fluxo visual do Orion.
- [ ] Revisar documentos com o responsavel do produto.
- [ ] Aprovar a ordem de implementacao.

## Ticket LDK-0001 - Lord Dragons

- [x] Criar entrada jogavel `/game.html`.
- [x] Integrar Phaser.js local ao frontend.
- [x] Implementar mapa inicial e personagens principais.
- [x] Implementar movimento, combate, HUD e controles touch.
- [x] Implementar XP, niveis, inventario, equipamentos, ouro, drops e baus.
- [x] Implementar NPCs, dialogos, lojas, ferreiro, alquimista, estalagem e missoes.
- [x] Implementar Boost, Chamas do Dragao e Espada Flamejante.
- [x] Implementar save manual e automatico.
- [x] Atualizar documentacao e testes automatizados.

## Ticket LDK-0002 - Visual Premium Lord Dragons

- [x] Criar tela inicial e menu principal.
- [x] Criar visual medieval sombrio com molduras douradas.
- [x] Criar inventario, equipamentos, status, habilidades, missoes e mapa mundial.
- [x] Adicionar Valoria, Sylvandor, Kar-Dur, Drakhar e Umbraxis ao mapa mundial.
- [x] Adicionar formas visuais de Ryden.
- [x] Enriquecer mapas com biomas, casas, NPCs andando, sombras e particulas.
- [x] Melhorar feedback de combate com barras de vida e dano flutuante.

## Ticket LDK-0003 - Capitulo 1: O Filho do Mago

- [x] Criar introducao do capitulo.
- [x] Criar tutorial de movimento, interacao, combate, inventario e save.
- [x] Criar primeiras missoes encadeadas.
- [x] Criar primeiros monstros na Floresta Inicial.
- [x] Criar primeiros NPCs: Altheron, Tomas, Sella e Brann.
- [x] Criar primeiro bau com recompensa inicial.
- [x] Criar primeira loja.
- [x] Criar primeiro ferreiro e receita inicial.

## Ticket LDK-0004 - Pilar de Exploracao e Descoberta

- [x] Reorientar a experiencia para exploracao, descoberta, progressao, historia e recompensa constante.
- [x] Criar sistema de descobertas investigaveis no mundo.
- [x] Criar diario de descobertas.
- [x] Criar pistas no HUD para sugerir algo interessante adiante.
- [x] Inserir fragmentos de lore de Altheron, Mordrake, Azgorath e Reino dos Dragoes.
- [x] Adicionar recompensas de exploracao sem depender de combate.
- [x] Ajustar Capitulo 1 para exigir descoberta narrativa antes dos monstros.

## Ticket LDK-0005 - Biblia de Jogo e Cronicas

- [x] Ajustar narrativa inicial para revelar segredos gradualmente.
- [x] Criar sistema de historia com paineis ilustrados.
- [x] Criar menu Cronicas do Reino.
- [x] Registrar monstros encontrados e chefes derrotados.
- [x] Registrar historia dos reinos, dragoes e demonios.
- [x] Adicionar ataque pesado.
- [x] Melhorar mapa com regioes descobertas, bloqueadas e missao atual.

## Ticket LDK-0006 - Segredo da Origem de Ryden

- [x] Remover revelacoes diretas da origem de Ryden dos primeiros menus.
- [x] Ocultar formas futuras ate revelacoes posteriores.
- [x] Ocultar missoes futuras com spoilers.
- [x] Bloquear Cronicas sensiveis ate o jogador encontrar reliquias e ruinas.
- [x] Manter apenas pistas, sonhos, sensacoes estranhas, objetos reagindo e comentarios ambíguos.

## Ticket LDK-0007 - Jogabilidade Top Down e Controles

- [x] Criar HUD permanente compacto.
- [x] Criar joystick virtual esquerdo.
- [x] Criar botoes mobile direitos para ataque, esquiva, habilidade, inventario e mapa.
- [x] Ajustar camera top-down suave e centralizada.
- [x] Criar ataque leve, ataque pesado, esquiva com invulnerabilidade curta e ataque giratorio.
- [x] Mostrar espada, efeito de corte, faisca, impacto e som simples ao atacar.
- [x] Criar sprites procedurais para estados principais de Ryden.

## Ticket LDK-0008 - Espada Fisica Persistente

- [x] Criar espada visivel nas costas de Ryden.
- [x] Criar espada de mao durante ataques.
- [x] Garantir que a espada permanece visivel durante toda animacao de golpe.
- [x] Separar arma fisica dos efeitos visuais de corte e faisca.

## Ticket LDK-0009 - Sprites Oficiais Pixel Art

- [x] Remover o visual de personagem temporario quadrado.
- [x] Criar Ryden em pixel art detalhado com pele morena, cabelo ruivo, olhos dourados, roupa medieval e espada nas costas.
- [x] Criar Altheron em pixel art detalhado com barba branca longa, cajado e tunica azul escura.
- [x] Criar sprites frontal, traseiro, lateral esquerdo e lateral direito.
- [x] Criar estados visuais de parado, andando, correndo, atacando e recebendo dano.
- [x] Atualizar o mundo para selecionar textura por direcao e estado.

## Ticket LDK-0010 - Casa do Mago Oficial

- [x] Substituir o cenario temporario da Casa do Mago.
- [x] Criar cabana medieval de fantasia em visao superior.
- [x] Adicionar cama, mesa, livros e estantes.
- [x] Adicionar pocoes, pergaminhos e area de alquimia.
- [x] Adicionar iluminacao quente com lareira e lamparina magica.
- [x] Manter os pontos de missao e descoberta do Capitulo 1 funcionando.

## Ticket LDK-0011 - Direcao Visual da Arte de Referencia

- [x] Aplicar molduras escuras e douradas em telas, menus e HUD.
- [x] Ajustar tela inicial para painel dramatico de RPG pixel art premium.
- [x] Recriar mapa mundial como pergaminho ilustrado com reinos nomeados.
- [x] Reforcar iluminacao, sombras e contraste dia/noite na interface.
- [x] Melhorar cenarios top-down com mais densidade visual e proporcoes de RPG classico.
- [x] Ajustar Valoria, floresta e estradas para seguir a estetica da referencia.

## Ticket LDK-0012 - Base Zelda-like Completa

- [x] Criar tileset procedural para grama, terra, pedra, agua, madeira, parede, telhado, arvores, arbustos, rochas, placas, potes, portas e flores.
- [x] Criar base de tilemap top-down para as regioes principais.
- [x] Adicionar colisao em limites, agua, arvores, casas e objetos solidos.
- [x] Adicionar objetos interativos: placas, potes, arbustos, pedra entalhada e porta da Academia.
- [x] Adicionar recompensas de exploracao em objetos do mapa.
- [x] Criar frames alternados de sprite para movimento, corrida, ataque, esquiva e habilidade.
- [x] Continuar o roteiro com o Capitulo 2: Ecos de Valoria, mantendo a origem de Ryden em segredo.

## Ticket LDK-0013 - Botoes PC e Mobile

- [x] Criar barra rapida de controles para PC dentro da tela do jogo.
- [x] Exibir atalhos de teclado nos botoes de PC.
- [x] Completar botoes mobile com Ataque, Forte, Esquiva, Giro, Especial, Interagir, Bolsa e Mapa.
- [x] Manter joystick virtual esquerdo no mobile.
- [x] Unificar as acoes dos botoes em um controlador unico no Phaser.
- [x] Atualizar cache PWA para carregar a interface nova.

## Ticket LDK-0014 - Tela Inicial Oficial

- [x] Incorporar a arte anexada como referencia visual oficial da tela inicial.
- [x] Recriar a composicao de abertura com logo, personagens principais e atmosfera medieval epica.
- [x] Adicionar camadas animadas sutis de nevoa, particulas e reflexos magicos.
- [x] Criar menu principal premium com Novo Jogo, Continuar, Carregar Jogo, Configuracoes, Creditos e Sair.
- [x] Implementar efeitos de hover, clique, brilho dourado e sons sinteticos de interface.
- [x] Criar configuracoes funcionais para musica, efeitos, resolucao, tela cheia, idioma e controles.
- [x] Implementar fluxo funcional de Novo Jogo, Continuar, Carregar Jogo e persistencia de configuracoes.
- [x] Atualizar cache PWA para incluir a arte oficial offline.

## Ticket LDK-0015 - Trilha Sonora Dinamica

- [x] Criar diretor de musica dinamica desacoplado do mundo.
- [x] Criar faixas sinteticas para exploracao, cidade, taverna, floresta e caverna.
- [x] Trocar automaticamente a musica conforme a regiao do jogador.
- [x] Detectar monstros proximos e trocar suavemente para trilha de combate.
- [x] Aumentar a intensidade musical conforme ameaca e forca do inimigo.
- [x] Criar trilhas exclusivas para Boost e Azgorath.
- [x] Tocar vinheta curta de vitoria ao derrotar chefes.
- [x] Tocar tema triste e mostrar tela de derrota quando Ryden cai.
- [x] Criar trilhas de misterio e revelacao para momentos de historia.
- [x] Atualizar cache PWA para carregar o modulo de audio dinamico.

## Ticket LDK-0016 - Direcao Artistica Dark Fantasy

- [x] Rebaixar a paleta geral para fantasia medieval sombria, sem leitura colorida/cartunesca.
- [x] Escurecer tiles, vegetacao, agua, telhados, roupas e inimigos.
- [x] Adicionar florestas escuras, ruinas antigas dos dragoes, castelo em ruinas e caverna profunda.
- [x] Reforcar monstros assustadores com olhos vermelhos, sombras e dentes.
- [x] Criar modo de evento narrativo cinematografico com arte grande e caixa de dialogo inferior.
- [x] Permitir avancar dialogos manualmente em eventos de historia.
- [x] Pausar jogabilidade enquanto eventos narrativos importantes estao abertos.
- [x] Acionar eventos cinematograficos em sonhos, revelacoes, descobertas importantes e encontros com chefes.
- [x] Atualizar menus e paineis para molduras medievais mais sombrias.
- [x] Atualizar cache PWA para carregar a direcao visual nova.

## Ticket LDK-0017 - Interface Limpa e Foco no Mundo

- [x] Separar o menu principal da arte da capa, mantendo o poster como primeiro foco visual.
- [x] Adicionar a opcao Multiplayer ao menu inicial, com sessao local persistida para preparacao cooperativa.
- [x] Reduzir a HUD permanente para Vida, Poder, Nivel, Ouro e Missao Atual no canto superior esquerdo.
- [x] Criar minimapa compacto no canto superior direito com botao para aumentar e diminuir.
- [x] Transformar o painel lateral em gaveta discreta para nao ocupar a tela do jogo.
- [x] Reposicionar controles mobile nos cantos inferiores com joystick esquerdo e Ataque, Esquiva, Habilidade e Interagir a direita.
- [x] Tornar controles de PC e mobile semitransparentes para nao esconder Ryden, NPCs, monstros, baus ou caminho.
- [x] Reforcar o mundo com luz ao redor de Ryden, reflexo de agua e nevoa/particulas discretas.
- [x] Atualizar cache PWA para `orion-pwa-v17`.

## Ticket LDK-0018 - Campanha Mestre e Ruinas de Drakhar

- [x] Registrar a campanha completa com comeco, meio e fim, do Capitulo 1 ao Capitulo Final.
- [x] Manter a origem de Ryden protegida nos primeiros capitulos, usando pistas e sonhos em vez de revelacao direta.
- [x] Criar elenco cooperativo oficial para ate 4 jogadores: Ryden, Lyra, Elandor e Duran.
- [x] Atualizar Multiplayer Local para criar roster com Ryden ativo e aliados como NPCs ate escolha local.
- [x] Criar arvore de habilidades por ramos Fogo, Guerreiro e Dragao, com ramo sensivel bloqueado ate revelacao futura.
- [x] Adicionar Capitulo 3: Ruinas de Drakhar como primeira dungeon principal.
- [x] Adicionar armadilha, puzzle das tres runas, altar, baus, descobertas e evento cinematografico de entrada em Drakhar.
- [x] Adicionar novos inimigos: Esqueleto de Drakhar, Espirito Antigo e Guardiao de Drakhar.
- [x] Adicionar novos materiais/equipamentos: Aco Lunar, Fragmento Osseo, Reliquia Antiga, Lamina de Drakhar e Armadura de Brasas.
- [x] Adicionar animacao visual de subida de nivel.
- [x] Atualizar botoes mobile para seis comandos visiveis: Ataque, Esquiva, Hab. 1, Hab. 2, Hab. 3 e Interagir.
- [x] Atualizar cache PWA para `orion-pwa-v18`.

## Ticket LDK-0019 - Teste do Jogo e Cache PWA

- [x] Executar validacao automatizada de sintaxe JS, testes, PWA e scanner de segredos.
- [x] Executar smoke test jogavel de menu principal, Multiplayer, Novo Jogo, HUD, minimapa e painel lateral.
- [x] Executar smoke test de Drakhar e mobile com seis botoes.
- [x] Identificar erro de cache antigo misturando `main.js` novo com `content.js` antigo.
- [x] Corrigir o service worker para usar network-first em `/assets/js/` e `/assets/css/`.
- [x] Atualizar cache PWA para `orion-pwa-v19`.
- [x] Registrar screenshots finais em `dist/lord-dragons-test-desktop.png`, `dist/lord-dragons-test-drakhar.png` e `dist/lord-dragons-test-mobile.png`.

## Ticket LDK-0020 - Tela Inicial Cinematografica e Demo do Vale dos Dragoes

- [x] Analisar a composicao atual e remover o menu lateral separado da arte.
- [x] Integrar o menu principal diretamente na capa, com selecao, brilho dourado, profundidade e animacao suave.
- [x] Adicionar camadas vivas na abertura: parallax, brilho do logo, particulas, vento, nevoa, olhos do dragao, respiracao e fumaca.
- [x] Implementar navegacao do menu por mouse, teclado (`W/S`, setas, `Enter`, `Esc`) e controle.
- [x] Expandir efeitos sonoros sinteticos de hover, clique, abrir, fechar, confirmar, cancelar, novo jogo e carregar.
- [x] Melhorar o tema da tela inicial com camadas de melodia e grave, loop e fade out ao iniciar.
- [x] Criar tela funcional de criacao de personagem com nome, sexo, aparencia, cabelo, olhos e classe.
- [x] Registrar classes iniciais: Guerreiro, Mago, Arqueiro, Paladino, Assassino e Invocador.
- [x] Persistir personagem, mana e stamina no save.
- [x] Iniciar a demo no Vale dos Dragoes, mantendo a Casa do Mago como ponto narrativo do Capitulo 1.
- [x] Adicionar vila inicial, caverna antiga, castelo em ruinas, placa do vale e NPCs iniciais.
- [x] Manter demo jogavel com mapa, movimento, dialogos, inventario, missoes, save manual e save automatico.
- [x] Atualizar cache PWA para `orion-pwa-v20`.
- [x] Gerar pacote Web testavel em `dist/lord-dragons-web-demo-v20.zip`.

## Proximo Passo Recomendado

Seguir para `LDK-0021` para substituir os sprites procedurais por atlas pixel art versionado, mantendo a tela cinematografica e a campanha atual intactas.

## Itens Bloqueados Ate Aprovacao

- Codigo backend.
- Codigo frontend.
- Migracoes SQLAlchemy.
- Dependencias adicionais.
- Scripts de instalacao.
- Containerizacao.
- Empacotamento mobile.
