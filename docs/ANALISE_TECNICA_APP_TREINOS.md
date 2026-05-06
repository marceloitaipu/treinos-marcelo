# Análise Técnica — App Treinos Marcelo
**Data:** 06/05/2026  
**Versão analisada:** v2.0 (index.html — 2195 linhas)  
**Ambiente:** Firebase Hosting · treinos-marcelo-app.web.app  
**Repositório:** github.com/marceloitaipu/treinos-marcelo

---

## 1. Estrutura Atual do Projeto

```
APP_Treinos/
├── index.html                ← ARQUIVO PRINCIPAL — app inteiro (HTML + CSS + JS inline)
├── sw.js                     ← Service Worker v3.5.1
├── manifest-mobile.json      ← Manifest PWA (referenciado no <head>)
├── manifest.json             ← Manifest alternativo (não referenciado no <head>)
├── firebase.json             ← Configuração do Firebase Hosting
├── _redirects                ← Redirecionamentos Netlify (legado, não usado)
├── 404.html                  ← Página de erro
├── marcelo-7-tipos-final.html← Cópia legada de desenvolvimento (não deployada)
├── treinos-marcelo-v3.5.1-backup-2026-05-05.json ← Backup de dados do usuário
├── netlify.toml              ← Configuração Netlify (legado)
├── DEPLOY-FINAL/             ← Pasta de deploy legada (não usada)
├── app_fixed/                ← Pasta legada (não usada)
└── docs/                     ← Documentação técnica (esta pasta)
```

**Arquitetura:** Single-file SPA sem build system, sem framework, sem módulos ES.  
Todo HTML + CSS + JavaScript está inline em `index.html`.  
Dois blocos `<script>`: o primeiro define apenas `esc()`, o segundo contém toda a lógica.

---

## 2. Lista de Funções Existentes

### 2.1 Utilitários
| Função | Descrição |
|--------|-----------|
| `esc(str)` | Escapa HTML — previne XSS em toda interpolação de strings |
| `gerarId()` | Gera ID único via `Date.now().toString(36) + random` |
| `garantirIds(lista)` | Garante que todos os tipos e treinos tenham `id` |
| `obterIds(tipoIndex, treinoIndex)` | Retorna `{tipoId, treinoId}` para composição de chaves |
| `migrarChavesLegadas()` | Migra chaves `peso_0_1_2` → `peso_<tipoId>_<treinoId>_2` |
| `normalizarExercicios(lista)` | Normaliza exercícios: aceita `string` ou `{nome: ...}` |

### 2.2 Inicialização
| Função | Descrição |
|--------|-----------|
| `DOMContentLoaded` handler | Orquestra o boot: carrega dados, garante IDs, migra, renderiza |
| `carregarTreinosSalvos()` | Lê localStorage, merge com defaults, suporta 3 formatos legados |
| `salvarTodosOsTreinos()` | Serializa `todosTipos` em `localStorage.marceloTreinos` |

### 2.3 Navegação Principal
| Função | Descrição |
|--------|-----------|
| `carregarTreinos()` | Renderiza botões de tipo + cards do tipo ativo |
| `selecionarTipo(index)` | Troca tipo ativo e re-renderiza cards |
| `carregarTreinosTipo(tipoIndex)` | Renderiza cards de treino de um tipo, com % de progresso |

### 2.4 Modal de Treino (Execução)
| Função | Descrição |
|--------|-----------|
| `iniciarTreino(index)` | Abre modal com timer + lista de exercícios com peso/séries/conclusão |
| `fecharTreinoModal(tipoIndex, treinoIndex)` | Para timer, registra histórico, fecha modal, atualiza cards |
| `fecharModalTreinoComConfirmacao(...)` | Fecha com `confirm()` de salvar |
| `zerarProgressoTreino(tipoIndex, treinoIndex)` | Remove todas as chaves de progresso do treino |
| `fecharModal()` | Fecha qualquer modal aberto, para timer |

### 2.5 Controle de Peso, Séries e Conclusão
| Função | Descrição |
|--------|-----------|
| `salvarPeso(tipoIndex, treinoIndex, exIndex, peso)` | Valida e persiste peso em localStorage |
| `ajustarSeries(tipoIndex, treinoIndex, exIndex, delta)` | +/- séries, auto-inicia timer ao adicionar |
| `toggleConcluido(tipoIndex, treinoIndex, exIndex, button)` | Marca/desmarca exercício concluído |

### 2.6 Timer de Descanso
| Função | Descrição |
|--------|-----------|
| `criarTimerHTML(descansoSugerido)` | Retorna HTML string do timer |
| `definirTimer()` | Lê input e redefine `timerTotal`/`timerAtual` |
| `toggleTimer()` | Play/Pause |
| `iniciarTimer()` | Inicia `setInterval` de 1 segundo |
| `pararTimer()` | Para `setInterval` |
| `resetarTimer()` | Reseta para `timerTotal` |
| `atualizarDisplayTimer()` | Atualiza texto + barra de progresso + cor |
| `timerConcluido()` | Notificação + vibração + som (Web Audio API) |
| `tocarSomTimer()` | Bipes via `AudioContext` |

### 2.7 Modal de Edição de Treino
| Função | Descrição |
|--------|-----------|
| `editarTreino(index)` | Abre modal de edição |
| `criarItemExercicioEdicao(nome, i)` | Cria elemento DOM de exercício editável |
| `removerExercicio(itemDiv)` | Remove exercício da lista (mínimo 1) |
| `adicionarExercicio()` | Adiciona novo exercício ao formulário |
| `salvarEdicaoTreino(index)` | Valida, salva e re-renderiza |

### 2.8 Histórico
| Função | Descrição |
|--------|-----------|
| `registrarHistorico(tipoIndex, treinoIndex, nome, exercicios)` | Insere entrada no topo, limita a 50 |
| `verHistorico()` | Abre modal com filtros por tipo |
| `filtrarHistorico(filtroTipo)` | Filtra e renderiza lista de histórico |
| `limparHistorico()` | Apaga `marceloHistorico` do localStorage |

### 2.9 Backup e Importação
| Função | Descrição |
|--------|-----------|
| `exportarBackup()` | Gera JSON com treinos + histórico + pesos e baixa arquivo |
| `importarBackup()` | Aciona `<input type="file">` oculto |
| `processarImportacao(event)` | Lê arquivo JSON, suporta 3 formatos, restaura dados |

### 2.10 Gestão de Tipos e Treinos
| Função | Descrição |
|--------|-----------|
| `novoTipoTreino()` | Abre modal para criar tipo |
| `criarNovoTipo()` | Valida e cria tipo com treino inicial |
| `deletarTipoAtual()` | Remove tipo + todas as chaves de progresso |
| `novoTreinoNoTipo()` | Abre modal para criar treino dentro do tipo ativo |
| `salvarNovoTreino(letra, classe)` | Salva novo treino no tipo ativo |

### 2.11 Notificações
| Função | Descrição |
|--------|-----------|
| `mostrarNotificacao(mensagem, tipo)` | Toast temporário (3s), tipos: `success`, `warning`, `error` |

---

## 3. Modelo Atual de Dados

### 3.1 Dados em Memória

```javascript
// Variáveis globais
let tipoAtualIndex    = 0;         // índice do tipo selecionado
let modalTreinoAberto = null;      // null | { tipoIndex, treinoIndex }

// Timer
let timerInterval = null;
let timerTotal    = 60;
let timerAtual    = 60;
let timerRodando  = false;

// Array principal (const — mutável via push/splice/length=0)
const todosTipos = [ /* 7 tipos hardcoded, sobrescritos pelo localStorage */ ]
```

### 3.2 Estrutura de um Tipo

```json
{
  "id": "lf3abc1k2",
  "nome": "ABCD Marcelo",
  "treinos": [ /* array de treinos */ ]
}
```

### 3.3 Estrutura de um Treino

```json
{
  "id": "lf3xyz9m4",
  "letra": "A",
  "nome": "Treino A - Peito, Ombros e Tríceps",
  "descricao": "8 exercícios",
  "classe": "treino-a",
  "exercicios": ["Supino reto barra ou maq", "Voador", "..."]
}
```
> **Nota:** `exercicios` é um array de strings simples. Não há estrutura por série.

### 3.4 Chaves do localStorage

| Chave | Tipo | Descrição |
|-------|------|-----------|
| `marceloTreinos` | JSON string | Array de tipos (estrutura acima) |
| `marceloHistorico` | JSON string | Array de entradas de histórico (máx 50) |
| `peso_<tipoId>_<treinoId>_<exIdx>` | string numérica | Peso em kg do exercício |
| `series_<tipoId>_<treinoId>_<exIdx>` | string numérica | Número de séries feitas |
| `concluido_<tipoId>_<treinoId>_<exIdx>` | `"true"` | Exercício marcado como concluído |
| `marceloChavesMigradas` | `"v2"` | Flag: migração de chaves já executada |

**Chaves legadas** (ainda suportadas na leitura, migradas automaticamente):
- `marceloTreinosV2`, `treinos` — formatos antigos de treinos
- `historicoTreinos` — histórico legado
- `peso_0_1_2` — chaves indexadas por número (migradas para IDs)

### 3.5 Estrutura de uma entrada de Histórico

```json
{
  "data": "06/05/2026, 14:30:00",
  "tipo": "ABCD Marcelo",
  "nome": "Treino A - Peito, Ombros e Tríceps",
  "exercicios": ["Supino reto barra ou maq (80kg)", "Voador", "..."]
}
```

---

## 4. Problemas Técnicos Encontrados

### 🔴 Crítico

**P1 — `manifest-mobile.json` aponta para arquivo errado**  
`"start_url": "marcelo-7-tipos-final.html"` — ao instalar o PWA, o browser abre a versão de desenvolvimento/legada, não o app deployado. Deveria ser `"/"`.

**P2 — Service Worker não está registrado no app**  
`index.html` não contém nenhum código de `navigator.serviceWorker.register(...)`. O SW (sw.js) existe mas nunca é ativado, tornando o app incapaz de funcionar offline.

### 🟠 Alto

**P3 — `CACHE_NAME` com `Date.now()` no Service Worker**  
```js
const CACHE_NAME = `tm-${CACHE_VERSION}-${Date.now()}`;
```
O `Date.now()` é avaliado no momento do *parsing* do SW, não da instalação. Cada vez que o SW é recarregado, gera um cache diferente — caches antigos nunca são reaproveitados e a estratégia de limpeza `caches.filter(k => k !== CACHE_NAME)` apaga caches válidos desnecessariamente.

**P4 — SW cacheia URLs com `?v=timestamp` mas serve URLs limpas**  
```js
const urlsComTimestamp = urlsToCache.map(url => `${url}?v=${Date.now()}`);
cache.addAll(urlsComTimestamp);
```
Requisições chegam como `/index.html`, mas o cache só tem `/index.html?v=1234567`. O `caches.match(req)` nunca bate e o fallback offline nunca funciona.

**P5 — Filtro de histórico quebra com caracteres especiais no nome do tipo**  
O botão de filtro renderiza `onclick="filtrarHistorico('${esc(t)}')"` — se o nome do tipo contiver `&`, `<` ou `>`, o valor passado será a versão escapada (`&amp;` etc.), mas `h.tipo` no histórico contém o valor original. A comparação `h.tipo === filtroTipo` falha silenciosamente.

### 🟡 Médio

**P6 — `theme_color` inconsistente entre 3 locais**  
- `<meta name="theme-color" content="#0a0a1a">` (index.html)  
- `"theme_color": "#1a1a1a"` (manifest-mobile.json)  
- CSS var `--bg-base: #0a0716`  
Três valores diferentes para o fundo. O manifest está com a cor do tema antigo (neon escuro).

**P7 — `manifest.json` existe mas não é referenciado**  
O `<head>` linka `manifest-mobile.json`. O `manifest.json` no root é ignorado pelo app (embora o Firebase sirva ele em `/manifest.json`). Pode causar confusão em auditorias PWA.

**P8 — Histórico não salva pesos por série, apenas o último peso registrado**  
`registrarHistorico` lê `peso_<id>` — que é o único peso salvo por exercício, não por série. Se o usuário fez 4 séries com pesos progressivos, apenas o último valor é registrado.

**P9 — `todosTipos` declarado como `const` mas sofre mutação via `length = 0`**  
```js
todosTipos.length = 0; // na importação
```
Funciona em JavaScript, mas é um antipadrão. Futuramente pode confundir desenvolvedores ou linters.

**P10 — Arquivos legados ainda no diretório raiz**  
`marcelo-7-tipos-final.html`, `_redirects`, `netlify.toml`, `app_fixed/`, `DEPLOY-FINAL/` nunca são acessados, mas poluem o projeto e aumentam o volume do deploy (Firebase faz upload de 78 arquivos).

### 🟢 Baixo

**P11 — Dois blocos `<script>` separados sem motivo**  
`esc()` está num bloco separado. Sem impacto funcional, mas é ruído estrutural.

**P12 — `novoTreino-nome` usa hífen no ID de elemento**  
Funciona com `getElementById`, mas é inconsistente com o padrão `camelCase` e `snake_case` dos demais IDs.

**P13 — Histórico limitado a 50 sem aviso ao usuário**  
Registros antigos são descartados silenciosamente.

**P14 — Sem indicador visual de modo offline**  
Sem SW funcional e sem listener de `online`/`offline`, o usuário não sabe quando está sem conexão.

---

## 5. Riscos de Alteração

| Área | Risco | Mitigação |
|------|-------|-----------|
| **Chaves do localStorage** | Qualquer mudança na geração de IDs ou no formato das chaves pode perder pesos/séries salvos | Sempre usar `obterIds()` · nunca hardcode de índices |
| **`todosTipos` array** | Reordenar ou remover itens default pode desalinhar dados de usuários com localStorage baseado em índice antigo | `migrarChavesLegadas()` já protege — mas não alterar a ordem dos 7 tipos |
| **`normalizarExercicios()`** | Toca em todos os exercícios ao carregar — qualquer bug aqui apaga dados | A função só lê `.nome` de objetos, não remove strings → baixo risco |
| **`processarImportacao()`** | Limpeza total do localStorage antes de restaurar — se o JSON estiver corrompido parcialmente, dados são perdidos | Já existe validação mínima · adicionar snapshot antes da limpeza |
| **IDs de elementos DOM** | IDs como `pesoInput_${i}`, `serieCount_${i}` são construídos por índice — se dois treinos rodarem juntos (impossível hoje) haverá conflito | N/A — app é single-modal |
| **`fecharModal()`** | Remove todos os `.modal-overlay` do DOM — se houver nested modais futuros, vai fechar todos | Adaptar antes de adicionar modais aninhados |
| **Service Worker** | Ao ativar o SW corretamente (P2), a primeira instalação pode servir versão cacheada desatualizada | Usar `skipWaiting` + `clients.claim` (já no SW) |

---

## 6. Plano de Implementação por Fases

### Fase 0 — Pré-condição: Projeto Preparado *(esta fase)*
> Sem novas features. Apenas correções de segurança e estabilidade.

- [ ] Corrigir `start_url` no `manifest-mobile.json` → `"/"`
- [ ] Sincronizar `theme_color` e `background_color` no manifest com a paleta atual (`#0a0716`)
- [ ] Adicionar registro do Service Worker em `index.html`
- [ ] Corrigir `CACHE_NAME` no `sw.js` (remover `Date.now()`, usar só versão)
- [ ] Corrigir caching de URLs no SW (não adicionar `?v=` às URLs cacheadas)
- [ ] Corrigir P5: filtro de histórico com caracteres especiais
- [ ] Adicionar entrada no `firebase.json` para ignorar arquivos legados desnecessários

---

### Fase 1 — Funcionalidades de Alta Demanda *(próxima sprint)*
> Melhorias sem risco de quebrar dados existentes.

- **Timer por exercício**: salvar tempo de descanso preferido por exercício (`timer_<tipoId>_<treinoId>_<exIdx>`)
- **Notas por exercício**: campo de texto livre salvo em localStorage
- **Indicador offline**: banner quando `navigator.onLine === false`
- **Confirmação ao fechar browser com treino ativo**: listener `beforeunload`
- **Histórico com número de séries**: incluir `series` no objeto salvo em `registrarHistorico`

---

### Fase 2 — Evolução de Dados *(médio prazo)*
> Requer atenção a compatibilidade retroativa.

- **Progressão de pesos por série**: trocar `exercicios: string[]` por `exercicios: { nome, series: [{peso, reps}] }[]`
  - **ATENÇÃO:** Requer migração de dados — usar `normalizarExercicios` estendida
- **Estatísticas de volume**: cálculo de volume (peso × séries) por treino
- **Gráfico simples de evolução**: usando Canvas ou SVG inline
- **Importação de outros formatos** (planilha CSV)

---

### Fase 3 — Refatoração de Arquitetura *(longo prazo)*
> Opcional — somente se o projeto crescer além do single-file.

- Separar CSS em arquivo externo `styles.css`
- Separar JS em módulos ES (`data.js`, `timer.js`, `ui.js`, `storage.js`)
- Adicionar ícones PWA reais (PNG 192x192 e 512x512)
- Adicionar `robots.txt` para bloquear indexação (app pessoal)
- Considerar IndexedDB para dados maiores (histórico > 50 entradas)

---

## Apêndice — Estado Atual dos 7 Tipos de Treino

| # | Nome | Nº de Treinos |
|---|------|---------------|
| 0 | ABCD Marcelo | 4 (A, B, C, D) |
| 1 | Treino Jacke | 5 (A, B, C, D, E) |
| 2 | ABC Jacke | 3 (A, B, C) |
| 3 | ABCD Chatgpt | 4 (A, B, C, D) |
| 4 | ABC do Zanca | 3 (A, B, C) |
| 5 | ABC Pacho | 3 (A, B, C) |
| 6 | ABDCE | 5 (A, B, C, D, E) |

**Total:** 27 treinos · ~185 exercícios

---

*Relatório gerado por análise estática completa de index.html (2195 linhas), sw.js, manifest-mobile.json e firebase.json.*
