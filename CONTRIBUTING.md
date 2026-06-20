# Contribuindo com o ORION

Obrigado pelo interesse em contribuir com o ORION. O projeto evolui de forma incremental: cada alteracao deve ter escopo claro, testes proporcionais ao risco e documentacao atualizada.

Antes de comecar, leia:

- `AGENTS.md`
- `ARCHITECTURE.md`
- `BACKLOG.md`
- `SECURITY.md`
- `PROJECT_STATUS.md`

## Como Contribuir

1. Escolha um ticket aprovado em `BACKLOG.md`.
2. Confirme que suas dependencias anteriores foram concluidas.
3. Crie uma branch com nome descritivo:

```text
feature/T0001-baseline
fix/T0002-health-check
docs/roadmap
```

4. Implemente somente o escopo do ticket.
5. Adicione ou atualize testes.
6. Execute as validacoes relevantes.
7. Atualize a documentacao afetada.
8. Crie um fragmento de changelog quando a alteracao for relevante ao usuario ou operador.
9. Abra uma proposta de alteracao com contexto, testes e riscos.

Nao misture refatoracoes amplas, funcionalidades novas e correcoes independentes na mesma contribuicao.

## Padrao da Proposta

Inclua:

- ticket relacionado;
- problema resolvido;
- arquivos alterados;
- decisoes tecnicas;
- como executar;
- como testar;
- criterios de aceitacao verificados;
- riscos conhecidos;
- capturas de tela quando houver mudanca visual;
- migracao e rollback quando houver alteracao de banco.

## Como Reportar Bugs

Antes de abrir um bug:

1. Consulte bugs existentes.
2. Confirme a versao do ORION.
3. Reproduza em uma instalacao limpa quando possivel.
4. Remova segredos e dados pessoais dos logs.

Inclua:

- titulo objetivo;
- versao do ORION;
- sistema operacional;
- navegador ou dispositivo;
- passos para reproduzir;
- comportamento esperado;
- comportamento observado;
- frequencia do erro;
- logs locais sanitizados;
- capturas de tela quando relevantes;
- impacto: baixo, medio, alto ou critico.

Nunca publique:

- senhas;
- tokens;
- chaves;
- arquivos pessoais;
- dados financeiros;
- dumps completos do banco;
- logs sem revisao.

Consulte `SECRETS_POLICY.md`. Testes devem gerar credenciais em runtime e
`.env.example` nunca recebe valor sensivel.

Falhas de seguranca devem ser reportadas de forma privada ao responsavel pelo projeto.

## Como Enviar Melhorias

Melhorias devem começar como proposta antes da implementacao.

Descreva:

- problema do usuario;
- resultado desejado;
- modulos afetados;
- alternativas consideradas;
- impacto em seguranca;
- impacto em performance;
- impacto em banco e migracoes;
- impacto em Windows, PWA, Android e iPhone;
- sugestao de ticket isolado e verificavel.

Melhorias aprovadas entram em `BACKLOG.md` antes de receber codigo.

## Como Criar Plugins

Plugins estendem o ORION sem alterar diretamente o Core.

Leia `PLUGIN_SYSTEM.md` antes de criar um plugin.

Estrutura planejada:

```text
plugins/
  sdk/
  marketplace/
  installed/
  quarantine/
```

Todo plugin deve possuir manifesto com:

- identificador unico;
- nome;
- versao;
- versao minima compativel do ORION;
- entrypoint;
- descricao;
- autor;
- permissoes solicitadas;
- comandos expostos;
- eventos consumidos;
- eventos publicados;
- checksum;
- assinatura digital quando exigida.

Regras obrigatorias:

1. Solicitar somente permissoes necessarias.
2. Nao acessar internals de outros modulos.
3. Comunicar-se pela API interna.
4. Implementar lifecycle `load`, `start`, `stop` e `unload`.
5. Liberar recursos no `unload`.
6. Nao registrar segredos.
7. Falhar sem derrubar o Core.
8. Suportar rollback quando atualizado.
9. Ser testavel isoladamente.
10. Exigir aprovacao administrativa para instalacao e novas permissoes.

O SDK e o marketplace local serao implementados nos tickets `T0033` e `T0034`.

## Banco de Dados

Alteracoes de banco devem:

- usar SQLAlchemy;
- incluir migration Alembic;
- manter compatibilidade com SQLite;
- possuir seed idempotente quando necessario;
- documentar upgrade e rollback;
- atualizar `DATABASE.md`;
- incluir teste de migracao.

## Seguranca

Contribuicoes devem respeitar:

- menor privilegio;
- validacao de entrada;
- SQL parametrizado por SQLAlchemy;
- sanitizacao no frontend;
- rate limit em superficies expostas;
- nenhum segredo em texto puro;
- nenhuma telemetria externa sem autorizacao;
- confirmacao administrativa para operacoes destrutivas.

Consulte `SECURITY.md`.

## Testes

Execute os testes relacionados ao ticket. Componentes criticos exigem testes negativos.

Consulte `docs/TEST_STRATEGY.md`.

Meta do backend:

```text
coverage >= 80%
```

Componentes criticos:

```text
coverage >= 90% ou justificativa documentada
```

Antes de enviar uma alteracao, execute no Windows:

```powershell
.\scripts\run_ci.ps1
```

O mesmo conjunto de gates sera executado automaticamente pelo GitHub Actions.

## Documentacao

Atualize quando aplicavel:

- `PROJECT_STATUS.md`
- `TODO.md`
- `BACKLOG.md`
- `ARCHITECTURE.md`
- `DATABASE.md`
- `SECURITY.md`
- `ROADMAP.md`
- documentos em `docs/`

## Changelog

Para alteracoes relevantes, crie um fragmento:

```powershell
python scripts/generate_changelog.py --new added --summary "Nova capacidade local" --ticket T0001
```

Use `changed`, `deprecated`, `removed`, `fixed` ou `security` quando forem categorias
mais adequadas. Nunca inclua segredo, dado pessoal, dump ou payload sensivel.

## Checklist

- [ ] Ticket aprovado e escopo isolado.
- [ ] Implementacao funcional, sem pseudocodigo.
- [ ] Sem `TODO` vazio.
- [ ] Testes adicionados ou atualizados.
- [ ] Validacao manual documentada.
- [ ] Seguranca revisada.
- [ ] Performance considerada.
- [ ] Banco e migrations revisados.
- [ ] Compatibilidade Windows mantida.
- [ ] Compatibilidade PWA considerada.
- [ ] Documentacao atualizada.
- [ ] Fragmento de changelog criado quando aplicavel.
