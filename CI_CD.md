# ORION CI/CD

## Objetivo

Executar verificacoes automaticas em cada `push`, `pull_request` e acionamento manual.

Workflow:

```text
.github/workflows/ci.yml
```

## Gates

| Gate | Ferramentas | Resultado |
| --- | --- | --- |
| Lint | Ruff, Node.js, validador PWA, Wiki check, changelog check | Python formatado, JS valido e artefatos gerados consistentes |
| Testes | Pytest, pytest-cov | testes em Linux e Windows com cobertura minima de 80% |
| E2E | Pytest, Playwright, Chromium | jornadas simuladas de login, conversa, upload, financas e multiplayer |
| Seguranca | Bandit, pip-audit, scanner local | codigo, dependencias e segredos verificados |
| Performance | benchmark local isolado | latencia REST, WebSocket, Brain, startup SQLite e memoria dentro dos limiares |
| Build | script Python e GitHub artifact | pacote `orion-foundation.zip` gerado |

O job de build executa somente quando os gates anteriores passam.

## Execucao Local no Windows

Instale Node.js e Python suportados. Depois execute:

```powershell
.\scripts\run_ci.ps1
```

Se a politica local bloquear scripts:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run_ci.ps1
```

Depois da primeira instalacao das ferramentas:

```powershell
.\scripts\run_ci.ps1 -SkipInstall
```

Executar somente as jornadas E2E:

```powershell
.\scripts\run_e2e.ps1
```

Depois que o Chromium do Playwright estiver instalado:

```powershell
.\scripts\run_e2e.ps1 -SkipBrowserInstall
```

Gerar somente o pacote:

```powershell
.\scripts\build.ps1
```

Gerar ou conferir a Wiki interna:

```powershell
python scripts/generate_wiki.py
python scripts/generate_wiki.py --check
```

Criar ou conferir o changelog:

```powershell
python scripts/generate_changelog.py --new added --summary "Nova capacidade local"
python scripts/generate_changelog.py --check
```

Executar somente o baseline de performance:

```powershell
python scripts/run_performance.py --output .sandbox-tmp/performance.json --fail-on-threshold
```

## Artefatos

Cada workflow aprovado gera:

```text
dist/orion-foundation.zip
```

O GitHub Actions preserva o pacote por 14 dias e o relatorio de cobertura por 7 dias.
Quando uma jornada E2E falha, a esteira preserva screenshots e traces por 7 dias.

## Cenarios E2E

Os cenarios em `tests/e2e` usam navegador real e um servidor FastAPI isolado, mantido
somente em memoria durante a execucao. Eles validam a mecanica da automacao e os
contratos esperados sem adicionar modulos avancados ao backend principal.

Fluxos cobertos:

- login administrativo valido e credencial invalida;
- conversa via WebSocket;
- selecao e envio de arquivo;
- registro de receita e despesa;
- sincronizacao multiplayer entre dois navegadores.

Quando os modulos de producao forem implementados, cada jornada deve ser migrada para
os endpoints reais antes da aprovacao do respectivo ticket.

## Atualizacoes de Dependencias

Dependabot verifica semanalmente:

- pacotes Python;
- actions usadas pelo GitHub Actions.

Dependabot apenas propoe alteracoes. Merge e atualizacao continuam exigindo revisao.

## Implantacao

Esta fundacao nao possui destino de producao configurado. O CD atual entrega um artefato verificavel. Publicacao, assinatura e rollout entram em tickets posteriores.
