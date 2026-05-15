// pwa-register.js — service worker + mobile polish + public landing styling
(function registerWeightLensPWA(){
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('/sw.js').catch(function(error){
        console.warn('WeightLens service worker registration failed:', error);
      });
    });
  }

  const style = document.createElement('style');
  style.id = 'weightlens-pwa-safe-area-polish';
  style.textContent = `
    @media (max-width: 640px) {
      .lg\\:hidden.fixed.inset-0.z-40.flex > .relative.bg-surface.h-full > aside {
        padding-top: calc(env(safe-area-inset-top) + 2.25rem) !important;
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
    }

    html.weightlens-auth-mode,
    html.weightlens-auth-mode body,
    html.weightlens-auth-mode #root {
      background: #F7F7F4 !important;
      color: #11141B !important;
      color-scheme: light !important;
    }

    html.weightlens-auth-mode .weightlens-landing-shell,
    html[data-theme="dark"] .weightlens-landing-shell,
    .weightlens-landing-shell {
      min-height: 100vh !important;
      width: 100% !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: stretch !important;
      justify-content: flex-start !important;
      padding: 0 !important;
      background: #F7F7F4 !important;
      color: #11141B !important;
      overflow-x: hidden !important;
      position: relative !important;
      isolation: isolate !important;
    }

    .weightlens-landing-shell::before {
      content: '' !important;
      position: absolute !important;
      inset: 0 !important;
      z-index: -1 !important;
      pointer-events: none !important;
      background:
        radial-gradient(circle at 84% 12%, rgba(17,20,27,0.045), transparent 20rem),
        radial-gradient(circle at 14% 36%, rgba(17,20,27,0.032), transparent 18rem) !important;
    }

    .weightlens-landing-shell * {
      box-sizing: border-box !important;
    }

    .weightlens-topnav {
      width: min(100%, 92rem) !important;
      margin: 0 auto !important;
      padding: calc(env(safe-area-inset-top) + 1.1rem) 1.35rem 0 !important;
      display: flex !important;
      align-items: flex-start !important;
      justify-content: space-between !important;
      color: #11141B !important;
    }

    .weightlens-topnav-logo {
      display: flex !important;
      align-items: flex-start !important;
      gap: 0.7rem !important;
    }

    .weightlens-topnav-mark {
      height: 2.25rem !important;
      width: 2.25rem !important;
      border-radius: 999px !important;
      border: 1px solid #11141B !important;
      background: transparent !important;
      color: #11141B !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    .weightlens-topnav-name {
      font-family: 'Satoshi', 'Inter', system-ui, sans-serif !important;
      font-size: 1.8rem !important;
      line-height: 0.9 !important;
      letter-spacing: -0.075em !important;
      font-weight: 760 !important;
      color: #11141B !important;
    }

    .weightlens-topnav-sub {
      margin-top: 0.25rem !important;
      color: #8C8790 !important;
      font-size: 0.63rem !important;
      letter-spacing: 0.22em !important;
      text-transform: uppercase !important;
      font-weight: 700 !important;
    }

    .weightlens-topnav-menu {
      width: 1.8rem !important;
      height: 1.8rem !important;
      border: 0 !important;
      background: transparent !important;
      color: #11141B !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 0.35rem !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 0 !important;
    }

    .weightlens-topnav-menu span {
      display: block !important;
      width: 1.35rem !important;
      height: 1px !important;
      background: #11141B !important;
    }

    .weightlens-landing-copy {
      width: min(100%, 74rem) !important;
      margin: 0 auto !important;
      padding: clamp(7rem, 17vh, 13rem) 1.35rem 2.4rem !important;
      color: #11141B !important;
      text-align: center !important;
    }

    .weightlens-landing-kicker {
      color: #8C8790 !important;
      font-size: 0.72rem !important;
      text-transform: uppercase !important;
      letter-spacing: 0.32em !important;
      font-weight: 700 !important;
      line-height: 1.45 !important;
      text-align: center !important;
    }

    .weightlens-landing-title {
      font-family: 'Satoshi', 'Inter', system-ui, sans-serif !important;
      font-size: clamp(2.8rem, 6.6vw, 6.2rem) !important;
      line-height: 1.05 !important;
      letter-spacing: -0.065em !important;
      font-weight: 760 !important;
      margin: 1.35rem auto 0 !important;
      max-width: 18ch !important;
      color: #11141B !important;
    }

    .weightlens-landing-body {
      color: #777B86 !important;
      font-size: clamp(1rem, 1.5vw, 1.28rem) !important;
      line-height: 1.55 !important;
      margin: 1.35rem auto 0 !important;
      max-width: 42rem !important;
      text-align: center !important;
    }

    .weightlens-landing-features {
      width: min(100%, 64rem) !important;
      display: grid !important;
      grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
      gap: 1.4rem !important;
      margin: clamp(4.4rem, 9vh, 7.5rem) auto 0 !important;
      text-align: center !important;
    }

    .weightlens-landing-feature {
      border: 0 !important;
      background: transparent !important;
      padding: 0 !important;
      color: #11141B !important;
    }

    .weightlens-landing-feature-title {
      font-family: 'Satoshi', 'Inter', system-ui, sans-serif !important;
      font-size: clamp(1.35rem, 2.8vw, 2.7rem) !important;
      line-height: 1 !important;
      letter-spacing: -0.05em !important;
      font-weight: 790 !important;
      color: #11141B !important;
      margin: 0 !important;
    }

    .weightlens-landing-feature-body {
      display: block !important;
      margin: 0.7rem auto 0 !important;
      max-width: 16rem !important;
      color: #7D828D !important;
      font-size: 0.86rem !important;
      line-height: 1.45 !important;
    }

    .weightlens-auth-card,
    html[data-theme="dark"] .weightlens-auth-card,
    html.weightlens-auth-mode .weightlens-auth-card {
      width: min(calc(100% - 2.7rem), 28rem) !important;
      margin: 0 auto clamp(2rem, 7vh, 4rem) !important;
      border-radius: 0 !important;
      padding: 0 !important;
      background: transparent !important;
      border: 0 !important;
      box-shadow: none !important;
      color: #11141B !important;
    }

    .weightlens-auth-card h1,
    html[data-theme="dark"] .weightlens-auth-card h1 {
      font-family: 'Satoshi', 'Inter', system-ui, sans-serif !important;
      font-size: 1.45rem !important;
      line-height: 1.12 !important;
      letter-spacing: -0.045em !important;
      color: #11141B !important;
      font-weight: 740 !important;
      margin: 0 !important;
    }

    .weightlens-auth-card p,
    .weightlens-auth-card .text-mute,
    .weightlens-auth-card .text-sm,
    html[data-theme="dark"] .weightlens-auth-card p,
    html[data-theme="dark"] .weightlens-auth-card .text-mute,
    html[data-theme="dark"] .weightlens-auth-card .text-sm {
      color: #6E7480 !important;
      font-size: 0.92rem !important;
      line-height: 1.5 !important;
    }

    .weightlens-auth-card form {
      width: 100% !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 0.7rem !important;
    }

    .weightlens-auth-card .grid.grid-cols-2,
    html[data-theme="dark"] .weightlens-auth-card .grid.grid-cols-2 {
      width: 100% !important;
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      background: #EBEBE7 !important;
      border: 1px solid rgba(17,20,27,0.055) !important;
      border-radius: 999px !important;
      padding: 0.25rem !important;
      gap: 0.25rem !important;
      margin: 1rem 0 1rem !important;
    }

    .weightlens-auth-card .grid.grid-cols-2 button,
    html[data-theme="dark"] .weightlens-auth-card .grid.grid-cols-2 button {
      width: 100% !important;
      height: 2.55rem !important;
      border-radius: 999px !important;
      background: transparent !important;
      color: #6E7480 !important;
      font-size: 0.9rem !important;
      font-weight: 640 !important;
      white-space: nowrap !important;
      box-shadow: none !important;
    }

    .weightlens-auth-card .grid.grid-cols-2 button.bg-surface,
    .weightlens-auth-card .bg-surface,
    html[data-theme="dark"] .weightlens-auth-card .grid.grid-cols-2 button.bg-surface,
    html[data-theme="dark"] .weightlens-auth-card .bg-surface {
      background: #FFFFFF !important;
      color: #11141B !important;
      box-shadow: 0 10px 22px -18px rgba(17,20,27,0.28) !important;
    }

    .weightlens-auth-card input,
    html[data-theme="dark"] .weightlens-auth-card input {
      width: 100% !important;
      height: 3.2rem !important;
      border-radius: 999px !important;
      background: #FFFFFF !important;
      border: 1px solid rgba(17,20,27,0.08) !important;
      color: #11141B !important;
      padding: 0 1.15rem !important;
      font-size: 0.98rem !important;
      box-shadow: 0 12px 32px -30px rgba(17,20,27,0.25) !important;
    }

    .weightlens-auth-card input::placeholder {
      color: #8F949D !important;
    }

    .weightlens-auth-card form button,
    .weightlens-auth-card button.bg-fg,
    html[data-theme="dark"] .weightlens-auth-card form button,
    html[data-theme="dark"] .weightlens-auth-card button.bg-fg {
      width: 100% !important;
      height: 3.2rem !important;
      border-radius: 999px !important;
      background: #11141B !important;
      color: #FFFFFF !important;
      font-weight: 700 !important;
      font-size: 0.96rem !important;
      border: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      box-shadow: 0 14px 34px -22px rgba(17,20,27,0.42) !important;
    }

    .weightlens-auth-card > .mt-4 {
      margin-top: 1rem !important;
      text-align: center !important;
    }

    .weightlens-auth-card > .mt-4 button,
    html[data-theme="dark"] .weightlens-auth-card > .mt-4 button {
      background: transparent !important;
      color: #6E7480 !important;
      width: auto !important;
      height: auto !important;
      border: 0 !important;
      font-size: 0.9rem !important;
      box-shadow: none !important;
    }

    @media (max-width: 640px) {
      .weightlens-topnav {
        padding-left: 1.05rem !important;
        padding-right: 1.05rem !important;
      }

      .weightlens-topnav-mark {
        height: 2rem !important;
        width: 2rem !important;
      }

      .weightlens-topnav-name {
        font-size: 1.45rem !important;
      }

      .weightlens-landing-copy {
        padding: clamp(5.8rem, 14vh, 8rem) 1.05rem 1.9rem !important;
      }

      .weightlens-landing-title {
        font-size: clamp(2.45rem, 12vw, 3.35rem) !important;
        max-width: 11.5ch !important;
      }

      .weightlens-landing-body {
        font-size: 0.96rem !important;
        max-width: 21rem !important;
      }

      .weightlens-landing-features {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 1.35rem 1rem !important;
        margin-top: 3rem !important;
      }

      .weightlens-auth-card {
        width: calc(100% - 2.1rem) !important;
      }
    }
  `;
  document.head.appendChild(style);

  function forceLight(el){
    if (!el) return;
    el.style.setProperty('background', '#F7F7F4', 'important');
    el.style.setProperty('background-color', '#F7F7F4', 'important');
    el.style.setProperty('color', '#11141B', 'important');
  }

  function setTextColor(el, color){
    if (!el) return;
    el.style.setProperty('color', color, 'important');
  }

  function enhanceLandingScreen(){
    const root = document.getElementById('root');
    if (!root) return;

    const shell = root.querySelector('.min-h-screen.flex.items-center.justify-center');
    if (!shell) return;

    const h1 = shell.querySelector('h1');
    const text = h1 ? h1.textContent || '' : '';
    const isAuthScreen = text.includes('Sign in') || text.includes('Create your account') || text.includes('Reset your password');
    if (!isAuthScreen) return;

    document.documentElement.classList.add('weightlens-auth-mode');
    document.documentElement.setAttribute('data-theme', 'light');
    forceLight(document.documentElement);
    forceLight(document.body);
    forceLight(root);
    forceLight(shell);
    shell.classList.add('weightlens-landing-shell');

    const authCard = Array.from(shell.children).find(el => el.classList && el.classList.contains('max-w-md') && !el.classList.contains('weightlens-landing-copy'));
    if (authCard) {
      authCard.classList.add('weightlens-auth-card');
      authCard.style.setProperty('background', 'transparent', 'important');
      authCard.style.setProperty('background-color', 'transparent', 'important');
      authCard.style.setProperty('box-shadow', 'none', 'important');
      authCard.style.setProperty('border', '0', 'important');
      authCard.style.setProperty('color', '#11141B', 'important');
      authCard.querySelectorAll('h1,h2,h3,div,span,label').forEach(node => setTextColor(node, '#11141B'));
      authCard.querySelectorAll('p,.text-mute,.text-sm').forEach(node => setTextColor(node, '#6E7480'));
    }

    if (!shell.querySelector('.weightlens-topnav')) {
      const nav = document.createElement('div');
      nav.className = 'weightlens-topnav';
      nav.innerHTML = `
        <div class="weightlens-topnav-logo">
          <div class="weightlens-topnav-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18 9 12l4 4 7-8"/></svg>
          </div>
          <div>
            <div class="weightlens-topnav-name">WeightLens</div>
            <div class="weightlens-topnav-sub">Studio</div>
          </div>
        </div>
        <button class="weightlens-topnav-menu" aria-label="Menu"><span></span><span></span></button>
      `;
      shell.insertBefore(nav, shell.firstChild);
    }

    if (!shell.querySelector('.weightlens-landing-copy')) {
      const panel = document.createElement('section');
      panel.className = 'weightlens-landing-copy';
      panel.innerHTML = `
        <p class="weightlens-landing-kicker">Weight tracking, finally calm</p>
        <h1 class="weightlens-landing-title">Does your scale tell the real story?</h1>
        <p class="weightlens-landing-body">WeightLens turns daily weigh-ins into a clean trend dashboard — so you can see direction, pace, and progress without overreacting to one morning.</p>
        <div class="weightlens-landing-features">
          <div class="weightlens-landing-feature"><div class="weightlens-landing-feature-title">7-day</div><div class="weightlens-landing-feature-body">average trend, not daily noise</div></div>
          <div class="weightlens-landing-feature"><div class="weightlens-landing-feature-title">Goals</div><div class="weightlens-landing-feature-body">pace, ETA, and remaining progress</div></div>
          <div class="weightlens-landing-feature"><div class="weightlens-landing-feature-title">Insights</div><div class="weightlens-landing-feature-body">plain-English fluctuation coaching</div></div>
          <div class="weightlens-landing-feature"><div class="weightlens-landing-feature-title">Cloud</div><div class="weightlens-landing-feature-body">your dashboard across devices</div></div>
        </div>
      `;
      if (authCard) shell.insertBefore(panel, authCard);
      else shell.appendChild(panel);
    }

    shell.querySelectorAll('.weightlens-topnav, .weightlens-landing-copy, .weightlens-landing-title, .weightlens-landing-feature-title').forEach(node => setTextColor(node, '#11141B'));
    shell.querySelectorAll('.weightlens-landing-body, .weightlens-landing-feature-body, .weightlens-landing-kicker, .weightlens-topnav-sub').forEach(node => setTextColor(node, '#7D828D'));
  }

  const observer = new MutationObserver(() => enhanceLandingScreen());
  window.addEventListener('load', () => {
    enhanceLandingScreen();
    const root = document.getElementById('root');
    if (root) observer.observe(root, { childList: true, subtree: true, attributes: true });
  });
})();
