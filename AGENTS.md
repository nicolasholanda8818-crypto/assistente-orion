# ORION Engineering Guide

## Missao

Construir o ORION de forma incremental, verificavel e compativel com Windows, navegador, PWA e futuras embalagens Capacitor.

## Regras de Trabalho

1. Implementar somente um ticket aprovado por vez.
2. Nao adicionar funcionalidade fora do ticket ativo.
3. Preservar funcionalidades existentes.
4. Nao deixar pseudocodigo, `TODO` vazio ou placeholder sem comportamento definido.
5. Manter modulos desacoplados por contratos da API interna.
6. Registrar migracoes de banco para qualquer alteracao estrutural.
7. Incluir validacao manual e automatizada ao concluir cada ticket.
8. Atualizar `PROJECT_STATUS.md`, `TODO.md` e `BACKLOG.md` apos cada ticket.
9. Nao armazenar segredos em texto puro.
10. Nao executar atualizacao, restauracao, reinicio ou desligamento sem confirmacao administrativa explicita.
11. Revisar `THREAT_MODEL.md` quando uma superficie externa, permissao ou operacao sensivel mudar.
12. Seguir `SECRETS_POLICY.md`: nenhum segredo ou dado sensivel pode existir em codigo.

## Definicao de Pronto

Um ticket esta pronto somente quando:

- o escopo esta completo;
- os arquivos modificados estao listados;
- os testes relevantes passam;
- o procedimento manual de verificacao esta documentado;
- os criterios de aceitacao foram conferidos;
- a documentacao afetada foi atualizada;
- nao existem erros criticos conhecidos introduzidos pelo ticket.

## Fronteiras Arquiteturais

- `backend/`: aplicacao FastAPI, dominio, persistencia e integracoes locais.
- `frontend/`: PWA HTML, CSS, JavaScript e Three.js.
- `mobile/`: embalagem Capacitor e permissoes nativas.
- `plugins/`: SDK, marketplace local e plugins instalados.
- `data/`: SQLite, ChromaDB, backups e dados locais.
- `uploads/`: arquivos controlados pelo modulo de arquivos.
- `music/`: biblioteca local de audio.
- `models/`: modelos locais de voz, IA e visao.
- `platforms/`: contratos arquiteturais para Linux, macOS, Android, iOS e Web.
- `docs/`: documentacao tecnica persistente.
- `tests/`: suites automatizadas.

## Padrao de Tickets

Cada ticket deve declarar:

- objetivo unico;
- dependencias anteriores;
- arquivos esperados;
- como executar;
- como testar;
- criterios de aceitacao;
- riscos especificos;
- documentacao a atualizar.
