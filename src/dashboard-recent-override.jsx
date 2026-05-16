// dashboard-recent-override.jsx — dashboard override with editable recent entries

function Dashboard({ setRoute }){
  const { state, updateState } = useApp();
  const unit = state.settings.unit;
  const [range, setRange] = useState('30');
  const [editingEntry, setEditingEntry] = useState(null);

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

  const recent = useMemo(()=> entriesSortedAsc(state.entries).slice(-6).reverse(), [state.entries]);

  const saveDashboardEntry = (entry) => {
    const entries = state.entries.filter(e => e.id !== entry.id && e.date !== entry.date);
    entries.push(entry);
    updateState({ entries });
    setEditingEntry(null);
  };

  const deleteDashboardEntry = (id) => {
    if (!confirm('Delete this entry?')) return;
    updateState({ entries: state.entries.filter(e => e.id !== id) });
    setEditingEntry(null);
  };

  return (
    <div className="space-y-6 fadein">
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Current weight" value={fmtW(currentWeight)} unit={unit} sub={currentAvg ? `${(currentWeight - currentAvg) >= 0 ? '+' : ''}${(currentWeight - currentAvg).toFixed(1)} ${unit} vs avg` : '—'} />
        <Stat label="7-day average" value={fmtW(currentAvg)} unit={unit} sub={rate != null ? `${rate>=0?'+':''}${rate.toFixed(2)} ${unit}/week` : 'Building data…'} tone="accent" />
        <Stat label="Change vs last week" value={trend.change != null ? fmtDelta(trend.change) : '—'} unit={unit} sub={trendStatusInfo.label} tone={trend.status==='losing'?'good':(trend.status==='gaining'?'warn':'neutral')} />
        <Stat label="Trend confidence" value={conf.level} sub={`${consistency.count}/${consistency.of} days logged this week`} />
      </div>

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
                  <li key={e.id} className="group flex items-center justify-between gap-2 px-1 py-2.5">
                    <button onClick={()=>setEditingEntry(e)} className="min-w-0 flex-1 text-left rounded-xl p-1 -m-1 hover:bg-surface3/70 transition-colors">
                      <div className="text-[13.5px] font-medium">{fmtShort(e.date)}</div>
                      <div className="text-[11.5px] text-mute truncate max-w-[150px]">
                        {(e.tags||[]).slice(0,2).join(' · ') || e.notes || 'No tags'}
                      </div>
                    </button>
                    <div className="flex items-center gap-1">
                      <div className="text-right min-w-[58px]">
                        <div className="num text-[14px] font-medium">{e.weight.toFixed(1)} <span className="text-mute text-[11px]">{e.unit}</span></div>
                        {diff != null && <div className={`text-[11px] ${diff>0?'text-warn':(diff<0?'text-good':'text-mute')}`}>{diff>0?'+':''}{diff.toFixed(1)}</div>}
                      </div>
                      <div className="flex opacity-70 group-hover:opacity-100">
                        <IconButton className="!h-8 !w-8" onClick={()=>setEditingEntry(e)}><I.Edit className="h-3.5 w-3.5"/></IconButton>
                        <IconButton className="!h-8 !w-8 hover:text-danger" onClick={()=>deleteDashboardEntry(e.id)}><I.Trash className="h-3.5 w-3.5"/></IconButton>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <EntryEditor
        open={!!editingEntry}
        entry={editingEntry}
        unit={unit}
        onClose={()=>setEditingEntry(null)}
        onSave={saveDashboardEntry}
        onDelete={deleteDashboardEntry}
      />
    </div>
  );
}

Object.assign(window, { Dashboard });
