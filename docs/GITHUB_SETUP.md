# GitHub Setup

Este guia prepara o Orion para ser salvo no GitHub sem alterar funcionalidades existentes.

## Antes de publicar

- Nao publique `.env`.
- Nao publique bancos reais.
- Nao publique uploads pessoais.
- Nao publique chaves, tokens, senhas, CPF ou dados sensiveis.
- Revise `.gitignore` antes do primeiro commit.
- Use `.env.example` apenas como modelo seguro.

## Criar repositorio no GitHub

1. Acesse `https://github.com`.
2. Crie um novo repositorio.
3. Nao adicione README, `.gitignore` ou license pelo GitHub se eles ja existem localmente.
4. Copie a URL do repositorio.

## Inicializar Git local

No terminal, dentro da pasta `orion`:

```powershell
git init
git status
git add .
git commit -m "Initial Orion release"
git remote add origin URL_DO_REPOSITORIO
git branch -M main
git push -u origin main
```

## Verificacao antes do push

```powershell
git status
git diff --cached --name-only
```

Confirme que nao aparecem:

- `.env`
- `*.db`
- `*.sqlite`
- `storage/keys`
- `storage/uploads`
- `storage/chroma`
- `models/vosk`
- modelos grandes de IA
- arquivos pessoais

## Atualizacoes futuras

```powershell
git status
git add .
git commit -m "Descreva a alteracao"
git push
```

