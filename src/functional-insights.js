// functional-insights.js — data-aware coaching insights for WeightLens
(function(){
  const e = React.createElement;

  const one = v => Number.isFinite(Number(v)) ? Number(v).toFixed(1) : '—';
  const signed = v => Number.isFinite(Number(v)) ? `${Number(v)>0?'+':''}${Number(v).toFixed(1)}` : '—';
  const unitOf = state => state?.settings?.unit || 'lbs';
  const shortDate = d => { try { return new Date(d + 'T00:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'}); } catch(err){ return d || '—'; } };
  const entriesOf = state => [...(state?.entries || [])].filter(x=>x && x.date && Number.isFinite(Number(x.weight))).map(x=>({...x,weight:Number(x.weight)})).sort((a,b)=>String(a.date).localeCompare(String(b.date)));

  function rolling(entries){
    return entries.map((row,index)=>{
      const slice = entries.slice(Math.max(0,index-6), index+1).map(x=>Number(x.weight)).filter(Number.isFinite);
      return { ...row, avg7:slice.length ? slice.reduce((a,b)=>a+b,0)/slice.length : Number(row.weight) };
    });
  }

  function avg(list){
    const vals = list.map(Number).filter(Number.isFinite);
    return vals.length ? vals.reduce((a,b)=>a+b,0) / vals.length : null;
  }

  function dayDiff(a,b){
    try {
      const A = new Date(a + 'T00:00:00');
      const B = new Date(b + 'T00:00:00');
      return Math.round((B - A) / 86400000);
    } catch(err){ return 0; }
  }

  function analyze(state){
    const unit = unitOf(state);
    const entries = entriesOf(state);
    const rolled = rolling(entries);
    const latest = rolled[rolled.length - 1] || null;
    const last7 = entries.slice(-7);
    const last14 = entries.slice(-14);
    const last30 = entries.slice(-30);
    const thisAvg = avg(last7.map(x=>x.weight));
    const prevAvg = entries.length >= 14 ? avg(entries.slice(-14,-7).map(x=>x.weight)) : null;
    const change7 = thisAvg != null && prevAvg != null ? thisAvg - prevAvg : null;

    const dailyMoves = [];
    for(let i=1;i<last30.length;i++) dailyMoves.push(Math.abs(last30[i].weight - last30[i-1].weight));
    const normalMove = dailyMoves.length ? avg(dailyMoves) : null;

    let biggestSpike = null;
    for(let i=1;i<last30.length;i++){
      const diff = last30[i].weight - last30[i-1].weight;
      if(!biggestSpike || Math.abs(diff) > Math.abs(biggestSpike.diff)) biggestSpike = { ...last30[i], diff, prev:last30[i-1] };
    }

    const uniqueRecentDays = new Set(last7.map(x=>x.date)).size;
    const consistency = entries.length ? `${uniqueRecentDays}/7` : '0/7';
    const first = entries[0] || null;
    const daysTracked = first && latest ? Math.max(1, dayDiff(first.date, latest.date) + 1) : 0;
    const totalChange = first && latest ? latest.weight - first.weight : null;
    const range30 = last30.length ? Math.max(...last30.map(x=>x.weight)) - Math.min(...last30.map(x=>x.weight)) : null;

    let direction = 'Not enough data yet';
    let directionTone = 'neutral';
    if(change7 != null){
      if(Math.abs(change7) < 0.25){ direction = 'Mostly steady'; directionTone = 'neutral'; }
      else if(change7 < 0){ direction = 'Trending down'; directionTone = 'good'; }
      else { direction = 'Trending up'; directionTone = 'warn'; }
    }

    let coach = 'Keep logging. The app gets smarter once it has more consistent data.';
    if(entries.length >= 14){
      if(Math.abs(change7 || 0) < 0.25) coach = 'Your average is basically steady. That is not failure — it just means the trend needs more time before changing course.';
      else if(change7 < 0) coach = 'Your average is moving down. Daily bumps are still normal, so keep judging the rolling average instead of one morning.';
      else coach = 'Your average is up this week. Do not overreact yet — check whether it is a one-week fluctuation or a pattern across multiple weeks.';
    }

    return { unit, entries, rolled, latest, thisAvg, prevAvg, change7, normalMove, biggestSpike, consistency, daysTracked, totalChange, range30, direction, directionTone, coach };
  }

  function Pill({ children, tone }){
    const color = tone === 'good' ? 'text-[var(--ed-good)]' : tone === 'warn' ? 'text-[var(--ed-warn)]' : 'text-[#77736B]';
    return e('span',{className:`text-xs font-bold uppercase tracking-[0.22em] ${color}`},children);
  }

  function InsightCard({ label, title, body, value, tone }){
    const valueClass = tone === 'good' ? 'text-[var(--ed-good)]' : tone === 'warn' ? 'text-[var(--ed-warn)]' : 'text-[#11110F]';
    return e('article',{className:'wl-rule'},
      e('div',{className:'wl-kicker mb-5'},label),
      value != null && e('div',{className:`text-5xl md:text-6xl font-black tracking-[-.07em] mb-5 ${valueClass}`},value),
      e('h2',{className:'text-2xl md:text-3xl font-black tracking-[-.055em] leading-tight'},title),
      e('p',{className:'mt-4 text-[#686761] leading-relaxed'},body)
    );
  }

  function EducationCard({ tag, title, body }){
    return e('article',{className:'border-t border-[var(--ed-line)] pt-6'},
      e('div',{className:'flex items-center gap-3 mb-4'},e('span',{className:'h-8 w-8 rounded-full bg-[#E6F2D6] flex items-center justify-center text-[var(--ed-good)] font-black'},'✳'),e('span',{className:'wl-kicker'},tag)),
      e('h3',{className:'text-xl font-black tracking-[-.04em]'},title),
      e('p',{className:'text-[#686761] mt-3 leading-relaxed'},body)
    );
  }

  function InsightsPage(){
    const { state } = useApp();
    const a = analyze(state);

    if(a.entries.length === 0){
      return e('div',{className:'wl-page fadein'},
        e('div',{className:'wl-kicker'},'Learn'),
        e('h1',{className:'wl-title mt-4'},'Insights & education'),
        e('p',{className:'mt-4 text-[#686761] max-w-2xl'},'Log a few weights and WeightLens will turn your data into plain-English coaching.'),
        e('div',{className:'text-center mt-28'},e('div',{className:'text-3xl font-black tracking-[-.06em]'},'No insights yet'),e('p',{className:'text-[#686761] mt-3'},'Add at least a week of entries to unlock useful trend insights.')),
        e('section',{className:'wl-section grid grid-cols-2 gap-14'},
          e(EducationCard,{tag:'Fundamentals',title:'Why weekly averages matter more than daily weight',body:'Daily weight behaves like waves. Weekly averages act more like the tide — slower, calmer, and better at showing direction.'}),
          e(EducationCard,{tag:'Water',title:'Scale jumps are often water, not body change',body:'A salty meal, more carbs, sore muscles, late sleep, or stress can push scale weight up temporarily. That does not automatically mean real progress changed.'})
        )
      );
    }

    return e('div',{className:'wl-page fadein'},
      e('div',{className:'wl-section-head'},
        e('div',null,
          e('div',{className:'wl-kicker'},'Learn'),
          e('h1',{className:'wl-title mt-4'},'Insights & education'),
          e('p',{className:'mt-4 text-[#686761] max-w-2xl'},'Plain-English coaching based on your actual weigh-ins. The goal is to understand the trend without overreacting to noise.')
        ),
        e('div',{className:'text-right'},e(Pill,{tone:a.directionTone},a.direction))
      ),

      e('section',{className:'wl-rule mb-16'},
        e('div',{className:'wl-kicker mb-4'},'Today’s read'),
        e('p',{className:'text-3xl md:text-5xl font-black tracking-[-.06em] leading-tight max-w-5xl'},a.coach)
      ),

      e('section',{className:'grid grid-cols-2 gap-8'},
        e(InsightCard,{label:'7-day average',value:a.thisAvg != null ? `${one(a.thisAvg)} ${a.unit}` : '—',title:'Your current trend anchor',body:'This is the number to care about more than a single weigh-in. It smooths out normal day-to-day changes.'}),
        e(InsightCard,{label:'Vs last week',value:a.change7 != null ? `${signed(a.change7)} ${a.unit}` : '—',tone:a.change7 < 0 ? 'good' : a.change7 > 0 ? 'warn' : 'neutral',title:a.direction,body:'This compares your latest 7-day average against the previous 7-day average. It is a cleaner signal than one random day.'}),
        e(InsightCard,{label:'Normal fluctuation',value:a.normalMove != null ? `±${one(a.normalMove)} ${a.unit}` : '—',title:'Your daily noise range',body:'This is roughly how much your weight has been moving day to day recently. Changes inside this range are usually not worth stressing over.'}),
        e(InsightCard,{label:'Logging consistency',value:a.consistency,title:'This week’s data quality',body:'The more days you log, the more trustworthy the average becomes. Missing days do not ruin it, but consistency sharpens the signal.'})
      ),

      e('section',{className:'wl-section grid grid-cols-3 gap-8'},
        e(InsightCard,{label:'Biggest recent spike',value:a.biggestSpike ? `${signed(a.biggestSpike.diff)} ${a.unit}` : '—',tone:a.biggestSpike?.diff > 0 ? 'warn' : 'good',title:a.biggestSpike ? `${shortDate(a.biggestSpike.date)} moved the most` : 'No spike yet',body:a.biggestSpike ? 'A single spike is just a data point. Look for repeated movement in the average before making changes.' : 'More data will reveal your biggest recent day-to-day change.'}),
        e(InsightCard,{label:'30-day range',value:a.range30 != null ? `${one(a.range30)} ${a.unit}` : '—',title:'Your recent high-to-low spread',body:'This shows the gap between your highest and lowest weigh-in in the recent window. It helps explain why single days can feel dramatic.'}),
        e(InsightCard,{label:'Total change',value:a.totalChange != null ? `${signed(a.totalChange)} ${a.unit}` : '—',tone:a.totalChange < 0 ? 'good' : a.totalChange > 0 ? 'warn' : 'neutral',title:`Across ${a.daysTracked || 0} days`,body:'This is the big-picture movement from your first saved entry to your latest one.'})
      ),

      e('section',{className:'wl-section grid grid-cols-2 gap-14'},
        e(EducationCard,{tag:'Fundamentals',title:'Why weekly averages matter more than daily weight',body:'Think of daily weight like waves and your weekly average like the tide. The waves jump around, but the tide tells you where things are actually going.'}),
        e(EducationCard,{tag:'Water',title:'Sodium and carbs can swing the scale',body:'Some foods make your body hold more water for a short time. That can show up as scale weight, even when it is not meaningful body change.'}),
        e(EducationCard,{tag:'Training',title:'Sore muscles can temporarily increase weight',body:'Hard training can make muscles hold extra fluid while recovering. That can make weight look higher for a bit, even when training is productive.'}),
        e(EducationCard,{tag:'Mindset',title:'One day does not decide the story',body:'One high day cannot erase a good week. One low day also does not guarantee success. The pattern matters more than the single dot.'})
      )
    );
  }

  function install(){ window.InsightsPage = InsightsPage; }
  install(); window.addEventListener('load', install); setTimeout(install,100); setTimeout(install,500); setTimeout(install,1500);
})();
