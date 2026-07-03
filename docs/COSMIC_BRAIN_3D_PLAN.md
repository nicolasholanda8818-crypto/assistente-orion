# Orion Cosmic Brain 3D Plan

## Objetivo

Orientar a evolucao do Cerebro Cosmico como centro neural visual do Orion, preservando o modulo atual, o chat, o WebSocket, o PWA e o fallback Canvas/CSS.

## Estado Atual

O Orion ja possui:

- modo Avatar e modo Cerebro alternaveis sem recarregar a pagina;
- grafo visual de memoria, documentos, projetos, arquivos, usuarios e Lord Dragons;
- estados cognitivos por cor;
- fallback Canvas/CSS quando WebGL nao esta disponivel;
- modos Performance, Equilibrado e Ultra Visual.

## Direcao Visual

O Cerebro Cosmico deve representar:

- memorias como nos luminosos;
- documentos como fragmentos holograficos;
- projetos como orbitas conectadas;
- conversas como pulsos de sinal;
- aprendizado como conexoes novas;
- Lord Dragons como categoria propria do grafo.

## Estados Cognitivos

- `idle`: pulso lento e particulas suaves.
- `thinking`: conexoes azuis mais rapidas.
- `learning`: nos amarelos crescendo.
- `searching`: linhas vermelhas em varredura.
- `remembering`: orbitas roxas em destaque.
- `files`: sinais verdes ligados a documentos.
- `speaking`: brilho branco e pulsos sincronizados ao avatar.

## Integracao Com o Cenario 3D

`scene.js` fornece uma camada ambiental atras do avatar. Quando o usuario alterna para o Cerebro Cosmico, `brain-vault.js` continua responsavel pelo nucleo neural principal.

A integracao recomendada e:

1. `main.js` define o estado atual do Orion.
2. `sceneManager.setState()` sincroniza iluminacao e paineis do cenario.
3. `brainVault.setState()` sincroniza o grafo cognitivo.
4. O avatar recebe o mesmo estado para manter expressao e postura.

## Evolucao Planejada

1. Associar nos visuais a memorias reais resumidas.
2. Permitir foco em categorias sem expor dados sensiveis.
3. Destacar arquivos analisados e projetos recentes.
4. Adicionar trajetos de aprendizado como linhas temporais.
5. Otimizar geometrias instanciadas para cenas maiores.

## Limites Atuais

O Cerebro Cosmico atual e uma representacao visual local. Ele nao revela cadeia interna de pensamento e nao envia memoria para servicos externos.

## Validacao Manual

1. Abrir o Orion.
2. Usar o botao Avatar/Cerebro.
3. Confirmar alternancia sem recarregar a pagina.
4. Enviar uma mensagem e observar mudanca de estado visual.
5. Ativar modo Performance e confirmar reducao visual sem quebrar chat.
