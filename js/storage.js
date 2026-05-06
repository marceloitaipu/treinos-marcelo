// =============================================
//  CONTROLE DO localStorage
//  Toda leitura/escrita de dados persistentes passa por aqui.
//  Chaves: marceloTreinos, marceloHistorico,
//          peso_<tipoId>_<treinoId>_N, series_..., concluido_...
//  Dependencias: utils.js, data.js
// =============================================

function garantirIds(lista) {
    if (!Array.isArray(lista)) return;
    lista.forEach(function(tipo) {
        if (!tipo) return;
        if (!tipo.id) tipo.id = gerarId();
        if (Array.isArray(tipo.treinos)) {
            tipo.treinos.forEach(function(t) {
                if (t && !t.id) t.id = gerarId();
            });
        }
    });
}

function obterIds(tipoIndex, treinoIndex) {
    const tipo   = todosTipos[tipoIndex];
    const treino = tipo && tipo.treinos ? tipo.treinos[treinoIndex] : null;
    return {
        tipoId:   tipo   ? tipo.id   : String(tipoIndex),
        treinoId: treino ? treino.id : String(treinoIndex)
    };
}

function migrarChavesLegadas() {
    if (localStorage.getItem('marceloChavesMigradas') === 'v2') return;
    const prefixos = ['peso_', 'series_', 'concluido_'];
    const keysParaMigrar = [];
    Object.keys(localStorage).forEach(function(k) {
        prefixos.forEach(function(pfx) {
            if (k.startsWith(pfx)) {
                const partes = k.slice(pfx.length).split('_');
                if (partes.length === 3 && partes.every(function(p){ return /^\d+$/.test(p); })) {
                    keysParaMigrar.push({ key: k, pfx: pfx, partes: partes });
                }
            }
        });
    });
    keysParaMigrar.forEach(function(entry) {
        const tipoIdx   = parseInt(entry.partes[0]);
        const treinoIdx = parseInt(entry.partes[1]);
        const exIdx     = entry.partes[2];
        const tipo   = todosTipos[tipoIdx];
        const treino = tipo && tipo.treinos ? tipo.treinos[treinoIdx] : null;
        if (!tipo || !treino) return;
        const novaKey = entry.pfx + tipo.id + '_' + treino.id + '_' + exIdx;
        if (!localStorage.getItem(novaKey)) {
            localStorage.setItem(novaKey, localStorage.getItem(entry.key));
        }
        localStorage.removeItem(entry.key);
    });
    localStorage.setItem('marceloChavesMigradas', 'v2');
    console.log('✅ Migração de chaves concluída');
}

// =============================================
//  TIMER DE DESCANSO
// =============================================
let timerInterval = null;
let timerTotal    = 60;
let timerAtual    = 60;
let timerRodando  = false;


function carregarTreinosSalvos() {
    // Suporta chave nova ('marceloTreinos') e legada ('marceloTreinosV2', 'treinos')
    const raw = localStorage.getItem('marceloTreinos')
             || localStorage.getItem('marceloTreinosV2')
             || localStorage.getItem('treinos');
    if (!raw) return;
    try {
        const dados = JSON.parse(raw);
        const lista = Array.isArray(dados) ? dados : (dados.treinos || dados.tipos || []);
        if (!Array.isArray(lista) || lista.length === 0) return;
        const normalizada = normalizarExercicios(lista);
        normalizada.forEach((tipo, i) => {
            if (!tipo || !tipo.treinos) return;
            if (i < todosTipos.length) {
                todosTipos[i] = tipo;
            } else {
                todosTipos.push(tipo);
            }
        });
        // Migra histórico legado (chave 'historicoTreinos' → 'marceloHistorico')
        const histLegado = localStorage.getItem('historicoTreinos');
        if (histLegado && !localStorage.getItem('marceloHistorico')) {
            localStorage.setItem('marceloHistorico', histLegado);
        }
        console.log('✅ Treinos carregados (' + normalizada.length + ' tipos)');
    } catch (e) {
        console.warn('⚠️ Erro ao carregar treinos salvos, usando padrões');
    }
}

function salvarTodosOsTreinos() {
    localStorage.setItem('marceloTreinos', JSON.stringify(todosTipos));
}

// =============================================
//  NAVEGAÇÃO PRINCIPAL
// =============================================
function carregarTreinos() {
