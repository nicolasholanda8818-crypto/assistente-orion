# ORION Roadmap

## Visao Geral

O ORION sera entregue em marcos incrementais. Cada versao deve permanecer executavel, verificavel e recuperavel. Nenhuma versao avanca sem concluir seus gates de testes, seguranca e documentacao.

## Orion 0.1 - Fundacao Local

Objetivo: estabelecer uma base confiavel para desenvolvimento incremental.

Entregas:

- estrutura canonica do repositorio;
- backend FastAPI local;
- SQLite com SQLAlchemy e migracoes;
- health checks;
- API interna com Command Bus, Event Bus e Message Bus;
- WebSocket basico;
- PWA instalavel com manifest, service worker e cache offline;
- logs locais iniciais;
- documentacao tecnica e scripts de desenvolvimento para Windows.

Resultado esperado:

O ORION inicia localmente, abre no navegador, pode ser instalado como PWA e possui uma base modular pronta para receber funcionalidades.

Tickets principais:

`T0001` a `T0007`.

## Orion 0.5 - Assistente Pessoal Local

Objetivo: entregar o primeiro assistente pessoal utilizavel com identidade, memoria, voz e produtividade essencial.

Entregas:

- usuarios, perfis, roles, permissoes e JWT;
- configuracoes globais e por usuario;
- cofre AES-256-GCM;
- auditoria local;
- memoria curta e longa com ChromaDB;
- preferencias, historico, busca semantica e resumos;
- voz offline com Vosk, pyttsx3 e wake word Orion;
- parser de comandos;
- Brain com Ollama e fallback local;
- Dream Mode;
- Orion Finance;
- sistema de arquivos;
- Planner e notificacoes basicas;
- frontend responsivo com chat, perfil e configuracoes.

Resultado esperado:

O usuario possui um assistente local autenticado, com memoria, voz e ferramentas pessoais essenciais.

Tickets principais:

`T0008` a `T0027`.

## Orion 1.0 - Ecossistema Pessoal Estavel

Objetivo: preparar uma versao completa, segura e distribuivel para uso pessoal diario.

Entregas:

- documentos, OCR e Orion Knowledge;
- Orion Vision;
- Orion Academy;
- Focus Mode;
- Orion Music;
- cenario Three.js;
- avatar com animacoes, emocoes e skins;
- integracao entre avatar, voz, Academy e Music;
- Orion Control protegido com adapters desktop;
- multiplayer local;
- Plugin SDK, marketplace local e hot reload seguro;
- backup, restauracao e agendamento;
- atualizacao segura com confirmacao administrativa e rollback;
- telemetria e dashboard administrativo local;
- exportacoes PDF, CSV e JSON;
- onboarding criptografado;
- bridge multiplataforma e clientes companion Capacitor para Android e iOS;
- Docker e Docker Compose;
- cobertura automatizada minima de 80%;
- auditoria final, instalador e documentacao de release.

Resultado esperado:

ORION 1.0 funciona a partir de uma instalacao limpa, possui recuperacao testada e nao apresenta erro critico conhecido.

Tickets principais:

`T0028` a `T0048`.

## Orion 2.0 - Plataforma Extensivel

Objetivo: evoluir o ORION de assistente pessoal para plataforma local extensivel e madura.

Entregas planejadas:

- API publica versionada para integracoes locais;
- marketplace de plugins amadurecido;
- sandbox mais forte para plugins;
- Knowledge Graph para pessoas, arquivos, conversas e assuntos;
- automacoes compostas por usuario;
- multiplayer local expandido;
- sincronizacao opcional entre dispositivos com criptografia ponta a ponta;
- Model Manager avancado;
- suporte ampliado a modelos locais;
- qualidade adaptativa aprimorada para avatar e visao;
- politicas empresariais opcionais para ambientes controlados;
- migracao assistida caso SQLite deixe de atender cenarios comprovados;
- ferramentas avancadas de diagnostico, observabilidade e recuperacao.

Resultado esperado:

ORION torna-se uma plataforma local-first extensivel, preservando privacidade, modularidade e operacao offline.

## Gates de Release

Toda versao exige:

- testes relevantes aprovados;
- nenhuma vulnerabilidade critica aberta;
- migracoes verificadas;
- backup e restauracao testados;
- documentacao atualizada;
- instalacao limpa validada;
- changelog publicado;
- aprovacao explicita do responsavel pelo produto.
