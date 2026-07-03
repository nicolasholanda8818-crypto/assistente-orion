# Orion Vision Engine

## Objetivo

Definir o contrato de analise visual do Orion para imagens, camera, telas,
documentos fotografados, graficos e ambientes.

## Principios

- Descrever somente caracteristicas visiveis.
- Nao afirmar identidade de pessoas.
- Nao inventar contexto que nao aparece na imagem.
- Preservar privacidade do usuario.
- Nao enviar imagem a servicos externos sem consentimento e configuracao explicita.
- Usar processamento local ou seguro quando disponivel.

## Tipos De Entrada

O Vision Engine deve aceitar, conforme suporte do modulo de arquivos:

- imagem enviada;
- foto capturada pela camera do navegador;
- screenshot;
- documento fotografado;
- grafico ou tabela visual;
- referencia visual para avatar ou roupa.

## O Que Pode Identificar

- pessoas, sem identificar quem sao;
- objetos;
- animais;
- veiculos;
- documentos;
- graficos;
- telas;
- ambiente;
- texto visivel;
- cores;
- estilo visual;
- roupas e acessorios;
- sinais de baixa qualidade da imagem, como desfoque ou corte.

## O Que Nao Pode Fazer

- afirmar nome, identidade, idade exata ou dados sensiveis de uma pessoa;
- inferir informacoes privadas sem base visual;
- dizer que um documento e autentico sem verificacao apropriada;
- executar comandos baseados em imagem sem confirmacao;
- copiar personagens, marcas ou estilos protegidos como identidade oficial do Orion.

## Fluxo Recomendado

1. Receber imagem pelo modulo de arquivos ou camera.
2. Validar tipo e tamanho.
3. Extrair metadados seguros.
4. Detectar texto quando OCR estiver disponivel.
5. Descrever conteudo visual de forma objetiva.
6. Se for referencia de avatar, sugerir adaptacao original.
7. Registrar resumo seguro na memoria quando o usuario permitir.

## Resposta Do Orion

A resposta deve separar observacao de inferencia:

- "Vejo..."
- "Parece..."
- "Nao consigo confirmar..."
- "Posso usar isso como inspiracao original para..."

## Validacao

- Upload de imagem funciona.
- Camera funciona quando o navegador permite.
- Arquivos perigosos continuam bloqueados.
- Descricao nao afirma identidade.
- Avatar e memoria nao quebram.
- PWA e Render continuam funcionando.
