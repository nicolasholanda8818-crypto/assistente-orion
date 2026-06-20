# ORION Tool System

## Objetivo

Garantir que toda acao executavel do ORION passe por uma ferramenta registrada,
validada e auditavel. Modulos, Brain, plugins e adapters de plataforma nao devem
executar efeitos colaterais diretamente.

## Baseline

O Tool System atual possui registry central, catalogo REST e auditoria volatil por
metadados. Ele nega por padrao ferramentas desconhecidas, planejadas, sem permissao ou
sem confirmacao obrigatoria.

Endpoint de catalogo:

```http
GET /api/tools
GET /api/tools/status
```

O baseline nao expoe endpoint REST generico de execucao. Chamadas externas exigem
identidade, autorizacao e auditoria persistente antes de serem permitidas.

## Estados

| Estado | Significado |
| --- | --- |
| `enabled` | possui handler local implementado e pode passar pelos gates |
| `planned` | aparece no catalogo, mas qualquer tentativa de execucao falha |

Ferramenta registrada nao significa ferramenta liberada.

## Gates

Antes de chamar um handler, a registry verifica:

1. nome registrado;
2. disponibilidade `enabled`;
3. permissoes exigidas;
4. confirmacao quando obrigatoria;
5. argumentos conforme schema;
6. registro de resultado sem payload sensivel.

## Ferramentas Atuais

| Ferramenta | Estado | Risco | Uso |
| --- | --- | --- | --- |
| `context.read` | `enabled` | interno | resumo da memoria volatil da conversa |
| `knowledge.search` | `enabled` | interno | resumo da busca local permitida |
| `response.compose` | `enabled` | interno | resposta textual sem efeito colateral |
| `control.open_program` | `planned` | privilegiado | abrir programa por allowlist futura |
| `files.read` | `planned` | somente leitura | ler arquivo autorizado no modulo Files |
| `finance.get_balance` | `planned` | somente leitura | consultar saldo autorizado no Finance |
| `models.generate` | `planned` | interno | gerar resposta pelo modelo selecionado e autorizado |

## Integracao Com Brain

O executor do Brain percorre seu plano e invoca cada passo pela `ToolRegistry`.
Ferramenta desconhecida ou bloqueada gera `UnsafePlanError`. O Brain baseline nao
possui caminho alternativo para executar acao diretamente.

## Integracao Com Plataformas

Adapters de Linux, macOS, Android, iOS e Web devem registrar somente ferramentas
compatíveis com capacidades realmente detectadas. Consulte `PLATFORM_ARCHITECTURE.md`.

Exemplo: `control.open_program` pode receber adapter desktop no futuro, mas deve
permanecer bloqueada em Android, iOS e Web.

## Auditoria

O baseline registra somente:

- nome da ferramenta;
- ator;
- resultado;
- timestamp.

Argumentos, segredos e dados pessoais nao entram na trilha. Auditoria persistente sera
adicionada em `T0012`.

## Evolucao

| Ticket | Evolucao |
| --- | --- |
| T0006 | integrar Tool System ao Command Bus, Event Bus e Message Bus |
| T0009 | identidade e permissoes reais por ator |
| T0012 | auditoria persistente sanitizada |
| T0019 | habilitar `finance.get_balance` |
| T0017 | habilitar `models.generate` somente apos identidade, Vault e auditoria |
| T0020 | habilitar `files.read` |
| T0031 | habilitar `control.open_program` com admin, adapter, allowlist e confirmacao |
| T0033-T0034 | grants e isolamento para plugins |
