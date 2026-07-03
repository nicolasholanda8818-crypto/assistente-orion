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
