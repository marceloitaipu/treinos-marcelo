# Controle Detalhado por Série

## Visão Geral

Feature implementada para registrar **peso e repetições individuais por série** em cada exercício do treino, substituindo o controle simplificado (peso único + contador de séries).

---

## Modelo de Dados

### Nova chave localStorage

```
sets_<tipoId>_<treinoId>_<exercicioIdx>
```

**Formato (array JSON):**
```json
[
  { "weight": 28.0, "reps": 12, "completed": true },
  { "weight": 30.0, "reps": 10, "completed": true },
  { "weight": 30.0, "reps":  8, "completed": false }
]
```

### Migração de dados legados

Ao abrir um treino, se existirem as chaves antigas:
- `peso_<tipoId>_<treinoId>_N` → peso da série 1
- `series_<tipoId>_<treinoId>_N` → número de séries a criar
- `concluido_<tipoId>_<treinoId>_N` → marca a primeira série como concluída

As chaves legadas **não são apagadas** para compatibilidade com backups antigos.

---

## Arquivos Modificados / Criados

| Arquivo | Status | Mudanças |
|---------|--------|----------|
| `js/series.js` | ✅ Criado | Módulo completo de controle por série |
| `js/treino-session.js` | ✅ Atualizado | `iniciarTreino`, `fecharTreinoModal`, `zerarProgressoTreino` reescritos |
| `js/historico.js` | ✅ Atualizado | Salva `exerciciosSeries` e exibe séries no histórico |
| `js/treinos.js` | ✅ Atualizado | Progress badge usa `sets_` além de `concluido_` |
| `js/utils.js` | ✅ Corrigido | Removido `</script>` espúrio na linha 23 |
| `css/style.css` | ✅ Atualizado | Adicionadas ~210 linhas de CSS para UI das séries |
| `index.html` | ✅ Atualizado | Adicionado `<script src="js/series.js">` |
| `sw.js` | ✅ Atualizado | `v5.0.0`, `/js/series.js` adicionado ao cache |

---

## API Pública de `js/series.js`

### Storage
| Função | Descrição |
|--------|-----------|
| `loadSets(tipoId, treinoId, exercicioIdx)` | Carrega séries; migra dados legados automaticamente |
| `saveSets(tipoId, treinoId, exercicioIdx, sets)` | Persiste séries |
| `clearSets(tipoId, treinoId, exercicioIdx)` | Remove todas as chaves (nova + legadas) |

### Cálculo
| Função | Descrição |
|--------|-----------|
| `calcSetVolume(set)` | `weight × reps` de uma série |
| `calcExerciseSummary(sets)` | `{ completedCount, totalSets, totalReps, volume }` |
| `formatSetVol(set)` | String formatada do volume (ex: `"336 kg"`) |

### Renderização
| Função | Descrição |
|--------|-----------|
| `renderExercicioComSeries(nome, idx, tipoIdx, treinoIdx)` | Retorna `div.exercicio-item` completo |
| `createSetRow(tipoIdx, treinoIdx, exIdx, setIdx, set)` | Retorna `div.set-row` |

### Event Handlers
| Função | Descrição |
|--------|-----------|
| `onSetChange(tipoIdx, treinoIdx, exIdx, setIdx, field, value)` | Atualiza peso ou reps |
| `toggleSerieConcluida(tipoIdx, treinoIdx, exIdx, setIdx)` | Toggle concluída + inicia timer |
| `toggleExercicioConcluido(tipoIdx, treinoIdx, exIdx)` | Conclui/desconclui todas as séries |
| `adicionarSerie(tipoIdx, treinoIdx, exIdx)` | Adiciona nova série (copia última) |
| `removerSerie(tipoIdx, treinoIdx, exIdx, setIdx)` | Remove série (mínimo 1) |
| `copiarPesoAnterior(tipoIdx, treinoIdx, exIdx, setIdx)` | Copia peso+reps da série anterior |
| `copiarUltimoTreino(tipoIdx, treinoIdx, exIdx, nome)` | Copia séries do último treino |

### Histórico
| Função | Descrição |
|--------|-----------|
| `getLastSetsForExercise(exNome, treinoNome)` | Busca séries do último treino no histórico |
| `coletarDadosSeries(tipoIdx, treinoIdx, exercicios)` | Coleta todas as séries para salvar |

---

## UI por Exercício

```
┌─────────────────────────────────────────────┐
│ Supino Inclinado Halteres     [Concluir]    │
│                                             │
│  1  [28 ] kg  [12] — 336 kg  [✓] [×]      │
│  2  [30 ] kg [↑][10] — 300 kg [✓] [×]     │
│  3  [30 ] kg [↑][ 8] —  —    [ ] [×]      │
│                                             │
│  [+ Série]  [📋 Último treino]             │
│  2/3 séries • 22 reps • 636 kg vol.        │
└─────────────────────────────────────────────┘
```

- **`↑`** — copia peso+reps da série anterior (aparece a partir da série 2)
- **`✓`** — marca série como concluída → inicia timer de descanso automaticamente
- **`×`** — remove série (mínimo 1 por exercício)
- **Concluir** — marca/desmarca todas as séries de uma vez
- **Resumo** — mostra séries concluídas, total de reps e volume calculado

---

## Integração com Histórico

**Formato enriquecido salvo em `marceloHistorico`:**
```json
{
  "data": "06/05/2026, 19:30:00",
  "tipo": "Tipo A",
  "nome": "Treino A1 - Peito",
  "exercicios": ["Supino (3x30kg · 30reps)"],
  "exerciciosSeries": [
    {
      "name": "Supino Inclinado Halteres",
      "sets": [
        { "weight": 28, "reps": 12, "completed": true },
        { "weight": 30, "reps": 10, "completed": true },
        { "weight": 30, "reps":  8, "completed": false }
      ]
    }
  ]
}
```

O campo `exercicios` (string legado) é mantido para compatibilidade com backups antigos.

---

## Comportamentos Automáticos

1. **Timer de descanso**: inicia automaticamente ao marcar uma série como concluída
2. **Sugestão de peso**: ao adicionar nova série, pré-preenche peso e reps da série anterior
3. **Validação ao finalizar**: avisa se nenhuma série foi concluída antes de salvar no histórico
4. **Progresso no card**: badge "% feito" conta exercícios onde TODAS as séries estão concluídas
5. **Copiar treino anterior**: busca `exerciciosSeries` no histórico para pré-preencher séries

---

## Deploy

```bash
git add js/series.js js/treino-session.js js/historico.js js/treinos.js js/utils.js
git add css/style.css index.html sw.js docs/CONTROLE_POR_SERIE.md
git commit -m "feat: controle por série — peso e reps individuais por set"
git push origin main
firebase deploy --only hosting
```
