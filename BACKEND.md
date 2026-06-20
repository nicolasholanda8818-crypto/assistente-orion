# ORION Backend Guide

## Escopo

O backend sera uma aplicacao FastAPI local modular. Ele expora REST e WebSocket, coordenara casos de uso por API interna e persistira dados locais.

## Pacotes Alvo

```text
backend/app/
  api/
  core/
  internal_api/
  modules/
  infrastructure/
  jobs/
  main.py
```

## Modulos

Cada modulo possui fronteira propria. A integracao ocorre por comandos e eventos, nunca por acesso direto ao repository de outro modulo.

O baseline do Brain esta documentado em `BRAIN.md`. Ele separa memoria, planejamento,
execucao, aprendizado e conhecimento sem executar efeitos colaterais.

O Model Runtime esta documentado em `MODEL_ARCHITECTURE.md`. Ele separa o Brain de
Ollama, LM Studio, APIs OpenAI compativeis e providers futuros sem habilitar trafego.

O onboarding bootstrap esta documentado em `ONBOARDING.md`. A API publica apenas o
estado da primeira execucao e aceita uma unica gravacao, protegida por origem
permitida. O payload pessoal e persistido criptografado.

## Lifecycle

Startup:

1. carregar configuracao;
2. configurar logs locais;
3. validar diretorios;
4. validar banco;
5. aplicar politica de migrations;
6. iniciar buses;
7. iniciar jobs permitidos;
8. expor health checks.

Shutdown:

1. impedir novos jobs;
2. aguardar tarefas curtas;
3. fechar conexoes;
4. descarregar modelos;
5. persistir estado seguro;
6. registrar auditoria.

## Health Checks

- Core.
- SQLite.
- ChromaDB.
- scheduler.
- modelos opcionais.
- espaco em disco.
- integridade minima dos diretorios.

Falha de modulo opcional deve gerar status degradado, nao indisponibilidade total.
