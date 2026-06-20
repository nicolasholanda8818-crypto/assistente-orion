# ORION Technical Risks

## Escala

- Probabilidade: baixa, media, alta.
- Impacto: moderado, alto, critico.

## Registro

| ID | Risco | Probabilidade | Impacto | Mitigacao |
| --- | --- | --- | --- | --- |
| R001 | SQLite receber concorrencia de escrita excessiva | Media | Alto | WAL, sessoes curtas, fila para jobs e testes de carga |
| R002 | Corrupcao ou divergencia entre SQLite e ChromaDB | Media | Alto | IDs correlacionados, manifesto, reconciliacao e backup conjunto |
| R003 | WebSocket sofrer abuso ou vazamento entre sessoes | Media | Critico | auth, namespaces, rate limit, tamanho maximo e testes de abuso |
| R004 | Controle do PC executar comando indevido | Media | Critico | allowlist, parser estrito, admin, confirmacao e auditoria |
| R005 | Plugin elevar privilegio | Media | Critico | assinatura, manifesto, permissoes, isolamento e hot reload reversivel |
| R006 | Atualizacao quebrar instalacao local | Media | Critico | backup automatico, assinatura, staging, rollback e aprovacao admin |
| R007 | Backup existir mas nao restaurar | Media | Critico | restauracao automatizada em ambiente temporario e teste recorrente |
| R008 | Modelos locais consumirem RAM/CPU excessivos | Alta | Alto | Model Manager, limites, unload dinamico e telemetria |
| R009 | Three.js degradar em celulares modestos | Alta | Moderado | quality tiers, fallback 2D e testes reais mobile |
| R010 | PWA variar entre Android e iPhone | Alta | Moderado | matriz de suporte, instrucoes iOS e validacao Safari |
| R011 | OCR, camera e visao divergirem por plataforma | Media | Alto | adapters, feature flags e degradacao graciosa |
| R012 | TTS/STT falhar por drivers Windows | Media | Alto | diagnostico, fallback e instalador verificavel |
| R013 | Dados pessoais aparecerem em logs | Media | Critico | redacao centralizada, classificacao de dados e testes |
| R014 | Dependencia externa comprometida | Baixa | Critico | pinning, hash, SBOM e revisao de supply chain |
| R015 | Escopo amplo atrasar qualidade | Alta | Alto | tickets pequenos, gates e release por marcos |
| R016 | Hot reload deixar estado inconsistente | Media | Alto | lifecycle transacional e rollback de plugin |
| R017 | Descoberta multiplayer expor dados na LAN | Media | Alto | opt-in, identificadores efemeros e limites |
| R018 | Fallback local do Brain responder incorretamente | Media | Moderado | respostas conservadoras, confidence e confirmacao para acoes |

## Riscos que Bloqueiam Release 1.0

Bloqueiam release:

- qualquer risco critico sem mitigacao testada;
- backup sem restauracao verificada;
- atualizacao sem rollback;
- operacao destrutiva sem confirmacao;
- dados sensiveis em logs;
- plugin sem controle de permissao;
- cobertura abaixo do minimo aprovado.

