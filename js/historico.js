// =============================================
//  HISTÓRICO DE TREINOS — UI + REGISTRO
//  Dependências: utils.js, storage.js, series.js, historico-detalhado.js
// =============================================

// ---- ESTADO DOS FILTROS (módulo-level) ----
var _histFiltros = { tipo: 'Todos', periodo: 'todos', texto: '' };

// =============================================
//  REGISTRAR HISTÓRICO
// =============================================

/**
 * Salva o histórico ao finalizar treino.
 * Grava V2 (rico) em marceloHistoricoV2 e V1 (legado) em marceloHistorico.
 * @param {number} tipoIndex
 * @param {number} treinoIndex
 * @param {string} treinoNome
 * @param {string[]} exercicios
 * @param {Date|null} startedAt
 */
function registrarHistorico(tipoIndex, treinoIndex, treinoNome, exercicios, startedAt) {
    // 1) Registro rico V2
    var v2 = construirRegistroV2(tipoIndex, treinoIndex, startedAt || null);
    salvarHistoricoV2(v2);

    // 2) Registro legado V1 (mantém compat com backup antigo)
    var _ids = obterIds(tipoIndex, treinoIndex);
    var exerciciosLegado = exercicios.map(function(ex, i) {
        var sets = loadSets(_ids.tipoId, _ids.treinoId, i);
        var done = sets.filter(function(s) { return s.completed; });
        if (done.length === 0) return ex;
        var maxW = done.reduce(function(a, s) { return Math.max(a, s.weight || 0); }, 0);
        var reps = done.reduce(function(a, s) { return a + (parseInt(s.reps) || 0); }, 0);
        return ex + ' (' + done.length + 'x' + (maxW > 0 ? maxW + 'kg' : '') + (reps > 0 ? ' · ' + reps + 'reps' : '') + ')';
    });
    var v1Hist = JSON.parse(localStorage.getItem('marceloHistorico') || '[]');
    v1Hist.unshift({
        data:      new Date().toLocaleString('pt-BR'),
        tipo:      todosTipos[tipoIndex] ? todosTipos[tipoIndex].nome : '',
        nome:      treinoNome,
        exercicios: exerciciosLegado
    });
    if (v1Hist.length > 50) v1Hist.pop();
    localStorage.setItem('marceloHistorico', JSON.stringify(v1Hist));

    // Atualiza o dashboard após registrar novo treino
    if (typeof renderDashboard === 'function') renderDashboard();
}

// =============================================
//  MODAL PRINCIPAL DO HISTÓRICO
// =============================================

function verHistorico() {
    var hist = carregarHistoricoCompleto();

    var modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'modal-historico';
    modal.addEventListener('click', function(e) {
        if (e.target === modal) fecharModal();
    });

    var conteudo = document.createElement('div');
    conteudo.className = 'modal-content hist-modal-content';

    // Coletar tipos distintos para filtro
    var tiposNoHist = ['Todos'];
    hist.forEach(function(h) {
        if (h.workoutTypeName && tiposNoHist.indexOf(h.workoutTypeName) === -1) {
            tiposNoHist.push(h.workoutTypeName);
        }
    });

    var tipoBtnsHtml = tiposNoHist.map(function(t, i) {
        return '<button class="hist-tipo-btn' + (i === 0 ? ' ativo' : '') + '" ' +
               'onclick="_setHistFiltroTipo(\'' + esc(t) + '\')">' + esc(t) + '</button>';
    }).join('');

    conteudo.innerHTML =
        '<div class="modal-header">' +
            '<h2>\uD83D\uDCCA Hist\u00f3rico de Treinos</h2>' +
            '<p id="hist-count-label">' + hist.length + ' treino(s) registrado(s)</p>' +
        '</div>' +
        '<div class="hist-filter-bar">' +
            '<div class="hist-filter-row">' + tipoBtnsHtml + '</div>' +
            '<div class="hist-filter-row hist-filter-secondary">' +
                '<select class="hist-periodo-select" id="hist-periodo-sel" onchange="_setHistFiltroPeriodo(this.value)">' +
                    '<option value="todos">Todos os per\u00edodos</option>' +
                    '<option value="7">7 dias</option>' +
                    '<option value="30">30 dias</option>' +
                    '<option value="90">90 dias</option>' +
                '</select>' +
                '<input type="text" class="hist-search" id="hist-search-input" placeholder="\uD83D\uDD0D Buscar..." ' +
                       'oninput="_setHistFiltroTexto(this.value)">' +
            '</div>' +
        '</div>' +
        '<div id="histLista" class="hist-lista-scroll"></div>' +
        '<div class="modal-footer" style="display:flex;justify-content:space-between;align-items:center;gap:10px;">' +
            '<button class="btn-fechar" style="flex:1" onclick="fecharModal()">Fechar</button>' +
            '<button class="btn-zerar" onclick="limparHistorico()" title="Apagar todo o hist\u00f3rico">\uD83D\uDDD1 Limpar</button>' +
        '</div>';

    modal.appendChild(conteudo);
    document.body.appendChild(modal);

    _histFiltros = { tipo: 'Todos', periodo: 'todos', texto: '' };
    _renderHistoricoLista();
}

// =============================================
//  FILTROS
// =============================================

function _setHistFiltroTipo(tipo) {
    _histFiltros.tipo = tipo;
    document.querySelectorAll('.hist-tipo-btn').forEach(function(btn) {
        btn.classList.toggle('ativo', btn.textContent === tipo);
    });
    _renderHistoricoLista();
}

function _setHistFiltroPeriodo(val) {
    _histFiltros.periodo = val;
    _renderHistoricoLista();
}

function _setHistFiltroTexto(val) {
    _histFiltros.texto = val.toLowerCase().trim();
    _renderHistoricoLista();
}

// =============================================
//  RENDERIZAÇÃO DA LISTA
// =============================================

function _renderHistoricoLista() {
    var lista = document.getElementById('histLista');
    if (!lista) return;

    var hist = carregarHistoricoCompleto();

    // Filtro tipo
    if (_histFiltros.tipo !== 'Todos') {
        hist = hist.filter(function(h) { return h.workoutTypeName === _histFiltros.tipo; });
    }

    // Filtro período
    if (_histFiltros.periodo !== 'todos') {
        var days    = parseInt(_histFiltros.periodo);
        var cutoff  = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        var cutoffIso = cutoff.toISOString().slice(0, 10);
        hist = hist.filter(function(h) { return h.date >= cutoffIso; });
    }

    // Filtro texto
    if (_histFiltros.texto) {
        var q = _histFiltros.texto;
        hist = hist.filter(function(h) {
            return (h.workoutName     || '').toLowerCase().indexOf(q) !== -1 ||
                   (h.workoutTypeName || '').toLowerCase().indexOf(q) !== -1;
        });
    }

    // Atualizar contador
    var label = document.getElementById('hist-count-label');
    if (label) label.textContent = hist.length + ' treino(s) encontrado(s)';

    if (hist.length === 0) {
        lista.innerHTML = '<p class="hist-empty">Nenhum treino encontrado.</p>';
        return;
    }

    lista.innerHTML = hist.map(function(h) {
        return h.version >= 2 ? _histCardV2HTML(h) : _histCardV1HTML(h);
    }).join('');
}

// =============================================
//  CARD V2 — RICO
// =============================================

function _histCardV2HTML(h) {
    var dataBR  = histFormatDateBR(h.date);
    var timeStr = histFormatTime(h.startedAt);
    var dur     = histFormatDuration(h.durationMinutes);
    var vol     = histFormatVolume(h.totalVolume);
    var exCount = h.exercises
        ? h.exercises.filter(function(e) { return e.completedSets > 0; }).length
        : 0;

    var durBadge  = dur
        ? '<span class="hist-badge hist-dur-badge">\u23F1\uFE0F ' + esc(dur) + '</span>'
        : '';
    var typeBadge = h.workoutTypeName
        ? '<span class="hist-badge hist-tipo-badge">' + esc(h.workoutTypeName) + '</span>'
        : '';

    var metricsItems = [];
    if (exCount > 0)          metricsItems.push('<span>' + exCount + ' exerc.</span>');
    if (h.completedSets > 0)  metricsItems.push('<span>' + h.completedSets + ' s\u00e9ries</span>');
    if (h.totalReps > 0)      metricsItems.push('<span>' + h.totalReps.toLocaleString('pt-BR') + ' reps</span>');

    return '<div class="hist-card hist-card-v2">' +
        '<div class="hist-card-top">' +
            '<span class="hist-card-date">' +
                esc(dataBR) + (timeStr ? ' \u00B7 ' + esc(timeStr) : '') +
            '</span>' +
            '<div class="hist-card-badges">' + durBadge + typeBadge + '</div>' +
        '</div>' +
        '<div class="hist-card-nome">' + esc(h.workoutName) + '</div>' +
        (metricsItems.length > 0
            ? '<div class="hist-card-metrics">' + metricsItems.join('') + '</div>'
            : '') +
        (h.totalVolume > 0
            ? '<div class="hist-card-volume">\uD83D\uDCCA Volume: <strong>' + esc(vol) + '</strong></div>'
            : '') +
        '<div class="hist-card-footer">' +
            '<button class="btn-hist-detalhe" ' +
                'onclick="verDetalhesTreino(\'' + esc(h.id) + '\')">\uD83D\uDD0D Detalhes</button>' +
            '<button class="btn-hist-del" ' +
                'onclick="excluirHistoricoItem(\'' + esc(h.id) + '\',2,null)" ' +
                'title="Excluir este registro">\uD83D\uDDD1</button>' +
        '</div>' +
    '</div>';
}

// =============================================
//  CARD V1 — LEGADO
// =============================================

function _histCardV1HTML(h) {
    var typeBadge = h.workoutTypeName
        ? '<span class="hist-badge hist-tipo-badge">' + esc(h.workoutTypeName) + '</span>'
        : '';
    var exCount = Array.isArray(h.exercicios) ? h.exercicios.length : 0;
    var exLine  = Array.isArray(h.exercicios) && h.exercicios.length > 0
        ? '<div class="hist-card-exercicios-v1">' +
              h.exercicios.slice(0, 5).map(function(e) {
                  return '<span>' + esc(e) + '</span>';
              }).join('') +
              (h.exercicios.length > 5 ? '<span>+' + (h.exercicios.length - 5) + ' mais</span>' : '') +
          '</div>'
        : '';

    return '<div class="hist-card hist-card-v1">' +
        '<div class="hist-card-top">' +
            '<span class="hist-card-date">' + esc(h.dataBR || h.date || '') + '</span>' +
            '<div class="hist-card-badges">' + typeBadge + '</div>' +
        '</div>' +
        '<div class="hist-card-nome">' + esc(h.workoutName) + '</div>' +
        (exCount > 0
            ? '<div class="hist-card-metrics"><span>' + exCount + ' exerc.</span></div>'
            : '') +
        exLine +
        '<div class="hist-card-footer">' +
            '<span class="hist-v1-label">Registro legado</span>' +
            '<button class="btn-hist-del" ' +
                'onclick="excluirHistoricoItem(null,1,\'' + esc(h._v1Key) + '\')" ' +
                'title="Excluir este registro">\uD83D\uDDD1</button>' +
        '</div>' +
    '</div>';
}

// =============================================
//  TELA DE DETALHES (V2)
// =============================================

function verDetalhesTreino(histId) {
    var hist = carregarHistoricoV2();
    var h = null;
    for (var i = 0; i < hist.length; i++) {
        if (hist[i].id === histId) { h = hist[i]; break; }
    }
    if (!h) { mostrarNotificacao('Registro n\u00E3o encontrado', 'warning'); return; }

    var modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'modal-detalhe-hist';
    modal.addEventListener('click', function(e) {
        if (e.target === modal) _fecharDetalheHist();
    });

    var dataBR = histFormatDateBR(h.date);
    var timeS  = histFormatTime(h.startedAt);
    var timeE  = histFormatTime(h.finishedAt);
    var dur    = histFormatDuration(h.durationMinutes);
    var vol    = histFormatVolume(h.totalVolume);

    // Exercícios com tabela de séries
    var exHtml = (h.exercises || []).map(function(ex) {
        var doneSets = (ex.sets || []).filter(function(s) { return s.completed; });

        if (doneSets.length === 0) {
            return '<div class="hist-det-ex hist-det-ex-skip">' +
                '<div class="hist-det-ex-header">' +
                    '<span class="hist-det-ex-nome">' + esc(ex.name) + '</span>' +
                    '<span class="hist-det-skip-tag">n\u00E3o realizado</span>' +
                '</div>' +
            '</div>';
        }

        var rows = doneSets.map(function(s) {
            return '<tr>' +
                '<td class="hist-det-td-num">' + s.setNumber + '</td>' +
                '<td>' + (s.weight > 0 ? s.weight + '\u00A0kg' : '\u2014') + '</td>' +
                '<td>' + (s.reps > 0 ? s.reps : '\u2014') + '</td>' +
                '<td class="hist-det-td-vol">' + (s.volume > 0 ? histFormatVolume(s.volume) : '\u2014') + '</td>' +
            '</tr>';
        }).join('');

        return '<div class="hist-det-ex">' +
            '<div class="hist-det-ex-header">' +
                '<span class="hist-det-ex-nome">' + esc(ex.name) + '</span>' +
                (ex.totalVolume > 0
                    ? '<span class="hist-det-ex-vol">' + histFormatVolume(ex.totalVolume) + '</span>'
                    : '') +
            '</div>' +
            '<table class="hist-det-table">' +
                '<thead><tr>' +
                    '<th>S\u00E9r.</th><th>Peso</th><th>Reps</th><th>Volume</th>' +
                '</tr></thead>' +
                '<tbody>' + rows + '</tbody>' +
            '</table>' +
        '</div>';
    }).join('');

    // Stats overview
    var statsHtml = '';
    if (dur)              statsHtml += _detStat(esc(dur), 'dura\u00E7\u00E3o', '');
    if (h.exercises)      statsHtml += _detStat(h.exercises.filter(function(e){return e.completedSets>0;}).length, 'exerc.', '');
    if (h.completedSets)  statsHtml += _detStat(h.completedSets, 's\u00E9ries', '');
    if (h.totalReps)      statsHtml += _detStat(h.totalReps.toLocaleString('pt-BR'), 'reps', '');
    if (h.totalVolume)    statsHtml += _detStat(vol, 'volume', 'hist-det-stat-vol');

    var conteudo = document.createElement('div');
    conteudo.className = 'modal-content hist-det-content';
    conteudo.innerHTML =
        '<div class="modal-header">' +
            '<h2>' + esc(h.workoutName) + '</h2>' +
            '<p>' +
                (h.workoutTypeName ? esc(h.workoutTypeName) + ' \u00B7 ' : '') +
                esc(dataBR) +
                (timeS ? ' \u00B7 ' + esc(timeS) + (timeE ? '\u2013' + esc(timeE) : '') : '') +
            '</p>' +
        '</div>' +
        (statsHtml ? '<div class="hist-det-stats">' + statsHtml + '</div>' : '') +
        '<div class="hist-det-exercises">' + exHtml + '</div>' +
        '<div class="modal-footer" style="display:flex;gap:10px;justify-content:space-between;">' +
            '<button class="btn-fechar" style="flex:1" onclick="_fecharDetalheHist()">\u2190 Voltar</button>' +
            '<button class="btn-zerar" onclick="excluirHistoricoItem(\'' + esc(h.id) + '\',2,null,true)">' +
                '\uD83D\uDDD1 Excluir</button>' +
        '</div>';

    modal.appendChild(conteudo);
    document.body.appendChild(modal);
}

function _detStat(val, lbl, extraClass) {
    return '<div class="hist-det-stat ' + extraClass + '">' +
        '<span class="hist-det-stat-val">' + val + '</span>' +
        '<span class="hist-det-stat-lbl">' + lbl + '</span>' +
    '</div>';
}

function _fecharDetalheHist() {
    var m = document.getElementById('modal-detalhe-hist');
    if (m && m.parentNode) m.parentNode.removeChild(m);
}

// =============================================
//  EXCLUIR / LIMPAR
// =============================================

function excluirHistoricoItem(id, version, v1Key, fromDetail) {
    if (!confirm('Excluir este registro de hist\u00F3rico?')) return;
    if (version >= 2) {
        excluirRegistroV2(id);
    } else {
        excluirRegistroV1(v1Key);
    }
    if (fromDetail) _fecharDetalheHist();
    _renderHistoricoLista();
    mostrarNotificacao('\uD83D\uDDD1 Registro exclu\u00EDdo', 'warning');
}

function limparHistorico() {
    if (!confirm('Apagar TODO o hist\u00F3rico?\n\nEsta a\u00E7\u00E3o n\u00E3o pode ser desfeita.')) return;
    localStorage.removeItem('marceloHistorico');
    localStorage.removeItem(HIST_V2_KEY);
    _renderHistoricoLista();
    mostrarNotificacao('\uD83D\uDDD1 Hist\u00F3rico apagado!', 'warning');
}

// =============================================
//  COMPAT LEGADO
// =============================================

/** Chamado por filtros legados se existirem */
function filtrarHistorico(filtroTipo) {
    _setHistFiltroTipo(filtroTipo);
}
