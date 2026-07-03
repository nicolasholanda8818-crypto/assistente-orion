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

- `gsap-orion.js`: carregador compartilhado do GSAP com fallback para Web Animations.
- `premium-visuals.js`: motor visual opcional com GSAP/fallback.
- `styles.css`: overrides premium aditivos sobre o visual existente.
- `system-status-panel`: painel tecnico oculto acionado pelo status principal.
- `quick-actions-panel`: controles compactos para nao poluir a tela principal.
- `portfolio-panel`: modo Portfolio interativo dentro da mesma PWA.

## Fase Visual 2.0

- GSAP passa a ser carregado por um modulo dedicado e opcional.
- O avatar recebe loops GSAP leves para respiracao, cabeca, ombros e aura.
- Paineis e cards podem usar animacoes coordenadas sem impedir o fallback CSS.
- O cache PWA foi versionado para `orion-pwa-v43-visual-portfolio`.
- O modo Portfolio funciona sem backend novo e sem alterar rotas existentes.

## Fase Visual Suprema

- `avatar-3d.js` agora possui uma ponte humanoide procedural em Three.js quando
  nenhum GLB/VRM real esta habilitado.
- `scene.js` virou um gerenciador de cenario 3D leve com plataforma holografica,
  paineis reativos, particulas e fallback Canvas.
- `main.js` sincroniza estados do Orion, modo visual e interacoes do quarto com
  o avatar, o Cerebro Cosmico e o cenario.
- O cache PWA foi versionado para `orion-pwa-v44-supreme-visual`.
- O avatar HTML/CSS, WebSocket, chat, voz, memoria, arquivos, Portfolio e Lord
  Dragons permanecem preservados.

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
