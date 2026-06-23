# Orion Web e Voz

Data: `2026-06-23`

## Objetivo

A Fase 4 transforma o Orion em um navegador conversacional leve: o usuario pede uma pesquisa, noticias, clima ou busca tecnica, o Orion confirma antes de acessar a internet, resume os resultados e mostra fontes.

## Pesquisa Web

O modulo `orion_web_search` aceita quatro tipos:

- `web`: pesquisa geral.
- `news`: noticias e informacoes recentes.
- `weather`: clima, tempo, temperatura e previsao.
- `technical`: documentacao, erros, APIs, WebSocket, PWA, Docker, Render e assuntos de codigo.

Quando `search_type` chega como `auto`, o backend detecta o tipo pela consulta.

## Privacidade

- Pesquisas externas exigem confirmacao do usuario.
- Memoria pessoal nao e adicionada automaticamente a consultas.
- CPF, cartoes, tokens, senhas, chaves e emails sao bloqueados.
- A resposta separa conhecimento local de informacao obtida pela internet.

## Resposta

Cada resposta de busca retorna:

- resumo;
- fontes;
- quantidade de fontes;
- tipo da busca;
- proximos passos sugeridos.

## Voz

A voz usa `pt-BR` por padrao e mantém fallback pela `SpeechSynthesis API`.

Estados visuais:

- `listening`: ouvindo.
- `thinking`: pensando.
- `responding`: respondendo.

O frontend pausa o reconhecimento enquanto Orion fala e retoma a escuta no modo conversa quando a fala termina.

## Teste Manual

1. Abra o Orion.
2. Envie `pesquise noticias de tecnologia`.
3. Confirme a pesquisa.
4. Verifique resumo e fontes.
5. Envie `clima em Sao Paulo hoje`.
6. Confirme a pesquisa.
7. Verifique se o tipo exibido e `Clima`.
8. Envie `buscar documentacao FastAPI WebSocket`.
9. Verifique se Orion responde como busca tecnica.
10. Clique no microfone.
11. Fale uma frase curta.
12. Verifique os estados ouvindo, pensando e respondendo no avatar.
