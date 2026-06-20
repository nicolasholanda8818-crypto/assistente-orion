# ORION Local Models

Este diretorio reserva a estrutura para metadados locais de modelos gerenciados pelo
ORION. Binarios grandes, pesos e credenciais nao pertencem ao pacote da fundacao.

O runtime atual apenas declara providers. Ele nao baixa, carrega ou executa modelos.

## Regras

- downloads exigem confirmacao administrativa futura;
- artefatos devem possuir origem, versao e checksum verificaveis;
- credenciais pertencem ao Vault e sao referenciadas por identificador logico;
- modelos locais de Ollama e LM Studio permanecem sob gestao dos respectivos processos;
- nenhum fallback remoto ocorre automaticamente.
