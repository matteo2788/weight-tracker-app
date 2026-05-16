// functional-goals.js — real goal system for WeightLens
(function installFunctionalGoals(){
  const e = React.createElement;
  const useState = React.useState;
  const useMemo = React.useMemo;

  const today = () => new Date().toISOString().slice(0,10);
  const unitOf = (state) => state?.settings?.unit || 'lbs';
  const num = (value) => Number.isFinite(Number(value)) ? Number(value) : null;
  const one = (value) => Number.isFinite(Number(value)) ? Number(value).toFixed(1) : '—';
  const signed = (value) => Number.isFinite(Number(value)) ? `${Number(value) > 0 ? '+' : ''}${Number(value).toFixed(1)}` : '—';
  const clamp = (value,min,max) => Math.max(min, Math.min(max, value));

  function safeEntries(state){
    return [...(state?.entries || [])].sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  }

  function rollingAverage(entries){
    return entries.map((entry,index)=>{
      const slice = entries.slice(Math.max(0,index-6), index+1).map(x=>Number(x.weight)).filter(Number.isFinite);
      return {
        ...entry,
        weight:Number(entry.weight),
        avg7:slice.length ? slice.reduce((a,b)=>a+b,0)/slice.length : Number(entry.weight)
      };
    });
  }

  function stats(state){
    const entries = safeEntries(state);
    const rolled = rollingAverage(entries);
    const latest = entries[entries.length - 1] || null;
    const avg7 = rolled.length ? rolled[rolled.length - 1].avg7 : null;
    const prev = rolled.length > 7 ? rolled[rolled.length - 8].avg7 : null;
    const weeklyRate = avg7 != null && prev != null ? avg7 - prev : null;
    return { entries, latest, avg7, weeklyRate, unit: unitOf(state) };
  }

  function cleanNumber(value){
    if(value === '' || value === null || value === undefined) return '';
    const n = Number(value);
    return Number.isFinite(n) ? n : '';
  }

  function goalModeLabel(mode){
    return ({ fatloss:'Fat loss', musclegain:'Muscle gain', maintenance:'Maintenance', recomp:'Recomposition', general:'General tracking' })[mode] || 'General tracking';
  }

  function analyzeGoal(state, draft){
    const s = stats(state);
    const start = num(draft.startingWeight);
    const goal = num(draft.goalWeight);
    const current = num(s.avg7) ?? num(s.latest?.weight);
    const pace = Math.abs(num(draft.targetPace) || 0);
    const mode = draft.mode || 'general';

    let totalChange = null;
    let completedChange = null;
    let remaining = null;
    let progress = null;
    let etaWeeks = null;

    if(start != null && goal != null && current != null && start !== goal){
      totalChange = goal - start;
      completedChange = current - start;
      progress = clamp((completedChange / totalChange) * 100, 0, 100);
      remaining = goal - current;
      if(pace > 0) etaWeeks = Math.abs(remaining) / pace;
    }

    let coach = 'Set your start weight, goal weight, and target pace to get a clear plan.';
    if(mode === 'maintenance') coach = 'Maintenance is about staying inside a normal range, not forcing the scale to be perfect.';
    if(mode === 'recomp') coach = 'Recomp can move slowly on the scale. Measurements and photos matter more here.';
    if(progress != null && remaining != null){
      if(Math.abs(remaining) < 0.2) coach = 'You are basically at the target. Now the goal is consistency, not chasing lower numbers.';
      else if(etaWeeks != null) coach = `At this target pace, this goal is roughly ${Math.ceil(etaWeeks)} week${Math.ceil(etaWeeks) === 1 ? '' : 's'} away.`;
      else coach = `You have about ${Math.abs(remaining).toFixed(1)} ${s.unit} remaining.`;
    }

    return { ...s, start, goal, current, pace, totalChange, completedChange, remaining, progress, etaWeeks, coach };
  }

  function GoalsPage(){
    const { state, updateState } = useApp();
    const savedGoal = state.goal || {};
    const [draft,setDraft] = useState({
      mode: savedGoal.mode || state?.settings?.defaultGoal || 'fatloss',
      startingWeight: cleanNumber(savedGoal.startingWeight),
      goalWeight: cleanNumber(savedGoal.goalWeight),
      startDate: savedGoal.startDate || today(),
      targetPace: cleanNumber(savedGoal.targetPace),
      notes: savedGoal.notes || ''
    });
    const [saved,setSaved] = useState(false);
    const analysis = useMemo(()=>analyzeGoal(state,draft), [state,draft]);

    const modes = [
      ['fatloss','Fat loss','Slow, steady downward trend.'],
      ['musclegain','Muscle gain','Slow controlled gain.'],
      ['maintenance','Maintenance','Stay within a normal range.'],
      ['recomp','Recomposition','Track strength and photos too.'],
      ['general','General tracking','Neutral analysis.']
    ];

    function patch(changes){
      setSaved(false);
      setDraft(prev => ({ ...prev, ...changes }));
    }

    function saveGoal(){
      const start = num(draft.startingWeight);
      const goal = num(draft.goalWeight);
      const pace = num(draft.targetPace);

      if(!draft.mode){ alert('Choose a goal mode.'); return; }
      if(!draft.startDate){ alert('Choose a start date.'); return; }
      if(draft.startingWeight !== '' && start == null){ alert('Starting weight must be a number.'); return; }
      if(draft.goalWeight !== '' && goal == null){ alert('Goal weight must be a number.'); return; }
      if(draft.targetPace !== '' && (pace == null || pace < 0)){ alert('Target pace must be a positive number.'); return; }

      updateState({
        goal: {
          mode: draft.mode,
          startingWeight: start,
          goalWeight: goal,
          startDate: draft.startDate,
          targetPace: pace,
          notes: String(draft.notes || '').trim(),
          updatedAt: new Date().toISOString()
        }
      });
      setSaved(true);
    }

    return e('div', { className:'wl-page fadein' },
      e('div', { className:'wl-kicker' }, 'Goal'),
      e('h1', { className:'wl-title mt-4' }, 'Goals'),
      e('p', { className:'mt-4 text-[#686761] max-w-2xl' }, 'Your goal shapes how WeightLens interprets progress. Set the target once, then let the trend tell the story.'),

      e('div', { className:'grid grid-cols-5 gap-3 mt-12' },
        modes.map(mode => e('button', {
          key:mode[0],
          className:`wl-card-option text-left ${draft.mode === mode[0] ? 'active' : ''}`,
          onClick:()=>patch({ mode:mode[0] })
        },
          e('div', { className:'font-bold' }, mode[1]),
          e('p', { className:'text-sm text-[#686761] mt-2' }, mode[2])
        ))
      ),

      e('div', { className:'wl-grid-2 mt-16' },
        e('div', null,
          e('div', { className:'grid grid-cols-2 gap-6' },
            e('label', null,
              e('div', { className:'wl-kicker mb-2' }, 'Starting weight'),
              e('input', { className:'wl-form-line w-full', inputMode:'decimal', value:draft.startingWeight, onChange:event=>patch({ startingWeight:event.target.value }), placeholder:'185' })
            ),
            e('label', null,
              e('div', { className:'wl-kicker mb-2' }, 'Goal weight'),
              e('input', { className:'wl-form-line w-full', inputMode:'decimal', value:draft.goalWeight, onChange:event=>patch({ goalWeight:event.target.value }), placeholder:'170' })
            ),
            e('label', null,
              e('div', { className:'wl-kicker mb-2' }, 'Start date'),
              e('input', { className:'wl-form-line w-full', type:'date', value:draft.startDate, onChange:event=>patch({ startDate:event.target.value }) })
            ),
            e('label', null,
              e('div', { className:'wl-kicker mb-2' }, 'Target pace'),
              e('input', { className:'wl-form-line w-full', inputMode:'decimal', value:draft.targetPace, onChange:event=>patch({ targetPace:event.target.value }), placeholder:'1' })
            )
          ),
          e('label', { className:'block mt-8' },
            e('div', { className:'wl-kicker mb-2' }, 'Notes'),
            e('textarea', { className:'wl-form-line w-full', style:{minHeight:'90px', lineHeight:'1.5', paddingTop:'12px'}, value:draft.notes, onChange:event=>patch({ notes:event.target.value }), placeholder:'Optional context about your goal...' })
          ),
          e('div', { className:'flex gap-3 mt-7 flex-wrap' },
            e('button', { className:'wl-btn', onClick:saveGoal }, 'Save goal'),
            e('button', { className:'wl-btn light', onClick:()=>patch({ startingWeight: one(analysis.current), startDate: today() }) }, 'Use current as start')
          ),
          saved && e('p', { className:'mt-4 text-[var(--ed-good)] font-bold' }, 'Saved. Your dashboard goal panel will use this now.')
        ),

        e('div', { className:'wl-rule' },
          e('div', { className:'flex justify-between items-start gap-4' },
            e('div', null,
              e('div', { className:'wl-kicker text-[var(--ed-accent)]' }, 'Coach'),
              e('h2', { className:'text-3xl font-black tracking-[-.06em] mt-4' }, goalModeLabel(draft.mode))
            ),
            e('span', { className:'wl-pill' }, unitOf(state))
          ),
          e('div', { className:'mt-8' },
            e('div', { className:'wl-kicker mb-2' }, 'Where you are'),
            e('div', { className:'text-5xl font-black tracking-[-.07em]' }, one(analysis.current), e('span', { className:'text-base ml-2' }, analysis.unit)),
            e('p', { className:'mt-4 text-[#686761]' }, analysis.coach)
          ),
          e('div', { className:'grid grid-cols-2 gap-5 mt-10' },
            e('div', { className:'wl-rule' }, e('div', { className:'wl-kicker' }, 'Progress'), e('div', { className:'text-3xl font-black mt-3' }, analysis.progress == null ? '—' : `${Math.round(analysis.progress)}%`)),
            e('div', { className:'wl-rule' }, e('div', { className:'wl-kicker' }, 'Remaining'), e('div', { className:'text-3xl font-black mt-3' }, analysis.remaining == null ? '—' : `${Math.abs(analysis.remaining).toFixed(1)}`)),
            e('div', { className:'wl-rule' }, e('div', { className:'wl-kicker' }, 'Current pace'), e('div', { className:'text-3xl font-black mt-3' }, signed(analysis.weeklyRate))),
            e('div', { className:'wl-rule' }, e('div', { className:'wl-kicker' }, 'ETA'), e('div', { className:'text-3xl font-black mt-3' }, analysis.etaWeeks == null ? '—' : `${Math.ceil(analysis.etaWeeks)}w`))
          ),
          e('div', { className:'mt-10 h-2 rounded-full bg-black/10 overflow-hidden' },
            e('div', { className:'h-full bg-[var(--ed-accent)]', style:{ width: `${analysis.progress == null ? 0 : analysis.progress}%` } })
          )
        )
      )
    );
  }

  function install(){ window.GoalsPage = GoalsPage; }
  install();
  window.addEventListener('load', install);
  setTimeout(install, 100);
  setTimeout(install, 500);
})();
