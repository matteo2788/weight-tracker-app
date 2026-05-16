// functional-settings.js — real settings, backup, restore, and export tools
(function(){
  const e = React.createElement;
  const useState = React.useState;

  const today = () => new Date().toISOString().slice(0,10);
  const safeName = (name) => String(name || 'weightlens').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

  function downloadText(filename, text, type){
    const blob = new Blob([text], { type:type || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function csvCell(value){
    if(value === null || value === undefined) return '';
    const text = Array.isArray(value) ? value.join('; ') : String(value);
    return /[",\n]/.test(text) ? '"' + text.replace(/"/g,'""') + '"' : text;
  }

  function exportEntriesCsv(state){
    const rows = [...(state.entries || [])].sort((a,b)=>String(a.date).localeCompare(String(b.date)));
    const header = ['date','weight','unit','tags','notes'];
    const csv = [header.join(',')].concat(rows.map(row => [row.date,row.weight,row.unit || state?.settings?.unit || 'lbs',row.tags || [],row.notes || ''].map(csvCell).join(','))).join('\n');
    downloadText(`weightlens-entries-${today()}.csv`, csv, 'text/csv');
  }

  function exportMeasurementsCsv(state){
    const rows = [...(state.measurements || [])].sort((a,b)=>String(a.date).localeCompare(String(b.date)));
    const header = ['date','unit','waist','chest','hips','arm','thigh','neck','notes'];
    const csv = [header.join(',')].concat(rows.map(row => header.map(key => csvCell(row[key] || '')).join(','))).join('\n');
    downloadText(`weightlens-measurements-${today()}.csv`, csv, 'text/csv');
  }

  function mergeBackup(raw, state){
    let parsed;
    try { parsed = JSON.parse(raw); } catch(err){ throw new Error('That file is not valid JSON.'); }
    if(!parsed || typeof parsed !== 'object') throw new Error('That backup file does not look right.');

    const next = { ...state };
    if(Array.isArray(parsed.entries)) next.entries = parsed.entries;
    if(Array.isArray(parsed.measurements)) next.measurements = parsed.measurements;
    if(Array.isArray(parsed.photos)) next.photos = parsed.photos;
    if(parsed.goal && typeof parsed.goal === 'object') next.goal = parsed.goal;
    if(parsed.profile && typeof parsed.profile === 'object') next.profile = { ...(state.profile || {}), ...parsed.profile };
    if(parsed.settings && typeof parsed.settings === 'object') next.settings = { ...(state.settings || {}), ...parsed.settings };

    if(!Array.isArray(next.entries)) next.entries = [];
    next.entries = next.entries.filter(row => row && row.date && Number.isFinite(Number(row.weight))).map(row => ({ ...row, id:row.id || row.date, weight:Number(row.weight) })).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
    if(!Array.isArray(next.measurements)) next.measurements = [];
    return next;
  }

  function SettingsPage(){
    const { state, updateState, resetAll } = useApp();
    const [name,setName] = useState(state?.profile?.name || 'Matteo');
    const [saved,setSaved] = useState(false);
    const settings = state.settings || {};

    function updateSettings(patch){
      setSaved(false);
      updateState({ settings:{ ...settings, ...patch } });
    }

    function saveProfile(){
      updateState({ profile:{ ...(state.profile || {}), name:String(name || '').trim() || 'Matteo' } });
      setSaved(true);
    }

    function backupJson(){
      downloadText(`weightlens-backup-${today()}.json`, JSON.stringify(state,null,2), 'application/json');
    }

    function restoreJson(){
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.onchange = () => {
        const file = input.files && input.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const next = mergeBackup(String(reader.result || ''), state);
            if(!confirm('Restore this backup? Current matching data may be replaced.')) return;
            updateState(next);
            alert('Backup restored.');
          } catch(err){
            alert(err.message || 'Could not restore backup.');
          }
        };
        reader.readAsText(file);
      };
      input.click();
    }

    function clearEverything(){
      const first = confirm('Clear all WeightLens data from this app?');
      if(!first) return;
      const second = confirm('Are you absolutely sure? This removes entries, goals, measurements, settings, and local data.');
      if(!second) return;
      resetAll();
    }

    return e('div',{className:'wl-page fadein max-w-4xl'},
      e('div',{className:'wl-kicker'},'Preferences'),
      e('h1',{className:'wl-title mt-4'},'Settings'),
      e('p',{className:'mt-4 text-[#686761] max-w-2xl'},'Manage your profile, units, backups, and local data.'),
      saved && e('p',{className:'mt-8 text-[var(--ed-good)] font-bold'},'Saved.'),

      e('section',{className:'wl-section'},
        e('div',{className:'wl-kicker mb-6'},'Profile'),
        e('div',{className:'grid grid-cols-[1fr_auto] gap-4 items-end'},
          e('label',null,e('div',{className:'wl-kicker mb-2'},'Display name'),e('input',{className:'wl-form-line w-full',value:name,onChange:x=>{setSaved(false);setName(x.target.value);}})),
          e('button',{className:'wl-btn',onClick:saveProfile},'Save profile')
        ),
        e('p',{className:'text-[#686761] mt-4'},'This name appears in the app header and menu.')
      ),

      e('section',{className:'wl-section'},
        e('div',{className:'wl-kicker mb-6'},'Units & week'),
        e('div',{className:'grid grid-cols-3 gap-6'},
          e('label',null,e('div',{className:'wl-kicker mb-2'},'Weight unit'),e('select',{className:'wl-form-line w-full',value:settings.unit || 'lbs',onChange:x=>updateSettings({unit:x.target.value})},e('option',{value:'lbs'},'Pounds (lbs)'),e('option',{value:'kg'},'Kilograms (kg)'))),
          e('label',null,e('div',{className:'wl-kicker mb-2'},'Measurement unit'),e('select',{className:'wl-form-line w-full',value:settings.measurementUnit || 'in',onChange:x=>updateSettings({measurementUnit:x.target.value})},e('option',{value:'in'},'Inches (in)'),e('option',{value:'cm'},'Centimeters (cm)'))),
          e('label',null,e('div',{className:'wl-kicker mb-2'},'Week starts on'),e('select',{className:'wl-form-line w-full',value:String(settings.weekStartDay ?? 1),onChange:x=>updateSettings({weekStartDay:Number(x.target.value)})},e('option',{value:'1'},'Monday'),e('option',{value:'0'},'Sunday')))
        )
      ),

      e('section',{className:'wl-section'},
        e('div',{className:'wl-kicker mb-6'},'Reminders'),
        e('div',{className:'grid grid-cols-[1fr_220px] gap-6 items-end'},
          e('div',null,e('p',{className:'font-bold'},'Daily weigh-in reminder'),e('p',{className:'text-[#686761] mt-2'},'Preview setting only for now. Real notifications can be added later.')),
          e('input',{className:'wl-form-line w-full',type:'time',value:settings.reminderTime || '07:30',onChange:x=>updateSettings({reminderTime:x.target.value})})
        )
      ),

      e('section',{className:'wl-section'},
        e('div',{className:'wl-kicker mb-6'},'Data'),
        e('div',{className:'grid grid-cols-2 gap-4'},
          e('button',{className:'wl-btn light',onClick:backupJson},'↓ Backup as JSON'),
          e('button',{className:'wl-btn light',onClick:restoreJson},'↥ Restore from JSON'),
          e('button',{className:'wl-btn light',onClick:()=>exportEntriesCsv(state)},'↓ Export entries as CSV'),
          e('button',{className:'wl-btn light',onClick:()=>exportMeasurementsCsv(state)},'↓ Export measurements as CSV'),
          e('button',{className:'wl-btn light text-red-600',onClick:clearEverything},'⌫ Clear all data')
        ),
        e('p',{className:'text-[#686761] mt-5'},'JSON backup saves the full app state. CSV exports are better for spreadsheets.')
      ),

      e('section',{className:'wl-section'},
        e('div',{className:'wl-kicker mb-4'},'About'),
        e('p',{className:'text-[#686761] leading-relaxed'},'WeightLens is a calm trend dashboard for body weight. Your data can sync to your account and can also be backed up locally anytime.')
      )
    );
  }

  function install(){ window.SettingsPage = SettingsPage; }
  install();
  window.addEventListener('load', install);
  setTimeout(install,100);
  setTimeout(install,500);
})();
