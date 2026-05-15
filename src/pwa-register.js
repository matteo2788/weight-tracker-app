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
      main .grid,
      .fixed.inset-0.z-50 .grid > div,
      main .grid > div {
        min-width: 0 !important;
      }
    }

    .weightlens-landing-shell {
      min-height: 100vh !important;
      width: 100% !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: flex-start !important;
      gap: 1.15rem !important;
      padding: calc(env(safe-area-inset-top) + 1.25rem) 1rem calc(env(safe-area-inset-bottom) + 1.25rem) !important;
      background:
        radial-gradient(circle at 50% -10%, rgba(101,163,13,0.14), transparent 22rem),
        linear-gradient(180deg, #10160d 0%, #0F0F10 42%, #0F0F10 100%) !important;
      color: #F3EEE7 !important;
      overflow-x: hidden !important;
    }

    .weightlens-landing-copy {
      width: 100% !important;
      max-width: 30rem !important;
      color: #F3EEE7 !important;
      animation: weightlensFadeIn 360ms ease both;
    }

    .weightlens-landing-brand {
      display: inline-flex !important;
      align-items: center !important;
      gap: 0.72rem !important;
      margin-bottom: 1.15rem !important;
    }

    .weightlens-landing-mark {
      height: 2.4rem !important;
      width: 2.4rem !important;
      border-radius: 0.9rem !important;
      background: #F3EEE7 !important;
      color: #0F0F10 !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      box-shadow: 0 20px 65px -34px rgba(243,238,231,0.7) !important;
    }

    .weightlens-landing-wordmark {
      font-family: 'Satoshi', 'Inter', system-ui, sans-serif !important;
      font-weight: 800 !important;
      font-size: 1rem !important;
      letter-spacing: -0.035em !important;
      line-height: 1 !important;
    }

    .weightlens-landing-kicker {
      color: #C8B9A6 !important;
      font-size: 0.66rem !important;
      text-transform: uppercase !important;
      letter-spacing: 0.2em !important;
      font-weight: 700 !important;
      line-height: 1.35 !important;
    }

    .weightlens-landing-title {
      font-family: 'Satoshi', 'Inter', system-ui, sans-serif !important;
      font-size: clamp(2.15rem, 9.3vw, 3.15rem) !important;
      line-height: 0.98 !important;
      letter-spacing: -0.055em !important;
      font-weight: 800 !important;
      margin: 0.55rem 0 0 !important;
      max-width: 12ch !important;
    }

    .weightlens-landing-body {
      color: rgba(243,238,231,0.68) !important;
      font-size: 0.95rem !important;
      line-height: 1.55 !important;
      margin-top: 0.9rem !important;
      max-width: 30rem !important;
    }

    .weightlens-landing-features {
      display: flex !important;
      flex-wrap: wrap !important;
      gap: 0.45rem !important;
      margin-top: 1rem !important;
    }

    .weightlens-landing-feature {
      border: 1px solid rgba(243,238,231,0.095) !important;
      background: rgba(243,238,231,0.045) !important;
      border-radius: 999px !important;
      padding: 0.48rem 0.68rem !important;
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 0.45rem !important;
      width: auto !important;
    }

    .weightlens-landing-feature::before {
      content: '';
      height: 0.35rem;
      width: 0.35rem;
      border-radius: 999px;
      background: rgb(var(--accent-rgb));
      flex: 0 0 auto;
    }

    .weightlens-landing-feature-title {
      font-weight: 650 !important;
      font-size: 0.76rem !important;
      margin: 0 !important;
      color: rgba(243,238,231,0.88) !important;
      line-height: 1 !important;
    }

    .weightlens-landing-feature-body {
      display: none !important;
    }

    .weightlens-landing-shell > .w-full.max-w-md {
      width: 100% !important;
      max-width: 30rem !important;
      border-radius: 1.5rem !important;
      padding: 1.25rem !important;
      background: rgba(26,26,28,0.88) !important;
      border: 1px solid rgba(243,238,231,0.10) !important;
      box-shadow: 0 24px 80px -52px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.035) inset !important;
      color: #F3EEE7 !important;
      backdrop-filter: blur(16px) saturate(1.08) !important;
      -webkit-backdrop-filter: blur(16px) saturate(1.08) !important;
    }

    .weightlens-landing-shell > .w-full.max-w-md > div:first-child {
      margin-bottom: 1rem !important;
    }

    .weightlens-landing-shell > .w-full.max-w-md h1 {
      font-size: 1.45rem !important;
      line-height: 1.12 !important;
      letter-spacing: -0.035em !important;
      max-width: 18rem !important;
    }

    .weightlens-landing-shell > .w-full.max-w-md p {
      font-size: 0.9rem !important;
      line-height: 1.5 !important;
      margin-top: 0.75rem !important;
      color: rgba(243,238,231,0.64) !important;
    }

    .weightlens-landing-shell > .w-full.max-w-md input {
      width: 100% !important;
      background: #242427 !important;
      border-color: rgba(243,238,231,0.10) !important;
      color: #F3EEE7 !important;
      height: 3rem !important;
      border-radius: 1rem !important;
      font-size: 1rem !important;
    }

    .weightlens-landing-shell > .w-full.max-w-md input::placeholder {
      color: rgba(243,238,231,0.42) !important;
    }

    .weightlens-landing-shell > .w-full.max-w-md button.bg-fg {
      background: #F3EEE7 !important;
      color: #0F0F10 !important;
      height: 3rem !important;
      border-radius: 1rem !important;
    }

    .weightlens-landing-shell > .w-full.max-w-md .grid.grid-cols-2 {
      background: rgba(243,238,231,0.055) !important;
      border-radius: 1rem !important;
      gap: 0.25rem !important;
      margin-bottom: 1rem !important;
    }

    .weightlens-landing-shell > .w-full.max-w-md .grid.grid-cols-2 button {
      min-width: 0 !important;
      white-space: normal !important;
      line-height: 1.1 !important;
      border-radius: 0.85rem !important;
      font-size: 0.86rem !important;
    }

    .weightlens-landing-shell > .w-full.max-w-md .bg-surface3 {
      background: rgba(243,238,231,0.06) !important;
    }

    .weightlens-landing-shell > .w-full.max-w-md .bg-surface {
      background: rgba(243,238,231,0.12) !important;
      color: #F3EEE7 !important;
    }

    @keyframes weightlensFadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (min-width: 1100px) {
      .weightlens-landing-shell {
        flex-direction: row !important;
        justify-content: center !important;
        align-items: center !important;
        gap: clamp(3rem, 7vw, 7rem) !important;
        padding: 4rem !important;
        background:
          radial-gradient(circle at 18% 14%, rgba(101,163,13,0.13), transparent 35rem),
          radial-gradient(circle at 88% 88%, rgba(200,185,166,0.07), transparent 28rem),
          #0F0F10 !important;
      }

      .weightlens-landing-copy {
        max-width: 34rem !important;
      }

      .weightlens-landing-brand {
        margin-bottom: 2rem !important;
      }

      .weightlens-landing-title {
        font-size: clamp(3.55rem, 4.6vw, 4.75rem) !important;
        max-width: 11ch !important;
      }

      .weightlens-landing-body {
        font-size: 1.05rem !important;
        max-width: 32rem !important;
      }

      .weightlens-landing-features {
        max-width: 30rem !important;
      }

      .weightlens-landing-shell > .w-full.max-w-md {
        max-width: 27rem !important;
        padding: 1.65rem !important;
      }
    }

    @media (max-width: 520px) {
      .weightlens-landing-shell {
        padding-left: 0.95rem !important;
        padding-right: 0.95rem !important;
      }

      .weightlens-landing-copy {
        max-width: none !important;
      }

      .weightlens-landing-title {
        font-size: clamp(2rem, 10.5vw, 2.85rem) !important;
        max-width: 12ch !important;
      }

      .weightlens-landing-body {
        font-size: 0.9rem !important;
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
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18 9 12l4 4 7-8"/></svg>
        </div>
        <div>
          <div class="weightlens-landing-wordmark">WeightLens</div>
          <div class="weightlens-landing-kicker">Trend dashboard</div>
        </div>
      </div>
      <p class="weightlens-landing-kicker">Scale data, without the panic</p>
      <h1 class="weightlens-landing-title">Understand your weight trend.</h1>
      <p class="weightlens-landing-body">A calm dashboard for daily weigh-ins, 7-day averages, goal pace, and personalized insights.</p>
      <div class="weightlens-landing-features">
        <div class="weightlens-landing-feature"><div class="weightlens-landing-feature-title">7-day trend</div><div class="weightlens-landing-feature-body">See the real direction.</div></div>
        <div class="weightlens-landing-feature"><div class="weightlens-landing-feature-title">Goal coach</div><div class="weightlens-landing-feature-body">Track pace and ETA.</div></div>
        <div class="weightlens-landing-feature"><div class="weightlens-landing-feature-title">Personal insights</div><div class="weightlens-landing-feature-body">Explain fluctuations.</div></div>
        <div class="weightlens-landing-feature"><div class="weightlens-landing-feature-title">Cloud sync</div><div class="weightlens-landing-feature-body">Use every device.</div></div>
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
