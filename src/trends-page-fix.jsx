// trends-page-fix.jsx — hard renders the Trends page chart before the explainer
(function(){
  const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip: RTooltip, ResponsiveContainer } = window.Recharts || {};

  const safeEntries = (state) => [...(state?.entries || [])]
    .filter(e => e && e.date && Number.isFinite(Number(e.weight)))
    .sort((a,b) => String(a.date).localeCompare(String(b.date)));

  const unitOf = (state) => state?.settings?.unit || 'lbs';
  const one = (v) => Number.isFinite(Number(v)) ? Number(v).toFixed(1) : '—';
  const signed = (v) => Number.isFinite(Number(v)) ? `${Number(v) > 0 ? '+' : ''}${Number(v).toFixed(1)}` : '—';
  const shortDate = (d) => {
    try { return new Date(d + 'T00:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'}); }
    catch(e){ return d || '—'; }
  };

  function rolling(entries){
    return entries.map((entry, index) => {
      const slice = entries
        .slice(Math.max(0, index - 6), index + 1)
        .map(x => Number(x.weight))
        .filter(Number.isFinite);
      const avg7 = slice.length ? slice.reduce((a,b)=>a+b,0) / slice.length : Number(entry.weight);
      return { ...entry, weight:Number(entry.weight), avg7 };
    });
  }

  function stats(state){
    const entries = safeEntries(state);
    const unit = unitOf(state);
    const r = rolling(entries);
    const latestAvg = r.length ? r[r.length - 1].avg7 : null;
    const firstAvg = r.length ? r[0].avg7 : null;
    const rangeChange = Number.isFinite(latestAvg) && Number.isFinite(firstAvg) ? latestAvg - firstAvg : null;
    const weights = entries.map(e => Number(e.weight)).filter(Number.isFinite);
    return {
      entries,
      unit,
      r,
      rangeChange,
      highest: weights.length ? Math.max(...weights) : null,
      lowest: weights.length ? Math.min(...weights) : null,
    };
  }

  function TrendChart({ data, unit }){
    if(!ResponsiveContainer || data.length < 2) {
      return (
        <div className="wl-trends-chart-empty">
          <div className="wl-kicker">Need more data</div>
          <p>Log at least two weights to draw your trend graph.</p>
        </div>
      );
    }

    return (
      <div className="wl-trends-chart-lock">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 18, left: 14, bottom: 10 }}>
            <CartesianGrid vertical={false} stroke="rgba(17,17,15,.06)" />
            <XAxis
              dataKey="date"
              tickFormatter={shortDate}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill:'#77736B' }}
              interval="preserveStartEnd"
              minTickGap={22}
            />
            <YAxis
              domain={['dataMin - 1','dataMax + 1']}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill:'#77736B' }}
              width={44}
              tickFormatter={(v)=>Number(v).toFixed(1)}
            />
            <RTooltip content={({active,payload})=> active && payload?.length ? (
              <div className="rounded-xl border bg-[#F6F4EF] px-3 py-2 text-xs">
                <div><b>{one(payload[0].payload.weight)}</b> {unit}</div>
                <div style={{color:'#65A30D'}}>Trend {one(payload[0].payload.avg7)} {unit}</div>
              </div>
            ) : null}/>
            <Line type="monotone" dataKey="weight" stroke="rgba(95,115,138,.35)" strokeWidth={1.5} dot={{r:2.2,fill:'#8FA0B7',strokeWidth:0}} />
            <Line type="monotone" dataKey="avg7" stroke="#65A30D" strokeWidth={2.8} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  function ChartExplainer(){
    return (
      <div className="wl-chart-key" data-wl-chart-key="true">
        <div className="wl-chart-key-items">
          <div className="wl-chart-key-item">
            <span className="wl-chart-dot" aria-hidden="true"></span>
            <div>
              <div className="wl-chart-key-title">Daily weigh-ins</div>
              <div className="wl-chart-key-copy">Each dot is one morning. Dots jump around because of water, food, sleep, and stress.</div>
            </div>
          </div>
          <div className="wl-chart-key-item">
            <span className="wl-chart-line" aria-hidden="true"></span>
            <div>
              <div className="wl-chart-key-title">Green trend line</div>
              <div className="wl-chart-key-copy">This smooths the last 7 days so you can see the real direction.</div>
            </div>
          </div>
        </div>
        <div className="wl-chart-key-coach">Use the green line to judge progress. One dot is just one noisy morning.</div>
      </div>
    );
  }

  function TrendsPage(){
    const { state } = useApp();
    const s = stats(state);

    return (
      <div className="wl-page fadein wl-trends-page-fixed">
        <div className="wl-section-head">
          <div>
            <div className="wl-kicker">Analysis</div>
            <h1 className="wl-title">Long-term trends</h1>
            <p className="mt-4 text-[#686761]">Daily weight is noisy. Averages reveal the real direction.</p>
          </div>
          <div className="wl-tabs">
            <button>7D</button><button>30D</button><button className="active">90D</button><button>6M</button><button>1Y</button><button>All</button>
          </div>
        </div>

        <TrendChart data={s.r} unit={s.unit} />
        <ChartExplainer />

        <div className="wl-rule mt-16 wl-trends-range-copy">
          <div className="wl-kicker mb-3">What this range means</div>
          <p className="text-lg">Over this range, your 7-day average moved {signed(s.rangeChange)} {s.unit}. Individual days bounce around, but the green line shows the real direction.</p>
        </div>

        <div className="wl-metrics">
          <div className="wl-metric"><div className="wl-metric-label">Range change</div><div className={`wl-metric-value ${s.rangeChange < 0 ? 'good' : 'warn'}`}>{signed(s.rangeChange)}</div><div className="wl-metric-sub">{s.unit}</div></div>
          <div className="wl-metric"><div className="wl-metric-label">Highest in range</div><div className="wl-metric-value">{one(s.highest)}</div><div className="wl-metric-sub">{s.unit}</div></div>
          <div className="wl-metric"><div className="wl-metric-label">Lowest in range</div><div className="wl-metric-value">{one(s.lowest)}</div><div className="wl-metric-sub">{s.unit}</div></div>
          <div className="wl-metric"><div className="wl-metric-label">Days logged</div><div className="wl-metric-value">{s.entries.length}</div><div className="wl-metric-sub">entries</div></div>
        </div>
      </div>
    );
  }

  window.TrendsPage = TrendsPage;
})();
