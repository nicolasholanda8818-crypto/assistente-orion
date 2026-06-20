# ORION Recovery Strategy

## Banco Corrompido

1. Colocar sistema em modo manutencao.
2. Preservar copia forense.
3. Executar verificacao SQLite.
4. Tentar recuperacao somente em copia.
5. Restaurar ultimo backup valido se necessario.
6. Reconciliar ChromaDB.
7. Registrar incidente.

## Arquivos Perdidos

1. Identificar escopo por manifesto.
2. Bloquear escrita conflitante.
3. Restaurar arquivos ausentes.
4. Validar hashes.
5. Atualizar indice relacional.
6. Registrar incidente.

## Atualizacao Falha

1. Interromper health check.
2. Iniciar rollback automatico.
3. Restaurar binarios e dados.
4. Limpar cache PWA incompatível.
5. Reiniciar versao anterior.
6. Validar health checks.
7. Exibir relatorio ao admin.

## Queda de Energia

1. Usar SQLite WAL.
2. Manter transacoes curtas.
3. Gravar arquivos temporarios antes de troca atomica.
4. Verificar jobs interrompidos no proximo startup.
5. Retomar apenas operacoes idempotentes.

## Falha de Modelo Local

1. Descarregar modelo.
2. Marcar integracao degradada.
3. Usar fallback permitido.
4. Manter Core, PWA e dados disponiveis.
5. Registrar diagnostico local.

## Exercicios

- restauracao completa trimestral;
- simulacao de update falho;
- simulacao de SQLite corrompido em copia;
- simulacao de job interrompido;
- verificacao de manifestos e hashes.

