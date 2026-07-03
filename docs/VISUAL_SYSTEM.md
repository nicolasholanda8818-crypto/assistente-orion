# Orion Visual System

## Objetivo

A camada visual premium transforma a PWA do Orion em uma interface mais limpa, fluida e com aparencia de aplicativo final, sem remover os modulos existentes.

## Principios

- A tela principal mostra apenas status resumido, avatar/cerebro, chat e entrada de mensagem.
- Detalhes tecnicos ficam no painel oculto `Status do Sistema`.
- Controles de roupa, voz, arquivos, automacoes e modo visual ficam em `Ajustes rapidos` ou na sidebar.
- Animações usam GSAP quando disponivel e Web Animations como fallback.
- Modo Performance reduz efeitos em celulares, dispositivos fracos e quando o usuario prefere menos movimento.

## Componentes

- `premium-visuals.js`: motor visual opcional com GSAP/fallback.
- `styles.css`: overrides premium aditivos sobre o visual existente.
- `system-status-panel`: painel tecnico oculto acionado pelo status principal.
- `quick-actions-panel`: controles compactos para nao poluir a tela principal.

## Estados Visuais

- `online`: Orion Online.
- `listening`: escuta em ciano.
- `thinking`: pensamento em azul.
- `speaking/responding`: fala em roxo.
- `searching`: pesquisa em vermelho.
- `files`: analise de arquivos em verde.
- `learning`: aprendizado/memoria em amarelo.

## Compatibilidade

A camada nova nao substitui o backend, WebSocket, PWA, Lord Dragons, voz, memoria ou arquivos. Se GSAP ou WebGL falharem, o Orion permanece funcional com CSS e canvas/fallback.
