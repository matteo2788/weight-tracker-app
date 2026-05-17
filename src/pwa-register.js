// WeightLens PWA + final visual polish layer
(function injectHeroPolish(){
  if (document.getElementById('wl-final-hero-polish')) return;

  const style = document.createElement('style');
  style.id = 'wl-final-hero-polish';
  style.textContent = `
    .wl-hero-line { display: block !important; white-space: nowrap !important; }

    /* Global editorial sizing guardrails */
    .wl-page,
    .wl-right,
    .wl-menu,
    .wl-topnav {
      box-sizing: border-box !important;
    }
    .wl-page {
      width: min(100%, 1500px) !important;
      max-width: 1500px !important;
      margin-inline: auto !important;
      padding-inline: clamp(2rem, 4.8vw, 5.5rem) !important;
      padding-top: clamp(3rem, 5vw, 5.25rem) !important;
    }
    .wl-title,
    .wl-hero-title,
    .wl-big-number,
    .wl-metric-value,
    .wl-row-title,
    .wl-menu-name,
    .wl-right .big,
    .wl-right section .text-2xl,
    .wl-right section .text-3xl {
      font-family: inherit !important;
      font-kerning: normal !important;
      text-rendering: geometricPrecision !important;
    }
    .wl-kicker,
    .wl-metric-label,
    .wl-hero-meta {
      letter-spacing: clamp(0.18em, 0.5vw, 0.34em) !important;
      word-spacing: 0.12em !important;
    }
    .wl-btn {
      min-height: 2.55rem !important;
      padding-inline: 1.35rem !important;
      border-radius: 999px !important;
      white-space: nowrap !important;
    }
    .wl-link {
      white-space: nowrap !important;
      letter-spacing: 0.22em !important;
    }
    .wl-form-line {
      min-width: 0 !important;
      border-radius: 0 !important;
    }

    /* Desktop top navigation alignment */
    .wl-topnav {
      position: sticky !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      width: 100% !important;
      max-width: none !important;
      margin: 0 !important;
      padding-left: clamp(1.25rem, 2vw, 2rem) !important;
      padding-right: clamp(1.25rem, 2vw, 2rem) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      grid-template-columns: none !important;
    }
    .wl-topnav > button:first-child {
      position: static !important;
      transform: none !important;
      margin: 0 !important;
      justify-self: start !important;
      flex: 0 0 auto !important;
    }
    .wl-topnav .wl-logo {
      margin: 0 !important;
      text-align: left !important;
      justify-content: flex-start !important;
    }
    .wl-now {
      display: none !important;
    }
    .wl-top-actions {
      margin-left: auto !important;
      justify-self: end !important;
      flex: 0 0 auto !important;
      display: flex !important;
      align-items: center !important;
      justify-content: flex-end !important;
      gap: 1rem !important;
    }

    /* Right panel: stop cramped text and make it feel intentional */
    .wl-right {
      width: clamp(18.5rem, 20vw, 23rem) !important;
      padding: clamp(2rem, 2.6vw, 3.25rem) clamp(1.55rem, 2vw, 2.35rem) !important;
      gap: 0 !important;
      background: var(--ed-bg, #F6F4EF) !important;
      border-left: 1px solid rgba(17,17,15,0.085) !important;
    }
    .wl-right section {
      padding: 1.75rem 0 !important;
      border-top: 1px solid rgba(17,17,15,0.115) !important;
      margin: 0 !important;
    }
    .wl-right section:first-child {
      padding-top: 0 !important;
      border-top: 0 !important;
    }
    .wl-right .wl-kicker {
      font-size: 0.68rem !important;
      line-height: 1.3 !important;
      letter-spacing: 0.34em !important;
      font-weight: 800 !important;
      color: rgba(17,17,15,0.48) !important;
    }
    .wl-right section p {
      margin-top: 0.9rem !important;
      font-size: clamp(0.91rem, 0.82vw, 1rem) !important;
      line-height: 1.62 !important;
      letter-spacing: 0.006em !important;
      color: rgba(17,17,15,0.66) !important;
      max-width: 32ch !important;
    }
    .wl-right section .text-2xl,
    .wl-right section .text-3xl,
    .wl-right .big {
      font-size: clamp(1.35rem, 1.32vw, 1.75rem) !important;
      line-height: 1.08 !important;
      letter-spacing: -0.028em !important;
      word-spacing: 0.04em !important;
      font-weight: 850 !important;
      color: rgba(17,17,15,0.95) !important;
      max-width: 100% !important;
      overflow-wrap: normal !important;
      word-break: normal !important;
      white-space: normal !important;
    }
    .wl-right .big {
      font-size: clamp(2rem, 2.25vw, 2.9rem) !important;
      letter-spacing: -0.035em !important;
      margin-top: 1.1rem !important;
    }
    .wl-right .big span,
    .wl-right section .text-sm {
      font-size: 0.75rem !important;
      letter-spacing: 0.04em !important;
      font-weight: 750 !important;
      vertical-align: baseline !important;
    }
    .wl-right .accent {
      color: var(--ed-warn, #F59E0B) !important;
    }
    .wl-right button,
    .wl-right .wl-link {
      font-size: 0.72rem !important;
      letter-spacing: 0.22em !important;
      line-height: 1.4 !important;
    }

    /* Dashboard meta row: balanced, not floaty */
    .wl-page > .grid.grid-cols-3:first-child {
      width: 100% !important;
      grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) !important;
      align-items: center !important;
      column-gap: 2rem !important;
    }
    .wl-page > .grid.grid-cols-3:first-child > :last-child {
      justify-self: end !important;
      white-space: nowrap !important;
    }
    .wl-page > .grid.grid-cols-3:first-child .wl-kicker,
    .wl-page > .grid.grid-cols-3:first-child .wl-hero-meta {
      margin: 0 !important;
      text-align: left !important;
    }
    .wl-page > .grid.grid-cols-3:first-child .wl-hero-meta {
      text-align: center !important;
    }

    /* Metric and section polish */
    .wl-metrics {
      width: 100% !important;
      display: grid !important;
      grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
      gap: clamp(2rem, 3.2vw, 3.75rem) !important;
    }
    .wl-metric {
      min-width: 0 !important;
      padding-top: 1.2rem !important;
      border-top: 1px solid rgba(17,17,15,0.115) !important;
    }
    .wl-metric-label {
      font-size: 0.68rem !important;
      line-height: 1.25 !important;
      color: rgba(17,17,15,0.48) !important;
    }
    .wl-metric-value {
      margin-top: 0.85rem !important;
      font-size: clamp(2.25rem, 3.1vw, 4.15rem) !important;
      line-height: 0.95 !important;
      letter-spacing: -0.035em !important;
    }
    .wl-metric-sub {
      margin-top: 0.7rem !important;
      font-size: 0.86rem !important;
      line-height: 1.35 !important;
      color: rgba(17,17,15,0.62) !important;
    }
    .wl-section {
      width: 100% !important;
      margin-top: clamp(5rem, 6vw, 7rem) !important;
      padding-top: 0 !important;
    }
    .wl-section-head {
      align-items: end !important;
      gap: 2rem !important;
    }
    .wl-title {
      letter-spacing: -0.043em !important;
      line-height: 1.02 !important;
    }

    @media (min-width: 1280px) {
      .wl-page { padding-inline: clamp(3.5rem, 5vw, 6.5rem) !important; }
      .wl-page > .grid.grid-cols-3:first-child { margin-bottom: clamp(5.8rem, 6.8vw, 8rem) !important; }
      .wl-hero-title { position: relative !important; isolation: isolate !important; font-size: clamp(5.6rem, 6.7vw, 9.25rem) !important; line-height: 0.94 !important; letter-spacing: -0.038em !important; max-width: 13.5ch !important; margin: 0 auto 2.65rem !important; padding-top: clamp(1.25rem, 2vw, 2.5rem) !important; text-align: center !important; }
      .wl-hero-title::before { content: '' !important; position: absolute !important; left: 50% !important; top: 50% !important; width: min(72vw, 980px) !important; height: min(28vw, 360px) !important; transform: translate(-50%, -50%) !important; border-radius: 999px !important; background: radial-gradient(ellipse at center, rgba(17,17,15,0.045), rgba(17,17,15,0.018) 45%, transparent 72%) !important; z-index: -1 !important; pointer-events: none !important; }
      .wl-hero-meta { margin-top: 0 !important; margin-bottom: 0.85rem !important; letter-spacing: 0.32em !important; opacity: 0.82 !important; }
      .wl-big-number { font-size: clamp(4.1rem, 5.2vw, 6.8rem) !important; line-height: 0.96 !important; letter-spacing: -0.042em !important; margin-top: 0.45rem !important; }
      .wl-unit { font-size: 0.92rem !important; letter-spacing: 0.26em !important; }
      .wl-subtle { margin-top: 1rem !important; font-size: 0.98rem !important; color: rgba(104,103,97,0.9) !important; }
      .wl-metrics { margin-top: clamp(6.8rem, 7.8vw, 9.25rem) !important; }
    }

    @media (max-width: 1279px) {
      .wl-page { padding-inline: clamp(1.5rem, 4vw, 3.5rem) !important; }
      .wl-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
      .wl-right { display: none !important; }
    }

    @media (max-width: 900px) {
      .wl-topnav { padding-left: 1rem !important; padding-right: 1rem !important; }
      .wl-page {
        padding-inline: clamp(1.25rem, 5vw, 2rem) !important;
        padding-top: 3.2rem !important;
      }
      .wl-page > .grid.grid-cols-3:first-child {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 1.55rem 1rem !important;
        margin-bottom: 5.25rem !important;
      }
      .wl-page > .grid.grid-cols-3:first-child > :first-child {
        grid-column: 1 / 2 !important;
      }
      .wl-page > .grid.grid-cols-3:first-child > :nth-child(2) {
        grid-column: 2 / 3 !important;
        text-align: right !important;
      }
      .wl-page > .grid.grid-cols-3:first-child > :last-child {
        grid-column: 1 / -1 !important;
        justify-self: stretch !important;
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 0.85rem !important;
      }
      .wl-page > .grid.grid-cols-3:first-child .wl-btn {
        width: 100% !important;
        min-height: 3.25rem !important;
        margin: 0 !important;
      }
      .wl-hero-title { position: relative !important; isolation: auto !important; font-size: clamp(3rem, 10.6vw, 4.15rem) !important; line-height: 1.08 !important; letter-spacing: -0.035em !important; max-width: none !important; width: 100% !important; margin: 0 0 2.4rem !important; padding-top: 1.7rem !important; }
      .wl-hero-title::before, .wl-hero-title::after { content: none !important; display: none !important; }
      .wl-hero-line { display: block !important; white-space: nowrap !important; }
      .wl-hero-meta { margin-bottom: 0.7rem !important; letter-spacing: 0.32em !important; }
      .wl-big-number { font-size: clamp(3.3rem, 15vw, 4.7rem) !important; line-height: 1 !important; letter-spacing: -0.045em !important; margin-top: 0.25rem !important; }
      .wl-unit { font-size: 0.78rem !important; letter-spacing: 0.24em !important; }
      .wl-subtle { font-size: 0.98rem !important; line-height: 1.55 !important; margin-top: 1rem !important; }
      .wl-metrics {
        margin-top: 5.4rem !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 3rem 1.65rem !important;
      }
      .wl-metric-value { font-size: clamp(2.7rem, 12vw, 3.8rem) !important; }

      .wl-menu { overflow-y: auto !important; }
      .wl-menu-list { top: auto !important; transform: none !important; margin-top: 0 !important; left: 1.35rem !important; right: 1.35rem !important; width: auto !important; max-width: none !important; padding-top: calc(env(safe-area-inset-top, 0px) + 178px) !important; padding-bottom: 2.5rem !important; }
      .wl-menu-item { margin: 0 !important; padding: 0.33rem 0 !important; grid-template-columns: 40px minmax(0, 1fr) !important; gap: 0.95rem !important; align-items: baseline !important; }
      .wl-menu-name { font-size: clamp(2.18rem, 8.1vw, 3.05rem) !important; line-height: 1.08 !important; letter-spacing: -0.055em !important; }
      .wl-menu-num { font-size: 0.8rem !important; padding-top: 0.5rem !important; }

      .wl-section { overflow: visible !important; }
      .wl-section .wl-section-head { display: block !important; margin-bottom: 1.25rem !important; }
      .wl-section .wl-section-head .wl-title { font-size: clamp(2.05rem, 9vw, 3rem) !important; line-height: 1.03 !important; letter-spacing: -0.055em !important; max-width: 12ch !important; }
      .wl-section .wl-tabs { display: flex !important; gap: 1.1rem !important; margin-top: 1.4rem !important; overflow-x: auto !important; white-space: nowrap !important; padding-bottom: 0.45rem !important; }
      .wl-section .wl-tabs button { flex: 0 0 auto !important; font-size: 0.72rem !important; letter-spacing: 0.23em !important; }
      .wl-section .recharts-responsive-container, .wl-section .recharts-wrapper, .wl-section .recharts-surface { width: 100% !important; }
      .wl-section .recharts-responsive-container { height: 245px !important; min-height: 245px !important; display: block !important; }
      .wl-section .recharts-wrapper { height: 245px !important; min-height: 245px !important; display: block !important; }
      .wl-section .h-\[340px\] { height: 245px !important; min-height: 245px !important; display: block !important; margin-top: 1.25rem !important; overflow: visible !important; }
      .wl-section .h-72 { height: 245px !important; min-height: 245px !important; }
      .wl-section > .flex.justify-between.text-xs { display: grid !important; grid-template-columns: 1fr !important; gap: 0.5rem !important; margin-top: 1.05rem !important; font-size: 0.78rem !important; line-height: 1.45 !important; }
      .wl-section > .flex.justify-between.text-xs span { display: block !important; width: 100% !important; }
      .wl-section.wl-grid-2 { display: grid !important; grid-template-columns: 1fr !important; gap: 3.25rem !important; margin-top: 4.75rem !important; }
      .wl-section.wl-grid-2 .wl-note { font-size: clamp(1.35rem, 5.8vw, 1.85rem) !important; line-height: 1.18 !important; letter-spacing: -0.04em !important; }
      .wl-section.wl-grid-2 .wl-rule { border-top: 1px solid rgba(17,17,15,0.12) !important; padding-top: 1.6rem !important; }
      .wl-section.wl-grid-2 .wl-rule > .flex.justify-between { display: block !important; margin-bottom: 1.4rem !important; }
      .wl-section.wl-grid-2 .wl-rule > .flex.justify-between > .wl-kicker, .wl-section.wl-grid-2 .wl-rule > .flex.justify-between > div + div { margin-top: 0.75rem !important; }
      .wl-section.wl-grid-2 .wl-rule .grid.grid-cols-2 { display: grid !important; grid-template-columns: 1fr !important; gap: 1.45rem !important; }
      .wl-section.wl-grid-2 .wl-form-line { font-size: 1.15rem !important; height: 46px !important; }
      .wl-section.wl-grid-2 .wl-btn { width: 100% !important; height: 52px !important; margin-top: 1.4rem !important; }
    }

    @media (max-width: 430px) {
      .wl-page { padding-inline: 1.25rem !important; }
      .wl-hero-title { font-size: clamp(2.78rem, 9.6vw, 3.55rem) !important; max-width: none !important; line-height: 1.08 !important; }
      .wl-big-number { font-size: clamp(3.1rem, 13.5vw, 4.15rem) !important; }
      .wl-metrics { gap: 2.8rem 1.35rem !important; }
      .wl-menu-list { padding-top: calc(env(safe-area-inset-top, 0px) + 168px) !important; }
      .wl-menu-item { padding: 0.28rem 0 !important; }
      .wl-menu-name { font-size: clamp(2.02rem, 7.7vw, 2.75rem) !important; line-height: 1.1 !important; }
      .wl-section .wl-section-head .wl-title { font-size: clamp(1.85rem, 8.2vw, 2.55rem) !important; }
      .wl-section .recharts-responsive-container, .wl-section .recharts-wrapper, .wl-section .h-\[340px\], .wl-section .h-72 { height: 230px !important; min-height: 230px !important; }
    }

    @media (max-width: 380px) {
      .wl-page { padding-inline: 1rem !important; }
      .wl-hero-title { font-size: clamp(2.45rem, 9.2vw, 3.15rem) !important; }
      .wl-menu-list { padding-top: calc(env(safe-area-inset-top, 0px) + 148px) !important; }
      .wl-menu-item { padding: 0.22rem 0 !important; }
      .wl-menu-name { font-size: clamp(1.82rem, 7.35vw, 2.45rem) !important; line-height: 1.1 !important; }
      .wl-section .wl-section-head .wl-title { font-size: clamp(1.7rem, 7.8vw, 2.28rem) !important; }
      .wl-section .recharts-responsive-container, .wl-section .recharts-wrapper, .wl-section .h-\[340px\], .wl-section .h-72 { height: 215px !important; min-height: 215px !important; }
    }
  `;
  document.head.appendChild(style);
})();

(function forceHeroTwoLines(){
  const lineSets = {
    'Your weight is holding steady.': ['Your weight is', 'holding steady.'],
    'Your trend is moving down.': ['Your trend is', 'moving down.'],
    'Your trend is moving up.': ['Your trend is', 'moving up.'],
    'Your weight is being tracked.': ['Your weight is', 'being tracked.'],
    'Start logging to reveal your real trend.': ['Start logging', 'to reveal your trend.']
  };
  function apply(){
    const el = document.querySelector('.wl-hero-title');
    if (!el) return;
    const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    const lines = lineSets[text];
    if (!lines) return;
    const current = Array.from(el.querySelectorAll('.wl-hero-line')).map(x => x.textContent.trim()).join(' ');
    if (current === lines.join(' ')) return;
    el.innerHTML = lines.map(line => `<span class="wl-hero-line">${line}</span>`).join('');
  }
  apply(); window.addEventListener('load', apply); setTimeout(apply,100); setTimeout(apply,500); setTimeout(apply,1500);
  new MutationObserver(()=>apply()).observe(document.documentElement, { childList:true, subtree:true });
})();

function loadWeightLensAddon(src, id){
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.src = src;
  script.defer = true;
  document.body.appendChild(script);
}

(function loadFunctionalAddons(){
  const version = 'features-9';
  window.addEventListener('load', () => {
    loadWeightLensAddon(`src/functional-goals.js?v=${version}`, 'wl-functional-goals');
    loadWeightLensAddon(`src/functional-measurements.js?v=${version}`, 'wl-functional-measurements');
    loadWeightLensAddon(`src/functional-trend-ranges.js?v=${version}`, 'wl-functional-trend-ranges');
    loadWeightLensAddon(`src/functional-settings.js?v=${version}`, 'wl-functional-settings');
    loadWeightLensAddon(`src/functional-photos.js?v=${version}`, 'wl-functional-photos');
    loadWeightLensAddon(`src/functional-insights.js?v=${version}`, 'wl-functional-insights');
    loadWeightLensAddon(`src/functional-log-polish.js?v=${version}`, 'wl-functional-log-polish');
    loadWeightLensAddon(`src/right-panel-fix.js?v=${version}`, 'wl-right-panel-fix');
  });
  setTimeout(() => {
    loadWeightLensAddon(`src/functional-goals.js?v=${version}`, 'wl-functional-goals');
    loadWeightLensAddon(`src/functional-measurements.js?v=${version}`, 'wl-functional-measurements');
    loadWeightLensAddon(`src/functional-trend-ranges.js?v=${version}`, 'wl-functional-trend-ranges');
    loadWeightLensAddon(`src/functional-settings.js?v=${version}`, 'wl-functional-settings');
    loadWeightLensAddon(`src/functional-photos.js?v=${version}`, 'wl-functional-photos');
    loadWeightLensAddon(`src/functional-insights.js?v=${version}`, 'wl-functional-insights');
    loadWeightLensAddon(`src/functional-log-polish.js?v=${version}`, 'wl-functional-log-polish');
    loadWeightLensAddon(`src/right-panel-fix.js?v=${version}`, 'wl-right-panel-fix');
  }, 500);
})();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => null);
  });
}
