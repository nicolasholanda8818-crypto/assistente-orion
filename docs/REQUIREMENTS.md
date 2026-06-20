# ORION Requirements and Traceability

## Objetivo

ORION e um assistente pessoal local-first acessivel por navegador, instalavel como PWA e futuramente empacotado com Capacitor para Android e iOS.

## Requisitos Funcionais

| ID | Requisito | Tickets |
| --- | --- | --- |
| RF001 | Backend FastAPI local | T0002 |
| RF002 | SQLite com SQLAlchemy e migrations | T0004-T0005 |
| RF003 | API interna por comandos e eventos | T0006 |
| RF004 | WebSocket em tempo real | T0007 |
| RF005 | Usuarios, perfis, roles e JWT | T0008-T0009 |
| RF006 | Configuracoes globais e por usuario | T0010 |
| RF007 | Segredos criptografados | T0011 |
| RF008 | Memoria curta, longa, busca e resumos | T0013-T0014 |
| RF009 | Voz local, TTS e wake word | T0015 |
| RF010 | Parser de comandos por intencao | T0016 |
| RF011 | Brain Ollama com fallback local | T0017 |
| RF012 | Dream Mode agendado | T0018 |
| RF013 | Financas e relatorios | T0019 |
| RF014 | Arquivos locais | T0020 |
| RF015 | Planner e notificacoes | T0021 |
| RF016 | OCR, documentos e conhecimento | T0022 |
| RF017 | Camera e visao | T0023 |
| RF018 | Academy | T0024 |
| RF019 | Focus Mode | T0025 |
| RF020 | Music | T0026 |
| RF021 | Frontend PWA | T0003, T0027 |
| RF022 | Three.js, avatar e emocoes | T0028-T0030 |
| RF023 | Controle protegido do PC | T0031 |
| RF024 | Multiplayer local | T0032 |
| RF025 | Plugins e marketplace | T0033-T0034 |
| RF026 | Backup e restore | T0035 |
| RF027 | Atualizacao e rollback | T0036 |
| RF028 | Telemetria e monitoramento | T0037 |
| RF029 | Exportacao PDF, CSV e JSON | T0038 |
| RF030 | Onboarding bootstrap criptografado e migracao futura para Vault | baseline, T0039 |
| RF031 | Clientes companion Capacitor Android/iOS | T0040 |
| RF032 | Docker e Compose | T0041 |
| RF033 | Adapters de plataforma para Web, Linux e macOS | T0031, T0040, T0046 |
| RF034 | Wiki interna gerada para APIs, banco, plugins e eventos | baseline, T0049 |
| RF035 | Changelog automatico gerado por fragmentos estruturados | baseline, T0050 |
| RF036 | Release Candidate verificavel com auditoria, testes, performance, seguranca, manifesto e checksum | baseline, T0051 |
| RF037 | Prontidao de distribuicao 1.0 com verificacao de RC, artefato, checksum e bloqueios | baseline, T0052 |
| RF038 | Assistente de configuracao inicial com dados do usuario, senha administrativa, criptografia e edicao posterior | baseline, T0039 |

## Requisitos Nao Funcionais

| ID | Requisito | Validacao |
| --- | --- | --- |
| RNF001 | Operacao local-first | teste sem rede |
| RNF002 | Compatibilidade Windows | instalacao limpa e testes |
| RNF003 | PWA Android e iPhone | matriz mobile |
| RNF004 | Modularidade | revisao de imports e contratos |
| RNF005 | Recuperabilidade | restore automatizado |
| RNF006 | Observabilidade local | logs e metricas |
| RNF007 | Cobertura minima 80% | coverage |
| RNF008 | Acessibilidade | Design System, auditoria teclado, contraste e leitor |
| RNF009 | Performance configuravel | benchmarks e quality tiers |
| RNF010 | Atualizacao confirmada | teste negativo sem aprovacao |
| RNF011 | Capacidade ausente falha de forma explicita por plataforma | testes de adapters |
| RNF012 | Documentacao gerada nao acessa valores de runtime | Wiki check, secret scan e build |
| RNF013 | Changelog distribuido e deterministico e sanitizado | changelog check, secret scan e build |
| RNF014 | Release Candidate nao pode ser promovido com bloqueio critico aberto | relatorio RC, threat model e auditoria |
| RNF015 | Distribuicao 1.0 deve falhar de forma explicita quando o RC estiver bloqueado | readiness report e teste automatizado |
| RNF016 | Configuracao inicial nao deve armazenar senha ou dados pessoais em texto puro | testes de criptografia e scanner de segredos |

## Requisitos de Seguranca

| ID | Requisito | Tickets |
| --- | --- | --- |
| RS001 | AES-256-GCM | T0011 |
| RS002 | JWT e revogacao | T0009 |
| RS003 | Permissoes granulares | T0008 |
| RS004 | Logs de auditoria | T0012 |
| RS005 | Protecao de uploads | T0020 |
| RS006 | Plugins assinados | T0034 |
| RS007 | Update assinado | T0036 |
| RS008 | Nenhuma telemetria externa automatica | T0037 |
| RS009 | Confirmacao para acoes destrutivas | T0031, T0035, T0036 |
| RS010 | Revisao SQLi, XSS, CSRF e abuso WebSocket | T0045 |
| RS011 | Promocao de release exige auditoria de dependencias, segredos, controles criticos e aprovacao administrativa | T0051 |
| RS012 | Distribuicao deve verificar integridade do artefato antes de qualquer entrega | T0052 |
| RS013 | Edicao de configuracao inicial exige senha administrativa atual | baseline, T0039 |

## Acessibilidade

- navegacao por teclado;
- foco visivel;
- alto contraste;
- suporte a leitor de tela;
- texto ampliado;
- perfil idoso;
- alternativas para recursos 3D;
- feedback nao dependente apenas de cor.

## Escalabilidade

ORION prioriza instalacao pessoal local. A arquitetura deve suportar crescimento modular e multiplayer local, sem assumir banco servidor. SQLite permanece adequado enquanto escrita concorrente for controlada. Migracao para banco servidor so sera considerada mediante dados reais.
