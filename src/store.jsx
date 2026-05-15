// store.jsx — global store, localStorage, calculations, seed data
// All exports attached to window for sharing across Babel script files.

const STORAGE_KEY = 'weightlens.v2';

const DEFAULT_SETTINGS = {
  unit: 'lbs',         // 'lbs' | 'kg'
  weekStartDay: 1,     // 0 Sun, 1 Mon
  theme: 'dark',
  defaultGoal: 'fatloss',
  reminderTime: '07:30',
};

const DEFAULT_GOAL = {
  mode: 'fatloss',        // fatloss | musclegain | maintenance | recomp | general
  startDate: null,
  startingWeight: null,
  goalWeight: null,
  targetPace: 1.0,        // lbs per week target
  notes: '',
};

const TAG_LIST = [
  'High sodium','Ate late','Higher carbs','Restaurant meal',
  'Bad sleep','Great sleep','Hard workout','Sore muscles',
  'Stress','Travel','Missed usual routine','Digestion difference',
  'Hydration difference','Other'
];

// ---------- date helpers ----------
function pad(n){ return String(n).padStart(2,'0'); }
function isoDate(d){
  const x = d instanceof Date ? d : new Date(d);
  return `${x.getFullYear()}-${pad(x.getMonth()+1)}-${pad(x.getDate())}`;
}
function todayISO(){ return isoDate(new Date()); }
function parseISO(s){ const [y,m,d] = s.split('-').map(Number); return new Date(y,m-1,d); }
function addDays(d, n){ const x = (d instanceof Date)?new Date(d):parseISO(d); x.setDate(x.getDate()+n); return x; }
function daysBetween(a,b){
  const A = parseISO(a), B = parseISO(b);
  return Math.round((B-A)/86400000);
}
function fmtShort(iso){
  const d = parseISO(iso);
  return d.toLocaleDateString(undefined,{month:'short', day:'numeric'});
}
function fmtLong(iso){
  const d = parseISO(iso);
  return d.toLocaleDateString(undefined,{weekday:'short', month:'short', day:'numeric', year:'numeric'});
}
function weekKey(iso, weekStartDay){
  const d = parseISO(iso);
  const diff = (d.getDay() - weekStartDay + 7) % 7;
  d.setDate(d.getDate() - diff);
  return isoDate(d);
}
function weekRange(weekStart, weekStartDay){
  const start = weekStart;
  const end = isoDate(addDays(weekStart, 6));
  return { start, end };
}

// ---------- unit helpers ----------
function convertWeight(value, fromUnit, toUnit){
  if (fromUnit === toUnit) return value;
  if (fromUnit === 'lbs' && toUnit === 'kg') return value * 0.45359237;
  if (fromUnit === 'kg' && toUnit === 'lbs') return value / 0.45359237;
  return value;
}

// ---------- seed ----------
function genSeed(){
  return [];
}

// ---------- state shape ----------
function freshState(){
  return {
    entries: [],
    measurements: [],
    photos: [],
    goal: { ...DEFAULT_GOAL },
    settings: { ...DEFAULT_SETTINGS },
    profile: { name: 'New User' },
  };
}

function loadState(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const s = freshState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      return s;
    }
    const parsed = JSON.parse(raw);
    return {
      ...freshState(),
      ...parsed,
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings||{}) },
      goal: { ...DEFAULT_GOAL, ...(parsed.goal||{}) },
      profile: { name: 'New User', ...(parsed.profile||{}) },
    };
  } catch(e){
    return freshState();
  }
}

function saveState(s){
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch(e){}
}

// ---------- calculations ----------
function entriesSortedAsc(entries){
  return [...entries].sort((a,b)=> a.date.localeCompare(b.date));
}
function entriesInRange(entries, fromISO, toISO){
  return entries.filter(e => e.date >= fromISO && e.date <= toISO);
}
function lastNDays(entries, n, anchorISO){
  const anchor = anchorISO || todayISO();
  const start = isoDate(addDays(anchor, -(n-1)));
  return entriesInRange(entries, start, anchor);
}
function average(nums){
  if (!nums.length) return null;
  return nums.reduce((a,b)=>a+b,0) / nums.length;
}
function rolling7(entries){
  // returns array of { date, weight, avg7 } over all dates present in entries (asc)
  const sorted = entriesSortedAsc(entries);
  return sorted.map((e, i) => {
    const windowStart = isoDate(addDays(e.date, -6));
    const win = sorted.filter(x => x.date >= windowStart && x.date <= e.date);
    const avg = win.length >= 3 ? average(win.map(x=>x.weight)) : null;
    return { date: e.date, weight: e.weight, avg7: avg };
  });
}
function weeklyAverages(entries, weekStartDay){
  const sorted = entriesSortedAsc(entries);
  const map = new Map();
  sorted.forEach(e => {
    const wk = weekKey(e.date, weekStartDay);
    if (!map.has(wk)) map.set(wk, []);
    map.get(wk).push(e);
  });
  const result = [];
  Array.from(map.keys()).sort().forEach(wk => {
    const arr = map.get(wk);
    result.push({
      weekStart: wk,
      weekEnd: isoDate(addDays(wk, 6)),
      avg: average(arr.map(x=>x.weight)),
      count: arr.length,
      entries: arr,
      high: Math.max(...arr.map(x=>x.weight)),
      low:  Math.min(...arr.map(x=>x.weight)),
      tags: tagFrequency(arr),
    });
  });
  return result;
}
function tagFrequency(arr){
  const f = {};
  arr.forEach(e => (e.tags||[]).forEach(t => f[t] = (f[t]||0)+1));
  return Object.entries(f).sort((a,b)=>b[1]-a[1]).map(([t,c])=>({tag:t,count:c}));
}
function normalFluctuation(entries){
  const sorted = entriesSortedAsc(entries).slice(-30);
  if (sorted.length < 4) return null;
  const diffs = [];
  for (let i = 1; i < sorted.length; i++){
    const a = sorted[i-1], b = sorted[i];
    if (daysBetween(a.date, b.date) <= 3) diffs.push(Math.abs(b.weight - a.weight));
  }
  if (diffs.length < 3) return null;
  return average(diffs);
}
function trendStatus(entries, weekStartDay){
  const weeks = weeklyAverages(entries, weekStartDay);
  const complete = weeks.filter(w => w.count >= 3);
  if (complete.length < 2) return { status:'not_enough', change: null, weeks };
  const recent = complete.slice(-2);
  const change = recent[1].avg - recent[0].avg;
  let status = 'stable';
  if (change <= -0.5) status = 'losing';
  else if (change >= 0.5) status = 'gaining';
  return { status, change, weeks };
}
function weeklyRate(entries, weekStartDay){
  const weeks = weeklyAverages(entries, weekStartDay).filter(w=>w.count>=3);
  if (weeks.length < 2) return null;
  const lastN = weeks.slice(-4);
  if (lastN.length < 2) return null;
  // average of consecutive deltas
  let diffs = [];
  for (let i=1; i<lastN.length; i++) diffs.push(lastN[i].avg - lastN[i-1].avg);
  return average(diffs);
}
function loggingStreak(entries){
  if (!entries.length) return 0;
  const dates = new Set(entries.map(e=>e.date));
  let streak = 0;
  let d = todayISO();
  while (dates.has(d)){ streak++; d = isoDate(addDays(d,-1)); }
  return streak;
}
function bestStreak(entries){
  const dates = [...new Set(entries.map(e=>e.date))].sort();
  let best = 0, cur = 0, prev = null;
  for (const d of dates){
    if (prev && daysBetween(prev,d)===1) cur++;
    else cur = 1;
    if (cur > best) best = cur;
    prev = d;
  }
  return best;
}
function loggingPercent(entries, days){
  const set = new Set(lastNDays(entries, days).map(e=>e.date));
  return set.size / days;
}
function confidenceFromWeek(entries, weekStartDay){
  const wk = weekKey(todayISO(), weekStartDay);
  const arr = entries.filter(e => weekKey(e.date, weekStartDay) === wk);
  const n = arr.length;
  if (n >= 6) return { level:'High', count:n };
  if (n >= 3) return { level:'Medium', count:n };
  if (n >= 1) return { level:'Low', count:n };
  return { level:'None', count:0 };
}
function biggestSpike(entries){
  const sorted = entriesSortedAsc(entries).slice(-14);
  let max = null;
  for (let i=1; i<sorted.length; i++){
    const a = sorted[i-1], b = sorted[i];
    const diff = b.weight - a.weight;
    if (diff > 0 && (!max || diff > max.diff)){
      max = { date: b.date, diff, weight: b.weight, prevDate: a.date, tags: b.tags||[] };
    }
  }
  return max;
}

// ---------- weekly summary generator ----------
function weeklySummary(entries, weekStartDay){
  const weeks = weeklyAverages(entries, weekStartDay);
  const complete = weeks.filter(w => w.count >= 3);
  if (complete.length === 0) return "Log a few days this week to see a personalized summary.";
  if (complete.length === 1) return "You're starting to build data. After another week of logging, you'll see a clear trend.";
  const a = complete[complete.length-2], b = complete[complete.length-1];
  const diff = b.avg - a.avg;
  const abs = Math.abs(diff).toFixed(1);
  const flux = normalFluctuation(entries);
  const fluxNote = flux ? ` Your weight normally moves about ${flux.toFixed(1)} lb day to day, so daily bumps are expected.` : '';
  const tagHints = b.tags.slice(0,2).map(t=>t.tag.toLowerCase()).join(' and ');

  if (diff <= -0.3) {
    return `Your weekly average is down ${abs} lb from last week. Daily weight bounced around, but your trend is moving down overall.${fluxNote}`;
  } else if (diff >= 0.3) {
    if (tagHints) return `Your average increased ${abs} lb this week. You logged ${tagHints} — that often shows up as temporary water weight. Give it a few days before changing anything.${fluxNote}`;
    return `Your average is up ${abs} lb this week. This may be normal fluctuation — keep logging and reassess next week.${fluxNote}`;
  } else {
    return `Your weight is mostly stable this week. This may be maintenance, or you may need more time before making changes.${fluxNote}`;
  }
}

// ---------- coaching insights ----------
function quickInsight(entries, weekStartDay){
  const sorted = entriesSortedAsc(entries);
  if (!sorted.length) return "Log today's weight to start seeing your trend.";
  const last = sorted[sorted.length-1];
  const r7 = rolling7(entries);
  const lastRoll = r7[r7.length-1];
  if (!lastRoll?.avg7) return "A few more entries and your 7-day average will become reliable.";
  const diff = last.weight - lastRoll.avg7;
  const flux = normalFluctuation(entries) || 1;
  if (Math.abs(diff) <= flux) {
    return `Today's weight is within your normal day-to-day range. Your weekly average is what matters.`;
  }
  if (diff > 0) return `Today is ${diff.toFixed(1)} lb above your 7-day average — likely water, sodium, or digestion. Not fat gain.`;
  return `Today is ${Math.abs(diff).toFixed(1)} lb below your 7-day average — likely a low-water day. The trend line is more reliable.`;
}

// ---------- attach to window ----------
Object.assign(window, {
  STORAGE_KEY, DEFAULT_SETTINGS, DEFAULT_GOAL, TAG_LIST,
  pad, isoDate, todayISO, parseISO, addDays, daysBetween, fmtShort, fmtLong, weekKey, weekRange,
  convertWeight, loadState, saveState, freshState,
  entriesSortedAsc, entriesInRange, lastNDays, average, rolling7, weeklyAverages, tagFrequency,
  normalFluctuation, trendStatus, weeklyRate, loggingStreak, bestStreak, loggingPercent,
  confidenceFromWeek, biggestSpike, weeklySummary, quickInsight,
});
