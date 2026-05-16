// functional-measurements.js — measurement tracking for WeightLens
(function(){
  const e = React.createElement;
  const useState = React.useState;
  const today = () => new Date().toISOString().slice(0,10);
  const fields = [['waist','Waist'],['chest','Chest'],['hips','Hips'],['arm','Arm'],['thigh','Thigh'],['neck','Neck']];
  const one = v => Number.isFinite(Number(v)) ? Number(v).toFixed(1) : '—';
  const shortDate = d => { try { return new Date(d + 'T00:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}); } catch(err){ return d || '—'; } };
  const unitOf = state => state?.settings?.measurementUnit || 'in';
  const rowsOf = state => [...(state?.measurements || [])].sort((a,b)=>String(b.date).localeCompare(String(a.date)));

  function blank(state, row){
    const draft = { originalDate: row?.date || '', date: row?.date || today(), unit: row?.unit || unitOf(state), notes: row?.notes || '' };
    fields.forEach(([key]) => draft[key] = row?.[key] ?? '');
    return draft;
  }

  function latest(rows){
    const out = {};
    fields.forEach(([key]) => {
      const found = rows.find(row => Number.isFinite(Number(row[key])));
      out[key] = found ? found : null;
    });
    return out;
  }

  function MeasurementsPage(){
    const { state, updateState } = useApp();
    const rows = rowsOf(state);
    const last = latest(rows);
    const [open,setOpen] = useState(false);
    const [draft,setDraft] = useState(blank(state));
    const [saved,setSaved] = useState(false);

    function patch(x){ setSaved(false); setDraft(prev => ({...prev,...x})); }
    function start(){ setDraft(blank(state)); setOpen(true); }
    function edit(row){ setDraft(blank(state,row)); setOpen(true); window.scrollTo({top:0,behavior:'smooth'}); }
    function remove(date){
      if(!confirm('Delete this measurement entry?')) return;
      updateState({ measurements:(state.measurements || []).filter(row => row.date !== date) });
      if(draft.originalDate === date){ setOpen(false); setDraft(blank(state)); }
    }
    function save(){
      if(!draft.date){ alert('Choose a date.'); return; }
      const hasValue = fields.some(([key]) => draft[key] !== '' && Number.isFinite(Number(draft[key])));
      if(!hasValue){ alert('Enter at least one measurement.'); return; }
      const row = { id:draft.date, date:draft.date, unit:draft.unit || unitOf(state), notes:String(draft.notes || '').trim() };
      for(const [key,label] of fields){
        if(draft[key] !== ''){
          const value = Number(draft[key]);
          if(!Number.isFinite(value)){ alert(label + ' must be a number.'); return; }
          row[key] = value;
        }
      }
      const without = (state.measurements || []).filter(item => item.date !== (draft.originalDate || row.date) && item.date !== row.date);
      updateState({ measurements:[...without,row].sort((a,b)=>String(a.date).localeCompare(String(b.date))) });
      setOpen(false); setDraft(blank(state)); setSaved(true);
    }

    return e('div',{className:'wl-page fadein'},
      e('div',{className:'wl-section-head'},
        e('div',null,
          e('div',{className:'wl-kicker'},'Measurements'),
          e('h1',{className:'wl-title mt-4'},'Measurements'),
          e('p',{className:'mt-4 text-[#686761] max-w-xl'},'Track optional measurements alongside scale weight so progress is easier to understand.')
        ),
        e('button',{className:'wl-btn',onClick:start},'+ New measurement')
      ),
      saved && e('p',{className:'mb-8 text-[var(--ed-good)] font-bold'},'Saved.'),
      open && e('section',{className:'wl-rule mb-14'},
        e('div',{className:'flex justify-between items-start gap-4 mb-8'},
          e('div',null,e('div',{className:'wl-kicker'},draft.originalDate ? 'Edit entry' : 'New entry'),e('p',{className:'mt-2 text-[#686761]'},'Fill only the fields you track. Empty fields are ignored.')),
          e('button',{className:'wl-link',onClick:()=>{setOpen(false);setDraft(blank(state));}},'Cancel')
        ),
        e('div',{className:'grid grid-cols-3 gap-6'},
          e('label',null,e('div',{className:'wl-kicker mb-2'},'Date'),e('input',{className:'wl-form-line w-full',type:'date',value:draft.date,onChange:x=>patch({date:x.target.value})})),
          e('label',null,e('div',{className:'wl-kicker mb-2'},'Unit'),e('select',{className:'wl-form-line w-full',value:draft.unit,onChange:x=>patch({unit:x.target.value})},e('option',{value:'in'},'Inches'),e('option',{value:'cm'},'Centimeters'))),
          e('label',null,e('div',{className:'wl-kicker mb-2'},'Notes'),e('input',{className:'wl-form-line w-full',value:draft.notes,onChange:x=>patch({notes:x.target.value}),placeholder:'Optional'}))
        ),
        e('div',{className:'grid grid-cols-3 gap-6 mt-8'},fields.map(([key,label])=>e('label',{key},e('div',{className:'wl-kicker mb-2'},label),e('input',{className:'wl-form-line w-full',inputMode:'decimal',value:draft[key],onChange:x=>patch({[key]:x.target.value}),placeholder:'—'})))),
        e('div',{className:'flex gap-3 mt-8 flex-wrap'},e('button',{className:'wl-btn',onClick:save},draft.originalDate ? 'Save changes' : 'Save measurement'),draft.originalDate && e('button',{className:'wl-btn light text-red-600',onClick:()=>remove(draft.originalDate)},'Delete'))
      ),
      e('div',{className:'grid grid-cols-6 gap-12 mt-14 border-b border-[var(--ed-line)] pb-12'},fields.map(([key,label])=>e('div',{key},e('div',{className:'wl-kicker'},label),e('div',{className:'mt-5 text-2xl font-black'},last[key] ? one(last[key][key]) : '—',e('span',{className:'text-sm ml-1'},last[key]?.unit || unitOf(state))),last[key] && e('div',{className:'text-xs text-[#686761] mt-2'},shortDate(last[key].date))))),
      rows.length === 0 ? e('div',{className:'text-center mt-28'},e('div',{className:'text-3xl font-black tracking-[-.06em]'},'No measurements yet'),e('p',{className:'text-[#686761] mt-3'},'Add your first measurement above.')) :
      e('section',{className:'wl-section'},e('div',{className:'wl-section-head'},e('div',null,e('div',{className:'wl-kicker'},'History'),e('h2',{className:'wl-title'},'Measurement log'))),e('div',{className:'wl-list'},rows.map((row,i)=>e('div',{className:'wl-list-row',key:row.date},e('div',{className:'wl-row-index'},String(i+1).padStart(2,'0')),e('div',null,e('div',{className:'wl-row-title'},shortDate(row.date)),e('div',{className:'wl-row-sub'},row.notes || 'No notes')),e('div',null,e('b',null,fields.map(([key,label])=>Number.isFinite(Number(row[key])) ? label + ': ' + one(row[key]) : null).filter(Boolean).slice(0,2).join(' · ') || '—')),e('div',{className:'wl-row-sub'},fields.map(([key,label])=>Number.isFinite(Number(row[key])) ? label + ' ' + one(row[key]) + (row.unit || unitOf(state)) : null).filter(Boolean).slice(2).join(' · ') || '—'),e('div',{className:'flex gap-3 justify-end'},e('button',{className:'text-[#77736B]',onClick:()=>edit(row)},'Edit'),e('button',{className:'text-[#999]',onClick:()=>remove(row.date)},'⌫'))))))
    );
  }

  function install(){ window.MeasurementsPage = MeasurementsPage; }
  install(); window.addEventListener('load', install); setTimeout(install,100); setTimeout(install,500);
})();
