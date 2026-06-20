# Acesso Publico Opcional

Este guia explica como disponibilizar o Orion por um link publico HTTPS usando Cloudflare Tunnel, sem alterar o backend, o frontend, o WebSocket, o PWA ou qualquer modulo existente.

## Principios

- O Orion continua rodando localmente no Windows.
- O tunel apenas encaminha trafego HTTPS publico para `http://127.0.0.1:8000`.
- Nenhuma senha, token, chave ou dado pessoal deve ser colocado em arquivos do projeto.
- Compartilhe o link somente com pessoas autorizadas.
- Visitantes nunca devem receber permissoes administrativas.

## Requisitos

1. Orion funcionando localmente.
2. `cloudflared` instalado no Windows.
3. Rede local com acesso a internet.

Download oficial:

```text
https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
```

Depois de instalar, confirme no PowerShell:

```powershell
cloudflared --version
```

## 1. Iniciar o Orion normalmente

No PowerShell, dentro da pasta do projeto:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run_persistent.ps1
```

Ou, para desenvolvimento com reload:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run_dev.ps1
```

Confirme que o Orion abre localmente:

```text
http://127.0.0.1:8000/
```

## 2. Iniciar o Cloudflare Tunnel

Em outro terminal, execute:

```powershell
cloudflared tunnel --url http://127.0.0.1:8000
```

Ou use o arquivo opcional:

```powershell
.\start_public_tunnel.bat
```

Por padrao, o `.bat` aponta para:

```text
http://127.0.0.1:8000
```

Para apontar para outro host ou porta, defina a variavel antes de executar:

```powershell
$env:ORION_LOCAL_URL="http://127.0.0.1:8000"
.\start_public_tunnel.bat
```

## 3. Obter o link HTTPS publico

O Cloudflare Tunnel exibira um link parecido com:

```text
https://exemplo.trycloudflare.com
```

Esse link e temporario quando usado com `cloudflared tunnel --url`.

## 4. Compartilhar o link

Compartilhe o link HTTPS somente com usuarios autorizados.

Regras recomendadas:

- Administrador: acesso completo apenas com credenciais administrativas.
- Usuario comum: acesso conforme permissoes configuradas no Orion.
- Visitante: acesso limitado, nunca administrativo.

Importante: se o Orion estiver em modo local de desenvolvimento, trate o link como sensivel. Quem tiver o link podera tentar acessar a interface enquanto o tunel estiver ativo.

## 5. Encerrar o tunel

No terminal onde o Cloudflare Tunnel esta rodando, pressione:

```text
Ctrl+C
```

Depois disso, o link publico deixa de encaminhar para o Orion.

Para encerrar o Orion local, feche o terminal do servidor ou pressione `Ctrl+C` no processo correspondente.

## 6. Configurar dominio proprio futuramente

Para usar um dominio proprio, use um tunel nomeado do Cloudflare em vez do link temporario.

Fluxo geral:

```powershell
cloudflared tunnel login
cloudflared tunnel create orion
cloudflared tunnel route dns orion orion.seu-dominio.com
cloudflared tunnel run orion
```

Guarde credenciais e arquivos gerados pelo Cloudflare fora do controle de versao. Nao versionar tokens, certificados ou chaves.

## WebSocket e PWA

Cloudflare Tunnel encaminha HTTPS e WebSocket para o servidor local. O frontend do Orion usa `window.location.host` para conectar o WebSocket, entao o mesmo codigo funciona em:

- `http://127.0.0.1:8000`
- IP local da rede
- link HTTPS do Cloudflare Tunnel
- dominio proprio configurado futuramente

O PWA continua instalavel a partir do link HTTPS, sujeito as regras do navegador e do sistema operacional.

## Checklist de seguranca antes de compartilhar

- Orion iniciado em ambiente confiavel.
- Administrador usando senha forte.
- Visitantes sem permissao administrativa.
- Nenhum segredo colocado em arquivos do projeto.
- Link compartilhado apenas com pessoas autorizadas.
- Tunel encerrado quando nao estiver em uso.

