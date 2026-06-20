# ORION 0.1.0-rc.1 Performance Report

## Escopo

Benchmark local isolado executado com armazenamento temporario em `.sandbox-tmp`,
SQLite limpo por rodada e `TestClient` do FastAPI. O objetivo e detectar regressao na
fundacao atual sem ativar modulos futuros.

## Resultado

Status: `PASSED`

| Metrica | Iteracoes | Media | p95 | Limite | Resultado |
| --- | --- | --- | --- | --- | --- |
| `database_startup` | `5` | `59.018 ms` | `63.015 ms` | `300 ms` | aprovado |
| `rest_health` | `150` | `3.598 ms` | `8.509 ms` | `30 ms` | aprovado |
| `rest_status` | `75` | `6.985 ms` | `12.534 ms` | `75 ms` | aprovado |
| `brain_process` | `75` | `5.521 ms` | `7.668 ms` | `75 ms` | aprovado |
| `websocket_roundtrip` | `50` | `14.677 ms` | `19.095 ms` | `75 ms` | aprovado |
| `tracemalloc_peak_mib` | processo | `1.561 MiB` | n/a | `64 MiB` | aprovado |

## Metricas Adiadas

- Busca vetorial: depende de `T0013`.
- Carga de cena Three.js: depende de `T0028`.
- Jobs de backup: dependem de `T0035`.

## Reexecucao

```powershell
python scripts/run_performance.py --output docs/releases/0.1.0-rc.1/performance.json --fail-on-threshold
```
