// right-panel-fix.js — final right panel overflow + goal label cleanup
(function(){
  function injectStyle(){
    if(document.getElementById('wl-right-panel-final-fix')) return;
    const style = document.createElement('style');
    style.id = 'wl-right-panel-final-fix';
    style.textContent = `
      html, body, #root {
        overflow-x: hidden !important;
        max-width: 100vw !important;
      }

      body * {
        box-sizing: border-box !important;
      }

      .wl-right {
        flex: 0 0 clamp(21rem, 22vw, 27rem) !important;
        width: clamp(21rem, 22vw, 27rem) !important;
        min-width: 21rem !important;
        max-width: min(27rem, calc(100vw - 2rem)) !important;
        overflow-x: hidden !important;
        overscroll-behavior-x: none !important;
        padding-left: clamp(2rem, 2.1vw, 2.75rem) !important;
        padding-right: clamp(2rem, 2.1vw, 2.75rem) !important;
      }

      .wl-right,
      .wl-right * {
        min-width: 0 !important;
        max-width: 100% !important;
        overflow-wrap: normal !important;
        word-break: normal !important;
      }

      .wl-right section {
        width: 100% !important;
        overflow-x: hidden !important;
      }

      .wl-right section > .flex.justify-between,
      .wl-right section > .flex.items-center,
      .wl-right section > .flex {
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) auto !important;
        align-items: center !important;
        gap: 1.25rem !important;
        width: 100% !important;
      }

      .wl-right .wl-kicker {
        white-space: normal !important;
        overflow: visible !important;
        text-overflow: clip !important;
        line-height: 1.45 !important;
        letter-spacing: 0.28em !important;
      }

      .wl-right section button.wl-kicker,
      .wl-right section .wl-kicker:last-child {
        justify-self: end !important;
        text-align: right !important;
        white-space: nowrap !important;
        letter-spacing: 0.24em !important;
      }

      .wl-right .wl-goal-label,
      .wl-right section .text-2xl,
      .wl-right section [class*="text-2xl"],
      .wl-right section [class*="font-black"] {
        display: block !important;
        font-size: clamp(1.45rem, 1.28vw, 1.85rem) !important;
        line-height: 1.12 !important;
        letter-spacing: -0.018em !important;
        word-spacing: 0.08em !important;
        font-weight: 850 !important;
        white-space: normal !important;
      }

      .wl-right .big {
        font-size: clamp(2.3rem, 2.45vw, 3.25rem) !important;
        line-height: .95 !important;
        letter-spacing: -0.025em !important;
        word-spacing: 0.04em !important;
      }

      .wl-right p {
        font-size: clamp(0.98rem, 0.86vw, 1.08rem) !important;
        line-height: 1.65 !important;
        letter-spacing: 0.002em !important;
        max-width: 100% !important;
      }

      .wl-right .wl-link {
        display: inline-block !important;
        max-width: 100% !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      @media (min-width: 1280px) {
        body:has(.wl-right) main,
        body:has(.wl-right) .wl-app,
        body:has(.wl-right) .app-shell,
        body:has(.wl-right) [class*="grid"] {
          max-width: 100vw !important;
        }
      }

      @media (max-width: 1279px) {
        .wl-right {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function cleanGoalLabels(){
    const replacements = {
      musclegain: 'Muscle gain',
      muscleGain: 'Muscle gain',
      fatloss: 'Fat loss',
      fatLoss: 'Fat loss',
      recomp: 'Recomp',
      maintenance: 'Maintenance',
      general: 'General'
    };

    document.querySelectorAll('.wl-right section').forEach(section => {
      const heading = section.querySelector('.wl-kicker');
      if(!heading) return;
      const label = (heading.textContent || '').trim().toLowerCase();
      if(label !== 'current goal') return;

      const candidates = Array.from(section.querySelectorAll('div, span, strong, b'));
      candidates.forEach(node => {
        const raw = (node.textContent || '').trim();
        const key = raw.replace(/\s+/g,'');
        if(replacements[key]) {
          node.textContent = replacements[key];
          node.classList.add('wl-goal-label');
        }
      });
    });
  }

  function run(){
    injectStyle();
    cleanGoalLabels();
  }

  run();
  window.addEventListener('load', run);
  setTimeout(run, 100);
  setTimeout(run, 500);
  setTimeout(run, 1500);
  new MutationObserver(run).observe(document.documentElement, { childList:true, subtree:true, characterData:true });
})();
