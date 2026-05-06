// =============================================
//  EVOLUÇÃO — CÁLCULO DE VOLUME E PROGRESSÃO
//  Dependências: historico-detalhado.js, utils.js
//  Mostra: resumo geral, volume semanal/mensal,
//          evolução por exercício, tendência.
// =============================================

// =============================================
//  ABRIR / FECHAR MODAL
// =============================================

function verEvolucao() {
    var hist = carregarHistoricoV2();

    var modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'modal-evolucao';
    modal.addEventListener('click', function(e) {
        if (e.target === modal) _fecharEvolucao();
    });

    var conteudo = document.createElement('div');
    conteudo.className = 'modal-content modal-evolucao-content';
    conteudo.innerHTML = _buildEvolucaoHTML(hist);

    modal.appendChild(conteudo);
    document.body.appendChild(modal);

    // Selecionar primeiro exercício por padrão após render
    setTimeout(function() {
        var sel = document.getElementById('evolucao-ex-select');
        if (sel && sel.value) {
            _renderEstatExercicio(sel.value, hist);
        }
    }, 0);
}

function _fecharEvolucao() {
    var m = document.getElementById('modal-evolucao');
    if (m) m.remove();
}

// =============================================
//  EXTRAÇÃO DE DADOS DO HISTÓRICO
// =============================================

/**
 * Retorna mapa { nomeExercicio: [{date, volume, reps, maxPeso, sets}] }
 * com sessões ordenadas da mais antiga para a mais recente.
 */
function _evExtrairMapa(hist) {
    var mapa = {};
    hist.forEach(function(h) {
        if (h.version !== 2 || !Array.isArray(h.exercises)) return;
        h.exercises.forEach(function(ex) {
            if (!ex.name) return;
            var compSets = (ex.sets || []).filter(function(s) { return s.completed; });
            if (compSets.length === 0) return; // Ignora exercícios sem nenhuma série concluída
            var vol     = compSets.reduce(function(acc, s) { return acc + (s.volume || 0); }, 0);
            var reps    = compSets.reduce(function(acc, s) { return acc + (parseInt(s.reps) || 0); }, 0);
            var maxPeso = compSets.reduce(function(acc, s) { return Math.max(acc, parseFloat(s.weight) || 0); }, 0);
            if (!mapa[ex.name]) mapa[ex.name] = [];
            mapa[ex.name].push({
                date:    h.date,
                volume:  vol,
                reps:    reps,
                maxPeso: maxPeso,
                sets:    ex.sets || []
            });
        });
    });
    // Ordenar por data (mais antigo → mais recente)
    Object.keys(mapa).forEach(function(nome) {
        mapa[nome].sort(function(a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    });
    return mapa;
}

// =============================================
//  RESUMO GERAL
// =============================================

function _evResumoGeral(hist) {
    var agora   = new Date();
    var anoMes  = agora.getFullYear() + '-' + String(agora.getMonth() + 1).padStart(2, '0');
    var treinosMes = 0, volumeMes = 0, ultimoTreino = null;

    hist.forEach(function(h) {
        if (h.version !== 2) return;
        if (h.date && h.date.startsWith(anoMes)) {
            treinosMes++;
            volumeMes += (h.totalVolume || 0);
        }
        if (!ultimoTreino || h.date > ultimoTreino.date) ultimoTreino = h;
    });

    return { treinosMes: treinosMes, volumeMes: volumeMes, ultimoTreino: ultimoTreino };
}

/**
 * Exercício que mais evoluiu: maior crescimento percentual de volume
 * entre a primeira e a última sessão registrada.
 */
function _evExercicioDestaque(mapaEx) {
    var melhor = null, melhorPct = -Infinity;
    Object.keys(mapaEx).forEach(function(nome) {
        var s = mapaEx[nome];
        if (s.length < 2) return;
        var base  = s[0].volume || 1;
        var atual = s[s.length - 1].volume || 0;
        var pct   = ((atual - base) / Math.max(base, 1)) * 100;
        if (pct > melhorPct) { melhorPct = pct; melhor = nome; }
    });
    return melhor ? { nome: melhor, pct: Math.round(melhorPct) } : null;
}

// =============================================
//  TENDÊNCIA
// =============================================

/**
 * Compara médias de volume: últimas 2 sessões vs 2 anteriores.
 * Retorna: 'subindo' | 'estavel' | 'queda' | 'neutro'
 */
function _evTendencia(sessoes) {
    if (!sessoes || sessoes.length < 2) return 'neutro';
    var recentes    = sessoes.slice(-2).map(function(s) { return s.volume; });
    var anteriores  = sessoes.slice(-4, -2).map(function(s) { return s.volume; });

    var mediaRec;
    if (anteriores.length === 0) {
        // Apenas 2 sessões: compara diretamente
        var delta = recentes[1] - recentes[0];
        var base  = recentes[0] || 1;
        if (delta > base * 0.05)  return 'subindo';
        if (delta < -base * 0.05) return 'queda';
        return 'estavel';
    }
    mediaRec = recentes.reduce(function(a, b) { return a + b; }, 0) / recentes.length;
    var mediaAnt = anteriores.reduce(function(a, b) { return a + b; }, 0) / anteriores.length;
    if (mediaAnt < 1) return 'estavel';
    var pct = (mediaRec - mediaAnt) / mediaAnt;
    if (pct >  0.05) return 'subindo';
    if (pct < -0.05) return 'queda';
    return 'estavel';
}

// =============================================
//  STATS POR EXERCÍCIO
// =============================================

function _evStatsExercicio(sessoes) {
    if (!sessoes || sessoes.length === 0) return null;
    var ultima = sessoes[sessoes.length - 1];
    var maiorPeso = 0, maiorVolume = 0;
    sessoes.forEach(function(s) {
        if (s.maxPeso  > maiorPeso)   maiorPeso   = s.maxPeso;
        if (s.volume   > maiorVolume) maiorVolume = s.volume;
    });
    return {
        ultimaCarga:  ultima.maxPeso,
        ultimaReps:   ultima.reps,
        maiorCarga:   maiorPeso,
        maiorVolume:  maiorVolume,
        dataUltimo:   ultima.date,
        tendencia:    _evTendencia(sessoes)
    };
}

// =============================================
//  VOLUME / TREINOS POR SEMANA E MÊS
// =============================================

function _evISOWeek(dateStr) {
    var d    = new Date(dateStr + 'T12:00:00');
    var jan1 = new Date(d.getFullYear(), 0, 1);
    var week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
    return d.getFullYear() + '-S' + String(week).padStart(2, '0');
}

function _evMapaSemana(hist, campo) {
    var mapa = {};
    hist.forEach(function(h) {
        if (h.version !== 2 || !h.date) return;
        var key = _evISOWeek(h.date);
        mapa[key] = (mapa[key] || 0) + (campo === 'vol' ? (h.totalVolume || 0) : 1);
    });
    return mapa;
}

function _evMapaMes(hist, campo) {
    var mapa = {};
    hist.forEach(function(h) {
        if (h.version !== 2 || !h.date) return;
        var key = h.date.slice(0, 7);
        mapa[key] = (mapa[key] || 0) + (campo === 'vol' ? (h.totalVolume || 0) : 1);
    });
    return mapa;
}

// =============================================
//  HTML HELPERS
// =============================================

function _evTendBadge(tend) {
    var cfg = {
        subindo: { cls: 'evol-tend-subindo', txt: '📈 Evoluindo'       },
        estavel: { cls: 'evol-tend-estavel', txt: '➡️ Estável'         },
        queda:   { cls: 'evol-tend-queda',   txt: '📉 Queda'           },
        neutro:  { cls: 'evol-tend-neutro',  txt: '— Insuf. dados' }
    };
    var c = cfg[tend] || cfg.neutro;
    return '<span class="evol-tend-badge ' + c.cls + '">' + c.txt + '</span>';
}

function _evBarChart(keys, mapa, colorClass, labelFn) {
    if (keys.length === 0) {
        return '<p class="evol-empty">Ainda não há dados suficientes para calcular evolução.</p>';
    }
    var maxV = keys.reduce(function(m, k) { return Math.max(m, mapa[k] || 0); }, 1);
    return '<div class="evol-bar-chart">' +
        keys.map(function(k) {
            var val = mapa[k] || 0;
            var pct = Math.round((val / maxV) * 100);
            return '<div class="evol-bar-item">' +
                '<div class="evol-bar-track"><div class="evol-bar-fill ' + colorClass + '" style="height:' + pct + '%"></div></div>' +
                '<div class="evol-bar-label">' + labelFn(k) + '</div>' +
                '<div class="evol-bar-val">' + histFormatVolume(val) + '</div>' +
                '</div>';
        }).join('') +
        '</div>';
}

function _evCountChart(keys, mapa, labelFn) {
    if (keys.length === 0) {
        return '<p class="evol-empty">Ainda não há dados suficientes para calcular evolução.</p>';
    }
    return '<div class="evol-count-row">' +
        keys.map(function(k) {
            return '<div class="evol-count-item">' +
                '<span class="evol-count-val">' + (mapa[k] || 0) + '</span>' +
                '<span class="evol-count-label">' + labelFn(k) + '</span>' +
                '</div>';
        }).join('') +
        '</div>';
}

// =============================================
//  BUILD HTML DO MODAL COMPLETO
// =============================================

function _buildEvolucaoHTML(hist) {
    var v2List   = hist.filter(function(h) { return h.version === 2; });
    var mapaEx   = _evExtrairMapa(hist);
    var nomes    = Object.keys(mapaEx).sort();
    var resumo   = _evResumoGeral(hist);
    var destaque = _evExercicioDestaque(mapaEx);

    // Semanas e meses
    var semVol = _evMapaSemana(hist, 'vol');
    var semTre = _evMapaSemana(hist, 'ct');
    var mesVol = _evMapaMes(hist, 'vol');
    var mesTre = _evMapaMes(hist, 'ct');
    var semKeys = Object.keys(semVol).sort().slice(-8);
    var mesKeys = Object.keys(mesVol).sort().slice(-6);

    // Label helpers
    var semLabel = function(k) { return k.replace(/^\d{4}-/, ''); };
    var mesLabel = function(k) {
        var p = k.split('-'); return p[1] + '/' + p[0].slice(2);
    };

    // Resumo geral
    var ultNome = resumo.ultimoTreino
        ? histFormatDateBR(resumo.ultimoTreino.date) + ' · ' + esc(resumo.ultimoTreino.workoutName)
        : '—';
    var destaqueStr = destaque
        ? '<span class="evol-nome-destaque">' + esc(destaque.nome) + '</span>'
          + (destaque.pct > 0 ? ' <span class="evol-pct">+' + destaque.pct + '%</span>' : '')
        : '—';

    // Select de exercícios
    var optsHTML = nomes.length > 0
        ? nomes.map(function(n) {
            return '<option value="' + esc(n) + '">' + esc(n) + '</option>';
          }).join('')
        : '<option value="">— Sem dados —</option>';

    return '' +
        '<div class="modal-header">' +
            '<h2>📈 Evolução</h2>' +
            '<p>Progressão baseada no seu histórico de treinos</p>' +
        '</div>' +
        '<button class="evol-btn-fechar" onclick="_fecharEvolucao()" aria-label="Fechar">✕</button>' +

        // ─── Resumo Geral ───────────────────────────────────────────
        '<section class="evol-section">' +
            '<h3 class="evol-section-title">Resumo do Mês</h3>' +
            '<div class="evol-resumo-grid">' +
                '<div class="evol-stat-card">' +
                    '<span class="evol-stat-val">' + resumo.treinosMes + '</span>' +
                    '<span class="evol-stat-label">Treinos este mês</span>' +
                '</div>' +
                '<div class="evol-stat-card">' +
                    '<span class="evol-stat-val">' + histFormatVolume(resumo.volumeMes) + '</span>' +
                    '<span class="evol-stat-label">Volume este mês</span>' +
                '</div>' +
                '<div class="evol-stat-card evol-card-wide">' +
                    '<span class="evol-stat-val evol-stat-val--sm">' + destaqueStr + '</span>' +
                    '<span class="evol-stat-label">Exercício em destaque</span>' +
                '</div>' +
                '<div class="evol-stat-card evol-card-wide">' +
                    '<span class="evol-stat-val evol-stat-val--sm">' + ultNome + '</span>' +
                    '<span class="evol-stat-label">Último treino</span>' +
                '</div>' +
            '</div>' +
        '</section>' +

        // ─── Volume Semanal ─────────────────────────────────────────
        '<section class="evol-section">' +
            '<h3 class="evol-section-title">Volume Semanal <span class="evol-sub">(últimas 8 semanas)</span></h3>' +
            (semKeys.length > 0
                ? _evBarChart(semKeys, semVol, '', semLabel)
                : '<p class="evol-empty">Ainda não há dados suficientes para calcular evolução.</p>') +
        '</section>' +

        // ─── Volume Mensal ──────────────────────────────────────────
        '<section class="evol-section">' +
            '<h3 class="evol-section-title">Volume Mensal <span class="evol-sub">(últimos 6 meses)</span></h3>' +
            (mesKeys.length > 0
                ? _evBarChart(mesKeys, mesVol, 'evol-bar-fill--mes', mesLabel)
                : '<p class="evol-empty">Ainda não há dados suficientes para calcular evolução.</p>') +
        '</section>' +

        // ─── Treinos por Mês ────────────────────────────────────────
        '<section class="evol-section">' +
            '<h3 class="evol-section-title">Treinos por Mês</h3>' +
            _evCountChart(mesKeys, mesTre, mesLabel) +
        '</section>' +

        // ─── Treinos por Semana ─────────────────────────────────────
        '<section class="evol-section">' +
            '<h3 class="evol-section-title">Treinos por Semana <span class="evol-sub">(últimas 8 semanas)</span></h3>' +
            _evCountChart(semKeys, semTre, semLabel) +
        '</section>' +

        // ─── Evolução por Exercício ─────────────────────────────────
        '<section class="evol-section">' +
            '<h3 class="evol-section-title">Evolução por Exercício</h3>' +
            (nomes.length === 0
                ? '<p class="evol-empty">Ainda não há dados suficientes para calcular evolução.</p>'
                : '<div class="evol-ex-selector">' +
                      '<label for="evolucao-ex-select">Selecionar exercício:</label>' +
                      '<select id="evolucao-ex-select" onchange="_renderEstatExercicio(this.value, null)">' +
                          optsHTML +
                      '</select>' +
                  '</div>' +
                  '<div id="evolucao-ex-detalhe"></div>'
            ) +
        '</section>';
}

// =============================================
//  DETALHES DO EXERCÍCIO SELECIONADO
// =============================================

function _renderEstatExercicio(exNome, histParam) {
    var hist    = histParam || carregarHistoricoV2();
    var mapaEx  = _evExtrairMapa(hist);
    var sessoes = mapaEx[exNome];
    var div     = document.getElementById('evolucao-ex-detalhe');
    if (!div) return;

    if (!sessoes || sessoes.length === 0) {
        div.innerHTML = '<p class="evol-empty">Ainda não há dados suficientes para calcular evolução.</p>';
        return;
    }

    var stats = _evStatsExercicio(sessoes);

    // ── Stats Cards ──────────────────────────────────────────────
    var statsHTML =
        '<div class="evol-ex-stats">' +
            '<div class="evol-ex-stat">' +
                '<span class="evol-ex-val">' + (stats.ultimaCarga > 0 ? stats.ultimaCarga + ' kg' : '—') + '</span>' +
                '<span class="evol-ex-label">Última carga</span>' +
            '</div>' +
            '<div class="evol-ex-stat">' +
                '<span class="evol-ex-val">' + (stats.maiorCarga > 0 ? stats.maiorCarga + ' kg' : '—') + '</span>' +
                '<span class="evol-ex-label">Maior carga</span>' +
            '</div>' +
            '<div class="evol-ex-stat">' +
                '<span class="evol-ex-val">' + histFormatVolume(stats.maiorVolume) + '</span>' +
                '<span class="evol-ex-label">Melhor volume</span>' +
            '</div>' +
            '<div class="evol-ex-stat">' +
                '<span class="evol-ex-val">' + (stats.ultimaReps > 0 ? stats.ultimaReps + ' reps' : '—') + '</span>' +
                '<span class="evol-ex-label">Últimas reps</span>' +
            '</div>' +
            '<div class="evol-ex-stat">' +
                '<span class="evol-ex-val evol-ex-val--date">' + histFormatDateBR(stats.dataUltimo) + '</span>' +
                '<span class="evol-ex-label">Último treino</span>' +
            '</div>' +
            '<div class="evol-ex-stat evol-ex-stat--tend">' +
                _evTendBadge(stats.tendencia) +
                '<span class="evol-ex-label">Tendência</span>' +
            '</div>' +
        '</div>';

    // ── Tabela de Registros (mais recente primeiro) ──────────────
    var rows = sessoes.slice().reverse().map(function(s) {
        var compCount = s.sets.filter(function(x) { return x.completed; }).length;
        return '<tr>' +
            '<td>' + histFormatDateBR(s.date) + '</td>' +
            '<td>' + compCount + '</td>' +
            '<td>' + (s.reps > 0 ? s.reps : '—') + '</td>' +
            '<td>' + (s.maxPeso > 0 ? s.maxPeso + ' kg' : '—') + '</td>' +
            '<td class="evol-td-vol">' + histFormatVolume(s.volume) + '</td>' +
        '</tr>';
    }).join('');

    var tabelaHTML =
        '<div class="evol-tabela-wrap">' +
            '<table class="evol-tabela">' +
                '<thead><tr>' +
                    '<th>Data</th><th>Séries</th><th>Reps</th><th>Carga máx.</th><th>Volume</th>' +
                '</tr></thead>' +
                '<tbody>' + rows + '</tbody>' +
            '</table>' +
        '</div>';

    // ── Mini Gráfico Canvas ───────────────────────────────────────
    var canvasHTML =
        '<div class="evol-canvas-wrap">' +
            '<p class="evol-canvas-title">Volume por sessão</p>' +
            '<canvas id="canvas-evol-ex" height="100"></canvas>' +
        '</div>';

    div.innerHTML = statsHTML + tabelaHTML + canvasHTML;

    // Desenhar após DOM update
    setTimeout(function() {
        _evDesenharCanvas('canvas-evol-ex', sessoes);
    }, 0);
}

// =============================================
//  CANVAS — GRÁFICO DE BARRAS + LINHA
// =============================================

function _evDesenharCanvas(canvasId, sessoes) {
    var canvas = document.getElementById(canvasId);
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext('2d');
    var W   = canvas.parentElement ? canvas.parentElement.clientWidth : 300;
    var H   = 120;
    canvas.width  = W;
    canvas.height = H;

    var vols  = sessoes.map(function(s) { return s.volume || 0; });
    var maxV  = Math.max.apply(null, vols.concat([1]));
    var n     = vols.length;

    var padL  = 8, padR = 8, padT = 8, padB = 24;
    var chartW = W - padL - padR;
    var chartH = H - padT - padB;

    // Fundo
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.fillRect(0, 0, W, H);

    // Linhas de grade (3 horizontais)
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
    ctx.lineWidth   = 1;
    for (var g = 1; g <= 3; g++) {
        var gy = padT + chartH - (chartH * g / 3);
        ctx.beginPath();
        ctx.moveTo(padL, gy);
        ctx.lineTo(W - padR, gy);
        ctx.stroke();
    }

    var slotW = chartW / Math.max(n, 1);
    var barW  = Math.max(4, slotW * 0.5);

    // Linha de tendência
    if (n >= 2) {
        ctx.beginPath();
        vols.forEach(function(v, i) {
            var cx = padL + i * slotW + slotW / 2;
            var cy = padT + chartH - (v / maxV) * chartH;
            if (i === 0) ctx.moveTo(cx, cy);
            else         ctx.lineTo(cx, cy);
        });
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth   = 2;
        ctx.stroke();
    }

    // Barras
    vols.forEach(function(v, i) {
        var cx  = padL + i * slotW + slotW / 2;
        var bH  = Math.max(3, (v / maxV) * chartH);
        var x   = cx - barW / 2;
        var y   = padT + chartH - bH;
        var isLast = (i === n - 1);

        ctx.fillStyle = isLast ? '#38BDF8' : 'rgba(99, 102, 241, 0.75)';
        ctx.fillRect(Math.round(x), Math.round(y), Math.round(barW), Math.round(bH));

        // Ponto de destaque na barra mais recente
        if (isLast) {
            ctx.beginPath();
            ctx.arc(cx, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#7DD3FC';
            ctx.fill();
        }

        // Label de data abaixo
        if (sessoes[i] && sessoes[i].date) {
            var parts = sessoes[i].date.split('-');
            var lbl   = parts.length === 3 ? parts[2] + '/' + parts[1] : sessoes[i].date;
            var fontSize = Math.max(8, Math.min(11, Math.floor(slotW) - 2));
            ctx.fillStyle  = 'rgba(148, 163, 184, 0.75)';
            ctx.font       = fontSize + 'px Inter,sans-serif';
            ctx.textAlign  = 'center';
            ctx.fillText(lbl, cx, H - 6);
        }
    });
}
