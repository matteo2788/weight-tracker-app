// insights-override.jsx — personalized data-driven Insights page
// Loaded after pages-misc.jsx to replace the original InsightsPage.

function getThisWeekEntries(entries, weekStartDay){
  const today = todayISO();
  const start = weekKey(today, weekStartDay);
  const end = isoDate(addDays(start, 6));
  return entries.filter(e => e.date >= start && e.date <= end);
}

function getPreviousWeekEntries(entries, weekStartDay){
  const today = todayISO();
  const thisStart = weekKey(today, weekStartDay);
  const prevStart = isoDate(addDays(thisStart, -7));
  const prevEnd = isoDate(addDays(prevStart, 6));
  return entries.filter(e => e.date >= prevStart && e.date <= prevEnd);
}

function getWeekendSpike(entries){
  const sorted = entriesSortedAsc(entries).slice(-90);
  if (sorted.length < 21) return null;

  const weekend = sorted.filter(e => {
    const day = parseISO(e.date).getDay();
    return day === 0 || day === 6;
  });
  const weekday = sorted.filter(e => {
    const day = parseISO(e.date).getDay();
    return day >= 1 && day <= 5;
  });

  if (weekend.length < 6 || weekday.length < 10) return null;

  const weekendAvg = average(weekend.map(e => e.weight));
  const weekdayAvg = average(weekday.map(e => e.weight));
  const diff = weekendAvg - weekdayAvg;

  return { weekendAvg, weekdayAvg, diff };
}

function getMissingRecentDays(entries, days=14){
  const logged = new Set((entries || []).map(e => e.date));
  const today = todayISO();
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = isoDate(addDays(today, -i));
    if (!logged.has(date)) out.push(date);
  }
  return out;
}

function buildPersonalInsights(state){
  const entries = entriesSortedAsc(state.entries || []);
  const unit = state.settings?.unit || 'lbs';
  const weekStartDay = state.settings?.weekStartDay ?? 1;
  const goal = state.goal || {};
  const cards = [];

  if (entries.length === 0) {
    cards.push({ tone:'neutral', title:'No data yet', value:'Start logging', body:'Log your first weigh-in. After a few days, this page will start showing personalized insights from your own trend.', action:'Add a weight entry', route:'log' });
    return cards;
  }

  const rolling = rolling7(entries);
  const validRolling = rolling.filter(x => x.avg7 != null);
  const latestAvg = validRolling[validRolling.length - 1]?.avg7 ?? null;
  const prevAvg = validRolling.length >= 8 ? validRolling[validRolling.length - 8].avg7 : null;
  const avgDelta7 = latestAvg != null && prevAvg != null ? latestAvg - prevAvg : null;
  const rate = weeklyRate(entries, weekStartDay);
  const fluctuation = normalFluctuation(entries);
  const thisWeek = getThisWeekEntries(entries, weekStartDay);
  const prevWeek = getPreviousWeekEntries(entries, weekStartDay);
  const thisWeekAvg = thisWeek.length ? average(thisWeek.map(e => e.weight)) : null;
  const prevWeekAvg = prevWeek.length ? average(prevWeek.map(e => e.weight)) : null;
  const weekDelta = thisWeekAvg != null && prevWeekAvg != null ? thisWeekAvg - prevWeekAvg : null;
  const streak = loggingStreak(entries);
  const logPercent = loggingPercent(entries, 14);
  const weekend = getWeekendSpike(entries);

  cards.push({
    tone: avgDelta7 == null ? 'neutral' : avgDelta7 < -0.2 ? 'good' : avgDelta7 > 0.2 ? 'warn' : 'neutral',
    title: '7-day average change',
    value: avgDelta7 == null ? 'Building' : `${avgDelta7 >= 0 ? '+' : ''}${avgDelta7.toFixed(1)} ${unit}`,
    body: avgDelta7 == null ? 'You need a few more logged days before the app can compare your current 7-day average to last week.' : Math.abs(avgDelta7) < 0.2 ? 'Your 7-day average is basically flat compared with a week ago. That usually means your trend is stable, not broken.' : `Your 7-day average is ${avgDelta7 > 0 ? 'up' : 'down'} ${Math.abs(avgDelta7).toFixed(1)} ${unit} compared with a week ago. This is more useful than judging one morning.`
  });

  cards.push({
    tone: thisWeek.length >= 5 ? 'good' : thisWeek.length >= 3 ? 'neutral' : 'warn',
    title: 'This week’s logging',
    value: `${thisWeek.length}/7`,
    body: thisWeek.length >= 5 ? 'Great consistency. A week with 5+ logs gives your averages way more trust than random single weigh-ins.' : thisWeek.length >= 3 ? 'Decent start. A few more weigh-ins this week will make the average more reliable.' : 'Low logging this week. The trend can still help, but confidence is lower until you log more days.'
  });

  cards.push({
    tone: 'neutral',
    title: 'Normal fluctuation range',
    value: fluctuation == null ? 'Building' : `±${fluctuation.toFixed(1)} ${unit}`,
    body: fluctuation == null ? 'After more entries, WeightLens will estimate your normal day-to-day scale noise.' : `Your usual day-to-day movement is about ±${fluctuation.toFixed(1)} ${unit}. Spikes inside that range are usually normal water, food, sodium, sleep, or training noise.`
  });

  cards.push({
    tone: streak >= 7 ? 'good' : streak >= 3 ? 'neutral' : 'warn',
    title: 'Current logging streak',
    value: `${streak} day${streak === 1 ? '' : 's'}`,
    body: streak >= 7 ? 'Strong streak. This is exactly how you make the trend trustworthy.' : streak >= 3 ? 'Nice momentum. Keep it boring and consistent.' : 'No stress — just log tomorrow morning. The goal is consistency, not perfection.'
  });

  if (weekDelta != null) {
    cards.push({
      tone: weekDelta < -0.3 ? 'good' : weekDelta > 0.3 ? 'warn' : 'neutral',
      title: 'Week vs previous week',
      value: `${weekDelta >= 0 ? '+' : ''}${weekDelta.toFixed(1)} ${unit}`,
      body: Math.abs(weekDelta) < 0.3 ? 'This week is almost identical to last week. That is a stable trend, not automatically a plateau.' : `This week’s average is ${weekDelta > 0 ? 'higher' : 'lower'} than last week by ${Math.abs(weekDelta).toFixed(1)} ${unit}. Use this with your goal, not in isolation.`
    });
  }

  if (rate != null) {
    let goalTone = 'neutral';
    let goalBody = `Your recent pace is ${rate >= 0 ? '+' : ''}${rate.toFixed(2)} ${unit}/week.`;
    if (goal.mode === 'fatloss') {
      if (rate < -0.3 && rate > -1.5) { goalTone = 'good'; goalBody = `Your trend is moving down at a reasonable fat-loss pace: ${Math.abs(rate).toFixed(2)} ${unit}/week.`; }
      else if (rate <= -1.5) { goalTone = 'warn'; goalBody = `You are trending down fast: ${Math.abs(rate).toFixed(2)} ${unit}/week. Watch recovery, hunger, and gym performance.`; }
      else if (rate > 0.3) { goalTone = 'warn'; goalBody = 'Your trend is moving up even though your goal is fat loss. Look at the last 2 weeks before changing anything drastic.'; }
    }
    if (goal.mode === 'musclegain') {
      if (rate > 0.15 && rate < 1.0) { goalTone = 'good'; goalBody = `Your trend is moving up slowly: ${rate.toFixed(2)} ${unit}/week. That is usually better for lean gaining than rushing.`; }
      else if (rate >= 1.0) { goalTone = 'warn'; goalBody = `Your gain rate is pretty fast: ${rate.toFixed(2)} ${unit}/week. Some of that may be water or fat.`; }
    }
    cards.push({ tone: goalTone, title: 'Goal alignment', value: rate >= 0 ? `+${rate.toFixed(2)}` : rate.toFixed(2), body: goalBody });
  }

  if (weekend && Math.abs(weekend.diff) >= 0.4) {
    cards.push({
      tone: weekend.diff > 0 ? 'neutral' : 'good',
      title: 'Weekend pattern',
      value: `${weekend.diff >= 0 ? '+' : ''}${weekend.diff.toFixed(1)} ${unit}`,
      body: weekend.diff > 0 ? `Your weekend average has been about ${weekend.diff.toFixed(1)} ${unit} higher than weekdays recently. That can happen from restaurant meals, later eating, sodium, or changed routine.` : 'Your weekend average has actually been lower than weekdays recently. Your routine may be tighter on weekends, or this may just be normal data noise.'
    });
  }

  cards.push({
    tone: logPercent >= 0.75 ? 'good' : logPercent >= 0.5 ? 'neutral' : 'warn',
    title: '14-day data quality',
    value: `${Math.round(logPercent * 100)}%`,
    body: logPercent >= 0.75 ? 'Your recent data quality is strong. The app can trust your averages more.' : logPercent >= 0.5 ? 'Your data is usable, but a few more logs would make insights sharper.' : 'Your recent data is a little thin. Log more often before making big decisions from the trend.'
  });

  return cards;
}

function InsightToneIcon({ tone }){
  const cls = tone === 'good' ? 'text-good bg-good/10' : tone === 'warn' ? 'text-warn bg-warn/10' : 'text-accent bg-accent/10';
  return <div className={`h-9 w-9 shrink-0 rounded-xl flex items-center justify-center ${cls}`}>{tone === 'good' ? <I.Check className="h-4 w-4"/> : tone === 'warn' ? <I.Alert className="h-4 w-4"/> : <I.Sparkle className="h-4 w-4"/>}</div>;
}

function PersonalizedInsightCard({ card, onAction }){
  return (
    <Card className="h-full">
      <div className="flex items-start gap-3">
        <InsightToneIcon tone={card.tone}/>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-[0.18em] text-mute mb-1">{card.title}</div>
          <div className="text-2xl font-semibold tracking-tight num">{card.value}</div>
          <p className="text-[13px] text-mute mt-2 leading-relaxed">{card.body}</p>
          {card.action && <Button className="mt-4" variant="secondary" onClick={onAction}>{card.action}</Button>}
        </div>
      </div>
    </Card>
  );
}

function MissingDaysCard({ state, setRoute }){
  const missing14 = getMissingRecentDays(state.entries || [], 14);
  const missing30 = getMissingRecentDays(state.entries || [], 30);
  const quality = Math.round(((14 - missing14.length) / 14) * 100);
  const tone = quality >= 75 ? 'good' : quality >= 50 ? 'neutral' : 'warn';

  return (
    <Card>
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
        <div className="max-w-2xl">
          <Pill tone={tone}><I.Calendar className="h-3 w-3"/> Data health</Pill>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">{missing14.length === 0 ? 'Your last 14 days are complete.' : `${missing14.length} missing day${missing14.length === 1 ? '' : 's'} in the last 14`}</h2>
          <p className="mt-2 text-[14px] text-mute leading-relaxed">
            {missing14.length === 0
              ? 'Nice. Your recent trend is much more trustworthy because there are no gaps in the last two weeks.'
              : 'Missing days do not ruin the app, but filling them in makes your 7-day averages, weekly reports, and goal pace much more accurate.'}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 lg:min-w-[320px]">
          <SmallMetric label="14-day quality" value={`${quality}%`} unit="" />
          <SmallMetric label="Missing 14d" value={String(missing14.length)} unit="days" />
          <SmallMetric label="Missing 30d" value={String(missing30.length)} unit="days" />
        </div>
      </div>

      {missing14.length > 0 && (
        <div className="mt-5">
          <div className="text-[11px] uppercase tracking-[0.18em] text-mute mb-2">Dates to backfill</div>
          <div className="flex flex-wrap gap-2">
            {missing14.map(d => <Pill key={d} tone="warn">{fmtShort(d)}</Pill>)}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={()=>setRoute('backfill')}><I.Import className="h-4 w-4"/> Backfill missing days</Button>
            <Button variant="secondary" onClick={()=>setRoute('log')}><I.Plus className="h-4 w-4"/> Log one entry</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function InsightsPage(){
  const { state, setRoute } = useApp();
  const [open, setOpen] = useState(null);
  const personalized = useMemo(()=>buildPersonalInsights(state), [state]);

  return (
    <div className="space-y-6 fadein">
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">Personalized · upgraded</div>
        <h1 className="text-[28px] md:text-[32px] font-semibold tracking-tight">Insights</h1>
        <div className="text-mute mt-1.5 text-[14px] max-w-2xl">WeightLens reads your logs and turns them into plain-English coaching.</div>
      </div>

      <MissingDaysCard state={state} setRoute={setRoute}/>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {personalized.map((card, i) => <PersonalizedInsightCard key={card.title + i} card={card} onAction={()=>card.route && setRoute(card.route)}/>)}
      </div>

      <div className="pt-2">
        <div className="text-[11px] uppercase tracking-[0.18em] text-mute mb-3">Education library</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {INSIGHT_CARDS.map((c) => (
            <button key={c.title} onClick={()=>setOpen(c)} className="text-left group">
              <Card className="h-full hover:border-line2 transition-colors">
                <div className="flex items-start gap-3 mb-2">
                  <div className="h-9 w-9 shrink-0 rounded-xl bg-accent/10 text-accent flex items-center justify-center"><I.Sparkle className="h-4 w-4"/></div>
                  <div className="flex-1"><Pill>{c.tag}</Pill></div>
                  <I.Right className="h-4 w-4 text-mute opacity-0 group-hover:opacity-100 transition-opacity mt-2"/>
                </div>
                <h3 className="text-[16px] font-semibold leading-snug tracking-tight">{c.title}</h3>
                <p className="text-[13px] text-mute mt-2 leading-relaxed">{c.excerpt}</p>
              </Card>
            </button>
          ))}
        </div>
      </div>

      <Modal open={!!open} onClose={()=>setOpen(null)} title={open?.title || ''} maxWidth="max-w-2xl">
        {open && <div className="space-y-4"><Pill>{open.tag}</Pill>{open.body.split('\n\n').map((para,i) => <p key={i} className="text-[14.5px] leading-relaxed text-fg/90 whitespace-pre-line">{para}</p>)}</div>}
      </Modal>
    </div>
  );
}

window.InsightsPage = InsightsPage;
try { (0, eval)('InsightsPage = window.InsightsPage'); } catch(e) {}
Object.assign(window, { InsightsPage, buildPersonalInsights, getMissingRecentDays, MissingDaysCard });
