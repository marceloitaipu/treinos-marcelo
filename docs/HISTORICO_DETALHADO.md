# Histórico Detalhado de Treinos

## 1. Novo Formato do Histórico

### Duas chaves no localStorage

| Chave | Descrição |
|-------|-----------|
| `marceloHistoricoV2` | Registros ricos V2 (novo) — máx. 100 |
| `marceloHistorico` | Registros legados V1 (mantidos) — máx. 50 |

### Estrutura V2

```json
{
  "id": "hist_2026_05_06_lxq4a2b",
  "version": 2,
  "date": "2026-05-06",
  "startedAt": "2026-05-06T18:30:00.000Z",
  "finishedAt": "2026-05-06T19:25:00.000Z",
  "durationMinutes": 55,
  "workoutTypeName": "ABCD Marcelo",
  "workoutName": "Treino A - Peito/Ombro/Tríceps",
  "totalVolume": 8740,
  "totalSets": 24,
  "completedSets": 20,
  "totalReps": 218,
  "exercises": [
    {
      "name": "Supino inclinado halteres",
      "totalVolume": 936,
      "completedSets": 3,
      "totalReps": 32,
      "sets": [
        { "setNumber": 1, "weight": 28, "reps": 12, "completed": true,  "volume": 336 },
        { "setNumber": 2, "weight": 30, "reps": 10, "completed": true,  "volume": 300 },
        { "setNumber": 3, "weight": 30, "reps": 10, "completed": true,  "volume": 300 }
      ]
    }
  ]
}
```

---

## 2. Compatibilidade com Histórico Antigo

### Regras

1. **`marceloHistorico` (V1) nunca é apagado** durante uso normal — só ao clicar "Limpar tudo".
2. `carregarHistoricoCompleto()` faz o **merge**: V2 aparece primeiro, V1 aparece depois sem duplicatas.
3. Entrada V1 é considerada duplicata se tiver mesmo `date + workoutName` que alguma entrada V2.
4. Cards V1 aparecem com badge "Registro legado" e estilo levemente esmaecido — sem botão "Detalhes" (não têm dados de séries).

### Estrutura V1 (legado)

```json
{
  "data": "06/05/2026, 18:30:00",
  "tipo": "ABCD Marcelo",
  "nome": "Treino A - Peito/Ombro/Tríceps",
  "exercicios": ["Supino (3x30kg · 30reps)", "Rosca (2x20kg · 20reps)"]
}
```

---

## 3. Funcionalidades Implementadas

| # | Funcionalidade | Status |
|---|----------------|--------|
| 1 | Salvar histórico detalhado ao finalizar treino | ✅ |
| 2 | Mostrar lista de históricos em cards | ✅ |
| 3 | Cards com data, nome, duração, exercícios, séries, volume | ✅ |
| 4 | Abrir tela de detalhes de treino antigo | ✅ |
| 5 | Detalhes: tabela de séries por exercício | ✅ |
| 6 | Excluir registro individual | ✅ |
| 7 | Filtros: tipo de treino, período (7/30/90 dias), busca por texto | ✅ |
| 8 | Compatibilidade com históricos antigos (V1) | ✅ |
| 9 | Exportação inclui `historicoV2` | ✅ |
| 10 | Importação restaura `historicoV2` se presente no backup | ✅ |

---

## 4. Arquivos Modificados / Criados

| Arquivo | Mudança |
|---------|---------|
| `js/historico-detalhado.js` | **Novo** — camada de dados: construção, storage, merge V1+V2, formatadores |
| `js/historico.js` | **Reescrito** — UI completa: cards, filtros, detalhes, exclusão |
| `js/treino-session.js` | `_treinoStartedAt` para rastrear hora de início; passado a `registrarHistorico` |
| `js/backup.js` | Export `v3.0` inclui `historicoV2`; import restaura V2 e chaves `sets_*` |
| `css/style.css` | +~230 linhas: cards, badges, filtros, tabela de séries no detalhe |
| `index.html` | `<script src="js/historico-detalhado.js">` adicionado antes de `historico.js` |
| `sw.js` | `v6.0.0` — `/js/historico-detalhado.js` adicionado ao cache |

---

## 5. Como Testar

### Novo treino (gera V2)
1. Abra o app → selecione qualquer treino → **Iniciar Treino**
2. Marque algumas séries com peso e reps (botão ✓)
3. Clique **Finalizar Treino**
4. Clique **Histórico** no header

### Verificar card V2
- O card deve mostrar: data + horário, badge de duração, badge do tipo
- Linha de métricas: exercícios • séries • reps
- Linha de volume em destaque (azul)
- Botão **Detalhes**

### Verificar detalhes
- Clicar **Detalhes** → abre modal com stats (duração, séries, reps, volume)
- Abaixo: cada exercício com tabela Série / Peso / Reps / Volume
- Exercícios não realizados aparecem como "não realizado" em cinza

### Filtros
- Clicar em tipos (ex: "Tipo A") → filtra por tipo de treino
- Select "7 dias" → mostra apenas treinos da última semana
- Busca "peito" → filtra por nome do treino

### Compatibilidade V1
- Se houver dados antigos em `marceloHistorico`, aparecem com badge "Registro legado"
- Cards V1 têm botão de excluir mas **não** têm botão Detalhes

### Backup
```bash
# No console do browser:
localStorage.getItem('marceloHistoricoV2')  # deve ter dados ricos
# Exportar backup pelo app → JSON deve conter "historicoV2" com versão 2
```

---

## 6. Deploy

```bash
git add js/historico-detalhado.js js/historico.js js/treino-session.js js/backup.js
git add css/style.css index.html sw.js docs/HISTORICO_DETALHADO.md
git commit -m "feat: histórico detalhado v2 — duração, séries, volume por treino"
git push origin main
firebase deploy --only hosting
```
