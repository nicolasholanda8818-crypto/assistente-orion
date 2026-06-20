# ORION Secrets Policy

## Documento

| Campo | Valor |
| --- | --- |
| Sistema | ORION |
| Versao da politica | 1.1 |
| Data da revisao | 2026-06-03 |
| Escopo | codigo, configuracao, CI/CD, logs, backups, plugins e distribuicao |
| Regra central | nenhum segredo ou dado sensivel pode existir em codigo-fonte |

## Objetivo

Impedir que senhas, tokens, chaves ou dados pessoais sejam versionados, distribuídos,
registrados em logs ou expostos ao navegador. O ORION adota duas camadas:

1. `.env` local e nao versionado para configuracao de runtime e bootstrap controlado;
2. cofre criptografado para segredos persistentes.

O cofre sera implementado em `T0011`. Ate esse ticket ser concluido, funcionalidades
que exigem segredo persistente permanecem desabilitadas.

### Bootstrap Limitado De Onboarding

O onboarding inicial pode persistir nome, preferencias e credencial administrativa
somente como ciphertext AES-256-GCM. A senha administrativa e derivada por
PBKDF2-HMAC-SHA256 com salt aleatorio antes de entrar no payload criptografado. A
chave bootstrap fica separada do SQLite em `storage/keys`, ignorada pelo Git e ausente
do release. Essa camada e transitoria: `T0011` deve migrar sua protecao para o Vault e
para o mecanismo seguro do sistema operacional.

## Regra Absoluta

Nunca armazenar segredo ou dado sensivel em:

- codigo Python, JavaScript, HTML, CSS ou SQL;
- fixtures, seeds ou testes;
- documentacao, exemplos ou screenshots;
- fragmentos de changelog;
- frontend, service worker, cache PWA, `localStorage` ou `sessionStorage`;
- URLs, query strings, payloads WebSocket ou mensagens de erro;
- logs, metricas ou eventos de auditoria;
- manifestos de plugin;
- imagem Docker, `Dockerfile`, argumentos de build ou artefatos;
- banco SQLite em texto puro;
- backup ou export sem criptografia e autorizacao.

Exemplos e testes devem usar placeholders inequivocos ou valores gerados em tempo de
execucao. Nenhuma credencial administrativa padrao e permitida.

## Classificacao

| Classe | Exemplos | Destino permitido |
| --- | --- | --- |
| segredo de autenticacao | senha, token, refresh token, API key, cookie de sessao | hash apropriado ou cofre |
| material criptografico | chave mestra, DEK, KEK, certificado privado | provedor de chave ou cofre |
| dado pessoal sensivel | conversas, preferencias privadas, dados financeiros | banco ou arquivo protegido conforme classificacao |
| configuracao nao sensivel | porta, host loopback, caminho de diretorio, nome do app | `.env` local ou defaults seguros |
| referencia de segredo | identificador logico do item no cofre | `.env`, banco ou configuracao |

Senhas de usuario nao devem ser criptografadas de forma reversivel. Quando a camada de
identidade existir, elas devem ser armazenadas somente como hash apropriado para
senhas. O cofre e destinado a tokens, chaves e credenciais que precisam ser
recuperadas pelo sistema.

## Uso De `.env`

`.env` e um canal local de configuracao, nao um banco de segredos.

Regras:

- `.env` nunca entra no Git;
- `.env.example` contem somente chaves vazias ou configuracao nao sensivel;
- `.env` deve ter ACL restrita ao usuario que executa o ORION;
- CI/CD injeta valores pelo ambiente do job, nunca por arquivo versionado;
- Docker nao recebe segredos por `ARG` ou `ENV` gravados na imagem;
- segredos persistentes devem migrar para o cofre assim que ele estiver disponivel;
- a chave mestra do cofre nao pode ficar no `.env` em instalacao normal.

Uso aceitavel de `.env`:

```text
APP_HOST=127.0.0.1
DATABASE_URL=sqlite:///./database/orion.db
```

Quando uma integracao precisar localizar um segredo, a configuracao deve guardar uma
referencia logica, nunca o valor:

```text
OLLAMA_REMOTE_TOKEN_REF=integrations/ollama/remote-token
```

## Cofre Criptografado

O cofre local deve usar criptografia autenticada `AES-256-GCM`.

### Requisitos

- um nonce aleatorio e exclusivo por item criptografado;
- geracao aleatoria por CSPRNG;
- metadados versionados para permitir migracao;
- associated data para vincular item, versao e finalidade;
- separacao entre dados criptografados e material de chave;
- menor privilegio por consumidor;
- auditoria de leitura, criacao, rotacao, revogacao e exclusao;
- redacao integral do valor em logs e excecoes;
- rotacao sem indisponibilidade quando possivel;
- restore testado sem incluir chave mestra em texto puro.

### Envelope De Chaves

| Item | Funcao | Armazenamento |
| --- | --- | --- |
| DEK | criptografar valores do cofre | armazenada criptografada junto aos metadados |
| KEK | proteger a DEK | separada dos dados do cofre |
| chave mestra | desbloquear ou derivar protecao local | mecanismo seguro do SO ou entrada controlada do usuario |

No Windows, a implementacao deve priorizar um mecanismo seguro do sistema operacional
para proteger a chave mestra. A chave nao pode ficar no SQLite, no ChromaDB, no
diretorio de uploads, no Git ou dentro do mesmo backup que os dados criptografados.

## Ciclo De Vida

| Etapa | Regra |
| --- | --- |
| criacao | gerar com CSPRNG e privilegio minimo |
| uso | entregar apenas ao consumidor autorizado e pelo menor tempo possivel |
| auditoria | registrar identidade, finalidade e resultado sem registrar o valor |
| rotacao | suportar troca programada e imediata apos suspeita de vazamento |
| revogacao | invalidar valor antigo e encerrar sessoes relacionadas |
| exclusao | remover referencias e material obsoleto conforme retencao aprovada |

## Logs E Telemetria

Logs podem registrar:

- identificador opaco do segredo;
- tipo de operacao;
- modulo consumidor;
- usuario ou plugin solicitante;
- resultado;
- timestamp e correlation ID.

Logs nunca podem registrar:

- valor completo ou parcial do segredo;
- senha;
- token;
- chave;
- payload bruto potencialmente sensivel;
- cabecalho `Authorization`;
- cookie de sessao.

## Plugins

Plugins nao leem `.env` nem acessam o cofre diretamente.

O Core deve:

1. validar assinatura e permissoes;
2. exigir grant explicito para cada referencia de segredo;
3. fornecer capability de escopo minimo;
4. auditar cada acesso;
5. bloquear exportacao do valor quando a integracao puder ser mediada pelo Core.

## Backup E Recuperacao

- backups nao incluem `.env`;
- backups nunca incluem chave mestra em texto puro;
- valores do cofre permanecem criptografados;
- restore exige administrador e auditoria;
- recuperacao da chave deve ser documentada separadamente;
- perda da chave pode tornar dados irrecuperaveis, portanto o fluxo deve ser testado.

## CI/CD

O script `scripts/check_secrets.py` e gate obrigatorio.

Ele bloqueia:

- arquivos `.env` versionados;
- chaves privadas e certificados privados versionados;
- formatos conhecidos de tokens;
- atribuicoes literais a nomes sensiveis em codigo;
- valores sensiveis preenchidos em `.env.example`.

O scanner e defesa adicional. Revisao humana continua obrigatoria, pois nenhum scanner
detecta todos os formatos ou todos os contextos.

## Incidente

Ao identificar segredo exposto:

1. revogar ou rotacionar imediatamente;
2. encerrar sessoes relacionadas;
3. remover o segredo de codigo, logs, artefatos e backups afetados;
4. avaliar historico Git e distribuicoes;
5. registrar incidente sanitizado;
6. revisar a causa e adicionar teste preventivo;
7. atualizar `THREAT_MODEL.md` quando necessario.

Remover apenas o texto visivel do repositorio nao torna um segredo novamente seguro.

## Criterios De Aceitacao

Antes de ativar autenticacao, plugins, updates ou integracoes:

- nenhuma credencial administrativa padrao existe;
- `.env` esta ignorado pelo Git;
- `.env.example` nao contem valores sensiveis;
- scanner de segredos passa na CI;
- cofre AES-256-GCM possui testes de criptografia, adulteracao, rotacao e restore;
- logs e backups possuem testes negativos para vazamento;
- chave mestra permanece separada dos dados;
- plugins recebem apenas grants minimos auditados.

## Referencias

- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [NIST SP 800-57 Part 1 Rev. 5](https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final)
