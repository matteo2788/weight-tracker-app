// top-hero-spacing-fix.js — pulls the dashboard meta/action row up under the nav
(function(){
  function inject(){
    if(document.getElementById('wl-top-hero-spacing-fix')) return;
    const style = document.createElement('style');
    style.id = 'wl-top-hero-spacing-fix';
    style.textContent = `
      .wl-page {
        padding-top: clamp(1.8rem, 3.2vw, 3.25rem) !important;
      }

      .wl-page > .grid.grid-cols-3:first-child {
        margin-top: 0 !important;
        margin-bottom: clamp(3.2rem, 4.9vw, 5.75rem) !important;
        transform: translateY(-0.35rem) !important;
      }

      @media (min-width: 1280px) {
        .wl-page {
          padding-top: clamp(2rem, 3.15vw, 3.75rem) !important;
        }

        .wl-page > .grid.grid-cols-3:first-child {
          margin-bottom: clamp(4rem, 5.45vw, 6.5rem) !important;
          transform: translateY(-0.65rem) !important;
        }

        .wl-hero-title {
          padding-top: 0 !important;
        }
      }

      @media (max-width: 900px) {
        .wl-page {
          padding-top: 2.05rem !important;
        }

        .wl-page > .grid.grid-cols-3:first-child {
          margin-bottom: 4rem !important;
          transform: translateY(-0.35rem) !important;
          gap: 1.25rem 1rem !important;
        }
      }

      @media (max-width: 430px) {
        .wl-page {
          padding-top: 1.75rem !important;
        }

        .wl-page > .grid.grid-cols-3:first-child {
          margin-bottom: 3.6rem !important;
          transform: translateY(-0.25rem) !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
  inject();
  window.addEventListener('load', inject);
  setTimeout(inject, 250);
})();
