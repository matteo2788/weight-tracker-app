// dashboard-week-card-patch.js — keeps the dashboard week card synced with real week progress
(function(){
  const STORAGE_KEY = 'weightlens.v2';

  function pad(n){ return String(n).padStart(2,'0'); }
  function isoDate(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
  function todayISO(){ return isoDate(new Date()); }
  function parseISO(s){ const [y,m,d] = String(s || '').split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); }
  function daysBetween(a,b){ return Math.round((parseISO(b) - parseISO(a)) / 86400000); }
  function weekKey(iso, weekStartDay){
    const d = parseISO(iso);
    const diff = (d.getDay() - weekStartDay + 7) % 7;
    d.setDate(d.getDate() - diff);
    return isoDate(d);
  }

  function loadState(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch(e){ return {}; }
  }

  function currentWeekInfo(){
    const state = loadState();
    const entries = Array.isArray(state.entries) ? state.entries : [];
    const weekStartDay = Number(state.settings && state.settings.weekStartDay != null ? state.settings.weekStartDay : 1);
    const today = todayISO();
    const start = weekKey(today, weekStartDay);
    const elapsed = Math.min(7, Math.max(1, daysBetween(start, today) + 1));
    const count = entries.filter(e => e && e.date >= start && e.date <= today).length;
    const left = Math.max(0, 7 - elapsed);
    return { count, elapsed, left };
  }

  function patchDashboardWeekCard(){
    const metrics = Array.from(document.querySelectorAll('.wl-metric'));
    if (!metrics.length) return;

    const card = metrics.find(metric => {
      const label = metric.querySelector('.wl-metric-label');
      const text = (label && label.textContent || '').trim().toLowerCase();
      return text === 'confidence' || text === 'this week';
    });

    if (!card) return;

    const info = currentWeekInfo();
    const label = card.querySelector('.wl-metric-label');
    const value = card.querySelector('.wl-metric-value');
    const sub = card.querySelector('.wl-metric-sub');

    if (label) label.textContent = 'This week';
    if (value) value.textContent = `${info.count}/7`;
    if (sub) sub.textContent = `day ${info.elapsed} of 7${info.left ? ` · ${info.left} days left` : ' · ends today'}`;
  }

  function start(){
    patchDashboardWeekCard();
    setTimeout(patchDashboardWeekCard, 250);
    setTimeout(patchDashboardWeekCard, 900);
    setInterval(patchDashboardWeekCard, 1500);

    const root = document.getElementById('root');
    if (root && window.MutationObserver) {
      const observer = new MutationObserver(() => patchDashboardWeekCard());
      observer.observe(root, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
