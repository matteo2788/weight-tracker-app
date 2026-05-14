// pages-trends.jsx — Trends, Weekly Reports, Goals

const { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip: RTooltip2, ResponsiveContainer: RC2, ReferenceLine, ComposedChart } = window.Recharts;

// ============================================================
// Trends page
// ============================================================
function TrendsPage(){
  const { state, accent } = useApp();
  const unit = state.settings.unit;
  const wsd = state.settings.weekStartDay;
  const [range, setRange] = useState('90');
  const [custom, setCustom] = useState({ from:'', to:'' });

  const filtered = useMemo(()=>{
    const sorted = entriesSortedAsc(state.entries);
    if (range === 'all') return sorted;
    if (range === 'custom') {
      if (!custom.from || !custom.to) return sorted;
      return sorted.filter(e => e.date >= custom.from && e.date <= custom.to);
    }
    const days = parseInt(range,10);
    return sorted.filter(e => daysBetween(e.date, todayISO()) <= days-1);
  }, [state.entries, range, custom]);

  const r7 = useMemo(()=>{
    const map = new Map(rolling7(state.entries).map(x=>[x.date, x.avg7]));
    return filtered.map(e => ({
      date: e.date,
      weight: e.weight,
      avg7: map.get(e.date) ?? null,
    }));
  }, [state.entries, filtered]);

  const weeks = useMemo(()=>weeklyAverages(filtered, wsd), [filtered, wsd]);
  const flux = useMemo(()=>normalFluctuation(filtered), [filtered]);

  // overall analysis
  const startAvg = weeks.find(w=>w.count>=3)?.avg;
  const endAvg = [...weeks].reverse().find(w=>w.count>=3)?.avg;
  const totalDelta = (startAvg!=null && endAvg!=null) ? endAvg - startAvg : null;
  const weeksBetween = weeks.length;
  const slope = totalDelta != null && weeksBetween > 1 ? totalDelta / (weeksBetween-1) : null;

  const high = filtered.length ? Math.max(...filtered.map(e=>e.weight)) : null;
  const low  = filtered.length ? Math.min(...filtered.map(e=>e.weight)) : null;
  const pct  = filtered.length && range !== 'all' ? (filtered.length / parseInt(range==='custom'?String(daysBetween(custom.from||todayISO(), custom.to||todayISO())+1):range,10)) : null;
  const streak = useMemo(()=>bestStreak(state.entries), [state.entries]);

  const ranges = [
    { value:'7', label:'7D' },
    { value:'30', label:'30D' },
    { value:'90', label:'90D' },
    { value:'180', label:'6M' },
    { value:'365', label:'1Y' },
    { value:'all', label:'All' },
    { value:'custom', label:'Custom' },
  ];

  // explanation text
  const explanation = useMemo(()=>{
    if (startAvg == null || endAvg == null) return "Log a few more weeks of data to see a long-term trend explanation.";
    const direction = totalDelta < -0.5 ? 'down' : (totalDelta > 0.5 ? 'up' : 'roughly flat');
    const rangeLabel = ranges.find(r=>r.value===range)?.label.toLowerCase() || range;
    if (direction === 'roughly flat'){
      return `Over the last ${rangeLabel}, your 7-day average moved from ${startAvg.toFixed(1)} to ${endAvg.toFixed(1)} ${unit} — essentially flat. Individual days bounced around, but the underlying trend is stable.`;
    }
    return `Over the last ${rangeLabel}, your 7-day average moved from ${startAvg.toFixed(1)} to ${endAvg.toFixed(1)} ${unit}. That means your real trend is ${direction} about ${Math.abs(totalDelta).toFixed(1)} ${unit}, even though individual days bounced around.`;
  }, [startAvg, endAvg, totalDelta, range, unit]);

  return (
    <div className="space-y-6 fadein">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">Analysis</div>
          <h1 className="text-[28px] md:text-[32px] font-semibold tracking-tight">Long-term trends</h1>
          <div className="text-mute mt-1.5 text-[14px]">Daily weight is noisy. Averages reveal the real direction.</div>
        </div>
        <Tabs tabs={ranges} value={range} onChange={setRange}/>
      </div>

      {range === 'custom' && (
        <Card className="!p-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[12px] text-mute uppercase tracking-wider">Range</span>
            <Input type="date" value={custom.from} onChange={e=>setCustom({...custom, from:e.target.value})}/>
            <span className="text-mute">→</span>
            <Input type="date" value={custom.to} onChange={e=>setCustom({...custom, to:e.target.value})}/>
          </div>
        </Card>
      )}

      <Card className="!p-0 overflow-hidden">
        <div className="p-5 pb-2 flex items-baseline justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-mute mb-1">Daily + 7-day rolling avg</div>
            <div className="display text-3xl font-semibold">{fmtW(endAvg)} <span className="text-mute text-base font-normal">{unit}</span></div>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-[0.18em] text-mute mb-1">Change</div>
            <div className={`display text-2xl font-semibold ${totalDelta < 0 ? 'text-good' : totalDelta > 0 ? 'text-warn' : 'text-fg'}`}>
              {totalDelta != null ? fmtDelta(totalDelta) : '—'} <span className="text-mute text-sm font-normal">{unit}</span>
            </div>
          </div>
        </div>
        <div className="px-2 pb-4">
          <ResponsiveContainer width="100%" height={360}>
            <ComposedChart data={r7} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="avgFill2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accent} stopOpacity="0.22"/>
                  <stop offset="100%" stopColor={accent} stopOpacity="0"/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(10,10,10,0.05)" vertical={false}/>
              <XAxis dataKey="date" tickFormatter={d=>fmtShort(d)} tick={{ fontSize:11 }} axisLine={false} tickLine={false} minTickGap={28}/>
              <YAxis tickFormatter={v=>v.toFixed(0)} tick={{ fontSize:11 }} axisLine={false} tickLine={false} width={36} domain={['dataMin - 1','dataMax + 1']}/>
              <RTooltip2 content={<ChartTooltip unit={unit}/>} cursor={{ stroke:'rgba(10,10,10,0.15)' }}/>
              <Area type="monotone" dataKey="avg7" stroke="none" fill="url(#avgFill2)" isAnimationActive={false}/>
              <Line type="linear" dataKey="weight" stroke="#CBD5E1" strokeWidth={1} dot={{ r:2, fill:'#94A3B8', strokeWidth:0 }} activeDot={{ r:3.5, fill:'#0A0A0A' }} connectNulls={false} isAnimationActive={false}/>
              <Line type="monotone" dataKey="avg7" stroke={accent} strokeWidth={2.5} dot={false} activeDot={{ r:4.5, fill: accent, stroke:'#FFFFFF', strokeWidth:2 }} isAnimationActive={true} animationDuration={500}/>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 shrink-0 rounded-xl bg-accent/15 text-accent flex items-center justify-center"><I.Sparkle className="h-4 w-4"/></div>
          <div>
            <SectionLabel className="!mb-1">What this range means</SectionLabel>
            <p className="text-[15px] leading-relaxed text-fg/90">{explanation}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Stat label="Avg weekly change" value={slope != null ? fmtDelta(slope) : '—'} unit={unit + '/wk'} tone={slope != null && slope < 0 ? 'good' : slope > 0 ? 'warn' : 'neutral'}/>
        <Stat label="Highest in range" value={fmtW(high)} unit={unit}/>
        <Stat label="Lowest in range"  value={fmtW(low)}  unit={unit}/>
        <Stat label="Normal fluctuation" value={flux != null ? '±' + flux.toFixed(1) : '—'} unit={unit}/>
        <Stat label="Best streak"      value={streak ? streak + 'd' : '—'} unit=""/>
        <Stat label="% days logged" value={pct != null ? Math.round(pct*100) + '%' : '—'} unit=""/>
      </div>

      <Card>
        <SectionLabel>Weekly averages</SectionLabel>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weeks.map(w => ({ ...w, label: fmtShort(w.weekStart) }))} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(10,10,10,0.05)" vertical={false}/>
            <XAxis dataKey="label" tick={{ fontSize:11 }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize:11 }} axisLine={false} tickLine={false} width={36} domain={['dataMin - 1','dataMax + 1']}/>
            <RTooltip2
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload;
                return (
                  <div className="bg-white border border-line2 rounded-xl px-3 py-2 shadow-pop text-[12px]">
                    <div className="text-mute mb-1">Week of {fmtShort(p.weekStart)} – {fmtShort(p.weekEnd)}</div>
                    <div className="num">Avg: <b>{p.avg.toFixed(1)}</b> {unit}</div>
                    <div className="num">Logs: {p.count}/7 · {p.low.toFixed(1)} – {p.high.toFixed(1)}</div>
                  </div>
                );
              }}
              cursor={{ fill: 'rgba(10,10,10,0.04)' }}
            />
            <Bar dataKey="avg" fill={accent} radius={[6,6,0,0]} maxBarSize={28} isAnimationActive={true} animationDuration={500}/>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

// ============================================================
// Weekly Reports
// ============================================================
function WeeklyReportsPage(){
  const { state } = useApp();
  const unit = state.settings.unit;
  const wsd = state.settings.weekStartDay;
  const weeks = useMemo(()=>weeklyAverages(state.entries, wsd), [state.entries, wsd]);
  const reversed = [...weeks].reverse();

  return (
    <div className="space-y-6 fadein">
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">Reports</div>
        <h1 className="text-[28px] md:text-[32px] font-semibold tracking-tight">Weekly reports</h1>
        <div className="text-mute mt-1.5 text-[14px]">A calm, coach-style readout of each week. Patterns reveal themselves over time.</div>
      </div>

      {reversed.length === 0 ? (
        <Card>
          <EmptyState icon={<I.Weekly className="h-5 w-5"/>} title="No weeks yet" body="Log a few days and weekly summaries will appear here."/>
        </Card>
      ) : (
        <div className="space-y-3">
          {reversed.map((w, i) => {
            const prev = reversed[i+1];
            const diff = prev ? w.avg - prev.avg : null;
            const summary = generateWeekSummary(w, prev, unit);
            return (
              <Card key={w.weekStart}>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 md:col-span-3">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-mute">Week of</div>
                    <div className="font-medium text-[15px]">{fmtShort(w.weekStart)} – {fmtShort(w.weekEnd)}</div>
                    <div className="mt-3 display text-[28px] font-semibold num">{w.avg.toFixed(1)} <span className="text-mute text-sm font-normal">{unit}</span></div>
                    {diff != null && (
                      <div className={`text-[12.5px] mt-1 ${diff>0?'text-warn':diff<0?'text-good':'text-mute'}`}>
                        {diff>0?'+':''}{diff.toFixed(1)} vs prev week
                      </div>
                    )}
                  </div>

                  <div className="col-span-12 md:col-span-3 grid grid-cols-2 gap-2 content-start">
                    <SmallMetric label="Logged" value={w.count + '/7'} unit="days"/>
                    <SmallMetric label="Range" value={`${w.low.toFixed(1)}–${w.high.toFixed(1)}`} unit={unit}/>
                  </div>

                  <div className="col-span-12 md:col-span-6">
                    <SectionLabel right={<Pill tone="accent"><I.Sparkle className="h-3 w-3"/>Coach</Pill>}>Summary</SectionLabel>
                    <p className="text-[14px] leading-relaxed text-fg/90">{summary}</p>
                    {w.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="text-[11px] text-mute uppercase tracking-wider">Top tags</span>
                        {w.tags.slice(0,4).map(t => <Pill key={t.tag}>{t.tag} <span className="text-mute2">×{t.count}</span></Pill>)}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function generateWeekSummary(w, prev, unit){
  const lines = [];
  if (!prev || prev.count < 3) {
    lines.push(`This is your first full week of data — give it another week before drawing conclusions.`);
  } else {
    const d = w.avg - prev.avg;
    if (Math.abs(d) < 0.3) {
      lines.push(`Your average held roughly steady this week (${d>=0?'+':''}${d.toFixed(1)} ${unit}). That's normal — bodies don't move in straight lines.`);
    } else if (d < 0) {
      lines.push(`Your average moved down ${Math.abs(d).toFixed(1)} ${unit} from last week. The trend is heading in the direction you set.`);
    } else {
      lines.push(`Your average is up ${d.toFixed(1)} ${unit}. One week up does not mean fat gain — give it a few more weeks before changing course.`);
    }
  }
  const spread = w.high - w.low;
  if (spread > 4){
    const spikeDay = w.entries.reduce((a,b)=>b.weight>a.weight?b:a, w.entries[0]);
    const tagHints = (spikeDay.tags||[]).slice(0,2).join(' and ').toLowerCase();
    lines.push(`One day spiked to ${w.high.toFixed(1)} ${unit}${tagHints ? ` after ${tagHints}` : ''}, but it returned to normal within a few days — typical water fluctuation.`);
  }
  if (w.count >= 6) lines.push(`Logging ${w.count}/7 days made this week's average reliable.`);
  else if (w.count <= 2) lines.push(`Only ${w.count} log${w.count===1?'':'s'} this week — consider this a low-confidence reading.`);
  return lines.join(' ');
}

// ============================================================
// Goals
// ============================================================
function GoalsPage(){
  const { state, updateState } = useApp();
  const unit = state.settings.unit;
  const goal = state.goal;
  const setGoal = (patch) => updateState({ goal: { ...goal, ...patch } });

  const modes = [
    { id:'fatloss',    label:'Fat loss',    desc:'Slow, steady downward trend.' },
    { id:'musclegain', label:'Muscle gain', desc:'Slow controlled gain — strength matters more.' },
    { id:'maintenance',label:'Maintenance', desc:'Stay within a normal range.' },
    { id:'recomp',     label:'Recomposition', desc:'Weight may move slowly. Track strength & photos too.' },
    { id:'general',    label:'General tracking', desc:'Neutral analysis, no goal judgment.' },
  ];

  const r7 = useMemo(()=>rolling7(state.entries), [state.entries]);
  const currentAvg = r7[r7.length-1]?.avg7 ?? null;
  const rate = useMemo(()=>weeklyRate(state.entries, state.settings.weekStartDay), [state.entries, state.settings.weekStartDay]);

  // Coach assessment
  const assessment = useMemo(()=>{
    if (rate == null || currentAvg == null) return null;
    switch (goal.mode){
      case 'fatloss':
        if (rate < -1.5) return { tone:'warn', msg:`You're trending down quickly (${rate.toFixed(2)} ${unit}/wk). Make sure energy, strength, and recovery are still okay.` };
        if (rate < 0 && rate >= -1.2) return { tone:'good', msg:`Your average is moving down at a sustainable pace.` };
        if (rate >= 0 && rate < 0.3) return { tone:'neutral', msg:`Weight is roughly flat. You may need more time, or small adjustments — don't change everything at once.` };
        return { tone:'neutral', msg:`Average is moving up. Give it another week or two before making changes.` };
      case 'musclegain':
        if (rate > 1.0) return { tone:'warn', msg:`Gaining fast — much of this could be fat or water. Consider slowing the pace.` };
        if (rate > 0.1) return { tone:'good', msg:`Slow, controlled gain. Strength and training quality matter more than the scale here.` };
        return { tone:'neutral', msg:`Weight is roughly flat. You may need slightly more food to support the gain.` };
      case 'maintenance':
        if (Math.abs(rate) < 0.4) return { tone:'good', msg:`You're holding steady inside your maintenance range.` };
        return { tone:'neutral', msg:`Your average is drifting ${rate>0?'up':'down'}. Worth a look at the past 2 weeks.` };
      case 'recomp':
        return { tone:'neutral', msg:`Weight may move slowly during recomp. Lean on measurements, photos, and strength — not the scale alone.` };
      default:
        return { tone:'neutral', msg:`Neutral tracking mode. Numbers below; no judgment.` };
    }
  }, [goal.mode, rate, currentAvg, unit]);

  return (
    <div className="space-y-6 fadein">
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">Goal</div>
        <h1 className="text-[28px] md:text-[32px] font-semibold tracking-tight">Goals</h1>
        <div className="text-mute mt-1.5 text-[14px]">Your goal shapes how WeightLens interprets progress.</div>
      </div>

      <Card>
        <SectionLabel>Goal mode</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {modes.map(m => (
            <button key={m.id} onClick={()=>setGoal({ mode: m.id })}
              className={`text-left rounded-xl p-3.5 border transition-all
                ${goal.mode === m.id ? 'border-accent bg-accent/8' : 'border-line2 bg-surface3 hover:border-line2 hover:bg-[#26262a]'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="font-medium text-[13.5px]">{m.label}</div>
                {goal.mode === m.id && <I.Check className="h-4 w-4 text-accent"/>}
              </div>
              <div className="text-[11.5px] text-mute leading-snug">{m.desc}</div>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <SectionLabel>Starting weight</SectionLabel>
          <div className="flex gap-2">
            <Input type="number" step="0.1" className="flex-1"
              value={goal.startingWeight ?? ''}
              onChange={e=>setGoal({ startingWeight: e.target.value ? +e.target.value : null })}/>
            <div className="px-3 h-10 flex items-center text-mute text-sm bg-surface3 border border-line2 rounded-xl">{unit}</div>
          </div>
          <label className="block text-[11px] uppercase tracking-[0.18em] text-mute mt-3 mb-1.5">Start date</label>
          <Input type="date" className="w-full" value={goal.startDate || ''} onChange={e=>setGoal({ startDate: e.target.value })} max={todayISO()}/>
        </Card>

        <Card>
          <SectionLabel>Goal weight <span className="text-mute2 normal-case tracking-normal">(optional)</span></SectionLabel>
          <div className="flex gap-2">
            <Input type="number" step="0.1" className="flex-1"
              value={goal.goalWeight ?? ''}
              onChange={e=>setGoal({ goalWeight: e.target.value ? +e.target.value : null })}/>
            <div className="px-3 h-10 flex items-center text-mute text-sm bg-surface3 border border-line2 rounded-xl">{unit}</div>
          </div>
          <label className="block text-[11px] uppercase tracking-[0.18em] text-mute mt-3 mb-1.5">Target pace</label>
          <div className="flex gap-2">
            <Input type="number" step="0.1" className="flex-1"
              value={goal.targetPace ?? ''}
              onChange={e=>setGoal({ targetPace: e.target.value ? +e.target.value : null })}/>
            <div className="px-3 h-10 flex items-center text-mute text-sm bg-surface3 border border-line2 rounded-xl">{unit}/wk</div>
          </div>
        </Card>

        <Card>
          <SectionLabel right={<Pill tone={assessment?.tone || 'neutral'}><I.Sparkle className="h-3 w-3"/>Coach</Pill>}>Where you are</SectionLabel>
          <div className="display text-2xl font-semibold num">{fmtW(currentAvg)} <span className="text-mute text-sm font-normal">{unit}</span></div>
          <div className="text-[12.5px] text-mute mt-0.5">7-day average · {rate != null ? `${rate>=0?'+':''}${rate.toFixed(2)} ${unit}/wk` : 'building data…'}</div>
          {assessment && (
            <p className="text-[13.5px] leading-relaxed text-fg/90 mt-4">{assessment.msg}</p>
          )}
        </Card>
      </div>

      <Card>
        <SectionLabel>Notes</SectionLabel>
        <Textarea rows={3} className="w-full" placeholder="Optional notes about your goal, context, or non-scale wins…" value={goal.notes || ''} onChange={e=>setGoal({ notes: e.target.value })}/>
      </Card>
    </div>
  );
}

// attach
Object.assign(window, { TrendsPage, WeeklyReportsPage, GoalsPage, generateWeekSummary });
