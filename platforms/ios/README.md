# ORION iOS

## Papel

Cliente companion planejado com Capacitor e a mesma interface web do ORION.

## Regras

- nao presumir backend Python embarcado;
- conectar somente a host pareado por HTTPS e WSS;
- solicitar permissoes nativas apenas quando necessarias;
- manter segredos fora da camada web;
- usar sandbox privado e Keychain quando o adapter existir;
- realizar build e assinatura em macOS com Xcode.

