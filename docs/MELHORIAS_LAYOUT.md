# Melhorias de Layout — Treinos Marcelo v4.0

## 1. Paleta de Cores

| Variável CSS       | Valor       | Uso                                      |
|--------------------|-------------|------------------------------------------|
| `--bg-main`        | `#0F172A`   | Fundo principal da página (slate-900)    |
| `--bg-card`        | `#1E293B`   | Fundo dos cards de treino (slate-800)    |
| `--bg-modal`       | `#111827`   | Fundo dos modais (gray-900)              |
| `--primary`        | `#38BDF8`   | Cor primária — botões, ativação, links   |
| `--primary-dark`   | `#0EA5E9`   | Variante escura do primário              |
| `--secondary`      | `#6366F1`   | Cor secundária — gradientes e destaques  |
| `--success`        | `#22C55E`   | Sucesso — exercício concluído, toast ok  |
| `--warning`        | `#F59E0B`   | Atenção — timer urgente, toast warning   |
| `--danger`         | `#EF4444`   | Perigo — botão deletar, limpar, erro     |
| `--text-main`      | `#F8FAFC`   | Texto principal (quase branco)           |
| `--text-muted`     | `#94A3B8`   | Texto secundário / labels                |
| `--text-dim`       | `#475569`   | Texto terciário / placeholders           |
| `--border`         | `#334155`   | Bordas de cards, inputs, divisores       |
| `--radius-xl`      | `24px`      | Raio de cards maiores e modais           |
| `--radius-lg`      | `18px`      | Raio padrão de cards                     |
| `--radius-md`      | `12px`      | Raio de botões e inputs                  |
| `--shadow-float`   | —           | Sombra flutuante para modais e hover     |

### Cores dos 7 tipos de treino (faixa + avatar)

| Tipo       | Cor         | Nome       |
|------------|-------------|------------|
| `.treino-a` | `#38BDF8` | Sky Blue   |
| `.treino-b` | `#6366F1` | Indigo     |
| `.treino-c` | `#10B981` | Emerald    |
| `.treino-d` | `#F97316` | Orange     |
| `.treino-e` | `#F43F5E` | Rose       |
| `.treino-f` | `#8B5CF6` | Violet     |
| `.treino-g` | `#06B6D4` | Cyan       |

---

## 2. Alterações Visuais

### Cabeçalho
- Adicionado `header-brand` com título à esquerda e badge `v4.0` à direita
- Fundo com gradiente dark azul-ardósia (`#162032 → #1a2744`)
- Linha de acento no topo com gradiente tricolor (`sky → indigo`)
- Botões de ação: cada um com cor temática própria (backup=azul, histórico=verde, deletar=vermelho, etc.)

### Cards de Treino
- Fundo uniforme `#1E293B` (antes era transparente com tint roxo)
- Avatar de letra com gradiente colorido por tipo + sombra colorida
- Faixa de 3px no topo com cor do tipo
- Hover: eleva +4px com sombra profunda
- Badge de progresso: azul para em andamento, verde para 100%
- Botão "Iniciar Treino" sólido em sky blue (`#38BDF8`) com texto escuro — máxima legibilidade

### Modal de Treino
- Overlay com blur suave + fundo muito escuro
- Animação de entrada: slide-up + scale suave
- Linha de acento no topo igual ao header
- Exercícios em cards com estado visual distinto para concluídos (verde + tachado)
- Inputs de peso com foco em ring azul

### Timer
- Display grande (3.5em) com brilho colorido por estado
  - Normal: azul (`--primary`)
  - Urgente (< 10s): âmbar (`--warning`)
  - Fim: verde pulsando (`--success`) com animação `piscar`
- Barra de progresso com gradiente azul
- Botão Play: sky blue / Pause: âmbar / Reset: discreto

### Notificações (Toast)
- Cada tipo com cor real:
  - `success`: gradiente verde esmeralda
  - `warning`: gradiente âmbar/laranja
  - `error`: gradiente vermelho
- No desktop: aparece no canto superior direito, não full-width

### Histórico
- Cards com borda esquerda sky blue
- Botão "Limpar Histórico" com tema vermelho discreto
- Filtros com estilo pill — ativo em sky blue sólido

### Formulário de Edição
- Todos os inputs com foco ring 3px em sky blue
- Botão "Remover" exercício: ícone redondo vermelho discreto
- Botão "Adicionar": borda tracejada → sólida no hover
- `.btn-salvar`: sky blue sólido / `.btn-cancelar`: ghost discreto

---

## 3. Como Trocar as Cores Futuramente

Edite apenas as variáveis no topo de `css/style.css`:

```css
:root {
    --primary:      #38BDF8;  /* ← troque aqui para outra cor primária */
    --primary-dark: #0EA5E9;  /* ← variante escura do primário */
    --secondary:    #6366F1;  /* ← cor dos gradientes e destaques */
    --success:      #22C55E;
    --warning:      #F59E0B;
    --danger:       #EF4444;
    --bg-main:      #0F172A;  /* ← fundo da página */
    --bg-card:      #1E293B;  /* ← fundo dos cards */
    --bg-modal:     #111827;  /* ← fundo dos modais */
}
```

> Todos os elementos usam essas variáveis. Mudar aqui reflete no app inteiro.

**Exemplos de paletas alternativas:**
- Verde fitness: `--primary: #22C55E; --primary-dark: #16A34A; --secondary: #14B8A6`
- Roxo premium: `--primary: #A78BFA; --primary-dark: #7C3AED; --secondary: #EC4899`
- Laranja energia: `--primary: #F97316; --primary-dark: #EA580C; --secondary: #EAB308`

---

## 4. Como Testar o Layout no Celular

### Opção A — Servidor local (recomendado)
```bash
cd "c:\Users\marce\OneDrive\Documents\Projetos\APP_Treinos"
python -m http.server 8080
```
Acesse `http://localhost:8080` no celular (mesma rede Wi-Fi).

### Opção B — DevTools do Chrome
1. Abra `http://localhost:8080` no Chrome
2. Pressione `F12` → clique no ícone de celular (Toggle device toolbar)
3. Teste nas dimensões: **390×844** (iPhone 14), **360×800** (Android comum), **414×896** (iPhone XR)

### Opção C — Firebase Hosting (produção)
```bash
git add css/ js/ index.html sw.js docs/
git commit -m "refactor: layout premium v4.0"
git push origin main
firebase deploy --only hosting
```
Acesse `https://treinos-marcelo-app.web.app`

### Checklist visual de testes
- [ ] Header com badge v4.0 visível
- [ ] Botões de ação com cores distintas
- [ ] Seletor de tipo com tabs scrolláveis no mobile
- [ ] Cards com faixa colorida por tipo
- [ ] Avatar colorido por tipo
- [ ] Botão "Iniciar Treino" grande e claro
- [ ] Modal abre com animação suave
- [ ] Timer com display grande e legível
- [ ] Timer muda cor quando urgente (< 10s)
- [ ] Timer pisca em verde quando chega a zero
- [ ] Exercício concluído fica com texto tachado
- [ ] Notificação aparece com cor correta (verde/âmbar/vermelho)
- [ ] Histórico com borda azul e filtros funcionando
- [ ] Formulário de edição com foco em ring azul
- [ ] App funciona offline (PWA — Service Worker v4.0.0)
