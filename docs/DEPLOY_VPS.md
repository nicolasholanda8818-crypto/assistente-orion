# Deploy em VPS Linux

Este guia publica o Orion em uma VPS Linux usando Docker, sem alterar funcionalidades existentes.

## Ideia Principal

- GitHub guarda o codigo.
- A VPS executa o Orion 24/7.
- O Orion continua online mesmo com seu PC desligado.
- Cloudflare Tunnel local so funciona enquanto o PC local estiver ligado.

## Requisitos

- VPS Ubuntu/Debian.
- Dominio opcional.
- Docker e Docker Compose instalados.
- Porta `80` e `443` liberadas para HTTPS.
- Porta `8000` apenas interna ou temporaria para teste.

## Preparar Servidor

```bash
sudo apt update
sudo apt install -y git docker.io docker-compose-plugin
sudo systemctl enable docker
sudo systemctl start docker
```

## Baixar Projeto

```bash
git clone URL_DO_REPOSITORIO
cd orion
cp .env.example .env
```

Edite `.env` no servidor:

```bash
nano .env
```

Configure:

```text
ORION_ENV=production
ORION_PUBLIC_URL=https://seu-dominio.com
ORION_ADMIN_PASSWORD=<senha-forte>
ORION_MASTER_KEY=<chave-segura>
APP_HOST=0.0.0.0
APP_PORT=8000
STATIC_DIR=frontend
DATABASE_URL=sqlite:///./database/orion.db
```

## Subir com Docker Compose

```bash
docker compose up -d --build
docker compose logs -f
```

Teste local na VPS:

```bash
curl http://127.0.0.1:8000/api/health
```

## HTTPS com Reverse Proxy

Use Caddy, Nginx ou Traefik para HTTPS.

Exemplo com Caddy:

```bash
sudo apt install -y caddy
```

`/etc/caddy/Caddyfile`:

```text
seu-dominio.com {
  reverse_proxy 127.0.0.1:8000
}
```

Recarregue:

```bash
sudo systemctl reload caddy
```

## Persistencia

O `docker-compose.yml` monta volumes locais:

- `./database:/app/database`
- `./storage:/app/storage`
- `./uploads:/app/uploads`
- `./models:/app/models`

Faca backup dessas pastas.

## Teste Publico

1. Abra `https://seu-dominio.com`.
2. Envie `oi`.
3. Confirme resposta do Orion.
4. Confirme WebSocket conectado.
5. Confirme PWA carregado.
6. Confirme que visitante nao acessa funcoes administrativas.

## Seguranca

- Nao exponha porta `8000` publicamente se estiver usando reverse proxy.
- Use HTTPS.
- Use senha administrativa forte.
- Desative comandos perigosos do PC em cloud.
- Proteja uploads.
- Atualize o servidor periodicamente.

