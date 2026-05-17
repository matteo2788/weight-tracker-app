// functional-trend-ranges.js — make dashboard/trends range tabs actually filter chart data
(function(){
  const e = React.createElement;
  const useState = React.useState;
  const R = window.Recharts || {};
  const Ranges = [['7D',7],['30D',30],['90D',90],['6M',180],['1Y',365],['All',Infinity]];

  const one = v => Number.isFinite(Number(v)) ? Number(v).toFixed(1) : '—';
  const signed = v => Number.isFinite(Number(v)) ? `${Number(v)>0?'+':''}${Number(v).toFixed(1)}` : '—';
  const today = () => new Date().toISOString().slice(0,10);
  const unitOf = state => state?.settings?.unit || 'lbs';
  const shortDate = d => { try { return new Date(d + 'T00:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'}); } catch(err){ return d || '—'; } };
  const longDate = d => { try { return new Date(d + 'T00:00:00').toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric',year:'numeric'}); } catch(err){ return d || '—'; } };
  const entriesOf = state => [...(state?.entries || [])].filter(x=>x && x.date && Number.isFinite(Number(x.weight))).sort((a,b)=>String(a.date).localeCompare(String(b.date)));

  function rolling(entries){
    return entries.map((row,index)=>{
      const slice = entries.slice(Math.max(0,index-6), index+1).map(x=>Number(x.weight)).filter(Number.isFinite);
      return { ...row, weight:Number(row.weight), avg7:slice.length ? slice.reduce((a,b)=>a+b,0)/slice.length : Number(row.weight) };
    });
  }

  function allStats(state){
    const entries = entriesOf(state);
    const rolled = rolling(entries);
    const latest = entries[entries.length - 1] || null;
    const todayKey = today();
    const todayEntry = entries.find(x => x.date === todayKey) || null;
    const avg7 = rolled.length ? rolled[rolled.length - 1].avg7 : null;
    const prev = rolled.length > 7 ? rolled[rolled.length - 8].avg7 : null;
    const weeklyRate = avg7 != null && prev != null ? avg7 - prev : null;
    const lastWeek = entries.length > 7 ? entries.slice(-14,-7).map(x=>Number(x.weight)).filter(Number.isFinite) : [];
    const thisWeek = entries.slice(-7).map(x=>Number(x.weight)).filter(Number.isFinite);
    const lastAvg = lastWeek.length ? lastWeek.reduce((a,b)=>a+b,0)/lastWeek.length : null;
    const thisAvg = thisWeek.length ? thisWeek.reduce((a,b)=>a+b,0)/thisWeek.length : avg7;
    const vsLast = thisAvg != null && lastAvg != null ? thisAvg - lastAvg : null;
    return { entries, rolled, latest, todayEntry, todayKey, avg7, weeklyRate, vsLast, unit:unitOf(state) };
  }

  function filterRange(rolled, range){
    const found = Ranges.find(([label]) => label === range);
    const count = found ? found[1] : 30;
    if(count === Infinity) return rolled;
    return rolled.slice(-count);
  }

  function rangeStats(data){
    if(!data.length) return { change:null, high:null, low:null, days:0 };
    const first = data[0]?.avg7 ?? data[0]?.weight;
    const last = data[data.length-1]?.avg7 ?? data[data.length-1]?.weight;
    const weights = data.map(x=>Number(x.weight)).filter(Number.isFinite);
    return {
      change: Number.isFinite(first) && Number.isFinite(last) ? last - first : null,
      high: weights.length ? Math.max(...weights) : null,
      low: weights.length ? Math.min(...weights) : null,
      days: data.length
    };
  }

  function story(s){
    if(!s.latest) return 'Start logging to reveal your real trend.';
    if(!Number.isFinite(Number(s.weeklyRate))) return 'Your weight is being tracked.';
    if(Math.abs(s.weeklyRate) < 0.25) return 'Your weight is holding steady.';
    return s.weeklyRate < 0 ? 'Your trend is moving down.' : 'Your trend is moving up.';
  }

  function Tabs({ value, onChange }){
    return e('div',{className:'wl-tabs'}, Ranges.map(([label]) => e('button',{key:label,className:value===label?'active':'',onClick:()=>onChange(label)},label)));
  }

  function HeroSummary({ hasTodayWeight, displayWeight, avg7, weeklyRate, unit }){
    return e('div',{className:'wl-hero-summary'},
      e('div',{className:'wl-hero-summary-item'},
        e('div',{className:'wl-hero-summary-label'},hasTodayWeight ? 'Today' : 'Today'),
        e('div',{className:'wl-hero-summary-value'},hasTodayWeight ? `${one(displayWeight)} ${unit}` : 'Not logged')
      ),
      e('div',{className:'wl-hero-summary-item'},
        e('div',{className:'wl-hero-summary-label'},'7-day average'),
        e('div',{className:'wl-hero-summary-value'},`${one(avg7)} ${unit}`)
      ),
      e('div',{className:'wl-hero-summary-item'},
        e('div',{className:'wl-hero-summary-label'},'Trend pace'),
        e('div',{className:`wl-hero-summary-value ${weeklyRate < 0 ? 'good' : weeklyRate > 0 ? 'warn' : ''}`},`${signed(weeklyRate)} ${unit}/wk`)
      )
    );
  }

  function Chart({ data, unit }){
    const style = { width:'100%', height:'340px', minHeight:'340px', marginTop:'1.6rem', overflow:'visible' };
    if(!R.ResponsiveContainer || data.length < 2) return e('div',{className:'wl-chart-block wl-chart-empty',style},
      e('div',{className:'wl-kicker'},'Need more data'),
      e('p',null,'Log at least two weights to draw your trend graph.')
    );
    return e('div',{className:'wl-chart-block',style},
      e(R.ResponsiveContainer,{width:'100%',height:'100%'},
        e(R.LineChart,{data,margin:{top:20,right:18,left:18,bottom:10}},
          e(R.CartesianGrid,{vertical:false,stroke:'rgba(17,17,15,.06)'}),
          e(R.XAxis,{dataKey:'date',tickFormatter:shortDate,axisLine:false,tickLine:false,tick:{fontSize:11,fill:'#77736B'},interval:'preserveStartEnd',minTickGap:22}),
          e(R.YAxis,{domain:['dataMin - 1','dataMax + 1'],axisLine:false,tickLine:false,tick:{fontSize:11,fill:'#77736B'},tickMargin:8,width:52,tickFormatter:v=>Number(v).toFixed(1)}),
          e(R.Tooltip,{content:({active,payload}) => active && payload?.length ? e('div',{className:'rounded-xl border bg-[#F6F4EF] px-3 py-2 text-xs'},
            e('div',null,e('b',null,`${one(payload[0].payload.weight)}`),` ${unit}`),
            e('div',{style:{color:'#65A30D'}},`Trend ${one(payload[0].payload.avg7)} ${unit}`)
          ) : null}),
          e(R.Line,{type:'monotone',dataKey:'weight',stroke:'rgba(95,115,138,.35)',strokeWidth:1.5,dot:{r:2.2,fill:'#8FA0B7',strokeWidth:0}}),
          e(R.Line,{type:'monotone',dataKey:'avg7',stroke:'#65A30D',strokeWidth:2.8,dot:false})
        )
      )
    );
  }

  function ChartExplainer(){
    return e('div',{className:'wl-chart-key', 'data-wl-chart-key':'true'},
      e('div',{className:'wl-chart-key-items'},
        e('div',{className:'wl-chart-key-item'},
          e('span',{className:'wl-chart-dot','aria-hidden':'true'}),
          e('div',null,
            e('div',{className:'wl-chart-key-title'},'Daily weigh-ins'),
            e('div',{className:'wl-chart-key-copy'},'Each dot is one morning. Dots jump around because of water, food, sleep, and stress.')
          )
        ),
        e('div',{className:'wl-chart-key-item'},
          e('span',{className:'wl-chart-line','aria-hidden':'true'}),
          e('div',null,
            e('div',{className:'wl-chart-key-title'},'Green trend line'),
            e('div',{className:'wl-chart-key-copy'},'This smooths the last 7 days so you can see the real direction.')
          )
        )
      ),
      e('div',{className:'wl-chart-key-coach'},'Use the green line to judge progress. One dot is just one noisy morning.')
    );
  }

  function QuickLogLite(){
    const { state, updateState } = useApp();
    const s = allStats(state);
    const [draft,setDraft] = useState({ date:s.todayKey, weight:s.todayEntry?.weight || '', tagsText:'', notes:'' });
    function save(){
      const weight = Number(draft.weight);
      if(!draft.date){ alert('Choose a date.'); return; }
      if(!Number.isFinite(weight)){ alert('Enter a valid weight.'); return; }
      const entry = { id:draft.date, date:draft.date, weight, unit:s.unit, tags:String(draft.tagsText||'').split(',').map(x=>x.trim()).filter(Boolean), notes:String(draft.notes||'').trim() };
      const without = (state.entries || []).filter(x=>x.date !== entry.date);
      updateState({ entries:[...without,entry].sort((a,b)=>String(a.date).localeCompare(String(b.date))) });
    }
    return e('div',{className:'wl-rule'},
      e('div',{className:'flex justify-between mb-5'},e('div',null,e('div',{className:'wl-kicker'},'Quick log'),e('p',{className:'text-sm text-[#686761] mt-2'},'Daily weight fluctuates. The trend matters more than one day.')),e('div',{className:'wl-kicker'},s.todayEntry ? 'Editing today' : 'New today')),
      e('div',{className:'grid grid-cols-2 gap-4'},
        e('div',null,e('div',{className:'wl-kicker mb-2'},'Weight'),e('input',{className:'wl-form-line w-full',inputMode:'decimal',value:draft.weight,onChange:x=>setDraft({...draft,weight:x.target.value})})),
        e('div',null,e('div',{className:'wl-kicker mb-2'},'Date'),e('input',{className:'wl-form-line w-full',type:'date',value:draft.date,onChange:x=>setDraft({...draft,date:x.target.value})}))
      ),
      e('button',{className:'wl-btn w-full mt-5',onClick:save},s.todayEntry ? 'Update today' : 'Save entry')
    );
  }

  function Dashboard({ setRoute }){
    const { state } = useApp();
    const [range,setRange] = useState('30D');
    const s = allStats(state);
    const data = filterRange(s.rolled, range);
    const rs = rangeStats(data);
    const displayWeight = s.todayEntry?.weight;
    const hasTodayWeight = Number.isFinite(Number(displayWeight));
    return e('div',{className:'wl-page fadein'},
      e('div',{className:'grid grid-cols-3 items-start gap-4'},
        e('div',{className:'wl-kicker'},'Good morning, Matteo'),
        e('div',{className:'wl-hero-meta'},longDate(s.todayKey)),
        e('div',{className:'text-right'},e('button',{className:'wl-btn light',onClick:()=>setRoute('backfill')},'Backfill'),' ',e('button',{className:'wl-btn ml-2',onClick:()=>setRoute('log')},'+ Log entry'))
      ),
      e('h1',{className:'wl-hero-title'},story(s)),
      e('div',{className:'wl-hero-meta'},`Today · ${shortDate(s.todayKey)}`),
      e('div',{className:'wl-big-number mt-3'},hasTodayWeight ? one(displayWeight) : '—',e('span',{className:'wl-unit'},hasTodayWeight ? s.unit : 'not logged')),
      e(HeroSummary,{hasTodayWeight,displayWeight,avg7:s.avg7,weeklyRate:s.weeklyRate,unit:s.unit}),
      e('div',{className:'wl-metrics'},
        e('div',{className:'wl-metric'},e('div',{className:'wl-metric-label'},'Weekly rate'),e('div',{className:`wl-metric-value ${s.weeklyRate < 0 ? 'good' : 'warn'}`},signed(s.weeklyRate)),e('div',{className:'wl-metric-sub'},`${s.unit}/wk`)),
        e('div',{className:'wl-metric'},e('div',{className:'wl-metric-label'},'Vs last week'),e('div',{className:'wl-metric-value warn'},signed(s.vsLast)),e('div',{className:'wl-metric-sub'},s.unit)),
        e('div',{className:'wl-metric'},e('div',{className:'wl-metric-label'},'Confidence'),e('div',{className:'wl-metric-value'},s.entries.slice(-7).length >= 7 ? 'High' : 'Low'),e('div',{className:'wl-metric-sub'},`${s.entries.slice(-7).length}/7 days logged`)),
        e('div',{className:'wl-metric'},e('div',{className:'wl-metric-label'},'Total entries'),e('div',{className:'wl-metric-value'},s.entries.length),e('div',{className:'wl-metric-sub'},`Since ${s.entries[0] ? shortDate(s.entries[0].date) : '—'}`))
      ),
      e('section',{className:'wl-section'},
        e('div',{className:'wl-section-head'},e('div',null,e('div',{className:'wl-kicker'},'The trend'),e('h2',{className:'wl-title'},`You're tracking at ${one(data[data.length-1]?.avg7 ?? s.avg7)} ${s.unit}.`)),e(Tabs,{value:range,onChange:setRange})),
        e(Chart,{data,unit:s.unit}),
        e(ChartExplainer,null),
        e('div',{className:'text-xs text-[#77736B] mt-3'},`${range}: ${rs.days} entries · ${signed(rs.change)} ${s.unit} change`)
      ),
      e('section',{className:'wl-section wl-grid-2'},e('div',null,e('div',{className:'wl-kicker mb-3'},'This week'),e('p',{className:'wl-note'},`Your average is ${s.vsLast >= 0 ? 'up' : 'down'} ${Math.abs(s.vsLast || 0).toFixed(1)} ${s.unit} this week. Keep logging and reassess next week.`)),e(QuickLogLite,null))
    );
  }

  function TrendsPage(){
    const { state } = useApp();
    const [range,setRange] = useState('90D');
    const s = allStats(state);
    const data = filterRange(s.rolled, range);
    const rs = rangeStats(data);
    return e('div',{className:'wl-page fadein wl-trends-page-fixed'},
      e('div',{className:'wl-section-head'},
        e('div',null,e('div',{className:'wl-kicker'},'Analysis'),e('h1',{className:'wl-title'},'Long-term trends'),e('p',{className:'mt-4 text-[#686761]'},'Daily weight is noisy. Averages reveal the real direction.')),
        e(Tabs,{value:range,onChange:setRange})
      ),
      e(Chart,{data,unit:s.unit}),
      e(ChartExplainer,null),
      e('div',{className:'wl-rule mt-16'},e('div',{className:'wl-kicker mb-3'},'What this range means'),e('p',{className:'text-lg'},`Over this range, your 7-day average moved ${signed(rs.change)} ${s.unit}. Individual days bounce around, but the green line shows the real direction.`)),
      e('div',{className:'wl-metrics'},
        e('div',{className:'wl-metric'},e('div',{className:'wl-metric-label'},'Range change'),e('div',{className:`wl-metric-value ${rs.change < 0 ? 'good' : 'warn'}`},signed(rs.change)),e('div',{className:'wl-metric-sub'},s.unit)),
        e('div',{className:'wl-metric'},e('div',{className:'wl-metric-label'},'Highest in range'),e('div',{className:'wl-metric-value'},one(rs.high)),e('div',{className:'wl-metric-sub'},s.unit)),
        e('div',{className:'wl-metric'},e('div',{className:'wl-metric-label'},'Lowest in range'),e('div',{className:'wl-metric-value'},one(rs.low)),e('div',{className:'wl-metric-sub'},s.unit)),
        e('div',{className:'wl-metric'},e('div',{className:'wl-metric-label'},'Entries shown'),e('div',{className:'wl-metric-value'},rs.days),e('div',{className:'wl-metric-sub'},'entries'))
      )
    );
  }

  function install(){
    window.Dashboard = Dashboard;
    window.TrendsPage = TrendsPage;
  }
  install();
  window.addEventListener('load', install);
  setTimeout(install, 100);
  setTimeout(install, 500);
})();