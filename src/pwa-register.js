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
    }

    html:has(.weightlens-landing-shell),
    html:has(.weightlens-landing-shell) body,
    html:has(.weightlens-landing-shell) #root {
      background: #F7F7F4 !important;
      color: #11141B !important;
      color-scheme: light !important;
    }

    .weightlens-landing-shell,
    html[data-theme="dark"] .weightlens-landing-shell {
      min-height: 100vh !important;
      width: 100% !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: stretch !important;
      justify-content: flex-start !important;
      padding: 0 !important;
      background:
        radial-gradient(circle at 86% 16%, rgba(17,20,27,0.045), transparent 18rem),
        radial-gradient(circle at 14% 35%, rgba(17,20,27,0.03), transparent 16rem),
        #F7F7F4 !important;
      color: #11141B !important;
      overflow-x: hidden !important;
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
      margin-top: 0.1rem !important;
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
      margin-left: 0.15rem !important;
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
      animation: weightlensFadeIn 340ms ease both;
    }

    .weightlens-landing-brand,
    .weightlens-landing-mark,
    .weightlens-landing-wordmark {
      display: none !important;
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
      border-radius: 0 !important;
      padding: 0 !important;
      display: block !important;
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
    html[data-theme="dark"] .weightlens-auth-card {
      width: min(calc(100% - 2.7rem), 27rem) !important;
      margin: 0 auto clamp(2rem, 7vh, 4rem) !important;
      border-radius: 1.5rem !important;
      padding: 1.35rem !important;
      background: rgba(255,255,255,0.78) !important;
      border: 1px solid rgba(17,20,27,0.08) !important;
      box-shadow: 0 18px 50px -30px rgba(17,20,27,0.18) !important;
      color: #11141B !important;
      backdrop-filter: blur(14px) saturate(120%) !important;
      -webkit-backdrop-filter: blur(14px) saturate(120%) !important;
    }

    .weightlens-auth-card h1 {
      font-family: 'Satoshi', 'Inter', system-ui, sans-serif !important;
      font-size: 1.2rem !important;
      line-height: 1.15 !important;
      letter-spacing: -0.04em !important;
      color: #11141B !important;
      font-weight: 720 !important;
      margin: 0 !important;
    }

    .weightlens-auth-card p,
    .weightlens-auth-card .text-mute,
    .weightlens-auth-card .text-sm {
      color: #6E7480 !important;
      font-size: 0.9rem !important;
      line-height: 1.5 !important;
    }

    .weightlens-auth-card form {
      width: 100% !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 0.72rem !important;
    }

    .weightlens-auth-card .grid.grid-cols-2 {
      width: 100% !important;
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      background: #F1F1ED !important;
      border: 1px solid rgba(17,20,27,0.06) !important;
      border-radius: 1rem !important;
      padding: 0.3rem !important;
      gap: 0.3rem !important;
      margin: 1rem 0 1rem !important;
    }

    .weightlens-auth-card .grid.grid-cols-2 button {
      width: 100% !important;
      min-width: 0 !important;
      height: 2.45rem !important;
      border-radius: 0.8rem !important;
      background: transparent !important;
      color: #6E7480 !important;
      font-size: 0.88rem !important;
      font-weight: 620 !important;
      white-space: nowrap !important;
      padding: 0 0.5rem !important;
      line-height: 1 !important;
    }

    .weightlens-auth-card .grid.grid-cols-2 button.bg-surface,
    .weightlens-auth-card .bg-surface {
      background: #FFFFFF !important;
      color: #11141B !important;
      box-shadow: 0 8px 18px -14px rgba(17,20,27,0.18) !important;
    }

    .weightlens-auth-card input,
    html[data-theme="dark"] .weightlens-auth-card input {
      width: 100% !important;
      max-width: 100% !important;
      height: 3rem !important;
      border-radius: 1rem !important;
      background: #F5F5F2 !important;
      border: 1px solid rgba(17,20,27,0.07) !important;
      color: #11141B !important;
      padding: 0 1rem !important;
      font-size: 0.96rem !important;
      letter-spacing: 0 !important;
    }

    .weightlens-auth-card input::placeholder {
      color: #8F949D !important;
      letter-spacing: 0 !important;
    }

    .weightlens-auth-card form button,
    .weightlens-auth-card button.bg-fg,
    html[data-theme="dark"] .weightlens-auth-card form button,
    html[data-theme="dark"] .weightlens-auth-card button.bg-fg {
      width: 100% !important;
      height: 3rem !important;
      border-radius: 1rem !important;
      background: #11141B !important;
      color: #FFFFFF !important;
      font-weight: 680 !important;
      font-size: 0.95rem !important;
      letter-spacing: -0.01em !important;
      border: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      box-shadow: 0 10px 24px -16px rgba(17,20,27,0.35) !important;
    }

    .weightlens-auth-card > .mt-4 {
      margin-top: 1rem !important;
      text-align: center !important;
    }

    .weightlens-auth-card > .mt-4 button {
      background: transparent !important;
      color: #6E7480 !important;
      width: auto !important;
      height: auto !important;
      border: 0 !important;
      font-size: 0.9rem !important;
      box-shadow: none !important;
    }

    @keyframes weightlensFadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
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
        line-height: 1.02 !important;
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

      .weightlens-landing-feature-title {
        font-size: clamp(1.35rem, 7vw, 2rem) !important;
      }

      .weightlens-landing-feature-body {
        font-size: 0.76rem !important;
        max-width: 9.5rem !important;
      }

      .weightlens-auth-card {
        width: calc(100% - 2.1rem) !important;
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
    document.documentElement.classList.add('weightlens-auth-mode');
    document.documentElement.style.background = '#F7F7F4';
    document.body.style.background = '#F7F7F4';
    document.body.style.color = '#11141B';

    const authCard = Array.from(shell.children).find(el => el.classList && el.classList.contains('max-w-md') && !el.classList.contains('weightlens-landing-copy'));
    if (authCard) authCard.classList.add('weightlens-auth-card');

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

    if (shell.querySelector('.weightlens-landing-copy')) return;

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

    const auth = shell.querySelector('.weightlens-auth-card');
    if (auth) shell.insertBefore(panel, auth);
    else shell.appendChild(panel);
  }

  const observer = new MutationObserver(() => enhanceLandingScreen());
  window.addEventListener('load', () => {
    enhanceLandingScreen();
    const root = document.getElementById('root');
    if (root) observer.observe(root, { childList: true, subtree: true });
  });
})();
