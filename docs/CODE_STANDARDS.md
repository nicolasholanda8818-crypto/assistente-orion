# ORION Code Standards

## Backend Python

- Python tipado.
- FastAPI para adaptadores HTTP e WebSocket.
- SQLAlchemy para acesso relacional.
- Pydantic para contratos de entrada e saida.
- Nenhuma query SQL montada por concatenacao.
- Nenhum modulo acessa internals de outro modulo.
- Erros de dominio sao explicitos e convertidos na camada API.
- Funcoes pequenas com responsabilidade unica.
- Jobs devem ser idempotentes.
- Operacoes destrutivas exigem comando explicito e auditoria.

## Estrutura de Modulo Backend

```text
backend/app/modules/<module>/
  api.py
  commands.py
  events.py
  models.py
  repository.py
  schemas.py
  service.py
```

Nem todo modulo precisa de todos os arquivos, mas a separacao deve ser preservada quando houver responsabilidade correspondente.

## Frontend

- HTML semantico.
- CSS responsivo mobile-first.
- JavaScript modular por recurso.
- Nenhum dado nao confiavel inserido com `innerHTML`.
- Service Worker versionado.
- Three.js isolado em adaptador visual.
- Degradacao graciosa quando WebGL nao estiver disponivel.
- Acessibilidade por teclado e leitor de tela.

## API Interna

- Comandos no imperativo: `module.action`.
- Eventos no passado: `module.entity.actioned`.
- Payloads versionados.
- Correlation ID em cadeias de eventos.
- Eventos imutaveis.
- Handlers idempotentes quando houver retry.

## Banco

- Models declarativos SQLAlchemy.
- Repositories por agregado.
- Unidade de trabalho por request ou job.
- Alembic obrigatorio.
- Seeds idempotentes.

## Logs

- JSON estruturado.
- Campos minimos: timestamp, level, module, event, correlation_id.
- Nao registrar senha, token, chave, conteudo sensivel ou documento bruto.

## Segredos

- Seguir `SECRETS_POLICY.md`.
- Nenhum segredo ou dado sensivel em codigo, fixtures, seeds, documentacao ou logs.
- Usar `.env` local somente para configuracao e bootstrap controlado.
- Armazenar segredos persistentes no cofre criptografado.

## Git e Revisao

- Um ticket por branch.
- Commits pequenos e descritivos.
- Pull request com checklist do ticket.
- Alteracao relevante para usuario ou operador inclui fragmento em `changelog/entries`.
- `CHANGELOG.md` e gerado; nao editar manualmente.
- Revisao obrigatoria para seguranca, migracoes e operacoes de host.
