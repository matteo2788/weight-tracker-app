// onboarding.jsx — first-time setup flow

function OnboardingPage(){
  const { state, updateState, setRoute } = useApp();
  const profileName = state.profile?.name || 'there';

  const [step, setStep] = useState(0);
  const [unit, setUnit] = useState(state.settings?.unit || 'lbs');
  const [goalMode, setGoalMode] = useState(state.goal?.mode || state.settings?.defaultGoal || 'fatloss');
  const [startDate, setStartDate] = useState(state.goal?.startDate || todayISO());
  const [currentWeight, setCurrentWeight] = useState(state.goal?.startingWeight ? String(state.goal.startingWeight) : '');
  const [goalWeight, setGoalWeight] = useState(state.goal?.goalWeight ? String(state.goal.goalWeight) : '');
  const [targetPace, setTargetPace] = useState(state.goal?.targetPace ? String(state.goal.targetPace) : '1.0');
  const [comfortRange, setComfortRange] = useState(state.goal?.comfortRange ? String(state.goal.comfortRange) : '3');

  const goalOptions = [
    { value:'fatloss', label:'Lose weight', eyebrow:'Fat loss', body:'Use averages so normal water spikes do not mess with your head.', needsGoal:true, pace:'1.0' },
    { value:'musclegain', label:'Gain weight', eyebrow:'Muscle gain', body:'Track slow, controlled gaining without chasing random scale jumps.', needsGoal:true, pace:'0.5' },
    { value:'maintenance', label:'Maintain', eyebrow:'Stay steady', body:'Learn your normal range and stop overreacting to tiny changes.', needsGoal:false, range:true },
    { value:'recomp', label:'Recomp', eyebrow:'Build + lean out', body:'Track the trend while remembering the scale may move slowly.', needsGoal:false, range:true },
    { value:'general', label:'Just track', eyebrow:'Awareness', body:'Build the habit first. The app can become more goal-focused later.', needsGoal:false, range:true },
  ];

  const selectedGoal = goalOptions.find(g => g.value === goalMode) || goalOptions[0];
  const needsGoalWeight = !!selectedGoal.needsGoal;
  const steps = ['Start', 'Goal', 'Details', 'Finish'];
  const progress = ((step + 1) / steps.length) * 100;

  const selectGoal = (value) => {
    const picked = goalOptions.find(g => g.value === value);
    setGoalMode(value);
    if (picked?.pace) setTargetPace(picked.pace);
  };

  const parsedStart = parseFloat(currentWeight);
  const parsedGoal = parseFloat(goalWeight);
  const parsedPace = parseFloat(targetPace);
  const parsedRange = parseFloat(comfortRange);
  const hasStartWeight = !isNaN(parsedStart) && parsedStart > 0;

  const finish = (destination='dashboard') => {
    const safeStart = hasStartWeight ? +parsedStart.toFixed(1) : null;
    const safeGoal = !isNaN(parsedGoal) && parsedGoal > 0 ? +parsedGoal.toFixed(1) : null;
    const safePace = !isNaN(parsedPace) && parsedPace > 0 ? +parsedPace.toFixed(1) : selectedGoal.pace ? parseFloat(selectedGoal.pace) : 1.0;
    const safeRange = !isNaN(parsedRange) && parsedRange > 0 ? +parsedRange.toFixed(1) : null;
    const safeDate = startDate || todayISO();

    updateState(prev => {
      let entries = [...(prev.entries || [])];

      if (safeStart) {
        const existing = entries.find(e => e.date === safeDate);
        entries = entries.filter(e => e.date !== safeDate);
        entries.push({
          id: existing?.id || ('e_' + Date.now()),
          date: safeDate,
          weight: safeStart,
          unit,
          notes: existing?.notes || 'Starting weight added during setup.',
          tags: existing?.tags || [],
          createdAt: existing?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      return {
        ...prev,
        entries,
        settings: {
          ...prev.settings,
          unit,
          defaultGoal: goalMode,
        },
        goal: {
          ...prev.goal,
          mode: goalMode,
          startDate: safeDate,
          startingWeight: safeStart || prev.goal?.startingWeight || null,
          goalWeight: needsGoalWeight ? (safeGoal || prev.goal?.goalWeight || null) : null,
          targetPace: needsGoalWeight ? safePace : prev.goal?.targetPace || safePace,
          comfortRange: !needsGoalWeight ? safeRange : null,
          notes: goalMode === 'recomp'
            ? 'Recomp goal: scale progress may be slower because muscle gain and fat loss can happen together.'
            : prev.goal?.notes || '',
        },
        meta: {
          ...(prev.meta || {}),
          onboardingComplete: true,
          onboardingCompletedAt: new Date().toISOString(),
          onboardingGoalMode: goalMode,
        }
      };
    });

    setRoute(destination);
  };

  const skip = () => finish('dashboard');

  const canContinueDetails = step !== 2 || !needsGoalWeight || !goalWeight || (parseFloat(goalWeight) > 0);

  return (
    <div className="min-h-screen bg-bg text-fg flex items-center justify-center px-4 py-5 sm:p-6">
      <div className="w-full max-w-4xl bg-surface rounded-[1.75rem] card-ring overflow-hidden fadein">
        <div className="p-5 sm:p-7 border-b hairline">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-mute">First-time setup</div>
              <h1 className="text-[26px] sm:text-[34px] font-semibold tracking-tight mt-1">Build your dashboard</h1>
              <p className="text-sm text-mute mt-2 max-w-xl leading-relaxed">Answer a few quick questions so WeightLens starts useful instead of empty.</p>
            </div>
            <button onClick={skip} className="btn shrink-0 text-sm text-mute hover:text-fg">Skip</button>
          </div>

          <div className="h-2 rounded-full bg-surface3 overflow-hidden">
            <div className="h-full rounded-full bg-accent transition-all duration-300" style={{ width: `${progress}%` }}/>
          </div>
          <div className="mt-2 text-[12px] text-mute">Step {step + 1} of {steps.length} · {steps[step]}</div>
        </div>

        <div className="p-5 sm:p-7 min-h-[430px]">
          {step === 0 && (
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <Pill tone="accent" className="mb-4">Trend first, panic never</Pill>
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
                  Welcome{profileName !== 'there' ? `, ${profileName}` : ''}.
                </h2>
                <p className="text-mute mt-4 leading-relaxed max-w-xl">
                  The scale lies day to day. WeightLens looks at the pattern underneath the noise so you can make calmer decisions.
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <MiniSetupCard title="Averages" body="Your 7-day trend matters more than today’s number." />
                  <MiniSetupCard title="Goals" body="See pace, direction, and what is left clearly." />
                  <MiniSetupCard title="History" body="Import old weigh-ins or start fresh today." />
                </div>
              </div>

              <div className="rounded-3xl bg-surface3 border border-line2 p-5 sm:p-6">
                <div className="text-[11px] uppercase tracking-[0.18em] text-mute mb-4">Quick setup</div>
                <div className="space-y-3">
                  <SetupPreviewRow number="01" title="Pick your goal" />
                  <SetupPreviewRow number="02" title="Add starting details" />
                  <SetupPreviewRow number="03" title="Choose import or fresh start" />
                </div>
                <div className="mt-5 text-[12.5px] text-mute leading-relaxed">
                  Takes about 30 seconds. Everything can be changed later.
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-semibold tracking-tight">What are you trying to do?</h2>
                <p className="text-mute mt-3 leading-relaxed">Pick the closest goal. This changes the coaching language and setup questions.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {goalOptions.map(opt => (
                  <button key={opt.value} onClick={()=>selectGoal(opt.value)} className={`btn min-h-[150px] rounded-3xl border p-4 text-left items-start justify-start flex-col ${goalMode===opt.value ? 'bg-fg text-bg border-fg' : 'bg-surface3 text-fg border-line2 hover:border-accent/35'}`}>
                    <div className={`text-[10px] uppercase tracking-[0.18em] ${goalMode===opt.value ? 'text-bg/60' : 'text-mute'}`}>{opt.eyebrow}</div>
                    <div className="mt-2 font-semibold text-base leading-tight">{opt.label}</div>
                    <div className={`text-[12.5px] leading-relaxed mt-2 ${goalMode===opt.value ? 'text-bg/70' : 'text-mute'}`}>{opt.body}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-semibold tracking-tight">Add the starting details</h2>
                <p className="text-mute mt-3 leading-relaxed">
                  Only current weight is useful right away. The rest helps WeightLens estimate your goal progress.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] gap-4">
                <div className="rounded-3xl bg-surface3 border border-line2 p-5">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-mute">Selected goal</div>
                  <div className="mt-3 text-2xl font-semibold tracking-tight">{selectedGoal.label}</div>
                  <p className="mt-2 text-sm text-mute leading-relaxed">{selectedGoal.body}</p>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    {['lbs','kg'].map(u => (
                      <button key={u} onClick={()=>setUnit(u)} className={`btn rounded-2xl border px-3 py-3 text-sm font-semibold uppercase ${unit===u ? 'bg-fg text-bg border-fg' : 'bg-surface border-line2 text-fg'}`}>
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl bg-surface border border-line2 p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Start date">
                      <Input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} max={todayISO()} className="w-full" />
                    </Field>

                    <Field label="Current weight">
                      <div className="relative">
                        <Input className="w-full pr-14" type="number" inputMode="decimal" step="0.1" placeholder={unit === 'lbs' ? '154.3' : '70.0'} value={currentWeight} onChange={e=>setCurrentWeight(e.target.value)} />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-mute">{unit}</div>
                      </div>
                    </Field>

                    {needsGoalWeight ? (
                      <>
                        <Field label="Goal weight">
                          <div className="relative">
                            <Input className="w-full pr-14" type="number" inputMode="decimal" step="0.1" placeholder="Optional" value={goalWeight} onChange={e=>setGoalWeight(e.target.value)} />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-mute">{unit}</div>
                          </div>
                        </Field>

                        <Field label="Target pace">
                          <div className="relative">
                            <Input className="w-full pr-16" type="number" inputMode="decimal" step="0.1" placeholder={selectedGoal.pace || '1.0'} value={targetPace} onChange={e=>setTargetPace(e.target.value)} />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-mute">/wk</div>
                          </div>
                        </Field>
                      </>
                    ) : (
                      <Field label="Comfort range">
                        <div className="relative">
                          <Input className="w-full pr-14" type="number" inputMode="decimal" step="0.5" placeholder="3" value={comfortRange} onChange={e=>setComfortRange(e.target.value)} />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-mute">{unit}</div>
                        </div>
                      </Field>
                    )}
                  </div>

                  <div className="mt-5 rounded-2xl bg-surface3 border border-line2 p-3 text-[12.5px] text-mute leading-relaxed">
                    {hasStartWeight
                      ? `Nice. This will also create your first weight entry for ${fmtLong(startDate || todayISO())}.`
                      : 'You can leave this blank and log your first weight from the dashboard later.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-semibold tracking-tight">Start fresh or import history?</h2>
                <p className="text-mute mt-3 leading-relaxed">Old weigh-ins make the trend chart useful instantly, but starting fresh is completely fine.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={()=>finish('backfill')} className="btn min-h-[190px] rounded-3xl border border-line2 bg-surface3 p-6 text-left flex-col items-start justify-start hover:border-accent/40">
                  <div className="h-11 w-11 rounded-2xl bg-accent/15 text-accent flex items-center justify-center mb-4">
                    <I.Import className="h-5 w-5" />
                  </div>
                  <div className="text-xl font-semibold tracking-tight">Import old weights</div>
                  <div className="text-sm text-mute mt-2 leading-relaxed">Best if you have past weights in Notes, a spreadsheet, or screenshots.</div>
                </button>

                <button onClick={()=>finish('dashboard')} className="btn min-h-[190px] rounded-3xl border border-fg bg-fg text-bg p-6 text-left flex-col items-start justify-start">
                  <div className="h-11 w-11 rounded-2xl bg-white/12 text-bg flex items-center justify-center mb-4">
                    <I.Check className="h-5 w-5" />
                  </div>
                  <div className="text-xl font-semibold tracking-tight">Start fresh</div>
                  <div className="text-sm text-bg/70 mt-2 leading-relaxed">Go straight to the dashboard and build your trend from today.</div>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 sm:p-7 border-t hairline flex items-center justify-between gap-3 bg-surface/80">
          <Button variant="secondary" onClick={()=>setStep(Math.max(0, step-1))} disabled={step===0} className="disabled:opacity-40">
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={()=>setStep(Math.min(steps.length-1, step+1))} disabled={!canContinueDetails}>Continue</Button>
          ) : (
            <Button onClick={()=>finish('dashboard')}>Finish setup</Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }){
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function MiniSetupCard({ title, body }){
  return (
    <div className="bg-surface3 border border-line2 rounded-2xl p-4">
      <div className="font-medium">{title}</div>
      <div className="text-[12.5px] text-mute mt-1 leading-relaxed">{body}</div>
    </div>
  );
}

function SetupPreviewRow({ number, title }){
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface border border-line2 p-3">
      <div className="h-8 w-8 rounded-full bg-fg text-bg flex items-center justify-center text-xs font-semibold">{number}</div>
      <div className="text-sm font-medium">{title}</div>
    </div>
  );
}

Object.assign(window, { OnboardingPage });
