// backfill-override.jsx — smarter Notes-style import for Backfill

const WL_MONTHS = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 };
const WL_DAYS = ['sun','mon','tue','wed','thu','fri','sat'];

function wlDateFromParts(y,m,d){
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  return `${y}-${pad(m)}-${pad(d)}`;
}

function wlExtractWeight(line){
  const matches = String(line).match(/\d{2,3}(?:\.\d+)?/g) || [];
  if (!matches.length) return null;
  const nums = matches.map(Number).filter(n => n >= 50 && n <= 700);
  return nums.length ? nums[nums.length - 1] : null;
}

function wlParseExplicitDate(line, fallbackYear){
  const s = String(line).replace(/,/g,' ').replace(/\s+/g,' ').trim();
  let m = s.match(/(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
  if (m) return wlDateFromParts(+m[1], +m[2], +m[3]);

  m = s.match(/(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})/);
  if (m) {
    const y = m[3].length === 2 ? 2000 + (+m[3]) : +m[3];
    return wlDateFromParts(y, +m[1], +m[2]);
  }

  m = s.match(/\b([A-Za-z]{3,9})\s+(\d{1,2})(?:\s+(\d{2,4}))?\b/);
  if (m) {
    const mo = WL_MONTHS[m[1].slice(0,3).toLowerCase()];
    const y = m[3] ? (m[3].length === 2 ? 2000 + (+m[3]) : +m[3]) : fallbackYear;
    if (mo != null) return wlDateFromParts(y, mo + 1, +m[2]);
  }

  return null;
}

function wlParseSmartPaste(text, options){
  const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  const rows = [];
  const defaultUnit = options.unit || 'lbs';
  const fallbackYear = options.year || new Date().getFullYear();
  const startDate = options.startDate || todayISO();
  const direction = options.direction || 'forward';
  let sequenceIndex = 0;

  for (const raw of lines) {
    const lower = raw.toLowerCase();
    if (/^(week\s*\d+|average|avg|notes?)\b/i.test(raw)) {
      rows.push({ raw, ok:false, skipped:true, error:'Skipped label/average line.' });
      continue;
    }

    const weight = wlExtractWeight(raw);
    if (!weight) {
      rows.push({ raw, ok:false, error:'Could not find a valid weight.' });
      continue;
    }

    let date = wlParseExplicitDate(raw, fallbackYear);

    if (!date && options.sequenceMode) {
      const base = parseISO(startDate);
      const step = direction === 'backward' ? -sequenceIndex : sequenceIndex;
      date = isoDate(new Date(base.getFullYear(), base.getMonth(), base.getDate() + step));
      sequenceIndex += 1;
    }

    if (!date) {
      const dayMatch = lower.match(/^(sun|mon|tue|wed|thu|fri|sat)\b/);
      if (dayMatch && options.sequenceMode) {
        const base = parseISO(startDate);
        const step = direction === 'backward' ? -sequenceIndex : sequenceIndex;
        date = isoDate(new Date(base.getFullYear(), base.getMonth(), base.getDate() + step));
        sequenceIndex += 1;
      }
    }

    if (!date) {
      rows.push({ raw, ok:false, error:'Could not find date. Turn on sequence mode or include dates.' });
      continue;
    }

    rows.push({ raw, ok:true, date, weight:+weight.toFixed(1), unit:defaultUnit });
  }

  return { rows };
}

function BackfillPage({ setRoute }){
  const { state, updateState } = useApp();
  const [mode, setMode] = useState('paste');
  const tabs = [
    { value:'paste', label:'Smart paste' },
    { value:'manual', label:'Manual calendar' },
    { value:'csv', label:'CSV upload' },
  ];

  return (
    <div className="space-y-6 fadein">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">Backfill · upgraded</div>
          <h1 className="text-[28px] md:text-[32px] font-semibold tracking-tight">Bring your old data in.</h1>
          <div className="text-mute mt-1.5 text-[14px] max-w-2xl">Paste messy Notes data, weights-only lists, weekday lists, CSV-style rows, or dated entries. Preview everything before importing.</div>
        </div>
        <Tabs tabs={tabs} value={mode} onChange={setMode}/>
      </div>

      {mode === 'paste' && <SmartBulkPaste setRoute={setRoute}/>} 
      {mode === 'manual' && <ManualCalendar/>}
      {mode === 'csv' && <CsvImport setRoute={setRoute}/>}
    </div>
  );
}

function SmartBulkPaste({ setRoute }){
  const { state, updateState } = useApp();
  const [text, setText] = useState('');
  const [unit, setUnit] = useState(state.settings.unit);
  const [year, setYear] = useState(new Date().getFullYear());
  const [sequenceMode, setSequenceMode] = useState(false);
  const [startDate, setStartDate] = useState(todayISO());
  const [direction, setDirection] = useState('forward');
  const [dupMode, setDupMode] = useState('replace');
  const [imported, setImported] = useState(null);

  const parsed = useMemo(()=>wlParseSmartPaste(text, { unit, year:+year, sequenceMode, startDate, direction }), [text, unit, year, sequenceMode, startDate, direction]);
  const importableRows = parsed.rows.filter(r=>r.ok);
  const skippedRows = parsed.rows.filter(r=>r.skipped);
  const errorRows = parsed.rows.filter(r=>!r.ok && !r.skipped);
  const existingDates = new Set(state.entries.map(e=>e.date));
  const dupes = importableRows.filter(r => existingDates.has(r.date));
  const dateRange = importableRows.length ? `${fmtShort(importableRows.map(r=>r.date).sort()[0])} → ${fmtShort(importableRows.map(r=>r.date).sort().slice(-1)[0])}` : '—';

  const doImport = () => {
    let toAdd = [...importableRows];
    if (dupMode === 'skip') toAdd = toAdd.filter(r => !existingDates.has(r.date));
    const entries = state.entries.filter(e => dupMode === 'replace' ? !toAdd.some(r => r.date === e.date) : true);
    toAdd.forEach((r, idx) => entries.push({
      id: 'smart_' + Date.now() + '_' + idx + '_' + r.date,
      date: r.date,
      weight: +r.weight.toFixed(1),
      unit,
      notes: 'Imported from smart paste.',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    updateState({ entries });
    setImported({ count: toAdd.length });
  };

  const samples = [
    `May 14 - 154.1\nMay 15 - 153.8\nMay 16 - 154.4`,
    `Mon: 154.3\nTue: 153.4\nWed: 152.3\nThu: 154.4`,
    `154.3\n153.4\n152.3\n154.4`,
    `Week 1\nMon: 154.3\nTue: 153.4\nAVERAGE: 153.0`
  ];

  if (imported) {
    return (
      <Card className="text-center py-12">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-accent/15 text-accent flex items-center justify-center mb-4"><I.Check className="h-6 w-6"/></div>
        <h2 className="text-xl font-semibold">Imported {imported.count} entries.</h2>
        <p className="text-mute mt-2">Your trend dashboard is now updated.</p>
        <div className="mt-5 flex gap-2 justify-center"><Button onClick={()=>setRoute('dashboard')}>Go to dashboard</Button><Button variant="secondary" onClick={()=>{ setText(''); setImported(null); }}>Import more</Button></div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_0.9fr] gap-4">
      <Card>
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <SectionLabel className="!mb-0">Paste your list</SectionLabel>
          <div className="flex items-center gap-2 text-[12px] text-mute">
            <span>Unit</span><Select value={unit} onChange={e=>setUnit(e.target.value)} className="!h-8 !text-[12px]"><option>lbs</option><option>kg</option></Select>
            <span>Year</span><Input value={year} onChange={e=>setYear(e.target.value)} className="!h-8 !w-20 !text-[12px]"/>
          </div>
        </div>

        <Textarea rows={16} className="w-full font-mono text-[13px]" placeholder={`Paste from Notes...\n\nMay 14 - 154.1\nMay 15 - 153.8\n\nor turn on sequence mode and paste:\n154.3\n153.4\n152.3`} value={text} onChange={e=>setText(e.target.value)} />

        <div className="mt-3 rounded-2xl border border-line2 bg-surface3 p-3 space-y-3">
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <div><div className="text-sm font-medium">Sequence mode</div><div className="text-[12px] text-mute">Use this when your list has weights only or weekday labels without real dates.</div></div>
            <input type="checkbox" checked={sequenceMode} onChange={e=>setSequenceMode(e.target.checked)} />
          </label>
          {sequenceMode && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 fadein">
              <div><label className="block text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">First pasted line date</label><Input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} max={todayISO()} className="w-full"/></div>
              <div><label className="block text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">Fill direction</label><Select value={direction} onChange={e=>setDirection(e.target.value)} className="w-full"><option value="forward">Forward from start date</option><option value="backward">Backward from start date</option></Select></div>
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {samples.map((s,i)=><button key={i} onClick={()=>setText(s)} className="text-[11.5px] text-mute hover:text-fg border border-line2 px-2 py-1 rounded-md">Try sample {i+1}</button>)}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <SectionLabel className="!mb-0">Preview</SectionLabel>
          <div className="flex items-center gap-3 text-[11.5px] text-mute"><span><b className="text-fg num">{importableRows.length}</b> valid</span>{errorRows.length>0 && <span className="text-danger num">{errorRows.length} errors</span>}{skippedRows.length>0 && <span className="text-mute num">{skippedRows.length} skipped</span>}{dupes.length>0 && <span className="text-warn num">{dupes.length} duplicates</span>}</div>
        </div>

        {parsed.rows.length === 0 ? <EmptyState icon={<I.Import className="h-5 w-5"/>} title="Paste data on the left" body="Smart paste can read dates, weights, weekday labels, and weights-only lists."/> : (
          <>
            <div className="bg-surface3 rounded-xl border border-line2 p-3 mb-3 text-[12.5px] grid grid-cols-3 gap-2"><div><div className="text-mute text-[10.5px] uppercase tracking-wider">Entries</div><div className="num font-medium mt-0.5">{importableRows.length}</div></div><div><div className="text-mute text-[10.5px] uppercase tracking-wider">Date range</div><div className="font-medium mt-0.5">{dateRange}</div></div><div><div className="text-mute text-[10.5px] uppercase tracking-wider">Mode</div><div className="font-medium mt-0.5">{sequenceMode ? 'Sequence' : 'Dated'}</div></div></div>
            <div className="max-h-[360px] overflow-auto border border-line2 rounded-xl"><table className="w-full text-[13px]"><thead className="text-mute text-[11px] uppercase tracking-wider"><tr className="border-b hairline"><th className="text-left px-3 py-2 font-medium">Date</th><th className="text-left px-3 py-2 font-medium">Weight</th><th className="text-left px-3 py-2 font-medium">Status</th></tr></thead><tbody>{parsed.rows.map((r,i)=><tr key={i} className="border-b hairline last:border-0"><td className="px-3 py-1.5 num">{r.ok ? r.date : '—'}</td><td className="px-3 py-1.5 num">{r.ok ? r.weight.toFixed(1) + ' ' + unit : <span className="text-mute">{r.raw}</span>}</td><td className="px-3 py-1.5">{r.skipped ? <Pill tone="neutral">Skipped</Pill> : !r.ok ? <Pill tone="danger"><I.X className="h-3 w-3"/>{r.error}</Pill> : existingDates.has(r.date) ? <Pill tone="warn">Duplicate</Pill> : <Pill tone="good"><I.Check className="h-3 w-3"/>New</Pill>}</td></tr>)}</tbody></table></div>
            {dupes.length > 0 && <div className="mt-3 flex items-center gap-2 text-[12.5px]"><span className="text-mute">Duplicate dates →</span><Select value={dupMode} onChange={e=>setDupMode(e.target.value)} className="!h-8 !text-[12px]"><option value="replace">Replace existing</option><option value="skip">Skip duplicates</option></Select></div>}
            <div className="mt-4 flex justify-end gap-2"><Button variant="secondary" onClick={()=>setText('')}>Clear</Button><Button onClick={doImport} disabled={importableRows.length===0}>Import {importableRows.length} entries</Button></div>
          </>
        )}
      </Card>
    </div>
  );
}

window.BackfillPage = BackfillPage;
try { (0, eval)('BackfillPage = window.BackfillPage'); } catch(e) {}
Object.assign(window, { BackfillPage, SmartBulkPaste, wlParseSmartPaste });
