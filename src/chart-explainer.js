// chart-explainer.js — turns the chart legend into a plain-English visual key
(function(){
  const EXPLAINER_HTML = `
    <div class="wl-chart-key" data-wl-chart-key="true">
      <div class="wl-chart-key-items">
        <div class="wl-chart-key-item">
          <span class="wl-chart-dot" aria-hidden="true"></span>
          <div>
            <div class="wl-chart-key-title">Daily weigh-ins</div>
            <div class="wl-chart-key-copy">Each dot is one morning. Dots jump around because of water, food, sleep, and stress.</div>
          </div>
        </div>
        <div class="wl-chart-key-item">
          <span class="wl-chart-line" aria-hidden="true"></span>
          <div>
            <div class="wl-chart-key-title">Green trend line</div>
            <div class="wl-chart-key-copy">This smooths the last 7 days so you can see the real direction.</div>
          </div>
        </div>
      </div>
      <div class="wl-chart-key-coach">Use the green line to judge progress. One dot is just one noisy morning.</div>
    </div>
  `;

  function cleanText(el){
    return (el?.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function isTrendArea(el){
    const t = cleanText(el);
    return (t.includes('the trend') && t.includes("you're tracking")) ||
           (t.includes('long-term trends') && t.includes('daily weight is noisy'));
  }

  function findTrendAreas(){
    const candidates = Array.from(document.querySelectorAll('.wl-section, .wl-page'));
    return candidates.filter(isTrendArea);
  }

  function oldLegendNode(area){
    const nodes = Array.from(area.querySelectorAll('div, p, span'));
    return nodes.find(el => {
      if(el.closest('[data-wl-chart-key="true"]')) return false;
      const t = cleanText(el);
      return (
        t.includes('daily') &&
        t.includes('7-day') &&
        (t.includes('actually happening') || t.includes('rolling avg') || t.includes('rolling average'))
      );
    });
  }

  function chartNode(area){
    return area.querySelector('.recharts-responsive-container') || area.querySelector('.recharts-wrapper');
  }

  function applyTo(area){
    if(area.querySelector('[data-wl-chart-key="true"]')) return;

    const oldLegend = oldLegendNode(area);
    if(oldLegend){
      oldLegend.outerHTML = EXPLAINER_HTML;
      return;
    }

    const chart = chartNode(area);
    if(chart){
      const holder = chart.parentElement || chart;
      holder.insertAdjacentHTML('afterend', EXPLAINER_HTML);
    }
  }

  function apply(){
    try {
      findTrendAreas().forEach(applyTo);
    } catch (err) {
      console.warn('WeightLens chart explainer failed:', err);
    }
  }

  let scheduled = false;
  function schedule(){
    if(scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      apply();
    });
  }

  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply, { once:true });
  } else {
    apply();
  }
  window.addEventListener('load', apply, { once:true });
  setTimeout(apply, 100);
  setTimeout(apply, 400);
  setTimeout(apply, 1200);
  setTimeout(apply, 2500);

  new MutationObserver(schedule).observe(document.documentElement, { childList:true, subtree:true });
})();
