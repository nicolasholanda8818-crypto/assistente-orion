# Orion Voice System

Data: 2026-06-24

## Objetivo

Melhorar a voz em portugues do Brasil preservando fallback pelo navegador.

## Modos

- `conversation`
- `assistant`
- `teacher`
- `consultant`
- `calm`
- `animated`
- `grandma`
- `narrator`

## Voz Masculina BR

O frontend prioriza vozes `pt-BR` e aumenta a pontuacao de vozes com indicios masculinos, como Antonio, Daniel, Ricardo, `male` ou `masculin`, quando o navegador disponibiliza essas vozes.

Se nenhuma voz masculina estiver disponivel, o Orion usa a melhor voz `pt-BR` local. Se nenhuma voz `pt-BR` existir, usa o fallback do navegador.

## Eventos Seguros

O `voice-engine.js` emite eventos sem conteudo sensivel:

- `selected_voice`
- `voice_start`
- `voice_end`
- `speech_error`

Esses eventos ajudam testes e diagnostico sem registrar o texto falado.
