// ===== THREE.JS BACKGROUND =====
(function(){
  var c=document.getElementById('webgl-bg');
  if(!c)return;
  var r=new THREE.WebGLRenderer({canvas:c,antialias:true,alpha:true});
  r.setSize(innerWidth,innerHeight);
  r.setPixelRatio(Math.min(devicePixelRatio,2));
  var s=new THREE.Scene();
  var cam=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,0.1,1000);
  cam.position.z=30;
  var N=800,g=new THREE.BufferGeometry();
  var pos=new Float32Array(N*3),col=new Float32Array(N*3);
  for(var i=0;i<N;i++){
    pos[i*3]=(Math.random()-0.5)*60;
    pos[i*3+1]=(Math.random()-0.5)*60;
    pos[i*3+2]=(Math.random()-0.5)*40;
    var t=Math.random();
    if(t<0.6){col[i*3]=0;col[i*3+1]=0.94;col[i*3+2]=1;}
    else if(t<0.8){col[i*3]=0;col[i*3+1]=1;col[i*3+2]=0.5;}
    else{col[i*3]=1;col[i*3+1]=0.3;col[i*3+2]=0.8;}
  }
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  g.setAttribute('color',new THREE.BufferAttribute(col,3));
  var m=new THREE.PointsMaterial({size:0.15,vertexColors:true,transparent:true,opacity:0.8});
  var pts=new THREE.Points(g,m);
  s.add(pts);
  s.add(cam);
  function draw(){r.render(s,cam);pts.rotation.y+=0.0003;pts.rotation.x+=0.0001;}
  function loop(){requestAnimationFrame(loop);draw();}
  loop();
  addEventListener('resize',function(){r.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();});
})();

// ===== TABS =====
document.querySelectorAll('.tab').forEach(function(tab){
  tab.addEventListener('click',function(){
    var sec=this.getAttribute('data-section');
    document.querySelectorAll('.section').forEach(function(s){s.style.display='none';});
    document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('active');});
    var el=document.getElementById(sec);
    el.style.display='block';
    this.classList.add('active');
    if(sec==='earnings')setTimeout(function(){drawEarningsChart();},50);
    if(sec==='architecture')setTimeout(function(){drawArchDiagram();},50);
    if(sec==='flowchart')setTimeout(function(){drawFlowChart();},50);
  });
});

// ===== DEMO DATA =====
var demoData=[
  {ticker:'KXTRADE26',title:'US-China Trade Deal 2026',outcomePrices:'[15,85]',volume:89000000,status:'open'},
  {ticker:'KXBTC',title:'Bitcoin Above 100K',outcomePrices:'[22,78]',volume:23000000,status:'open'},
  {ticker:'KXETH',title:'Ethereum Above 5000',outcomePrices:'[48,52]',volume:1500000,status:'open'},
  {ticker:'KXINFLATION',title:'CPI Under 3% Dec 2026',outcomePrices:'[35,65]',volume:4300000,status:'open'},
  {ticker:'KXRATE',title:'Fed Rate Below 4%',outcomePrices:'[65,35]',volume:5600000,status:'open'},
  {ticker:'KXSNP500',title:'S&P 500 Above 7000',outcomePrices:'[8,92]',volume:120000000,status:'open'},
  {ticker:'KXDJIA',title:'Dow Above 45000',outcomePrices:'[12,88]',volume:95000000,status:'open'},
  {ticker:'KXNASDAQ',title:'Nasdaq Above 20000',outcomePrices:'[18,82]',volume:110000000,status:'open'},
  {ticker:'KXHOUSING',title:'Housing Market Crash 2026',outcomePrices:'[5,95]',volume:78000000,status:'open'},
  {ticker:'KXGOLD',title:'Gold Above 3000',outcomePrices:'[28,72]',volume:34000000,status:'open'},
  {ticker:'KXUNEMP',title:'Unemployment Above 5%',outcomePrices:'[42,58]',volume:21000000,status:'open'},
  {ticker:'KXRECESSION',title:'Recession in 2026',outcomePrices:'[30,70]',volume:45000000,status:'open'}
];

var allMarkets=[];
var currentFilter='all';

// ===== SCAN MARKETS =====
async function scanMarkets(){
  var st=document.getElementById('status-text');
  var mc=document.getElementById('market-count');
  st.textContent='SCANNING...';
  document.getElementById('api-status').querySelector('.dot').className='dot offline';
  document.getElementById('scanner-results').innerHTML='<div class="loading"><div class="spinner"></div>Fetching markets...</div>';

  try{
    var resp=await fetch('https://external-api.kalshi.com/v2/markets?limit=50&active=true');
    var data=await resp.json();
    if(data && data.markets && data.markets.length>0){
      allMarkets=data.markets;
      st.textContent='LIVE - '+allMarkets.length+' MARKETS';
      document.getElementById('api-status').querySelector('.dot').className='dot online';
      mc.style.display='inline-flex';
      document.getElementById('market-count-text').textContent=allMarkets.length+' MARKETS';
    }else{
      throw new Error('No data');
    }
  }catch(e){
    allMarkets=demoData;
    st.textContent='DEMO DATA (API BLOCKED)';
    document.getElementById('api-status').querySelector('.dot').className='dot offline';
    mc.style.display='inline-flex';
    document.getElementById('market-count-text').textContent=demoData.length+' DEMO';
  }
  applyFilter();
}

function parsePrices(p){
  if(!p)return[50,50];
  if(typeof p==='string'){
    var m=p.match(/\[(\d+),(\d+)\]/);
    if(m)return[parseInt(m[1]),parseInt(m[2])];
  }
  return[50,50];
}

function formatVol(v){
  if(!v)return'N/A';
  if(v>=1e6)return(v/1e6).toFixed(1)+'M';
  if(v>=1e3)return(v/1e3).toFixed(1)+'K';
  return v.toString();
}

// ===== FILTERS =====
function applyFilter(){
  var filtered=allMarkets;
  var q=document.getElementById('scanner-search').value.toLowerCase().trim();
  if(currentFilter==='open'){
    filtered=filtered.filter(function(m){return m.status==='open';});
  }
  if(q){
    filtered=filtered.filter(function(m){
      return (m.ticker||'').toLowerCase().indexOf(q)>=0 ||
             (m.title||'').toLowerCase().indexOf(q)>=0;
    });
  }
  displayResults(filtered);
}

document.getElementById('btn-scan').addEventListener('click',function(){scanMarkets();});
document.getElementById('btn-all').addEventListener('click',function(){
  currentFilter='all';
  document.getElementById('btn-all').classList.add('active');
  document.getElementById('btn-open').classList.remove('active');
  applyFilter();
});
document.getElementById('btn-open').addEventListener('click',function(){
  currentFilter='open';
  document.getElementById('btn-open').classList.add('active');
  document.getElementById('btn-all').classList.remove('active');
  applyFilter();
});
document.getElementById('scanner-search').addEventListener('input',function(){applyFilter();});

function displayResults(markets){
  var res=document.getElementById('scanner-results');
  var tbody=document.getElementById('top10-body');
  tbody.innerHTML='';
  if(markets.length===0){
    res.innerHTML='<p style="color:var(--dim);text-align:center;padding:2rem">No markets match your filter</p>';
    tbody.innerHTML='<tr><td colspan="5" style="text-align:center;color:var(--dim)">No results</td></tr>';
    return;
  }
  var sorted=markets.slice().sort(function(a,b){
    var pa=parsePrices(a.outcomePrices);
    var pb=parsePrices(b.outcomePrices);
    return Math.abs(pb[0]-pb[1])-Math.abs(pa[0]-pa[1]);
  });
  var top10=sorted.slice(0,10);
  top10.forEach(function(mk){
    var tr=document.createElement('tr');
    tr.className='clickable';
    var prices=parsePrices(mk.outcomePrices);
    var edge=Math.abs(prices[0]-prices[1]);
    var yesColor=prices[0]>=50?'var(--green)':'var(--red)';
    var noColor=prices[1]>=50?'var(--green)':'var(--red)';
    tr.innerHTML='<td>'+mk.ticker+'</td><td>'+mk.title+'</td><td style="color:'+yesColor+'">'+prices[0]+'&#162;</td><td style="color:'+noColor+'">'+prices[1]+'&#162;</td><td style="color:var(--cyan)">'+edge+'&#162;</td>';
    tr.addEventListener('click',function(){showDetail(mk);});
    tbody.appendChild(tr);
  });
  var html='';
  sorted.forEach(function(mk){
    var prices=parsePrices(mk.outcomePrices);
    var edge=Math.abs(prices[0]-prices[1]);
    var yesColor=prices[0]>=50?'var(--green)':'var(--red)';
    var noColor=prices[1]>=50?'var(--green)':'var(--red)';
    html+='<div class="market-item" data-ticker="'+mk.ticker+'">';
    html+='<div class="m-header"><span class="ticker">'+mk.ticker+'</span><span class="m-title">'+mk.title+'</span></div>';
    html+='<div class="m-prices">';
    html+='<span class="price-yes" style="color:'+yesColor+'">YES '+prices[0]+'&#162;</span>';
    html+='<span class="price-no" style="color:'+noColor+'">NO '+prices[1]+'&#162;</span>';
    html+='<span class="edge">EDGE '+edge+'&#162;</span>';
    html+='</div></div>';
  });
  res.innerHTML=html;
  res.querySelectorAll('.market-item').forEach(function(item){
    item.addEventListener('click',function(){
      var t=this.getAttribute('data-ticker');
      var mk=allMarkets.find(function(m){return m.ticker===t;});
      if(mk)showDetail(mk);
    });
  });
}

function showDetail(mk){
  var d=document.getElementById('market-detail');
  var prices=parsePrices(mk.outcomePrices);
  var edge=Math.abs(prices[0]-prices[1]);
  var vol=formatVol(mk.volume);
  var yesColor=prices[0]>=50?'var(--green)':'var(--red)';
  var noColor=prices[1]>=50?'var(--green)':'var(--red)';
  var statusColor=mk.status==='open'?'var(--green)':'var(--red)';
  d.innerHTML='<h2>&#127919; '+mk.ticker+'</h2>';
  d.innerHTML+='<p style="font-size:1rem;margin-bottom:0.3rem">'+mk.title+'</p>';
  d.innerHTML+='<p style="color:var(--dim);margin-bottom:1rem;font-size:0.8rem">Status: <span style="color:'+statusColor+'">'+mk.status.toUpperCase()+'</span></p>';
  d.innerHTML+='<div class="grid grid-2" style="gap:0.8rem">';
  d.innerHTML+='<div class="calc-result"><div class="label">YES</div><div class="value" style="color:'+yesColor+'">'+prices[0]+'&#162;</div></div>';
  d.innerHTML+='<div class="calc-result"><div class="label">NO</div><div class="value" style="color:'+noColor+'">'+prices[1]+'&#162;</div></div>';
  d.innerHTML+='<div class="calc-result"><div class="label">EDGE</div><div class="value cyan">'+edge+'&#162;</div></div>';
  d.innerHTML+='<div class="calc-result"><div class="label">VOLUME</div><div class="value white">'+vol+'</div></div>';
  d.innerHTML+='</div>';
  d.innerHTML+='<div class="info-box" style="margin-top:1rem"><strong>How to trade:</strong> Buy YES at '+prices[0]+'&#162; if you think this event is more likely than '+(prices[0])+'%. Buy NO at '+prices[1]+'&#162; if you think it is less likely. Each contract pays $1.00 if you are right.</div>';
}

// ===== CALCULATOR =====
document.getElementById('calc-btn').addEventListener('click',function(){
  var buy=parseInt(document.getElementById('calc-buy').value);
  var invest=parseFloat(document.getElementById('calc-invest').value);
  var res=document.getElementById('calc-results');
  if(isNaN(buy)||isNaN(invest)||buy<1||buy>99||invest<1){
    res.innerHTML='<p style="color:var(--red);width:100%;text-align:center">Enter valid values (buy: 1-99, invest: >0)</p>';
    return;
  }
  var units=Math.floor(invest/(buy/100));
  var totalCost=units*(buy/100);
  var netProfit=units*(1-buy/100);
  var roi=(netProfit/totalCost*100).toFixed(1);
  var monthlyNet=netProfit*4;
  var annualNet=netProfit*48;
  res.innerHTML='';
  res.innerHTML+='<div class="calc-result"><div class="label">UNITS</div><div class="value white">'+units+'</div></div>';
  res.innerHTML+='<div class="calc-result"><div class="label">TOTAL COST</div><div class="value white">$'+totalCost.toFixed(2)+'</div></div>';
  res.innerHTML+='<div class="calc-result"><div class="label">IF WIN</div><div class="value green">+$'+netProfit.toFixed(2)+'</div></div>';
  res.innerHTML+='<div class="calc-result"><div class="label">ROI</div><div class="value cyan">'+roi+'%</div></div>';
  res.innerHTML+='<div class="calc-result"><div class="label">MO (4x)</div><div class="value green">+$'+monthlyNet.toFixed(2)+'</div></div>';
  res.innerHTML+='<div class="calc-result"><div class="label">ANNUAL (48x)</div><div class="value green">+$'+annualNet.toFixed(2)+'</div></div>';
});

// ===== EARNINGS =====
function drawEarningsChart(){
  var ctx=document.getElementById('earnings-chart');
  if(!ctx)return;
  var tbody=document.getElementById('earnings-body');
  tbody.innerHTML='';
  var probs=[20,30,40,50,60,70,80,90];
  var invest=100;
  var cols=['#ff6b6b','#ff8c42','#ffa94d','#ffd43b','#a9e34b','#69db7c','#38d9a9','#4dabf7'];
  var labels=[],data=[];
  probs.forEach(function(p,i){
    labels.push(p+'%');
    var profit=(100-p)/100*invest;
    data.push(profit.toFixed(2));
    var tr=document.createElement('tr');
    var monthly=profit*4;
    var annual=profit*48;
    var roi=(profit/invest*100).toFixed(1);
    tr.innerHTML='<td>'+p+'%</td><td>$'+invest+'</td><td style="color:var(--green)">+$'+profit.toFixed(2)+'</td><td style="color:var(--cyan)">'+roi+'%</td><td style="color:var(--green)">+$'+monthly.toFixed(2)+'</td><td style="color:var(--green)">+$'+annual.toFixed(2)+'</td>';
    tbody.appendChild(tr);
  });
  if(window.earningsChart)window.earningsChart.destroy();
  window.earningsChart=new Chart(ctx,{
    type:'bar',
    data:{labels:labels,datasets:[{label:'Profit per $100 trade',data:data,backgroundColor:cols,borderRadius:4}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{grid:{color:'rgba(255,255,255,0.05)'},ticks:{color:'#8899aa'}},x:{grid:{display:false},ticks:{color:'#8899aa'}}}}
  });
}

// ===== ARCHITECTURE DIAGRAM =====
function drawArchDiagram(){
  var d=document.getElementById('arch-diagram');
  if(!d)return;
  var boxes=[
    {label:'Kalshi API',color:'var(--cyan)',icon:'&#128225;'},
    {label:'CORS Proxy',color:'var(--purple)',icon:'&#128260;'},
    {label:'Data Parser',color:'var(--green)',icon:'&#128202;'},
    {label:'Analysis Engine',color:'var(--yellow)',icon:'&#129504;'},
    {label:'UI Renderer',color:'var(--cyan)',icon:'&#128421;'},
    {label:'Discord Bot',color:'var(--magenta)',icon:'&#129302;'}
  ];
  var html='<div style="display:flex;flex-direction:column;align-items:center;gap:0.3rem;padding:1rem;width:100%">';
  boxes.forEach(function(b,i){
    html+='<div class="arch-box" style="border-color:'+b.color+';color:'+b.color+'">'+b.icon+' '+b.label+'</div>';
    if(i<boxes.length-1)html+='<div class="arch-arrow">&#8595;</div>';
  });
  html+='</div>';
  d.innerHTML=html;
}

// ===== FLOW CHART =====
function drawFlowChart(){
  var d=document.getElementById('flowchart-container');
  if(!d)return;
  var steps=[
    {label:'1. Fetch Markets',desc:'GET /v2/markets?limit=50&active=true',color:'var(--cyan)'},
    {label:'2. Parse Response',desc:'Extract outcomePrices, volume, status',color:'var(--green)'},
    {label:'3. Calculate Edge',desc:'|yesPrice - noPrice| = confidence score',color:'var(--yellow)'},
    {label:'4. Sort & Filter',desc:'Sort by edge desc, apply user filters',color:'var(--purple)'},
    {label:'5. Render UI',desc:'Build table, chart, and detail views',color:'var(--cyan)'}
  ];
  var html='<div style="display:flex;flex-wrap:wrap;gap:0.8rem;justify-content:center;padding:1rem;width:100%">';
  steps.forEach(function(s){
    html+='<div class="flow-step" style="border-color:'+s.color+'">';
    html+='<div class="step-title" style="color:'+s.color+'">'+s.label+'</div>';
    html+='<div class="step-desc">'+s.desc+'</div>';
    html+='</div>';
  });
  html+='</div>';
  d.innerHTML=html;
}

// ===== TICKER BAR =====
function buildTicker(){
  var track=document.getElementById('ticker-track');
  var items=demoData.map(function(m){return '<span class="ticker-item"><span class="label">'+m.ticker+'</span> <span class="val">'+parsePrices(m.outcomePrices)[0]+'&#162;</span></span>';});
  var text=items.join('  &#9670;  ');
  track.innerHTML=text+'  &#9670;  '+text;
}


// ===== TOOLTIP PORTAL =====
(function(){
  var activeTip=null;
  function showTip(el){
    hideTip();
    var tip=el.querySelector('.tip-text');
    if(!tip)return;
    activeTip=el;
    tip.classList.add('show');
    var rect=el.getBoundingClientRect();
    var tipW=280;
    var left=rect.left+rect.width/2-tipW/2;
    if(left<10)left=10;
    if(left+tipW>innerWidth-10)left=innerWidth-tipW-10;
    tip.style.left=left+'px';
    tip.style.top=(rect.top-tip.offsetHeight-10)+'px';
  }
  function hideTip(){
    if(activeTip){
      var t=activeTip.querySelector('.tip-text');
      if(t)t.classList.remove('show');
      activeTip=null;
    }
  }
  document.querySelectorAll('.tooltip').forEach(function(el){
    el.addEventListener('mouseenter',function(){showTip(el);});
    el.addEventListener('mouseleave',function(){hideTip();});
    el.addEventListener('click',function(e){
      e.preventDefault();
      if(activeTip===el){hideTip();}else{showTip(el);}
    });
  });
  document.addEventListener('click',function(e){
    if(!e.target.closest('.tooltip'))hideTip();
  });
  document.addEventListener('scroll',function(){hideTip();});
})();

// ===== INIT =====
buildTicker();
setTimeout(function(){scanMarkets();},500);
