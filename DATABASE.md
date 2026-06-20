# ORION Database Architecture

## Objetivo

Definir persistencia local confiavel para dados relacionais e vetoriais sem misturar responsabilidades.

## Tecnologias

| Tecnologia | Uso |
| --- | --- |
| SQLite | dados relacionais locais |
| SQLAlchemy | modelos, sessoes e unidade de trabalho |
| Alembic | migracoes versionadas |
| ChromaDB | memoria vetorial e busca semantica |

## Organizacao

```text
data/
  sqlite/
    orion.db
  chroma/
  backups/
  logs/
```

## Configuracao SQLite

- Ativar `PRAGMA foreign_keys = ON`.
- Usar modo WAL quando compativel.
- Definir timeout de escrita.
- Manter transacoes curtas.
- Separar sessoes por request e por job.
- Nao acessar SQLite diretamente fora da camada de persistencia.

## Entidades Iniciais

| Entidade | Finalidade |
| --- | --- |
| `users` | identidade local |
| `profiles` | perfil adulto, crianca, idoso, admin e convidado |
| `roles` | papeis de autorizacao |
| `permissions` | permissoes granulares |
| `user_roles` | vinculo usuario-papel |
| `settings` | configuracoes globais e por usuario |
| `audit_logs` | trilha de auditoria |
| `files` | metadados de arquivos |
| `finances` | receitas e despesas |
| `finance_categories` | classificacao financeira |
| `reminders` | lembretes e agenda |
| `multiplayer_sessions` | sessoes locais |
| `memory_records` | indice relacional da memoria |
| `memory_summaries` | resumos persistidos |
| `plugin_registry` | plugins instalados |
| `backup_runs` | execucoes de backup |
| `update_runs` | atualizacoes e rollbacks |

## Baseline Executavel

| Tabela | Finalidade |
| --- | --- |
| `system_metadata` | metadados tecnicos e versao do schema |
| `websocket_events` | eventos WebSocket da fundacao |
| `onboarding_profile` | ciphertext, nonce e metadados da primeira configuracao |

`onboarding_profile` nunca armazena nome ou preferencias em texto puro. A chave
bootstrap permanece fora do SQLite em `storage/keys/onboarding.key` e deve migrar para
o Vault em `T0011`.

A migracao idempotente `database/migrations/0002_onboarding_profile.sql` cria a
tabela em instalacoes existentes e atualiza `schema_version` para `2`.

## ChromaDB

Colecoes planejadas:

| Colecao | Conteudo |
| --- | --- |
| `orion_short_memory` | contexto recente e temporario |
| `orion_long_memory` | preferencias, fatos e resumos |
| `orion_knowledge` | documentos, livros e anotacoes |

Cada vetor deve possuir metadados minimos:

- `record_id`;
- `user_id`;
- `scope`;
- `source_type`;
- `created_at`;
- `sensitivity`;
- `schema_version`.

## Migracoes

Regras:

1. Nenhuma alteracao estrutural sem migration Alembic.
2. Seeds devem ser idempotentes.
3. Migracoes destrutivas exigem backup automatico e aprovacao.
4. Rollback deve ser documentado quando tecnicamente possivel.
5. Testes devem criar banco temporario limpo.

## Backup Consistente

O backup deve coordenar:

1. checkpoint WAL;
2. snapshot SQLite;
3. snapshot ChromaDB;
4. arquivos permitidos;
5. manifesto com hashes;
6. compactacao;
7. verificacao de integridade.
