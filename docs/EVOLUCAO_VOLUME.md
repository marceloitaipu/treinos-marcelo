# Evolução — Cálculo de Volume e Progressão

## 1. Cálculos implementados

### Volume por série
```
volume = peso (kg) × reps
```
Calculado por `_evExtrairMapa()` para cada série com `completed: true`.

### Volume por exercício (por sessão)
```
volume_exercício = Σ volume de todas as séries concluídas do exercício
```

### Volume por treino
```
volume_treino = Σ volume de todos os exercícios  (já gravado em totalVolume no V2)
```

### Melhor carga do exercício
Maior `weight` encontrado entre todas as séries concluídas de todas as sessões.

### Melhor volume do exercício
Maior `volume` total registrado em uma única sessão para aquele exercício.

### Repetições totais por sessão
`Σ reps` das séries concluídas do exercício naquela sessão.

### Volume semanal / mensal
Agrega `totalVolume` dos registros V2 por semana (ISO) ou mês (YYYY-MM).

### Treinos por semana / mês
Conta registros V2 por semana ou mês.

### Tendência
Compara a média de volume das últimas 2 sessões com a média das 2 anteriores:
- **> +5%** → 📈 Evoluindo
- **< -5%** → 📉 Queda
- **entre -5% e +5%** → ➡️ Estável
- **< 2 sessões** → — Insuf. dados

### Exercício em destaque
Aquele com maior crescimento percentual de volume entre a primeira e a última sessão registrada.

---

## 2. Como interpretar os resultados

| Campo | O que significa |
|-------|----------------|
| **Treinos este mês** | Quantas sessões V2 foram concluídas no mês atual |
| **Volume este mês** | Soma de peso × reps de todas as séries concluídas do mês |
| **Exercício em destaque** | Exercício que mais cresceu em volume desde o primeiro registro |
| **Último treino** | Data e nome do treino mais recente no histórico V2 |
| **Barras semanais/mensais** | Altura proporcional ao volume; barra mais alta = semana/mês de maior volume |
| **Treinos por período** | Frequência de treino; útil para ver regularidade |
| **Última carga** | Maior peso usado na última sessão do exercício selecionado |
| **Maior carga** | Maior peso registrado em qualquer sessão histórica |
| **Melhor volume** | Maior volume total numa única sessão |
| **Últimas reps** | Total de reps concluídas na sessão mais recente |
| **Tendência** | Baseada nas últimas 4 sessões do exercício |

> ⚠️ Apenas registros do formato V2 (gerados após a atualização) entram nos cálculos. Registros legados V1 não contêm dados de séries individuais.

---

## 3. Como testar

### Pré-requisito
Realizar pelo menos 2 treinos completos (com séries concluídas) antes de abrir a tela.

### Passos

1. **Abrir o app** → clicar no botão **📈 Evolução** no cabeçalho.
2. **Resumo do Mês** deve mostrar:
   - Número de treinos realizados no mês atual.
   - Volume total (ex: `2.400 kg`).
   - Exercício em destaque (com `+XX%`).
3. **Volume Semanal** → barras aparecem para cada semana com treino registrado.
4. **Volume Mensal** → barras em azul por mês.
5. **Treinos por Mês / Semana** → contadores numéricos.
6. **Evolução por Exercício**:
   - Selecionar um exercício no dropdown.
   - Verificar os 6 cards de stats.
   - Verificar a tabela com os registros (mais recente no topo).
   - Verificar o gráfico de barras: barras roxas = sessões passadas, barra azul = sessão mais recente.
7. **Tendência**: após 2+ sessões do mesmo exercício, o badge deve mostrar 📈, ➡️ ou 📉.
8. **Sem dados**: fechar o modal e testar em dispositivo sem histórico V2 → deve aparecer a mensagem "Ainda não há dados suficientes para calcular evolução." em cada seção.

### Verificação técnica

```javascript
// No console do navegador:
var hist = carregarHistoricoV2();
console.log('Registros V2:', hist.length);
console.log('Exercícios:', Object.keys(_evExtrairMapa(hist)));
console.log('Resumo:', _evResumoGeral(hist));
```
