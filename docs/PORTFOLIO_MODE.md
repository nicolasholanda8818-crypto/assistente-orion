# Orion Portfolio Mode

## Objetivo

O modo Portfolio transforma o Orion em uma apresentacao interativa do projeto e do desenvolvedor, sem criar nova rota e sem depender do backend.

## Como Acessar

- Sidebar: `Portfolio`.
- Ajustes rapidos: botao `Portfolio`.
- Chat: comandos como `abrir portfolio`, `mostrar portfolio`, `mostrar projetos` ou `apresente meu trabalho`.

## Conteudo

- desenvolvedor;
- stack tecnica;
- desenvolvimento assistido por IA;
- arquitetura de software;
- habilidades;
- evolucao do Orion;
- projetos;
- contato e apresentacao guiada.

## Comportamento

Ao abrir, o Orion:

- fecha paineis concorrentes quando necessario;
- entra em postura de apresentacao;
- anima cards com GSAP quando disponivel;
- mantem fallback visual se GSAP falhar;
- permite voltar ao chat sem recarregar a pagina.

## Limites

O Portfolio atual e estatico e local ao frontend. Respostas dinamicas sobre portfolio continuam usando o chat normal do Orion.
