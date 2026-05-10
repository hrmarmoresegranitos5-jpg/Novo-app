# 📋 GUIA DE INTEGRAÇÃO — app-tumulos-orcamento.js
**HR Mármores e Granitos · v3.0**

---

## ✅ O que este módulo faz

Módulo completo de orçamento de túmulos com:
- **Medidas em centímetros** (C × L × Ae em cm — convertidas internamente para cálculo)
- **4 abas**: Dados · Pedras · Acabamentos · Resumo · Histórico
- **Integração automática** com Agenda (`DB.j`), Finanças (`DB.t`) e Orçamentos (`DB.q`)
- Ao salvar: cria job na agenda + lança A Receber nas finanças
- Cálculo completo de pedras, civil, mão de obra e prazo

---

## 📁 Arquivos entregues

| Arquivo | O que faz |
|---------|-----------|
| `app-tumulos-orcamento.js` | Módulo JS completo — substitui `app-tumulos.js` antigo |
| `tumulos-orcamento.css` | CSS do módulo — adicionar ao `styles.css` ou como `<link>` separado |

---

## 🔧 Como integrar no index.html

### PASSO 1 — Remover scripts antigos de túmulos

Remova (ou comente) do `index.html`:
```html
<!-- REMOVER estes: -->
<script src="app-tumulos.js"></script>
<script src="app-tumulos(Copy).js"></script>
<script src="app-precif-tumulos.js"></script>
<script src="app-vendas-tumulos.js"></script>
<script src="app-tumulos-wizard.js"></script>
```

### PASSO 2 — Adicionar o novo módulo

```html
<!-- ADICIONAR no lugar: -->
<script src="app-tumulos-orcamento.js"></script>
```

### PASSO 3 — CSS

Opção A — Adicionar ao `styles.css` existente (copiar o conteúdo de `tumulos-orcamento.css` no final).

Opção B — Link separado no `<head>`:
```html
<link rel="stylesheet" href="tumulos-orcamento.css">
```

---

## 🔌 Integração com DB (Agenda e Finanças)

O módulo detecta automaticamente o sistema de banco de dados existente:

| Variável | O que integra |
|----------|---------------|
| `DB.q` | Lista de orçamentos — adiciona o orçamento ao salvar |
| `DB.j` | Agenda — cria job com prazo estimado ao salvar |
| `DB.t` | Finanças — lança "A Receber" no valor do orçamento |
| `DB.sv()` | Persiste os dados após cada inserção |

Funções auxiliares detectadas automaticamente:
- `lastEnd()` — obtém o fim do último serviço na agenda
- `addD(data, dias)` — soma dias úteis a uma data
- `updUrgDot()` — atualiza indicador de urgência
- `renderFin()` — atualiza a view de finanças
- `toast(msg)` — exibe notificação
- `fm(valor)` — formata moeda

---

## 📐 Medidas — padrão cm

Todas as medidas de entrada e exibição são em **centímetros**:

```
C   = Comprimento total (cm)  Ex: 200 cm
L   = Largura total (cm)       Ex: 70 cm
E   = Espessura da pedra (cm)  Ex: 3 cm
Ae  = Altura da base (cm)      Ex: 30 cm
Ab  = Altura do rodapé (cm)    Ex: 8 cm
N   = Número de gavetas
```

**Fórmula da altura total:**
```
Altura = Ae + (N × 45 cm) + (E + 2 cm)

Exemplos:
  0 gavetas: 30 + 0 + 5 = 35 cm
  1 gaveta:  30 + 45 + 5 = 80 cm
  2 gavetas: 30 + 90 + 5 = 125 cm
  3 gavetas: 30 + 135 + 5 = 170 cm
```

---

## 🎯 Presets disponíveis

| Preset | C | L | E | Gavetas | Ae | Rodapé |
|--------|---|---|---|---------|----|----|
| Simples | 190 cm | 65 cm | 3 cm | 0 | 30 cm | 0 |
| 1 Gaveta | 200 cm | 70 cm | 3 cm | 1 | 30 cm | 8 cm |
| Dupla | 200 cm | 70 cm | 3 cm | 2 | 30 cm | 8 cm |
| Premium | 210 cm | 80 cm | 4 cm | 2 | 30 cm | 8 cm |
| Capela | 220 cm | 90 cm | 3 cm | 3 | 35 cm | 8 cm |

---

## ⚙️ Configuração de preços (via CFG.tumCfg)

O módulo usa `CFG.tumCfg` se disponível, ou os valores padrão:

```javascript
CFG.tumCfg = {
  margem:  35,   // % de margem de lucro
  parcMax: 8,    // parcelas máximas
  juros:   12,   // % de juros no parcelado
  mob: {
    pedreiro:   280,  // R$/dia
    ajudante:   160,
    instalacao: 300,
    montagem:   280,
    transporte: 200
  },
  civil: {
    cimento:   38,   // R$/saco
    areia:    120,   // R$/m³
    brita:    150,
    argamassa: 28,
    ferro38:   42,   // R$/barra
    ferro516:  28,
    malha:     45,   // R$/m²
    blocos:   4.5    // R$/unidade
  }
}
```

---

## 🔄 Fluxo ao Salvar

```
1. Usuário clica "💾 Salvar" na aba Resumo
   ↓
2. Valida: nome do cliente obrigatório
   ↓
3. Salva no histórico local (localStorage hr_tum_hist)
   ↓
4. DB.q ← insere orçamento completo
   ↓
5. DB.j ← cria job na agenda:
   • start = fim do último serviço (ou hoje)
   • end   = start + prazo_estimado dias
   • obs   = cemitério + quadra + lote + falecido
   ↓
6. DB.t ← lança A Receber:
   • tipo  = 'pend' (pendente)
   • valor = valor_vista
   • desc  = "Túmulo — [cliente] ([falecido])"
   ↓
7. DB.sv() ← persiste tudo
   ↓
8. toast "✅ Salvo! Agenda e Finanças atualizados."
```

---

## 🐛 Troubleshooting

**Tela em branco ao abrir:**
→ Verificar se `pg9` existe no DOM (o elemento que recebe o conteúdo)

**Pedras não aparecem:**
→ `CFG.stones` não definido? O módulo usa o padrão interno automaticamente

**Não salva na agenda:**
→ Verificar se `DB.j`, `lastEnd()` e `addD()` estão disponíveis

**Não lança nas finanças:**
→ Verificar se `DB.t` existe e está inicializado como array

**Preços incorretos:**
→ Atualizar `CFG.tumCfg.civil` e `CFG.tumCfg.mob` com preços atuais da região

---

## 📞 Funções públicas disponíveis

```javascript
tumInit()              // Inicializa o módulo
renderTum()            // Re-renderiza tudo (alias de tumInit)
tumSalvar()            // Salva e integra com agenda/finanças
tumNovo()              // Limpa para novo orçamento
tumTab(id)             // Muda aba: 'dados','pedras','acabamentos','resumo','historico'
tumAplicarPreset(id)   // Aplica preset: 'simples','1gav','dupla','premium','capela',...
tumSelMat(id)          // Seleciona material de pedra pelo id
tumSelAcab(id)         // Seleciona acabamento pelo id
tumTogPeca(id)         // Liga/desliga peça incluída
tumTogOpt(id)          // Liga/desliga opcional
tumDim(key, val)       // Seta dimensão e recalcula
tumSet(key, val)       // Seta campo de texto sem recalcular
tumCopiarWA()          // Copia texto formatado para WhatsApp
```

---

**Versão:** 3.0
**Data:** 2026-05-09
**Status:** ✅ Pronto para integração
