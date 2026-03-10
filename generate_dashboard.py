#!/usr/bin/env python3
"""
Generate dashboard.html – a self-contained interactive dashboard for twainletterscsv.txt.
Run:  python3 generate_dashboard.py
Then open dashboard.html in any browser (no server or internet required).
"""

import csv
import json
import re
from collections import Counter
from pathlib import Path

CSV_PATH = Path(__file__).parent / "twainletterscsv.txt"
OUT_PATH = Path(__file__).parent / "dashboard.html"
TOP_N = 10           # number of items shown in bar charts
BAR_ROW_PX = 22      # pixels per bar row in horizontal bar charts
BAR_CHART_PAD = 16   # extra vertical padding around bar chart content


# ── 1. Load data ──────────────────────────────────────────────────────────────
rows = []
with CSV_PATH.open(encoding="utf-8") as f:
    reader = csv.reader(f)
    next(reader)  # skip header
    for row in reader:
        padded = (row + ["", "", "", "", ""])[:5]
        rows.append({
            "sender":     padded[0].strip(),
            "receiver":   padded[1].strip(),
            "date":       padded[2].strip(),
            "location":   padded[3].strip(),
            "identifier": padded[4].strip(),
        })

# ── 2. Pre-compute aggregates ─────────────────────────────────────────────────
YEAR_RE = re.compile(r"\b(1[89]\d\d)\b")

year_counts: dict[str, int] = {}
for r in rows:
    m = YEAR_RE.search(r["date"])
    if m:
        y = m.group(1)
        year_counts[y] = year_counts.get(y, 0) + 1

years_sorted   = sorted(year_counts.items())
years_labels   = [y for y, _ in years_sorted]
years_values   = [c for _, c in years_sorted]

top_senders   = Counter(r["sender"]   for r in rows).most_common(TOP_N)
top_receivers = Counter(r["receiver"] for r in rows).most_common(TOP_N)
top_locations = Counter(r["location"] for r in rows if r["location"]).most_common(TOP_N)

unique_senders   = sorted({r["sender"]   for r in rows})
unique_locations = sorted({r["location"] for r in rows if r["location"]})

stats = {
    "total":          len(rows),
    "uniqueSenders":  len({r["sender"]   for r in rows}),
    "uniqueReceivers":len({r["receiver"] for r in rows}),
    "yearMin":        years_labels[0]  if years_labels else "",
    "yearMax":        years_labels[-1] if years_labels else "",
}

# Compact table data (short keys)
table_data = [
    {"s": r["sender"], "r": r["receiver"], "d": r["date"],
     "l": r["location"], "i": r["identifier"]}
    for r in rows
]

# JSON blobs (separators to minimize size)
J  = lambda v: json.dumps(v, separators=(",", ":"), ensure_ascii=False)

# ── 3. Build HTML ─────────────────────────────────────────────────────────────
html = """\
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Mark Twain Letters \u2014 Interactive Dashboard</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:#f8f5ef;font-family:'Segoe UI',system-ui,sans-serif;color:#222;font-size:14px}
a{color:inherit}
.wrap{max-width:1400px;margin:0 auto;padding:1.5rem 1rem}
h1{color:#4a2200;font-size:1.8rem;margin-bottom:.2rem}
.subtitle{color:#777;margin-bottom:1.5rem}

/* stat cards */
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem;margin-bottom:1.5rem}
.stat{background:#fff;border-radius:10px;padding:1rem 1.2rem;
      box-shadow:0 1px 6px rgba(0,0,0,.08);text-align:center}
.stat .val{font-size:1.9rem;font-weight:700;color:#4a2200}
.stat .lbl{font-size:.75rem;text-transform:uppercase;letter-spacing:.06em;color:#888;margin-top:.2rem}

/* cards */
.card{background:#fff;border-radius:10px;padding:1.2rem;
      box-shadow:0 1px 6px rgba(0,0,0,.08);margin-bottom:1.5rem}
.card h2{font-size:1rem;font-weight:600;margin-bottom:.8rem;color:#4a2200}

/* charts grid */
.charts-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.2rem;margin-bottom:1.5rem}
.chart-wrap{background:#fff;border-radius:10px;padding:1.2rem;
            box-shadow:0 1px 6px rgba(0,0,0,.08)}
.chart-wrap h2{font-size:1rem;font-weight:600;margin-bottom:.8rem;color:#4a2200}
canvas{display:block;width:100%;cursor:crosshair}

/* tooltip */
#tooltip{position:fixed;background:rgba(40,20,0,.88);color:#fff;
         padding:.35rem .65rem;border-radius:6px;font-size:.8rem;
         pointer-events:none;display:none;z-index:9999;max-width:260px}

/* filters */
.filters{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:.7rem;margin-bottom:.9rem}
.filters label{display:block;font-size:.75rem;font-weight:600;
               text-transform:uppercase;letter-spacing:.05em;color:#555;margin-bottom:.25rem}
select,input[type=text],input[type=number]{
  width:100%;padding:.35rem .55rem;border:1px solid #ddd;
  border-radius:6px;font-size:.85rem;background:#fff;color:#222}
select:focus,input:focus{outline:2px solid #b07040;border-color:transparent}

/* table toolbar */
.toolbar{display:flex;justify-content:space-between;align-items:center;
         flex-wrap:wrap;gap:.5rem;margin-bottom:.6rem}
.toolbar .count{font-size:.85rem;color:#555}
.toolbar .count strong{color:#222}
.btn{padding:.3rem .75rem;border:1px solid #ccc;border-radius:6px;
     background:#fff;font-size:.82rem;cursor:pointer;color:#333;transition:.15s}
.btn:hover{background:#f0e8e0;border-color:#b07040}
.btn:disabled{opacity:.45;cursor:default}
.btn-reset{border-color:#c04020;color:#c04020}
.btn-reset:hover{background:#fff0ee}
.page-info{font-size:.82rem;color:#555;align-self:center}
.rows-input{width:70px}

/* table */
.tbl-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse}
thead th{background:#4a2200;color:#fff;padding:.5rem .7rem;
         font-size:.8rem;text-align:left;white-space:nowrap;
         cursor:pointer;user-select:none;position:sticky;top:0}
thead th:after{content:' \u21d5';opacity:.45;font-size:.7em}
thead th.asc:after{content:' \u25b2';opacity:1}
thead th.desc:after{content:' \u25bc';opacity:1}
tbody tr:nth-child(even){background:#faf7f3}
tbody tr:hover{background:#f0e8de}
tbody td{padding:.42rem .7rem;font-size:.82rem;border-bottom:1px solid #eee;vertical-align:top}
.id-cell{color:#888;font-size:.75rem}
.filtered-badge{display:inline-block;background:#4a2200;color:#fff;
                border-radius:99px;padding:.05em .5em;font-size:.75em;margin-left:.4em}

/* highlight */
.hl{background:#ffe066;border-radius:2px}

footer{text-align:center;color:#aaa;font-size:.78rem;margin-top:1.5rem;padding-bottom:1rem}
</style>
</head>
<body>
<div id="tooltip"></div>
<div class="wrap">

  <h1>\u2709\ufe0f Mark Twain Letters</h1>
  <p class="subtitle">Interactive exploration of the Twain correspondence corpus</p>

  <!-- Stat cards -->
  <div class="stats">
    <div class="stat"><div class="val" id="sTotal">\u2014</div><div class="lbl">Total Letters</div></div>
    <div class="stat"><div class="val" id="sSenders">\u2014</div><div class="lbl">Unique Senders</div></div>
    <div class="stat"><div class="val" id="sReceivers">\u2014</div><div class="lbl">Unique Receivers</div></div>
    <div class="stat"><div class="val" id="sYears">\u2014</div><div class="lbl">Year Range</div></div>
  </div>

  <!-- Timeline -->
  <div class="card">
    <h2>Letters per Year</h2>
    <canvas id="cTimeline" height="140"></canvas>
  </div>

  <!-- Bar charts -->
  <div class="charts-row">
    <div class="chart-wrap"><h2>Top """ + str(TOP_N) + """ Senders</h2><canvas id="cSenders"></canvas></div>
    <div class="chart-wrap"><h2>Top """ + str(TOP_N) + """ Receivers</h2><canvas id="cReceivers"></canvas></div>
    <div class="chart-wrap"><h2>Top """ + str(TOP_N) + """ Locations</h2><canvas id="cLocations"></canvas></div>
  </div>

  <!-- Filter + table -->
  <div class="card">
    <h2>\U0001f50d Browse &amp; Filter Letters</h2>
    <div class="filters">
      <div>
        <label for="fSender">Sender</label>
        <select id="fSender"><option value="">All senders</option></select>
      </div>
      <div>
        <label for="fKeyword">Keyword (any field)</label>
        <input id="fKeyword" type="text" placeholder="e.g. Hartford, Howells\u2026"/>
      </div>
      <div>
        <label for="fYearMin">Year from</label>
        <input id="fYearMin" type="number" min="1853" max="1910" placeholder="1853"/>
      </div>
      <div>
        <label for="fYearMax">Year to</label>
        <input id="fYearMax" type="number" min="1853" max="1910" placeholder="1910"/>
      </div>
      <div>
        <label for="fLocation">Location</label>
        <select id="fLocation"><option value="">All locations</option></select>
      </div>
    </div>

    <div class="toolbar">
      <div class="count">
        Showing <strong id="rowCount">0</strong> letters<span id="filtBadge"></span>
      </div>
      <div style="display:flex;gap:.4rem;align-items:center;flex-wrap:wrap">
        <input class="rows-input" id="pageSize" type="number" min="10" max="500"
               value="50" title="Rows per page"/>
        <button class="btn" id="btnPrev" disabled>\u2039 Prev</button>
        <span class="page-info" id="pageInfo">page 1 / 1</span>
        <button class="btn" id="btnNext">Next \u203a</button>
        <button class="btn btn-reset" id="btnReset">Reset</button>
      </div>
    </div>

    <div class="tbl-wrap">
      <table>
        <thead><tr>
          <th data-col="s">Sender</th>
          <th data-col="r">Receiver</th>
          <th data-col="d">Date</th>
          <th data-col="l">Location</th>
          <th data-col="i">Identifier</th>
        </tr></thead>
        <tbody id="tBody"></tbody>
      </table>
    </div>
  </div>

  <footer>Data source: Mark Twain Project Online \u2014 twainletterscsv.txt</footer>
</div>

<script>
// ── Embedded data ──────────────────────────────────────────────────────────
""" + f"const STATS={J(stats)};\n" \
    + f"const YL={J(years_labels)};\n" \
    + f"const YV={J(years_values)};\n" \
    + f"const TS={J(top_senders)};\n" \
    + f"const TR={J(top_receivers)};\n" \
    + f"const TL={J(top_locations)};\n" \
    + f"const US={J(unique_senders)};\n" \
    + f"const UL={J(unique_locations)};\n" \
    + f"const DATA={J(table_data)};\n" \
    + """
// ── Palette ────────────────────────────────────────────────────────────────
const PAL=['#4a2200','#7a4010','#a05820','#c07830','#d09040',
           '#3a6040','#507860','#2a5070','#4070a0','#6888b8',
           '#6858a0','#9878c0','#b07890','#c89090','#c06060',
           '#b04848','#c87840','#d0a050','#d8c070','#a8c080'];

// ── Tooltip ────────────────────────────────────────────────────────────────
const tip=document.getElementById('tooltip');
function showTip(e,text){
  tip.textContent=text;tip.style.display='block';
  moveTip(e);
}
function moveTip(e){
  const x=e.clientX,y=e.clientY,w=tip.offsetWidth,h=tip.offsetHeight;
  tip.style.left=(x+14+w>window.innerWidth?x-w-14:x+14)+'px';
  tip.style.top=(y+h+14>window.innerHeight?y-h-8:y+8)+'px';
}
function hideTip(){tip.style.display='none';}

// ── Mini canvas chart library ─────────────────────────────────────────────
const DPR=window.devicePixelRatio||1;

function setupCanvas(canvas){
  const rect=canvas.getBoundingClientRect();
  const W=rect.width||canvas.parentElement.clientWidth||600;
  canvas.width=Math.round(W*DPR);
  canvas.height=canvas.height*DPR;  // preserve logical height
  const ctx=canvas.getContext('2d');
  ctx.scale(DPR,DPR);
  return{ctx,W,H:canvas.height/DPR};
}

/* Horizontal bar chart */
function hBar(canvas,labels,values,palette){
  const{ctx,W,H}=setupCanvas(canvas);
  const PAD={t:8,r:16,b:8,l:0};
  const n=labels.length;
  const rowH=(H-PAD.t-PAD.b)/n;
  const barH=Math.max(4,rowH*0.6);
  const maxVal=Math.max(...values);

  // measure label widths
  ctx.font='11px Segoe UI,sans-serif';
  const lblW=Math.min(200,Math.max(...labels.map(l=>ctx.measureText(l).width))+8);
  const chartX=PAD.l+lblW;
  const chartW=W-chartX-PAD.r;

  ctx.clearRect(0,0,W,H);

  labels.forEach((lbl,i)=>{
    const y=PAD.t+i*rowH;
    const bw=chartW*(values[i]/maxVal);

    // bar
    ctx.fillStyle=palette[i%palette.length];
    ctx.beginPath();
    ctx.roundRect(chartX,y+(rowH-barH)/2,Math.max(2,bw),barH,3);
    ctx.fill();

    // label
    ctx.fillStyle='#333';
    ctx.textAlign='right';
    ctx.textBaseline='middle';
    ctx.fillText(
      lbl.length>28?lbl.slice(0,26)+'\u2026':lbl,
      chartX-4,y+rowH/2
    );

    // value
    ctx.fillStyle='#555';
    ctx.textAlign='left';
    ctx.fillText(values[i].toLocaleString(),chartX+bw+4,y+rowH/2);
  });

  // hover
  canvas._data={labels,values,PAD,rowH,chartX,chartW,maxVal,H};
  canvas.addEventListener('mousemove',e=>{
    const r=canvas.getBoundingClientRect();
    const my=(e.clientY-r.top);
    const d=canvas._data;
    const idx=Math.floor((my-d.PAD.t)/d.rowH);
    if(idx>=0&&idx<d.labels.length)
      showTip(e,d.labels[idx]+': '+d.values[idx].toLocaleString()+' letters');
    else hideTip();
  });
  canvas.addEventListener('mouseleave',hideTip);
}

/* Line / area chart for timeline */
function lineChart(canvas,labels,values){
  const{ctx,W,H}=setupCanvas(canvas);
  const PAD={t:20,r:16,b:36,l:48};
  const cW=W-PAD.l-PAD.r, cH=H-PAD.t-PAD.b;
  const n=labels.length;
  const maxV=Math.max(...values);

  ctx.clearRect(0,0,W,H);

  // grid lines
  const ticks=5;
  ctx.strokeStyle='#eee';ctx.lineWidth=1;
  for(let i=0;i<=ticks;i++){
    const y=PAD.t+cH*(1-i/ticks);
    ctx.beginPath();ctx.moveTo(PAD.l,y);ctx.lineTo(PAD.l+cW,y);ctx.stroke();
    ctx.fillStyle='#999';ctx.font='10px Segoe UI,sans-serif';
    ctx.textAlign='right';ctx.textBaseline='middle';
    ctx.fillText(Math.round(maxV*i/ticks),PAD.l-4,y);
  }

  // x axis labels (every ~5 years)
  ctx.fillStyle='#999';ctx.font='10px Segoe UI,sans-serif';ctx.textAlign='center';
  labels.forEach((lbl,i)=>{
    if(parseInt(lbl)%5===0){
      const x=PAD.l+cW*(i/(n-1));
      ctx.fillText(lbl,x,H-PAD.b+14);
    }
  });

  const px=i=>PAD.l+cW*(i/(n-1));
  const py=v=>PAD.t+cH*(1-v/maxV);

  // area fill
  ctx.beginPath();
  ctx.moveTo(px(0),py(0));
  values.forEach((_,i)=>ctx.lineTo(px(i),py(values[i])));
  ctx.lineTo(px(n-1),PAD.t+cH);ctx.lineTo(px(0),PAD.t+cH);ctx.closePath();
  ctx.fillStyle='rgba(74,34,0,.1)';ctx.fill();

  // line
  ctx.beginPath();
  ctx.strokeStyle='#4a2200';ctx.lineWidth=2;
  values.forEach((_,i)=>{
    if(i===0)ctx.moveTo(px(i),py(values[i]));
    else ctx.lineTo(px(i),py(values[i]));
  });
  ctx.stroke();

  // dots on hover
  canvas._data={labels,values,PAD,cW,cH,n,maxV,px,py};
  let lastIdx=-1;
  canvas.addEventListener('mousemove',e=>{
    const r=canvas.getBoundingClientRect();
    const mx=e.clientX-r.left;
    const d=canvas._data;
    const idx=Math.round((mx-d.PAD.l)/d.cW*(d.n-1));
    if(idx<0||idx>=d.n){hideTip();return;}
    if(idx!==lastIdx){
      lastIdx=idx;
      ctx.beginPath();
      ctx.arc(d.px(idx),d.py(d.values[idx]),5,0,Math.PI*2);
      ctx.fillStyle='#4a2200';ctx.fill();
      ctx.fillStyle='#fff';
      ctx.beginPath();ctx.arc(d.px(idx),d.py(d.values[idx]),3,0,Math.PI*2);
      ctx.fill();
    }
    showTip(e,d.labels[idx]+': '+d.values[idx].toLocaleString()+' letters');
  });
  canvas.addEventListener('mouseleave',()=>{hideTip();lastIdx=-1;});
}

// ── Draw charts ────────────────────────────────────────────────────────────
function drawAll(){
  lineChart(document.getElementById('cTimeline'),YL,YV);
  hBar(document.getElementById('cSenders'),
    TS.map(d=>d[0]),TS.map(d=>d[1]),PAL);
  hBar(document.getElementById('cReceivers'),
    TR.map(d=>d[0]),TR.map(d=>d[1]),PAL);
  hBar(document.getElementById('cLocations'),
    TL.map(d=>d[0]),TL.map(d=>d[1]),PAL);
}

// set canvas logical heights for bar charts
['cSenders','cReceivers','cLocations'].forEach(id=>{
  document.getElementById(id).height=""" + str(TOP_N * BAR_ROW_PX + BAR_CHART_PAD) + """;
});

window.addEventListener('resize',drawAll);
drawAll();

// ── Stat cards ─────────────────────────────────────────────────────────────
document.getElementById('sTotal').textContent=STATS.total.toLocaleString();
document.getElementById('sSenders').textContent=STATS.uniqueSenders.toLocaleString();
document.getElementById('sReceivers').textContent=STATS.uniqueReceivers.toLocaleString();
document.getElementById('sYears').textContent=STATS.yearMin+'\u2013'+STATS.yearMax;

// ── Populate dropdowns ─────────────────────────────────────────────────────
const selSender=document.getElementById('fSender');
const selLoc=document.getElementById('fLocation');
US.forEach(s=>{const o=new Option(s,s);selSender.add(o);});
UL.forEach(l=>{const o=new Option(l,l);selLoc.add(o);});

// ── Sorting ────────────────────────────────────────────────────────────────
let sortCol=null,sortDir=1;
document.querySelectorAll('thead th').forEach(th=>{
  th.addEventListener('click',()=>{
    const c=th.dataset.col;
    if(sortCol===c) sortDir=-sortDir;
    else{sortCol=c;sortDir=1;}
    document.querySelectorAll('thead th').forEach(h=>h.classList.remove('asc','desc'));
    th.classList.add(sortDir===1?'asc':'desc');
    curPage=1;render();
  });
});

// ── Filtering + rendering ──────────────────────────────────────────────────
let curPage=1;

function extractYear(d){const m=d.match(/\\b(1[89]\\d\\d)\\b/);return m?+m[1]:null;}

function getFiltered(){
  const sender=selSender.value;
  const kw=document.getElementById('fKeyword').value.toLowerCase().trim();
  const yMin=+document.getElementById('fYearMin').value||0;
  const yMax=+document.getElementById('fYearMax').value||9999;
  const loc=selLoc.value;
  return DATA.filter(r=>{
    if(sender&&r.s!==sender) return false;
    if(loc&&r.l!==loc) return false;
    const yr=extractYear(r.d);
    if(yr!==null&&(yr<yMin||yr>yMax)) return false;
    if(kw){
      if(!(r.s+r.r+r.d+r.l+r.i).toLowerCase().includes(kw)) return false;
    }
    return true;
  });
}

function esc(s){
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function hlText(s,kw){
  if(!kw) return esc(s);
  const idx=s.toLowerCase().indexOf(kw);
  if(idx<0) return esc(s);
  return esc(s.slice(0,idx))
    +'<mark class="hl">'+esc(s.slice(idx,idx+kw.length))+'</mark>'
    +esc(s.slice(idx+kw.length));
}

function render(){
  const filtered=getFiltered();
  if(sortCol){
    filtered.sort((a,b)=>sortDir*String(a[sortCol]||'').localeCompare(String(b[sortCol]||'')));
  }
  const ps=Math.max(1,+document.getElementById('pageSize').value||50);
  const totalPages=Math.max(1,Math.ceil(filtered.length/ps));
  curPage=Math.min(curPage,totalPages);
  const start=(curPage-1)*ps;
  const page=filtered.slice(start,start+ps);

  document.getElementById('rowCount').textContent=filtered.length.toLocaleString();
  document.getElementById('pageInfo').textContent='page '+curPage+' / '+totalPages;

  const isFiltered=filtered.length<DATA.length;
  document.getElementById('filtBadge').innerHTML=isFiltered
    ?'<span class="filtered-badge">filtered</span>':'';

  const kw=document.getElementById('fKeyword').value.toLowerCase().trim();
  document.getElementById('tBody').innerHTML=page.map(r=>
    '<tr>'
    +'<td>'+hlText(r.s,kw)+'</td>'
    +'<td>'+hlText(r.r,kw)+'</td>'
    +'<td>'+esc(r.d)+'</td>'
    +'<td>'+esc(r.l)+'</td>'
    +'<td class="id-cell">'+esc(r.i)+'</td>'
    +'</tr>'
  ).join('');

  document.getElementById('btnPrev').disabled=curPage<=1;
  document.getElementById('btnNext').disabled=curPage>=totalPages;
}

['fSender','fKeyword','fYearMin','fYearMax','fLocation','pageSize'].forEach(id=>{
  document.getElementById(id).addEventListener('input',()=>{curPage=1;render();});
});
document.getElementById('btnPrev').addEventListener('click',()=>{curPage--;render();});
document.getElementById('btnNext').addEventListener('click',()=>{curPage++;render();});
document.getElementById('btnReset').addEventListener('click',()=>{
  document.getElementById('fSender').value='';
  document.getElementById('fKeyword').value='';
  document.getElementById('fYearMin').value='';
  document.getElementById('fYearMax').value='';
  document.getElementById('fLocation').value='';
  document.getElementById('pageSize').value='50';
  sortCol=null;sortDir=1;
  document.querySelectorAll('thead th').forEach(h=>h.classList.remove('asc','desc'));
  curPage=1;render();
});

render();
</script>
</body>
</html>
"""

OUT_PATH.write_text(html, encoding="utf-8")
print(f"Generated {OUT_PATH}  ({OUT_PATH.stat().st_size/1024:.0f} KB)")
