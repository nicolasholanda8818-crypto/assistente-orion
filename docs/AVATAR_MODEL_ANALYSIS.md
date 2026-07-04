# Orion Avatar Model Analysis

Data: 2026-07-03

Arquivo analisado:

```text
C:\Users\nicolas keven lopes\Documents\orion.vrm
```

Arquivo integrado:

```text
frontend/assets/models/orion-avatar.vrm
```

Arquivo GLB analisado posteriormente:

```text
C:\Users\nicolas keven lopes\Documents\orion.glb
```

Arquivo GLB integrado:

```text
frontend/assets/models/orion-avatar.glb
```

## Resultado

O modelo e compativel com a integracao progressiva GLB/VRM do Orion.

- Formato: VRM 1.0 empacotado como GLB 2.0.
- Gerador: VRoid Studio 2.14.0.
- Tamanho: 16.143.032 bytes.
- Chunks GLB: `JSON` e `BIN`.
- Cenas: 1.
- Nos: 171.
- Meshes: 3.
- Materiais: 16.
- Texturas: 28 imagens PNG embutidas.
- Animacoes embutidas: 0.
- Skins: 3.
- Rig humanoide VRM: 54 ossos.
- Morph targets faciais: 57 no mesh de rosto.

## Resultado Do GLB

O arquivo `orion.glb` tambem e compativel com a integracao do Orion. Apesar da
extensao `.glb`, ele contem a extensao `VRMC_vrm`, entao pode usar o mesmo
pipeline de expressoes VRM do runtime.

- Formato externo: GLB 2.0.
- Extensao interna: VRM 1.0 (`VRMC_vrm`).
- Gerador: VRoid Studio 2.14.0.
- Tamanho: 16.142.956 bytes.
- Chunks GLB: `JSON` e `BIN`.
- Cenas: 1.
- Nos: 171.
- Meshes: 3.
- Materiais: 16.
- Texturas: 28 imagens PNG embutidas.
- Animacoes embutidas: 0.
- Skins: 3.
- Rig humanoide VRM: 54 ossos.
- Morph targets faciais: 399 entradas em primitivas do mesh de rosto.
- Presets VRM: `neutral`, `aa`, `ih`, `ou`, `ee`, `oh`, `blink`,
  `blinkLeft`, `blinkRight`, `happy`, `angry`, `sad`, `surprised`,
  `relaxed`.

## Extensoes Detectadas

- `KHR_texture_transform`
- `KHR_materials_unlit`
- `VRMC_vrm`
- `VRMC_springBone`
- `VRMC_materials_mtoon`

Nenhuma extensao aparece como obrigatoria em `extensionsRequired`, o que reduz o
risco de falha em loaders GLTF basicos. Para melhor fidelidade visual, o runtime
usa `@pixiv/three-vrm`.

## Rig

O modelo possui rig humanoide completo com ossos principais:

- hips;
- spine;
- chest;
- upperChest;
- neck;
- head;
- leftEye e rightEye;
- bracos, antebracos e maos;
- dedos completos;
- pernas, pes e dedos dos pes.

Tambem existem ossos secundarios para cabelo e roupa, usados pelo spring bone do
VRM.

## Expressoes E Blendshapes

Presets VRM detectados:

- `neutral`
- `aa`
- `ih`
- `ou`
- `ee`
- `oh`
- `blink`
- `blinkLeft`
- `blinkRight`
- `happy`
- `angry`
- `sad`
- `surprised`
- `relaxed`

Morph targets do rosto incluem grupos como:

- `Fcl_ALL_Joy`
- `Fcl_ALL_Angry`
- `Fcl_ALL_Sorrow`
- `Fcl_ALL_Surprised`
- `Fcl_EYE_Close`
- `Fcl_MTH_A`
- `Fcl_MTH_I`
- `Fcl_MTH_U`
- `Fcl_MTH_E`
- `Fcl_MTH_O`

## Materiais

O modelo usa materiais MToon/unlit do VRM:

- pele;
- olhos;
- highlight dos olhos;
- boca;
- sobrancelhas;
- cabelo;
- roupa superior;
- roupa inferior;
- calcados.

Ha materiais com `alphaMode` `MASK` e `BLEND`, entao o runtime deve preservar
transparencia e evitar conversoes destrutivas.

## Limitacoes

- O modelo nao contem animacoes embutidas.
- As animacoes de idle, fala, escuta, pensamento e pesquisa precisam continuar
  procedurais no runtime.
- O arquivo tem 16 MB, entao nao deve entrar no cache obrigatorio do app shell.
- A fidelidade MToon depende do suporte do loader VRM no navegador.
- A metadata do GLB informa `avatarPermission: onlyAuthor`,
  `commercialUsage: personalNonProfit`, `creditNotation: required`,
  `allowRedistribution: false` e `modification: prohibited`. Antes de manter
  esse asset em distribuicao publica, o responsavel do projeto deve confirmar
  que possui permissao/licenca adequada ou substituir por um modelo proprio.

## Decisao De Integracao

O Orion passa a usar `orion-avatar.glb` como avatar visual principal por
manifesto:

```text
frontend/assets/models/avatar-manifest.json
```

O GLB foi marcado como `vrmCompatible` porque contem `VRMC_vrm`. O
`orion-avatar.vrm`, o avatar procedural Three.js e o avatar HTML/CSS continuam
preservados como alternativas/fallback. Se o modelo real falhar, o Orion continua
funcional.

## Validacao Manual

1. Abrir o Orion.
2. Confirmar que o canvas do avatar fica `ready`.
3. Confirmar `data-model-type="glb"` e `data-model-status="ready"`.
4. Enviar mensagem no chat e observar expressao de fala.
5. Alternar estados de pensamento/escuta/fala.
6. Confirmar que WebSocket, PWA, voz, chat e Render continuam funcionando.
