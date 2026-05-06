# Dashboard Inicial

## 1. Informações exibidas

### Banner inteligente
Mensagem contextual no topo com cor de acordo com a situação:
- **Verde** — Treinou hoje: "✅ Treino de hoje registrado."
- **Azul** — Treinou ontem: "💪 Você treinou ontem. Hoje pode ser um bom dia para treinar."
- **Amarelo** — 2–3 dias sem treinar: "⏰ Você está há X dias sem registrar treino."
- **Vermelho** — 4+ dias sem treinar: "🔔 Você está há X dias sem registrar treino. Vamos lá!"
- **Neutro** — Sem histórico: "👋 Bem-vindo! Comece seu primeiro treino."

### Card: Próximo Treino
- Nome do treino sugerido (próximo na sequência do último realizado)
- Descrição do treino
- Badge com o tipo (ex: "Treinos A-G")
- Botão **▶ Iniciar agora** → abre o treino direto no modal

### Card: Esta Semana (seg–dom)
- Treinos realizados
- Volume total (soma de peso × reps)
- Séries concluídas
- Duração total (se registrada)

### Card: Último Treino
- Nome do treino
- Data e hora de início
- Badge de duração
- Badge de volume total
- Botão **📊 Ver detalhes** → abre o modal de detalhes do histórico V2

### Card: Evolução Rápida
- 🏆 Exercício com maior % de crescimento de volume (primeiro → último registro)
- 🔥 Exercício feito mais recentemente, com data
- 💪 Maior carga registrada nas últimas 3 sessões, com peso

### Atalhos rápidos
4 botões grandes: **Treinos** · **Histórico** · **Evolução** · **Backup**

---

## 2. Origem dos dados

| Seção | Fonte |
|-------|-------|
| Banner inteligente | `carregarHistoricoV2()` — compara `date` do registro mais recente com hoje |
| Próximo treino | `todosTipos` + último `workoutName`/`workoutTypeName` do histórico V2 |
| Semana | `carregarHistoricoV2()` — filtra por ISO date entre segunda e domingo atuais |
| Último treino | Primeiro elemento de `carregarHistoricoV2()` (já ordenado decrescente) |
| Evolução rápida | `_evExtrairMapa()` + `_evExercicioDestaque()` de `evolucao.js` |
| Atalhos | Chamadas diretas para funções existentes (`verHistorico`, `verEvolucao`, etc.) |

> Apenas registros **V2** (`version: 2`, gerados pelo módulo `historico-detalhado.js`) são usados nos cálculos do dashboard. Registros V1 legados não contêm dados de séries individuais.

### Atualização automática
O dashboard é re-renderizado automaticamente ao finalizar um treino (via `registrarHistorico`), garantindo que os dados estejam sempre atualizados sem precisar recarregar a página.

---

## 3. Como testar

### Com histórico (dados reais)
1. Abrir o app → o dashboard aparece acima da lista de treinos.
2. Verificar que o banner mostra a mensagem correta de acordo com o último treino.
3. Verificar que o card **Próximo treino** sugere o treino seguinte ao último realizado.
4. Verificar que **Esta semana** reflete apenas treinos dos últimos dias correntes (seg–dom).
5. Clicar em **▶ Iniciar agora** → deve abrir o modal do treino correto.
6. Clicar em **📊 Ver detalhes** → deve abrir o modal de detalhes do último treino.
7. Clicar em **Ver evolução completa →** → deve abrir a tela de evolução.

### Sem histórico (estado vazio)
1. Apagar o histórico: `localStorage.removeItem('marceloHistoricoV2')` no console.
2. Recarregar a página.
3. Verificar que cada card exibe a mensagem de estado vazio (texto cinza, sem dados inventados).
4. Verificar que o card **Próximo treino** ainda aparece com o primeiro treino disponível.

### Verificação técnica no console
```javascript
// Ver dados calculados
var h = carregarHistoricoV2();
console.log('Resumo semana:', _dashResumoSemana ? _dashResumoSemana(h) : 'n/a');
console.log('Próximo treino:', _dashProximoTreino ? _dashProximoTreino() : 'n/a');
console.log('Mensagem:', _dashMensagem ? _dashMensagem(h) : 'n/a');

// Forçar re-render
renderDashboard();
```
