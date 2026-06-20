# Security Public Release

Checklist de seguranca antes de publicar o Orion.

## Nunca publicar

- `.env`
- senhas
- tokens
- chaves
- CPF
- banco real
- uploads pessoais
- logs sensiveis
- modelos grandes privados
- arquivos pessoais

## Variaveis de ambiente

Use `.env.example` como modelo. Em producao, configure segredos no painel do provedor.

Exemplos seguros:

```text
ORION_ADMIN_PASSWORD=troque_essa_senha
ORION_MASTER_KEY=gere_uma_chave_segura
ORION_ENV=production
ORION_PUBLIC_URL=https://seu-dominio.com
```

Troque todos os valores antes do deploy real.

## Permissoes

- Administrador: acesso completo.
- Usuario comum: acesso conforme permissoes.
- Visitante: acesso limitado.

Visitantes nunca devem ter controle administrativo.

## Antes do primeiro deploy publico

1. Execute scanner de segredos.
2. Revise `git diff --cached --name-only`.
3. Confirme que `.env` nao esta versionado.
4. Confirme que bancos reais nao estao versionados.
5. Configure HTTPS no provedor.
6. Use senha administrativa forte.
7. Teste login e permissoes.

## Teste publico seguro

1. Abrir link publico.
2. Enviar `oi`.
3. Confirmar resposta do Orion.
4. Confirmar WebSocket conectado.
5. Confirmar PWA carregando.
6. Confirmar que visitante nao acessa rotas admin.

