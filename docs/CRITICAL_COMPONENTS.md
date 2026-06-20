# ORION Critical Components

## Nivel 0 - Criticos

| Componente | Motivo | Requisito de Qualidade |
| --- | --- | --- |
| Identity e Permissions | protege todos os modulos | testes negativos e auditoria |
| Vault | guarda chaves, tokens e senhas | AES-256-GCM e redacao de logs |
| Database e Migrations | concentra estado local | backup, rollback e integridade |
| Internal API | evita acoplamento | contratos versionados |
| Backup e Restore | recupera falhas | restauracao verificada |
| Update Manager | altera instalacao | assinatura, staging e rollback |
| Control | executa acoes no host | admin, allowlist e confirmacao |
| Plugin Runtime | executa extensoes | permissoes e lifecycle seguro |

## Nivel 1 - Importantes

| Componente | Motivo |
| --- | --- |
| Memory | contexto pessoal e conhecimento |
| Brain | respostas e comando estruturado |
| WebSocket | tempo real, avatar e multiplayer |
| Telemetry | diagnostico local |
| Files | entrada de conteudo nao confiavel |
| Vision | acesso a camera e processamento |

## Nivel 2 - Experiencia

| Componente | Motivo |
| --- | --- |
| PWA | instalacao e operacao web |
| Avatar | experiencia visual |
| Academy | aprendizagem |
| Finance | produtividade pessoal |
| Planner | organizacao |
| Music | experiencia local |

## Regras

- Componentes Nivel 0 precisam de threat model proprio.
- `THREAT_MODEL.md` e o baseline central; componentes Nivel 0 devem adicionar analise focada ao serem implementados.
- Componentes Nivel 0 nao podem depender de modulos de experiencia.
- Acoes destrutivas devem ser idempotentes ou reversiveis quando possivel.
- Falha de modulo opcional nao deve impedir o Core de iniciar.
