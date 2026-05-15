// components.jsx — shared UI atoms, icons, sidebar, right panel, app shell
// All exports attached to window for sharing across Babel script files.

const { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } = React;

// ---------- App context ----------
const AppContext = createContext(null);
const useApp = () => useContext(AppContext);

// ---------- Icons (single stroke, minimal) ----------
const I = {
  Dashboard: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 12 12 4l9 8"/><path d="M5 10v10h14V10"/></svg>),
  Scale:    (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 7h16l-2 13H6L4 7Z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/><path d="m10 13 2-3 2 3"/></svg>),
  Import:   (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>),
  Trends:   (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 17 9 11l4 4 8-8"/><path d="M15 7h6v6"/></svg>),
  Weekly:   (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 3v4M16 3v4"/></svg>),
  Goal:     (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>),
  Ruler:    (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 8h18v8H3z"/><path d="M7 8v3M11 8v4M15 8v3M19 8v4"/></svg>),
  Photo:    (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="m21 17-5-5-9 9"/></svg>),
  Book:     (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 4h10a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4Z"/><path d="M4 4v12"/></svg>),
  Settings: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.5-2.4.9a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.4a7 7 0 0 0-2 1.2l-2.4-.9-2 3.5 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.5 2.4-.9a7 7 0 0 0 2 1.2L10 21h4l.5-2.4a7 7 0 0 0 2-1.2l2.4.9 2-3.5-2-1.6c.1-.4.1-.8.1-1.2Z"/></svg>),
  Plus:     (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 5v14M5 12h14"/></svg>),
  ArrowUp:  (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 5v14M6 11l6-6 6 6"/></svg>),
  ArrowDn:  (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 19V5M18 13l-6 6-6-6"/></svg>),
  Right:    (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m9 6 6 6-6 6"/></svg>),
  Check:    (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m5 12 5 5 9-11"/></svg>),
  X:        (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m6 6 12 12M18 6 6 18"/></svg>),
  Edit:     (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 20h4l10-10-4-4L4 16Z"/><path d="m14 6 4 4"/></svg>),
  Trash:    (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 7h16M10 7V4h4v3M6 7l1 13h10l1-13"/></svg>),
  Search:   (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>),
  Info:     (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 8v.5"/></svg>),
  Bell:     (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2H4.5Z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>),
  Sparkle:  (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3v6M12 15v6M3 12h6M15 12h6"/><path d="m6 6 3 3M15 15l3 3M6 18l3-3M15 9l3-3"/></svg>),
  Download: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 4v12M7 11l5 5 5-5M5 20h14"/></svg>),
  Menu:     (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 6h16M4 12h16M4 18h16"/></svg>),
};

// ---------- atoms ----------
function Card({ className='', children, padded=true, ...rest }){
  return (
    <div className={`bg-surface2 border border-line rounded-2xl shadow-card ${padded?'p-5':''} ${className}`} {...rest}>
      {children}
    </div>
  );
}
function SectionLabel({ children, className='', right=null }){
  return (
    <div className={`flex items-center justify-between mb-3 ${className}`}>
      <div className="text-[11px] uppercase tracking-[0.18em] text-mute font-medium">{children}</div>
      {right}
    </div>
  );
}
function Pill({ tone='neutral', className='', children }){
  const tones = {
    neutral: 'bg-surface3 text-fg/80 border-line2',
    accent:  'bg-accent/12 text-accent border-accent/25',
    good:    'bg-good/12 text-good border-good/25',
    warn:    'bg-warn/12 text-[#B45309] border-warn/30',
    danger:  'bg-danger/10 text-danger border-danger/25',
    blue:    'bg-accent2/10 text-accent2 border-accent2/25',
  };
  return <span className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full border ${tones[tone]||tones.neutral} ${className}`}>{children}</span>;
}
function Button({ variant='primary', size='md', className='', children, ...rest }){
  const variants = {
    primary:   'bg-fg text-bg hover:bg-[#1f1f1f]',
    secondary: 'bg-surface3 text-fg hover:bg-[#EAEAE6] border border-line2',
    ghost:     'bg-transparent text-fg hover:bg-surface3',
    quiet:     'bg-transparent text-mute hover:text-fg',
    danger:    'bg-danger/10 text-danger hover:bg-danger/20 border border-danger/25',
    accent:    'bg-accent text-white hover:bg-[#558A0E]',
  };
  const sizes = {
    sm: 'h-8 px-3 text-[13px]',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-5 text-base',
  };
  return (
    <button className={`btn inline-flex items-center justify-center gap-2 font-medium rounded-xl focus-ring ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
function IconButton({ className='', children, ...rest }){
  return (
    <button className={`btn inline-flex items-center justify-center h-9 w-9 rounded-xl text-mute hover:text-fg hover:bg-surface3 focus-ring ${className}`} {...rest}>
      {children}
    </button>
  );
}
function Input({ className='', ...rest }){
  return <input className={`min-w-0 bg-surface3 border border-line2 rounded-xl h-10 px-3 text-fg placeholder:text-mute2 focus-ring ${className}`} {...rest}/>;
}
function Select({ className='', children, ...rest }){
  return <select className={`min-w-0 bg-surface3 border border-line2 rounded-xl h-10 px-3 pr-8 text-fg focus-ring appearance-none cursor-pointer ${className}`} {...rest}>{children}</select>;
}
function Textarea({ className='', ...rest }){
  return <textarea className={`min-w-0 bg-surface3 border border-line2 rounded-xl px-3 py-2 text-fg placeholder:text-mute2 focus-ring ${className}`} {...rest}/>;
}
function Toggle({ checked, onChange, label }){
  return (
    <button onClick={()=>onChange(!checked)} className="inline-flex items-center gap-3 group">
      <span className={`relative h-6 w-10 rounded-full transition-colors ${checked?'bg-accent':'bg-surface3 border border-line2'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-bg transition-all ${checked?'left-[18px]':'left-0.5'}`}/>
      </span>
      {label && <span className="text-sm text-fg/90">{label}</span>}
    </button>
  );
}
function Tabs({ tabs, value, onChange, className='' }){
  return (
    <div className={`inline-flex p-1 bg-surface2 border border-line rounded-xl ${className}`}>
      {tabs.map(t => (
        <button key={t.value} onClick={()=>onChange(t.value)}
          className={`px-3 h-8 rounded-lg text-[12.5px] font-medium transition-colors ${value===t.value?'bg-surface3 text-fg':'text-mute hover:text-fg'}`}>
          {t.label}
        </button>
      ))}
    </div>
  );
}
function Stat({ label, value, unit, sub, tone='neutral', icon=null }){
  const toneClass = {
    neutral:'text-fg', good:'text-good', danger:'text-danger', warn:'text-warn', accent:'text-accent',
  }[tone];
  return (
    <Card className="relative">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11px] uppercase tracking-[0.18em] text-mute font-medium">{label}</div>
        {icon}
      </div>
      <div className="mt-4 flex items-baseline gap-1.5">
        <div className={`display text-[34px] leading-none font-semibold ${toneClass}`}>{value}</div>
        {unit && <div className="text-mute text-sm">{unit}</div>}
      </div>
      {sub && <div className="mt-2 text-[12.5px] text-mute">{sub}</div>}
    </Card>
  );
}
function EmptyState({ title, body, action=null, icon=null }){
  return (
    <div className="text-center py-10 px-6">
      {icon && <div className="mx-auto h-12 w-12 rounded-2xl bg-surface3 border border-line flex items-center justify-center text-mute mb-4">{icon}</div>}
      <div className="text-fg font-medium">{title}</div>
      {body && <div className="text-mute text-sm mt-1 max-w-sm mx-auto">{body}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
function Modal({ open, onClose, title, children, maxWidth='max-w-lg' }){
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 fadein">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={onClose}/>
      <div className={`relative ${maxWidth} w-full max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-2.5rem)] bg-surface2 border border-line rounded-2xl shadow-pop pop overflow-hidden flex flex-col`}>
        <div className="shrink-0 flex items-center justify-between gap-3 p-4 sm:p-5 border-b hairline">
          <div className="font-medium leading-snug pr-2">{title}</div>
          <IconButton className="shrink-0" onClick={onClose}><I.X className="h-4 w-4"/></IconButton>
        </div>
        <div className="p-4 sm:p-5 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  );
}
function Tooltip({ children, content }){
  const [open,setOpen]=useState(false);
  return (
    <span className="relative inline-flex" onMouseEnter={()=>setOpen(true)} onMouseLeave={()=>setOpen(false)}>
      {children}
      {open && <span className="absolute z-50 left-1/2 -translate-x-1/2 -top-2 -translate-y-full whitespace-nowrap bg-bg border border-line2 text-[11px] text-fg/90 px-2 py-1 rounded-md shadow-pop">{content}</span>}
    </span>
  );
}

// ---------- formatting ----------
function fmtW(w, unit){
  if (w == null || isNaN(w)) return '—';
  return Number(w).toFixed(1);
}
function fmtDelta(d){
  if (d == null || isNaN(d)) return '—';
  const s = d > 0 ? '+' : '';
  return s + Number(d).toFixed(1);
}

// ---------- Sidebar ----------
const NAV = [
  { id:'dashboard',     label:'Dashboard',     icon: I.Dashboard },
  { id:'log',           label:'Log Weight',    icon: I.Scale },
  { id:'backfill',      label:'Backfill',      icon: I.Import, highlight:true },
  { id:'trends',        label:'Trends',        icon: I.Trends },
  { id:'weekly',        label:'Weekly Reports',icon: I.Weekly },
  { id:'goals',         label:'Goals',         icon: I.Goal },
  { id:'measurements',  label:'Measurements',  icon: I.Ruler },
  { id:'photos',        label:'Progress Photos', icon: I.Photo },
  { id:'insights',      label:'Insights',      icon: I.Book },
  { id:'settings',      label:'Settings',      icon: I.Settings },
];

function Sidebar({ route, setRoute, onClose }){
  const { state } = useApp();
  const name = state.profile?.name || 'New User';
  const initial = (name[0]||'N').toUpperCase();
  return (
    <aside className="h-full w-[240px] shrink-0 flex flex-col bg-surface border-r hairline">
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-fg text-bg flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><path d="M4 18 9 12l4 4 7-8"/></svg>
          </div>
          <div>
            <div className="font-semibold tracking-tight text-[15px]">WeightLens</div>
            <div className="text-[10.5px] uppercase tracking-[0.18em] text-mute">Trend dashboard</div>
          </div>
        </div>
        {onClose && <IconButton onClick={onClose}><I.X className="h-4 w-4"/></IconButton>}
      </div>
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-auto">
        {NAV.map(item => {
          const Icon = item.icon;
          const active = route === item.id;
          return (
            <button key={item.id} onClick={()=>{ setRoute(item.id); onClose && onClose(); }}
              className={`w-full group flex items-center gap-3 px-3 h-10 rounded-xl text-[13.5px] transition-colors
                ${active ? 'bg-surface3 text-fg' : 'text-mute hover:text-fg hover:bg-surface3/60'}`}>
              <Icon className="h-[18px] w-[18px] shrink-0"/>
              <span className="flex-1 text-left">{item.label}</span>
              {item.highlight && !active && <Pill tone="accent" className="!text-[10px] !px-1.5 !py-0">Quick</Pill>}
              {active && <span className="h-1.5 w-1.5 rounded-full bg-accent"/>}
            </button>
          );
        })}
      </nav>

      <div className="px-4 pb-4 pt-2 border-t hairline">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-white font-semibold text-sm">{initial}</div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] truncate">{name}</div>
            <div className="text-[11px] text-mute truncate">Cloud sync enabled</div>
          </div>
          <IconButton onClick={()=>setRoute('settings')}><I.Settings className="h-4 w-4"/></IconButton>
        </div>
      </div>
    </aside>
  );
}

// ---------- Right panel ----------
function RightPanel({ setRoute }){
  const { state } = useApp();
  const insight = useMemo(()=> quickInsight(state.entries, state.settings.weekStartDay), [state.entries, state.settings.weekStartDay]);
  const flux = useMemo(()=> normalFluctuation(state.entries), [state.entries]);
  const spike = useMemo(()=> biggestSpike(state.entries), [state.entries]);
  const goal = state.goal;
  const unit = state.settings.unit;
  const r7 = useMemo(()=> rolling7(state.entries), [state.entries]);
  const currentAvg = r7.length ? r7[r7.length-1].avg7 : null;

  // Goal progress
  let progress = null;
  if (goal.startingWeight && goal.goalWeight && currentAvg != null) {
    const total = goal.startingWeight - goal.goalWeight;
    const done  = goal.startingWeight - currentAvg;
    progress = Math.max(0, Math.min(1, total !== 0 ? done / total : 0));
  }

  return (
    <aside className="h-full w-[320px] shrink-0 hidden xl:flex flex-col gap-4 p-5 overflow-auto">
      <Card>
        <SectionLabel right={<Pill tone="accent"><I.Sparkle className="h-3 w-3"/>Coach</Pill>}>Today's insight</SectionLabel>
        <p className="text-[14px] leading-relaxed text-fg/90">{insight}</p>
      </Card>

      <Card>
        <SectionLabel right={<button onClick={()=>setRoute('goals')} className="text-[11px] text-mute hover:text-fg">Edit</button>}>Current goal</SectionLabel>
        <div className="flex items-baseline gap-2">
          <div className="font-medium capitalize">{goal.mode === 'fatloss' ? 'Fat loss' : goal.mode === 'musclegain' ? 'Muscle gain' : goal.mode}</div>
          {goal.targetPace ? <div className="text-mute text-[12px]">~{goal.targetPace} {unit}/wk</div> : null}
        </div>
        {progress != null && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] text-mute mb-1.5">
              <span>{fmtW(goal.startingWeight)} {unit}</span>
              <span>{fmtW(goal.goalWeight)} {unit}</span>
            </div>
            <div className="h-2 bg-surface3 rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: (progress*100).toFixed(1)+'%' }}/>
            </div>
            <div className="mt-2 text-[12px] text-mute">{(progress*100).toFixed(0)}% of the way there • avg {fmtW(currentAvg)} {unit}</div>
          </div>
        )}
      </Card>

      <Card>
        <SectionLabel>Normal fluctuation</SectionLabel>
        {flux != null ? (
          <>
            <div className="display text-2xl font-semibold">±{flux.toFixed(1)} <span className="text-mute text-sm font-normal">{unit}</span></div>
            <p className="text-[12.5px] text-mute mt-2 leading-relaxed">Your weight typically moves about this much day to day. Spikes inside this range are normal.</p>
          </>
        ) : (
          <p className="text-[12.5px] text-mute">Log a few more days to see your typical daily range.</p>
        )}
      </Card>

      {spike && (
        <Card>
          <SectionLabel>This week's biggest spike</SectionLabel>
          <div className="flex items-baseline gap-2">
            <I.ArrowUp className="h-4 w-4 text-warn"/>
            <div className="display text-xl font-semibold text-warn">+{spike.diff.toFixed(1)}</div>
            <div className="text-mute text-sm">{unit} on {fmtShort(spike.date)}</div>
          </div>
          <p className="text-[12.5px] text-mute mt-2 leading-relaxed">
            {spike.tags.length
              ? `You tagged ${spike.tags.slice(0,2).join(', ').toLowerCase()} — that often shows up as temporary water weight.`
              : `No tags logged that day. Common causes: sodium, carbs, sleep, or normal water fluctuation.`}
          </p>
        </Card>
      )}

      <Card className="!bg-surface2/60 border-accent/20">
        <SectionLabel right={<Pill tone="accent">New</Pill>}>Have old data?</SectionLabel>
        <p className="text-[12.5px] text-mute mb-3 leading-relaxed">Paste past weights from your Notes app and we'll build the trend instantly.</p>
        <Button onClick={()=>setRoute('backfill')} size="sm" className="w-full">
          <I.Import className="h-4 w-4"/> Backfill past weights
        </Button>
      </Card>
    </aside>
  );
}

// ---------- Topbar (mobile) ----------
function Topbar({ route, onMenu, setRoute }){
  const title = NAV.find(n=>n.id===route)?.label || 'Dashboard';
  return (
    <div className="lg:hidden flex items-center justify-between gap-3 px-4 h-14 border-b hairline sticky top-0 bg-bg/95 backdrop-blur z-20">
      <button className="h-9 w-9 rounded-xl flex items-center justify-center text-fg hover:bg-surface3" onClick={onMenu}><I.Menu className="h-5 w-5"/></button>
      <div className="font-medium">{title}</div>
      <button onClick={()=>setRoute('log')} className="h-9 w-9 rounded-xl flex items-center justify-center text-fg bg-accent/15 hover:bg-accent/25"><I.Plus className="h-5 w-5"/></button>
    </div>
  );
}

// ---------- attach ----------
Object.assign(window, {
  AppContext, useApp,
  I, Card, SectionLabel, Pill, Button, IconButton, Input, Select, Textarea, Toggle, Tabs, Stat, EmptyState, Modal, Tooltip,
  fmtW, fmtDelta,
  NAV, Sidebar, RightPanel, Topbar,
});
