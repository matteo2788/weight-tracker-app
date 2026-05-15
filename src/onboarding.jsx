// onboarding.jsx — first-time setup flow

function OnboardingPage(){
  const { state, updateState, setRoute } = useApp();
  const profileName = state.profile?.name || 'there';

  const [step, setStep] = useState(0);
  const [unit, setUnit] = useState(state.settings?.unit || 'lbs');
  const [goalMode, setGoalMode] = useState(state.goal?.mode || state.settings?.defaultGoal || 'fatloss');
  const [currentWeight, setCurrentWeight] = useState(state.goal?.startingWeight ? String(state.goal.startingWeight) : '');
  const [goalWeight, setGoalWeight] = useState(state.goal?.goalWeight ? String(state.goal.goalWeight) : '');
  const [targetPace, setTargetPace] = useState(state.goal?.targetPace ? String(state.goal.targetPace) : '1.0');

  const steps = ['Welcome', 'Units', 'Goal', 'Details', 'Import'];
  const progress = ((step + 1) / steps.length) * 100;

  const goalOptions = [
    { value:'fatloss', label:'Fat loss', body:'Track the trend down without overreacting to daily spikes.' },
    { value:'musclegain', label:'Muscle gain', body:'Track slow gain while watching consistency and averages.' },
    { value:'maintenance', label:'Maintenance', body:'Keep your weight stable and learn your normal range.' },
    { value:'recomp', label:'Recomposition', body:'Track changes without obsessing over one scale number.' },
    { value:'general', label:'General tracking', body:'Just understand your body better over time.' },
  ];

  const finish = (destination='dashboard') => {
    const start = parseFloat(currentWeight);
    const goal = parseFloat(goalWeight);
    const pace = parseFloat(targetPace);

    updateState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        unit,
        defaultGoal: goalMode,
      },
      goal: {
        ...prev.goal,
        mode: goalMode,
        startDate: prev.goal?.startDate || todayISO(),
        startingWeight: !isNaN(start) && start > 0 ? +start.toFixed(1) : prev.goal?.startingWeight || null,
        goalWeight: !isNaN(goal) && goal > 0 ? +goal.toFixed(1) : prev.goal?.goalWeight || null,
        targetPace: !isNaN(pace) && pace > 0 ? +pace.toFixed(1) : prev.goal?.targetPace || 1.0,
      },
      meta: {
        ...(prev.meta || {}),
        onboardingComplete: true,
        onboardingCompletedAt: new Date().toISOString(),
      }
    }));

    setRoute(destination);
  };

  const skip = () => finish('dashboard');

  return (
    <div className="min-h-screen bg-bg text-fg flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl bg-surface rounded-3xl card-ring overflow-hidden fadein">
        <div className="p-5 sm:p-7 border-b hairline">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-mute">Setup</div>
              <h1 className="text-[26px] sm:text-[32px] font-semibold tracking-tight mt-1">Set up WeightLens</h1>
            </div>
            <button onClick={skip} className="btn text-sm text-mute hover:text-fg">Skip</button>
          </div>
          <div className="h-2 rounded-full bg-surface3 overflow-hidden">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }}/>
          </div>
          <div className="mt-2 text-[12px] text-mute">Step {step + 1} of {steps.length} · {steps[step]}</div>
        </div>

        <div className="p-5 sm:p-7">
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Welcome{profileName !== 'there' ? `, ${profileName}` : ''}.</h2>
                <p className="text-mute mt-3 leading-relaxed max-w-xl">
                  Let’s make your dashboard useful right away. This takes less than a minute, and you can change everything later in Settings.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MiniSetupCard title="Track trends" body="Use weekly averages instead of noisy daily jumps." />
                <MiniSetupCard title="Understand spikes" body="Water, sodium, sleep, and workouts can move the scale." />
                <MiniSetupCard title="Import history" body="Bring old Notes data in whenever you’re ready." />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">What unit do you use?</h2>
                <p className="text-mute mt-2">Pick the unit you normally weigh yourself with.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {['lbs','kg'].map(u => (
                  <button key={u} onClick={()=>setUnit(u)} className={`btn rounded-2xl border p-5 text-left ${unit===u ? 'bg-fg text-bg border-fg' : 'bg-surface3 text-fg border-line2'}`}>
                    <div className="text-xl font-semibold uppercase">{u}</div>
                    <div className={`text-sm mt-1 ${unit===u ? 'text-bg/70' : 'text-mute'}`}>{u === 'lbs' ? 'Pounds' : 'Kilograms'}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">What are you tracking for?</h2>
                <p className="text-mute mt-2">This changes the language and goal framing, not your data.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {goalOptions.map(opt => (
                  <button key={opt.value} onClick={()=>setGoalMode(opt.value)} className={`btn rounded-2xl border p-4 text-left ${goalMode===opt.value ? 'bg-fg text-bg border-fg' : 'bg-surface3 text-fg border-line2'}`}>
                    <div className="font-semibold">{opt.label}</div>
                    <div className={`text-[12.5px] leading-relaxed mt-1 ${goalMode===opt.value ? 'text-bg/70' : 'text-mute'}`}>{opt.body}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Add starting details</h2>
                <p className="text-mute mt-2">Optional, but it makes goal cards and progress estimates more useful.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">Current weight</label>
                  <div className="relative">
                    <Input className="w-full pr-14" type="number" inputMode="decimal" step="0.1" placeholder="154.3" value={currentWeight} onChange={e=>setCurrentWeight(e.target.value)} />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-mute">{unit}</div>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">Goal weight</label>
                  <div className="relative">
                    <Input className="w-full pr-14" type="number" inputMode="decimal" step="0.1" placeholder="Optional" value={goalWeight} onChange={e=>setGoalWeight(e.target.value)} />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-mute">{unit}</div>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">Target pace</label>
                  <div className="relative">
                    <Input className="w-full pr-16" type="number" inputMode="decimal" step="0.1" placeholder="1.0" value={targetPace} onChange={e=>setTargetPace(e.target.value)} />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-mute">/wk</div>
                  </div>
                </div>
              </div>
              <div className="text-[12.5px] text-mute leading-relaxed bg-surface3 border border-line2 rounded-2xl p-3">
                Tip: You do not need to chase a perfect pace. WeightLens is built to show the trend, not make you panic over one morning.
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Do you have old weigh-ins?</h2>
                <p className="text-mute mt-2">Importing old data makes the chart useful immediately. Starting fresh is fine too.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button onClick={()=>finish('backfill')} className="btn rounded-2xl border border-line2 bg-surface3 p-5 text-left hover:border-accent/40">
                  <I.Import className="h-5 w-5 text-accent mb-3" />
                  <div className="font-semibold">Import old weights</div>
                  <div className="text-sm text-mute mt-1 leading-relaxed">Paste from Notes, enter past days, or upload CSV.</div>
                </button>
                <button onClick={()=>finish('dashboard')} className="btn rounded-2xl border border-fg bg-fg text-bg p-5 text-left">
                  <I.Check className="h-5 w-5 mb-3" />
                  <div className="font-semibold">Start fresh</div>
                  <div className="text-sm text-bg/70 mt-1 leading-relaxed">Go to your dashboard and log your first entry.</div>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 sm:p-7 border-t hairline flex items-center justify-between gap-3">
          <Button variant="secondary" onClick={()=>setStep(Math.max(0, step-1))} disabled={step===0} className="disabled:opacity-40">
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={()=>setStep(Math.min(steps.length-1, step+1))}>Continue</Button>
          ) : (
            <Button onClick={()=>finish('dashboard')}>Finish setup</Button>
          )}
        </div>
      </div>
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

Object.assign(window, { OnboardingPage });
