# ORION Distribution

## Objetivo

Preparar o ORION para distribuicao sem transformar um candidato bloqueado em release.
Este documento define o gate para a futura versao `1.0.0`.

## Status Atual

| Campo | Valor |
| --- | --- |
| Versao alvo | `1.0.0` |
| Candidato avaliado | `0.1.0-rc.1` |
| Status | `blocked` |
| Relatorio de prontidao | `dist/orion-distribution-readiness-1.0.0.json` |

## Comandos

Gerar o pacote RC:

```powershell
python scripts/build_release_candidate.py --candidate release-candidates/0.1.0-rc.1.json
```

Gerar o relatorio de prontidao para distribuicao:

```powershell
python scripts/prepare_distribution.py --target-version 1.0.0
```

Falhar explicitamente quando a distribuicao estiver bloqueada:

```powershell
python scripts/prepare_distribution.py --target-version 1.0.0 --fail-on-blocked
```

## Criterios Para Distribuir 1.0

- candidato em `ready-for-promotion-review`;
- artefato, manifesto e SHA-256 verificados;
- auditoria de dependencias limpa no ambiente de distribuicao;
- todos os testes automatizados e E2E aprovados;
- baseline de performance aprovado;
- backup, restore, update e rollback verificados;
- WebSocket autenticado, limitado e isolado por sessao;
- aprovacao administrativa explicita.

Enquanto qualquer item acima falhar, o ORION pode gerar pacote de avaliacao local, mas
nao deve ser distribuido como `1.0.0`.
