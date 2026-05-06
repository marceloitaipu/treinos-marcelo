// =============================================
//  BACKUP E IMPORTACAO
//  Exporta/importa todos os dados do app em formato JSON.
//  Formato do backup: { versao, data, treinos, historico, pesos }
//  Compativel com formatos legados (v1, v2, v3.x)
//  Dependencias: utils.js, storage.js, data.js, treinos.js
// =============================================

function exportarBackup() {
    const dados = {
        versao: '3.0',
        data: new Date().toISOString(),
        treinos: todosTipos,
        historico:   JSON.parse(localStorage.getItem('marceloHistorico')  || '[]'),
        historicoV2: JSON.parse(localStorage.getItem(HIST_V2_KEY)         || '[]'),
        pesos: {}
    };
    // Exportar pesos legados e séries (novo formato)
    Object.keys(localStorage).forEach(k => {
        if (k.startsWith('peso_') || k.startsWith('concluido_') ||
            k.startsWith('series_') || k.startsWith('sets_')) {
            dados.pesos[k] = localStorage.getItem(k);
        }
    });

    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    const dataStr = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    a.href     = url;
    a.download = `treinos-backup-${dataStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    mostrarNotificacao('💾 Backup exportado com sucesso!');
}

function importarBackup() {
    document.getElementById('inputImportacao').click();
}

function processarImportacao(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const dados = JSON.parse(e.target.result);

            // Suporta três formatos:
            // 1) Novo: { versao, treinos: [...], historico, pesos }
            // 2) Legado: { tipos: [...] } ou { treinos: [...] } sem versao
            // 3) Array puro: [{nome, treinos:[...]}, ...]
            let listaTreinos, historicoImport, pesosImport;

            if (Array.isArray(dados)) {
                listaTreinos  = dados;
                historicoImport = null;
                pesosImport   = null;
            } else if (dados.treinos && Array.isArray(dados.treinos)) {
                listaTreinos  = dados.treinos;
                historicoImport = dados.historico || null;
                pesosImport   = dados.pesos     || null;
                // Formato v3.x: histórico dentro do objeto localStorage
                if (!historicoImport && dados.localStorage && dados.localStorage.historicoTreinos) {
                    try { historicoImport = JSON.parse(dados.localStorage.historicoTreinos); } catch(e) {}
                }
                // Formato v3.x: pesos/concluidos dentro do objeto localStorage
                if (!pesosImport && dados.localStorage) {
                    pesosImport = {};
                    Object.entries(dados.localStorage).forEach(([k, v]) => {
                        if (k.startsWith('peso_') || k.startsWith('concluido_') || k.startsWith('series_')) {
                            pesosImport[k] = v;
                        }
                    });
                    if (Object.keys(pesosImport).length === 0) pesosImport = null;
                }
            } else if (dados.tipos && Array.isArray(dados.tipos)) {
                listaTreinos  = dados.tipos;
                historicoImport = dados.historico || null;
                pesosImport   = dados.pesos     || null;
            } else {
                mostrarNotificacao('❌ Arquivo de backup inválido!', 'error');
                event.target.value = '';
                return;
            }

            // Normaliza exercícios e garante IDs nos tipos/treinos importados
            listaTreinos = normalizarExercicios(listaTreinos);
            garantirIds(listaTreinos);

            // Validação mínima: ao menos 1 tipo com array de treinos
            const validos = listaTreinos.filter(t => t && Array.isArray(t.treinos));
            if (validos.length === 0) {
                mostrarNotificacao('❌ Backup não contém treinos válidos!', 'error');
                event.target.value = '';
                return;
            }

            const dataStr = dados.data
                ? new Date(dados.data).toLocaleString('pt-BR')
                : 'versão antiga';

            if (!confirm(`Restaurar backup de ${dataStr}?\n\n${validos.length} tipo(s) encontrado(s). Isso vai substituir os dados atuais.`)) {
                event.target.value = '';
                return;
            }

            // Limpar chaves antigas de progresso antes de restaurar
            Object.keys(localStorage).forEach(k => {
                if (k.startsWith('peso_') || k.startsWith('series_') ||
                    k.startsWith('concluido_') || k.startsWith('sets_')) {
                    localStorage.removeItem(k);
                }
            });

            // Restaurar treinos
            todosTipos.length = 0;
            listaTreinos.forEach((tipo, i) => {
                if (!tipo || !tipo.treinos) return;
                todosTipos[i] = tipo;
            });
            salvarTodosOsTreinos();

            // Restaurar histórico V1 legado
            if (historicoImport) {
                const hist = Array.isArray(historicoImport) ? historicoImport : [];
                localStorage.setItem('marceloHistorico', JSON.stringify(hist));
            }

            // Restaurar histórico V2 (se existir no backup)
            if (dados.historicoV2 && Array.isArray(dados.historicoV2) && dados.historicoV2.length > 0) {
                localStorage.setItem(HIST_V2_KEY, JSON.stringify(dados.historicoV2));
            }

            // Restaurar pesos/séries/concluídos (se disponível)
            if (pesosImport) {
                Object.entries(pesosImport).forEach(([k, v]) => {
                    localStorage.setItem(k, v);
                });
            }

            // Re-executa migração para tratar chaves legadas do backup
            localStorage.removeItem('marceloChavesMigradas');
            migrarChavesLegadas();
            carregarTreinos();
            mostrarNotificacao('📂 Backup restaurado com sucesso! (' + validos.length + ' tipos)');
        } catch (err) {
            mostrarNotificacao('❌ Erro ao ler arquivo de backup!', 'error');
        }
        event.target.value = '';
    };
    reader.readAsText(file);
}

// =============================================
//  NOVO TIPO DE TREINO
// =============================================
function novoTipoTreino() {
