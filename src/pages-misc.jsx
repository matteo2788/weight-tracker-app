// pages-misc.jsx — Measurements, Photos, Insights, Settings

// ============================================================
// Measurements
// ============================================================
const MEASUREMENT_FIELDS = [
  { id:'waist', label:'Waist' },
  { id:'chest', label:'Chest' },
  { id:'hips',  label:'Hips' },
  { id:'arm',   label:'Arm' },
  { id:'thigh', label:'Thigh' },
  { id:'neck',  label:'Neck' },
];

function MeasurementsPage(){
  const { state, updateState } = useApp();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(null);

  const sorted = useMemo(()=> [...state.measurements].sort((a,b)=>b.date.localeCompare(a.date)), [state.measurements]);
  const first = sorted[sorted.length-1];

  const saveDraft = () => {
    if (!draft.date) return;
    const measurements = state.measurements.filter(m => m.id !== draft.id);
    measurements.push({ ...draft, updatedAt: new Date().toISOString() });
    updateState({ measurements });
    setOpen(false); setDraft(null);
  };

  return (
    <div className="space-y-6 fadein">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">Body measurements</div>
          <h1 className="text-[28px] md:text-[32px] font-semibold tracking-tight">Measurements</h1>
          <div className="text-mute mt-1.5 text-[14px] max-w-xl">Optional. Measurements often tell a different story than the scale — especially during recomposition.</div>
        </div>
        <Button onClick={()=>{ setDraft({ id:'m_'+Date.now(), date: todayISO(), measurements:{}, notes:'', createdAt: new Date().toISOString() }); setOpen(true); }}>
          <I.Plus className="h-4 w-4"/> New measurement
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {MEASUREMENT_FIELDS.map(f => {
          const latest = sorted.find(m => m.measurements[f.id] != null);
          const startVal = first?.measurements?.[f.id];
          const delta = (latest && startVal != null) ? (latest.measurements[f.id] - startVal) : null;
          return (
            <Card key={f.id}>
              <div className="text-[11px] uppercase tracking-[0.18em] text-mute">{f.label}</div>
              <div className="mt-2 display text-2xl font-semibold num">{latest?.measurements?.[f.id] != null ? latest.measurements[f.id].toFixed(1) : '—'} <span className="text-mute text-xs font-normal">in</span></div>
              {delta != null && (
                <div className={`mt-1 text-[11.5px] ${delta>0?'text-warn':delta<0?'text-good':'text-mute'}`}>
                  {delta>0?'+':''}{delta.toFixed(1)} since start
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="p-4 border-b hairline"><SectionLabel className="!mb-0">All measurements</SectionLabel></div>
        {sorted.length === 0 ? (
          <EmptyState icon={<I.Ruler className="h-5 w-5"/>} title="No measurements yet" body="Add waist, chest, hips, or any custom measurement on the side." />
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-[13px]">
              <thead className="text-mute text-[11px] uppercase tracking-wider">
                <tr className="border-b hairline">
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  {MEASUREMENT_FIELDS.map(f => <th key={f.id} className="text-left px-3 py-2 font-medium">{f.label}</th>)}
                  <th className="text-left px-3 py-2 font-medium">Notes</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(m => (
                  <tr key={m.id} className="border-b hairline last:border-0 hover:bg-surface3/40">
                    <td className="px-4 py-2.5">{fmtShort(m.date)}</td>
                    {MEASUREMENT_FIELDS.map(f => (
                      <td key={f.id} className="px-3 py-2 num text-fg/90">{m.measurements[f.id] != null ? m.measurements[f.id].toFixed(1) : <span className="text-mute2">—</span>}</td>
                    ))}
                    <td className="px-3 py-2 text-mute max-w-[200px] truncate">{m.notes || '—'}</td>
                    <td className="px-2">
                      <IconButton onClick={()=>{ setDraft({...m}); setOpen(true); }}><I.Edit className="h-4 w-4"/></IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={open} onClose={()=>{ setOpen(false); setDraft(null); }} title="Measurement" maxWidth="max-w-xl">
        {draft && (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">Date</label>
              <Input type="date" className="w-full" value={draft.date} onChange={e=>setDraft({...draft, date: e.target.value})} max={todayISO()}/>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {MEASUREMENT_FIELDS.map(f => (
                <div key={f.id}>
                  <label className="block text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">{f.label}</label>
                  <div className="flex gap-2">
                    <Input type="number" step="0.1" className="flex-1"
                      value={draft.measurements[f.id] ?? ''}
                      onChange={e=>setDraft({...draft, measurements: { ...draft.measurements, [f.id]: e.target.value ? +e.target.value : null }})}/>
                    <div className="px-3 h-10 flex items-center text-mute text-xs bg-surface3 border border-line2 rounded-xl">in</div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">Notes</label>
              <Textarea rows={2} className="w-full" value={draft.notes} onChange={e=>setDraft({...draft, notes: e.target.value})}/>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t hairline">
              <Button variant="secondary" onClick={()=>{ setOpen(false); setDraft(null); }}>Cancel</Button>
              <Button onClick={saveDraft}>Save</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ============================================================
// Photos
// ============================================================
function PhotosPage(){
  const { state, updateState } = useApp();
  const [compare, setCompare] = useState({ a:null, b:null });

  const sorted = useMemo(()=>[...state.photos].sort((a,b)=>b.date.localeCompare(a.date)), [state.photos]);

  const onUpload = (file) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      updateState({
        photos: [...state.photos, {
          id: 'p_' + Date.now(),
          date: todayISO(),
          dataUrl: r.result,
          notes: '',
          createdAt: new Date().toISOString(),
        }]
      });
    };
    r.readAsDataURL(file);
  };

  const onDelete = (id) => {
    if (!confirm('Delete this photo?')) return;
    updateState({ photos: state.photos.filter(p => p.id !== id) });
  };

  return (
    <div className="space-y-6 fadein">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">Private</div>
          <h1 className="text-[28px] md:text-[32px] font-semibold tracking-tight">Progress photos</h1>
          <div className="text-mute mt-1.5 text-[14px] max-w-xl">Optional. Stored locally on your device — never uploaded. Photos can show change the scale can't.</div>
        </div>
        <label className="inline-flex">
          <input type="file" accept="image/*" className="hidden" onChange={e=>onUpload(e.target.files?.[0])}/>
          <span className="btn inline-flex items-center justify-center gap-2 font-medium rounded-xl bg-accent text-bg hover:bg-fg h-10 px-4 text-sm cursor-pointer">
            <I.Plus className="h-4 w-4"/> Add photo
          </span>
        </label>
      </div>

      <Card>
        <SectionLabel right={
          <div className="flex items-center gap-2 text-[12px] text-mute">
            <Select className="!h-8 !text-[12px]" value={compare.a || ''} onChange={e=>setCompare({...compare, a: e.target.value || null})}>
              <option value="">Select A</option>
              {sorted.map(p => <option key={p.id} value={p.id}>{fmtShort(p.date)}</option>)}
            </Select>
            <span>vs</span>
            <Select className="!h-8 !text-[12px]" value={compare.b || ''} onChange={e=>setCompare({...compare, b: e.target.value || null})}>
              <option value="">Select B</option>
              {sorted.map(p => <option key={p.id} value={p.id}>{fmtShort(p.date)}</option>)}
            </Select>
          </div>
        }>Compare</SectionLabel>

        <div className="grid grid-cols-2 gap-4">
          {['a','b'].map(slot => {
            const p = state.photos.find(x => x.id === compare[slot]);
            return (
              <div key={slot} className="aspect-[3/4] bg-surface3 border border-line2 rounded-xl flex items-center justify-center overflow-hidden">
                {p ? (
                  <div className="relative w-full h-full">
                    <img src={p.dataUrl} alt="" className="w-full h-full object-cover"/>
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11.5px] bg-bg/70 backdrop-blur rounded-md px-2 py-1">
                      <span>{fmtLong(p.date)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-mute px-4">
                    <I.Photo className="h-6 w-6 mx-auto mb-2"/>
                    <div className="text-[12.5px]">Pick a photo for {slot.toUpperCase()}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="!p-0 overflow-hidden">
        <div className="p-4 border-b hairline"><SectionLabel className="!mb-0">All photos</SectionLabel></div>
        {sorted.length === 0 ? (
          <EmptyState icon={<I.Photo className="h-5 w-5"/>} title="No photos yet" body="Add a photo to start a private visual record."/>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4">
            {sorted.map(p => (
              <div key={p.id} className="relative aspect-[3/4] rounded-xl overflow-hidden bg-surface3 border border-line2 group">
                <img src={p.dataUrl} alt="" className="w-full h-full object-cover"/>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <div className="text-[11.5px] text-fg">{fmtShort(p.date)}</div>
                </div>
                <button onClick={()=>onDelete(p.id)} className="absolute top-2 right-2 h-7 w-7 rounded-lg bg-bg/70 backdrop-blur opacity-0 group-hover:opacity-100 flex items-center justify-center text-fg hover:text-danger">
                  <I.Trash className="h-3.5 w-3.5"/>
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ============================================================
// Insights / Education
// ============================================================
const INSIGHT_CARDS = [
  {
    title:'Why weekly averages matter more than daily weight',
    excerpt:'Think of daily weight like waves in the ocean. The waves move up and down every day, but the tide shows the real direction. Your weekly average is the tide.',
    body:`Daily weight is influenced by water, food residue in your gut, sodium, carbs, stress, sleep, and a dozen other things that have nothing to do with fat. A single morning is a snapshot, not a trend.\n\nWhen you average a full week of weigh-ins, those daily ups and downs cancel each other out, and what's left is the actual direction your body is moving. That's why we lead with the 7-day rolling average — it's the most honest number on the dashboard.`,
    tag:'Fundamentals',
  },
  {
    title:'Sodium can swing the scale by 1–4 lbs overnight',
    excerpt:'A salty meal makes your body hold extra water for a day or two. That water shows up on the scale, but it isn\'t fat.',
    body:`Each gram of sodium pulls roughly 4 grams of water with it. Eat a salty restaurant meal and your body may hold an extra liter or two of water — that's 2–4 lbs on the scale the next morning.\n\nIt's temporary. As your body re-balances over the next 24–72 hours, the water leaves and so does the scale weight. If you see a spike after a high-sodium tag, that's almost always what's happening.`,
    tag:'Water',
  },
  {
    title:'Carbs can push the scale up — without fat gain',
    excerpt:'Every gram of stored carbohydrate (glycogen) pulls about 3 grams of water into your muscles.',
    body:`When you eat more carbs than usual — pasta night, dessert, a big breakfast — your muscles store some of it as glycogen. Each gram of glycogen pulls about 3 grams of water with it.\n\nThis is healthy, helpful, and means your scale weight can climb 1–3 lbs after a high-carb day even though you haven't gained an ounce of fat. It also drops fast on low-carb days, which is why crash diets show big "loss" in week one — that's water, not fat.`,
    tag:'Water',
  },
  {
    title:'Sore muscles can temporarily increase weight',
    excerpt:'Hard training causes small muscle damage. The repair process holds water around the muscle, briefly inflating the scale.',
    body:`Strength training, a long run, or any unusually hard workout creates micro-damage in your muscle fibers. Your body holds water around those fibers as it repairs them.\n\nThis can add 1–3 lbs of water weight for 24–72 hours. It's progress, not regress. It usually shows up the morning after a hard session — the scale looks worse the day you trained harder.`,
    tag:'Training',
  },
  {
    title:'Poor sleep affects scale weight',
    excerpt:'Bad sleep raises cortisol, which makes your body retain more water.',
    body:`A short or restless night raises stress hormones like cortisol, which signals your body to hold onto water. You may also retain more food residue if your digestion was slow.\n\nThe next morning's weight can be 0.5–2 lbs higher than usual. It doesn't mean anything went wrong with your nutrition — your weekly average will smooth it out.`,
    tag:'Recovery',
  },
  {
    title:'Stress can show up on the scale',
    excerpt:'Cortisol from stress makes the body hold water — sometimes for days.',
    body:`Big life stress (work, travel, conflict, illness) elevates cortisol, which causes water retention. It can also disrupt sleep, hydration, and routine — all of which compound the effect.\n\nThis is why a stressful week sometimes looks like a "plateau" or even a small gain. Your fat trajectory probably didn't change. Your water balance did.`,
    tag:'Lifestyle',
  },
  {
    title:'One bad day does not ruin progress',
    excerpt:'A single high-calorie day is mathematically incapable of erasing a week of consistent eating.',
    body:`To gain a pound of fat, you'd need to eat roughly 3,500 calories above your maintenance. One indulgent meal — even a big one — doesn't get you there.\n\nWhat that meal will do is add water and gut content for a day or two, making the scale look worse. Keep logging, keep your routine, and watch the trend re-settle within a few days.`,
    tag:'Mindset',
  },
  {
    title:'Why plateaus happen — and why most aren\'t real',
    excerpt:'Your 7-day average holding steady for one week is normal. Two to three weeks of flat data, with good logging, is when it gets interesting.',
    body:`Bodies don't lose or gain weight in straight lines. Hormones, hydration, training volume, sodium, sleep — everything shifts week to week.\n\nA true plateau is when your weekly average has stayed inside a small range for 2–3 weeks with decent logging consistency. Below that threshold, it's probably normal noise. WeightLens won't call a single flat week a plateau, and neither should you.`,
    tag:'Patience',
  },
  {
    title:'Consistency beats perfection',
    excerpt:'Six days a week of decent decisions beats one perfect week followed by burnout.',
    body:`The people who succeed at long-term weight change are the ones who can sustain a slightly imperfect routine for months. The people who fail are usually the ones who chased perfection, hit a bad week, and gave up entirely.\n\nMissed a log? Just log tomorrow. Had a rough food day? The trend is still mostly intact. Show up most of the time.`,
    tag:'Mindset',
  },
  {
    title:'Scale weight vs fat loss vs muscle gain',
    excerpt:'The scale measures everything: fat, muscle, water, food, bones, organs. It can\'t tell which is changing.',
    body:`When the scale moves, it could be fat, lean tissue, water, or food in your gut. That's why we lean on weekly averages, measurements, photos, and how you feel — not just the number itself.\n\nIf your scale is moving down but you look softer, you may have lost muscle. If the scale is flat but your measurements are smaller and your training is stronger, you're recomping. Context matters.`,
    tag:'Fundamentals',
  },
];

function InsightsPage(){
  const [open, setOpen] = useState(null);
  return (
    <div className="space-y-6 fadein">
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">Learn</div>
        <h1 className="text-[28px] md:text-[32px] font-semibold tracking-tight">Insights & education</h1>
        <div className="text-mute mt-1.5 text-[14px] max-w-2xl">Short reads on what makes the scale move — so you can make sense of your own data.</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {INSIGHT_CARDS.map((c, i) => (
          <button key={c.title} onClick={()=>setOpen(c)} className="text-left group">
            <Card className="h-full hover:border-line2 transition-colors">
              <div className="flex items-start gap-3 mb-2">
                <div className="h-9 w-9 shrink-0 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                  <I.Sparkle className="h-4 w-4"/>
                </div>
                <div className="flex-1">
                  <Pill>{c.tag}</Pill>
                </div>
                <I.Right className="h-4 w-4 text-mute opacity-0 group-hover:opacity-100 transition-opacity mt-2"/>
              </div>
              <h3 className="text-[16px] font-semibold leading-snug tracking-tight">{c.title}</h3>
              <p className="text-[13px] text-mute mt-2 leading-relaxed">{c.excerpt}</p>
            </Card>
          </button>
        ))}
      </div>

      <Modal open={!!open} onClose={()=>setOpen(null)} title={open?.title || ''} maxWidth="max-w-2xl">
        {open && (
          <div className="space-y-4">
            <Pill>{open.tag}</Pill>
            {open.body.split('\n\n').map((para,i) => (
              <p key={i} className="text-[14.5px] leading-relaxed text-fg/90 whitespace-pre-line">{para}</p>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}

// ============================================================
// Settings
// ============================================================
function SettingsPage(){
  const { state, updateState, resetAll } = useApp();
  const s = state.settings;
  const setS = (patch) => updateState({ settings: { ...s, ...patch }});
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');

  const onExport = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `weightlens-backup-${todayISO()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const onImport = () => {
    try {
      const data = JSON.parse(importText);
      updateState(data);
      setImportOpen(false); setImportText('');
      alert('Data restored.');
    } catch(e) { alert('Invalid JSON.'); }
  };

  const onCsvExport = () => {
    const header = 'date,weight,unit,notes,tags\n';
    const rows = entriesSortedAsc(state.entries).map(e =>
      `${e.date},${e.weight},${e.unit},"${(e.notes||'').replace(/"/g,'""')}","${(e.tags||[]).join(';')}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type:'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `weightlens-entries-${todayISO()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 fadein max-w-3xl">
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">Preferences</div>
        <h1 className="text-[28px] md:text-[32px] font-semibold tracking-tight">Settings</h1>
      </div>

      <Card>
        <SectionLabel>Units & week</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11.5px] text-mute mb-1.5">Weight unit</label>
            <Select className="w-full" value={s.unit} onChange={e=>setS({ unit: e.target.value })}>
              <option value="lbs">Pounds (lbs)</option>
              <option value="kg">Kilograms (kg)</option>
            </Select>
          </div>
          <div>
            <label className="block text-[11.5px] text-mute mb-1.5">Week starts on</label>
            <Select className="w-full" value={s.weekStartDay} onChange={e=>setS({ weekStartDay: +e.target.value })}>
              <option value={1}>Monday</option>
              <option value={0}>Sunday</option>
            </Select>
          </div>
          <div>
            <label className="block text-[11.5px] text-mute mb-1.5">Default goal mode</label>
            <Select className="w-full" value={s.defaultGoal} onChange={e=>setS({ defaultGoal: e.target.value })}>
              <option value="fatloss">Fat loss</option>
              <option value="musclegain">Muscle gain</option>
              <option value="maintenance">Maintenance</option>
              <option value="recomp">Recomposition</option>
              <option value="general">General tracking</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card>
        <SectionLabel>Reminders</SectionLabel>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[14px]">Daily weigh-in reminder</div>
            <div className="text-[12.5px] text-mute">Frontend preview only — real notifications coming with a backend.</div>
          </div>
          <Input type="time" value={s.reminderTime || ''} onChange={e=>setS({ reminderTime: e.target.value })}/>
        </div>
      </Card>

      <Card>
        <SectionLabel>Data</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button variant="secondary" onClick={onExport}><I.Download className="h-4 w-4"/> Backup as JSON</Button>
          <Button variant="secondary" onClick={()=>setImportOpen(true)}><I.Import className="h-4 w-4"/> Restore from JSON</Button>
          <Button variant="secondary" onClick={onCsvExport}><I.Download className="h-4 w-4"/> Export entries as CSV</Button>
          <Button variant="danger" onClick={()=>{ if (confirm('Delete all data? This cannot be undone.')) resetAll(); }}>
            <I.Trash className="h-4 w-4"/> Clear all data
          </Button>
        </div>
      </Card>

      <Card>
        <SectionLabel>About</SectionLabel>
        <p className="text-[13.5px] text-mute leading-relaxed">
          WeightLens is a calm trend dashboard for body weight. Your data lives only in your browser — no account, no cloud, no tracking. Use the JSON backup to move it between devices.
        </p>
      </Card>

      <Modal open={importOpen} onClose={()=>setImportOpen(false)} title="Restore from JSON" maxWidth="max-w-xl">
        <Textarea rows={10} className="w-full font-mono text-[12px]" placeholder='Paste WeightLens JSON backup here…' value={importText} onChange={e=>setImportText(e.target.value)}/>
        <div className="flex justify-end gap-2 mt-3">
          <Button variant="secondary" onClick={()=>setImportOpen(false)}>Cancel</Button>
          <Button onClick={onImport}>Restore</Button>
        </div>
      </Modal>
    </div>
  );
}

// attach
Object.assign(window, { MeasurementsPage, PhotosPage, InsightsPage, SettingsPage, MEASUREMENT_FIELDS, INSIGHT_CARDS });
