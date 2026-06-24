# Orion Intelligence

Data: 2026-06-24

## Objetivo

Fortalecer o Orion como assistente conversacional sem trocar o Brain existente. A evolucao adiciona uma camada de decisao segura chamada `orion_dialogue_manager`, mantendo o fallback local deterministico.

## Componentes

- `orion_intents`: detecta intencoes de conversa, TI, vendas, negociacao, consultor senior, memoria e busca.
- `orion_reasoning`: escolhe resposta, emocao, gesto, estado visual, urgencia e tamanho da resposta.
- `orion_dialogue_manager`: resume a estrategia em tres camadas internas.
- `orion_memory`: preserva contexto por usuario sem salvar dados sensiveis.
- `orion_knowledge`: base local para TI, programacao, vendas e negociacao.

## Raciocinio Triplo

O Orion avalia internamente:

1. Entendimento: intencao, emocao, assunto e urgencia.
2. Estrategia: responder, perguntar, ensinar, negociar ou recomendar pesquisa web.
3. Resposta: texto final, voz, estado visual e proximo passo.

A cadeia interna nao e exibida ao usuario. O frontend recebe apenas metadados seguros como `dialogueStrategy`, `responseMode`, `shouldSearchWeb` e `reasoningState`.

## Capacidades Adicionadas

- Orientacao de vendas e atendimento.
- Negociacao com objecao de preco.
- Modo consultor senior sem fingir experiencia humana real.
- Professor de TI e programacao com base local reforcada.
- Recomendacao de pesquisa web para informacoes recentes.

## Seguranca

- Nao executa comandos no host.
- Nao envia memoria privada para pesquisa.
- Nao salva senhas, tokens, CPF, cartoes ou chaves.
- Nao revela cadeia interna completa.
