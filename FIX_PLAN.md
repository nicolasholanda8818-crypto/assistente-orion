# ORION Fix Plan

Data: `2026-06-14`

## Objetivo

Corrigir os erros encontrados sem recriar o projeto, sem remover funcionalidades e sem
mudar a identidade do ORION.

## Regras

- Criar backup antes de alterar arquivos.
- Corrigir problemas pontuais.
- Preservar PWA, WebSocket, chat, avatar 2D e Lord Dragons.
- Nao adicionar modulos complexos novos.
- Nao inserir segredos, CPF, tokens ou senhas hardcoded.

## Plano De Correcao

| Ordem | Bug | Acao | Validacao |
| --- | --- | --- | --- |
| 1 | BUG-001 | Quebrar listas longas em `tests/test_lord_dragons.py` | `py -m ruff check app scripts tests` |
| 2 | BUG-002 | Reintroduzir container 3D leve na tela principal e iniciar `scene.js` sem prejudicar o fallback 2D | Navegador deve mostrar canvas 3D ou fallback sem erro de console |
| 3 | BUG-003 | Adicionar intents deterministicas de identidade ao Brain local | `tests/test_brain.py` e teste manual pelo chat |
| 4 | Regressao | Rodar testes focados de API, WebSocket, Design System, PWA e Lord Dragons | Pytest e validacao PWA verdes |
| 5 | Relatorios | Gerar `BUGS_FIXED.md`, `TEST_REPORT.md`, `SECURITY_REPORT.md`, `PERFORMANCE_REPORT.md`, `NEXT_STEPS.md`, `FEATURE_MATRIX.md` e atualizar `PROJECT_STATUS.md` | Arquivos presentes e coerentes |

## Escopo Fora Desta Rodada

- IA generativa completa.
- Voz com Vosk/pyttsx3 em producao.
- ChromaDB persistente.
- Financas, professor, plugins e controle do PC completos.
- Deploy cloud final.
