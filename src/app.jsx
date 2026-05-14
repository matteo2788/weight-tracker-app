// app.jsx — top-level app, router, state provider, tweaks panel, mount

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "name": "Matteo",
  "accent": "#65A30D",
  "unit": "lbs",
  "weekStartDay": 1,
  "showRightPanel": true
}/*EDITMODE-END*/;

const PALETTE_OPTIONS = [
  { hex:'#65A30D', label:'Lime'    }, // lime-600 — fresh / vibrant
  { hex:'#10B981', label:'Emerald' }, // emerald-500
  { hex:'#6366F1', label:'Indigo'  }, // indigo-500
  { hex:'#8B5CF6', label:'Violet'  }, // violet-500
  { hex:'#F97316', label:'Orange'  }, // orange-500
  { hex:'#EC4899', label:'Pink'    }, // pink-500
  { hex:'#0EA5E9', label:'Sky'     }, // sky-500
  { hex:'#0A0A0A', label:'Mono'    }, // near-black
];

function hexToRgbTriplet(hex){
  const h = hex.replace('#','');
  const v = h.length === 3
    ? [h[0]+h[0], h[1]+h[1], h[2]+h[2]]
    : [h.slice(0,2), h.slice(2,4), h.slice(4,6)];
  return v.map(x => parseInt(x,16)).join(' ');
}

function App(){
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [state, setState] = useState(() => loadState());
  const [route, setRoute] = useState(() => {
    if (typeof location !== 'undefined' && location.hash) {
      const h = location.hash.slice(1);
      if (NAV.find(n => n.id === h)) return h;
    }
    return 'dashboard';
  });
  const [menuOpen, setMenuOpen] = useState(false);

  // Persist app state
  useEffect(() => { saveState(state); }, [state]);
  useEffect(() => { if (typeof location !== 'undefined') location.hash = route; }, [route]);

  // Live-apply accent color → CSS var (Tailwind tokens read this for bg-accent / text-accent / etc.)
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-rgb', hexToRgbTriplet(t.accent));
  }, [t.accent]);

  // Mirror tweaks ↔ state for the things stored in both places
  useEffect(() => {
    if (t.name && state.profile?.name !== t.name) {
      setState(prev => ({ ...prev, profile: { ...(prev.profile||{}), name: t.name } }));
    }
  }, [t.name]);
  useEffect(() => {
    if (t.unit && state.settings?.unit !== t.unit) {
      setState(prev => ({ ...prev, settings: { ...prev.settings, unit: t.unit } }));
    }
  }, [t.unit]);
  useEffect(() => {
    if (t.weekStartDay != null && state.settings?.weekStartDay !== +t.weekStartDay) {
      setState(prev => ({ ...prev, settings: { ...prev.settings, weekStartDay: +t.weekStartDay } }));
    }
  }, [t.weekStartDay]);

  const updateState = useCallback((patch) => {
    setState(prev => {
      if (typeof patch === 'function') return patch(prev);
      return { ...prev, ...patch };
    });
  }, []);

  const resetAll = useCallback(() => {
    const fresh = { ...freshState() };
    setState(fresh);
    setTweak({ name: 'Matteo', accent: '#65A30D', unit: 'lbs', weekStartDay: 1 });
  }, [setTweak]);

  const ctx = useMemo(() => ({
    state, updateState, resetAll, route, setRoute,
    accent: t.accent,
  }), [state, updateState, resetAll, route, t.accent]);

  let page;
  switch(route){
    case 'dashboard':    page = <Dashboard setRoute={setRoute}/>; break;
    case 'log':          page = <LogWeightPage/>; break;
    case 'backfill':     page = <BackfillPage setRoute={setRoute}/>; break;
    case 'trends':       page = <TrendsPage/>; break;
    case 'weekly':       page = <WeeklyReportsPage/>; break;
    case 'goals':        page = <GoalsPage/>; break;
    case 'measurements': page = <MeasurementsPage/>; break;
    case 'photos':       page = <PhotosPage/>; break;
    case 'insights':     page = <InsightsPage/>; break;
    case 'settings':     page = <SettingsPage/>; break;
    default:             page = <Dashboard setRoute={setRoute}/>;
  }

  return (
    <AppContext.Provider value={ctx}>
      <div className="min-h-screen flex bg-bg text-fg">
        {/* Desktop sidebar */}
        <div className="hidden lg:block sticky top-0 h-screen">
          <Sidebar route={route} setRoute={setRoute}/>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="absolute inset-0 bg-black/60" onClick={()=>setMenuOpen(false)}/>
            <div className="relative bg-surface h-full">
              <Sidebar route={route} setRoute={setRoute} onClose={()=>setMenuOpen(false)}/>
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0 flex flex-col">
          <Topbar route={route} onMenu={()=>setMenuOpen(true)} setRoute={setRoute}/>

          <div className="flex-1 min-w-0 flex">
            <main className="flex-1 min-w-0 p-5 md:p-8 max-w-[1280px] w-full">
              {page}
            </main>
            {route === 'dashboard' && t.showRightPanel && (
              <div className="sticky top-0 h-screen overflow-auto border-l hairline">
                <RightPanel setRoute={setRoute}/>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tweaks panel — toggle from the toolbar */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Profile"/>
        <TweakText label="Name" value={t.name} onChange={v => setTweak('name', v)} placeholder="Your name"/>

        <TweakSection label="Accent color"/>
        <TweakColor
          label="Palette"
          value={t.accent}
          options={PALETTE_OPTIONS.map(p => p.hex)}
          onChange={v => setTweak('accent', v)}
        />

        <TweakSection label="Preferences"/>
        <TweakRadio
          label="Units"
          value={t.unit}
          options={['lbs','kg']}
          onChange={v => setTweak('unit', v)}
        />
        <TweakRadio
          label="Week starts"
          value={String(t.weekStartDay)}
          options={[{label:'Mon', value:'1'}, {label:'Sun', value:'0'}]}
          onChange={v => setTweak('weekStartDay', +v)}
        />
        <TweakToggle
          label="Right insight panel"
          value={!!t.showRightPanel}
          onChange={v => setTweak('showRightPanel', v)}
        />

        <TweakSection label="Data"/>
        <TweakButton label="Clear all data" secondary onClick={() => {
          if (confirm('Clear all data and reset to a fresh dashboard?')) resetAll();
        }}/>
      </TweaksPanel>
    </AppContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
