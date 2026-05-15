// pwa-register.js — registers the service worker for installable app behavior
(function registerWeightLensPWA(){
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('/sw.js').catch(function(error){
        console.warn('WeightLens service worker registration failed:', error);
      });
    });
  }

  // Mobile PWA safe-area + iOS form polish + public landing screen polish.
  const style = document.createElement('style');
  style.id = 'weightlens-pwa-safe-area-polish';
  style.textContent = `
    @media (max-width: 640px) {
      .lg\\:hidden.fixed.inset-0.z-40.flex > .relative.bg-surface.h-full > aside {
        padding-top: calc(env(safe-area-inset-top) + 2.25rem) !important;
      }

      .lg\\:hidden.fixed.inset-0.z-40.flex > .relative.bg-surface.h-full > aside > div:first-child {
        padding-top: 0 !important;
        margin-top: 0 !important;
        align-items: flex-start !important;
      }

      .lg\\:hidden.fixed.inset-0.z-40.flex > .relative.bg-surface.h-full > aside > div:first-child button {
        margin-top: 0.1rem !important;
      }

      .lg\\:hidden.fixed.inset-0.z-40.flex > .relative.bg-surface.h-full {
        padding-top: 0 !important;
        background: #151516 !important;
      }

      input[type="date"] {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        box-sizing: border-box !important;
        text-align: left !important;
        padding-left: 1rem !important;
        padding-right: 2.75rem !important;
        -webkit-appearance: none !important;
        appearance: none !important;
      }

      input[type="date"]::-webkit-date-and-time-value {
        text-align: left !important;
        width: 100% !important;
        display: block !important;
      }

      input[type="date"]::-webkit-calendar-picker-indicator {
        position: absolute !important;
        right: 1rem !important;
        opacity: 0.65 !important;
      }

      .fixed.inset-0.z-50 input[type="date"],
      main input[type="date"] {
        margin-left: 0 !important;
        margin-right: 0 !important;
      }

      .fixed.inset-0.z-50 label + input[type="date"],
      main label + input[type="date"] {
        align-self: stretch !important;
      }

      .fixed.inset-0.z-50 .grid,
      main .grid {
        min-width: 0 !important;
      }

      .fixed.inset-0.z-50 .grid > div,
      main .grid > div {
        min-width: 0 !important;
      }
    }

    .weightlens-landing-shell {
      background:
        radial-gradient(circle at 12% 14%, rgba(101,163,13,0.18), transparent 34rem),
        radial-gradient(circle at 86% 78%, rgba(200,185,166,0.10), transparent 30rem),
        #0F0F10 !important;
      color: #F3EEE7 !important;
      gap: 3rem !important;
    }

    .weightlens-landing-copy {
      width: min(100%, 35rem);
      color: #F3EEE7;
      animation: weightlensFadeIn 420ms ease both;
    }

    .weightlens-landing-brand {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 2.25rem;
    }

    .weightlens-landing-mark {
      height: 2.75rem;
      width: 2.75rem;
      border-radius: 1rem;
      background: #F3EEE7;
      color: #0F0F10;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 22px 70px -34px rgba(243,238,231,0.65);
    }

    .weightlens-landing-kicker {
      color: #C8B9A6;
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.22em;
      font-weight: 700;
    }

    .weightlens-landing-title {
      font-family: 'Satoshi', 'Inter', system-ui, sans-serif;
      font-size: clamp(2.5rem, 5vw, 4.85rem);
      line-height: 0.94;
      letter-spacing: -0.065em;
      font-weight: 800;
      margin: 0;
      max-width: 11ch;
    }

    .weightlens-landing-body {
      color: rgba(243,238,231,0.72);
      font-size: 1.05rem;
      line-height: 1.65;
      margin-top: 1.35rem;
      max-width: 34rem;
    }

    .weightlens-landing-features {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.75rem;
      margin-top: 2rem;
    }

    .weightlens-landing-feature {
      border: 1px solid rgba(243,238,231,0.10);
      background: rgba(243,238,231,0.045);
      border-radius: 1.25rem;
      padding: 0.95rem;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    .weightlens-landing-feature-title {
      font-weight: 700;
      font-size: 0.9rem;
      margin-bottom: 0.25rem;
    }

    .weightlens-landing-feature-body {
      color: rgba(243,238,231,0.58);
      font-size: 0.78rem;
      line-height: 1.45;
    }

    .weightlens-landing-shell > .w-full.max-w-md {
      background: rgba(26,26,28,0.86) !important;
      border: 1px solid rgba(243,238,231,0.10) !important;
      box-shadow: 0 34px 100px -52px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.035) inset !important;
      color: #F3EEE7 !important;
      backdrop-filter: blur(16px) saturate(1.08);
      -webkit-backdrop-filter: blur(16px) saturate(1.08);
    }

    .weightlens-landing-shell > .w-full.max-w-md input {
      background: #242427 !important;
      border-color: rgba(243,238,231,0.10) !important;
      color: #F3EEE7 !important;
    }

    .weightlens-landing-shell > .w-full.max-w-md input::placeholder {
      color: rgba(243,238,231,0.42) !important;
    }

    .weightlens-landing-shell > .w-full.max-w-md button.bg-fg {
      background: #F3EEE7 !important;
      color: #0F0F10 !important;
    }

    .weightlens-landing-shell > .w-full.max-w-md .bg-surface3 {
      background: rgba(243,238,231,0.06) !important;
    }

    .weightlens-landing-shell > .w-full.max-w-md .bg-surface {
      background: rgba(243,238,231,0.10) !important;
      color: #F3EEE7 !important;
    }

    @keyframes weightlensFadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (min-width: 900px) {
      .weightlens-landing-shell {
        flex-direction: row !important;
        justify-content: center !important;
        align-items: center !important;
        padding: 4rem !important;
      }
    }

    @media (max-width: 899px) {
      .weightlens-landing-shell {
        align-items: stretch !important;
        justify-content: flex-start !important;
        padding: calc(env(safe-area-inset-top) + 1.25rem) 1.1rem calc(env(safe-area-inset-bottom) + 1.25rem) !important;
        gap: 1.6rem !important;
      }

      .weightlens-landing-copy {
        width: 100%;
      }

      .weightlens-landing-brand {
        margin-bottom: 1.35rem;
      }

      .weightlens-landing-title {
        font-size: clamp(2.35rem, 12vw, 3.7rem);
      }

      .weightlens-landing-body {
        font-size: 0.98rem;
        line-height: 1.55;
      }

      .weightlens-landing-features {
        grid-template-columns: 1fr;
        gap: 0.6rem;
        margin-top: 1.25rem;
      }

      .weightlens-landing-shell > .w-full.max-w-md {
        max-width: none !important;
      }
    }
  `;
  document.head.appendChild(style);

  function enhanceLandingScreen(){
    const root = document.getElementById('root');
    if (!root) return;

    const shell = root.querySelector('.min-h-screen.flex.items-center.justify-center');
    if (!shell) return;

    const h1 = shell.querySelector('h1');
    const text = h1 ? h1.textContent || '' : '';
    const isAuthScreen = text.includes('Sign in') || text.includes('Create your account') || text.includes('Reset your password');
    if (!isAuthScreen) return;

    shell.classList.add('weightlens-landing-shell');

    if (shell.querySelector('.weightlens-landing-copy')) return;

    const panel = document.createElement('section');
    panel.className = 'weightlens-landing-copy';
    panel.innerHTML = `
      <div class="weightlens-landing-brand">
        <div class="weightlens-landing-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18 9 12l4 4 7-8"/></svg>
        </div>
        <div>
          <div style="font-weight:800; letter-spacing:-0.03em;">WeightLens</div>
          <div class="weightlens-landing-kicker">Trend dashboard</div>
        </div>
      </div>
      <p class="weightlens-landing-kicker">Weight tracking that finally makes sense</p>
      <h1 class="weightlens-landing-title">Stop guessing what the scale means.</h1>
      <p class="weightlens-landing-body">WeightLens turns daily weigh-ins into calm trends, goal coaching, and plain-English insights — so one random spike does not mess with your head.</p>
      <div class="weightlens-landing-features">
        <div class="weightlens-landing-feature"><div class="weightlens-landing-feature-title">7-day trend</div><div class="weightlens-landing-feature-body">See the real direction instead of reacting to noisy mornings.</div></div>
        <div class="weightlens-landing-feature"><div class="weightlens-landing-feature-title">Goal coach</div><div class="weightlens-landing-feature-body">Track pace, remaining progress, and estimated timeline.</div></div>
        <div class="weightlens-landing-feature"><div class="weightlens-landing-feature-title">Personal insights</div><div class="weightlens-landing-feature-body">Understand fluctuations, logging consistency, and weekly movement.</div></div>
        <div class="weightlens-landing-feature"><div class="weightlens-landing-feature-title">Cloud sync</div><div class="weightlens-landing-feature-body">Use your dashboard across phone, tablet, and computer.</div></div>
      </div>
    `;

    shell.insertBefore(panel, shell.firstChild);
  }

  const observer = new MutationObserver(() => enhanceLandingScreen());
  window.addEventListener('load', () => {
    enhanceLandingScreen();
    const root = document.getElementById('root');
    if (root) observer.observe(root, { childList: true, subtree: true });
  });
})();
