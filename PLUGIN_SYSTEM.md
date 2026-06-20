# ORION Plugin System

## Objetivo

Permitir extensoes locais sem comprometer estabilidade ou seguranca do Core.

## Estrutura Planejada

```text
plugins/
  sdk/
  marketplace/
  installed/
  quarantine/
```

## Manifesto

Campos minimos:

- id;
- nome;
- versao;
- versao minima do ORION;
- entrypoint;
- permissoes;
- assinatura;
- checksum;
- autor;
- descricao;
- comandos;
- eventos consumidos;
- eventos publicados.

## Permissoes

Categorias:

- leitura de configuracao;
- leitura/escrita de arquivo;
- rede;
- memoria;
- notificacoes;
- voz;
- camera;
- controle do PC;
- administracao.

Padrao: negar.

## Instalacao

1. baixar ou selecionar pacote;
2. validar assinatura e checksum;
3. exibir permissoes;
4. solicitar aprovacao admin;
5. mover para staging;
6. executar validacao;
7. registrar;
8. ativar;
9. auditar.

## Hot Reload

- ciclo `load`, `start`, `stop`, `unload`;
- timeout;
- cleanup obrigatorio;
- rollback para versao anterior;
- falha de plugin nao derruba o Core;
- nenhuma permissao adicional sem nova aprovacao.

