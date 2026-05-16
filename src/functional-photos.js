// functional-photos.js — local progress photo tracking for WeightLens
(function(){
  const e = React.createElement;
  const useState = React.useState;
  const today = () => new Date().toISOString().slice(0,10);
  const uid = () => 'photo_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,8);
  const shortDate = d => { try { return new Date(d + 'T00:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}); } catch(err){ return d || '—'; } };
  const rowsOf = state => [...(state?.photos || [])].sort((a,b)=>String(b.date).localeCompare(String(a.date)) || String(b.createdAt || '').localeCompare(String(a.createdAt || '')));

  function blank(row){
    return {
      id: row?.id || '',
      date: row?.date || today(),
      label: row?.label || 'Front',
      notes: row?.notes || '',
      src: row?.src || '',
      fileName: row?.fileName || ''
    };
  }

  function readImage(file){
    return new Promise((resolve,reject)=>{
      if(!file) return resolve(null);
      if(!String(file.type || '').startsWith('image/')) return reject(new Error('Please choose an image file.'));
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Could not read that image.'));
      reader.readAsDataURL(file);
    });
  }

  function PhotoTrackerPage(){
    const { state, updateState } = useApp();
    const photos = rowsOf(state);
    const [draft,setDraft] = useState(blank());
    const [open,setOpen] = useState(false);
    const [saved,setSaved] = useState(false);
    const [preview,setPreview] = useState(null);

    function patch(x){ setSaved(false); setDraft(prev => ({...prev,...x})); }
    function start(){ setDraft(blank()); setPreview(null); setOpen(true); }
    function edit(photo){ setDraft(blank(photo)); setPreview(photo.src); setOpen(true); setSaved(false); window.scrollTo({top:0,behavior:'smooth'}); }

    async function chooseFile(event){
      try {
        const file = event.target.files && event.target.files[0];
        if(!file) return;
        const src = await readImage(file);
        patch({ src, fileName:file.name || 'photo' });
        setPreview(src);
      } catch(err){ alert(err.message || 'Could not load photo.'); }
    }

    function save(){
      if(!draft.date){ alert('Choose a date.'); return; }
      if(!draft.src){ alert('Choose a photo first.'); return; }
      const photo = {
        id: draft.id || uid(),
        date: draft.date,
        label: String(draft.label || 'Progress').trim(),
        notes: String(draft.notes || '').trim(),
        src: draft.src,
        fileName: draft.fileName || 'photo',
        createdAt: draft.id ? (photos.find(x=>x.id === draft.id)?.createdAt || new Date().toISOString()) : new Date().toISOString()
      };
      const without = (state.photos || []).filter(x => x.id !== photo.id);
      updateState({ photos:[...without, photo] });
      setOpen(false); setDraft(blank()); setPreview(null); setSaved(true);
    }

    function remove(id){
      if(!confirm('Delete this progress photo?')) return;
      updateState({ photos:(state.photos || []).filter(x => x.id !== id) });
      if(draft.id === id){ setOpen(false); setDraft(blank()); setPreview(null); }
    }

    return e('div',{className:'wl-page fadein'},
      e('div',{className:'wl-section-head'},
        e('div',null,
          e('div',{className:'wl-kicker'},'Progress photos'),
          e('h1',{className:'wl-title mt-4'},'Progress Photos'),
          e('p',{className:'mt-4 text-[#686761] max-w-xl'},'Upload optional photos over time so you can compare visual progress alongside weight and measurements.')
        ),
        e('button',{className:'wl-btn',onClick:start},'+ Add photo')
      ),
      saved && e('p',{className:'mb-8 text-[var(--ed-good)] font-bold'},'Saved.'),
      open && e('section',{className:'wl-rule mb-14'},
        e('div',{className:'flex justify-between items-start gap-4 mb-8'},
          e('div',null,e('div',{className:'wl-kicker'},draft.id ? 'Edit photo' : 'New photo'),e('p',{className:'mt-2 text-[#686761]'},'Add a date, label, and note so the photo is useful later.')),
          e('button',{className:'wl-link',onClick:()=>{setOpen(false);setDraft(blank());setPreview(null);}},'Cancel')
        ),
        e('div',{className:'wl-grid-2'},
          e('div',null,
            e('div',{className:'grid grid-cols-2 gap-6'},
              e('label',null,e('div',{className:'wl-kicker mb-2'},'Date'),e('input',{className:'wl-form-line w-full',type:'date',value:draft.date,onChange:x=>patch({date:x.target.value})})),
              e('label',null,e('div',{className:'wl-kicker mb-2'},'Label'),e('select',{className:'wl-form-line w-full',value:draft.label,onChange:x=>patch({label:x.target.value})},e('option',null,'Front'),e('option',null,'Side'),e('option',null,'Back'),e('option',null,'Other')))
            ),
            e('label',{className:'block mt-8'},e('div',{className:'wl-kicker mb-2'},'Notes'),e('textarea',{className:'wl-form-line w-full',style:{minHeight:'90px',lineHeight:'1.5',paddingTop:'12px'},value:draft.notes,onChange:x=>patch({notes:x.target.value}),placeholder:'Optional notes...'})),
            e('label',{className:'wl-btn light mt-8 inline-flex cursor-pointer'},'Choose photo',e('input',{type:'file',accept:'image/*',onChange:chooseFile,style:{display:'none'}})),
            e('div',{className:'flex gap-3 mt-8 flex-wrap'},e('button',{className:'wl-btn',onClick:save},draft.id ? 'Save changes' : 'Save photo'),draft.id && e('button',{className:'wl-btn light text-red-600',onClick:()=>remove(draft.id)},'Delete'))
          ),
          e('div',{className:'wl-rule'},
            preview ? e('img',{src:preview,alt:'Progress preview',style:{width:'100%',maxHeight:'520px',objectFit:'cover',borderRadius:'18px'}}) : e('div',{className:'text-center py-24 text-[#686761]'},'No photo selected yet')
          )
        )
      ),
      photos.length === 0 ? e('div',{className:'text-center mt-28'},e('div',{className:'text-3xl font-black tracking-[-.06em]'},'No photos yet'),e('p',{className:'text-[#686761] mt-3'},'Add your first photo above.')) :
      e('section',{className:'wl-section'},
        e('div',{className:'wl-section-head'},e('div',null,e('div',{className:'wl-kicker'},'Gallery'),e('h2',{className:'wl-title'},'Your photo log'))),
        e('div',{className:'grid grid-cols-3 gap-6'},photos.map(photo=>e('article',{className:'wl-rule',key:photo.id},
          e('img',{src:photo.src,alt:photo.label || 'Progress photo',style:{width:'100%',aspectRatio:'3/4',objectFit:'cover',borderRadius:'18px'}}),
          e('div',{className:'mt-5 flex justify-between gap-3'},e('div',null,e('div',{className:'wl-row-title'},shortDate(photo.date)),e('div',{className:'wl-row-sub'},photo.label || 'Progress')),e('div',{className:'flex gap-3'},e('button',{className:'text-[#77736B]',onClick:()=>edit(photo)},'Edit'),e('button',{className:'text-[#999]',onClick:()=>remove(photo.id)},'⌫'))),
          photo.notes && e('p',{className:'text-[#686761] mt-4'},photo.notes)
        )))
      )
    );
  }

  function install(){
    window.ProgressPhotosPage = PhotoTrackerPage;
    window.PhotosPage = PhotoTrackerPage;
  }
  install(); window.addEventListener('load', install); setTimeout(install,100); setTimeout(install,500); setTimeout(install,1500);
})();
