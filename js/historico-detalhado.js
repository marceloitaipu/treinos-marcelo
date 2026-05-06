// =============================================
//  HISTÓRICO DETALHADO V2 — CAMADA DE DADOS
//  Formato rico por sessão de treino.
//  localStorage key: marceloHistoricoV2 (array JSON, max 100)
//  Dependências: utils.js, storage.js, series.js
// =============================================

var HIST_V2_KEY = 'marceloHistoricoV2';
var HIST_V2_MAX = 100;

// ---- ID ----

function gerarHistId() {
    var d   = new Date();
    var pad = function(n) { return n < 10 ? '0' + n : '' + n; };
    return 'hist_' + d.getFullYear() + '_' + pad(d.getMonth() + 1) + '_' + pad(d.getDate()) + '_' + Date.now().toString(36);
}

// ---- BUILD ----

/**
 * Constrói registro V2 completo para um treino finalizado.
 * @param {number} tipoIndex
 * @param {number} treinoIndex
 * @param {Date|null} startedAt  — quando o treino foi iniciado
 * @returns {object}
 */
function construirRegistroV2(tipoIndex, treinoIndex, startedAt) {
    var tipo   = todosTipos[tipoIndex];
    var treino = tipo.treinos[treinoIndex];
    var _ids   = obterIds(tipoIndex, treinoIndex);

    var finAt  = new Date();
    var stAt   = (startedAt instanceof Date && !isNaN(startedAt)) ? startedAt : finAt;
    var durMin = Math.max(0, Math.round((finAt - stAt) / 60000));

    var totalVolume   = 0;
    var totalSets     = 0;
    var totalCompSets = 0;
    var totalReps     = 0;

    var exercises = treino.exercicios.map(function(nome, i) {
        var rawSets = loadSets(_ids.tipoId, _ids.treinoId, i);
        var exVol  = 0;
        var exReps = 0;
        var exComp = 0;

        var setsOut = rawSets.map(function(s, si) {
            var w = parseFloat(s.weight) || 0;
            var r = parseInt(s.reps)     || 0;
            var v = s.completed ? (w * r) : 0;
            if (s.completed) { exVol += v; exReps += r; exComp++; }
            return { setNumber: si + 1, weight: w, reps: r, completed: !!s.completed, volume: v };
        });

        totalVolume   += exVol;
        totalSets     += rawSets.length;
        totalCompSets += exComp;
        totalReps     += exReps;

        return {
            name:          nome,
            totalVolume:   exVol,
            completedSets: exComp,
            totalReps:     exReps,
            sets:          setsOut
        };
    });

    return {
        id:              gerarHistId(),
        version:         2,
        date:            stAt.toISOString().slice(0, 10),
        startedAt:       stAt.toISOString(),
        finishedAt:      finAt.toISOString(),
        durationMinutes: durMin,
        workoutTypeName: tipo  ? tipo.nome   : '',
        workoutName:     treino ? treino.nome : '',
        totalVolume:     totalVolume,
        totalSets:       totalSets,
        completedSets:   totalCompSets,
        totalReps:       totalReps,
        exercises:       exercises
    };
}

// ---- STORAGE V2 ----

function salvarHistoricoV2(registro) {
    var hist = carregarHistoricoV2();
    hist.unshift(registro);
    if (hist.length > HIST_V2_MAX) hist.length = HIST_V2_MAX;
    localStorage.setItem(HIST_V2_KEY, JSON.stringify(hist));
}

function carregarHistoricoV2() {
    try { return JSON.parse(localStorage.getItem(HIST_V2_KEY) || '[]'); }
    catch(e) { return []; }
}

function excluirRegistroV2(id) {
    var novo = carregarHistoricoV2().filter(function(h) { return h.id !== id; });
    localStorage.setItem(HIST_V2_KEY, JSON.stringify(novo));
}

function excluirRegistroV1(v1Key) {
    try {
        var hist = JSON.parse(localStorage.getItem('marceloHistorico') || '[]');
        var novo = hist.filter(function(h) { return (h.data + '__' + h.nome) !== v1Key; });
        localStorage.setItem('marceloHistorico', JSON.stringify(novo));
    } catch(e) {}
}

// ---- MERGE V1 + V2 ----

/**
 * Retorna lista combinada: V2 primeiro, depois entradas V1 sem duplicata.
 * Cada entrada V1 recebe { version:1, _v1Key, date (ISO), ... }.
 */
function carregarHistoricoCompleto() {
    var v2 = carregarHistoricoV2();

    // Índice de pares já presentes no V2
    var v2Index = {};
    v2.forEach(function(h) { v2Index[h.date + '||' + h.workoutName] = true; });

    var v1raw = [];
    try { v1raw = JSON.parse(localStorage.getItem('marceloHistorico') || '[]'); } catch(e) {}

    var v1list = v1raw.map(function(h) {
        if (h.version >= 2) return null; // não deveria estar aqui

        // Converter data pt-BR "dd/mm/yyyy, HH:MM:SS" → "yyyy-mm-dd"
        var rawData  = (h.data || '').split(',')[0].trim();
        var parts    = rawData.split('/');
        var isoDate  = parts.length === 3
            ? parts[2].trim() + '-' + parts[1].trim() + '-' + parts[0].trim()
            : rawData;

        return {
            version:         1,
            _v1Key:          h.data + '__' + h.nome,
            id:              'v1__' + h.data + '__' + h.nome,
            date:            isoDate,
            dataBR:          h.data || '',
            workoutTypeName: h.tipo || '',
            workoutName:     h.nome || '',
            exercicios:      Array.isArray(h.exercicios) ? h.exercicios : [],
            exerciciosSeries: h.exerciciosSeries || null
        };
    }).filter(function(h) {
        if (!h) return false;
        return !v2Index[h.date + '||' + h.workoutName];
    });

    return v2.concat(v1list);
}

// ---- FORMAT HELPERS ----

function histFormatDuration(min) {
    if (!min || min < 1) return null;
    if (min < 60) return min + 'min';
    var h = Math.floor(min / 60);
    var m = min % 60;
    return h + 'h' + (m > 0 ? (m < 10 ? '0' : '') + m + 'min' : '');
}

function histFormatVolume(vol) {
    if (!vol || vol < 1) return '\u2014';
    if (vol >= 1000) return (vol / 1000).toFixed(1).replace('.', ',') + 't';
    return vol.toLocaleString('pt-BR') + '\u00a0kg';
}

function histFormatDateBR(isoDate) {
    if (!isoDate) return '';
    var p = isoDate.split('-');
    return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : isoDate;
}

function histFormatTime(isoStr) {
    if (!isoStr) return '';
    try {
        return new Date(isoStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch(e) { return ''; }
}
