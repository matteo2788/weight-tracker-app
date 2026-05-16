// functional-log-polish.js — safer mobile layout for Log Weight / entry editor
(function(){
  function inject(){
    if (document.getElementById('wl-log-polish-style')) return;
    const style = document.createElement('style');
    style.id = 'wl-log-polish-style';
    style.textContent = `
      @media (max-width: 900px){
        /* Log Weight page: make the filter bar and rows breathe on phones */
        main .fadein > .flex.flex-col.md\:flex-row.md\:items-end.justify-between.gap-3 {
          gap: 1.4rem !important;
          margin-bottom: 1.2rem !important;
        }
        main .fadein > .flex.flex-col.md\:flex-row.md\:items-end.justify-between.gap-3 h1 {
          font-size: clamp(2.35rem, 12vw, 3.75rem) !important;
          line-height: .94 !important;
          letter-spacing: -.07em !important;
        }
        main .fadein > .flex.flex-col.md\:flex-row.md\:items-end.justify-between.gap-3 .text-mute {
          font-size: 1rem !important;
          line-height: 1.55 !important;
        }
        main .fadein > .flex.flex-col.md\:flex-row.md\:items-end.justify-between.gap-3 .flex.gap-2 {
          width: 100% !important;
        }
        main .fadein > .flex.flex-col.md\:flex-row.md\:items-end.justify-between.gap-3 .flex.gap-2 button {
          width: 100% !important;
          min-height: 52px !important;
          border-radius: 999px !important;
        }

        /* Log page filter toolbar */
        main .fadein .card, main .fadein .bg-surface { overflow: visible !important; }
        main .fadein .flex.flex-wrap.gap-2.items-center.p-4.border-b.hairline {
          display: grid !important;
          grid-template-columns: 1fr !important;
          gap: .85rem !important;
          padding: 1rem 0 !important;
          border-bottom: 1px solid rgba(17,17,15,.12) !important;
        }
        main .fadein .flex.flex-wrap.gap-2.items-center.p-4.border-b.hairline > * {
          width: 100% !important;
          min-width: 0 !important;
        }
        main .fadein .flex.flex-wrap.gap-2.items-center.p-4.border-b.hairline input,
        main .fadein .flex.flex-wrap.gap-2.items-center.p-4.border-b.hairline select {
          height: 48px !important;
          border-radius: 0 !important;
          background: transparent !important;
          border: 0 !important;
          border-bottom: 1px solid rgba(17,17,15,.14) !important;
          padding-left: .25rem !important;
          font-size: 1rem !important;
        }
        main .fadein .flex.flex-wrap.gap-2.items-center.p-4.border-b.hairline svg {
          display: none !important;
        }

        /* Entry rows become clean stacked cards */
        main .fadein ul.divide-y > li.grid.grid-cols-12 {
          display: grid !important;
          grid-template-columns: 1fr auto !important;
          gap: .55rem 1rem !important;
          padding: 1.1rem 0 !important;
          border-bottom: 1px solid rgba(17,17,15,.12) !important;
        }
        main .fadein ul.divide-y > li.grid.grid-cols-12 > div:nth-child(1) {
          grid-column: 1 / 2 !important;
        }
        main .fadein ul.divide-y > li.grid.grid-cols-12 > div:nth-child(2) {
          grid-column: 2 / 3 !important;
          text-align: right !important;
        }
        main .fadein ul.divide-y > li.grid.grid-cols-12 > div:nth-child(3) {
          grid-column: 1 / 3 !important;
          margin-top: .35rem !important;
        }
        main .fadein ul.divide-y > li.grid.grid-cols-12 > div:nth-child(4) {
          grid-column: 1 / 3 !important;
          justify-content: flex-start !important;
          opacity: 1 !important;
          margin-top: .45rem !important;
        }
        main .fadein ul.divide-y > li.grid.grid-cols-12 .num {
          font-size: 1.35rem !important;
        }

        /* Modal/editor readability */
        [role='dialog'], .fixed.inset-0 {
          -webkit-overflow-scrolling: touch !important;
        }
        [role='dialog'] .grid.grid-cols-2, .fixed .grid.grid-cols-2 {
          grid-template-columns: 1fr !important;
          gap: 1.1rem !important;
        }
        [role='dialog'] input, [role='dialog'] select, [role='dialog'] textarea,
        .fixed input, .fixed select, .fixed textarea {
          font-size: 16px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
  inject(); window.addEventListener('load', inject); setTimeout(inject,100); setTimeout(inject,700);
})();
