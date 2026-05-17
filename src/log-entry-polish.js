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

    const [draft,setDraft] = useState(blankDraft(state, pendingEntry || todayEntry || null));
    const [q,setQ] = useState('');
    const [saved,setSaved] = useState('');

    const existingForDate = allAsc.find(x => x.date === draft.date);
    const previous = latestBefore(allAsc, draft.date) || allDesc[0] || null;
    const weightNum = Number(draft.weight);
    const prevWeight = previous ? Number(previous.weight) : null;
    const diff = Number.isFinite(weightNum) && Number.isFinite(prevWeight) ? weightNum - prevWeight : null;
    const isToday = draft.date === todayKey;
    const willUpdate = Boolean(existingForDate && existingForDate.date !== draft.originalDate);
    const editingExisting = Boolean(draft.originalDate);

    const rows = allDesc.filter(row => {
      const needle = `${row.date} ${shortDate(row.date)} ${longDate(row.date)} ${(row.tags||[]).join(' ')} ${row.notes||''} ${row.weight}`.toLowerCase();
      return !q || needle.includes(q.toLowerCase());
    });

    function startToday(){
      const row = allAsc.find(x => x.date === todayKey) || null;
      setDraft(blankDraft(state, row));
      setSaved('');
      window.scrollTo({top:0, behavior:'smooth'});
    }

    function startBlank(){
      setDraft(blankDraft(state, null));
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
      if(draft.date === date || draft.originalDate === date) setDraft(blankDraft(state, null));
    }

    return e('div',{className:'wl-page fadein wl-log-page'},
      e('div',{className:'wl-log-hero'},
        e('div',null,
          e('div',{className:'wl-kicker'},'Daily log'),
          e('h1',{className:'wl-title mt-4'}, isToday ? 'Log today’s weight' : 'Log weight'),
          e('p',{className:'mt-4 text-[#686761] max-w-xl'},'Add one calm data point. The app updates the trend automatically and replaces duplicate dates instead of creating messy copies.')
        ),
        e('div',{className:'wl-log-hero-actions'},
          e('button',{className:'wl-btn light',onClick:startBlank},'New date'),
          e('button',{className:'wl-btn',onClick:startToday}, todayEntry ? 'Edit today' : '+ Today')
        )
      ),

      saved && e('div',{className:'wl-log-saved'}, saved),

      e('section',{className:'wl-log-card'},
        e('div',{className:'wl-log-card-head'},
          e('div',null,
            e('div',{className:'wl-kicker'}, editingExisting ? 'Editing entry' : isToday ? 'Today’s entry' : 'New entry'),
            e('h2',{className:'wl-log-card-title'}, draft.date ? longDate(draft.date) : 'Choose a date')
          ),
          e('div',{className:'wl-log-status'}, willUpdate ? 'Will replace existing date' : editingExisting ? 'Saved date' : 'New data point')
        ),

        e('div',{className:'wl-log-form-grid'},
          e('label',null,
            e('div',{className:'wl-kicker mb-2'},'Date'),
            e('input',{className:'wl-form-line w-full',type:'date',value:draft.date,onChange:x=>{setSaved('');setDraft({...draft,date:x.target.value,originalDate:draft.originalDate});}})
          ),
          e('label',null,
            e('div',{className:'wl-kicker mb-2'},`Weight (${unit})`),
            e('input',{className:'wl-form-line w-full wl-log-weight-input',inputMode:'decimal',placeholder:'154.2',value:draft.weight,onChange:x=>{setSaved('');setDraft({...draft,weight:x.target.value});}})
          ),
          e('label',null,
            e('div',{className:'wl-kicker mb-2'},'Tags'),
            e('input',{className:'wl-form-line w-full',placeholder:'high sodium, ate late',value:draft.tagsText,onChange:x=>{setSaved('');setDraft({...draft,tagsText:x.target.value});}})
          ),
          e('label',null,
            e('div',{className:'wl-kicker mb-2'},'Notes'),
            e('input',{className:'wl-form-line w-full',placeholder:'Optional note',value:draft.notes,onChange:x=>{setSaved('');setDraft({...draft,notes:x.target.value});}})
          )
        ),

        e('div',{className:'wl-log-context'},
          e('div',null,
            e('div',{className:'wl-kicker'},'Previous entry'),
            e('div',{className:'wl-log-context-main'}, previous ? `${one(previous.weight)} ${unit}` : '—'),
            e('div',{className:'wl-log-context-sub'}, previous ? shortDate(previous.date) : 'No previous data yet')
          ),
          e('div',null,
            e('div',{className:'wl-kicker'},'Change vs previous'),
            e('div',{className:`wl-log-context-main ${diff < 0 ? 'good' : diff > 0 ? 'warn' : ''}`}, Number.isFinite(diff) ? `${diff > 0 ? '+' : ''}${one(diff)} ${unit}` : '—'),
            e('div',{className:'wl-log-context-sub'},'One change does not define the trend')
          ),
          e('div',null,
            e('div',{className:'wl-kicker'},'Save behavior'),
            e('div',{className:'wl-log-context-main small'}, willUpdate ? 'Replace' : 'Add'),
            e('div',{className:'wl-log-context-sub'}, willUpdate ? 'This date already exists' : 'No duplicate for this date')
          )
        ),

        e('div',{className:'wl-log-actions'},
          e('button',{className:'wl-btn',onClick:save}, editingExisting || willUpdate ? 'Save changes' : 'Save entry'),
          editingExisting && e('button',{className:'wl-btn light wl-log-danger',onClick:()=>del(draft.originalDate)},'Delete'),
          e('button',{className:'wl-link',onClick:()=>setDraft(blankDraft(state, null))},'Clear')
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
            e('div',{className:'wl-log-row-actions'},e('button',{onClick:()=>edit(row)},'Edit'),e('button',{onClick:()=>del(row.date)},'⌫'))
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
