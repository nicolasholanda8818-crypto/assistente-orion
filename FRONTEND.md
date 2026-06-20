# ORION Frontend Guide

## Escopo

O frontend sera uma PWA responsiva em HTML, CSS e JavaScript modular, com Three.js isolado na camada visual.

## Estrutura Alvo

```text
frontend/
  assets/
    icons/
    images/
  src/
    api/
    components/
    modules/
    state/
    three/
    app.js
  index.html
  manifest.webmanifest
  service-worker.js
```

## Principios

- mobile-first;
- navegacao por teclado;
- sem `innerHTML` para dado nao confiavel;
- fallback quando WebGL falhar;
- offline shell;
- cache versionado;
- atualizacao controlada;
- perfil idoso com texto, contraste e fluxo simplificado;
- interface infantil com restricoes proprias.

## Design System

Tokens, temas, componentes e regras de acessibilidade estao definidos em
`DESIGN_SYSTEM.md`. Modulos novos devem usar as classes compartilhadas em
`frontend/assets/css` e nao introduzir cores literais locais.

## PWA

- Manifest com icones maskable.
- Service Worker com app shell.
- Cache apenas de recursos seguros.
- APIs dinamicas seguem estrategia network-first.
- Usuario recebe aviso de nova versao.
- Em iOS, instalacao ocorre por "Adicionar a Tela de Inicio".

## Primeira Execucao

O shell consulta `/api/onboarding/status` antes de liberar a interface. Quando a
configuracao ainda nao existe, um dialogo modal coleta nome, preferencia de resposta,
perfil, voz e aparencia. A alteracao de tema e perfil produz preview imediato e a
conclusao usa `/api/onboarding/complete`.

## Plataformas

A mesma camada web atende navegador, PWA e wrappers Capacitor. Recursos nativos devem
passar por uma bridge pequena com deteccao explicita de capacidade. Android e iOS sao
clientes companion no baseline; nao hospedam automaticamente o backend Python.

Consulte `PLATFORM_ARCHITECTURE.md`.

## Three.js

- cena desacoplada do estado de negocio;
- quality tiers;
- limite de assets;
- descarte correto de geometrias e texturas;
- testes desktop e mobile;
- fallback acessivel.
