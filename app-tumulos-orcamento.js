// ══════════════════════════════════════════════════════════════════════
// APP-TUMULOS-ORCAMENTO.JS — Orçamento de Túmulos Integrado
// HR Mármores e Granitos · v3.0
// ⚠ Medidas em CENTÍMETROS
// Integração: DB.j (Agenda) · DB.t (Finanças) · DB.q (Orçamentos)
// ══════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────
// CONFIGURAÇÃO PADRÃO
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
    cimento:    38,
    areia:     120,
    brita:     150,
    argamassa:  28,
    ferro38:    42,
    ferro516:   28,
    malha:      45,
    blocos:    4.5
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
// PRESETS — todas as medidas em cm
// C=comprimento, L=largura, E=espessura pedra, N=gavetas
// Ae=base estrutural(cm), Ab=rodapé(cm)
// ─────────────────────────────────────────────────────────────────────
var TUM_PRESETS = [
  { id:'simples',  nm:'Simples',       C:190, L:65, E:3, N:0, Ae:30, Ab:0,  badge:'Sem gaveta'  },
  { id:'1gav',     nm:'1 Gaveta',      C:200, L:70, E:3, N:1, Ae:30, Ab:8,  badge:'1 gaveta'    },
  { id:'dupla',    nm:'Dupla Gaveta',  C:200, L:70, E:3, N:2, Ae:30, Ab:8,  badge:'2 gavetas'   },
  { id:'premium',  nm:'Premium',       C:210, L:80, E:4, N:2, Ae:30, Ab:8,  badge:'Destaque'    },
  { id:'capela',   nm:'Capela',        C:220, L:90, E:3, N:3, Ae:35, Ab:8,  badge:'3–4 gav'     },
  { id:'moderno',  nm:'Moderno',       C:200, L:75, E:3, N:2, Ae:30, Ab:0,  badge:'1–2 gav'     },
  { id:'parcial',  nm:'Rev. Parcial',  C:190, L:65, E:3, N:1, Ae:30, Ab:0,  badge:'Econômico'   },
  { id:'completo', nm:'Rev. Completo', C:210, L:80, E:3, N:2, Ae:30, Ab:8,  badge:'Completo'    }
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
// ACABAMENTOS (R$/ml linear)
// ─────────────────────────────────────────────────────────────────────
var TUM_ACAB = [
  { id:'SEM', nm:'Sem acabamento',    prML:0,  dif:1.00, desc:'Borda bruta de corte'          },
  { id:'1L',  nm:'1 Lateral',         prML:8,  dif:1.05, desc:'Uma borda polida/bisotada'     },
  { id:'2L',  nm:'2 Laterais',        prML:14, dif:1.08, desc:'Duas bordas opostas'           },
  { id:'4L',  nm:'4 Laterais',        prML:24, dif:1.12, desc:'Todas as bordas'               },
  { id:'45G', nm:'45° Esquadria',     prML:18, dif:1.15, desc:'Borda em ângulo, sem emenda'   },
  { id:'BOL', nm:'Boleado',           prML:22, dif:1.20, desc:'Borda arredondada R=1,5cm'     },
  { id:'ESC', nm:'Escovado',          prML:12, dif:1.10, desc:'Textura antiderrapante'        },
  { id:'POL', nm:'Polido Brilho',     prML:20, dif:1.18, desc:'Espelho — memorial premium'    },
  { id:'FLA', nm:'Flameado',          prML:16, dif:1.12, desc:'Textura rústica por chama'     }
];

// ─────────────────────────────────────────────────────────────────────
// PEÇAS
// ─────────────────────────────────────────────────────────────────────
var TUM_PECAS_DEF = [
  { id:'tampa',   nm:'Tampa Superior',   sub:'Peça principal — todas as versões'  },
  { id:'lat_esq', nm:'Lateral Esquerda', sub:'Revestimento parcial e completo'    },
  { id:'lat_dir', nm:'Lateral Direita',  sub:'Revestimento completo'              },
  { id:'frente',  nm:'Frente / Frontal', sub:'Todas as versões'                   },
  { id:'fundo',   nm:'Fundo / Tardoz',   sub:'Revestimento completo / opcional'   },
  { id:'lapide',  nm:'Lápide',           sub:'60×40 cm padrão'                    },
  { id:'rodape',  nm:'Rodapé de Pedra',  sub:'Perímetro × altura do rodapé'       }
];

// ─────────────────────────────────────────────────────────────────────
// OPCIONAIS
// ─────────────────────────────────────────────────────────────────────
var TUM_OPTS_DEF = [
  { id:'cemiterio',    nm:'Instalação em cemitério',     sub:'+10% dificuldade · +20% logística',    fixo:0   },
  { id:'polido_extra', nm:'Polimento extra completo',    sub:'+5% dificuldade',                       fixo:0   },
  { id:'gravacao',     nm:'Gravação / letras na lápide', sub:'+5% dificuldade',                       fixo:0   },
  { id:'cruzGranito',  nm:'Cruz em granito',             sub:'Valor fixo R$ 350,00',                  fixo:350 },
  { id:'foto_porc',    nm:'Foto em porcelana',           sub:'Valor fixo R$ 200,00',                  fixo:200 }
];

// ─────────────────────────────────────────────────────────────────────
// ESTADO GLOBAL
// ─────────────────────────────────────────────────────────────────────
var TUM = {
  q: {
    // Identificação
    cli:'', tel:'', cemiterio:'', cidade:'', falecido:'', quadra:'', lote:'', obs:'',
    // Modelo
    preset: 'dupla',
    // ⚠ MEDIDAS EM CENTÍMETROS
    C:  200,  // comprimento (cm)
    L:   70,  // largura (cm)
    E:    3,  // espessura da pedra (cm)
    N:    2,  // gavetas
    Ae:  30,  // base estrutural (cm)
    Ab:   8,  // rodapé (cm)
    // Seleções
    matId:    null,
    acabId:   'POL',
    perda:    12,    // % perda no corte
    fatorCem: 20,    // % frete extra cemitério
    // Peças
    pecas: { tampa:true, lat_esq:true, lat_dir:true, frente:true, fundo:false, lapide:false, rodape:false },
    // Opcionais
    opts:  { cemiterio:false, polido_extra:false, gravacao:false, cruzGranito:false, foto_porc:false }
  },
  calc:  null,
  _tab:  'dados',
  _hist: []
};

// ─────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────
function _r2(v) { return Math.round(v * 100)  / 100;  }
function _r3(v) { return Math.round(v * 1000) / 1000; }
function _cm(v) { return Math.round(+v) + ' cm'; }
function _F(v)  { return typeof fm === 'function' ? fm(v) : v.toFixed(2); }
function _td()  { return typeof td === 'function' ? td() : new Date().toLocaleDateString('pt-BR'); }

function _tumCfg() {
  return (typeof CFG !== 'undefined' && CFG.tumCfg) ? CFG.tumCfg : TUM_DEF_CFG;
}

function _tumPedras() {
  if (typeof CFG !== 'undefined' && CFG.stones && CFG.stones.length) {
    return CFG.stones.map(function(s) {
      return { id:s.id, nm:s.nm, cat:s.cat||s.fin||'', pr:s.pr, peso:s.peso||76 };
    });
  }
  return _tumCfg().pedras;
}

// ─────────────────────────────────────────────────────────────────────
// MOTOR DE CÁLCULO (medidas entram em cm, convertidas para metros)
// ─────────────────────────────────────────────────────────────────────
function _tumCalcFull() {
  var q   = TUM.q;
  var cfg = _tumCfg();

  // cm → metros para cálculo interno
  var C  = q.C  / 100;
  var L  = q.L  / 100;
  var E  = q.E;                 // espessura: mantemos em cm como índice
  var N  = Math.max(0, Math.round(q.N));
  var Ae = q.Ae / 100;
  var Ab = q.Ab / 100;

  // Altura total: base + gavetas (45cm cada) + tampa (E+2cm)
  var At_cm = E + 2;
  var At    = At_cm / 100;
  var A     = Ae + (N * 0.45) + At;
  var A_cm  = _r2(A * 100);

  var _pedras = _tumPedras();
  var mat  = _pedras.find(function(x){ return x.id === q.matId; }) || _pedras[0];
  var acab = TUM_ACAB.find(function(x){ return x.id === q.acabId; }) || TUM_ACAB[0];

  // ── 1. PEÇAS DE PEDRA ────────────────────────────────────────────
  var pecasCalc = [];
  var m2_bruto  = 0;

  function peca(nm, dim, m2, ml) {
    pecasCalc.push({ nm:nm, dim:dim, m2:_r2(m2), ml:_r2(ml) });
    m2_bruto += m2;
  }

  if (q.pecas.tampa)   peca('Tampa Superior',            _cm(q.C)+'×'+_cm(q.L),         C*L,         2*(C+L));
  if (q.pecas.lat_esq) peca('Lateral Esquerda',          _cm(A_cm)+'×'+_cm(q.L),         A*L,         A);
  if (q.pecas.lat_dir) peca('Lateral Direita',           _cm(A_cm)+'×'+_cm(q.L),         A*L,         A);
  if (q.pecas.frente)  peca('Frente / Frontal',          _cm(A_cm)+'×'+_cm(q.C),         A*C,         2*C);
  if (q.pecas.fundo)   peca('Fundo / Tardoz',            _cm(A_cm)+'×'+_cm(q.C),         A*C,         0);
  if (q.pecas.lapide)  peca('Lápide (60×40 cm)',         '60×40 cm',                      0.60*0.40,   2*(0.60+0.40));

  var N_lajes = Math.max(0, N - 1);
  if (N_lajes > 0)
    peca('Laje Divisória (×'+N_lajes+')', _cm(q.C)+'×'+_cm(q.L)+'×'+N_lajes, C*L*N_lajes, 0);

  if (q.pecas.rodape && Ab > 0) {
    var perim = 2*(C+L);
    peca('Rodapé', q.Ab+' cm × '+_r2(perim)+' ml', Ab*perim, perim);
  }

  var fatorPerda = 1 + (q.perda / 100);
  var m2_total   = _r3(m2_bruto * fatorPerda);

  // Multiplicador de espessura
  var espMult = {2:1.00, 3:1.35, 4:1.70, 5:2.10};
  var espM    = espMult[E] || 1.35;
  var custo_pedra  = _r2(m2_total * mat.pr * espM);
  var peso_total   = _r2(m2_total * mat.peso * (E / 3));

  // ── 2. ACABAMENTOS ───────────────────────────────────────────────
  var ml_total = 0;
  pecasCalc.forEach(function(p){ ml_total += p.ml; });
  ml_total = _r2(ml_total);
  var custo_acabamento = _r2(ml_total * acab.prML);

  // ── 3. CONSTRUÇÃO CIVIL ──────────────────────────────────────────
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

  // ── 4. MÃO DE OBRA ───────────────────────────────────────────────
  var Dif = 1.00;
  Dif += 0.05 * N;
  if (q.opts.cemiterio)    Dif += 0.10;
  if (q.opts.polido_extra) Dif += 0.05;
  if (q.opts.gravacao)     Dif += 0.05;
  if (acab.id === 'POL' || acab.id === '45G') Dif += 0.05;
  if (q.pecas.fundo && q.pecas.lat_esq && q.pecas.lat_dir) Dif += 0.08;
  Dif = _r2(Dif);

  var mob          = cfg.mob;
  var v_pedreiro   = _r2((2 + N)        * mob.pedreiro   * Dif);
  var v_ajudante   = _r2((2 + N)        * mob.ajudante   * Dif);
  var v_instalacao = _r2((1.5 + N*0.5)  * mob.instalacao);
  var v_montagem   = _r2((0.5 + N*0.25) * mob.montagem   * Dif);
  var v_frete      = mob.transporte + (N >= 2 ? 80 : 0);
  var custo_mob    = _r2(v_pedreiro + v_ajudante + v_instalacao + v_montagem + v_frete);

  // ── 5. EXTRAS FIXOS ─────────────────────────────────────────────
  var custo_extras = 0;
  if (q.opts.cruzGranito) custo_extras += 350;
  if (q.opts.foto_porc)   custo_extras += 200;

  // ── 6. PRAZO (dias úteis) ────────────────────────────────────────
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
  var valor_vista = _r2(custo_total / (1 - margem / 100));
  var valor_parc  = _r2(valor_vista * (1 + juros / 100));
  var parc_mensal = _r2(valor_parc  / parcMax);
  var lucro       = _r2(valor_vista - custo_total);

  // ── 8. ALERTA GAVETA ─────────────────────────────────────────────
  var C_int_cm = q.C - 30;
  var L_int_cm = q.L - 30;
  var alertaGaveta = N > 0 && (C_int_cm < 175 || L_int_cm < 55);

  return {
    C:C, L:L, E:E, N:N, Ae:Ae, Ab:Ab, A:A,
    A_cm:A_cm, At_cm:At_cm, N_lajes:N_lajes,
    C_int_cm:C_int_cm, L_int_cm:L_int_cm, alertaGaveta:alertaGaveta,
    mat:mat, acab:acab, espM:espM,
    pecasCalc:pecasCalc,
    m2_bruto:_r3(m2_bruto), m2_total:m2_total,
    ml_total:ml_total, peso_total:peso_total,
    custo_pedra:custo_pedra,
    custo_acabamento:custo_acabamento,
    custo_civil:custo_civil,
    custo_mob:custo_mob,
    custo_extras:custo_extras,
    Vol_total:_r3(Vol_total),
    sacos_cimento:sacos_cimento, m3_areia:m3_areia, m3_brita:m3_brita,
    sacos_argam:sacos_argam, barras_f38:barras_f38, barras_f516:barras_f516,
    m2_malha:m2_malha, unid_blocos:unid_blocos,
    v_pedreiro:v_pedreiro, v_ajudante:v_ajudante,
    v_instalacao:v_instalacao, v_montagem:v_montagem, v_frete:v_frete, Dif:Dif,
    custo_total:custo_total,
    valor_vista:valor_vista, valor_parc:valor_parc,
    parc_mensal:parc_mensal, lucro:lucro,
    margem:margem, parcMax:parcMax, juros:juros,
    prazo_total:prazo_total,
    prazo_dias:prazo_total,
    // Aliases para DB
    venda:      valor_vista,
    custoTotal: custo_total,
    lucroTotal: lucro,
    margemReal: valor_vista > 0 ? _r2(lucro / valor_vista * 100) : 0
  };
}

// ─────────────────────────────────────────────────────────────────────
// INIT / ENTRY
// ─────────────────────────────────────────────────────────────────────
function tumInit()   { _tumBoot(); }
function renderTum() { _tumBoot(); }

function _tumBoot() {
  _tumInitCfg();
  _tumLoadHist();
  if (!TUM.q.matId) TUM.q.matId = _tumPedras()[0].id;
  TUM.calc = _tumCalcFull();
  _tumRender();
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

function _tumLoadHist() {
  try { TUM._hist = JSON.parse(localStorage.getItem('hr_tum_hist') || '[]'); }
  catch(e) { TUM._hist = []; }
}

// ─────────────────────────────────────────────────────────────────────
// RENDER PRINCIPAL
// ─────────────────────────────────────────────────────────────────────
function _tumRender() {
  var pg = document.getElementById('pg9');
  if (!pg) return;
  var r  = TUM.calc || {};
  var vf = r.valor_vista || 0;
  var q  = TUM.q;
  var preset = TUM_PRESETS.find(function(p){ return p.id === q.preset; });
  var subLbl = (preset ? preset.nm : '') +
    (q.N > 0 ? ' · ' + q.N + ' gav.' : '') +
    ' · ' + q.C + '×' + q.L + ' cm';

  pg.innerHTML =
    '<div class="tum-hero">' +
      '<div class="tum-hero-row">' +
        '<div>' +
          '<div class="tum-hero-title">⚰️ Orçamento de Túmulo</div>' +
          '<div class="tum-hero-sub">' + subLbl + '</div>' +
        '</div>' +
        '<div style="text-align:right">' +
          '<div class="tum-hero-val">' + (vf > 0 ? 'R$ ' + _F(vf) : '—') + '</div>' +
          (r.lucro > 0 ? '<div style="font-size:.6rem;color:var(--grn);margin-top:2px">lucro R$ ' + _F(r.lucro) + ' · ' + r.margemReal + '%</div>' : '') +
        '</div>' +
      '</div>' +
    '</div>' +
    _tumTabs() +
    '<div id="tumBody" style="padding-bottom:90px"></div>';

  _tumRenderTab();
}

function _tumTabs() {
  var tabs = [
    { id:'dados',       lb:'① Dados'      },
    { id:'pedras',      lb:'② Pedras'     },
    { id:'acabamentos', lb:'③ Acabamentos'},
    { id:'resumo',      lb:'④ Resumo'     },
    { id:'historico',   lb:'📋 Histórico'  }
  ];
  var h = '<div class="tum-tabs">';
  tabs.forEach(function(t) {
    h += '<button class="tum-tab' + (TUM._tab === t.id ? ' on' : '') + '" onclick="tumTab(\'' + t.id + '\')">' + t.lb + '</button>';
  });
  return h + '</div>';
}

function tumTab(id) {
  TUM._tab = id;
  _tumRenderTab();
  document.querySelectorAll('.tum-tab').forEach(function(el) {
    var on = el.getAttribute('onclick').indexOf("'" + id + "'") > -1;
    el.classList.toggle('on', on);
  });
}

function _tumRenderTab() {
  var body = document.getElementById('tumBody');
  if (!body) return;
  var r   = TUM.calc;
  var map = {
    dados:        _tabDados,
    pedras:       _tabPedras,
    acabamentos:  _tabAcabamentos,
    resumo:       _tabResumo,
    historico:    _tabHistorico
  };
  body.innerHTML = (map[TUM._tab] || _tabDados)(r);
}

function tumRecalc() {
  TUM.calc = _tumCalcFull();
  var r  = TUM.calc || {};
  var vf = r.valor_vista || 0;
  // Atualiza hero sem re-renderizar tudo
  var hv = document.querySelector('.tum-hero-val');
  if (hv) hv.textContent = vf > 0 ? 'R$ ' + _F(vf) : '—';
  var hs = document.querySelector('.tum-hero-sub');
  if (hs) {
    var q = TUM.q;
    var preset = TUM_PRESETS.find(function(p){ return p.id === q.preset; });
    hs.textContent = (preset ? preset.nm : '') + (q.N > 0 ? ' · ' + q.N + ' gav.' : '') + ' · ' + q.C + '×' + q.L + ' cm';
  }
  _tumRenderTab();
}

// ─────────────────────────────────────────────────────────────────────
// COMPONENTES UI
// ─────────────────────────────────────────────────────────────────────
function _card(title, body) {
  return '<div class="tum-card"><div class="tum-card-title">' + title + '</div>' + body + '</div>';
}

function _fi(lbl, type, val, onchange, ph) {
  return '<div class="tum-f"><label class="tum-lbl">' + lbl + '</label>' +
    '<input class="tum-in" type="' + type + '" value="' + (val||'') + '" placeholder="' + (ph||'') + '" oninput="' + onchange + '"></div>';
}

function _fiN(lbl, val, min, max, step, onchange, hint) {
  return '<div class="tum-f"><label class="tum-lbl">' + lbl + '</label>' +
    '<input class="tum-in" type="number" value="' + val + '" min="' + min + '" max="' + max + '" step="' + step + '" oninput="' + onchange + '">' +
    (hint ? '<div class="tum-hint">' + hint + '</div>' : '') + '</div>';
}

function _fiSel(lbl, val, opts, onchange, hint) {
  var s = '<div class="tum-f"><label class="tum-lbl">' + lbl + '</label><select class="tum-in" onchange="' + onchange + '">';
  opts.forEach(function(o) { s += '<option value="' + o[0] + '"' + (val == o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; });
  return s + '</select>' + (hint ? '<div class="tum-hint">' + hint + '</div>' : '') + '</div>';
}

function _dLine(lbl, val, bold) {
  return '<div class="tum-dline' + (bold ? ' tum-dline-b' : '') + '"><span>' + lbl + '</span><span>' + val + '</span></div>';
}

function _resCard(lbl, val, sub, col) {
  var c = col === 'gold' ? 'var(--gold2)' : col === 'grn' ? 'var(--grn)' : 'var(--t1)';
  return '<div class="tum-rcard"><div class="tum-rcard-lbl">' + lbl + '</div>' +
    '<div class="tum-rcard-val" style="color:' + c + '">' + val + '</div>' +
    '<div class="tum-rcard-sub">' + (sub||'') + '</div></div>';
}

// ─────────────────────────────────────────────────────────────────────
// ABA: DADOS — identificação + preset + medidas em cm
// ─────────────────────────────────────────────────────────────────────
function _tabDados(r) {
  var q = TUM.q;
  var h = '';

  // ① Identificação
  h += _card('① Identificação',
    '<div class="tum-grid2">' +
    _fi('Nome do Cliente', 'text', q.cli,       'tumSet("cli",this.value)',       'Ex: Maria Silva') +
    _fi('Telefone',        'tel',  q.tel,       'tumSet("tel",this.value)',       '(74) 99999-9999') +
    '</div>' +
    '<div class="tum-grid2">' +
    _fi('Cemitério',       'text', q.cemiterio, 'tumSet("cemiterio",this.value)', 'Nome do cemitério') +
    _fi('Cidade',          'text', q.cidade,    'tumSet("cidade",this.value)',    'Pilão Arcado — BA') +
    '</div>' +
    '<div class="tum-grid3">' +
    _fi('Falecido(a)',     'text', q.falecido,  'tumSet("falecido",this.value)',  'Nome completo') +
    _fi('Quadra',          'text', q.quadra,    'tumSet("quadra",this.value)',    'Q-12') +
    _fi('Lote / Número',   'text', q.lote,      'tumSet("lote",this.value)',      'L-04') +
    '</div>'
  );

  // ② Tipo de Túmulo (presets)
  var pbh = '<div class="tum-presets">';
  TUM_PRESETS.forEach(function(p) {
    pbh += '<button class="tum-preset' + (q.preset === p.id ? ' on' : '') + '" onclick="tumAplicarPreset(\'' + p.id + '\')">' +
      p.nm + '<span class="tum-preset-badge">' + p.badge + '</span></button>';
  });
  pbh += '</div>';
  h += _card('② Tipo de Túmulo', pbh);

  // ③ Medidas em cm
  var A_cm = r ? r.A_cm : _r2(q.Ae + q.N * 45 + q.E + 2);
  var alerta = r && r.alertaGaveta
    ? '<div class="tum-alerta">⚠ Espaço interno pode ser insuficiente para caixão padrão (mín. 175×55 cm). Revise C e L.</div>'
    : '';
  var info = '<div class="tum-info-box">📐 <strong>Altura calculada:</strong> ' +
    'Base (' + q.Ae + ' cm) + (' + q.N + ' gav × 45 cm) + Tampa (' + (q.E+2) + ' cm) = <strong>' + A_cm + ' cm</strong></div>';

  h += _card('③ Medidas <span style="font-size:.6rem;color:var(--t3)">(todas em cm)</span>',
    info + alerta +
    '<div class="tum-grid3">' +
    _fiN('Comprimento (cm)', q.C,  50,  500, 1,   'tumDim("C",this.value)',   'Tampa · Frente · Fundo') +
    _fiN('Largura (cm)',     q.L,  30,  200, 1,   'tumDim("L",this.value)',   'Tampa · Laterais') +
    _fiN('Espessura pedra (cm)', q.E, 2, 6, 0.5, 'tumDim("E",this.value)',   '2–3 cm lateral · 3–4 cm tampa') +
    '</div>' +
    '<div class="tum-grid3">' +
    _fiSel('Nº de Gavetas', q.N,
      [[0,'0 — Sem gaveta'],[1,'1 Gaveta'],[2,'2 Gavetas'],[3,'3 Gavetas'],[4,'4 Gavetas']],
      'tumDim("N",this.value)', 'Cada gaveta = +45 cm de altura') +
    _fiN('Base estrutural (cm)', q.Ae, 10, 100, 5, 'tumDim("Ae",this.value)', 'Altura da base de concreto') +
    _fiN('Rodapé de pedra (cm)', q.Ab, 0,   20, 1, 'tumDim("Ab",this.value)', '0 = sem rodapé') +
    '</div>'
  );

  // ④ Observações
  h += _card('④ Observações',
    '<textarea class="tum-obs" oninput="tumSet(\'obs\',this.value)" placeholder="Detalhes especiais, instruções de instalação, pedidos do cliente...">' + (q.obs||'') + '</textarea>'
  );

  h += '<button class="tum-btn-gold tum-btn-full" onclick="tumTab(\'pedras\')">Próximo: Pedras →</button>';
  return h;
}

// ─────────────────────────────────────────────────────────────────────
// ABA: PEDRAS
// ─────────────────────────────────────────────────────────────────────
function _tabPedras(r) {
  var q   = TUM.q;
  var h   = '';

  // Material
  var _pedras = _tumPedras();
  var mh = '<div class="tum-mat-grid">';
  _pedras.forEach(function(p) {
    var on = p.id === q.matId;
    mh += '<button class="tum-mat' + (on ? ' on' : '') + '" onclick="tumSelMat(\'' + p.id + '\')">' +
      '<div class="tum-mat-nm">' + p.nm + '</div>' +
      '<div class="tum-mat-cat">' + p.cat + '</div>' +
      '<div class="tum-mat-pr">R$ ' + p.pr + '/m²</div>' +
      '</button>';
  });
  mh += '</div>';
  var matSel = _pedras.find(function(x){ return x.id === q.matId; });
  if (matSel && r) {
    var eMult = {2:'1,00×', 3:'1,35×', 4:'1,70×', 5:'2,10×'};
    var eVal  = _r2(matSel.pr * (r.espM || 1.35));
    mh += '<div class="tum-info-box">📊 ' + matSel.nm + ' · esp. ' + q.E + ' cm (mult. ' + (eMult[q.E]||'1,35×') +
      ') → R$ ' + matSel.pr + ' × ' + (eMult[q.E]||'1,35×') + ' = <strong>R$ ' + eVal.toFixed(2) + '/m²</strong></div>';
  }
  h += _card('⑤ Material da Pedra', mh);

  // Fator de perda
  h += _card('⑥ Fator de Perda (%)',
    '<div class="tum-grid2">' +
    _fiN('Perda no corte (%)', q.perda, 5, 30, 1, 'tumDimAdv("perda",this.value)', 'Padrão: 12% — recortes, emendas, rejeitos') +
    '</div>' +
    (r ? '<div class="tum-info-box">m² bruto: ' + r.m2_bruto + ' m² → com perda ' + q.perda + '%: <strong>' + r.m2_total + ' m²</strong> · Peso: ' + r.peso_total + ' kg</div>' : '')
  );

  // Peças incluídas
  var ph = '';
  TUM_PECAS_DEF.forEach(function(p) {
    var on  = !!q.pecas[p.id];
    var dim = '';
    if (r && r.pecasCalc) {
      var pc = r.pecasCalc.find(function(x){ return x.nm.indexOf(p.nm.split('/')[0].trim()) > -1; });
      if (pc) dim = pc.dim + ' = ' + pc.m2 + ' m²';
    }
    ph += '<div class="tum-tog-row">' +
      '<div class="tum-tog-info">' +
        '<div class="tum-tog-nm">' + p.nm + '</div>' +
        '<div class="tum-tog-sub">' + (dim || p.sub) + '</div>' +
      '</div>' +
      '<div class="tum-tog' + (on ? ' on' : '') + '" onclick="tumTogPeca(\'' + p.id + '\')"></div>' +
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

  var ah = '<div class="tum-acab-grid">';
  TUM_ACAB.forEach(function(a) {
    var on = q.acabId === a.id;
    ah += '<button class="tum-acab' + (on ? ' on' : '') + '" onclick="tumSelAcab(\'' + a.id + '\')">' +
      '<div class="tum-acab-nm">' + a.nm + '</div>' +
      '<div class="tum-acab-pr">' + (a.prML > 0 ? 'R$ ' + a.prML + '/ml' : 'Grátis') + '</div>' +
      '<div class="tum-acab-desc">' + a.desc + '</div>' +
    '</button>';
  });
  ah += '</div>';
  if (r && r.ml_total > 0) {
    ah += '<div class="tum-info-box">📐 ' + r.ml_total + ' ml de borda → custo acabamento: <strong>R$ ' + _F(r.custo_acabamento) + '</strong></div>';
  }
  h += _card('⑧ Tipo de Acabamento das Bordas', ah);

  var oh = '';
  TUM_OPTS_DEF.forEach(function(o) {
    var on = !!q.opts[o.id];
    oh += '<div class="tum-tog-row">' +
      '<div class="tum-tog-info">' +
        '<div class="tum-tog-nm">' + o.nm + '</div>' +
        '<div class="tum-tog-sub">' + o.sub + '</div>' +
      '</div>' +
      '<div class="tum-tog' + (on ? ' on' : '') + '" onclick="tumTogOpt(\'' + o.id + '\')"></div>' +
    '</div>';
  });
  h += _card('⑨ Itens Opcionais', oh);

  h += _card('⑩ Logística (Avançado)',
    '<div class="tum-grid2">' +
    _fiN('Frete cemitério (%)', q.fatorCem, 0, 50, 5,
      'tumDimAdv("fatorCem",this.value)',
      'Aplicado sobre materiais civis quando "instalação em cemitério" ativo') +
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
  var q = TUM.q;
  var h = '';

  // Cards de KPIs
  h += '<div class="tum-res-grid">' +
    _resCard('m² c/ perda',  r.m2_total + ' m²',           r.m2_bruto + ' bruto') +
    _resCard('ml bordas',    r.ml_total + ' ml',            r.acab.nm) +
    _resCard('Peso aprox.',  Math.round(r.peso_total) + ' kg', r.mat.nm + ' ' + q.E + 'cm') +
    _resCard('Custo Pedra',  'R$ ' + _F(r.custo_pedra),    r.mat.nm,               'gold') +
    _resCard('Construção',   'R$ ' + _F(r.custo_civil),    'Materiais civis') +
    _resCard('Mão de Obra',  'R$ ' + _F(r.custo_mob),      'Fator ×' + r.Dif) +
    _resCard('Acabamentos',  'R$ ' + _F(r.custo_acabamento), r.acab.nm) +
    _resCard('Custo Total',  'R$ ' + _F(r.custo_total),    'Sem lucro') +
    _resCard('Margem ' + r.margem + '%', 'R$ ' + _F(r.lucro), r.margemReal + '% real', 'grn') +
  '</div>';

  // Detalhamento peças
  h += _card('🪨 Peças de Pedra',
    r.pecasCalc.map(function(p) {
      return _dLine(p.nm + ' <span class="tum-dim">' + p.dim + '</span>', p.m2 + ' m²');
    }).join('') +
    _dLine('Perda ' + q.perda + '%', r.m2_total + ' m² final') +
    _dLine(r.mat.nm + ' × esp.×' + ({2:'1,00',3:'1,35',4:'1,70',5:'2,10'}[r.E]||'1,35'),
           '<span style="color:var(--gold2)">R$ ' + _F(r.custo_pedra) + '</span>')
  );

  // Construção civil
  h += _card('🧱 Construção Civil',
    _dLine('Cimento CP-II',         r.sacos_cimento + ' sacos') +
    _dLine('Areia média',           r.m3_areia + ' m³') +
    _dLine('Brita 1',               r.m3_brita + ' m³') +
    _dLine('Argamassa AC-II',       r.sacos_argam + ' sacos') +
    _dLine('Ferro 3/8" (barras)',    r.barras_f38 + ' barras') +
    _dLine('Ferro 5/16" (barras)',   r.barras_f516 + ' barras') +
    (r.m2_malha > 0 ? _dLine('Malha Q-92', r.m2_malha + ' m²') : '') +
    _dLine('Blocos 14×19×39',       r.unid_blocos + ' un.') +
    (q.opts.cemiterio ? _dLine('Frete cemitério (+' + q.fatorCem + '%)', '<span style="color:var(--red)">aplicado</span>') : '') +
    _dLine('Total civil', '<span style="color:var(--gold2)">R$ ' + _F(r.custo_civil) + '</span>', true)
  );

  // Mão de Obra
  h += _card('🔨 Mão de Obra <span style="font-size:.65rem">(fator ×' + r.Dif + ')</span>',
    _dLine('Pedreiro',          'R$ ' + _F(r.v_pedreiro)) +
    _dLine('Ajudante',          'R$ ' + _F(r.v_ajudante)) +
    _dLine('Instalação pedra',  'R$ ' + _F(r.v_instalacao)) +
    _dLine('Montagem',          'R$ ' + _F(r.v_montagem)) +
    _dLine('Transporte',        'R$ ' + _F(r.v_frete)) +
    _dLine('Total M.O.', '<span style="color:var(--gold2)">R$ ' + _F(r.custo_mob) + '</span>', true)
  );

  // Extras
  if (r.custo_extras > 0) {
    h += _card('✨ Extras',
      (q.opts.cruzGranito ? _dLine('Cruz em granito',   'R$ 350,00') : '') +
      (q.opts.foto_porc   ? _dLine('Foto em porcelana', 'R$ 200,00') : '')
    );
  }

  // Total final
  h += '<div class="tum-total-box">' +
    '<div class="tum-total-linha"><span>Custo interno</span><span>R$ ' + _F(r.custo_total) + '</span></div>' +
    '<div class="tum-total-linha" style="color:var(--grn)"><span>Lucro (' + r.margem + '%)</span><span>R$ ' + _F(r.lucro) + '</span></div>' +
    '<div class="tum-total-main"><span>À Vista</span><span class="tum-total-val">R$ ' + _F(r.valor_vista) + '</span></div>' +
    '<div class="tum-total-parc">Parcelado: R$ ' + _F(r.valor_parc) + ' — até ' + r.parcMax + '× de R$ ' + _F(r.parc_mensal) + '</div>' +
    '<div class="tum-prazo">🕐 Prazo estimado: ' + r.prazo_total + ' dias úteis</div>' +
  '</div>';

  // Ações
  h += '<div class="tum-acoes">' +
    '<button class="tum-btn-gold" onclick="tumSalvar()">💾 Salvar</button>' +
    '<button class="tum-btn-out"  onclick="tumCopiarWA()">📲 WhatsApp</button>' +
    '<button class="tum-btn-out"  onclick="tumNovo()">🆕 Novo</button>' +
  '</div>';

  return h;
}

// ─────────────────────────────────────────────────────────────────────
// ABA: HISTÓRICO
// ─────────────────────────────────────────────────────────────────────
function _tabHistorico() {
  var h = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
    '<span style="font-size:.72rem;color:var(--t3)">' + TUM._hist.length + ' orçamentos salvos</span>' +
    '<button class="tum-btn-out tum-btn-sm" onclick="tumLimparHist()">🗑 Limpar</button>' +
  '</div>';

  if (!TUM._hist.length) {
    return h + '<div class="tum-empty">📋 Nenhum orçamento salvo ainda.<br>Preencha o formulário e salve.</div>';
  }

  TUM._hist.forEach(function(o, i) {
    var r = o.r || {};
    h += '<div class="tum-hist-card" onclick="tumVerHist(' + i + ')">' +
      '<div class="tum-hist-row">' +
        '<span class="tum-hist-cli">' + (o.cli || 'Cliente') + '</span>' +
        '<span class="tum-hist-val">R$ ' + _F(r.valor_vista || 0) + '</span>' +
      '</div>' +
      '<div class="tum-hist-meta">' +
        (o.falecido  ? '<span>⚰️ ' + o.falecido  + '</span>' : '') +
        (o.cemiterio ? '<span>🏛 ' + o.cemiterio + '</span>' : '') +
        '<span>' + (o.matNm||'') + '</span>' +
        '<span>' + (o.N||0) + ' gav.</span>' +
        '<span>' + (o.date||'') + '</span>' +
      '</div>' +
      '<div class="tum-hist-badges">' +
        '<span class="tum-badge">' + (r.m2_total||0) + ' m²</span>' +
        '<span class="tum-badge" style="color:var(--grn)">' + (r.prazo_total||'?') + 'd</span>' +
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
  var p  = TUM_PRESETS.find(function(x){ return x.id === id; });
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
  if (typeof toast === 'function') toast('✓ Preset: ' + p.nm);
}

function tumSelMat(id)  { TUM.q.matId  = id; tumRecalc(); }
function tumSelAcab(id) { TUM.q.acabId = id; tumRecalc(); }
function tumTogPeca(id) { TUM.q.pecas[id] = !TUM.q.pecas[id]; tumRecalc(); }
function tumTogOpt(id)  { TUM.q.opts[id]  = !TUM.q.opts[id];  tumRecalc(); }

// ─────────────────────────────────────────────────────────────────────
// SALVAR — Integra com DB.j (Agenda) + DB.t (Finanças) + DB.q (Orç.)
// ─────────────────────────────────────────────────────────────────────
function tumSalvar() {
  var q = TUM.q;
  var r = TUM.calc;
  if (!q.cli) { if (typeof toast === 'function') toast('⚠ Informe o nome do cliente'); return; }
  if (!r)     { if (typeof toast === 'function') toast('⚠ Calcule o orçamento primeiro'); return; }

  var _pedras = _tumPedras();
  var matNm   = (_pedras.find(function(x){ return x.id === q.matId; }) || {}).nm || 'Pedra';
  var preset  = TUM_PRESETS.find(function(x){ return x.id === q.preset; });
  var tipo    = 'Túmulo — ' + (preset ? preset.nm : q.preset) + (q.N > 0 ? ' ' + q.N + 'G' : '');

  // ── Histórico local ──────────────────────────────────────────────
  var rec = {
    id:       Date.now(),
    date:     _td(),
    cli:      q.cli, tel: q.tel,
    cemiterio:q.cemiterio, cidade: q.cidade,
    falecido: q.falecido, quadra: q.quadra, lote: q.lote,
    obs:      q.obs,
    preset:   q.preset, N: q.N,
    matNm:    matNm,
    acabNm:   (TUM_ACAB.find(function(x){ return x.id === q.acabId; }) || {}).nm || '',
    r:        JSON.parse(JSON.stringify(r)),
    q:        JSON.parse(JSON.stringify(q))
  };
  TUM._hist.unshift(rec);
  if (TUM._hist.length > 50) TUM._hist.pop();
  localStorage.setItem('hr_tum_hist', JSON.stringify(TUM._hist));

  // ── DB.q — Lista de orçamentos ───────────────────────────────────
  if (typeof DB !== 'undefined' && DB.q) {
    DB.q.unshift({
      id:         rec.id,
      tipo:       tipo,
      cli:        q.cli,
      mat:        matNm,
      vista:      r.valor_vista,
      prazo:      r.prazo_total,
      ent:        _r2(r.valor_vista * 0.5),
      custo:      r.custo_total,
      lucro:      r.lucro,
      margemReal: r.margemReal,
      obs:        q.obs,
      tum:        JSON.parse(JSON.stringify(q)),
      tumCalc:    JSON.parse(JSON.stringify(r)),
      dt:         rec.date,
      date:       rec.date
    });
    if (typeof DB.sv === 'function') DB.sv();
  }

  // ── DB.j — Agenda de serviços ────────────────────────────────────
  if (typeof DB !== 'undefined' && DB.j && typeof lastEnd === 'function' && typeof addD === 'function') {
    var startAg  = lastEnd() || _td();
    var diasEst  = Math.ceil(r.prazo_total || 13);
    var endAg    = addD(startAg, diasEst);
    var obsAg    = tipo + ' — ' + matNm;
    if (q.falecido)  obsAg += ' | Falecido: ' + q.falecido;
    if (q.cemiterio) obsAg += ' | Cemitério: ' + q.cemiterio;
    if (q.quadra)    obsAg += ' Q' + q.quadra;
    if (q.lote)      obsAg += ' L' + q.lote;
    if (q.obs)       obsAg += ' | ' + q.obs;

    var job = {
      id:       rec.id + 1,
      cli:      q.cli,
      desc:     obsAg,
      material: matNm,
      tipo:     tipo,
      start:    startAg,
      end:      endAg,
      value:    r.valor_vista,
      pago:     0,
      obs:      [
        q.cemiterio ? 'Cemitério: ' + q.cemiterio : '',
        q.quadra    ? 'Quadra: ' + q.quadra        : '',
        q.lote      ? 'Lote: '   + q.lote          : '',
        q.falecido  ? 'Falecido: '+ q.falecido     : '',
        q.cidade    ? q.cidade                      : ''
      ].filter(Boolean).join(' · '),
      done:   false,
      status: 'agendado'
    };
    DB.j.unshift(job);
    if (typeof DB.sv === 'function') DB.sv();
    if (typeof updUrgDot === 'function') updUrgDot();
  }

  // ── DB.t — Finanças (lançar A Receber) ──────────────────────────
  if (typeof DB !== 'undefined' && DB.t) {
    var hoje = new Date().toISOString().split('T')[0];
    DB.t.unshift({
      id:   rec.id + 2,
      type: 'pend',
      tp:   'pend',
      desc: 'Túmulo — ' + q.cli + (q.falecido ? ' (' + q.falecido + ')' : ''),
      val:  r.valor_vista,
      value:r.valor_vista,
      dt:   hoje,
      date: hoje
    });
    if (typeof DB.sv === 'function') DB.sv();
    if (typeof renderFin === 'function') renderFin();
  }

  if (typeof toast === 'function') toast('✅ Salvo! Agenda e Finanças atualizados.');
}

// ─────────────────────────────────────────────────────────────────────
// COPIAR WHATSAPP
// ─────────────────────────────────────────────────────────────────────
function tumCopiarWA() {
  var q   = TUM.q;
  var r   = TUM.calc;
  if (!r) return;
  var emp = (typeof CFG !== 'undefined' && CFG.emp) ? CFG.emp : { nome:'HR Mármores', tel:'' };
  var _pedras = _tumPedras();
  var matNm   = (_pedras.find(function(x){ return x.id === q.matId; }) || {}).nm || '';
  var acabNm  = (TUM_ACAB.find(function(x){ return x.id === q.acabId; }) || {}).nm || '';
  var preset  = TUM_PRESETS.find(function(p){ return p.id === q.preset; });

  var txt = emp.nome + '\nORÇAMENTO DE TÚMULO\n';
  txt += '─────────────────────\n';
  txt += 'Cliente: ' + q.cli + '\n';
  if (q.tel)       txt += 'Tel: ' + q.tel + '\n';
  if (q.falecido)  txt += 'Falecido(a): ' + q.falecido + '\n';
  if (q.cemiterio) txt += 'Cemitério: ' + q.cemiterio + (q.cidade ? ', ' + q.cidade : '') + '\n';
  if (q.quadra || q.lote) txt += 'Quadra ' + q.quadra + '  Lote ' + q.lote + '\n';
  txt += '\nMODELO\n';
  txt += 'Tipo: ' + (preset ? preset.nm : q.preset);
  txt += '\nMedidas: ' + q.C + ' × ' + q.L + ' cm  ·  Alt. ' + r.A_cm + ' cm';
  txt += '\nGavetas: ' + q.N;
  txt += '\nMaterial: ' + matNm + ' ' + q.E + ' cm';
  txt += '\nAcabamento: ' + acabNm;
  txt += '\nm²: ' + r.m2_total + ' m² (c/ perdas)';
  txt += '\n\nVALORES\n─────────────────────\n';
  txt += 'À vista: R$ ' + _F(r.valor_vista) + '\n';
  txt += 'Parcelado: R$ ' + _F(r.valor_parc) + ' (' + r.parcMax + '× R$ ' + _F(r.parc_mensal) + ')\n';
  txt += '\nPrazo: ~' + r.prazo_total + ' dias úteis\n';
  if (q.obs) txt += '\nObs: ' + q.obs + '\n';
  txt += '\n' + emp.nome;
  if (emp.tel) txt += '\n' + emp.tel;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(txt).then(function() {
      if (typeof toast === 'function') toast('📋 Copiado para área de transferência!');
    });
  } else {
    var ta = document.createElement('textarea');
    ta.value = txt;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    if (typeof toast === 'function') toast('📋 Copiado!');
  }
}

// ─────────────────────────────────────────────────────────────────────
// HISTÓRICO
// ─────────────────────────────────────────────────────────────────────
function tumVerHist(i) {
  var o = TUM._hist[i];
  if (!o) return;
  TUM.q = JSON.parse(JSON.stringify(o.q));
  TUM.calc = _tumCalcFull();
  TUM._tab = 'resumo';
  _tumRender();
}

function tumLimparHist() {
  if (!confirm('Apagar todo o histórico de orçamentos de túmulos?')) return;
  TUM._hist = [];
  localStorage.removeItem('hr_tum_hist');
  _tumRenderTab();
}

// ─────────────────────────────────────────────────────────────────────
// NOVO ORÇAMENTO
// ─────────────────────────────────────────────────────────────────────
function tumNovo() {
  if (!confirm('Limpar orçamento atual?')) return;
  var q = TUM.q;
  q.cli=''; q.tel=''; q.cemiterio=''; q.cidade='';
  q.falecido=''; q.quadra=''; q.lote=''; q.obs='';
  q.opts = { cemiterio:false, polido_extra:false, gravacao:false, cruzGranito:false, foto_porc:false };
  tumAplicarPreset('dupla');
  TUM._tab = 'dados';
  _tumRender();
  if (typeof toast === 'function') toast('✓ Novo orçamento');
}
