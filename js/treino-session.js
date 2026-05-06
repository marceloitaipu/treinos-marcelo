// =============================================
//  SESSAO DE TREINO EM ANDAMENTO
//  Controla o modal de execucao do treino:
//  peso por exercicio, series feitas, conclusao, edicao de treino.
//  Estado de sessao ativa: modalTreinoAberto (definido em utils.js)
//  Dependencias: utils.js, storage.js, data.js, timer.js, treinos.js
// =============================================

var _treinoStartedAt = null; // timestamp de início da sessão ativa

function iniciarTreino(index) {
    var treino = todosTipos[tipoAtualIndex].treinos[index];
    pararTimer(); // garante que não haja timer ativo de outra sessão

    var modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.addEventListener('click', function(e) {
        if (e.target === modal) fecharModalTreinoComConfirmacao(tipoAtualIndex, index);
    });

    // Timer HTML com tempo de descanso padrão de 60s
    var timerHtml = criarTimerHTML(60);

    // Lista de exercícios com controle por série
    var exerciciosDiv = document.createElement('div');
    exerciciosDiv.id = 'exerciciosListaTreino';
    treino.exercicios.forEach(function(exercicio, i) {
        exerciciosDiv.appendChild(renderExercicioComSeries(exercicio, i, tipoAtualIndex, index));
    });

    // Monta modal
    var conteudo = document.createElement('div');
    conteudo.className = 'modal-content';
    conteudo.innerHTML =
        '<div class="modal-header">' +
            '<h2>' + esc(treino.nome) + '</h2>' +
            '<p>' + esc(treino.descricao) + '</p>' +
        '</div>' +
        timerHtml;
    conteudo.appendChild(exerciciosDiv);

    var footer = document.createElement('div');
    footer.className = 'modal-footer';
    footer.innerHTML =
        '<div style="display:flex;gap:10px;justify-content:center;">' +
            '<button class="btn-fechar" style="flex:1" onclick="fecharTreinoModal(' + tipoAtualIndex + ',' + index + ')">🏁 Finalizar Treino</button>' +
            '<button class="btn-zerar" title="Zerar séries e progresso deste treino" onclick="zerarProgressoTreino(' + tipoAtualIndex + ',' + index + ')">🔄 Zerar</button>' +
        '</div>';
    conteudo.appendChild(footer);

    modal.appendChild(conteudo);
    document.body.appendChild(modal);

    timerTotal = 60;
    timerAtual = 60;
    atualizarDisplayTimer();
    modalTreinoAberto = { tipoIndex: tipoAtualIndex, treinoIndex: index };
    _treinoStartedAt = new Date(); // registra horário de início
}

function fecharTreinoModal(tipoIndex, treinoIndex) {
    var treino = todosTipos[tipoIndex].treinos[treinoIndex];
    var _ids = obterIds(tipoIndex, treinoIndex);

    // Verifica se ao menos uma série foi concluída
    var totalConcluidas = 0;
    treino.exercicios.forEach(function(_, i) {
        var sets = loadSets(_ids.tipoId, _ids.treinoId, i);
        sets.forEach(function(s) { if (s.completed) totalConcluidas++; });
    });

    if (totalConcluidas === 0) {
        if (!confirm('Nenhuma série foi concluída.\n\nFinalizar mesmo assim?')) return;
    }

    pararTimer();
    registrarHistorico(tipoIndex, treinoIndex, treino.nome, treino.exercicios, _treinoStartedAt);
    _treinoStartedAt = null;
    fecharModal();
    carregarTreinosTipo(tipoIndex);
    mostrarNotificacao('🏁 Treino finalizado! Ótimo trabalho! 💪');
}

function zerarProgressoTreino(tipoIndex, treinoIndex) {
    var treino = todosTipos[tipoIndex].treinos[treinoIndex];
    if (!confirm('Zerar todo o progresso de "' + treino.nome + '"?\n\nIsso remove todas as séries e pesos registrados.')) return;
    var _zids = obterIds(tipoIndex, treinoIndex);
    treino.exercicios.forEach(function(_, i) {
        clearSets(_zids.tipoId, _zids.treinoId, i);
    });
    _treinoStartedAt = null;
    fecharModal();
    iniciarTreino(treinoIndex);
    mostrarNotificacao('🔄 Progresso zerado! Bom treino!', 'warning');
}

// salvarPeso / ajustarSeries / toggleConcluido foram substituídos
// pelo controle por série em js/series.js

// =============================================
//  MODAL EDITAR TREINO
// =============================================
function editarTreino(index) {
    const treino = todosTipos[tipoAtualIndex].treinos[index];

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.addEventListener('click', function (e) {
        if (e.target === modal) fecharModal();
    });

    const exerciciosDiv = document.createElement('div');
    exerciciosDiv.className = 'exercicios-lista';
    exerciciosDiv.id = 'exercicios-lista';

    treino.exercicios.forEach((exercicio, i) => {
        exerciciosDiv.appendChild(criarItemExercicioEdicao(exercicio, i));
    });

    const btnAdd = document.createElement('button');
    btnAdd.className = 'btn-add';
    btnAdd.textContent = '➕ Adicionar Exercício';
    btnAdd.onclick = adicionarExercicio;
    exerciciosDiv.appendChild(btnAdd);

    const conteudo = document.createElement('div');
    conteudo.className = 'modal-content';
    conteudo.style.maxWidth = '600px';

    const nomeInput = document.createElement('input');
    nomeInput.type = 'text';
    nomeInput.id = 'edit-nome';
    nomeInput.value = treino.nome;
    nomeInput.placeholder = 'Ex: Treino A - Peito';
    nomeInput.style.cssText = 'width:100%;padding:12px;border-radius:8px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.1);color:white;font-size:16px;';

    const descInput = document.createElement('input');
    descInput.type = 'text';
    descInput.id = 'edit-descricao';
    descInput.value = treino.descricao;
    descInput.placeholder = 'Ex: 5 exercícios • Força';
    descInput.style.cssText = nomeInput.style.cssText;

    conteudo.innerHTML = `
        <div class="modal-header">
            <h2>✏️ Editar Treino</h2>
            <p>Personalize seu treino como desejar</p>
        </div>
        <div class="form-group">
            <label for="edit-nome">Nome do Treino:</label>
        </div>
    `;
    conteudo.querySelector('[for="edit-nome"]').after(nomeInput);

    const descGroup = document.createElement('div');
    descGroup.className = 'form-group';
    descGroup.innerHTML = '<label for="edit-descricao">Descrição:</label>';
    descGroup.appendChild(descInput);
    conteudo.appendChild(descGroup);

    const exGroup = document.createElement('div');
    exGroup.className = 'form-group';
    exGroup.innerHTML = '<label>Exercícios:</label>';
    exGroup.appendChild(exerciciosDiv);
    conteudo.appendChild(exGroup);

    const actions = document.createElement('div');
    actions.className = 'form-actions';
    actions.innerHTML = `
        <button class="btn-salvar"   onclick="salvarEdicaoTreino(${index})">💾 Salvar</button>
        <button class="btn-cancelar" onclick="fecharModal()">❌ Cancelar</button>
    `;
    conteudo.appendChild(actions);

    modal.appendChild(conteudo);
    document.body.appendChild(modal);
}

function criarItemExercicioEdicao(nomeExercicio, i) {
    const div = document.createElement('div');
    div.className = 'exercicio-edit';

    const btn = document.createElement('button');
    btn.className = 'btn-remove';
    btn.textContent = '×';
    btn.onclick = () => removerExercicio(div);

    const input = document.createElement('input');
    input.type = 'text';
    input.value = nomeExercicio; // valor definido via .value — sem risco de XSS
    input.className = 'exercicio-input';
    input.dataset.index = i;
    input.placeholder = 'Nome do exercício';

    div.appendChild(btn);
    div.appendChild(input);
    return div;
}

function removerExercicio(itemDiv) {
    const lista   = document.getElementById('exercicios-lista');
    const itens   = lista.querySelectorAll('.exercicio-edit');
    if (itens.length <= 1) {
        mostrarNotificacao('⚠️ Não é possível remover o último exercício!', 'warning');
        return;
    }
    itemDiv.remove();
    // Reindexar data-index
    lista.querySelectorAll('.exercicio-edit').forEach((el, idx) => {
        el.querySelector('.exercicio-input').dataset.index = idx;
    });
    mostrarNotificacao('🗑️ Exercício removido!', 'warning');
}

function adicionarExercicio() {
    const lista     = document.getElementById('exercicios-lista');
    const btnAdd    = lista.querySelector('.btn-add');
    const novos     = lista.querySelectorAll('.exercicio-edit');
    const novoItem  = criarItemExercicioEdicao('Novo Exercício', novos.length);
    lista.insertBefore(novoItem, btnAdd);
    const inp = novoItem.querySelector('.exercicio-input');
    inp.focus();
    inp.select();
    mostrarNotificacao('➕ Novo exercício adicionado!');
}

function salvarEdicaoTreino(index) {
    const novoNome = document.getElementById('edit-nome').value.trim();
    const novaDesc = document.getElementById('edit-descricao').value.trim();

    if (!novoNome) {
        mostrarNotificacao('⚠️ Nome do treino é obrigatório!', 'warning');
        return;
    }

    const inputs = document.querySelectorAll('#exercicios-lista .exercicio-input');
    const novosExercicios = [];
    inputs.forEach(inp => {
        const v = inp.value.trim();
        if (v) novosExercicios.push(v);
    });

    if (novosExercicios.length === 0) {
        mostrarNotificacao('⚠️ Pelo menos um exercício é obrigatório!', 'warning');
        return;
    }

    todosTipos[tipoAtualIndex].treinos[index].nome       = novoNome;
    todosTipos[tipoAtualIndex].treinos[index].exercicios = novosExercicios;

    // Atualiza contagem na descrição se ela começa com um número (ex: "8 exercícios")
    const count = novosExercicios.length;
    let novaDescFinal = novaDesc;
    if (!novaDesc.trim()) {
        novaDescFinal = `${count} exercício${count !== 1 ? 's' : ''}`;
    } else if (/^\d+/.test(novaDesc)) {
        novaDescFinal = novaDesc.replace(/^\d+/, String(count));
    }
    todosTipos[tipoAtualIndex].treinos[index].descricao = novaDescFinal;

    salvarTodosOsTreinos();
    fecharModal();
    carregarTreinos();
    mostrarNotificacao('💾 Treino salvo com sucesso!');
}

// =============================================
//  FECHAR MODAIS
// =============================================
function fecharModal() {
    pararTimer();
    const eraModalTreino = !!document.getElementById('exerciciosListaTreino');
    document.querySelectorAll('.modal-overlay').forEach(m => {
        if (document.body.contains(m)) document.body.removeChild(m);
    });
    modalTreinoAberto = null;
    if (eraModalTreino) carregarTreinosTipo(tipoAtualIndex);
}

function fecharModalTreinoComConfirmacao(tipoIndex, treinoIndex) {
    if (confirm('Finalizar treino e salvar no histórico?\n\nOK = Finalizar e salvar\nCancelar = Manter treino aberto')) {
        fecharTreinoModal(tipoIndex, treinoIndex);
    }
}

