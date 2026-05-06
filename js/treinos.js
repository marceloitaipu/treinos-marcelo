// =============================================
//  NAVEGACAO PRINCIPAL — TIPOS E CARDS
//  Renderiza os botoes de tipo e os cards de treino na tela principal.
//  Dependencias: utils.js, storage.js, data.js
// =============================================

function carregarTreinos() {
    const tipoSelector = document.getElementById('tipoSelector');
    tipoSelector.innerHTML = '';

    todosTipos.forEach((tipo, index) => {
        const btn = document.createElement('button');
        btn.className = 'tipo-btn' + (index === tipoAtualIndex ? ' active' : '');
        btn.textContent = tipo.nome;
        btn.onclick = () => selecionarTipo(index);
        tipoSelector.appendChild(btn);
    });

    carregarTreinosTipo(tipoAtualIndex);
}

function selecionarTipo(index) {
    tipoAtualIndex = index;
    document.querySelectorAll('.tipo-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });
    carregarTreinosTipo(index);
}

function carregarTreinosTipo(tipoIndex) {
    const container = document.getElementById('treinosContainer');
    const tipo = todosTipos[tipoIndex];
    container.innerHTML = '';

    tipo.treinos.forEach((treino, index) => {
        const card = document.createElement('div');
        card.className = 'treino-card ' + treino.classe;
        const _cids = obterIds(tipoIndex, index);

        // Contar exercícios concluídos (suporta novo formato sets_ e legado concluido_)
        var totalConcluidos = 0;
        treino.exercicios.forEach(function(_, i) {
            var setsRaw = localStorage.getItem('sets_' + _cids.tipoId + '_' + _cids.treinoId + '_' + i);
            if (setsRaw) {
                try {
                    var sets = JSON.parse(setsRaw);
                    if (sets.length > 0 && sets.every(function(s) { return s.completed; })) totalConcluidos++;
                } catch(e) {}
            } else if (localStorage.getItem('concluido_' + _cids.tipoId + '_' + _cids.treinoId + '_' + i) === 'true') {
                totalConcluidos++;
            }
        });
        const progresso = treino.exercicios.length > 0
            ? Math.round((totalConcluidos / treino.exercicios.length) * 100) : 0;

        card.innerHTML = `
            <div class="treino-header">
                <div class="treino-letra">${esc(treino.letra)}</div>
                <div class="treino-info">
                    <h3>${esc(treino.nome)}</h3>
                    <p>${esc(treino.descricao)}</p>
                    ${progresso > 0 ? `<span class="serie-badge ${progresso === 100 ? 'completo' : ''}">
                        ${progresso === 100 ? '✅' : '🏃'} ${progresso}% feito
                    </span>` : ''}
                </div>
            </div>
            <div class="treino-actions">
                <button class="btn-iniciar" onclick="iniciarTreino(${index})">
                    🚀 Iniciar Treino
                </button>
                <button class="btn-edit" onclick="editarTreino(${index})" title="Editar treino">
                    ✏️
                </button>
            </div>
        `;

        container.appendChild(card);
    });
}

// =============================================
//  MODAL INICIAR TREINO
// =============================================
function iniciarTreino(index) {
