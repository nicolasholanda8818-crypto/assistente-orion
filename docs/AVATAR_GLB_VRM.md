# Orion GLB/VRM Avatar

## Objetivo

A Fase Visual 2 adiciona suporte progressivo a avatar 3D real em GLB/VRM sem remover o avatar procedural atual. O avatar HTML/CSS continua sendo fallback obrigatorio.

## Como Funciona

1. A PWA carrega normalmente com o avatar procedural.
2. O modulo `frontend/assets/js/avatar-3d.js` e carregado de forma lazy.
3. O runtime consulta `frontend/assets/models/avatar-manifest.json`.
4. Se houver modelo habilitado, Three.js carrega o GLB/VRM.
5. Somente apos sucesso, o canvas 3D aparece e o procedural fica em standby.
6. Se qualquer etapa falhar, o procedural permanece visivel e clicavel.

## Manifesto

Arquivo:

```text
frontend/assets/models/avatar-manifest.json
```

Exemplo para GLB:

```json
{
  "enabled": true,
  "defaultModelId": "orion-local-glb",
  "models": [
    {
      "id": "orion-local-glb",
      "label": "Orion GLB local",
      "type": "glb",
      "url": "/assets/models/orion-avatar.glb",
      "enabled": true
    }
  ]
}
```

Exemplo para VRM:

```json
{
  "enabled": true,
  "defaultModelId": "orion-local-vrm",
  "models": [
    {
      "id": "orion-local-vrm",
      "label": "Orion VRM local",
      "type": "vrm",
      "url": "/assets/models/orion-avatar.vrm",
      "enabled": true
    }
  ]
}
```

## Regras de Seguranca

- O modelo deve ser servido pela mesma origem do Orion.
- URLs remotas sao bloqueadas.
- Extensoes permitidas: `.glb`, `.gltf`, `.vrm`.
- Arquivos grandes nao entram no cache obrigatorio do PWA.
- O fallback procedural nunca e removido.

## Animacoes

Quando o modelo inclui clips nomeados, o Orion tenta mapear:

- `idle`, `breath`, `waiting`, `stand`;
- `listening`, `listen`, `attention`, `hear`;
- `thinking`, `think`, `ponder`, `hand_chin`;
- `speaking`, `talk`, `talking`, `speak`, `mouth`;
- `searching`, `search`, `scan`, `typing`.

Se o modelo nao possuir clips, o runtime usa movimentos procedurais leves de idle, fala, pensamento, escuta e pesquisa.

## Lip Sync Basico

O runtime procura morph targets comuns:

- `jawOpen`;
- `mouthOpen`;
- `aa`;
- `A`;
- `viseme_aa`;
- `v_aa`.

Quando encontrados, eles recebem pulsos simples durante fala. Quando nao existem, o avatar ainda muda postura, luz e estado visual.

## Performance

- `Performance`: pixel ratio reduzido e menos antialias.
- `Equilibrado`: qualidade intermediaria.
- `Ultra Visual`: pixel ratio maior quando o dispositivo suporta.

Em mobile fraco ou `prefers-reduced-motion`, o runtime reduz automaticamente a carga visual.

## Ponte Procedural Three.js

Na Fase Visual Suprema, quando o manifesto GLB/VRM esta desabilitado ou nao
aponta para um modelo valido, `avatar-3d.js` tenta criar um avatar humanoide
procedural em Three.js. Essa ponte permite testar corpo inteiro, gestos, estados,
roupas e lip sync leve antes de empacotar um modelo real.

O avatar HTML/CSS continua sendo o fallback final e nao e removido.

## Avatar VRM Real

A integracao Volume IV habilita `frontend/assets/models/orion-avatar.vrm` como
modelo visual principal. A analise tecnica esta registrada em
`docs/AVATAR_MODEL_ANALYSIS.md`.

Caracteristicas detectadas:

- VRM 1.0 / GLB 2.0;
- 54 ossos humanoides;
- 57 morph targets faciais;
- presets de expressao `aa`, `blink`, `happy`, `angry`, `sad`, `surprised` e outros;
- 16 materiais MToon/unlit;
- 28 texturas PNG embutidas;
- nenhuma animacao embutida.

Como o modelo nao traz clips de animacao, o Orion usa movimentos procedurais
leves para idle, pensamento, escuta e fala, combinados com o `expressionManager`
do VRM para lip sync e emocoes.
