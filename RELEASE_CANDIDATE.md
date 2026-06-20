# ORION Release Candidate

## Objetivo

Definir o processo verificavel para criar um Release Candidate do ORION sem promover
uma versao que ainda possua bloqueios criticos.

## Candidato Atual

| Campo | Valor |
| --- | --- |
| Candidato | `0.1.0-rc.1` |
| Escopo | `local-foundation-evaluation-only` |
| Status | `blocked-for-promotion` |
| Definicao | `release-candidates/0.1.0-rc.1.json` |
| Relatorio | `docs/releases/0.1.0-rc.1/RELEASE_CANDIDATE.md` |

## Gates Obrigatorios

Um RC deve executar:

- auditoria de seguranca;
- lint e formatacao;
- testes automatizados com cobertura minima;
- testes E2E;
- baseline de performance;
- validacao PWA;
- verificacao de Wiki e changelog gerados;
- scanner de segredos;
- auditoria de dependencias;
- build do artefato;
- checksum SHA-256 e manifesto.

## Comandos

Executar a esteira local completa:

```powershell
.\scripts\run_ci.ps1 -SkipInstall -SkipBrowserInstall
```

Executar o benchmark isolado:

```powershell
python scripts/run_performance.py --output docs/releases/0.1.0-rc.1/performance.json --fail-on-threshold
```

Gerar o artefato do candidato:

```powershell
python scripts/build_release_candidate.py --candidate release-candidates/0.1.0-rc.1.json
```

## Regras De Promocao

Um candidato so pode mudar para `ready-for-promotion-review` quando:

- todos os testes passarem;
- a auditoria de dependencias do ambiente de validacao nao possuir vulnerabilidade critica ou alta sem mitigacao;
- `THREAT_MODEL.md` nao listar bloqueio critico aplicavel ao escopo promovido;
- backup, restore, update e rollback estiverem verificados para o escopo da versao;
- o administrador aprovar explicitamente a promocao.

`0.1.0-rc.1` permanece bloqueado porque a fundacao ainda tem lacunas conhecidas de
WebSocket, identidade, backup, rollback assinado e dependencias vulneraveis instaladas
no ambiente local de validacao.
