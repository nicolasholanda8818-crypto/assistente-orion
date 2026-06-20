# ORION External Dependencies

## Backend

| Dependencia | Finalidade | Obrigatoria no Inicio | Observacao |
| --- | --- | --- | --- |
| Python | runtime | Sim | validar versao suportada no instalador |
| FastAPI | HTTP e WebSocket | Sim | API publica e OpenAPI |
| Uvicorn | servidor local | Sim | execucao Windows e containers |
| SQLAlchemy | ORM e sessoes | Sim | acesso relacional |
| Alembic | migracoes | Sim | versionamento do schema |
| Pydantic Settings | configuracao | Sim | `.env` e defaults |
| ChromaDB | vetores | Fase 3 | memoria e conhecimento |
| APScheduler | jobs | Fase 3 | Dream Mode, backup e lembretes |
| Vosk | STT local | Fase 3 | modelo separado |
| pyttsx3 | TTS local | Fase 3 | depende de voz do SO |
| cryptography | AES-256-GCM | Sim | onboarding bootstrap e futuro cofre |
| psutil | monitoramento | Fase 6 | CPU, RAM, disco e rede |
| Ollama | modelos locais | Fase 3 | processo externo opcional |
| LM Studio | modelos locais | Fase 3 | servidor local OpenAI compativel opcional |
| API OpenAI compativel | modelos configuraveis | Fase 3 | remoto opcional, consentimento e Vault obrigatorios |

## Frontend e Mobile

| Dependencia | Finalidade | Observacao |
| --- | --- | --- |
| Three.js | cenario e avatar | quality tiers e fallback |
| Service Worker | offline cache | HTTPS fora de localhost |
| Web App Manifest | instalacao PWA | icones e metadados |
| Capacitor | Android e iOS | requer toolchain nativa |
| Android Studio | build Android | externo ao projeto |
| Xcode | build iOS | requer macOS |
| Safari/WebKit | validacao Web e iOS | executar em gate de frontend posterior |

## Sistema Operacional e Ferramentas

| Dependencia | Finalidade | Observacao |
| --- | --- | --- |
| Tesseract OCR | OCR | instalacao separada |
| ffmpeg | audio/video opcional | validar licenca e distribuicao |
| Docker Desktop | ambiente container opcional | nao substitui instalacao desktop |
| Cloudflare Tunnel | acesso remoto opcional | exige consentimento explicito |

## Politica

- Manter versoes pinadas por marco.
- Gerar SBOM antes de release.
- Verificar licencas.
- Escanear vulnerabilidades conhecidas.
- Nunca baixar modelos ou updates sem confirmacao administrativa.
- Nunca trocar automaticamente de modelo local para provider remoto.

## Plataformas

- Linux e macOS sao hosts desktop planejados.
- Android e iOS usam Capacitor inicialmente como clientes companion.
- Web/PWA e a interface compartilhada.
- Capacitor nao substitui o backend Python.
