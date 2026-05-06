// =============================================
//  ORQUESTRADOR DO APP
//  Ponto de entrada: DOMContentLoaded inicia o app.
//  Contem: gestao de tipos de treino, boot da aplicacao.
//  Dependencias: todos os outros modulos JS
// =============================================

document.addEventListener('DOMContentLoaded', function () {
    console.log('💪 Inicializando Treinos Marcelo com 7 tipos...');
    carregarTreinosSalvos();
    garantirIds(todosTipos);    // garante IDs em todos os tipos/treinos
    migrarChavesLegadas();      // migra chaves legadas de índice para ID
    salvarTodosOsTreinos();     // persiste os IDs recém-atribuídos
    carregarTreinos();
    renderDashboard();

    // Fechar modal com Escape — pede confirmação se treino estiver ativo
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        if (modalTreinoAberto) {
            fecharModalTreinoComConfirmacao(modalTreinoAberto.tipoIndex, modalTreinoAberto.treinoIndex);
        } else {
            fecharModal();
        }
    });

    console.log('✅ App carregado!');
});

function carregarTreinosSalvos() {

function novoTipoTreino() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.addEventListener('click', e => { if (e.target === modal) fecharModal(); });

    const conteudo = document.createElement('div');
    conteudo.className = 'modal-content';
    conteudo.innerHTML = `
        <div class="modal-header">
            <h2>➕ Novo Tipo de Treino</h2>
            <p>Crie um tipo personalizado com seus próprios treinos</p>
        </div>
        <div class="form-group">
            <label>Nome do tipo (ex: "Meu Push Pull"):</label>
            <div class="tipo-novo-form">
                <input type="text" id="novoTipoNome" placeholder="Nome do tipo de treino..." maxlength="40">
                <button class="btn-criar-tipo" onclick="criarNovoTipo()">Criar</button>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn-fechar" onclick="fecharModal()">Cancelar</button>
        </div>
    `;

    modal.appendChild(conteudo);
    document.body.appendChild(modal);
    setTimeout(() => document.getElementById('novoTipoNome')?.focus(), 100);
}

function criarNovoTipo() {
    const nome = document.getElementById('novoTipoNome').value.trim();
    if (!nome) {
        mostrarNotificacao('⚠️ Digite um nome para o tipo de treino', 'warning');
        return;
    }

    const novoTipo = {
        id: gerarId(),
        nome: nome,
        treinos: [
            {
                id: gerarId(),
                letra: 'A',
                nome: 'Treino A',
                descricao: 'Meu treino personalizado',
                classe: 'treino-a',
                exercicios: ['Exercício 1', 'Exercício 2', 'Exercício 3']
            }
        ]
    };

    todosTipos.push(novoTipo);
    salvarTodosOsTreinos();
    fecharModal();
    carregarTreinos();
    // Selecionar o novo tipo automaticamente
    selecionarTipo(todosTipos.length - 1);
    mostrarNotificacao(`✅ Tipo "${nome}" criado! Edite os treinos conforme desejar.`);
}

// =============================================
//  DELETAR TIPO
// =============================================
function deletarTipoAtual() {
    if (todosTipos.length <= 1) {
        mostrarNotificacao('⚠️ Não é possível deletar o único tipo existente!', 'warning');
        return;
    }
    const tipo = todosTipos[tipoAtualIndex];
    if (!confirm(`Deletar o tipo "${tipo.nome}" e todos os seus treinos?\n\nTodos os pesos, séries e progresso deste tipo serão apagados. Esta ação não pode ser desfeita.`)) return;

    // Remove chaves de progresso de todos os treinos do tipo
    tipo.treinos.forEach(function(treino) {
        treino.exercicios.forEach(function(_, i) {
            localStorage.removeItem(`peso_${tipo.id}_${treino.id}_${i}`);
            localStorage.removeItem(`series_${tipo.id}_${treino.id}_${i}`);
            localStorage.removeItem(`concluido_${tipo.id}_${treino.id}_${i}`);
        });
    });

    const nomeApagado = tipo.nome;
    todosTipos.splice(tipoAtualIndex, 1);
    tipoAtualIndex = Math.max(0, tipoAtualIndex - 1);
    salvarTodosOsTreinos();
    carregarTreinos();
    mostrarNotificacao(`🗑️ Tipo "${nomeApagado}" deletado!`, 'warning');
}

// =============================================
//  NOVO TREINO DENTRO DE UM TIPO
// =============================================
function novoTreinoNoTipo() {
    const tipo = todosTipos[tipoAtualIndex];
    const letras = ['A','B','C','D','E','F','G','H'];
    const letrasUsadas = tipo.treinos.map(function(t){ return t.letra; });
    const proximaLetra = letras.find(function(l){ return !letrasUsadas.includes(l); })
                       || String.fromCharCode(65 + tipo.treinos.length);
    const classesDisponiveis = ['treino-a','treino-b','treino-c','treino-d','treino-e'];
    const classeIdx = tipo.treinos.length % classesDisponiveis.length;
    const classeEscolhida = classesDisponiveis[classeIdx];

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.addEventListener('click', function(e){ if (e.target === modal) fecharModal(); });

    const exerciciosDiv = document.createElement('div');
    exerciciosDiv.className = 'exercicios-lista';
    exerciciosDiv.id = 'exercicios-lista';
    exerciciosDiv.appendChild(criarItemExercicioEdicao('Exercício 1', 0));

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
    nomeInput.id = 'novoTreino-nome';
    nomeInput.value = `Treino ${proximaLetra}`;
    nomeInput.placeholder = `Ex: Treino ${proximaLetra} - Peito`;
    nomeInput.style.cssText = 'width:100%;padding:12px;border-radius:8px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.1);color:white;font-size:16px;margin-bottom:4px;';

    const descInput = document.createElement('input');
    descInput.type = 'text';
    descInput.id = 'novoTreino-descricao';
    descInput.value = '';
    descInput.placeholder = 'Ex: 5 exercícios • Força';
    descInput.style.cssText = nomeInput.style.cssText;

    conteudo.innerHTML = `
        <div class="modal-header">
            <h2>📋 Novo Treino</h2>
            <p>Adicionar treino ao tipo: <strong style="color:var(--p4)">${esc(tipo.nome)}</strong></p>
        </div>
        <div class="form-group">
            <label for="novoTreino-nome">Nome do Treino:</label>
        </div>
    `;
    conteudo.querySelector('[for="novoTreino-nome"]').after(nomeInput);

    const descGroup = document.createElement('div');
    descGroup.className = 'form-group';
    descGroup.innerHTML = '<label for="novoTreino-descricao">Descrição:</label>';
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
        <button class="btn-salvar" onclick="salvarNovoTreino('${proximaLetra}', '${classeEscolhida}')">💾 Salvar Treino</button>
        <button class="btn-cancelar" onclick="fecharModal()">❌ Cancelar</button>
    `;
    conteudo.appendChild(actions);

    modal.appendChild(conteudo);
    document.body.appendChild(modal);
    setTimeout(function(){ nomeInput.focus(); nomeInput.select(); }, 80);
}

function salvarNovoTreino(letra, classe) {
    const novoNome = document.getElementById('novoTreino-nome').value.trim();
    const novaDesc = document.getElementById('novoTreino-descricao').value.trim();

    if (!novoNome) {
        mostrarNotificacao('⚠️ Nome do treino é obrigatório!', 'warning');
        return;
    }

    const inputs = document.querySelectorAll('#exercicios-lista .exercicio-input');
    const exercicios = [];
    inputs.forEach(function(inp){ const v = inp.value.trim(); if (v) exercicios.push(v); });

    if (exercicios.length === 0) {
        mostrarNotificacao('⚠️ Pelo menos um exercício é obrigatório!', 'warning');
        return;
    }

    const count = exercicios.length;
    const descFinal = novaDesc || `${count} exercício${count !== 1 ? 's' : ''}`;

    todosTipos[tipoAtualIndex].treinos.push({
        id:        gerarId(),
        letra:     letra,
        nome:      novoNome,
        descricao: descFinal,
        classe:    classe,
        exercicios: exercicios
    });

    salvarTodosOsTreinos();
    fecharModal();
    carregarTreinosTipo(tipoAtualIndex);
    mostrarNotificacao(`✅ Treino "${novoNome}" criado!`);
}

// =============================================
//  NOTIFICAÇÕES
// =============================================
function mostrarNotificacao(mensagem, tipo = 'success') {
    // Remove notificação existente para não acumular
    const existente = document.querySelector('.notification');
    if (existente) existente.remove();

    const notif = document.createElement('div');
    notif.className = `notification ${tipo}`;
    notif.textContent = mensagem;
    document.body.appendChild(notif);

    setTimeout(() => {
        if (document.body.contains(notif)) notif.remove();
    }, 3000);
}

console.log('💪 Treinos Marcelo v2.0 carregado!');
    </script>
