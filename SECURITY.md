# ORION Security Strategy

## Premissa

ORION controla dados pessoais, arquivos locais e potencialmente operacoes do sistema operacional. A seguranca deve existir desde a fundacao, nao como etapa final.

O modelo de ameacas versionado esta em `THREAT_MODEL.md`. Ele define as fronteiras de
confianca, as ameacas abertas e os criterios que bloqueiam exposicao remota, uploads e
plugins.

A gestao de credenciais e chaves esta definida em `SECRETS_POLICY.md`.

## Modelo de Confianca

- Padrao local-first.
- Nenhuma telemetria externa por padrao.
- Nenhum segredo em texto puro.
- Nenhum comando destrutivo sem confirmacao administrativa.
- Plugins sao nao confiaveis ate validacao.
- Entradas de navegador, WebSocket, arquivos e modelos sao nao confiaveis.

## Identidade e Autorizacao

Papeis iniciais:

| Papel | Nivel |
| --- | --- |
| `admin` | configuracao, auditoria e operacoes sensiveis |
| `adult` | uso pessoal completo sem administracao do host |
| `child` | interface restrita e conteudo supervisionado |
| `elderly` | interface acessivel com permissoes configuraveis |
| `guest` | sessao limitada e descartavel |

Regras:

- JWT curto com refresh controlado.
- Claims minimas e versionadas.
- Permissoes granulares por acao.
- Revogacao de sessao.
- Rate limit por rota e conexao.
- Auditoria de login, falha e negacao de permissao.

## Segredos

- AES-256-GCM para dados sensiveis em repouso.
- `.env` local e nao versionado para configuracao e bootstrap controlado.
- Cofre criptografado para segredos persistentes.
- Chave mestra fora do banco.
- Derivacao de chave com salt quando houver senha local.
- Rotacao planejada.
- Redacao de segredos em logs.

## Protecoes por Superficie

| Superficie | Controles |
| --- | --- |
| REST | validacao Pydantic, auth, rate limit, CORS restrito |
| WebSocket | autenticacao, limites de tamanho/frequencia, timeout |
| SQLite | SQLAlchemy parametrizado, migrations e minimo privilegio |
| Upload | extensao, MIME, tamanho, nome seguro e quarentena |
| PWA | CSP, headers, cache control e sanitizacao DOM |
| Plugins | assinatura, manifesto, permissoes e sandbox logico |
| Control | allowlist, confirmacao e auditoria |
| Tool System | registro obrigatorio, schema, permissao, confirmacao e deny by default |
| Model Runtime | selecao explicita, loopback local, HTTPS remoto, allowlist e credencial por referencia de Vault |
| Onboarding | AES-256-GCM bootstrap, senha admin derivada, origem local e edicao com senha atual |
| Wiki interna | contratos apenas, SQLite temporario em memoria e proibicao de valores de runtime |
| Changelog | fragmentos publicos sem segredos, validacao estrita e drift check |
| Update | assinatura, hash, backup e rollback |

## Aprovacoes Obrigatorias

Exigem confirmacao de administrador:

- desligar ou reiniciar host;
- fechar processo nao iniciado pelo ORION;
- instalar, atualizar ou remover plugin;
- atualizar ORION;
- restaurar backup;
- exportar dados sensiveis;
- enviar qualquer dado para fora do dispositivo.

## Auditoria

Eventos minimos:

- autenticacao;
- alteracao de papel;
- acesso negado;
- operacao de arquivo;
- exportacao;
- comando do PC;
- plugin lifecycle;
- backup;
- atualizacao;
- restauracao;
- acesso ao cofre.

## Revisoes Planejadas

- SQL injection.
- XSS.
- CSRF.
- WebSocket abuse.
- Upload malicioso.
- Directory traversal.
- SSRF em integracoes.
- Segredos em logs.
- Supply chain.
- Plugin privilege escalation.

## Restricao Da Fundacao

A fundacao atual deve executar somente em `127.0.0.1`. LAN, tunel e internet
permanecem bloqueados ate a mitigacao das ameacas WebSocket e remotas registradas em
`THREAT_MODEL.md`.

O Brain baseline aceita somente processamento textual local sem dados sensiveis. Sua
execucao usa allowlist interna e nao possui efeitos colaterais.

O Model Runtime baseline monta envelopes de protocolo sem executar trafego. Provider
remoto permanece bloqueado sem opt-in, consentimento e host permitido. Falha local
nunca autoriza fallback remoto automatico.

O onboarding persiste somente ciphertext e nonce no SQLite. Nome, preferencias e
credencial administrativa ficam dentro do payload criptografado; a senha administrativa
e derivada com salt e nunca e devolvida pela API. A chave bootstrap fica separada em
arquivo local ignorado pelo Git e deve migrar para o Vault em `T0011`.

A Wiki interna documenta OpenAPI, schema SQLite, manifestos seguros e catalogo de
eventos. Ela nao abre o banco local nem publica payloads, segredos, assinaturas ou
checksums de plugins.

O changelog e documentacao publica do projeto. Fragmentos nunca recebem segredo,
dado pessoal, caminho privado, dump ou payload sensivel.

Clientes Web, Android e iOS fora do host permanecem bloqueados ate existirem
pareamento, HTTPS, WSS, autenticacao, validacao de origem e revogacao.
