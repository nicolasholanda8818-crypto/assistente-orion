# Orion Scene 3D System

## Objetivo

Documentar o cenario 3D leve que cria a sensacao de quarto futurista, plataforma holografica e ambiente vivo atras do avatar, sem substituir o layout existente.

## Arquivo Principal

```text
frontend/assets/js/scene.js
```

O modulo exporta `startScene(container, options)` e retorna um gerenciador com:

- `setState(state)`
- `setVisualMode(mode)`
- `pulsePanel(kind)`
- `dispose()`

## Carregamento Progressivo

1. O frontend abre normalmente.
2. `main.js` chama `startScene()` depois de inicializar elementos principais.
3. O modulo tenta carregar Three.js.
4. Se WebGL funcionar, cria uma cena 3D leve.
5. Se falhar, cria fallback Canvas 2D animado.

## Elementos Visuais

A cena WebGL cria:

- plataforma holografica;
- aneis orbitais;
- paineis de memoria, arquivos, voz, web e portfolio;
- particulas leves;
- luz ambiente;
- luzes coloridas por estado;
- pulso visual quando objetos do quarto sao acionados.

## Estados

As cores seguem o contrato do Orion:

- online: azul;
- listening: ciano;
- thinking: azul profundo;
- speaking/responding: roxo;
- searching: vermelho;
- files: verde;
- learning: amarelo;
- error/worried: laranja.

## Modos Visuais

- `performance`: menos particulas e escala menor.
- `balanced`: cena completa moderada.
- `ultra`: mais particulas, brilho e movimento.

O modo pode ser trocado sem recarregar a pagina por `setVisualMode()`.

## Interacao

Objetos existentes marcados com `data-room-object` podem acionar `pulsePanel()`. Isso permite que o cenario reaja a cliques sem criar acoplamento forte com o chat ou o backend.

## Performance

- Particulas sao limitadas por modo visual.
- O fallback Canvas usa poucos desenhos por frame.
- O gerenciador expoe `dispose()` para limpar renderer, listeners e animacao.
- A cena nao bloqueia chat, WebSocket, voz, memoria, arquivos ou Lord Dragons.

## Validacao Manual

1. Abrir o Orion.
2. Confirmar que o fundo/cenario aparece atras do avatar.
3. Alternar Performance, Equilibrado e Ultra Visual.
4. Clicar em objetos do quarto e observar pulso visual.
5. Desativar WebGL ou simular falha de rede e confirmar fallback Canvas.
