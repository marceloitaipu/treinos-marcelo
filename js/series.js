// =============================================
//  CONTROLE DE SÉRIES POR EXERCÍCIO
//  Cada exercício tem N séries com peso e repetições individuais.
//  localStorage key: sets_<tipoId>_<treinoId>_<exercicioIdx>
//  Formato: [{weight:number, reps:number, completed:boolean}, ...]
//  Dependências: utils.js, storage.js
// =============================================

// -------- STORAGE --------

function setsKey(tipoId, treinoId, exercicioIdx) {
    return 'sets_' + tipoId + '_' + treinoId + '_' + exercicioIdx;
}

/**
 * Carrega séries de um exercício.
 * Se não existir dados novos, tenta migrar dos campos legados
 * (peso_, series_, concluido_) para o novo formato.
 */
function loadSets(tipoId, treinoId, exercicioIdx) {
    var raw = localStorage.getItem(setsKey(tipoId, treinoId, exercicioIdx));
    if (raw) {
        try { return JSON.parse(raw); } catch(e) {}
    }
    // Migração de dados legados
    var pesoLeg  = parseFloat(localStorage.getItem('peso_'      + tipoId + '_' + treinoId + '_' + exercicioIdx)) || 0;
    var serLeg   = parseInt(localStorage.getItem('series_'    + tipoId + '_' + treinoId + '_' + exercicioIdx)) || 0;
    var concLeg  = localStorage.getItem('concluido_' + tipoId + '_' + treinoId + '_' + exercicioIdx) === 'true';

    if (pesoLeg > 0 || serLeg > 0 || concLeg) {
        var n = Math.max(1, serLeg);
        var migrated = [];
        for (var k = 0; k < n; k++) {
            migrated.push({ weight: pesoLeg, reps: 0, completed: concLeg });
        }
        saveSets(tipoId, treinoId, exercicioIdx, migrated);
        return migrated;
    }
    // Sem dados anteriores: começa com 1 série vazia
    return [{ weight: 0, reps: 0, completed: false }];
}

function saveSets(tipoId, treinoId, exercicioIdx, sets) {
    localStorage.setItem(setsKey(tipoId, treinoId, exercicioIdx), JSON.stringify(sets));
}

function clearSets(tipoId, treinoId, exercicioIdx) {
    localStorage.removeItem(setsKey(tipoId, treinoId, exercicioIdx));
    localStorage.removeItem('peso_'      + tipoId + '_' + treinoId + '_' + exercicioIdx);
    localStorage.removeItem('series_'   + tipoId + '_' + treinoId + '_' + exercicioIdx);
    localStorage.removeItem('concluido_' + tipoId + '_' + treinoId + '_' + exercicioIdx);
}

// -------- CÁLCULO DE VOLUME --------

function calcSetVolume(set) {
    var w = parseFloat(set.weight) || 0;
    var r = parseInt(set.reps) || 0;
    return w * r;
}

function calcExerciseSummary(sets) {
    var completed = sets.filter(function(s) { return s.completed; });
    var totalReps = completed.reduce(function(a, s) { return a + (parseInt(s.reps) || 0); }, 0);
    var volume    = completed.reduce(function(a, s) { return a + calcSetVolume(s); }, 0);
    return {
        completedCount: completed.length,
        totalSets: sets.length,
        totalReps: totalReps,
        volume: volume
    };
}

function formatSetVol(set) {
    var v = calcSetVolume(set);
    if (!v) return '\u2014';
    if (v >= 1000) return (v / 1000).toFixed(1) + 't';
    return v + '\u00a0kg';
}

// -------- HISTÓRICO — BUSCA ÚLTIMO TREINO --------

function getLastSetsForExercise(exercicioNome, treinoNome) {
    try {
        var hist = JSON.parse(localStorage.getItem('marceloHistorico') || '[]');
        for (var i = 0; i < hist.length; i++) {
            var entry = hist[i];
            if (entry.nome !== treinoNome) continue;
            if (!Array.isArray(entry.exerciciosSeries)) continue;
            for (var j = 0; j < entry.exerciciosSeries.length; j++) {
                var ex = entry.exerciciosSeries[j];
                if (ex.name === exercicioNome && Array.isArray(ex.sets) && ex.sets.length > 0) {
                    return ex.sets.map(function(s) {
                        return { weight: s.weight || 0, reps: s.reps || 0, completed: false };
                    });
                }
            }
        }
    } catch(e) {}
    return null;
}

/** Coleta as séries de todos os exercícios para salvar no histórico. */
function coletarDadosSeries(tipoIndex, treinoIndex, exercicios) {
    var _ids = obterIds(tipoIndex, treinoIndex);
    return exercicios.map(function(nome, i) {
        var sets = loadSets(_ids.tipoId, _ids.treinoId, i);
        return { name: nome, sets: sets };
    });
}

// -------- RENDERIZAÇÃO --------

/**
 * Cria e retorna o elemento DOM completo para um exercício com séries.
 * Usa document.createElement para evitar XSS em nomes de exercícios.
 */
function renderExercicioComSeries(exercicioNome, exercicioIdx, tipoIndex, treinoIndex) {
    var _ids = obterIds(tipoIndex, treinoIndex);
    var sets = loadSets(_ids.tipoId, _ids.treinoId, exercicioIdx);

    var wrapper = document.createElement('div');
    wrapper.className = 'exercicio-item';
    wrapper.id = 'exItem_' + exercicioIdx;
    wrapper.dataset.exercicio = exercicioIdx;

    // Header: nome + botão concluir exercício
    var headerDiv = document.createElement('div');
    headerDiv.className = 'ex-header';

    var nomeSpan = document.createElement('span');
    nomeSpan.className = 'exercicio-nome';
    nomeSpan.textContent = exercicioNome; // textContent — sem risco de XSS

    var btnConcluir = document.createElement('button');
    btnConcluir.className = 'btn-ex-concluir';
    btnConcluir.id = 'btnExConcluir_' + exercicioIdx;
    btnConcluir.textContent = 'Concluir';
    (function(ei) {
        btnConcluir.onclick = function() { toggleExercicioConcluido(tipoIndex, treinoIndex, ei); };
    })(exercicioIdx);

    headerDiv.appendChild(nomeSpan);
    headerDiv.appendChild(btnConcluir);
    wrapper.appendChild(headerDiv);

    // Container das séries
    var setsContainer = document.createElement('div');
    setsContainer.className = 'sets-container';
    setsContainer.id = 'setsContainer_' + exercicioIdx;
    sets.forEach(function(set, si) {
        setsContainer.appendChild(createSetRow(tipoIndex, treinoIndex, exercicioIdx, si, set));
    });
    wrapper.appendChild(setsContainer);

    // Ações: + Série e Copiar último
    var actionsDiv = document.createElement('div');
    actionsDiv.className = 'sets-actions';

    var btnAdd = document.createElement('button');
    btnAdd.className = 'btn-add-set';
    btnAdd.textContent = '+ S\u00e9rie';
    (function(ei) {
        btnAdd.onclick = function() { adicionarSerie(tipoIndex, treinoIndex, ei); };
    })(exercicioIdx);

    var btnCopyLast = document.createElement('button');
    btnCopyLast.className = 'btn-copy-last';
    btnCopyLast.textContent = '\ud83d\udccb \u00daltimo treino';
    btnCopyLast.title = 'Copiar s\u00e9ries do \u00faltimo treino deste exerc\u00edcio';
    (function(ei, eName) {
        btnCopyLast.onclick = function() { copiarUltimoTreino(tipoIndex, treinoIndex, ei, eName); };
    })(exercicioIdx, exercicioNome);

    actionsDiv.appendChild(btnAdd);
    actionsDiv.appendChild(btnCopyLast);
    wrapper.appendChild(actionsDiv);

    // Resumo do exercício
    var summaryDiv = document.createElement('div');
    summaryDiv.className = 'ex-summary';
    summaryDiv.id = 'exSummary_' + exercicioIdx;
    wrapper.appendChild(summaryDiv);

    atualizarResumoExercicio(exercicioIdx, sets);
    atualizarEstadoConcluido(exercicioIdx, sets);

    return wrapper;
}

function createSetRow(tipoIndex, treinoIndex, exercicioIdx, setIdx, set) {
    var row = document.createElement('div');
    row.className = 'set-row' + (set.completed ? ' set-completed' : '');
    row.id = 'setRow_' + exercicioIdx + '_' + setIdx;

    // Número da série
    var numSpan = document.createElement('span');
    numSpan.className = 'set-num';
    numSpan.textContent = setIdx + 1;

    // Input peso
    var wInput = document.createElement('input');
    wInput.type = 'number';
    wInput.className = 'set-input set-weight';
    wInput.id = 'setW_' + exercicioIdx + '_' + setIdx;
    wInput.placeholder = 'kg';
    wInput.min = '0';
    wInput.step = '0.5';
    if (set.weight > 0) wInput.value = set.weight;
    (function(ei, si) {
        wInput.onchange = function() { onSetChange(tipoIndex, treinoIndex, ei, si, 'weight', this.value); };
    })(exercicioIdx, setIdx);

    // Unidade kg
    var unitKg = document.createElement('span');
    unitKg.className = 'set-unit';
    unitKg.textContent = 'kg';

    // Botão copiar peso da série anterior
    var btnCopyPrev = null;
    if (setIdx > 0) {
        btnCopyPrev = document.createElement('button');
        btnCopyPrev.className = 'set-btn-copy-prev';
        btnCopyPrev.title = 'Copiar peso e reps da s\u00e9rie anterior';
        btnCopyPrev.textContent = '\u2191';
        (function(ei, si) {
            btnCopyPrev.onclick = function() { copiarPesoAnterior(tipoIndex, treinoIndex, ei, si); };
        })(exercicioIdx, setIdx);
    }

    // Input reps
    var rInput = document.createElement('input');
    rInput.type = 'number';
    rInput.className = 'set-input set-reps';
    rInput.id = 'setR_' + exercicioIdx + '_' + setIdx;
    rInput.placeholder = 'reps';
    rInput.min = '0';
    rInput.step = '1';
    if (set.reps > 0) rInput.value = set.reps;
    (function(ei, si) {
        rInput.onchange = function() { onSetChange(tipoIndex, treinoIndex, ei, si, 'reps', this.value); };
    })(exercicioIdx, setIdx);

    // Volume da série
    var volSpan = document.createElement('span');
    volSpan.className = 'set-vol';
    volSpan.id = 'setVol_' + exercicioIdx + '_' + setIdx;
    volSpan.textContent = formatSetVol(set);

    // Botão marcar série concluída
    var btnDone = document.createElement('button');
    btnDone.className = 'set-btn-done' + (set.completed ? ' done' : '');
    btnDone.id = 'setBtnDone_' + exercicioIdx + '_' + setIdx;
    btnDone.title = set.completed ? 'Desmarcar s\u00e9rie' : 'Marcar s\u00e9rie como feita';
    btnDone.textContent = '\u2713';
    (function(ei, si) {
        btnDone.onclick = function() { toggleSerieConcluida(tipoIndex, treinoIndex, ei, si); };
    })(exercicioIdx, setIdx);

    // Botão remover série
    var btnDel = document.createElement('button');
    btnDel.className = 'set-btn-del';
    btnDel.title = 'Remover s\u00e9rie';
    btnDel.textContent = '\u00d7';
    (function(ei, si) {
        btnDel.onclick = function() { removerSerie(tipoIndex, treinoIndex, ei, si); };
    })(exercicioIdx, setIdx);

    row.appendChild(numSpan);
    row.appendChild(wInput);
    row.appendChild(unitKg);
    if (btnCopyPrev) row.appendChild(btnCopyPrev);
    row.appendChild(rInput);
    row.appendChild(volSpan);
    row.appendChild(btnDone);
    row.appendChild(btnDel);

    return row;
}

// -------- EVENT HANDLERS --------

function onSetChange(tipoIndex, treinoIndex, exercicioIdx, setIdx, field, value) {
    var _ids = obterIds(tipoIndex, treinoIndex);
    var sets = loadSets(_ids.tipoId, _ids.treinoId, exercicioIdx);
    if (!sets[setIdx]) return;

    if (field === 'weight') {
        var w = parseFloat(value);
        sets[setIdx].weight = (isNaN(w) || w < 0) ? 0 : w;
    } else if (field === 'reps') {
        var r = parseInt(value);
        sets[setIdx].reps = (isNaN(r) || r < 0) ? 0 : r;
    }
    saveSets(_ids.tipoId, _ids.treinoId, exercicioIdx, sets);

    var volEl = document.getElementById('setVol_' + exercicioIdx + '_' + setIdx);
    if (volEl) volEl.textContent = formatSetVol(sets[setIdx]);
    atualizarResumoExercicio(exercicioIdx, sets);
}

function toggleSerieConcluida(tipoIndex, treinoIndex, exercicioIdx, setIdx) {
    var _ids = obterIds(tipoIndex, treinoIndex);
    var sets = loadSets(_ids.tipoId, _ids.treinoId, exercicioIdx);
    if (!sets[setIdx]) return;

    sets[setIdx].completed = !sets[setIdx].completed;
    saveSets(_ids.tipoId, _ids.treinoId, exercicioIdx, sets);

    var row = document.getElementById('setRow_' + exercicioIdx + '_' + setIdx);
    var btn = document.getElementById('setBtnDone_' + exercicioIdx + '_' + setIdx);
    if (row) row.classList.toggle('set-completed', sets[setIdx].completed);
    if (btn) {
        btn.classList.toggle('done', sets[setIdx].completed);
        btn.title = sets[setIdx].completed ? 'Desmarcar s\u00e9rie' : 'Marcar s\u00e9rie como feita';
    }

    atualizarResumoExercicio(exercicioIdx, sets);
    atualizarEstadoConcluido(exercicioIdx, sets);

    // Auto-iniciar timer de descanso ao concluir uma série
    if (sets[setIdx].completed) {
        resetarTimer();
        iniciarTimer();
        mostrarNotificacao('\u23f1\ufe0f Descanso iniciado!');
    }
}

function toggleExercicioConcluido(tipoIndex, treinoIndex, exercicioIdx) {
    var _ids  = obterIds(tipoIndex, treinoIndex);
    var sets  = loadSets(_ids.tipoId, _ids.treinoId, exercicioIdx);
    var item  = document.getElementById('exItem_' + exercicioIdx);
    var btn   = document.getElementById('btnExConcluir_' + exercicioIdx);
    if (!item) return;

    var jaFeito = item.classList.contains('concluido');
    sets.forEach(function(s) { s.completed = !jaFeito; });
    saveSets(_ids.tipoId, _ids.treinoId, exercicioIdx, sets);

    item.classList.toggle('concluido', !jaFeito);
    if (btn) {
        btn.classList.toggle('concluido', !jaFeito);
        btn.textContent = !jaFeito ? '\u2713 Feito' : 'Concluir';
    }

    var container = document.getElementById('setsContainer_' + exercicioIdx);
    if (container) {
        container.querySelectorAll('.set-row').forEach(function(setRow) {
            setRow.classList.toggle('set-completed', !jaFeito);
            var btnDone = setRow.querySelector('.set-btn-done');
            if (btnDone) btnDone.classList.toggle('done', !jaFeito);
        });
    }
    atualizarResumoExercicio(exercicioIdx, sets);
    mostrarNotificacao(jaFeito ? '\u21a9\ufe0f Exerc\u00edcio desmarcado' : '\u2705 Exerc\u00edcio conclui\u0301do!');
}

function adicionarSerie(tipoIndex, treinoIndex, exercicioIdx) {
    var _ids = obterIds(tipoIndex, treinoIndex);
    var sets = loadSets(_ids.tipoId, _ids.treinoId, exercicioIdx);
    var last = sets[sets.length - 1];
    var novo = {
        weight: last ? (last.weight || 0) : 0,
        reps:   last ? (last.reps   || 0) : 0,
        completed: false
    };
    sets.push(novo);
    saveSets(_ids.tipoId, _ids.treinoId, exercicioIdx, sets);

    var container = document.getElementById('setsContainer_' + exercicioIdx);
    if (container) {
        container.appendChild(createSetRow(tipoIndex, treinoIndex, exercicioIdx, sets.length - 1, novo));
    }
    atualizarResumoExercicio(exercicioIdx, sets);
}

function removerSerie(tipoIndex, treinoIndex, exercicioIdx, setIdx) {
    var _ids = obterIds(tipoIndex, treinoIndex);
    var sets = loadSets(_ids.tipoId, _ids.treinoId, exercicioIdx);
    if (sets.length <= 1) {
        mostrarNotificacao('\u26a0\ufe0f M\u00ednimo de 1 s\u00e9rie por exerc\u00edcio', 'warning');
        return;
    }
    sets.splice(setIdx, 1);
    saveSets(_ids.tipoId, _ids.treinoId, exercicioIdx, sets);

    rerenderSetsContainer(tipoIndex, treinoIndex, exercicioIdx, sets);
    atualizarResumoExercicio(exercicioIdx, sets);
    atualizarEstadoConcluido(exercicioIdx, sets);
}

function copiarPesoAnterior(tipoIndex, treinoIndex, exercicioIdx, setIdx) {
    if (setIdx === 0) return;
    var _ids = obterIds(tipoIndex, treinoIndex);
    var sets = loadSets(_ids.tipoId, _ids.treinoId, exercicioIdx);
    if (!sets[setIdx - 1] || !sets[setIdx]) return;

    sets[setIdx].weight = sets[setIdx - 1].weight;
    sets[setIdx].reps   = sets[setIdx - 1].reps;
    saveSets(_ids.tipoId, _ids.treinoId, exercicioIdx, sets);

    var wInput = document.getElementById('setW_' + exercicioIdx + '_' + setIdx);
    var rInput = document.getElementById('setR_' + exercicioIdx + '_' + setIdx);
    var volEl  = document.getElementById('setVol_' + exercicioIdx + '_' + setIdx);
    if (wInput) wInput.value = sets[setIdx].weight || '';
    if (rInput) rInput.value = sets[setIdx].reps   || '';
    if (volEl)  volEl.textContent = formatSetVol(sets[setIdx]);

    atualizarResumoExercicio(exercicioIdx, sets);
    mostrarNotificacao('\u2191 Peso e reps copiados da s\u00e9rie anterior');
}

function copiarUltimoTreino(tipoIndex, treinoIndex, exercicioIdx, exercicioNome) {
    var treino   = todosTipos[tipoIndex].treinos[treinoIndex];
    var lastSets = getLastSetsForExercise(exercicioNome, treino.nome);
    if (!lastSets || lastSets.length === 0) {
        mostrarNotificacao('\ud83d\udccb Nenhum treino anterior encontrado', 'warning');
        return;
    }
    var _ids = obterIds(tipoIndex, treinoIndex);
    saveSets(_ids.tipoId, _ids.treinoId, exercicioIdx, lastSets);

    rerenderSetsContainer(tipoIndex, treinoIndex, exercicioIdx, lastSets);
    atualizarResumoExercicio(exercicioIdx, lastSets);
    atualizarEstadoConcluido(exercicioIdx, lastSets);
    mostrarNotificacao('\ud83d\udccb ' + lastSets.length + ' s\u00e9rie(s) copiada(s) do \u00faltimo treino');
}

function rerenderSetsContainer(tipoIndex, treinoIndex, exercicioIdx, sets) {
    var container = document.getElementById('setsContainer_' + exercicioIdx);
    if (!container) return;
    container.innerHTML = '';
    sets.forEach(function(set, si) {
        container.appendChild(createSetRow(tipoIndex, treinoIndex, exercicioIdx, si, set));
    });
}

// -------- ATUALIZA RESUMO VISUAL --------

function atualizarResumoExercicio(exercicioIdx, sets) {
    var el = document.getElementById('exSummary_' + exercicioIdx);
    if (!el) return;
    var s = calcExerciseSummary(sets);
    if (s.totalSets === 0) { el.innerHTML = ''; return; }
    var parts = [s.completedCount + '/' + s.totalSets + ' s\u00e9ries'];
    if (s.totalReps > 0) parts.push(s.totalReps + ' reps');
    if (s.volume > 0)    parts.push('<strong>' + s.volume.toLocaleString('pt-BR') + '\u00a0kg</strong> vol.');
    el.innerHTML = '<span class="ex-summary-text">' + parts.join(' &bull; ') + '</span>';
}

function atualizarEstadoConcluido(exercicioIdx, sets) {
    var item = document.getElementById('exItem_' + exercicioIdx);
    var btn  = document.getElementById('btnExConcluir_' + exercicioIdx);
    if (!item || !btn) return;
    var allDone = sets.length > 0 && sets.every(function(s) { return s.completed; });
    item.classList.toggle('concluido', allDone);
    btn.classList.toggle('concluido', allDone);
    btn.textContent = allDone ? '\u2713 Feito' : 'Concluir';
}
