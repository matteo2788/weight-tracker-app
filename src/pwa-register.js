// pwa-register.js — registers the service worker for installable app behavior
(function registerWeightLensPWA(){
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('/sw.js').catch(function(error){
        console.warn('WeightLens service worker registration failed:', error);
      });
    });
  }

  // Mobile PWA safe-area polish.
  // This specifically fixes the slide-out drawer header sitting underneath the iPhone status bar.
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
    }
  `;
  document.head.appendChild(style);
})();
