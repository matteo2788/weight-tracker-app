// settings-override.jsx — cleaner cloud-aware Settings page
// Loaded after pages-misc.jsx so it replaces the original SettingsPage.

(function installWeightLensAppearance(){
  if (window.__weightLensAppearanceInstalled) return;
  window.__weightLensAppearanceInstalled = true;

  const css = `
    html[data-theme="dark"],
    html[data-theme="dark"] body {
      background: #0F0F10 !important;
      color: #F3EEE7 !important;
      color-scheme: dark;
    }

    html[data-theme="dark"] .bg-bg { background-color: #0F0F10 !important; }
    html[data-theme="dark"] .bg-surface { background-color: #151516 !important; }
    html[data-theme="dark"] .bg-surface2 { background-color: #1A1A1C !important; }
    html[data-theme="dark"] .bg-surface3 { background-color: #242427 !important; }
    html[data-theme="dark"] [class~="bg-surface/95"] { background-color: rgba(26,26,28,0.95) !important; }
    html[data-theme="dark"] [class~="bg-surface3/40"] { background-color: rgba(36,36,39,0.40) !important; }
    html[data-theme="dark"] [class~="bg-surface3/60"] { background-color: rgba(36,36,39,0.60) !important; }

    html[data-theme="dark"] .text-fg { color: #F3EEE7 !important; }
    html[data-theme="dark"] .text-bg { color: #0F0F10 !important; }
    html[data-theme="dark"] .text-mute { color: #AFA79C !important; }
    html[data-theme="dark"] .text-mute2 { color: #8A7D70 !important; }
    html[data-theme="dark"] [class~="text-fg/80"] { color: rgba(243,238,231,0.80) !important; }
    html[data-theme="dark"] [class~="text-fg/90"] { color: rgba(243,238,231,0.90) !important; }

    html[data-theme="dark"] .border-line,
    html[data-theme="dark"] .border-line2,
    html[data-theme="dark"] .hairline {
      border-color: rgba(243,238,231,0.09) !important;
    }

    html[data-theme="dark"] .shadow-card,
    html[data-theme="dark"] .card-ring {
      box-shadow: 0 0 0 1px rgba(243,238,231,0.07), 0 16px 40px -28px rgba(0,0,0,0.9) !important;
    }

    html[data-theme="dark"] .shadow-pop {
      box-shadow: 0 30px 90px -44px rgba(0,0,0,0.95), 0 0 0 1px rgba(243,238,231,0.08) !important;
    }

    html[data-theme="dark"] input,
    html[data-theme="dark"] select,
    html[data-theme="dark"] textarea {
      background-color: #242427 !important;
      color: #F3EEE7 !important;
      border-color: rgba(243,238,231,0.11) !important;
    }

    html[data-theme="dark"] input::placeholder,
    html[data-theme="dark"] textarea::placeholder {
      color: #8A7D70 !important;
    }

    html[data-theme="dark"] option {
      background-color: #1A1A1C !important;
      color: #F3EEE7 !important;
    }

    html[data-theme="dark"] .bg-fg { background-color: #F3EEE7 !important; }
    html[data-theme="dark"] .bg-black\/60 { background-color: rgba(0,0,0,0.72) !important; }

    html[data-theme="dark"] .recharts-cartesian-axis-tick text { fill: #AFA79C !important; }
    html[data-theme="dark"] .recharts-cartesian-grid line { stroke: rgba(243,238,231,0.08) !important; }

    html[data-theme="dark"] ::-webkit-scrollbar-thumb {
      background: #3A3632 !important;
      border-color: #0F0F10 !important;
    }

    html[data-theme="dark"] .fixed.inset-0.z-50 > .absolute.inset-0 {
      background: rgba(15,15,16,0.76) !important;
      backdrop-filter: blur(14px) saturate(1.08) !important;
      -webkit-backdrop-filter: blur(14px) saturate(1.08) !important;
    }

    html[data-theme="dark"] .fixed.inset-0.z-50 > .relative {
      background-color: #1A1A1C !important;
      border-color: rgba(243,238,231,0.10) !important;
      box-shadow: 0 30px 90px -44px rgba(0,0,0,0.95), 0 0 0 1px rgba(243,238,231,0.07) inset !important;
    }

    html[data-theme="dark"] .fixed.inset-0.z-50 > .relative > div:first-child {
      background: rgba(26,26,28,0.90) !important;
    }

    html[data-theme="dark"] .lg\\:hidden.flex.items-center.justify-between.gap-3.px-4.h-14.border-b.hairline.sticky.top-0,
    html[data-theme="dark"] div[class*="sticky top-0 bg-bg/95"] {
      background-color: rgba(15,15,16,0.96) !important;
      color: #F3EEE7 !important;
      border-color: rgba(243,238,231,0.10) !important;
      backdrop-filter: blur(18px) saturate(1.08) !important;
      -webkit-backdrop-filter: blur(18px) saturate(1.08) !important;
    }

    html[data-theme="dark"] .lg\\:hidden button,
    html[data-theme="dark"] .lg\\:hidden svg,
    html[data-theme="dark"] .lg\\:hidden .font-medium {
      color: #F3EEE7 !important;
      opacity: 1 !important;
    }

    html[data-theme="dark"] .lg\\:hidden button:hover {
      background-color: rgba(243,238,231,0.08) !important;
    }

    html[data-theme="dark"] .lg\\:hidden button.bg-accent\/15 {
      background-color: rgba(var(--accent-rgb),0.18) !important;
      color: #F3EEE7 !important;
      border: 1px solid rgba(var(--accent-rgb),0.28) !important;
    }

    html[data-theme="dark"] .lg\\:hidden button.bg-accent\/15 svg {
      color: #F3EEE7 !important;
    }
  `;

  const style = document.createElement('style');
  style.id = 'weightlens-appearance-styles';
  style.textContent = css;
  document.head.appendChild(style);

  function getStoredAppearance(){
    try {
      const key = window.STORAGE_KEY || 'weightlens.v2';
      const raw = localStorage.getItem(key);
      if (!raw) return 'light';
      const parsed = JSON.parse(raw);
      return parsed?.settings?.appearance || 'light';
    } catch(e) {
      return 'light';
    }
  }

  function resolveAppearance(value){
    if (value === 'dark') return 'dark';
    if (value === 'system') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }

  function applyAppearance(){
    const resolved = resolveAppearance(getStoredAppearance());
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.classList.toggle('dark', resolved === 'dark');
    document.documentElement.style.colorScheme = resolved;
  }

  window.WeightLensApplyAppearance = applyAppearance;
  setTimeout(applyAppearance, 0);
  window.addEventListener('storage', applyAppearance);
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) mq.addEventListener('change', applyAppearance);
    else if (mq.addListener) mq.addListener(applyAppearance);
  }
  setInterval(applyAppearance, 800);
})();

function SettingsPage(){
  const { state, updateState, resetAll, currentUser, cloudReady, signOut } = useApp();
  const s = state.settings;
  const setS = (patch) => {
    updateState({ settings: { ...s, ...patch }});
    setTimeout(() => window.WeightLensApplyAppearance && window.WeightLensApplyAppearance(), 0);
  };
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [profileDraft, setProfileDraft] = useState(state.profile?.name || currentUser?.user_metadata?.name || 'New User');
  const [profileStatus, setProfileStatus] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  const profileName = state.profile?.name || currentUser?.user_metadata?.name || 'New User';
  const email = currentUser?.email || 'No email found';
  const appearance = s.appearance || 'light';
  const resolvedDark = appearance === 'dark' || (appearance === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) || document.documentElement.getAttribute('data-theme') === 'dark';

  const ui = resolvedDark ? {
    ink: '#F3EEE7',
    bg: '#0F0F10',
    card: '#1A1A1C',
    field: '#242427',
    field2: '#202023',
    border: 'rgba(243,238,231,0.13)',
    borderStrong: 'rgba(243,238,231,0.24)',
    muted: '#B7AEA4',
    muted2: '#8A8178',
    activeBg: '#F3EEE7',
    activeText: '#0F0F10',
    inactiveBg: '#242427',
    inactiveText: '#F3EEE7',
    inactiveBody: '#B7AEA4'
  } : {
    ink: '#11141B',
    bg: '#F8F8F5',
    card: '#FFFFFF',
    field: '#F0F0ED',
    field2: '#F4F4F1',
    border: 'rgba(17,20,27,0.10)',
    borderStrong: 'rgba(17,20,27,0.22)',
    muted: '#66707A',
    muted2: '#8A919A',
    activeBg: '#11141B',
    activeText: '#F8F8F5',
    inactiveBg: '#F4F4F1',
    inactiveText: '#11141B',
    inactiveBody: '#66707A'
  };

  const cardStyle = {
    background: resolvedDark ? 'rgba(26,26,28,0.88)' : 'rgba(255,255,255,0.78)',
    borderColor: ui.border,
    color: ui.ink
  };

  const fieldStyle = {
    backgroundColor: ui.field,
    color: ui.ink,
    WebkitTextFillColor: ui.ink,
    border: `1px solid ${ui.border}`,
    borderRadius: 14,
    minHeight: 42,
    boxShadow: 'none'
  };

  const mutedStyle = { color: ui.muted };
  const muted2Style = { color: ui.muted2 };

  useEffect(() => {
    setProfileDraft(profileName);
  }, [profileName]);

  const saveProfile = async () => {
    const cleanName = profileDraft.trim();

    if (!cleanName) {
      setProfileStatus('Enter a name first.');
      return;
    }

    setProfileSaving(true);
    setProfileStatus('');

    updateState({
      profile: {
        ...(state.profile || {}),
        name: cleanName
      }
    });

    try {
      const supabaseClient = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
      if (supabaseClient) {
        await supabaseClient.auth.updateUser({
          data: { name: cleanName }
        });
      }
      setProfileStatus('Profile saved.');
    } catch(e) {
      setProfileStatus('Name saved in WeightLens. Auth profile update failed.');
    }

    setProfileSaving(false);
  };

  const onExport = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weightlens-backup-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImport = () => {
    try {
      const data = JSON.parse(importText);
      updateState(data);
      setImportOpen(false);
      setImportText('');
      alert('Data restored.');
    } catch(e) {
      alert('Invalid JSON.');
    }
  };

  const onCsvExport = () => {
    const header = 'date,weight,unit,notes,tags\n';
    const rows = entriesSortedAsc(state.entries).map(e =>
      `${e.date},${e.weight},${e.unit},"${(e.notes||'').replace(/"/g,'""')}","${(e.tags||[]).join(';')}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type:'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weightlens-entries-${todayISO()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const appearanceOptions = [
    { value: 'light', label: 'Light', body: 'Clean bright mode' },
    { value: 'dark', label: 'Dark', body: 'Calm low-light mode' },
    { value: 'system', label: 'System', body: 'Match your device' },
  ];

  return (
    <div className="space-y-6 fadein max-w-3xl pb-8" style={{ color: ui.ink }}>
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] mb-1.5" style={mutedStyle}>Preferences</div>
        <h1 className="text-[28px] md:text-[32px] font-semibold tracking-tight" style={{ color: ui.ink }}>Settings</h1>
        <div className="mt-1.5 text-[14px] max-w-xl" style={mutedStyle}>Manage your account, syncing, preferences, and backups.</div>
      </div>

      <Card style={cardStyle}>
        <SectionLabel right={<Pill tone={cloudReady ? 'good' : 'neutral'}>{cloudReady ? 'Synced' : 'Checking'}</Pill>}>Account</SectionLabel>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-11 w-11 shrink-0 rounded-2xl flex items-center justify-center font-semibold" style={{ background: ui.activeBg, color: ui.activeText }}>
              {(profileName[0] || 'N').toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-medium truncate" style={{ color: ui.ink }}>{profileName}</div>
              <div className="text-[12.5px] truncate" style={mutedStyle}>{email}</div>
              <div className="text-[12px] mt-0.5" style={muted2Style}>Your weight data syncs privately to this account.</div>
            </div>
          </div>
          <Button variant="secondary" onClick={signOut} className="sm:w-auto w-full">
            Sign out
          </Button>
        </div>
      </Card>

      <Card style={cardStyle}>
        <SectionLabel>Appearance</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {appearanceOptions.map(opt => {
            const active = appearance === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setS({ appearance: opt.value })}
                className="btn text-left rounded-2xl border p-4 transition-colors"
                style={{
                  background: active ? ui.activeBg : ui.inactiveBg,
                  color: active ? ui.activeText : ui.inactiveText,
                  borderColor: active ? ui.activeBg : ui.border,
                  boxShadow: 'none'
                }}
              >
                <div className="font-medium" style={{ color: active ? ui.activeText : ui.inactiveText }}>{opt.label}</div>
                <div className="text-[12.5px] mt-1" style={{ color: active ? (resolvedDark ? 'rgba(15,15,16,0.72)' : 'rgba(248,248,245,0.78)') : ui.inactiveBody }}>{opt.body}</div>
              </button>
            );
          })}
        </div>
        <div className="text-[12.5px] mt-3 leading-relaxed" style={mutedStyle}>
          Dark mode is easier on the eyes for early morning weigh-ins. System follows your phone or computer setting.
        </div>
      </Card>

      <Card style={cardStyle}>
        <SectionLabel>Profile</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(220px,560px)_auto] gap-3 items-end">
          <div>
            <label className="block text-[11.5px] mb-1.5" style={mutedStyle}>Display name</label>
            <Input
              className="w-full"
              style={fieldStyle}
              type="text"
              value={profileDraft}
              onChange={e => {
                setProfileDraft(e.target.value);
                setProfileStatus('');
              }}
              placeholder="Your name"
            />
          </div>
          <Button onClick={saveProfile} disabled={profileSaving || profileDraft.trim() === profileName} className="w-full sm:w-auto disabled:opacity-50">
            {profileSaving ? 'Saving...' : 'Save profile'}
          </Button>
        </div>
        <div className="text-[12.5px] mt-3 leading-relaxed" style={mutedStyle}>
          This name appears in your sidebar and saves with your account.
        </div>
        {profileStatus && <div className="text-[12.5px] mt-2" style={mutedStyle}>{profileStatus}</div>}
      </Card>

      <Card style={cardStyle}>
        <SectionLabel>Units & week</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11.5px] mb-1.5" style={mutedStyle}>Weight unit</label>
            <Select className="w-full" style={fieldStyle} value={s.unit} onChange={e=>setS({ unit: e.target.value })}>
              <option value="lbs">Pounds (lbs)</option>
              <option value="kg">Kilograms (kg)</option>
            </Select>
          </div>
          <div>
            <label className="block text-[11.5px] mb-1.5" style={mutedStyle}>Week starts on</label>
            <Select className="w-full" style={fieldStyle} value={s.weekStartDay} onChange={e=>setS({ weekStartDay: +e.target.value })}>
              <option value={1}>Monday</option>
              <option value={0}>Sunday</option>
            </Select>
          </div>
          <div>
            <label className="block text-[11.5px] mb-1.5" style={mutedStyle}>Default goal mode</label>
            <Select className="w-full" style={fieldStyle} value={s.defaultGoal} onChange={e=>setS({ defaultGoal: e.target.value })}>
              <option value="fatloss">Fat loss</option>
              <option value="musclegain">Muscle gain</option>
              <option value="maintenance">Maintenance</option>
              <option value="recomp">Recomposition</option>
              <option value="general">General tracking</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card style={cardStyle}>
        <SectionLabel>Reminders</SectionLabel>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[14px]" style={{ color: ui.ink }}>Daily weigh-in reminder</div>
            <div className="text-[12.5px]" style={mutedStyle}>Preview setting only for now. Real notifications can be added later.</div>
          </div>
          <Input className="w-full sm:w-auto" style={fieldStyle} type="time" value={s.reminderTime || ''} onChange={e=>setS({ reminderTime: e.target.value })}/>
        </div>
      </Card>

      <Card style={cardStyle}>
        <SectionLabel>Data</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button variant="secondary" onClick={onExport}><I.Download className="h-4 w-4"/> Backup as JSON</Button>
          <Button variant="secondary" onClick={()=>setImportOpen(true)}><I.Import className="h-4 w-4"/> Restore from JSON</Button>
          <Button variant="secondary" onClick={onCsvExport}><I.Download className="h-4 w-4"/> Export entries as CSV</Button>
          <Button variant="danger" onClick={()=>{ if (confirm('Delete all data for this account? This cannot be undone.')) resetAll(); }}>
            <I.Trash className="h-4 w-4"/> Clear all data
          </Button>
        </div>
      </Card>

      <Card style={cardStyle}>
        <SectionLabel>About</SectionLabel>
        <p className="text-[13.5px] leading-relaxed" style={mutedStyle}>
          WeightLens is a calm trend dashboard for body weight. Your weight entries, goals, settings, and notes save to your account and sync across devices. You can also export a local backup anytime. Progress photos are still stored in your browser unless photo cloud sync is added later.
        </p>
      </Card>

      <Modal open={importOpen} onClose={()=>setImportOpen(false)} title="Restore from JSON" maxWidth="max-w-xl">
        <Textarea rows={10} style={fieldStyle} className="w-full font-mono text-[12px]" placeholder='Paste WeightLens JSON backup here…' value={importText} onChange={e=>setImportText(e.target.value)}/>
        <div className="flex justify-end gap-2 mt-3">
          <Button variant="secondary" onClick={()=>setImportOpen(false)}>Cancel</Button>
          <Button onClick={onImport}>Restore</Button>
        </div>
      </Modal>
    </div>
  );
}

Object.assign(window, { SettingsPage });
