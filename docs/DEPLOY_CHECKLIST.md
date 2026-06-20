# Checklist de Deploy Publico

Use este checklist antes de publicar o Orion em Render, Railway ou VPS.

## Conceitos

- GitHub guarda o codigo.
- Render, Railway ou VPS mantem o Orion online.
- Cloudflare Tunnel no PC local nao funciona se o PC desligar.
- Para acessar a qualquer hora, use cloud ou VPS.

## Variaveis Obrigatorias

- [ ] Configurar `ORION_ADMIN_PASSWORD`.
- [ ] Configurar `ORION_MASTER_KEY`.
- [ ] Configurar `ORION_ENV=production`.
- [ ] Configurar `ORION_PUBLIC_URL`.
- [ ] Configurar `APP_HOST=0.0.0.0`.
- [ ] Configurar `APP_PORT=8000` ou porta exigida pelo provedor.

## Dados Sensíveis

- [ ] Nao publicar `.env`.
- [ ] Nao publicar banco real.
- [ ] Nao publicar uploads pessoais.
- [ ] Nao publicar chaves.
- [ ] Nao publicar tokens.
- [ ] Nao publicar logs sensiveis.
- [ ] Nao publicar modelos grandes privados.

## Segurança do Orion

- [ ] Proteger uploads.
- [ ] Desativar comandos perigosos do PC em cloud.
- [ ] Garantir que visitante nao tenha funcoes admin.
- [ ] Usar HTTPS.
- [ ] Usar senha administrativa forte.
- [ ] Testar logout e permissoes.

## Teste Publico

- [ ] Abrir link publico.
- [ ] Confirmar frontend carregado.
- [ ] Enviar `oi`.
- [ ] Confirmar resposta do Orion.
- [ ] Confirmar WebSocket conectado.
- [ ] Confirmar PWA carregado.
- [ ] Confirmar que visitante nao acessa admin.

## Persistência

- [ ] Persistir `database/`.
- [ ] Persistir `storage/`.
- [ ] Persistir `uploads/`.
- [ ] Planejar backup.

