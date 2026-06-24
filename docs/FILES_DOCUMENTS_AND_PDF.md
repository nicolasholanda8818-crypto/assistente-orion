# Orion Arquivos, Documentos e PDF

Data: 2026-06-23

## Objetivo

A Fase 3 amplia o modulo `orion_files` para leitura local de documentos e geracao de materiais simples sem remover o fluxo anterior de camera, upload, analise e memoria de arquivos.

## Escopo Implementado

- Upload seguro de PDF, DOCX, XLSX, PPTX, TXT, imagens e formatos ja permitidos pela allowlist.
- Extracao local de texto para TXT, Markdown, CSV, JSON, PDF com texto, DOCX, XLSX e PPTX.
- Descricao basica de imagens com Pillow, incluindo formato, dimensoes e modo de cor.
- Transformacoes por arquivo:
  - resumo;
  - explicacao;
  - apostila;
  - trabalho;
  - PDF;
  - flashcards.
- Download seguro de arquivos originais e arquivos gerados.
- Painel `Meus Arquivos` com acoes diretas para analisar, transformar, baixar e apagar.

## Bibliotecas

- `pypdf`: extracao de texto em PDFs com camada textual.
- `python-docx`: leitura de documentos DOCX.
- `pillow`: leitura segura de metadados de imagens.
- `reportlab`: geracao local de PDFs.

## Endpoints

- `POST /api/files/upload`
- `GET /api/files?user_id=<id>`
- `GET /api/files/{id}?user_id=<id>`
- `GET /api/files/{id}/download?user_id=<id>`
- `POST /api/files/{id}/analyze`
- `POST /api/files/{id}/transform`
- `DELETE /api/files/{id}?user_id=<id>`
- `POST /api/camera/photo`

## Transformacao

`POST /api/files/{id}/transform` recebe:

```json
{
  "user_id": "browser-local-user",
  "mode": "summary",
  "output_format": "text"
}
```

Modos validos:

- `summary`
- `explanation`
- `apostila`
- `trabalho`
- `pdf`
- `flashcards`

`apostila`, `trabalho`, `pdf`, `flashcards` e qualquer transformacao com `output_format: "pdf"` criam um novo registro com `source: "generated"`.

## Privacidade e Seguranca

- Arquivos ficam fora do frontend publico em `storage/files`.
- O nome armazenado e interno e seguro.
- Extensoes executaveis continuam bloqueadas.
- Cada requisicao exige `user_id`; um usuario nao acessa arquivo de outro `user_id`.
- Documentos nao sao enviados para servicos externos por este fluxo.
- Senhas, chaves, documentos pessoais e dados sensiveis nao devem ser enviados para transformacao automatica.

## Limitacoes Conhecidas

- PDFs escaneados sem texto nao recebem OCR nesta fase.
- DOC legado e XLS legado podem ser armazenados, mas a extracao profunda esta focada em DOCX/XLSX/PPTX.
- As transformacoes usam heuristica local deterministica, nao IA remota.

## Como Testar Manualmente

1. Abra o Orion pelo navegador.
2. Entre em `Meus Arquivos`.
3. Envie um TXT, PDF com texto, DOCX, XLSX, PPTX ou imagem.
4. Verifique se o arquivo aparece na lista.
5. Clique em `Analisar`.
6. Clique em `Resumir`, `Explicar`, `Apostila`, `Trabalho`, `PDF` e `Flashcards`.
7. Verifique se os materiais gerados aparecem na lista.
8. Clique em `Baixar` em um arquivo original e em um gerado.
9. Confirme que o chat e o WebSocket continuam respondendo.
