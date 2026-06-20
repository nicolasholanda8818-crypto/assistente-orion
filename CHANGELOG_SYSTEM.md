# ORION Automatic Changelog

## Objetivo

Gerar `CHANGELOG.md` de forma deterministica a partir de fragmentos pequenos,
versionaveis e revisaveis.

## Estrutura

```text
changelog/
  entry.schema.json
  releases.json
  entries/
    <data>-<resumo>.json
scripts/
  generate_changelog.py
CHANGELOG.md
```

## Criar Entrada

Use o comando assistido:

```powershell
python scripts/generate_changelog.py --new added --summary "Nova capacidade local" --ticket T0001
```

Detalhes opcionais podem ser repetidos:

```powershell
python scripts/generate_changelog.py --new fixed --summary "Correcao do fluxo local" --detail "Mantem compatibilidade Windows."
```

Tipos permitidos:

- `added`;
- `changed`;
- `deprecated`;
- `removed`;
- `fixed`;
- `security`.

## Gerar E Validar

```powershell
python scripts/generate_changelog.py
python scripts/generate_changelog.py --check
```

O build regenera `CHANGELOG.md`. A CI usa `--check` e falha quando os fragmentos e o
arquivo versionado divergem.

## Publicar Release

Quando uma release for aprovada:

1. adicionar `version` e `date` em `changelog/releases.json`;
2. mover os fragmentos desejados de `version: null` para a versao publicada;
3. executar o gerador;
4. revisar `CHANGELOG.md`;
5. executar a CI completa.

Versoes usam `MAJOR.MINOR.PATCH`. O sistema nao publica release, atualiza arquivos ou
reinicia o ORION automaticamente.

## Seguranca

Fragmentos sao documentacao publica do projeto. Nunca incluir senhas, tokens, chaves,
dados pessoais, caminhos privados, dumps, payloads sensiveis ou conteudo de arquivos.
