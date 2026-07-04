# Animacoes Do Avatar Orion

## Objetivo

O Orion usa animacoes em camadas para nunca ficar completamente parado:

1. animacao externa quando disponivel;
2. movimento procedural leve de respiracao e postura;
3. piscada e expressao por VRM `expressionManager`;
4. fallback HTML/CSS quando WebGL, modelo ou animacao falham.

## Idle Padrao

Arquivo fonte analisado:

```text
C:\Users\nicolas keven lopes\Downloads\Standing Idle To Fight Idle.fbx
```

Arquivo integrado:

```text
frontend/assets/animations/orion-idle.fbx
```

Caracteristicas detectadas:

- FBX binario versao 7700;
- tamanho: 1.849.184 bytes;
- rig de origem: `mixamorig`;
- 2 animation stacks;
- 315 animation curves;
- 65 modelos de ossos;
- ossos principais de tronco, cabeca, bracos, maos, dedos, pernas e pes;
- curvas de rotacao para postura idle/fight idle.

## Manifesto

Arquivo:

```text
frontend/assets/animations/animation-manifest.json
```

O manifesto define `orion-standing-idle-to-fight-idle` como Idle padrao. Se ele
nao estiver disponivel, o runtime procura uma animacao `breathing`; se tambem nao
existir, usa `breathing-procedural`.

## Retarget

O FBX usa ossos `mixamorig`, enquanto o avatar atual usa ossos VRoid
`J_Bip_*`. O runtime faz um retarget leve de nomes:

- `mixamorig:Hips` -> `J_Bip_C_Hips`;
- `mixamorig:Spine` -> `J_Bip_C_Spine`;
- `mixamorig:Head` -> `J_Bip_C_Head`;
- `mixamorig:LeftArm` -> `J_Bip_L_UpperArm`;
- `mixamorig:RightArm` -> `J_Bip_R_UpperArm`;
- maos, dedos, pernas, pes e ombros seguem a mesma tabela.

Por seguranca, apenas tracks de rotacao sao aplicadas ao avatar. Tracks de
posicao sao ignoradas para evitar saltos ou deslocamento do modelo na tela.

## Transicoes

O Idle externo entra como `state.actions.idle` no mixer do Three.js. Outras
animacoes futuras continuam usando o mesmo mecanismo de fade:

- `fadeIn(0.18)`;
- `fadeOut(0.18)`;
- loop infinito para Idle;
- movimento procedural e expressoes VRM continuam ativos por cima.

## Performance E Fallback

O FBX nao entra no app shell obrigatorio do PWA. A PWA cacheia apenas o manifesto
de animacao. Em celular fraco, rede indisponivel, falha de loader ou incompatibilidade
de tracks, o Orion volta para respiração procedural sem quebrar chat, WebSocket,
voz, PWA ou Render.
