# ORION Feature Matrix

Data: `2026-06-14`

| Funcionalidade | Status | Observacao |
| --- | --- | --- |
| Backend FastAPI | Parcial | Health, status, WebSocket e Brain baseline funcionam localmente. |
| SQLite | Parcial | Base existe, mas modulos finais ainda precisam consolidacao por ticket. |
| WebSocket | Parcial | Chat responde localmente; falta hardening de producao. |
| Chat continuo | Completo para baseline | Responde por WebSocket/REST fallback e limita DOM visivel. |
| Brain local | Parcial | Fallback deterministico sem modelo externo; identidade basica corrigida. |
| PWA | Parcial | Manifest e service worker validos; falta vendorizar todas dependencias externas. |
| Avatar 2D | Completo para baseline | Estados e reacoes visuais implementados. |
| Cenario 3D/fallback | Parcial | Canvas presente com Three.js quando possivel e fallback local. |
| Onboarding | Parcial | Bootstrap criptografado existente; precisa consolidacao com Identity/Vault. |
| Lord Dragons | Parcial | Prototipo avancado existente, ainda nao aprovado como release. |
| Voz offline | Nao iniciado | Vosk/pyttsx3 ainda precisam ticket proprio. |
| Memoria vetorial | Parcial | Arquitetura planejada; integracao final com ChromaDB pendente. |
| Financas | Parcial | Planejado/testes baseline; backend completo ainda depende ticket dedicado. |
| Academy | Nao iniciado | Depende de memoria e frontend modular. |
| Uploads/arquivos | Parcial | Planejado; exige hardening de seguranca. |
| Control PC | Nao iniciado | Deve permanecer admin-only e com confirmacao explicita. |
| Plugins | Parcial | Contratos planejados; hot reload seguro pendente. |
| Backup/Update | Parcial | Documentado; implementacao completa pendente. |
| Hospedagem cloud | Nao iniciado | Arquitetura local ainda deve ser endurecida antes. |

