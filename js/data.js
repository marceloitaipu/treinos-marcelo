// =============================================
//  DADOS DOS TREINOS — 7 TIPOS
//  Este arquivo contém os dados padrão de treino.
//  Ao carregar, storage.js sobrescreve todosTipos com os dados do localStorage.
//  Ver: storage.js -> carregarTreinosSalvos()
//
//  Dependências: utils.js (gerarId via storage.js, não direto aqui)
// =============================================

// normalizarExercicios: compatibilidade com backups legados
// onde exercícios eram objetos {nome, series} em vez de strings simples
// =============================================
//  DADOS DOS TREINOS — 7 TIPOS
// =============================================
const todosTipos = [
    // 0 - ABCD Marcelo (4 treinos)
    {
        nome: 'ABCD Marcelo',
        treinos: [
            {
                letra: 'A',
                nome: 'Treino A - Peito, Ombros e Tríceps',
                descricao: '8 exercícios',
                classe: 'treino-a',
                exercicios: ['Supino reto barra ou maq', 'Supino inclinado halteres', 'Voador', 'Desenvolvimento Máquina', 'Elevação lateral halter', 'Tríceps testa corda', 'Tríceps Corda', 'Supino declinado com alteres']
            },
            {
                letra: 'B',
                nome: 'Treino B - Pernas',
                descricao: '7 exercícios',
                classe: 'treino-b',
                exercicios: ['Agachamento máquina', 'Leg Press', 'Cadeira Extensora', 'Mesa Flexora', 'Panturrilha em pé', 'Abdominal com cabo', 'Glúteo cabo ou máquina']
            },
            {
                letra: 'C',
                nome: 'Treino C - Costas e Bíceps',
                descricao: '6 exercícios',
                classe: 'treino-c',
                exercicios: ['Puxada Alta pega Pronada', 'Remada Curvada Máquina', 'Serrote unilateral Halteres', 'Remada baixa cabo ou máquina', 'Rosca direta barra', 'Rosca Alternada, inclinada, alteres']
            },
            {
                letra: 'D',
                nome: 'Treino D - Ombro, Posterior e Panturrilha',
                descricao: '7 exercícios',
                classe: 'treino-d',
                exercicios: ['Levantamento Terra Romeno', 'Cadeira Flexora', 'Elevação Lateral', 'Elevação posterior crucifixo invertido ou máquina', 'Encolhimento Halter ou Barra', 'Panturrilha sentado', 'Abdominal com cabo']
            }
        ]
    },
    // 1 - Treino Jacke (5 treinos)
    {
        nome: 'Treino Jacke',
        treinos: [
            {
                letra: 'A',
                nome: 'Segunda Peito - Tríceps',
                descricao: '8 exercícios',
                classe: 'treino-a',
                exercicios: ['Tríceps Supinada com Anilha', 'Tríceps TopHead Deitado no Banco com Anilha', 'Tríceps Francês Sentado com Anilha', 'Supino Vertical', 'Supino Inclinado Máquina pronada', 'Tríceps Paralela Sentado Máquina', 'Crossover no Cabo Polia Alta', 'Tríceps no Cabo Polia Alta']
            },
            {
                letra: 'B',
                nome: 'Quadriceps - Panturrilha + Cárdio',
                descricao: '6 exercícios',
                classe: 'treino-b',
                exercicios: ['Avanço com Afundo Unilateral (combinado)', 'Agachamento com Halter', 'Cadeira Extensora (banco afastado)', 'Cadeira Adutora (empurra com joelho)', 'Panturrilha na Parede', 'Corrida na Esteira com Trote']
            },
            {
                letra: 'C',
                nome: 'Quarta Costas - Biceps',
                descricao: '8 exercícios',
                classe: 'treino-c',
                exercicios: ['Puxada Aberta Barra Reta (sentado)', 'Puxada Alta em Pé com Corda no Cabo Polia Alta', 'Remada Baixa Pegada Aberta', 'Remada Pronada Máquina Articulada', 'Rosca Concentrada com Halter', 'Rosca direta com halteres em Pé', 'Rosca Direta no Cabo Polia Baixa com Corda', 'Rosca Direta Sentado no Banco com Halteres']
            },
            {
                letra: 'D',
                nome: 'Posteriores e Glúteos + Cárdio',
                descricao: '6 exercícios',
                classe: 'treino-d',
                exercicios: ['Ativação de Posterior e Glúteos Solo intercalado', 'Leg Press 45 (pés alinhados)', 'Cadeira Fletora (ajuste na panturrilha)', 'Leg Press Horizontal (pés afastados)', 'Cadeira Abdutora (empurra com joelho)', 'Corrida na Esteira em Trote']
            },
            {
                letra: 'E',
                nome: 'Ombro - Trapézio - Abdômen',
                descricao: '8 exercícios',
                classe: 'treino-e',
                exercicios: ['Desenvolvimento Ombro com Halteres (em pé)', 'Elevação Frontal com Anilha', 'Elevação Frontal Sentado com Halteres', 'Remada Alta com Barra Reta no Cabo Polia Baixa', 'Encolhimento de Ombros Costas no Cabo Polia Baixa', 'Abdominal Infra Solo (pernas flexionadas)', 'Abdominal obliquo - Prancha lateral com movimento', 'Abdominal Oblíquo em Solo (foto touch)']
            }
        ]
    },
    // 2 - ABC Jacke (3 treinos)
    {
        nome: 'ABC Jacke',
        treinos: [
            {
                letra: 'A',
                nome: 'Treino A - Peito - Tríceps - Ombros',
                descricao: '9 exercícios',
                classe: 'treino-a',
                exercicios: ['Supino Vertical', 'Supino com Halteres inclinado 30 graus', 'Crossover no Cabo Polia Alta (Peitoral Inclinado)', 'Tríceps TopHead Deitado no Banco com Anilha', 'Desenvolvimento Ombro com Halteres em pé', 'Elevação Frontal sentado com Halteres', 'Remada Alta com Barra Reta no Cabo Polia Baixa', 'Crucifixo Máquina', 'Tríceps supinado anilha']
            },
            {
                letra: 'B',
                nome: 'Treino B - Quadríceps - Posteriores - Panturrilha - Cardio',
                descricao: '7 exercícios',
                classe: 'treino-b',
                exercicios: ['Agachamento com Halter', 'Cadeira Extensora', 'Cadeira Adutora', 'Leg Press 45', 'Cadeira Abdutora', 'Leg Press Horizontal', 'Corrida Esteira']
            },
            {
                letra: 'C',
                nome: 'Treino C - Costas - Bíceps - Trapézio - Abdômen',
                descricao: '10 exercícios',
                classe: 'treino-c',
                exercicios: ['Puxada Aberta Barra Reta (sentado)', 'Remada Pronada Máquina Articulada', 'Rosca Direta no Cabo Polia Baixa com Corda', 'Rosca Direta Banco 45 ° com Halteres', 'Encolhimento de Ombros Costas no Cabo Polia Baixo', 'Abdominal Infra Solo (pernas flexionadas)', 'Abdominal Oblíquo - Prancha Lateral com movimento', 'Abdominal Oblíquo em Solo (foto touch)', 'Rosca direta com barra em w', 'Remada Serrote']
            }
        ]
    },
    // 3 - ABCD Chatgpt (4 treinos)
    {
        nome: 'ABCD Chatgpt',
        treinos: [
            {
                letra: 'A',
                nome: 'Treino A - Costas e Bíceps',
                descricao: '6 exercícios • Alta intensidade',
                classe: 'treino-a',
                exercicios: ['Puxada Alta pegada pronada', 'Remada curvada máquina', 'Serrote Halteres', 'Remada baixa cabo/maquina', 'Rosca direta barra', 'Rosca Alternada inclinada']
            },
            {
                letra: 'B',
                nome: 'Treino B - Pernas',
                descricao: '7 exercícios • Força máxima',
                classe: 'treino-b',
                exercicios: ['Agachamento maquina', 'Leg press', 'Cadeira extensora', 'Mesa flexora', 'Glúteo cabo ou máquina', 'Panturrilha em pé', 'Abdominal com cabo']
            },
            {
                letra: 'C',
                nome: 'Treino C - Peito, ombro e tríceps',
                descricao: '7 exercícios • Força e massa',
                classe: 'treino-c',
                exercicios: ['Supino reto maquina', 'Supino inclinado com Halteres', 'Supino declinado com halteres', 'Desenvolvimento máquina', 'Elevação lateral', 'Tríceps testa corda', 'Tríceps corda']
            },
            {
                letra: 'D',
                nome: 'Treino D - Posterior, Ombro, Trapézio, panturrilha',
                descricao: '6 exercícios • Delts e abdomen',
                classe: 'treino-d',
                exercicios: ['Levantamento Terra Romeno', 'Cadeira Flexora', 'Crucifixo invertido', 'Encolhimento halteres', 'Panturrilha sentado', 'Abdominal cabo']
            }
        ]
    },
    // 4 - ABC do Zanca (3 treinos)
    {
        nome: 'ABC do Zanca',
        treinos: [
            {
                letra: 'A',
                nome: 'Treino A - Push (Empurrar)',
                descricao: '5 exercícios • Peito/ombros/tríceps',
                classe: 'treino-a',
                exercicios: ['Supino Reto', 'Desenvolvimento', 'Supino Inclinado', 'Elevação Lateral', 'Tríceps Pulley']
            },
            {
                letra: 'B',
                nome: 'Treino B - Pull (Puxar)',
                descricao: '5 exercícios • Costas/bíceps',
                classe: 'treino-b',
                exercicios: ['Puxada Frontal', 'Remada Curvada', 'Remada Cavalinho', 'Rosca Direta', 'Rosca Martelo']
            },
            {
                letra: 'C',
                nome: 'Treino C - Legs (Pernas)',
                descricao: '5 exercícios • Membros inferiores',
                classe: 'treino-c',
                exercicios: ['Agachamento', 'Leg Press', 'Stiff', 'Extensora', 'Panturrilha']
            }
        ]
    },
    // 5 - ABC Pacho (3 treinos)
    {
        nome: 'ABC Pacho',
        treinos: [
            {
                letra: 'A',
                nome: 'Treino A - Peito, Ombros e Tríceps',
                descricao: '7 exercícios',
                classe: 'treino-a',
                exercicios: ['Supino Reto Barra/Maq', 'Supino inclinado Halter', 'Crucifixo Maq/Cabos', 'Desen. Front. Hal. Sent', 'Elevação lateral leve', 'Elevação frontal sentado com Halteres', 'Tríceps corda combinado com testa']
            },
            {
                letra: 'B',
                nome: 'Treino B - Costas, Bíceps e Abdômen',
                descricao: '8 exercícios',
                classe: 'treino-b',
                exercicios: ['Puxa frente pega aber', 'Serrote', 'Remada baixa triangulo', 'Puxa Neutra/supinada', 'Rosca direta. Barra W', 'Rosca Alt Alteres', 'Prancha Frontal', 'Elevação de pernas']
            },
            {
                letra: 'C',
                nome: 'Treino C - Pernas e Glúteos',
                descricao: '6 exercícios',
                classe: 'treino-c',
                exercicios: ['Agachamento Halteres', 'Leg press 45°', 'Cadeira extensora', 'Cadeira Fletora', 'Stiff com Halteres lev', 'Panturrilha em pé/sent']
            }
        ]
    },
    // 6 - ABDCE (5 treinos)
    {
        nome: 'ABDCE',
        treinos: [
            {
                letra: 'A',
                nome: 'Treino A - Peito e Tríceps',
                descricao: '6 exercícios • Empurrar',
                classe: 'treino-a',
                exercicios: ['Panturrilha em pé na máquina ou smith com step', 'Panturrilha sentada', 'Supino inclinado smith ou máquina', 'Supino reto halteres', 'Supino inclinado com halteres combinado com crucifixo inclinado com halteres', 'Supino declinado']
            },
            {
                letra: 'B',
                nome: 'Treino B - Costas e Bíceps',
                descricao: '5 exercícios • Puxar',
                classe: 'treino-b',
                exercicios: ['Abdominal supra na prancha', 'Abdominal infra na torre', 'Remada curvada pronada', 'Remada baixa pegada aberta', 'Serrote']
            },
            {
                letra: 'C',
                nome: 'Treino C - Pernas',
                descricao: '5 exercícios • Membros inferiores',
                classe: 'treino-c',
                exercicios: ['Agachamento Livre', 'Leg 45º', 'Cadeira Extensora', 'Flexor deitado', 'Flexor sentado']
            },
            {
                letra: 'D',
                nome: 'Treino D - Ombros',
                descricao: '5 exercícios • Deltoides',
                classe: 'treino-d',
                exercicios: ['Panturrilha em pé na máquina ou smith com step', 'Panturrilha sentada', 'Desenvolvimento sentado com halteres', 'Elevação frontal corda', 'Elevação lateral']
            },
            {
                letra: 'E',
                nome: 'Treino E - Braços',
                descricao: '6 exercícios • Bíceps e tríceps',
                classe: 'treino-e',
                exercicios: ['Abdominal supra na prancha', 'Abdominal infra na torre', 'Rosca direta barra em pé', 'Rosca scott na máquina ou no cross 21', 'Rosca direta com halteres sentado na gravs', 'Rosca direta corda']
            }
        ]
    }
];

// =============================================
//  INICIALIZAÇÃO
// =============================================

// Normaliza exercícios: aceita string ou objeto {nome,...}
function normalizarExercicios(lista) {
    if (!Array.isArray(lista)) return lista;
    return lista.map(function(tipo) {
        if (!tipo || !Array.isArray(tipo.treinos)) return tipo;
        tipo.treinos = tipo.treinos.map(function(t) {
            if (!Array.isArray(t.exercicios)) return t;
            t.exercicios = t.exercicios.map(function(ex) {
                return (typeof ex === 'object' && ex !== null && ex.nome) ? ex.nome : String(ex);
            });
            return t;
        });
        return tipo;
    });
}
