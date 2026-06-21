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

## Checklist Render apos deploy

Depois de enviar o commit para o GitHub e executar `Manual Deploy > Deploy latest commit` no Render:

1. Abra `https://seu-app.onrender.com/healthz`.
2. Confirme a resposta `{"status":"ok"}`.
3. Abra `https://seu-app.onrender.com/api/health`.
4. Abra `https://seu-app.onrender.com/assets/js/main.js` e confirme que o arquivo JavaScript carrega.
5. Abra `https://seu-app.onrender.com/assets/css/styles.css` e confirme que o CSS carrega.
6. Abra a pagina principal.
7. Abra o console do navegador e confirme que nao existem erros criticos de `404`, `MIME type`, `Failed to fetch` ou `WebSocket connection failed`.
8. Envie `oi` no chat.
9. Confirme que o Orion responde.
10. Instale ou recarregue o PWA e confirme que a tela nao fica branca.

O frontend deve usar sempre o dominio atual:

```text
API REST: window.location.origin
WebSocket HTTP local: ws://window.location.host/ws
WebSocket HTTPS publico: wss://window.location.host/ws
```

Nao configure `localhost`, `127.0.0.1` ou IP da rede no JavaScript para producao.

## Cache antigo do PWA

Se o Render estiver correto, mas o navegador ainda mostrar tela branca ou visual antigo, o problema pode ser cache antigo do service worker.

Passos recomendados:

1. Recarregue com `Ctrl + F5`.
2. Teste em aba anonima.
3. No navegador, abra DevTools > Application > Service Workers.
4. Clique em `Unregister` no service worker do Orion.
5. Em DevTools > Application > Storage, use `Clear site data`.
6. Abra novamente o link publico.

O cache atual esperado do Orion para esta correcao e:

```text
orion-pwa-v25-render
```

## Observacao sobre WebSocket no Render

O Render fornece HTTPS publico. Nesse caso, o navegador bloqueia WebSocket inseguro `ws://` e exige `wss://`.

O frontend do Orion deve montar automaticamente:

```text
https://...  -> wss://.../ws
http://...   -> ws://.../ws
```

Se o chat nao responder no Render, verifique primeiro o console do navegador e a aba Network filtrando por `ws`.
