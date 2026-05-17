// top-hero-spacing-fix.js — safe dashboard spacing adjustment only
(function(){
  function inject(){
    if(document.getElementById('wl-top-hero-spacing-fix')) return;

    const style = document.createElement('style');
    style.id = 'wl-top-hero-spacing-fix';
    style.textContent = `
      /* Safe spacing fix: move dashboard meta/actions upward without JS loops */
      .wl-page {
        padding-top: clamp(1rem, 2vw, 2rem) !important;
      }

      .wl-page > .grid.grid-cols-3:first-child {
        margin-top: 0 !important;
        padding-top: 0 !important;
        margin-bottom: clamp(2.5rem, 4vw, 4.75rem) !important;
        position: relative !important;
        top: -1.15rem !important;
        z-index: 2 !important;
      }

      .wl-page > .grid.grid-cols-3:first-child .wl-kicker,
      .wl-page > .grid.grid-cols-3:first-child .wl-hero-meta {
        line-height: 1.2 !important;
        margin: 0 !important;
      }

      .wl-hero-title {
        padding-top: 0 !important;
      }

      @media (min-width: 1280px) {
        .wl-page {
          padding-top: clamp(1.1rem, 2vw, 2.2rem) !important;
        }

        .wl-page > .grid.grid-cols-3:first-child {
          top: -1.7rem !important;
          margin-bottom: clamp(2.9rem, 4.35vw, 5.25rem) !important;
        }
      }

      @media (min-width: 1600px) {
        .wl-page > .grid.grid-cols-3:first-child {
          top: -2.15rem !important;
          margin-bottom: 4.35rem !important;
        }
      }

      @media (max-width: 900px) {
        .wl-page {
          padding-top: 1rem !important;
        }

        .wl-page > .grid.grid-cols-3:first-child {
          top: -0.85rem !important;
          margin-bottom: 3rem !important;
          gap: 1.1rem 1rem !important;
        }
      }

      @media (max-width: 430px) {
        .wl-page {
          padding-top: 0.85rem !important;
        }

        .wl-page > .grid.grid-cols-3:first-child {
          top: -0.7rem !important;
          margin-bottom: 2.75rem !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject, { once:true });
  } else {
    inject();
  }
  window.addEventListener('load', inject, { once:true });
})();
