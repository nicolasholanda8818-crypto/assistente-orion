# Orion Automation

Este documento descreve a base segura de automacao do Orion.

## Objetivo

Transformar o Orion em uma central preparada para integrar voz, computador, celular, TV e dispositivos compativeis sem executar acoes perigosas por padrao.

## Principios

- Nenhuma automacao sensivel roda sem confirmacao.
- Render/cloud nunca abre programas locais do usuario.
- Tokens de dispositivos e segredos nao ficam no codigo.
- Toda solicitacao retorna um evento de auditoria.
- Permissoes podem ser revogadas em fases futuras.
- O PWA mostra preview antes de rotinas que possam abrir apps, sites ou dispositivos.

## Voice

O modo de conversa continua usa o navegador quando disponivel:

- SpeechRecognition para ouvir;
- SpeechSynthesis para responder;
- sincronizacao com avatar, boca e estados visuais.

Estados declarados:

- `sleeping`;
- `listening`;
- `understanding`;
- `thinking`;
- `searching`;
- `responding`;
- `waiting`.

A palavra de ativacao padrao e `Orion`. Ela e configuravel no painel PWA, mas o reconhecimento real da wake word depende do navegador ou de um futuro app/servico local.

Fluxo de uso:

1. O usuario toca no microfone.
2. Orion muda para `listening`.
3. Ao receber fala, muda para `understanding` e `thinking`.
4. Se a resposta precisar de internet, muda para `searching`.
5. Ao responder, muda para `responding`.
6. Depois volta para `waiting` ou `sleeping`.

## Computador Local

O modulo declara suporte planejado para:

- abrir navegador;
- abrir VS Code;
- abrir Explorador de Arquivos;
- abrir Spotify;
- abrir YouTube;
- abrir documentos;
- abrir projetos autorizados.

Essas acoes exigem um agente local no computador do usuario. No Render elas ficam bloqueadas e documentadas, porque o servidor cloud nao tem acesso ao PC local.

## Celular

A Fase 3 prepara contrato para sincronizacao entre:

- PWA;
- Android;
- desktop.

O objetivo e continuidade de conversa e sessao autorizada entre dispositivos.

## TV e Dispositivos

Contratos planejados:

- Chromecast;
- Android TV;
- Google TV;
- Home Assistant;
- Wake-on-LAN.

Todos exigem confirmacao, permissoes e configuracao explicita de credenciais seguras.

## Rotinas

Rotinas iniciais:

- `dev.environment`: ambiente de desenvolvimento;
- `favorite.sites`: sites favoritos;
- `study.session`: sessao de estudos.

As rotinas usam preview seguro. O Orion mostra os passos antes de qualquer execucao futura.

Nenhuma rotina executa comandos reais nesta fase. O backend retorna apenas um plano verificavel, adequado para Render e para ambientes locais sem agente desktop instalado.

## API

Endpoints:

- `GET /api/automation/status`
- `POST /api/automation/request`
- `POST /api/automation/routines/preview`

Exemplo de preview:

```json
{
  "user_id": "user-local",
  "routine_id": "dev.environment"
}
```

Exemplo de solicitacao:

```json
{
  "user_id": "user-local",
  "action_id": "notifications.smart",
  "target": "projetos",
  "confirmed": false
}
```

## PWA

O painel `Automacoes` mostra:

- estados de voz;
- palavra de ativacao;
- notificacoes inteligentes;
- capacidades do ecossistema;
- rotinas com preview.

O painel ensina o usuario a usar os recursos e deixa claro quando algo requer agente local, permissao ou confirmacao.

## Seguranca

Restricoes ativas:

- `no-dangerous-host-actions`;
- `cloud-runtime-does-not-open-local-programs`;
- `confirmation-required-for-sensitive-actions`;
- `permissions-can-be-revoked`;
- `audit-log-for-automation-requests`;
- `no-hardcoded-device-tokens`.

Acoes como abrir aplicativos, controlar TV, acionar Wake-on-LAN, acessar Home Assistant ou ler calendario externo permanecem em estado planejado ate existir autorizacao explicita, credenciais seguras e agente local/integrador devidamente configurado.

## Como Usar

1. Abra o Orion no navegador ou PWA.
2. Clique em `Automacoes` na sidebar ou no chip superior.
3. Revise os estados de voz e ajuste a palavra de ativacao local.
4. Ative notificacoes inteligentes somente se desejar receber avisos do navegador.
5. Abra o preview de uma rotina antes de qualquer execucao futura.
6. Em deploy cloud, mantenha controle de computador e dispositivos bloqueado ate configurar um agente local seguro.

## Testes

Executar:

```powershell
python -m pytest tests\test_orion_automation.py tests\test_voice_runtime.py tests\test_api.py -q
python scripts\validate_pwa.py
```
