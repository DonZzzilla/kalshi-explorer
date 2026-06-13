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
  function draw(){
    r.render(s,cam);
    pts.rotation.y+=0.0003;
    pts.rotation.x+=0.0001;
  }
  function loop(){
    requestAnimationFrame(loop);
    draw();
  }
  loop();
  addEventListener('resize',function(){
    r.setSize(innerWidth,innerHeight);
    cam.aspect=innerWidth/innerHeight;
    cam.updateProjectionMatrix();
  });
})();

// ===== TABS =====
document.querySelectorAll('.tab').forEach(function(tab){
  tab.addEventListener('click',function(){
    var sec=this.getAttribute('data-section');
    document.querySelectorAll('.section').forEach(function(s){s.style.display='none';});
    document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('active');});
    document.getElementById(sec).style.display='block';
    this.classList.add('active');
    if(sec==='earnings')drawEarningsChart();
    if(sec==='architecture')drawArchDiagram();
    if(sec==='flowchart')drawFlowChart();
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
  {ticker:'KXGOLD',title:'Gold Above 3000',outcomePrices:'[28,72]',volume:34000000,status:'open'}
];

var allMarkets=[];

// ===== SCAN MARKETS =====
async function scanMarkets(){
  var st=document.getElementById('api-status');
  var res=document.getElementById('scanner-results');
  st.innerHTML='<span class="dot online" style="background:var(--yellow)"></span> SCANNING...';
  res.innerHTML='<div class="loading"><div class="spinner"></div> Fetching markets...</div>';

  try{
    var resp=await fetch('https://external-api.kalshi.com/v2/markets?limit=50&active=true');
    var data=await resp.json();
    if(data && data.markets && data.markets.length>0){
      allMarkets=data.markets;
      st.innerHTML='<span class="dot online"></span> LIVE - '+allMarkets.length+' MARKETS';
    }else{
      throw new Error('No data');
    }
  }catch(e){
    allMarkets=demoData;
    st.innerHTML='<span class="dot offline"></span> DEMO DATA (API BLOCKED)';
  }
  displayResults(allMarkets);
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

function displayResults(markets){
  var res=document.getElementById('scanner-results');
  var tbody=document.getElementById('top10-body');
  tbody.innerHTML='';

  // Sort by edge (highest first)
  var sorted=markets.slice().sort(function(a,b){
    var pa=parsePrices(a.outcomePrices);
    var pb=parsePrices(b.outcomePrices);
    return Math.abs(pb[0]-pb[1])-Math.abs(pa[0]-pa[1]);
  });

  // Show top 10 in table
  var top10=sorted.slice(0,10);
  top10.forEach(function(mk){
    var tr=document.createElement('tr');
    var prices=parsePrices(mk.outcomePrices);
    var edge=Math.abs(prices[0]-prices[1]);
    tr.innerHTML='<td>'+mk.ticker+'</td><td>'+mk.title+'</td><td style="color:'+(prices[0]>=50?'var(--green)':'var(--red)')+'">'+prices[0]+'¢</td><td style="color:'+(prices[1]>=50?'var(--green)':'var(--red)')+'">'+prices[1]+'¢</td><td style="color:var(--cyan)">'+edge+'¢</td>';
    tr.style.cursor='pointer';
    tr.addEventListener('click',function(){showDetail(mk);});
    tbody.appendChild(tr);
  });

  // Show all in results
  var html='';
  sorted.forEach(function(mk){
    var prices=parsePrices(mk.outcomePrices);
    var edge=Math.abs(prices[0]-prices[1]);
    html+='<div class="market-item" data-ticker="'+mk.ticker+'">';
    html+='<div class="market-header"><span class="ticker">'+mk.ticker+'</span><span class="title">'+mk.title+'</span></div>';
    html+='<div class="market-prices"><span class="price-yes" style="color:'+(prices[0]>=50?'var(--green)':'var(--red)')+'">YES '+prices[0]+'¢</span>';
    html+='<span class="price-no" style="color:'+(prices[1]>=50?'var(--green)':'var(--red)')+'">NO '+prices[1]+'¢</span>';
    html+='<span class="edge" style="color:var(--cyan)">EDGE '+edge+'¢</span></div>';
    html+='</div>';
  });
  res.innerHTML=html;

  // Add click handlers
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
  d.innerHTML='<h2>🎯 '+mk.ticker+'</h2>';
  d.innerHTML+='<p style="font-size:1.1rem;margin-bottom:0.5rem">'+mk.title+'</p>';
  d.innerHTML+='<p style="color:var(--dim);margin-bottom:1rem">Status: <span style="color:'+(mk.status==='open'?'var(--green)':'var(--red)')+'">'+mk.status.toUpperCase()+'</span></p>';
  d.innerHTML+='<div class="grid grid-2" style="gap:0.5rem">';
  d.innerHTML+='<div><span style="color:var(--dim);font-size:0.8rem">YES</span><br><span style="font-size:1.5rem;color:'+(prices[0]>=50?'var(--green)':'var(--red)')+'">'+prices[0]+'¢</span></div>';
  d.innerHTML+='<div><span style="color:var(--dim);font-size:0.8rem">NO</span><br><span style="font-size:1.5rem;color:'+(prices[1]>=50?'var(--green)':'var(--red)')+'">'+prices[1]+'¢</span></div>';
  d.innerHTML+='<div><span style="color:var(--dim);font-size:0.8rem">EDGE</span><br><span style="font-size:1.5rem;color:var(--cyan)">'+edge+'¢</span></div>';
  d.innerHTML+='<div><span style="color:var(--dim);font-size:0.8rem">VOLUME</span><br><span style="font-size:1.5rem;color:var(--text)">'+vol+'</span></div>';
  d.innerHTML+='</div>';
}

// ===== CALCULATOR =====
document.getElementById('calc-btn').addEventListener('click',function(){
  var buy=parseInt(document.getElementById('calc-buy').value);
  var invest=parseFloat(document.getElementById('calc-invest').value);
  var res=document.getElementById('calc-results');
  if(isNaN(buy)||isNaN(invest)||buy<1||buy>99||invest<1){
    res.innerHTML='<p style="color:var(--red)">Please enter valid values (buy: 1-99, invest: >0)</p>';
    return;
  }
  var payout=100;
  var profitPerUnit=(payout-buy)/100;
  var units=Math.floor(invest/(buy/100));
  var totalCost=units*(buy/100);
  var totalPayout=units*(payout/100);
  var netProfit=totalPayout-totalCost;
  var roi=(netProfit/totalCost*100).toFixed(1);
  var monthlyNet=netProfit*4;
  var annualNet=netProfit*48;
  res.innerHTML='<div class="grid grid-2" style="gap:0.5rem">';
  res.innerHTML+='<div><span style="color:var(--dim);font-size:0.8rem">UNITS</span><br><span style="font-size:1.3rem;color:var(--text)">'+units+'</span></div>';
  res.innerHTML+='<div><span style="color:var(--dim);font-size:0.8rem">TOTAL COST</span><br><span style="font-size:1.3rem;color:var(--text)">$'+totalCost.toFixed(2)+'</span></div>';
  res.innerHTML+='<div><span style="color:var(--dim);font-size:0.8rem">IF WIN</span><br><span style="font-size:1.3rem;color:var(--green)">+$'+netProfit.toFixed(2)+'</span></div>';
  res.innerHTML+='<div><span style="color:var(--dim);font-size:0.8rem">ROI</span><br><span style="font-size:1.3rem;color:var(--cyan)">'+roi+'%</span></div>';
  res.innerHTML+='<div><span style="color:var(--dim);font-size:0.8rem">MO NET (4x)</span><br><span style="font-size:1.3rem;color:var(--green)">+$'+monthlyNet.toFixed(2)+'</span></div>';
  res.innerHTML+='<div><span style="color:var(--dim);font-size:0.8rem">ANNUAL (48x)</span><br><span style="font-size:1.3rem;color:var(--green)">+$'+annualNet.toFixed(2)+'</span></div>';
  res.innerHTML+='</div>';
});

// ===== EARNINGS =====
function drawEarningsChart(){
  var ctx=document.getElementById('earnings-chart');
  if(!ctx)return;
  var tbody=document.getElementById('earnings-body');
  tbody.innerHTML='';
  var probs=[30,40,50,60,70,80,90];
  var invest=100;
  var cols=['#ff6b6b','#ffa94d','#ffd43b','#69db7c','#38d9a9','#4dabf7','#9775fa'];
  var labels=[];
  var data=[];
  probs.forEach(function(p,i){
    labels.push(p+'%');
    var profit=(100-p)/100*invest-p/100*invest;
    data.push(profit.toFixed(2));
    var tr=document.createElement('tr');
    var monthly=profit*4;
    var annual=profit*48;
    var roi=(profit/invest*100).toFixed(1);
    tr.innerHTML='<td>'+p+'%</td><td>$'+invest+'</td><td style="color:'+(profit>=0?'var(--green)':'var(--red)')+'">+$'+profit.toFixed(2)+'</td><td style="color:'+(annual>=0?'var(--green)':'var(--red)')+'">+$'+annual.toFixed(2)+'</td><td style="color:var(--cyan)">'+roi+'%</td>';
    tbody.appendChild(tr);
  });
  if(window.earningsChart)window.earningsChart.destroy();
  window.earningsChart=new Chart(ctx,{
    type:'bar',
    data:{labels:labels,datasets:[{label:'Monthly Profit ($)',data:data,backgroundColor:cols,borderRadius:4}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{grid:{color:'rgba(255,255,255,0.05)'},ticks:{color:'#8899aa'}},x:{grid:{display:false},ticks:{color:'#8899aa'}}}}
  });
}

// ===== ARCHITECTURE DIAGRAM =====
function drawArchDiagram(){
  var d=document.getElementById('arch-diagram');
  if(!d)return;
  var boxes=[
    {label:'Kalshi API',color:'var(--cyan)',y:0},
    {label:'CORS Proxy',color:'var(--purple)',y:1},
    {label:'Data Parser',color:'var(--green)',y:2},
    {label:'Analysis Engine',color:'var(--yellow)',y:3},
    {label:'UI Renderer',color:'var(--cyan)',y:4},
    {label:'Discord Bot',color:'var(--purple)',y:5}
  ];
  var html='<div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;padding:1rem;min-width:300px">';
  boxes.forEach(function(b,i){
    html+='<div style="background:var(--darker);border:2px solid '+b.color+';border-radius:8px;padding:0.8rem 1.5rem;text-align:center;width:100%;max-width:350px;color:'+b.color+'">'+b.label+'</div>';
    if(i<boxes.length-1)html+='<div style="color:var(--dim);font-size:1.2rem">↓</div>';
  });
  html+='</div>';
  d.innerHTML=html;
}

// ===== FLOW CHART =====
function drawFlowChart(){
  var d=document.getElementById('flowchart-container');
  if(!d)return;
  var steps=[
    {label:'1. Fetch Markets',desc:'GET /v2/markets?active=true',color:'var(--cyan)'},
    {label:'2. Parse Prices',desc:'Extract outcomePrices array',color:'var(--green)'},
    {label:'3. Calc Edge',desc:'|yesPrice - noPrice| = edge',color:'var(--yellow)'},
    {label:'4. Sort & Filter',desc:'Sort by edge desc, filter volume',color:'var(--purple)'},
    {label:'5. Display',desc:'Render table + detail view',color:'var(--cyan)'}
  ];
  var html='<div style="display:flex;flex-wrap:wrap;gap:0.8rem;justify-content:center;padding:1rem">';
  steps.forEach(function(s){
    html+='<div style="background:var(--darker);border:1px solid '+s.color+';border-radius:8px;padding:1rem;min-width:180px;flex:1;max-width:250px">';
    html+='<div style="color:'+s.color+'">'+s.label+'</div>';
    html+='<div style="color:var(--dim);font-size:0.8rem;margin-top:0.3rem">'+s.desc+'</div>';
    html+='</div>';
  });
  html+='</div>';
  d.innerHTML=html;
}

// ===== TICKER BAR =====
function buildTicker(){
  var track=document.getElementById('ticker-track');
  var items=demoData.map(function(m){return m.ticker+' '+parsePrices(m.outcomePrices)[0]+'¢';});
  var text=items.join('  ◆  ');
  track.innerHTML=text+'  ◆  '+text;
}

// ===== INIT =====
buildTicker();
setTimeout(function(){scanMarkets();},500);
