// week-progress-dom-patch.js — safe text-only patch for current-week progress
(function(){
  'use strict';

  const STORAGE_KEY = 'weightlens.v2';

  function pad(n){ return String(n).padStart(2,'0'); }
  function isoDate(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
  function todayISO(){ return isoDate(new Date()); }
  function parseISO(s){
    const parts = String(s || '').split('-').map(Number);
    return new Date(parts[0] || 1970, (parts[1] || 1) - 1, parts[2] || 1);
  }
  function daysBetween(a,b){ return Math.round((parseISO(b) - parseISO(a)) / 86400000); }
  function weekKey(iso, weekStartDay){
    const d = parseISO(iso);
    const diff = (d.getDay() - weekStartDay + 7) % 7;
    d.setDate(d.getDate() - diff);
    return isoDate(d);
  }
  function shortDate(iso){
    try { return parseISO(iso).toLocaleDateString(undefined,{month:'short', day:'numeric'}); }
    catch(e){ return iso || ''; }
  }
  function loadState(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; }
    catch(e){ return {}; }
  }
  function info(){
    const state = loadState();
    const entries = Array.isArray(state.entries) ? state.entries : [];
    const weekStartDay = Number(state.settings && state.settings.weekStartDay != null ? state.settings.weekStartDay : 1);
    const today = todayISO();
    const start = weekKey(today, weekStartDay);
    const elapsed = Math.min(7, Math.max(1, daysBetween(start, today) + 1));
    const left = Math.max(0, 7 - elapsed);
    const count = entries.filter(e => e && String(e.date) >= start && String(e.date) <= today).length;
    return { start, today, elapsed, left, count };
  }

  function patchDashboard(){
    const current = info();
    const metrics = Array.from(document.querySelectorAll('.wl-metric'));
    for (const metric of metrics) {
      const label = metric.querySelector('.wl-metric-label');
      const value = metric.querySelector('.wl-metric-value');
      const sub = metric.querySelector('.wl-metric-sub');
      const labelText = (label && label.textContent || '').trim().toLowerCase();
      const subText = (sub && sub.textContent || '').trim().toLowerCase();
      const isOldConfidence = labelText === 'confidence' || subText.includes('days logged');
      const isThisWeek = labelText === 'this week';
      if (!isOldConfidence && !isThisWeek) continue;

      if (label) label.textContent = 'This week';
      if (value) {
        value.textContent = `${current.count}/7`;
        value.classList.remove('good','warn');
      }
      if (sub) sub.textContent = `day ${current.elapsed} of 7${current.left ? ` · ${current.left} days left` : ' · ends today'}`;
      break;
    }
  }

  function patchWeeklyReports(){
    const pageText = (document.body && document.body.innerText || '').toLowerCase();
    if (!pageText.includes('weekly reports')) return;

    const current = info();
    const currentStartShort = shortDate(current.start).toLowerCase();
    const blocks = Array.from(document.querySelectorAll('.wl-page .grid'));

    for (const block of blocks) {
      const text = (block.innerText || '').toLowerCase();
      const looksLikeReportRow = text.includes('week of') && text.includes('logged');
      const looksCurrent = text.includes(currentStartShort) || text.includes('in progress') || text.includes('so far');
      if (!looksLikeReportRow || !looksCurrent) continue;

      const divs = Array.from(block.querySelectorAll('div'));
      for (const div of divs) {
        const t = (div.textContent || '').trim();
        if (/^\d+\/\d+$/.test(t)) {
          div.textContent = `${current.count}/7`;
          break;
        }
      }

      const summary = Array.from(block.querySelectorAll('p')).find(p => (p.textContent || '').toLowerCase().includes('this week'));
      if (summary) summary.textContent = `This week is still building. You have logged ${current.count}/7 days so far. Keep logging before making changes from an unfinished week.`;
      break;
    }
  }

  function patchAll(){
    try {
      patchDashboard();
      patchWeeklyReports();
    } catch(e) {
      // Never let this cosmetic patch break the app.
      console.warn('week progress patch skipped', e);
    }
  }

  function start(){
    patchAll();
    setTimeout(patchAll, 250);
    setTimeout(patchAll, 750);
    setTimeout(patchAll, 1500);
    if (window.MutationObserver) {
      const root = document.getElementById('root') || document.body;
      const observer = new MutationObserver(patchAll);
      observer.observe(root, { childList:true, subtree:true, characterData:true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
