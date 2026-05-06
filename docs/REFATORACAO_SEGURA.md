# Refatoração Segura — APP_Treinos

## Objetivo

Separar o app monolítico (um único `index.html` de ~2200 linhas) em arquivos modulares, sem alterar nenhuma funcionalidade, comportamento ou dado do usuário.

---

## O que foi alterado

### Antes
- `index.html` continha: todo o HTML + ~700 linhas de CSS inline + ~1500 linhas de JavaScript inline
- Um único arquivo de 2195 linhas

### Depois
| Arquivo | Linhas | Função |
|---|---|---|
| `index.html` | 68 | Estrutura HTML + referências a css/js |
| `css/style.css` | 688 | Todo o CSS extraído do `<style>` original |
| `js/utils.js` | 43 | Estado global + helpers base |
| `js/data.js` | 267 | Dados dos 7 tipos de treino |
| `js/storage.js` | 108 | Acesso ao localStorage |
| `js/timer.js` | 136 | Timer de descanso |
| `js/treinos.js` | 76 | Navegação principal |
| `js/treino-session.js` | 372 | Sessão de treino (modal, peso, séries) |
| `js/historico.js` | 108 | Histórico de treinos |
| `js/backup.js` | 151 | Exportação e importação JSON |
| `js/app.js` | 256 | Orquestrador — boot do app |
| `sw.js` | — | Service Worker atualizado para v4.0.0 |

---

## O que NÃO foi alterado

- Nenhuma função foi renomeada
- Nenhum comportamento foi modificado
- As chaves do `localStorage` são as mesmas: `marceloTreinos`, `marceloHistorico`, `peso_*`, `series_*`, `concluido_*`, `marceloChavesMigradas`
- Backups `.json` exportados antes da refatoração continuam compatíveis
- A lógica de migração de chaves legadas (`migrarChavesLegadas()`) foi preservada integralmente

---

## Ordem de carregamento dos módulos JS

Os módulos usam escopo global (não são ES modules). A ordem de carregamento no `index.html` é obrigatória:

```
utils.js → data.js → storage.js → timer.js → treinos.js → treino-session.js → historico.js → backup.js → app.js
```

---

## Como testar

1. **Teste local:**
   ```
   python -m http.server 8080
   ```
   Abrir `http://localhost:8080` no navegador.

2. **Verificações principais:**
   - Treinos carregam na tela inicial ✓
   - Botões de tipo (A, B, C...) funcionam ✓
   - Modal de treino abre ao clicar em um treino ✓
   - Peso e séries são salvos após inserção ✓
   - Timer de descanso funciona ✓
   - Histórico abre e filtra corretamente ✓
   - Exportar backup gera arquivo `.json` ✓
   - Importar backup restaura dados ✓
   - Adicionar/deletar tipo de treino funciona ✓
   - Adicionar/deletar treino dentro de um tipo funciona ✓

3. **Teste de dados persistidos:**
   - Se havia dados no localStorage antes da refatoração, eles devem aparecer normalmente após reload

---

## Pontos de atenção

- **Cache do Service Worker**: Versão atualizada para `v4.0.0`. Na primeira visita após deploy, o SW antigo ainda pode estar ativo. Fazer hard reload (`Ctrl+Shift+R`) ou aguardar a atualização automática.
- **HTTPS obrigatório**: O app está hospedado no Firebase (`treinos-marcelo-app.web.app`). Service Workers requerem HTTPS, portanto o teste local via `python -m http.server` não ativará o SW (mas o app funciona sem ele).
- **Variáveis globais**: Os módulos JS compartilham o escopo global do browser. Isso é intencional para manter compatibilidade sem refatoração de arquitetura.

---

## Deploy

```bash
git add css/ js/ docs/ index.html sw.js
git commit -m "refactor: separar CSS e JS em módulos externos (v4.0.0)"
git push origin main
firebase deploy --only hosting
```
