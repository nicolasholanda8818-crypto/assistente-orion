# ORION Update Strategy

## Regra Fundamental

ORION nunca atualiza sem confirmacao explicita de administrador.

## Fontes Permitidas

- repositorio ou canal configurado pelo admin;
- pacote assinado;
- transporte HTTPS;
- manifesto de versao verificavel.

## Manifesto

Campos minimos:

- versao atual;
- versao alvo;
- canal;
- checksum SHA-256;
- assinatura;
- tamanho;
- URL;
- changelog;
- migracoes;
- versao minima suportada;
- plano de rollback.

O changelog exibido em atualizacoes deve ser derivado do artefato gerado
`CHANGELOG.md`. Fragmentos estruturados ficam em `changelog/entries`.

## Fluxo

1. Verificar versao sem baixar pacote completo.
2. Exibir changelog, riscos e tamanho.
3. Solicitar confirmacao admin.
4. Baixar em staging.
5. Validar assinatura e checksum.
6. Executar backup automatico.
7. Validar espaco em disco e pre-condicoes.
8. Aplicar atualizacao controlada.
9. Executar migracoes.
10. Reiniciar de forma controlada.
11. Rodar health checks.
12. Concluir ou iniciar rollback.

## Rollback

Rollback deve restaurar:

- binarios;
- dependencias;
- SQLite;
- ChromaDB;
- configuracoes;
- plugins;
- service worker/cache quando necessario.

## PWA

- Service Worker usa versao de cache.
- Cache antigo so e removido apos ativacao segura.
- Frontend informa quando existe nova versao.
- Usuario escolhe quando recarregar.

## Auditoria

Registrar:

- quem aprovou;
- versao anterior;
- versao alvo;
- hash;
- backup associado;
- resultado;
- rollback;
- tempos.
