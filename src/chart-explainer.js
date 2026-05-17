// chart-explainer.js — turns the chart legend into a plain-English visual key
(function(){
  const EXPLAINER_HTML = `
    <div class="wl-chart-key" data-wl-chart-key="true">
      <div class="wl-chart-key-items">
        <div class="wl-chart-key-item">
          <span class="wl-chart-dot" aria-hidden="true"></span>
          <div>
            <div class="wl-chart-key-title">Daily weigh-ins</div>
            <div class="wl-chart-key-copy">The small dots can jump around from water, food, sleep, and stress.</div>
          </div>
        </div>
        <div class="wl-chart-key-item">
          <span class="wl-chart-line" aria-hidden="true"></span>
          <div>
            <div class="wl-chart-key-title">7-day trend line</div>
            <div class="wl-chart-key-copy">The green line smooths the noise and shows your real direction.</div>
          </div>
        </div>
      </div>
      <div class="wl-chart-key-coach">Judge progress by the green line, not one single dot.</div>
    </div>
  `;

  function isDashboardTrendSection(section){
    const text = (section.textContent || '').replace(/\s+/g, ' ').toLowerCase();
    return text.includes('the trend') && text.includes("you're tracking");
  }

  function isTrendsPage(page){
    const text = (page.textContent || '').replace(/\s+/g, ' ').toLowerCase();
    return text.includes('long-term trends') && text.includes('daily weight is noisy');
  }

  function replaceDashboardLegend(){
    const sections = Array.from(document.querySelectorAll('.wl-section'));
    sections.forEach(section => {
      if(!isDashboardTrendSection(section)) return;
      if(section.querySelector('[data-wl-chart-key="true"]')) return;

      const oldLegend = Array.from(section.querySelectorAll('div')).find(el => {
        const t = (el.textContent || '').replace(/\s+/g, ' ').toLowerCase();
        return t.includes('daily') && t.includes('7-day') && t.includes('actually happening');
      });

      if(oldLegend){
        oldLegend.outerHTML = EXPLAINER_HTML;
      } else {
        const chart = section.querySelector('.recharts-responsive-container') || section.querySelector('.recharts-wrapper');
        if(chart) chart.insertAdjacentHTML('afterend', EXPLAINER_HTML);
      }
    });
  }

  function addTrendsPageLegend(){
    const pages = Array.from(document.querySelectorAll('.wl-page'));
    pages.forEach(page => {
      if(!isTrendsPage(page)) return;
      if(page.querySelector('[data-wl-chart-key="true"]')) return;

      const chart = page.querySelector('.recharts-responsive-container') || page.querySelector('.recharts-wrapper');
      if(chart){
        const holder = chart.closest('.h-\[340px\], .h-72') || chart.parentElement;
        if(holder) holder.insertAdjacentHTML('afterend', EXPLAINER_HTML);
      }
    });
  }

  function apply(){
    replaceDashboardLegend();
    addTrendsPageLegend();
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
  setTimeout(apply, 300);
  setTimeout(apply, 1200);

  new MutationObserver(schedule).observe(document.body || document.documentElement, { childList:true, subtree:true });
})();
