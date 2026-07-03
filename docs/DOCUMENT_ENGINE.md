# Orion Document Engine

## Objetivo

Definir como o Orion deve ler, organizar, resumir e transformar documentos sem
executar arquivos enviados e sem expor dados privados.

## Formatos

O Document Engine deve tratar:

- PDF;
- DOCX;
- TXT;
- PPTX;
- XLSX;
- imagens com texto quando OCR estiver disponivel.

## Capacidades

Quando o formato permitir, o Orion deve:

- extrair conteudo;
- organizar topicos;
- resumir;
- explicar;
- responder perguntas;
- localizar trechos;
- transformar em apostila;
- transformar em trabalho;
- transformar em PDF;
- criar flashcards.

## Fluxo Seguro

1. Receber arquivo por upload permitido.
2. Validar extensao, tamanho e tipo.
3. Gerar nome interno seguro.
4. Salvar fora do frontend publico.
5. Extrair texto com bibliotecas seguras.
6. Criar resumo local.
7. Associar resultado ao usuario correto.
8. Registrar memoria resumida apenas quando permitido.

## Bibliotecas Aceitas

- `pypdf` para PDF com texto.
- `python-docx` para DOCX.
- `reportlab` para gerar PDF simples.
- `pillow` para metadados e imagens.
- XML interno seguro para leitura basica de XLSX e PPTX quando aplicavel.

OCR pode ser integrado com Tesseract em uma fase propria, respeitando instalacao
local e consentimento do usuario.

## Regras De Seguranca

- Nunca executar arquivos enviados.
- Bloquear extensoes ativas ou perigosas.
- Impedir path traversal.
- Isolar arquivos por usuario.
- Nao expor uploads no cache do PWA.
- Nao enviar conteudo privado para pesquisa web sem autorizacao.
- Nao guardar senhas, tokens ou documentos sensiveis como memoria livre.

## Resposta Do Orion

Ao analisar documento, o Orion deve informar:

- formato reconhecido;
- tamanho ou quantidade aproximada de conteudo extraido;
- resumo;
- pontos principais;
- limitacoes da extracao;
- proximas acoes disponiveis.

## Validacao

- Upload de PDF, DOCX, XLSX, PPTX, TXT e imagem.
- Listagem por usuario.
- Download seguro.
- Analise local.
- Transformacoes geradas.
- WebSocket, PWA e Render preservados.
