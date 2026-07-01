# Orion Reasoning

Este documento descreve a camada de inteligencia conversacional local do Orion.

## Objetivo

O Brain deve responder de forma natural, contextual e segura sem depender de um modelo externo para o fallback principal. A camada atual fortalece a conversa longa, reduz respostas genericas e preserva os contratos existentes de API, WebSocket, PWA e Render.

## Pipeline Cognitivo

Modulo principal: `app/brain/orion_cognitive_pipeline.py`

Cada mensagem passa por um fluxo interno de 10 etapas:

1. compreender a intencao;
2. identificar contexto;
3. consultar memoria relevante;
4. avaliar historico da sessao;
5. verificar conhecimento local;
6. decidir se validacao web e necessaria;
7. preparar comparacao de fontes quando houver permissao;
8. compor resposta;
9. adaptar ao perfil do usuario;
10. aprender somente quando for seguro.

Esse pipeline organiza a decisao, mas nao expoe cadeia interna de pensamento ao usuario.

## Camadas de Raciocinio

O pipeline usa quatro camadas principais.

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

## Professor, Mentor e Consultor

O Orion possui respostas locais para tres papeis profissionais:

- Professor de TI: explica com teoria, pratica, exemplo, exercicio e proximo passo.
- Mentor tecnico: orienta carreira, portfolio, curriculo, entrevistas e rotina de estudos.
- Consultor: organiza diagnostico, impacto, riscos, opcoes, recomendacao e proximo passo, sem fingir experiencia humana real.

Areas cobertas pela base local atual incluem Python, JavaScript, FastAPI, HTML, CSS, SQL, Docker, Git, GitHub, APIs, WebSocket, deploy, seguranca, vendas e negociacao.

## Pesquisa Web

O Brain decide automaticamente quando uma pergunta parece exigir validacao recente ou fontes. A execucao da pesquisa externa continua protegida:

- dados sensiveis bloqueiam a pesquisa;
- memoria pessoal nao entra na consulta;
- fontes externas exigem o fluxo seguro do modulo `orion_web_search`;
- quando a pesquisa nao pode ser feita, o Orion responde com conhecimento local e informa a limitacao.

Essa decisao preserva privacidade e evita enviar dados pessoais para buscadores.

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

## Autoteste Local

O script `scripts/run_brain_smoke.py` executa uma validacao rapida do Brain com casos de conversa, professor, mentor, decisao de busca web, bloqueio de segredo, sentimento e retorno.

Comando:

```powershell
python scripts\run_brain_smoke.py
```

O relatorio gerado fica em `docs/brain_smoke_report.json`.
