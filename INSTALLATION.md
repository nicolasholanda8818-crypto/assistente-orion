# ORION Installation Strategy

## Windows

O instalador profissional sera entregue em ticket proprio. Ele devera:

1. validar Python suportado;
2. criar ambiente virtual;
3. instalar dependencias verificadas;
4. criar diretorios locais;
5. inicializar banco;
6. verificar modelos opcionais;
7. executar health check;
8. oferecer atalho de inicializacao.

## Linux

Suporte planejado como host desktop para backend e PWA com scripts equivalentes.
Integracoes de controle do PC devem usar adapter separado.

## macOS

Suporte planejado como host desktop para backend e PWA. O instalador deve usar
diretorios privados do usuario e adapters especificos para Keychain, notificacoes e
controle permitido do sistema.

## Android

- PWA instalavel pelo navegador compativel.
- Pacote Capacitor companion em fase posterior.
- Backend FastAPI permanece em host desktop pareado no baseline.
- Permissoes declaradas apenas quando usadas.

## iPhone

- PWA instalavel por Safari com "Adicionar a Tela de Inicio".
- Pacote Capacitor companion depende de macOS e Xcode.
- Backend FastAPI permanece em host desktop pareado no baseline.
- Testar limites de Service Worker e permissoes iOS.

## Web

- PWA e interface compartilhada.
- `localhost` permanece o modo padrao.
- Acesso por outro dispositivo exige host pareado, HTTPS, WSS e autenticacao.

## Rede Local

- bind configuravel;
- firewall documentado;
- TLS recomendado fora de localhost;
- descoberta multiplayer opt-in.

Consulte `PLATFORM_ARCHITECTURE.md`.

## Cloudflare Tunnel

Opcional e desabilitado por padrao. Ativacao exige decisao administrativa, HTTPS e revisao de dados expostos.
