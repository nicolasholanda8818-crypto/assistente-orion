# Deploy no Railway

Este guia publica o Orion em cloud usando Railway, sem alterar backend, frontend, avatar, WebSocket ou PWA.

## Ideia Principal

- GitHub guarda o codigo.
- Railway executa o Orion em cloud.
- O app fica disponivel mesmo com seu PC desligado.
- Cloudflare Tunnel local depende do PC ligado.

## Preparacao

1. Suba o Orion no GitHub.
2. Verifique `.gitignore`.
3. Nao envie `.env`, bancos reais, uploads, chaves, tokens ou dados pessoais.
4. Tenha os valores de ambiente preparados.

## Criar Projeto

1. Acesse `https://railway.app`.
2. Crie um novo projeto.
3. Escolha `Deploy from GitHub repo`.
4. Selecione o repositorio do Orion.
5. Autorize o Railway a acessar o repositorio.

## Deploy com Dockerfile

O Railway pode usar o `Dockerfile` existente.

O container:

- instala `requirements.txt`;
- inicia FastAPI com Uvicorn;
- escuta em `0.0.0.0:8000`.

Se o Railway fornecer uma variavel de porta propria, ajuste pelo painel se necessario. O Dockerfile atual usa `8000`.

## Variaveis de Ambiente

Configure no Railway:

```text
ORION_ENV=production
ORION_PUBLIC_URL=https://seu-app.up.railway.app
ORION_ADMIN_PASSWORD=<defina-no-painel>
ORION_MASTER_KEY=<defina-no-painel>
APP_HOST=0.0.0.0
APP_PORT=8000
STATIC_DIR=frontend
DATABASE_URL=sqlite:///./database/orion.db
```

Nao salve segredos no codigo.

## Dominio Publico

1. Abra `Settings`.
2. Gere um dominio Railway.
3. Ou configure dominio proprio.
4. Use HTTPS fornecido pelo Railway.

## Teste Publico

1. Acesse a URL publica.
2. Envie `oi`.
3. Verifique resposta do Orion.
4. Verifique WebSocket conectado.
5. Verifique PWA carregado.
6. Verifique que visitante nao possui permissao administrativa.

## Persistencia

Para uso real, configure volume/banco persistente. Sem persistencia, dados locais podem ser perdidos em rebuilds.

