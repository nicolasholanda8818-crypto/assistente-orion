# ORION Bugs Found

Data: `2026-06-14`

## Resumo

Diagnostico executado sobre a fundacao atual do ORION sem recriar o projeto e sem
remover funcionalidades existentes.

## Bugs Confirmados

| ID | Area | Severidade | Evidencia | Impacto |
| --- | --- | --- | --- | --- |
| BUG-001 | Qualidade / CI | Media | `py -m ruff check app scripts tests` falha em `tests/test_lord_dragons.py` por linhas maiores que 120 caracteres | Pipeline completa pode ficar vermelha mesmo com os testes passando |
| BUG-002 | Visual 3D | Media | Navegador em `http://127.0.0.1:8000/` nao possui `#orion-scene canvas` | O fallback 2D aparece, mas a camada 3D existente nao fica preservada na tela principal |
| BUG-003 | Chat / Brain local | Media | Perguntas de identidade dependiam da resposta generica do fallback local | Orion nao respondia de forma consistente quem e seu criador durante o chat continuo |

## Itens Verificados Sem Erro Critico

- Estrutura de pastas principal existe.
- Backend FastAPI respondeu em `/api/health`.
- Frontend principal carregou no navegador.
- WebSocket conectou e mostrou `conectado`.
- Chat, microfone, camera e avatar 2D apareceram.
- PWA registrou service worker.
- Console do navegador nao apresentou erros ou warnings criticos na tela principal.
- `node --check` passou nos arquivos JavaScript.
- `py scripts/validate_pwa.py` passou.
- Testes focados de API, WebSocket, Design System e Lord Dragons passaram com `32 passed`.
- `py -m pip check` nao encontrou dependencias quebradas.
- `py scripts/check_secrets.py` passou.

## Observacoes

- Voz, memoria vetorial, upload, financas, professor e demais modulos avancados continuam
  fora do escopo funcional completo desta correcao.
- O objetivo desta rodada e estabilizar o que ja existe, nao implementar novos modulos.
