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
function getRecoveryCodeFromUrl(){
  if (typeof window === 'undefined') return null;

  const searchParams = new URLSearchParams(window.location.search);
  const codeFromSearch = searchParams.get('code');
  if (codeFromSearch) return codeFromSearch;

  const hash = window.location.hash || '';
  const questionIndex = hash.indexOf('?');

  if (questionIndex >= 0) {
    const hashParams = new URLSearchParams(hash.slice(questionIndex + 1));
    const codeFromHash = hashParams.get('code');
    if (codeFromHash) return codeFromHash;
  }

  return null;
}

function isPasswordRecoveryUrl(){
  if (typeof window === 'undefined') return false;
  const href = window.location.href || '';

  return (
    href.includes('type=recovery') ||
    href.includes('reset-password') ||
    href.includes('PASSWORD_RECOVERY') ||
    !!getRecoveryCodeFromUrl()
  );
}

function getPasswordResetRedirectUrl(){
  if (typeof window === 'undefined') return undefined;
  return `${window.location.origin}${window.location.pathname}`;
}

function clearPasswordRecoveryUrl(){
  if (typeof window === 'undefined') return;
  window.history.replaceState({}, document.title, window.location.pathname);
}
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
  const [name, setName] = useState('');
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

    if (!email.trim()) {
      setStatus('Enter your email.');
      return;
    }

    if (mode === 'reset') {
      setLoading(true);
      setStatus('');

      const result = await supabaseClient.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: getPasswordResetRedirectUrl()
      });

      setLoading(false);

      if (result.error) {
        setStatus(result.error.message || 'Could not send reset email.');
        return;
      }

      setStatus('Password reset email sent. Check your inbox, then open the reset link.');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setStatus('Enter your name.');
      return;
    }

    if (!password.trim()) {
      setStatus('Enter your password.');
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
        password: password,
        options: {
          data: {
            name: name.trim()
          }
        }
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
            {mode === 'signup'
              ? 'Create your account'
              : mode === 'reset'
                ? 'Reset your password'
                : 'Sign in to save across devices'}
          </h1>

          <p className="text-mute mt-3 leading-relaxed">
            {mode === 'signup'
              ? 'Create an account and start with your own private dashboard.'
              : mode === 'reset'
                ? 'Enter your email and we will send you a secure password reset link.'
                : 'Sign in with your email and password. Your data will sync across devices.'}
          </p>
        </div>

        {mode !== 'reset' && (
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
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {mode === 'signup' && (
            <input
              className="w-full rounded-2xl border hairline bg-surface3 px-4 py-3 text-base focus-ring"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          )}

          <input
            className="w-full rounded-2xl border hairline bg-surface3 px-4 py-3 text-base focus-ring"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          {mode !== 'reset' && (
            <input
              className="w-full rounded-2xl border hairline bg-surface3 px-4 py-3 text-base focus-ring"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          )}

          <button
            className="btn w-full rounded-2xl bg-fg text-bg px-4 py-3 font-medium disabled:opacity-50"
            disabled={loading}
          >
            {loading
              ? (mode === 'signup' ? 'Creating account...' : mode === 'reset' ? 'Sending reset link...' : 'Signing in...')
              : (mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Sign in')}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          {mode === 'signin' && (
            <button
              type="button"
              className="btn text-mute hover:text-fg"
              onClick={() => {
                setMode('reset');
                setPassword('');
                setStatus('');
              }}
            >
              Forgot password?
            </button>
          )}

          {mode === 'reset' && (
            <button
              type="button"
              className="btn text-mute hover:text-fg"
              onClick={() => {
                setMode('signin');
                setStatus('');
              }}
            >
              Back to sign in
            </button>
          )}
        </div>

        {status && (
          <div className="mt-4 text-sm text-mute leading-relaxed">
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
function ResetPasswordScreen({ onDone }){
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const supabaseClient = getSupabaseClient();

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!supabaseClient) {
      setStatus('Supabase is not connected.');
      return;
    }

    if (password.length < 6) {
      setStatus('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setStatus('Passwords do not match.');
      return;
    }

    setLoading(true);
    setStatus('');

    const { error } = await supabaseClient.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setStatus(error.message || 'Could not update password.');
      return;
    }

    setStatus('Password updated. You can continue to your dashboard.');
  };

  return (
    <div className="min-h-screen bg-bg text-fg flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-surface rounded-3xl card-ring p-6 md:p-8">
        <div className="mb-6">
          <div className="text-sm text-mute mb-2">Secure recovery</div>
          <h1 className="text-3xl font-semibold tracking-tight">Set a new password</h1>
          <p className="text-mute mt-3 leading-relaxed">
            Choose a new password for your WeightLens account.
          </p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            className="w-full rounded-2xl border hairline bg-surface3 px-4 py-3 text-base focus-ring"
            type="password"
            placeholder="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <input
            className="w-full rounded-2xl border hairline bg-surface3 px-4 py-3 text-base focus-ring"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />

          <button
            className="btn w-full rounded-2xl bg-fg text-bg px-4 py-3 font-medium disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Updating password...' : 'Update password'}
          </button>
        </form>

        {status && (
          <div className="mt-4 text-sm text-mute leading-relaxed">
            {status}
          </div>
        )}

        {status.startsWith('Password updated') && (
          <button
            type="button"
            className="btn mt-4 w-full rounded-2xl bg-surface3 text-fg border border-line2 px-4 py-3 font-medium"
            onClick={onDone}
          >
            Continue to dashboard
          </button>
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
  const [passwordResetMode, setPasswordResetMode] = useState(() => isPasswordRecoveryUrl());
  const [cloudReady, setCloudReady] = useState(false);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [cloudMessage, setCloudMessage] = useState('');
  const [cloudToast, setCloudToast] = useState('');

  // Check Supabase login
 useEffect(() => {
  const supabaseClient = getSupabaseClient();

  if (!supabaseClient) {
    setAuthChecked(true);
    setCloudReady(false);
    return;
  }

  let cancelled = false;

  const { data } = supabaseClient.auth.onAuthStateChange((event, session) => {
    const user = session ? session.user : null;
    setCurrentUser(user);

    if (event === 'PASSWORD_RECOVERY') {
      setPasswordResetMode(true);
    }

    if (!user) {
      setCloudReady(false);

      if (event === 'SIGNED_OUT') {
        setPasswordResetMode(false);
      }
    }
  });

  async function checkSession(){
    const recoveryCode = getRecoveryCodeFromUrl();

    if (recoveryCode) {
      const { data: recoveryData, error } = await supabaseClient.auth.exchangeCodeForSession(recoveryCode);

      if (!cancelled) {
        if (error) {
          console.error(error);
          setPasswordResetMode(false);
        } else {
          setCurrentUser(recoveryData?.session?.user || null);
          setPasswordResetMode(true);
        }

        setAuthChecked(true);
      }

      return;
    }

    const { data: sessionData } = await supabaseClient.auth.getSession();

    if (!cancelled) {
      const user = sessionData && sessionData.session ? sessionData.session.user : null;
      setCurrentUser(user);

      if (user && isPasswordRecoveryUrl()) {
        setPasswordResetMode(true);
      }

      setAuthChecked(true);
    }
  }

  checkSession();

  return () => {
    cancelled = true;
    if (data && data.subscription) data.subscription.unsubscribe();
  };
}, []);

  // Show cloud save messages as temporary toasts only
  useEffect(() => {
    if (!cloudMessage || cloudLoading) return;
    if (cloudMessage.toLowerCase().includes('loading')) return;

    setCloudToast(cloudMessage);
    const timer = setTimeout(() => setCloudToast(''), 2200);
    return () => clearTimeout(timer);
  }, [cloudMessage, cloudLoading]);

  // Load cloud state after login
  useEffect(() => {
    const supabaseClient = getSupabaseClient();

   if (!authChecked || !currentUser || !supabaseClient || passwordResetMode) return;

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
        const loadedState = cleanLoadedState(data.state);
        setState(loadedState);
        if (loadedState.profile?.name) setTweak('name', loadedState.profile.name);
        setCloudMessage('Cloud save loaded.');
      } else {
        const userName = currentUser.user_metadata?.name || 'New User';
        const freshCloudState = cleanLoadedState({
          ...freshState(),
          profile: { name: userName }
        });

        await supabaseClient
          .from('app_state')
          .upsert({
            user_id: currentUser.id,
            state: freshCloudState,
            updated_at: new Date().toISOString()
          });

        setState(freshCloudState);
        setTweak('name', userName);
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
  }, [authChecked, currentUser && currentUser.id, passwordResetMode]);

  // Always keep local backup
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Save app state to Supabase after changes
  useEffect(() => {
    const supabaseClient = getSupabaseClient();

    if (!supabaseClient || !currentUser || !cloudReady || passwordResetMode) return;

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
  }, [state, currentUser && currentUser.id, cloudReady, passwordResetMode]);

  useEffect(() => {
  if (passwordResetMode) return;
  if (typeof location !== 'undefined') location.hash = route;
}, [route, passwordResetMode]);

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
    setTweak({ name: 'New User', accent: '#65A30D', unit: 'lbs', weekStartDay: 1 });
  }, [setTweak]);

  const signOut = useCallback(async () => {
    const supabaseClient = getSupabaseClient();
    if (supabaseClient) await supabaseClient.auth.signOut();
    setCurrentUser(null);
setPasswordResetMode(false);
setCloudReady(false);
setCloudToast('');
  }, []);
  
const finishPasswordReset = useCallback(() => {
  clearPasswordRecoveryUrl();
  setPasswordResetMode(false);
  setCloudReady(false);
}, []);
  
  const ctx = useMemo(() => ({
    state, updateState, resetAll, route, setRoute,
    accent: t.accent,
    currentUser, cloudReady, signOut,
  }), [state, updateState, resetAll, route, t.accent, currentUser, cloudReady, signOut]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-bg text-fg flex items-center justify-center">
        <div className="text-mute">Loading...</div>
      </div>
    );
  }

  if (passwordResetMode && currentUser) {
  return <ResetPasswordScreen onDone={finishPasswordReset} />;
}

if (passwordResetMode && !currentUser) {
  return (
    <div className="min-h-screen bg-bg text-fg flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-surface rounded-3xl card-ring p-6 md:p-8 text-center">
        <div className="font-medium">Checking reset link...</div>
        <div className="text-sm text-mute mt-2">If this does not continue, request a fresh reset link.</div>
      </div>
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
const needsOnboarding =
  currentUser &&
  cloudReady &&
  !passwordResetMode &&
  !state.meta?.onboardingComplete &&
  (state.entries?.length || 0) === 0 &&
  !state.goal?.startingWeight &&
  !state.goal?.goalWeight;

if (needsOnboarding && typeof OnboardingPage === 'function') {
  return (
    <AppContext.Provider value={ctx}>
      <OnboardingPage />
    </AppContext.Provider>
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

      {cloudToast && (
        <div className="fixed bottom-4 right-4 z-40 pointer-events-none fadein">
          <div className="rounded-2xl bg-surface/95 backdrop-blur card-ring px-4 py-2 text-xs text-mute max-w-xs shadow-pop">
            {cloudToast}
          </div>
        </div>
      )}

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
