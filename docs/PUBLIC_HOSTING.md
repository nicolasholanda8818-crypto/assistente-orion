# Public Hosting

Este documento explica formas de publicar o Orion sem mudar a arquitetura atual.

## Render

1. Suba o codigo no GitHub.
2. Crie um novo Web Service.
3. Conecte o repositorio.
4. Use Dockerfile ou comando Python.
5. Configure variaveis de ambiente.
6. Publique.

Comando sugerido sem Docker:

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## Railway

1. Crie novo projeto.
2. Conecte o GitHub.
3. Configure variaveis.
4. Use Dockerfile ou start command.
5. Gere dominio publico.

## Fly.io

1. Instale `flyctl`.
2. Faça login.
3. Use o Dockerfile do projeto.
4. Configure secrets:

```bash
fly secrets set ORION_ENV=production
fly secrets set ORION_ADMIN_PASSWORD=troque_essa_senha
fly secrets set ORION_MASTER_KEY=gere_uma_chave_segura
```

5. Faça deploy:

```bash
fly deploy
```

## VPS Linux

Fluxo geral:

```bash
git clone URL_DO_REPOSITORIO
cd orion
cp .env.example .env
docker compose up -d --build
```

Configure firewall para expor apenas:

- `80/tcp`
- `443/tcp`
- porta interna do Orion apenas se necessario

Use Nginx, Caddy ou Traefik para HTTPS.

## Banco e arquivos persistentes

SQLite funciona para inicio e uso pequeno. Para producao com multiplos usuarios, planeje banco gerenciado futuramente.

Persistir:

- `database/`
- `storage/`
- `uploads/`
- `models/` somente quando necessario

Nao publicar dados reais no GitHub.

## Cloudflare Tunnel x cloud 24/7

- Cloudflare Tunnel local: facil, mas PC precisa ficar ligado.
- Cloud hosting: fica online mesmo com PC desligado.

