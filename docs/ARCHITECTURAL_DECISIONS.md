# ORION Architectural Decisions

## ADR-001 - FastAPI

Contexto: ORION precisa de API local, WebSocket, validacao de contratos e documentacao automatica.

Alternativas:

- Flask;
- Django;
- Node.js.

Decisao: usar FastAPI.

Consequencias:

- contratos Pydantic se tornam centrais;
- async deve ser usado com criterio;
- OpenAPI pode documentar a API externa.

## ADR-002 - SQLite com SQLAlchemy

Contexto: a instalacao local precisa ser simples no Windows.

Alternativas:

- PostgreSQL local;
- arquivos JSON;
- banco embarcado alternativo.

Decisao: usar SQLite com SQLAlchemy e Alembic.

Consequencias:

- instalacao sem servidor de banco;
- escrita concorrente deve ser controlada;
- migrations e backups sao obrigatorios.

## ADR-003 - ChromaDB

Contexto: memoria e conhecimento exigem busca vetorial local.

Alternativas:

- SQLite com extensao vetorial;
- FAISS gerenciado manualmente;
- servico vetorial remoto.

Decisao: usar ChromaDB persistente local.

Consequencias:

- backup deve incluir ChromaDB;
- reconciliacao com SQLite e necessaria;
- nenhum dado vetorial precisa sair do dispositivo.

## ADR-004 - Three.js

Contexto: cenario gamer, avatar e objetos interativos precisam funcionar no navegador.

Alternativas:

- canvas 2D;
- engine de jogo externa;
- WebGL manual.

Decisao: usar Three.js.

Consequencias:

- qualidade precisa ser adaptavel;
- fallback visual deve existir;
- performance mobile deve ser medida.

## ADR-005 - PWA e Capacitor

Contexto: ORION deve rodar no navegador e ser instalavel em Android e iPhone.

Alternativas:

- apps nativos separados;
- Electron;
- somente web.

Decisao: PWA como experiencia primaria e Capacitor para empacotamento mobile.

Consequencias:

- frontend unico;
- permissoes nativas precisam de adapters;
- iOS exige validacao em macOS/Xcode.

## ADR-006 - API Interna por Buses

Contexto: muitos modulos evoluirao em ritmos diferentes.

Alternativas:

- imports diretos;
- chamadas HTTP internas;
- fila externa.

Decisao: Command Bus, Event Bus e Message Bus in-process com contratos versionados.

Consequencias:

- menor acoplamento;
- mais disciplina na modelagem de eventos;
- futura troca por transporte externo permanece possivel.

## ADR-007 - Model Runtime Por Adapters

Contexto: o Brain precisa evoluir entre Ollama, LM Studio, APIs OpenAI compativeis e
providers futuros sem depender de um protocolo unico.

Alternativas:

- chamar Ollama diretamente no Brain;
- usar somente protocolo OpenAI compativel;
- escolher provider por fallback automatico.

Decisao: usar registry de providers e adapters por protocolo com selecao explicita.

Consequencias:

- Brain permanece independente do transporte;
- providers locais aceitam somente loopback;
- providers remotos exigem consentimento, HTTPS, Vault e allowlist;
- fallback remoto automatico e proibido;
- cada adapter futuro exige testes e revisao do threat model.
