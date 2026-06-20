# ORION Design System

## Objetivo

Definir uma linguagem visual reutilizavel para a PWA, clientes Capacitor e modulos
futuros do ORION. O sistema usa HTML semantico, CSS nativo e JavaScript pequeno para
temas. Nenhuma biblioteca visual externa e obrigatoria.

## Estrutura

```text
frontend/assets/
  css/
    tokens.css
    base.css
    components.css
    accessibility.css
    styles.css
  js/
    design-system.js
```

`styles.css` e o ponto unico de entrada. O Service Worker armazena cada camada para
preservar o shell offline.

## Principios

1. Usar tokens semanticos, nunca cores literais dentro de modulos.
2. Manter componentes compactos e previsiveis para uso recorrente.
3. Reservar paineis para superficies funcionais, sem aninhar cards decorativos.
4. Exibir estado por texto e cor; cor isolada nunca comunica informacao critica.
5. Preservar teclado, leitor de tela, contraste e ampliacao desde a fundacao.
6. Manter controles com altura estavel e pelo menos `48px` em telas de toque.
7. Respeitar reducao de movimento, inclusive na cena Three.js.

## Cores

Os nomes descrevem funcao, nao pigmento:

| Token | Uso |
| --- | --- |
| `--color-bg-canvas` | fundo global |
| `--color-surface-1` | paineis e superficies funcionais |
| `--color-surface-2` | estados ativos e superficies elevadas |
| `--color-border-default` | divisores e contornos |
| `--color-text-strong` | titulos e rotulos principais |
| `--color-text-default` | texto corrente |
| `--color-text-muted` | metadados auxiliares |
| `--color-action-primary` | acao principal e destaque de navegacao |
| `--color-action-secondary` | destaque secundario |
| `--color-status-success` | sucesso |
| `--color-status-warning` | alerta |
| `--color-status-danger` | erro ou acao destrutiva |
| `--color-focus-ring` | foco visivel |

## Tipografia

O ORION usa a pilha nativa do sistema para funcionar offline e preservar desempenho.

| Token | Tamanho | Uso |
| --- | --- | --- |
| `--font-size-xs` | `12px` | metadados |
| `--font-size-sm` | `14px` | detalhes compactos |
| `--font-size-md` | `16px` | corpo e controles |
| `--font-size-lg` | `20px` | titulos de painel |
| `--font-size-xl` | `24px` | secoes |
| `--font-size-2xl` | `26px` | cabecalho da aplicacao |
| `--font-size-display` | `48px` | fallback visual pontual |

Titulos internos permanecem compactos. Tamanho de fonte nao varia com largura de
viewport.

## Temas

| Tema | Aplicacao | Objetivo |
| --- | --- | --- |
| `dark` | `data-theme="dark"` | padrao da interface local |
| `light` | `data-theme="light"` | ambientes claros |
| `high-contrast` | `data-theme="high-contrast"` | contraste ampliado |

`frontend/assets/js/design-system.js` escolhe preferencia armazenada ou preferencia do
sistema operacional. A configuracao futura pode usar:

```js
import { setTheme } from "./design-system.js";

setTheme("high-contrast");
```

Nenhum tema novo pode remover foco visivel ou reduzir contraste de texto essencial.

## Componentes

| Componente | Classes | Uso |
| --- | --- | --- |
| Botao | `.button`, `.button--primary`, `.button--danger` | comandos textuais claros |
| Botao de icone | `.button.icon-button` | comando com simbolo familiar e tooltip |
| Navegacao | `.nav-list`, `.nav-link`, `.is-active` | secoes primarias |
| Campo | `.field` | entrada de texto, busca e formularios |
| Painel | `.panel`, `.scene-panel`, `.stack` | superficies funcionais |
| Cabecalho de painel | `.panel-heading` | titulo e metadado |
| Badge | `.badge` | estado curto nao critico |
| Alerta | `.alert`, `.alert--warning`, `.alert--danger` | feedback textual contextual |
| Abas | `.tabs`, `.tab` | alternancia entre visoes relacionadas |
| Toggle | `.switch` | configuracao binaria |
| Toolbar | `.toolbar` | agrupamento compacto de ferramentas |
| Onboarding | `.onboarding-dialog`, `.choice-card`, `.segmented-control` | primeira execucao acessivel |

Preferir icones Lucide quando a biblioteca visual for adicionada. Botao somente com
icone exige `aria-label` e tooltip. Comandos textuais como `Enviar` e `Instalar`
permanecem explicitos.

## Acessibilidade

Implementado na fundacao:

- skip link para conteudo principal;
- foco visivel global;
- rotulos de formulario associados;
- feed WebSocket anunciado como `role="log"`;
- `.sr-only` para contexto de leitor de tela;
- tema de alto contraste;
- suporte a `forced-colors`;
- controles maiores em ponteiro de toque;
- `prefers-reduced-motion` no CSS e na cena Three.js;
- perfil `data-profile="elderly"` com texto e controles ampliados;
- fallback textual quando WebGL falha.

## Regras Para Novos Modulos

1. Reutilizar componente existente antes de criar variante.
2. Usar tokens de cor e espacamento.
3. Fornecer nome acessivel para todo controle.
4. Manter navegacao completa por teclado.
5. Testar `dark`, `light`, `high-contrast` e ampliacao de texto.
6. Validar largura minima de `320px`.
7. Nao inserir dado nao confiavel com `innerHTML`.
