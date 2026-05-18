// week-progress-final.jsx — final week-start-aware weekly reports + dashboard consistency
(function installWeekProgressFinal(){
  const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip: RTooltip, ResponsiveContainer } = window.Recharts || {};

  const safeEntries = (state) => [...(state?.entries || [])].sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  const safeDesc = (state) => [...(state?.entries || [])].sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  const today = () => typeof todayISO === 'function' ? todayISO() : new Date().toISOString().slice(0,10);
  const unitOf = (state) => state?.settings?.unit || 'lbs';
  const one = (v) => Number.isFinite(+v) ? (+v).toFixed(1) : '—';
  const signed = (v) => Number.isFinite(+v) ? `${+v > 0 ? '+' : ''}${(+v).toFixed(1)}` : '—';
  const shortDate = (d) => {
    try { return new Date(d + 'T00:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'}); }
    catch(e){ return d || '—'; }
  };
  const longDate = (d) => {
    try { return new Date(d + 'T00:00:00').toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric',year:'numeric'}); }
    catch(e){ return d || '—'; }
  };

  function fallbackDaysBetween(a,b){
    const start = new Date(a + 'T00:00:00');
    const end = new Date(b + 'T00:00:00');
    return Math.round((end - start) / 86400000);
  }

  function fallbackWeekKey(date, weekStartDay){
    const d = new Date(date + 'T00:00:00');
    const day = d.getDay();
    const diff = (day - weekStartDay + 7) % 7;
    d.setDate(d.getDate() - diff);
    return d.toISOString().slice(0,10);
  }

  function addDays(date, n){
    const d = new Date(date + 'T00:00:00');
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0,10);
  }

  function getWeekStart(date, weekStartDay){
    return typeof weekKey === 'function' ? weekKey(date, weekStartDay) : fallbackWeekKey(date, weekStartDay);
  }

  function getDaysBetween(a,b){
    return typeof daysBetween === 'function' ? daysBetween(a,b) : fallbackDaysBetween(a,b);
  }

  function buildWeeks(entries, weekStartDay){
    if (typeof weeklyAverages === 'function') return weeklyAverages(entries, weekStartDay);
    const map = new Map();
    entries.forEach(entry => {
      const start = getWeekStart(entry.date, weekStartDay);
      if (!map.has(start)) map.set(start, []);
      map.get(start).push(entry);
    });
    return [...map.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([weekStart, rows]) => {
      const weights = rows.map(x=>+x.weight).filter(Number.isFinite);
      const avg = weights.length ? weights.reduce((a,b)=>a+b,0)/weights.length : null;
      return {
        weekStart,
        weekEnd: addDays(weekStart, 6),
        count: rows.length,
        avg,
        low: weights.length ? Math.min(...weights) : null,
        high: weights.length ? Math.max(...weights) : null,
        tags: []
      };
    });
  }

  function currentWeekSnapshot(entries, weekStartDay){
    const todayKey = today();
    const start = getWeekStart(todayKey, weekStartDay);
    const end = addDays(start, 6);
    const rows = entries.filter(e => String(e.date) >= start && String(e.date) <= end);
    const elapsed = Math.min(7, Math.max(1, getDaysBetween(start, todayKey) + 1));
    const left = Math.max(0, 7 - elapsed);
    return { start, end, rows, count: rows.length, elapsed, left };
  }

  function rolling(entries){
    return entries.map((e,i) => {
      const slice = entries.slice(Math.max(0,i-6), i+1).map(x=>+x.weight).filter(Number.isFinite);
      return { ...e, weight:+e.weight, avg7: slice.length ? slice.reduce((a,b)=>a+b,0)/slice.length : +e.weight };
    });
  }

  function stats(state){
    const entries = safeEntries(state);
    const unit = unitOf(state);
    const r = rolling(entries);
    const latest = entries.length ? entries[entries.length - 1] : null;
    const avg7 = r.length ? r[r.length - 1].avg7 : null;
    const prev = r.length > 7 ? r[r.length - 8].avg7 : null;
    const weeklyRate = avg7 != null && prev != null ? avg7 - prev : null;
    const lastWeek = entries.length > 7 ? entries.slice(-14,-7).map(e=>+e.weight).filter(Number.isFinite) : [];
    const thisWeek = entries.slice(-7).map(e=>+e.weight).filter(Number.isFinite);
    const lastAvg = lastWeek.length ? lastWeek.reduce((a,b)=>a+b,0)/lastWeek.length : null;
    const thisAvg = thisWeek.length ? thisWeek.reduce((a,b)=>a+b,0)/thisWeek.length : avg7;
    const vsLast = thisAvg != null && lastAvg != null ? thisAvg - lastAvg : null;
    const deltas = [];
    for(let i=1;i<entries.length;i++){
      const d = Math.abs(+entries[i].weight - +entries[i-1].weight);
      if(Number.isFinite(d)) deltas.push(d);
    }
    const normal = deltas.length ? deltas.reduce((a,b)=>a+b,0)/deltas.length : null;
    return { entries, unit, r, latest, avg7, prev, weeklyRate, lastAvg, thisAvg, vsLast, normal };
  }

  function story(s){
    if(!s.latest) return 'Start logging to reveal your real trend.';
    if(!Number.isFinite(s.weeklyRate)) return 'Your weight is being tracked.';
    if(Math.abs(s.weeklyRate) < 0.25) return 'Your weight is holding steady.';
    return s.weeklyRate < 0 ? 'Your trend is moving down.' : 'Your trend is moving up.';
  }

  function saveEntryToState(state, updateState, draft){
    const date = String(draft.date || '').trim();
    const weight = Number(draft.weight);
    if(!date){ alert('Please choose a date.'); return false; }
    if(!Number.isFinite(weight)){ alert('Please enter a valid weight.'); return false; }
    const clean = { id: date, date, weight, unit: draft.unit || unitOf(state), tags: [], notes: '' };
    const withoutOld = (state.entries || []).filter(e => e.date !== date);
    updateState({ entries:[...withoutOld, clean].sort((a,b)=>String(a.date).localeCompare(String(b.date))) });
    return true;
  }

  function deleteEntryFromState(state, updateState, date){
    if(!date) return;
    if(!confirm(`Delete the entry for ${date}?`)) return;
    updateState({ entries:(state.entries || []).filter(e => e.date !== date) });
  }

  function entryDraft(entry, state){
    return { date: entry?.date || today(), weight: entry?.weight ?? '', unit: entry?.unit || unitOf(state) };
  }

  function TinyLine({ data, unit }){
    if(!ResponsiveContainer || data.length < 2) return <div className="h-72 border-t border-[var(--ed-line)]"/>;
    return <div className="h-[340px] w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{top:20,right:18,left:0,bottom:10}}>
      <CartesianGrid vertical={false} stroke="rgba(17,17,15,.06)" />
      <XAxis dataKey="date" tickFormatter={shortDate} axisLine={false} tickLine={false} tick={{fontSize:11,fill:'#77736B'}} interval="preserveStartEnd" />
      <YAxis domain={['dataMin - 1','dataMax + 1']} axisLine={false} tickLine={false} tick={{fontSize:11,fill:'#77736B'}} width={34}/>
      <RTooltip content={({active,payload})=> active&&payload?.length ? <div className="rounded-xl border bg-[#F6F4EF] px-3 py-2 text-xs">{one(payload[0].payload.weight)} {unit}</div> : null}/>
      <Line type="monotone" dataKey="weight" stroke="rgba(95,115,138,.35)" strokeWidth={1.5} dot={{r:2,fill:'#8FA0B7',strokeWidth:0}} />
      <Line type="monotone" dataKey="avg7" stroke="#65A30D" strokeWidth={2.5} dot={false} />
    </LineChart></ResponsiveContainer></div>;
  }

  function QuickLog(){
    const { state, updateState } = useApp();
    const s = stats(state);
    const [draft,setDraft] = React.useState(entryDraft(s.latest, state));
    function save(){
      const ok = saveEntryToState(state, updateState, draft);
      if(ok) setDraft(entryDraft({ ...draft, weight:+draft.weight }, state));
    }
    return <div className="wl-rule"><div className="flex justify-between mb-5"><div><div className="wl-kicker">Quick log</div><p className="text-sm text-[#686761] mt-2">Daily weight fluctuates. The trend matters more than one day.</p></div><div className="wl-kicker">Editing</div></div><div className="grid grid-cols-2 gap-4"><div><div className="wl-kicker mb-2">Weight</div><input className="wl-form-line w-full" inputMode="decimal" value={draft.weight} onChange={e=>setDraft({...draft, weight:e.target.value})} /></div><div><div className="wl-kicker mb-2">Date</div><input className="wl-form-line w-full" type="date" value={draft.date} onChange={e=>setDraft({...draft, date:e.target.value})} /></div></div><button className="wl-btn w-full mt-5" onClick={save}>Save entry</button></div>;
  }

  function RecentEntries({ setRoute }){
    const { state, updateState } = useApp();
    const s = stats(state);
    const rows = safeDesc(state).slice(0,5);
    return <section className="wl-section"><div className="wl-section-head"><div><div className="wl-kicker">Recent entries</div><h2 className="wl-title">The last few days.</h2></div><button className="wl-link" onClick={()=>setRoute('log')}>All entries ›</button></div><div className="wl-list">{rows.map((e,i)=><div className="wl-list-row" key={e.date}><div className="wl-row-index">{String(i+1).padStart(2,'0')}</div><div><div className="wl-row-title">{shortDate(e.date)}</div><div className="wl-row-sub">{e.date}</div></div><div><b>{one(e.weight)}</b> <span className="text-xs">{s.unit}</span></div><div className="wl-row-sub">{(e.tags||[]).length ? e.tags.join(', ') : 'No tags'}</div><div className="flex gap-3 justify-end"><button className="text-[#77736B]" onClick={()=>{window.__wlEditEntryDate=e.date; setRoute('log');}}>Edit</button><button className="text-[#999]" onClick={()=>deleteEntryFromState(state, updateState, e.date)}>⌫</button></div></div>)}</div></section>;
  }

  function Dashboard({ setRoute }){
    const { state } = useApp();
    const s = stats(state);
    const lastDate = s.latest?.date || today();
    const wsd = Number(state?.settings?.weekStartDay ?? 1);
    const cw = currentWeekSnapshot(s.entries, wsd);
    const consistencyValue = cw.count >= cw.elapsed ? 'On track' : 'Building';
    const consistencySub = `${cw.count}/7 days logged · day ${cw.elapsed} of 7`;

    return <div className="wl-page fadein">
      <div className="grid grid-cols-3 items-start gap-4">
        <div className="wl-kicker">Good morning, Matteo</div>
        <div className="wl-hero-meta">{longDate(lastDate)}</div>
        <div className="text-right"><button className="wl-btn light" onClick={()=>setRoute('backfill')}>Backfill</button> <button className="wl-btn ml-2" onClick={()=>setRoute('log')}>+ Log entry</button></div>
      </div>
      <h1 className="wl-hero-title">{story(s)}</h1>
      <div className="wl-hero-meta">Today · {shortDate(lastDate)}</div>
      <div className="wl-big-number mt-3">{one(s.latest?.weight)}<span className="wl-unit">{s.unit}</span></div>
      <div className="wl-subtle mt-4">7-day average · {one(s.avg7)} {s.unit} · <span className={s.weeklyRate < 0 ? 'text-[var(--ed-good)]' : 'text-[var(--ed-warn)]'}>{signed(s.weeklyRate)} trend</span></div>
      <div className="wl-metrics">
        <div className="wl-metric"><div className="wl-metric-label">Weekly rate</div><div className={`wl-metric-value ${s.weeklyRate < 0 ? 'good' : 'warn'}`}>{signed(s.weeklyRate)}</div><div className="wl-metric-sub">{s.unit}/wk</div></div>
        <div className="wl-metric"><div className="wl-metric-label">Vs last week</div><div className="wl-metric-value warn">{signed(s.vsLast)}</div><div className="wl-metric-sub">{s.unit}</div></div>
        <div className="wl-metric"><div className="wl-metric-label">This week</div><div className="wl-metric-value">{consistencyValue}</div><div className="wl-metric-sub">{consistencySub}</div></div>
        <div className="wl-metric"><div className="wl-metric-label">Total entries</div><div className="wl-metric-value">{s.entries.length}</div><div className="wl-metric-sub">Since {s.entries[0] ? shortDate(s.entries[0].date) : '—'}</div></div>
      </div>
      <section className="wl-section">
        <div className="wl-section-head"><div><div className="wl-kicker">The trend</div><h2 className="wl-title">You're tracking at {one(s.avg7)} {s.unit}.</h2></div><div className="wl-tabs"><button>7D</button><button className="active">30D</button><button>90D</button><button>6M</button><button>1Y</button><button>All</button></div></div>
        <TinyLine data={s.r} unit={s.unit}/>
        <div className="flex justify-between text-xs text-[#77736B] mt-3"><span>• Daily</span><span>— 7-day rolling avg</span><span>Daily dots are noisy. The line shows what’s actually happening.</span></div>
      </section>
      <section className="wl-section wl-grid-2">
        <div><div className="wl-kicker mb-3">This week</div><p className="wl-note">You have logged {cw.count}/7 days this week. This week is still in progress — judge it after the week closes.</p></div>
        <QuickLog />
      </section>
      <RecentEntries setRoute={setRoute}/>
    </div>;
  }

  function WeeklyReportsPage(){
    const { state } = useApp();
    const s = stats(state);
    const wsd = Number(state?.settings?.weekStartDay ?? 1);
    const weeks = buildWeeks(s.entries, wsd).slice().reverse();
    const todayKey = today();
    const currentStart = getWeekStart(todayKey, wsd);
    const weekName = wsd === 0 ? 'Sunday' : 'Monday';

    function meta(w){
      const isCurrent = w.weekStart === currentStart;
      const elapsed = isCurrent ? Math.min(7, Math.max(1, getDaysBetween(w.weekStart, todayKey) + 1)) : 7;
      const left = isCurrent ? Math.max(0, 7 - elapsed) : 0;
      return { isCurrent, elapsed, left };
    }

    return <div className="wl-page fadein">
      <div className="wl-kicker">Reports</div>
      <h1 className="wl-title mt-4">Weekly reports</h1>
      <p className="mt-4 text-[#686761]">Weeks start on {weekName}. The current week shows progress toward the full 7-day week.</p>
      <div className="mt-14 space-y-16">{weeks.slice(0,5).map((w)=>{const m=meta(w);return <div className="grid grid-cols-[220px_150px_160px_1fr] gap-10 border-t border-[var(--ed-line)] pt-6" key={w.weekStart}>
        <div><div className="wl-kicker">Week of</div><div className="font-bold mt-2">{shortDate(w.weekStart)} — {shortDate(w.weekEnd)}</div>{m.isCurrent && <div className="wl-row-sub mt-2">In progress · day {m.elapsed} of 7{m.left ? ` · ${m.left} day${m.left===1?'':'s'} left` : ' · ends today'}</div>}<div className="text-3xl font-black mt-4">{one(w.avg)} <span className="text-sm">{s.unit}</span></div></div>
        <div><div className="wl-kicker">{m.isCurrent ? 'Logged so far' : 'Logged'}</div><div className="text-3xl font-black mt-4">{w.count}/7</div>{m.isCurrent && <div className="wl-row-sub mt-2">week target</div>}</div>
        <div><div className="wl-kicker">Range</div><div className="text-3xl font-black mt-4">{one(w.low)}—<br/>{one(w.high)}</div></div>
        <div><div className="wl-kicker">Summary</div><p className="mt-4">{m.isCurrent ? `This week is still building. You have logged ${w.count}/7 days so far. Keep logging before making changes from an unfinished week.` : `Your average this week was ${one(w.avg)} ${s.unit}. Keep logging before making changes from one noisy week.`}</p></div>
      </div>})}</div>
    </div>;
  }

  window.Dashboard = Dashboard;
  window.WeeklyReportsPage = WeeklyReportsPage;
})();
