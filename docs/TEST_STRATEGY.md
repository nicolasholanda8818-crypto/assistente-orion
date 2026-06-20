# ORION Test Strategy

## Objetivos

- Evitar regressao entre tickets.
- Garantir isolamento entre modulos.
- Cobrir fluxos criticos.
- Validar instalacao limpa.
- Medir desempenho local.

## Piramide

| Nivel | Escopo | Ferramentas |
| --- | --- | --- |
| Unitario | dominio, parsers, permissoes e utilitarios | Pytest |
| Integracao | SQLAlchemy, SQLite, ChromaDB, buses e adapters de plataforma | Pytest |
| Model Runtime | envelopes de protocolo, selecao, bloqueio remoto e sanitizacao | Pytest |
| API | REST, JWT, erros e rate limits | FastAPI TestClient/httpx |
| WebSocket | conexao, auth, limites e broadcast | TestClient/WebSocket |
| E2E | PWA, offline, install prompt e navegacao | Playwright |
| Mobile | permissoes e embalagem | Capacitor toolchains |
| Performance | latencia, CPU, RAM e vetores | Pytest-benchmark e scripts |
| Security | abuso e entradas maliciosas | suites dedicadas |

## Meta

- Cobertura backend global minima: 80%.
- Cobertura para componentes Nivel 0: 90% ou justificativa documentada.
- Nenhum release com teste critico falhando.

## Suites Obrigatorias

### Banco

- migration de banco vazio;
- upgrade entre versoes;
- foreign keys;
- rollback documentado;
- backup e restore;
- reconciliacao SQLite/ChromaDB.

### API

- sucesso;
- entrada invalida;
- auth ausente;
- permissao negada;
- limite excedido;
- erro interno sanitizado.

### WebSocket

- handshake autenticado;
- desconexao;
- reconnect;
- tamanho maximo;
- rate limit;
- isolamento de sessao;
- abuso de mensagem.

### Seguranca

- SQLi;
- XSS;
- CSRF;
- traversal;
- upload malicioso;
- segredo em log;
- provider remoto sem consentimento, HTTPS ou allowlist;
- fallback remoto automatico;
- plugin sem permissao;
- comando destrutivo sem confirmacao.

### PWA e Acessibilidade

- manifest valido;
- service worker registrado;
- cache offline;
- instalacao Android;
- instrucao de instalacao iOS;
- teclado;
- foco visivel;
- contraste;
- leitor de tela;
- texto ampliado;
- perfil idoso.

## Desempenho

Medir:

- tempo de resposta REST;
- latencia WebSocket;
- consumo de CPU e RAM;
- inicializacao;
- busca vetorial;
- carga da cena Three.js;
- jobs de backup;
- OCR e modelos locais.

Baseline automatizado atual:

```powershell
python scripts/run_performance.py --output .sandbox-tmp/performance.json --fail-on-threshold
```

O script roda em armazenamento temporario isolado, mede startup SQLite, REST,
WebSocket, Brain baseline e pico de memoria. Metricas de ChromaDB, Three.js e backup
permanecem adiadas ate seus tickets funcionais.

## Gate por Ticket

Cada ticket deve incluir:

1. testes automatizados proporcionais ao risco;
2. roteiro manual;
3. criterios de aceitacao;
4. resultado registrado em `PROJECT_STATUS.md`.

## Gate De Distribuicao

A distribuicao 1.0 deve executar `scripts/prepare_distribution.py` contra o manifesto
do RC aprovado. O comando precisa falhar quando o candidato estiver bloqueado, quando o
hash do artefato divergir ou quando relatorios obrigatorios estiverem ausentes.

## Baseline E2E

A fundacao possui jornadas Playwright executadas contra um servidor de cenario isolado
em `tests/e2e`. O baseline cobre login, conversa WebSocket, upload, financas e
multiplayer com dois navegadores. Esses cenarios exercitam contratos esperados e devem
ser conectados aos endpoints reais conforme os tickets funcionais forem aprovados.

## Matriz De Plataformas

| Plataforma | Baseline CI | Gate futuro |
| --- | --- | --- |
| Linux | testes backend | instalacao limpa e adapters |
| Windows | testes backend e desenvolvimento local | instalacao limpa |
| macOS | testes backend | instalacao limpa, Keychain e build iOS |
| Web | E2E Chromium e validacao PWA | WebKit, acessibilidade e offline ampliado |
| Android | arquitetura companion | emulator e permissoes Capacitor |
| iOS | arquitetura companion | simulator, permissoes e assinatura |
