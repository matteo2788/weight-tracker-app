// editorial-redesign.jsx — Claude-style visual layer, keeps existing app/data/cloud logic

(function installEditorialRedesign(){
  const { useState, useMemo } = React;
  const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip: RTooltip, ResponsiveContainer } = window.Recharts || {};

  const safeEntries = (state) => [...(state?.entries || [])].sort((a,b) => String(a.date).localeCompare(String(b.date)));
  const safeDesc = (state) => [...(state?.entries || [])].sort((a,b) => String(b.date).localeCompare(String(a.date)));
  const n = (v) => Number.isFinite(+v) ? +v : null;
  const one = (v) => Number.isFinite(+v) ? (+v).toFixed(1) : '—';
  const signed = (v) => Number.isFinite(+v) ? `${+v > 0 ? '+' : ''}${(+v).toFixed(1)}` : '—';
  const unitOf = (state) => state?.settings?.unit || 'lbs';
  const shortDate = (d) => {
    try { return new Date(d + 'T00:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'}); }
    catch(e){ return d || '—'; }
  };
  const longDate = (d) => {
    try { return new Date(d + 'T00:00:00').toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric',year:'numeric'}); }
    catch(e){ return d || '—'; }
  };
  const today = () => typeof todayISO === 'function' ? todayISO() : new Date().toISOString().slice(0,10);
  const entryDraft = (entry, state) => ({
    originalDate: entry?.date || '',
    date: entry?.date || today(),
    weight: entry?.weight ?? '',
    tagsText: Array.isArray(entry?.tags) ? entry.tags.join(', ') : '',
    notes: entry?.notes || '',
    unit: entry?.unit || unitOf(state)
  });
  const cleanTags = (text) => String(text || '').split(',').map(x=>x.trim()).filter(Boolean);

  function saveEntryToState(state, updateState, draft){
    const date = String(draft.date || '').trim();
    const weight = Number(draft.weight);
    if(!date){ alert('Please choose a date.'); return false; }
    if(!Number.isFinite(weight)){ alert('Please enter a valid weight.'); return false; }

    const clean = {
      id: date,
      date,
      weight,
      unit: draft.unit || unitOf(state),
      tags: cleanTags(draft.tagsText),
      notes: String(draft.notes || '').trim()
    };

    const withoutOld = (state.entries || []).filter(e => e.date !== (draft.originalDate || date) && e.date !== date);
    const entries = [...withoutOld, clean].sort((a,b)=>String(a.date).localeCompare(String(b.date)));
    updateState({ entries });
    return true;
  }

  function deleteEntryFromState(state, updateState, date){
    if(!date) return;
    if(!confirm(`Delete the entry for ${date}?`)) return;
    updateState({ entries: (state.entries || []).filter(e => e.date !== date) });
  }

  function rolling(entries){
    return entries.map((e,i) => {
      const slice = entries.slice(Math.max(0,i-6), i+1).map(x => +x.weight).filter(Number.isFinite);
      return { ...e, weight:+e.weight, avg7: slice.length ? slice.reduce((a,b)=>a+b,0)/slice.length : +e.weight };
    });
  }
  function stats(state){
    const entries = safeEntries(state);
    const unit = unitOf(state);
    const r = rolling(entries);
    const latest = entries.length ? entries[entries.length-1] : null;
    const avg7 = r.length ? r[r.length-1].avg7 : null;
    const prev = r.length > 7 ? r[r.length-8].avg7 : null;
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

  function Wordmark(){
    return <div className="wl-logo">weightlens <span>trend</span></div>;
  }

  function EditorialMenu({ open, route, setRoute, onClose }){
    if(!open) return null;
    const nav = window.NAV || [];
    const { state } = useApp();
    const name = state?.profile?.name || 'Matteo';
    return (
      <div className="wl-menu fadein">
        <Wordmark />
        <button className="wl-menu-close" onClick={onClose}>×</button>
        <div className="wl-menu-list">
          {nav.map((item,idx)=>(
            <button key={item.id} className="wl-menu-item" onClick={()=>{setRoute(item.id); onClose();}}>
              <span className="wl-menu-num">{String(idx+1).padStart(2,'0')}</span>
              <span className={`wl-menu-name ${route===item.id?'active':''}`}>{item.label}</span>
            </button>
          ))}
        </div>
        <div className="wl-menu-side">
          <div className="wl-kicker mb-3">Profile</div>
          <div className="text-2xl font-black tracking-[-0.06em]">{name}</div>
          <p className="mt-2 text-sm text-[#686761]">Your data stays synced to this account.</p>
        </div>
      </div>
    );
  }

  function Topbar({ route, onMenu, setRoute }){
    const [open,setOpen] = useState(false);
    const title = (window.NAV || []).find(x=>x.id===route)?.label || 'Dashboard';
    return (
      <>
        <nav className="wl-topnav">
          <button onClick={()=>setRoute('dashboard')}><Wordmark /></button>
          <div className="wl-now">Now viewing <b>{title}</b></div>
          <div className="wl-top-actions">
            <button className="wl-link" onClick={()=>setRoute('log')}>+ Log entry</button>
            <button className="wl-menu-lines" onClick={()=>setOpen(true)} aria-label="Open menu"><i/><i/></button>
          </div>
        </nav>
        <EditorialMenu open={open} route={route} setRoute={setRoute} onClose={()=>setOpen(false)} />
      </>
    );
  }
  function Sidebar(){ return null; }

  function RightPanel({ setRoute }){
    const { state } = useApp();
    const s = stats(state);
    const goal = state.goal || {};
    const spike = s.entries.reduce((best,e,i)=>{
      if(i===0) return best;
      const diff = +e.weight - +s.entries[i-1].weight;
      if(!best || diff > best.diff) return { ...e, diff };
      return best;
    }, null);
    return (
      <aside className="wl-right">
        <section>
          <div className="flex justify-between items-center"><div className="wl-kicker">Today's note</div><div className="wl-kicker text-[var(--ed-accent)]">Coach</div></div>
          <p className="mt-4">{s.avg7 != null && s.latest ? `Today is ${Math.abs(s.latest.weight-s.avg7).toFixed(1)} ${s.unit} ${s.latest.weight < s.avg7 ? 'below' : 'above'} your 7-day average — the trend line is more reliable.` : 'Log a few entries and this panel will coach the trend.'}</p>
        </section>
        <section>
          <div className="flex justify-between items-center"><div className="wl-kicker">Current goal</div><button onClick={()=>setRoute('goals')} className="wl-kicker">Edit</button></div>
          <div className="mt-3 text-2xl font-black tracking-[-0.07em] capitalize">{goal.mode === 'fatloss' ? 'Fat Loss' : goal.mode || 'General'}</div>
          <p>Target pace · {goal.targetPace || '—'} {s.unit}/wk</p>
        </section>
        <section>
          <div className="wl-kicker">Normal range</div>
          <div className="big mt-3">±{one(s.normal)} <span className="text-sm">{s.unit}</span></div>
          <p className="mt-2">Weight typically moves about this much day to day. Spikes inside this range are normal.</p>
        </section>
        {spike && <section>
          <div className="wl-kicker">Biggest spike</div>
          <div className="big accent mt-3">+{one(spike.diff)} <span className="text-sm">{s.unit}</span></div>
          <p className="mt-2">on {shortDate(spike.date)}. Often caused by sodium, carbs, sleep, or normal water fluctuation.</p>
        </section>}
        <section>
          <div className="wl-kicker text-[var(--ed-accent)]">Have old data?</div>
          <p className="mt-3">Paste past weights from your Notes app and we’ll rebuild the trend instantly.</p>
          <button className="wl-link mt-4" onClick={()=>setRoute('backfill')}>Backfill past weights ›</button>
        </section>
      </aside>
    );
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

  function Dashboard({ setRoute }){
    const { state } = useApp();
    const s = stats(state);
    const lastDate = s.latest?.date || today();
    return (
      <div className="wl-page fadein">
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
          <div className="wl-metric"><div className="wl-metric-label">Confidence</div><div className="wl-metric-value">{s.entries.slice(-7).length >= 7 ? 'High' : 'Low'}</div><div className="wl-metric-sub">{s.entries.slice(-7).length}/7 days logged</div></div>
          <div className="wl-metric"><div className="wl-metric-label">Total entries</div><div className="wl-metric-value">{s.entries.length}</div><div className="wl-metric-sub">Since {s.entries[0] ? shortDate(s.entries[0].date) : '—'}</div></div>
        </div>
        <section className="wl-section">
          <div className="wl-section-head"><div><div className="wl-kicker">The trend</div><h2 className="wl-title">You're tracking at {one(s.avg7)} {s.unit}.</h2></div><div className="wl-tabs"><button>7D</button><button className="active">30D</button><button>90D</button><button>6M</button><button>1Y</button><button>All</button></div></div>
          <TinyLine data={s.r} unit={s.unit}/>
          <div className="flex justify-between text-xs text-[#77736B] mt-3"><span>• Daily</span><span>— 7-day rolling avg</span><span>Daily dots are noisy. The line shows what’s actually happening.</span></div>
        </section>
        <section className="wl-section wl-grid-2">
          <div><div className="wl-kicker mb-3">This week</div><p className="wl-note">Your average is {s.vsLast >= 0 ? 'up' : 'down'} {Math.abs(s.vsLast || 0).toFixed(1)} {s.unit} this week. Keep logging and reassess next week.</p></div>
          <QuickLog />
        </section>
        <RecentEntries setRoute={setRoute}/>
      </div>
    );
  }

  function QuickLog(){
    const { state, updateState } = useApp();
    const s = stats(state);
    const [draft,setDraft] = useState(entryDraft(s.latest, state));
    function save(){
      const ok = saveEntryToState(state, updateState, draft);
      if(ok) setDraft(entryDraft({ ...draft, weight:+draft.weight }, state));
    }
    return <div className="wl-rule"><div className="flex justify-between mb-5"><div><div className="wl-kicker">Quick log</div><p className="text-sm text-[#686761] mt-2">Daily weight fluctuates. The trend matters more than one day.</p></div><div className="wl-kicker">Editing</div></div><div className="grid grid-cols-2 gap-4"><div><div className="wl-kicker mb-2">Weight</div><input className="wl-form-line w-full" inputMode="decimal" value={draft.weight} onChange={e=>setDraft({...draft, weight:e.target.value})} /></div><div><div className="wl-kicker mb-2">Date</div><input className="wl-form-line w-full" type="date" value={draft.date} onChange={e=>setDraft({...draft, date:e.target.value})} /></div></div><div className="grid grid-cols-2 gap-4 mt-4"><div><div className="wl-kicker mb-2">Tags</div><input className="wl-form-line w-full" placeholder="high sodium, ate late" value={draft.tagsText} onChange={e=>setDraft({...draft, tagsText:e.target.value})} /></div><div><div className="wl-kicker mb-2">Notes</div><input className="wl-form-line w-full" placeholder="Optional" value={draft.notes} onChange={e=>setDraft({...draft, notes:e.target.value})} /></div></div><button className="wl-btn w-full mt-5" onClick={save}>Save entry</button></div>;
  }

  function RecentEntries({ setRoute }){
    const { state, updateState } = useApp();
    const s = stats(state);
    const rows = safeDesc(state).slice(0,5);
    return <section className="wl-section"><div className="wl-section-head"><div><div className="wl-kicker">Recent entries</div><h2 className="wl-title">The last few days.</h2></div><button className="wl-link" onClick={()=>setRoute('log')}>All entries ›</button></div><div className="wl-list">{rows.map((e,i)=><div className="wl-list-row" key={e.date}><div className="wl-row-index">{String(i+1).padStart(2,'0')}</div><div><div className="wl-row-title">{shortDate(e.date)}</div><div className="wl-row-sub">{e.date}</div></div><div><b>{one(e.weight)}</b> <span className="text-xs">{s.unit}</span></div><div className="wl-row-sub">{(e.tags||[]).length ? e.tags.join(', ') : 'No tags'}</div><div className="flex gap-3 justify-end"><button className="text-[#77736B]" onClick={()=>{window.__wlEditEntryDate=e.date; setRoute('log');}}>Edit</button><button className="text-[#999]" onClick={()=>deleteEntryFromState(state, updateState, e.date)}>⌫</button></div></div>)}</div></section>;
  }

  function LogWeightPage(){
    const { state, updateState } = useApp();
    const s = stats(state);
    const pendingDate = window.__wlEditEntryDate || '';
    if(window.__wlEditEntryDate) window.__wlEditEntryDate = '';
    const pendingEntry = pendingDate ? (state.entries || []).find(e=>e.date===pendingDate) : null;
    const [q,setQ] = useState('');
    const [draft,setDraft] = useState(entryDraft(pendingEntry, state));
    const [isEditing,setIsEditing] = useState(Boolean(pendingEntry));
    const rows = safeDesc(state).filter(e => !q || e.date.includes(q) || shortDate(e.date).toLowerCase().includes(q.toLowerCase()) || longDate(e.date).toLowerCase().includes(q.toLowerCase()) || (e.tags||[]).join(' ').toLowerCase().includes(q.toLowerCase()) || String(e.notes||'').toLowerCase().includes(q.toLowerCase()));
    const startNew = () => { setDraft(entryDraft(null, state)); setIsEditing(true); };
    const edit = (entry) => { setDraft(entryDraft(entry, state)); setIsEditing(true); window.scrollTo({top:0, behavior:'smooth'}); };
    const save = () => { if(saveEntryToState(state, updateState, draft)){ setIsEditing(false); setDraft(entryDraft(null, state)); } };
    const remove = (date) => { deleteEntryFromState(state, updateState, date); if(draft.originalDate === date){ setIsEditing(false); setDraft(entryDraft(null, state)); } };

    return <div className="wl-page fadein"><div className="wl-section-head"><div><div className="wl-kicker">All entries</div><h1 className="wl-title">Log weight</h1><p className="mt-4 text-[#686761]">Add, edit, search, or remove daily weight entries.</p></div><button className="wl-btn" onClick={startNew}>+ New entry</button></div>{isEditing && <div className="wl-rule mb-10"><div className="flex justify-between items-start gap-4 mb-6"><div><div className="wl-kicker">{draft.originalDate ? 'Edit entry' : 'New entry'}</div><p className="mt-2 text-[#686761]">Saving a date that already exists will replace that day.</p></div><button className="wl-link" onClick={()=>{setIsEditing(false); setDraft(entryDraft(null, state));}}>Cancel</button></div><div className="grid grid-cols-2 gap-6"><label><div className="wl-kicker mb-2">Date</div><input className="wl-form-line w-full" type="date" value={draft.date} onChange={e=>setDraft({...draft,date:e.target.value})}/></label><label><div className="wl-kicker mb-2">Weight</div><input className="wl-form-line w-full" inputMode="decimal" value={draft.weight} onChange={e=>setDraft({...draft,weight:e.target.value})}/></label><label><div className="wl-kicker mb-2">Tags</div><input className="wl-form-line w-full" placeholder="high sodium, ate late" value={draft.tagsText} onChange={e=>setDraft({...draft,tagsText:e.target.value})}/></label><label><div className="wl-kicker mb-2">Notes</div><input className="wl-form-line w-full" placeholder="Optional note" value={draft.notes} onChange={e=>setDraft({...draft,notes:e.target.value})}/></label></div><div className="flex gap-3 mt-6"><button className="wl-btn" onClick={save}>{draft.originalDate ? 'Save changes' : 'Save entry'}</button>{draft.originalDate && <button className="wl-btn light text-red-600" onClick={()=>remove(draft.originalDate)}>Delete</button>}</div></div>}<div className="mb-5"><input className="wl-form-line w-full" placeholder="Search by date, tag, or note…" value={q} onChange={e=>setQ(e.target.value)} /></div><div className="wl-list">{rows.length ? rows.map((e,i)=><div className="wl-list-row" key={e.date}><div className="wl-row-index">{String(i+1).padStart(2,'0')}</div><div><div className="font-bold">{longDate(e.date).replace(', 2026','')}</div><div className="wl-row-sub">{e.date}</div></div><div><b>{one(e.weight)}</b> <span className="text-xs">{s.unit}</span></div><div>{(e.tags||[]).length ? (e.tags||[]).map(t=><span className="wl-pill mr-2" key={t}>{t}</span>) : <span className="wl-row-sub">No tags</span>}{e.notes && <div className="wl-row-sub mt-2">{e.notes}</div>}</div><div className="text-right flex gap-3 justify-end"><button className="text-[#77736B]" onClick={()=>edit(e)}>Edit</button><button className="text-[#999]" onClick={()=>remove(e.date)}>⌫</button></div></div>) : <div className="py-14 text-center text-[#686761]">No entries found.</div>}</div></div>;
  }

  function BackfillPage({ setRoute }){
    return <div className="wl-page fadein"><div className="wl-grid-2"><div><div className="wl-kicker">Backfill</div><h1 className="wl-title mt-4">Bring your old data in.</h1><p className="mt-4 text-[#686761] max-w-xl">Paste weights from your Notes app, type them across a calendar, or upload a CSV — your trend dashboard will rebuild instantly.</p><div className="mt-12"><div className="wl-kicker mb-4">Paste from notes</div><textarea className="wl-form-line w-full h-56" placeholder={'Examples:\n\nMay 1 - 180.2\nMay 2 - 179.8\nMay 3 - 180.5'} /></div></div><div className="pt-20 text-center"><div className="wl-kicker mb-4">Preview</div><div className="text-3xl font-black tracking-[-.06em] mt-24">Paste data on the left</div><p className="text-[#686761] mt-3">We'll auto-detect dates and weights, even from messy formats.</p></div></div></div>;
  }

  function TrendsPage(){
    const { state } = useApp();
    const s = stats(state);
    return <div className="wl-page fadein"><div className="wl-section-head"><div><div className="wl-kicker">Analysis</div><h1 className="wl-title">Long-term trends</h1><p className="mt-4 text-[#686761]">Daily weight is noisy. Averages reveal the real direction.</p></div><div className="wl-tabs"><button>7D</button><button>30D</button><button className="active">90D</button><button>6M</button><button>1Y</button><button>All</button></div></div><TinyLine data={s.r} unit={s.unit}/><div className="wl-rule mt-16"><div className="wl-kicker mb-3">What this range means</div><p className="text-lg">Over this range, your 7-day average moved by {signed(s.weeklyRate)} {s.unit}. Individual days bounce around, but the rolling line shows the direction.</p></div><div className="wl-metrics"><div className="wl-metric"><div className="wl-metric-label">Avg weekly change</div><div className="wl-metric-value good">{signed(s.weeklyRate)}</div></div><div className="wl-metric"><div className="wl-metric-label">Highest in range</div><div className="wl-metric-value">{one(Math.max(...s.entries.map(e=>+e.weight)))}</div></div><div className="wl-metric"><div className="wl-metric-label">Lowest in range</div><div className="wl-metric-value">{one(Math.min(...s.entries.map(e=>+e.weight)))}</div></div><div className="wl-metric"><div className="wl-metric-label">Days logged</div><div className="wl-metric-value">{s.entries.length}</div></div></div></div>;
  }

  function WeeklyReportsPage(){
    const { state } = useApp();
    const s = stats(state);
    const chunks=[]; for(let i=s.entries.length;i>0;i-=7) chunks.push(s.entries.slice(Math.max(0,i-7),i));
    return <div className="wl-page fadein"><div className="wl-kicker">Reports</div><h1 className="wl-title mt-4">Weekly reports</h1><p className="mt-4 text-[#686761]">A calm, coach-style readout of each week. Patterns reveal themselves over time.</p><div className="mt-14 space-y-16">{chunks.slice(0,5).map((wk,i)=>{const avg=wk.reduce((a,b)=>a+ +b.weight,0)/wk.length;return <div className="grid grid-cols-[220px_150px_160px_1fr] gap-10 border-t border-[var(--ed-line)] pt-6" key={i}><div><div className="wl-kicker">Week of</div><div className="font-bold mt-2">{shortDate(wk[0].date)} — {shortDate(wk[wk.length-1].date)}</div><div className="text-3xl font-black mt-4">{one(avg)} <span className="text-sm">{s.unit}</span></div></div><div><div className="wl-kicker">Logged</div><div className="text-3xl font-black mt-4">{wk.length}/7</div></div><div><div className="wl-kicker">Range</div><div className="text-3xl font-black mt-4">{one(Math.min(...wk.map(e=>+e.weight)))}—<br/>{one(Math.max(...wk.map(e=>+e.weight)))}</div></div><div><div className="wl-kicker">Summary</div><p className="mt-4">Your average this week was {one(avg)} {s.unit}. Keep logging before making changes from one noisy week.</p></div></div>})}</div></div>;
  }

  function GoalsPage(){
    const { state, updateState } = useApp();
    const goal = state.goal || {}; const s = stats(state);
    const modes=[['fatloss','Fat loss','Slow, steady downward trend.'],['musclegain','Muscle gain','Slow controlled gain.'],['maintenance','Maintenance','Stay within a normal range.'],['recomp','Recomposition','Track strength and photos too.'],['general','General tracking','Neutral analysis.']];
    const setGoal = (patch)=>updateState({goal:{...goal,...patch}});
    return <div className="wl-page fadein"><div className="wl-kicker">Goal</div><h1 className="wl-title mt-4">Goals</h1><p className="mt-4 text-[#686761]">Your goal shapes how WeightLens interprets progress.</p><div className="grid grid-cols-5 gap-3 mt-12">{modes.map(m=><button key={m[0]} className={`wl-card-option text-left ${goal.mode===m[0]?'active':''}`} onClick={()=>setGoal({mode:m[0]})}><div className="font-bold">{m[1]}</div><p className="text-sm text-[#686761] mt-2">{m[2]}</p></button>)}</div><div className="wl-grid-2 mt-16"><div className="grid grid-cols-2 gap-6"><label><div className="wl-kicker mb-2">Starting weight</div><input className="wl-form-line w-full" value={goal.startingWeight||''} onChange={e=>setGoal({startingWeight:+e.target.value})}/></label><label><div className="wl-kicker mb-2">Goal weight</div><input className="wl-form-line w-full" value={goal.goalWeight||''} onChange={e=>setGoal({goalWeight:+e.target.value})}/></label><label><div className="wl-kicker mb-2">Start date</div><input className="wl-form-line w-full" type="date" value={goal.startDate||today()} onChange={e=>setGoal({startDate:e.target.value})}/></label><label><div className="wl-kicker mb-2">Target pace</div><input className="wl-form-line w-full" value={goal.targetPace||''} onChange={e=>setGoal({targetPace:+e.target.value})}/></label></div><div><div className="wl-kicker text-[var(--ed-accent)]">Coach</div><div className="text-3xl font-black mt-4">{one(s.avg7)} <span className="text-base">{s.unit}</span></div><p className="mt-4 text-[#686761]">Your average is moving at about {signed(s.weeklyRate)} {s.unit}/wk.</p></div></div></div>;
  }

  function MeasurementsPage(){
    return <div className="wl-page fadein"><div className="wl-kicker">Body measurements</div><h1 className="wl-title mt-4">Measurements</h1><p className="mt-4 text-[#686761] max-w-xl">Optional. Measurements often tell a different story than the scale — especially during recomposition.</p><button className="wl-btn mt-10">+ New measurement</button><div className="grid grid-cols-6 gap-12 mt-14 border-b border-[var(--ed-line)] pb-12">{['Waist','Chest','Hips','Arm','Thigh','Neck'].map(x=><div key={x}><div className="wl-kicker">{x}</div><div className="mt-5 text-2xl font-black">— <span className="text-sm">in</span></div></div>)}</div><div className="text-center mt-28"><div className="text-3xl font-black tracking-[-.06em]">No measurements yet</div><p className="text-[#686761] mt-3">Add waist, chest, hips, or any custom measurement on the side.</p></div></div>;
  }

  function InsightsPage(){
    const items=[['Fundamentals','Why weekly averages matter more than daily weight','Think of daily weight like waves in the ocean. The weekly average is the tide.'],['Water','Sodium can swing the scale by 1–4 lbs overnight','A salty meal makes your body hold extra water for a day or two.'],['Water','Carbs can push the scale up — without fat gain','Stored carbohydrate pulls water into your muscles.'],['Training','Sore muscles can temporarily increase weight','Hard training causes repair and temporary water retention.'],['Recovery','Poor sleep affects scale weight','Bad sleep can raise cortisol and water retention.'],['Mindset','One bad day does not ruin progress','A single day cannot erase a week of consistent eating.']];
    return <div className="wl-page fadein"><div className="wl-kicker">Learn</div><h1 className="wl-title mt-4">Insights & education</h1><p className="mt-4 text-[#686761]">Short reads on what makes the scale move — so you can make sense of your own data.</p><div className="grid grid-cols-2 gap-x-20 gap-y-16 mt-14">{items.map((it,i)=><div key={i}><span className="wl-pill">{it[0]}</span><h3 className="text-xl font-black tracking-[-.04em] mt-5">{it[1]}</h3><p className="mt-3 text-[#686761] leading-relaxed">{it[2]}</p></div>)}</div></div>;
  }

  function SettingsPage(){
    const { state, updateState, resetAll } = useApp();
    const s = state.settings || {};
    const setS = (p)=>updateState({settings:{...s,...p}});
    const exportJson=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='weightlens-backup.json';a.click();URL.revokeObjectURL(url);};
    return <div className="wl-page fadein max-w-3xl"><div className="wl-kicker">Preferences</div><h1 className="wl-title mt-4">Settings</h1><div className="wl-input-grid mt-16"><label><div className="wl-kicker mb-2">Weight unit</div><select className="wl-form-line w-full" value={s.unit||'lbs'} onChange={e=>setS({unit:e.target.value})}><option value="lbs">Pounds (lbs)</option><option value="kg">Kilograms (kg)</option></select></label><label><div className="wl-kicker mb-2">Week starts on</div><select className="wl-form-line w-full" value={s.weekStartDay||1} onChange={e=>setS({weekStartDay:+e.target.value})}><option value={1}>Monday</option><option value={0}>Sunday</option></select></label><label><div className="wl-kicker mb-2">Default goal mode</div><select className="wl-form-line w-full" value={s.defaultGoal||'fatloss'} onChange={e=>setS({defaultGoal:e.target.value})}><option value="fatloss">Fat loss</option><option value="recomp">Recomposition</option><option value="general">General</option></select></label></div><section className="wl-section wl-grid-2"><div><div className="wl-kicker">Reminders</div><p className="mt-4">Daily weigh-in reminder</p><p className="text-[#686761]">Frontend preview only — notifications coming later.</p></div><input className="wl-form-line" type="time" value={s.reminderTime||'07:30'} onChange={e=>setS({reminderTime:e.target.value})}/></section><section className="wl-section"><div className="wl-kicker mb-4">Data</div><div className="grid grid-cols-2 gap-4"><button className="wl-btn light" onClick={exportJson}>↓ Backup as JSON</button><button className="wl-btn light">↓ Restore from JSON</button><button className="wl-btn light">↓ Export entries as CSV</button><button className="wl-btn light text-red-600" onClick={()=>{if(confirm('Clear all data?')) resetAll();}}>⌫ Clear all data</button></div></section><section className="wl-section"><div className="wl-kicker mb-4">About</div><p className="text-[#686761]">WeightLens is a calm trend dashboard for body weight. Your data syncs to your account and can be backed up anytime.</p></section></div>;
  }

  function PhotosPage(){ return <div className="wl-page fadein"><div className="wl-kicker">Progress photos</div><h1 className="wl-title mt-4">Photos</h1><p className="mt-4 text-[#686761]">Photo tracking can be added here without cluttering the scale dashboard.</p></div>; }

  Object.assign(window, { Topbar, Sidebar, RightPanel, Dashboard, LogWeightPage, BackfillPage, TrendsPage, WeeklyReportsPage, GoalsPage, MeasurementsPage, InsightsPage, SettingsPage, PhotosPage });
})();