# Orion Avatar System

## Objetivo

O avatar do Orion foi aprimorado para parecer mais vivo, com corpo inteiro mais detalhado, rosto expressivo, olhos holograficos e roupas configuraveis.

## Corpo

O avatar preserva a estrutura HTML/CSS existente e adiciona camadas visuais:

- aura neural;
- cabelo com mais volume;
- rosto com brilho, nariz, bochechas e iris holografica;
- jaqueta/capuz com zipper;
- maos com dedos simples;
- pernas com joelhos e botas;
- nucleo luminoso e linhas de energia.

## Expressoes

Os estados do Orion alteram olhos, boca, aura e postura:

- feliz;
- curioso;
- pensativo;
- concentrado;
- professor;
- respondendo;
- pesquisando;
- analisando arquivos;
- aprendendo;
- erro leve.

## Lip Sync

Quando o Orion entra em estado `speaking` ou `responding`, a boca usa uma animacao simples de abertura/fechamento. Ela e leve e funciona sem audio analyzer, preservando desempenho e compatibilidade mobile.

## Avatar Studio

O Avatar Studio continua usando as preferencias locais por usuario. A fase premium adiciona novas opcoes de roupa no contrato visual:

- Hacker;
- Executivo;
- Cyber.

As skins por imagem continuam sendo usadas como inspiracao visual, sem copiar personagens protegidos, pessoas reais ou identidades externas.

## GLB/VRM Progressivo

A Fase Visual 2 adiciona um shell 3D real em `orion-avatar-3d-shell`. Ele tenta carregar GLB/VRM por manifesto local e so assume a renderizacao quando o modelo carrega com sucesso.

O avatar procedural HTML/CSS permanece como fallback:

- se o manifesto estiver desativado;
- se o modelo nao existir;
- se WebGL falhar;
- se os imports de Three.js/VRM falharem;
- se o navegador estiver em modo restrito.

Consulte `docs/AVATAR_GLB_VRM.md`.
