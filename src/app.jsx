// app.jsx — top-level app, router, state provider, tweaks panel, mount

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "name": "New User",
  "accent": "#65A30D",
  "unit": "lbs",
  "weekStartDay": 1,
  "showRightPanel": true
}/*EDITMODE-END*/;

const PALETTE_OPTIONS = [
  { hex:'#65A30D', label:'Lime'    },
  { hex:'#10B981', label:'Emerald' },
  { hex:'#6366F1', label:'Indigo'  },
  { hex:'#8B5CF6', label:'Violet'  },
  { hex:'#F97316', label:'Orange'  },
  { hex:'#EC4899', label:'Pink'    },
  { hex:'#0EA5E9', label:'Sky'     },
  { hex:'#0A0A0A', label:'Mono'    },
];

function hexToRgbTriplet(hex){
  const h = hex.replace('#','');
  const v = h.length === 3
    ? [h[0]+h[0], h[1]+h[1], h[2]+h[2]]
    : [h.slice(0,2), h.slice(2,4), h.slice(4,6)];
  return v.map(x => parseInt(x,16)).join(' ');
}

function getSupabaseClient(){
  if (window.__weightLensSupabase) return window.__weightLensSupabase;

  if (!window.supabase || !window.SUPABASE_URL || !window.SUPABASE_KEY) {
    return null;
  }

  window.__weightLensSupabase = window.supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_KEY
  );

  return window.__weightLensSupabase;
}

function cleanLoadedState(loaded){
  const base = freshState();
  const s = loaded || {};

  return {
    ...base,
    ...s,
    settings: { ...DEFAULT_SETTINGS, ...(s.settings || {}) },
    goal: { ...DEFAULT_GOAL, ...(s.goal || {}) },
    profile: { name: 'New User', ...(s.profile || {}) },
  };
}

function LoginScreen(){
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const supabaseClient = getSupabaseClient();

  const handleAuth = async (e) => {
    e.preventDefault();

    if (!supabaseClient) {
      setStatus('Supabase is not connected yet. Check your URL and publishable key in index.html.');
      return;
    }

    if (!email.trim() || !password.trim()) {
      setStatus('Enter your email and password.');
      return;
    }

    if (password.length < 6) {
      setStatus('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setStatus('');

    let result;

    if (mode === 'signup') {
      result = await supabaseClient.auth.signUp({
        email: email.trim(),
        password: password
      });
    } else {
      result = await supabaseClient.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });
    }

    setLoading(false);

    if (result.error) {
      setStatus(result.error.message || 'Something went wrong.');
      return;
    }

    if (mode === 'signup') {
      setStatus('Account created. Loading your fresh dashboard...');
    } else {
      setStatus('Signed in.');
    }
  };

  return (
    <div className="min-h-screen bg-bg text-fg flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-surface rounded-3xl card-ring p-6 md:p-8">
        <div className="mb-6">
          <div className="text-sm text-mute mb-2">WeightLens cloud sync</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {mode === 'signup' ? 'Create your account' : 'Sign in to save across devices'}
          </h1>
          <p className="text-mute mt-3 leading-relaxed">
            {mode === 'signup'
              ? 'Create an account and start with your own private dashboard.'
              : 'Sign in with your email and password. Your data will sync across devices.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-5 rounded-2xl bg-surface3 p-1">
          <button
            type="button"
            className={`btn rounded-xl px-3 py-2 text-sm font-medium ${mode === 'signin' ? 'bg-surface card-ring' : 'text-mute'}`}
            onClick={() => {
              setMode('signin');
              setStatus('');
            }}
          >
            Sign in
          </button>

          <button
            type="button"
            className={`btn rounded-xl px-3 py-2 text-sm font-medium ${mode === 'signup' ? 'bg-surface card-ring' : 'text-mute'}`}
            onClick={() => {
              setMode('signup');
              setStatus('');
            }}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <input
            className="w-full rounded-2xl border hairline bg-surface3 px-4 py-3 text-base focus-ring"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <input
            className="w-full rounded-2xl border hairline bg-surface3 px-4 py-3 text-base focus-ring"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <button
            className="btn w-full rounded-2xl bg-fg text-bg px-4 py-3 font-medium disabled:opacity-50"
            disabled={loading}
          >
            {loading
              ? (mode === 'signup' ? 'Creating account...' : 'Signing in...')
              : (mode === 'signup' ? 'Create account' : 'Sign in')}
          </button>
        </form>

        {status && (
          <div className="mt-4 text-sm text-mute leading-relaxed">
            {status}
          </div>
        )}
      </div>
    </div>
  );
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

  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [cloudReady, setCloudReady] = useState(false);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [cloudMessage, setCloudMessage] = useState('');

  // Check Supabase login
  useEffect(() => {
    const supabaseClient = getSupabaseClient();

    if (!supabaseClient) {
      setAuthChecked(true);
      setCloudReady(false);
      return;
    }

    supabaseClient.auth.getSession().then(({ data }) => {
      const user = data && data.session ? data.session.user : null;
      setCurrentUser(user);
      setAuthChecked(true);
    });

    const { data } = supabaseClient.auth.onAuthStateChange((event, session) => {
      const user = session ? session.user : null;
      setCurrentUser(user);
      if (!user) {
        setCloudReady(false);
      }
    });

    return () => {
      if (data && data.subscription) data.subscription.unsubscribe();
    };
  }, []);

  // Load cloud state after login
  useEffect(() => {
    const supabaseClient = getSupabaseClient();

    if (!authChecked || !currentUser || !supabaseClient) return;

    let cancelled = false;

    async function loadCloudState(){
      setCloudLoading(true);
      setCloudReady(false);
      setCloudMessage('Loading cloud save...');

      const { data, error } = await supabaseClient
        .from('app_state')
        .select('state')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error(error);
        setCloudMessage('Cloud load failed. Your local browser save is still safe.');
        setCloudLoading(false);
        return;
      }

      if (data && data.state) {
        setState(cleanLoadedState(data.state));
        setCloudMessage('Cloud save loaded.');
      } else {
  const freshCloudState = cleanLoadedState(freshState());

  await supabaseClient
    .from('app_state')
    .upsert({
      user_id: currentUser.id,
      state: freshCloudState,
      updated_at: new Date().toISOString()
    });

  setState(freshCloudState);
  saveState(freshCloudState);
  setCloudMessage('Fresh cloud save created.');
}

      setCloudReady(true);
      setCloudLoading(false);
    }

    loadCloudState();

    return () => {
      cancelled = true;
    };
  }, [authChecked, currentUser && currentUser.id]);

  // Always keep local backup
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Save app state to Supabase after changes
  useEffect(() => {
    const supabaseClient = getSupabaseClient();

    if (!supabaseClient || !currentUser || !cloudReady) return;

    const timer = setTimeout(() => {
      async function saveCloudState(){
        const { error } = await supabaseClient
          .from('app_state')
          .upsert({
            user_id: currentUser.id,
            state,
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error(error);
          setCloudMessage('Cloud save failed. Local backup saved.');
        } else {
          setCloudMessage('Saved to cloud.');
        }
      }

      saveCloudState();
    }, 700);

    return () => clearTimeout(timer);
  }, [state, currentUser && currentUser.id, cloudReady]);

  useEffect(() => {
    if (typeof location !== 'undefined') location.hash = route;
  }, [route]);

  // Live-apply accent color → CSS var
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

  const signOut = useCallback(async () => {
    const supabaseClient = getSupabaseClient();
    if (supabaseClient) await supabaseClient.auth.signOut();
    setCurrentUser(null);
    setCloudReady(false);
  }, []);

  const ctx = useMemo(() => ({
    state, updateState, resetAll, route, setRoute,
    accent: t.accent,
  }), [state, updateState, resetAll, route, t.accent]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-bg text-fg flex items-center justify-center">
        <div className="text-mute">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  if (cloudLoading) {
    return (
      <div className="min-h-screen bg-bg text-fg flex items-center justify-center">
        <div className="bg-surface rounded-3xl card-ring p-6 text-center">
          <div className="font-medium">Loading your cloud save...</div>
          <div className="text-sm text-mute mt-2">{cloudMessage}</div>
        </div>
      </div>
    );
  }

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

      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
        {cloudMessage && (
          <div className="rounded-2xl bg-surface card-ring px-4 py-2 text-xs text-mute max-w-xs">
            {cloudMessage}
          </div>
        )}
        <button
          className="btn rounded-2xl bg-fg text-bg px-4 py-2 text-sm font-medium"
          onClick={signOut}
        >
          Sign out
        </button>
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
