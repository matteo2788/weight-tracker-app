// WeightLens PWA + final visual polish layer
(function injectHeroPolish(){
  if (document.getElementById('wl-final-hero-polish')) return;

  const style = document.createElement('style');
  style.id = 'wl-final-hero-polish';
  style.textContent = `
    /* Final hero stage polish — loaded last so it wins */
    .wl-hero-line { display: block !important; white-space: nowrap !important; }

    @media (min-width: 1280px) {
      .wl-page > .grid.grid-cols-3:first-child { margin-bottom: clamp(5.8rem, 6.8vw, 8rem) !important; }
      .wl-hero-title { position: relative !important; isolation: isolate !important; font-size: clamp(5.6rem, 6.7vw, 9.25rem) !important; line-height: 0.94 !important; letter-spacing: -0.038em !important; max-width: 13.5ch !important; margin: 0 auto 2.65rem !important; padding-top: clamp(1.25rem, 2vw, 2.5rem) !important; text-align: center !important; }
      .wl-hero-title::before { content: '' !important; position: absolute !important; left: 50% !important; top: 50% !important; width: min(72vw, 980px) !important; height: min(28vw, 360px) !important; transform: translate(-50%, -50%) !important; border-radius: 999px !important; background: radial-gradient(ellipse at center, rgba(17,17,15,0.045), rgba(17,17,15,0.018) 45%, transparent 72%) !important; z-index: -1 !important; pointer-events: none !important; }
      .wl-hero-meta { margin-top: 0 !important; margin-bottom: 0.85rem !important; letter-spacing: 0.32em !important; opacity: 0.82 !important; }
      .wl-big-number { font-size: clamp(4.1rem, 5.2vw, 6.8rem) !important; line-height: 0.96 !important; letter-spacing: -0.042em !important; margin-top: 0.45rem !important; }
      .wl-unit { font-size: 0.92rem !important; letter-spacing: 0.26em !important; }
      .wl-subtle { margin-top: 1rem !important; font-size: 0.98rem !important; color: rgba(104,103,97,0.9) !important; }
      .wl-metrics { margin-top: clamp(6.8rem, 7.8vw, 9.25rem) !important; }
    }

    @media (max-width: 900px) {
      .wl-page > .grid.grid-cols-3:first-child { margin-bottom: 5.25rem !important; }
      .wl-hero-title { position: relative !important; isolation: auto !important; font-size: clamp(3rem, 10.6vw, 4.15rem) !important; line-height: 1.08 !important; letter-spacing: -0.035em !important; max-width: none !important; width: 100% !important; margin: 0 0 2.4rem !important; padding-top: 1.7rem !important; }
      .wl-hero-title::before, .wl-hero-title::after { content: none !important; display: none !important; }
      .wl-hero-line { display: block !important; white-space: nowrap !important; }
      .wl-hero-meta { margin-bottom: 0.7rem !important; letter-spacing: 0.32em !important; }
      .wl-big-number { font-size: clamp(3.3rem, 15vw, 4.7rem) !important; line-height: 1 !important; letter-spacing: -0.045em !important; margin-top: 0.25rem !important; }
      .wl-unit { font-size: 0.78rem !important; letter-spacing: 0.24em !important; }
      .wl-subtle { font-size: 0.98rem !important; line-height: 1.55 !important; margin-top: 1rem !important; }
      .wl-metrics { margin-top: 5.4rem !important; }

      /* Mobile fullscreen menu: balanced editorial rhythm */
      .wl-menu { overflow-y: auto !important; }
      .wl-menu-list {
        top: auto !important;
        transform: none !important;
        margin-top: 0 !important;
        left: 1.35rem !important;
        right: 1.35rem !important;
        width: auto !important;
        max-width: none !important;
        padding-top: calc(env(safe-area-inset-top, 0px) + 178px) !important;
        padding-bottom: 2.5rem !important;
      }
      .wl-menu-item {
        margin: 0 !important;
        padding: 0.33rem 0 !important;
        grid-template-columns: 40px minmax(0, 1fr) !important;
        gap: 0.95rem !important;
        align-items: baseline !important;
      }
      .wl-menu-name {
        font-size: clamp(2.18rem, 8.1vw, 3.05rem) !important;
        line-height: 1.08 !important;
        letter-spacing: -0.055em !important;
      }
      .wl-menu-num {
        font-size: 0.8rem !important;
        padding-top: 0.5rem !important;
      }

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
      .wl-hero-title { font-size: clamp(2.78rem, 9.6vw, 3.55rem) !important; max-width: none !important; line-height: 1.08 !important; }
      .wl-big-number { font-size: clamp(3.1rem, 13.5vw, 4.15rem) !important; }
      .wl-menu-list { padding-top: calc(env(safe-area-inset-top, 0px) + 168px) !important; }
      .wl-menu-item { padding: 0.28rem 0 !important; }
      .wl-menu-name { font-size: clamp(2.02rem, 7.7vw, 2.75rem) !important; line-height: 1.1 !important; }
      .wl-section .wl-section-head .wl-title { font-size: clamp(1.85rem, 8.2vw, 2.55rem) !important; }
      .wl-section .recharts-responsive-container, .wl-section .recharts-wrapper, .wl-section .h-\[340px\], .wl-section .h-72 { height: 230px !important; min-height: 230px !important; }
    }

    @media (max-width: 380px) {
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
  const version = 'features-4';
  window.addEventListener('load', () => {
    loadWeightLensAddon(`src/functional-goals.js?v=${version}`, 'wl-functional-goals');
    loadWeightLensAddon(`src/functional-measurements.js?v=${version}`, 'wl-functional-measurements');
    loadWeightLensAddon(`src/functional-trend-ranges.js?v=${version}`, 'wl-functional-trend-ranges');
    loadWeightLensAddon(`src/functional-settings.js?v=${version}`, 'wl-functional-settings');
    loadWeightLensAddon(`src/functional-photos.js?v=${version}`, 'wl-functional-photos');
  });
  setTimeout(() => {
    loadWeightLensAddon(`src/functional-goals.js?v=${version}`, 'wl-functional-goals');
    loadWeightLensAddon(`src/functional-measurements.js?v=${version}`, 'wl-functional-measurements');
    loadWeightLensAddon(`src/functional-trend-ranges.js?v=${version}`, 'wl-functional-trend-ranges');
    loadWeightLensAddon(`src/functional-settings.js?v=${version}`, 'wl-functional-settings');
    loadWeightLensAddon(`src/functional-photos.js?v=${version}`, 'wl-functional-photos');
  }, 500);
})();

// Lightweight service worker registration.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => null);
  });
}
