# Avatar GLB/VRM Real - Plano

## Objetivo

Preparar a evolucao futura do avatar real GLB/VRM sem remover o avatar procedural atual.

## Estrutura Recomendada

- `frontend/assets/models/avatar-manifest.json`: manifesto de modelos habilitados.
- `models/avatar/`: modelos locais grandes fora do bundle publico quando necessario.
- `frontend/assets/js/avatar-3d.js`: carregador progressivo com GLTFLoader e VRM.
- Avatar procedural HTML/CSS: fallback obrigatorio.

## Etapas Futuras

1. Definir contrato de manifesto por skin.
2. Adicionar modelo GLB leve com licenca propria.
3. Mapear animacoes idle, fala, ouvindo, pensando e pesquisando.
4. Implementar lip sync basico por intensidade de fala.
5. Adicionar troca de roupa via materiais ou variantes.
6. Testar mobile em modo Performance.

## Regras de Seguranca Visual

- Nao copiar personagens oficiais.
- Nao depender de asset externo obrigatorio.
- Nao impedir chat, PWA ou WebSocket se o modelo falhar.
- Limitar tamanho de modelos para deploy cloud.
