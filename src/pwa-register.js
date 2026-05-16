// WeightLens PWA + final visual polish layer
(function injectHeroPolish(){
  if (document.getElementById('wl-final-hero-polish')) return;

  const style = document.createElement('style');
  style.id = 'wl-final-hero-polish';
  style.textContent = `
    /* Final hero stage polish — loaded last so it wins */
    .wl-hero-line {
      display: block !important;
      white-space: nowrap !important;
    }

    @media (min-width: 1280px) {
      .wl-page > .grid.grid-cols-3:first-child {
        margin-bottom: clamp(5.8rem, 6.8vw, 8rem) !important;
      }

      .wl-hero-title {
        position: relative !important;
        isolation: isolate !important;
        font-size: clamp(5.6rem, 6.7vw, 9.25rem) !important;
        line-height: 0.94 !important;
        letter-spacing: -0.038em !important;
        max-width: 13.5ch !important;
        margin: 0 auto 2.65rem !important;
        padding-top: clamp(1.25rem, 2vw, 2.5rem) !important;
        text-align: center !important;
      }

      .wl-hero-title::before {
        content: '' !important;
        position: absolute !important;
        left: 50% !important;
        top: 50% !important;
        width: min(72vw, 980px) !important;
        height: min(28vw, 360px) !important;
        transform: translate(-50%, -50%) !important;
        border-radius: 999px !important;
        background: radial-gradient(ellipse at center, rgba(17,17,15,0.045), rgba(17,17,15,0.018) 45%, transparent 72%) !important;
        z-index: -1 !important;
        pointer-events: none !important;
      }

      .wl-hero-meta {
        margin-top: 0 !important;
        margin-bottom: 0.85rem !important;
        letter-spacing: 0.32em !important;
        opacity: 0.82 !important;
      }

      .wl-big-number {
        font-size: clamp(4.1rem, 5.2vw, 6.8rem) !important;
        line-height: 0.96 !important;
        letter-spacing: -0.042em !important;
        margin-top: 0.45rem !important;
      }

      .wl-unit {
        font-size: 0.92rem !important;
        letter-spacing: 0.26em !important;
      }

      .wl-subtle {
        margin-top: 1rem !important;
        font-size: 0.98rem !important;
        color: rgba(104,103,97,0.9) !important;
      }

      .wl-metrics {
        margin-top: clamp(6.8rem, 7.8vw, 9.25rem) !important;
      }
    }

    @media (max-width: 900px) {
      .wl-page > .grid.grid-cols-3:first-child {
        margin-bottom: 5.25rem !important;
      }

      .wl-hero-title {
        position: relative !important;
        isolation: auto !important;
        font-size: clamp(3rem, 10.6vw, 4.15rem) !important;
        line-height: 1.08 !important;
        letter-spacing: -0.035em !important;
        max-width: none !important;
        width: 100% !important;
        margin: 0 0 2.4rem !important;
        padding-top: 1.7rem !important;
      }

      .wl-hero-title::before,
      .wl-hero-title::after {
        content: none !important;
        display: none !important;
      }

      .wl-hero-line {
        display: block !important;
        white-space: nowrap !important;
      }

      .wl-hero-meta {
        margin-bottom: 0.7rem !important;
        letter-spacing: 0.32em !important;
      }

      .wl-big-number {
        font-size: clamp(3.3rem, 15vw, 4.7rem) !important;
        line-height: 1 !important;
        letter-spacing: -0.045em !important;
        margin-top: 0.25rem !important;
      }

      .wl-unit {
        font-size: 0.78rem !important;
        letter-spacing: 0.24em !important;
      }

      .wl-subtle {
        font-size: 0.98rem !important;
        line-height: 1.55 !important;
        margin-top: 1rem !important;
      }

      .wl-metrics {
        margin-top: 5.4rem !important;
      }

      /* Mobile dashboard trend section */
      .wl-section { overflow: visible !important; }
      .wl-section .wl-section-head { display: block !important; margin-bottom: 1.25rem !important; }
      .wl-section .wl-section-head .wl-title { font-size: clamp(2.05rem, 9vw, 3rem) !important; line-height: 1.03 !important; letter-spacing: -0.055em !important; max-width: 12ch !important; }
      .wl-section .wl-tabs { display: flex !important; gap: 1.1rem !important; margin-top: 1.4rem !important; overflow-x: auto !important; white-space: nowrap !important; padding-bottom: 0.45rem !important; }
      .wl-section .wl-tabs button { flex: 0 0 auto !important; font-size: 0.72rem !important; letter-spacing: 0.23em !important; }
      .wl-section .recharts-responsive-container, .wl-section .recharts-wrapper, .wl-section .recharts-surface { width: 100% !important; }
      .wl-section .recharts-responsive-container { height: 245px !important; min-height: 245px !important; display: block !important; }
      .wl-section .recharts-wrapper { height: 245px !important; min-height: 245px !important; display: block !important; }
      .wl-section .h-\[340px\] { height: 245px !important; min-height: 245px !important; display: block !important; margin-top: 1.25rem !important; overflow: visible !important; }
      .wl-section .h-72 { height: 245px !important; min-height: 245px !important; }
      .wl-section > .flex.justify-between.text-xs { display: grid !important; grid-template-columns: 1fr !important; gap: 0.5rem !important; margin-top: 1.05rem !important; font-size: 0.78rem !important; line-height: 1.45 !important; }
      .wl-section > .flex.justify-between.text-xs span { display: block !important; width: 100% !important; }
      .wl-section.wl-grid-2 { display: grid !important; grid-template-columns: 1fr !important; gap: 3.25rem !important; margin-top: 4.75rem !important; }
      .wl-section.wl-grid-2 .wl-note { font-size: clamp(1.35rem, 5.8vw, 1.85rem) !important; line-height: 1.18 !important; letter-spacing: -0.04em !important; }
      .wl-section.wl-grid-2 .wl-rule { border-top: 1px solid rgba(17,17,15,0.12) !important; padding-top: 1.6rem !important; }
      .wl-section.wl-grid-2 .wl-rule > .flex.justify-between { display: block !important; margin-bottom: 1.4rem !important; }
      .wl-section.wl-grid-2 .wl-rule > .flex.justify-between > .wl-kicker, .wl-section.wl-grid-2 .wl-rule > .flex.justify-between > div + div { margin-top: 0.75rem !important; }
      .wl-section.wl-grid-2 .wl-rule .grid.grid-cols-2 { display: grid !important; grid-template-columns: 1fr !important; gap: 1.45rem !important; }
      .wl-section.wl-grid-2 .wl-form-line { font-size: 1.15rem !important; height: 46px !important; }
      .wl-section.wl-grid-2 .wl-btn { width: 100% !important; height: 52px !important; margin-top: 1.4rem !important; }
    }

    @media (max-width: 430px) {
      .wl-hero-title { font-size: clamp(2.78rem, 9.6vw, 3.55rem) !important; max-width: none !important; line-height: 1.08 !important; }
      .wl-big-number { font-size: clamp(3.1rem, 13.5vw, 4.15rem) !important; }
      .wl-section .wl-section-head .wl-title { font-size: clamp(1.85rem, 8.2vw, 2.55rem) !important; }
      .wl-section .recharts-responsive-container, .wl-section .recharts-wrapper, .wl-section .h-\[340px\], .wl-section .h-72 { height: 230px !important; min-height: 230px !important; }
    }

    @media (max-width: 380px) {
      .wl-hero-title { font-size: clamp(2.45rem, 9.2vw, 3.15rem) !important; }
      .wl-section .wl-section-head .wl-title { font-size: clamp(1.7rem, 7.8vw, 2.28rem) !important; }
      .wl-section .recharts-responsive-container, .wl-section .recharts-wrapper, .wl-section .h-\[340px\], .wl-section .h-72 { height: 215px !important; min-height: 215px !important; }
    }
  `;
  document.head.appendChild(style);
})();

(function forceHeroTwoLines(){
  const lineSets = {
    'Your weight is holding steady.': ['Your weight is', 'holding steady.'],
    'Your trend is moving down.': ['Your trend is', 'moving down.'],
    'Your trend is moving up.': ['Your trend is', 'moving up.'],
    'Your weight is being tracked.': ['Your weight is', 'being tracked.'],
    'Start logging to reveal your real trend.': ['Start logging', 'to reveal your trend.']
  };

  function apply(){
    const el = document.querySelector('.wl-hero-title');
    if (!el) return;
    const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    const lines = lineSets[text];
    if (!lines) return;
    const current = Array.from(el.querySelectorAll('.wl-hero-line')).map(x => x.textContent.trim()).join(' ');
    if (current === lines.join(' ')) return;
    el.innerHTML = lines.map(line => `<span class="wl-hero-line">${line}</span>`).join('');
  }

  apply();
  window.addEventListener('load', apply);
  setTimeout(apply, 100);
  setTimeout(apply, 500);
  setTimeout(apply, 1500);
  const observer = new MutationObserver(() => apply());
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();

(function installFunctionalBackfill(){
  const MONTHS = {
    jan:1,january:1,feb:2,february:2,mar:3,march:3,apr:4,april:4,may:5,jun:6,june:6,
    jul:7,july:7,aug:8,august:8,sep:9,sept:9,september:9,oct:10,october:10,nov:11,november:11,dec:12,december:12
  };
  const e = React.createElement;
  const todayISO = () => new Date().toISOString().slice(0,10);
  const currentYear = () => Number(todayISO().slice(0,4));
  const pad = (x) => String(x).padStart(2,'0');
  const unitOf = (state) => state?.settings?.unit || 'lbs';
  const shortDate = (d) => {
    try { return new Date(d + 'T00:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}); }
    catch(err){ return d || '—'; }
  };

  function validISO(y,m,d){
    const date = new Date(`${y}-${pad(m)}-${pad(d)}T00:00:00`);
    if(Number.isNaN(date.getTime())) return null;
    if(date.getFullYear() !== Number(y) || date.getMonth()+1 !== Number(m) || date.getDate() !== Number(d)) return null;
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
  }

  function findDate(line){
    const clean = String(line || '').replace(/,/g,' ').replace(/\s+/g,' ').trim();
    let m = clean.match(/\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/);
    if(m) return validISO(+m[1], +m[2], +m[3]);

    m = clean.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2})\b/);
    if(m) return validISO(+m[3], +m[1], +m[2]);

    m = clean.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:\s+(20\d{2}))?\b/i);
    if(m) return validISO(+(m[3] || currentYear()), MONTHS[m[1].toLowerCase()], +m[2]);

    m = clean.match(/\b(\d{1,2})\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\s+(20\d{2}))?\b/i);
    if(m) return validISO(+(m[3] || currentYear()), MONTHS[m[2].toLowerCase()], +m[1]);

    return null;
  }

  function findWeight(line){
    const nums = String(line || '').match(/(?<!\d)(\d{2,3}(?:\.\d+)?)(?!\d)/g) || [];
    const reasonable = nums.map(Number).filter(x => Number.isFinite(x) && x >= 50 && x <= 700);
    if(!reasonable.length) return null;
    return reasonable[reasonable.length - 1];
  }

  function parseBackfill(text, state){
    const lines = String(text || '').split(/\n+/).map(x=>x.trim()).filter(Boolean);
    const existing = new Set((state.entries || []).map(x=>x.date));
    const seen = new Map();
    const skipped = [];

    lines.forEach((line, index) => {
      const date = findDate(line);
      const weight = findWeight(line);
      if(!date || !Number.isFinite(weight)) {
        skipped.push({ line, index:index+1, reason: !date ? 'No date found' : 'No weight found' });
        return;
      }
      seen.set(date, {
        id: date,
        date,
        weight,
        unit: unitOf(state),
        tags: [],
        notes: 'Imported from backfill',
        status: existing.has(date) ? 'replace' : 'new',
        sourceLine: line
      });
    });

    return { entries: Array.from(seen.values()).sort((a,b)=>a.date.localeCompare(b.date)), skipped };
  }

  function BackfillPage(props){
    const hooks = React;
    const ctx = useApp();
    const state = ctx.state;
    const updateState = ctx.updateState;
    const setRoute = props?.setRoute || (()=>{});
    const sample = 'May 12 - 155.3\nMay 13 - 154.5\nMay 14 - 154.1\nMay 15 - 154.3\nMay 16 - 155.0';
    const [text,setText] = hooks.useState('');
    const [done,setDone] = hooks.useState(false);
    const parsed = hooks.useMemo(() => parseBackfill(text, state), [text, state]);
    const newCount = parsed.entries.filter(x=>x.status === 'new').length;
    const replaceCount = parsed.entries.filter(x=>x.status === 'replace').length;

    function importEntries(){
      if(!parsed.entries.length){ alert('Paste some weights first.'); return; }
      const byDate = new Map((state.entries || []).map(entry => [entry.date, entry]));
      parsed.entries.forEach(entry => byDate.set(entry.date, {
        id: entry.date,
        date: entry.date,
        weight: entry.weight,
        unit: unitOf(state),
        tags: entry.tags || [],
        notes: entry.notes || ''
      }));
      const entries = Array.from(byDate.values()).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
      updateState({ entries });
      setDone(true);
    }

    return e('div', { className:'wl-page fadein' },
      e('div', { className:'wl-grid-2' },
        e('div', null,
          e('div', { className:'wl-kicker' }, 'Backfill'),
          e('h1', { className:'wl-title mt-4' }, 'Bring your old data in.'),
          e('p', { className:'mt-4 text-[#686761] max-w-xl' }, 'Paste weights from your Notes app, spreadsheet, or messy list. WeightLens will detect dates and weights, preview them, then rebuild your trend.'),
          e('div', { className:'mt-12' },
            e('div', { className:'flex justify-between items-center mb-4' },
              e('div', { className:'wl-kicker' }, 'Paste from notes'),
              e('button', { className:'wl-link', onClick:()=>setText(sample) }, 'Try sample')
            ),
            e('textarea', {
              className:'wl-form-line w-full h-56',
              style:{ minHeight:'230px', lineHeight:'1.55', paddingTop:'12px' },
              value:text,
              onChange:(event)=>{ setText(event.target.value); setDone(false); },
              placeholder:'Examples:\n\nMay 1 - 180.2\nMay 2 - 179.8\n2026-05-03, 180.5\n05/04/2026 180.1'
            })
          ),
          e('div', { className:'flex gap-3 mt-6 flex-wrap' },
            e('button', { className:'wl-btn', onClick:importEntries }, parsed.entries.length ? `Import ${parsed.entries.length} entries` : 'Import entries'),
            e('button', { className:'wl-btn light', onClick:()=>setText('') }, 'Clear'),
            done && e('button', { className:'wl-btn light', onClick:()=>setRoute('dashboard') }, 'View dashboard')
          ),
          done && e('p', { className:'mt-4 text-[var(--ed-good)] font-bold' }, 'Imported. Your dashboard and chart have been rebuilt.')
        ),
        e('div', { className:'pt-20' },
          e('div', { className:'wl-kicker mb-4' }, 'Preview'),
          !text.trim()
            ? e('div', { className:'text-center pt-24' },
                e('div', { className:'text-3xl font-black tracking-[-.06em]' }, 'Paste data on the left'),
                e('p', { className:'text-[#686761] mt-3' }, 'We’ll auto-detect dates and weights, even from messy formats.')
              )
            : e(React.Fragment, null,
                e('div', { className:'grid grid-cols-3 gap-3 mb-6' },
                  e('div', { className:'wl-rule' }, e('div', { className:'wl-kicker' }, 'Parsed'), e('div', { className:'text-3xl font-black mt-3' }, parsed.entries.length)),
                  e('div', { className:'wl-rule' }, e('div', { className:'wl-kicker' }, 'New'), e('div', { className:'text-3xl font-black mt-3 text-[var(--ed-good)]' }, newCount)),
                  e('div', { className:'wl-rule' }, e('div', { className:'wl-kicker' }, 'Replace'), e('div', { className:'text-3xl font-black mt-3 text-[var(--ed-warn)]' }, replaceCount))
                ),
                e('div', { className:'wl-list' },
                  parsed.entries.slice(0,12).map((entry,idx)=>e('div', { className:'wl-list-row', key:entry.date },
                    e('div', { className:'wl-row-index' }, String(idx+1).padStart(2,'0')),
                    e('div', null, e('div', { className:'wl-row-title' }, shortDate(entry.date)), e('div', { className:'wl-row-sub' }, entry.date)),
                    e('div', null, e('b', null, entry.weight.toFixed(1)), ' ', e('span', { className:'text-xs' }, unitOf(state))),
                    e('div', null, e('span', { className:'wl-pill' }, entry.status === 'replace' ? 'Replace' : 'New')),
                    e('div', null)
                  )),
                  parsed.entries.length > 12 && e('div', { className:'py-4 text-[#686761]' }, `+ ${parsed.entries.length - 12} more entries`)
                ),
                parsed.skipped.length > 0 && e('div', { className:'mt-8 wl-rule' },
                  e('div', { className:'wl-kicker mb-3' }, 'Skipped lines'),
                  parsed.skipped.slice(0,5).map(item=>e('p', { className:'text-sm text-[#686761] mt-2', key:item.index }, `Line ${item.index}: ${item.reason} — ${item.line}`))
                )
              )
        )
      )
    );
  }

  function install(){
    window.BackfillPage = BackfillPage;
  }

  install();
  window.addEventListener('load', install);
  setTimeout(install, 100);
  setTimeout(install, 500);
})();

// Lightweight service worker registration.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => null);
  });
}
