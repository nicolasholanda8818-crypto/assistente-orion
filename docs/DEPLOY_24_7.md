# Deploy 24/7

GitHub guarda o codigo, mas nao hospeda o backend Python com WebSocket 24/7.

Para o Orion funcionar com o PC desligado, use uma hospedagem cloud.

## Opcoes recomendadas

| Opcao | Uso recomendado | Observacao |
| --- | --- | --- |
| Render | Deploy simples por GitHub | Bom para comecar, verificar limites de plano. |
| Railway | Deploy rapido com variaveis de ambiente | Bom para prototipos e servicos pequenos. |
| Fly.io | App Docker distribuido | Bom para apps containerizados. |
| VPS Linux | Controle total | Exige administrar servidor, firewall e updates. |
| Docker em cloud | Deploy portavel | Pode rodar em VPS, serviços Docker ou provedores gerenciados. |

## Regra importante

Cloudflare Tunnel no PC local exige o PC ligado.

Para Orion 24/7 com PC desligado:

1. Salve o codigo no GitHub.
2. Escolha um provedor cloud.
3. Configure variaveis de ambiente.
4. Faça deploy do backend FastAPI.
5. Use HTTPS publico do provedor ou dominio proprio.

## Deploy com Docker

Build local:

```powershell
docker build -t orion .
docker run --env-file .env -p 8000:8000 orion
```

Com Docker Compose:

```powershell
docker compose up --build
```

## Variaveis de ambiente minimas

Configure no provedor:

```text
ORION_ENV=production
ORION_PUBLIC_URL=https://seu-dominio.com
ORION_ADMIN_PASSWORD=troque_essa_senha
ORION_MASTER_KEY=gere_uma_chave_segura
APP_HOST=0.0.0.0
APP_PORT=8000
DATABASE_URL=sqlite:///./database/orion.db
STATIC_DIR=frontend
```

Use segredos do provedor para senhas e chaves. Nao coloque segredos no GitHub.

## Teste publico

1. Abra o link publico.
2. Envie `oi`.
3. Orion deve responder.
4. WebSocket deve conectar.
5. Chat deve funcionar.
6. PWA deve carregar.
7. Visitante nao deve acessar funcoes admin.

