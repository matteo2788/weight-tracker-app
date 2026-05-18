// weekly-reports-override.jsx — final fixed weekly reports
// This file loads before editorial-redesign.jsx, so it locks the fixed WeeklyReportsPage
// onto window. That prevents the older hardcoded 7/7 editorial version from replacing it.

function weekStartName(weekStartDay){
  return Number(weekStartDay) === 0 ? 'Sunday' : 'Monday';
}

function reportWeekMeta(w, weekStartDay){
  const today = typeof todayISO === 'function' ? todayISO() : new Date().toISOString().slice(0,10);
  const currentStart = weekKey(today, weekStartDay);
  const isCurrent = w.weekStart === currentStart;
  const elapsed = isCurrent ? Math.min(7, Math.max(1, daysBetween(w.weekStart, today) + 1)) : 7;
  const daysLeft = isCurrent ? Math.max(0, 7 - elapsed) : 0;
  return {
    isCurrent,
    elapsed,
    daysLeft,
    status: isCurrent ? `In progress · day ${elapsed} of 7` : 'Complete week',
    leftText: isCurrent ? (daysLeft === 0 ? 'Ends today' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`) : '',
    loggedLabel: `${w.count}/7`,
    loggedSub: isCurrent ? `logged so far` : `days logged`,
  };
}

function weeklyReportSummary(w, prev, unit, meta){
  if (meta.isCurrent) {
    return `This week is still in progress. You’ve logged ${w.count}/7 days so far, so treat this as a live check-in — not a final weekly verdict yet.`;
  }

  if (!prev) {
    return `Your average this week was ${w.avg.toFixed(1)} ${unit}. This is your first report, so the next week will make the trend clearer.`;
  }

  const diff = w.avg - prev.avg;
  if (Math.abs(diff) < 0.3) {
    return `Your average this week was ${w.avg.toFixed(1)} ${unit}. It was basically steady compared with the week before, so do not overreact to one noisy week.`;
  }

  if (diff > 0) {
    return `Your average this week was ${w.avg.toFixed(1)} ${unit}, up ${diff.toFixed(1)} ${unit} from the prior week. Watch the next report before making a big change.`;
  }

  return `Your average this week was ${w.avg.toFixed(1)} ${unit}, down ${Math.abs(diff).toFixed(1)} ${unit} from the prior week. That is more useful than one single low weigh-in.`;
}

function WeeklyReportsPage(){
  const { state } = useApp();
  const unit = state?.settings?.unit || 'lbs';
  const wsd = state?.settings?.weekStartDay ?? 1;
  const weeks = useMemo(() => weeklyAverages(state.entries || [], wsd), [state.entries, wsd]);
  const reversed = [...weeks].reverse();

  return (
    <div className="wl-page fadein">
      <div className="wl-kicker">Reports</div>
      <h1 className="wl-title mt-4">Weekly reports</h1>
      <p className="mt-4 text-[#686761] max-w-2xl">
        Weeks start on {weekStartName(wsd)}. The current week is marked in progress, so it will not pretend an unfinished week is complete.
      </p>

      {reversed.length === 0 ? (
        <div className="wl-rule mt-14 py-16 text-center text-[#686761]">
          Log a few days and weekly reports will appear here.
        </div>
      ) : (
        <div className="mt-14 space-y-16">
          {reversed.slice(0,8).map((w,i) => {
            const prev = reversed[i+1];
            const meta = reportWeekMeta(w, wsd);
            const spread = w.high - w.low;
            return (
              <div className="grid grid-cols-[220px_150px_160px_1fr] gap-10 border-t border-[var(--ed-line)] pt-6" key={w.weekStart}>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="wl-kicker">Week of</div>
                    {meta.isCurrent && <span className="wl-pill">In progress</span>}
                  </div>
                  <div className="font-bold mt-2">{fmtShort(w.weekStart)} — {fmtShort(w.weekEnd)}</div>
                  {meta.isCurrent && <div className="text-xs text-[#686761] mt-1">{meta.status} · {meta.leftText}</div>}
                  <div className="text-3xl font-black mt-4">{w.avg.toFixed(1)} <span className="text-sm">{unit}</span></div>
                </div>

                <div>
                  <div className="wl-kicker">Logged</div>
                  <div className="text-3xl font-black mt-4">{meta.loggedLabel}</div>
                  <div className="text-xs text-[#686761] mt-2">{meta.loggedSub}</div>
                </div>

                <div>
                  <div className="wl-kicker">Range</div>
                  <div className="text-3xl font-black mt-4">{w.low.toFixed(1)}—<br/>{w.high.toFixed(1)}</div>
                  <div className="text-xs text-[#686761] mt-2">spread {spread.toFixed(1)} {unit}</div>
                </div>

                <div>
                  <div className="wl-kicker">Summary</div>
                  <p className="mt-4">{weeklyReportSummary(w, prev, unit, meta)}</p>
                  {w.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {w.tags.slice(0,4).map(t => <span className="wl-pill" key={t.tag}>{t.tag} ×{t.count}</span>)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const __WL_FIXED_WEEKLY_REPORTS_PAGE__ = WeeklyReportsPage;

try {
  Object.defineProperty(window, 'WeeklyReportsPage', {
    configurable: true,
    get(){ return __WL_FIXED_WEEKLY_REPORTS_PAGE__; },
    set(next){ window.__wlIgnoredOldWeeklyReportsPage = next; }
  });
} catch (err) {
  window.WeeklyReportsPage = __WL_FIXED_WEEKLY_REPORTS_PAGE__;
}

Object.assign(window, {
  reportWeekMeta,
  weeklyReportSummary,
});
