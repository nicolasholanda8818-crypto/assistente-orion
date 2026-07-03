# Orion Visual Performance

## Modos

### Performance

Usado por padrao em dispositivos fracos, mobile ou quando o usuario prefere menos movimento.

- reduz particulas;
- oculta camadas decorativas;
- evita pos-processamento pesado;
- mantem chat, voz, PWA e avatar funcionais.

### Equilibrado

Modo recomendado para uso diario em desktop e notebooks.

- mantem visual premium;
- limita ruido e brilho;
- preserva fluidez.

### Ultra Visual

Modo para computadores mais fortes.

- aumenta brilho e profundidade;
- ativa mais efeitos do cerebro;
- usa GSAP/WebGL quando disponiveis.

## Regras de Estabilidade

- Animacoes pausam quando a aba fica oculta.
- `prefers-reduced-motion` desativa animacoes intensas.
- O service worker usa cache versionado para evitar visual antigo.
- A interface nao depende de assets externos obrigatorios para funcionar.
- GSAP e opcional em runtime: se falhar, Web Animations assume.
- O modo Portfolio usa cards leves e reduz automaticamente a grade no mobile.
- O Cerebro Cosmico mantem fallback Canvas quando Three.js ou pos-processamento falham.
- O avatar 3D humanoide procedural so assume quando o runtime WebGL inicia com sucesso.
- O cenario 3D usa contagem de particulas por modo visual e fallback Canvas.
- O avatar HTML/CSS permanece carregado para reduzir risco em mobile, Render e PWA offline.

## Como Alternar

Abra `Ajustes rapidos` na tela principal e selecione:

- Performance;
- Equilibrado;
- Ultra Visual.
