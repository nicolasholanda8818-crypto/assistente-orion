# ORION Platform Architecture

## Objetivo

Preparar o ORION para Linux, macOS, Android, iOS e Web sem duplicar regras de negocio
nem assumir capacidades que uma plataforma nao possui.

O Core permanece local-first e independente de sistema operacional. Cada recurso que
depende do ambiente deve passar por um adapter de plataforma e, quando representar uma
acao, por uma ferramenta registrada no Tool System.

## Perfis De Execucao

| Perfil | Plataformas | Backend Python local | Interface | Estado |
| --- | --- | --- | --- | --- |
| host desktop | Windows, Linux, macOS | Sim | navegador ou PWA local | fundacao disponivel no Windows; adapters planejados |
| web local | navegador no host desktop | usa backend em `127.0.0.1` | PWA | fundacao disponivel |
| web remoto aprovado | navegador em outro dispositivo | usa host desktop pareado | PWA por HTTPS e WSS | bloqueado ate endurecimento |
| mobile companion | Android, iOS | usa host desktop pareado | wrapper Capacitor | planejado |
| mobile standalone | Android, iOS | runtime local dedicado | app nativo | fora do escopo inicial |

Capacitor empacota a camada web e oferece bridges nativas. Ele nao embarca
automaticamente o backend FastAPI, o SQLite desktop, modelos locais ou processos
Python. Por isso, Android e iOS entram inicialmente como clientes companion.

## Matriz De Capacidades

| Capacidade | Linux | macOS | Android | iOS | Web |
| --- | --- | --- | --- | --- | --- |
| hospedar FastAPI local | Sim | Sim | Nao no baseline | Nao no baseline | Nao |
| instalar PWA | navegador compativel | navegador compativel | navegador compativel | Safari com fluxo proprio | navegador compativel |
| wrapper Capacitor | Nao necessario | Nao necessario | Planejado | Planejado | Nao necessario |
| SQLite do host | Sim | Sim | somente futuro runtime dedicado | somente futuro runtime dedicado | Nao |
| acesso a arquivos do host | adapter desktop | adapter desktop | bridge com permissao | bridge com permissao | seletor do navegador |
| notificacoes | adapter desktop | adapter desktop | bridge nativa | bridge nativa | Web Notifications quando suportado |
| camera e microfone | permissao do navegador ou SO | permissao do navegador ou SO | bridge nativa | bridge nativa | permissao do navegador |
| controle de programas | adapter Linux futuro | adapter macOS futuro | Nao | Nao | Nao |
| cofre de chaves | provedor seguro do SO | Keychain futuro | Keystore futuro | Keychain futuro | sem chave mestra no navegador |

Nenhuma capacidade e presumida. O runtime deve detectar suporte e negar a operacao
quando o adapter correspondente nao existir.

## Estrutura De Diretorios

```text
platforms/
  README.md
  web/
    README.md
  linux/
    README.md
  macos/
    README.md
  android/
    README.md
  ios/
    README.md
```

Estrutura alvo quando os adapters forem implementados:

```text
backend/app/platforms/
  contracts.py
  detection.py
  linux/
  macos/
  windows/

frontend/src/platform/
  bridge.js
  capabilities.js
  web.js

mobile/
  capacitor.config.ts
  android/
  ios/
```

Diretorios nativos gerados pelo Capacitor entram somente no ticket de empacotamento.

## Adapter Backend

O backend desktop deve depender de contratos, nunca de condicionais espalhadas.

| Contrato | Uso |
| --- | --- |
| `PlatformCapabilities` | declarar recursos realmente suportados |
| `PathProvider` | resolver dados, logs, modelos e cache por SO |
| `SecretProvider` | proteger chave mestra fora do banco |
| `NotificationProvider` | emitir notificacoes locais permitidas |
| `ProcessControlProvider` | abrir ou fechar programa permitido |
| `SystemMetricsProvider` | CPU, RAM, disco e rede |

Adapters de host sao carregados por deteccao explicita. Falta de adapter gera
capacidade indisponivel, nao fallback permissivo.

## Bridge Frontend

A PWA e o wrapper Capacitor compartilham a mesma interface. A camada visual consulta
uma bridge pequena antes de usar recurso nativo:

| Area | Web/PWA | Capacitor |
| --- | --- | --- |
| instalacao | manifest e service worker | loja, pacote ou distribuicao interna |
| notificacoes | Web Notifications | plugin nativo aprovado |
| camera | `getUserMedia` quando permitido | bridge nativa aprovada |
| microfone | `getUserMedia` quando permitido | bridge nativa aprovada |
| arquivos | seletor e download do navegador | bridge nativa com escopo minimo |
| ciclo de vida | eventos da pagina | eventos do app |

Nenhum segredo persistente fica no frontend, em cache PWA, `localStorage` ou
`sessionStorage`.

## Integracao Com Tool System

Toda acao passa por uma ferramenta registrada. Uma ferramenta de plataforma somente
pode ficar `enabled` quando:

1. o adapter existe;
2. a capacidade foi detectada;
3. a permissao foi concedida;
4. a confirmacao exigida ocorreu;
5. a auditoria esta disponivel.

Exemplos:

| Ferramenta | Linux | macOS | Android | iOS | Web |
| --- | --- | --- | --- | --- | --- |
| `control.open_program` | adapter futuro | adapter futuro | bloqueada | bloqueada | bloqueada |
| `files.read` | adapter futuro | adapter futuro | bridge futura | bridge futura | seletor autorizado futuro |
| `finance.get_balance` | independente do SO apos modulo Finance | independente do SO apos modulo Finance | via API pareada | via API pareada | via API permitida |

## Armazenamento Por Plataforma

Em desenvolvimento, a fundacao usa caminhos relativos ao workspace. Distribuicoes
devem migrar dados para diretorios privados do usuario:

| Plataforma | Diretorio recomendado |
| --- | --- |
| Windows | `%LOCALAPPDATA%\Orion` |
| Linux | `$XDG_DATA_HOME/orion` ou `~/.local/share/orion` |
| macOS | `~/Library/Application Support/Orion` |
| Android | sandbox privado do aplicativo |
| iOS | sandbox privado do aplicativo |
| Web | Cache Storage apenas para shell publico; IndexedDB somente para dados permitidos |

SQLite, ChromaDB, uploads, logs e backups nunca entram no cache do service worker.

## Rede E Pareamento

O padrao continua sendo `127.0.0.1`. Cliente remoto ou mobile exige um modo companion
explicito, ainda bloqueado nesta fundacao.

Antes de habilitar companion:

- autenticar usuario e dispositivo;
- parear com confirmacao administrativa;
- usar HTTPS e WSS;
- validar `Origin`;
- limitar payload e frequencia;
- isolar sessoes e salas;
- permitir revogacao;
- auditar conexao e desconexao;
- nunca anunciar dados pessoais durante descoberta.

## Empacotamento

| Plataforma | Estrategia |
| --- | --- |
| Web | servir PWA pelo FastAPI ou por origem HTTPS aprovada |
| Linux | instalador desktop futuro para Python, ambiente virtual e servico local opcional |
| macOS | instalador desktop futuro, adapter Keychain e agente local opcional |
| Android | Capacitor, Android Studio, manifestos e permissoes minimas |
| iOS | Capacitor, macOS, Xcode, assinatura e permissoes minimas |

Build nativo, assinatura, loja e distribuicao sao gates separados do build web.

## CI/CD E Testes

Baseline atual:

- lint em Linux;
- testes backend em Linux, Windows e macOS;
- E2E web com Chromium;
- validacao de manifest e service worker;
- auditoria de dependencias e segredos.

Gates futuros:

| Gate | Quando adicionar |
| --- | --- |
| Safari e WebKit | ao estabilizar frontend responsivo |
| Android emulator | ao criar wrapper Capacitor |
| iOS simulator | ao criar wrapper Capacitor em runner macOS |
| instalacao limpa Linux | ao criar instalador Linux |
| instalacao limpa macOS | ao criar instalador macOS |
| pareamento mobile | apos identidade, JWT e WebSocket endurecido |

## Ordem De Implementacao

1. manter Web/PWA como interface compartilhada;
2. separar contratos de plataforma no backend;
3. implementar Linux e macOS como hosts desktop;
4. endurecer identidade, WebSocket e pareamento;
5. criar bridge frontend;
6. empacotar Android e iOS com Capacitor;
7. validar permissoes, instalacao, update e restore por plataforma;
8. avaliar mobile standalone somente com requisitos e riscos proprios.

## Referencias

- [Capacitor Environment Setup](https://capacitorjs.com/docs/getting-started/environment-setup)
- [Capacitor Workflow](https://capacitorjs.com/docs/basics/workflow)
- [MDN Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

