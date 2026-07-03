# Orion Avatar 3D Pipeline

## Objetivo

Definir a evolucao visual do avatar do Orion sem remover o avatar atual e sem tornar modelos externos obrigatorios.

## Camadas Atuais

O avatar possui tres camadas progressivas:

1. Avatar HTML/CSS preservado, sempre disponivel como fallback.
2. Avatar humanoide procedural em Three.js, criado localmente com primitivas leves quando nao ha GLB/VRM habilitado.
3. Avatar GLB/VRM real, carregado por manifesto local quando o administrador habilitar um modelo proprio.

Nenhuma camada remove a anterior. Se WebGL, Three.js, manifesto ou modelo falharem, o Orion volta para o avatar HTML/CSS.

## Fluxo de Carregamento

1. `main.js` inicializa a interface normalmente.
2. `avatar-3d.js` entra de forma progressiva.
3. O runtime le `frontend/assets/models/avatar-manifest.json`.
4. Se houver GLB/VRM habilitado e valido, o modelo real e carregado.
5. Se nao houver modelo habilitado, o runtime cria o avatar humanoide procedural Three.js.
6. Se qualquer etapa falhar, o fallback HTML/CSS continua visivel e interativo.

## Estados Suportados

O contrato visual aceita os estados:

- `online`
- `listening`
- `thinking`
- `speaking`
- `responding`
- `searching`
- `files`
- `learning`
- `walking`
- `explaining`
- `professor`
- `confident`
- `tired`
- `animated`
- `worried`

Esses estados alteram postura, cor de aura, olhos, boca e gestos quando a camada 3D esta ativa. O avatar HTML/CSS continua recebendo os mesmos estados por atributos `data-*`.

## Guarda-Roupa

O runtime respeita `data-outfit` e aplica uma cor de roupa compativel com o modo escolhido:

- casual;
- armor;
- professor;
- formal;
- adventurer;
- lord-dragons;
- tech;
- hacker;
- executive;
- cyber.

No avatar procedural, a roupa e representada por materiais e detalhes luminosos. No futuro, modelos GLB/VRM podem mapear o mesmo contrato para materiais, variantes ou malhas separadas.

## Direcao Artistica De Referencia

Referencias visuais externas devem ser usadas apenas como direcao, nunca como
copia. O que pode ser aproveitado:

- proporcoes humanas;
- olhos expressivos;
- materiais de alta qualidade;
- roupa futurista original;
- corpo inteiro bem modelado;
- iluminacao forte;
- identidade visual propria.

O avatar procedural agora reforca essa direcao com uma jaqueta futurista propria,
paineis assimetricos, tiras luminosas, tenis/botas com detalhes, catchlights nos
olhos e um simbolo traseiro original do Orion. Ele nao copia roupas, marcas,
logos ou personagens das referencias.

## Lip Sync

Para GLB/VRM, o runtime tenta usar morph targets comuns de boca. Para o avatar procedural, a boca abre e fecha em pulsos leves durante `speaking` e `responding`.

Esse lip sync e intencionalmente simples para manter compatibilidade mobile e nao depender de analise de audio pesada.

## Regras de Performance

- Modo Performance reduz pixel ratio e efeitos.
- Mobile usa menos carga visual.
- `prefers-reduced-motion` deve continuar respeitado pela camada premium.
- Loops sao parados por `dispose()` quando a camada e desmontada.
- O avatar HTML/CSS permanece pronto caso o canvas seja indisponivel.

## Regras de Seguranca Visual

- Nao usar personagens oficiais ou identidades protegidas.
- Nao carregar modelos remotos por padrao.
- Servir modelos pela mesma origem do Orion.
- Manter arquivos grandes fora do cache obrigatorio do PWA.
- Validar extensoes permitidas antes de ativar um modelo real.

## Validacao Manual

1. Abrir o Orion no navegador.
2. Confirmar que o avatar aparece mesmo com manifesto desabilitado.
3. Abrir DevTools e verificar que nao ha erro critico de JavaScript.
4. Alternar estados pelo chat, voz ou botoes existentes.
5. Confirmar que o avatar procedural HTML/CSS ainda fica disponivel se o runtime 3D falhar.
