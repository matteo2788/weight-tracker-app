// pwa-register.js — service worker + safe mobile-only polish
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
