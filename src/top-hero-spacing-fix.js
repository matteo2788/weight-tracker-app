// top-hero-spacing-fix.js — force dashboard meta/actions directly under the nav
(function(){
  function inject(){
    let style = document.getElementById('wl-top-hero-spacing-fix');
    if(!style){
      style = document.createElement('style');
      style.id = 'wl-top-hero-spacing-fix';
      document.head.appendChild(style);
    }

    style.textContent = `
      /* Kill the giant empty gap between nav and hero controls */
      .wl-page {
        padding-top: 0.9rem !important;
      }

      .wl-page > .grid.grid-cols-3:first-child {
        margin-top: 0 !important;
        padding-top: 0 !important;
        margin-bottom: clamp(2.2rem, 3.25vw, 3.8rem) !important;
        transform: translateY(-1.75rem) !important;
        position: relative !important;
        z-index: 3 !important;
      }

      .wl-page > .grid.grid-cols-3:first-child .wl-kicker,
      .wl-page > .grid.grid-cols-3:first-child .wl-hero-meta {
        line-height: 1.2 !important;
        margin: 0 !important;
      }

      .wl-page > .grid.grid-cols-3:first-child .wl-btn {
        transform: none !important;
      }

      .wl-hero-title {
        margin-top: 0 !important;
        padding-top: 0 !important;
      }

      @media (min-width: 1280px) {
        .wl-page {
          padding-top: 1.15rem !important;
        }

        .wl-page > .grid.grid-cols-3:first-child {
          transform: translateY(-2.35rem) !important;
          margin-bottom: clamp(2.6rem, 3.7vw, 4.35rem) !important;
        }

        .wl-hero-title {
          padding-top: 0 !important;
          margin-top: 0 !important;
        }
      }

      @media (min-width: 1600px) {
        .wl-page {
          padding-top: 0.75rem !important;
        }

        .wl-page > .grid.grid-cols-3:first-child {
          transform: translateY(-2.85rem) !important;
          margin-bottom: 3.35rem !important;
        }
      }

      @media (max-width: 900px) {
        .wl-page {
          padding-top: 1.05rem !important;
        }

        .wl-page > .grid.grid-cols-3:first-child {
          transform: translateY(-1.2rem) !important;
          margin-bottom: 2.85rem !important;
          gap: 1.05rem 1rem !important;
        }
      }

      @media (max-width: 430px) {
        .wl-page {
          padding-top: 0.75rem !important;
        }

        .wl-page > .grid.grid-cols-3:first-child {
          transform: translateY(-1.05rem) !important;
          margin-bottom: 2.55rem !important;
        }
      }
    `;
  }

  inject();
  window.addEventListener('load', inject);
  setTimeout(inject, 50);
  setTimeout(inject, 250);
  setTimeout(inject, 1000);
  new MutationObserver(inject).observe(document.documentElement, { childList:true, subtree:true });
})();
