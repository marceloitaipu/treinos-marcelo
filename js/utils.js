// =============================================
//  UTILITÁRIOS GLOBAIS + ESTADO DA APLICAÇÃO
//  Carregado PRIMEIRO de todos os módulos JS
//  Dependências: nenhuma
// =============================================

// --- Estado da navegação (acessível por todos os módulos) ---
let tipoAtualIndex    = 0;       // índice do tipo de treino selecionado
let modalTreinoAberto = null;    // { tipoIndex, treinoIndex } | null

// =============================================
//  UTILITÁRIOS DE SEGURANÇA
// =============================================
function esc(str) {
    // Escapa texto para inserção segura em HTML (previne XSS)
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

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

