// ══════════════════════════════════════════════════════════════════════
// APP-TUMULOS.JS v2.0 — Motor Técnico Profissional
// HR Mármores e Granitos · DOC-TUM-001 Rev 1.0
// ⚠ Todas as medidas de entrada/saída em CENTÍMETROS
// Substitui: app-tumulos.js, app-precif-tumulos.js, app-vendas-tumulos.js
// ══════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────
// CONFIGURAÇÃO PADRÃO (salva em CFG.tumCfg)
// ─────────────────────────────────────────────────────────────────────
var TUM_DEF_CFG = {
  margem:  35,
  parcMax: 8,
  juros:   12,
  mob: {
    pedreiro:   280,
    ajudante:   160,
    instalacao: 300,
    montagem:   280,
    transporte: 200
  },
  civil: {
    cimento:   38,
    areia:    120,
    brita:    150,
    argamassa: 28,
    ferro38:   42,
    ferro516:  28,
    malha:     45,
    blocos:   4.5
  },
  pedras: [
    { id:'p_gabriel', nm:'Preto São Gabriel',  cat:'Popular', pr:180, peso:78 },
    { id:'cinza_and', nm:'Cinza Andorinha',    cat:'Popular', pr:170, peso:75 },
    { id:'branco_si', nm:'Branco Siena',       cat:'Médio',   pr:220, peso:76 },
    { id:'verde_lab', nm:'Verde Labrador',     cat:'Médio',   pr:240, peso:80 },
    { id:'absoluto',  nm:'Absoluto Negro',     cat:'Premium', pr:380, peso:82 },
    { id:'carrara',   nm:'Mármore Carrara',    cat:'Premium', pr:420, peso:68 },
    { id:'quartzito', nm:'Quartzito Branco',   cat:'Premium', pr:460, peso:72 }
  ]
};

// ─────────────────────────────────────────────────────────────────────
// PRESETS — C, L, Ae em cm · E em cm (espessura) · N = nº gavetas
// ─────────────────────────────────────────────────────────────────────
var TUM_PRESETS = [
  { id:'simples',  nm:'Simples',       C:190, L:65, E:3, N:0, Ae:30, Ab:0, badge:'0 gavetas' },
  { id:'1gav',     nm:'1 Gaveta',      C:200, L:70, E:3, N:1, Ae:30, Ab:8, badge:'1 gaveta'  },
  { id:'dupla',    nm:'Dupla Gaveta',  C:200, L:70, E:3, N:2, Ae:30, Ab:8, badge:'2 gavetas' },
  { id:'premium',  nm:'Premium',       C:210, L:80, E:4, N:2, Ae:30, Ab:8, badge:'Destaque'  },
  { id:'capela',   nm:'Capela',        C:220, L:90, E:3, N:3, Ae:35, Ab:8, badge:'3–4 gav'   },
  { id:'moderno',  nm:'Moderno',       C:200, L:75, E:3, N:2, Ae:30, Ab:0, badge:'1–2 gav'   },
  { id:'parcial',  nm:'Rev. Parcial',  C:190, L:65, E:3, N:1, Ae:30, Ab:0, badge:'Econômico' },
  { id:'completo', nm:'Rev. Completo', C:210, L:80, E:3, N:2, Ae:30, Ab:8, badge:'Completo'  }
];

var TUM_PRESET_PECAS = {
  simples:  { tampa:true, lat_esq:false, lat_dir:false, frente:true,  fundo:false, lapide:false, rodape:false },
  '1gav':   { tampa:true, lat_esq:true,  lat_dir:false, frente:true,  fundo:false, lapide:false, rodape:false },
  dupla:    { tampa:true, lat_esq:true,  lat_dir:true,  frente:true,  fundo:false, lapide:false, rodape:false },
  premium:  { tampa:true, lat_esq:true,  lat_dir:true,  frente:true,  fundo:true,  lapide:true,  rodape:false },
  capela:   { tampa:true, lat_esq:true,  lat_dir:true,  frente:true,  fundo:true,  lapide:true,  rodape:true  },
  moderno:  { tampa:true, lat_esq:true,  lat_dir:false, frente:true,  fundo:false, lapide:false, rodape:false },
  parcial:  { tampa:true, lat_esq:false, lat_dir:false, frente:true,  fundo:false, lapide:false, rodape:false },
  completo: { tampa:true, lat_esq:true,  lat_dir:true,  frente:true,  fundo:true,  lapide:false, rodape:true  }
};

// ─────────────────────────────────────────────────────────────────────
// ACABAMENTOS (R$/ml)
// ─────────────────────────────────────────────────────────────────────
var TUM_ACAB = [
  { id:'SEM', nm:'Sem acabamento',  prML:0,  dif:1.00, desc:'Borda bruta de corte' },
  { id:'1L',  nm:'1 Lateral',      prML:8,  dif:1.05, desc:'Uma borda polida/bisotada' },
  { id:'2L',  nm:'2 Laterais',     prML:14, dif:1.08, desc:'Duas bordas opostas' },
  { id:'4L',  nm:'4 Laterais',     prML:24, dif:1.12, desc:'Todas as bordas — premium' },
  { id:'45G', nm:'45° (esquadria)',prML:18, dif:1.15, desc:'Borda em ângulo, sem emenda' },
  { id:'BOL', nm:'Boleado',        prML:22, dif:1.20, desc:'Borda arredondada R=1,5cm' },
  { id:'ESC', nm:'Escovado',       prML:12, dif:1.10, desc:'Textura antiderrapante' },
  { id:'POL', nm:'Polido Brilho',  prML:20, dif:1.18, desc:'Espelho — memorial premium' },
  { id:'FLA', nm:'Flameado',       prML:16, dif:1.12, desc:'Textura rústica por chama' }
];

// ─────────────────────────────────────────────────────────────────────
// PEÇAS
// ─────────────────────────────────────────────────────────────────────
var TUM_PECAS_DEF = [
  { id:'tampa',   nm:'Tampa Superior',   sub:'Peça principal — todas as versões' },
  { id:'lat_esq', nm:'Lateral Esquerda', sub:'Revestimento parcial e completo' },
  { id:'lat_dir', nm:'Lateral Direita',  sub:'Revestimento completo' },
  { id:'frente',  nm:'Frente / Frontal', sub:'Todas as versões' },
  { id:'fundo',   nm:'Fundo / Tardoz',   sub:'Revestimento completo / opcional' },
  { id:'lapide',  nm:'Lápide',           sub:'60×40 cm padrão' },
  { id:'rodape',  nm:'Rodapé de Pedra',  sub:'Perímetro × altura do rodapé' }
];

// ─────────────────────────────────────────────────────────────────────
// ITENS OPCIONAIS
// ─────────────────────────────────────────────────────────────────────
var TUM_OPTS_DEF = [
  { id:'cemiterio',    nm:'Instalação em cemitério',    sub:'+10% dificuldade · +20% logística materiais', fixo:0 },
  { id:'polido_extra', nm:'Polimento extra completo',   sub:'+5% dificuldade',                             fixo:0 },
  { id:'gravacao',     nm:'Gravação / letras na lápide',sub:'+5% dificuldade',                             fixo:0 },
  { id:'cruzGranito',  nm:'Cruz em granito',            sub:'Valor fixo R$ 350,00',                        fixo:350 },
  { id:'foto_porc',    nm:'Foto em porcelana',          sub:'Valor fixo R$ 200,00',                        fixo:200 }
];

// ─────────────────────────────────────────────────────────────────────
// ESTADO GLOBAL
// ─────────────────────────────────────────────────────────────────────
var TUM = {
  q: {
    // Identificação
    cli:'', tel:'', cemiterio:'', cidade:'', falecido:'', quadra:'', lote:'', obs:'',
    fotoModelo:'', descModelo:'',
    // Modelo
    preset: 'dupla',
    // Medidas em CENTÍMETROS
    C:  200,   // comprimento
    L:   70,   // largura
    E:    3,   // espessura da pedra (cm)
    N:    2,   // número de gavetas
    Ae:  30,   // altura base estrutural (cm)
    Ab:   8,   // altura do rodapé (cm)
    // Seleções
    matId:  null,
    acabId: 'POL',
    perda:  12,      // % de perda de corte
    fatorCem: 20,    // % de frete extra em cemitério
    // Peças incluídas
    pecas: { tampa:true, lat_esq:true, lat_dir:true, frente:true, fundo:false, lapide:false, rodape:false },
    // Opcionais
    opts:  { cemiterio:false, polido_extra:false, gravacao:false, cruzGranito:false, foto_porc:false }
  },
  calc:  null,
  _tab:  'dados',
  _hist: []
};

// ─────────────────────────────────────────────────────────────────────
// INIT / ENTRY POINT
// ─────────────────────────────────────────────────────────────────────
function tumInit()  { _tumBoot(); }
function renderTum() { _tumBoot(); }

function _tumBoot() {
  _tumInitCfg();
  _tumLoadHist();
  if (!TUM.q.matId) TUM.q.matId = _tumCfg().pedras[0].id;
  _tumRecalc();
  _tumRender();
  _tumInjectCfgTab();
}

function _tumInitCfg() {
  if (typeof CFG === 'undefined') return;
  if (!CFG.tumCfg) {
    CFG.tumCfg = JSON.parse(JSON.stringify(TUM_DEF_CFG));
    if (typeof svCFG === 'function') svCFG();
    return;
  }
  ['mob','civil'].forEach(function(k) {
    if (!CFG.tumCfg[k]) CFG.tumCfg[k] = JSON.parse(JSON.stringify(TUM_DEF_CFG[k]));
    Object.keys(TUM_DEF_CFG[k]).forEach(function(f) {
      if (CFG.tumCfg[k][f] === undefined) CFG.tumCfg[k][f] = TUM_DEF_CFG[k][f];
    });
  });
  if (!CFG.tumCfg.pedras || !CFG.tumCfg.pedras.length)
    CFG.tumCfg.pedras = JSON.parse(JSON.stringify(TUM_DEF_CFG.pedras));
  if (!CFG.tumCfg.margem) CFG.tumCfg.margem = TUM_DEF_CFG.margem;
}

function _tumCfg() {
  return (typeof CFG !== 'undefined' && CFG.tumCfg) ? CFG.tumCfg : TUM_DEF_CFG;
}

function _tumLoadHist() {
  try { TUM._hist = JSON.parse(localStorage.getItem('hr_tum_hist') || '[]'); }
  catch(e) { TUM._hist = []; }
}

// ─────────────────────────────────────────────────────────────────────
// MOTOR DE CÁLCULO — baseado em DOC-TUM-001
// Internamente em metros; display em cm
// ─────────────────────────────────────────────────────────────────────
function _tumRecalc() {
  TUM.calc = _tumCalcFull();
}

function _tumCalcFull() {
  var q   = TUM.q;
  var cfg = _tumCfg();

  // ── Converter cm → metros para cálculo ──────────────────────────
  var C  = q.C  / 100;
  var L  = q.L  / 100;
  var E  = q.E;             // espessura em cm (usada como índice)
  var N  = Math.max(0, Math.round(q.N));
  var Ae = q.Ae / 100;
  var Ab = q.Ab / 100;

  // A = Ae + (N × 0,45m) + At  |  At = (E + 2cm) em metros
  var At_cm = E + 2;
  var At    = At_cm / 100;
  var A     = Ae + (N * 0.45) + At;

  var mat  = cfg.pedras.find(function(x){return x.id===q.matId;}) || cfg.pedras[0];
  var acab = TUM_ACAB.find(function(x){return x.id===q.acabId;}) || TUM_ACAB[0];

  // ── 1. PEÇAS DE PEDRA ────────────────────────────────────────────
  var pecasCalc = [];
  var m2_bruto  = 0;

  function peca(nm, dim, m2, ml) {
    pecasCalc.push({ nm:nm, dim:dim, m2:_r2(m2), ml:_r2(ml) });
    m2_bruto += m2;
  }

  if (q.pecas.tampa)
    peca('Tampa Superior',   _cm(q.C)+'×'+_cm(q.L),         C*L,              2*(C+L));
  if (q.pecas.lat_esq)
    peca('Lateral Esquerda', _cm(A*100)+'×'+_cm(q.L),        A*L,              A);
  if (q.pecas.lat_dir)
    peca('Lateral Direita',  _cm(A*100)+'×'+_cm(q.L),        A*L,              A);
  if (q.pecas.frente)
    peca('Frente / Frontal', _cm(A*100)+'×'+_cm(q.C),        A*C,              2*C);
  if (q.pecas.fundo)
    peca('Fundo / Tardoz',   _cm(A*100)+'×'+_cm(q.C),        A*C,              0);
  if (q.pecas.lapide)
    peca('Lápide (60×40 cm)','60×40 cm',                     0.60*0.40,        2*(0.60+0.40));

  var N_lajes = Math.max(0, N - 1);
  if (N_lajes > 0)
    peca('Laje Divisória (×'+N_lajes+')', _cm(q.C)+'×'+_cm(q.L)+'×'+N_lajes, C*L*N_lajes, 0);

  if (q.pecas.rodape && Ab > 0) {
    var perim = 2*(C+L);
    peca('Rodapé', q.Ab+'cm × '+_r2(perim)+'ml', Ab*perim, perim);
  }

  var fatorPerda = 1 + (q.perda / 100);
  var m2_total   = _r3(m2_bruto * fatorPerda);

  // Multiplicador de espessura
  var espMult = {2:1.00, 3:1.35, 4:1.70, 5:2.10};
  var espM       = espMult[E] || 1.35;
  var custo_pedra = _r2(m2_total * mat.pr * espM);
  var peso_total  = _r2(m2_total * mat.peso * (E / 3));

  // ── 2. ACABAMENTOS (m lineares) ──────────────────────────────────
  var ml_total = 0;
  pecasCalc.forEach(function(p){ ml_total += p.ml; });
  ml_total = _r2(ml_total);
  var custo_acabamento = _r2(ml_total * acab.prML);

  // ── 3. CONSTRUÇÃO CIVIL ──────────────────────────────────────────
  // Volumes (m³)
  var Vol_estrutura = C * L * Ae;
  var Vol_paredes   = 2 * ((C * A * 0.15) + (L * A * 0.15));
  var Vol_lajes_c   = C * L * 0.06 * N_lajes;
  var Vol_total     = Vol_estrutura + Vol_paredes + Vol_lajes_c;
  var m2_parede     = 2 * ((C * A) + (L * A));
  var Perim_base    = 2 * (C + L);
  var cv            = cfg.civil;

  var sacos_cimento = Math.ceil(Vol_total * 6) + N;
  var m3_areia      = _r3(Vol_total * 0.7  + N * 0.05);
  var m3_brita      = _r3(Vol_estrutura * 0.9 + N * 0.03);
  var sacos_argam   = Math.ceil(m2_bruto * 5  + N * 0.5);
  var barras_f38    = Math.ceil(Perim_base / 2) + N * 2;
  var barras_f516   = Math.ceil(A * 4)          + N * 2;
  var m2_malha      = _r2(C * L * N_lajes);
  var unid_blocos   = Math.ceil(m2_parede / 0.076) + N * 12;

  var custo_civil_base =
    (sacos_cimento * cv.cimento)  +
    (m3_areia      * cv.areia)    +
    (m3_brita      * cv.brita)    +
    (sacos_argam   * cv.argamassa)+
    (barras_f38    * cv.ferro38)  +
    (barras_f516   * cv.ferro516) +
    (m2_malha      * cv.malha)    +
    (unid_blocos   * cv.blocos);

  var custo_civil = q.opts.cemiterio
    ? _r2(custo_civil_base * (1 + q.fatorCem / 100))
    : _r2(custo_civil_base);

  // ── 4. MÃO DE OBRA + FATOR DE DIFICULDADE ───────────────────────
  var Dif = 1.00;
  Dif += 0.05 * N;
  if (q.opts.cemiterio)    Dif += 0.10;
  if (q.opts.polido_extra) Dif += 0.05;
  if (q.opts.gravacao)     Dif += 0.05;
  if (acab.id==='POL'||acab.id==='45G') Dif += 0.05;
  if (q.pecas.fundo && q.pecas.lat_esq && q.pecas.lat_dir) Dif += 0.08;
  Dif = _r2(Dif);

  var mob          = cfg.mob;
  var v_pedreiro   = _r2((2 + N)       * mob.pedreiro   * Dif);
  var v_ajudante   = _r2((2 + N)       * mob.ajudante    * Dif);
  var v_instalacao = _r2((1.5 + N*0.5) * mob.instalacao);
  var v_montagem   = _r2((0.5 + N*0.25)* mob.montagem   * Dif);
  var v_frete      = mob.transporte + (N >= 2 ? 80 : 0);
  var custo_mob    = _r2(v_pedreiro + v_ajudante + v_instalacao + v_montagem + v_frete);

  // ── 5. EXTRAS FIXOS ─────────────────────────────────────────────
  var custo_extras = 0;
  if (q.opts.cruzGranito) custo_extras += 350;
  if (q.opts.foto_porc)   custo_extras += 200;

  // ── 6. PRAZO ESTIMADO (dias úteis) ──────────────────────────────
  var dias_fabr   = Math.ceil(m2_total / 6) + N;
  var dias_obra   = 2 + N;
  var dias_cura   = 7;
  var dias_inst   = Math.ceil(1 + N * 0.5);
  var prazo_total = Math.max(dias_fabr, dias_obra) + dias_cura + dias_inst;

  // ── 7. TOTAIS ────────────────────────────────────────────────────
  var tc         = _tumCfg();
  var margem     = tc.margem  || 35;
  var parcMax    = tc.parcMax || 8;
  var juros      = tc.juros   || 12;

  var custo_total = _r2(custo_pedra + custo_acabamento + custo_civil + custo_mob + custo_extras);
  // Fórmula correta: valor_final = custo / (1 - margem%)
  var valor_vista = _r2(custo_total / (1 - margem / 100));
  var valor_parc  = _r2(valor_vista * (1 + juros / 100));
  var parc_mensal = _r2(valor_parc / parcMax);
  var lucro       = _r2(valor_vista - custo_total);

  // ── 8. VERIFICAÇÃO DE GAVETA (viabilidade) ───────────────────────
  var C_int_cm = q.C - 30;   // 15cm parede de cada lado
  var L_int_cm = q.L - 30;
  var alertaGaveta = N > 0 && (C_int_cm < 175 || L_int_cm < 55);

  return {
    // Geometria
    C:C, L:L, E:E, N:N, Ae:Ae, Ab:Ab, A:A, At_cm:At_cm,
    A_cm: _r2(A*100), N_lajes:N_lajes,
    C_int_cm:C_int_cm, L_int_cm:L_int_cm,
    alertaGaveta:alertaGaveta,
    // Materiais
    mat:mat, acab:acab, espM:espM,
    // Pedras
    pecasCalc:pecasCalc,
    m2_bruto:_r3(m2_bruto), m2_total:m2_total,
    ml_total:ml_total, peso_total:peso_total,
    // Custos
    custo_pedra:custo_pedra,
    custo_acabamento:custo_acabamento,
    custo_civil:custo_civil,
    custo_mob:custo_mob,
    custo_extras:custo_extras,
    // Civil itemizado
    Vol_total:_r3(Vol_total),
    sacos_cimento:sacos_cimento, m3_areia:m3_areia, m3_brita:m3_brita,
    sacos_argam:sacos_argam, barras_f38:barras_f38, barras_f516:barras_f516,
    m2_malha:m2_malha, unid_blocos:unid_blocos,
    // MO itemizado
    v_pedreiro:v_pedreiro, v_ajudante:v_ajudante,
    v_instalacao:v_instalacao, v_montagem:v_montagem, v_frete:v_frete, Dif:Dif,
    // Totais
    custo_total:custo_total,
    valor_vista:valor_vista, valor_parc:valor_parc,
    parc_mensal:parc_mensal, lucro:lucro,
    margem:margem, parcMax:parcMax, juros:juros,
    // Prazo
    prazo_total:prazo_total,
    // Aliases compatibilidade com DB
    venda:       valor_vista,
    custoTotal:  custo_total,
    lucroTotal:  lucro,
    margemReal:  valor_vista > 0 ? _r2(lucro / valor_vista * 100) : 0
  };
}

function _r2(v) { return Math.round(v * 100)  / 100;  }
function _r3(v) { return Math.round(v * 1000) / 1000; }
function _cm(v) { return Math.round(+v) + ' cm'; }

// ─────────────────────────────────────────────────────────────────────
// RENDER PRINCIPAL
// ─────────────────────────────────────────────────────────────────────
function _tumRender() {
  var pg = document.getElementById('pg9');
  if (!pg) return;
  var r = TUM.calc || {};
  var vf = r.valor_vista || 0;

  pg.innerHTML =
    _tumHero(r, vf) +
    _tumTabs() +
    '<div id="tumBody" style="padding-bottom:90px"></div>';

  _tumRenderTab();
}

function _tumHero(r, vf) {
  var q = TUM.q;
  var preset = TUM_PRESETS.find(function(p){return p.id===q.preset;});
  var subLabel = (preset ? preset.nm : '') +
    (q.N > 0 ? ' · ' + q.N + ' gav.' : '') +
    ' · ' + q.C+'×'+q.L+' cm';
  return '<div class="tum-hero">' +
    '<div class="tum-hero-row">' +
      '<div>' +
        '<div class="tum-hero-title">⚰️ Orçamento de Túmulo</div>' +
        '<div class="tum-hero-sub">' + subLabel + '</div>' +
      '</div>' +
      '<div style="text-align:right">' +
        '<div class="tum-hero-val">' + (vf > 0 ? 'R$ '+(typeof fm==='function'?fm(vf):vf.toFixed(2)) : '—') + '</div>' +
        (r.lucro > 0 ? '<div style="font-size:.6rem;color:var(--grn);margin-top:2px">lucro R$ '+(typeof fm==='function'?fm(r.lucro):r.lucro.toFixed(2))+' · '+r.margemReal+'%</div>' : '') +
      '</div>' +
    '</div>' +
  '</div>';
}

function _tumTabs() {
  var tabs = [
    { id:'dados',    lb:'① Dados'     },
    { id:'pedras',   lb:'② Pedras'    },
    { id:'acabamentos',lb:'③ Acabamentos'},
    { id:'resumo',   lb:'④ Resumo'    },
    { id:'historico',lb:'📋 Histórico' }
  ];
  var h = '<div class="tum-tabs">';
  tabs.forEach(function(t) {
    h += '<button class="tum-tab'+(TUM._tab===t.id?' on':'')+'" onclick="tumTab(\''+t.id+'\')">'+t.lb+'</button>';
  });
  return h + '</div>';
}

function tumTab(id) {
  TUM._tab = id;
  var body = document.getElementById('tumBody');
  if (!body) return;
  _tumRenderTab();
  // Atualizar tabs
  document.querySelectorAll('.tum-tab').forEach(function(el) {
    el.classList.toggle('on', el.textContent.indexOf(id) > -1 || el.getAttribute('onclick').indexOf("'"+id+"'") > -1);
  });
}

function _tumRenderTab() {
  var body = document.getElementById('tumBody');
  if (!body) return;
  var r = TUM.calc;
  var map = {
    dados:        _tabDados,
    pedras:       _tabPedras,
    acabamentos:  _tabAcabamentos,
    resumo:       _tabResumo,
    historico:    _tabHistorico
  };
  var fn = map[TUM._tab] || _tabDados;
  body.innerHTML = fn(r);
}

function tumRecalc() {
  _tumRecalc();
  // Atualiza hero
  var r  = TUM.calc || {};
  var vf = r.valor_vista || 0;
  var hv = document.querySelector('.tum-hero-val');
  if (hv) hv.textContent = vf > 0 ? 'R$ '+(typeof fm==='function'?fm(vf):vf.toFixed(2)) : '—';
  var hs = document.querySelector('.tum-hero-sub');
  if (hs) {
    var q = TUM.q;
    var preset = TUM_PRESETS.find(function(p){return p.id===q.preset;});
    hs.textContent = (preset?preset.nm:'') + (q.N>0?' · '+q.N+' gav.':'') + ' · '+q.C+'×'+q.L+' cm';
  }
  _tumRenderTab();
}

// ─────────────────────────────────────────────────────────────────────
// ABA: DADOS (cliente + preset + medidas em cm)
// ─────────────────────────────────────────────────────────────────────
function _tabDados(r) {
  var q = TUM.q;
  var h = '';

  // Cliente
  h += _card('① Identificação',
    '<div class="tum-grid2">' +
    _fi('Nome do Cliente',  'text',   q.cli,       'tumSet("cli",this.value)', 'Ex: Maria Silva') +
    _fi('Telefone',         'tel',    q.tel,       'tumSet("tel",this.value)', '(74) 99999-9999') +
    '</div>' +
    '<div class="tum-grid2">' +
    _fi('Cemitério',        'text',   q.cemiterio, 'tumSet("cemiterio",this.value)', 'Nome do cemitério') +
    _fi('Cidade',           'text',   q.cidade,    'tumSet("cidade",this.value)',    'Pilão Arcado — BA') +
    '</div>' +
    '<div class="tum-grid3">' +
    _fi('Falecido(a)',      'text',   q.falecido,  'tumSet("falecido",this.value)',  'Nome') +
    _fi('Quadra',           'text',   q.quadra,    'tumSet("quadra",this.value)',    'Q-12') +
    _fi('Lote / Número',    'text',   q.lote,      'tumSet("lote",this.value)',      'L-04') +
    '</div>'
  );

  // Presets
  var pbh = '<div class="tum-presets">';
  TUM_PRESETS.forEach(function(p) {
    pbh += '<button class="tum-preset'+(q.preset===p.id?' on':'')+'" onclick="tumAplicarPreset(\''+p.id+'\')">'+
      p.nm+'<span class="tum-preset-badge">'+p.badge+'</span></button>';
  });
  pbh += '</div>';
  h += _card('② Tipo de Túmulo', pbh);

  // Medidas em cm
  var A_cm = r ? r.A_cm : (q.Ae + q.N*45 + q.E + 2);
  var alerta = r && r.alertaGaveta
    ? '<div class="tum-alerta">⚠ Espaço interno pode ser insuficiente para caixão padrão (mín. 175×55 cm interno). Verifique C e L.</div>'
    : '';
  var info = '<div class="tum-info-box">📐 <strong>Altura calculada automaticamente:</strong> A = Base ('+q.Ae+' cm) + ('+q.N+' gav × 45 cm) + Tampa ('+(q.E+2)+' cm) = <strong>'+_r2(A_cm)+' cm</strong></div>';

  h += _card('③ Medidas <span style="font-size:.6rem;color:var(--t3)">(tudo em cm)</span>',
    info + alerta +
    '<div class="tum-grid3">' +
    _fiN('Comprimento (cm)', q.C, 50, 500, 1, 'tumDim("C",this.value)', 'Tampa · Frente · Fundo') +
    _fiN('Largura (cm)',     q.L, 30, 200, 1, 'tumDim("L",this.value)', 'Tampa · Laterais') +
    _fiN('Espessura pedra (cm)', q.E, 2, 6, 0.5, 'tumDim("E",this.value)', '2–3cm lateral · 3–4cm tampa') +
    '</div>' +
    '<div class="tum-grid3">' +
    _fiSel('Nº de Gavetas', q.N,
      [[0,'0 — Simples'],[1,'1 Gaveta'],[2,'2 Gavetas'],[3,'3 Gavetas'],[4,'4 Gavetas']],
      'tumDim("N",this.value)', 'Cada gaveta = +45 cm de altura') +
    _fiN('Base estrutural (cm)', q.Ae, 10, 100, 5, 'tumDim("Ae",this.value)', 'Altura da base de concreto') +
    _fiN('Rodapé de pedra (cm)', q.Ab, 0, 20, 1,   'tumDim("Ab",this.value)', '0 = sem rodapé') +
    '</div>'
  );

  // Observações
  h += _card('④ Observações',
    '<textarea class="tum-obs" oninput="tumSet(\'obs\',this.value)" placeholder="Detalhes especiais, instruções de instalação, pedidos do cliente...">'+q.obs+'</textarea>'
  );

  h += '<button class="tum-btn-gold tum-btn-full" onclick="tumTab(\'pedras\')">Próximo: Pedras →</button>';
  return h;
}

// ─────────────────────────────────────────────────────────────────────
// ABA: PEDRAS
// ─────────────────────────────────────────────────────────────────────
function _tabPedras(r) {
  var q   = TUM.q;
  var cfg = _tumCfg();
  var h   = '';

  // Material
  var mh = '<div class="tum-mat-grid">';
  cfg.pedras.forEach(function(p) {
    var on = p.id === q.matId;
    mh += '<button class="tum-mat'+(on?' on':'')+'" onclick="tumSelMat(\''+p.id+'\')">' +
      '<div class="tum-mat-nm">'+p.nm+'</div>' +
      '<div class="tum-mat-cat">'+p.cat+'</div>' +
      '<div class="tum-mat-pr">R$ '+p.pr+'/m²</div>' +
      '</button>';
  });
  mh += '</div>';
  var matSel = cfg.pedras.find(function(x){return x.id===q.matId;});
  if (matSel && r) {
    var eMult = {2:'1,00×',3:'1,35×',4:'1,70×',5:'2,10×'};
    mh += '<div class="tum-info-box">📊 '+matSel.nm+' · esp. '+q.E+'cm (mult. '+(eMult[q.E]||'1,35×')+') → R$ '+matSel.pr+' × '+eMult[q.E]+' = <strong>R$ '+_r2(matSel.pr*(r.espM||1.35)).toFixed(2)+'/m²</strong></div>';
  }
  h += _card('⑤ Material da Pedra', mh);

  // Perda
  h += _card('⑥ Fator de Perda (%)',
    '<div class="tum-grid2">' +
    _fiN('Perda no corte (%)', q.perda, 5, 30, 1, 'tumDimAdv("perda",this.value)', 'Padrão: 12% — recortes, emendas, rejeitos') +
    '</div>' +
    (r ? '<div class="tum-info-box">m² bruto: '+r.m2_bruto+' m² → com perda '+q.perda+'%: <strong>'+r.m2_total+' m²</strong> · Peso: '+r.peso_total+' kg</div>' : '')
  );

  // Peças incluídas
  var ph = '';
  TUM_PECAS_DEF.forEach(function(p) {
    var on  = !!q.pecas[p.id];
    var dim = '';
    if (r && r.pecasCalc) {
      var pc = r.pecasCalc.find(function(x){return x.nm.indexOf(p.nm.split('/')[0].trim()) > -1;});
      if (pc) dim = pc.dim + ' = '+pc.m2+' m²';
    }
    ph += '<div class="tum-tog-row">' +
      '<div class="tum-tog-info">' +
        '<div class="tum-tog-nm">'+p.nm+'</div>' +
        '<div class="tum-tog-sub">'+(dim||p.sub)+'</div>' +
      '</div>' +
      '<div class="tum-tog'+(on?' on':'')+'" onclick="tumTogPeca(\''+p.id+'\')"></div>' +
    '</div>';
  });
  h += _card('⑦ Peças Incluídas', ph);

  h += '<button class="tum-btn-gold tum-btn-full" onclick="tumTab(\'acabamentos\')">Próximo: Acabamentos →</button>';
  return h;
}

// ─────────────────────────────────────────────────────────────────────
// ABA: ACABAMENTOS + OPCIONAIS
// ─────────────────────────────────────────────────────────────────────
function _tabAcabamentos(r) {
  var q = TUM.q;
  var h = '';

  // Acabamentos
  var ah = '<div class="tum-acab-grid">';
  TUM_ACAB.forEach(function(a) {
    var on = q.acabId === a.id;
    ah += '<button class="tum-acab'+(on?' on':'')+'" onclick="tumSelAcab(\''+a.id+'\')">' +
      '<div class="tum-acab-nm">'+a.nm+'</div>' +
      '<div class="tum-acab-pr">'+(a.prML>0?'R$ '+a.prML+'/ml':'Grátis')+'</div>' +
      '<div class="tum-acab-desc">'+a.desc+'</div>' +
    '</button>';
  });
  ah += '</div>';
  if (r && r.ml_total > 0) {
    ah += '<div class="tum-info-box">📐 '+r.ml_total+' ml de borda ' +
      '→ custo acabamento: <strong>R$ '+(typeof fm==='function'?fm(r.custo_acabamento):r.custo_acabamento.toFixed(2))+'</strong></div>';
  }
  h += _card('⑧ Tipo de Acabamento das Bordas', ah);

  // Opcionais
  var oh = '';
  TUM_OPTS_DEF.forEach(function(o) {
    var on = !!q.opts[o.id];
    oh += '<div class="tum-tog-row">' +
      '<div class="tum-tog-info">' +
        '<div class="tum-tog-nm">'+o.nm+'</div>' +
        '<div class="tum-tog-sub">'+o.sub+'</div>' +
      '</div>' +
      '<div class="tum-tog'+(on?' on':'')+'" onclick="tumTogOpt(\''+o.id+'\')"></div>' +
    '</div>';
  });
  h += _card('⑨ Itens Opcionais', oh);

  // Avançado
  h += _card('⑩ Logística (Avançado)',
    '<div class="tum-grid2">' +
    _fiN('Frete cemitério (%)', q.fatorCem, 0, 50, 5,
      'tumDimAdv("fatorCem",this.value)',
      'Aplicado sobre materiais civis se "instalação em cemitério"') +
    '</div>'
  );

  h += '<button class="tum-btn-gold tum-btn-full" onclick="tumTab(\'resumo\')">Ver Resumo →</button>';
  return h;
}

// ─────────────────────────────────────────────────────────────────────
// ABA: RESUMO
// ─────────────────────────────────────────────────────────────────────
function _tabResumo(r) {
  if (!r || !r.custo_total) {
    return '<div class="tum-empty">Preencha os dados e volte ao resumo.</div>';
  }
  var q    = TUM.q;
  var cfg  = _tumCfg();
  var F    = function(v){ return typeof fm==='function'?fm(v):v.toFixed(2); };
  var h    = '';

  // Cards de números
  h += '<div class="tum-res-grid">' +
    _resCard('m² c/perda', r.m2_total+' m²', r.m2_bruto+' bruto') +
    _resCard('ml bordas',  r.ml_total+' ml',  r.acab.nm) +
    _resCard('Peso aprox.',Math.round(r.peso_total)+' kg', r.mat.nm+' '+q.E+'cm') +
    _resCard('Custo Pedra','R$ '+F(r.custo_pedra), r.mat.nm, 'gold') +
    _resCard('Construção', 'R$ '+F(r.custo_civil),  'Materiais civis') +
    _resCard('Mão de Obra','R$ '+F(r.custo_mob),    'Fator ×'+r.Dif) +
    _resCard('Acabamentos','R$ '+F(r.custo_acabamento), r.acab.nm) +
    _resCard('Custo Total','R$ '+F(r.custo_total),  'Sem lucro') +
    _resCard('Margem '+r.margem+'%','R$ '+F(r.lucro), r.margemReal+'% real', 'grn') +
  '</div>';

  // Detalhamento peças
  h += _card('🪨 Peças de Pedra',
    r.pecasCalc.map(function(p) {
      return _dLine(p.nm+' <span class="tum-dim">'+p.dim+'</span>', p.m2+' m²');
    }).join('') +
    _dLine('Perda '+q.perda+'%', r.m2_total+' m² final') +
    _dLine(r.mat.nm+' × esp.×'+({2:'1,00',3:'1,35',4:'1,70',5:'2,10'}[r.E]||'1,35'),
           '<span style="color:var(--gold2)">R$ '+F(r.custo_pedra)+'</span>')
  );

  // Construção civil
  h += _card('🧱 Construção Civil',
    _dLine('Cimento CP-II',     r.sacos_cimento+' sacos') +
    _dLine('Areia média',       r.m3_areia+' m³') +
    _dLine('Brita 1',           r.m3_brita+' m³') +
    _dLine('Argamassa AC-II',   r.sacos_argam+' sacos') +
    _dLine('Ferro 3/8\" (barras)',r.barras_f38+' barras') +
    _dLine('Ferro 5/16\" (barras)',r.barras_f516+' barras') +
    (r.m2_malha>0 ? _dLine('Malha Q-92', r.m2_malha+' m²') : '') +
    _dLine('Blocos 14×19×39',   r.unid_blocos+' un.') +
    (q.opts.cemiterio ? _dLine('Frete cemitério (+'+q.fatorCem+'%)','<span style="color:var(--red)">aplicado</span>') : '') +
    _dLine('Total civil', '<span style="color:var(--gold2)">R$ '+F(r.custo_civil)+'</span>', true)
  );

  // Mão de Obra
  h += _card('🔨 Mão de Obra (fator dif. ×'+r.Dif+')',
    _dLine('Pedreiro',        'R$ '+F(r.v_pedreiro)) +
    _dLine('Ajudante',        'R$ '+F(r.v_ajudante)) +
    _dLine('Instalação pedra','R$ '+F(r.v_instalacao)) +
    _dLine('Montagem',        'R$ '+F(r.v_montagem)) +
    _dLine('Transporte',      'R$ '+F(r.v_frete)) +
    _dLine('Total M.O.', '<span style="color:var(--gold2)">R$ '+F(r.custo_mob)+'</span>', true)
  );

  // Extras
  if (r.custo_extras > 0) {
    h += _card('✨ Extras',
      (q.opts.cruzGranito ? _dLine('Cruz em granito','R$ 350,00') : '') +
      (q.opts.foto_porc   ? _dLine('Foto em porcelana','R$ 200,00') : '')
    );
  }

  // Total final
  h += '<div class="tum-total-box">' +
    '<div class="tum-total-linha">' +
      '<span>Custo interno</span>' +
      '<span>R$ '+F(r.custo_total)+'</span>' +
    '</div>' +
    '<div class="tum-total-linha" style="color:var(--grn)">' +
      '<span>Lucro ('+r.margem+'%)</span>' +
      '<span>R$ '+F(r.lucro)+'</span>' +
    '</div>' +
    '<div class="tum-total-main">' +
      '<span>À Vista</span>' +
      '<span class="tum-total-val">R$ '+F(r.valor_vista)+'</span>' +
    '</div>' +
    '<div class="tum-total-parc">' +
      'Parcelado: R$ '+F(r.valor_parc)+' — até '+r.parcMax+'× de R$ '+F(r.parc_mensal) +
    '</div>' +
    '<div class="tum-prazo">🕐 Prazo estimado: '+r.prazo_total+' dias úteis</div>' +
  '</div>';

  // Ações
  h += '<div class="tum-acoes">' +
    '<button class="tum-btn-gold" onclick="tumSalvar()">💾 Salvar</button>' +
    '<button class="tum-btn-out" onclick="tumCopiarWA()">📲 WhatsApp</button>' +
    '<button class="tum-btn-out" onclick="tumNovo()">🆕 Novo</button>' +
  '</div>';

  return h;
}

// ─────────────────────────────────────────────────────────────────────
// ABA: HISTÓRICO
// ─────────────────────────────────────────────────────────────────────
function _tabHistorico() {
  var h = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
    '<span style="font-size:.72rem;color:var(--t3)">'+TUM._hist.length+' orçamentos salvos</span>' +
    '<button class="tum-btn-out tum-btn-sm" onclick="tumLimparHist()">🗑 Limpar</button>' +
  '</div>';

  if (!TUM._hist.length) {
    return h + '<div class="tum-empty">📋 Nenhum orçamento salvo ainda.<br>Preencha o formulário e salve.</div>';
  }

  var F = function(v){ return typeof fm==='function'?fm(v):v.toFixed(2); };
  TUM._hist.forEach(function(o, i) {
    var r = o.r || {};
    h += '<div class="tum-hist-card" onclick="tumVerHist('+i+')">' +
      '<div class="tum-hist-row">' +
        '<span class="tum-hist-cli">'+(o.cli||'Cliente')+'</span>' +
        '<span class="tum-hist-val">R$ '+F(r.valor_vista||0)+'</span>' +
      '</div>' +
      '<div class="tum-hist-meta">' +
        (o.falecido?'<span>⚰️ '+o.falecido+'</span>':'') +
        (o.cemiterio?'<span>🏛 '+o.cemiterio+'</span>':'') +
        '<span>'+(o.matNm||'')+'</span>' +
        '<span>'+(o.N||0)+' gav.</span>' +
        '<span>'+o.date+'</span>' +
      '</div>' +
      '<div class="tum-hist-badges">' +
        '<span class="tum-badge">'+(r.m2_total||0)+'m²</span>' +
        '<span class="tum-badge" style="color:var(--grn)">'+(r.prazo_total||'?')+'d</span>' +
      '</div>' +
    '</div>';
  });
  return h;
}

// ─────────────────────────────────────────────────────────────────────
// SETTERS
// ─────────────────────────────────────────────────────────────────────
function tumSet(key, val) {
  TUM.q[key] = val;
}

function tumDim(key, val) {
  TUM.q[key] = +val;
  tumRecalc();
}

function tumDimAdv(key, val) {
  TUM.q[key] = +val;
  tumRecalc();
}

function tumAplicarPreset(id) {
  var p  = TUM_PRESETS.find(function(x){return x.id===id;});
  var pp = TUM_PRESET_PECAS[id];
  if (!p) return;
  TUM.q.preset = id;
  TUM.q.C  = p.C;
  TUM.q.L  = p.L;
  TUM.q.E  = p.E;
  TUM.q.N  = p.N;
  TUM.q.Ae = p.Ae;
  TUM.q.Ab = p.Ab;
  if (pp) TUM.q.pecas = JSON.parse(JSON.stringify(pp));
  tumRecalc();
  if (typeof toast === 'function') toast('✓ Preset: '+p.nm);
}

function tumSelMat(id) {
  TUM.q.matId = id;
  tumRecalc();
}

function tumSelAcab(id) {
  TUM.q.acabId = id;
  tumRecalc();
}

function tumTogPeca(id) {
  TUM.q.pecas[id] = !TUM.q.pecas[id];
  tumRecalc();
}

function tumTogOpt(id) {
  TUM.q.opts[id] = !TUM.q.opts[id];
  tumRecalc();
}

// ─────────────────────────────────────────────────────────────────────
// SALVAR / EXPORTAR
// ─────────────────────────────────────────────────────────────────────
function tumSalvar() {
  var q = TUM.q;
  var r = TUM.calc;
  if (!q.cli) { if(typeof toast==='function') toast('⚠ Informe o nome do cliente'); return; }
  if (!r)     { if(typeof toast==='function') toast('⚠ Calcule o orçamento primeiro'); return; }

  var cfg     = _tumCfg();
  var matNm   = (cfg.pedras.find(function(x){return x.id===q.matId;})||{}).nm || 'Pedra';
  var preset  = TUM_PRESETS.find(function(x){return x.id===q.preset;});
  var tipo    = 'Túmulo — '+(preset?preset.nm:q.preset)+(q.N>0?' '+q.N+'G':'');

  // Histórico local
  var rec = {
    id: Date.now(),
    date: typeof td === 'function' ? td() : new Date().toLocaleDateString('pt-BR'),
    cli: q.cli, tel: q.tel,
    cemiterio: q.cemiterio, cidade: q.cidade,
    falecido: q.falecido, quadra: q.quadra, lote: q.lote,
    obs: q.obs,
    preset: q.preset, N: q.N,
    matNm: matNm, acabNm: (TUM_ACAB.find(function(x){return x.id===q.acabId;})||{}).nm||'',
    r: JSON.parse(JSON.stringify(r)),
    q: JSON.parse(JSON.stringify(q))
  };
  TUM._hist.unshift(rec);
  if (TUM._hist.length > 50) TUM._hist.pop();
  localStorage.setItem('hr_tum_hist', JSON.stringify(TUM._hist));

  // Salvar no DB do app (compatibilidade)
  if (typeof DB !== 'undefined' && DB.q) {
    DB.q.unshift({
      id:   rec.id,
      tipo: tipo,
      cli:  q.cli,
      mat:  matNm,
      vista:    r.valor_vista,
      prazo:    r.valor_vista,
      ent:      r.valor_vista * 0.5,
      custo:    r.custo_total,
      lucro:    r.lucro,
      margemReal: r.margemReal,
      obs:  q.obs,
      tum:  JSON.parse(JSON.stringify(q)),
      tumCalc: JSON.parse(JSON.stringify(r)),
      dt:   rec.date,
      date: rec.date
    });
    if (typeof DB.sv === 'function') DB.sv();
  }

  if (typeof toast === 'function') toast('✅ Orçamento salvo!');
}

function tumNovo() {
  if (!confirm('Limpar orçamento atual?')) return;
  var q = TUM.q;
  q.cli=''; q.tel=''; q.cemiterio=''; q.cidade='';
  q.falecido=''; q.quadra=''; q.lote=''; q.obs='';
  q.fotoModelo=''; q.descModelo='';
  q.opts = { cemiterio:false, polido_extra:false, gravacao:false, cruzGranito:false, foto_porc:false };
  tumAplicarPreset('dupla');
  TUM._tab = 'dados';
  _tumRender();
  if (typeof toast === 'function') toast('✓ Novo orçamento');
}

function tumCopiarWA() {
  var q = TUM.q;
  var r = TUM.calc;
  if (!r) return;
  var F  = function(v){ return typeof fm==='function'?fm(v):v.toFixed(2); };
  var cfg = _tumCfg();
  var emp = (typeof CFG !== 'undefined' && CFG.emp) ? CFG.emp : { nome:'HR Mármores', tel:'' };
  var matNm = (cfg.pedras.find(function(x){return x.id===q.matId;})||{}).nm||'';

  var txt = emp.nome+'\nORÇAMENTO DE TÚMULO\n';
  txt += '─────────────────────\n';
  txt += 'Cliente: '+q.cli+'\n';
  if (q.falecido)  txt += 'Falecido(a): '+q.falecido+'\n';
  if (q.cemiterio) txt += 'Cemitério: '+q.cemiterio+(q.cidade?', '+q.cidade:'')+'\n';
  if (q.quadra||q.lote) txt += 'Quadra '+q.quadra+' Lote '+q.lote+'\n';
  txt += '\nMODELO\n';
  txt += 'Tipo: '+(TUM_PRESETS.find(function(p){return p.id===q.preset;})||{}).nm||q.preset;
  txt += '\nMedidas: '+q.C+'×'+q.L+' cm · Alt. '+_r2(r.A_cm)+' cm';
  txt += '\nGavetas: '+q.N;
  txt += '\nMaterial: '+matNm+' '+q.E+'cm';
  txt += '\nm²: '+r.m2_total+' (c/perdas)';
  txt += '\n\nVALORES\n─────────────────────\n';
  txt += 'À vista: R$ '+F(r.valor_vista)+'\n';
  txt += 'Parcelado: até '+r.parcMax+'× de R$ '+F(r.parc_mensal)+'\n';
  txt += 'Prazo: ~'+r.prazo_total+' dias úteis\n';
  txt += '─────────────────────\n';
  txt += emp.nome+(emp.tel?'\n'+emp.tel:'');

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(txt).then(function(){ if(typeof toast==='function') toast('✓ Copiado!'); });
  } else {
    var ta = document.createElement('textarea');
    ta.value = txt;
    ta.style.cssText = 'position:fixed;top:-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    if (typeof toast === 'function') toast('✓ Copiado!');
  }
}

// ─────────────────────────────────────────────────────────────────────
// HISTÓRICO
// ─────────────────────────────────────────────────────────────────────
function tumVerHist(i) {
  var o = TUM._hist[i];
  if (!o) return;
  if (o.q) TUM.q = JSON.parse(JSON.stringify(o.q));
  TUM.calc = o.r ? JSON.parse(JSON.stringify(o.r)) : null;
  TUM._tab = 'resumo';
  _tumRender();
}

function tumLimparHist() {
  if (!confirm('Limpar todo o histórico de orçamentos?')) return;
  TUM._hist = [];
  localStorage.setItem('hr_tum_hist', '[]');
  _tumRenderTab();
  if (typeof toast === 'function') toast('✓ Histórico limpo');
}

// ─────────────────────────────────────────────────────────────────────
// CONFIG TAB — injeta aba ⚰️ Túmulos na Config do app
// ─────────────────────────────────────────────────────────────────────
function _tumInjectCfgTab() {
  var cfgTabs = document.getElementById('cfgTabs');
  if (cfgTabs && !cfgTabs.querySelector('[data-cftab="7"]')) {
    var btn = document.createElement('div');
    btn.className = 'cfgtab';
    btn.setAttribute('data-cftab','7');
    btn.textContent = '⚰️ Túmulos';
    cfgTabs.appendChild(btn);
  }
  if (typeof buildCfg === 'function' && !buildCfg._tumPatched) {
    var _orig = buildCfg;
    buildCfg = function() {
      if (typeof cfgTab !== 'undefined' && cfgTab === 7) {
        _tumInitCfg();
        var body = document.getElementById('cfgBody');
        if (body) body.innerHTML = _tumBuildCfgUI();
      } else {
        _orig();
      }
    };
    buildCfg._tumPatched = true;
  }
}

function _tumBuildCfgUI() {
  var tc  = _tumCfg();
  var F   = function(f, id, val, label) {
    return '<div class="cfg-row"><div class="cfg-k">'+label+'</div>' +
      '<input class="cfg-inp" type="number" step="any" value="'+val+'" ' +
      'oninput="CFG.tumCfg.'+f+'[\''+id+'\']=+this.value;svCFG()"></div>';
  };
  var h = '';

  // Margem e parcelamento
  h += '<div class="tum-cfg-sec">💰 Preços e Margens</div>';
  h += '<div class="cfg-row"><div class="cfg-k">Margem de lucro (%)</div>' +
    '<input class="cfg-inp" type="number" min="0" max="200" value="'+tc.margem+'" ' +
    'oninput="CFG.tumCfg.margem=+this.value;svCFG()"></div>';
  h += '<div class="cfg-row"><div class="cfg-k">Parcelas máx. (cartão)</div>' +
    '<input class="cfg-inp" type="number" min="1" max="18" value="'+tc.parcMax+'" ' +
    'oninput="CFG.tumCfg.parcMax=+this.value;svCFG()"></div>';
  h += '<div class="cfg-row"><div class="cfg-k">Juros parcelado (%)</div>' +
    '<input class="cfg-inp" type="number" min="0" max="50" step="0.5" value="'+tc.juros+'" ' +
    'oninput="CFG.tumCfg.juros=+this.value;svCFG()"></div>';

  // Pedras
  h += '<div class="tum-cfg-sec" style="margin-top:16px">🪨 Pedras — Preço por m² (3cm)</div>';
  tc.pedras.forEach(function(p, i) {
    h += '<div class="cfg-row">' +
      '<div class="cfg-k">'+p.nm+' <span style="font-size:.6rem;color:var(--t4)">'+p.cat+'</span></div>' +
      '<div style="display:flex;gap:6px;align-items:center">' +
      '<input class="cfg-inp" type="number" min="0" value="'+p.pr+'" style="width:80px" ' +
      'oninput="CFG.tumCfg.pedras['+i+'].pr=+this.value;svCFG()">' +
      '<button onclick="tumCfgRemPedra('+i+')" style="background:rgba(192,90,74,.15);border:1px solid rgba(192,90,74,.3);color:var(--red);border-radius:6px;padding:4px 8px;cursor:pointer;font-size:.7rem">✕</button>' +
      '</div></div>';
  });
  h += '<button onclick="tumCfgAddPedra()" style="width:100%;padding:8px;margin-top:6px;background:var(--bg3);border:1px dashed var(--bd2);border-radius:8px;color:var(--t3);cursor:pointer;font-size:.72rem">+ Adicionar pedra</button>';

  // MO
  h += '<div class="tum-cfg-sec" style="margin-top:16px">🔨 Mão de Obra (R$/dia ou fixo)</div>';
  ['pedreiro','ajudante','instalacao','montagem','transporte'].forEach(function(k) {
    var labels = {pedreiro:'Pedreiro (R$/dia)',ajudante:'Ajudante (R$/dia)',
                  instalacao:'Instalação pedra (R$/dia)',montagem:'Montagem (R$/dia)',transporte:'Transporte (R$ fixo)'};
    h += F('mob', k, tc.mob[k], labels[k]);
  });

  // Materiais civis
  h += '<div class="tum-cfg-sec" style="margin-top:16px">🧱 Materiais Civis</div>';
  var civLabels = {
    cimento:'Cimento CP-II (saco 50kg)', areia:'Areia média (m³)', brita:'Brita 1 (m³)',
    argamassa:'Argamassa AC-II (saco 20kg)', ferro38:'Ferro 3/8\" (barra 12m)',
    ferro516:'Ferro 5/16\" (barra 12m)', malha:'Malha Q-92 (m²)', blocos:'Blocos 14×19×39 (un.)'
  };
  Object.keys(civLabels).forEach(function(k) {
    h += F('civil', k, tc.civil[k], civLabels[k]);
  });

  // Reset
  h += '<button onclick="tumCfgReset()" style="width:100%;padding:10px;margin-top:14px;background:var(--bg3);border:1px solid var(--bd2);border-radius:8px;color:var(--t3);cursor:pointer;font-size:.72rem">↺ Restaurar padrões</button>';
  return h;
}

function tumCfgAddPedra() {
  var nm = prompt('Nome da pedra:'); if (!nm) return;
  var pr = +prompt('Preço por m² (R$):') || 200;
  CFG.tumCfg.pedras.push({ id:'p_'+Date.now(), nm:nm, cat:'Personalizado', pr:pr, peso:75 });
  if (typeof svCFG === 'function') svCFG();
  if (typeof buildCfg === 'function') buildCfg();
  if (typeof toast   === 'function') toast('✓ Pedra adicionada!');
}

function tumCfgRemPedra(i) {
  if (CFG.tumCfg.pedras.length <= 1) { if(typeof toast==='function') toast('Precisa ter ao menos 1 pedra'); return; }
  CFG.tumCfg.pedras.splice(i, 1);
  if (typeof svCFG   === 'function') svCFG();
  if (typeof buildCfg === 'function') buildCfg();
}

function tumCfgReset() {
  if (!confirm('Restaurar todos os padrões de configuração de túmulos?')) return;
  CFG.tumCfg = JSON.parse(JSON.stringify(TUM_DEF_CFG));
  if (typeof svCFG   === 'function') svCFG();
  if (typeof buildCfg === 'function') buildCfg();
  if (typeof toast   === 'function') toast('✓ Padrões restaurados');
}

// ─────────────────────────────────────────────────────────────────────
// HELPERS DE RENDER
// ─────────────────────────────────────────────────────────────────────
function _card(title, body) {
  return '<div class="tum-card">' +
    '<div class="tum-card-hd"><span class="tum-card-title">'+title+'</span></div>' +
    '<div class="tum-card-body">'+body+'</div>' +
  '</div>';
}

function _fi(label, type, val, onin, ph) {
  return '<div class="tum-f"><label>'+label+'</label>' +
    '<input type="'+type+'" value="'+(val||'')+'" placeholder="'+(ph||'')+'" oninput="'+onin+'"></div>';
}

function _fiN(label, val, min, max, step, onin, hint) {
  return '<div class="tum-f"><label>'+label+'</label>' +
    '<input type="number" value="'+val+'" min="'+min+'" max="'+max+'" step="'+step+'" oninput="'+onin+'">' +
    (hint?'<span class="tum-hint">'+hint+'</span>':'')+'</div>';
}

function _fiSel(label, val, opts, onin, hint) {
  var sel = '<select onchange="'+onin+'">';
  opts.forEach(function(o){ sel += '<option value="'+o[0]+'"'+(+val===+o[0]?' selected':'')+'>'+o[1]+'</option>'; });
  sel += '</select>';
  return '<div class="tum-f"><label>'+label+'</label>'+sel+(hint?'<span class="tum-hint">'+hint+'</span>':'')+'</div>';
}

function _resCard(lbl, val, sub, cls) {
  return '<div class="tum-res-card"><div class="tum-res-lbl">'+lbl+'</div>' +
    '<div class="tum-res-val'+(cls?' tum-res-'+cls:'')+'">'+val+'</div>' +
    (sub?'<div class="tum-res-sub">'+sub+'</div>':'') +
  '</div>';
}

function _dLine(k, v, bold) {
  return '<div class="tum-det-line'+(bold?' tum-det-bold':'')+'"><span class="tum-det-k">'+k+'</span><span class="tum-det-v">'+v+'</span></div>';
}

// ─────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────
(function _tumCSS() {
  if (document.getElementById('tum-styles')) return;
  var s = document.createElement('style');
  s.id = 'tum-styles';
  s.textContent = `
    /* ── HERO ── */
    .tum-hero {
      background: linear-gradient(135deg, var(--s2,#101012), rgba(201,168,76,.05));
      border-bottom: 1px solid var(--bd,rgba(255,255,255,.06));
      padding: 16px 20px 14px;
    }
    .tum-hero-row { display:flex; justify-content:space-between; align-items:flex-start; }
    .tum-hero-title { font-size:.65rem; letter-spacing:.2em; text-transform:uppercase; color:var(--gold,#c9a84c); font-weight:700; margin-bottom:3px; }
    .tum-hero-sub   { font-size:.72rem; color:var(--t3,#787068); }
    .tum-hero-val   { font-family:'Cormorant Garamond',serif; font-size:1.7rem; font-weight:700; color:var(--gold2,#e8c96a); line-height:1.1; }

    /* ── TABS ── */
    .tum-tabs {
      display:flex; gap:2px; overflow-x:auto;
      background:var(--s2,#101012); border-bottom:1px solid var(--bd,rgba(255,255,255,.06));
      padding:0 16px;
    }
    .tum-tab {
      padding:10px 14px; font-size:.7rem; font-weight:500;
      color:var(--t3,#787068); border:none; background:none;
      border-bottom:2px solid transparent; cursor:pointer; white-space:nowrap;
      transition:all .15s;
    }
    .tum-tab:hover { color:var(--t2,#b0ab9e); }
    .tum-tab.on    { color:var(--gold,#c9a84c); border-bottom-color:var(--gold,#c9a84c); }

    /* ── CARDS ── */
    .tum-card {
      background:var(--s2,#101012); border:1px solid var(--bd,rgba(255,255,255,.06));
      border-radius:14px; overflow:hidden; margin:12px 16px;
    }
    .tum-card-hd {
      padding:12px 16px; border-bottom:1px solid var(--bd,rgba(255,255,255,.06));
    }
    .tum-card-title {
      font-family:'DM Mono',monospace; font-size:.58rem; letter-spacing:.18em;
      text-transform:uppercase; color:var(--gold,#c9a84c); font-weight:500;
    }
    .tum-card-body { padding:14px 16px; }

    /* ── GRIDS ── */
    .tum-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px; }
    .tum-grid3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:10px; }
    @media(max-width:480px) {
      .tum-grid3 { grid-template-columns:1fr 1fr; }
    }

    /* ── FORM FIELDS ── */
    .tum-f { display:flex; flex-direction:column; gap:3px; }
    .tum-f label {
      font-size:.58rem; color:var(--t3,#787068); text-transform:uppercase;
      letter-spacing:.06em; font-weight:500;
    }
    .tum-f input, .tum-f select, .tum-f textarea {
      background:var(--s3,#161618); border:1px solid var(--bd2,rgba(255,255,255,.10));
      border-radius:8px; padding:9px 12px; color:var(--tx,#edeae2);
      font-family:'Outfit',sans-serif; font-size:.84rem; outline:none; width:100%;
      transition:border-color .15s;
    }
    .tum-f input:focus, .tum-f select:focus, .tum-f textarea:focus { border-color:var(--gold,#c9a84c); }
    .tum-f select option { background:#1a1a1e; }
    .tum-hint { font-size:.57rem; color:var(--t4,#484440); margin-top:1px; }
    .tum-obs  { resize:vertical; min-height:70px; }

    /* ── PRESETS ── */
    .tum-presets { display:flex; flex-wrap:wrap; gap:7px; }
    .tum-preset {
      padding:6px 13px; border-radius:20px;
      border:1px solid var(--bd2,rgba(255,255,255,.10));
      background:var(--s3,#161618); font-size:.72rem; color:var(--t2,#b0ab9e);
      cursor:pointer; transition:all .15s; display:flex; align-items:center; gap:6px;
    }
    .tum-preset:hover  { border-color:var(--gold,#c9a84c); color:var(--gold,#c9a84c); }
    .tum-preset.on     { border-color:var(--gold,#c9a84c); background:rgba(201,168,76,.08); color:var(--gold2,#e8c96a); font-weight:600; }
    .tum-preset-badge  { font-size:.55rem; opacity:.65; }

    /* ── MATERIAL ── */
    .tum-mat-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(130px,1fr)); gap:7px; margin-bottom:10px; }
    .tum-mat {
      padding:10px 10px; border-radius:10px;
      border:1px solid var(--bd2,rgba(255,255,255,.10));
      background:var(--s3,#161618); cursor:pointer; text-align:center; transition:all .15s;
    }
    .tum-mat:hover { border-color:var(--gold,#c9a84c); }
    .tum-mat.on    { border-color:var(--gold,#c9a84c); background:rgba(201,168,76,.08); }
    .tum-mat-nm    { font-size:.72rem; font-weight:700; color:var(--t2,#b0ab9e); margin-bottom:2px; }
    .tum-mat-cat   { font-size:.56rem; color:var(--t4,#484440); margin-bottom:4px; }
    .tum-mat-pr    { font-size:.68rem; font-weight:700; color:var(--gold,#c9a84c); }

    /* ── ACABAMENTOS ── */
    .tum-acab-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(110px,1fr)); gap:7px; margin-bottom:10px; }
    .tum-acab {
      padding:9px 8px; border-radius:10px;
      border:1px solid var(--bd2,rgba(255,255,255,.10));
      background:var(--s3,#161618); cursor:pointer; text-align:center; transition:all .15s;
    }
    .tum-acab:hover { border-color:var(--gold,#c9a84c); }
    .tum-acab.on    { border-color:var(--gold,#c9a84c); background:rgba(201,168,76,.09); }
    .tum-acab-nm    { font-size:.68rem; font-weight:700; color:var(--t2,#b0ab9e); margin-bottom:2px; }
    .tum-acab-pr    { font-size:.62rem; color:var(--gold,#c9a84c); margin-bottom:3px; }
    .tum-acab-desc  { font-size:.54rem; color:var(--t4,#484440); line-height:1.3; }

    /* ── TOGGLES ── */
    .tum-tog-row {
      display:flex; align-items:center; justify-content:space-between;
      padding:10px 0; border-bottom:1px solid var(--bd,rgba(255,255,255,.06));
    }
    .tum-tog-row:last-child { border-bottom:none; }
    .tum-tog-info { flex:1; }
    .tum-tog-nm   { font-size:.78rem; color:var(--t2,#b0ab9e); }
    .tum-tog-sub  { font-size:.62rem; color:var(--t4,#484440); margin-top:1px; }
    .tum-tog {
      width:40px; height:22px; border-radius:11px;
      background:var(--s3,#161618); border:1px solid var(--bd2,rgba(255,255,255,.10));
      position:relative; cursor:pointer; transition:background .2s; flex-shrink:0;
    }
    .tum-tog::after {
      content:''; position:absolute;
      left:3px; top:3px; width:14px; height:14px;
      border-radius:50%; background:var(--t4,#484440);
      transition:left .2s, background .2s;
    }
    .tum-tog.on { background:rgba(201,168,76,.18); border-color:var(--gold,#c9a84c); }
    .tum-tog.on::after { left:21px; background:var(--gold,#c9a84c); }

    /* ── INFO / ALERTA ── */
    .tum-info-box {
      background:rgba(201,168,76,.06); border:1px solid rgba(201,168,76,.18);
      border-radius:8px; padding:10px 12px; font-size:.74rem; color:var(--t2,#b0ab9e);
      line-height:1.5; margin-bottom:12px;
    }
    .tum-info-box strong { color:var(--gold2,#e8c96a); }
    .tum-alerta {
      background:rgba(192,90,74,.08); border:1px solid rgba(192,90,74,.25);
      border-radius:8px; padding:10px 12px; font-size:.74rem; color:#e07060;
      line-height:1.5; margin-bottom:10px;
    }

    /* ── RESULTADO ── */
    .tum-res-grid {
      display:grid; grid-template-columns:repeat(3,1fr);
      gap:8px; margin:12px 16px;
    }
    @media(max-width:480px){ .tum-res-grid{grid-template-columns:1fr 1fr;} }
    .tum-res-card {
      background:var(--s3,#161618); border:1px solid var(--bd,rgba(255,255,255,.06));
      border-radius:12px; padding:11px 12px;
    }
    .tum-res-lbl { font-size:.54rem; color:var(--t4,#484440); text-transform:uppercase; letter-spacing:.08em; margin-bottom:4px; }
    .tum-res-val { font-size:.92rem; font-weight:700; color:var(--tx,#edeae2); line-height:1.2; }
    .tum-res-gold{ color:var(--gold2,#e8c96a)!important; }
    .tum-res-grn { color:#5a9a6a!important; }
    .tum-res-sub { font-size:.57rem; color:var(--t4,#484440); margin-top:2px; }

    /* ── DETALHAMENTO ── */
    .tum-det-line {
      display:flex; justify-content:space-between; align-items:baseline;
      padding:6px 0; border-bottom:1px solid var(--bd,rgba(255,255,255,.06));
      font-size:.78rem;
    }
    .tum-det-line:last-child { border-bottom:none; }
    .tum-det-k   { color:var(--t2,#b0ab9e); }
    .tum-det-v   { font-weight:600; color:var(--tx,#edeae2); }
    .tum-det-bold .tum-det-k { color:var(--t3,#787068); font-weight:700; font-size:.7rem; text-transform:uppercase; letter-spacing:.08em; }
    .tum-det-bold .tum-det-v { font-size:.92rem; }
    .tum-dim { font-size:.65rem; color:var(--t4,#484440); margin-left:4px; }

    /* ── TOTAL ── */
    .tum-total-box {
      background:var(--s3,#161618); border:1px solid rgba(201,168,76,.25);
      border-radius:14px; padding:16px; margin:12px 16px;
    }
    .tum-total-linha {
      display:flex; justify-content:space-between; padding:5px 0;
      font-size:.78rem; color:var(--t3,#787068); border-bottom:1px solid var(--bd,rgba(255,255,255,.06));
    }
    .tum-total-linha:last-of-type { border-bottom:none; }
    .tum-total-main {
      display:flex; justify-content:space-between; align-items:baseline;
      padding:12px 0 8px; font-size:.75rem; color:var(--t3,#787068);
    }
    .tum-total-val {
      font-family:'Cormorant Garamond',serif;
      font-size:2rem; font-weight:700; color:var(--gold2,#e8c96a); line-height:1;
    }
    .tum-total-parc { font-size:.72rem; color:var(--t4,#484440); margin-top:2px; }
    .tum-prazo      { font-size:.68rem; color:var(--t3,#787068); margin-top:6px; }

    /* ── AÇÕES ── */
    .tum-acoes {
      display:flex; gap:8px; flex-wrap:wrap;
      margin:12px 16px 24px;
    }
    .tum-btn-gold {
      padding:11px 20px; border-radius:10px; border:none;
      background:var(--gold,#c9a84c); color:#0a0805;
      font-family:'Outfit',sans-serif; font-size:.82rem; font-weight:700;
      cursor:pointer; transition:all .15s;
    }
    .tum-btn-gold:hover { background:var(--gold2,#e8c96a); }
    .tum-btn-gold.tum-btn-full { width:calc(100% - 32px); margin:4px 16px; display:block; text-align:center; }
    .tum-btn-out {
      padding:9px 16px; border-radius:10px;
      border:1px solid var(--bd2,rgba(255,255,255,.10));
      background:transparent; color:var(--t2,#b0ab9e);
      font-family:'Outfit',sans-serif; font-size:.78rem;
      cursor:pointer; transition:all .15s;
    }
    .tum-btn-out:hover  { border-color:var(--gold,#c9a84c); color:var(--gold,#c9a84c); }
    .tum-btn-sm         { padding:6px 12px; font-size:.68rem; }

    /* ── HISTÓRICO ── */
    .tum-hist-card {
      background:var(--s2,#101012); border:1px solid var(--bd,rgba(255,255,255,.06));
      border-radius:12px; padding:13px 15px; margin-bottom:9px; cursor:pointer;
      transition:border-color .15s;
    }
    .tum-hist-card:hover { border-color:rgba(201,168,76,.3); }
    .tum-hist-row  { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px; }
    .tum-hist-cli  { font-size:.92rem; font-weight:600; color:var(--tx,#edeae2); }
    .tum-hist-val  { font-size:.85rem; font-weight:700; color:var(--gold2,#e8c96a); }
    .tum-hist-meta { font-size:.68rem; color:var(--t3,#787068); display:flex; gap:10px; flex-wrap:wrap; margin-bottom:6px; }
    .tum-hist-badges { display:flex; gap:7px; }
    .tum-badge {
      display:inline-block; padding:2px 8px; border-radius:20px;
      font-size:.56rem; font-weight:700; letter-spacing:.06em;
      background:rgba(201,168,76,.1); border:1px solid rgba(201,168,76,.25); color:var(--gold,#c9a84c);
    }

    /* ── VAZIO ── */
    .tum-empty {
      text-align:center; padding:50px 20px;
      color:var(--t4,#484440); font-size:.82rem; line-height:1.8;
    }

    /* ── CONFIG TAB ── */
    .tum-cfg-sec {
      font-size:.56rem; letter-spacing:.18em; text-transform:uppercase;
      color:var(--gold,#c9a84c); font-weight:700; padding:4px 0 6px;
      border-bottom:1px solid rgba(201,168,76,.15); margin-bottom:8px;
    }
  `;
  document.head.appendChild(s);
})();

// ─────────────────────────────────────────────────────────────────────
// INICIALIZAÇÃO AUTOMÁTICA
// ─────────────────────────────────────────────────────────────────────
window.addEventListener('load', function() {
  _tumInitCfg();
  _tumInjectCfgTab();
});
