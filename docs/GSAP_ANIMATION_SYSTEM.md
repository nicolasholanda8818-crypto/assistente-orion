# Orion GSAP Animation System

## Objetivo

Centralizar animacoes premium do Orion em uma camada opcional, sem transformar GSAP em dependencia obrigatoria para o app iniciar.

## Arquivos

- `frontend/assets/js/gsap-orion.js`: carrega GSAP via ESM e fornece fallback.
- `frontend/assets/js/premium-visuals.js`: usa o motor para avatar, paineis, mensagens e Portfolio.
- `frontend/assets/css/styles.css`: preserva animacoes CSS quando GSAP nao esta disponivel.

## Fallback

Se GSAP nao carregar, `document.documentElement.dataset.animationEngine` recebe `web-animations` e as animacoes usam Web Animations ou CSS.

## Regras

- Nao bloquear chat, PWA, WebSocket, voz ou memoria.
- Nao exigir rede para abrir o Orion.
- Pausar loops quando a aba estiver oculta.
- Respeitar `prefers-reduced-motion`.
- Usar modo Performance em dispositivos fracos.

## Animacoes Atuais

- entrada do avatar;
- respiracao e aura;
- mensagens do chat;
- transicao Avatar/Cerebro;
- abertura de paineis;
- cards e barras do Portfolio.
