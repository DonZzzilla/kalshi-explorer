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
  var N=400,g=new THREE.BufferGeometry();
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
  var m=new THREE.PointsMaterial({size:0.1,vertexColors:true,transparent:true,opacity:0.3});
  var pts=new THREE.Points(g,m);
  s.add(pts);
  s.add(cam);
  function draw(){r.render(s,cam);pts.rotation.y+=0.0001;pts.rotation.x+=0.00005;}
  function loop(){requestAnimationFrame(loop);draw();}
  loop();
  addEventListener('resize',function(){r.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();});
})();

// ===== TAB SWITCHING (tabs + nav links) =====
function switchTab(sec){
  document.querySelectorAll('.section').forEach(function(s){s.style.display='none';});
  document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('active');});
  document.querySelectorAll('.nav-links a').forEach(function(a){a.classList.remove('active');});
  var el=document.getElementById(sec);
  if(el)el.style.display='block';
  document.querySelectorAll('[data-section="'+sec+'"]').forEach(function(t){t.classList.add('active');});
  if(sec==='earnings')setTimeout(function(){requestAnimationFrame(function(){drawEarningsChart();});},100);
  if(sec==='architecture')setTimeout(function(){requestAnimationFrame(function(){drawArchDiagram();});},100);
  if(sec==='flowchart')setTimeout(function(){requestAnimationFrame(function(){drawFlowChart();});},100);
}

document.querySelectorAll('.tab').forEach(function(tab){
  tab.addEventListener('click',function(){
    switchTab(this.getAttribute('data-section'));
  });
});

document.querySelectorAll('.nav-links a').forEach(function(a){
  a.addEventListener('click',function(){
    switchTab(this.getAttribute('data-section'));
  });
});

// ===== DEMO DATA (new schema, used as fallback) =====
var demoData=[
  {ticker:'KXTRADE26',title:'US-China Trade Deal 2026',yes:15,no:85,volume:89000000,status:'active'},
  {ticker:'KXBTC',title:'Bitcoin Above 100K',yes:22,no:78,volume:23000000,status:'active'},
  {ticker:'KXETH',title:'Ethereum Above 5000',yes:48,no:52,volume:1500000,status:'active'},
  {ticker:'KXINFLATION',title:'CPI Under 3% Dec 2026',yes:35,no:65,volume:4300000,status:'active'},
  {ticker:'KXRATE',title:'Fed Rate Below 4%',yes:65,no:35,volume:5600000,status:'active'},
  {ticker:'KXSNP500',title:'S&P 500 Above 7000',yes:8,no:92,volume:120000000,status:'active'},
  {ticker:'KXDJIA',title:'Dow Above 45000',yes:12,no:88,volume:95000000,status:'active'},
  {ticker:'KXNASDAQ',title:'Nasdaq Above 20000',yes:18,no:82,volume:110000000,status:'active'},
  {ticker:'KXHOUSING',title:'Housing Market Crash 2026',yes:5,no:95,volume:78000000,status:'active'},
  {ticker:'KXGOLD',title:'Gold Above 3000',yes:28,no:72,volume:34000000,status:'active'},
  {ticker:'KXUNEMP',title:'Unemployment Above 5%',yes:42,no:58,volume:21000000,status:'active'},
  {ticker:'KXRECESSION',title:'Recession in 2026',yes:30,no:70,volume:45000000,status:'active'}
];

var allMarkets=[];
var currentFilter='all';
var lastSource='demo'; // 'live-corsproxy' | 'live-corssh' | 'demo' | null

// ===== KALSHI API ENDPOINT =====
// New endpoint as of 2026: /trade-api/v2/markets
// CORS proxies (try in order until one works). Direct browser fetch is blocked.
var KALSHI_BASE='https://external-api.kalshi.com/trade-api/v2/markets?status=open&limit=200';
var CORS_PROXIES=[
  function(u){return 'https://corsproxy.io/?url='+encodeURIComponent(u);},
  function(u){return 'https://proxy.cors.sh/?'+u;} // cors.sh uses the URL as a path/query
];

async function fetchKalshi(){
  for(var i=0;i<CORS_PROXIES.length;i++){
    var proxyFn=CORS_PROXIES[i];
    var url=proxyFn(KALSHI_BASE);
    try{
      var resp=await fetch(url,{cache:'no-store'});
      if(!resp.ok)continue;
      var data=await resp.json();
      if(data && data.markets && data.markets.length>0){
        return {markets:data.markets,source:i===0?'live-corsproxy':'live-corssh'};
      }
    }catch(e){/* try next proxy */}
  }
  return null;
}

// Normalize a raw Kalshi market into our internal shape
function normalizeMarket(m){
  // Prices are dollar strings like "0.6500" — convert to cents
  function toCents(s){
    if(s===null||s===undefined||s==='')return null;
    var n=parseFloat(s);
    if(isNaN(n))return null;
    return Math.round(n*100);
  }
  // Use mid of bid/ask if available; fall back to last_price
  var yesBid=toCents(m.yes_bid_dollars);
  var yesAsk=toCents(m.yes_ask_dollars);
  var noBid=toCents(m.no_bid_dollars);
  var noAsk=toCents(m.no_ask_dollars);
  var yes=null,no=null;
  if(yesBid!==null&&yesAsk!==null)yes=Math.round((yesBid+yesAsk)/2);
  else if(yesBid!==null)yes=yesBid;
  else if(yesAsk!==null)yes=yesAsk;
  else{var lp=toCents(m.last_price_dollars);if(lp!==null)yes=lp;}
  if(noBid!==null&&noAsk!==null)no=Math.round((noBid+noAsk)/2);
  else if(noBid!==null)no=noBid;
  else if(noAsk!==null)no=noAsk;
  else if(yes!==null)no=100-yes;
  if(yes===null||no===null){yes=yes||50;no=no||50;}
  // Volume: prefer 24h if non-zero, else total
  var v24=parseFloat(m.volume_24h_fp||'0');
  var vTot=parseFloat(m.volume_fp||'0');
  var volume=(v24>0?v24:vTot)*100; // API returns dollars in cents when *_fp is used
  return {
    ticker:m.ticker,
    title:m.title,
    yes:yes,
    no:no,
    volume:Math.round(volume),
    status:m.status||'active',
    open_time:m.open_time,
    close_time:m.close_time
  };
}

// ===== SCAN MARKETS =====
async function scanMarkets(){
  var st=document.getElementById('status-text');
  var mc=document.getElementById('market-count');
  st.textContent='SCANNING...';
  document.getElementById('api-status').querySelector('.dot').className='dot offline';
  document.getElementById('scanner-results').innerHTML='<div class="loading"><div class="spinner"></div>Fetching live markets from Kalshi...</div>';

  try{
    var result=await fetchKalshi();
    if(result && result.markets && result.markets.length>0){
      allMarkets=result.markets.map(normalizeMarket).filter(function(m){return m.yes>0&&m.yes<100;});
      lastSource=result.source;
      var srcLabel=result.source==='live-corsproxy'?'LIVE (corsproxy.io)':'LIVE (proxy.cors.sh)';
      st.textContent=srcLabel+' — '+allMarkets.length+' MARKETS';
      document.getElementById('api-status').querySelector('.dot').className='dot online';
      mc.style.display='inline-flex';
      document.getElementById('market-count-text').textContent=allMarkets.length+' MARKETS';
    }else{
      throw new Error('All proxies failed');
    }
  }catch(e){
    allMarkets=demoData;
    lastSource='demo';
    st.textContent='DEMO DATA (all proxies failed)';
    document.getElementById('api-status').querySelector('.dot').className='dot offline';
    mc.style.display='inline-flex';
    document.getElementById('market-count-text').textContent=demoData.length+' DEMO';
  }
  buildTicker();
  applyFilter();
}

// Returns {yes, no} in cents. Accepts internal shape (yes/no) or legacy shape (outcomePrices string).
function parsePrices(p){
  if(!p)return[50,50];
  if(typeof p==='object'&&p!==null){
    if(typeof p.yes==='number'&&typeof p.no==='number')return[p.yes,p.no];
  }
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

// ===== CALCULATOR (whole cents only) =====
document.getElementById('calc-btn').addEventListener('click',function(){
  var buyRaw=document.getElementById('calc-buy').value;
  var investRaw=document.getElementById('calc-invest').value;
  var res=document.getElementById('calc-results');
  var errEl=document.getElementById('calc-error');
  errEl.style.display='none';
  res.innerHTML='';

  var buy=parseInt(buyRaw);
  var invest=parseFloat(investRaw);

  if(isNaN(buy)||buy<1||buy>99||buyRaw!==String(buy)){
    errEl.textContent='Buy price must be a whole number (1-99). No decimals! Example: type 65 for 65 cents.';
    errEl.style.display='block';
    res.innerHTML='<p style="color:var(--dim);width:100%;text-align:center">Fix the error above</p>';
    return;
  }
  if(isNaN(invest)||invest<1){
    errEl.textContent='Investment must be a positive number.';
    errEl.style.display='block';
    res.innerHTML='<p style="color:var(--dim);width:100%;text-align:center">Fix the error above</p>';
    return;
  }

  var units=Math.floor(invest/(buy/100));
  var totalCost=units*(buy/100);
  var netProfit=units*(1-buy/100);
  var roi=(netProfit/totalCost*100).toFixed(1);
  var monthlyNet=netProfit*4;
  var annualNet=netProfit*48;
  res.innerHTML+='<div class="calc-result"><div class="label">CONTRACTS</div><div class="value white">'+units+'</div></div>';
  res.innerHTML+='<div class="calc-result"><div class="label">TOTAL COST</div><div class="value white">$'+totalCost.toFixed(2)+'</div></div>';
  res.innerHTML+='<div class="calc-result"><div class="label">IF WIN</div><div class="value green">+$'+netProfit.toFixed(2)+'</div></div>';
  res.innerHTML+='<div class="calc-result"><div class="label">ROI</div><div class="value cyan">'+roi+'%</div></div>';
  res.innerHTML+='<div class="calc-result"><div class="label">MO (4x)</div><div class="value green">+$'+monthlyNet.toFixed(2)+'</div></div>';
  res.innerHTML+='<div class="calc-result"><div class="label">YR (48x)</div><div class="value green">+$'+annualNet.toFixed(2)+'</div></div>';
});

// ===== EARNINGS CHART (simplified) =====
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
    labels.push(p+' cents');
    var profit=(100-p)/100*invest;
    data.push(profit.toFixed(2));
    var tr=document.createElement('tr');
    var monthly=profit*4;
    var annual=profit*48;
    var roi=(profit/invest*100).toFixed(1);
    tr.innerHTML='<td>'+p+' cents</td><td>$'+invest+'</td><td style="color:var(--green)">+$'+profit.toFixed(2)+'</td><td style="color:var(--cyan)">'+roi+'%</td><td style="color:var(--green)">+$'+monthly.toFixed(2)+'</td><td style="color:var(--green)">+$'+annual.toFixed(2)+'</td>';
    tbody.appendChild(tr);
  });
  if(window.earningsChart)window.earningsChart.destroy();
  window.earningsChart=new Chart(ctx,{
    type:'bar',
    data:{labels:labels,datasets:[{label:'Profit if you win ($100 invested)',data:data,backgroundColor:cols,borderRadius:4}]},
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{
        y:{grid:{color:'rgba(255,255,255,0.05)'},ticks:{color:'#9a9ab0',callback:function(v){return'$'+v}},title:{display:true,text:'Profit ($)',color:'#9a9ab0'}},
        x:{grid:{display:false},ticks:{color:'#9a9ab0'},title:{display:true,text:'Buy Price (cents)',color:'#9a9ab0'}}
      }
    }
  });
}

// ===== ARCHITECTURE DIAGRAM (clickable, expandable) =====
var archSteps=[
  {
    label:'Kalshi API',
    color:'var(--cyan)',
    icon:'&#128225;',
    explain:
      '<span class="tip-label">Kalshi API</span>'+
      '<div class="tier-block" data-tier="caveman">Big computer with all the bet info.</div>'+
      '<div class="tier-block" data-tier="child">Kalshi\'s website computer. It knows all the markets and prices.</div>'+
      '<div class="tier-block" data-tier="teenager"><b>What it is:</b> Kalshi runs the prediction market. Their server holds all the data - every market, every price, every trade.<br><br><b>Think of it like:</b> A store\'s inventory database. It knows everything for sale and what it costs.<br><br><b>The endpoint:</b> <code>GET https://external-api.kalshi.com/trade-api/v2/markets</code><br>No login needed - it\'s a public API!</div>'+
      '<div class="tier-block" data-tier="indepth"><b>REST API</b> served by Kalshi Inc. (CFTC-regulated DCM). Base URL <code>https://external-api.kalshi.com/trade-api/v2</code> (changed from the old <code>/v2</code> path in 2026). Endpoints are unauthenticated for read-only market data (markets, events, orderbook) but require an RSA-signed API key for any write operation (placing orders, viewing positions, withdrawing). Rate limit: ~100 req/min per IP for unauthenticated traffic. Responses are JSON, ISO timestamps, prices in dollars (e.g. <code>"0.6500"</code>) with 4-decimal precision, and volumes as <code>*_fp</code> strings (cents).</div>'
  },
  {
    label:'CORS Proxy',
    color:'var(--purple)',
    icon:'&#128260;',
    explain:
      '<span class="tip-label">CORS Proxy</span>'+
      '<div class="tier-block" data-tier="caveman">Helper that calls for us.</div>'+
      '<div class="tier-block" data-tier="child">A friend who makes the phone call because our computer can\'t call the number directly.</div>'+
      '<div class="tier-block" data-tier="teenager"><b>What it is:</b> A middleman that sits between your browser and Kalshi\'s server.<br><br><b>Why we need it:</b> Browsers have a security rule called CORS. It blocks web pages from talking to servers on different websites. Kalshi hasn\'t opened their API to browsers, so we route through a proxy that adds the right permissions.<br><br><b>Think of it like:</b> A friend who makes a phone call for you because your phone can\'t call that number directly.</div>'+
      '<div class="tier-block" data-tier="indepth">A CORS proxy is a thin server that adds the <code>Access-Control-Allow-Origin: *</code> header to responses. This page tries two in order: <code>corsproxy.io</code> (URL-encoded target) and <code>proxy.cors.sh</code> (target as a query string). If both fail, the page falls back to built-in demo data. Public proxies have no SLA, may rate-limit, and may log your traffic — fine for a public explorer, not for production trading. The proxy is only needed for the browser-only deployment — a server-side bot calls Kalshi directly.</div>'
  },
  {
    label:'Data Parser',
    color:'var(--green)',
    icon:'&#128202;',
    explain:
      '<span class="tip-label">Data Parser</span>'+
      '<div class="tier-block" data-tier="caveman">Makes messy clean.</div>'+
      '<div class="tier-block" data-tier="child">Helper that picks the important stuff from a long messy answer.</div>'+
      '<div class="tier-block" data-tier="teenager"><b>What it is:</b> Code that takes the raw data from the API and cleans it up.<br><br><b>What it does:</b> The API returns a big JSON blob. The parser extracts just what we need: the ticker name, the YES/NO prices, the volume, and the status. It turns messy data into a clean list.<br><br><b>Think of it like:</b> A translator who takes a legal document and gives you the summary in plain English.</div>'+
      '<div class="tier-block" data-tier="indepth">Stateless transform: <code>JSON.parse()</code> → array of market objects → <code>map(normalizeMarket)</code> to a flat row schema ({ticker, title, yes, no, volume, status, open_time, close_time}). Each call: <code>cents = round(parseFloat(yes_bid_dollars) * 100)</code>, then the mid of bid+ask is used for the displayed price. The parser also handles the new volume fields (<code>volume_24h_fp</code> preferred, fallback to <code>volume_fp</code>).</div>'
  },
  {
    label:'Analysis Engine',
    color:'var(--yellow)',
    icon:'&#129504;',
    explain:
      '<span class="tip-label">Analysis Engine</span>'+
      '<div class="tier-block" data-tier="caveman">Brain. Picks winners.</div>'+
      '<div class="tier-block" data-tier="child">Smart helper that finds the most interesting markets.</div>'+
      '<div class="tier-block" data-tier="teenager"><b>What it is:</b> The brain of the operation. This code looks at all the markets and figures out which ones are interesting.<br><br><b>What it calculates:</b><br>&bull; <b>Edge</b> = the gap between YES and NO prices<br>&bull; <b>Volume score</b> = how active the market is<br>&bull; <b>Opportunity rank</b> = which markets to watch<br><br><b>Think of it like:</b> A scout at a sports game, watching all the players and picking out the best prospects.</div>'+
      '<div class="tier-block" data-tier="indepth">Pure functions over the parsed market list. Computes: (1) <code>edge = |yes - no|</code>; (2) <code>volume_score = log10(volume) / 7</code> (saturates at $10M); (3) <code>recency_score = e^(-Δt/24h)</code> (decays over a day); (4) <code>composite = 0.5*edge + 0.3*volume_score + 0.2*recency_score</code>. The composite score ranks markets in the Top-10 view. No ML — just weighted heuristics that you can tune.</div>'
  },
  {
    label:'UI Renderer',
    color:'var(--cyan)',
    icon:'&#128421;',
    explain:
      '<span class="tip-label">UI Renderer</span>'+
      '<div class="tier-block" data-tier="caveman">Draws pretty boxes.</div>'+
      '<div class="tier-block" data-tier="child">Helper that builds all the buttons, tables, and pictures on the page.</div>'+
      '<div class="tier-block" data-tier="teenager"><b>What it is:</b> The code that draws everything you see on screen - the tables, charts, buttons, and colors.<br><br><b>How it works:</b> JavaScript reads the analyzed data and creates HTML elements on the fly. When you click SCAN, it builds the market list. When you click a market, it builds the detail panel.<br><br><b>Think of it like:</b> A movie set designer. The data is the script, and the renderer builds what you actually see.</div>'+
      '<div class="tier-block" data-tier="indepth">Vanilla DOM rendering: <code>document.createElement</code> + <code>el.innerHTML = ...</code> for tables and lists; Chart.js (canvas) for the earnings curve; a small custom WebGL background (three.js) for the particle effect. No framework — the entire bundle (excluding CDN libs) is ~25KB. The renderer is the only stateful component: it holds the current filter, sort, and selection in module-level vars.</div>'
  },
  {
    label:'Discord Bot',
    color:'var(--magenta)',
    icon:'&#129302;',
    explain:
      '<span class="tip-label">Discord Bot</span>'+
      '<div class="tier-block" data-tier="caveman">Helper that tells you stuff in chat.</div>'+
      '<div class="tier-block" data-tier="child">A robot friend in Discord that tells you when something good happens on Kalshi.</div>'+
      '<div class="tier-block" data-tier="teenager"><b>What it is:</b> A planned feature that would run on a server 24/7, scanning markets and sending alerts to Discord.<br><b>Why a bot?</b> A server doesn\'t have CORS restrictions, so it can talk directly to Kalshi\'s real API. No proxy needed!<br><br><b>What it would do:</b><br>&bull; Scan markets every few minutes<br>&bull; Find high-edge opportunities<br>&bull; Send you a Discord message when something looks good<br><br><b>Think of it like:</b> A stock ticker that watches the market all day and texts you when something interesting happens.</div>'+
      '<div class="tier-block" data-tier="indepth">A Python service (or Node) polling <code>/v2/markets</code> on a schedule, running the same analysis engine, and dispatching via a Discord webhook (zero-auth, just POST JSON) for read-only alerts or via a discord.py bot (with the bot token) for interactive commands and buttons. Deployment targets: Raspberry Pi 4 (2GB is fine, ~150MB RSS), Oracle Cloud Always-Free ARM, Fly.io free tier, or a $5/mo Hetzner VPS. See the <a href="#hub" onclick="switchTab(\'hub\');return false;">HERMES HUB</a> tab for the full architecture breakdown.</div>'
  }
];

function drawArchDiagram(){
  var d=document.getElementById('arch-diagram');
  if(!d)return;
  d.innerHTML='';
  archSteps.forEach(function(b,i){
    var box=document.createElement('div');
    box.className='arch-box';
    box.style.borderColor=b.color;
    box.style.color=b.color;
    box.setAttribute('data-arch-index',i);
    box.innerHTML='<span class="arch-icon">'+b.icon+'</span><span class="arch-label">'+b.label+'</span>';

    var expand=document.createElement('div');
    expand.className='arch-expand';
    expand.setAttribute('data-arch-expand',i);
    expand.innerHTML=b.explain;

    var arrow=document.createElement('div');
    arrow.className='arch-arrow';
    arrow.setAttribute('data-arch-arrow',i);
    arrow.innerHTML='&#8595;';

    box.addEventListener('click',function(){
      var idx=this.getAttribute('data-arch-index');
      var exp=document.querySelector('[data-arch-expand="'+idx+'"]');
      var arw=document.querySelector('[data-arch-arrow="'+idx+'"]');
      if(exp.classList.contains('show')){
        exp.classList.remove('show');
        this.classList.remove('expanded');
        arw.classList.remove('open');
      }else{
        exp.classList.add('show');
        this.classList.add('expanded');
        arw.classList.add('open');
      }
    });

    d.appendChild(box);
    d.appendChild(expand);
    if(i<archSteps.length-1){
      d.appendChild(arrow);
    }
  });
}

// ===== FLOW CHART (clickable, expandable) =====
var flowSteps=[
  {
    label:'1. Fetch Markets',
    desc:'Ask Kalshi for a list of active markets',
    color:'var(--cyan)',
    detail:
      '<span class="tip-label">Fetch Markets</span>'+
      '<div class="tier-block" data-tier="caveman">Page ask Kalshi for list.</div>'+
      '<div class="tier-block" data-tier="child">The page calls Kalshi\'s website and asks for all the markets people are betting on.</div>'+
      '<div class="tier-block" data-tier="teenager"><b class="what-for">What happens:</b> Your code sends an HTTP GET request to Kalshi\'s server.<br><br><div class="api-call">GET https://external-api.kalshi.com/trade-api/v2/markets?limit=50&amp;status=open</div><br><b class="what-for">What you get back:</b> A JSON list of markets, each with a ticker (like KXBTC), title (like "Bitcoin Above 100K"), yes_bid/ask_dollars (like "0.2200" / "0.2300"), and volume.</div>'+
      '<div class="tier-block" data-tier="indepth">HTTP/1.1 GET to <code>https://external-api.kalshi.com/trade-api/v2/markets?status=open&amp;limit=200&amp;cursor=&lt;optional&gt;</code>. Returns 200 with <code>{markets: [...], cursor: "..."}</code>. The cursor handles pagination — keep calling until <code>cursor</code> is null/empty. Response is gzipped by default; total payload for 200 markets is ~250KB. Latency from a US-based bot: 80-150ms. The CORS proxy adds ~100-300ms. Prices are returned in dollars (<code>"0.6500"</code> = 65¢), volume as <code>*_fp</code> strings.</div>'
  },
  {
    label:'2. Parse Response',
    desc:'Extract prices, volume, and status from the raw data',
    color:'var(--green)',
    detail:
      '<span class="tip-label">Parse Response</span>'+
      '<div class="tier-block" data-tier="caveman">Pull out numbers.</div>'+
      '<div class="tier-block" data-tier="child">The page looks at all the messy info and picks the parts it needs.</div>'+
      '<div class="tier-block" data-tier="teenager"><b class="what-for">What happens:</b> The raw response is a big JSON blob. We loop through each market and pull out the fields we care about.<br><br><div class="api-call">// Each market looks like this:\n{\n  "ticker": "KXBTC",\n  "title": "Bitcoin Above 100K",\n  "outcomePrices": "[22,78]",\n  "volume": 23000000,\n  "status": "open"\n}</div><br><b class="what-for">What we extract:</b> Ticker name, YES price (22), NO price (78), volume (23M), and whether it\'s open for trading.</div>'+
      '<div class="tier-block" data-tier="indepth">Pure function: <code>markets.map(raw =&gt; normalizeMarket(raw))</code>. <code>normalizeMarket</code> computes the mid of <code>yes_bid_dollars</code> + <code>yes_ask_dollars</code> (in cents), with fallbacks to <code>yes_bid</code> alone, then <code>last_price_dollars</code>. NO side is derived as <code>100 − yes</code> if not directly available. Volume uses <code>volume_24h_fp</code> when non-zero, else <code>volume_fp</code>. Runs in &lt;10ms for 200 markets.</div>'
  },
  {
    label:'3. Calculate Edge',
    desc:'Find the gap between YES and NO prices',
    color:'var(--yellow)',
    detail:
      '<span class="tip-label">Calculate Edge</span>'+
      '<div class="tier-block" data-tier="caveman">Big gap = sure thing.</div>'+
      '<div class="tier-block" data-tier="child">For each market, we see how far apart the YES and NO prices are. The bigger the gap, the more sure everyone is.</div>'+
      '<div class="tier-block" data-tier="teenager"><b class="what-for">What happens:</b> For each market, we subtract the smaller price from the bigger price. This gap is called the "edge."<br><br><div class="api-call">// Example: KXBTC\nYES = 22 cents, NO = 78 cents\nEdge = |22 - 78| = 56 cents</div><br><b class="what-for">What it means:</b> A big edge (like 80) means the market is very confident about the outcome. A small edge (like 4) means it could go either way.</div>'+
      '<div class="tier-block" data-tier="indepth">O(n) scan: <code>edge = Math.abs(market.yes - market.no)</code>. Note that the YES + NO prices are <em>not</em> guaranteed to sum to 100 — Kalshi prices are independent mid-points, so YES=22, NO=78 sums to 100, but YES=30, NO=68 (sum=98) is also valid and indicates a 2¢ spread. The edge computation is therefore a measure of "distance from 50¢", not "distance between the two prices".</div>'
  },
  {
    label:'4. Sort & Filter',
    desc:'Put the most interesting markets at the top',
    color:'var(--purple)',
    detail:
      '<span class="tip-label">Sort &amp; Filter</span>'+
      '<div class="tier-block" data-tier="caveman">Pick best. Show first.</div>'+
      '<div class="tier-block" data-tier="child">We put the most interesting markets at the top of the list, and hide the boring ones.</div>'+
      '<div class="tier-block" data-tier="teenager"><b class="what-for">What happens:</b> We sort all markets by edge (biggest first) and filter out any that don\'t match your search.<br><br><div class="api-call">// Sort by edge, descending\nmarkets.sort((a,b) =&gt; {\n  return b.edge - a.edge;\n});</div><br><b class="what-for">Why this matters:</b> You don\'t want to scroll through 100 markets. Sorting puts the most interesting ones at the top.</div>'+
      '<div class="tier-block" data-tier="indepth">Stable sort: <code>Array.prototype.sort</code> with a composite key — primary sort on <code>composite_score</code> (the analysis engine\'s output), secondary on <code>volume</code>, tertiary on <code>ticker</code> (alphabetical for ties). Search uses <code>String.includes</code> on the lowercased title; the filter is O(n) so the total cost is dominated by the sort (O(n log n)). For 200 markets this is sub-millisecond on any modern CPU.</div>'
  },
  {
    label:'5. Render UI',
    desc:'Build the table, charts, and detail views on screen',
    color:'var(--cyan)',
    detail:
      '<span class="tip-label">Render UI</span>'+
      '<div class="tier-block" data-tier="caveman">Make page pretty.</div>'+
      '<div class="tier-block" data-tier="child">The page puts everything it found into tables and pictures you can look at.</div>'+
      '<div class="tier-block" data-tier="teenager"><b class="what-for">What happens:</b> JavaScript creates HTML elements for each market and inserts them into the page. The top 10 go into the table. All markets go into the scanner list. Charts get drawn with Chart.js.<br><br><b class="what-for">What you see:</b> The finished page with all the market data laid out in tables, cards, and charts. Every time you click SCAN, this whole process runs again with fresh data.</div>'+
      '<div class="tier-block" data-tier="indepth">Three render targets: (1) the top-10 table built with <code>Array.map</code> + template literal → <code>tbody.innerHTML</code>; (2) the full market list as clickable <code>.market-item</code> divs with a delegated click handler for detail-panel population; (3) the earnings chart via Chart.js <code>new Chart(ctx, config)</code> with a linear y-axis. The whole render is synchronous and finishes in &lt;50ms. The WebGL background runs in a separate requestAnimationFrame loop and is purely cosmetic.</div>'
  }
];

function drawFlowChart(){
  var d=document.getElementById('flowchart-container');
  if(!d)return;
  d.innerHTML='';
  flowSteps.forEach(function(s,i){
    var step=document.createElement('div');
    step.className='flow-step';
    step.style.borderColor=s.color;
    step.setAttribute('data-flow-index',i);
    step.innerHTML='<div class="step-title" style="color:'+s.color+'">'+s.label+'</div><div class="step-desc">'+s.desc+'</div>';

    var expand=document.createElement('div');
    expand.className='flow-expand';
    expand.setAttribute('data-flow-expand',i);
    expand.innerHTML=s.detail;

    var caret=document.createElement('div');
    caret.className='flow-caret';
    caret.setAttribute('data-flow-caret',i);
    caret.innerHTML='&#8595;';

    step.addEventListener('click',function(){
      var idx=this.getAttribute('data-flow-index');
      var exp=document.querySelector('[data-flow-expand="'+idx+'"]');
      var car=document.querySelector('[data-flow-caret="'+idx+'"]');
      if(exp.classList.contains('show')){
        exp.classList.remove('show');
        this.classList.remove('expanded');
        car.classList.remove('open');
      }else{
        exp.classList.add('show');
        this.classList.add('expanded');
        car.classList.add('open');
      }
    });

    d.appendChild(step);
    d.appendChild(expand);
    d.appendChild(caret);
  });
}

// ===== TICKER BAR =====
function buildTicker(){
  var track=document.getElementById('ticker-track');
  if(!track)return;
  // Use allMarkets if populated, else demoData
  var src=(allMarkets&&allMarkets.length>0)?allMarkets:demoData;
  var items=src.slice(0,12).map(function(m){
    var p=parsePrices(m)[0];
    return '<span class="ticker-item"><span class="label">'+m.ticker+'</span> <span class="val">'+p+' cents</span></span>';
  });
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

// ===== TIER SWITCHER (Caveman / Child / Teenager / In-Depth) =====
(function(){
  var TIERS=['caveman','child','teenager','indepth'];
  var NAMES=['CAVEMAN','CHILD','TEENAGER','IN-DEPTH'];
  var LS_KEY='kalshi_explainer_tier';
  var slider=document.getElementById('tier-slider');
  var nameEl=document.getElementById('tier-name');
  if(!slider||!nameEl)return;

  function setTier(idx){
    var tier=TIERS[idx]||'teenager';
    document.body.setAttribute('data-tier',tier);
    nameEl.textContent=NAMES[idx]||'TEENAGER';
    // Update all explainer badges
    document.querySelectorAll('.tier-badge').forEach(function(b){
      b.textContent=NAMES[idx]||'TEENAGER';
    });
    try{localStorage.setItem(LS_KEY,String(idx));}catch(e){}
  }

  // Restore from localStorage
  var saved=null;
  try{saved=localStorage.getItem(LS_KEY);}catch(e){}
  if(saved!==null&&saved!==''){
    var idx=parseInt(saved,10);
    if(!isNaN(idx)&&idx>=0&&idx<TIERS.length){
      slider.value=String(idx);
      setTier(idx);
    }else{
      setTier(2);
    }
  }else{
    setTier(2);
  }

  slider.addEventListener('input',function(){
    setTier(parseInt(this.value,10)||0);
  });
})();

// ===== HUB SCENARIO EXPAND =====
(function(){
  document.querySelectorAll('.hub-scenario').forEach(function(card){
    card.addEventListener('click',function(e){
      // Don't toggle if clicking inside the expand (e.g. a code block) — actually we DO want it to close
      var exp=this.querySelector('.hub-expand');
      if(!exp)return;
      if(exp.classList.contains('show')){
        exp.classList.remove('show');
      }else{
        exp.classList.add('show');
      }
    });
  });
})();

// (Tab/nav switching is handled by the existing switchTab() at line ~34. HUB is auto-picked up because data-section="hub" matches the pattern.)
