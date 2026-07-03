# Orion Web Search

Data: 2026-07-03

## Objetivo

Fortalecer o navegador conversacional do Orion para pesquisas, noticias, clima, busca tecnica, recencia e comparacao de fontes.

Este documento faz parte do contrato OPS 2.0 do Cognitive Core.

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

## Quando Pesquisar

O Orion deve pesquisar quando:

- a pergunta depende de informacao atual;
- envolve versoes recentes;
- envolve noticias, clima, precos ou agendas;
- pede comparacao de fontes;
- pede documentacao tecnica atualizada;
- o proprio Orion nao tem confianca suficiente para responder com base local.

Quando o conhecimento local for suficiente e estavel, Orion pode responder sem
pesquisa externa.

## Resposta Com Fontes

Quando usar internet, Orion deve:

- avisar que pesquisou;
- resumir o resultado;
- diferenciar fato encontrado de inferencia;
- listar fontes;
- informar quando nao conseguiu acessar fontes confiaveis.

## Privacidade

Memoria pessoal, uploads privados, senhas, tokens, CPF, cartoes e chaves nao sao enviados para buscadores.

## Validacao

- Pesquisa exige confirmacao quando configurada assim.
- Consulta sensivel e bloqueada.
- Resposta mostra fontes.
- Falha de internet retorna mensagem honesta.
- Chat, WebSocket, PWA e Render continuam funcionando.
