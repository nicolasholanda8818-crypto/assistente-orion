# ORION Backup Strategy

## Objetivo

Garantir restauracao completa do ORION apos corrupcao, perda de arquivo, falha de atualizacao ou erro operacional.

## Escopo

Incluir:

- SQLite;
- ChromaDB;
- uploads;
- musicas e playlists quando configurado;
- plugins instalados e manifestos;
- configuracoes;
- metadados de modelos locais;
- logs de auditoria permitidos.

Excluir por padrao:

- caches reconstruiveis;
- temporarios;
- `.env`;
- chave mestra do cofre;
- segredos exportados em texto puro;
- modelos grandes quando houver estrategia de redownload verificado.

Valores persistentes do cofre permanecem criptografados no backup. A recuperacao da
chave segue `SECRETS_POLICY.md` e deve permanecer separada do pacote de dados.

## Formato

Arquivo compactado versionado contendo:

- manifesto;
- versao ORION;
- versao do schema;
- timestamp UTC;
- lista de arquivos;
- tamanho;
- hash SHA-256;
- origem;
- classificacao de sensibilidade.

## Fluxo

1. Adquirir lock de backup.
2. Suspender jobs conflitantes.
3. Executar checkpoint SQLite WAL.
4. Criar snapshot consistente.
5. Copiar ChromaDB.
6. Copiar arquivos incluidos.
7. Gerar manifesto e hashes.
8. Compactar.
9. Validar arquivo.
10. Registrar auditoria.
11. Liberar lock.

## Agendamento

- Backup leve diario.
- Backup completo semanal.
- Backup obrigatorio antes de update.
- Retencao configuravel.
- Execucao local por APScheduler.

## Restauracao

Restauracao exige:

- papel admin;
- confirmacao explicita;
- verificacao de manifesto;
- backup preventivo do estado atual;
- restauracao em staging;
- validacao;
- troca atomica quando possivel;
- auditoria.

## Teste

Ao menos uma restauracao automatizada em diretorio temporario deve ocorrer periodicamente. Backup sem restore testado nao e considerado valido.
