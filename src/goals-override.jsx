// goals-override.jsx — smarter Goal Coach page
// Loaded after pages-trends.jsx to replace the original GoalsPage.

function goalModeLabel(mode){
  return ({
    fatloss: 'Fat loss',
    musclegain: 'Muscle gain',
    maintenance: 'Maintenance',
    recomp: 'Recomposition',
    general: 'General tracking'
  })[mode] || 'General tracking';
}

function buildGoalCoach({ goal, currentAvg, rate, unit }){
  if (currentAvg == null) {
    return {
      tone: 'neutral',
      headline: 'Build your baseline first',
      body: 'Log a few weigh-ins so WeightLens can compare your current trend against your goal.'
    };
  }

  if (rate == null) {
    return {
      tone: 'neutral',
      headline: 'Almost enough data',
      body: `Your current 7-day average is ${currentAvg.toFixed(1)} ${unit}. Add a few more days and the app will judge your weekly pace.`
    };
  }

  const absRate = Math.abs(rate);

  if (goal.mode === 'fatloss') {
    if (rate <= -1.5) return { tone: 'warn', headline: 'Losing fast', body: `Your trend is about ${absRate.toFixed(2)} ${unit}/week down. That can work short term, but watch energy, training performance, and recovery.` };
    if (rate < -0.3) return { tone: 'good', headline: 'Good fat-loss pace', body: `Your trend is moving down at about ${absRate.toFixed(2)} ${unit}/week. That is a calm, useful direction.` };
    if (rate <= 0.3) return { tone: 'neutral', headline: 'Mostly flat right now', body: 'Your average is not moving much yet. Give it more data before changing everything.' };
    return { tone: 'warn', headline: 'Moving opposite your goal', body: `Your trend is up about ${rate.toFixed(2)} ${unit}/week. Check the last two weeks before making a big adjustment.` };
  }

  if (goal.mode === 'musclegain') {
    if (rate >= 1.0) return { tone: 'warn', headline: 'Gaining quickly', body: `Your trend is up about ${rate.toFixed(2)} ${unit}/week. Some of that may be water or fat, not just muscle.` };
    if (rate > 0.15) return { tone: 'good', headline: 'Controlled gain', body: `Your trend is up about ${rate.toFixed(2)} ${unit}/week. Pair this with strength progress and good training.` };
    return { tone: 'neutral', headline: 'Gain is slow or flat', body: 'If strength is not improving either, you may need slightly more food or better recovery.' };
  }

  if (goal.mode === 'maintenance') {
    if (Math.abs(rate) <= 0.35) return { tone: 'good', headline: 'Stable maintenance', body: `Your weekly trend is only ${rate >= 0 ? '+' : ''}${rate.toFixed(2)} ${unit}/week. That is a solid maintenance range.` };
    return { tone: 'neutral', headline: 'Slight drift', body: `Your trend is ${rate > 0 ? 'up' : 'down'} about ${absRate.toFixed(2)} ${unit}/week. Not a panic, just worth watching.` };
  }

  if (goal.mode === 'recomp') {
    return { tone: 'neutral', headline: 'Recomp needs more than scale data', body: 'For recomposition, use weight trend with measurements, photos, and gym performance. Flat scale weight can still be progress.' };
  }

  return { tone: 'neutral', headline: 'Neutral tracking', body: `Your current trend is ${rate >= 0 ? '+' : ''}${rate.toFixed(2)} ${unit}/week. No judgment, just data.` };
}

function estimateGoalProgress({ goal, currentAvg, rate }){
  const hasGoal = goal.goalWeight != null && currentAvg != null;
  const targetPace = Math.abs(goal.targetPace || 0);

  if (!hasGoal) {
    return {
      remaining: null,
      weeksByTarget: null,
      weeksByCurrent: null,
      paceNeeded: null,
      percent: null,
      etaText: 'Add a goal weight to unlock ETA.'
    };
  }

  const remainingRaw = goal.goalWeight - currentAvg;
  const remaining = Math.abs(remainingRaw);
  const targetDirection = remainingRaw < 0 ? 'down' : 'up';
  const weeksByTarget = targetPace > 0 ? remaining / targetPace : null;

  const currentMovesTowardGoal = rate != null && ((targetDirection === 'down' && rate < 0) || (targetDirection === 'up' && rate > 0));
  const weeksByCurrent = currentMovesTowardGoal ? remaining / Math.abs(rate) : null;

  let percent = null;
  if (goal.startingWeight != null) {
    const total = Math.abs(goal.goalWeight - goal.startingWeight);
    const done = Math.abs(currentAvg - goal.startingWeight);
    if (total > 0) percent = Math.max(0, Math.min(100, (done / total) * 100));
  }

  const etaWeeks = weeksByCurrent || weeksByTarget;
  const etaText = etaWeeks == null
    ? 'ETA will appear once your trend points toward the goal.'
    : etaWeeks < 1
      ? 'Less than 1 week at this pace.'
      : `${Math.ceil(etaWeeks)} weeks at ${weeksByCurrent ? 'your current' : 'target'} pace.`;

  return { remaining, weeksByTarget, weeksByCurrent, paceNeeded: targetPace, percent, etaText };
}

function GoalsPage(){
  const { state, updateState, setRoute } = useApp();
  const unit = state.settings.unit;
  const goal = state.goal;
  const setGoal = (patch) => updateState({ goal: { ...goal, ...patch } });

  const modes = [
    { id:'fatloss', label:'Fat loss', desc:'Trend down without panic.' },
    { id:'musclegain', label:'Muscle gain', desc:'Slow gain with strength.' },
    { id:'maintenance', label:'Maintenance', desc:'Stay inside your range.' },
    { id:'recomp', label:'Recomp', desc:'Use scale + measurements.' },
    { id:'general', label:'General', desc:'Track without judgment.' },
  ];

  const r7 = useMemo(()=>rolling7(state.entries), [state.entries]);
  const currentAvg = r7[r7.length-1]?.avg7 ?? null;
  const currentWeight = r7[r7.length-1]?.weight ?? null;
  const rate = useMemo(()=>weeklyRate(state.entries, state.settings.weekStartDay), [state.entries, state.settings.weekStartDay]);
  const coach = useMemo(()=>buildGoalCoach({ goal, currentAvg, rate, unit }), [goal, currentAvg, rate, unit]);
  const progress = useMemo(()=>estimateGoalProgress({ goal, currentAvg, rate }), [goal, currentAvg, rate]);

  const paceLabel = rate == null ? 'Building data…' : `${rate >= 0 ? '+' : ''}${rate.toFixed(2)} ${unit}/week`;
  const remainingText = progress.remaining == null ? '—' : `${progress.remaining.toFixed(1)} ${unit}`;
  const percentText = progress.percent == null ? '—' : `${Math.round(progress.percent)}%`;

  return (
    <div className="space-y-6 fadein">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">Goal coach</div>
          <h1 className="text-[28px] md:text-[32px] font-semibold tracking-tight">Goals</h1>
          <div className="text-mute mt-1.5 text-[14px] max-w-2xl">Set the direction. WeightLens compares your actual trend against the pace you want.</div>
        </div>
        <Button variant="secondary" onClick={()=>setRoute && setRoute('backfill')}>
          <I.Import className="h-4 w-4"/> Add old data
        </Button>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="p-5 md:p-6 border-b hairline flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-mute mb-2">Current goal</div>
            <div className="text-2xl md:text-3xl font-semibold tracking-tight">{goalModeLabel(goal.mode)}</div>
            <div className="text-mute mt-2 text-[13.5px] leading-relaxed max-w-2xl">{coach.body}</div>
          </div>
          <Pill tone={coach.tone}><I.Sparkle className="h-3 w-3"/>{coach.headline}</Pill>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-y lg:divide-y-0 hairline">
          <div className="p-5">
            <div className="text-[11px] uppercase tracking-[0.18em] text-mute">Current avg</div>
            <div className="mt-2 text-2xl font-semibold num">{fmtW(currentAvg)} <span className="text-mute text-sm font-normal">{unit}</span></div>
            <div className="text-[12px] text-mute mt-1">latest: {fmtW(currentWeight)} {unit}</div>
          </div>
          <div className="p-5">
            <div className="text-[11px] uppercase tracking-[0.18em] text-mute">Current pace</div>
            <div className="mt-2 text-2xl font-semibold num">{rate == null ? '—' : `${rate >= 0 ? '+' : ''}${rate.toFixed(2)}`}</div>
            <div className="text-[12px] text-mute mt-1">{paceLabel}</div>
          </div>
          <div className="p-5">
            <div className="text-[11px] uppercase tracking-[0.18em] text-mute">Remaining</div>
            <div className="mt-2 text-2xl font-semibold num">{remainingText}</div>
            <div className="text-[12px] text-mute mt-1">to goal weight</div>
          </div>
          <div className="p-5">
            <div className="text-[11px] uppercase tracking-[0.18em] text-mute">Progress</div>
            <div className="mt-2 text-2xl font-semibold num">{percentText}</div>
            <div className="text-[12px] text-mute mt-1">from start to goal</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <SectionLabel>Goal setup</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 mb-5">
            {modes.map(m => (
              <button key={m.id} onClick={()=>setGoal({ mode: m.id })}
                className={`text-left rounded-xl p-3.5 border transition-all ${goal.mode === m.id ? 'border-accent bg-accent/10' : 'border-line2 bg-surface3 hover:border-line2'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-medium text-[13.5px]">{m.label}</div>
                  {goal.mode === m.id && <I.Check className="h-4 w-4 text-accent"/>}
                </div>
                <div className="text-[11.5px] text-mute leading-snug">{m.desc}</div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">Starting weight</label>
              <div className="flex gap-2">
                <Input type="number" step="0.1" className="flex-1" value={goal.startingWeight ?? ''} onChange={e=>setGoal({ startingWeight: e.target.value ? +e.target.value : null })}/>
                <div className="px-3 h-10 flex items-center text-mute text-sm bg-surface3 border border-line2 rounded-xl">{unit}</div>
              </div>
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">Start date</label>
              <Input type="date" className="w-full" value={goal.startDate || ''} onChange={e=>setGoal({ startDate: e.target.value })} max={todayISO()}/>
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">Goal weight</label>
              <div className="flex gap-2">
                <Input type="number" step="0.1" className="flex-1" value={goal.goalWeight ?? ''} onChange={e=>setGoal({ goalWeight: e.target.value ? +e.target.value : null })}/>
                <div className="px-3 h-10 flex items-center text-mute text-sm bg-surface3 border border-line2 rounded-xl">{unit}</div>
              </div>
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">Target pace</label>
              <div className="flex gap-2">
                <Input type="number" step="0.1" className="flex-1" value={goal.targetPace ?? ''} onChange={e=>setGoal({ targetPace: e.target.value ? +e.target.value : null })}/>
                <div className="px-3 h-10 flex items-center text-mute text-sm bg-surface3 border border-line2 rounded-xl">{unit}/wk</div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <SectionLabel right={<Pill tone="accent"><I.Sparkle className="h-3 w-3"/>ETA</Pill>}>Projected timeline</SectionLabel>
          <div className="text-[13.5px] text-mute leading-relaxed">{progress.etaText}</div>

          <div className="mt-5 space-y-3">
            <SmallMetric label="Target pace ETA" value={progress.weeksByTarget == null ? '—' : Math.ceil(progress.weeksByTarget) + 'w'} unit="" />
            <SmallMetric label="Current pace ETA" value={progress.weeksByCurrent == null ? '—' : Math.ceil(progress.weeksByCurrent) + 'w'} unit="" />
            <SmallMetric label="Needed pace" value={progress.paceNeeded ? progress.paceNeeded.toFixed(1) : '—'} unit={unit + '/wk'} />
          </div>

          {progress.percent != null && (
            <div className="mt-5">
              <div className="h-2 rounded-full bg-surface3 overflow-hidden">
                <div className="h-full rounded-full bg-accent" style={{ width: `${progress.percent}%` }}/>
              </div>
              <div className="text-[12px] text-mute mt-2">{Math.round(progress.percent)}% of the start-to-goal path.</div>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <SectionLabel>Goal notes</SectionLabel>
        <Textarea rows={3} className="w-full" placeholder="Optional notes about your goal, context, or non-scale wins…" value={goal.notes || ''} onChange={e=>setGoal({ notes: e.target.value })}/>
      </Card>
    </div>
  );
}

Object.assign(window, { GoalsPage, buildGoalCoach, estimateGoalProgress });
