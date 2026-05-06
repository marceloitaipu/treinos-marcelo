// =============================================
//  DASHBOARD INICIAL
//  Renderiza resumo motivador acima da lista de treinos.
//  Dependências: utils.js, historico-detalhado.js, evolucao.js
// =============================================

// =============================================
//  ENTRADA PÚBLICA
// =============================================

function renderDashboard() {
    var container = document.getElementById('dashboard');
    if (!container) return;
    var hist = carregarHistoricoV2();
    container.innerHTML = _dashBuildHTML(hist);
}

// =============================================
//  COLETA DE DADOS
// =============================================

/** Retorna início (segunda-feira) e fim (domingo) da semana atual */
function _dashSemana() {
    var now = new Date();
    var dow = (now.getDay() + 6) % 7; // 0=seg … 6=dom
    var seg = new Date(now);
    seg.setDate(now.getDate() - dow);
    seg.setHours(0, 0, 0, 0);
    var dom = new Date(seg);
    dom.setDate(seg.getDate() + 6);
    dom.setHours(23, 59, 59, 999);
    return { inicioISO: seg.toISOString().slice(0, 10), fimISO: dom.toISOString().slice(0, 10) };
}

function _dashResumoSemana(hist) {
    var s = _dashSemana();
    var treinos = 0, volume = 0, series = 0, durMin = 0;
    hist.forEach(function(h) {
        if (h.version !== 2 || !h.date) return;
        if (h.date < s.inicioISO || h.date > s.fimISO) return;
        treinos++;
        volume += h.totalVolume     || 0;
        series += h.completedSets   || 0;
        durMin += h.durationMinutes || 0;
    });
    return { treinos: treinos, volume: volume, series: series, durMin: durMin };
}

function _dashUltimoTreino(hist) {
    var v2 = hist.filter(function(h) { return h.version === 2; });
    return v2.length > 0 ? v2[0] : null;
}

/**
 * Sugere o próximo treino com base no último registrado.
 * Avança para o próximo na mesma sequência do tipo.
 */
function _dashProximoTreino() {
    var hist = carregarHistoricoV2();
    if (!todosTipos || !todosTipos.length) return null;

    // Estado vazio: sugere treino A do tipo atual
    if (!hist.length) {
        var ti0 = tipoAtualIndex || 0;
        var t0  = todosTipos[ti0];
        if (!t0 || !t0.treinos.length) return null;
        return { tipoIndex: ti0, treinoIndex: 0, tipoNome: t0.nome, treinoNome: t0.treinos[0].nome, treinoDesc: t0.treinos[0].descricao || '' };
    }

    var ultimo     = hist[0];
    var tipoIdx    = tipoAtualIndex || 0;
    var treinoIdx  = 0;
    var encontrou  = false;

    todosTipos.forEach(function(tipo, ti) {
        tipo.treinos.forEach(function(treino, tni) {
            if (!encontrou && treino.nome === ultimo.workoutName && tipo.nome === ultimo.workoutTypeName) {
                tipoIdx   = ti;
                treinoIdx = (tni + 1) % tipo.treinos.length;
                encontrou = true;
            }
        });
    });

    var tipo   = todosTipos[tipoIdx];
    var treino = tipo ? tipo.treinos[treinoIdx] : null;
    if (!treino) return null;

    return {
        tipoIndex:   tipoIdx,
        treinoIndex: treinoIdx,
        tipoNome:    tipo.nome,
        treinoNome:  treino.nome,
        treinoDesc:  treino.descricao || ''
    };
}

function _dashMensagem(hist) {
    if (!hist.length) return { tipo: 'neutro', texto: '👋 Bem-vindo! Comece seu primeiro treino e registre sua evolução.' };

    var ultimo   = hist[0];
    var hoje     = new Date().toISOString().slice(0, 10);
    var diffDias = Math.round((new Date(hoje) - new Date(ultimo.date || hoje)) / 86400000);

    if (diffDias === 0) return { tipo: 'ok',    texto: '✅ Treino de hoje registrado. Ótimo trabalho!' };
    if (diffDias === 1) return { tipo: 'neutro', texto: '💪 Você treinou ontem. Hoje pode ser um bom dia para treinar.' };
    if (diffDias <= 3)  return { tipo: 'warn',   texto: '⏰ Você está há ' + diffDias + ' dias sem registrar treino.' };
    return              { tipo: 'alert',          texto: '🔔 Você está há ' + diffDias + ' dias sem registrar treino. Vamos lá!' };
}

function _dashEvolucaoRapida(hist) {
    if (typeof _evExtrairMapa !== 'function') return null;
    var mapa  = _evExtrairMapa(hist);
    var nomes = Object.keys(mapa);
    if (!nomes.length) return null;

    // Exercício mais recente
    var maisRecenteNome = null, maisRecenteData = '';
    nomes.forEach(function(n) {
        var s  = mapa[n];
        var dt = s[s.length - 1].date || '';
        if (dt > maisRecenteData) { maisRecenteData = dt; maisRecenteNome = n; }
    });

    // Exercício com maior evolução (% volume)
    var destaque = (typeof _evExercicioDestaque === 'function') ? _evExercicioDestaque(mapa) : null;

    // Maior carga nas últimas 3 sessões por exercício
    var maiorCargaNome = null, maiorCargaVal = 0;
    nomes.forEach(function(n) {
        mapa[n].slice(-3).forEach(function(s) {
            if ((s.maxPeso || 0) > maiorCargaVal) { maiorCargaVal = s.maxPeso; maiorCargaNome = n; }
        });
    });

    return {
        destaque:    destaque,
        maisRecente: maisRecenteNome ? { nome: maisRecenteNome, data: maisRecenteData } : null,
        maiorCarga:  maiorCargaNome  ? { nome: maiorCargaNome,  peso: maiorCargaVal    } : null
    };
}

// =============================================
//  BUILDERS HTML
// =============================================

function _dashBuildHTML(hist) {
    var v2Count   = hist.filter(function(h) { return h.version === 2; }).length;
    var semana    = _dashResumoSemana(hist);
    var ultimo    = _dashUltimoTreino(hist);
    var proximo   = _dashProximoTreino();
    var msg       = _dashMensagem(hist);
    var evolRap   = _dashEvolucaoRapida(hist);

    return (
        '<div class="dash-wrapper">' +
            _dashBanner(msg) +
            '<div class="dash-grid-top">' +
                _dashCardProximo(proximo) +
                _dashCardSemana(semana, v2Count === 0) +
            '</div>' +
            _dashCardUltimo(ultimo) +
            _dashCardEvolucao(evolRap) +
            _dashAtalhos() +
        '</div>'
    );
}

// ── Banner inteligente ──────────────────────────────────────

function _dashBanner(msg) {
    if (!msg || !msg.texto) return '';
    return '<div class="dash-banner dash-banner--' + msg.tipo + '">' + esc(msg.texto) + '</div>';
}

// ── Card: Próximo treino ────────────────────────────────────

function _dashCardProximo(p) {
    if (!p) {
        return '<div class="dash-card dash-card--prox dash-card--vazio">' +
            '<span class="dash-eyebrow">🎯 Próximo treino</span>' +
            '<p class="dash-vazio-txt">Cadastre um treino para começar.</p>' +
            '</div>';
    }
    var descHTML = p.treinoDesc
        ? '<p class="dash-prox-desc">' + esc(p.treinoDesc) + '</p>'
        : '';
    return (
        '<div class="dash-card dash-card--prox">' +
            '<span class="dash-eyebrow">🎯 Próximo treino</span>' +
            '<div class="dash-prox-nome">' + esc(p.treinoNome) + '</div>' +
            descHTML +
            '<span class="dash-prox-tipo-badge">' + esc(p.tipoNome) + '</span>' +
            '<button class="dash-btn-primary" ' +
                'onclick="_dashIniciarProximo(' + p.tipoIndex + ',' + p.treinoIndex + ')">' +
                '▶ Iniciar agora' +
            '</button>' +
        '</div>'
    );
}

// ── Card: Resumo da semana ──────────────────────────────────

function _dashCardSemana(r, vazio) {
    var header = '<span class="dash-eyebrow">📅 Esta semana</span>';
    if (vazio || r.treinos === 0) {
        return '<div class="dash-card dash-card--semana">' +
            header +
            '<p class="dash-vazio-txt">Nenhum treino esta semana ainda.</p>' +
            '</div>';
    }
    var durStr = r.durMin > 0 ? histFormatDuration(r.durMin) : '—';
    return (
        '<div class="dash-card dash-card--semana">' +
            header +
            '<div class="dash-semana-grid">' +
                _dashStatItem(r.treinos,                   'Treinos',  'primary') +
                _dashStatItem(histFormatVolume(r.volume),  'Volume',   'sky')     +
                _dashStatItem(r.series,                    'Séries',   'green')   +
                _dashStatItem(durStr,                      'Duração',  'muted')   +
            '</div>' +
        '</div>'
    );
}

function _dashStatItem(val, label, color) {
    return (
        '<div class="dash-stat dash-stat--' + color + '">' +
            '<span class="dash-stat-val">' + esc(String(val)) + '</span>' +
            '<span class="dash-stat-lbl">' + esc(label) + '</span>' +
        '</div>'
    );
}

// ── Card: Último treino ─────────────────────────────────────

function _dashCardUltimo(h) {
    if (!h) {
        return '<div class="dash-card dash-card--ultimo">' +
            '<span class="dash-eyebrow">🕐 Último treino</span>' +
            '<p class="dash-vazio-txt">Nenhum treino registrado ainda.</p>' +
            '</div>';
    }
    var durStr = histFormatDuration(h.durationMinutes) || '—';
    var vol    = histFormatVolume(h.totalVolume);
    var data   = histFormatDateBR(h.date);
    var hora   = histFormatTime(h.startedAt);
    var idSafe = esc(h.id || '');

    return (
        '<div class="dash-card dash-card--ultimo">' +
            '<span class="dash-eyebrow">🕐 Último treino</span>' +
            '<div class="dash-ult-nome">' + esc(h.workoutName) + '</div>' +
            '<div class="dash-ult-meta">' +
                '<span class="dash-ult-data">' + data + (hora ? ' · ' + hora : '') + '</span>' +
                '<span class="dash-badge dash-badge--dur">⏱ ' + esc(durStr) + '</span>' +
                '<span class="dash-badge dash-badge--vol">🏋 ' + esc(vol) + '</span>' +
            '</div>' +
            '<button class="dash-btn-sec" onclick="verDetalhesTreino(\'' + idSafe + '\')">' +
                '📊 Ver detalhes' +
            '</button>' +
        '</div>'
    );
}

// ── Card: Evolução rápida ───────────────────────────────────

function _dashCardEvolucao(e) {
    var header = '<span class="dash-eyebrow">📈 Evolução rápida</span>';
    if (!e || (!e.destaque && !e.maisRecente && !e.maiorCarga)) {
        return '<div class="dash-card dash-card--evolucao">' +
            header +
            '<p class="dash-vazio-txt">Complete mais treinos para ver sua evolução aqui.</p>' +
            '</div>';
    }

    var items = '';

    if (e.destaque) {
        var pctBadge = e.destaque.pct > 0
            ? '<span class="dash-ev-badge dash-ev-badge--green">+' + e.destaque.pct + '%</span>'
            : '';
        items += _dashEvItem('🏆', 'Maior evolução', esc(e.destaque.nome) + ' ' + pctBadge);
    }

    if (e.maisRecente) {
        items += _dashEvItem('🔥', 'Feito mais recentemente',
            esc(e.maisRecente.nome) +
            '<span class="dash-ev-data"> · ' + histFormatDateBR(e.maisRecente.data) + '</span>');
    }

    if (e.maiorCarga) {
        items += _dashEvItem('💪', 'Maior carga recente',
            esc(e.maiorCarga.nome) +
            '<span class="dash-ev-badge dash-ev-badge--sky"> ' + e.maiorCarga.peso + ' kg</span>');
    }

    return (
        '<div class="dash-card dash-card--evolucao">' +
            header +
            '<div class="dash-ev-list">' + items + '</div>' +
            '<button class="dash-btn-sec" onclick="verEvolucao()">Ver evolução completa →</button>' +
        '</div>'
    );
}

function _dashEvItem(icon, label, conteudo) {
    return (
        '<div class="dash-ev-item">' +
            '<span class="dash-ev-icon">' + icon + '</span>' +
            '<div class="dash-ev-body">' +
                '<span class="dash-ev-label">' + esc(label) + '</span>' +
                '<span class="dash-ev-nome">' + conteudo + '</span>' +
            '</div>' +
        '</div>'
    );
}

// ── Atalhos rápidos ─────────────────────────────────────────

function _dashAtalhos() {
    return (
        '<div class="dash-atalhos">' +
            '<button class="dash-atl dash-atl--treino"   onclick="_dashScrollTreinos()">🏋<span>Treinos</span></button>' +
            '<button class="dash-atl dash-atl--hist"     onclick="verHistorico()">📊<span>Histórico</span></button>' +
            '<button class="dash-atl dash-atl--evolucao" onclick="verEvolucao()">📈<span>Evolução</span></button>' +
            '<button class="dash-atl dash-atl--backup"   onclick="exportarBackup()">💾<span>Backup</span></button>' +
        '</div>'
    );
}

// =============================================
//  AÇÕES
// =============================================

function _dashIniciarProximo(tipoIndex, treinoIndex) {
    tipoAtualIndex = tipoIndex;
    selecionarTipo(tipoIndex);
    var el = document.getElementById('treinosContainer');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(function() { iniciarTreino(treinoIndex); }, 200);
}

function _dashScrollTreinos() {
    var el = document.getElementById('tipoSelector');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
