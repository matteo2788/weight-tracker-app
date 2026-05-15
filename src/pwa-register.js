// pwa-register.js — registers the service worker for installable app behavior
(function registerWeightLensPWA(){
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('/sw.js').catch(function(error){
        console.warn('WeightLens service worker registration failed:', error);
      });
    });
  }

  // Mobile PWA safe-area + iOS form polish.
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
  `;
  document.head.appendChild(style);
})();
