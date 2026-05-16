// measurements-override.jsx — polished measurements page

function measurementDeltaTone(fieldId, delta){
  if (delta == null || Math.abs(delta) < 0.05) return 'neutral';
  if (['waist','hips','neck'].includes(fieldId)) return delta < 0 ? 'good' : 'warn';
  return 'neutral';
}

function buildMeasurementCoach(measurements){
  const sortedAsc = [...measurements].sort((a,b)=>a.date.localeCompare(b.date));
  if (sortedAsc.length === 0) {
    return {
      tone:'neutral',
      headline:'Add your first measurement',
      body:'Measurements help you see progress the scale can miss, especially during recomp or muscle gain.'
    };
  }

  if (sortedAsc.length === 1) {
    return {
      tone:'neutral',
      headline:'Baseline saved',
      body:'You have a starting point. Add another measurement in 2–4 weeks to see real change without obsessing day to day.'
    };
  }

  const first = sortedAsc[0];
  const latest = sortedAsc[sortedAsc.length - 1];
  const waistDelta = latest.measurements?.waist != null && first.measurements?.waist != null
    ? latest.measurements.waist - first.measurements.waist
    : null;
  const chestDelta = latest.measurements?.chest != null && first.measurements?.chest != null
    ? latest.measurements.chest - first.measurements.chest
    : null;

  if (waistDelta != null && waistDelta <= -1) {
    return {
      tone:'good',
      headline:`Waist is down ${Math.abs(waistDelta).toFixed(1)} in`,
      body:'That is a strong non-scale signal. Even if body weight is noisy, waist change often shows fat-loss progress more clearly.'
    };
  }

  if (waistDelta != null && waistDelta >= 1) {
    return {
      tone:'warn',
      headline:`Waist is up ${waistDelta.toFixed(1)} in`,
      body:'Do not panic from one reading, but compare the next check-in. Measure at the same time and same spot for consistency.'
    };
  }

  if (chestDelta != null && chestDelta > 0.5) {
    return {
      tone:'neutral',
      headline:'Upper-body measurement is moving up',
      body:'This can be useful during muscle gain or recomp. Pair it with photos, strength, and waist trend for better context.'
    };
  }

  return {
    tone:'neutral',
    headline:'Measurements are mostly steady',
    body:'Stable measurements are still useful data. Keep check-ins spaced out so you are tracking real change, not tiny measuring noise.'
  };
}

function MeasurementsPage(){
  const { state, updateState } = useApp();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(null);

  const sortedDesc = useMemo(()=> [...state.measurements].sort((a,b)=>b.date.localeCompare(a.date)), [state.measurements]);
  const sortedAsc = useMemo(()=> [...state.measurements].sort((a,b)=>a.date.localeCompare(b.date)), [state.measurements]);
  const first = sortedAsc[0];
  const latest = sortedAsc[sortedAsc.length - 1];
  const coach = useMemo(()=>buildMeasurementCoach(state.measurements || []), [state.measurements]);

  const startNew = () => {
    setDraft({ id:'m_'+Date.now(), date: todayISO(), measurements:{}, notes:'', createdAt: new Date().toISOString() });
    setOpen(true);
  };

  const saveDraft = () => {
    if (!draft?.date) return;
    const hasAny = Object.values(draft.measurements || {}).some(v => v != null && v !== '');
    if (!hasAny && !draft.notes) return;
    const measurements = state.measurements.filter(m => m.id !== draft.id && m.date !== draft.date);
    measurements.push({ ...draft, updatedAt: new Date().toISOString() });
    updateState({ measurements });
    setOpen(false);
    setDraft(null);
  };

  const deleteMeasurement = (id) => {
    if (!confirm('Delete this measurement check-in?')) return;
    updateState({ measurements: state.measurements.filter(m => m.id !== id) });
    setOpen(false);
    setDraft(null);
  };

  const totalTracked = MEASUREMENT_FIELDS.filter(f => latest?.measurements?.[f.id] != null).length;

  return (
    <div className="space-y-6 fadein">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">Body measurements</div>
          <h1 className="text-[28px] md:text-[32px] font-semibold tracking-tight">Measurements</h1>
          <div className="text-mute mt-1.5 text-[14px] max-w-2xl">Track waist, chest, hips, arms, thighs, and neck so progress is not judged by scale weight alone.</div>
        </div>
        <Button onClick={startNew}><I.Plus className="h-4 w-4"/> New measurement</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="max-w-3xl">
            <Pill tone={coach.tone}><I.Sparkle className="h-3 w-3"/> Measurement coach</Pill>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">{coach.headline}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-fg/90">{coach.body}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 lg:min-w-[330px]">
            <SmallMetric label="Check-ins" value={String(sortedDesc.length)} unit="" />
            <SmallMetric label="Latest fields" value={`${totalTracked}/6`} unit="" />
            <SmallMetric label="Last date" value={latest ? fmtShort(latest.date) : '—'} unit="" />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {MEASUREMENT_FIELDS.map(f => {
          const latestVal = latest?.measurements?.[f.id];
          const startVal = first?.measurements?.[f.id];
          const delta = latestVal != null && startVal != null ? latestVal - startVal : null;
          const tone = measurementDeltaTone(f.id, delta);
          return (
            <Card key={f.id}>
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] uppercase tracking-[0.18em] text-mute">{f.label}</div>
                {delta != null && <Pill tone={tone}>{delta>0?'+':''}{delta.toFixed(1)}</Pill>}
              </div>
              <div className="mt-2 display text-2xl font-semibold num">{latestVal != null ? latestVal.toFixed(1) : '—'} <span className="text-mute text-xs font-normal">in</span></div>
              <div className="mt-1 text-[11.5px] text-mute">{delta != null ? 'since first check-in' : 'no baseline yet'}</div>
            </Card>
          );
        })}
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="p-4 border-b hairline flex items-center justify-between gap-3">
          <SectionLabel className="!mb-0">Measurement history</SectionLabel>
          <div className="text-[12px] text-mute">{sortedDesc.length} check-ins</div>
        </div>

        {sortedDesc.length === 0 ? (
          <EmptyState icon={<I.Ruler className="h-5 w-5"/>} title="No measurements yet" body="Add a baseline today, then check again every 2–4 weeks." action={<Button onClick={startNew}><I.Plus className="h-4 w-4"/> Add baseline</Button>} />
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-[13px] min-w-[760px]">
              <thead className="text-mute text-[11px] uppercase tracking-wider">
                <tr className="border-b hairline">
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  {MEASUREMENT_FIELDS.map(f => <th key={f.id} className="text-left px-3 py-2 font-medium">{f.label}</th>)}
                  <th className="text-left px-3 py-2 font-medium">Notes</th>
                  <th className="w-20"></th>
                </tr>
              </thead>
              <tbody>
                {sortedDesc.map(m => (
                  <tr key={m.id} className="border-b hairline last:border-0 hover:bg-surface3/40">
                    <td className="px-4 py-3">
                      <div className="font-medium">{fmtShort(m.date)}</div>
                      <div className="text-[11px] text-mute">{m.date}</div>
                    </td>
                    {MEASUREMENT_FIELDS.map(f => (
                      <td key={f.id} className="px-3 py-2 num text-fg/90">{m.measurements[f.id] != null ? m.measurements[f.id].toFixed(1) : <span className="text-mute2">—</span>}</td>
                    ))}
                    <td className="px-3 py-2 text-mute max-w-[220px] truncate">{m.notes || '—'}</td>
                    <td className="px-2">
                      <div className="flex justify-end gap-1">
                        <IconButton onClick={()=>{ setDraft({...m, measurements:{...(m.measurements||{})}}); setOpen(true); }}><I.Edit className="h-4 w-4"/></IconButton>
                        <IconButton className="hover:text-danger" onClick={()=>deleteMeasurement(m.id)}><I.Trash className="h-4 w-4"/></IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={open} onClose={()=>{ setOpen(false); setDraft(null); }} title={draft?.createdAt && state.measurements.some(m => m.id === draft.id) ? 'Edit measurement' : 'New measurement'} maxWidth="max-w-xl">
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
                    <Input type="number" step="0.1" className="flex-1" value={draft.measurements[f.id] ?? ''} onChange={e=>setDraft({...draft, measurements: { ...draft.measurements, [f.id]: e.target.value ? +e.target.value : null }})}/>
                    <div className="px-3 h-10 flex items-center text-mute text-xs bg-surface3 border border-line2 rounded-xl">in</div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">Notes</label>
              <Textarea rows={2} className="w-full" value={draft.notes} onChange={e=>setDraft({...draft, notes: e.target.value})} placeholder="Optional check-in notes…"/>
            </div>
            <div className="flex items-center justify-between gap-2 pt-2 border-t hairline">
              {state.measurements.some(m => m.id === draft.id) ? (
                <Button variant="danger" onClick={()=>deleteMeasurement(draft.id)}><I.Trash className="h-4 w-4"/> Delete</Button>
              ) : <div/>}
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={()=>{ setOpen(false); setDraft(null); }}>Cancel</Button>
                <Button onClick={saveDraft}>Save</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

Object.assign(window, { MeasurementsPage, buildMeasurementCoach, measurementDeltaTone });
