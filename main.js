// ═══ DB ═══
var DB={
  q:JSON.parse(localStorage.getItem('hr_q')||'[]'),
  j:JSON.parse(localStorage.getItem('hr_j')||'[]'),
  t:JSON.parse(localStorage.getItem('hr_t')||'[]'),
  sv:function(){localStorage.setItem('hr_q',JSON.stringify(this.q));localStorage.setItem('hr_j',JSON.stringify(this.j));localStorage.setItem('hr_t',JSON.stringify(this.t));if(SYNC.on)SYNC.push();}
};
var CFG=JSON.parse(localStorage.getItem('hr_cfg')||'null');

// ═══ SYNC (Firebase) ═══
var SYNC={
  db:null,
  code:localStorage.getItem('hr_sync_code')||'',
  on:false,
  _push:null,
  init:function(code){
    if(!code){this.code='';localStorage.removeItem('hr_sync_code');this.on=false;return;}
    // Firebase project — free Realtime DB
    var cfg={apiKey:"AIzaSyD_placeholder",databaseURL:"https://hr-marmores-default-rtdb.firebaseio.com"};
    try{
      if(typeof firebase==='undefined'){
        // Load Firebase on demand
        var fb1=document.createElement('script');
        fb1.src='https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js';
        fb1.onload=function(){
          var fb2=document.createElement('script');
          fb2.src='https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js';
          fb2.onload=function(){SYNC.init(SYNC.code);};
          document.head.appendChild(fb2);
        };
        document.head.appendChild(fb1);
        toast('Carregando sincronização...');
        return;
      }
      if(!firebase.apps.length)firebase.initializeApp(cfg);
      else firebase.app();
      this.db=firebase.database();
      this.code=code;
      localStorage.setItem('hr_sync_code',code);
      this.on=true;
      this._listen();
      toast('✓ Sincronização ativa — código: '+code);
    }catch(e){toast('Sync: configure o Firebase (ver instruções)');}
  },
  _listen:function(){
    if(!this.db||!this.code)return;
    var self=this;
    this.db.ref('hr/'+this.code).on('value',function(snap){
      var d=snap.val();
      if(!d||!d._ts)return;
      var localTs=+localStorage.getItem('hr_sync_ts')||0;
      if(d._ts>localTs+2000){
        // Remote is newer — pull
        if(d.cfg){CFG=d.cfg;localStorage.setItem('hr_cfg',JSON.stringify(CFG));}
        if(d.q)DB.q=d.q;
        if(d.j)DB.j=d.j;
        if(d.t)DB.t=d.t;
        DB.sv();
        localStorage.setItem('hr_sync_ts',d._ts);
        buildMat();buildSV();buildCatalog();buildCubaList();renderAg();renderFin();updEmp();
        toast('↓ Dados sincronizados!');
      }
    });
  },
  push:function(){
    if(!this.db||!this.code)return;
    var ts=Date.now();
    localStorage.setItem('hr_sync_ts',ts);
    this.db.ref('hr/'+this.code).set({cfg:CFG,q:DB.q,j:DB.j,t:DB.t,_ts:ts});
  },
  stop:function(){
    if(this.db&&this.code)this.db.ref('hr/'+this.code).off();
    this.on=false;this.code='';
    localStorage.removeItem('hr_sync_code');
    localStorage.removeItem('hr_sync_ts');
    toast('Sincronização desativada');
  }
};

// ═══ DEFAULTS ═══
var DEF_STONES=[
  {id:'andorinha',nm:'Cinza Andorinha/Corumbá',cat:'Granito Cinza',fin:'Polida',pr:320,tx:'tx-andorinha',photo:'',desc:'Granito nacional cinza com cristais brancos. Alta dureza e resistência — não risca, não mancha com facilidade e suporta calor. Excelente custo-benefício para cozinhas e bancadas de uso intenso.'},
  {id:'verde_ub',nm:'Verde Ubatuba',cat:'Granito Verde',fin:'Polida',pr:340,tx:'tx-verde-ub',photo:'',desc:'Granito verde escuro extraído em Ubatuba-SP. Pontos dourados naturais criam efeito exclusivo em cada chapa. Muito resistente e durável — perfeito para projetos sofisticados que exigem personalidade.'},
  {id:'verde_perla',nm:'Verde Pérola',cat:'Granito Verde',fin:'Polida',pr:340,tx:'tx-verde-perla',photo:'',desc:'Granito verde com tons pérola e reflexos prateados. Mais claro que o Verde Ubatuba, com movimento elegante. Polimento de alto brilho. Para quem quer um verde refinado e sofisticado.'},
  {id:'bege',nm:'Bege Bahia',cat:'Travertino',fin:'Polida',pr:380,tx:'tx-bege',photo:'',desc:'Travertino bege natural com veios suaves e calorosos. Combina com ambientes rústicos, móveis amadeirados e cerâmicas neutras. Muito usado em bancadas e pisos que valorizam o estilo natural.'},
  {id:'p_indiano',nm:'Preto Indiano',cat:'Granito Preto',fin:'Polida',pr:450,tx:'tx-p-indiano',photo:'',desc:'Granito importado da Índia. Preto absoluto e uniforme com polimento espelhado de altíssima qualidade — reflete como espelho. Um dos granitos mais sofisticados do mercado para cozinhas de alto padrão.'},
  {id:'p_gabriel',nm:'Preto São Gabriel',cat:'Granito Preto',fin:'Polida',pr:500,tx:'tx-sao-gabriel',photo:'',desc:'Granito brasileiro de São Gabriel-RS. Preto profundo com micropigmentos brancos e prateados que criam efeito galáctico único. Considerado um dos granitos nacionais mais nobres — cada chapa tem movimento próprio.'},
  {id:'p_gabriel_e',nm:'Preto São Gabriel Escovado',cat:'Granito Preto',fin:'Escovada',pr:540,tx:'tx-p-indiano',photo:'',desc:'Preto São Gabriel com acabamento escovado. Superfície aveludada e fosca esconde riscos e marcas do uso diário. Visual contemporâneo muito usado em projetos de design moderno.'},
  {id:'via_lactea',nm:'Preto Via Láctea',cat:'Granito Preto',fin:'Polida',pr:750,tx:'tx-via-lactea',photo:'',desc:'Granito preto com constelações de cristais brancos e cinza — imita a Via Láctea. Material exótico e exclusivo: cada chapa tem padrão único e irrepetível. Destaque absoluto em qualquer ambiente.'},
  {id:'dallas',nm:'Branco Dallas/Fortaleza',cat:'Granito Branco',fin:'Polida',pr:400,tx:'tx-dallas',photo:'',desc:'Granito branco nacional com movimento suave em tons cinza e creme. Amplifica a luminosidade do ambiente. Ótimo custo-benefício para quem quer o clássico branco com alta durabilidade e sem selagem.'},
  {id:'itaunas',nm:'Branco Itaúnas',cat:'Granito Branco',fin:'Polida',pr:510,tx:'tx-itaunas',photo:'',desc:'Granito branco premium do Espírito Santo. Veios delicados em dourado e cinza criam movimento elegante. Mais sofisticado que o Dallas — ideal para projetos que querem branco com personalidade.'},
  {id:'nepal',nm:'Branco Nepal',cat:'Granito Branco',fin:'Polida',pr:540,tx:'tx-nepal',photo:'',desc:'Granito branco com veios em creme e bege quente. Diferente dos brancos frios, tem calor natural que harmoniza com madeiras e cerâmicas claras. Atemporal e muito valorizado em residências de alto padrão.'},
  {id:'prime',nm:'Branco Prime',cat:'Granito Branco',fin:'Polida',pr:730,tx:'tx-prime',photo:'',desc:'Granito branco de altíssimo padrão com veios dourados naturais. Polimento espelhado intenso e movimento dramático. Para projetos que exigem o máximo em sofisticação — um dos mais valorizados do mercado nacional.'},
  {id:'mrm_branco',nm:'Mármore Branco Comercial',cat:'Mármore',fin:'Polida',pr:300,tx:'tx-mrm-branco',photo:'',desc:'Mármore calcítico clássico — branco com veios cinza naturais. Material poroso que exige selagem periódica. Pela beleza única dos veios naturais, é muito utilizado em banheiros, lavabos e projetos decorativos de luxo.'},
  {id:'siena',nm:'Branco Siena',cat:'Granito Branco',fin:'Polida',pr:580,tx:'tx-siena',photo:'',desc:'Granito branco com veios dourados e bege marcantes. Alta resistência e durabilidade. Polimento espelhado intenso. Uma das pedras mais elegantes do mercado — não requer selagem como o mármore.'},
  {id:'siena_e',nm:'Branco Siena Escovado',cat:'Granito Branco',fin:'Escovada',pr:620,tx:'tx-siena',photo:'',desc:'Branco Siena com acabamento escovado. Textura aveludada e contemporânea esconde riscos e marcas de uso diário. Excelente para famílias com uso intenso da cozinha.'},
  {id:'parana',nm:'Branco Paraná',cat:'Mármore',fin:'Polida',pr:1490,tx:'tx-parana',photo:'',desc:'Mármore Branco Paraná — um dos materiais mais exclusivos disponíveis. Fundo branco puro com veios dramáticos em cinza e dourado. Cada chapa é única e irrepetível. Exige cuidados especiais, mas entrega altíssimo luxo.'},
  {id:'nano',nm:'Branco Nano',cat:'Ultra Compacto',fin:'Polida',pr:930,tx:'tx-nano',photo:'',desc:'Superfície ultra compacta de última geração produzida com alta pressão e temperatura. Zero porosidade — não absorve líquidos, não mancha, não risca. Resistente a ácidos, calor e impacto. Ideal para cozinhas de uso intenso.'},
  {id:'super_nano',nm:'Branco Super Nano',cat:'Ultra Compacto',fin:'Polida',pr:980,tx:'tx-nano',photo:'',desc:'Versão premium do Branco Nano com dureza máxima. Praticamente impossível de riscar. Ideal para cozinhas profissionais e famílias com alto uso diário. Sem necessidade de qualquer manutenção ou selagem.'},
  {id:'perla',nm:'Perla Santana',cat:'Quartzito',fin:'Polida',pr:1640,tx:'tx-perla',photo:'',desc:'Quartzito natural do Ceará com textura cristalina única. Visual próximo ao mármore de luxo com veios suaves — porém com dureza e resistência superiores ao próprio granito. Baixíssima porosidade natural. Alta exclusividade.'},
  {id:'carrara',nm:'Ultra Compacto Carrara',cat:'Ultra Compacto',fin:'Polida',pr:1640,tx:'tx-carrara',photo:'',desc:'Superfície ultra compacta inspirada no Mármore Carrara italiano. Fundo branco com veios cinza delicados, produzida com tecnologia europeia. Zero porosidade absoluta — nunca mancha, nunca risca, nunca precisa de selagem. A beleza do mármore com a resistência superior.'},
  {id:'trav_classic',nm:'Travertino Clássico',cat:'Travertino',fin:'Polida',pr:400,tx:'tx-bege',photo:'',desc:'Travertino clássico em tons bege e marrom quente. Pedra sedimentar com poros naturais que dão textura e identidade única. Muito usado em fachadas, pisos externos, revestimentos e bancadas rústicas. Ideal para ambientes naturais.'},
  {id:'trav_noce',nm:'Travertino Noce',cat:'Travertino',fin:'Polida',pr:440,tx:'tx-bege',photo:'',desc:'Travertino Noce em tons tabaco escuro e marrom profundo. Mais escuro que o Clássico, com poros que realçam os veios naturais. Muito usado em fachadas comerciais, pisos de grande formato e ambientes de alto padrão que buscam personalidade rústica.'}
];
var DEF_COZ=[
  {id:'tramontina_prime',nm:'Tramontina Inox Prime',brand:'Tramontina',dim:'56×34×17cm',custo:313,pr:345,inst:110,instCli:160,photo:''},
  {id:'meganox_gourmet',nm:'Gourmet c/ Tábua',brand:'Meganox',dim:'60×42cm',custo:310,pr:341,inst:110,instCli:160,photo:''},
  {id:'premium_304_6040',nm:'Quadrada Inox 304 Premium',brand:'Premium 304',dim:'60×40cm',custo:648,pr:713,inst:110,instCli:160,photo:''},
  {id:'brinovar_5040',nm:'Gourmet 304 Escovado',brand:'Brinovar',dim:'50×40×20cm',custo:342,pr:376,inst:110,instCli:160,photo:''},
  {id:'meranox_padrao',nm:'Inox Padrão',brand:'Meranox',dim:'60×40cm',custo:0,pr:0,inst:110,instCli:160,photo:''},
  {id:'escorredor_inox',nm:'Inox c/ Escorredor',brand:'Premium',dim:'60×40cm',custo:0,pr:0,inst:110,instCli:160,photo:''}
];
var DEF_LAV=[
  {id:'icasa_red',nm:'Redonda 30cm',brand:'Icasa',dim:'30cm',tipo:'Louça',custo:176,pr:194,inst:220,instCli:280,photo:''},
  {id:'beltempo_oval',nm:'Oval Sobrepor',brand:'Beltempo',dim:'43×25cm',tipo:'Sobrepor',custo:158,pr:174,inst:220,instCli:280,photo:''},
  {id:'lorenz_oval_emb',nm:'Oval Embutir',brand:'Lorenzetti',dim:'40cm',tipo:'Louça',custo:130,pr:143,inst:220,instCli:280,photo:''},
  {id:'docol_red_emb',nm:'Redonda Embutir',brand:'Docol',dim:'39×14cm',tipo:'Louça',custo:100,pr:110,inst:220,instCli:280,photo:''},
  {id:'deca_quad_emb',nm:'Quadrada Embutir',brand:'Deca',dim:'30×30cm',tipo:'Louça',custo:400,pr:440,inst:220,instCli:280,photo:''},
  {id:'esc_sim',nm:'Esculpida Simples',brand:'HR',dim:'Na pedra',tipo:'Esculpida',custo:0,pr:0,inst:320,instCli:0,photo:''},
  {id:'esc_com',nm:'Esculpida Complexa',brand:'HR',dim:'Na pedra',tipo:'Esculpida',custo:0,pr:0,inst:450,instCli:0,photo:''},
  {id:'esc_mxc',nm:'Esculpida Muito Complexa',brand:'HR',dim:'Na pedra',tipo:'Esculpida',custo:0,pr:0,inst:800,instCli:0,photo:''}
];
var DEF_EMP={nome:'HR Mármores e Granitos',cnpj:'64.639.182/0001-28',tel:'(74) 99148-4460',end:'Av. Dep. Rodolfo Queiroz, 653 — Centro',cidade:'Pilão Arcado — BA',ig:'@HR Marmores e Granitos',email:'giliardhangel18@gmail.com',banco:'SICOOB Credirochas',apiKey:'sk-proj-THoSk6E4FD5xr_hiULkKdm-55HiWZ3801a70ENAE7Iuyx3zNMPvpk3X25Ju38FmUC6e0KRm-SaT3BlbkFJiviiJg9kCsFP0-y6eXLg7CrnzLxHJpvr-exR6ElniDwum48jPHuRHwZX7yrxxp7oJ3_wgvQMA',logoUrl:'data:image/jpeg;base64,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'};
var DEF_ACESS=[
  {id:'disp_det',nm:'Dispenser de Detergente',marca:'',dim:'Embutir na bancada',pr:0,desc:'Dispenser embutido para detergente, instalado no tampo da bancada.',photo:''},
  {id:'calha_umida',nm:'Calha Úmida',marca:'',dim:'Sob medida',pr:0,desc:'Calha escavada na pedra para escorrer água. Integrada ao tampo.',photo:''},
  {id:'escorredor',nm:'Escorredor de Louça',marca:'',dim:'Embutir',pr:0,desc:'Escorredor em inox ou pedra esculpida integrado à bancada.',photo:''}
];
var DEF_SV={s_reta:80,s_45:150,s_boleada:190,s_slim:56,frontao:102,frontao_chf:120,rodape:60,sol1:38,sol2:65,peit_reto:45,peit_ping:78,peit_col:132,peit_portal:200,forn:50,fralo:50,cook:160,reb_n:200,reb_a:430,tubo:70,cant:115,inst:320,inst_c:500,desl_for:4.0,
  ac_sifao:45,ac_flex:25,ac_veda:15,ac_sil:20,ac_paraf:30,ac_bucha:20,ac_sup:60,ac_outros:0,
  // Túmulo
  tum_tampa:85, tum_lat:85, tum_front:85, tum_base:85, tum_det:85, tum_sainha:85,
  tum_gav1:85,  tum_gav2:85,  tum_gav3:85,
  tum_mol:110,  tum_ping:80,  tum_bisel:90,
  tum_lapide:480, tum_plaq:220, tum_foto:170, tum_cruz:340,
  tum_pol:160, tum_rec:50, tum_mont:380, tum_montc:580,
  // Borda Piscina
  bp_boleada:110, bp_antiderap:120, bp_pingad:90, bp_mcana:100, bp_chanfro:95,
  bp_c_arred:180, bp_c_curva:220, bp_c_infinita:350};
var DEF_FIXOS=[{n:'Aluguel',v:1000},{n:'Funcionários',v:5500},{n:'Energia',v:150},{n:'Água',v:40},{n:'Internet',v:100},{n:'Alimentação',v:200},{n:'Limpeza',v:200}];

function initCFG(){
  var CFG_VER = 18;
  var storedVer = +localStorage.getItem('hr_cfg_ver') || 0;

  if(!CFG || storedVer < CFG_VER){
    if(!CFG){
      CFG={stones:JSON.parse(JSON.stringify(DEF_STONES)),coz:JSON.parse(JSON.stringify(DEF_COZ)),lav:JSON.parse(JSON.stringify(DEF_LAV)),ac:JSON.parse(JSON.stringify(DEF_ACESS)),emp:JSON.parse(JSON.stringify(DEF_EMP)),sv:JSON.parse(JSON.stringify(DEF_SV)),fixos:JSON.parse(JSON.stringify(DEF_FIXOS))};
    } else {
      // Refresh coz/lav catalog
      CFG.coz = JSON.parse(JSON.stringify(DEF_COZ));
      CFG.lav = JSON.parse(JSON.stringify(DEF_LAV));
      // ── Atualizar pedras: substituir verde_ub combinado pelas duas pedras separadas ──
      var hasUb = CFG.stones.find(function(s){return s.id==='verde_ub';});
      var hasPerla = CFG.stones.find(function(s){return s.id==='verde_perla';});
      if(hasUb && !hasPerla){
        // Atualiza nome e tx do verde_ub
        hasUb.nm = 'Verde Ubatuba';
        hasUb.tx = 'tx-verde-ub';
        hasUb.desc = 'Granito verde escuro com reflexos dourados. Extraído em Ubatuba-SP. Alta dureza e resistência. Muito valorizado em projetos de alto padrão.';
        // Insere Verde Pérola logo depois
        var ubIdx = CFG.stones.indexOf(hasUb);
        CFG.stones.splice(ubIdx+1, 0, {
          id:'verde_perla',nm:'Verde Pérola',cat:'Granito Verde',fin:'Polida',pr:340,
          tx:'tx-verde-perla',photo:'',
          desc:'Granito verde com tons pérola e reflexos prateados. Mais claro que o Verde Ubatuba, com movimento elegante. Polimento de alto brilho. Para quem quer um verde refinado e sofisticado.'
        });
      }
    }
    if(!CFG.sv['frontao_chf'])CFG.sv['frontao_chf']=DEF_SV['frontao_chf']||110;
    // Patch: garante preços tum_* e bp_* em instalações existentes
    ['tum_tampa','tum_lat','tum_front','tum_base','tum_det','tum_sainha',
     'tum_gav1','tum_gav2','tum_gav3','tum_mol','tum_ping','tum_bisel',
     'tum_lapide','tum_plaq','tum_foto','tum_cruz','tum_pol','tum_rec',
     'tum_mont','tum_montc',
     'bp_boleada','bp_antiderap','bp_pingad','bp_mcana','bp_chanfro',
     'bp_c_arred','bp_c_curva','bp_c_infinita'
    ].forEach(function(k){ if(!CFG.sv[k]) CFG.sv[k]=DEF_SV[k]; });
    localStorage.setItem('hr_cfg_ver', CFG_VER);
  }
  // Sync SV labels/prices from svList if it exists
  // Patch v18: força preços novos no CFG existente
  var _p={s_reta:80,s_45:150,s_boleada:190,s_slim:56,frontao:102,frontao_chf:120,rodape:60,forn:50,fralo:50,cook:160,reb_n:200,reb_a:430,tubo:70,cant:115,inst:320,inst_c:500,desl_for:4.0};
  Object.keys(_p).forEach(function(k){CFG.sv[k]=_p[k];});
  var _pr={andorinha:320,verde_ub:340,verde_perla:340,bege:380,p_indiano:450,p_gabriel:500,p_gabriel_e:540,via_lactea:750,dallas:400,itaunas:510,nepal:540,prime:730,mrm_branco:300,siena:580,siena_e:620,parana:1490,nano:930,super_nano:980,perla:1640,carrara:1640,trav_classic:400,trav_noce:440};
  CFG.stones.forEach(function(s){if(_pr[s.id])s.pr=_pr[s.id];});
  syncSVDefsFromList();
  // Apply photos from CUBA_IMGS for any cuba without a custom photo
  CFG.coz.forEach(function(c){if(!c.photo&&CUBA_IMGS[c.id])c.photo=CUBA_IMGS[c.id];});
  CFG.lav.forEach(function(c){if(!c.photo&&CUBA_IMGS[c.id])c.photo=CUBA_IMGS[c.id];});
  // Always refresh photos in case CUBA_IMGS was updated (override old embedded photos)
  CFG.coz.forEach(function(c){if(CUBA_IMGS[c.id])c.photo=CUBA_IMGS[c.id];});
  CFG.lav.forEach(function(c){if(CUBA_IMGS[c.id])c.photo=CUBA_IMGS[c.id];});
  // Garantir que ac existe (usuários com cfg antiga)
  if(!CFG.ac)CFG.ac=JSON.parse(JSON.stringify(DEF_ACESS));
  svCFG();
}
function syncSVDefsFromList(){
  if(!CFG.svList)return;
  // Update CFG.sv prices and labels
  CFG.svList.forEach(function(sv){CFG.sv[sv.k]=sv.preco;});

  // Rebuild SV_DEFS from svList so new services appear in orçamento
  // Group svList items by grp
  var grpMap={};
  CFG.svList.forEach(function(sv){
    if(!grpMap[sv.grp])grpMap[sv.grp]=[];
    grpMap[sv.grp].push({k:sv.k,l:sv.l,u:sv.u||'un',fx:sv.fx||0});
  });

  // Map svList groups to SV_DEFS ambiente groups
  // All ambientes share the same svList groups
  var ambs=['Cozinha','Banheiro','Lavabo','Soleira','Peitoril','Escada','Fachada','Mesa/Tampo','Outro'];
  ambs.forEach(function(amb){
    var def=SV_DEFS[amb];
    if(!def)return;
    def.forEach(function(grp){
      // Update labels and add new items from svList for this group
      var svItems=grpMap[grp.g];
      if(!svItems)return;
      // Update existing items labels
      grp.its.forEach(function(it){
        var sv=CFG.svList.find(function(x){return x.k===it.k;});
        if(sv){it.l=sv.l;it.u=sv.u||it.u;}
      });
      // Add new items that are in svList but not in grp.its
      svItems.forEach(function(svIt){
        var exists=grp.its.find(function(it){return it.k===svIt.k;});
        if(!exists){grp.its.push({k:svIt.k,l:svIt.l,u:svIt.u||'un',fx:svIt.fx||0});}
      });
    });
  });
}

function svCFG(){localStorage.setItem('hr_cfg',JSON.stringify(CFG));if(SYNC.on)SYNC.push();}

// ═══ STATE ═══
var selMat=null,pendQ=null,fType='in',catF='Todos',cubaCat='coz',cfgTab=0,editTrId=null,editJobId=null,fileTarget=null,cbYcb=null,cbNcb=null;
// Ambientes: cada um tem id, tipo, pecas[], selCuba
var ambientes=[];
var _cubaPickKey=null;

// ═══ INIT ═══
document.addEventListener('DOMContentLoaded',function(){
  // Force correct layout on resize / orientation change
  // ── LAYOUT ENGINE COMPLETO ──
window.setLayout=function(){
    var W=window.innerWidth, H=window.innerHeight;
    var isLandscape=W>H;
    var shell=document.getElementById('shell');
    var sApp=document.getElementById('sApp');
    var hdr=document.getElementById('hdr');
    var pages=document.getElementById('pages');
    var nav=document.getElementById('nav');
    var hap=document.getElementById('hdrAndPages');
    if(!shell||!sApp||!hdr||!pages||!nav||!hap)return;
    if(!sApp.classList.contains('on')){
      shell.style.cssText='position:fixed;top:0;left:0;width:'+W+'px;height:'+H+'px;overflow:hidden;background:#070709;';
      return;
    }

    // Shell e sApp = tela inteira
    shell.style.cssText='position:fixed;top:0;left:0;width:'+W+'px;height:'+H+'px;overflow:hidden;background:var(--bg);';
    sApp.style.cssText='position:absolute;top:0;left:0;width:'+W+'px;height:'+H+'px;';

    var isTablet=W>=900;
    var navW=isTablet?88:76;

    if(isLandscape){
      // 1. Posicionar nav à esquerda
      nav.style.cssText='position:absolute;top:0;left:0;width:'+navW+'px;height:'+H+'px;'
        +'display:flex;flex-direction:column;align-items:center;background:var(--s1);'
        +'border-right:1px solid var(--bd);overflow-y:auto;overflow-x:hidden;z-index:20;padding-top:8px;';

      // 2. Estilo dos NI
      document.querySelectorAll('.ni').forEach(function(ni){
        ni.style.cssText='display:flex;flex-direction:column;align-items:center;justify-content:center;'
          +'gap:3px;width:'+navW+'px;padding:13px 2px;cursor:pointer;position:relative;'
          +'touch-action:manipulation;background:none;border:none;font-family:Outfit,sans-serif;color:var(--tx);';
      });
      document.querySelectorAll('.ni-l').forEach(function(l){l.style.fontSize=isTablet?'.48rem':'.42rem';});

      // 3. HAP ocupa o resto
      hap.style.cssText='position:absolute;top:0;left:'+navW+'px;width:'+(W-navW)+'px;height:'+H+'px;overflow:hidden;';

      // 4. HDR no topo do HAP
      hdr.style.cssText='position:absolute;top:0;left:0;right:0;display:flex;align-items:center;gap:9px;'
        +'padding:10px 17px 9px;background:var(--s1);border-bottom:1px solid var(--bd);z-index:10;';
      var hdrH=hdr.offsetHeight;
      if(!hdrH||hdrH<20)hdrH=48;

      // 5. Pages abaixo do HDR
      pages.style.cssText='position:absolute;top:'+hdrH+'px;left:0;right:0;bottom:0;overflow:hidden;';

    } else {
      // 1. Estilo dos NI portrait
      document.querySelectorAll('.ni').forEach(function(ni){
        ni.style.cssText='flex:1;min-width:52px;padding:9px 2px 7px;cursor:pointer;position:relative;'
          +'touch-action:manipulation;background:none;border:none;font-family:Outfit,sans-serif;color:var(--tx);'
          +'display:flex;flex-direction:column;align-items:center;gap:2px;';
      });
      document.querySelectorAll('.ni-l').forEach(function(l){l.style.fontSize='.44rem';});

      // 2. NAV na base - medir primeiro temporariamente visível
      nav.style.cssText='position:absolute;left:0;right:0;bottom:0;display:flex;flex-direction:row;'
        +'background:var(--s1);border-top:1px solid var(--bd);z-index:20;'
        +'padding-bottom:env(safe-area-inset-bottom,0);overflow-x:auto;';
      var navH=nav.offsetHeight;
      if(!navH||navH<40)navH=58;

      // 3. HAP ocupa de cima até o nav
      hap.style.cssText='position:absolute;top:0;left:0;right:0;bottom:'+navH+'px;overflow:hidden;';

      // 4. HDR no topo
      hdr.style.cssText='position:absolute;top:0;left:0;right:0;display:flex;align-items:center;gap:9px;'
        +'padding:12px 17px 10px;background:var(--s1);border-bottom:1px solid var(--bd);z-index:10;';
      var hdrH=hdr.offsetHeight;
      if(!hdrH||hdrH<20)hdrH=56;

      // 5. Pages abaixo do HDR
      pages.style.cssText='position:absolute;top:'+hdrH+'px;left:0;right:0;bottom:0;overflow:hidden;';
    }

    // Pages ativas e inativas
    document.querySelectorAll('.pg').forEach(function(pg){
      if(pg.classList.contains('on')){
        pg.style.cssText='display:block;position:absolute;top:0;left:0;right:0;bottom:0;overflow-y:auto;-webkit-overflow-scrolling:touch;';
      } else {
        pg.style.cssText='display:none;';
      }
    });

    // Cores do ni ativo
    aplicarEstiloNi();
  }
window.aplicarEstiloNi=function(){
    document.querySelectorAll('.ni').forEach(function(ni){
      var isOn=ni.classList.contains('on');
      var l=ni.querySelector('.ni-l');
      if(l)l.style.color=isOn?'var(--gold)':'var(--t4)';
    });
  }
  window.addEventListener('resize',setLayout);
  window.addEventListener('orientationchange',function(){
    // Android muda dimensões de forma assíncrona — tentar várias vezes até estabilizar
    var tries=0;
    var lastW=0,lastH=0;
    function tryLayout(){
      var W=window.innerWidth,H=window.innerHeight;
      setLayout();
      tries++;
      // Se dimensões mudaram ou ainda não estabilizaram, tentar de novo
      if(tries<10&&(W!==lastW||H!==lastH||W===H)){
        lastW=W;lastH=H;
        setTimeout(tryLayout,200);
      }
    }
    setTimeout(tryLayout,100);
  });
  setLayout();

  initCFG();
  selMat=CFG.stones[0].id;
  var now=new Date();
  document.getElementById('hdrDate').textContent=now.toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'short'});
  document.getElementById('jStart').value=td();
  document.getElementById('fData').value=td();
  // Listeners
  document.addEventListener('click',dispatch);
  // oTipo is now per-ambiente, no global listener needed
  document.getElementById('diasIn').addEventListener('input',prevDias);
  document.getElementById('jDias').addEventListener('input',prevJobDias);
  document.getElementById('fileInp').addEventListener('change',onFile);
  document.querySelectorAll('.ov').forEach(function(o){o.addEventListener('click',function(e){if(e.target===o)closeAll();});});
  // Build
  buildMat();addAmbiente();buildCatalog();buildCubaList();buildAcList();renderAg();renderFin();updEmp();updUrgDot();renderFixos();renderInfoList();renderOrc();
  // Init sync if previously configured
  var savedCode=localStorage.getItem('hr_sync_code');
  if(savedCode)setTimeout(function(){if(typeof firebase!=='undefined')SYNC.init(savedCode);},3000);
  // Handle any tap that happened before DOMContentLoaded finished
  if(window._pendingPg!==null){var pp=window._pendingPg;window._pendingPg=null;openApp(pp);}
});

// ═══ SPLASH ═══
function openApp(pg){
  var splash=document.getElementById('sSplash');
  splash.classList.remove('on');
  splash.style.display='none';
  var a=document.getElementById('sApp');
  a.classList.add('on');
  a.style.display='block';
  setLayout();
  requestAnimationFrame(function(){
    setLayout();
    go(pg);
  });
  window._pendingPg=null;
}
function voltarSplash(){
  closeAll();
  var splash=document.getElementById('sSplash');
  var app=document.getElementById('sApp');
  var intro=document.getElementById('sIntro');
  if(intro){intro.style.display='none';}
  if(splash){splash.classList.add('on');splash.style.display='flex';}
  if(app){app.classList.remove('on');}
}

// ═══ NAV ═══
function go(n){
  // Access control: Empresa(5) and Config(6) require admin
  var _ADMIN_ONLY=[5,6];
  if(_ADMIN_ONLY.indexOf(+n)>=0 && !_adOn){
    toast('Requer acesso de proprietário 🔒');
    openAdminPin();
    return;
  }
  closeAll();
  var _sApp=document.getElementById('sApp');
  var _sSplash=document.getElementById('sSplash');
  var _sIntro=document.getElementById('sIntro');
  if(_sApp){_sApp.classList.add('on');}
  if(_sSplash){_sSplash.classList.remove('on');_sSplash.style.display='none';}
  if(_sIntro){_sIntro.style.display='none';}
  var actualId=n===7?'2b':n;
  document.querySelectorAll('.ni').forEach(function(t){t.classList.toggle('on',+t.dataset.pg===n);});
  document.querySelectorAll('.pg').forEach(function(p){
    p.classList.remove('on');
    p.style.cssText='display:none;';
  });
  var pg=document.getElementById('pg'+actualId);
  if(pg){
    pg.classList.add('on');
    pg.style.cssText='display:block;position:absolute;top:0;left:0;right:0;bottom:0;overflow-y:auto;-webkit-overflow-scrolling:touch;';
    pg.scrollTop=0;
  }
  aplicarEstiloNi();
  if(n===2)buildCubaList();
  if(n===7)renderOrc();
  if(n===8)buildAcList();
  if(n===3)renderAg();
  if(n===4)renderFin();
  if(n===5)updEmp();
  if(n===6){cfgTab=0;document.querySelectorAll('.cfgtab').forEach(function(t){t.classList.toggle('on',t.dataset.cftab==='0');});buildCfg();}
  if(n===9 && typeof renderTum==='function'){setTimeout(function(){renderTum();},120);}
}

// ═══ DISPATCH ═══
function dispatch(e){
  var el;
  // Close modal
  el=e.target.closest('[data-close]');if(el){closeAll();return;}
  // Nav
  el=e.target.closest('[data-pg]');if(el&&el.dataset.pg!==undefined&&el.classList.contains('ni')){go(+el.dataset.pg);return;}
  // Config tab
  el=e.target.closest('[data-cftab]');if(el){cfgTab=+el.dataset.cftab;document.querySelectorAll('.cfgtab').forEach(function(t){t.classList.toggle('on',t.dataset.cftab===el.dataset.cftab);});buildCfg();return;}
  // Cuba cat tabs
  el=e.target.closest('[data-ccat]');if(el){cubaCat=el.dataset.ccat;document.querySelectorAll('[data-ccat]').forEach(function(t){t.classList.toggle('on',t.dataset.ccat===cubaCat);});buildCubaList();return;}
  // Catalog filter
  el=e.target.closest('[data-catf]');if(el){catF=el.dataset.catf;document.querySelectorAll('[data-catf]').forEach(function(x){x.classList.toggle('on',x.dataset.catf===catF);});buildCatGrid();return;}
  // Pick mat
  el=e.target.closest('[data-mat]');if(el){pickMat(el.dataset.mat);return;}
  // Stone detail
  el=e.target.closest('[data-stone]');if(el){openStone(el.dataset.stone);return;}
  // Pick cuba
  el=e.target.closest('[data-pcuba]');if(el){pickCuba(el.dataset.pcuba,el.dataset.ctype);return;}
  // QA finance buttons
  el=e.target.closest('[data-qa]');if(el){openFin(el.dataset.qa);return;}
  // Finance type selector in modal
  el=e.target.closest('[data-ftp]');if(el){setFT(el.dataset.ftp);return;}
  // Finance type in edit modal
  el=e.target.closest('[data-tet]');if(el){setTET(el.dataset.tet);return;}
  // Job actions
  el=e.target.closest('[data-togjob]');if(el){togJob(+el.dataset.togjob);return;}
  el=e.target.closest('[data-editjob]');if(el){editJob(+el.dataset.editjob);return;}
  el=e.target.closest('[data-pagrest]');if(el){pagRest(+el.dataset.pagrest);return;}
  el=e.target.closest('[data-deljob]');if(el){delJob(+el.dataset.deljob);return;}
  // Peca remove
  el=e.target.closest('[data-rmpc]');if(el){remPeca(+el.dataset.rmpc);return;}
  // Edit transaction
  el=e.target.closest('[data-edittr]');if(el){openEditTr(+el.dataset.edittr);return;}
  // Photo pick
  el=e.target.closest('[data-pp]');if(el){pickPhoto(el.dataset.pp,+el.dataset.idx);return;}
  // Buttons
  el=e.target.closest('#btnAddPeca');if(el){addPeca();return;}
  el=e.target.closest('#btnAddAmbiente');if(el){addAmbiente();return;}
  el=e.target.closest('[data-ai-amb]');if(el){abrirAIMd(+el.dataset.aiAmb);return;}
  el=e.target.closest('[data-amb-tipo]');if(el){setAmbTipo(+el.dataset.ambId,el.dataset.ambTipo);return;}
  el=e.target.closest('[data-rm-amb]');if(el){rmAmbiente(+el.dataset.rmAmb);return;}
  el=e.target.closest('[data-add-peca]');if(el){addPecaAmb(+el.dataset.addPeca);return;}
  el=e.target.closest('[data-rmpc]');if(el){remPeca(+el.dataset.rmpc);return;}
  el=e.target.closest('[data-sv]');if(el&&el.dataset.amb){togSV(el.dataset.sv,+el.dataset.amb);return;}
  el=e.target.closest('[data-tog-ac]');if(el){togAcAmb(+el.dataset.ambAc,el.dataset.togAc);return;}
  el=e.target.closest('#btnAI');if(el){document.getElementById('aiDesc').value='';document.getElementById('aiStatus').textContent='';document.getElementById('aiStatus').className='ai-status';document.getElementById('aiResultBox').style.display='none';document.getElementById('btnAIAplicar').style.display='none';showMd('aiMd');return;}
  el=e.target.closest('#btnAIEnviar');if(el){aiInterpretar();return;}
  el=e.target.closest('#btnAIAplicar');if(el){aiAplicar();return;}
  el=e.target.closest('#btnCalc');if(el){calcular();return;}
  el=e.target.closest('#btnCopy');if(el){copiar();return;}
  el=e.target.closest('#btnPDF');if(el){gerarPDF();return;}
  el=e.target.closest('#btnSaveAg');if(el){salvarAgenda();return;}
  el=e.target.closest('#btnNewJob');if(el){openJobModal(null);return;}
  el=e.target.closest('#btnSvJob');if(el){saveJob();return;}
  el=e.target.closest('#btnSvFin');if(el){saveFin();return;}
  el=e.target.closest('#btnConfAg');if(el){confirmarAgenda();return;}
  el=e.target.closest('#btnSvTrEd');if(el){saveTrEdit();return;}
  el=e.target.closest('#btnDelTr');if(el){delTr();return;}
  el=e.target.closest('#cbY');if(el){if(cbYcb)cbYcb();return;}
  el=e.target.closest('#cbN');if(el){if(cbNcb)cbNcb();return;}
}
function closeAll(){document.querySelectorAll('.ov').forEach(function(o){o.classList.remove('on');});}
function showMd(id){closeAll();document.getElementById(id).classList.add('on');}

// ═══ PHOTO PICKER ═══
function pickPhoto(target,idx){fileTarget={t:target,i:idx};document.getElementById('fileInp').click();}
function onFile(e){
  var file=e.target.files[0];if(!file||!fileTarget)return;
  var r=new FileReader();
  r.onload=function(ev){
    // Resize image before saving to avoid localStorage overflow
    var img=new Image();
    img.onload=function(){
      var canvas=document.createElement('canvas');
      var maxW=500;
      var scale=Math.min(1,maxW/img.width);
      canvas.width=Math.round(img.width*scale);
      canvas.height=Math.round(img.height*scale);
      canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
      var d=canvas.toDataURL('image/jpeg',0.78);
      var t=fileTarget.t,i=fileTarget.i;
      if(t==='stone')CFG.stones[i].photo=d;
      else if(t==='coz')CFG.coz[i].photo=d;
      else if(t==='lav')CFG.lav[i].photo=d;
      else if(t==='ac')CFG.ac[i].photo=d;
      svCFG();
      buildMat();buildCatalog();buildCubaList();buildCfg();
      toast('✓ Foto atualizada!');
    };
    img.src=ev.target.result;
  };
  r.readAsDataURL(file);
  e.target.value='';
}

// ═══ MATERIAL ═══
function buildMat(){renderAmbientes();}
function pickMat(id){selMat=id;}

// ═══ SERVIÇOS ═══

var SV_DEFS={
'Cozinha':[
  {g:'Sainha',its:[{k:'s_reta',l:'Sainha Reta',u:'sf'},{k:'s_45',l:'Sainha 45°',u:'sf'},{k:'s_boleada',l:'Sainha Boleada',u:'sf'},{k:'s_slim',l:'Sainha Slim',u:'sf'}]},
  {g:'Frontão',its:[{k:'frontao',l:'Frontão Reto',u:'sf'},{k:'frontao_chf',l:'Frontão Chanfrado',u:'sf'}]},
  {g:'Furos & Recortes',its:[{k:'forn',l:'Furo Torneira',u:'un',fx:0},{k:'fralo',l:'Furo Ralo',u:'un',fx:0},{k:'cook',l:'Recorte Cooktop',u:'un',fx:1}]},
  {g:'Rebaixo',its:[{k:'reb_n',l:'Rebaixo Normal',u:'un',fx:1},{k:'reb_a',l:'Rebaixo Americano',u:'un',fx:1}]},
  {g:'Cuba',its:[{k:'cuba_coz',l:'Escolher cuba inox ou esculpida',u:'cuba',ctp:'coz'}]},
  {g:'Área Molhada',its:[{k:'rodape',l:'Rodapé de Pedra',u:'sf'}]},
  {g:'Fixação',its:[{k:'tubo',l:'Tubo Metálico',u:'un',fx:0},{k:'cant',l:'Cantoneira',u:'un',fx:0}]},
  {g:'Instalação',its:[{k:'inst',l:'Instalação Padrão',u:'un',fx:1},{k:'inst_c',l:'Instalação Complexa',u:'un',fx:1}]},
  {g:'Deslocamento',its:[{k:'desl_cid',l:'Na cidade',u:'livre'},{k:'desl_for',l:'Fora da cidade',u:'km',fx:0}]}
]};
SV_DEFS.Banheiro=[
  {g:'Sainha',its:[{k:'s_reta',l:'Sainha Reta',u:'sf'},{k:'s_45',l:'Sainha 45°',u:'sf'},{k:'s_boleada',l:'Sainha Boleada',u:'sf'},{k:'s_slim',l:'Sainha Slim',u:'sf'}]},
  {g:'Frontão',its:[{k:'frontao',l:'Frontão Reto',u:'sf'},{k:'frontao_chf',l:'Frontão Chanfrado',u:'sf'}]},
  {g:'Furos',its:[{k:'forn',l:'Furo Torneira',u:'un',fx:0},{k:'fralo',l:'Furo Ralo',u:'un',fx:0}]},
  {g:'Área Molhada',its:[{k:'rodape',l:'Rodapé de Pedra',u:'sf'}]},
  {g:'Cuba / Lavatório',its:[{k:'cuba_lav',l:'Escolher cuba ou lavatório',u:'cuba',ctp:'lav'}]},
  {g:'Fixação',its:[{k:'tubo',l:'Tubo Metálico',u:'un',fx:0},{k:'cant',l:'Cantoneira',u:'un',fx:0}]},
  {g:'Instalação',its:[{k:'inst',l:'Instalação Padrão',u:'un',fx:1},{k:'inst_c',l:'Instalação Complexa',u:'un',fx:1}]},
  {g:'Deslocamento',its:[{k:'desl_cid',l:'Na cidade',u:'livre'},{k:'desl_for',l:'Fora da cidade',u:'km',fx:0}]}
];
SV_DEFS.Lavabo=[{g:'Sainha',its:[{k:'s_reta',l:'Sainha Reta',u:'sf'},{k:'s_45',l:'Sainha 45°',u:'sf'}]},{g:'Frontão',its:[{k:'frontao',l:'Frontão Reto',u:'sf'},{k:'frontao_chf',l:'Frontão Chanfrado',u:'sf'}]},{g:'Furos',its:[{k:'forn',l:'Furo Torneira',u:'un',fx:0}]},{g:'Área Molhada',its:[{k:'rodape',l:'Rodapé de Pedra',u:'sf'}]},{g:'Cuba / Lavatório',its:[{k:'cuba_lav',l:'Escolher cuba ou lavatório',u:'cuba',ctp:'lav'}]},{g:'Instalação',its:[{k:'inst',l:'Instalação Padrão',u:'un',fx:1}]},{g:'Deslocamento',its:[{k:'desl_cid',l:'Na cidade',u:'livre'},{k:'desl_for',l:'Fora da cidade',u:'km',fx:0}]}];
SV_DEFS.Soleira=[{g:'Acabamento',its:[{k:'sol1',l:'1 lado',u:'ml'},{k:'sol2',l:'2 lados',u:'ml'}]},{g:'Instalação',its:[{k:'inst',l:'Instalação Padrão',u:'un',fx:1}]},{g:'Deslocamento',its:[{k:'desl_cid',l:'Na cidade',u:'livre'},{k:'desl_for',l:'Fora da cidade',u:'km',fx:0}]}];
SV_DEFS.Peitoril=[{g:'Tipo',its:[{k:'peit_reto',l:'Peitoril Reto',u:'ml'},{k:'peit_ping',l:'c/ Pingadeira',u:'ml'},{k:'peit_col',l:'c/ Pedra Colada + Pingadeira',u:'ml'},{k:'peit_portal',l:'p/ Portal Madeira',u:'ml'}]},{g:'Instalação',its:[{k:'inst',l:'Instalação Padrão',u:'un',fx:1},{k:'inst_c',l:'Instalação Complexa',u:'un',fx:1}]},{g:'Deslocamento',its:[{k:'desl_cid',l:'Na cidade',u:'livre'},{k:'desl_for',l:'Fora da cidade',u:'km',fx:0}]}];
SV_DEFS.Escada=[{g:'Sainha',its:[{k:'s_reta',l:'Sainha Reta',u:'sf'},{k:'s_45',l:'Sainha 45°',u:'sf'},{k:'s_boleada',l:'Sainha Boleada',u:'sf'}]},{g:'Frontão',its:[{k:'frontao',l:'Frontão Reto',u:'sf'},{k:'frontao_chf',l:'Frontão Chanfrado',u:'sf'}]},{g:'Instalação',its:[{k:'inst',l:'Instalação Padrão',u:'un',fx:1},{k:'inst_c',l:'Instalação Complexa',u:'un',fx:1}]},{g:'Deslocamento',its:[{k:'desl_cid',l:'Na cidade',u:'livre'},{k:'desl_for',l:'Fora da cidade',u:'km',fx:0}]}];
SV_DEFS.Fachada=[{g:'Fixação',its:[{k:'tubo',l:'Tubo Metálico',u:'un',fx:0},{k:'cant',l:'Cantoneira',u:'un',fx:0}]},{g:'Instalação',its:[{k:'inst',l:'Instalação Padrão',u:'un',fx:1},{k:'inst_c',l:'Instalação Complexa',u:'un',fx:1}]},{g:'Deslocamento',its:[{k:'desl_cid',l:'Na cidade',u:'livre'},{k:'desl_for',l:'Fora da cidade',u:'km',fx:0}]}];
SV_DEFS.Outro=SV_DEFS.Cozinha;
SV_DEFS['🏊 Borda Piscina']=[
  {g:'Cantos / Curvas',its:[
    {k:'bp_c_arred',   l:'Cantos Arredondados', u:'un'},
    {k:'bp_c_curva',   l:'Curvas Especiais',    u:'un'},
    {k:'bp_c_infinita',l:'Borda Infinita',      u:'un'}
  ]},
  {g:'Instalação',its:[
    {k:'inst',  l:'Instalação Padrão',   u:'un',fx:1},
    {k:'inst_c',l:'Instalação Complexa', u:'un',fx:1}
  ]},
  {g:'Deslocamento',its:[
    {k:'desl_cid',l:'Na cidade',      u:'livre'},
    {k:'desl_for',l:'Fora da cidade', u:'km',fx:0}
  ]}
];

SV_DEFS.Tumulo=[
  {g:'🪨 Peças de Pedra (m²)',its:[
    {k:'tum_tampa',  l:'Tampa Superior',           u:'sf'},
    {k:'tum_lat',    l:'Laterais (×2)',            u:'sf'},
    {k:'tum_front',  l:'Frente / Frontal',         u:'sf'},
    {k:'tum_base',   l:'Base / Plataforma',        u:'sf'},
    {k:'tum_det',    l:'Detalhe Superior',         u:'sf'},
    {k:'tum_sainha', l:'Sainha Frontal',           u:'sf'},
    {k:'tum_gav1',   l:'Frente de Gaveta — 1ª',   u:'sf'},
    {k:'tum_gav2',   l:'Frente de Gaveta — 2ª',   u:'sf'},
    {k:'tum_gav3',   l:'Frente de Gaveta — 3ª',   u:'sf'}
  ]},
  {g:'📐 Acabamentos (ml)',its:[
    {k:'tum_mol',    l:'Moldura decorativa',       u:'ml'},
    {k:'tum_ping',   l:'Pingadeira',               u:'ml'},
    {k:'tum_bisel',  l:'Borda Biselada',           u:'ml'}
  ]},
  {g:'🪦 Lápide / Foto / Cruz',its:[
    {k:'tum_lapide', l:'Lápide de Granito',        u:'un', fx:1},
    {k:'tum_plaq',   l:'Plaquinha Gravada',        u:'un', fx:1},
    {k:'tum_foto',   l:'Foto em Porcelana',        u:'un', fx:1},
    {k:'tum_cruz',   l:'Cruz em Granito',          u:'un', fx:1},
    {k:'tum_pol',    l:'Polimento Extra',           u:'un', fx:1},
    {k:'tum_rec',    l:'Recorte / Furo',           u:'un', fx:0}
  ]},
  {g:'🔨 Mão de Obra',its:[
    {k:'tum_mont',   l:'Montagem / Instalação',    u:'un', fx:1},
    {k:'tum_montc',  l:'Instalação Complexa',      u:'un', fx:1}
  ]},
  {g:'🧱 Construção & Materiais',its:[
    {k:'tum_fund',   l:'Fundação',                 u:'livre'},
    {k:'tum_lev',    l:'Levantamento / Alvenaria', u:'livre'},
    {k:'tum_reb',    l:'Reboco / Chapisco',        u:'livre'},
    {k:'tum_conc',   l:'Concreto Armado',          u:'livre'},
    {k:'tum_cpiso',  l:'Contra-piso',              u:'livre'},
    {k:'tum_acob',   l:'Acabamento Final Obra',    u:'livre'},
    {k:'tum_cim',    l:'Cimento / Areia',          u:'livre'},
    {k:'tum_cola',   l:'Cola p/ Granito',          u:'livre'},
    {k:'tum_rej',    l:'Rejunte',                  u:'livre'},
    {k:'tum_ferro',  l:'Ferro / Tela',             u:'livre'},
    {k:'tum_tijolo', l:'Tijolos / Blocos',         u:'livre'},
    {k:'tum_frete',  l:'Frete / Entrega Material', u:'livre'}
  ]},
  {g:'Deslocamento',its:[
    {k:'desl_cid',   l:'Na cidade',                u:'livre'},
    {k:'desl_for',   l:'Fora da cidade',           u:'km', fx:0}
  ]}
];
SV_DEFS['Túmulo'] = SV_DEFS.Tumulo;

// Acessórios — adicionado em todos os tipos
// Acessórios ficam no catálogo próprio, não nos serviços do orçamento

function getSVGrp(){return SV_DEFS[document.getElementById('oTipo').value]||SV_DEFS.Cozinha;}
function getIt(k){var g=getSVGrp();for(var i=0;i<g.length;i++){for(var j=0;j<g[i].its.length;j++){if(g[i].its[j].k===k)return g[i].its[j];}}return null;}
// Preços padrão de túmulo/piscina — fallback quando CFG.sv não tem o valor
var DEF_TUM_SV={
  tum_tampa:85,tum_lat:85,tum_front:85,tum_base:85,tum_det:85,tum_sainha:85,
  tum_gav1:85,tum_gav2:85,tum_gav3:85,tum_mol:110,tum_ping:80,tum_bisel:90,
  tum_lapide:480,tum_plaq:220,tum_foto:170,tum_cruz:340,
  tum_pol:160,tum_rec:50,tum_mont:380,tum_montc:580,
  bp_boleada:110,bp_antiderap:120,bp_pingad:90,bp_mcana:100,bp_chanfro:95,
  bp_c_arred:180,bp_c_curva:220,bp_c_infinita:350
};
function getPr(k){var v=CFG.sv[k];if(v!==undefined&&v!==null)return v;return DEF_TUM_SV[k]||0;}

function buildSV(){
  selCuba=null;
  var g=getSVGrp(),h='';
  g.forEach(function(grp){
    h+='<div class="svblk"><div class="svhd">'+grp.g+'</div>';
    grp.its.forEach(function(it){
      var pr=getPr(it.k);
      var hint=it.u==='sf'?'R$ '+pr+'/ml + m² pedra':it.u==='ml'?'R$ '+pr+'/ml':it.u==='km'?'R$ '+pr+'/km':it.u==='cuba'?'Selecionar modelo':it.u==='livre'?'Valor livre':it.fx===1&&pr?'R$ '+pr:'R$ '+pr;
      h+='<div class="svrow" id="sr-'+it.k+'" data-sv="'+it.k+'"><div class="svchk">✓</div><div class="svlbl">'+it.l+'<span class="svph">'+hint+'</span></div></div>';
      if(it.u==='sf'){
        h+='<div class="sfw" id="sf-'+it.k+'"><div class="sfl">'+it.l+'</div><div class="sfr"><div class="sf"><span>Comprimento (ml)</span><input type="number" id="sw-'+it.k+'" placeholder="2.50" step="0.01" min="0" oninput="calcSF(\''+it.k+'\')" onclick="event.stopPropagation()"></div><div class="sfx">×</div><div class="sf"><span>Altura (cm)</span><input type="number" id="sh-'+it.k+'" placeholder="6" step="0.5" min="0" oninput="calcSF(\''+it.k+'\')" onclick="event.stopPropagation()"></div><div class="sf"><span>Qtd</span><input type="number" id="sq-'+it.k+'" value="1" min="1" style="width:48px;" oninput="calcSF(\''+it.k+'\')" onclick="event.stopPropagation()"></div></div><div class="sfres" id="sfr-'+it.k+'"></div></div>';
      } else if(it.u==='cuba'){
        h+='<div class="svcuba" id="sq-'+it.k+'"><span id="cdisp-'+it.k+'"></span></div>';
      } else if(it.u==='livre'){
        h+='<div class="svxtr" id="sq-'+it.k+'"><input type="number" id="si-'+it.k+'" placeholder="valor" step="1" min="0" onclick="event.stopPropagation()"><span class="svunit">reais</span></div>';
      } else if(!it.fx){
        h+='<div class="svxtr" id="sq-'+it.k+'"><input type="number" id="si-'+it.k+'" placeholder="'+(it.u==='ml'?'metros':'qtd')+'" step="0.1" min="0" onclick="event.stopPropagation()"><span class="svunit">'+it.u+'</span></div>';
      } else {
        h+='<div id="sq-'+it.k+'" style="display:none;"></div>';
      }
    });
    h+='</div>';
  });
  document.getElementById('svArea').innerHTML=h;
}

function calcSF(k){
  var ml=+document.getElementById('sw-'+k).value||0;
  var altCm=+document.getElementById('sh-'+k).value||0;
  var q=+document.getElementById('sq-'+k).value||1;
  var el=document.getElementById('sfr-'+k);if(!el)return;
  if(ml&&altCm){
    var m2=ml*(altCm/100)*q;
    var mat=CFG.stones.find(function(s){return s.id===(amb&&amb.selMat?amb.selMat:selMat);});
    var pv=mat?m2*mat.pr:0;
    var mo=ml*q*getPr(k);
    el.innerHTML='<span style="color:var(--grn)">Pedra: '+m2.toFixed(3)+'m² → R$ '+fm(pv)+'</span>  <span style="color:var(--gold2)">M.O.: R$ '+fm(mo)+'</span>';
  }else{el.textContent='';}
}

// ═══ CUBA PICKER ═══
function openCubaPick(tipo,svKey){
  _cubaPickKey=svKey;
  var lista=tipo==='coz'?CFG.coz:CFG.lav;
  document.getElementById('cpTitle').textContent=tipo==='coz'?'Cubas para Cozinha':'Cubas para Banheiro/Lavabo';
  document.getElementById('cpSub').textContent='Cubas HR (fornecemos) ou cliente traz (só mão de obra)';
  var h='';
  // Cliente option
  var instCli=tipo==='coz'?160:280;
  h+='<div class="cpcard" data-pcuba="__cli__" data-ctype="'+tipo+'"><div class="cpthumb" style="background:var(--s3);font-size:1.4rem;color:var(--t3);display:grid;place-items:center;">📦</div><div><div class="cpbrand">Cliente Fornece</div><div class="cpnm">Só Mão de Obra</div><div class="cpdim">Cliente compra, HR instala</div><div class="cppr">M.O.: <b>R$ '+instCli+'</b></div></div></div>';
  h+='<div style="font-size:.57rem;letter-spacing:2px;text-transform:uppercase;color:var(--gold);font-weight:600;margin:13px 0 8px;">Cubas HR — fornecemos e instalamos</div>';
  lista.filter(function(c){return c.pr>0;}).forEach(function(c){
    var tot=c.pr+c.inst;
    var _prStr=c.pr>0?'Cuba <b>R$ '+c.pr+'</b> + M.O. R$ '+c.inst+' = <b>R$ '+tot+'</b>':'M.O. <b>R$ '+c.inst+'</b> (produto a consultar)';
    h+='<div class="cpcard" data-pcuba="'+c.id+'" data-ctype="'+tipo+'"><div class="cpthumb">'+(c.photo?'<img src="'+c.photo+'" alt="">':(c.tipo?'🚿':'🔧'))+'</div><div><div class="cpbrand">'+c.brand+'</div><div class="cpnm">'+c.nm+'</div><div class="cpdim">'+c.dim+'</div><div class="cppr">'+_prStr+'</div></div></div>';
  });
  // Esculpidas — disponível para cozinha e banheiro/lavabo
  // Para cozinha usa CFG.lav (esculpidas estão lá) pois lav tem tipo Esculpida
  var escLista=CFG.lav.filter(function(x){return x.tipo==='Esculpida';});
  if(escLista.length){
    h+='<div style="font-size:.57rem;letter-spacing:2px;text-transform:uppercase;color:var(--gold);font-weight:600;margin:13px 0 8px;">🪨 Cuba Esculpida na Pedra</div>';
    h+='<div style="background:var(--s3);border:1px solid var(--bd2);border-radius:11px;padding:13px 14px;margin-bottom:6px;">';
    h+='<div style="font-size:.7rem;color:var(--t2);line-height:1.6;margin-bottom:10px;">Cuba escavada direto na pedra. Informe as dimensões para calcular pedra + mão de obra.</div>';
    h+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;">';
    h+='<div><div style="font-size:.6rem;color:var(--t3);margin-bottom:3px;">Comprimento (cm)</div><input type="number" id="escW" placeholder="50" min="20" onclick="event.stopPropagation()" style="width:100%;background:var(--s2);border:1px solid var(--bd2);border-radius:8px;padding:8px 10px;color:var(--tx);font-family:Outfit,sans-serif;font-size:.85rem;outline:none;"></div>';
    h+='<div><div style="font-size:.6rem;color:var(--t3);margin-bottom:3px;">Largura (cm)</div><input type="number" id="escH" placeholder="40" min="20" onclick="event.stopPropagation()" style="width:100%;background:var(--s2);border:1px solid var(--bd2);border-radius:8px;padding:8px 10px;color:var(--tx);font-family:Outfit,sans-serif;font-size:.85rem;outline:none;"></div>';
    h+='<div><div style="font-size:.6rem;color:var(--t3);margin-bottom:3px;">Profundidade (cm)</div><input type="number" id="escD" placeholder="20" min="10" onclick="event.stopPropagation()" style="width:100%;background:var(--s2);border:1px solid var(--bd2);border-radius:8px;padding:8px 10px;color:var(--tx);font-family:Outfit,sans-serif;font-size:.85rem;outline:none;"></div>';
    h+='</div>';
    h+='<div id="escPreviewBox" style="font-size:.72rem;color:var(--t3);margin-bottom:10px;">Preencha as dimensões e selecione o tipo abaixo</div>';
    h+='<div style="font-size:.6rem;color:var(--t3);margin-bottom:8px;">Tipo de acabamento:</div>';
    escLista.forEach(function(esc){
      h+='<button onclick="pickEsculpida(\''+esc.id+'\',\''+tipo+'\')" style="width:100%;background:var(--gdim);border:1px solid var(--gold3);border-radius:10px;padding:12px 14px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-family:Outfit,sans-serif;">';
      h+='<div style="text-align:left;"><div style="font-size:.82rem;font-weight:700;color:var(--tx);">'+esc.nm+'</div><div style="font-size:.65rem;color:var(--t3);margin-top:2px;">M.O. base: R$ '+esc.inst+'</div></div>';
      h+='<div style="font-size:.72rem;color:var(--gold2);font-weight:700;">Selecionar →</div>';
      h+='</button>';
    });
    h+='</div>';
  }
  document.getElementById('cpList').innerHTML=h;
  showMd('cubaPickMd');
}
function pickEsculpida(escId, tipo){
  var escW=+(document.getElementById('escW')||{}).value||0;
  var escH=+(document.getElementById('escH')||{}).value||0;
  var escD=+(document.getElementById('escD')||{}).value||0;
  if(!escW||!escH||!escD){toast('Informe comprimento, largura e profundidade da cuba');return;}

  var esc=CFG.lav.find(function(x){return x.id===escId;});
  if(!esc)return;

  // Cálculo da pedra removida:
  // Fundo (comprimento × largura) + 4 paredes internas
  var aFundo=(escW*escH)/10000;
  var aParedes=(2*(escW*escD)+2*(escH*escD))/10000;
  var aExtra=+(aFundo+aParedes).toFixed(4);

  // Mão de obra: base + R$8 por litro removido
  var volumeLt=(escW*escH*escD)/1000;
  var moBase=esc.inst;
  var moExtra=Math.round(volumeLt*8);
  var moTotal=moBase+moExtra;

  // Pedra: área removida × preço/m²
  var mat=CFG.stones.find(function(s){return s.id===selMat;})||{pr:0,nm:''};
  var valorPedra=Math.round(aExtra*mat.pr);
  var totalCuba=moTotal+valorPedra;

  var tipoFinal=tipo||'lav';
  var svKey=tipoFinal==='coz'?'cuba_coz':'cuba_lav';
  var dim=escW+'×'+escH+'×'+escD+'cm';
  var nm=esc.nm+' '+dim;

  var cubaObj={
    id:esc.id,
    nm:nm,
    total:totalCuba,
    tipo:tipoFinal,
    escExtra:{aExtra:aExtra,moBase:moBase,moExtra:moExtra,valorPedra:valorPedra,
              dim:dim,w:escW,h:escH,d:escD,volumeLt:+volumeLt.toFixed(1)}
  };

  if(_cubaPickAmbId!==null){
    var amb=ambientes.find(function(a){return a.id==_cubaPickAmbId;});
    if(amb){
      amb.selCuba=cubaObj;
      if(!amb.svState)amb.svState={};
      amb.svState[svKey]={};
    }
    closeAll();
    renderAmbientes();
    toast('✓ '+nm+' — R$ '+fm(totalCuba)+' | M.O. R$ '+fm(moTotal)+' + Pedra R$ '+fm(valorPedra));
    _cubaPickAmbId=null;
  }
}

function pickCuba(id,tipo){
  var lista=tipo==='coz'?CFG.coz:CFG.lav;
  var instCli=tipo==='coz'?160:280;
  var cubaObj;
  if(id==='__cli__'){
    cubaObj={id:'__cli__',nm:'Cuba do cliente',total:instCli,tipo:tipo};
  } else {
    var c=lista.find(function(x){return x.id===id;});
    if(!c)return;
    var isEsc=c.tipo==='Esculpida';
    cubaObj={id:c.id,nm:(c.brand?' '+c.brand:'')+(c.nm?(' '+c.nm):''),total:isEsc?c.inst:(c.pr+c.inst),tipo:tipo};
  }
  // Apply to correct ambiente
  if(_cubaPickAmbId!==null){
    var amb=ambientes.find(function(a){return a.id==_cubaPickAmbId;});
    if(amb){
      amb.selCuba=cubaObj;
      // Ensure the sv key is marked on
      var k=tipo==='coz'?'cuba_coz':'cuba_lav';
      if(!amb.svState)amb.svState={};
      amb.svState[k]={};
    }
    closeAll();
    renderAmbientes();
    toast('✓ '+cubaObj.nm.trim());
    _cubaPickAmbId=null;
  } else {
    // Legacy fallback
    closeAll();
    toast('✓ '+cubaObj.nm.trim());
  }
}

// ═══ AMBIENTES ═══
var TIPOS_AMBIENTE=['Cozinha','Banheiro','Lavabo','Soleira','Peitoril','Escada','Fachada','Túmulo','🏊 Borda Piscina','Outro'];

function pickMatAmb(ambId,stoneId){
  var amb=ambientes.find(function(a){return a.id==ambId;});
  if(!amb)return;
  amb.selMat=stoneId;
  var car=document.getElementById('mcar-'+ambId);
  if(car)car.outerHTML=buildMatCarouselHtml(amb);
  var ind=document.getElementById('mind-'+ambId);
  if(ind){
    var s=CFG.stones.find(function(x){return x.id===amb.selMat;});
    ind.innerHTML=s
      ?s.nm+' <span style="color:var(--gold2);">R$'+s.pr.toLocaleString('pt-BR')+'/m²</span>'
      :'<span style="color:var(--t4);">selecione uma pedra</span>';
  }
}
function buildMatBarHtml(amb){return '';}
function toggleMatPick(ambId){}

function buildMatCarouselHtml(amb){
  var PREF={
    'Cozinha':  ['Granito Cinza','Granito Preto','Granito Branco','Granito Verde','Ultra Compacto','Quartzito','Mármore','Travertino'],
    'Banheiro': ['Mármore','Quartzito','Granito Branco','Granito Cinza','Travertino','Ultra Compacto','Granito Preto','Granito Verde'],
    'Lavabo':   ['Mármore','Quartzito','Travertino','Granito Branco','Granito Cinza','Ultra Compacto','Granito Preto','Granito Verde'],
    'Escada':   ['Granito Preto','Granito Cinza','Granito Verde','Granito Branco','Quartzito','Mármore','Travertino','Ultra Compacto'],
    'Soleira':  ['Granito Preto','Granito Cinza','Granito Branco','Granito Verde','Quartzito','Mármore','Travertino','Ultra Compacto'],
    'Peitoril': ['Granito Cinza','Granito Branco','Granito Preto','Granito Verde','Mármore','Quartzito','Travertino','Ultra Compacto'],
    'Fachada':  ['Granito Cinza','Granito Preto','Granito Verde','Granito Branco','Quartzito','Mármore','Travertino','Ultra Compacto'],
    'Túmulo':   ['Granito Preto','Granito Cinza','Granito Verde','Granito Branco','Quartzito','Mármore','Travertino','Ultra Compacto'],
    'Outro':    ['Granito Cinza','Granito Preto','Granito Branco','Granito Verde','Mármore','Quartzito','Travertino','Ultra Compacto'],
    '🏊 Borda Piscina':['Granito Cinza','Granito Preto','Granito Verde','Granito Branco','Quartzito','Mármore','Travertino','Ultra Compacto']
  };
  var ordem=PREF[amb.tipo]||PREF['Outro'];
  var todas=CFG.stones.filter(function(s){return s.pr>0;});
  if(!todas.length)
    return '<div id="mcar-'+amb.id+'" style="font-size:.62rem;color:var(--t4);padding:4px 0 8px;">Nenhuma pedra cadastrada — Config → Pedras</div>';
  var ord=[];
  ordem.forEach(function(cat){todas.filter(function(s){return s.cat===cat;}).forEach(function(s){ord.push(s);});});
  todas.forEach(function(s){if(ord.indexOf(s)===-1)ord.push(s);});

  var h='<div id="mcar-'+amb.id+'" style="'
    +'display:flex;gap:8px;overflow-x:auto;overflow-y:hidden;'
    +'-webkit-overflow-scrolling:touch;scrollbar-width:none;'
    +'padding:2px 0 8px;">';

  ord.forEach(function(s){
    var sel=s.id===amb.selMat;
    var tx=s.photo?'':s.tx;
    h+='<div onclick="pickMatAmb('+amb.id+',\''+s.id+'\')" style="'
      +'flex:0 0 100px;cursor:pointer;border-radius:10px;overflow:hidden;position:relative;'
      +'border:1.5px solid '+(sel?'var(--gold)':'rgba(255,255,255,.07)')+';'
      +'background:'+(sel?'rgba(201,168,76,.08)':'var(--s2)')+';'
      +'box-shadow:'+(sel?'0 0 0 1px rgba(201,168,76,.15),0 2px 12px rgba(201,168,76,.15)':'none')+';'
      +'transition:border-color .12s,box-shadow .12s;">';
    // Imagem
    h+='<div style="width:100%;height:64px;overflow:hidden;background:var(--s4);">';
    if(s.photo){
      h+='<img src="'+s.photo+'" alt="" style="width:100%;height:100%;object-fit:cover;display:block;">';
    } else {
      h+='<div class="msw '+tx+'" style="width:100%;height:100%;"><div class="mshine"></div></div>';
    }
    h+='</div>';
    // Check
    if(sel)
      h+='<div style="position:absolute;top:5px;right:5px;width:15px;height:15px;border-radius:50%;'
        +'background:var(--gold);color:#1a0800;display:flex;align-items:center;justify-content:center;'
        +'font-size:.46rem;font-weight:800;">✓</div>';
    // Texto
    h+='<div style="padding:5px 7px 7px;">';
    h+='<div style="font-size:.47rem;color:var(--t4);letter-spacing:.3px;margin-bottom:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+s.cat+'</div>';
    h+='<div style="font-size:.64rem;font-weight:700;color:var(--tx);line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+s.nm+'</div>';
    h+='<div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:3px;">';
    h+='<span style="font-size:.46rem;color:var(--t4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:54%;">'+s.fin+'</span>';
    h+='<span style="font-size:.55rem;color:var(--gold2);font-weight:600;white-space:nowrap;">R$'+s.pr.toLocaleString('pt-BR')+'</span>';
    h+='</div>';
    h+='</div>';
    h+='</div>';
  });
  h+='</div>';
  return h;
}

function addAmbiente(){
  var id=Date.now();
  var defaultMat=ambientes.length>0?ambientes[ambientes.length-1].selMat:null;
  ambientes.push({id:id,tipo:'Cozinha',pecas:[],selCuba:null,svState:{},acState:{},selMat:defaultMat});
  addPecaAmb(id);
  renderAmbientes();
}

function rmAmbiente(id){
  if(ambientes.length<=1){toast('Precisa ter pelo menos 1 ambiente');return;}
  ambientes=ambientes.filter(function(a){return a.id!=id;});
  renderAmbientes();
}

function setAmbTipo(id,tipo){
  var amb=ambientes.find(function(a){return a.id==id;});
  if(!amb)return;
  amb.tipo=tipo;
  amb.selCuba=null;
  amb.svState={};
  amb.acState={};
  var gNew=SV_DEFS[tipo]||SV_DEFS.Cozinha;
  gNew.forEach(function(grp){
    if(grp.its.length>0&&grp.its[0].u==='acb_auto'){
      amb.svState[grp.its[0].k]={lados:grp.its[0].lados||0};
    }
  });
  renderAmbientes();
}

function addPecaAmb(ambId){
  var amb=ambientes.find(function(a){return a.id==ambId;});
  if(!amb)return;
  amb.pecas.push({id:Date.now(),desc:'',w:0,h:0,q:1});
  renderAmbientes();
}

function rmPecaAmb(ambId,pcId){
  var amb=ambientes.find(function(a){return a.id==ambId;});
  if(!amb)return;
  if(amb.pecas.length<=1){toast('Precisa ter pelo menos 1 peça');return;}
  amb.pecas=amb.pecas.filter(function(p){return p.id!=pcId;});
  renderAmbientes();
}

function updPcAmb(ambId,pcId,prop,val){
  var amb=ambientes.find(function(a){return a.id==ambId;});
  if(!amb)return;
  var pc=amb.pecas.find(function(p){return p.id===pcId;});
  if(pc)pc[prop]=val;
}

// Legacy
function addPeca(){if(ambientes.length>0)addPecaAmb(ambientes[0].id);}
function updPc(id,prop,val){ambientes.forEach(function(a){var p=a.pecas.find(function(x){return x.id===id;});if(p)p[prop]=val;});}
function remPeca(id){ambientes.forEach(function(a){if(a.pecas.length>1){a.pecas=a.pecas.filter(function(p){return p.id!==id;});}});renderAmbientes();}

function renderAmbientes(){
  try{
  var container=document.getElementById('ambientesList');
  if(!container)return;
  var h='';
  ambientes.forEach(function(amb,idx){
    var num=idx+1;
    var ambMat=CFG.stones.find(function(s){return s.id===amb.selMat;});
    h+='<div class="ambiente">';
    h+='<div class="amb-header">';
    h+='<span class="amb-title">'+num+'º Ambiente — '+amb.tipo+'</span>';
    h+='<button class="amb-rm" data-rm-amb="'+amb.id+'">✕ Remover</button>';
    h+='</div>';
    h+='<div class="amb-body">';
    // STEP 1: Tipo de Ambiente
    h+='<div style="font-size:.58rem;letter-spacing:2px;text-transform:uppercase;color:var(--gold);font-weight:600;margin-bottom:8px;">① Ambiente</div>';
    h+='<div class="amb-tipo">';
    TIPOS_AMBIENTE.forEach(function(t){
      h+='<button class="amb-tip'+(amb.tipo===t?' on':'')+'" data-amb-tipo="'+t+'" data-amb-id="'+amb.id+'">'+t+'</button>';
    });
    h+='</div>';
    if(amb.tipo==='Túmulo'){
      if(!amb.tumExtra)amb.tumExtra={};
      var te=amb.tumExtra;
      h+='<div style="background:rgba(201,168,76,.06);border:1px solid rgba(201,168,76,.18);border-radius:10px;padding:12px;margin:10px 0;">';
      h+='<div style="font-size:.58rem;letter-spacing:2px;text-transform:uppercase;color:var(--gold);font-weight:600;margin-bottom:10px;">⚰️ Dados do Túmulo</div>';
      h+='<div class="f"><label>Falecido(a)</label><input placeholder="Nome do falecido" type="text" style="background:var(--s3);" value="'+escH(te.falecido||'')+'" oninput="updTumExtra('+amb.id+',\'falecido\',this.value)"></div>';
      h+='<div class="f"><label>Cemitério</label><input placeholder="Nome do cemitério" type="text" style="background:var(--s3);" value="'+escH(te.cemiterio||'')+'" oninput="updTumExtra('+amb.id+',\'cemiterio\',this.value)"></div>';
      h+='<div class="r2"><div class="f"><label>Quadra</label><input placeholder="Q-12" type="text" style="background:var(--s3);" value="'+escH(te.quadra||'')+'" oninput="updTumExtra('+amb.id+',\'quadra\',this.value)"></div>';
      h+='<div class="f"><label>Lote / Número</label><input placeholder="L-04" type="text" style="background:var(--s3);" value="'+escH(te.lote||'')+'" oninput="updTumExtra('+amb.id+',\'lote\',this.value)"></div></div>';
      h+='<div class="f"><label>Tipo de Túmulo</label><select style="background:var(--s3);color:var(--tx);border:1px solid var(--bd);border-radius:7px;padding:8px 10px;width:100%;font-size:.82rem;font-family:Outfit,sans-serif;" onchange="updTumExtra('+amb.id+',\'subtipo\',this.value)">';
      ['Simples','Gaveta Dupla','Gaveta Tripla','Jazigo Familiar','Reforma / Revestimento','Monumento / Capelinha'].forEach(function(st){
        h+='<option value="'+st+'"'+(te.subtipo===st?' selected':'')+'>'+st+'</option>';
      });
      h+='</select></div>';
      h+='<div style="margin-top:10px;padding:8px 10px;background:rgba(201,168,76,.08);border-radius:8px;font-size:.62rem;color:var(--t3);line-height:1.6;">';
      h+='💡 <b>Como preencher as peças:</b> informe Comprimento × Largura de cada face.<br>';
      h+='Ex: Tampa → 220×90cm | Lateral → 220×70cm (qtd 2) | Frente → 90×70cm';
      h+='</div>';
      h+='</div>';
    }
    if(amb.tipo==='🏊 Borda Piscina'){
      if(!amb.bordaAcb)amb.bordaAcb={tipo:'polida'};
      var ba=amb.bordaAcb;
      var baTipoDef=BP_TIPOS_ACB.find(function(t){return t.k===ba.tipo;})||BP_TIPOS_ACB[0];
      // Resumo do ML total de todas as peças
      var baTotalMLGlobal=0;
      amb.pecas.forEach(function(p){var pl=p.acabLados||0;if(pl&&p.w)baTotalMLGlobal+=_calcBordaPcML(p,pl);});
      h+='<div style="background:rgba(100,180,255,.06);border:1px solid rgba(100,180,255,.22);border-radius:10px;padding:12px;margin:10px 0;">';
      h+='<div style="font-size:.58rem;letter-spacing:2px;text-transform:uppercase;color:#6ea4ff;font-weight:600;margin-bottom:10px;">🏊 Tipo de Acabamento da Borda</div>';
      h+='<div style="font-size:.6rem;color:var(--t3);margin-bottom:6px;">Selecione o tipo — o acabamento por peça é definido abaixo em cada peça</div>';
      h+='<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px;">';
      BP_TIPOS_ACB.forEach(function(t){
        var sel=ba.tipo===t.k;
        h+='<div onclick="updBordaAcb('+amb.id+',\'tipo\',\''+t.k+'\')" style="cursor:pointer;padding:5px 11px;border-radius:7px;border:1.5px solid '+(sel?'#6ea4ff':'rgba(100,180,255,.15)')+';background:'+(sel?'rgba(100,180,255,.15)':'var(--s3)')+';font-size:.7rem;font-weight:'+(sel?700:500)+';color:'+(sel?'#9bbfff':'var(--t3)')+';">';
        h+=t.l+(t.pr>0?' <span style="font-size:.55rem;color:var(--t4);">R$'+t.pr+'/m</span>':'');
        h+='</div>';
      });
      h+='</div>';
      if(baTotalMLGlobal>0){
        var baTotVal=baTotalMLGlobal*baTipoDef.pr;
        h+='<div style="background:var(--s2);border-radius:8px;padding:8px 10px;display:flex;align-items:center;justify-content:space-between;">';
        h+='<div style="font-size:.68rem;color:#6ea4ff;font-weight:700;">Total acabamento: '+baTotalMLGlobal.toFixed(2)+'m</div>';
        h+=baTipoDef.pr>0?'<div style="font-size:.72rem;color:var(--gold2);font-weight:700;">R$ '+baTotVal.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'</div>':'<div style="font-size:.65rem;color:var(--t4);">sem custo extra</div>';
        h+='</div>';
      }
      h+='<div style="font-size:.57rem;color:var(--t4);margin-top:8px;line-height:1.5;">💡 <b>Comprimento</b> = lado da piscina em cm &nbsp;·&nbsp; <b>Largura</b> = largura da borda em cm</div>';
      h+='</div>';
    }
    // STEP 2: Selecao de Pedra
    h+='<div style="margin:10px 0 12px;">';
    h+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">';
    h+='<span style="font-size:.52rem;letter-spacing:2px;text-transform:uppercase;color:var(--gold);font-weight:600;">② Pedra</span>';
    h+='<span id="mind-'+amb.id+'" style="font-size:.58rem;color:var(--t3);">';
    if(ambMat) h+=ambMat.nm+' <span style="color:var(--gold2);">R$'+ambMat.pr.toLocaleString('pt-BR')+'/m²</span>';
    else h+='<span style="color:var(--t4);">selecione uma pedra</span>';
    h+='</span></div>';
    h+=buildMatCarouselHtml(amb);
    h+='</div>';
    // Pecas
    h+='<div style="font-size:.58rem;letter-spacing:2px;text-transform:uppercase;color:var(--gold);font-weight:600;margin:14px 0 7px;">Peças</div>';
    h+='<div class="amb-pecas">';
    amb.pecas.forEach(function(pc,pi){
      var rm=amb.pecas.length>1?'<button style="background:none;border:none;color:var(--red);font-size:.7rem;cursor:pointer;padding:2px 5px;font-family:Outfit,sans-serif;" onclick="rmPecaAmb('+amb.id+','+pc.id+')">&#10005;</button>':'';
      h+='<div class="peca">';
      h+='<div class="ptop"><span class="pnum">Peça '+(pi+1)+'</span>'+rm+'</div>';
      h+='<div class="f"><label>Descrição</label><input id="pd-'+pc.id+'" placeholder="Ex: Bancada" type="text" style="background:var(--s3);" value="'+escH(pc.desc||'')+'" oninput="updPcAmb('+amb.id+','+pc.id+',\'desc\',this.value)"></div>';
      h+='<div class="r2"><div class="f"><label>Comprimento (cm)</label><input id="pw-'+pc.id+'" placeholder="300" type="number" style="background:var(--s3);" value="'+(pc.w||'')+'" oninput="updPcAmb('+amb.id+','+pc.id+',\'w\',+this.value)"></div>';
      h+='<div class="f"><label>Largura (cm)</label><input id="ph-'+pc.id+'" placeholder="60" type="number" style="background:var(--s3);" value="'+(pc.h||'')+'" oninput="updPcAmb('+amb.id+','+pc.id+',\'h\',+this.value)"></div></div>';
      h+='<div style="max-width:130px;"><div class="f"><label>Quantidade</label><input id="pq-'+pc.id+'" type="number" style="background:var(--s3);" value="'+(pc.q||1)+'" oninput="updPcAmb('+amb.id+','+pc.id+',\'q\',+this.value||1)"></div></div>';
      if(amb.tipo==='🏊 Borda Piscina'){
        var pcLados=pc.acabLados||0;
        var pcBaTipDef=BP_TIPOS_ACB.find(function(t){return t.k===((amb.bordaAcb||{}).tipo||'polida');})||BP_TIPOS_ACB[0];
        var pcML=_calcBordaPcML(pc,pcLados);
        var pcVal=pcML*pcBaTipDef.pr;
        var pcLdLabels=['Sem acabamento','1 lateral aparente','2 laterais aparentes','3 lados','todos os lados'];
        h+='<div style="border-top:1px solid rgba(100,180,255,.15);margin-top:9px;padding-top:9px;">';
        h+='<div style="font-size:.55rem;letter-spacing:1.5px;text-transform:uppercase;color:#6ea4ff;font-weight:700;margin-bottom:7px;">Acabamento desta peça</div>';
        h+='<div style="display:flex;gap:3px;">';
        [0,1,2,3,4].forEach(function(v){
          var sel=pcLados===v;
          var ll=['Sem','1 Lat.','2 Lat.','3 Lados','4 Lados'][v];
          h+='<div onclick="updPcAcabLados('+amb.id+','+pc.id+','+v+')" style="cursor:pointer;flex:1;text-align:center;padding:5px 2px;border-radius:7px;border:1.5px solid '+(sel?'#6ea4ff':'rgba(100,180,255,.12)')+';background:'+(sel?'rgba(100,180,255,.18)':'var(--s3)')+';font-size:.58rem;font-weight:'+(sel?700:500)+';color:'+(sel?'#9bbfff':'var(--t4)')+';">'+ll+'</div>';
        });
        h+='</div>';
        if(pcLados>0&&pc.w){
          h+='<div style="margin-top:6px;background:var(--s2);border-radius:6px;padding:6px 9px;display:flex;align-items:center;justify-content:space-between;">';
          h+='<div style="font-size:.63rem;color:#6ea4ff;font-weight:600;">'+pcLdLabels[pcLados]+': <b style="color:var(--tx);">'+pcML.toFixed(2)+'m</b></div>';
          h+=pcBaTipDef.pr>0?'<div style="font-size:.63rem;color:var(--gold2);font-weight:700;">R$ '+pcVal.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'</div>':'<div style="font-size:.6rem;color:var(--t4);">s/ custo extra</div>';
          h+='</div>';
        }
        h+='</div>';
      }
      h+='</div>';
    });
    h+='</div>';
    h+='<div class="row" style="gap:7px;margin-bottom:10px;">';
    h+='<button class="btn btn-o" style="font-size:.73rem;padding:8px;flex:1;" data-add-peca="'+amb.id+'">+ Peça</button>';
    h+='<button class="btn-ai-sm" data-ai-amb="'+amb.id+'">✨ Descrever</button>';
    h+='</div>';
    h+='<div style="font-size:.58rem;letter-spacing:2px;text-transform:uppercase;color:var(--gold);font-weight:600;margin-bottom:7px;">Serviços</div>';
    h+=buildSVHtml(amb);
    h+='</div></div>';
  });
  container.innerHTML=h;
  }catch(e2){console.error('renderAmbientes:',e2);toast('Erro: '+e2.message);}
}
// ─── BORDA PISCINA: cálculo automático de ML por lados ───────────
var BP_TIPOS_ACB=[
  {k:'polida',    l:'Polida',         pr:0},
  {k:'escovada',  l:'Escovada',       pr:15},
  {k:'flameada',  l:'Flameada',       pr:18},
  {k:'antiderap', l:'Antiderrapante', pr:22},
  {k:'boleada',   l:'Boleada',        pr:25}
];
function _calcBordaPcML(pc,lados){
  if(!lados||!pc.w)return 0;
  var nL=lados>=2?2:1;
  var nS=lados>=4?2:lados>=3?1:0;
  return (pc.w/100)*(pc.q||1)*nL+((pc.h||0)/100)*(pc.q||1)*nS;
}
function updPcAcabLados(ambId,pcId,val){
  var amb=ambientes.find(function(a){return a.id==ambId;});
  if(!amb)return;
  var pc=amb.pecas.find(function(p){return p.id==pcId;});
  if(pc)pc.acabLados=val;
  renderAmbientes();
}
function _calcBordaAcbMl(amb,lados){
  if(!lados)return 0;
  var mlL=0,mlS=0;
  (amb.pecas||[]).forEach(function(p){
    if(p.w)mlL+=(p.w/100)*(p.q||1);
    if(p.h)mlS+=(p.h/100)*(p.q||1);
  });
  var nL=lados>=2?2:1;
  var nS=lados>=4?2:lados>=3?1:0;
  return mlL*nL+mlS*nS;
}
function updBordaAcb(ambId,prop,val){
  var amb=ambientes.find(function(a){return a.id==ambId;});
  if(!amb)return;
  if(!amb.bordaAcb)amb.bordaAcb={tipo:'polida',lados:0};
  amb.bordaAcb[prop]=val;
  renderAmbientes();
}

function buildSVHtml(amb){
  var g=SV_DEFS[amb.tipo]||SV_DEFS.Cozinha;
  var sv=amb.svState||{};
  var h='';
  g.forEach(function(grp){
    h+='<div class="svblk"><div class="svhd">'+grp.g+'</div>';
    grp.its.forEach(function(it){
      var pr=getPr(it.k);
      var isOn=!!sv[it.k];
      var hint=it.u==='sf'?'R$ '+pr+'/ml + m² pedra':it.u==='ml'?'R$ '+pr+'/ml':it.u==='km'?'R$ '+pr+'/km':it.u==='cuba'?'Selecionar modelo':it.u==='livre'?'Valor livre':'R$ '+pr;
      h+='<div class="svrow'+(isOn?' on':'')+'" data-sv="'+it.k+'" data-amb="'+amb.id+'">';
      h+='<div class="svchk">✓</div><div class="svlbl">'+it.l+'<span class="svph">'+hint+'</span></div></div>';
      if(it.u==='sf'&&isOn){
        var sfv=sv[it.k]||{};
        h+='<div class="sfw on" id="sf-'+amb.id+'-'+it.k+'">';
        h+='<div class="sfl">'+it.l+'</div><div class="sfr">';
        h+='<div class="sf"><span>Comprimento (ml)</span><input type="number" id="sw-'+amb.id+'-'+it.k+'" placeholder="2.50" step="0.01" value="'+(sfv.ml||'')+'" oninput="updSVAmb('+amb.id+',\''+it.k+'\',\'ml\',+this.value);calcSFAmb('+amb.id+',\''+it.k+'\')" onclick="event.stopPropagation()"></div>';
        h+='<div class="sfx">×</div>';
        h+='<div class="sf"><span>Altura (cm)</span><input type="number" id="sh-'+amb.id+'-'+it.k+'" placeholder="6" step="0.5" value="'+(sfv.altCm||'')+'" oninput="updSVAmb('+amb.id+',\''+it.k+'\',\'altCm\',+this.value);calcSFAmb('+amb.id+',\''+it.k+'\')" onclick="event.stopPropagation()"></div>';
        h+='<div class="sf"><span>Qtd</span><input type="number" id="sq-'+amb.id+'-'+it.k+'" value="'+(sfv.q||1)+'" min="1" style="width:48px;" oninput="updSVAmb('+amb.id+',\''+it.k+'\',\'q\',+this.value||1);calcSFAmb('+amb.id+',\''+it.k+'\')" onclick="event.stopPropagation()"></div>';
        h+='</div><div class="sfres" id="sfr-'+amb.id+'-'+it.k+'"></div></div>';
      } else if(it.u==='cuba'&&isOn){
        var cubaInfo=amb.selCuba?('✓ '+amb.selCuba.nm.trim()+' — R$ '+fm(amb.selCuba.total)):'Toque para escolher';
        h+='<div class="svcuba on" id="sq-'+amb.id+'-'+it.k+'" onclick="openCubaPickAmb('+amb.id+',\''+it.ctp+'\')" style="cursor:pointer;">'+cubaInfo+'</div>';
      } else if((it.u==='ml'||it.u==='km'||it.u==='un')&&!it.fx&&isOn){
        var sv2=sv[it.k]||{};
        h+='<div class="svxtr on" id="sq-'+amb.id+'-'+it.k+'"><input type="number" id="si-'+amb.id+'-'+it.k+'" placeholder="'+(it.u==='ml'?'metros':'qtd')+'" step="0.1" value="'+(sv2.qty||'')+'" oninput="updSVAmb('+amb.id+',\''+it.k+'\',\'qty\',+this.value)" onclick="event.stopPropagation()"><span class="svunit">'+it.u+'</span></div>';
      } else if(it.u==='livre'&&isOn){
        var sv3=sv[it.k]||{};
        h+='<div class="svxtr on" id="sq-'+amb.id+'-'+it.k+'"><input type="number" id="si-'+amb.id+'-'+it.k+'" placeholder="valor" value="'+(sv3.qty||'')+'" oninput="updSVAmb('+amb.id+',\''+it.k+'\',\'qty\',+this.value)" onclick="event.stopPropagation()"><span class="svunit">reais</span></div>';
      }
    });
    h+='</div>';
  });

  // ── ACESSÓRIOS DO CATÁLOGO ──
  var acList=CFG.ac||[];
  var tiposComAcess=['Cozinha','Banheiro','Lavabo','Outro'];
  if(acList.length&&tiposComAcess.indexOf(amb.tipo)>=0){
    if(!amb.acState)amb.acState={};
    h+='<div class="svblk"><div class="svhd">🔩 Acessórios</div>';
    acList.forEach(function(a,ai){
      var acKey='ac_cat_'+a.id;
      var isOn=!!amb.acState[acKey];
      var prStr=a.pr>0?'R$ '+a.pr.toLocaleString('pt-BR'):'Consultar';
      h+='<div class="svrow'+(isOn?' on':'')+'" data-tog-ac="'+acKey+'" data-amb-ac="'+amb.id+'">';
      h+='<div class="svchk">✓</div>';
      h+='<div class="svlbl">'+a.nm+'<span class="svph">'+prStr+'</span></div></div>';
      if(isOn){
        var qv=amb.acState[acKey]||1;
        h+='<div class="svxtr on"><input type="number" min="1" value="'+qv+'" style="width:60px;" data-upd-ac="'+acKey+'" data-amb-ac2="'+amb.id+'" oninput="updAcAmb('+amb.id+',\''+acKey+'\',+this.value||1)"><span class="svunit">un</span></div>';
      }
    });
    h+='</div>';
  }

  return h;
}

function togSV(k,ambId){
  var amb=ambientes.find(function(a){return a.id==ambId;});
  if(!amb)return;
  if(!amb.svState)amb.svState={};
  var sv=amb.svState;
  var g=SV_DEFS[amb.tipo]||SV_DEFS.Cozinha;
  var it=null;
  g.forEach(function(grp){grp.its.forEach(function(i){if(i.k===k)it=i;});});
  if(!it)return;
  if(sv[k]){
    delete sv[k];
    if(it.u==='cuba')amb.selCuba=null;
  } else {
    sv[k]={ml:0,altCm:6,q:1,qty:1};
    if(it.u==='cuba'){openCubaPickAmb(ambId,it.ctp);return;}
  }
  renderAmbientes();
}

function updSVAmb(ambId,k,prop,val){
  var amb=ambientes.find(function(a){return a.id==ambId;});
  if(!amb||!amb.svState||!amb.svState[k])return;
  amb.svState[k][prop]=val;
}

function togAcAmb(ambId,acKey){
  var amb=ambientes.find(function(a){return a.id==ambId;});
  if(!amb)return;
  if(!amb.acState)amb.acState={};
  if(amb.acState[acKey]){
    delete amb.acState[acKey];
  } else {
    amb.acState[acKey]=1;
  }
  renderAmbientes();
}

function updAcAmb(ambId,acKey,qty){
  var amb=ambientes.find(function(a){return a.id==ambId;});
  if(!amb||!amb.acState)return;
  amb.acState[acKey]=qty;
}

function calcSFAmb(ambId,k){
  var amb=ambientes.find(function(a){return a.id===ambId;});
  if(!amb||!amb.svState||!amb.svState[k])return;
  var sv=amb.svState[k];
  var el=document.getElementById('sfr-'+ambId+'-'+k);if(!el)return;
  var ml=sv.ml||0,altCm=sv.altCm||0,q=sv.q||1;
  if(ml&&altCm){
    var m2=ml*(altCm/100)*q;
    var mat=CFG.stones.find(function(s){return s.id===selMat;});
    var pv=mat?m2*mat.pr:0;
    var mo=ml*q*getPr(k);
    el.innerHTML='<span style="color:var(--grn)">Pedra: '+m2.toFixed(3)+'m² → R$ '+fm(pv)+'</span>  <span style="color:var(--gold2)">M.O.: R$ '+fm(mo)+'</span>';
  } else {el.textContent='';}
}

// Cuba picker per ambiente
var _cubaPickAmbId=null,_cubaPickSvKey2=null;
function openCubaPickAmb(ambId,tipo){
  _cubaPickAmbId=ambId;
  _cubaPickKey=tipo==='coz'?'cuba_coz':'cuba_lav';
  openCubaPick(tipo,tipo==='coz'?'cuba_coz':'cuba_lav');
}

// AI per ambiente
var _aiAmbId=null;
function abrirAIMd(ambId){
  _aiAmbId=ambId;
  var amb=ambientes.find(function(a){return a.id===ambId;});
  document.getElementById('aiDesc').value='';
  document.getElementById('aiStatus').textContent='Ambiente: '+(amb?amb.tipo:'');
  document.getElementById('aiStatus').className='ai-status';
  document.getElementById('aiResultBox').style.display='none';
  document.getElementById('btnAIAplicar').style.display='none';
  showMd('aiMd');
}

// ═══ CALCULAR ═══
function calcular(){
  var cli=document.getElementById('oCliente').value.trim()||'Cliente';
  var tel=document.getElementById('oTel').value.trim()||'';
  var cidade=document.getElementById('oCidade').value.trim()||'';
  var end=document.getElementById('oEnd').value.trim()||'';
  var obs=document.getElementById('oObs').value.trim()||'';
  if(!ambientes.length){toast('Adicione pelo menos um ambiente');return;}
  var missingMat=ambientes.find(function(a){return !a.selMat;});
  if(missingMat){toast('Selecione a pedra de todos os ambientes');renderAmbientes();return;}
  var mat=CFG.stones.find(function(s){return s.id===ambientes[0].selMat;})||CFG.stones[0];

  var totalM2=0,totalAcT=0,totalPedT=0;
  var detHtml='';
  var txtAmbientes='';
  var allAcN=[];
  var allPds=[];

  ambientes.forEach(function(amb,idx){
    var tipo=amb.tipo;
    var sv=amb.svState||{};
    var g=SV_DEFS[tipo]||SV_DEFS.Cozinha;
    var m2=0,acT=0,acL=[],acN=[],sfPcs=[],pds=[];

    // Peças
    amb.pecas.forEach(function(p){
      if(p.w&&p.h){
        var a=(p.w/100)*(p.h/100)*(p.q||1);
        m2+=a;
        pds.push({desc:p.desc||'Peça',w:p.w,h:p.h,q:p.q||1,m2:a});
        allPds.push({desc:(tipo+': '+(p.desc||'Peça')),w:p.w,h:p.h,q:p.q||1,m2:a});
      }
    });

    // Serviços
    g.forEach(function(grp){grp.its.forEach(function(it){
      if(!sv[it.k])return;
      var svd=sv[it.k];
      if(it.u==='sf'){
        var ml=svd.ml||0,altCm=svd.altCm||0,q=svd.q||1;
        if(ml&&altCm){
          var sfM2=ml*(altCm/100)*q;
          var sfMo=ml*q*getPr(it.k);
          m2+=sfM2;acT+=sfMo;
          acL.push({l:it.l+' '+ml+'ml×'+altCm+'cm',v:sfMo});
          acN.push(it.l+' ('+ml+'ml, '+sfM2.toFixed(3)+'m²)');
          sfPcs.push({l:it.l,w:ml,h:altCm,q:q,m2:sfM2,mo:sfMo});
        }
        return;
      }
      if(it.u==='cuba'){
        if(amb.selCuba){acT+=amb.selCuba.total;acL.push({l:'Cuba: '+amb.selCuba.nm.trim(),v:amb.selCuba.total});acN.push('Cuba: '+amb.selCuba.nm.trim());}
        return;
      }
      if(it.u==='livre'){var v=svd.qty||0;if(v>0){acT+=v;acL.push({l:it.l,v:v});acN.push(it.l);}return;}
      if(it.fx===1){var p2=getPr(it.k);if(p2>0){acT+=p2;acL.push({l:it.l,v:p2});acN.push(it.l);}return;}
      var qty=svd.qty||1;
      var vv=getPr(it.k)*qty;acT+=vv;acL.push({l:it.l+(qty>1?' ('+qty+it.u+')':''),v:vv});acN.push(it.l);
    });});

    // Acessórios do catálogo
    var acState=amb.acState||{};
    var acList=CFG.ac||[];
    Object.keys(acState).forEach(function(acKey){
      var qty=acState[acKey]||1;
      var acId=acKey.replace('ac_cat_','');
      var aItem=acList.find(function(x){return x.id===acId;});
      if(!aItem)return;
      var val=aItem.pr>0?aItem.pr*qty:0;
      var label=aItem.nm+(qty>1?' ×'+qty:'');
      if(val>0){acT+=val;acL.push({l:label,v:val});}
      acN.push(label);
    });

    // Borda Piscina: acabamento lateral automático
    if(tipo==='🏊 Borda Piscina'){
      var baTpGlobal=(amb.bordaAcb?amb.bordaAcb.tipo:null)||'polida';
      var baDefGlobal=BP_TIPOS_ACB.find(function(t){return t.k===baTpGlobal;})||BP_TIPOS_ACB[0];
      var bpPcTotal=0;
      var bpPcLines=[];
      var bpNomesPDF=['Borda lateral A','Borda frontal B','Borda lateral C','Borda frontal D','Borda curva E','Canto boleado F','Trecho especial G','Borda interna H'];
      amb.pecas.forEach(function(p,pi){
        var pLd=p.acabLados||0;
        if(!pLd||!p.w)return;
        var pML=_calcBordaPcML(p,pLd);
        if(!pML)return;
        bpPcTotal+=pML;
        var pNome=p.desc&&p.desc.trim()&&p.desc.trim().toLowerCase()!=='peça'?p.desc:(bpNomesPDF[pi]||'Borda trecho '+(pi+1));
        var ldStr=['','1 lateral aparente','2 laterais aparentes','3 lados','todos os lados'][pLd]||'';
        bpPcLines.push(pNome+' — '+ldStr+' ('+pML.toFixed(2)+'m)');
      });
      if(bpPcTotal>0){
        if(baDefGlobal.pr>0){
          var bpVlTotal=bpPcTotal*baDefGlobal.pr;
          acT+=bpVlTotal;
          acL.push({l:'Acabamento '+baDefGlobal.l+' — '+bpPcTotal.toFixed(2)+'m linear',v:bpVlTotal});
        }
        bpPcLines.forEach(function(ln){acN.push(ln);});
        if(!bpPcLines.length)acN.push('Acabamento '+baDefGlobal.l+' — '+bpPcTotal.toFixed(2)+'m linear');
      }
    }

    var ambMat2=CFG.stones.find(function(s){return s.id===amb.selMat;})||mat;
    var pedTamb=m2*ambMat2.pr;
    totalM2+=m2;totalAcT+=acT;totalPedT+=pedTamb;
    allAcN=allAcN.concat(acN);
    var ambLabel=(idx+1)+'º Ambiente — '+tipo;
    detHtml+='<div style="font-size:.62rem;color:var(--gold);font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:8px 0 4px;">'+ambLabel+'</div>';
    if(pds.length){
      pds.forEach(function(p){
        detHtml+='<div class="rrow"><span class="rk">'+p.desc+' '+p.w+'×'+p.h+'cm'+(p.q>1?' ×'+p.q:'')+'</span><span class="rv">'+p.m2.toFixed(3)+'m²</span></div>';
      });
    }
    if(sfPcs.length){sfPcs.forEach(function(p){
      detHtml+='<div class="rrow"><span class="rk">'+p.l+' '+p.w+'ml×'+p.h+'cm'+(p.q>1?' ×'+p.q:'')+'</span><span class="rv">'+p.m2.toFixed(3)+'m²</span></div>';
    });}
    detHtml+='<div class="rrow"><span class="rk">'+ambMat2.nm+' — '+m2.toFixed(3)+'m²</span><span class="rv" style="color:var(--gold2)">R$ '+fm(pedTamb)+'</span></div>';
    acL.forEach(function(a){detHtml+='<div class="rrow"><span class="rk">'+a.l+'</span><span class="rv">R$ '+fm(a.v)+'</span></div>';});
    if(acL.length===0&&m2===0)detHtml+='<div style="font-size:.72rem;color:var(--t4);padding:2px 0;">Nenhuma peça ou serviço neste ambiente</div>';
    // Dados do túmulo no bloco de detalhe
    if(amb.tipo==='Túmulo'&&amb.tumExtra){
      var teD=amb.tumExtra;var tumInfo=[];
      if(teD.falecido)tumInfo.push('Falecido(a): <b>'+escH(teD.falecido)+'</b>');
      if(teD.cemiterio)tumInfo.push('Cemitério: '+escH(teD.cemiterio));
      if(teD.quadra||teD.lote)tumInfo.push('Quadra '+(teD.quadra||'—')+' — Lote '+(teD.lote||'—'));
      if(teD.subtipo)tumInfo.push('Tipo: '+teD.subtipo);
      if(tumInfo.length)detHtml+='<div style="background:rgba(201,168,76,.07);border-radius:8px;padding:7px 10px;margin:4px 0;font-size:.62rem;color:var(--t3);line-height:1.8;">'+tumInfo.join(' · ')+'</div>';
    }

    // Texto WA por ambiente
    var pTxt=pds.map(function(p){return '• '+(p.desc||'Peça')+' — '+p.w+'×'+p.h+'cm'+(p.q>1?' ×'+p.q:'');}).join('\n');
    if(sfPcs.length)pTxt+=(pTxt?'\n':'')+sfPcs.map(function(p){return '• '+p.l+' — '+p.w+'ml×'+p.h+'cm'+(p.q>1?' ×'+p.q:'');}).join('\n');
    var aTxt=acN.length?acN.map(function(a){return '• '+a;}).join('\n'):'';
    txtAmbientes+='\n─── '+ambLabel+' ───\n'+(pTxt||'(sem peças)')+(aTxt?'\nInclusos:\n'+aTxt:'');
  });

  var pedT=totalPedT;
  var bruto=pedT+totalAcT;
  var vista=bruto;
  var parc=vista*1.12;
  var p8=parc/8,ent=vista/2;

  detHtml+='<div style="border-top:1px solid var(--bd);margin:10px 0 6px;"></div>';
  detHtml+='<div class="rrow"><span class="rk">Total m² de pedra</span><span class="rv">'+totalM2.toFixed(3)+'m²</span></div>';
  detHtml+='<div class="rrow"><span class="rk">Parcelado 8×</span><span class="rv" style="color:var(--t3)">R$ '+fm(parc)+' — 8× R$ '+fm(p8)+'</span></div>';
  detHtml+='<div class="rtot"><span class="k">À Vista</span><span class="v">R$ '+fm(vista)+'</span></div>';
  document.getElementById('resDetail').innerHTML=detHtml;

  // PAINEL INTERNO
  var pi='';
  var dtHP=new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
  pi+='<div style="background:linear-gradient(135deg,#0d0d18,#12100a);padding:14px 16px;border-bottom:1px solid var(--bd);">';
  pi+='<div style="font-size:.58rem;letter-spacing:2px;text-transform:uppercase;color:var(--gold3);font-weight:700;">Resumo do Orçamento</div>';
  pi+='<div style="font-family:Cormorant Garamond,serif;font-size:1.4rem;color:var(--gold2);font-weight:700;margin-top:2px;">'+escH(cli)+'</div>';
  pi+='<div style="font-size:.72rem;color:var(--t3);margin-top:2px;">'+dtHP+'</div></div>';
  pi+='<div style="padding:12px 16px;border-bottom:1px solid var(--bd);">';
  pi+='<div style="font-size:.55rem;letter-spacing:2px;text-transform:uppercase;color:var(--t4);margin-bottom:6px;">Material</div>';
  pi+='<div style="display:flex;justify-content:space-between;">';
  pi+='<b style="font-size:.85rem;color:var(--tx);">'+mat.nm+' — '+mat.fin+'</b>';
  pi+='<b style="color:var(--gold2);">R$ '+fm(mat.pr)+'/m²</b></div>';
  pi+='<div style="font-size:.72rem;color:var(--t3);margin-top:3px;">Área: '+fm(totalM2)+' m² → Pedra: R$ '+fm(pedT)+'</div></div>';
  var acbNmP={borda_reta:'Borda Reta',borda_45:'Borda 45°',borda_boleada:'Borda Boleada',borda_chf:'Borda Chanfrada',cant:'Cantoneira',rodape:'Rodapé'};
  ambientes.forEach(function(ambP){
    var gP=SV_DEFS[ambP.tipo]||SV_DEFS.Cozinha;
    var svP=ambP.svState||{};
    var rowsP='';
    gP.forEach(function(grpP){grpP.its.forEach(function(itP){
      if(!svP[itP.k])return;
      var sdP=svP[itP.k];
      var mlP=sdP.ml||sdP.w||0,hP=sdP.altCm||sdP.h||0,qP=sdP.q||1;
      var vP=0,dP=itP.l;
      if(itP.u==='sf'){vP=mlP*qP*getPr(itP.k);dP+=' '+mlP+'ml×'+hP+'cm'+(qP>1?' ×'+qP:'');}
      else if(itP.u==='sf_slim'||itP.u==='ml_only'){vP=mlP*qP*getPr(itP.k);dP+=' '+mlP+'ml (só MO)';}
      else if(itP.u==='cuba'){if(ambP.selCuba){vP=ambP.selCuba.total;dP+=': '+ambP.selCuba.nm.trim();}}
      else if(!itP.fx){vP=(sdP.w||0)*getPr(itP.k);if(sdP.w)dP+=' '+sdP.w+(itP.u==='un'?'un':'ml');}
      else{vP=getPr(itP.k);}
      if(vP>0){rowsP+='<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #0d0d10;"><span style="font-size:.75rem;color:var(--t2);">'+dP+'</span><span style="font-size:.75rem;color:var(--gold2);font-weight:600;">R$ '+fm(vP)+'</span></div>';}
    });});
    ambP.pecas.forEach(function(pP){
      if(!pP.acb)return;
      Object.keys(pP.acb).forEach(function(akP){
        var mlA=pP.acb[akP].ml||0;if(!mlA)return;
        var vA=mlA*getPr(akP);
        rowsP+='<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #0d0d10;"><span style="font-size:.75rem;color:var(--t2);">'+(acbNmP[akP]||akP)+' '+mlA+'ml ('+escH(pP.desc||'')+')</span><span style="font-size:.75rem;color:var(--gold2);font-weight:600;">R$ '+fm(vA)+'</span></div>';
      });
    });
    if(rowsP){
      pi+='<div style="padding:10px 16px;border-bottom:1px solid var(--bd);">';
      pi+='<div style="font-size:.6rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold3);opacity:.7;margin-bottom:6px;">'+ambP.tipo+'</div>'+rowsP+'</div>';
    }
  });
  pi+='<div style="padding:14px 16px;background:var(--s2);">';
  pi+='<div style="display:flex;justify-content:space-between;margin-bottom:7px;"><span style="font-size:.72rem;color:var(--t3);">Custo Pedra</span><b style="color:var(--grn);">R$ '+fm(pedT)+'</b></div>';
  pi+='<div style="display:flex;justify-content:space-between;margin-bottom:7px;"><span style="font-size:.72rem;color:var(--t3);">Mão de Obra</span><b style="color:var(--gold2);">R$ '+fm(totalAcT)+'</b></div>';
  pi+='<div style="border-top:1px solid var(--bd);padding-top:8px;margin-bottom:7px;display:flex;justify-content:space-between;"><span style="font-size:.78rem;font-weight:700;">Total Custo</span><b style="font-family:Cormorant Garamond,serif;font-size:1.1rem;">R$ '+fm(pedT+totalAcT)+'</b></div>';
  pi+='<div style="border-top:2px solid rgba(201,168,76,.3);padding-top:10px;display:flex;justify-content:space-between;align-items:baseline;"><span style="font-size:.72rem;color:var(--gold3);">Valor à Vista (cliente)</span><b style="font-family:Cormorant Garamond,serif;font-size:1.4rem;color:var(--gold2);">R$ '+fm(vista)+'</b></div>';
  pi+='<div style="display:flex;justify-content:space-between;margin-top:6px;"><span style="font-size:.72rem;color:var(--t4);">Margem estimada</span><b style="color:var(--grn);">R$ '+fm(vista-(pedT+totalAcT))+'</b></div></div>';
  var piEl=document.getElementById('painelInterno');if(piEl)piEl.innerHTML=pi;

  var txt='HR MARMORES E GRANITOS\nORCAMENTO — '+cli+'\n\nMaterial: '+mat.nm+' ('+mat.fin+')\n'+txtAmbientes+'\n\n• Fabricacao e acabamento completo\n\n==================\nPARCELADO\nR$ '+fm(parc)+' — ate 8x de R$ '+fm(p8)+'\n\nA VISTA\nR$ '+fm(vista)+'\n\nEntrada 50%: R$ '+fm(ent)+'\nEntrega 50%: R$ '+fm(ent)+'\n==================\n'+CFG.emp.nome+'\n'+CFG.emp.tel;
  if(cidade)txt+='\n'+cidade;
  document.getElementById('quoteBox').textContent=txt;
  document.getElementById('resArea').style.display='block';
  document.getElementById('resArea').scrollIntoView({behavior:'smooth',block:'start'});

  // Salvar snapshot dos ambientes para poder recarregar depois
  var ambSnap=ambientes.map(function(a){
    return {tipo:a.tipo,pecas:JSON.parse(JSON.stringify(a.pecas)),selCuba:a.selCuba,svState:JSON.parse(JSON.stringify(a.svState||{})),acState:JSON.parse(JSON.stringify(a.acState||{}))};
  });
  var q={id:Date.now(),date:td(),cli:cli,tel:tel,cidade:cidade,end:end,obs:obs,tipo:ambientes.map(function(a){return a.tipo;}).join('+'),mat:mat.nm,matPr:mat.pr,m2:totalM2,pedT:pedT,acT:totalAcT,acN:allAcN,pds:allPds,sfPcs:[],vista:vista,parc:parc,p8:p8,ent:ent,ambSnap:ambSnap};
  DB.q.unshift(q);DB.sv();pendQ=q;
}
function selectQuote(){
  var el=document.getElementById('quoteBox');
  if(!el)return;
  var range=document.createRange();
  range.selectNodeContents(el);
  var sel=window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}
function copiar(){
  var t=document.getElementById('quoteBox').textContent;
  // Strategy 1: modern clipboard API
  if(navigator.clipboard&&window.isSecureContext){
    navigator.clipboard.writeText(t).then(function(){toast('✓ Copiado!');}).catch(function(){_copiarFallback(t);});
    return;
  }
  _copiarFallback(t);
}
function _copiarFallback(t){
  // Strategy 2: execCommand on hidden textarea
  var ta=document.createElement('textarea');
  ta.value=t;
  ta.setAttribute('readonly','');
  ta.style.cssText='position:fixed;top:-9999px;left:-9999px;font-size:12px;';
  document.body.appendChild(ta);
  var isIOS=/ipad|iphone/i.test(navigator.userAgent);
  var copied=false;
  if(isIOS){
    var range=document.createRange();
    range.selectNodeContents(ta);
    var sel=window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    ta.setSelectionRange(0,999999);
  } else {
    ta.focus();
    ta.select();
  }
  try{
    copied=document.execCommand('copy');
  }catch(e){}
  document.body.removeChild(ta);
  if(copied){toast('✓ Copiado!');return;}
  // Strategy 3: show modal with selectable text
  _copiarModal(t);
}
function _copiarModal(t){
  var ov=document.createElement('div');
  ov.id='copyOv';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.94);z-index:9999;display:flex;align-items:flex-end;justify-content:center;';
  ov.innerHTML='<div style="background:#141418;border-radius:18px 18px 0 0;width:100%;max-width:480px;padding:16px 16px 32px;border-top:1px solid #28282f;">'
    +'<div style="font-size:.85rem;font-weight:700;color:#C9A84C;margin-bottom:10px;">Selecione e copie o texto</div>'
    +'<textarea id="copyTa" rows="10" readonly style="width:100%;background:#0e0e12;border:1px solid #28282f;border-radius:10px;color:#F4EFE8;padding:11px 12px;font-size:.76rem;font-family:Outfit,sans-serif;resize:none;outline:none;-webkit-user-select:text;user-select:text;">'+t+'</textarea>'
    +'<div style="font-size:.68rem;color:#7a7570;margin:8px 0 12px;">Toque na caixa acima → Selecionar tudo → Copiar</div>'
    +'<button onclick="document.getElementById(\'copyOv\').remove();" style="width:100%;padding:12px;background:#22222a;border:1px solid #28282f;color:#bfb9b0;border-radius:11px;font-size:.84rem;font-weight:600;cursor:pointer;font-family:Outfit,sans-serif;">Fechar</button>'
    +'</div>';
  document.body.appendChild(ov);
  // Auto-select the textarea
  setTimeout(function(){
    var ta=document.getElementById('copyTa');
    if(ta){ta.focus();ta.select();ta.setSelectionRange(0,ta.value.length);}
  },150);
}


function gerarPDF(){
  if(!pendQ){toast('Calcule um orçamento primeiro');return;}
  // Load PDF libs on-demand if not already loaded
  if(typeof html2canvas==='undefined'||typeof window.jspdf==='undefined'){
    toast('Carregando bibliotecas PDF...');
    var s1=document.createElement('script');
    s1.src='https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    s1.onload=function(){
      var s2=document.createElement('script');
      s2.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s2.onload=function(){gerarPDF();};
      document.head.appendChild(s2);
    };
    document.head.appendChild(s1);
    return;
  }
  if(!pendQ){toast('Calcule um orçamento primeiro');return;}
  var q=pendQ;
  var emp=CFG.emp;

  // ── Numeração sequencial a partir de 0 ──
  var pdfCount=parseInt(localStorage.getItem('hr_pdf_count')||'0',10);
  var orcNum='ORC-'+String(pdfCount).padStart(4,'0');
  localStorage.setItem('hr_pdf_count', pdfCount+1);

  var fileName='Orcamento_'+orcNum+'_'+q.cli.replace(/[^a-zA-Z0-9]/g,'_')+'.pdf';
  var economia=q.parc-q.vista;
  var mat=CFG.stones.find(function(s){return s.nm===q.mat;})||{pr:q.matPr||0,nm:q.mat||'',fin:''};

  // ── Linhas da tabela ──
  // Montar linhas da tabela por ambiente
  var allRowsHtml='';
  if(q.ambSnap&&q.ambSnap.length){
    q.ambSnap.forEach(function(snap,idx){
      var tipo=snap.tipo||'Ambiente';
      if(q.ambSnap.length>1){
        allRowsHtml+='<tr><td colspan="2" style="background:#f0ece3;padding:8px 14px;font-size:8px;'
          +'letter-spacing:2px;text-transform:uppercase;color:#8a6020;font-weight:900;'
          +'border-bottom:1px solid #e0d8c8;">'+(idx+1)+'º AMBIENTE — '+tipo.toUpperCase()+'</td></tr>';
      }
      var isBP=snap.tipo==='🏊 Borda Piscina';
      var bpNomes=['Borda lateral A','Borda frontal B','Borda lateral C','Borda frontal D','Borda curva E','Canto boleado F','Trecho especial G','Borda interna H'];
      (snap.pecas||[]).forEach(function(p,i){
        if(!p.w||!p.h)return;
        var bg=i%2===0?'#fff':'#faf6ef';
        var pNome;
        if(isBP){
          var descFilled=p.desc&&p.desc.trim()&&p.desc.trim().toLowerCase()!=='peça';
          pNome=descFilled?p.desc:(bpNomes[i]||'Borda trecho '+(i+1));
        } else { pNome=p.desc||'Peça'; }
        var bpAcabLdsPDF=isBP?(p.acabLados||0):0;
        var bpLdLabelsPDF=['','1 lateral aparente','2 laterais aparentes','3 lados','todos os lados'];
        var bpAcabDescPDF=isBP&&bpAcabLdsPDF>0?bpSnapFirst&&bpSnapFirst.bordaAcb?'Acabamento '+bpAcabTipoPDF+' — '+bpLdLabelsPDF[bpAcabLdsPDF]:'':'';
        var bpAcabMLPDF=isBP&&bpAcabLdsPDF>0&&p.w?_calcBordaPcML(p,bpAcabLdsPDF):0;
        allRowsHtml+='<tr>'          +'<td style="padding:8px 14px 4px;background:'+bg+';border-bottom:'+(isBP&&bpAcabLdsPDF>0?'none':'1px solid #ede8dc')+';font-size:12px;font-weight:600;color:#1a1a1a;">'+pNome+'</td>'          +'<td style="padding:8px 14px 4px;background:'+bg+';border-bottom:'+(isBP&&bpAcabLdsPDF>0?'none':'1px solid #ede8dc')+';font-size:11.5px;color:#888;text-align:right;">'+p.w+' × '+p.h+' cm'+(p.q>1?' <b style=\"color:#7a4400;\">×'+p.q+'</b>':'')+'</td>'          +'</tr>';
        if(isBP&&bpAcabLdsPDF>0){
          allRowsHtml+='<tr>'            +'<td style="padding:3px 14px 9px;background:'+bg+';border-bottom:1px solid #ede8dc;font-size:10.5px;color:#6688bb;font-style:italic;">'+bpAcabDescPDF+(bpAcabMLPDF>0?' · <b>'+bpAcabMLPDF.toFixed(2)+'m</b>':'')+'</td>'            +'<td style="padding:3px 14px 9px;background:'+bg+';border-bottom:1px solid #ede8dc;font-size:10px;color:#9bb;text-align:right;">'+bpAcabMLPDF.toFixed(2)+'m linear</td>'            +'</tr>';
        }
      });
      if(isBP){
        var bpML=(snap.pecas||[]).reduce(function(a,p){return a+(p.w?(p.w/100)*(p.q||1):0);},0);
        var bpLarg=snap.pecas&&snap.pecas.length>0?snap.pecas[0].h:0;
        var bpBA=snap.bordaAcb||{};
        var bpAcabStr=bpBA.tipo&&bpBA.tipo!=='polida'?' · acabamento '+bpBA.tipo:'';
        allRowsHtml+='<tr><td colspan="2" style="background:linear-gradient(90deg,#e8f0ff,#f0f6ff);padding:10px 14px;border-bottom:2px solid #6ea4ff;border-top:1px solid #c8d8f8;">'          +'<span style="font-size:8.5px;letter-spacing:2px;text-transform:uppercase;color:#2255aa;font-weight:900;">📏 METRAGEM LINEAR</span>'          +'&nbsp;&nbsp;<span style="font-size:15px;font-weight:900;color:#1a3a7a;">'+bpML.toFixed(2)+'m</span>'          +'<span style="font-size:11px;color:#446;font-weight:600;"> de borda'+(bpLarg?' '+bpLarg+'cm':'')+bpAcabStr+'</span>'          +'</td></tr>';
      }
      // Saihas/frontões do svState
      var g=SV_DEFS[tipo]||SV_DEFS.Cozinha;
      var sv=snap.svState||{};
      g.forEach(function(grp){grp.its.forEach(function(it){
        if(!sv[it.k]||it.u!=='sf')return;
        var svd=sv[it.k];
        var ml=svd.ml||0,alt=svd.altCm||0,qq=svd.q||1;
        if(!ml||!alt)return;
        allRowsHtml+='<tr>'
          +'<td style="padding:10px 14px;background:#f5f9ff;border-bottom:1px solid #e0e8f0;font-size:12px;font-weight:600;color:#446;">'+it.l+'</td>'
          +'<td style="padding:10px 14px;background:#f5f9ff;border-bottom:1px solid #e0e8f0;font-size:11.5px;color:#888;text-align:right;">'+ml+'ml × '+alt+'cm'+(qq>1?' <b style=\"color:#7a4400;\">×'+qq+'</b>':'')+'</td>'
          +'</tr>';
      });});
    });
  } else {
    (q.pds||[]).forEach(function(p,i){
      var bg=i%2===0?'#fff':'#faf6ef';
      allRowsHtml+='<tr>'
        +'<td style="padding:10px 14px;background:'+bg+';border-bottom:1px solid #ede8dc;font-size:12px;font-weight:600;color:#1a1a1a;">'+(p.desc||'Peça')+'</td>'
        +'<td style="padding:10px 14px;background:'+bg+';border-bottom:1px solid #ede8dc;font-size:11.5px;color:#888;text-align:right;letter-spacing:0.3px;">'+p.w+' × '+p.h+' cm'+(p.q>1?' ×'+p.q:'')+'</td>'
        +'</tr>';
    });
  }

  // Serviços
  var svcsHtml=(q.acN&&q.acN.length?q.acN:[]).concat(['Fabricação e acabamento completo']).map(function(a){
    return '<div style="display:flex;gap:8px;padding:5px 0;border-bottom:1px solid #f5f0e8;">'
      +'<span style="color:#C9A84C;font-weight:900;font-size:11px;flex-shrink:0;">✓</span>'
      +'<span style="font-size:11.5px;color:#333;line-height:1.4;">'+a+'</span>'
      +'</div>';
  }).join('');


  var svcs=(q.acN&&q.acN.length)?q.acN.map(function(a){
    var svcTxt=polishSvcPDF(a);
    return '<div style="display:flex;align-items:flex-start;gap:8px;padding:5px 0;border-bottom:1px solid #f5f0e8;">'
      +'<span style="color:#C9A84C;font-weight:900;font-size:11px;margin-top:1px;flex-shrink:0;">&#10003;</span>'
      +'<span style="font-size:12px;color:#333;line-height:1.4;">'+svcTxt+'</span>'
      +'</div>';
  }).join(''):'';

  var clienteInfo='';
  if(q.tel)clienteInfo+='<div style="display:flex;align-items:center;gap:6px;font-size:11.5px;color:#555;"><span style="color:#C9A84C;">&#128241;</span>'+q.tel+'</div>';
  if(q.cidade)clienteInfo+='<div style="display:flex;align-items:center;gap:6px;font-size:11.5px;color:#555;"><span style="color:#C9A84C;">&#128205;</span>'+q.cidade+'</div>';
  if(q.end)clienteInfo+='<div style="display:flex;align-items:center;gap:6px;font-size:11.5px;color:#555;"><span style="color:#C9A84C;">&#127968;</span>'+q.end+'</div>';
  var obsBox=q.obs?'<div style="background:#fffbf0;border-left:4px solid #C9A84C;padding:10px 14px;margin-bottom:18px;font-size:11.5px;color:#555;border-radius:0 8px 8px 0;line-height:1.65;"><strong style="color:#7a4e00;">Observacoes:</strong> '+q.obs+'</div>':'';

  // sec header helper
  function sh(t){return '<div style="display:flex;align-items:center;gap:10px;margin:0 0 12px;"><span style="font-size:7.5px;letter-spacing:3px;text-transform:uppercase;color:#C9A84C;font-weight:900;">'+t+'</span><div style="flex:1;height:1px;background:linear-gradient(90deg,rgba(201,168,76,0.4),transparent);"></div></div>';}
  var hasBP=q.ambSnap&&q.ambSnap.some(function(s){return s.tipo==='🏊 Borda Piscina';});
  var bpSnapFirst=hasBP&&q.ambSnap?q.ambSnap.find(function(s){return s.tipo==='🏊 Borda Piscina';}):null;
  var bpAcabTipoPDF=bpSnapFirst&&bpSnapFirst.bordaAcb?bpSnapFirst.bordaAcb.tipo:'polida';
  function polishSvcPDF(txt){
    if(!hasBP)return txt;
    var map={
      'Acab. Boleada 1 lateral':'Acabamento boleado na lateral aparente',
      'Acab. Boleada 2 laterais':'Acabamento boleado nas laterais aparentes',
      'Acab. Escovada 1 lateral':'Acabamento escovado na lateral aparente',
      'Acab. Escovada 2 laterais':'Acabamento escovado nas laterais aparentes',
      'Acab. Flameada 1 lateral':'Acabamento flameado na lateral',
      'Acab. Flameada 2 laterais':'Acabamento flameado nas laterais',
      'Acab. Antiderrapante 1 lateral':'Acabamento antiderrapante na lateral',
      'Acab. Antiderrapante 2 laterais':'Acabamento antiderrapante nas laterais',
      'Acab. polida':'Acabamento polido — incluído no material',
      'Cantos Arredondados':'Cantos arredondados com polimento especial',
      'Curvas Especiais':'Curvas especiais com recorte e acabamento',
      'Borda Infinita':'Borda infinita com nivelamento especial'
    };
    for(var k in map){if(txt.indexOf(k)===0)return map[k];}
    return txt;
  }
  var matNomePDF=q.mat;
  if(hasBP&&bpAcabTipoPDF&&bpAcabTipoPDF!=='polida'){
    var tipoCap=bpAcabTipoPDF.charAt(0).toUpperCase()+bpAcabTipoPDF.slice(1);
    matNomePDF=q.mat+' '+tipoCap;
    if(bpAcabTipoPDF==='antiderap'||bpAcabTipoPDF==='boleada')matNomePDF+=' Premium';
  }

  var recHtml=''
  // ── WRAPPER
  +'<div id="pdfReceipt" style="width:700px;font-family:Arial,Helvetica,sans-serif;background:#fff;color:#1a1a1a;">'

  // ── TOP STRIPE
  +'<div style="height:6px;background:linear-gradient(90deg,#5a3a06 0%,#C9A84C 35%,#E8C96A 50%,#C9A84C 65%,#5a3a06 100%);"></div>'

  // ── HEADER
  +'<div style="background:#0f0c00;padding:28px 38px 22px;display:flex;justify-content:space-between;align-items:flex-start;gap:20px;">'
    // brand left
    +'<div style="display:flex;flex-direction:column;gap:6px;">'
      +'<div style="font-size:26px;font-weight:900;color:#C9A84C;letter-spacing:-0.5px;line-height:1;">'+emp.nome+'</div>'
      +'<div style="font-size:8.5px;letter-spacing:3.5px;text-transform:uppercase;color:rgba(201,168,76,0.45);">Marmore &middot; Granito &middot; Quartzito</div>'
      +'<div style="font-size:10px;color:rgba(255,255,255,0.22);font-style:italic;margin-top:2px;">Qualidade, Precisao e Acabamento Profissional</div>'
    +'</div>'
    // info right
    +'<div style="text-align:right;display:flex;flex-direction:column;gap:3px;">'
      +'<div style="font-size:10.5px;color:rgba(201,168,76,0.9);font-weight:700;">'+emp.end+'</div>'
      +'<div style="font-size:10px;color:rgba(255,255,255,0.4);">'+emp.cidade+'</div>'
      +'<div style="font-size:11px;color:rgba(201,168,76,0.9);font-weight:700;margin-top:3px;">'+emp.tel+'</div>'
      +'<div style="font-size:10px;color:rgba(255,255,255,0.4);">'+emp.ig+'</div>'
      +'<div style="font-size:8.5px;color:rgba(255,255,255,0.18);margin-top:3px;">CNPJ: '+emp.cnpj+'</div>'
    +'</div>'
  +'</div>'

  // ── BADGE BAR
  +'<div style="background:#f7f2e8;border-bottom:3px solid #C9A84C;padding:11px 38px;display:flex;justify-content:space-between;align-items:center;">'
    +'<div style="display:flex;align-items:center;gap:12px;">'
      +'<div style="background:#0f0c00;color:#C9A84C;font-size:8px;font-weight:900;padding:6px 16px;border-radius:30px;letter-spacing:3px;text-transform:uppercase;border:1px solid rgba(201,168,76,0.5);">+ ORCAMENTO +</div>'
      +'<div style="background:#C9A84C;color:#000;font-size:9px;font-weight:900;padding:4px 10px;border-radius:5px;letter-spacing:1px;">'+orcNum+'</div>'
    +'</div>'
    +'<div style="text-align:right;">'
      +'<div style="font-size:10px;color:#888;"><strong style="color:#5a3800;">EMISSAO:</strong> '+fd(q.date)+'</div>'
      +'<div style="font-size:9.5px;color:#aaa;">Validade: 7 dias</div>'
    +'</div>'
  +'</div>'

  // ── BODY
  +'<div style="padding:24px 38px 20px;">'

    // CLIENTE
    +sh('Cliente')
    +'<div style="display:flex;gap:12px;margin-bottom:20px;align-items:stretch;">'
      +'<div style="flex:1;background:#fdfaf3;border:1px solid #e8dfc4;border-radius:10px;padding:15px 18px;">'
        +'<div style="font-size:7.5px;letter-spacing:2.5px;text-transform:uppercase;color:#c0a860;margin-bottom:5px;font-weight:900;">NOME DO CLIENTE</div>'
        +'<div style="font-size:21px;font-weight:900;color:#1a1a1a;line-height:1;margin-bottom:8px;">'+q.cli+'</div>'
        +(clienteInfo?'<div style="display:flex;flex-wrap:wrap;gap:6px 16px;">'+clienteInfo+'</div>':'')
      +'</div>'
      +'<div style="background:#0f0c00;border:1px solid rgba(201,168,76,0.45);border-radius:10px;padding:14px 18px;text-align:center;display:flex;flex-direction:column;justify-content:center;min-width:110px;">'
        +'<div style="font-size:7px;letter-spacing:2px;text-transform:uppercase;color:rgba(201,168,76,0.5);margin-bottom:6px;font-weight:900;">PROJETO</div>'
        +'<div style="font-size:16px;font-weight:900;color:#C9A84C;line-height:1.2;">'+q.tipo+'</div>'
      +'</div>'
    +'</div>'
    +obsBox

    // BANNER COMERCIAL – Borda Piscina
    +(hasBP?'<div style="background:linear-gradient(135deg,#e8f0ff 0%,#f0f5ff 100%);border-left:4px solid #6ea4ff;border-radius:0 10px 10px 0;padding:13px 18px;margin-bottom:18px;">'      +'<div style="font-size:7.5px;letter-spacing:2.5px;text-transform:uppercase;color:#2255aa;font-weight:900;margin-bottom:5px;">🏊 BORDA DE PISCINA — Projeto Especializado</div>'      +'<div style="font-size:12.5px;color:#1a2a5a;font-weight:700;line-height:1.55;">Projeto fabricado sob medida com acabamento especializado para área molhada e externa.</div>'      +(bpAcabTipoPDF&&bpAcabTipoPDF!=='polida'?'<div style="margin-top:8px;display:inline-flex;align-items:center;gap:6px;background:#2255aa;color:#fff;font-size:9px;font-weight:900;padding:3px 12px;border-radius:20px;letter-spacing:1px;">★ ACABAMENTO '+bpAcabTipoPDF.toUpperCase()+' PREMIUM</div>':'')      +'</div>':'')

    // MATERIAL E MEDIDAS
    +sh('Peças e Dimensões')
    +'<div style="border:1px solid #e8e0d0;border-radius:10px;overflow:hidden;margin-bottom:20px;">'
      +'<table style="width:100%;border-collapse:collapse;">'
        +'<thead>'
          +'<tr style="background:#0f0c00;">'
            +'<th style="padding:10px 14px;text-align:left;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#C9A84C;font-weight:900;">PEÇA / DESCRIÇÃO</th>'
            +'<th style="padding:10px 14px;text-align:right;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#C9A84C;font-weight:900;">DIMENSÕES</th>'
          +'</tr>'
        +'</thead>'
        +'<tbody>'
          +allRowsHtml
        +'</tbody>'
      +'</table>'
    +'</div>'

    // MATERIAL DESTAQUE
    +sh('Material Selecionado')
    +'<div style="border:2px solid #C9A84C;border-radius:12px;overflow:hidden;margin-bottom:20px;box-shadow:0 4px 20px rgba(201,168,76,0.15);">'
      // Faixa textura da pedra
      +'<div class="'+(mat.photo?'':mat.tx)+'" style="height:110px;width:100%;position:relative;overflow:hidden;'+(mat.photo?'background-image:url(\''+mat.photo+'\');background-size:cover;background-position:center;':'')+'\">'
        +'<div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,0.78) 0%,rgba(0,0,0,0.45) 50%,rgba(0,0,0,0.12) 100%);">'
          +'<div style="position:absolute;left:20px;top:50%;transform:translateY(-50%);">'
            +'<div style="font-size:7px;letter-spacing:3px;text-transform:uppercase;color:rgba(201,168,76,0.8);font-weight:900;margin-bottom:6px;">MATERIAL SELECIONADO</div>'
            +'<div style="font-size:26px;font-weight:900;color:#C9A84C;line-height:1;letter-spacing:-0.3px;">'+matNomePDF+'</div>'
            +'<div style="font-size:10px;color:rgba(255,255,255,0.5);margin-top:5px;letter-spacing:1px;">'+(mat.cat||'')+(mat.cat&&mat.fin?' · ':'')+( mat.fin||'')+'</div>'
          +'</div>'
          +'<div style="position:absolute;right:20px;top:50%;transform:translateY(-50%);text-align:right;">'
            +'<div style="font-size:7px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.45);font-weight:900;margin-bottom:4px;">TOTAL DE PEDRA</div>'
            +'<div style="font-size:26px;font-weight:900;color:#fff;line-height:1;">'+q.m2.toFixed(3)+' m&sup2;</div>'
          +'</div>'
        +'</div>'
      +'</div>'
      // Info card abaixo da textura
      +'<div style="background:#fdfaf3;padding:14px 20px;display:flex;gap:0;border-top:2px solid #C9A84C;">'
        +'<div style="flex:1;padding-right:16px;border-right:1px solid #e8dfc4;">'
          +'<div style="font-size:7px;letter-spacing:2.5px;text-transform:uppercase;color:#c0a860;font-weight:900;margin-bottom:4px;">Categoria</div>'
          +'<div style="font-size:13px;font-weight:700;color:#2a1a00;">'+(mat.cat||'Granito')+'</div>'
        +'</div>'
        +'<div style="flex:1;padding-left:16px;padding-right:16px;border-right:1px solid #e8dfc4;">'
          +'<div style="font-size:7px;letter-spacing:2.5px;text-transform:uppercase;color:#c0a860;font-weight:900;margin-bottom:4px;">Acabamento</div>'
          +'<div style="font-size:13px;font-weight:700;color:#2a1a00;">'+(mat.fin||'Polida')+'</div>'
        +'</div>'
        +'<div style="flex:2;padding-left:16px;">'
          +'<div style="font-size:7px;letter-spacing:2.5px;text-transform:uppercase;color:#c0a860;font-weight:900;margin-bottom:4px;">Características</div>'
          +'<div style="font-size:10.5px;color:#555;line-height:1.5;">'+(mat.desc?mat.desc.substring(0,120)+(mat.desc.length>120?'…':''):'Material de alta qualidade para sua obra.')+'</div>'
        +'</div>'
      +'</div>'
    +'</div>'

    // INCLUSO
    +(svcs?sh('Incluso no Projeto')
    +'<div style="background:#fdfaf3;border:1px solid #e8dfc4;border-radius:10px;padding:14px 18px;margin-bottom:20px;">'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 16px;">'
        +svcs
        +'<div style="display:flex;align-items:flex-start;gap:8px;padding:5px 0;border-bottom:1px solid #f5f0e8;">'
          +'<span style="color:#C9A84C;font-weight:900;font-size:11px;margin-top:1px;flex-shrink:0;">&#10003;</span>'
          +'<span style="font-size:12px;color:#333;line-height:1.4;">Fabricacao e acabamento completo</span>'
        +'</div>'
      +'</div>'
    +'</div>':'')

    // VALORES
    +sh('Valores do Projeto')
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px;">'
      // parcelado
      +'<div style="border:1px solid #ddd5c5;border-radius:10px;overflow:hidden;">'
        +'<div style="background:#f0ece3;padding:10px 16px;font-size:7.5px;letter-spacing:2px;text-transform:uppercase;color:#999;font-weight:900;">PARCELADO</div>'
        +'<div style="padding:14px 16px;background:#faf8f4;">'
          +'<div style="font-size:22px;font-weight:900;color:#aaa;line-height:1;margin-bottom:4px;">R$ '+fm(q.parc)+'</div>'
          +'<div style="font-size:11px;color:#bbb;">ate 8x de R$ '+fm(q.p8)+'</div>'
        +'</div>'
      +'</div>'
      // a vista — destaque
      +'<div style="border:2px solid #C9A84C;border-radius:10px;overflow:hidden;box-shadow:0 3px 16px rgba(201,168,76,0.2);">'
        +'<div style="background:#0f0c00;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;">'
          +'<span style="font-size:7.5px;letter-spacing:2px;text-transform:uppercase;color:#C9A84C;font-weight:900;">A VISTA</span>'
          +'<span style="background:#C9A84C;color:#000;font-size:8px;font-weight:900;padding:2px 8px;border-radius:20px;">MELHOR OPCAO</span>'
        +'</div>'
        +'<div style="padding:14px 16px;background:#fff;">'
          +'<div style="font-size:28px;font-weight:900;color:#7a4400;line-height:1;margin-bottom:4px;">R$ '+fm(q.vista)+'</div>'
          +'<div style="font-size:11px;color:#a06020;font-weight:700;margin-bottom:6px;">Valor final sem juros</div>'
          +'<div style="display:inline-flex;align-items:center;gap:5px;background:#edf7ed;border:1px solid #7ac47a;color:#1e6b1e;font-size:9px;font-weight:900;padding:3px 10px;border-radius:20px;">&#9660; Economia de R$ '+fm(economia)+'</div>'
        +'</div>'
      +'</div>'
    +'</div>'

    // CONDIÇÃO DE PAGAMENTO
    +sh('Condicao de Pagamento')
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:6px;">'
      +'<div style="background:#fdfaf3;border:1px solid #e8dfc4;border-radius:10px;padding:15px 18px;">'
        +'<div style="font-size:7.5px;letter-spacing:2px;text-transform:uppercase;color:#c0a860;margin-bottom:5px;font-weight:900;">ENTRADA &mdash; 50%</div>'
        +'<div style="font-size:22px;font-weight:900;color:#7a4400;line-height:1;margin-bottom:4px;">R$ '+fm(q.ent)+'</div>'
        +'<div style="font-size:11px;color:#999;">Na assinatura / medicao</div>'
      +'</div>'
      +'<div style="background:#fdfaf3;border:1px solid #e8dfc4;border-radius:10px;padding:15px 18px;">'
        +'<div style="font-size:7.5px;letter-spacing:2px;text-transform:uppercase;color:#c0a860;margin-bottom:5px;font-weight:900;">NA ENTREGA &mdash; 50%</div>'
        +'<div style="font-size:22px;font-weight:900;color:#7a4400;line-height:1;margin-bottom:4px;">R$ '+fm(q.ent)+'</div>'
        +'<div style="font-size:11px;color:#999;">Na entrega / instalacao</div>'
      +'</div>'
    +'</div>'

  +'</div>'

  // ── FOOTER
  +'<div style="background:#0f0c00;padding:18px 38px;display:flex;justify-content:space-between;align-items:center;gap:16px;margin-top:4px;">'
    +'<div>'
      +'<div style="font-size:14px;font-weight:900;color:#C9A84C;line-height:1;margin-bottom:4px;">'+emp.nome+'</div>'
      +'<div style="font-size:9.5px;color:rgba(201,168,76,0.4);">'+emp.end+' &mdash; '+emp.cidade+'</div>'
    +'</div>'
    +'<div style="text-align:right;line-height:1.9;">'
      +'<div style="font-size:10.5px;color:rgba(201,168,76,0.85);font-weight:700;">'+emp.tel+'</div>'
      +'<div style="font-size:9.5px;color:rgba(201,168,76,0.4);">'+emp.ig+'</div>'
      +'<div style="font-size:9px;color:rgba(255,255,255,0.15);">CNPJ: '+emp.cnpj+'</div>'
    +'</div>'
  +'</div>'
  +'<div style="height:5px;background:linear-gradient(90deg,#5a3a06 0%,#C9A84C 35%,#E8C96A 50%,#C9A84C 65%,#5a3a06 100%);"></div>'
  +'</div>';

  // ── Overlay ──
  var ov=document.createElement('div');
  ov.id='pdfOv';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.97);z-index:9999;display:flex;flex-direction:column;';

  var barEl=document.createElement('div');
  barEl.style.cssText='display:flex;align-items:center;gap:8px;padding:10px 13px;background:#0f0c00;border-bottom:1px solid rgba(201,168,76,.55);flex-shrink:0;flex-wrap:wrap;';
  barEl.innerHTML=''
    +'<span style="flex:1;font-size:.75rem;color:#C9A84C;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">&#128196; '+orcNum+' &mdash; '+q.cli+'</span>'
    +'<button id="pdfBtnClose" style="background:transparent;border:1px solid rgba(201,168,76,.35);color:rgba(201,168,76,.7);padding:7px 11px;border-radius:8px;font-size:.72rem;cursor:pointer;font-family:Outfit,sans-serif;">&#x2715;</button>'
    +'<button id="pdfBtnDown" disabled style="background:#1e1800;border:1px solid rgba(201,168,76,.2);color:rgba(201,168,76,.35);padding:7px 13px;border-radius:8px;font-size:.72rem;cursor:pointer;font-family:Outfit,sans-serif;white-space:nowrap;">&#9203; Gerando...</button>'
    +(navigator.share?'<button id="pdfBtnShare" disabled style="background:#1e1800;border:1px solid rgba(201,168,76,.2);color:rgba(201,168,76,.35);padding:7px 13px;border-radius:8px;font-size:.72rem;cursor:pointer;font-family:Outfit,sans-serif;white-space:nowrap;">&#8599; Compartilhar</button>':'')
    +'<button id="pdfBtnPrint" style="background:#C9A84C;border:none;color:#000;padding:7px 13px;border-radius:8px;font-size:.72rem;font-weight:800;cursor:pointer;font-family:Outfit,sans-serif;white-space:nowrap;">&#128424; Imprimir</button>';

  var preview=document.createElement('div');
  preview.style.cssText='flex:1;overflow-y:auto;background:#444;display:flex;justify-content:center;align-items:flex-start;padding:16px 8px;';
  preview.innerHTML='<div style="text-align:center;color:#C9A84C;padding:60px 20px;font-family:Outfit,sans-serif;font-size:.85rem;letter-spacing:.5px;">&#9203; Gerando PDF, aguarde...</div>';

  ov.appendChild(barEl);
  ov.appendChild(preview);
  document.body.appendChild(ov);

  document.getElementById('pdfBtnClose').onclick=function(){ov.remove();};
  document.getElementById('pdfBtnPrint').onclick=function(){
    var w=window.open('','_blank');
    if(w){
      w.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{box-sizing:border-box;margin:0;padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact;}body{background:#fff;}</style></head><body>'+recHtml+'<script>window.onload=function(){window.print();};<\/script></body></html>');
      w.document.close();
    }
  };

  // ── Off-screen render ──
  var offscreen=document.createElement('div');
  offscreen.style.cssText='position:fixed;left:-9999px;top:0;width:700px;background:#fff;z-index:-1;';
  offscreen.innerHTML=recHtml;
  document.body.appendChild(offscreen);

  setTimeout(function(){
    html2canvas(offscreen.querySelector('#pdfReceipt'),{
      scale:2,useCORS:true,backgroundColor:'#ffffff',logging:false,width:700,windowWidth:700
    }).then(function(canvas){
      document.body.removeChild(offscreen);
      var jsPDF=window.jspdf.jsPDF;
      var pageW=595.28;
      var pageH=pageW*(canvas.height/canvas.width);
      var pdf=new jsPDF({orientation:'portrait',unit:'pt',format:[pageW,pageH]});
      pdf.addImage(canvas.toDataURL('image/jpeg',0.96),'JPEG',0,0,pageW,pageH);
      var pdfBlob=pdf.output('blob');

      var img=document.createElement('img');
      img.src=canvas.toDataURL('image/jpeg',0.88);
      img.style.cssText='width:100%;max-width:700px;display:block;box-shadow:0 4px 32px rgba(0,0,0,.6);';
      preview.innerHTML='';preview.appendChild(img);

      function enableBtn(id,label,cb){
        var b=document.getElementById(id);if(!b)return;
        b.innerHTML=label;b.disabled=false;
        b.style.color='#C9A84C';b.style.borderColor='rgba(201,168,76,.55)';b.style.background='#1e1800';
        b.onclick=cb;
      }

      enableBtn('pdfBtnDown','&#11015; Salvar PDF',function(){
        var url=URL.createObjectURL(pdfBlob);
        var a=document.createElement('a');
        a.href=url;a.download=fileName;
        document.body.appendChild(a);a.click();document.body.removeChild(a);
        setTimeout(function(){URL.revokeObjectURL(url);},30000);
        toast('PDF salvo: '+fileName);
      });

      if(navigator.share){
        enableBtn('pdfBtnShare','&#8599; Compartilhar',function(){
          var pdfFile=new File([pdfBlob],fileName,{type:'application/pdf'});
          var sd={title:'Orcamento '+orcNum+' — '+q.cli,text:emp.nome+'\nR$ '+fm(q.vista)+' a vista'};
          if(navigator.canShare&&navigator.canShare({files:[pdfFile]}))sd.files=[pdfFile];
          navigator.share(sd).catch(function(){});
        });
      }

      toast('✓ PDF pronto — '+orcNum);
    }).catch(function(){
      if(document.body.contains(offscreen))document.body.removeChild(offscreen);
      preview.innerHTML='<div style="text-align:center;color:#c94444;padding:40px 20px;font-family:Outfit,sans-serif;font-size:.82rem;">Erro ao gerar. Use &#128424; Imprimir.</div>';
    });
  },200);
}
function salvarAgenda(){if(!pendQ)return;var last=lastEnd();document.getElementById('diasMsg').textContent=(last?'Agenda ocupada até '+fd(last)+'. ':'')+'Quantos dias para entregar o serviço de '+pendQ.cli+'?';document.getElementById('diasIn').value='';document.getElementById('diasPrev').classList.remove('on');showMd('diasMd');}
function prevDias(){var d=+document.getElementById('diasIn').value,p=document.getElementById('diasPrev');if(!d){p.classList.remove('on');return;}var s=lastEnd()||td();p.textContent='Início: '+fd(s)+'\nEntrega prevista: '+fd(addD(s,d));p.classList.add('on');}
function confirmarAgenda(){var d=+document.getElementById('diasIn').value;if(!d||!pendQ){toast('Informe os dias');return;}var s=lastEnd()||td(),end=addD(s,d),q=pendQ;var job={id:Date.now(),cli:q.cli,desc:q.tipo+' — '+q.mat,start:s,end:end,value:q.vista,pago:0,obs:'',done:false};DB.j.unshift(job);DB.sv();closeAll();updUrgDot();toast('✓ '+q.cli+' agendado para '+fd(end));setTimeout(function(){showCB(q.cli+' já pagou os 50% de entrada (R$ '+fm(q.ent)+')?',function(){addTr('in','Entrada 50% — '+q.cli,q.ent);var j=DB.j.find(function(x){return x.id===job.id;});if(j){j.pago=q.ent;DB.sv();}hideCB();toast('✓ Entrada registrada!');},function(){hideCB();});},600);}

function openJobModal(id){
  editJobId=id;
  document.getElementById('jobMdTitle').textContent=id?'Editar Serviço':'Novo Serviço';
  if(id){
    var j=DB.j.find(function(x){return x.id===id;});
    if(!j)return;
    document.getElementById('jCli').value=j.cli||'';
    document.getElementById('jDesc').value=j.desc||'';
    document.getElementById('jStart').value=j.start||td();
    document.getElementById('jDias').value='';
    document.getElementById('jVal').value=j.value||'';
    document.getElementById('jPago').value=j.pago||'';
    document.getElementById('jObs').value=j.obs||'';
  } else {
    ['jCli','jDesc','jVal','jPago','jObs'].forEach(function(i){document.getElementById(i).value='';});
    document.getElementById('jStart').value=td();
    document.getElementById('jDias').value='';
  }
  document.getElementById('jobDp').classList.remove('on');
  showMd('jobMd');
}
function prevJobDias(){var d=+document.getElementById('jDias').value,s=document.getElementById('jStart').value,p=document.getElementById('jobDp');if(!d||!s){p.classList.remove('on');return;}p.textContent='Entrega: '+fd(addD(s,d));p.classList.add('on');}
function saveJob(){
  var cli=document.getElementById('jCli').value.trim(),desc=document.getElementById('jDesc').value.trim();
  if(!cli||!desc){toast('Preencha cliente e descrição');return;}
  var s=document.getElementById('jStart').value,d=+document.getElementById('jDias').value||0;
  var end=d?addD(s,d):'',val=+document.getElementById('jVal').value||0,pago=+document.getElementById('jPago').value||0,obs=document.getElementById('jObs').value;
  if(editJobId){
    var j=DB.j.find(function(x){return x.id===editJobId;});
    if(j){j.cli=cli;j.desc=desc;j.start=s;j.end=end;j.value=val;j.pago=pago;j.obs=obs;DB.sv();}
  } else {
    DB.j.unshift({id:Date.now(),cli:cli,desc:desc,start:s,end:end,value:val,pago:pago,obs:obs,done:false});DB.sv();
    if(pago>0)setTimeout(function(){showCB('Registrar entrada de R$ '+fm(pago)+' do '+cli+'?',function(){addTr('in','Entrada — '+cli,pago);hideCB();},function(){hideCB();});},400);
  }
  renderAg();updUrgDot();closeAll();toast('✓ Salvo!');
}

function editJob(id){openJobModal(id);}
function togJob(id){var j=DB.j.find(function(x){return x.id===id;});if(!j)return;j.done=!j.done;DB.sv();renderAg();updUrgDot();if(j.done){toast('✓ Concluído!');var r=j.value-(j.pago||0);if(r>0)setTimeout(function(){showCB(j.cli+' concluído! Recebeu R$ '+fm(r)+' da entrega?',function(){addTr('in','Entrega — '+j.cli,r);j.pago=j.value;DB.sv();renderAg();hideCB();toast('✓ Registrado!');},function(){hideCB();});},400);}}
function pagRest(id){var j=DB.j.find(function(x){return x.id===id;});if(!j)return;var r=j.value-(j.pago||0);showCB('Registrar R$ '+fm(r)+' do '+j.cli+'?',function(){addTr('in','Pagamento — '+j.cli,r);j.pago=j.value;DB.sv();renderAg();hideCB();toast('✓ Registrado!');},function(){hideCB();});}
function delJob(id){if(!confirm('Remover serviço?'))return;DB.j=DB.j.filter(function(j){return j.id!==id;});DB.sv();renderAg();updUrgDot();}
function updUrgDot(){var u=DB.j.filter(function(j){return !j.done&&j.end&&dDiff(j.end)>=0&&dDiff(j.end)<=3;}).length;document.getElementById('urgDot').classList.toggle('on',u>0);}

function renderAg(){
  var ov=DB.j.filter(function(j){return !j.done&&j.end&&dDiff(j.end)<0;});
  var ur=DB.j.filter(function(j){return !j.done&&j.end&&dDiff(j.end)>=0&&dDiff(j.end)<=3;});
  var pe=DB.j.filter(function(j){return !j.done&&(!j.end||dDiff(j.end)>3);});
  var dn=DB.j.filter(function(j){return j.done;}).slice(0,5);
  var h='';
  function sec(lbl,col,items){if(!items.length)return;h+='<div style="font-size:.57rem;letter-spacing:2px;text-transform:uppercase;color:'+col+';font-weight:600;margin:14px 0 8px;">'+lbl+'</div>';items.forEach(function(j){h+=jCard(j);});}
  sec('Atrasados','var(--red)',ov);sec('Próximos 3 dias','var(--gold)',ur);sec('Em andamento ('+pe.length+')','var(--t3)',pe);sec('Concluídos','var(--t3)',dn);
  if(!DB.j.length)h='<div style="text-align:center;padding:40px 20px;color:var(--t3);font-size:.82rem;"><div style="font-size:2.2rem;margin-bottom:9px;">📅</div>Nenhum serviço ainda.</div>';
  document.getElementById('agList').innerHTML=h;
}
function jCard(j){
  var rest=j.value-(j.pago||0),d=j.end?dDiff(j.end):null,st=j.done?'done':(d!==null&&d<=3?'urg':'pend');
  var dTxt='';if(d!==null){if(d<0)dTxt='<span class="red">'+Math.abs(d)+'d atrasado</span>';else if(d===0)dTxt='<span class="red">Hoje!</span>';else dTxt='<span>'+d+'d restantes</span>';}
  var meta=(j.start?'<span>Início: '+fd(j.start)+'</span> ':'')+(j.end?'<span>Entrega: '+fd(j.end)+'</span> ':'')+dTxt;
  var valMeta=j.value?'<div class="jmeta"><span class="gold">Total: R$ '+fm(j.value)+'</span><span class="grn">Pago: R$ '+fm(j.pago||0)+'</span>'+(rest>0?'<span class="red">A receber: R$ '+fm(rest)+'</span>':'')+'</div>':'';
  var btnPag=(!j.done&&rest>0)?'<button class="btn btn-sm" style="background:var(--gdim);color:var(--gold2);border:1px solid var(--gold3);" data-pagrest="'+j.id+'">Receber</button>':'';
  return '<div class="jcard '+st+'"><div class="jnm">'+j.cli+'</div><div class="jdesc">'+j.desc+'</div><div class="jmeta">'+meta+'</div>'+valMeta+'<div class="jbtns"><button class="btn btn-sm '+(j.done?'btn-o':'btn-grn')+'" data-togjob="'+j.id+'">'+(j.done?'↩ Reabrir':'✓ Concluir')+'</button>'+btnPag+'<button class="btn btn-sm btn-o" data-editjob="'+j.id+'">✏️</button><button class="btn btn-sm btn-red" data-deljob="'+j.id+'">✕</button></div></div>';
}

// ═══ FINANÇAS ═══
function openFin(t){fType=t;document.querySelectorAll('.ts').forEach(function(o){o.classList.toggle('on',o.dataset.ftp===t);});var fd=document.getElementById('fData');if(fd&&!fd.value)fd.value=td();showMd('finMd');}
function setFT(t){fType=t;document.querySelectorAll('[data-ftp]').forEach(function(o){o.classList.toggle('on',o.dataset.ftp===t);});}
function addTr(type,desc,value){DB.t.unshift({id:Date.now(),type:type,desc:desc,value:value,date:td()});DB.sv();renderFin();}
function saveFin(){var desc=document.getElementById('fDesc').value.trim(),val=+document.getElementById('fVal').value||0,date=document.getElementById('fData').value;if(!desc){toast('Preencha a descrição');return;}DB.t.unshift({id:Date.now(),type:fType,desc:desc,value:val,date:date});DB.sv();renderFin();closeAll();document.getElementById('fDesc').value='';document.getElementById('fVal').value='';toast('✓ Lançado!');}
function openEditTr(id){
  editTrId=id;
  var t=DB.t.find(function(x){return x.id===id;});if(!t)return;
  document.getElementById('teDesc').value=t.desc||'';
  document.getElementById('teVal').value=t.value||'';
  document.getElementById('teData').value=t.date||td();
  document.querySelectorAll('[data-tet]').forEach(function(o){o.classList.toggle('on',o.dataset.tet===t.type);});
  showMd('trEdMd');
}
function setTET(tp){document.querySelectorAll('[data-tet]').forEach(function(o){o.classList.toggle('on',o.dataset.tet===tp);});}
function saveTrEdit(){
  var t=DB.t.find(function(x){return x.id===editTrId;});if(!t)return;
  var tp=document.querySelector('[data-tet].on');
  t.type=tp?tp.dataset.tet:t.type;
  t.desc=document.getElementById('teDesc').value.trim()||t.desc;
  t.value=+document.getElementById('teVal').value||t.value;
  t.date=document.getElementById('teData').value||t.date;
  DB.sv();renderFin();closeAll();toast('✓ Atualizado!');
}
function delTr(){if(!confirm('Excluir lançamento?'))return;DB.t=DB.t.filter(function(x){return x.id!==editTrId;});DB.sv();renderFin();closeAll();toast('✓ Excluído!');}
function renderFin(){
  var inT=DB.t.filter(function(t){return t.type==='in';}).reduce(function(s,t){return s+t.value;},0);
  var outT=DB.t.filter(function(t){return t.type==='out';}).reduce(function(s,t){return s+t.value;},0);
  var bal=inT-outT;
  var pend=DB.j.filter(function(j){return !j.done;}).reduce(function(s,j){return s+(j.value-(j.pago||0));},0);
  var fs=document.getElementById('finSaldo');
  fs.textContent='R$ '+fm(bal);fs.className='finval '+(bal>=0?'pos':'neg');
  document.getElementById('finSub').textContent='R$ '+fm(pend)+' a receber dos serviços';
  document.getElementById('finCards').innerHTML='<div class="fc"><div class="fcl">Entradas</div><div class="fcv g">R$ '+fm(inT)+'</div></div><div class="fc"><div class="fcl">Saídas</div><div class="fcv r">R$ '+fm(outT)+'</div></div><div class="fc"><div class="fcl">A Receber</div><div class="fcv b">R$ '+fm(pend)+'</div></div>';
  var items=DB.t.slice(0,50),h='';
  if(items.length){items.forEach(function(t){var ic=t.type==='in'?'📈':t.type==='out'?'📉':t.type==='note'?'📝':'⏳';var sign=t.type==='in'?'+':t.type==='out'?'-':'';var valStr=t.value?'R$ '+fm(t.value):'';h+='<div class="trrow"><div class="trdot '+t.type+'">'+ic+'</div><div style="flex:1;min-width:0;"><div class="trnm">'+t.desc+'</div><div class="trdt">'+(t.date?fd(t.date):'')+'</div></div><div class="trv '+t.type+'">'+sign+valStr+'</div><button class="tredt" data-edittr="'+t.id+'">✏️</button></div>';});}
  else{h='<div style="padding:18px;text-align:center;color:var(--t3);font-size:.8rem;">Nenhuma movimentação</div>';}
  document.getElementById('trList').innerHTML=h;
}
function renderFixos(){
  var tot=0,h='';
  CFG.fixos.forEach(function(f){tot+=f.v;h+='<div class="rrow2" style="padding:9px 0;border-bottom:1px solid #0c0c10;display:flex;justify-content:space-between;"><span style="font-size:.79rem;color:var(--t3);">'+f.n+'</span><span style="font-size:.8rem;font-weight:600;">R$ '+fm(f.v)+'</span></div>';});
  h+='<div style="display:flex;justify-content:space-between;align-items:baseline;padding:12px 0 0;margin-top:4px;border-top:1px solid var(--bd2);"><span style="font-size:.88rem;font-weight:700;">Total Mensal</span><span style="font-family:\'Cormorant Garamond\',serif;font-size:1.4rem;color:var(--gold2);font-weight:700;">R$ '+fm(tot)+'</span></div>';
  document.getElementById('fixosCard').innerHTML=h;
}

// ═══ CATÁLOGO PEDRAS ═══
function buildCatalog(){
  var cats=['Todos','Granito Cinza','Granito Preto','Granito Branco','Granito Verde','Mármore','Travertino','Quartzito','Ultra Compacto'];
  document.getElementById('fbar').innerHTML=cats.map(function(c){
    return '<div class="fb '+(c===catF?'on':'')+'" data-catf="'+c+'">'+c+'</div>';
  }).join('');
  buildCatGrid();
}

function buildCatGrid(){
  var GRUPOS=[
    {cat:'Granito Cinza', icon:'🩶', desc:'Alta dureza, resistente a manchas e calor. Ideal para cozinhas e bancadas de uso intenso.'},
    {cat:'Granito Preto', icon:'🖤', desc:'Elegância e sofisticação. Polimento espelhado intenso, muito valorizado em projetos de alto padrão.'},
    {cat:'Granito Branco', icon:'🤍', desc:'Amplifica a luminosidade. Combina com qualquer estilo de decoração.'},
    {cat:'Granito Verde', icon:'💚', desc:'Tons únicos com reflexos metálicos naturais. Alta durabilidade para projetos exclusivos.'},
    {cat:'Mármore', icon:'🌿', desc:'Clássico e atemporal. Veios naturais únicos em cada chapa. Exige selagem periódica.'},
    {cat:'Travertino', icon:'🟤', desc:'Pedra sedimentar com poros naturais. Tom bege-terroso, rústico e elegante.'},
    {cat:'Quartzito', icon:'💎', desc:'Resistência superior ao granito com beleza do mármore. Baixa porosidade natural.'},
    {cat:'Ultra Compacto', icon:'⚡', desc:'Zero porosidade — não risca, não mancha, não exige selagem. O mais resistente disponível.'}
  ];

  var stones = catF==='Todos' ? CFG.stones : CFG.stones.filter(function(s){return s.cat===catF;});
  var catGrid = document.getElementById('catGrid');
  catGrid.style.cssText = 'padding:0 0 16px;';
  var h = '';

  function cardHtml(s){
    var img = s.photo ? '<img class="csw-bg" src="'+s.photo+'" alt="">' : '';
    // Short description: first sentence only, max 60 chars
    var shortDesc = s.desc ? s.desc.split('.')[0].trim() : '';
    if(shortDesc.length > 58) shortDesc = shortDesc.substring(0,58)+'…';
    return '<div class="ccard" data-stone="'+s.id+'">'
      +'<div class="csw '+(s.photo?'':s.tx)+'">'+img+'<div class="cshine"></div></div>'
      +'<div class="cbody">'
        +'<div class="cnm">'+s.nm+'</div>'
        +(shortDesc?'<div class="cdes">'+shortDesc+'</div>':'')
        +'<div class="cprc"><span class="cprice">R$ '+s.pr.toLocaleString('pt-BR')+'</span><span class="cunit">/m²</span></div>'
      +'</div>'
    +'</div>';
  }

  if(catF==='Todos'){
    GRUPOS.forEach(function(grp){
      var itens = stones.filter(function(s){return s.cat===grp.cat;});
      if(!itens.length) return;
      // Group header — full width block
      h += '<div class="cat-grp-hdr">'
        + '<span class="cat-grp-icon">'+grp.icon+'</span>'
        + '<span class="cat-grp-nm">'+grp.cat+'</span>'
        + '</div>';
      h += '<p class="cat-grp-desc">'+grp.desc+'</p>';
      // Card grid
      h += '<div class="cgrid cat-cards">';
      itens.forEach(function(s){ h += cardHtml(s); });
      h += '</div>';
      h += '<div class="cat-divider"></div>';
    });
  } else {
    var grp = GRUPOS.find(function(g){return g.cat===catF;}) || {icon:'🪨',desc:''};
    h += '<div class="cat-grp-hdr"><span class="cat-grp-icon">'+grp.icon+'</span><span class="cat-grp-nm">'+catF+'</span></div>';
    h += '<p class="cat-grp-desc">'+grp.desc+'</p>';
    h += '<div class="cgrid cat-cards">';
    stones.forEach(function(s){ h += cardHtml(s); });
    h += '</div>';
  }

  catGrid.innerHTML = h;
}

function openStone(id){
  var s=CFG.stones.find(function(x){return x.id===id;});if(!s)return;
  var bg=s.photo?'<img src="'+s.photo+'" style="width:100%;height:140px;object-fit:cover;border-radius:12px;margin-bottom:13px;" alt="">':'<div class="'+s.tx+'" style="width:100%;height:140px;border-radius:12px;margin-bottom:13px;position:relative;overflow:hidden;"><div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.12),transparent 50%);"></div></div>';
  document.getElementById('stoneMdC').innerHTML=bg+'<div style="font-family:Cormorant Garamond,serif;font-size:1.3rem;font-weight:700;margin-bottom:3px;">'+s.nm+'</div><div style="font-size:.62rem;color:var(--t3);letter-spacing:2px;text-transform:uppercase;margin-bottom:7px;">'+s.cat+' · '+s.fin+'</div><div style="font-size:.82rem;color:var(--t2);line-height:1.65;margin-bottom:11px;">'+s.desc+'</div><div style="background:var(--gdim);border:1px solid var(--gold3);border-radius:10px;padding:11px 14px;display:flex;justify-content:space-between;align-items:baseline;"><span style="font-size:.78rem;color:var(--gold3);">Preço</span><span style="font-family:Cormorant Garamond,serif;font-size:1.4rem;font-weight:700;color:var(--gold2);">R$ '+s.pr.toLocaleString('pt-BR')+'<span style="font-size:.7rem;color:var(--t3);">/m²</span></span></div>';
  showMd('stoneMd');
}

// ═══ CATÁLOGO CUBAS ═══
function buildCubaList(){
  var lista=cubaCat==='coz'?CFG.coz:CFG.lav;
  var cols=window.innerWidth>=900?3:window.innerWidth>=700?3:2;
  var h='';
  var grupos={};
  lista.forEach(function(c){var g=c.tipo||'HR';if(!grupos[g])grupos[g]=[];grupos[g].push(c);});
  var ordemCoz=['HR'];
  var ordemLav=['Louça','Sobrepor','Esculpida'];
  var ordem=cubaCat==='coz'?ordemCoz:ordemLav;
  var instCli=cubaCat==='coz'?160:280;
  ordem.forEach(function(gname){
    var items=grupos[gname];if(!items||!items.length)return;
    var isEsc=gname==='Esculpida';
    if(isEsc){
      h+='<div style="font-size:.57rem;letter-spacing:2px;text-transform:uppercase;color:var(--gold);font-weight:600;margin:14px 0 9px;">Cubas Esculpidas na Pedra</div>';
      h+='<div style="background:var(--s3);border:1px solid var(--bd2);border-radius:11px;padding:13px 14px;margin-bottom:10px;">';
      h+='<div style="font-size:.7rem;color:var(--t2);line-height:1.6;margin-bottom:10px;">Cuba escavada direto na pedra. Informe as dimensões para calcular o preço.</div>';
      h+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;">';
      h+='<div><div style="font-size:.6rem;color:var(--t3);margin-bottom:3px;">Comprimento (cm)</div><input type="number" id="escW" placeholder="50" min="20" onclick="event.stopPropagation()" style="width:100%;background:var(--s2);border:1px solid var(--bd2);border-radius:8px;padding:8px 10px;color:var(--tx);font-family:Outfit,sans-serif;font-size:.85rem;outline:none;"></div>';
      h+='<div><div style="font-size:.6rem;color:var(--t3);margin-bottom:3px;">Largura (cm)</div><input type="number" id="escH" placeholder="40" min="20" onclick="event.stopPropagation()" style="width:100%;background:var(--s2);border:1px solid var(--bd2);border-radius:8px;padding:8px 10px;color:var(--tx);font-family:Outfit,sans-serif;font-size:.85rem;outline:none;"></div>';
      h+='<div><div style="font-size:.6rem;color:var(--t3);margin-bottom:3px;">Profundidade (cm)</div><input type="number" id="escD" placeholder="20" min="10" onclick="event.stopPropagation()" style="width:100%;background:var(--s2);border:1px solid var(--bd2);border-radius:8px;padding:8px 10px;color:var(--tx);font-family:Outfit,sans-serif;font-size:.85rem;outline:none;"></div>';
      h+='</div>';
      h+='<div style="font-size:.68rem;color:var(--t3);margin-bottom:10px;">O preço inclui mão de obra de escavação + pedra removida (fundo e paredes da cuba).</div>';
      items.forEach(function(esc){
        h+='<button onclick="pickEsculpida(\''+esc.id+'\')" style="width:100%;background:var(--gdim);border:1px solid var(--gold3);border-radius:10px;padding:12px 14px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-family:Outfit,sans-serif;">';
        h+='<div style="text-align:left;"><div style="font-size:.82rem;font-weight:700;color:var(--tx);">'+esc.nm+'</div><div style="font-size:.65rem;color:var(--t3);margin-top:2px;">M.O. base: R$ '+esc.inst+'</div></div>';
        h+='<div style="font-size:.72rem;color:var(--gold2);font-weight:700;">Selecionar →</div>';
        h+='</button>';
      });
      h+='</div>';
      return;
    }
    h+='<div style="font-size:.57rem;letter-spacing:2px;text-transform:uppercase;color:var(--gold);font-weight:600;margin:14px 0 9px;">'+(cubaCat==='coz'?'Cubas Inox HR':'Cubas '+gname)+'</div>';
    var cols=window.innerWidth>=900?4:window.innerWidth>=700?3:2;
    h+='<div style="display:grid;grid-template-columns:repeat('+cols+',1fr);gap:10px;margin-bottom:4px;">';
    items.filter(function(c){return c.pr>0;}).forEach(function(c){
      var imgH=c.photo?('<img src="'+c.photo+'" alt="'+c.nm+'" onclick="abrirCubaFs(\''+c.id+'\',\''+cubaCat+'\')" style="cursor:zoom-in;">'):'<div style="font-size:2rem;color:var(--t3);">🚰</div>';
      h+='<div class="cubacard"><div class="ccimg">'+imgH+'</div><div class="ccbody">'
        +'<div class="ccbrand">'+c.brand+'</div>'
        +'<div class="ccnm">'+c.nm+'</div>'
        +'<div class="ccdim">'+c.dim+'</div>'
        +'<div style="margin-top:9px;background:var(--gdim);border:1px solid var(--gold3);border-radius:9px;padding:10px 13px;display:flex;justify-content:space-between;align-items:baseline;">'
        +'<span style="font-size:.62rem;color:var(--gold3);letter-spacing:1px;text-transform:uppercase;">Preço</span>'
        +'<span style="font-family:\'Cormorant Garamond\',serif;font-size:1.35rem;font-weight:700;color:var(--gold2);">R$ '+c.pr.toLocaleString('pt-BR')+'</span>'
        +'</div>'
        +'</div></div>';
    });
  });
    h+='</div>';
  // Buttons
  h+='<div style="display:flex;gap:8px;margin-top:12px;">'
   +'<button onclick="gerarCatalogoPDF()" style="flex:1;padding:12px;border-radius:11px;border:none;background:linear-gradient(135deg,#1a0a00,#2a1200);border:1px solid var(--gold3);color:var(--gold2);font-family:Outfit,sans-serif;font-size:.82rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;"><span>📄</span> Gerar Catálogo PDF</button>'
   +'<button onclick="compartilharCatalogoCubas()" style="flex:1;padding:12px;border-radius:11px;border:none;background:#0a1f0f;border:1px solid #1a4a2a;color:#4ade80;font-family:Outfit,sans-serif;font-size:.82rem;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;"><span>📤</span> WhatsApp</button>'
   +'</div>';
  h+='</div>';
  var clw=document.getElementById('cubaListWrap');if(clw)clw.innerHTML=h;
}

// ═══ ACESSÓRIOS ═══
function buildAcList(){
  var cols=window.innerWidth>=900?3:window.innerWidth>=700?3:2;
  var h='';
  var ac=CFG.ac||[];
  if(!ac.length){
    h+='<div style="text-align:center;padding:50px 20px;color:var(--t3);">'
     +'<div style="font-size:2.5rem;margin-bottom:10px;">🔩</div>'
     +'<div style="font-size:.85rem;font-weight:600;margin-bottom:6px;">Nenhum acessório cadastrado</div>'
     +'<div style="font-size:.75rem;">Vá em Config → Acessórios para adicionar</div>'
     +'</div>';
  } else {
    ac.forEach(function(a,i){
      var imgH=a.photo
        ?'<img src="'+a.photo+'" alt="'+a.nm+'" onclick="abrirAcFs('+i+')" style="cursor:zoom-in;width:100%;height:100%;object-fit:cover;display:block;">'
        :'<div style="font-size:2.5rem;color:var(--t3);display:flex;align-items:center;justify-content:center;height:100%;">🔩</div>';
      h+='<div class="cubacard">'
        +'<div class="ccimg">'+imgH+'</div>'
        +'<div class="ccbody">'
          +(a.marca?'<div class="ccbrand">'+a.marca+'</div>':'')
          +'<div class="ccnm">'+a.nm+'</div>'
          +(a.dim?'<div class="ccdim">'+a.dim+'</div>':'')
          +(a.desc?'<div style="font-size:.72rem;color:var(--t3);line-height:1.55;margin-bottom:10px;">'+a.desc+'</div>':'')
          +(a.pr>0
            ?'<div style="background:var(--gdim);border:1px solid var(--gold3);border-radius:9px;padding:10px 13px;display:flex;justify-content:space-between;align-items:baseline;">'
              +'<span style="font-size:.62rem;color:var(--gold3);letter-spacing:1px;text-transform:uppercase;">Preço</span>'
              +'<span style="font-family:\'Cormorant Garamond\',serif;font-size:1.35rem;font-weight:700;color:var(--gold2);">R$ '+a.pr.toLocaleString('pt-BR')+'</span>'
             +'</div>'
            :'<div style="background:var(--s3);border-radius:9px;padding:9px 13px;font-size:.78rem;color:var(--t3);">Preço a consultar</div>')
        +'</div></div>';
    });
  }
  // Botões
  h+='<div style="display:flex;gap:8px;margin-top:12px;">'
   +'<button onclick="gerarCatalogoAcPDF()" style="flex:1;padding:12px;border-radius:11px;border:none;background:linear-gradient(135deg,#1a0a00,#2a1200);border:1px solid var(--gold3);color:var(--gold2);font-family:Outfit,sans-serif;font-size:.82rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;"><span>📄</span> Gerar PDF</button>'
   +'<button onclick="go(6);setTimeout(function(){cfgTab=6;document.querySelectorAll(\'.cfgtab\').forEach(function(t){t.classList.toggle(\'on\',t.dataset.cftab===\'6\');});buildCfg();},100);" style="flex:1;padding:12px;border-radius:11px;border:1px solid var(--bd2);background:transparent;color:var(--t2);font-family:Outfit,sans-serif;font-size:.82rem;cursor:pointer;">⚙️ Gerenciar</button>'
   +'</div>';
  h+='</div>';
  var el=document.getElementById('acListWrap');
  if(el)el.innerHTML=h;
}

function abrirAcFs(i){
  var a=(CFG.ac||[])[i];
  if(!a||!a.photo)return;
  document.getElementById('cubaFsImg').src=a.photo;
  document.getElementById('cubaFsNm').textContent=a.nm;
  document.getElementById('cubaFsDim').textContent=(a.marca?a.marca+' · ':'')+a.dim;
  document.getElementById('cubaFsPr').textContent=a.pr>0?'R$ '+a.pr.toLocaleString('pt-BR'):'';
  document.getElementById('cubaFsMd').classList.add('on');
}

function gerarCatalogoAcPDF(){
  var ac=CFG.ac||[];
  if(!ac.length){toast('Nenhum acessório cadastrado');return;}
  var emp=CFG.emp;
  function card(a){
    var foto=a.photo
      ?'<img src="'+a.photo+'" style="width:100%;height:180px;object-fit:cover;display:block;background:#f5f5f5;">'
      :'<div style="width:100%;height:180px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:3rem;">🔩</div>';
    return '<div style="break-inside:avoid;background:#fff;border:1px solid #e0d8cc;border-radius:12px;overflow:hidden;margin-bottom:16px;">'
      +foto
      +'<div style="padding:14px 16px;">'
        +(a.marca?'<div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#b08040;font-weight:700;margin-bottom:3px;">'+a.marca+'</div>':'')
        +'<div style="font-size:16px;font-weight:900;color:#1a1a1a;margin-bottom:2px;">'+a.nm+'</div>'
        +(a.dim?'<div style="font-size:11px;color:#888;margin-bottom:8px;">'+a.dim+'</div>':'')
        +(a.desc?'<div style="font-size:11px;color:#666;line-height:1.5;margin-bottom:10px;">'+a.desc+'</div>':'')
        +(a.pr>0
          ?'<div style="background:#faf5ea;border:1px solid #e8d89c;border-radius:8px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;">'
            +'<span style="font-size:10px;color:#8b6014;font-weight:700;text-transform:uppercase;">Preço</span>'
            +'<span style="font-size:20px;font-weight:900;color:#8b6014;">R$ '+a.pr.toLocaleString('pt-BR')+'</span>'
           +'</div>'
          :'<div style="background:#f5f5f5;border-radius:8px;padding:9px 14px;font-size:11px;color:#999;">Preço a consultar</div>')
      +'</div></div>';
  }
  var html='<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>'
    +'*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}'
    +'body{font-family:Arial,Helvetica,sans-serif;background:#fff;}'
    +'.page{max-width:800px;margin:0 auto;}'
    +'.hdr{background:#0f0c00;padding:28px 36px;display:flex;justify-content:space-between;align-items:center;}'
    +'.brand{font-size:24px;font-weight:900;color:#C9A84C;}'
    +'.tag{font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(201,168,76,.4);margin-top:4px;}'
    +'.hdr-r{text-align:right;}'
    +'.hdr-tel{font-size:13px;font-weight:700;color:#C9A84C;}'
    +'.hdr-city{font-size:10px;color:rgba(255,255,255,.3);margin-top:3px;}'
    +'.tbar{background:#f7f2e8;border-bottom:3px solid #C9A84C;padding:14px 36px;}'
    +'.tbar-title{font-size:18px;font-weight:900;color:#5a3a06;}'
    +'.tbar-sub{font-size:10px;color:#999;margin-top:2px;}'
    +'.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:24px 36px;}'
    +'.foot{background:#0f0c00;padding:16px 36px;display:flex;justify-content:space-between;}'
    +'.foot-l{font-size:10px;color:rgba(201,168,76,.45);}'
    +'.foot-r{font-size:10px;color:rgba(255,255,255,.2);text-align:right;}'
    +'</style></head><body><div class="page">'
    +'<div class="hdr"><div><div class="brand">'+emp.nome+'</div><div class="tag">Mármores · Granitos · Acessórios</div></div>'
    +'<div class="hdr-r"><div class="hdr-tel">'+emp.tel+'</div><div class="hdr-city">'+emp.cidade+'</div></div></div>'
    +'<div class="tbar"><div class="tbar-title">🔩 Catálogo de Acessórios</div><div class="tbar-sub">Produtos disponíveis para bancadas</div></div>'
    +'<div class="grid">'+ac.map(card).join('')+'</div>'
    +'<div class="foot"><div class="foot-l">CNPJ: '+emp.cnpj+' · '+emp.ig+'</div><div class="foot-r">'+emp.end+'</div></div>'
    +'</div><script>window.onload=function(){setTimeout(function(){window.print();},400);}<\/script></body></html>';
  var w=window.open('','_blank','width=900,height=700');
  if(w){w.document.write(html);w.document.close();toast('📄 Catálogo aberto — Imprimir → Salvar como PDF');}
  else{var b=new Blob([html],{type:'text/html'});var u=URL.createObjectURL(b);var a2=document.createElement('a');a2.href=u;a2.download='Catalogo_Acessorios_HR.html';a2.click();setTimeout(function(){URL.revokeObjectURL(u);},5000);}
}

// ═══ CUBA FULLSCREEN ═══
function abrirCubaFs(id, tipo){
  var lista=tipo==='coz'?CFG.coz:CFG.lav;
  var c=lista.find(function(x){return x.id===id;});
  if(!c||!c.photo)return;
  document.getElementById('cubaFsImg').src=c.photo;
  document.getElementById('cubaFsNm').textContent=c.nm;
  document.getElementById('cubaFsDim').textContent=(c.brand?c.brand+' · ':'')+c.dim;
  document.getElementById('cubaFsPr').textContent=c.pr>0?'R$ '+c.pr.toLocaleString('pt-BR'):'';
  document.getElementById('cubaFsMd').classList.add('on');
}

// ═══ GERAR CATÁLOGO PDF ═══
function gerarCatalogoPDF(){
  var lista=cubaCat==='coz'?CFG.coz:CFG.lav;
  var isCoz=cubaCat==='coz';
  var titulo=isCoz?'Cubas para Cozinha':'Cubas para Banheiro & Lavabo';
  var emp=CFG.emp;

  // Build items with photos (only cubas with price and photo)
  var itens=lista.filter(function(c){return c.pr>0;});

  // Build card HTML for each cuba
  function cubaCard(c){
    var foto=c.photo
      ?'<img src="'+c.photo+'" style="width:100%;height:160px;object-fit:contain;display:block;background:#f5f5f5;">'
      :'<div style="width:100%;height:160px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:2.5rem;">🚰</div>';
    return '<div style="break-inside:avoid;background:#fff;border:1px solid #e0d8cc;border-radius:12px;overflow:hidden;margin-bottom:16px;">'
      +foto
      +'<div style="padding:14px 16px;">'
        +'<div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#b08040;font-weight:700;margin-bottom:3px;">'+c.brand+'</div>'
        +'<div style="font-size:16px;font-weight:900;color:#1a1a1a;margin-bottom:2px;line-height:1.2;">'+c.nm+'</div>'
        +'<div style="font-size:11px;color:#888;margin-bottom:12px;">'+c.dim+'</div>'
        +'<div style="background:#faf5ea;border:1px solid #e8d89c;border-radius:8px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;">'
          +'<span style="font-size:10px;color:#8b6014;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Preço</span>'
          +'<span style="font-size:20px;font-weight:900;color:#8b6014;">R$ '+c.pr.toLocaleString('pt-BR')+'</span>'
        +'</div>'
      +'</div>'
    +'</div>';
  }

  var cardsHtml=itens.map(cubaCard).join('');

  var html='<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">'
  +'<style>'
  +'*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}'
  +'body{font-family:Arial,Helvetica,sans-serif;background:#fff;color:#1a1a1a;}'
  +'.page{max-width:800px;margin:0 auto;}'
  // Header
  +'.hdr{background:#0f0c00;padding:28px 36px;display:flex;justify-content:space-between;align-items:center;}'
  +'.hdr-brand{}'
  +'.hdr-logo{font-size:28px;font-weight:900;color:#C9A84C;letter-spacing:-.5px;line-height:1;}'
  +'.hdr-tag{font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(201,168,76,.45);margin-top:4px;}'
  +'.hdr-right{text-align:right;}'
  +'.hdr-tel{font-size:13px;font-weight:700;color:#C9A84C;}'
  +'.hdr-city{font-size:10px;color:rgba(255,255,255,.35);margin-top:3px;}'
  // Title bar
  +'.tbar{background:#f7f2e8;border-bottom:3px solid #C9A84C;padding:14px 36px;display:flex;justify-content:space-between;align-items:center;}'
  +'.tbar-title{font-size:18px;font-weight:900;color:#5a3a06;letter-spacing:-.3px;}'
  +'.tbar-ic{font-size:22px;}'
  +'.tbar-sub{font-size:10px;color:#999;margin-top:2px;}'
  // Grid
  +'.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:24px 36px;}'
  // Footer
  +'.foot{background:#0f0c00;padding:16px 36px;display:flex;justify-content:space-between;align-items:center;margin-top:8px;}'
  +'.foot-txt{font-size:10px;color:rgba(201,168,76,.5);}'
  +'.foot-addr{font-size:10px;color:rgba(255,255,255,.25);text-align:right;}'
  +'@media print{'
    +'.page{max-width:100%;}'
    +'body{background:#fff;}'
  +'}'
  +'</style></head><body>'
  +'<div class="page">'
  // Header
  +'<div class="hdr">'
    +'<div class="hdr-brand">'
      +'<div class="hdr-logo">'+emp.nome+'</div>'
      +'<div class="hdr-tag">Mármores · Granitos · Quartzitos</div>'
    +'</div>'
    +'<div class="hdr-right">'
      +'<div class="hdr-tel">'+emp.tel+'</div>'
      +'<div class="hdr-city">'+emp.cidade+'</div>'
    +'</div>'
  +'</div>'
  // Title bar
  +'<div class="tbar">'
    +'<div>'
      +'<div class="tbar-title">'+(isCoz?'🍳':'🚿')+' '+titulo+'</div>'
      +'<div class="tbar-sub">Modelos disponíveis · Preços de venda</div>'
    +'</div>'
  +'</div>'
  // Cards grid
  +'<div class="grid">'+cardsHtml+'</div>'
  // Footer
  +'<div class="foot">'
    +'<div class="foot-txt">CNPJ: '+emp.cnpj+' · '+emp.ig+'</div>'
    +'<div class="foot-addr">'+emp.end+'</div>'
  +'</div>'
  +'</div>'
  // Auto print
  +'<script>window.onload=function(){setTimeout(function(){window.print();},400);}<\/script>'
  +'</body></html>';

  // Baixar como HTML (funciona no Android - open in new window é bloqueado)
  var blob=new Blob([html],{type:'text/html;charset=utf-8'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  var cat=isCoz?'Cozinha':'Banheiro';
  a.href=url;a.download='Catalogo_Cubas_'+cat+'_HR.html';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  setTimeout(function(){URL.revokeObjectURL(url);},8000);
  toast('📥 Catálogo baixado! Abra o arquivo e use Compartilhar → Imprimir → Salvar PDF');
}

// ═══ COMPARTILHAR CATÁLOGO CUBAS ═══
function compartilharCatalogoCubas(){
  var lista=cubaCat==='coz'?CFG.coz:CFG.lav;
  var titulo=cubaCat==='coz'?'🍳 CUBAS PARA COZINHA':'🚿 CUBAS PARA BANHEIRO/LAVABO';
  var emp=CFG.emp;
  var txt=emp.nome+'\n'+emp.tel+'\n'+(emp.ig||'')+'\n\n';
  txt+='━━━━━━━━━━━━━━━━━━━━\n';
  txt+=titulo+'\n';
  txt+='━━━━━━━━━━━━━━━━━━━━\n\n';
  lista.filter(function(c){return c.pr>0;}).forEach(function(c){
    txt+='◆ '+c.nm+'\n';
    txt+='  '+c.brand+' · '+c.dim+'\n';
    txt+='  💰 R$ '+c.pr.toLocaleString('pt-BR')+'\n\n';
  });
  txt+='━━━━━━━━━━━━━━━━━━━━\n';
  txt+='📍 '+emp.end+'\n';
  txt+='📞 '+emp.tel;
  var url='https://wa.me/?text='+encodeURIComponent(txt);
  window.open(url,'_blank');
}

// ═══ EMPRESA ═══
function updEmp(){
  var e=CFG.emp;
  // Header
  var hnm=document.querySelector('.hnm');
  if(hnm)hnm.innerHTML=(e.nome||'HR Mármores e Granitos')+' <span class="hsub">& GRANITOS · '+(e.cidade||'PILÃO ARCADO').toUpperCase()+'</span>';
  // Splash hero — update from CFG
  var el;
  el=document.getElementById('spName'); if(el)el.textContent=e.nome||'HR Mármores e Granitos';
  el=document.getElementById('spTagline'); if(el)el.textContent=(e.tipo||'Marmoraria')+' · '+(e.cidade||'Pilão Arcado — BA');
  el=document.getElementById('spTel'); if(el)el.textContent=e.tel||'';
  el=document.getElementById('spIg'); if(el)el.textContent=e.ig||'';
  el=document.getElementById('spAddr'); if(el)el.textContent=e.end?(e.end+' · '+e.cidade):(e.cidade||'');
  el=document.getElementById('spCnpj'); if(el)el.textContent=e.cnpj?'CNPJ '+e.cnpj:'';
  // Logo
  el=document.getElementById('spLogo');
  if(el){
    var logoSrc=e.logoUrl||DEF_EMP.logoUrl||'';
    if(logoSrc){el.innerHTML='<img src="'+logoSrc+'" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">';el.style.padding='0';}
    else{var w2=(e.nome||'HR').trim().split(' ');el.textContent=(w2.length>=2?w2[0][0]+w2[1][0]:w2[0].substring(0,2)).toUpperCase();el.style.padding='';}
  }
}
function renderInfoList(){
  var e=CFG.emp;
  document.getElementById('infoList').innerHTML='<div class="infrow"><div class="infic">📍</div><div><div class="infl">Endereço</div><div class="infv">'+e.end+'</div></div></div><div class="infrow"><div class="infic">🏙️</div><div><div class="infl">Cidade</div><div class="infv">'+e.cidade+'</div></div></div><div class="infrow"><div class="infic">📱</div><div><div class="infl">WhatsApp</div><div class="infv">'+e.tel+'</div></div></div><div class="infrow"><div class="infic">📸</div><div><div class="infl">Instagram</div><div class="infv">'+e.ig+'</div></div></div><div class="infrow"><div class="infic">✉️</div><div><div class="infl">E-mail</div><div class="infv">'+e.email+'</div></div></div><div class="infrow"><div class="infic">🏦</div><div><div class="infl">Banco</div><div class="infv">'+e.banco+'</div></div></div>';
}
function buildPT(){
  var cats=['Granito','Granito Preto','Granito Branco','Mármore','Quartzito'],h='';
  cats.forEach(function(cat){var ss=CFG.stones.filter(function(s){return s.cat===cat;});if(!ss.length)return;h+='<div class="ptcat">'+cat+'</div>';ss.forEach(function(s){h+='<div class="ptrow"><span class="ptnm">'+s.nm+(s.fin==='Escovada'?' (Escovada)':'')+'</span><span class="ptpr">R$ '+s.pr.toLocaleString('pt-BR')+'/m²</span></div>';});});
  document.getElementById('ptWrap').innerHTML=h;
}

// ═══ CONFIG ═══
function buildCfg(){
  var h='';
  if(cfgTab===0){
    // PEDRAS
    CFG.stones.forEach(function(s,i){
      var bg=s.photo?('<img class="csw-bg" src="'+s.photo+'" alt="'+s.nm+'" style="width:100%;height:100%;object-fit:cover;display:block;">'):'';
      h+='<div class="cfgsec">';
      h+='<div class="cfgphoto"><div class="'+(s.photo?'':'cfgphoto-bg '+s.tx)+'">'+(s.photo?bg:'')+'</div>';
      h+='<div class="cfgphoto-overlay"><div class="cfgphoto-info"><div class="cfgphoto-nm">'+s.nm+'</div><div class="cfgphoto-cat">'+s.cat+' · '+s.fin+'</div></div><div class="cfgphoto-price">R$ '+s.pr+'</div>';
      h+='<button class="cfgphoto-btn" data-pp="stone" data-idx="'+i+'">📷 '+(s.photo?'Trocar':'Adicionar')+'</button></div></div>';
      h+='<div class="cfg-row"><span class="cfg-lbl">Nome</span><input class="cfginp" style="width:150px;text-align:right;" value="'+s.nm+'" onchange="CFG.stones['+i+'].nm=this.value;buildMat();buildCatalog();svCFG();"></div>';
      h+='<div class="cfg-row"><span class="cfg-lbl">Categoria</span><select class="cfginp" style="width:140px;" onchange="CFG.stones['+i+'].cat=this.value;buildMat();buildCatalog();buildPT();svCFG();">';
      ['Granito Cinza','Granito Preto','Granito Branco','Granito Verde','Mármore','Travertino','Quartzito','Ultra Compacto'].forEach(function(cat){h+='<option '+(s.cat===cat?'selected':'')+'>'+cat+'</option>';});
      h+='</select></div>';
      h+='<div class="cfg-row"><span class="cfg-lbl">Preço R$/m²</span><input class="cfginp cfginp-w" type="number" value="'+s.pr+'" onchange="CFG.stones['+i+'].pr=+this.value;buildMat();buildCatalog();buildPT();svCFG();"></div>';
      h+='<div class="cfg-row"><span class="cfg-lbl">Acabamento</span><select class="cfginp" style="width:120px;" onchange="CFG.stones['+i+'].fin=this.value;svCFG();"><option '+(s.fin==='Polida'?'selected':'')+'>Polida</option><option '+(s.fin==='Escovada'?'selected':'')+'>Escovada</option></select></div>';
      h+='<div style="padding:9px 13px;border-top:1px solid #0c0c10;display:flex;justify-content:space-between;align-items:center;">';
      h+='<div style="display:flex;gap:6px;">';
      h+='<button class="cfgbtn" onclick="if('+i+'>0){var a=CFG.stones.splice('+i+',1)[0];CFG.stones.splice('+(i-1)+',0,a);svCFG();buildCatalog();buildCfg();}" style="font-size:.8rem;padding:5px 10px;">↑</button>';
      h+='<button class="cfgbtn" onclick="if('+(i+1)+'<CFG.stones.length){var a=CFG.stones.splice('+i+',1)[0];CFG.stones.splice('+(i+1)+',0,a);svCFG();buildCatalog();buildCfg();}" style="font-size:.8rem;padding:5px 10px;">↓</button>';
      h+="</div>";
      h+='<button class="cfgdel" onclick="if(confirm(\'Remover '+s.nm+'?\')){CFG.stones.splice('+i+',1);buildMat();buildCatalog();buildPT();svCFG();buildCfg();}">✕ Remover</button></div>';
      h+='</div>';
    });
    h+='<button class="cfgadd" onclick="CFG.stones.push({id:\'s_\'+Date.now(),nm:\'Nova Pedra\',cat:\'Granito\',fin:\'Polida\',pr:300,tx:\'tx-andorinha\',photo:\'\',desc:\'\'});buildMat();buildCatalog();buildPT();svCFG();buildCfg();">+ Nova Pedra</button>';
  }
  else if(cfgTab===1){
    // CUBAS COZINHA
    h+='<div style="font-size:.75rem;color:var(--t2);margin-bottom:12px;line-height:1.6;">Toque em <b>📷</b> na foto para trocar pela imagem da sua galeria.</div>';
    CFG.coz.forEach(function(c,i){
      h+='<div class="cfgsec">';
      h+='<div class="cfg-cuba-row"><div class="cfg-cuba-thumb">'+(c.photo?'<img src="'+c.photo+'" alt="">':'<div style="font-size:1.4rem;color:var(--t3);display:grid;place-items:center;width:100%;height:100%;">🔧</div>')+'<button class="cfg-cuba-thumb-btn" data-pp="coz" data-idx="'+i+'">📷</button></div>';
      h+='<div class="cfg-cuba-info"><div class="cfg-cuba-nm">'+c.brand+' — '+c.nm+'</div><div class="cfg-cuba-dim">'+c.dim+'</div>';
      h+='<div style="display:flex;gap:8px;margin-top:5px;"><div style="flex:1;"><div style="font-size:.55rem;color:var(--t4);margin-bottom:2px;">Venda R$</div><input class="cfginp" type="number" value="'+c.pr+'" style="width:100%;" onchange="CFG.coz['+i+'].pr=+this.value;buildCubaList();svCFG();"></div><div style="flex:1;"><div style="font-size:.55rem;color:var(--t4);margin-bottom:2px;">M.O. R$</div><input class="cfginp" type="number" value="'+c.inst+'" style="width:100%;" onchange="CFG.coz['+i+'].inst=+this.value;buildCubaList();svCFG();"></div></div>';
      h+='</div></div>';
      h+='<div class="cfg-row"><span class="cfg-lbl">Nome</span><input class="cfginp cfginp-w" value="'+c.nm+'" onchange="CFG.coz['+i+'].nm=this.value;svCFG();"></div>';
      h+='<div class="cfg-row"><span class="cfg-lbl">Dimensões</span><input class="cfginp cfginp-w" value="'+c.dim+'" onchange="CFG.coz['+i+'].dim=this.value;svCFG();"></div>';
      h+='<div style="display:flex;gap:6px;padding:8px 13px;border-top:1px solid #0c0c10;">';
      h+='<button class="cfgbtn" onclick="if('+i+'>0){var x=CFG.coz.splice('+i+',1)[0];CFG.coz.splice('+(i-1)+',0,x);svCFG();buildCubaList();buildCfg();}">↑</button>';
      h+='<button class="cfgbtn" onclick="if('+(i+1)+'<CFG.coz.length){var x=CFG.coz.splice('+i+',1)[0];CFG.coz.splice('+(i+1)+',0,x);svCFG();buildCubaList();buildCfg();}">↓</button>';
      h+='<button class="cfgdel" onclick="if(confirm(\'Remover esta cuba?\')){CFG.coz.splice('+i+',1);svCFG();buildCubaList();buildCfg();}">✕ Remover</button>';
      h+='</div>';
      h+='</div>';
    });
    h+='<button class="cfgadd" onclick="CFG.coz.push({id:\'c_\'+Date.now(),nm:\'Nova Cuba\',brand:\'Inox\',dim:\'??cm\',pr:0,inst:110,instCli:160,photo:\'\'});svCFG();buildCfg();">+ Nova Cuba</button>';
  }
  else if(cfgTab===2){
    // CUBAS BANHEIRO
    h+='<div style="font-size:.75rem;color:var(--t2);margin-bottom:12px;line-height:1.6;">Toque em <b>📷</b> na foto para trocar pela imagem da sua galeria.</div>';
    CFG.lav.forEach(function(c,i){
      var isEsc=c.tipo==='Esculpida';
      h+='<div class="cfgsec">';
      h+='<div class="cfg-cuba-row"><div class="cfg-cuba-thumb">'+(c.photo?'<img src="'+c.photo+'" alt="">':'<div style="font-size:1.4rem;color:var(--t3);display:grid;place-items:center;width:100%;height:100%;">'+(isEsc?'🪨':'🚿')+'</div>')+'<button class="cfg-cuba-thumb-btn" data-pp="lav" data-idx="'+i+'">📷</button></div>';
      h+='<div class="cfg-cuba-info"><div class="cfg-cuba-nm">'+(c.brand?c.brand+' — ':'')+c.nm+'</div><div class="cfg-cuba-dim">'+c.dim+(c.tipo?' · '+c.tipo:'')+'</div>';
      if(!isEsc){h+='<div style="display:flex;gap:8px;margin-top:5px;"><div style="flex:1;"><div style="font-size:.55rem;color:var(--t4);margin-bottom:2px;">Venda R$</div><input class="cfginp" type="number" value="'+c.pr+'" style="width:100%;" onchange="CFG.lav['+i+'].pr=+this.value;buildCubaList();svCFG();"></div><div style="flex:1;"><div style="font-size:.55rem;color:var(--t4);margin-bottom:2px;">M.O. R$</div><input class="cfginp" type="number" value="'+c.inst+'" style="width:100%;" onchange="CFG.lav['+i+'].inst=+this.value;buildCubaList();svCFG();"></div></div>';}
      else{h+='<div style="margin-top:5px;"><div style="font-size:.55rem;color:var(--t4);margin-bottom:2px;">M.O. Esculpida R$</div><input class="cfginp" type="number" value="'+c.inst+'" style="width:110px;" onchange="CFG.lav['+i+'].inst=+this.value;buildCubaList();svCFG();"></div>';}
      h+='</div></div>';
      h+='<div class="cfg-row"><span class="cfg-lbl">Nome</span><input class="cfginp cfginp-w" value="'+c.nm+'" onchange="CFG.lav['+i+'].nm=this.value;svCFG();"></div>';
      h+='<div style="display:flex;gap:6px;padding:8px 13px;border-top:1px solid #0c0c10;">';
      h+='<button class="cfgbtn" onclick="if('+i+'>0){var x=CFG.lav.splice('+i+',1)[0];CFG.lav.splice('+(i-1)+',0,x);svCFG();buildCubaList();buildCfg();}">↑</button>';
      h+='<button class="cfgbtn" onclick="if('+(i+1)+'<CFG.lav.length){var x=CFG.lav.splice('+i+',1)[0];CFG.lav.splice('+(i+1)+',0,x);svCFG();buildCubaList();buildCfg();}">↓</button>';
      h+='<button class="cfgdel" onclick="if(confirm(\'Remover esta cuba?\')){CFG.lav.splice('+i+',1);svCFG();buildCubaList();buildCfg();}">✕ Remover</button>';
      h+='</div>';
      h+='</div>';
    });
    h+='<button class="cfgadd" onclick="CFG.lav.push({id:\'l_\'+Date.now(),nm:\'Nova Cuba\',brand:\'Marca\',dim:\'??cm\',tipo:\'Louça\',pr:0,inst:220,instCli:280,photo:\'\'});svCFG();buildCfg();">+ Nova Cuba</button>';
  }
  else if(cfgTab===3){
    // SERVIÇOS — editável: nome, preço, adicionar, remover, reordenar
    h+='<div style="font-size:.72rem;color:var(--t2);margin-bottom:12px;line-height:1.6;">Edite o nome e preço de cada serviço. Adicione novos acabamentos conforme necessário.</div>';

    // CFG.svList: array de {k, l, preco, grp, u}
    // Se não existir ainda, inicializa a partir de DEF_SV_LIST
    if(!CFG.svList){
      CFG.svList=[
        {k:'s_reta',    l:'Sainha Reta',           preco:CFG.sv.s_reta||70,    grp:'Sainha/Frontão',u:'sf'},
        {k:'s_45',      l:'Sainha 45°',             preco:CFG.sv.s_45||130,     grp:'Sainha/Frontão',u:'sf'},
        {k:'s_boleada', l:'Sainha Boleada',         preco:CFG.sv.s_boleada||170,grp:'Sainha/Frontão',u:'sf'},
        {k:'s_slim',    l:'Sainha Slim',            preco:CFG.sv.s_slim||50,    grp:'Sainha/Frontão',u:'sf'},
        {k:'frontao',   l:'Frontão Reto',           preco:CFG.sv.frontao||90,   grp:'Sainha/Frontão',u:'sf'},
        {k:'frontao_chf',l:'Frontão Chanfrado',     preco:CFG.sv.frontao_chf||110,grp:'Sainha/Frontão',u:'sf'},
        {k:'rodape',    l:'Rodapé de Pedra',        preco:CFG.sv.rodape||55,    grp:'Sainha/Frontão',u:'sf'},
        {k:'sol1',      l:'Soleira 1 lado',          preco:CFG.sv.sol1||35,      grp:'Soleira/Peitoril',u:'ml'},
        {k:'sol2',      l:'Soleira 2 lados',         preco:CFG.sv.sol2||60,      grp:'Soleira/Peitoril',u:'ml'},
        {k:'peit_reto', l:'Peitoril Reto',          preco:CFG.sv.peit_reto||40, grp:'Soleira/Peitoril',u:'ml'},
        {k:'peit_ping', l:'c/ Pingadeira',          preco:CFG.sv.peit_ping||70, grp:'Soleira/Peitoril',u:'ml'},
        {k:'peit_col',  l:'c/ Pedra Colada+Pingadeira',preco:CFG.sv.peit_col||120,grp:'Soleira/Peitoril',u:'ml'},
        {k:'peit_portal',l:'p/ Portal Madeira',     preco:CFG.sv.peit_portal||180,grp:'Soleira/Peitoril',u:'ml'},
        {k:'forn',      l:'Furo Torneira',          preco:CFG.sv.forn||45,      grp:'Furos & Recortes',u:'un'},
        {k:'fralo',     l:'Furo Ralo',              preco:CFG.sv.fralo||45,     grp:'Furos & Recortes',u:'un'},
        {k:'cook',      l:'Recorte Cooktop',        preco:CFG.sv.cook||140,     grp:'Furos & Recortes',u:'un'},
        {k:'reb_n',     l:'Rebaixo Normal',         preco:CFG.sv.reb_n||200,    grp:'Rebaixo',u:'un'},
        {k:'reb_a',     l:'Rebaixo Americano',      preco:CFG.sv.reb_a||380,    grp:'Rebaixo',u:'un'},
        {k:'tubo',      l:'Tubo Metálico',          preco:CFG.sv.tubo||60,      grp:'Fixação',u:'un'},
        {k:'cant',      l:'Cantoneira',             preco:CFG.sv.cant||110,     grp:'Fixação',u:'un'},
        {k:'inst',      l:'Instalação Padrão',      preco:CFG.sv.inst||280,     grp:'Instalação',u:'un'},
        {k:'inst_c',    l:'Instalação Complexa',    preco:CFG.sv.inst_c||420,   grp:'Instalação',u:'un'},
        {k:'desl_for',  l:'Deslocamento fora cidade',preco:CFG.sv.desl_for||3.5,grp:'Deslocamento',u:'km'}
      ];
      svCFG();
    }

    // Sync CFG.sv from svList
    function syncSvList(){
      CFG.svList.forEach(function(sv){CFG.sv[sv.k]=sv.preco;});
      svCFG();
    }

    // Group display
    var grps={};
    CFG.svList.forEach(function(sv,i){
      if(!grps[sv.grp])grps[sv.grp]=[];
      grps[sv.grp].push({sv:sv,i:i});
    });

    Object.keys(grps).forEach(function(grpNm){
      h+='<div class="cfgsec">';
      h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">';
      h+='<div class="cfghd" style="margin:0;">'+grpNm+'</div>';
      h+='<button class="cfgbtn" style="font-size:.68rem;padding:4px 10px;" onclick="CFG.svList.push({k:\'sv_\'+(Date.now()),l:\'Novo Acabamento\',preco:0,grp:\''+grpNm+'\',u:\'ml\'});syncSvList=function(){CFG.svList.forEach(function(sv){CFG.sv[sv.k]=sv.preco;});svCFG();};svCFG();buildCfg();">+ Adicionar</button>';
      h+='</div>';
      grps[grpNm].forEach(function(item){
        var sv=item.sv,i=item.i;
        h+='<div class="cfg-row" style="gap:6px;flex-wrap:wrap;">';
        // Nome editável
        h+='<input class="cfginp" value="'+escH(sv.l)+'" style="flex:1;min-width:120px;text-align:left;" onchange="CFG.svList['+i+'].l=this.value;svCFG();" placeholder="Nome do serviço">';
        // Preço
        h+='<input class="cfginp cfginp-w" type="number" value="'+sv.preco+'" style="width:72px;" onchange="CFG.svList['+i+'].preco=+this.value;CFG.sv[CFG.svList['+i+'].k]=+this.value;svCFG();" placeholder="R$">';
        // Unidade
        h+='<select class="cfginp" style="width:58px;padding:6px 4px;" onchange="CFG.svList['+i+'].u=this.value;svCFG();">';
        h+='<option '+(sv.u==='sf'?'selected':'')+'>sf</option>';
        h+='<option '+(sv.u==='ml'?'selected':'')+'>ml</option>';
        h+='<option '+(sv.u==='un'?'selected':'')+'>un</option>';
        h+='<option '+(sv.u==='km'?'selected':'')+'>km</option>';
        h+='</select>';
        // Mover e remover
        h+='<button class="cfgbtn" onclick="if('+i+'>0){var x=CFG.svList.splice('+i+',1)[0];CFG.svList.splice('+(i-1)+',0,x);svCFG();buildCfg();}">↑</button>';
        h+='<button class="cfgbtn" onclick="if('+(i+1)+'<CFG.svList.length){var x=CFG.svList.splice('+i+',1)[0];CFG.svList.splice('+(i+1)+',0,x);svCFG();buildCfg();}">↓</button>';
        h+='<button class="cfgdel" onclick="if(confirm(\'Remover '+escH(sv.l)+'?\')){CFG.svList.splice('+i+',1);delete CFG.sv[\''+sv.k+'\'];svCFG();buildCfg();}">✕</button>';
        h+='</div>';
      });
      h+='</div>';
    });

    // Botão para adicionar novo grupo
    h+='<button class="cfgadd" onclick="var g=prompt(\'Nome do novo grupo:\');if(g){CFG.svList.push({k:\'sv_\'+(Date.now()),l:\'Novo Acabamento\',preco:0,grp:g,u:\'ml\'});svCFG();buildCfg();}">+ Novo Grupo de Serviços</button>';
    h+='<div class="cfgsec"><div class="cfghd">Custos Fixos Mensais</div>';
    CFG.fixos.forEach(function(f,i){
      h+='<div class="cfg-row"><input class="cfginp" value="'+f.n+'" style="flex:1;text-align:left;" onchange="CFG.fixos['+i+'].n=this.value;renderFixos();svCFG();"><input class="cfginp cfginp-w" type="number" value="'+f.v+'" onchange="CFG.fixos['+i+'].v=+this.value;renderFixos();svCFG();"><button class="cfgdel" onclick="CFG.fixos.splice('+i+',1);renderFixos();svCFG();buildCfg();">✕</button></div>';
    });
    h+='<button class="cfgadd" onclick="CFG.fixos.push({n:\'Novo custo\',v:0});renderFixos();svCFG();buildCfg();">+ Adicionar custo fixo</button>';
    h+='</div>';
  }
  else if(cfgTab===6){
    // ACESSÓRIOS
    h+='<div style="font-size:.75rem;color:var(--t2);margin-bottom:12px;line-height:1.6;">Adicione seus acessórios. Toque em 📷 para adicionar foto da galeria.</div>';
    (CFG.ac||[]).forEach(function(a,i){
      h+='<div class="cfgsec">';
      // Foto
      h+='<div style="width:100%;height:120px;position:relative;overflow:hidden;background:var(--s3);border-bottom:1px solid var(--bd);">';
      if(a.photo){
        h+='<img src="'+a.photo+'" style="width:100%;height:100%;object-fit:cover;display:block;">';
      } else {
        h+='<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2.5rem;color:var(--t4);">🔩</div>';
      }
      h+='<button data-pp="ac" data-idx="'+i+'" style="position:absolute;bottom:7px;right:7px;background:rgba(0,0,0,.75);border:1px solid rgba(255,255,255,.25);border-radius:8px;color:#fff;font-size:.7rem;padding:5px 10px;cursor:pointer;font-family:Outfit,sans-serif;">📷 '+(a.photo?'Trocar':'Adicionar')+'</button>';
      h+='</div>';
      // Campos
      h+='<div class="cfg-row"><span class="cfg-lbl">Nome</span><input class="cfginp" value="'+escH(a.nm)+'" style="width:160px;text-align:right;" onchange="CFG.ac['+i+'].nm=this.value;svCFG();"></div>';
      h+='<div class="cfg-row"><span class="cfg-lbl">Marca</span><input class="cfginp" value="'+escH(a.marca||'')+'" style="width:160px;text-align:right;" placeholder="opcional" onchange="CFG.ac['+i+'].marca=this.value;svCFG();"></div>';
      h+='<div class="cfg-row"><span class="cfg-lbl">Dimensões</span><input class="cfginp" value="'+escH(a.dim||'')+'" style="width:160px;text-align:right;" placeholder="Ex: 60cm" onchange="CFG.ac['+i+'].dim=this.value;svCFG();"></div>';
      h+='<div class="cfg-row"><span class="cfg-lbl">Preço R$</span><input class="cfginp cfginp-w" type="number" value="'+(a.pr||0)+'" onchange="CFG.ac['+i+'].pr=+this.value;svCFG();"></div>';
      h+='<div style="padding:9px 13px 4px;"><label style="font-size:.62rem;color:var(--t3);letter-spacing:.8px;text-transform:uppercase;margin-bottom:4px;display:block;">Descrição</label><textarea class="cfginp" rows="2" style="width:100%;text-align:left;resize:none;" onchange="CFG.ac['+i+'].desc=this.value;svCFG();">'+escH(a.desc||'')+'</textarea></div>';
      h+='<div style="padding:9px 13px;display:flex;gap:6px;">';
      h+='<button class="cfgbtn" onclick="if('+i+'>0){var x=CFG.ac.splice('+i+',1)[0];CFG.ac.splice('+(i-1)+',0,x);svCFG();buildAcList();buildCfg();}">↑ Subir</button>';
      h+='<button class="cfgbtn" onclick="if('+(i+1)+'<CFG.ac.length){var x=CFG.ac.splice('+i+',1)[0];CFG.ac.splice('+(i+1)+',0,x);svCFG();buildAcList();buildCfg();}">↓ Descer</button>';
      h+='<button class="cfgdel" onclick="if(confirm(\'Remover '+escH(a.nm)+'?\')){CFG.ac.splice('+i+',1);svCFG();buildCfg();}">✕</button>';
      h+='</div>';
      h+='</div>';
    });
    h+='<button class="cfgadd" onclick="CFG.ac.push({id:\'ac_\'+Date.now(),nm:\'Novo Acessório\',marca:\'\',dim:\'\',pr:0,desc:\'\',photo:\'\'});svCFG();buildCfg();">+ Adicionar Acessório</button>';
  }
  else if(cfgTab===4){
    // EMPRESA — completo e organizado
    var e=CFG.emp;
    h+='<div class="cfgsec">';
    h+='<div class="cfghd">🏢 Identidade da Empresa</div>';
    h+='<div style="padding:12px 13px 6px;">';
    // Logo upload
    h+='<div style="display:flex;align-items:center;gap:14px;margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--bd);">';
    h+='<div id="cfgLogoPreview" onclick="document.getElementById(\'fileLogoInp\').click()" style="width:70px;height:70px;border-radius:16px;background:linear-gradient(145deg,#c9a84c,#8b6014);display:flex;align-items:center;justify-content:center;font-family:Cormorant Garamond,serif;font-size:1.6rem;font-weight:700;color:#1a0e00;cursor:pointer;flex-shrink:0;overflow:hidden;">';
    if(e.logoUrl){
      h+='<img src="'+e.logoUrl+'" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">';
    } else {
      var w2=(e.nome||'HR').trim().split(/\s+/);
      var ini2=w2.length>=2?w2[0][0]+w2[1][0]:w2[0].substring(0,2);
      h+=ini2.toUpperCase();
    }
    h+='</div>';
    h+='<div style="flex:1;">';
    h+='<div style="font-size:.75rem;font-weight:700;color:var(--t2);margin-bottom:4px;">Logo da empresa</div>';
    h+='<div style="font-size:.65rem;color:var(--t3);line-height:1.5;margin-bottom:8px;">Aparece na tela inicial e nos documentos. Toque na logo para alterar.</div>';
    h+='<button onclick="document.getElementById(\'fileLogoInp\').click()" style="background:var(--gdim);border:1px solid var(--gold3);border-radius:8px;padding:6px 12px;color:var(--gold2);font-family:Outfit,sans-serif;font-size:.7rem;cursor:pointer;">📷 Alterar Logo</button>';
    h+='<input type="file" id="fileLogoInp" accept="image/*" style="display:none;" onchange="var r=new FileReader();r.onload=function(e2){CFG.emp.logoUrl=e2.target.result;svCFG();updEmp();buildCfg();};r.readAsDataURL(this.files[0]);">';
    if(e.logoUrl)h+=' <button onclick="delete CFG.emp.logoUrl;svCFG();updEmp();buildCfg();" style="background:var(--s3);border:1px solid var(--bd2);border-radius:8px;padding:6px 10px;color:var(--t3);font-family:Outfit,sans-serif;font-size:.7rem;cursor:pointer;margin-left:4px;">✕ Remover</button>';
    h+='</div></div>';

    // Dados básicos
    var campos=[
      ['nome','🏢 Nome da Empresa','text','HR Mármores e Granitos'],
      ['tipo','🪨 Tipo (ex: Marmoraria)','text','Marmoraria'],
      ['cnpj','📄 CNPJ','text','64.639.182/0001-28'],
    ];
    campos.forEach(function(x){
      h+='<div class="cfg-row"><span class="cfg-lbl">'+x[0]==='nome'?'Nome':x[0]==='tipo'?'Tipo':x[0]==='cnpj'?'CNPJ':''+x[1]+'</span>';
      h+='<input class="cfginp" type="'+x[2]+'" value="'+(e[x[0]]||'')+'" placeholder="'+x[3]+'" style="flex:1;text-align:right;" onchange="CFG.emp[\''+x[0]+'\']=this.value;updEmp();svCFG();"></div>';
    });
    h+='</div></div>';

    // Contato
    h+='<div class="cfgsec"><div class="cfghd">📞 Contato</div><div style="padding:6px 13px 10px;">';
    var contato=[
      ['tel','Telefone / WhatsApp','tel','(74) 99148-4460'],
      ['email','E-mail','email','giliardhangel18@gmail.com'],
      ['ig','Instagram','text','@HR Marmores e Granitos'],
      ['site','Site','url',''],
    ];
    contato.forEach(function(x){
      h+='<div class="cfg-row" style="padding:7px 0;border-bottom:1px solid var(--bd);"><span class="cfg-lbl">'+({'tel':'Telefone','email':'E-mail','ig':'Instagram','site':'Site'}[x[0]])+'</span>';
      h+='<input class="cfginp" type="'+x[2]+'" value="'+(e[x[0]]||'')+'" placeholder="'+x[3]+'" style="flex:1;text-align:right;" onchange="CFG.emp[\''+x[0]+'\']=this.value;updEmp();svCFG();"></div>';
    });
    h+='</div></div>';

    // Endereço
    h+='<div class="cfgsec"><div class="cfghd">📍 Endereço</div><div style="padding:6px 13px 10px;">';
    var enderecos=[
      ['end','Endereço','Av. Dep. Rodolfo Queiroz, 653'],
      ['bairro','Bairro','Centro'],
      ['cidade','Cidade','Pilão Arcado — BA'],
    ];
    enderecos.forEach(function(x){
      h+='<div class="cfg-row" style="padding:7px 0;border-bottom:1px solid var(--bd);"><span class="cfg-lbl">'+x[0]==='end'?'Endereço':x[0]==='bairro'?'Bairro':'Cidade'+'</span>';
      h+='<input class="cfginp" type="text" value="'+(e[x[0]]||'')+'" placeholder="'+x[2]+'" style="flex:1;text-align:right;" onchange="CFG.emp[\''+x[0]+'\']=this.value;updEmp();svCFG();"></div>';
    });
    h+='</div></div>';

    // Financeiro
    h+='<div class="cfgsec"><div class="cfghd">💳 Dados Financeiros</div><div style="padding:6px 13px 10px;">';
    var fin=[['banco','Banco','SICOOB Credirochas'],['chavePix','Chave Pix',''],['titular','Titular','']];
    fin.forEach(function(x){
      h+='<div class="cfg-row" style="padding:7px 0;border-bottom:1px solid var(--bd);"><span class="cfg-lbl">'+({banco:'Banco',chavePix:'Chave Pix',titular:'Titular'}[x[0]])+'</span>';
      h+='<input class="cfginp" type="text" value="'+(e[x[0]]||'')+'" placeholder="'+x[2]+'" style="flex:1;text-align:right;" onchange="CFG.emp[\''+x[0]+'\']=this.value;svCFG();"></div>';
    });
    h+='</div></div>';

    // Horário de funcionamento
    h+='<div class="cfgsec"><div class="cfghd">🕐 Horário de Funcionamento</div>';
    h+='<div style="padding:10px 13px;">';
    h+='<input class="cfginp" type="text" value="'+(e.horario||'Seg–Sex: 8h às 18h | Sáb: 8h às 13h')+'" placeholder="Ex: Seg–Sex: 8h às 18h" style="width:100%;" onchange="CFG.emp.horario=this.value;svCFG();">';
    h+='</div></div>';

    // IA
    h+='<div class="cfgsec"><div class="cfghd">🤖 Inteligência Artificial</div>';
    h+='<div style="padding:10px 13px;font-size:.72rem;color:var(--t3);line-height:1.7;margin-bottom:6px;">A API Key permite usar IA para interpretar projetos. Obtenha em <span style="color:#10a37f;">platform.openai.com</span> → API Keys. Gratuito para quem tem ChatGPT Pro.</div>';
    h+='<div class="cfg-row"><span class="cfg-lbl">API Key OpenAI (ChatGPT)</span><input class="cfginp" type="password" value="'+(e.apiKey||'')+'" placeholder="sk-proj-..." style="flex:1;text-align:right;font-family:monospace;" onchange="CFG.emp.apiKey=this.value;svCFG();toast(\'✓ API Key salva!\');"></div>';
    h+='<div style="padding:9px 13px;"><button onclick="testarAPIKey()" style="padding:7px 14px;background:var(--gdim);border:1px solid var(--gold3);border-radius:8px;color:var(--gold2);font-family:Outfit,sans-serif;font-size:.75rem;cursor:pointer;">Testar conexão</button><span id="apiTestResult" style="font-size:.72rem;color:var(--t3);margin-left:10px;"></span></div>';
    h+='</div>';

    // Sincronização
    h+='<div class="cfgsec"><div class="cfghd">📡 Sincronização Celular ↔ Tablet</div>';
    h+='<div style="padding:13px;">';
    h+='<div style="font-size:.76rem;color:var(--t2);line-height:1.65;margin-bottom:12px;">Use o mesmo <b>código</b> em todos os dispositivos para sincronizar dados em tempo real.</div>';
    var syncAtivo=SYNC.on||!!localStorage.getItem('hr_sync_code');
    if(syncAtivo){
      h+='<div style="background:#0a1f12;border:1px solid var(--grn);border-radius:9px;padding:11px 13px;margin-bottom:10px;display:flex;align-items:center;gap:8px;">';
      h+='<span style="font-size:1rem;">✅</span><div style="flex:1;"><div style="font-size:.8rem;font-weight:600;color:var(--grn);">Sincronização ativa</div><div style="font-size:.65rem;color:var(--t3);">Código: <b style="color:var(--gold2);">'+SYNC.code+'</b></div></div></div>';
      h+='<button class="btn btn-o" style="font-size:.78rem;padding:10px;margin-bottom:8px;" onclick="SYNC.push();toast(\'↑ Enviado!\')">↑ Enviar dados agora</button>';
      h+='<button class="btn btn-red" style="font-size:.78rem;padding:10px;" onclick="SYNC.stop();buildCfg();">Desativar sincronização</button>';
    } else {
      h+='<div style="display:flex;gap:8px;margin-bottom:8px;">';
      h+='<input id="syncCodeInp" class="cfginp" style="flex:1;text-align:left;" placeholder="Ex: HR2025, MeuNegocio123..." value="'+SYNC.code+'">';
      h+='<button class="btn btn-g btn-sm" onclick="var c=document.getElementById(\'syncCodeInp\').value.trim().replace(/\\s+/g,\'_\');if(!c){toast(\'Digite um código\');return;}SYNC.init(c);buildCfg();">Ativar</button>';
      h+='</div>';
      h+='<div style="font-size:.65rem;color:var(--t4);line-height:1.6;">⚠️ Requer internet. Use o mesmo código em todos os dispositivos.</div>';
    }
    h+='</div></div>';

    // Backup
    h+='<div class="cfgsec"><div class="cfghd">💾 Backup de Dados</div>';
    h+='<div style="padding:12px 13px;">';
    h+='<div style="font-size:.75rem;color:var(--t2);margin-bottom:12px;line-height:1.7;">Salve pedras, cubas, orçamentos e configurações em arquivo de backup.</div>';
    h+='<button class="btn btn-g" style="font-size:.8rem;padding:12px;margin-bottom:8px;width:100%;" onclick="baixarBackup()">📥 Baixar Backup Completo</button>';
    h+='<div style="border-top:1px solid var(--bd);padding-top:12px;margin-top:4px;">';
    h+='<button class="btn btn-o" style="font-size:.8rem;padding:12px;width:100%;" onclick="document.getElementById(\'fileBackup\').click()">📂 Carregar Backup</button>';
    h+='<input type="file" id="fileBackup" accept=".json" style="display:none;" onchange="carregarBackup(this)">';
    h+='</div></div></div>';

    // Perigo
    h+='<div class="cfgsec"><div class="cfghd" style="color:var(--red);">⚠️ Zona de Perigo</div>';
    h+='<div style="padding:12px 13px;">';
    h+='<button class="btn btn-red" onclick="if(confirm(\'APAGAR TUDO? Não pode ser desfeito!\')){localStorage.clear();location.reload();}">Apagar todos os dados</button>';
    h+='</div></div>';
  }
  else if(cfgTab===5){
    // CATÁLOGO DE CUBAS (visual)
    var allCubs=[{label:'🍳 Cubas para Cozinha',lista:CFG.coz},{label:'🚿 Cubas para Banheiro/Lavabo',lista:CFG.lav}];
    allCubs.forEach(function(grp){
      h+='<div style="font-size:.58rem;letter-spacing:2px;text-transform:uppercase;color:var(--gold);font-weight:600;margin:18px 17px 10px;">'+grp.label+'</div>';
      h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 17px;">';
      grp.lista.forEach(function(cu,i){
        var isEsc=cu.tipo==='Esculpida';
        var cli=cu.tipo==='Cliente';
        var tot=cu.pr+cu.inst;
        var prStr=cu.pr>0?'R$ '+cu.pr:'Consultar';
        var totStr=cu.pr>0?'R$ '+tot:'Consultar';
        h+='<div style="background:var(--s1);border:1px solid var(--bd);border-radius:14px;overflow:hidden;">';
        // photo
        if(cu.photo){
          h+='<div style="height:85px;overflow:hidden;"><img src="'+cu.photo+'" alt="" style="width:100%;height:100%;object-fit:cover;"></div>';
        } else {
          h+='<div style="height:85px;background:var(--s3);display:grid;place-items:center;font-size:2rem;">'+(isEsc?'🪨':cli?'📦':'🚰')+'</div>';
        }
        h+='<div style="padding:9px 10px 10px;">';
        h+='<div style="font-size:.66rem;font-weight:700;color:var(--t2);line-height:1.3;margin-bottom:3px;">'+cu.brand+'</div>';
        h+='<div style="font-size:.76rem;font-weight:700;color:var(--text);margin-bottom:2px;">'+cu.nm+'</div>';
        h+='<div style="font-size:.6rem;color:var(--t4);margin-bottom:6px;">'+cu.dim+'</div>';
        h+='<div style="display:flex;justify-content:space-between;align-items:baseline;">';
        h+='<div><div style="font-size:.52rem;color:var(--t4);">Cuba</div><div style="font-size:.78rem;font-weight:700;color:var(--gold2);">'+prStr+'</div></div>';
        h+='<div style="text-align:right;"><div style="font-size:.52rem;color:var(--t4);">M.O.</div><div style="font-size:.78rem;color:var(--t2);">R$ '+cu.inst+'</div></div>';
        h+='</div>';
        if(cu.pr>0){h+='<div style="margin-top:5px;background:var(--gdim);border-radius:6px;padding:4px 8px;display:flex;justify-content:space-between;"><span style="font-size:.58rem;color:var(--gold3);">Total</span><span style="font-size:.78rem;font-weight:700;color:var(--gold2);">'+totStr+'</span></div>';}
        h+='</div></div>';
      });
      h+='</div>';
    });
    // Cliente card
    h+='<div style="margin:12px 17px;background:var(--s2);border:1px solid var(--bd2);border-radius:12px;padding:12px 14px;display:flex;align-items:center;gap:12px;">';
    h+='<div style="font-size:1.8rem;">📦</div>';
    h+='<div><div style="font-weight:700;font-size:.84rem;">Cuba do Cliente</div><div style="font-size:.7rem;color:var(--t3);margin-top:2px;">Cliente compra, HR instala · Cozinha: R$ 160 · Banheiro: R$ 280</div></div>';
    h+='</div>';
  }
  else if(cfgTab===6){
    // ACESSÓRIOS
    h+='<div style="font-size:.75rem;color:var(--t2);margin-bottom:12px;line-height:1.6;">Adicione seus acessórios — dispensers, calhas, escorredores, etc. Toque em 📷 para adicionar foto da galeria.</div>';
    (CFG.ac||[]).forEach(function(a,i){
      h+='<div class="cfgsec">';
      // Foto
      h+='<div style="position:relative;height:110px;background:var(--s3);overflow:hidden;">';
      if(a.photo){
        h+='<img src="'+a.photo+'" style="width:100%;height:100%;object-fit:cover;">';
      } else {
        h+='<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:2.5rem;color:var(--t3);">🔩</div>';
      }
      h+='<button data-pp="ac" data-idx="'+i+'" style="position:absolute;bottom:7px;right:7px;background:rgba(0,0,0,.75);border:1px solid rgba(255,255,255,.2);border-radius:8px;color:#fff;font-size:.68rem;padding:5px 10px;cursor:pointer;font-family:Outfit,sans-serif;">📷 '+(a.photo?'Trocar':'Adicionar foto')+'</button>';
      h+='</div>';
      // Campos
      h+='<div class="cfg-row"><span class="cfg-lbl">Nome</span><input class="cfginp" style="width:160px;text-align:right;" value="'+escH(a.nm)+'" onchange="CFG.ac['+i+'].nm=this.value;svCFG();buildAcList();"></div>';
      h+='<div class="cfg-row"><span class="cfg-lbl">Marca</span><input class="cfginp" style="width:140px;text-align:right;" value="'+escH(a.marca||'')+'" placeholder="Opcional" onchange="CFG.ac['+i+'].marca=this.value;svCFG();"></div>';
      h+='<div class="cfg-row"><span class="cfg-lbl">Dimensões</span><input class="cfginp" style="width:140px;text-align:right;" value="'+escH(a.dim||'')+'" placeholder="Ex: 30cm, Sob medida" onchange="CFG.ac['+i+'].dim=this.value;svCFG();"></div>';
      h+='<div class="cfg-row"><span class="cfg-lbl">Preço R$</span><input class="cfginp cfginp-w" type="number" value="'+(a.pr||0)+'" placeholder="0 = Consultar" onchange="CFG.ac['+i+'].pr=+this.value;svCFG();buildAcList();"></div>';
      h+='<div style="padding:8px 13px;border-top:1px solid #0c0c10;"><label style="font-size:.62rem;color:var(--t3);">Descrição</label><textarea style="width:100%;background:var(--s3);border:1px solid var(--bd2);border-radius:8px;color:var(--tx);padding:8px 10px;font-size:.78rem;font-family:Outfit,sans-serif;outline:none;resize:none;margin-top:4px;" rows="2" onchange="CFG.ac['+i+'].desc=this.value;svCFG();">'+escH(a.desc||'')+'</textarea></div>';
      h+='<div style="padding:9px 13px;display:flex;gap:6px;">';
      h+='<button class="cfgbtn" onclick="if('+i+'>0){var x=CFG.ac.splice('+i+',1)[0];CFG.ac.splice('+(i-1)+',0,x);svCFG();buildAcList();buildCfg();}">↑ Subir</button>';
      h+='<button class="cfgbtn" onclick="if('+(i+1)+'<CFG.ac.length){var x=CFG.ac.splice('+i+',1)[0];CFG.ac.splice('+(i+1)+',0,x);svCFG();buildAcList();buildCfg();}">↓ Descer</button>';
      h+='<button class="cfgdel" onclick="if(confirm(\'Remover '+escH(a.nm)+'?\')){CFG.ac.splice('+i+',1);svCFG();buildAcList();buildCfg();}">✕</button>';
      h+='</div>';
      h+='</div>';
    });
    h+='<button class="cfgadd" onclick="CFG.ac.push({id:\'ac_\'+Date.now(),nm:\'Novo Acessório\',marca:\'\',dim:\'\',pr:0,desc:\'\',photo:\'\'});svCFG();buildCfg();">+ Adicionar Acessório</button>';
  }
  // Add save confirmation button at bottom
  h+='<div style="padding:16px 17px 32px;"><button onclick="svCFG();toast(\'✓ Configurações salvas!\');syncSVDefsFromList();buildCatalog();renderAmbientes();" style="width:100%;padding:14px;background:linear-gradient(135deg,var(--gold),var(--gold3));border:none;border-radius:12px;font-family:Outfit,sans-serif;font-size:.88rem;font-weight:900;color:#000;cursor:pointer;">✓ Salvar Configurações</button></div>';
  document.getElementById('cfgBody').innerHTML=h;
}
function importarDados(){
  var el=document.getElementById('cfgImport');
  var txt=el?el.value.trim():'';
  if(!txt)return;
  try{var d=JSON.parse(txt);if(d.cfg){CFG=d.cfg;localStorage.setItem('hr_cfg',JSON.stringify(CFG));}if(d.q)DB.q=d.q;if(d.j)DB.j=d.j;if(d.t)DB.t=d.t;DB.sv();toast('✓ Dados restaurados!');setTimeout(function(){location.reload();},800);}
  catch(e){toast('❌ Dados inválidos');}
}

// ═══ CONFIRM BANNER ═══
function showCB(q,onY,onN){document.getElementById('cbQ').textContent=q;document.getElementById('cbWrap').classList.add('on');cbYcb=onY;cbNcb=onN;var pg=document.getElementById('pg0');if(pg)pg.scrollTop=0;}
function hideCB(){document.getElementById('cbWrap').classList.remove('on');cbYcb=null;cbNcb=null;}

// ═══ UTILS ═══
function fm(v){return parseFloat(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});}
function fd(s){try{var p=s.split('-');return p[2]+'/'+p[1]+'/'+p[0];}catch(e){return s||'';}}
function dDiff(s){try{var t=new Date(s+'T00:00:00');var n=new Date();n.setHours(0,0,0,0);return Math.ceil((t-n)/86400000);}catch(e){return 0;}}
function addD(s,n){try{var d=new Date(s+'T00:00:00');d.setDate(d.getDate()+n);return d.toISOString().split('T')[0];}catch(e){return s;}}
function td(){return new Date().toISOString().split('T')[0];}
function lastEnd(){var a=DB.j.filter(function(j){return !j.done&&j.end;}).sort(function(a,b){return new Date(b.end)-new Date(a.end);});return a.length?a[0].end:null;}
// ═══════════════════════════════════════════════
// ── GERADOR DE PDF PARA TÚMULOS ──
function gerarPDFTumulo(q){
  if(typeof html2canvas==='undefined'||typeof window.jspdf==='undefined'){
    toast('Carregando bibliotecas PDF...');
    var s1=document.createElement('script');
    s1.src='https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    s1.onload=function(){
      var s2=document.createElement('script');
      s2.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s2.onload=function(){gerarPDFTumulo(q);};
      document.head.appendChild(s2);
    };
    document.head.appendChild(s1);
    return;
  }

  var emp=CFG.emp;
  var tum=q.tum||{};
  var res=q.tumCalc||{};
  var pdfCount=parseInt(localStorage.getItem('hr_pdf_count')||'0',10);
  var orcNum='ORC-'+String(pdfCount).padStart(4,'0');
  localStorage.setItem('hr_pdf_count',pdfCount+1);
  var fileName='Orcamento_'+orcNum+'_Tumulo_'+q.cli.replace(/[^a-zA-Z0-9]/g,'_')+'.pdf';

  var TIPOS_LABEL={simples:'Túmulo Simples',gaveta_dupla:'Gaveta Dupla',gaveta_tripla:'Gaveta Tripla',
    capela:'Capela / Monumento',revestimento:'Revestimento / Reforma',reforma:'Reforma Completa',jazigo:'Jazigo Completo'};
  var tipoLabel=TIPOS_LABEL[tum.tipo]||tum.tipo||'Túmulo';
  var mat=CFG.stones.find(function(s){return s.id===tum.stoneId;})||{nm:q.mat||'',tx:'',photo:''};
  var vista=q.vista||res.venda||0;
  var parc=vista*1.12;
  var p8=parc/8;
  var ent=vista*0.5;
  var economia=parc-vista;

  function fd(d){if(!d)return new Date().toLocaleDateString('pt-BR');try{return new Date(d).toLocaleDateString('pt-BR');}catch(e){return d;}}
  function sh(t){return '<div style="display:flex;align-items:center;gap:10px;margin:0 0 12px;"><span style="font-size:7.5px;letter-spacing:3px;text-transform:uppercase;color:#C9A84C;font-weight:900;">'+t+'</span><div style="flex:1;height:1px;background:linear-gradient(90deg,rgba(201,168,76,0.4),transparent);"></div></div>';}

  // Linhas de custo
  var custoRows='';
  var custoItems=[
    {icon:'🪨',l:'Pedras',v:res.custoPedra||0,sub:mat.nm+(res.m2total?' — '+(+res.m2total).toFixed(3)+' m²':'')},
    {icon:'🔨',l:'Mão de Obra Marmoraria',v:res.custoMdo||0,sub:''},
    {icon:'🧱',l:'Pedreiro / Construção',v:res.custoObra||0,sub:''},
    {icon:'🪣',l:'Materiais',v:res.custoMat||0,sub:''}
  ];
  custoItems.forEach(function(it,i){
    if(!it.v&&it.v!==0)return;
    var bg=i%2===0?'#fff':'#faf6ef';
    custoRows+='<tr>'
      +'<td style="padding:10px 14px;background:'+bg+';border-bottom:1px solid #ede8dc;font-size:12px;font-weight:600;color:#1a1a1a;">'+it.icon+' '+it.l+'</td>'
      +'<td style="padding:10px 14px;background:'+bg+';border-bottom:1px solid #ede8dc;font-size:11px;color:#888;text-align:center;">'+it.sub+'</td>'
      +'<td style="padding:10px 14px;background:'+bg+';border-bottom:1px solid #ede8dc;font-size:12px;text-align:right;font-weight:700;color:#1a1a1a;">R$ '+fm(it.v)+'</td>'
      +'</tr>';
  });
  // Total row
  custoRows+='<tr style="background:#0f0c00;">'
    +'<td colspan="2" style="padding:11px 14px;font-size:10px;font-weight:900;color:#C9A84C;letter-spacing:1px;">CUSTO TOTAL DO PROJETO</td>'
    +'<td style="padding:11px 14px;text-align:right;font-size:12px;font-weight:900;color:#C9A84C;">R$ '+fm(res.custoTotal||0)+'</td>'
    +'</tr>';

  // Observações
  var obsBox=tum.obs?'<div style="background:#fffbf0;border-left:4px solid #C9A84C;padding:10px 14px;margin-bottom:18px;font-size:11.5px;color:#555;border-radius:0 8px 8px 0;line-height:1.65;"><strong style="color:#7a4e00;">Observações:</strong> '+escH(tum.obs)+'</div>':'';

  var recHtml=''
  +'<div id="pdfReceipt" style="width:700px;font-family:Arial,Helvetica,sans-serif;background:#fff;color:#1a1a1a;">'
  +'<div style="height:6px;background:linear-gradient(90deg,#5a3a06 0%,#C9A84C 35%,#E8C96A 50%,#C9A84C 65%,#5a3a06 100%);"></div>'
  // Header
  +'<div style="background:#0f0c00;padding:28px 38px 22px;display:flex;justify-content:space-between;align-items:flex-start;gap:20px;">'
    +'<div style="display:flex;flex-direction:column;gap:6px;">'
      +'<div style="font-size:26px;font-weight:900;color:#C9A84C;letter-spacing:-0.5px;line-height:1;">'+emp.nome+'</div>'
      +'<div style="font-size:8.5px;letter-spacing:3.5px;text-transform:uppercase;color:rgba(201,168,76,0.45);">M&Aacute;RMORE &middot; GRANITO &middot; QUARTZITO</div>'
      +'<div style="font-size:10px;color:rgba(255,255,255,0.22);font-style:italic;margin-top:2px;">Qualidade, Precisao e Acabamento Profissional</div>'
    +'</div>'
    +'<div style="text-align:right;display:flex;flex-direction:column;gap:3px;">'
      +'<div style="font-size:10.5px;color:rgba(201,168,76,0.9);font-weight:700;">'+emp.end+'</div>'
      +'<div style="font-size:10px;color:rgba(255,255,255,0.4);">'+emp.cidade+'</div>'
      +'<div style="font-size:11px;color:rgba(201,168,76,0.9);font-weight:700;margin-top:3px;">'+emp.tel+'</div>'
      +(emp.ig?'<div style="font-size:10px;color:rgba(255,255,255,0.4);">'+emp.ig+'</div>':'')
      +'<div style="font-size:8.5px;color:rgba(255,255,255,0.18);margin-top:3px;">CNPJ: '+emp.cnpj+'</div>'
    +'</div>'
  +'</div>'
  // Badge bar
  +'<div style="background:#f7f2e8;border-bottom:3px solid #C9A84C;padding:11px 38px;display:flex;justify-content:space-between;align-items:center;">'
    +'<div style="display:flex;align-items:center;gap:12px;">'
      +'<div style="background:#0f0c00;color:#C9A84C;font-size:8px;font-weight:900;padding:6px 16px;border-radius:30px;letter-spacing:3px;text-transform:uppercase;border:1px solid rgba(201,168,76,0.5);">⚱️ TÚMULO</div>'
      +'<div style="background:#C9A84C;color:#000;font-size:9px;font-weight:900;padding:4px 10px;border-radius:5px;letter-spacing:1px;">'+orcNum+'</div>'
    +'</div>'
    +'<div style="text-align:right;">'
      +'<div style="font-size:10px;color:#888;"><strong style="color:#5a3800;">EMISSÃO:</strong> '+fd(q.dt||q.date)+'</div>'
      +'<div style="font-size:9.5px;color:#aaa;">Validade: 7 dias</div>'
    +'</div>'
  +'</div>'
  // Body
  +'<div style="padding:24px 38px 20px;">'
    // Cliente
    +sh('Cliente')
    +'<div style="display:flex;gap:12px;margin-bottom:20px;align-items:stretch;">'
      +'<div style="flex:1;background:#fdfaf3;border:1px solid #e8dfc4;border-radius:10px;padding:15px 18px;">'
        +'<div style="font-size:7.5px;letter-spacing:2.5px;text-transform:uppercase;color:#c0a860;margin-bottom:5px;font-weight:900;">NOME DO CLIENTE</div>'
        +'<div style="font-size:21px;font-weight:900;color:#1a1a1a;line-height:1;margin-bottom:8px;">'+escH(q.cli)+'</div>'
        +(tum.falecido?'<div style="font-size:11px;color:#888;margin-top:4px;">⚱️ Falecido: <strong>'+escH(tum.falecido)+'</strong></div>':'')
        +(tum.cemiterio?'<div style="font-size:11px;color:#888;margin-top:2px;">📍 Cemitério: '+escH(tum.cemiterio)+'</div>':'')
        +(tum.quadra?'<div style="font-size:11px;color:#888;margin-top:2px;">Quadra: '+escH(tum.quadra)+(tum.lote?' | Lote: '+escH(tum.lote):'')+'</div>':'')
      +'</div>'
      +'<div style="background:#0f0c00;border:1px solid rgba(201,168,76,0.45);border-radius:10px;padding:14px 18px;text-align:center;display:flex;flex-direction:column;justify-content:center;min-width:120px;">'
        +'<div style="font-size:7px;letter-spacing:2px;text-transform:uppercase;color:rgba(201,168,76,0.5);margin-bottom:6px;font-weight:900;">PROJETO</div>'
        +'<div style="font-size:16px;font-weight:900;color:#C9A84C;line-height:1.2;">'+tipoLabel+'</div>'
        +'<div style="font-size:9px;color:rgba(255,255,255,0.3);margin-top:6px;">'+tum.dims.comp+'m × '+tum.dims.larg+'m × '+tum.dims.alt+'m</div>'
      +'</div>'
    +'</div>'
    +obsBox
    // Material
    +sh('Material Selecionado')
    +'<div style="border:2px solid #C9A84C;border-radius:12px;overflow:hidden;margin-bottom:20px;box-shadow:0 4px 20px rgba(201,168,76,0.15);">'
      +'<div class="'+(mat.photo?'':mat.tx)+'" style="height:90px;width:100%;position:relative;overflow:hidden;'+(mat.photo?'background-image:url(\''+mat.photo+'\');background-size:cover;background-position:center;':'')+'">'
        +'<div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,0.78) 0%,rgba(0,0,0,0.45) 50%,rgba(0,0,0,0.12) 100%);">'
          +'<div style="position:absolute;left:20px;top:50%;transform:translateY(-50%);">'
            +'<div style="font-size:7px;letter-spacing:3px;text-transform:uppercase;color:rgba(201,168,76,0.8);font-weight:900;margin-bottom:5px;">MATERIAL</div>'
            +'<div style="font-size:22px;font-weight:900;color:#C9A84C;line-height:1;">'+(mat.nm||q.mat||'—')+'</div>'
            +(mat.cat?'<div style="font-size:9.5px;color:rgba(255,255,255,0.45);margin-top:4px;">'+mat.cat+(mat.fin?' · '+mat.fin:'')+'</div>':'')
          +'</div>'
          +'<div style="position:absolute;right:20px;top:50%;transform:translateY(-50%);text-align:right;">'
            +'<div style="font-size:7px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.45);font-weight:900;margin-bottom:3px;">ÁREA TOTAL</div>'
            +'<div style="font-size:20px;font-weight:900;color:#fff;">'+( res.m2total?(+res.m2total).toFixed(3)+' m²':'—')+'</div>'
            +(tum.dims.esp?'<div style="font-size:9px;color:rgba(255,255,255,0.4);margin-top:3px;">Espessura: '+tum.dims.esp+' cm</div>':'')
          +'</div>'
        +'</div>'
      +'</div>'
    +'</div>'
    // Custos
    +sh('Composição do Projeto')
    +'<div style="border:1px solid #e8e0d0;border-radius:10px;overflow:hidden;margin-bottom:20px;">'
      +'<table style="width:100%;border-collapse:collapse;">'
        +'<thead><tr style="background:#0f0c00;">'
          +'<th style="padding:10px 14px;text-align:left;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#C9A84C;font-weight:900;">ITEM</th>'
          +'<th style="padding:10px 14px;text-align:center;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#C9A84C;font-weight:900;">DETALHE</th>'
          +'<th style="padding:10px 14px;text-align:right;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#C9A84C;font-weight:900;">VALOR</th>'
        +'</tr></thead>'
        +'<tbody>'+custoRows+'</tbody>'
      +'</table>'
    +'</div>'
    // Valor final
    +'<div style="background:#0f0c00;border:2px solid #C9A84C;border-radius:10px;overflow:hidden;margin-bottom:20px;box-shadow:0 3px 16px rgba(201,168,76,0.2);">'
      +'<div style="background:#0f0c00;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;">'
        +'<span style="font-size:7.5px;letter-spacing:2px;text-transform:uppercase;color:#C9A84C;font-weight:900;">A VISTA</span>'
        +'<span style="background:#C9A84C;color:#000;font-size:8px;font-weight:900;padding:2px 8px;border-radius:20px;">MELHOR OPÇÃO</span>'
      +'</div>'
      +'<div style="padding:14px 16px;background:#fff;">'
        +'<div style="font-size:28px;font-weight:900;color:#7a4400;line-height:1;margin-bottom:4px;">R$ '+fm(vista)+'</div>'
        +'<div style="font-size:11px;color:#a06020;font-weight:700;margin-bottom:6px;">Valor final sem juros</div>'
        +'<div style="display:inline-flex;align-items:center;gap:5px;background:#edf7ed;border:1px solid #7ac47a;color:#1e6b1e;font-size:9px;font-weight:900;padding:3px 10px;border-radius:20px;">&#9660; Economia de R$ '+fm(economia)+' em relação ao parcelado</div>'
      +'</div>'
    +'</div>'
    // Condição de Pagamento
    +sh('Condição de Pagamento')
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:6px;">'
      +'<div style="background:#fdfaf3;border:1px solid #e8dfc4;border-radius:10px;padding:15px 18px;">'
        +'<div style="font-size:7.5px;letter-spacing:2px;text-transform:uppercase;color:#c0a860;margin-bottom:5px;font-weight:900;">ENTRADA — 50%</div>'
        +'<div style="font-size:22px;font-weight:900;color:#7a4400;line-height:1;margin-bottom:4px;">R$ '+fm(ent)+'</div>'
        +'<div style="font-size:11px;color:#999;">Na assinatura / medição</div>'
      +'</div>'
      +'<div style="background:#fdfaf3;border:1px solid #e8dfc4;border-radius:10px;padding:15px 18px;">'
        +'<div style="font-size:7.5px;letter-spacing:2px;text-transform:uppercase;color:#c0a860;margin-bottom:5px;font-weight:900;">NA ENTREGA — 50%</div>'
        +'<div style="font-size:22px;font-weight:900;color:#7a4400;line-height:1;margin-bottom:4px;">R$ '+fm(ent)+'</div>'
        +'<div style="font-size:11px;color:#999;">Na entrega e instalação</div>'
      +'</div>'
    +'</div>'
  +'</div>'
  // Footer
  +'<div style="background:#0f0c00;padding:18px 38px;display:flex;justify-content:space-between;align-items:center;gap:16px;margin-top:4px;">'
    +'<div>'
      +'<div style="font-size:14px;font-weight:900;color:#C9A84C;line-height:1;margin-bottom:4px;">'+emp.nome+'</div>'
      +'<div style="font-size:9.5px;color:rgba(201,168,76,0.4);">'+emp.end+' — '+emp.cidade+'</div>'
    +'</div>'
    +'<div style="text-align:right;line-height:1.9;">'
      +'<div style="font-size:10.5px;color:rgba(201,168,76,0.85);font-weight:700;">'+emp.tel+'</div>'
      +(emp.ig?'<div style="font-size:9.5px;color:rgba(201,168,76,0.4);">'+emp.ig+'</div>':'')
      +'<div style="font-size:9px;color:rgba(255,255,255,0.15);">CNPJ: '+emp.cnpj+'</div>'
    +'</div>'
  +'</div>'
  +'<div style="height:5px;background:linear-gradient(90deg,#5a3a06 0%,#C9A84C 35%,#E8C96A 50%,#C9A84C 65%,#5a3a06 100%);"></div>'
  +'</div>';

  // Overlay
  var ov=document.createElement('div');
  ov.id='pdfOv';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.97);z-index:9999;display:flex;flex-direction:column;';
  var barEl=document.createElement('div');
  barEl.style.cssText='display:flex;align-items:center;gap:8px;padding:10px 13px;background:#0f0c00;border-bottom:1px solid rgba(201,168,76,.55);flex-shrink:0;flex-wrap:wrap;';
  barEl.innerHTML=''
    +'<span style="flex:1;font-size:.75rem;color:#C9A84C;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">⚱️ '+orcNum+' — '+escH(q.cli)+'</span>'
    +'<button id="pdfBtnClose" style="background:transparent;border:1px solid rgba(201,168,76,.35);color:rgba(201,168,76,.7);padding:7px 11px;border-radius:8px;font-size:.72rem;cursor:pointer;font-family:Outfit,sans-serif;">✕</button>'
    +'<button id="pdfBtnDown" disabled style="background:#1e1800;border:1px solid rgba(201,168,76,.2);color:rgba(201,168,76,.35);padding:7px 13px;border-radius:8px;font-size:.72rem;cursor:pointer;font-family:Outfit,sans-serif;white-space:nowrap;">⏳ Gerando...</button>'
    +(navigator.share?'<button id="pdfBtnShare" disabled style="background:#1e1800;border:1px solid rgba(201,168,76,.2);color:rgba(201,168,76,.35);padding:7px 13px;border-radius:8px;font-size:.72rem;cursor:pointer;font-family:Outfit,sans-serif;white-space:nowrap;">↗ Compartilhar</button>':'')
    +'<button id="pdfBtnPrint" style="background:#C9A84C;border:none;color:#000;padding:7px 13px;border-radius:8px;font-size:.72rem;font-weight:800;cursor:pointer;font-family:Outfit,sans-serif;white-space:nowrap;">🖨 Imprimir</button>';
  var preview=document.createElement('div');
  preview.style.cssText='flex:1;overflow-y:auto;background:#444;display:flex;justify-content:center;align-items:flex-start;padding:16px 8px;';
  preview.innerHTML='<div style="text-align:center;color:#C9A84C;padding:60px 20px;font-family:Outfit,sans-serif;font-size:.85rem;letter-spacing:.5px;">⏳ Gerando PDF, aguarde...</div>';
  ov.appendChild(barEl);ov.appendChild(preview);
  document.body.appendChild(ov);
  document.getElementById('pdfBtnClose').onclick=function(){ov.remove();};
  document.getElementById('pdfBtnPrint').onclick=function(){
    var w=window.open('','_blank');
    if(w){w.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{box-sizing:border-box;margin:0;padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact;}body{background:#fff;}</style></head><body>'+recHtml+'<script>window.onload=function(){window.print();};<\/script></body></html>');w.document.close();}
  };

  var offscreen=document.createElement('div');
  offscreen.style.cssText='position:fixed;left:-9999px;top:0;width:700px;background:#fff;z-index:-1;';
  offscreen.innerHTML=recHtml;
  document.body.appendChild(offscreen);

  setTimeout(function(){
    html2canvas(offscreen.querySelector('#pdfReceipt'),{scale:2,useCORS:true,backgroundColor:'#ffffff',logging:false,width:700,windowWidth:700}).then(function(canvas){
      document.body.removeChild(offscreen);
      var jsPDF=window.jspdf.jsPDF;
      var pageW=595.28;
      var pageH=pageW*(canvas.height/canvas.width);
      var pdf=new jsPDF({orientation:'portrait',unit:'pt',format:[pageW,pageH]});
      pdf.addImage(canvas.toDataURL('image/jpeg',0.96),'JPEG',0,0,pageW,pageH);
      var pdfBlob=pdf.output('blob');
      var img=document.createElement('img');
      img.src=canvas.toDataURL('image/jpeg',0.88);
      img.style.cssText='width:100%;max-width:700px;display:block;box-shadow:0 4px 32px rgba(0,0,0,.6);';
      preview.innerHTML='';preview.appendChild(img);
      function enableBtn(id,label,cb){var b=document.getElementById(id);if(!b)return;b.innerHTML=label;b.disabled=false;b.style.color='#C9A84C';b.style.borderColor='rgba(201,168,76,.55)';b.style.background='#1e1800';b.onclick=cb;}
      enableBtn('pdfBtnDown','⬇ Salvar PDF',function(){var url=URL.createObjectURL(pdfBlob);var a=document.createElement('a');a.href=url;a.download=fileName;document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(function(){URL.revokeObjectURL(url);},30000);toast('PDF salvo: '+fileName);});
      if(navigator.share){enableBtn('pdfBtnShare','↗ Compartilhar',function(){var pdfFile=new File([pdfBlob],fileName,{type:'application/pdf'});var sd={title:'Orcamento '+orcNum+' — '+q.cli,text:emp.nome+'\nR$ '+fm(vista)+' a vista'};if(navigator.canShare&&navigator.canShare({files:[pdfFile]}))sd.files=[pdfFile];navigator.share(sd).catch(function(){});});}
    });
  },400);
}

// ORÇAMENTOS HISTÓRICO
// ═══════════════════════════════════════════════

var _orcFilter = '';

function renderOrc() {
  // Summary cards
  var total = DB.q.length;
  var totalVista = DB.q.reduce(function(s,q){return s+(q.vista||0);},0);
  var thisMonth = (new Date()).toISOString().slice(0,7);
  var mesCount = DB.q.filter(function(q){return (q.date||'').slice(0,7)===thisMonth;}).length;
  var sumEl = document.getElementById('orcSummary');
  if(sumEl) sumEl.innerHTML =
    '<div class="orc-sum-card"><div class="orc-sum-v">'+total+'</div><div class="orc-sum-l">Total</div></div>' +
    '<div class="orc-sum-card"><div class="orc-sum-v">'+mesCount+'</div><div class="orc-sum-l">Este mês</div></div>' +
    '<div class="orc-sum-card"><div class="orc-sum-v">R$ '+(totalVista/1000).toFixed(0)+'k</div><div class="orc-sum-l">Em orçamentos</div></div>';
  filterOrc();
}

function filterOrc() {
  _orcFilter = (document.getElementById('orcSearch')||{value:''}).value.trim().toLowerCase();
  var filtered = _orcFilter
    ? DB.q.filter(function(q){ return (q.cli||'').toLowerCase().indexOf(_orcFilter) >= 0; })
    : DB.q;
  buildOrcList(filtered);
}

function buildOrcList(list) {
  var el = document.getElementById('orcList');
  if(!el) return;
  if(!list.length) {
    el.innerHTML = '<div class="orc-empty"><div class="orc-empty-icon">📋</div>' +
      (_orcFilter ? 'Nenhum orçamento para "'+_orcFilter+'"' : 'Nenhum orçamento ainda.<br>Faça um orçamento para começar!') + '</div>';
    return;
  }
  var tipo_icons = {Cozinha:'🍳',Banheiro:'🚿',Lavabo:'🪴',Soleira:'🚪',Peitoril:'🏠',Escada:'📐',Fachada:'🏛️',Outro:'📦'};
  var h = '';
  list.forEach(function(q,idx) {
    var icon = tipo_icons[q.tipo]||'📦';
    var dateStr = q.date ? fd(q.date) : '';
    var pdsCount = (q.pds||[]).length + (q.sfPcs||[]).length;
    h += '<div class="qcard" id="qc-'+q.id+'" onclick="togQCard(\''+q.id+'\')">';
    // Head
    h += '<div class="qcard-head">';
    h +=   '<div class="qcard-badge">'+icon+'</div>';
    h +=   '<div class="qcard-info">';
    h +=     '<div class="qcard-cli">'+escH(q.cli)+'</div>';
    h +=     '<div class="qcard-meta">'+dateStr+' · '+q.tipo+' · '+escH(q.mat||'')+'</div>';
    h +=   '</div>';
    h +=   '<div class="qcard-val">R$ '+fm(q.vista)+'</div>';
    h +=   '<span class="qcard-chev">▼</span>';
    h += '</div>';
    // Body (hidden until expanded)
    h += '<div class="qcard-body">';
    // Pills
    h += '<div class="qcard-pills">';
    if(q.m2) h += '<div class="qpill gold">'+q.m2.toFixed(3)+' m²</div>';
    if(pdsCount) h += '<div class="qpill">'+pdsCount+' peça'+(pdsCount>1?'s':'')+'</div>';
    if(q.mat) h += '<div class="qpill">'+escH(q.mat)+'</div>';
    if(q.tel) h += '<div class="qpill">'+escH(q.tel)+'</div>';
    h += '</div>';
    // Detail table
    h += '<div class="qcard-detail">';
    if(q.pds&&q.pds.length) {
      q.pds.forEach(function(p){
        h += '<div class="qdr"><span class="k">'+escH(p.desc||'Peça')+'</span><span class="v">'+p.w+'×'+p.h+'cm'+(p.q>1?' ×'+p.q:'')+'</span></div>';
      });
    }
    if(q.sfPcs&&q.sfPcs.length) {
      q.sfPcs.forEach(function(p){
        h += '<div class="qdr"><span class="k">'+escH(p.l||'Sainha/Frontão')+'</span><span class="v">'+p.w+'ml×'+p.h+'cm'+(p.q>1?' ×'+p.q:'')+'</span></div>';
      });
    }
    if(q.acN&&q.acN.length) {
      h += '<div class="qdr"><span class="k">Serviços incluso</span><span class="v" style="font-size:.68rem;text-align:right;max-width:180px;">'+q.acN.join(', ')+'</span></div>';
    }
    if(q.cidade) h += '<div class="qdr"><span class="k">Cidade</span><span class="v">'+escH(q.cidade)+'</span></div>';
    if(q.end) h += '<div class="qdr"><span class="k">Endereço</span><span class="v" style="font-size:.72rem;text-align:right;max-width:180px;">'+escH(q.end)+'</span></div>';
    if(q.obs) h += '<div class="qdr"><span class="k">Obs.</span><span class="v grn" style="font-size:.72rem;max-width:180px;text-align:right;">'+escH(q.obs)+'</span></div>';
    h += '</div>';
    // Totals
    h += '<div class="qcard-total"><span class="k">À Vista (melhor)</span><span class="v">R$ '+fm(q.vista)+'</span></div>';
    // Buttons
    h += '<div class="qcard-btns">';
    h += '<button class="btn btn-g" onclick="orcEditar(\''+q.id+'\',event)">✏️ Editar</button>';
    h += '<button class="btn btn-o" onclick="orcCopiar(\''+q.id+'\',event)">📋 Copiar</button>';
    h += '<button class="btn btn-o" onclick="orcPDF(\''+q.id+'\',event)">📄 PDF</button>';
    h += '<button class="btn btn-contrato" data-cid="'+q.id+'" onclick="gerarContrId(this,event)">📜 Contrato</button>';
    h += '<button class="btn btn-red" onclick="orcDel(\''+q.id+'\',event)">🗑</button>';
    h += '</div>';
    h += '</div>'; // qcard-body
    h += '</div>'; // qcard
  });
  el.innerHTML = h;
}

function togQCard(id) {
  var el = document.getElementById('qc-'+id);
  if(el) el.classList.toggle('open');
}

function orcEditar(id, e){
  e.stopPropagation();
  var q = DB.q.find(function(x){return x.id==id;});
  if(!q) return;

  // Orçamento de túmulo — tentar carregar no módulo de túmulos (pg9)
  if(q.tum){
    var pg9 = document.getElementById('pg9');
    if(pg9 && typeof TUM !== 'undefined' && typeof renderTum === 'function'){
      try{
        TUM.q = JSON.parse(JSON.stringify(q.tum));
        go(9);
        setTimeout(function(){ renderTum(); },100);
        toast('✓ Túmulo carregado! Edite e recalcule.');
      }catch(err){
        toast('Erro ao carregar orçamento de túmulo');
      }
    } else {
      // Módulo de túmulos não disponível nesta tela
      toast('⚠️ Para editar túmulos, acesse o módulo de Túmulos');
    }
    return;
  }

  orcRefazer(id, e);
}

function orcRefazer(id, e) {
  e.stopPropagation();
  var q = DB.q.find(function(x){return x.id==id;});
  if(!q) return;

  // Preencher dados do cliente
  var cliEl=document.getElementById('oCliente'); if(cliEl)cliEl.value=q.cli||'';
  var telEl=document.getElementById('oTel'); if(telEl)telEl.value=q.tel||'';
  var cidEl=document.getElementById('oCidade'); if(cidEl)cidEl.value=q.cidade||'';
  var endEl=document.getElementById('oEnd'); if(endEl)endEl.value=q.end||'';
  var obsEl=document.getElementById('oObs'); if(obsEl)obsEl.value=q.obs||'';

  // Selecionar material
  var mat=CFG.stones.find(function(s){return s.nm===q.mat;});
  if(mat){selMat=mat.id;buildMat();}

  // Reconstruir ambientes
  ambientes=[];

  if(q.ambSnap&&q.ambSnap.length){
    // Orçamento novo: tem snapshot completo dos ambientes
    q.ambSnap.forEach(function(snap,idx){
      var ambId=Date.now()+idx;
      ambientes.push({
        id:ambId,
        tipo:snap.tipo||'Cozinha',
        pecas:snap.pecas.map(function(p){return {id:Date.now()+Math.random(),desc:p.desc||'',w:p.w||0,h:p.h||0,q:p.q||1};}) ,
        selCuba:snap.selCuba||null,
        svState:JSON.parse(JSON.stringify(snap.svState||{})),
        acState:JSON.parse(JSON.stringify(snap.acState||{}))
      });
    });
  } else {
    // Orçamento antigo: reconstruir do que temos
    var tipos=(q.tipo||'Cozinha').split('+');
    tipos.forEach(function(tipo,idx){
      tipo=tipo.trim();
      var ambId=Date.now()+idx;
      var pecas=[];
      if(idx===0&&q.pds&&q.pds.length){
        q.pds.forEach(function(p){
          pecas.push({id:Date.now()+Math.random(),desc:p.desc||'',w:p.w||0,h:p.h||0,q:p.q||1});
        });
      } else {
        pecas.push({id:Date.now()+Math.random(),desc:'',w:0,h:0,q:1});
      }
      ambientes.push({id:ambId,tipo:tipo,pecas:pecas,selCuba:null,svState:{},acState:{},selMat:null});
    });
  }

  if(!ambientes.length)addAmbiente();

  renderAmbientes();
  go(0);
  setTimeout(function(){document.getElementById('pg0').scrollTop=0;},100);
  toast('✓ Orçamento carregado! Edite e recalcule.');
}

function orcCopiar(id, e) {
  e.stopPropagation();
  var q = DB.q.find(function(x){return x.id==id;});
  if(!q) return;
  var pTxt = (q.pds||[]).map(function(p){return '• '+(p.desc||'Peça')+' — '+p.w+'×'+p.h+'cm'+(p.q>1?' ×'+p.q:'');}).join('\n');
  if(q.sfPcs&&q.sfPcs.length) pTxt += '\n'+(q.sfPcs||[]).map(function(p){return '• '+p.l+' — '+p.w+'ml×'+p.h+'cm'+(p.q>1?' ×'+p.q:'');}).join('\n');
  var aTxt = (q.acN&&q.acN.length) ? (q.acN||[]).map(function(a){return '• '+a;}).join('\n') : '• Acabamento profissional';
  var txt = 'HR MARMORES E GRANITOS\nORCAMENTO — '+(q.cli||'Cliente')+'\n\nMaterial: '+(q.mat||'')+'\n\n'+(q.tipo||'Projeto')+':\n'+pTxt+'\n\nIncluso:\n'+aTxt+'\n• Fabricacao e acabamento completo\n\n==================\nPARCELADO\nR$ '+fm(q.parc)+' — ate 8x de R$ '+fm(q.p8||0)+'\n\nA VISTA\nR$ '+fm(q.vista)+'\n==================\n'+CFG.emp.nome+'\n'+CFG.emp.tel;
  if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(txt).then(function(){toast('✓ Copiado!');}).catch(function(){_copiarFallback(txt);});return;}
  _copiarFallback(txt);
}




function orcPDF(id, e) {
  e.stopPropagation();
  var q = DB.q.find(function(x){return x.id==id;});
  if(!q) return;
  if(q.tum){ gerarPDFTumulo(q); return; }
  pendQ = q;
  gerarPDF();
}

function orcDel(id, e) {
  e.stopPropagation();
  var q = DB.q.find(function(x){return x.id==id;});
  if(!q) return;
  if(!confirm('Excluir orçamento de '+q.cli+'?')) return;
  DB.q = DB.q.filter(function(x){return x.id!=id;});
  DB.sv();
  renderOrc();
  toast('✓ Excluído');
}

// ═══ GERAR CONTRATO ═══
var _contrId=null;
function gerarContrBtn(id,e){if(e)e.stopPropagation();gerarContrato(+id||id,e);}
function gerarContrId(el,e){if(e)e.stopPropagation();var id=+el.dataset.cid;gerarContrato(id,e);}
function gerarContrato(id, e){
  try{
    if(e)e.stopPropagation();
    var q=DB.q.find(function(x){return x.id==id;});
    if(!q){toast('Orçamento não encontrado');return;}
    _contrId=id;
    var obsEl=document.getElementById('contrObs');
    if(obsEl)obsEl.value=q.obs||'';
    try{
      var hoje=new Date();
      var startDt=new Date(hoje);
      if(DB.j&&DB.j.length){
        var jobs=DB.j.filter(function(j){return j.dt;});
        jobs.sort(function(a,b){return (b.dt||'').localeCompare(a.dt||'');});
        if(jobs.length&&jobs[0].dt){
          var ld=new Date(jobs[0].dt+'T12:00:00');
          if(ld>hoje)startDt=new Date(ld);
        }
      }
      startDt.setDate(startDt.getDate()+1);
      while(startDt.getDay()===0||startDt.getDay()===6)startDt.setDate(startDt.getDate()+1);
      var el=document.getElementById('contrDataInicio');
      if(el)el.value=startDt.toISOString().slice(0,10);
      var agInfo=document.getElementById('contrAgendaInfo');
      if(agInfo){agInfo.style.display='block';agInfo.textContent='📅 Início sugerido: '+startDt.toLocaleDateString('pt-BR');}
      setTimeout(contrCalcEntrega,100);
    }catch(dateErr){console.warn('date err:',dateErr);}
    showMd('contrMd');
  }catch(err){
    console.error('gerarContrato error:',err);
    toast('Erro ao abrir contrato: '+err.message);
  }
}

function selContrPg(tipo){
  document.querySelectorAll('.contr-pg-btn').forEach(function(b){b.classList.remove('on');});
  var btn=document.querySelector('[data-pg="'+tipo+'"]');if(btn)btn.classList.add('on');
  var custom=document.getElementById('contrPgCustom');
  custom.style.display=(tipo==='personalizado')?'flex':'none';
}

function contrCalcEntrega(){
  var ini=document.getElementById('contrDataInicio');
  var prazoEl=document.getElementById('contrPrazo');
  var entEl=document.getElementById('contrDataEntrega');
  if(!ini||!ini.value||!entEl)return;
  var dt=new Date(ini.value+'T12:00:00');
  var dias=0,prazo=+prazoEl.value||15;
  while(dias<prazo){dt.setDate(dt.getDate()+1);if(dt.getDay()!==0&&dt.getDay()!==6)dias++;}
  entEl.value=dt.toISOString().slice(0,10);
}

function confirmarContrato(){
  try{
  var id=_contrId;closeAll();
  var q=DB.q.find(function(x){return x.id==id;});
  if(!q){toast('Orçamento não encontrado');return;}
  var pgBtn=document.querySelector('.contr-pg-btn.on');
  var pgTipo=pgBtn?pgBtn.dataset.pg:'50_50';
  var parc=+document.getElementById('contrParc').value||0;
  var taxa=+document.getElementById('contrTaxa').value||12;
  var prazo=+document.getElementById('contrPrazo').value||15;
  var valid=+document.getElementById('contrValid').value||7;
  var obsContr=document.getElementById('contrObs').value.trim();
  var dataInicio=document.getElementById('contrDataInicio').value||'';
  var dataEntrega=document.getElementById('contrDataEntrega').value||'';
  var regFin=document.getElementById('contrFinChk').classList.contains('on');
  var vista=q.vista||0;
  var pgConds=[];
  var entPct=50,entgPct=50;
  var pgMap={'50_50':[50,50],'vista':[100,0],'30_70':[30,70],'40_60':[40,60],'60_40':[60,40],'3x':[33,67]};
  if(pgMap[pgTipo]){entPct=pgMap[pgTipo][0];entgPct=pgMap[pgTipo][1];}
  else if(pgTipo==='personalizado'){entPct=+document.getElementById('contrEntPct').value||50;entgPct=+document.getElementById('contrEntgPct').value||50;}
  var entVal=vista*(entPct/100);
  var entgVal=vista*(entgPct/100);
  if(entPct>0)pgConds.push({icon:'💰',txt:'<strong>Entrada ('+entPct+'%):</strong> R$ '+fm(entVal)+' no ato da assinatura'});
  if(entgPct>0&&pgTipo!=='3x')pgConds.push({icon:'💰',txt:'<strong>Entrega ('+entgPct+'%):</strong> R$ '+fm(entgVal)+' na entrega e instalação'});
  if(pgTipo==='3x'){var v3=vista/3;pgConds.push({icon:'💰',txt:'<strong>1ª:</strong> R$ '+fm(v3)+' na assinatura'},{icon:'💰',txt:'<strong>2ª:</strong> R$ '+fm(v3)+' na metade'},{icon:'💰',txt:'<strong>3ª:</strong> R$ '+fm(v3)+' na entrega'});}
  if(parc>0){var pv=vista*(1+taxa/100)/parc;pgConds.push({icon:'💳',txt:'Parcelado em '+parc+'× de R$ '+fm(pv)+' (taxa '+taxa+'%)'});}
  pgConds.push({icon:'📅',txt:'Orçamento válido por '+valid+' dias'});
  if(dataInicio){var di=new Date(dataInicio+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});pgConds.push({icon:'🔨',txt:'<strong>Início:</strong> '+di});}
  if(dataEntrega){var de=new Date(dataEntrega+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});pgConds.push({icon:'🚚',txt:'<strong>Previsão de entrega:</strong> '+de+' ('+prazo+' dias úteis)'});}
  if(obsContr)pgConds.push({icon:'📝',txt:obsContr});
  if(regFin&&entVal>0){
    if(!DB.j)DB.j=[];
    DB.j.push({id:Date.now(),tipo:'r',desc:'Entrada — '+escH(q.cli||'Cliente')+' ('+q.tipo+')',val:entVal,dt:new Date().toISOString().slice(0,10),status:'pendente',qid:q.id});
    if(entgVal>0)DB.j.push({id:Date.now()+1,tipo:'r',desc:'Entrega — '+escH(q.cli||'Cliente')+' ('+q.tipo+')',val:entgVal,dt:dataEntrega||new Date().toISOString().slice(0,10),status:'pendente',qid:q.id});
    DB.sv();toast('✓ Lançado nas Finanças: R$ '+fm(entVal)+' pendente');
  }
  _gerarContratoHtml(q,pgConds,prazo,valid,parc,taxa);
  }catch(err){console.error('confirmarContrato:',err);toast('Erro: '+err.message);}
}

function _gerarContratoHtml(q,pgConds,prazo,valid,parc,taxa){
  if(e)e.stopPropagation();
  var q=DB.q.find(function(x){return x.id==id;});
  if(!q){toast('Orçamento não encontrado');return;}
  var emp=CFG.emp;
  var hoje=new Date();
  var dataStr=hoje.toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
  var dataSimples=hoje.toLocaleDateString('pt-BR');

  // Detectar tipo de projeto para garantia
  var tipo=(q.tipo||'Outro');
  var tiposGrandes=['Cozinha','Banheiro','Lavabo','Escada','Fachada'];
  var isGrande=tiposGrandes.indexOf(tipo)>=0;
  var garantiaMeses=isGrande?12:6;

  // Montar lista de peças
  var pecasHtml='';
  (q.pds||[]).forEach(function(p,i){
    pecasHtml+='<tr><td>'+(i+1)+'</td><td>'+(p.desc||'Peça')+'</td><td>'+p.w+'×'+p.h+' cm</td><td>'+(p.q||1)+'</td><td>'+((p.w/100)*(p.h/100)*(p.q||1)).toFixed(3)+' m²</td></tr>';
  });
  (q.sfPcs||[]).forEach(function(p,i){
    pecasHtml+='<tr><td>+</td><td>'+(p.l||'Serviço')+'</td><td>'+p.w+'ml × '+p.h+' cm</td><td>'+(p.q||1)+'</td><td>'+p.m2.toFixed(3)+' m²</td></tr>';
  });

  // Serviços inclusos
  var svHtml=(q.acN&&q.acN.length)?q.acN.map(function(s){return '<li>'+s+'</li>';}).join(''):'<li>Acabamento e instalação profissional</li>';

  var html='<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">'
  +'<meta name="viewport" content="width=device-width,initial-scale=1">'
  +'<title>Contrato — '+q.cli+'</title>'
  +'<style>'
  +'*{margin:0;padding:0;box-sizing:border-box;}'
  +'body{font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#1a1a1a;background:#fff;padding:0;}'
  +'.page{max-width:780px;margin:0 auto;padding:0 0 40px;}'
  // Header
  +'.hdr{background:#0f0c00;padding:22px 36px;display:flex;justify-content:space-between;align-items:center;}'
  +'.hdr-logo{font-size:22px;font-weight:900;color:#C9A84C;letter-spacing:-.3px;}'
  +'.hdr-tag{font-size:8px;letter-spacing:3px;text-transform:uppercase;color:rgba(201,168,76,.5);margin-top:3px;}'
  +'.hdr-info{text-align:right;color:rgba(255,255,255,.7);font-size:10px;line-height:1.7;}'
  +'.hdr-info span{color:#C9A84C;font-weight:700;}'
  // Title strip
  +'.title-strip{background:#f7f2e8;border-bottom:3px solid #C9A84C;padding:14px 36px;display:flex;justify-content:space-between;align-items:center;}'
  +'.title-main{font-size:16px;font-weight:900;color:#3a2000;letter-spacing:-.2px;}'
  +'.title-num{font-size:10px;color:#999;}'
  // Body
  +'.body{padding:24px 36px;}'
  +'.section{margin-bottom:22px;}'
  +'.sec-title{font-size:10px;font-weight:900;letter-spacing:2px;text-transform:uppercase;color:#C9A84C;border-bottom:1px solid #e8d89c;padding-bottom:5px;margin-bottom:12px;}'
  +'.row2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}'
  +'.field{margin-bottom:8px;}'
  +'.field label{display:block;font-size:9px;letter-spacing:1px;text-transform:uppercase;color:#999;margin-bottom:2px;}'
  +'.field span{font-size:12px;font-weight:700;color:#1a1a1a;}'
  // Table
  +'table{width:100%;border-collapse:collapse;font-size:11px;}'
  +'th{background:#0f0c00;color:#C9A84C;padding:7px 10px;text-align:left;font-size:9px;letter-spacing:1px;text-transform:uppercase;}'
  +'td{padding:7px 10px;border-bottom:1px solid #f0e8d8;}'
  +'tr:last-child td{border-bottom:none;}'
  +'tr:nth-child(even) td{background:#faf5ea;}'
  // Prices
  +'.price-box{background:#0f0c00;border-radius:10px;padding:16px 20px;margin-bottom:16px;}'
  +'.price-row{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;}'
  +'.price-label{font-size:10px;color:rgba(255,255,255,.5);letter-spacing:1px;text-transform:uppercase;}'
  +'.price-val{font-size:14px;font-weight:900;color:#C9A84C;}'
  +'.price-val.main{font-size:22px;}'
  +'.price-val.gray{color:rgba(255,255,255,.4);font-size:12px;}'
  +'.price-divider{border:none;border-top:1px solid rgba(201,168,76,.2);margin:8px 0;}'
  // Conditions
  +'.cond-item{display:flex;gap:10px;align-items:flex-start;margin-bottom:9px;padding:9px 12px;background:#f9f5ef;border-left:3px solid #C9A84C;border-radius:0 6px 6px 0;}'
  +'.cond-num{font-size:11px;font-weight:900;color:#C9A84C;min-width:18px;}'
  +'.cond-text{font-size:11px;color:#333;line-height:1.5;}'
  // Guarantee
  +'.guarantee{background:#e8f4e8;border:1px solid #a8d4a8;border-radius:8px;padding:14px 16px;margin-bottom:16px;}'
  +'.guarantee-title{font-size:11px;font-weight:900;color:#2a6a2a;margin-bottom:6px;}'
  +'.guarantee-text{font-size:11px;color:#2a4a2a;line-height:1.6;}'
  // Signature
  +'.sig-area{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:40px;}'
  +'.sig-line{border-top:1px solid #333;padding-top:8px;}'
  +'.sig-name{font-size:11px;font-weight:700;}'
  +'.sig-role{font-size:9px;color:#666;margin-top:2px;}'
  +'.sig-date{font-size:9px;color:#999;margin-top:6px;}'
  // Footer
  +'.foot{background:#0f0c00;padding:12px 36px;display:flex;justify-content:space-between;align-items:center;margin-top:24px;}'
  +'.foot span{font-size:9px;color:rgba(201,168,76,.4);}'
  +'ul{padding-left:16px;}'
  +'ul li{margin-bottom:4px;font-size:11px;color:#333;}'
  +'@media print{body{padding:0;}.page{max-width:100%;}}'
  +'</style></head><body>'
  +'<div class="page">'

  // HEADER
  +'<div class="hdr">'
    +'<div><div class="hdr-logo">'+emp.nome+'</div><div class="hdr-tag">Mármores · Granitos · Quartzitos</div></div>'
    +'<div class="hdr-info">'
      +'<span>'+emp.tel+'</span><br>'
      +emp.end+'<br>'
      +emp.cidade+'<br>'
      +'CNPJ: '+emp.cnpj
    +'</div>'
  +'</div>'

  // TITLE
  +'<div class="title-strip">'
    +'<div class="title-main">📜 CONTRATO DE FORNECIMENTO E INSTALAÇÃO</div>'
    +'<div class="title-num">Nº '+String(q.id).slice(-6)+' · '+dataSimples+'</div>'
  +'</div>'

  +'<div class="body">'

  // PARTES
  +'<div class="section">'
  +'<div class="sec-title">Partes Contratantes</div>'
  +'<div class="row2">'
    +'<div>'
      +'<div class="field"><label>Contratada</label><span>'+emp.nome+'</span></div>'
      +'<div class="field"><label>CNPJ</label><span>'+emp.cnpj+'</span></div>'
      +'<div class="field"><label>Endereço</label><span>'+emp.end+'</span></div>'
      +'<div class="field"><label>Telefone</label><span>'+emp.tel+'</span></div>'
    +'</div>'
    +'<div>'
      +'<div class="field"><label>Contratante (Cliente)</label><span>'+escH(q.cli||'')+'</span></div>'
      +(q.tel?'<div class="field"><label>Telefone</label><span>'+escH(q.tel)+'</span></div>':'')
      +(q.end?'<div class="field"><label>Endereço de entrega</label><span>'+escH(q.end)+'</span></div>':'')
      +(q.cidade?'<div class="field"><label>Cidade</label><span>'+escH(q.cidade)+'</span></div>':'')
    +'</div>'
  +'</div>'
  +'</div>'

  // OBJETO
  +'<div class="section">'
  +'<div class="sec-title">Objeto do Contrato</div>'
  +'<div class="field" style="margin-bottom:12px;"><label>Tipo de Serviço</label><span>'+tipo+'</span></div>'
  +'<div class="field" style="margin-bottom:12px;"><label>Material</label><span>'+(q.mat||'Granito/Mármore')+' — R$ '+(q.matPr||0).toLocaleString('pt-BR',{minimumFractionDigits:2})+'/m²</span></div>'
  +(pecasHtml?'<table><thead><tr><th>Nº</th><th>Descrição</th><th>Medidas</th><th>Qtd</th><th>Área</th></tr></thead><tbody>'+pecasHtml+'</tbody></table>':'')
  +'<div style="margin-top:12px;"><div class="field"><label>Total de m²</label><span>'+fm(q.m2||0)+' m²</span></div></div>'
  +'</div>'

  // SERVIÇOS
  +'<div class="section">'
  +'<div class="sec-title">Serviços Inclusos</div>'
  +'<ul>'+svHtml+'<li>Fabricação e acabamento completo</li></ul>'
  +(q.obs?'<div style="margin-top:10px;" class="field"><label>Observações</label><span>'+escH(q.obs)+'</span></div>':'')
  +'</div>'

  // VALORES
  +'<div class="section">'
  +'<div class="sec-title">Valores e Pagamento</div>'
  +'<div class="price-box">'
    +'<div class="price-row"><span class="price-label">Valor à vista (melhor preço)</span><span class="price-val main">R$ '+fm(q.vista||0)+'</span></div>'
    +'<hr class="price-divider">'
    +'<div class="price-row"><span class="price-label">Parcelado em até 8×</span><span class="price-val gray">R$ '+fm(q.parc||0)+' — 8× de R$ '+fm(q.p8||0)+'</span></div>'
  +'</div>'
  +'<div class="cond-item"><div class="cond-num">💰</div><div class="cond-text"><strong>Entrada:</strong> 50% no ato da assinatura do contrato — R$ '+fm((q.vista||0)/2)+'</div></div>'
  +'<div class="cond-item"><div class="cond-num">💰</div><div class="cond-text"><strong>Entrega:</strong> 50% na entrega e instalação — R$ '+fm((q.vista||0)/2)+'</div></div>'
  +'<div class="cond-item"><div class="cond-num">📅</div><div class="cond-text">Parcelamento no cartão acarreta acréscimo de 12% sobre o valor total. Máximo 8 parcelas.</div></div>'
  +'<div class="cond-item"><div class="cond-num">💡</div><div class="cond-text">Orçamento com validade de 7 dias. Após este prazo, sujeito a reajuste de materiais.</div></div>'
  +'</div>'

  // CONDIÇÕES GERAIS
  +'<div class="section">'
  +'<div class="sec-title">Condições Gerais</div>'
  +'<div class="cond-item"><div class="cond-num">1</div><div class="cond-text">A <strong>'+emp.nome+'</strong> se compromete a fornecer o material e executar os serviços descritos neste contrato dentro do prazo acordado verbalmente entre as partes.</div></div>'
  +'<div class="cond-item"><div class="cond-num">2</div><div class="cond-text">O prazo de entrega começa a contar após o pagamento da entrada e confirmação das medidas definitivas pelo cliente.</div></div>'
  +'<div class="cond-item"><div class="cond-num">3</div><div class="cond-text">Variações naturais de cor, veios e textura são características próprias de pedras naturais (granito, mármore, quartzito) e não constituem defeito de fabricação.</div></div>'
  +'<div class="cond-item"><div class="cond-num">4</div><div class="cond-text">O cliente é responsável por garantir o acesso ao local, bem como que a estrutura de apoio (gabinetes, paredes) esteja pronta e nivelada no dia da instalação.</div></div>'
  +'<div class="cond-item"><div class="cond-num">5</div><div class="cond-text">Alterações no projeto após a aprovação das medidas poderão gerar custos adicionais, sujeitos a novo orçamento.</div></div>'
  +'<div class="cond-item"><div class="cond-num">6</div><div class="cond-text">A rescisão do contrato após o início da produção implicará cobrança mínima de 40% do valor total para cobrir materiais e mão de obra já executados.</div></div>'
  +'</div>'

  // GARANTIA
  +'<div class="section">'
  +'<div class="sec-title">Garantia</div>'
  +'<div class="guarantee">'
    +'<div class="guarantee-title">✅ Garantia de '+garantiaMeses+' meses</div>'
    +'<div class="guarantee-text">'
      +'A <strong>'+emp.nome+'</strong> oferece garantia de <strong>'+garantiaMeses+' ('+_numPorExtenso(garantiaMeses)+') meses</strong> contra defeitos de fabricação e instalação, a contar da data de entrega.<br><br>'
      +'<strong>Coberto:</strong> Trincas por má execução, falhas no acabamento, problemas de instalação causados pela contratada.<br><br>'
      +'<strong>Não coberto:</strong> Danos por mau uso, impactos físicos, produtos químicos inadequados, infiltrações ou problemas estruturais do imóvel.'
    +'</div>'
  +'</div>'
  +'</div>'

  // ASSINATURAS
  +'<div class="section">'
  +'<div class="sec-title">Assinaturas</div>'
  +'<div style="text-align:center;font-size:11px;color:#666;margin-bottom:24px;">'+q.cidade+', '+dataStr+'</div>'
  +'<div class="sig-area">'
    +'<div><div class="sig-line"><div class="sig-name">'+emp.nome+'</div><div class="sig-role">Contratada · CNPJ: '+emp.cnpj+'</div></div></div>'
    +'<div><div class="sig-line"><div class="sig-name">'+escH(q.cli||'')+'</div><div class="sig-role">Contratante · CPF: ___________________</div></div></div>'
  +'</div>'
  +'</div>'

  +'</div>' // body

  +'<div class="foot">'
    +'<span>'+emp.nome+' · '+emp.cnpj+'</span>'
    +'<span>Contrato gerado em '+dataSimples+' · HR App</span>'
  +'</div>'
  +'</div>' // page

  +'<script>window.addEventListener("load",function(){setTimeout(function(){window.print();},500);});<\/script>'
  +'</body></html>';

  // Download como HTML
  var blob=new Blob([html],{type:'text/html;charset=utf-8'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  var nomeCliente=(q.cli||'cliente').replace(/\s+/g,'_').toLowerCase();
  a.href=url;
  a.download='Contrato_'+nomeCliente+'_HR.html';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  setTimeout(function(){URL.revokeObjectURL(url);},8000);
  toast('📜 Contrato baixado! Abra e use Compartilhar → Imprimir para PDF');
}

function _numPorExtenso(n){
  var m={6:'seis',12:'doze',3:'três',1:'um'};
  return m[n]||String(n);
}

// ═══ BACKUP ═══
function baixarBackup(){
  var dados={cfg:CFG,q:DB.q,j:DB.j,t:DB.t};
  var json=JSON.stringify(dados);
  var dt=new Date().toLocaleDateString('pt-BR').replace(/\//g,'-');
  var fname='HR_Backup_'+dt+'.json';
  var blob=new Blob([json],{type:'application/json'});
  if(navigator.share){
    var file=new File([blob],fname,{type:'application/json'});
    navigator.share({files:[file],title:'Backup HR Mármores'})
      .then(function(){toast('✓ Backup compartilhado!');})
      .catch(function(){_baixarViaLink(json,fname);});
    return;
  }
  _baixarViaLink(json,fname);
}
function _baixarViaLink(json,fname){
  var uri='data:application/json;charset=utf-8,'+encodeURIComponent(json);
  var a=document.createElement('a');
  a.href=uri;a.download=fname;a.target='_blank';
  document.body.appendChild(a);a.click();
  setTimeout(function(){document.body.removeChild(a);},1000);
  toast('📥 Backup salvo! Verifique seus Downloads.');
}

function carregarBackup(input){
  var file=input.files[0];if(!file)return;
  var reader=new FileReader();
  reader.onload=function(e){
    try{
      var d=JSON.parse(e.target.result);
      if(d.cfg){CFG=d.cfg;localStorage.setItem('hr_cfg',JSON.stringify(CFG));}
      if(d.q)DB.q=d.q;if(d.j)DB.j=d.j;if(d.t)DB.t=d.t;
      DB.sv();
      toast('✓ Backup restaurado! Recarregando...');
      setTimeout(function(){location.reload();},900);
    }catch(err){toast('❌ Arquivo inválido');}
  };
  reader.readAsText(file);
}



// ═══ IA — INTERPRETAR DESCRIÇÃO ═══
var _aiResultData = null;

function aiInterpretar(){
  var desc = document.getElementById('aiDesc').value.trim();
  if(!desc){toast('Descreva o projeto primeiro');return;}

  var st = document.getElementById('aiStatus');
  var btn = document.getElementById('btnAIEnviar');
  st.className='ai-status loading';
  st.textContent='⏳ Interpretando...';
  btn.disabled=true;btn.textContent='⏳ Aguarde...';
  document.getElementById('aiResultBox').style.display='none';
  document.getElementById('btnAIAplicar').style.display='none';

  var prompt = 'Você é um assistente especializado em orçamentos de mármore e granito.\n'
    +'O cliente descreveu o projeto:\n"'+desc+'"\n\n'
    +'Extraia os itens e retorne APENAS JSON válido, sem markdown:\n'
    +'{\n'
    +'  "pecas":[\n'
    +'    {"desc":"Bancada principal","w":350,"h":60,"q":1}\n'
    +'  ],\n'
    +'  "servicos":[\n'
    +'    {"k":"s_reta","label":"Sainha Reta","ml":4.2,"altCm":6},\n'
    +'    {"k":"forn","label":"Furo Torneira","un":1},\n'
    +'    {"k":"inst","label":"Instalação Padrão"},\n'
    +'    {"k":"ac_sifao","label":"Sifão","un":1}\n'
    +'  ]\n'
    +'}\n\n'
    +'Keys de serviços válidas:\n'
    +'Sainha: s_reta, s_45, s_boleada, s_slim\n'
    +'Frontão: frontao (inclua ml e altCm)\n'
    +'Soleira: sol1, sol2 (inclua ml)\n'
    +'Peitoril: peit_reto, peit_ping, peit_col, peit_portal (inclua ml)\n'
    +'Furos/recortes: forn, fralo, cook (inclua un)\n'
    +'Rebaixo: reb_n, reb_a\n'
    +'Fixação: tubo, cant (inclua un)\n'
    +'Instalação: inst, inst_c\n'
    +'Acessórios: ac_sifao, ac_flex, ac_veda, ac_sil, ac_paraf, ac_sup (inclua un)\n'
    +'Deslocamento: desl_for (inclua km como un)\n\n'
    +'Regras: w e h em cm; sainha/frontão sempre com ml e altCm (padrão 6cm); retorne SÓ o JSON.';

  fetch('https://api.openai.com/v1/chat/completions',{
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Authorization':'Bearer '+((CFG.emp&&CFG.emp.apiKey)||'')
    },
    body:JSON.stringify({
      model:'gpt-4o',
      max_tokens:1500,
      messages:[{role:'user',content:prompt}]
    })
  })
  .then(function(r){return r.json();})
  .then(function(data){
    btn.disabled=false;btn.textContent='✨ Interpretar com ChatGPT';
    if(data.error){
      // API key not configured — try local parse fallback
      st.className='ai-status err';
      st.textContent='❌ '+data.error.message+'\n\nDica: configure sua API Key em Config → Empresa.';
      return;
    }
    var txt=(data.choices&&data.choices[0]&&data.choices[0].message&&data.choices[0].message.content)||data.content&&data.content[0]?data.content[0].text:'';
    txt=txt.replace(/```json\s*/gi,'').replace(/```\s*/g,'').trim();
    var parsed;
    try{parsed=JSON.parse(txt);}
    catch(e){
      st.className='ai-status err';
      st.textContent='❌ Não consegui interpretar. Descreva com mais detalhes.';
      return;
    }
    _aiResultData=parsed;
    aiMostrarResultado(parsed);
    st.className='ai-status ok';
    st.textContent='✓ Projeto interpretado! Revise e aplique.';
  })
  .catch(function(){
    btn.disabled=false;btn.textContent='✨ Interpretar com ChatGPT';
    // Try local rule-based fallback
    aiFallbackLocal(desc,st);
  });
}

// Fallback local sem API — interpreta regras simples
function aiFallbackLocal(desc,st){
  var d=desc.toLowerCase();
  var parsed={pecas:[],servicos:[]};

  // Extract dimensions like 350x60, 350×60, 350 x 60
  var dimRe=/(\d+)\s*[x×]\s*(\d+)/g;
  var dims=[];var m;
  while((m=dimRe.exec(d))!==null)dims.push({w:+m[1],h:+m[2]});

  // Build peças
  if(dims.length===0){
    // Try to find single numbers as hints
    var nums=d.match(/\d+/g)||[];
    if(nums.length>=2)dims.push({w:+nums[0],h:+nums[1]});
  }
  var labels=['Bancada principal','Bancada lateral','Peça 3','Peça 4'];
  dims.forEach(function(dim,i){
    parsed.pecas.push({desc:labels[i]||('Peça '+(i+1)),w:dim.w,h:dim.h,q:1});
  });

  // Detect services by keywords
  var svMap=[
    {keys:['sainha reta','reta'],k:'s_reta',label:'Sainha Reta',ml:dims.length?dims[0].w/100:2,altCm:6},
    {keys:['sainha 45','45°','45 grau'],k:'s_45',label:'Sainha 45°',ml:2,altCm:6},
    {keys:['boleada','boleado'],k:'s_boleada',label:'Sainha Boleada',ml:2,altCm:6},
    {keys:['slim'],k:'s_slim',label:'Sainha Slim',ml:2,altCm:4},
    {keys:['frontão','frontao'],k:'frontao',label:'Frontão',ml:dims.length>1?dims[1].w/100:1.2,altCm:30},
    {keys:['furo torneira','torneira'],k:'forn',label:'Furo Torneira',un:1},
    {keys:['furo ralo','ralo'],k:'fralo',label:'Furo Ralo',un:1},
    {keys:['cooktop','cook top'],k:'cook',label:'Recorte Cooktop',un:1},
    {keys:['rebaixo americano','americano'],k:'reb_a',label:'Rebaixo Americano'},
    {keys:['rebaixo'],k:'reb_n',label:'Rebaixo Normal'},
    {keys:['cuba inox','cuba'],k:'cuba_coz',label:'Cuba Inox',u:'cuba'},
    {keys:['cantoneira'],k:'cant',label:'Cantoneira',un:2},
    {keys:['tubo metálico','tubo'],k:'tubo',label:'Tubo Metálico',un:2},
    {keys:['instalação complexa','instalacao complexa','complexa'],k:'inst_c',label:'Instalação Complexa'},
    {keys:['instalação','instalacao'],k:'inst',label:'Instalação Padrão'},
    {keys:['sifão','sifao'],k:'ac_sifao',label:'Sifão',un:1},
    {keys:['flexível','flexivel','flex'],k:'ac_flex',label:'Flexível',un:1},
    {keys:['silicone'],k:'ac_sil',label:'Silicone',un:1},
    {keys:['suporte','mão francesa','mao francesa'],k:'ac_sup',label:'Suporte',un:2},
    {keys:['soleira 2','dois lados'],k:'sol2',label:'Soleira 2 lados',ml:1},
    {keys:['soleira'],k:'sol1',label:'Soleira 1 lado',ml:1},
    {keys:['peitoril'],k:'peit_reto',label:'Peitoril',ml:1.4}
  ];
  var added={};
  svMap.forEach(function(sv){
    if(added[sv.k])return;
    if(sv.keys.some(function(kw){return d.indexOf(kw)>=0;})){
      var item={k:sv.k,label:sv.label};
      if(sv.ml!==undefined){item.ml=sv.ml;item.altCm=sv.altCm||6;}
      if(sv.un!==undefined)item.un=sv.un;
      parsed.servicos.push(item);
      added[sv.k]=true;
    }
  });

  if(parsed.pecas.length===0&&parsed.servicos.length===0){
    st.className='ai-status err';
    st.textContent='❌ Sem internet e não consegui interpretar. Descreva com dimensões como "350×60cm".';
    return;
  }
  _aiResultData=parsed;
  aiMostrarResultado(parsed);
  st.className='ai-status ok';
  st.textContent='✓ Interpretado localmente (sem internet). Revise os itens!';
}

function aiMostrarResultado(parsed){
  var h='';
  // Peças
  if(parsed.pecas&&parsed.pecas.length){
    h+='<div style="font-size:.6rem;color:var(--t3);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;">📐 Peças</div>';
    parsed.pecas.forEach(function(p,i){
      var mat=CFG.stones.find(function(s){return s.id===selMat;});
      var m2=p.w&&p.h?(p.w/100)*(p.h/100)*(p.q||1):0;
      var prev=mat&&m2?'≈ R$ '+fm(m2*mat.pr):'';
      h+='<div class="ai-piece">'
       +'<div class="ai-piece-chk on" data-aipc="'+i+'">✓</div>'
       +'<div class="ai-piece-info">'
       +'<div class="ai-piece-name">'+(p.desc||'Peça')+'</div>'
       +'<div class="ai-piece-dim">'+p.w+'×'+p.h+'cm'+(p.q>1?' × '+p.q:'')+(prev?' · <span style="color:var(--grn)">'+prev+'</span>':'')+'</div>'
       +'</div></div>';
    });
  }
  // Serviços e Acessórios separados
  var svs=(parsed.servicos||[]).filter(function(s){return !s.k.startsWith('ac_');});
  var acs=(parsed.servicos||[]).filter(function(s){return s.k.startsWith('ac_');});
  if(svs.length){
    h+='<div style="font-size:.6rem;color:var(--t3);letter-spacing:1.5px;text-transform:uppercase;margin:10px 0 6px;">🔧 Serviços</div>';
    svs.forEach(function(s,i){
      var idx=(parsed.pecas||[]).length+i;
      var detalhe='';
      if(s.ml)detalhe=' — '+s.ml+'ml'+(s.altCm?' × '+s.altCm+'cm':'');
      else if(s.un&&s.un>1)detalhe=' — '+s.un+'×';
      var pr=getPr(s.k);
      h+='<div class="ai-piece">'
       +'<div class="ai-piece-chk on" data-aisv="'+(parsed.servicos.indexOf(s))+'">✓</div>'
       +'<div class="ai-piece-info">'
       +'<div class="ai-piece-name">'+(s.label||s.k)+'</div>'
       +'<div class="ai-piece-dim">'+(pr?'R$ '+pr:'')+''+detalhe+'</div>'
       +'</div></div>';
    });
  }
  if(acs.length){
    h+='<div style="font-size:.6rem;color:var(--t3);letter-spacing:1.5px;text-transform:uppercase;margin:10px 0 6px;">🔩 Acessórios</div>';
    acs.forEach(function(s){
      var detalhe=s.un?(' — '+s.un+'×'):'';
      var pr=getPr(s.k);
      h+='<div class="ai-piece">'
       +'<div class="ai-piece-chk on" data-aisv="'+(parsed.servicos.indexOf(s))+'">✓</div>'
       +'<div class="ai-piece-info">'
       +'<div class="ai-piece-name">'+(s.label||s.k)+'</div>'
       +'<div class="ai-piece-dim">'+(pr?'R$ '+pr:'')+''+detalhe+'</div>'
       +'</div></div>';
    });
  }
  if(!parsed.pecas.length&&!parsed.servicos.length){
    h='<div style="color:var(--t3);font-size:.8rem;text-align:center;padding:16px;">Nenhum item identificado. Tente descrever com mais detalhes.</div>';
  }
  document.getElementById('aiResultList').innerHTML=h;
  document.getElementById('aiResultBox').style.display='block';
  document.getElementById('btnAIAplicar').style.display='block';
  // Toggle checkmarks
  document.getElementById('aiResultList').addEventListener('click',function(e){
    var chk=e.target.closest('[data-aipc],[data-aisv]');
    if(chk)chk.classList.toggle('on');
  });
}

function aiAplicar(){
  if(!_aiResultData)return;
  var ambId=_aiAmbId;
  var amb=ambientes.find(function(a){return a.id===ambId;});
  if(!amb)amb=ambientes[0];
  if(!amb)return;
  var applied=0;

  // Apply peças
  (_aiResultData.pecas||[]).forEach(function(p,i){
    var chk=document.querySelector('[data-aipc="'+i+'"]');
    if(!chk||!chk.classList.contains('on'))return;
    var existing=amb.pecas[0];
    if(existing&&!existing.w&&!existing.h&&!existing.desc){
      // Fill the empty first peca
      existing.desc=p.desc||'Peça';
      existing.w=+p.w||0;
      existing.h=+p.h||0;
      existing.q=+p.q||1;
    } else {
      amb.pecas.push({id:Date.now()+i,desc:p.desc||'Peça',w:+p.w||0,h:+p.h||0,q:+p.q||1});
    }
    applied++;
  });

  // Apply serviços
  if(!amb.svState)amb.svState={};
  (_aiResultData.servicos||[]).forEach(function(s,i){
    var chk=document.querySelector('[data-aisv="'+i+'"]');
    if(!chk||!chk.classList.contains('on'))return;
    var sv={ml:s.ml||0,altCm:s.altCm||6,q:s.q||1,qty:s.un||1};
    amb.svState[s.k]=sv;
    applied++;
  });

  closeAll();
  _aiResultData=null;
  _aiAmbId=null;
  renderAmbientes();
  toast('✓ '+applied+' itens aplicados!');
}

// ═══ TESTAR API KEY ═══
function testarAPIKey(){
  var key=CFG.emp&&CFG.emp.apiKey;
  var el=document.getElementById('apiTestResult');
  if(!key){if(el)el.textContent='⚠️ Nenhuma chave configurada';return;}
  if(el)el.textContent='⏳ Testando...';
  fetch('https://api.openai.com/v1/chat/completions',{
    method:'POST',
    headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
    body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:10,messages:[{role:'user',content:'oi'}]})
  }).then(function(r){return r.json();}).then(function(d){
    if(el)el.textContent=d.error?'❌ '+d.error.message:'✅ Conectado!';
  }).catch(function(){if(el)el.textContent='❌ Sem conexão';});
}

function escH(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

// Admin PIN
var _adB='';
var _adOn=localStorage.getItem('hr_adm')==='1';
function openAdminPin(){
  if(_adOn){
    _adOn=false;
    localStorage.setItem('hr_adm','0');
    _applyMode();
    toast('Modo funcionario ativado');
    return;
  }
  _adB='';
  _adDots();
  var m=document.getElementById('adMsg');
  if(m)m.textContent='';
  showMd('adminPinMd');
}
function adPin(d){
  if(_adB.length>=4)return;
  _adB+=d;
  _adDots();
  if(_adB.length===4)setTimeout(_adOk,120);
}
function adPinDel(){
  _adB=_adB.slice(0,-1);
  _adDots();
}
function _adDots(){
  for(var i=0;i<4;i++){
    var d=document.getElementById('ad'+i);
    if(!d)continue;
    d.style.background=i<_adB.length?'var(--gold2)':'transparent';
    d.style.borderColor=i<_adB.length?'var(--gold)':'var(--bd2)';
  }
}
function _adOk(){
  var p=(typeof CFG!=='undefined'&&CFG&&CFG.emp&&CFG.emp.adminPin)?CFG.emp.adminPin:'1818';
  if(_adB===p){
    _adOn=true;
    localStorage.setItem('hr_adm','1');
    closeAll();
    _applyMode();
    toast('Bem-vindo, proprietario!');
  } else {
    var m=document.getElementById('adMsg');
    if(m)m.textContent='Senha incorreta';
    _adB='';
    _adDots();
  }
}
function _spPart(){
  var h=document.querySelector('.sp-hero');
  var s=document.getElementById('sSplash');
  if(!h||!s||!s.classList.contains('on'))return;
  for(var i=0;i<7;i++){
    (function(){
      var p=document.createElement('div');
      var sz=2+Math.random()*7;
      var dur=(1.8+Math.random()*2.4).toFixed(1);
      var hue=Math.random()>.5?'rgba(201,168,76,':'rgba(255,230,120,';
      var op=(.15+Math.random()*.35).toFixed(2);
      p.style.cssText=(
        'position:absolute;border-radius:50%;'
        +'background:'+hue+op+');'
        +'width:'+sz+'px;height:'+sz+'px;'
        +'left:'+(5+Math.random()*90)+'%;'
        +'bottom:'+(5+Math.random()*20)+'%;'
        +'animation:spFloat '+dur+'s ease-out forwards;'
        +'pointer-events:none;'
      );
      h.appendChild(p);
      setTimeout(function(){try{h.removeChild(p);}catch(e){}},(+dur+.5)*1000);
    })();
  }
  setTimeout(_spPart,1800);
}
setTimeout(function(){
  _applyMode();
  _spPart();
},400);

function _applyMode(){
  if(_adOn){
    document.body.classList.remove('func-mode');
    var btn=document.getElementById('btnAdm');
    if(btn){btn.innerHTML='&#x1F451;';btn.style.color='var(--gold2)';btn.style.borderColor='rgba(201,168,76,.3)';}
    // Show Empresa and Config in nav
    document.querySelectorAll('[data-pg="5"],[data-pg="6"]').forEach(function(el){
      el.style.opacity='';el.style.pointerEvents='';
      var lk=el.querySelector('.nav-lock');if(lk)lk.remove();
    });
  } else {
    document.body.classList.add('func-mode');
    var btn=document.getElementById('btnAdm');
    if(btn){btn.innerHTML='&#x1F512;';btn.style.color='var(--t3)';btn.style.borderColor='var(--bd)';}
    // Dim Empresa and Config nav items
    document.querySelectorAll('[data-pg="5"],[data-pg="6"]').forEach(function(el){
      el.style.opacity='.4';el.style.pointerEvents='auto';
      if(!el.querySelector('.nav-lock')){
        var lk=document.createElement('span');
        lk.className='nav-lock';lk.textContent='🔒';
        el.appendChild(lk);
      }
    });
  }
}

// PWA Service Worker
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js').catch(function(){});
}

// ── Micro-interactions ──
document.addEventListener('DOMContentLoaded', function(){

  // Ripple effect on buttons
  document.body.addEventListener('touchstart', function(e){
    var btn = e.target.closest('.btn-g, .btn-o, .qa, .sp-btn-main, .sp-btn-cat, .ni');
    if(!btn) return;
    var r = document.createElement('span');
    var rect = btn.getBoundingClientRect();
    var x = (e.touches[0].clientX - rect.left);
    var y = (e.touches[0].clientY - rect.top);
    r.style.cssText = 'position:absolute;width:80px;height:80px;background:rgba(255,255,255,.08);border-radius:50%;transform:translate(-50%,-50%) scale(0);left:'+x+'px;top:'+y+'px;animation:ripple .4s ease-out forwards;pointer-events:none;';
    btn.style.position = btn.style.position || 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(r);
    setTimeout(function(){if(r.parentNode)r.parentNode.removeChild(r);}, 500);
  }, {passive:true});

  // Number counter animation for finance values
  window._animateNum = function(el, target, prefix){
    var start = 0, dur = 600, startTime = null;
    function step(ts){
      if(!startTime) startTime = ts;
      var p = Math.min((ts-startTime)/dur, 1);
      var ease = 1-Math.pow(1-p, 3);
      el.textContent = (prefix||'') + 'R$ ' + (start + (target-start)*ease).toFixed(2).replace('.',',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      if(p<1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  };
});

// Ripple CSS
(function(){
  var s = document.createElement('style');
  s.textContent = '@keyframes ripple{to{transform:translate(-50%,-50%) scale(4);opacity:0;}}';
  document.head.appendChild(s);
})();

function toast(msg){var t=document.getElementById('toast');t.textContent=msg;t.classList.add('on');setTimeout(function(){t.classList.remove('on');},2500);}


