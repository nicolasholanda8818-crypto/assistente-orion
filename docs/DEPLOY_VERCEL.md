# Deploy no Vercel (Frontend Orion)

Este guia publica somente o frontend no Vercel, mantendo o backend no Render.

## Objetivo

- Render continua responsavel por backend, APIs, IA, banco e servicos internos.
- Vercel acelera entrega de frontend estatico (HTML/CSS/JS/assets).
- Nenhuma API do backend e alterada.
- Nenhum banco ou autenticacao e alterado.

## Arquitetura Recomendada

- Backend principal: `https://assistente-orion.onrender.com`
- Frontend opcional (Vercel): dominio do projeto Vercel ou dominio customizado.

Se quiser manter a experiencia no mesmo endereco publico atual, mantenha o acesso principal no Render e use o Vercel como camada de aceleracao para frontend em rollout controlado.

## Arquivos usados

- `vercel.json`
- `frontend/index.html`
- `frontend/assets/js/api.js`
- `frontend/assets/js/socket.js`

## Runtime Config (sem quebrar compatibilidade)

No `index.html`, existem metas opcionais:

```html
<meta name="orion-api-base" content="" />
<meta name="orion-ws-base" content="" />
```

Comportamento:

- Vazio: Orion usa `window.location.origin` (modo atual, compatibilidade total).
- Preenchido: frontend usa as URLs definidas para API e WebSocket.

Exemplo para frontend no Vercel + backend no Render:

```html
<meta name="orion-api-base" content="https://assistente-orion.onrender.com" />
<meta name="orion-ws-base" content="wss://assistente-orion.onrender.com" />
```

## Passos de Deploy

1. Conecte o repositorio no Vercel.
2. Build command: vazio (frontend estatico).
3. Output: raiz do repo (o `vercel.json` aplica rewrites para `frontend/`).
4. Publique.
5. Valide carregamento dos arquivos:
   - `/`
   - `/assets/js/main.js`
   - `/assets/css/styles.css`

## Validacao Funcional

- Chat abre sem erros de console.
- API responde via backend Render.
- WebSocket conecta no backend Render.
- PWA continua funcional.

## Observacao Importante

- Esta integracao e incremental e segura: preserva o projeto atual e nao interrompe o servidor do Render.
- O backend oficial e o Render, e continua sendo a referencia principal do Orion.
