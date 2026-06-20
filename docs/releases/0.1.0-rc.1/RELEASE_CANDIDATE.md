# ORION 0.1.0-rc.1 Release Candidate Report

## Resumo

| Campo | Valor |
| --- | --- |
| Candidato | `0.1.0-rc.1` |
| Data | `2026-06-02` |
| Escopo | `local-foundation-evaluation-only` |
| Status | `BLOCKED FOR PROMOTION` |
| Definicao | `release-candidates/0.1.0-rc.1.json` |
| Benchmark | `docs/releases/0.1.0-rc.1/performance.json` |

Este RC cria um pacote verificavel para a fundacao local do ORION, mas nao aprova uso
em producao, LAN, tunel ou internet.

## Gates

| Gate | Resultado | Evidencia |
| --- | --- | --- |
| Lint e formatacao | aprovado | `ruff check .`, `ruff format --check .` |
| JavaScript e PWA | aprovado | `node --check`, `scripts/validate_pwa.py` |
| Testes backend | `74 passed`, coverage `94.99%` | `pytest --cov=app --cov-fail-under=80` |
| E2E | `5 passed` | `pytest tests/e2e -m e2e` |
| Performance | aprovado | `docs/releases/0.1.0-rc.1/performance.json` |
| Seguranca | bloqueado para promocao | `docs/releases/0.1.0-rc.1/SECURITY_AUDIT.md` |
| Build RC | aprovado | `scripts/build_release_candidate.py` |

## Performance Inicial

| Metrica | p95 | Limite | Resultado |
| --- | --- | --- | --- |
| SQLite startup | `63.015 ms` | `300 ms` | aprovado |
| REST health | `8.509 ms` | `30 ms` | aprovado |
| REST status | `12.534 ms` | `75 ms` | aprovado |
| Brain process | `7.668 ms` | `75 ms` | aprovado |
| WebSocket roundtrip | `19.095 ms` | `75 ms` | aprovado |
| Pico de memoria tracemalloc | `1.561 MiB` | `64 MiB` | aprovado |

## Artefatos

| Artefato | Valor |
| --- | --- |
| Pacote | `dist/orion-foundation-0.1.0-rc.1.zip` |
| Checksum | `dist/orion-foundation-0.1.0-rc.1.zip.sha256` |
| Manifesto | `dist/orion-foundation-0.1.0-rc.1.manifest.json` |
| SHA-256 | atualizado pelo build final do RC |
| Tamanho | atualizado pelo build final do RC |

## Bloqueios

- WebSocket da fundacao aceita conexoes anonimas e nao valida `Origin`.
- WebSocket da fundacao ainda nao possui limite de payload, rate limit, heartbeat ou backpressure.
- WebSocket da fundacao retransmite mensagens cruas globalmente e persiste payload recebido.
- Identidade, verificacao de restore de backup e rollback de update assinado ainda nao estao implementados.
- Ambiente local de validacao possui pacotes instalados vulneraveis fora dos requisitos runtime declarados.

## Decisao

`0.1.0-rc.1` pode ser usado apenas como candidato de avaliacao local da fundacao. Ele
nao deve ser promovido enquanto os bloqueios acima nao forem tratados e revalidados.
