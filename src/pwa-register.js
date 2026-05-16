// pwa-register.js — service worker + safe mobile-only polish
(function registerWeightLensPWA(){
  function setMeta(name, content){
    let tag = document.querySelector(`meta[name="${name}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', name);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  }

  function forceLightPwaChrome(){
    setMeta('theme-color', '#FAFAF7');
    setMeta('msapplication-TileColor', '#FAFAF7');

    const appleStatus = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (appleStatus) appleStatus.setAttribute('content', 'default');
  }

  forceLightPwaChrome();
  window.addEventListener('pageshow', forceLightPwaChrome);
  document.addEventListener('visibilitychange', forceLightPwaChrome);

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
    @keyframes fadeUp {
      from {
        opacity: 0;
        transform: translateY(18px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      [class*="animate-"] {
        animation: none !important;
      }
    }

    html,
    body,
    #root {
      width: 100% !important;
      min-width: 100% !important;
      overflow-x: hidden !important;
    }

    body {
      margin: 0 !important;
      overscroll-behavior-x: none !important;
      -webkit-text-size-adjust: 100% !important;
    }

    @media (min-width: 1024px) {
      .hidden.lg\\:block.sticky.top-0.h-screen {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        bottom: 0 !important;
        width: 240px !important;
        height: 100dvh !important;
        z-index: 30 !important;
      }

      .hidden.lg\\:block.sticky.top-0.h-screen + .flex-1 {
        margin-left: 240px !important;
      }

      .hidden.lg\\:block.sticky.top-0.h-screen aside {
        height: 100dvh !important;
        max-height: 100dvh !important;
        overflow: hidden !important;
      }
    }

    .hidden.lg\\:block.sticky.top-0.h-screen aside nav,
    .lg\\:hidden.fixed.inset-0.z-40.flex aside nav {
      overflow-y: auto !important;
      overscroll-behavior: contain !important;
      -webkit-overflow-scrolling: touch !important;
    }

    .lg\\:hidden.fixed.inset-0.z-40.flex {
      position: fixed !important;
      inset: 0 !important;
      height: 100dvh !important;
      max-height: 100dvh !important;
      overflow: hidden !important;
      overscroll-behavior: contain !important;
      z-index: 999 !important;
    }

    .lg\\:hidden.fixed.inset-0.z-40.flex > .relative.bg-surface.h-full {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      bottom: 0 !important;
      height: 100dvh !important;
      max-height: 100dvh !important;
      overflow: hidden !important;
    }

    .lg\\:hidden.fixed.inset-0.z-40.flex aside {
      height: 100dvh !important;
      max-height: 100dvh !important;
      overflow: hidden !important;
    }

    .lg\\:hidden.fixed.inset-0.z-40.flex aside > div:first-child {
      padding-top: calc(env(safe-area-inset-top) + 1.25rem) !important;
    }

    @supports (padding-top: constant(safe-area-inset-top)) {
      .lg\\:hidden.fixed.inset-0.z-40.flex aside > div:first-child {
        padding-top: calc(constant(safe-area-inset-top) + 1.25rem) !important;
      }
    }

    body:has(.lg\\:hidden.fixed.inset-0.z-40.flex) {
      overflow: hidden !important;
      touch-action: none !important;
    }

    @media (max-width: 640px) {
      html,
      body,
      #root {
        overflow-x: hidden !important;
      }

      input,
      select,
      textarea,
      button {
        font-size: 16px !important;
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
  `;

  document.head.appendChild(style);
})();
