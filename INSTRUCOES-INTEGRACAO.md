# Instruções de Integração — app-tumulos-orcamento.js corrigido

## O que foi corrigido

### 1. `_tumRender()` — suporte ao Novo-app
O motor HR v12 agora funciona tanto no modo standalone (`pg9`) quanto abre automaticamente um **modal overlay** quando `pg9` não existe (contexto do Novo-app).

### 2. `tumSalvar()` — integração completa com DB
Após salvar, agora chama:
- `renderOrc()` → atualiza o histórico de orçamentos
- `renderAgenda()` → atualiza a agenda
- `_tumRenderTab()` → atualiza a aba Histórico do próprio módulo

### 3. Novas funções
- `_tumOpenModal()` — cria modal com `pg9` interno
- `closeTumOrcModal()` — fecha o modal
- `abrirCalculadoraTumulos()` — chamada pelo botão no ambiente Túmulo

---

## Passo a passo para finalizar

### PASSO 1 — Substituir o arquivo
Copie `app-tumulos-orcamento.js` para a raiz do seu projeto, substituindo o existente.

### PASSO 2 — Adicionar botão no app-orcamento.js
Dentro da função que renderiza o ambiente Túmulo (por volta da linha 645 do `app-orcamento.js`), **substitua** o botão "✅ Calcular e Aplicar Peças":

```javascript
// SUBSTITUIR:
h += '<button onclick="inlineTcAplicar('+amb.id+')" ...>✅ Calcular e Aplicar Peças</button>';

// POR:
h += '<button onclick="abrirCalculadoraTumulos()" style="width:100%;background:linear-gradient(135deg,#c9a84c,#e2c06a);color:#0d0c09;border:none;border-radius:12px;padding:13px;font-size:.85rem;font-weight:800;cursor:pointer;font-family:Outfit,sans-serif;letter-spacing:.5px;box-shadow:0 4px 16px rgba(201,168,76,.22);">⚰️ Abrir Calculadora Completa de Túmulo</button>';
```

### PASSO 3 — (Opcional) Pré-preencher dados do cliente
Para que o cliente e os dados do ambiente já apareçam preenchidos ao abrir a calculadora, adicione antes do botão:

```javascript
h += '<button onclick="' +
  'if(typeof TUM!==\'undefined\'){' +
    'TUM.q.cli=ambientes.find(function(a){return a.id==='+amb.id+'})&&document.getElementById(\'cli\')?document.getElementById(\'cli\').value||\'\':\'\';}' +
  'abrirCalculadoraTumulos();" ' +
  'style="width:100%;...">⚰️ Abrir Calculadora Completa de Túmulo</button>';
```

Ou mais simples — passe o ambId para sincronizar:

```javascript
// No app-orcamento.js, substitua o botão por:
h += '<button onclick="tumAbrirComAmb('+amb.id+')" style="width:100%;background:linear-gradient(135deg,#c9a84c,#e2c06a);color:#0d0c09;border:none;border-radius:12px;padding:13px;font-size:.85rem;font-weight:800;cursor:pointer;font-family:Outfit,sans-serif;">⚰️ Calculadora de Túmulo HR v12</button>';
```

E adicione no `app-tumulos-orcamento.js` (ou num arquivo separado):
```javascript
function tumAbrirComAmb(ambId) {
  var amb = typeof ambientes !== 'undefined' ? ambientes.find(function(a){return a.id===ambId;}) : null;
  if (amb && amb.tumExtra) {
    // Pre-preenche dados do ambiente
    if (amb.tumExtra.falecido)  TUM.q.falecido  = amb.tumExtra.falecido;
    if (amb.tumExtra.cemiterio) TUM.q.cemiterio = amb.tumExtra.cemiterio;
    if (amb.tumExtra.quadra)    TUM.q.quadra    = amb.tumExtra.quadra;
    if (amb.tumExtra.lote)      TUM.q.lote      = amb.tumExtra.lote;
  }
  var cli = document.getElementById('cli');
  if (cli && cli.value) TUM.q.cli = cli.value;
  var tel = document.getElementById('tel');
  if (tel && tel.value) TUM.q.tel = tel.value;
  abrirCalculadoraTumulos();
}
```

---

## Fluxo após a integração

```
Usuário cria ambiente tipo "Túmulo"
  ↓
Preenche Falecido, Cemitério, Quadra, Lote
  ↓
Clica "⚰️ Calculadora Completa de Túmulo"
  ↓
Modal abre com o sistema HR v12 completo:
  • Aba Dados (cliente + falecido + medidas)
  • Aba Pedras (catálogo de materiais)
  • Aba Acabamentos
  • Aba Resumo (cálculo completo)
  • Aba Histórico
  ↓
Usuário clica "💾 Salvar"
  ↓
DB.q  ← orçamento registrado (aparece no Histórico)
DB.j  ← job criado na Agenda
DB.t  ← A Receber lançado nas Finanças
  ↓
Modal fecha, app atualizado
```

---

## Verificar se está funcionando

Após a integração, ao salvar um orçamento de túmulo:
- **Histórico** (ícone 📋): deve aparecer o orçamento com valor, cliente e tipo "Túmulo — Dupla Gaveta 2G"
- **Agenda**: deve aparecer um novo job com prazo estimado e nome do cliente
- **Finanças**: deve aparecer em "A Receber" com o valor à vista

