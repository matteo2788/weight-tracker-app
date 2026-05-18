// log-entry-polish.js — polished daily log flow for WeightLens
(function(){
  const e = React.createElement;
  const useState = React.useState;

  const today = () => new Date().toISOString().slice(0,10);
  const one = v => Number.isFinite(Number(v)) ? Number(v).toFixed(1) : '—';
  const unitOf = state => state?.settings?.unit || 'lbs';
  const shortDate = d => { try { return new Date(d + 'T00:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'}); } catch(err){ return d || '—'; } };
  const longDate = d => { try { return new Date(d + 'T00:00:00').toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric',year:'numeric'}); } catch(err){ return d || '—'; } };
  const entriesAsc = state => [...(state?.entries || [])].filter(x=>x && x.date).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  const entriesDesc = state => [...(state?.entries || [])].filter(x=>x && x.date).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  const tagsFrom = text => String(text || '').split(',').map(x=>x.trim()).filter(Boolean);

  function latestBefore(entries, date){
    return [...entries].filter(x => String(x.date) < String(date)).sort((a,b)=>String(b.date).localeCompare(String(a.date)))[0] || null;
  }

  function blankDraft(state, row){
    const t = today();
    return {
      originalDate: row?.date || '',
      date: row?.date || t,
      weight: row?.weight ?? '',
      tagsText: Array.isArray(row?.tags) ? row.tags.join(', ') : '',
      notes: row?.notes || '',
      unit: row?.unit || unitOf(state)
    };
  }

  function emptyDraftForToday(state){
    return {
      originalDate: '',
      date: today(),
      weight: '',
      tagsText: '',
      notes: '',
      unit: unitOf(state)
    };
  }

  function saveEntry(state, updateState, draft){
    const date = String(draft.date || '').trim();
    const weight = Number(draft.weight);
    if(!date){ alert('Choose a date.'); return false; }
    if(!Number.isFinite(weight)){ alert('Enter a valid weight.'); return false; }

    const entry = {
      id: date,
      date,
      weight,
      unit: draft.unit || unitOf(state),
      tags: tagsFrom(draft.tagsText),
      notes: String(draft.notes || '').trim()
    };

    const without = (state.entries || []).filter(x => x.date !== (draft.originalDate || date) && x.date !== date);
    const entries = [...without, entry].sort((a,b)=>String(a.date).localeCompare(String(b.date)));
    updateState({ entries });
    return true;
  }

  function removeEntry(state, updateState, date){
    if(!date) return;
    if(!confirm('Delete this entry?')) return;
    updateState({ entries:(state.entries || []).filter(x => x.date !== date) });
  }

  function Pill({children}){ return e('span',{className:'wl-log-pill'},children); }

  function LogWeightPage(){
    const { state, updateState } = useApp();
    const unit = unitOf(state);
    const allAsc = entriesAsc(state);
    const allDesc = entriesDesc(state);
    const todayKey = today();
    const todayEntry = allAsc.find(x => x.date === todayKey) || null;
    const pendingDate = window.__wlEditEntryDate || '';
    if(window.__wlEditEntryDate) window.__wlEditEntryDate = '';
    const pendingEntry = pendingDate ? allAsc.find(x => x.date === pendingDate) : null;

    const [draft,setDraft] = useState(pendingEntry ? blankDraft(state, pendingEntry) : emptyDraftForToday(state));
    const [q,setQ] = useState('');
    const [saved,setSaved] = useState('');

    const existingForDate = allAsc.find(x => x.date === draft.date);
    const previous = latestBefore(allAsc, draft.date) || allDesc[0] || null;
    const weightNum = Number(draft.weight);
    const prevWeight = previous ? Number(previous.weight) : null;
    const diff = Number.isFinite(weightNum) && Number.isFinite(prevWeight) ? weightNum - prevWeight : null;
    const isToday = draft.date === todayKey;
    const willReplace = Boolean(existingForDate && existingForDate.date !== draft.originalDate);
    const editingExisting = Boolean(draft.originalDate);
    const modeLabel = editingExisting ? 'Editing saved entry' : willReplace ? 'Will replace this date' : 'New entry';
    const helperLine = editingExisting
      ? 'You are editing a saved weigh-in. Save changes will update this entry.'
      : willReplace
        ? 'This date already has a weigh-in. Saving will replace it, not duplicate it.'
        : 'Add today’s weight. Tags and notes are optional.';

    const rows = allDesc.filter(row => {
      const needle = `${row.date} ${shortDate(row.date)} ${longDate(row.date)} ${(row.tags||[]).join(' ')} ${row.notes||''} ${row.weight}`.toLowerCase();
      return !q || needle.includes(q.toLowerCase());
    });

    function startToday(){
      const row = allAsc.find(x => x.date === todayKey) || null;
      setDraft(row ? blankDraft(state, row) : emptyDraftForToday(state));
      setSaved('');
      window.scrollTo({top:0, behavior:'smooth'});
    }

    function startBlank(){
      setDraft(emptyDraftForToday(state));
      setSaved('');
      window.scrollTo({top:0, behavior:'smooth'});
    }

    function edit(row){
      setDraft(blankDraft(state, row));
      setSaved('');
      window.scrollTo({top:0, behavior:'smooth'});
    }

    function save(){
      const ok = saveEntry(state, updateState, draft);
      if(!ok) return;
      const label = draft.date === todayKey ? 'today' : shortDate(draft.date);
      setSaved(`Saved ${label}. Trend updated.`);
      setDraft(prev => ({...prev, originalDate: prev.date}));
      setTimeout(()=>setSaved(''), 3500);
    }

    function del(date){
      removeEntry(state, updateState, date);
      if(draft.date === date || draft.originalDate === date) setDraft(emptyDraftForToday(state));
    }

    return e('div',{className:'wl-page fadein wl-log-page'},
      e('div',{className:'wl-log-hero'},
        e('div',null,
          e('div',{className:'wl-kicker'},'Daily log'),
          e('h1',{className:'wl-title mt-4'},'Log today’s weight'),
          e('p',{className:'mt-4 text-[#686761] max-w-xl'},'Enter one calm data point. Weight goes in the main field. Tags and notes are optional context, not required.')
        ),
        e('div',{className:'wl-log-hero-actions'},
          e('button',{className:'wl-btn light',onClick:startBlank},'Clear form'),
          e('button',{className:'wl-btn',onClick:startToday}, todayEntry ? 'Edit today' : 'Use today')
        )
      ),

      saved && e('div',{className:'wl-log-saved'}, saved),

      e('section',{className:'wl-log-card'},
        e('div',{className:'wl-log-card-head'},
          e('div',null,
            e('div',{className:'wl-kicker'}, modeLabel),
            e('h2',{className:'wl-log-card-title'}, isToday ? 'Today' : longDate(draft.date)),
            e('p',{className:'wl-log-helper'},helperLine)
          ),
          e('div',{className:'wl-log-status'}, editingExisting ? 'Loaded saved values' : willReplace ? 'Save replaces date' : 'Ready to add')
        ),

        e('div',{className:'wl-log-main-fields'},
          e('label',{className:'wl-log-field wl-log-weight-field'},
            e('div',{className:'wl-kicker mb-2'},`Weight (${unit})`),
            e('input',{className:'wl-form-line w-full wl-log-weight-input',inputMode:'decimal',placeholder:'Enter weight',value:draft.weight,onChange:x=>{setSaved('');setDraft({...draft,weight:x.target.value});}}),
            e('div',{className:'wl-log-field-hint'}, previous ? `Previous: ${one(previous.weight)} ${unit} on ${shortDate(previous.date)}` : 'No previous weigh-in yet')
          ),
          e('label',{className:'wl-log-field'},
            e('div',{className:'wl-kicker mb-2'},'Date'),
            e('input',{className:'wl-form-line w-full',type:'date',value:draft.date,onChange:x=>{setSaved('');setDraft({...draft,date:x.target.value,originalDate:draft.originalDate});}}),
            e('div',{className:'wl-log-field-hint'}, willReplace ? 'Already logged — saving will replace it' : 'Choose the day this weight belongs to')
          )
        ),

        e('div',{className:'wl-log-optional-fields'},
          e('label',{className:'wl-log-field'},
            e('div',{className:'wl-kicker mb-2'},'Tags optional'),
            e('input',{className:'wl-form-line w-full',placeholder:'Example: high sodium, late meal',value:draft.tagsText,onChange:x=>{setSaved('');setDraft({...draft,tagsText:x.target.value});}})
          ),
          e('label',{className:'wl-log-field'},
            e('div',{className:'wl-kicker mb-2'},'Notes optional'),
            e('input',{className:'wl-form-line w-full',placeholder:'Add a short note if useful',value:draft.notes,onChange:x=>{setSaved('');setDraft({...draft,notes:x.target.value});}})
          )
        ),

        e('div',{className:'wl-log-context'},
          e('div',null,
            e('div',{className:'wl-kicker'},'Previous weigh-in'),
            e('div',{className:'wl-log-context-main'}, previous ? `${one(previous.weight)} ${unit}` : '—'),
            e('div',{className:'wl-log-context-sub'}, previous ? shortDate(previous.date) : 'No previous data yet')
          ),
          e('div',null,
            e('div',{className:'wl-kicker'},'Difference from previous'),
            e('div',{className:`wl-log-context-main ${diff < 0 ? 'good' : diff > 0 ? 'warn' : ''}`}, Number.isFinite(diff) ? `${diff > 0 ? '+' : ''}${one(diff)} ${unit}` : '—'),
            e('div',{className:'wl-log-context-sub'},'Just a day-to-day comparison. The trend line matters more.')
          )
        ),

        e('div',{className:'wl-log-actions'},
          e('button',{className:'wl-btn',onClick:save}, editingExisting || willReplace ? 'Save changes' : 'Save entry'),
          editingExisting && e('button',{className:'wl-btn light wl-log-danger',onClick:()=>del(draft.originalDate)},'Delete'),
          e('button',{className:'wl-link',onClick:()=>setDraft(emptyDraftForToday(state))},'Clear')
        )
      ),

      e('section',{className:'wl-section wl-log-history'},
        e('div',{className:'wl-section-head'},
          e('div',null,
            e('div',{className:'wl-kicker'},'History'),
            e('h2',{className:'wl-title'},'Recent entries')
          ),
          e('input',{className:'wl-form-line wl-log-search',placeholder:'Search date, tag, note…',value:q,onChange:x=>setQ(x.target.value)})
        ),
        e('div',{className:'wl-list'},
          rows.length ? rows.map((row,i)=>e('div',{className:'wl-list-row wl-log-row',key:row.date},
            e('div',{className:'wl-row-index'},String(i+1).padStart(2,'0')),
            e('div',null,e('div',{className:'wl-row-title'},shortDate(row.date)),e('div',{className:'wl-row-sub'},row.date)),
            e('div',null,e('b',null,one(row.weight)),e('span',{className:'text-xs'},` ${unit}`)),
            e('div',null,(row.tags||[]).length ? row.tags.map(t=>e(Pill,{key:t},t)) : e('span',{className:'wl-row-sub'},'No tags'), row.notes && e('div',{className:'wl-row-sub mt-2'},row.notes)),
            e('div',{className:'wl-log-row-actions'},
              e('button',{className:'wl-log-edit-action',onClick:()=>edit(row)},'Edit'),
              e('button',{className:'wl-log-delete-action',onClick:()=>del(row.date)},'Delete')
            )
          )) : e('div',{className:'py-14 text-center text-[#686761]'},'No entries found.')
        )
      )
    );
  }

  function install(){ window.LogWeightPage = LogWeightPage; }
  install();
  window.addEventListener('load', install);
  setTimeout(install,100);
  setTimeout(install,500);
})();