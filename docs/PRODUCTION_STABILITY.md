# Orion Production Stability

## Objetivo

Manter o Orion estavel em Render, Docker, navegador e PWA mesmo com camadas visuais mais ricas.

## Checklist de Estabilidade

- Health check ativo em `/api/health`.
- Status consolidado em `/api/status`.
- WebSocket usa `ws`/`wss` conforme protocolo da pagina.
- Service worker possui cache versionado.
- Frontend usa fallback quando WebGL, GSAP, voz ou camera nao estiverem disponiveis.
- Animacoes pausam em aba oculta.
- Modo Performance reduz efeitos em mobile.
- Uploads e arquivos continuam usando allowlist.
- Comandos locais perigosos continuam bloqueados em cloud.

## Render Gratuito

O plano gratuito do Render pode:

- dormir apos inatividade;
- demorar para acordar;
- ter CPU/RAM limitados;
- reiniciar o processo em atualizacoes;
- nao ter armazenamento persistente confiavel para dados importantes.

Para testes publicos simples, Render gratuito e aceitavel. Para uso continuo com muitos usuarios, arquivos e memoria, usar plano pago ou VPS.

## Rotina de Smoke

1. Abrir `/`.
2. Confirmar que o PWA carrega.
3. Enviar `oi` no chat.
4. Confirmar WebSocket conectado.
5. Abrir Avatar Studio.
6. Abrir Cerebro Cosmico.
7. Abrir Arquivos.
8. Abrir Lord Dragons.
9. Verificar `/api/status`.
10. Verificar console sem erros criticos.
