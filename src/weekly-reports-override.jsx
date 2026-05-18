// weekly-reports-override.jsx — polished coach-style weekly reports

function weekStartName(weekStartDay){
  return Number(weekStartDay) === 0 ? 'Sunday' : 'Monday';
}

function reportWeekMeta(w, weekStartDay){
  const today = todayISO();
  const currentStart = weekKey(today, weekStartDay);
  const isCurrent = w.weekStart === currentStart;
  const elapsed = isCurrent ? Math.min(7, Math.max(1, daysBetween(w.weekStart, today) + 1)) : 7;
  const left = isCurrent ? Math.max(0, 7 - elapsed) : 0;
  const complete = !isCurrent;
  const coverage = complete ? `${w.count}/7` : `${w.count}/${elapsed}`;
  const coverageUnit = complete ? 'days' : 'days so far';
  const status = complete ? 'Complete week' : `In progress · day ${elapsed} of 7`;
  const leftText = complete ? '' : left === 0 ? 'Ends today' : `${left} day${left === 1 ? '' : 's'} left`;
  const countTone = complete
    ? (w.count >= 5 ? 'good' : w.count <= 2 ? 'warn' : 'neutral')
    : (w.count >= Math.max(1, elapsed - 1) ? 'good' : w.count <= Math.max(1, Math.floor(elapsed / 2)) ? 'warn' : 'neutral');

  return { isCurrent, elapsed, left, complete, coverage, coverageUnit, status, leftText, countTone };
}

function WeeklyReportsPage(){
  const { state, accent } = useApp();
  const unit = state.settings.unit;
  const wsd = state.settings.weekStartDay;
  const weeks = useMemo(()=>weeklyAverages(state.entries, wsd), [state.entries, wsd]);
  const reversed = [...weeks].reverse();
  const latest = reversed[0];
  const previous = reversed[1];
  const latestMeta = latest ? reportWeekMeta(latest, wsd) : null;
  const bestLogged = weeks.length ? Math.max(...weeks.map(w => w.count)) : 0;
  const avgLogs = weeks.length ? average(weeks.map(w => w.count)) : null;
  const latestCoach = latest ? buildWeeklyCoachReport(latest, previous, unit, state.goal, latestMeta) : null;

  return (
    <div className="space-y-6 fadein">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">Reports</div>
          <h1 className="text-[28px] md:text-[32px] font-semibold tracking-tight">Weekly reports</h1>
          <div className="text-mute mt-1.5 text-[14px] max-w-2xl">
            Weeks start on {weekStartName(wsd)}. Current weeks are marked in progress so you do not over-read an unfinished report.
          </div>
        </div>
        {latest && (
          <div className="flex flex-wrap gap-2 md:justify-end">
            <Pill tone="accent"><I.Sparkle className="h-3 w-3"/> Latest: {fmtShort(latest.weekStart)}–{fmtShort(latest.weekEnd)}</Pill>
            {latestMeta?.isCurrent && <Pill tone="neutral">{latestMeta.status}</Pill>}
          </div>
        )}
      </div>

      {reversed.length === 0 ? (
        <Card>
          <EmptyState icon={<I.Weekly className="h-5 w-5"/>} title="No weeks yet" body="Log a few days and weekly summaries will appear here."/>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat label="Latest weekly avg" value={latest ? latest.avg.toFixed(1) : '—'} unit={unit} tone="accent" />
            <Stat label="Change vs prior" value={latestCoach?.deltaLabel || '—'} unit={previous ? unit : ''} tone={latestCoach?.deltaTone || 'neutral'} />
            <Stat label={latestMeta?.isCurrent ? 'Logged this week' : 'Latest consistency'} value={latest ? latestMeta.coverage : '—'} unit={latest ? latestMeta.coverageUnit : 'days'} tone={latestMeta?.countTone || 'neutral'} />
            <Stat label="Best logging week" value={bestLogged ? `${bestLogged}/7` : '—'} unit="days" />
          </div>

          {latestCoach && (
            <Card className="overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                <div className="max-w-3xl">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Pill tone={latestCoach.deltaTone}><I.Sparkle className="h-3 w-3"/> Coach readout</Pill>
                    <Pill tone="neutral">Confidence: {latestCoach.confidence}</Pill>
                    {latestMeta?.isCurrent && <Pill tone="warn">{latestMeta.leftText || 'Week in progress'}</Pill>}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">{latestCoach.headline}</h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-fg/90">{latestCoach.summary}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 lg:min-w-[320px]">
                  <SmallMetric label="Low" value={latest.low.toFixed(1)} unit={unit}/>
                  <SmallMetric label="High" value={latest.high.toFixed(1)} unit={unit}/>
                  <SmallMetric label="Spread" value={(latest.high - latest.low).toFixed(1)} unit={unit}/>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                <CoachTile title="What mattered" body={latestCoach.whatMattered} />
                <CoachTile title="What to ignore" body={latestCoach.ignore} />
                <CoachTile title="Next move" body={latestCoach.nextMove} />
              </div>
            </Card>
          )}

          <Card>
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <SectionLabel className="!mb-0">Weekly average history</SectionLabel>
              <div className="text-[12px] text-mute">Avg logging: {avgLogs != null ? avgLogs.toFixed(1) : '—'}/7 days · weeks start {weekStartName(wsd)}</div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeks.map(w => ({ ...w, label: fmtShort(w.weekStart), meta: reportWeekMeta(w, wsd) }))} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="rgba(10,10,10,0.05)" vertical={false}/>
                <XAxis dataKey="label" tick={{ fontSize:11 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:11 }} axisLine={false} tickLine={false} width={36} domain={['dataMin - 1','dataMax + 1']}/>
                <RTooltip2
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0].payload;
                    const m = p.meta;
                    return (
                      <div className="bg-white border border-line2 rounded-xl px-3 py-2 shadow-pop text-[12px]">
                        <div className="text-mute mb-1">Week of {fmtShort(p.weekStart)} – {fmtShort(p.weekEnd)}</div>
                        {m?.isCurrent && <div className="text-warn mb-1">Current week · {m.status}</div>}
                        <div className="num">Avg: <b>{p.avg.toFixed(1)}</b> {unit}</div>
                        <div className="num">Logs: {m ? `${m.coverage} ${m.coverageUnit}` : `${p.count}/7 days`} · {p.low.toFixed(1)} – {p.high.toFixed(1)}</div>
                      </div>
                    );
                  }}
                  cursor={{ fill: 'rgba(10,10,10,0.04)' }}
                />
                <Bar dataKey="avg" fill={accent} radius={[6,6,0,0]} maxBarSize={28} isAnimationActive={true} animationDuration={500}/>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="space-y-3">
            {reversed.map((w, i) => {
              const prev = reversed[i+1];
              const meta = reportWeekMeta(w, wsd);
              const report = buildWeeklyCoachReport(w, prev, unit, state.goal, meta);
              return (
                <Card key={w.weekStart}>
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-mute">Week of</div>
                        {meta.isCurrent && <Pill tone="warn">In progress</Pill>}
                      </div>
                      <div className="font-medium text-[15px]">{fmtShort(w.weekStart)} – {fmtShort(w.weekEnd)}</div>
                      {meta.isCurrent && <div className="text-[12px] text-mute mt-1">{meta.status}{meta.leftText ? ` · ${meta.leftText}` : ''}</div>}
                      <div className="mt-3 display text-[28px] font-semibold num">{w.avg.toFixed(1)} <span className="text-mute text-sm font-normal">{unit}</span></div>
                      <div className={`text-[12.5px] mt-1 ${report.deltaTone==='warn'?'text-warn':report.deltaTone==='good'?'text-good':'text-mute'}`}>{report.deltaLabel} {prev ? 'vs prior week' : ''}</div>
                    </div>

                    <div className="col-span-12 md:col-span-3 grid grid-cols-2 gap-2 content-start">
                      <SmallMetric label={meta.isCurrent ? 'Logged so far' : 'Logged'} value={meta.coverage} unit={meta.coverageUnit}/>
                      <SmallMetric label="Range" value={`${w.low.toFixed(1)}–${w.high.toFixed(1)}`} unit={unit}/>
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <SectionLabel right={<Pill tone={report.deltaTone}><I.Sparkle className="h-3 w-3"/>Coach</Pill>}>Summary</SectionLabel>
                      <p className="text-[14px] leading-relaxed text-fg/90">{report.summary}</p>
                      {w.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5 items-center">
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
        </>
      )}
    </div>
  );
}

function CoachTile({ title, body }){
  return (
    <div className="rounded-2xl border border-line2 bg-surface3 p-4">
      <div className="text-[11px] uppercase tracking-[0.18em] text-mute mb-2">{title}</div>
      <p className="text-[13.5px] leading-relaxed text-fg/90">{body}</p>
    </div>
  );
}

function buildWeeklyCoachReport(w, prev, unit, goal, meta){
  const spread = w.high - w.low;
  const d = prev ? w.avg - prev.avg : null;
  const deltaLabel = d == null ? 'First report' : `${d > 0 ? '+' : ''}${d.toFixed(1)}`;
  const goalMode = goal?.mode || 'general';
  const inProgress = Boolean(meta?.isCurrent);

  let deltaTone = 'neutral';
  if (d != null) {
    if (Math.abs(d) < 0.3) deltaTone = 'neutral';
    else if (goalMode === 'fatloss') deltaTone = d < 0 ? 'good' : 'warn';
    else if (goalMode === 'musclegain') deltaTone = d > 0 ? 'good' : 'warn';
    else deltaTone = Math.abs(d) <= 0.7 ? 'good' : 'warn';
  }

  const confidence = inProgress
    ? (w.count >= Math.max(3, Math.min(6, meta.elapsed - 1)) ? 'Building' : 'Early')
    : (w.count >= 6 ? 'High' : w.count >= 4 ? 'Medium' : 'Low');

  let headline = inProgress ? 'This week is still forming.' : 'A useful week of data.';
  if (!prev && !inProgress) headline = 'Your first weekly report is ready.';
  else if (!prev && inProgress) headline = 'Your first weekly report is still building.';
  else if (Math.abs(d) < 0.3) headline = inProgress ? 'This week is close to steady so far.' : 'Your average was basically steady.';
  else if (d < 0) headline = inProgress ? `This week is down ${Math.abs(d).toFixed(1)} ${unit} so far.` : `Your weekly average moved down ${Math.abs(d).toFixed(1)} ${unit}.`;
  else headline = inProgress ? `This week is up ${d.toFixed(1)} ${unit} so far.` : `Your weekly average moved up ${d.toFixed(1)} ${unit}.`;

  let summary;
  if (inProgress) {
    const left = meta.leftText ? ` ${meta.leftText}.` : '';
    summary = `This week is not finished yet.${left} So far, your average is ${w.avg.toFixed(1)} ${unit} from ${w.count}/${meta.elapsed} possible logged days. Treat this as a live check-in, not a final weekly verdict.`;
  } else if (!prev || prev.count < 3) {
    summary = `This is an early report, so do not over-read it yet. Your weekly average was ${w.avg.toFixed(1)} ${unit}, based on ${w.count}/7 logged days. The next report will be more useful once there is a comparison week.`;
  } else if (Math.abs(d) < 0.3) {
    summary = `Your average held roughly steady this week. That is not failure — it means the week did not clearly move the trend. Daily scale noise can hide real progress for a while, especially if sleep, sodium, soreness, or digestion changed.`;
  } else if (d < 0) {
    summary = `Your weekly average decreased compared with the prior week. That is a stronger signal than a single low weigh-in because it uses the whole week instead of one random morning.`;
  } else {
    summary = `Your weekly average increased compared with the prior week. One higher week is not automatically fat gain, especially if the weekly range was wide or logging consistency was low.`;
  }

  let whatMattered = inProgress
    ? `You logged ${w.count}/${meta.elapsed} possible days so far this week.`
    : w.count >= 5
      ? `You logged ${w.count}/7 days, so this average has decent signal.`
      : `You logged ${w.count}/7 days, so treat this week as lower-confidence data.`;

  if (w.tags.length > 0) {
    whatMattered += ` Your most common tag was “${w.tags[0].tag},” which may explain some fluctuation.`;
  }

  const ignore = inProgress
    ? `Do not judge the full week yet. The report gets cleaner once the week closes.`
    : spread >= 4
      ? `Do not obsess over the high day. Your week ranged ${spread.toFixed(1)} ${unit}, which usually means water, food volume, soreness, or digestion played a role.`
      : `Do not overreact to one daily dot. The weekly average is the cleaner signal.`;

  let nextMove = inProgress ? 'Keep logging through the end of the week before making a big change.' : 'Keep logging and wait for the next weekly average before making a big change.';
  if (!inProgress) {
    if (goalMode === 'fatloss' && prev && d > 0.6) nextMove = 'Stay calm, but watch the next 7–14 days. If the average keeps rising, make one small nutrition or activity adjustment.';
    if (goalMode === 'fatloss' && prev && d < -1.5) nextMove = 'The drop is fast. Make sure training performance, hunger, and energy are still okay.';
    if (goalMode === 'musclegain' && prev && d > 1.0) nextMove = 'The gain is quick. Consider slowing the surplus if this repeats next week.';
    if (goalMode === 'musclegain' && prev && d <= 0) nextMove = 'If gaining is the goal and this repeats, you may need slightly more food.';
    if (goalMode === 'recomp') nextMove = 'For recomp, pair this with photos, measurements, and strength progress. The scale may move slowly.';
  }

  return { headline, summary, deltaLabel, deltaTone, confidence, whatMattered, ignore, nextMove };
}

Object.assign(window, { WeeklyReportsPage, buildWeeklyCoachReport, reportWeekMeta });