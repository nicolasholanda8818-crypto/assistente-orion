# ORION Backlog

## Convencao

Cada ticket possui objetivo unico e deve ser concluido, testado e documentado antes do proximo.

## Fase Lord Dragons - RPG 2D

| Ticket | Objetivo | Dependencias | Estado |
| --- | --- | --- | --- |
| LDK-0001 | Criar prototipo jogavel completo de Lord Dragons com sistemas centrais em Phaser.js | Aprovacao do usuario nesta sessao | Concluido |
| LDK-0002 | Criar visual premium, tela inicial, menus completos, mapa mundial e cidades vivas | LDK-0001 | Concluido |
| LDK-0003 | Implementar Capitulo 1: O Filho do Mago com tutorial e primeiros sistemas guiados | LDK-0002 | Concluido |
| LDK-0004 | Reorientar loop principal para exploracao, descoberta, progressao, historia e recompensa constante | LDK-0003 | Concluido |
| LDK-0005 | Alinhar jogo a biblia anexada com cronicas, paineis de historia, mapa informativo e segredo gradual | LDK-0004 | Concluido |
| LDK-0006 | Ocultar origem de Ryden ate a metade da campanha com pistas graduais nos primeiros capitulos | LDK-0005 | Concluido |
| LDK-0007 | Implementar jogabilidade top-down estilo Zelda classico, HUD permanente, joystick mobile e combate com espada visual | LDK-0006 | Concluido |
| LDK-0008 | Tornar a espada de Ryden fisicamente persistente nas costas e na mao durante ataques | LDK-0007 | Concluido |
| LDK-0009 | Substituir personagens temporarios por sprites pixel art oficiais de Ryden e Altheron | LDK-0008 | Concluido |
| LDK-0010 | Substituir cenario temporario da Casa do Mago por cabana medieval de fantasia | LDK-0009 | Concluido |
| LDK-0011 | Aplicar direcao visual da arte de referencia em UI, mapa, iluminacao e cenarios | LDK-0010 | Concluido |
| LDK-0012 | Adicionar base Zelda-like com tileset, tilemap, colisao, objetos interativos, spritesheet leve e Capitulo 2 | LDK-0011 | Concluido |
| LDK-0013 | Adicionar botoes completos de jogo para PC e mobile | LDK-0012 | Concluido |
| LDK-0014 | Recriar tela inicial oficial com arte de referencia, menu premium, configuracoes, audio e save/load | LDK-0013 | Concluido |
| LDK-0015 | Criar sistema de trilha sonora dinamica por exploracao, cidades, tavernas, florestas, cavernas, batalha, chefes, vitoria, derrota e historia | LDK-0014 | Concluido |
| LDK-0016 | Aplicar direcao artistica oficial dark fantasy com eventos narrativos cinematograficos | LDK-0015 | Concluido |
| LDK-0017 | Reorganizar interface para priorizar mundo, capa, HUD compacto, minimapa e controles discretos | LDK-0016 | Concluido |
| LDK-0018 | Estruturar campanha completa, cooperativo ate 4 jogadores e Capitulo 3 nas Ruinas de Drakhar | LDK-0017 | Concluido |
| LDK-0019 | Testar jogo completo e corrigir atualizacao de cache PWA dos modulos JS/CSS | LDK-0018 | Concluido |
| LDK-0020 | Recriar tela inicial cinematografica com menu integrado, criacao de personagem e demo no Vale dos Dragoes | LDK-0019 | Concluido |
| LDK-0021 | Substituir sprites procedurais por atlas pixel art versionado | LDK-0020 | Pendente |
| LDK-0022 | Criar balanceamento avancado, multiplos chefes e saves por slot | LDK-0020 | Pendente |
| LDK-0023 | Implementar capitulos 4 a final como dungeons e eventos jogaveis completos | LDK-0020 | Pendente |

## Fase 0 - Governanca

| Ticket | Objetivo | Dependencias |
| --- | --- | --- |
| T0000-CORR-20260614 | Corrigir estabilidade do site/PWA, chat continuo, canvas 3D/fallback e relatorios de auditoria local | Ajuste prioritario visual aprovado |
| T0000-LIVE-20260614 | Tornar Orion um Living Avatar com falas dinamicas, vida propria, olhar inteligente e quarto interativo | T0000-CORR-20260614 |
| T0000-ONLINE-20260614 | Manter Orion online permanentemente no Windows com script persistente e reconexao WebSocket infinita | T0000-LIVE-20260614 |
| T0000-MEM-20260621 | Implementar memoria de usuario por navegador, nome, preferencias, projetos e assuntos nao sensiveis | T0000-ONLINE-20260614 |
| T0001 | Criar estrutura canonica, arquivos de configuracao e baseline do repositorio | Gate G0 aprovado |
| T0002 | Configurar FastAPI, health checks e ciclo de vida local | T0001 |
| T0003 | Configurar PWA base, manifest, service worker e offline shell | T0001 |

## Fase 1 - Persistencia e API Interna

| Ticket | Objetivo | Dependencias |
| --- | --- | --- |
| T0004 | Implementar SQLite, SQLAlchemy, sessoes e Alembic | T0002 |
| T0005 | Criar modelos iniciais e seed versionado | T0004 |
| T0006 | Implementar Command Bus, Event Bus e Message Bus | T0004 |
| T0007 | Implementar WebSocket autenticavel e eventos basicos | T0006 |

## Fase 2 - Identidade, Configuracao e Seguranca Base

| Ticket | Objetivo | Dependencias |
| --- | --- | --- |
| T0008 | Implementar usuarios, perfis, roles e permissoes | T0005 |
| T0009 | Implementar login admin, usuario, convidado e JWT | T0008 |
| T0010 | Implementar Orion Config global e por usuario | T0008 |
| T0011 | Implementar Vault AES-256-GCM para segredos | T0009 |
| T0012 | Implementar auditoria e logs estruturados locais | T0006, T0009 |

## Fase 3 - Memoria, Voz e Cerebro

| Ticket | Objetivo | Dependencias |
| --- | --- | --- |
| T0013 | Implementar ChromaDB e memoria curta/longa | T0005, T0006 |
| T0014 | Implementar preferencias, historico, busca e resumos | T0013 |
| T0015 | Implementar Vosk, pyttsx3 e wake word Orion | T0006, T0010 |
| T0016 | Implementar Orion Command Engine e parser de intencoes | T0015 |
| T0017 | Integrar Brain ao Model Runtime com Ollama, LM Studio, OpenAI compativel, providers futuros e fallback local | T0014, T0016, T0011, T0012 |
| T0018 | Implementar Dream Mode com APScheduler | T0014, T0012 |

## Fase 4 - Produtividade e Conteudo

| Ticket | Objetivo | Dependencias |
| --- | --- | --- |
| T0019 | Implementar Orion Finance backend e exportacao CSV | T0009, T0005 |
| T0020 | Implementar sistema de arquivos e organizacao | T0009, T0012 |
| T0021 | Implementar Planner, lembretes e notificacoes base | T0009, T0006 |
| T0022 | Implementar OCR e Knowledge com busca semantica | T0020, T0014 |
| T0023 | Implementar Vision com camera, QR, texto e objetos | T0020 |
| T0024 | Implementar Academy, flashcards e revisao espacada | T0014, T0022 |
| T0025 | Implementar Focus Mode | T0021, T0024 |
| T0026 | Implementar Music local | T0020, T0016 |

## Fase 5 - Experiencia, PC e Multiplayer

| Ticket | Objetivo | Dependencias |
| --- | --- | --- |
| T0027 | Implementar frontend base responsivo sobre o Design System compartilhado | T0003, T0009 |
| T0028 | Implementar cenario Three.js e avatar base | T0027 |
| T0029 | Implementar animacoes, emocoes e skins do avatar | T0028, T0017 |
| T0030 | Integrar Academy, Music e Voice ao avatar | T0024, T0026, T0029 |
| T0031 | Implementar Control protegido com adapters desktop, iniciando por Windows | T0009, T0012, T0016 |
| T0032 | Implementar multiplayer local, convites e sincronizacao | T0007, T0028 |

## Fase 6 - Plataforma

| Ticket | Objetivo | Dependencias |
| --- | --- | --- |
| T0033 | Implementar Plugin SDK, permissoes e marketplace local | T0006, T0011 |
| T0034 | Implementar hot reload seguro e assinatura de plugins | T0033 |
| T0035 | Implementar backup completo, restauracao e agendamento | T0004, T0013, T0020 |
| T0036 | Implementar atualizacao segura com backup e rollback | T0035, T0012 |
| T0037 | Implementar telemetria, monitoramento e dashboard admin | T0012, T0007 |
| T0038 | Implementar exportacoes PDF, CSV e JSON | T0019, T0020, T0014 |
| T0039 | Migrar assistente de configuracao inicial para Identity, Orion Config e Vault | T0010, T0011 |
| T0040 | Criar bridge de plataforma e empacotar clientes companion com Capacitor para Android e iOS | T0027, T0021, T0009 |
| T0041 | Criar Docker, Compose e persistencia para ambientes suportados | T0035 |

## Fase 7 - Qualidade e Release

| Ticket | Objetivo | Dependencias |
| --- | --- | --- |
| T0042 | Criar suite Pytest e coverage minimo de 80% | Todos os tickets backend |
| T0043 | Criar testes E2E PWA, mobile e acessibilidade | T0040 |
| T0044 | Criar testes de desempenho e abuso WebSocket | T0037 |
| T0045 | Executar auditoria SQLi, XSS, CSRF, uploads e plugins | T0042 |
| T0046 | Criar instalador profissional e verificador para hosts desktop suportados | T0041 |
| T0047 | Preparar documentacao automatica, manuais e deploy | T0046 |
| T0048 | Executar auditoria final e preparar ORION 1.0 | T0042-T0047 |
| T0049 | Auditar cobertura da Wiki interna gerada antes do release 1.0 | T0047 |
| T0050 | Auditar changelog gerado e metadados de release antes do release 1.0 | T0047 |
| T0051 | Auditar Release Candidate, remover bloqueios e aprovar promocao administrativa | T0042-T0050 |
| T0052 | Preparar distribuicao 1.0 somente apos RC aprovado, artefato verificado e aprovacao administrativa | T0051 |
