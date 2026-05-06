// =============================================
//  TIMER DE DESCANSO
//  Controla o temporizador exibido dentro do modal de treino.
//  Estado: timerInterval, timerTotal, timerAtual, timerRodando
//  Dependencias: utils.js (mostrarNotificacao)
// =============================================

// --- Estado do timer ---
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

function criarTimerHTML(descansoSugerido) {
    const seg = descansoSugerido || 60;
    return `
    <div class="timer-container" id="timerBox">
        <div class="timer-titulo">⏱️ TIMER DE DESCANSO</div>
        <div class="timer-progress"><div class="timer-progress-bar" id="timerBar" style="width:0%"></div></div>
        <div class="timer-display normal" id="timerDisplay">01:00</div>
        <div class="timer-config">
            <label>Tempo (s):</label>
            <input type="number" class="timer-input" id="timerInputSeg" min="5" max="600" value="${seg}">
            <button class="timer-btn-set" onclick="definirTimer()">OK</button>
        </div>
        <div class="timer-controles">
            <button class="timer-btn play" id="timerBtnPlay" onclick="toggleTimer()">▶️ Iniciar</button>
            <button class="timer-btn reset" onclick="resetarTimer()">🔄 Reset</button>
        </div>
    </div>`;
}

function definirTimer() {
    const input = document.getElementById('timerInputSeg');
    const val   = parseInt(input.value);
    if (!val || val < 5 || val > 600) {
        mostrarNotificacao('⚠️ Digite um tempo entre 5 e 600 segundos', 'warning');
        return;
    }
    pararTimer();
    timerTotal  = val;
    timerAtual  = val;
    atualizarDisplayTimer();
}

function toggleTimer() {
    if (timerRodando) {
        pararTimer();
    } else {
        iniciarTimer();
    }
}

function iniciarTimer() {
    if (timerAtual <= 0) resetarTimer();
    timerRodando = true;
    const btn = document.getElementById('timerBtnPlay');
    if (btn) { btn.textContent = '⏸️ Pausar'; btn.className = 'timer-btn pause'; }

    timerInterval = setInterval(() => {
        timerAtual--;
        atualizarDisplayTimer();
        if (timerAtual <= 0) {
            pararTimer();
            timerConcluido();
        }
    }, 1000);
}

function pararTimer() {
    timerRodando = false;
    clearInterval(timerInterval);
    timerInterval = null;
    const btn = document.getElementById('timerBtnPlay');
    if (btn) { btn.textContent = '▶️ Iniciar'; btn.className = 'timer-btn play'; }
}

function resetarTimer() {
    pararTimer();
    timerAtual = timerTotal;
    atualizarDisplayTimer();
    const display = document.getElementById('timerDisplay');
    if (display) display.classList.remove('fim');
}

function atualizarDisplayTimer() {
    const display = document.getElementById('timerDisplay');
    const bar     = document.getElementById('timerBar');
    if (!display) return;

    const mins = Math.floor(timerAtual / 60);
    const secs = timerAtual % 60;
    display.textContent = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;

    const pct = timerTotal > 0 ? ((timerTotal - timerAtual) / timerTotal) * 100 : 0;
    if (bar) bar.style.width = pct + '%';

    // Cor: vermelho quando < 10s
    display.className = 'timer-display ' + (timerAtual <= 10 ? 'urgente' : 'normal');
}

function timerConcluido() {
    const display = document.getElementById('timerDisplay');
    if (display) { display.textContent = '00:00'; display.className = 'timer-display fim'; }
    mostrarNotificacao('⏰ Descanso concluído! Próxima série! 💪', 'success');
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    tocarSomTimer();
}

function tocarSomTimer() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        [[880, 0, 0.18], [1100, 0.22, 0.18], [880, 0.44, 0.28]].forEach(([freq, start, dur]) => {
            const osc  = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.4, ctx.currentTime + start);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
            osc.start(ctx.currentTime + start);
            osc.stop(ctx.currentTime + start + dur + 0.05);
        });
    } catch (e) { /* Web Audio não suportado */ }
}

