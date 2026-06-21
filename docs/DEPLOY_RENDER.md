# Deploy no Render

Este guia publica o Orion em cloud 24/7 usando Render, sem alterar funcionalidades existentes.

## Ideia Principal

- GitHub guarda o codigo.
- Render executa o backend Python/FastAPI em um servidor online.
- O Orion fica acessivel mesmo com seu PC desligado.
- Cloudflare Tunnel no PC local nao funciona com o PC desligado.

## Antes de Comecar

1. Suba o projeto no GitHub.
2. Confirme que `.env`, bancos reais, uploads pessoais, chaves e tokens nao foram enviados.
3. Tenha uma senha administrativa forte.
4. Use variaveis de ambiente no painel do Render.

## Criar Web Service

1. Acesse `https://render.com`.
2. Crie uma conta ou entre.
3. Clique em `New`.
4. Escolha `Web Service`.
5. Conecte seu repositorio GitHub do Orion.
6. Escolha a branch `main`.

## Configuracao Com Dockerfile

Se o Render detectar o `Dockerfile`, use deploy via Docker.

Configuracoes:

```text
Environment: Docker
Port: 8000
Health check path: /api/health
```

O Dockerfile atual:

- instala `requirements.txt`;
- expõe a porta `8000`;
- inicia `uvicorn app.main:app --host 0.0.0.0 --port 8000`.

## Variaveis de Ambiente

Configure no painel do Render:

```text
ORION_ENV=production
ORION_PUBLIC_URL=https://seu-app.onrender.com
ORION_ADMIN_PASSWORD=<defina-no-painel>
ORION_MASTER_KEY=<defina-no-painel>
APP_HOST=0.0.0.0
APP_PORT=8000
STATIC_DIR=frontend
DATABASE_URL=sqlite:///./database/orion.db
```

Nunca coloque senha, token ou chave no GitHub.

## Persistencia

Para teste publico simples, SQLite local pode funcionar com limitacoes do plano. Para uso real, configure disco persistente ou banco gerenciado quando o Orion evoluir para producao.

A memoria de usuario da Fase 2 usa SQLite. Sem disco persistente no Render, nomes, preferencias, projetos e assuntos podem ser perdidos em redeploy, rebuild ou reinicio do container.

Pastas que precisam persistir em producao:

- `database/`
- `storage/`
- `uploads/`

Configuracao recomendada no Render:

```text
Mount Path: /app/database
DATABASE_URL=sqlite:////app/database/orion.db
```

Se tambem quiser manter uploads e armazenamento local, crie discos ou armazenamento externo para `storage/` e `uploads/`.

## Teste Publico

1. Abra a URL gerada pelo Render.
2. Verifique se a pagina carrega.
3. Envie `oi`.
4. Confirme que o Orion responde.
5. Confirme que o WebSocket aparece conectado.
6. Confirme que o PWA carrega.
7. Confirme que visitante nao acessa funcoes administrativas.

## Observacoes

Planos gratuitos podem hibernar ou reiniciar. Para 24/7 real, use plano que mantenha o servico ativo.
