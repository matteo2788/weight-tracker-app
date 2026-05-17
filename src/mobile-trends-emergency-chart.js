// mobile-trends-emergency-chart.js — guarantees a visible Trends graph on mobile if Recharts disappears
(function(){
  const STORAGE_KEY = 'weightlens.v2';
  const RANGES = { '7D':7, '30D':30, '90D':90, '6M':180, '1Y':365, 'ALL':Infinity };

  function readState(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch(e){ return {}; }
  }

  function entries(){
    const state = readState();
    return [...(state.entries || [])]
      .filter(x => x && x.date && Number.isFinite(Number(x.weight)))
      .sort((a,b)=>String(a.date).localeCompare(String(b.date)))
      .map(x => ({ date:x.date, weight:Number(x.weight) }));
  }

  function rolling(rows){
    return rows.map((row,index)=>{
      const slice = rows.slice(Math.max(0,index-6), index+1).map(x=>x.weight).filter(Number.isFinite);
      const avg7 = slice.length ? slice.reduce((a,b)=>a+b,0) / slice.length : row.weight;
      return {...row, avg7};
    });
  }

  function activeRange(){
    const page = trendsPage();
    const active = page?.querySelector('.wl-tabs .active');
    const label = (active?.textContent || '90D').replace(/\s+/g,'').toUpperCase();
    return RANGES[label] ? label : '90D';
  }

  function rangeRows(rows){
    const label = activeRange();
    const count = RANGES[label] || 90;
    return count === Infinity ? rows : rows.slice(-count);
  }

  function shortDate(iso){
    try { return new Date(iso + 'T00:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'}); }
    catch(e){ return iso || ''; }
  }

  function trendsPage(){
    return Array.from(document.querySelectorAll('.wl-page')).find(page => {
      const t = (page.textContent || '').replace(/\s+/g,' ').toLowerCase();
      return t.includes('long-term trends') && t.includes('daily weight is noisy');
    });
  }

  function existingVisibleGraph(page){
    const chart = page?.querySelector('.recharts-wrapper, .recharts-surface, .wl-emergency-trends-chart');
    if(!chart) return false;
    const rect = chart.getBoundingClientRect();
    return rect.height > 120 && rect.width > 180;
  }

  function path(points, key, min, max, w, h, pad){
    if(points.length < 2) return '';
    const span = max - min || 1;
    return points.map((p,i)=>{
      const x = pad.l + (i / (points.length - 1)) * (w - pad.l - pad.r);
      const y = pad.t + (1 - ((p[key] - min) / span)) * (h - pad.t - pad.b);
      return `${i ? 'L' : 'M'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    }).join(' ');
  }

  function buildSvg(data){
    const w = 720, h = 300;
    const pad = { l:64, r:24, t:24, b:46 };
    const vals = data.flatMap(x => [x.weight, x.avg7]).filter(Number.isFinite);
    let min = Math.min(...vals), max = Math.max(...vals);
    min = Math.floor((min - .8) * 10) / 10;
    max = Math.ceil((max + .8) * 10) / 10;
    const mid = (min + max) / 2;
    const yTicks = [max, mid, min];
    const rawXTicks = [data[0], data[Math.floor(data.length/2)], data[data.length-1]].filter(Boolean);
    const seen = new Set();
    const xTicks = rawXTicks.filter(x => !seen.has(x.date) && seen.add(x.date));
    const daily = path(data, 'weight', min, max, w, h, pad);
    const trend = path(data, 'avg7', min, max, w, h, pad);

    function y(v){ return pad.t + (1 - ((v - min) / (max - min || 1))) * (h - pad.t - pad.b); }
    function x(i){ return pad.l + (i / Math.max(1, data.length - 1)) * (w - pad.l - pad.r); }

    const grid = yTicks.map(v => `<line x1="${pad.l}" x2="${w-pad.r}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" stroke="rgba(17,17,15,.07)"/>`).join('');
    const labels = yTicks.map(v => `<text x="10" y="${(y(v)+4).toFixed(1)}" font-size="16" fill="rgba(17,17,15,.48)" font-family="monospace">${v.toFixed(1)}</text>`).join('');
    const xLabels = xTicks.map(row => {
      const i = data.findIndex(d => d.date === row.date);
      return `<text x="${x(i).toFixed(1)}" y="286" font-size="16" text-anchor="middle" fill="rgba(17,17,15,.48)" font-family="Geist,system-ui">${shortDate(row.date)}</text>`;
    }).join('');
    const dots = data.map((p,i)=>{
      const cx = x(i), cy = y(p.weight);
      return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="3" fill="#8FA0B7" opacity=".72"/>`;
    }).join('');

    return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Weight trend chart" preserveAspectRatio="none">${grid}${labels}<path d="${daily}" fill="none" stroke="rgba(95,115,138,.32)" stroke-width="2"/>${dots}<path d="${trend}" fill="none" stroke="#65A30D" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>${xLabels}</svg>`;
  }

  function createChart(){
    const data = rangeRows(rolling(entries()));
    if(data.length < 2) {
      return `<div class="wl-emergency-trends-chart empty"><div class="wl-kicker">Need more data</div><p>Log at least two weights to draw your trend graph.</p></div>`;
    }
    return `<div class="wl-emergency-trends-chart">${buildSvg(data)}</div>`;
  }

  function apply(){
    const page = trendsPage();
    if(!page) return;

    const key = page.querySelector('[data-wl-chart-key="true"]');
    if(!key) return;

    const visible = existingVisibleGraph(page);
    if(visible) return;

    page.querySelectorAll('.wl-emergency-trends-chart').forEach(x => x.remove());
    key.insertAdjacentHTML('beforebegin', createChart());
  }

  function schedule(){ requestAnimationFrame(apply); }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, {once:true});
  else apply();
  window.addEventListener('load', apply);
  window.addEventListener('hashchange', () => setTimeout(apply, 100));
  document.addEventListener('click', e => {
    if(e.target && e.target.closest && e.target.closest('.wl-tabs button')) setTimeout(apply, 150);
  });
  setTimeout(apply, 250);
  setTimeout(apply, 900);
  setTimeout(apply, 1800);
  new MutationObserver(schedule).observe(document.documentElement, {childList:true, subtree:true});
})();
