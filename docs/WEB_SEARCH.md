# Orion Web Search

Data: 2026-06-24

## Objetivo

Fortalecer o navegador conversacional do Orion para pesquisas, noticias, clima, busca tecnica, recencia e comparacao de fontes.

## Gatilhos

O Orion reconhece pedidos como:

- `pesquise`
- `procure`
- `veja na web`
- `compare fontes`
- `me traga fontes`
- `qual e o mais recente`
- `o que saiu de novo`
- `pesquise documentacao`

## Fluxo Seguro

1. Usuario pede ou o Brain recomenda pesquisa.
2. Frontend solicita confirmacao.
3. A consulta e sanitizada.
4. Dados sensiveis sao bloqueados.
5. Orion resume resultados e mostra fontes.

## Privacidade

Memoria pessoal, uploads privados, senhas, tokens, CPF, cartoes e chaves nao sao enviados para buscadores.
