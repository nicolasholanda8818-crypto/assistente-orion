# Scaling Orion

## Estado Atual

O Orion esta pronto para PWA local e deploy cloud simples. A arquitetura atual preserva SQLite local, arquivos locais e WebSocket em memoria quando executada em um unico processo.

## Limites de Escala

- SQLite local nao e indicado para multiplas replicas gravando ao mesmo tempo.
- Uploads locais nao sao compartilhados entre replicas.
- WebSocket em memoria nao sincroniza usuarios entre instancias.
- Render gratuito pode dormir e tem recursos limitados.
- Recursos de PC local nao funcionam em cloud sem agente local seguro.

## Caminho Recomendado

### Pequeno Uso Publico

- Render ou Railway com uma instancia.
- Variaveis de ambiente configuradas.
- Uploads limitados.
- Backups frequentes.

### Uso 24/7 Mais Forte

- VPS Linux com Docker Compose.
- Volumes persistentes.
- Proxy HTTPS.
- Backups automaticos.
- Monitoramento local.

### Escala Horizontal Futura

Para multiplas instancias:

- banco gerenciado, como PostgreSQL;
- storage externo para arquivos;
- broker compartilhado para WebSocket, como Redis;
- filas para tarefas pesadas;
- observabilidade centralizada;
- estrategia de migracao de SQLite para banco gerenciado.

## Principio de Seguranca

Escalar nao deve liberar permissao administrativa para visitantes. Controle do PC, dispositivos e automacoes sensiveis permanecem dependentes de autorizacao explicita e agente local.
