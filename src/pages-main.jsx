// pages-main.jsx — Dashboard, Log Weight, Backfill / Import

const { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip: RTooltip, ResponsiveContainer, ReferenceLine, Dot } = window.Recharts;

// ============================================================
// Chart pieces
// ============================================================
function ChartTooltip({ active, payload, unit }){
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="bg-white border border-line2 rounded-xl px-3 py-2 shadow-pop text-[12px]">
      <div className="text-mute mb-1">{fmtLong(p.date)}</div>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-mute2"/>Daily</span>
        <span className="num text-fg">{p.weight != null ? p.weight.toFixed(1) : '—'} {unit}</span>
      </div>
      <div className="flex items-center gap-3 mt-0.5">
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-accent"/>7-day avg</span>
        <span className="num text-accent">{p.avg7 != null ? p.avg7.toFixed(1) : '—'} {unit}</span>
      </div>
    </div>
  );
}

function TrendChart({ entries, range='30', unit, height=260, showWeekly=false, weekStartDay=1 }){
  const { accent } = useApp();
  const data = useMemo(()=>{
    const days = parseInt(range, 10);
    const sorted = entriesSortedAsc(entries);
    if (!sorted.length) return { points: [], min:0, max:0 };
    const slice = (range === 'all') ? sorted :
      sorted.filter(e => daysBetween(e.date, todayISO()) <= days-1);
    const withAvg = rolling7(sorted);
    const map = new Map(withAvg.map(x=>[x.date,x]));
    const points = slice.map(e => ({
      date: e.date,
      weight: e.weight,
      avg7: map.get(e.date)?.avg7 ?? null,
    }));
    const all = points.flatMap(p=>[p.weight, p.avg7]).filter(v=>v!=null);
    return { points, min: Math.min(...all), max: Math.max(...all) };
  }, [entries, range]);

  if (!data.points.length){
    return <EmptyState icon={<I.Trends className="h-5 w-5"/>} title="No data in this range" body="Log a weight or backfill past entries to see your trend." />;
  }
  const pad = Math.max(1, (data.max - data.min) * 0.15);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data.points} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="avgFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.18"/>
            <stop offset="100%" stopColor={accent} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(10,10,10,0.05)" vertical={false}/>
        <XAxis dataKey="date" tickFormatter={d=>fmtShort(d)} tick={{ fontSize:11 }} axisLine={false} tickLine={false} minTickGap={28}/>
        <YAxis domain={[data.min - pad, data.max + pad]} tickFormatter={v=>v.toFixed(0)} tick={{ fontSize:11 }} axisLine={false} tickLine={false} width={36}/>
        <RTooltip content={<ChartTooltip unit={unit}/>} cursor={{ stroke:'rgba(10,10,10,0.15)' }}/>
        <Line type="linear" dataKey="weight" stroke="#CBD5E1" strokeWidth={1} dot={{ r: 2, fill:'#94A3B8', strokeWidth:0 }} activeDot={{ r:3.5, fill:'#0A0A0A' }} connectNulls={false} isAnimationActive={false}/>
        <Line type="monotone" dataKey="avg7" stroke={accent} strokeWidth={2.5} dot={false} activeDot={{ r:4.5, fill: accent, stroke:'#FFFFFF', strokeWidth:2 }} isAnimationActive={true} animationDuration={500}/>
      </LineChart>
    </ResponsiveContainer>
  );
}

// ============================================================
// Quick Log card (Dashboard)
// ============================================================
function QuickLog(){
  const { state, updateState } = useApp();
  const unit = state.settings.unit;
  const [date, setDate] = useState(todayISO());
  const existing = state.entries.find(e => e.date === date);
  const [weight, setWeight] = useState(existing ? String(existing.weight) : '');
  const [notes, setNotes] = useState(existing?.notes || '');
  const [tags, setTags] = useState(existing?.tags || []);
  const [saved, setSaved] = useState(false);
  const [showTags, setShowTags] = useState(false);

  useEffect(()=>{
    const e = state.entries.find(e => e.date === date);
    if (e){ setWeight(String(e.weight)); setNotes(e.notes||''); setTags(e.tags||[]); }
    else  { setWeight(''); setNotes(''); setTags([]); }
  }, [date, state.entries]);

  const save = () => {
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) return;
    const entries = state.entries.filter(e => e.date !== date);
    entries.push({
      id: existing?.id || ('e_' + Date.now()),
      date, weight: +w.toFixed(1), unit, notes, tags,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    updateState({ entries });
    setSaved(true);
    setTimeout(()=>setSaved(false), 1800);
  };

  const toggleTag = (t) => setTags(tags.includes(t) ? tags.filter(x=>x!==t) : [...tags, t]);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <SectionLabel className="!mb-1">Log today</SectionLabel>
          <div className="text-[12.5px] text-mute">Daily weight can fluctuate. Your trend matters more than one day.</div>
        </div>
        <Pill tone={existing?'accent':'neutral'}>{existing ? 'Editing' : 'New entry'}</Pill>
      </div>

      <div className="grid grid-cols-12 gap-3 items-end">
        <div className="col-span-12 sm:col-span-7">
          <label className="block text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">Weight</label>
          <div className="flex items-stretch gap-2">
            <div className="flex-1 relative">
              <input
                type="number" step="0.1" inputMode="decimal"
                value={weight} onChange={e=>setWeight(e.target.value)}
                placeholder="0.0"
                className="w-full bg-surface3 border border-line2 rounded-xl h-14 px-4 pr-16 text-[28px] display font-semibold tabular-nums focus-ring"
                onKeyDown={e=>{ if (e.key==='Enter') save(); }}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-mute text-sm">{unit}</div>
            </div>
          </div>
        </div>
        <div className="col-span-7 sm:col-span-3">
          <label className="block text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">Date</label>
          <Input type="date" value={date} onChange={e=>setDate(e.target.value)} max={todayISO()} className="w-full"/>
        </div>
        <div className="col-span-5 sm:col-span-2">
          <Button onClick={save} className="w-full h-10" disabled={!weight}>
            {saved ? <><I.Check className="h-4 w-4"/> Saved</> : (existing ? 'Update' : 'Save')}
          </Button>
        </div>
      </div>

      <div className="mt-3">
        <button onClick={()=>setShowTags(!showTags)} className="text-[12.5px] text-mute hover:text-fg inline-flex items-center gap-1.5">
          <span>{showTags ? 'Hide' : 'Add'} notes & tags</span>
          <I.Right className={`h-3.5 w-3.5 transition-transform ${showTags?'rotate-90':''}`}/>
        </button>
        {showTags && (
          <div className="mt-3 space-y-3 fadein">
            <Textarea rows={2} className="w-full" placeholder="Optional notes about today…" value={notes} onChange={e=>setNotes(e.target.value)}/>
            <div className="flex flex-wrap gap-1.5">
              {TAG_LIST.map(t => (
                <button key={t} onClick={()=>toggleTag(t)}
                  className={`px-2.5 h-7 text-[12px] rounded-full border transition-colors
                    ${tags.includes(t)
                      ? 'bg-accent/15 text-accent border-accent/30'
                      : 'bg-surface3 text-mute border-line2 hover:text-fg'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// ============================================================
// Dashboard
// ============================================================
function Dashboard({ setRoute }){
  const { state } = useApp();
  const unit = state.settings.unit;
  const [range, setRange] = useState('30');

  const r7 = useMemo(()=>rolling7(state.entries), [state.entries]);
  const latest = r7[r7.length-1];
  const currentAvg = latest?.avg7 ?? null;
  const currentWeight = latest?.weight ?? null;

  const trend = useMemo(()=>trendStatus(state.entries, state.settings.weekStartDay), [state.entries, state.settings.weekStartDay]);
  const rate = useMemo(()=>weeklyRate(state.entries, state.settings.weekStartDay), [state.entries, state.settings.weekStartDay]);
  const conf = useMemo(()=>confidenceFromWeek(state.entries, state.settings.weekStartDay), [state.entries, state.settings.weekStartDay]);
  const summary = useMemo(()=>weeklySummary(state.entries, state.settings.weekStartDay), [state.entries, state.settings.weekStartDay]);
  const consistency = useMemo(()=>{
    const set = new Set(lastNDays(state.entries, 7).map(e=>e.date));
    return { count: set.size, of: 7 };
  }, [state.entries]);

  const trendStatusInfo = {
    losing:    { label:'Losing',    tone:'good',    icon:<I.ArrowDn className="h-4 w-4"/> },
    gaining:   { label:'Gaining',   tone:'warn',    icon:<I.ArrowUp className="h-4 w-4"/> },
    stable:    { label:'Stable',    tone:'neutral', icon:<span className="h-0.5 w-3 bg-current"/> },
    not_enough:{ label:'Need more data', tone:'neutral', icon:<I.Info className="h-4 w-4"/> },
  }[trend.status];

  const ranges = [
    { value:'7', label:'7D' },
    { value:'30', label:'30D' },
    { value:'90', label:'90D' },
    { value:'180', label:'6M' },
    { value:'365', label:'1Y' },
    { value:'all', label:'All' },
  ];

  // recent entries
  const recent = useMemo(()=>{
    return entriesSortedAsc(state.entries).slice(-6).reverse();
  }, [state.entries]);

  return (
    <div className="space-y-6 fadein">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">Overview</div>
          <h1 className="text-[28px] md:text-[32px] font-semibold tracking-tight">{(()=>{
            const h = new Date().getHours();
            const greet = h < 5 ? 'Up late' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
            return `${greet}, ${state.profile?.name || 'Matteo'}.`;
          })()}</h1>
          <div className="text-mute mt-1.5 text-[14px]">{fmtLong(todayISO())}</div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={()=>setRoute('backfill')}>
            <I.Import className="h-4 w-4"/> Backfill past weights
          </Button>
          <Button onClick={()=>setRoute('log')}>
            <I.Plus className="h-4 w-4"/> Log entry
          </Button>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat
          label="Current weight"
          value={fmtW(currentWeight)} unit={unit}
          sub={currentAvg ? `${(currentWeight - currentAvg) >= 0 ? '+' : ''}${(currentWeight - currentAvg).toFixed(1)} ${unit} vs avg` : '—'}
        />
        <Stat
          label="7-day average"
          value={fmtW(currentAvg)} unit={unit}
          sub={rate != null ? `${rate>=0?'+':''}${rate.toFixed(2)} ${unit}/week` : 'Building data…'}
          tone="accent"
        />
        <Stat
          label="Change vs last week"
          value={trend.change != null ? fmtDelta(trend.change) : '—'} unit={unit}
          sub={trendStatusInfo.label}
          tone={trend.status==='losing'?'good':(trend.status==='gaining'?'warn':'neutral')}
        />
        <Stat
          label="Trend confidence"
          value={conf.level}
          sub={`${consistency.count}/${consistency.of} days logged this week`}
        />
      </div>

      {/* Chart + Quick log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 !p-0 overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-2">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-mute mb-1">Trend</div>
              <div className="flex items-baseline gap-2.5">
                <div className="display text-2xl font-semibold">{fmtW(currentAvg)}</div>
                <div className="text-mute text-sm">{unit} · 7-day avg</div>
                <Pill tone={trendStatusInfo.tone}>{trendStatusInfo.icon} {trendStatusInfo.label}</Pill>
              </div>
            </div>
            <Tabs tabs={ranges} value={range} onChange={setRange}/>
          </div>
          <div className="px-2 pb-4">
            <TrendChart entries={state.entries} range={range} unit={unit}/>
          </div>
          <div className="px-5 pb-5 flex items-center gap-4 text-[12px] text-mute border-t hairline pt-3">
            <span className="inline-flex items-center gap-1.5"><span className="inline-block h-1.5 w-1.5 rounded-full bg-mute2"/>Daily weight</span>
            <span className="inline-flex items-center gap-1.5"><span className="inline-block h-0.5 w-3 bg-accent"/>7-day rolling average</span>
            <span className="ml-auto text-mute2">The daily dots are noisy. The line shows what's actually happening.</span>
          </div>
        </Card>

        <div className="space-y-4">
          <QuickLog/>
        </div>
      </div>

      {/* Weekly summary + recent entries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-start justify-between gap-3 mb-3">
            <SectionLabel className="!mb-0">This week's summary</SectionLabel>
            <Pill tone="accent"><I.Sparkle className="h-3 w-3"/> Coach</Pill>
          </div>
          <p className="text-[15px] leading-relaxed text-fg/90">{summary}</p>
          <div className="grid grid-cols-3 gap-3 mt-5">
            <SmallMetric label="Avg this week"  value={fmtW(trend.weeks[trend.weeks.length-1]?.avg)} unit={unit}/>
            <SmallMetric label="Last week"      value={fmtW(trend.weeks[trend.weeks.length-2]?.avg)} unit={unit}/>
            <SmallMetric label="Weekly rate"    value={rate != null ? fmtDelta(rate) : '—'} unit={unit + '/wk'}/>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <SectionLabel className="!mb-0">Recent entries</SectionLabel>
            <button onClick={()=>setRoute('log')} className="text-[11px] text-mute hover:text-fg inline-flex items-center gap-1">View all <I.Right className="h-3 w-3"/></button>
          </div>
          {recent.length === 0 ? (
            <EmptyState icon={<I.Scale className="h-5 w-5"/>} title="No entries yet" body="Log today's weight to begin."/>
          ) : (
            <ul className="divide-y hairline -mx-1">
              {recent.map((e, i) => {
                const prev = recent[i+1];
                const diff = prev ? e.weight - prev.weight : null;
                return (
                  <li key={e.id} className="flex items-center justify-between px-1 py-2.5">
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-medium">{fmtShort(e.date)}</div>
                      <div className="text-[11.5px] text-mute truncate max-w-[160px]">
                        {(e.tags||[]).slice(0,2).join(' · ') || 'No tags'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="num text-[14px] font-medium">{e.weight.toFixed(1)} <span className="text-mute text-[11px]">{e.unit}</span></div>
                      {diff != null && (
                        <div className={`text-[11px] ${diff>0?'text-warn':(diff<0?'text-good':'text-mute')}`}>
                          {diff>0?'+':''}{diff.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function SmallMetric({ label, value, unit }){
  return (
    <div className="bg-surface3 rounded-xl border border-line2 p-3">
      <div className="text-[10.5px] uppercase tracking-[0.18em] text-mute">{label}</div>
      <div className="mt-1.5 display text-lg font-semibold num">{value} <span className="text-mute text-[11px] font-normal">{unit}</span></div>
    </div>
  );
}

// ============================================================
// Log Weight page
// ============================================================
function LogWeightPage(){
  const { state, updateState } = useApp();
  const unit = state.settings.unit;

  const [editing, setEditing] = useState(null); // entry or null
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [sort, setSort] = useState('desc');

  const filtered = useMemo(()=>{
    let arr = entriesSortedAsc(state.entries);
    if (sort === 'desc') arr = [...arr].reverse();
    if (search) arr = arr.filter(e => e.date.includes(search));
    if (tagFilter) arr = arr.filter(e => (e.tags||[]).includes(tagFilter));
    return arr;
  }, [state.entries, search, tagFilter, sort]);

  const onDelete = (id) => {
    if (!confirm('Delete this entry?')) return;
    updateState({ entries: state.entries.filter(e=>e.id!==id) });
  };

  return (
    <div className="space-y-6 fadein">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">All entries</div>
          <h1 className="text-[28px] md:text-[32px] font-semibold tracking-tight">Log weight</h1>
          <div className="text-mute mt-1.5 text-[14px]">Add, edit, or remove daily weight entries.</div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={()=>{ setEditing(null); setShowNew(true); }}>
            <I.Plus className="h-4 w-4"/> New entry
          </Button>
        </div>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="flex flex-wrap gap-2 items-center p-4 border-b hairline">
          <div className="relative flex-1 min-w-[180px]">
            <I.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mute"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by date (YYYY-MM or YYYY-MM-DD)…" className="w-full bg-surface3 border border-line2 rounded-xl h-10 pl-9 pr-3 text-fg placeholder:text-mute2 focus-ring"/>
          </div>
          <Select value={tagFilter} onChange={e=>setTagFilter(e.target.value)}>
            <option value="">All tags</option>
            {TAG_LIST.map(t => <option key={t}>{t}</option>)}
          </Select>
          <Select value={sort} onChange={e=>setSort(e.target.value)}>
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </Select>
          <div className="text-[12.5px] text-mute ml-auto">{filtered.length} entries</div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<I.Scale className="h-5 w-5"/>} title="No matching entries" body="Try clearing your filters, or add a new entry." action={
            <Button onClick={()=>setShowNew(true)}><I.Plus className="h-4 w-4"/> New entry</Button>
          }/>
        ) : (
          <ul className="divide-y hairline">
            {filtered.map((e, i) => {
              const next = filtered[i+1];
              const diff = next ? (sort==='desc' ? e.weight - next.weight : next.weight - e.weight) : null;
              return (
                <li key={e.id} className="grid grid-cols-12 items-center gap-3 px-5 py-3 hover:bg-surface3/40 transition-colors group">
                  <div className="col-span-3 sm:col-span-3">
                    <div className="text-[13.5px] font-medium">{fmtLong(e.date)}</div>
                    <div className="text-[11.5px] text-mute">{e.date}</div>
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <div className="num text-[18px] font-semibold display">{e.weight.toFixed(1)} <span className="text-mute text-[11px] font-normal">{e.unit}</span></div>
                    {diff != null && (
                      <div className={`text-[11.5px] ${diff>0?'text-warn':(diff<0?'text-good':'text-mute')}`}>
                        {diff>0?'+':''}{diff.toFixed(1)} vs prev
                      </div>
                    )}
                  </div>
                  <div className="col-span-6 sm:col-span-5 flex flex-wrap gap-1.5">
                    {(e.tags||[]).slice(0,4).map(t => <Pill key={t}>{t}</Pill>)}
                    {(e.tags||[]).length > 4 && <span className="text-[11px] text-mute">+{e.tags.length-4}</span>}
                    {e.notes && <Pill tone="neutral"><I.Info className="h-3 w-3"/>Note</Pill>}
                  </div>
                  <div className="col-span-12 sm:col-span-2 flex justify-end gap-1 opacity-70 group-hover:opacity-100">
                    <IconButton onClick={()=>setEditing(e)}><I.Edit className="h-4 w-4"/></IconButton>
                    <IconButton onClick={()=>onDelete(e.id)}><I.Trash className="h-4 w-4"/></IconButton>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <EntryEditor
        open={showNew || !!editing}
        entry={editing}
        unit={unit}
        onClose={()=>{ setShowNew(false); setEditing(null); }}
        onSave={(entry)=>{
          const entries = state.entries.filter(e => e.id !== entry.id && e.date !== entry.date);
          entries.push(entry);
          updateState({ entries });
          setShowNew(false); setEditing(null);
        }}
        onDelete={(id)=>{
          updateState({ entries: state.entries.filter(e=>e.id!==id) });
          setEditing(null);
        }}
      />
    </div>
  );
}

function EntryEditor({ open, entry, unit, onClose, onSave, onDelete }){
  const [date, setDate] = useState(entry?.date || todayISO());
  const [weight, setWeight] = useState(entry?.weight != null ? String(entry.weight) : '');
  const [notes, setNotes] = useState(entry?.notes || '');
  const [tags, setTags] = useState(entry?.tags || []);
  const [u, setU] = useState(entry?.unit || unit);

  useEffect(()=>{
    setDate(entry?.date || todayISO());
    setWeight(entry?.weight != null ? String(entry.weight) : '');
    setNotes(entry?.notes || '');
    setTags(entry?.tags || []);
    setU(entry?.unit || unit);
  }, [entry, open, unit]);

  const save = () => {
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) return;
    onSave({
      id: entry?.id || ('e_' + Date.now()),
      date, weight: +w.toFixed(1), unit: u, notes, tags,
      createdAt: entry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={entry ? `Edit entry · ${fmtShort(entry.date)}` : 'New entry'}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">Date</label>
            <Input type="date" value={date} onChange={e=>setDate(e.target.value)} max={todayISO()} className="w-full"/>
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">Weight</label>
            <div className="flex gap-2">
              <Input type="number" step="0.1" value={weight} onChange={e=>setWeight(e.target.value)} placeholder="0.0" className="flex-1"/>
              <Select value={u} onChange={e=>setU(e.target.value)} className="!w-20">
                <option>lbs</option>
                <option>kg</option>
              </Select>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">Tags</label>
          <div className="flex flex-wrap gap-1.5">
            {TAG_LIST.map(t => (
              <button key={t} onClick={()=>setTags(tags.includes(t)?tags.filter(x=>x!==t):[...tags,t])}
                className={`px-2.5 h-7 text-[12px] rounded-full border transition-colors
                  ${tags.includes(t) ? 'bg-accent/15 text-accent border-accent/30' : 'bg-surface3 text-mute border-line2 hover:text-fg'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">Notes</label>
          <Textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} className="w-full" placeholder="Optional notes about today…"/>
        </div>
        <div className="flex items-center justify-between pt-2 border-t hairline">
          {entry ? (
            <Button variant="danger" size="sm" onClick={()=>onDelete(entry.id)}><I.Trash className="h-4 w-4"/> Delete</Button>
          ) : <div/>}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={save} disabled={!weight}>Save</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================
// Backfill / Import page
// ============================================================
function BackfillPage({ setRoute }){
  const { state, updateState } = useApp();
  const unit = state.settings.unit;
  const [mode, setMode] = useState('paste'); // paste | manual | csv

  const tabs = [
    { value:'paste', label:'Bulk paste' },
    { value:'manual', label:'Manual calendar' },
    { value:'csv',  label:'CSV upload' },
  ];

  return (
    <div className="space-y-6 fadein">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">Backfill</div>
          <h1 className="text-[28px] md:text-[32px] font-semibold tracking-tight">Bring your old data in.</h1>
          <div className="text-mute mt-1.5 text-[14px] max-w-2xl">Paste weights from your Notes app, type them in across a calendar, or upload a CSV — your trend dashboard will rebuild instantly.</div>
        </div>
        <Tabs tabs={tabs} value={mode} onChange={setMode}/>
      </div>

      {mode === 'paste' && <BulkPaste setRoute={setRoute}/>}
      {mode === 'manual' && <ManualCalendar/>}
      {mode === 'csv' && <CsvImport setRoute={setRoute}/>}
    </div>
  );
}

// ---- Bulk paste ----
function parsePasted(text, defaultUnit){
  // Returns { rows: [{date, weight, raw, ok, error?}], ok, errors }
  if (!text.trim()) return { rows: [] };
  const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  const rows = [];
  for (const raw of lines) {
    rows.push(parseLine(raw, defaultUnit));
  }
  return { rows };
}
const MONTHS = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 };

function parseLine(raw, defaultUnit){
  const orig = raw;
  let date = null, weight = null;
  // strip units
  let s = raw.replace(/[,;|\t]/g,' ').replace(/\s+/g,' ').trim();
  // Try ISO yyyy-mm-dd
  let m = s.match(/(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{2,3}(?:\.\d+)?)/);
  if (m){
    date = `${m[1]}-${pad(+m[2])}-${pad(+m[3])}`;
    weight = parseFloat(m[4]);
  }
  if (!weight) {
    m = s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\s+(\d{2,3}(?:\.\d+)?)/);
    if (m){
      const yy = m[3].length===2 ? 2000+(+m[3]) : +m[3];
      date = `${yy}-${pad(+m[1])}-${pad(+m[2])}`;
      weight = parseFloat(m[4]);
    }
  }
  if (!weight) {
    // "May 1 - 180.2" or "May 1 180.2"
    m = s.match(/([A-Za-z]{3,9})\s+(\d{1,2})(?:,?\s*(\d{2,4}))?\s*[-:\s]\s*(\d{2,3}(?:\.\d+)?)/);
    if (m){
      const month = MONTHS[m[1].slice(0,3).toLowerCase()];
      if (month != null){
        const year = m[3] ? (m[3].length===2 ? 2000+(+m[3]) : +m[3]) : new Date().getFullYear();
        date = `${year}-${pad(month+1)}-${pad(+m[2])}`;
        weight = parseFloat(m[4]);
      }
    }
  }
  if (!weight){
    return { raw: orig, ok:false, error:'Could not parse date or weight.' };
  }
  return { raw: orig, ok:true, date, weight, unit: defaultUnit };
}

function BulkPaste({ setRoute }){
  const { state, updateState } = useApp();
  const [text, setText] = useState('');
  const [u, setU] = useState(state.settings.unit);
  const [parsed, setParsed] = useState({ rows: [] });
  const [dupMode, setDupMode] = useState('replace'); // replace | skip
  const [imported, setImported] = useState(null);

  useEffect(()=>{ setParsed(parsePasted(text, u)); }, [text, u]);

  const goodRows = parsed.rows.filter(r=>r.ok);
  const badRows  = parsed.rows.filter(r=>!r.ok);
  const existingDates = new Set(state.entries.map(e=>e.date));
  const dupes = goodRows.filter(r => existingDates.has(r.date));
  const dateRange = goodRows.length ?
    `${fmtShort(goodRows.map(r=>r.date).sort()[0])} → ${fmtShort(goodRows.map(r=>r.date).sort().slice(-1)[0])}` : '—';

  const onImport = () => {
    let toAdd = [...goodRows];
    if (dupMode === 'skip'){
      toAdd = toAdd.filter(r => !existingDates.has(r.date));
    }
    const entries = state.entries.filter(e => {
      if (dupMode === 'replace') return !toAdd.some(r => r.date === e.date);
      return true;
    });
    toAdd.forEach(r => entries.push({
      id: 'bp_' + Date.now() + '_' + r.date,
      date: r.date,
      weight: +r.weight.toFixed(1),
      unit: u,
      notes: '',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    updateState({ entries });
    setImported({ count: toAdd.length });
  };

  if (imported){
    return (
      <Card className="text-center py-12">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-accent/15 text-accent flex items-center justify-center mb-4"><I.Check className="h-6 w-6"/></div>
        <h2 className="text-xl font-semibold">Imported {imported.count} entries.</h2>
        <p className="text-mute mt-2">Your trend dashboard is now updated.</p>
        <div className="mt-5 flex gap-2 justify-center">
          <Button onClick={()=>setRoute('dashboard')}>Go to dashboard</Button>
          <Button variant="secondary" onClick={()=>{ setText(''); setImported(null); }}>Import more</Button>
        </div>
      </Card>
    );
  }

  const samples = [
    `May 1 - 180.2\nMay 2 - 179.8\nMay 3 - 180.5\nMay 4 - 181.0\nMay 5 - 180.1`,
    `2026-05-01, 180.2\n2026-05-02, 179.8\n2026-05-03, 180.5`,
    `05/01/2026 180.2\n05/02/2026 179.8\n05/03/2026 180.5`,
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <div className="flex items-center justify-between mb-3">
          <SectionLabel className="!mb-0">Paste from Notes</SectionLabel>
          <div className="flex items-center gap-2 text-[12px] text-mute">
            <span>Unit</span>
            <Select value={u} onChange={e=>setU(e.target.value)} className="!h-8 !text-[12px]">
              <option>lbs</option>
              <option>kg</option>
            </Select>
          </div>
        </div>
        <Textarea
          rows={14}
          className="w-full font-mono text-[13px]"
          placeholder={`Examples:\n\n${samples[0]}\n\nor\n\n${samples[1]}`}
          value={text}
          onChange={e=>setText(e.target.value)}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {samples.map((s,i) => (
            <button key={i} onClick={()=>setText(s)} className="text-[11.5px] text-mute hover:text-fg border border-line2 px-2 py-1 rounded-md">
              Try sample {i+1}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <SectionLabel className="!mb-0">Preview</SectionLabel>
          {goodRows.length > 0 && (
            <div className="flex items-center gap-3 text-[11.5px] text-mute">
              <span><b className="text-fg num">{goodRows.length}</b> valid</span>
              {badRows.length > 0 && <span className="text-danger num">{badRows.length} errors</span>}
              {dupes.length > 0 && <span className="text-warn num">{dupes.length} duplicates</span>}
            </div>
          )}
        </div>

        {parsed.rows.length === 0 ? (
          <EmptyState icon={<I.Import className="h-5 w-5"/>} title="Paste data on the left" body="We'll auto-detect dates and weights, even from messy formats."/>
        ) : (
          <>
            <div className="bg-surface3 rounded-xl border border-line2 p-3 mb-3 text-[12.5px] grid grid-cols-3 gap-2">
              <div><div className="text-mute text-[10.5px] uppercase tracking-wider">Entries</div><div className="num font-medium mt-0.5">{goodRows.length}</div></div>
              <div><div className="text-mute text-[10.5px] uppercase tracking-wider">Date range</div><div className="font-medium mt-0.5">{dateRange}</div></div>
              <div><div className="text-mute text-[10.5px] uppercase tracking-wider">Unit</div><div className="font-medium mt-0.5">{u}</div></div>
            </div>

            <div className="max-h-[300px] overflow-auto border border-line2 rounded-xl">
              <table className="w-full text-[13px]">
                <thead className="text-mute text-[11px] uppercase tracking-wider">
                  <tr className="border-b hairline">
                    <th className="text-left px-3 py-2 font-medium">Date</th>
                    <th className="text-left px-3 py-2 font-medium">Weight</th>
                    <th className="text-left px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.rows.map((r, i) => (
                    <tr key={i} className="border-b hairline last:border-0">
                      <td className="px-3 py-1.5 num">{r.ok ? r.date : '—'}</td>
                      <td className="px-3 py-1.5 num">{r.ok ? r.weight.toFixed(1) + ' ' + u : <span className="text-mute">{r.raw}</span>}</td>
                      <td className="px-3 py-1.5">
                        {!r.ok
                          ? <Pill tone="danger"><I.X className="h-3 w-3"/>{r.error}</Pill>
                          : existingDates.has(r.date)
                            ? <Pill tone="warn">Duplicate</Pill>
                            : <Pill tone="good"><I.Check className="h-3 w-3"/>New</Pill>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {dupes.length > 0 && (
              <div className="mt-3 flex items-center gap-2 text-[12.5px]">
                <span className="text-mute">Duplicate dates →</span>
                <Select value={dupMode} onChange={e=>setDupMode(e.target.value)} className="!h-8 !text-[12px]">
                  <option value="replace">Replace existing</option>
                  <option value="skip">Skip duplicates</option>
                </Select>
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={()=>setText('')}>Clear</Button>
              <Button onClick={onImport} disabled={goodRows.length===0}>
                Import {goodRows.length} entries
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

// ---- Manual calendar ----
function ManualCalendar(){
  const { state, updateState } = useApp();
  const unit = state.settings.unit;
  const [cursor, setCursor] = useState(()=> { const d = new Date(); d.setDate(1); return d; });
  const [selected, setSelected] = useState(todayISO());
  const [val, setVal] = useState('');

  const entryByDate = useMemo(()=> {
    const m = new Map();
    state.entries.forEach(e => m.set(e.date, e));
    return m;
  }, [state.entries]);

  useEffect(()=>{
    const e = entryByDate.get(selected);
    setVal(e ? String(e.weight) : '');
  }, [selected, entryByDate]);

  const monthLabel = cursor.toLocaleDateString(undefined,{month:'long', year:'numeric'});
  const firstDay = new Date(cursor); firstDay.setDate(1);
  const startOffset = (firstDay.getDay() - state.settings.weekStartDay + 7) % 7;
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth()+1, 0).getDate();
  const cells = [];
  for (let i=0; i<startOffset; i++) cells.push(null);
  for (let d=1; d<=daysInMonth; d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));

  const dow = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const dowOrdered = [];
  for (let i=0;i<7;i++) dowOrdered.push(dow[(state.settings.weekStartDay+i)%7]);

  const save = (advance=null) => {
    const w = parseFloat(val);
    if (isNaN(w) || w <= 0) return;
    const entries = state.entries.filter(e => e.date !== selected);
    entries.push({
      id: 'mc_' + selected, date: selected, weight: +w.toFixed(1), unit, notes:'', tags:[],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });
    updateState({ entries });
    if (advance != null){
      const next = isoDate(addDays(selected, advance));
      setSelected(next);
      if (parseISO(next).getMonth() !== cursor.getMonth()){
        setCursor(new Date(parseISO(next).getFullYear(), parseISO(next).getMonth(), 1));
      }
    }
  };

  const onKey = (e) => {
    if (e.key === 'Enter'){ e.preventDefault(); save(-1); }
    if (e.key === 'ArrowLeft' && !val) { setSelected(isoDate(addDays(selected,-1))); }
    if (e.key === 'ArrowRight' && !val){ setSelected(isoDate(addDays(selected, 1))); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <IconButton onClick={()=>setCursor(new Date(cursor.getFullYear(), cursor.getMonth()-1, 1))}><I.Right className="h-4 w-4 rotate-180"/></IconButton>
            <div className="font-medium min-w-[160px] text-center">{monthLabel}</div>
            <IconButton onClick={()=>setCursor(new Date(cursor.getFullYear(), cursor.getMonth()+1, 1))}><I.Right className="h-4 w-4"/></IconButton>
          </div>
          <div className="text-[11.5px] text-mute">Click any past day to enter a weight.</div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center">
          {dowOrdered.map(d => <div key={d} className="text-[10.5px] uppercase tracking-wider text-mute py-1">{d}</div>)}
          {cells.map((d, i) => {
            if (!d) return <div key={i}/>;
            const iso = isoDate(d);
            const e = entryByDate.get(iso);
            const isSel = iso === selected;
            const isFuture = iso > todayISO();
            const isToday = iso === todayISO();
            return (
              <button key={i} disabled={isFuture}
                onClick={()=>setSelected(iso)}
                className={`relative aspect-square rounded-xl border text-left p-2 transition-all
                  ${isSel ? 'border-accent bg-accent/10 text-fg' : e ? 'border-line2 bg-surface3 hover:bg-[#E9E9E4]' : 'border-line hover:border-line2'}
                  ${isFuture ? 'opacity-30 cursor-not-allowed' : ''}`}>
                <div className={`text-[12px] ${isToday ? 'text-accent font-semibold' : 'text-mute'}`}>{d.getDate()}</div>
                {e && <div className="absolute bottom-1.5 left-2 right-2 num text-[12px] font-medium">{e.weight.toFixed(1)}</div>}
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <SectionLabel>Selected day</SectionLabel>
        <div className="text-[15px] font-medium">{fmtLong(selected)}</div>
        <div className="text-[11.5px] text-mute mb-4">{entryByDate.get(selected) ? 'Editing existing entry' : 'No entry yet'}</div>

        <input
          autoFocus type="number" inputMode="decimal" step="0.1"
          value={val} onChange={e=>setVal(e.target.value)} onKeyDown={onKey}
          placeholder="0.0"
          className="w-full bg-surface3 border border-line2 rounded-xl h-16 px-4 text-[32px] display font-semibold tabular-nums focus-ring text-center"
        />
        <div className="text-[11.5px] text-mute text-center mt-2 mb-4">Press <kbd className="px-1.5 py-0.5 bg-surface3 border border-line2 rounded text-fg font-mono text-[11px]">Enter</kbd> to save & jump to previous day</div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={()=>{ save(); setSelected(isoDate(addDays(selected,-1))); }}>← Save & prev</Button>
          <Button onClick={()=>{ save(); setSelected(isoDate(addDays(selected, 1))); }}>Save & next →</Button>
        </div>

        <div className="mt-4 pt-4 border-t hairline">
          <div className="text-[11px] uppercase tracking-[0.18em] text-mute mb-2">Tips</div>
          <ul className="text-[12.5px] text-mute space-y-1.5">
            <li>• Click any past date on the calendar to jump</li>
            <li>• Enter or Save & prev moves backward in time fast</li>
            <li>• Dates with existing entries show the weight</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

// ---- CSV import ----
function CsvImport({ setRoute }){
  const { state, updateState } = useApp();
  const [rows, setRows] = useState([]);
  const [u, setU] = useState(state.settings.unit);
  const [dupMode, setDupMode] = useState('replace');
  const [imported, setImported] = useState(null);

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result);
      const lines = text.split(/\r?\n/).filter(l=>l.trim());
      let header = null;
      const result = [];
      lines.forEach((l, i) => {
        const cols = l.split(/,/).map(s=>s.trim());
        if (i===0 && (/[a-z]/i).test(cols[0]) && !(/^\d{4}/).test(cols[0])){
          header = cols.map(c => c.toLowerCase());
          return;
        }
        const dateIdx = header ? header.findIndex(h => h.includes('date')) : 0;
        const wIdx    = header ? header.findIndex(h => h.includes('weight') || h.includes('value')) : 1;
        const dCell = cols[dateIdx >= 0 ? dateIdx : 0];
        const wCell = cols[wIdx >= 0 ? wIdx : 1];
        const parsed = parseLine(`${dCell} ${wCell}`, u);
        result.push(parsed);
      });
      setRows(result);
    };
    reader.readAsText(file);
  };

  const goodRows = rows.filter(r=>r.ok);
  const badRows = rows.filter(r=>!r.ok);
  const existingDates = new Set(state.entries.map(e=>e.date));
  const dupes = goodRows.filter(r => existingDates.has(r.date));

  const doImport = () => {
    let toAdd = [...goodRows];
    if (dupMode === 'skip') toAdd = toAdd.filter(r => !existingDates.has(r.date));
    const entries = state.entries.filter(e => {
      if (dupMode === 'replace') return !toAdd.some(r => r.date === e.date);
      return true;
    });
    toAdd.forEach(r => entries.push({
      id: 'csv_' + Date.now() + '_' + r.date, date: r.date, weight: +r.weight.toFixed(1), unit: u,
      notes: '', tags: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    }));
    updateState({ entries });
    setImported({ count: toAdd.length });
  };

  if (imported){
    return (
      <Card className="text-center py-12">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-accent/15 text-accent flex items-center justify-center mb-4"><I.Check className="h-6 w-6"/></div>
        <h2 className="text-xl font-semibold">Imported {imported.count} entries.</h2>
        <p className="text-mute mt-2">Your trend dashboard is now updated.</p>
        <div className="mt-5 flex gap-2 justify-center">
          <Button onClick={()=>setRoute('dashboard')}>Go to dashboard</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <SectionLabel>CSV file</SectionLabel>
        <div className="border-2 border-dashed border-line2 rounded-2xl p-8 text-center">
          <I.Download className="h-8 w-8 text-mute mx-auto mb-3 rotate-180"/>
          <div className="font-medium">Upload your CSV</div>
          <div className="text-[12.5px] text-mute mt-1">Columns: <code className="font-mono text-fg/80">date, weight</code></div>
          <label className="inline-flex mt-4">
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={e=>{ const f = e.target.files?.[0]; if (f) handleFile(f); }}/>
            <span className="btn inline-flex items-center justify-center gap-2 font-medium rounded-xl bg-accent text-bg hover:bg-fg h-10 px-4 text-sm cursor-pointer">
              Choose file
            </span>
          </label>
        </div>
        <div className="mt-4 text-[12.5px] text-mute">
          <div className="font-medium text-fg mb-1">Example</div>
          <pre className="bg-surface3 border border-line2 rounded-xl p-3 font-mono text-[12px] overflow-auto">
{`date,weight
2026-05-01,180.2
2026-05-02,179.8
2026-05-03,180.5`}
          </pre>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <SectionLabel className="!mb-0">Preview</SectionLabel>
          {rows.length > 0 && (
            <div className="flex items-center gap-3 text-[11.5px] text-mute">
              <span className="text-fg num">{goodRows.length}</span> valid
              {badRows.length > 0 && <span><span className="text-danger num">{badRows.length}</span> errors</span>}
              {dupes.length > 0 && <span><span className="text-warn num">{dupes.length}</span> duplicates</span>}
            </div>
          )}
        </div>
        {rows.length === 0 ? (
          <EmptyState icon={<I.Import className="h-5 w-5"/>} title="No file yet" body="Upload a CSV on the left to preview rows."/>
        ) : (
          <>
            <div className="max-h-[300px] overflow-auto border border-line2 rounded-xl">
              <table className="w-full text-[13px]">
                <thead className="text-mute text-[11px] uppercase tracking-wider">
                  <tr className="border-b hairline">
                    <th className="text-left px-3 py-2 font-medium">Date</th>
                    <th className="text-left px-3 py-2 font-medium">Weight</th>
                    <th className="text-left px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r,i) => (
                    <tr key={i} className="border-b hairline last:border-0">
                      <td className="px-3 py-1.5 num">{r.ok ? r.date : '—'}</td>
                      <td className="px-3 py-1.5 num">{r.ok ? r.weight.toFixed(1) + ' ' + u : <span className="text-mute">{r.raw}</span>}</td>
                      <td className="px-3 py-1.5">
                        {!r.ok ? <Pill tone="danger">Error</Pill>
                          : existingDates.has(r.date) ? <Pill tone="warn">Duplicate</Pill>
                          : <Pill tone="good">New</Pill>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {dupes.length > 0 && (
              <div className="mt-3 flex items-center gap-2 text-[12.5px]">
                <span className="text-mute">Duplicates →</span>
                <Select value={dupMode} onChange={e=>setDupMode(e.target.value)} className="!h-8 !text-[12px]">
                  <option value="replace">Replace existing</option>
                  <option value="skip">Skip duplicates</option>
                </Select>
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={()=>setRows([])}>Clear</Button>
              <Button onClick={doImport} disabled={goodRows.length===0}>Import {goodRows.length}</Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

// ---- attach ----
Object.assign(window, {
  Dashboard, LogWeightPage, BackfillPage, TrendChart, QuickLog, EntryEditor, SmallMetric, parseLine,
});
