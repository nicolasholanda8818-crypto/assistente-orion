# ORION Internal Wiki

## Objetivo

Manter uma referencia local dos contratos implementados sem duplicar documentacao
manual e sem expor dados do dispositivo.

## Geracao

```powershell
python scripts/generate_wiki.py
```

Validar que as paginas versionadas continuam atualizadas:

```powershell
python scripts/generate_wiki.py --check
```

O build executa a geracao automaticamente antes de criar o pacote.

## Paginas

- `docs/wiki/APIS.md`: endpoints HTTP, schemas OpenAPI e WebSocket.
- `docs/wiki/DATABASE.md`: tabelas e colunas SQLite.
- `docs/wiki/PLUGINS.md`: contrato dos manifestos e inventario seguro.
- `docs/wiki/EVENTS.md`: catalogo de eventos compartilhados.

## Fontes Autoritativas

| Conteudo | Fonte |
| --- | --- |
| APIs | aplicacao FastAPI e OpenAPI |
| Banco | `database/schema.sql` e `database/migrations/*.sql` |
| Plugins | `plugins/plugin.schema.json` e manifestos instalados |
| Eventos | `app/events/catalog.py` |

## Seguranca

O gerador:

- usa SQLite temporario em memoria;
- nao abre o banco local;
- nao le linhas, payloads ou arquivos enviados;
- nao publica assinatura, checksum ou permissoes concedidas de plugins;
- nao le `.env`, chaves, tokens ou senhas.
