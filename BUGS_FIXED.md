# ORION Bugs Fixed

Data: `2026-06-14`

## Resumo

Correcao total executada sem recriar o projeto, sem remover funcionalidades existentes e mantendo o foco em estabilidade do site/PWA, chat continuo, WebSocket e visual 2D/3D.

## Correcoes Aplicadas

| ID | Status | Arquivos principais | Resultado |
| --- | --- | --- | --- |
| BUG-001 | Corrigido | `tests/test_lord_dragons.py` | Linhas longas foram quebradas e `ruff` voltou a passar. |
| BUG-002 | Corrigido | `frontend/index.html`, `frontend/assets/js/main.js`, `frontend/assets/js/scene.js`, `frontend/assets/css/styles.css` | Tela principal preserva uma camada `#orion-scene` com canvas Three.js ou fallback canvas local leve. |
| BUG-003 | Corrigido | `app/brain/text.py`, `app/brain/planning.py`, `app/tools/builtins.py`, `tests/test_brain.py` | Brain local reconhece intents de identidade e responde o criador sem depender de modelo externo. |

## Backup

Backup previo criado em:

`storage/backups/20260614-correction-total`

## Evidencia Visual

Captura salva em:

`docs/orion-correction-browser.png`

## Correcao Urgente - Deploy Render

Data: `2026-06-20`

Escopo: correcao minima para carregamento publico no Render, sem alterar visual, avatar, chat, arquitetura ou funcionalidades existentes.

| ID | Status | Arquivos principais | Resultado |
| --- | --- | --- | --- |
| BUG-004 | Corrigido | `app/main.py` | Rota `/healthz` criada e rota explicita `/assets` adicionada para servir CSS/JS com MIME correto em producao. |
| BUG-005 | Corrigido | `frontend/assets/js/api.js` | Chamadas REST passam a usar `window.location.origin`, evitando dependencia de `localhost`, `127.0.0.1` ou IP local em deploy publico. |
| BUG-006 | Corrigido | `frontend/service-worker.js` | Cache PWA atualizado para `orion-pwa-v25-render`, reduzindo risco de tela branca por cache antigo apos deploy. |
| BUG-007 | Corrigido | `tests/test_api.py`, `tests/test_design_system.py` | Testes cobrem `/healthz`, arquivos PWA e assets principais servidos pelo backend. |

Validacao:

- `python -m ruff check app scripts tests`: aprovado.
- `python -m pytest tests\test_api.py tests\test_websocket.py tests\test_design_system.py tests\test_brain.py -q`: `37 passed, 1 warning`.
- `node --check` nos JavaScripts do frontend/E2E: aprovado.
- `python scripts\validate_pwa.py`: aprovado.
- Local: `/`, `/healthz`, `/api/health`, `/assets/css/styles.css`, `/assets/js/main.js`, `/manifest.webmanifest`, `/service-worker.js` e `/offline.html` retornaram `200`.
- WebSocket local: `ws://127.0.0.1:8000/ws` conectou e respondeu `oi`.
