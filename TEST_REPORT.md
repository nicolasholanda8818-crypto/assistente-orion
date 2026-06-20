# ORION Test Report

Data: `2026-06-14`

## Validacoes Automatizadas

| Comando | Resultado |
| --- | --- |
| `python -m ruff check app scripts tests` | Aprovado |
| `python -m pytest tests/test_api.py tests/test_websocket.py tests/test_design_system.py tests/test_lord_dragons.py tests/test_brain.py -q` | `41 passed, 1 warning` |
| `Get-ChildItem frontend,tests/e2e/static -Recurse -Filter *.js | node --check` | Aprovado |
| `python scripts/validate_pwa.py` | Aprovado |
| `C:/Users/nicolas keven lopes/AppData/Local/Python/bin/python.exe scripts/check_secrets.py` | Aprovado |
| `C:/Users/nicolas keven lopes/AppData/Local/Python/bin/python.exe -m pip check` | Aprovado |

## Validacao Manual no Navegador

URL validada: `http://127.0.0.1:8000/`

| Item | Resultado |
| --- | --- |
| Site abre no navegador | Aprovado |
| Avatar Orion aparece | Aprovado |
| Canvas 3D/fallback existe em `#orion-scene` | Aprovado |
| Chat aparece abaixo do Orion | Aprovado |
| Microfone a esquerda do input | Aprovado |
| Camera a direita do input | Aprovado |
| WebSocket conectado | Aprovado |
| Envio de `ola` gera resposta | Aprovado |
| Pergunta `quem criou voce?` gera resposta deterministica | Aprovado |
| 30 mensagens seguidas nao travam a pagina | Aprovado |
| Log visual fica limitado a 42 mensagens | Aprovado |
| Clique/toque no Orion gera reacao | Aprovado |
| Console do navegador sem erros/warnings | Aprovado |

## Avisos

- Ha um aviso de depreciacao do `TestClient` herdado da pilha FastAPI/Starlette local. Nao bloqueia a execucao atual.
- A instalacao PWA pode mostrar `controller` ausente no primeiro carregamento; o service worker registra e assume controle apos reload, comportamento normal de navegador.
- O alias `python` do WindowsApps apareceu antes do executavel real em alguns shells; os checks sensiveis foram repetidos com o Python real instalado.
