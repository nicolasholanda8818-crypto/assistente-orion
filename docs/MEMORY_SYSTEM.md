# Orion Memory System

## Objetivo

Definir a memoria organizada do Orion para preservar continuidade, preferencias,
projetos, objetivos e aprendizado sem armazenar dados sensiveis.

## Categorias Oficiais

- Projetos;
- Programacao;
- Conversas;
- Arquivos;
- PDFs;
- Imagens;
- Preferencias;
- Objetivos;
- Aprendizado;
- Roadmaps.

## Estrutura De Uma Memoria

Cada memoria persistente deve possuir:

- data;
- categoria;
- resumo;
- importancia;
- origem;
- usuario associado quando aplicavel.

## Tipos De Memoria

### Memoria Curta

Guarda contexto recente da conversa atual. Deve ser limitada para evitar perda de
performance em conversas longas.

### Memoria Longa

Guarda fatos duradouros e nao sensiveis, como nome, preferencias, projetos e
objetivos.

### Memoria Vetorial

Usa ChromaDB para busca semantica local. Embeddings devem preservar privacidade e
nao depender obrigatoriamente de servico externo.

### Preferencias

Guarda estilo de resposta, temas recorrentes, voz, aparencia e interesses quando
o usuario permitir.

## O Que Pode Ser Lembrado

- nome ou apelido;
- preferencias de explicacao;
- projetos mencionados;
- tecnologias estudadas;
- objetivos declarados;
- assuntos recorrentes;
- resumos de documentos analisados;
- progresso de estudos.

## O Que Nao Deve Ser Lembrado

- senhas;
- tokens;
- chaves;
- documentos pessoais completos;
- cartoes;
- dados bancarios;
- identificadores sensiveis;
- conteudo que o usuario pediu para esquecer.

## Recuperacao De Contexto

O Orion deve recuperar memoria quando:

- o usuario retorna;
- pergunta "lembra de mim?";
- menciona um projeto anterior;
- pede continuidade;
- pede planejamento ou revisao;
- envia arquivo relacionado a um assunto recorrente.

## Esquecimento E Correcao

O sistema deve permitir evolucao futura para:

- apagar memorias por usuario;
- corrigir preferencias;
- exportar resumo de memoria;
- revogar armazenamento de certos temas.

## Validacao

- Usuario informa nome e o Orion reconhece depois.
- Projeto mencionado pode ser retomado em nova conversa.
- Dados sensiveis nao sao armazenados.
- Busca semantica retorna contexto relevante.
- Memoria nao quebra Render, WebSocket ou PWA.
