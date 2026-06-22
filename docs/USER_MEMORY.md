# Orion User Memory

Data: `2026-06-21`

## Objetivo

A memoria de usuario permite que o Orion reconheca o mesmo navegador em conversas futuras, pergunte o nome na primeira interacao e personalize respostas sem depender de IA externa.

## Fluxo

1. O frontend cria um identificador local anonimo em `localStorage`.
2. O WebSocket envia esse identificador como `userId`.
3. O backend cria ou atualiza o perfil local em SQLite.
4. Se o perfil ainda nao tem nome, Orion pergunta como deve chamar a pessoa.
5. Quando a pessoa informa o nome, Orion salva `display_name`.
6. Em conversas futuras, Orion cumprimenta pelo nome e pode retomar assuntos recorrentes.

## Dados Salvos

Tabela `orion_user_profiles`:

- `user_id`: identificador anonimo do navegador.
- `display_name`: nome informado pelo usuario.
- `created_at`, `updated_at`, `last_seen_at`: controle local de perfil.

Tabela `orion_user_memory`:

- `preference`: preferencias simples ditas na conversa.
- `topic`: assuntos recorrentes extraidos de mensagens nao sensiveis.
- `project`: projetos mencionados pelo usuario.
- `weight`: reforco quando o mesmo fato aparece mais de uma vez.

Tabela `orion_user_summaries`:

- `summary`: resumo curto de mensagens nao sensiveis.
- `source_type`: origem do resumo.
- `weight`: reforco quando o mesmo resumo aparece novamente.

## Dados Nao Salvos

O Orion ignora mensagens com indicios de dados sensiveis, incluindo:

- senhas;
- tokens;
- chaves;
- CPF, RG, cartoes e CVV;
- PIX e dados bancarios;
- mensagens com sequencias longas de numeros.

## Compatibilidade

- Render: preservado, com WebSocket usando `wss://` em HTTPS.
- Docker: preservado, sem novas dependencias externas.
- PWA: cache atualizado para `orion-pwa-v30-visual-brain`.
- Frontend: layout, avatar e cenario preservados.
- Backend: resposta fallback local preservada.
- Preferencias visuais por navegador: roupa, modo de voz e modo visual ficam em `localStorage` com chave derivada do `userId` anonimo.

## Raciocinio Conversacional

O fallback local agora classifica cada mensagem com sinais leves de conversa:

- intencao principal;
- emocao percebida;
- topico provavel;
- urgencia;
- estado visual de raciocinio;
- tamanho esperado da resposta;
- indicacao se a resposta pode ser falada pelo navegador.

Esses sinais sao enviados pela API e pelo WebSocket sem expor cadeia de pensamento interna. O frontend usa apenas estados visuais como `thinking`, `clarifying`, `understanding` e `answering`.

## Voz No Navegador

O Orion usa APIs nativas do navegador quando disponiveis:

- `SpeechRecognition` ou `webkitSpeechRecognition` para ouvir em `pt-BR`.
- `SpeechSynthesisUtterance` para falar respostas em `pt-BR`.

Nenhum audio e enviado para o backend nesta camada. O navegador transforma a fala em texto localmente ou pelo provedor nativo do navegador, conforme suporte da plataforma.

## Teste Manual

1. Abra o Orion em uma aba anonima.
2. Aguarde a saudacao inicial.
3. Orion deve perguntar como chamar voce.
4. Envie `Joao`.
5. Orion deve confirmar o nome.
6. Recarregue a pagina.
7. Orion deve cumprimentar `Joao`.
8. Envie `gosto de programacao`.
9. Envie `oi` em outra conversa.
10. Orion pode mencionar o assunto recorrente em uma resposta curta.
11. Clique no microfone em um navegador compativel.
12. Fale uma frase curta.
13. Orion deve transcrever, responder e falar a resposta.
14. Envie `estou cansado` e verifique se Orion responde de forma acolhedora.
15. Envie `quero melhorar isso` e verifique se Orion pede uma pista mais clara.
16. Envie `lembra de mim?` apos salvar um nome e verifique se Orion reconhece o perfil local.
17. Troque a roupa do Orion e recarregue a pagina.
18. A roupa escolhida deve ser restaurada para o mesmo navegador.
