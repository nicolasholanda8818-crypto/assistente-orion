# Orion Reasoning

Este documento descreve a camada de inteligencia conversacional local do Orion.

## Objetivo

O Brain deve responder de forma natural, contextual e segura sem depender de um modelo externo para o fallback principal. A camada atual fortalece a conversa longa, reduz respostas genericas e preserva os contratos existentes de API, WebSocket, PWA e Render.

## Fluxo de Raciocinio

Cada mensagem passa por quatro etapas.

### 1. Entendimento

Modulo principal: `app/brain/orion_reasoning.py`

Responsabilidades:

- identificar intencao;
- identificar emocao;
- extrair palavras-chave;
- inferir assunto;
- detectar urgencia;
- escolher estado visual seguro para o avatar;
- decidir se a resposta precisa ser curta, media ou mais explicativa.

O Orion nunca expõe cadeia interna de pensamento. Ele retorna apenas estados simples como `answering`, `thinking` e `clarifying`.

### 2. Memoria

Modulos principais:

- `app/brain/user_memory.py`
- `app/brain/orion_memory.py`

Responsabilidades:

- carregar nome do usuario;
- guardar preferencias nao sensiveis;
- guardar projetos mencionados;
- guardar interesses e tecnologias estudadas;
- guardar estados emocionais recentes;
- gerar continuidade de conversa;
- criar perguntas inteligentes quando falta contexto.

Dados sensiveis como senhas, tokens, chaves, CPF, cartoes e numeros longos nao sao armazenados.

### 3. Contexto

Modulo principal: `app/brain/orion_context.py`

Responsabilidades:

- identificar estilo de conversa;
- ajustar profundidade da resposta;
- reconhecer foco atual;
- adaptar tom para usuario tecnico, iniciante, focado ou casual.

Exemplos:

- duvidas de `python`, `backend`, `deploy` ou `websocket` usam estilo tecnico;
- frases como `nao sei o que fazer` usam tom paciente;
- preferencias como respostas curtas reduzem a profundidade;
- projetos e metas salvos podem virar foco da resposta.

### 4. Estrategia e Resposta

Modulos principais:

- `app/brain/orion_dialogue_manager.py`
- `app/brain/service.py`

Responsabilidades:

- decidir se deve responder diretamente;
- pedir mais informacoes quando o pedido esta incompleto;
- sugerir proximos passos;
- preservar continuidade por usuario;
- manter resposta natural e util;
- sinalizar quando pesquisa web seria apropriada, sem executar pesquisa automaticamente.

## Perguntas Inteligentes

Quando o usuario diz algo incompleto, o Orion tenta reduzir ambiguidade com perguntas especificas.

Exemplos:

- `quero melhorar o Orion` -> pergunta se o foco e visual, memoria, voz ou comportamento;
- `me ajuda` -> pergunta se deve escolher uma opcao simples;
- `me ensina` sem assunto -> pergunta entre programacao, matematica ou portugues.

## Continuidade

Se o usuario informou um estado recente, projeto ou objetivo, o Orion pode retomar esse contexto.

Exemplo:

1. Usuario: `estou cansado`
2. Depois: `voltei`
3. Orion: `Mais cedo voce comentou que estava cansado. Conseguiu descansar?`

## Contratos Preservados

Esta fase nao altera:

- formato publico do WebSocket;
- rotas REST existentes;
- frontend;
- PWA;
- avatar;
- Lord Dragons;
- Docker;
- Render.

O aprimoramento fica concentrado no Brain local e nos testes.
