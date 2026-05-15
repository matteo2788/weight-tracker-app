// settings-override.jsx — cleaner cloud-aware Settings page
// Loaded after pages-misc.jsx so it replaces the original SettingsPage.

function SettingsPage(){
  const { state, updateState, resetAll, currentUser, cloudReady, signOut } = useApp();
  const s = state.settings;
  const setS = (patch) => updateState({ settings: { ...s, ...patch }});
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');

  const profileName = state.profile?.name || currentUser?.user_metadata?.name || 'New User';
  const email = currentUser?.email || 'No email found';

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

  return (
    <div className="space-y-6 fadein max-w-3xl pb-8">
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-mute mb-1.5">Preferences</div>
        <h1 className="text-[28px] md:text-[32px] font-semibold tracking-tight">Settings</h1>
        <div className="text-mute mt-1.5 text-[14px] max-w-xl">Manage your account, syncing, preferences, and backups.</div>
      </div>

      <Card>
        <SectionLabel right={<Pill tone={cloudReady ? 'good' : 'neutral'}>{cloudReady ? 'Synced' : 'Checking'}</Pill>}>Account</SectionLabel>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-11 w-11 shrink-0 rounded-2xl bg-fg text-bg flex items-center justify-center font-semibold">
              {(profileName[0] || 'N').toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-medium truncate">{profileName}</div>
              <div className="text-[12.5px] text-mute truncate">{email}</div>
              <div className="text-[12px] text-mute2 mt-0.5">Your weight data syncs privately to this account.</div>
            </div>
          </div>
          <Button variant="secondary" onClick={signOut} className="sm:w-auto w-full">
            Sign out
          </Button>
        </div>
      </Card>

      <Card>
        <SectionLabel>Units & week</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11.5px] text-mute mb-1.5">Weight unit</label>
            <Select className="w-full" value={s.unit} onChange={e=>setS({ unit: e.target.value })}>
              <option value="lbs">Pounds (lbs)</option>
              <option value="kg">Kilograms (kg)</option>
            </Select>
          </div>
          <div>
            <label className="block text-[11.5px] text-mute mb-1.5">Week starts on</label>
            <Select className="w-full" value={s.weekStartDay} onChange={e=>setS({ weekStartDay: +e.target.value })}>
              <option value={1}>Monday</option>
              <option value={0}>Sunday</option>
            </Select>
          </div>
          <div>
            <label className="block text-[11.5px] text-mute mb-1.5">Default goal mode</label>
            <Select className="w-full" value={s.defaultGoal} onChange={e=>setS({ defaultGoal: e.target.value })}>
              <option value="fatloss">Fat loss</option>
              <option value="musclegain">Muscle gain</option>
              <option value="maintenance">Maintenance</option>
              <option value="recomp">Recomposition</option>
              <option value="general">General tracking</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card>
        <SectionLabel>Reminders</SectionLabel>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[14px]">Daily weigh-in reminder</div>
            <div className="text-[12.5px] text-mute">Preview setting only for now. Real notifications can be added later.</div>
          </div>
          <Input className="w-full sm:w-auto" type="time" value={s.reminderTime || ''} onChange={e=>setS({ reminderTime: e.target.value })}/>
        </div>
      </Card>

      <Card>
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

      <Card>
        <SectionLabel>About</SectionLabel>
        <p className="text-[13.5px] text-mute leading-relaxed">
          WeightLens is a calm trend dashboard for body weight. Your weight entries, goals, settings, and notes save to your account and sync across devices. You can also export a local backup anytime. Progress photos are still stored in your browser unless photo cloud sync is added later.
        </p>
      </Card>

      <Modal open={importOpen} onClose={()=>setImportOpen(false)} title="Restore from JSON" maxWidth="max-w-xl">
        <Textarea rows={10} className="w-full font-mono text-[12px]" placeholder='Paste WeightLens JSON backup here…' value={importText} onChange={e=>setImportText(e.target.value)}/>
        <div className="flex justify-end gap-2 mt-3">
          <Button variant="secondary" onClick={()=>setImportOpen(false)}>Cancel</Button>
          <Button onClick={onImport}>Restore</Button>
        </div>
      </Modal>
    </div>
  );
}

Object.assign(window, { SettingsPage });
