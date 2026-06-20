# ORION 0.1.0-rc.1 Security Audit

## Escopo

Auditoria local da fundacao empacotavel do ORION. O escopo nao inclui rede externa,
LAN, Cloudflare Tunnel, plugins carregados, uploads de producao, controle do PC,
providers de IA remotos, backup restauravel ou update assinado.

## Resultado

Status: `BLOCKED FOR PROMOTION`

O pacote pode ser gerado para avaliacao local, mas nao deve ser promovido para uso
publico ou remoto.

## Evidencias Coletadas

| Verificacao | Resultado |
| --- | --- |
| `powershell -ExecutionPolicy Bypass -File .\scripts\run_ci.ps1 -SkipInstall -SkipBrowserInstall` | aprovado, com RC ainda bloqueado para promocao |
| `bandit -q -r app` | aprovado |
| `scripts/check_secrets.py` | aprovado |
| `pip-audit -r requirements.txt --no-deps --disable-pip --progress-spinner off` | aprovado, sem vulnerabilidades conhecidas nos requisitos runtime diretos |
| `pip-audit --local --progress-spinner off --timeout 30` | bloqueio encontrado no ambiente local |
| `pip show chromadb python-multipart` | pacotes vulneraveis instalados fora de `requirements.txt` |
| `rg` em `app` e `tests` | nenhuma importacao runtime atual de `chromadb`; upload E2E usa cenario isolado |

## Vulnerabilidades Do Ambiente Local

| Pacote | Versao instalada | Achado | Mitigacao requerida |
| --- | --- | --- | --- |
| `chromadb` | `1.5.3` | `CVE-2026-45829` | remover do ambiente de validacao ou atualizar antes de usar memoria vetorial |
| `python-multipart` | `0.0.20` | `CVE-2026-24486`, correcao `0.0.22` | atualizar quando uploads reais entrarem no runtime |
| `python-multipart` | `0.0.20` | `CVE-2026-40347`, correcao `0.0.26` | atualizar quando uploads reais entrarem no runtime |
| `python-multipart` | `0.0.20` | `CVE-2026-42561`, correcao `0.0.27` | atualizar quando uploads reais entrarem no runtime |

Esses pacotes nao fazem parte dos requisitos runtime declarados da fundacao atual, mas
existem no ambiente de validacao. Por isso o RC fica bloqueado para promocao ate que o
ambiente limpo seja reproduzido ou as dependencias sejam atualizadas/removidas.

## Bloqueios De Arquitetura

- `W01-W07` em `THREAT_MODEL.md` permanecem aplicaveis ao WebSocket da fundacao.
- Acesso fora de `127.0.0.1` permanece proibido.
- Identidade, permissoes, backup restauravel e update assinado ainda nao fazem parte da fundacao.
- Plugins, uploads de producao e controle do PC permanecem desabilitados por arquitetura.

## Criterios Para Desbloqueio

- Validar RC em ambiente limpo com apenas dependencias declaradas.
- Atualizar ou remover pacotes vulneraveis do ambiente de validacao.
- Implementar e testar autenticacao, autorizacao, `Origin`, limites e isolamento de WebSocket antes de qualquer uso em rede.
- Implementar backup com restore verificado antes de update e promocao operacional.
- Registrar nova auditoria antes de mudar o candidato para `ready-for-promotion-review`.
