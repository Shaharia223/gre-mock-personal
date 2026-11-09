/* GRE Mock Lab — static single-page app. Data: window.DATA_TC / DATA_RC / DATA_QUANT */
(function(){
'use strict';
const TC = window.DATA_TC || [], RC = window.DATA_RC || [], QT = window.DATA_QUANT || [];
const $app = document.getElementById('app');
const L = i => String.fromCharCode(65+i);
const esc = s => String(s==null?'':s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const shuffle = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
const fmtTime = s => { s=Math.max(0,Math.round(s)); const m=Math.floor(s/60); return m+':'+String(s%60).padStart(2,'0'); };

/* ---------------- storage ---------------- */
const store = {
  get(k,d){ try{ const v=localStorage.getItem('gremock_'+k); return v==null?d:JSON.parse(v);}catch(e){return d;} },
  set(k,v){ try{ localStorage.setItem('gremock_'+k, JSON.stringify(v)); }catch(e){} },
  del(k){ try{ localStorage.removeItem('gremock_'+k);}catch(e){} }
};

/* ---------------- indexes ---------------- */
const TCmap = {}; TC.forEach(q => TCmap[q.id]=q);
const RCq = {}; const RCmap = {};
RC.forEach(p => { RCmap[p.id]=p; p.q.forEach((q,i) => RCq[q.id] = {q, p, i}); p.words = p.p.join(' ').split(/\s+/).length; });
const QTmap = {}; QT.forEach(q => QTmap[q.id]=q);
const WRITING_PROMPTS = [
  {i:'Discuss how far you agree or disagree with the statement, and explain your reasoning. Consider ways the statement might or might not hold true, and how those cases shape your position.', p:'Governments should put more funding into preserving the natural environment than into preserving historic buildings.'},
  {i:'Discuss how far you agree or disagree with the statement, and explain your reasoning. Consider ways the statement might or might not hold true, and how those cases shape your position.', p:'The best way to understand a society is to study the people it considers its heroes.'},
  {i:'Discuss how far you agree or disagree with the statement, and explain your reasoning. Consider ways the statement might or might not hold true, and how those cases shape your position.', p:'Most important discoveries come from chance, not from careful planning.'},
  {i:'Discuss how far you agree or disagree with the statement, and explain your reasoning. Consider ways the statement might or might not hold true, and how those cases shape your position.', p:'Universities should require every student to take courses outside their major field of study.'},
  {i:'Discuss how far you agree or disagree with the statement, and explain your reasoning. Consider ways the statement might or might not hold true, and how those cases shape your position.', p:'People who hold public office should be judged mainly by their results, not by their personal conduct.'},
  {i:'Discuss how far you agree or disagree with the statement, and explain your reasoning. Consider ways the statement might or might not hold true, and how those cases shape your position.', p:'Technology has made people less able to think for themselves.'},
  {i:'Discuss how far you agree or disagree with the statement, and explain your reasoning. Consider ways the statement might or might not hold true, and how those cases shape your position.', p:'A nation’s greatness is best measured by how it treats its weakest members.'},
  {i:'Discuss how far you agree or disagree with the statement, and explain your reasoning. Consider ways the statement might or might not hold true, and how those cases shape your position.', p:'Competition does more than cooperation to bring out the best in people.'},
  {i:'Discuss how far you agree or disagree with the statement, and explain your reasoning. Consider ways the statement might or might not hold true, and how those cases shape your position.', p:'The arts should get public funding even when most citizens never take part in them.'},
  {i:'Discuss how far you agree or disagree with the statement, and explain your reasoning. Consider ways the statement might or might not hold true, and how those cases shape your position.', p:'Leaders are made by circumstances, not by their own qualities.'},
  {i:'Discuss how far you agree or disagree with the statement, and explain your reasoning. Consider ways the statement might or might not hold true, and how those cases shape your position.', p:'People learn more from failure than from success.'},
  {i:'Discuss how far you agree or disagree with the statement, and explain your reasoning. Consider ways the statement might or might not hold true, and how those cases shape your position.', p:'Scientists should be held responsible for how others use their discoveries.'},
  {i:'Discuss how far you agree or disagree with the recommendation. Describe specific situations where following it would or would not be helpful.', p:'Schools should stop giving grades and give detailed written feedback instead.'},
  {i:'Discuss how far you agree or disagree with the recommendation. Describe specific situations where following it would or would not be helpful.', p:'Cities should ban private cars from their central districts.'},
  {i:'Discuss how far you agree or disagree with the recommendation. Describe specific situations where following it would or would not be helpful.', p:'Young people should be encouraged to take a year of work or service before starting university.'},
  {i:'Discuss how far you agree or disagree with the recommendation. Describe specific situations where following it would or would not be helpful.', p:'Governments should not fund research whose practical uses can’t be identified in advance.'},
  {i:'Discuss how far you agree or disagree with the recommendation. Describe specific situations where following it would or would not be helpful.', p:'Companies should be required to make their employees’ salaries public.'},
  {i:'Discuss how far you agree or disagree with the recommendation. Describe specific situations where following it would or would not be helpful.', p:'Students should be taught to question established authorities rather than to respect them.'},
  {i:'Discuss how far you agree or disagree with the recommendation. Describe specific situations where following it would or would not be helpful.', p:'Every citizen should be required to vote in national elections.'},
  {i:'Discuss how far you agree or disagree with the recommendation. Describe specific situations where following it would or would not be helpful.', p:'Museums should give back cultural artifacts to the countries those artifacts came from.'},
  {i:'Discuss how far you agree or disagree with the claim. Address the strongest counterarguments.', p:'Specialists add more to society than generalists do.'},
  {i:'Discuss how far you agree or disagree with the claim. Address the strongest counterarguments.', p:'Popular opinion is a poor guide to what is true.'},
  {i:'Discuss how far you agree or disagree with the claim. Address the strongest counterarguments.', p:'The main goal of education should be to prepare students for jobs.'},
  {i:'Discuss how far you agree or disagree with the claim. Address the strongest counterarguments.', p:'Rules exist to be broken, because progress depends on defying convention.'},
  {i:'Discuss how far you agree or disagree with the claim. Address the strongest counterarguments.', p:'Studying history mostly teaches us that people don’t learn from history.'},
  {i:'Discuss how far you agree or disagree with the claim. Address the strongest counterarguments.', p:'A person’s character is shown more by small daily actions than by rare dramatic choices.'},
  {i:'Discuss how far you agree or disagree with the claim. Address the strongest counterarguments.', p:'Too much access to information has made people less informed.'},
  {i:'Discuss how far you agree or disagree with the claim. Address the strongest counterarguments.', p:'Creativity can’t be taught. It can only be encouraged.'},
  {i:'Discuss which of the two views comes closer to your own, and explain your reasoning. Address both views.', p:'Some people think governments should focus on solving immediate problems. Others think long-term planning should come first, even at the expense of present needs.'},
  {i:'Discuss which of the two views comes closer to your own, and explain your reasoning. Address both views.', p:'Some argue that people should pick a career based on passion. Others argue that practical concerns, like income and stability, should decide.'},
  {i:'Discuss which of the two views comes closer to your own, and explain your reasoning. Address both views.', p:'Some believe that a society progresses most through individual achievement. Others believe collective effort matters more.'},
  {i:'Discuss which of the two views comes closer to your own, and explain your reasoning. Address both views.', p:'Some say children should be shielded from difficult realities. Others say they should face those realities early.'},
  {i:'Discuss which of the two views comes closer to your own, and explain your reasoning. Address both views.', p:'Some think the media should report what the public wants to know. Others think it should report what the public needs to know.'},
  {i:'Discuss how far you agree or disagree with the claim and the reason given for it.', p:'Claim: Large corporations should pay for public infrastructure projects. Reason: Corporations benefit more from infrastructure than individual citizens do.'},
  {i:'Discuss how far you agree or disagree with the claim and the reason given for it.', p:'Claim: Teachers’ pay should depend on their students’ performance. Reason: Rewarding results is the most reliable way to improve any profession.'},
  {i:'Discuss how far you agree or disagree with the claim and the reason given for it.', p:'Claim: Researchers should have to publish all their data openly. Reason: Science can only make progress when its results can be checked by anyone.'},
  {i:'Discuss how far you agree or disagree with the claim and the reason given for it.', p:'Claim: Societies should value tradition over innovation. Reason: Traditions carry wisdom that has been tested over generations.'},
  {i:'Discuss how far you agree or disagree with the policy. Consider its likely consequences and how they shape your position.', p:'Countries should limit how much of their farmland can be owned by foreign investors.'},
  {i:'Discuss how far you agree or disagree with the policy. Consider its likely consequences and how they shape your position.', p:'Universities should admit students based only on standardized test scores.'},
  {i:'Discuss how far you agree or disagree with the policy. Consider its likely consequences and how they shape your position.', p:'Public libraries should replace most of their printed books with digital resources.'},
  {i:'Discuss how far you agree or disagree with the policy. Consider its likely consequences and how they shape your position.', p:'Engineering projects that affect a community should need that community’s approval before they start.'},
  {i:'Discuss how far you agree or disagree with the policy. Consider its likely consequences and how they shape your position.', p:'Governments should restrict advertising aimed at children.'}
];

function sentences(par){ return par.split(/(?<=[.!?]["”’)]?)\s+(?=["“(]?[A-Z])/).filter(s=>s.trim()); }

/* An item = {k:'tc'|'rc'|'qt', id} */
function itemInfo(it){
  if(it.k==='tc'){ const q=TCmap[it.id]; return {q, measure:'Verbal', type: q.t==='SE'?'Sentence Equivalence':'Text Completion ('+q.b+' blank'+(q.b>1?'s':'')+')'}; }
  if(it.k==='rc'){ const r=RCq[it.id]; return {q:r.q, p:r.p, measure:'Verbal', type: r.p.q.length===1 && r.p.words<160 ? 'Reading Comprehension (short/argument)':'Reading Comprehension'}; }
  const q=QTmap[it.id]; return {q, measure:'Quant', type: ({qc:'Quantitative Comparison',mc:'Multiple Choice',multi:'Multiple Choice (select all)',num:'Numeric Entry',frac:'Numeric Entry (fraction)'})[q.t]};
}
function correctAnswer(it){
  const {q}=itemInfo(it);
  return q.a;
}
function numVal(s){
  if(s==null) return NaN; s=String(s).replace(/,/g,'').trim();
  if(!s) return NaN;
  if(s.includes('/')){ const [a,b]=s.split('/'); return parseFloat(a)/parseFloat(b); }
  return parseFloat(s);
}
function isCorrect(it, r){
  if(r==null || r==='' ) return false;
  const {q}=itemInfo(it);
  if(it.k==='rc' && q.t==='select') return Array.isArray(r) && r[0]===q.a[0] && r[1]===q.a[1];
  if(it.k==='qt' && (q.t==='num' || q.t==='frac')){
    let v;
    if(q.t==='frac'){ if(!r || !r.n || !r.d) return false; v=numVal(r.n)/numVal(r.d); }
    else v=numVal(r);
    const a=numVal(q.a);
    return isFinite(v) && Math.abs(v-a) <= 1e-9*Math.max(1,Math.abs(a));
  }
  const norm = s => String(s).replace(/[^A-J]/g,'').split('').sort().join('');
  return norm(r)===norm(q.a);
}
function answered(it,r){
  if(r==null||r==='') return false;
  const {q}=itemInfo(it);
  if(it.k==='tc') return String(r).replace(/[^A-I]/g,'').length === (q.t==='SE'?2:q.b);
  if(it.k==='qt' && q.t==='frac') return !!(r.n && r.d);
  return true;
}
function answerText(it, r){
  const {q}=itemInfo(it);
  if(r==null||r==='') return '—';
  if(it.k==='rc' && q.t==='select'){ const p=itemInfo(it).p; const s=sentences(p.p[r[0]])[r[1]]; return '“'+(s||'').slice(0,90)+'…”'; }
  if(it.k==='qt' && q.t==='frac') return r.n+'/'+r.d;
  return String(r);
}
function correctText(it){
  const {q,p}=itemInfo(it);
  if(it.k==='rc' && q.t==='select'){ const s=sentences(p.p[q.a[0]])[q.a[1]]; return '“'+(s||'')+'” (paragraph '+(q.a[0]+1)+', sentence '+(q.a[1]+1)+')'; }
  if(it.k==='tc'){
    // show words too
    const words = q.a.split('').map(c => q.o[c.charCodeAt(0)-65]);
    return q.a+'  ('+words.join(' · ')+')';
  }
  return q.a;
}

/* ---------------- question pickers ---------------- */
function seenSet(){ return new Set(store.get('seen',[])); }
function markSeen(items){ const s=seenSet(); items.forEach(it=>s.add(it.k+':'+it.id)); store.set('seen',[...s]); }
function pickPreferUnseen(pool, n, key, seen){
  const un = shuffle(pool.filter(x=>!seen.has(key(x)))), se = shuffle(pool.filter(x=>seen.has(key(x))));
  return un.concat(se).slice(0,n);
}
function diffPool(level){ // weights per level for TC difficulty
  return level==='hard' ? ['h','h','m'] : level==='easy' ? ['e','e','m'] : ['e','m','m','h'];
}
function pickTC(n, filter, level, seen, used){
  const want = diffPool(level);
  const out=[];
  for(let i=0;i<n;i++){
    const d = want[Math.floor(Math.random()*want.length)];
    let pool = TC.filter(q=>filter(q) && q.d===d && !used.has(q.id));
    if(!pool.length) pool = TC.filter(q=>filter(q) && !used.has(q.id));
    const q = pickPreferUnseen(pool,1,q=>'tc:'+q.id,seen)[0];
    if(q){ used.add(q.id); out.push({k:'tc',id:q.id}); }
  }
  return out;
}
function pickRC(n, level, seen, usedP){
  // returns array of groups (each group = items from one passage)
  const groups=[]; let need=n;
  let pool = RC.filter(p=>!usedP.has(p.id));
  const lenOK = p => level==='hard' ? p.words>=170 : level==='easy' ? p.words<330 : true;
  // aim: at least one longer passage, plus short/argument ones
  let guard=0;
  while(need>0 && guard++<200){
    let cand = pool.filter(p=>!usedP.has(p.id) && p.q.length<=need && lenOK(p));
    if(!cand.length) cand = pool.filter(p=>!usedP.has(p.id) && p.q.length<=need);
    let take;
    if(cand.length){
      const prefer = need>=3 ? cand.filter(p=>p.q.length>=3) : cand;
      take = pickPreferUnseen(prefer.length?prefer:cand,1,p=>'rc:'+p.q[0].id,seen)[0];
    } else {
      const big = pool.filter(p=>!usedP.has(p.id) && p.q.length>need);
      take = pickPreferUnseen(big,1,p=>'rc:'+p.q[0].id,seen)[0];
    }
    if(!take) break;
    usedP.add(take.id);
    const qs = take.q.slice(0,need);
    groups.push(qs.map(q=>({k:'rc',id:q.id})));
    need -= qs.length;
  }
  return groups;
}
function buildVerbal(stage, level){
  const seen=seenSet(), used=new Set(), usedP=new Set(store.get('_tmpUsedP',[]));
  const n = stage===1 ? {b1:1,b2:1,b3:1,se:3,rc:6} : {b1:1,b2:2,b3:1,se:4,rc:7};
  const tcs = [].concat(
    pickTC(n.b1,q=>q.t==='TC'&&q.b===1,level,seen,used),
    pickTC(n.b2,q=>q.t==='TC'&&q.b===2,level,seen,used),
    pickTC(n.b3,q=>q.t==='TC'&&q.b===3,level,seen,used));
  const ses = pickTC(n.se,q=>q.t==='SE',level,seen,used);
  const rcs = pickRC(n.rc, level, seen, usedP);
  store.set('_tmpUsedP',[...usedP]);
  // ETS-like order: TC, RC group, SE, RC groups
  const out = tcs.slice();
  if(rcs[0]) out.push(...rcs[0]);
  out.push(...ses);
  rcs.slice(1).forEach(g=>out.push(...g));
  return out;
}
function quantPool(level){
  if(level==='hard') return QT.filter(q=>q.d==='Hard'||q.d==='Research'||q.part==='puzzle');
  if(level==='easy') return QT.filter(q=>q.d==='Medium'||q.part==='topic');
  return QT.filter(q=>q.part!=='puzzle');
}
function buildQuant(stage, level){
  const seen=seenSet(); const pool=quantPool(level); const used=new Set();
  const n = stage===1 ? {qc:4,mc:4,multi:2,num:2} : {qc:5,mc:5,multi:2,num:3};
  const take=(f,k)=>{
    let p=pool.filter(q=>f(q)&&!used.has(q.id)); if(p.length<k) p=QT.filter(q=>f(q)&&!used.has(q.id));
    const r=pickPreferUnseen(p,k,q=>'qt:'+q.id,seen); r.forEach(q=>used.add(q.id)); return r;
  };
  const qc=take(q=>q.t==='qc',n.qc);
  const rest=shuffle([].concat(take(q=>q.t==='mc',n.mc),take(q=>q.t==='multi',n.multi),take(q=>q.t==='num'||q.t==='frac',n.num)));
  return qc.concat(rest).map(q=>({k:'qt',id:q.id}));
}
const SPEC = {
  V1:{name:'Verbal Reasoning — Section 1',measure:'Verbal',time:18*60,stage:1},
  V2:{name:'Verbal Reasoning — Section 2',measure:'Verbal',time:23*60,stage:2},
  Q1:{name:'Quantitative Reasoning — Section 1',measure:'Quant',time:21*60,stage:1},
  Q2:{name:'Quantitative Reasoning — Section 2',measure:'Quant',time:26*60,stage:2},
};
function makeSection(code, level){
  const s=SPEC[code];
  const items = s.measure==='Verbal' ? buildVerbal(s.stage, level||'mid') : buildQuant(s.stage, level||'mid');
  return {code, name:s.name, measure:s.measure, time:s.time, left:s.time, items, resp:{}, marked:{}, level:level||'mid', done:false};
}

/* ---------------- test state ---------------- */
let T = null; // current test
let timerId = null;
function saveT(){ if(T) store.set('current', T); }

function startMock(kind){
  store.set('_tmpUsedP',[]);
  let plan;
  if(kind==='full') plan = Math.random()<.5 ? ['V1','Q1','V2','Q2'] : ['Q1','V1','Q2','V2'];
  else if(kind==='verbal') plan=['V1','V2']; else plan=['Q1','Q2'];
  T = {id:Date.now(), title: kind==='full'?'Full GRE Mock Test':kind==='verbal'?'Verbal Mock (2 sections)':'Quant Mock (2 sections)',
       mode:'test', kind, plan, sections:[], cur:0, idx:0, view:'q', started:Date.now()};
  T.sections.push(makeSection(plan[0]));
  T.sections[0]._start = Date.now();
  saveT(); renderTest(); startTimer();
}
function startSet(title, items, opts){
  // opts: {timed:bool, time:sec, learn:bool}
  T = {id:Date.now(), title, mode: opts.learn?'learn':'test', kind:'set', plan:['S'], cur:0, idx:0, view:'q', started:Date.now(),
       sections:[{code:'S', name:title, measure: items[0] && items[0].k==='qt'?'Quant':'Verbal', time: opts.timed?opts.time:0, left: opts.timed?opts.time:0, items, resp:{}, marked:{}, checked:{}, done:false}]};
  saveT(); renderTest(); if(opts.timed) startTimer();
}
function startWriting(){
  const prompt = WRITING_PROMPTS[Math.floor(Math.random()*WRITING_PROMPTS.length)];
  T = {id:Date.now(), title:'GRE Writing Practice', mode:'writing', kind:'writing', plan:[],
       sections:[], cur:0, idx:0, view:'q', started:Date.now(), prompt:prompt.p, instruction:prompt.i,
       writingText:'', time:30*60, left:30*60};
  saveT(); renderWriting(); startTimer();
}
function sec(){ return T.sections[T.cur]; }

function startTimer(){
  stopTimer();
  let last=Date.now();
  timerId = setInterval(()=>{
    if(!T || T.view==='done') return;
    if(T.kind==='writing'){
      const now=Date.now(); T.left -= (now-last)/1000; last=now;
      const el=document.getElementById('timer');
      if(el){ el.textContent=fmtTime(T.left); el.classList.toggle('low', T.left<300); }
      if(T.left<=0){ T.left=0; saveT(); alert('Time is up. Your writing has been saved.'); finishWriting(); }
      else if(Math.round(T.left)%5===0) saveT();
      return;
    }
    if(!sec() || !sec().time) return;
    const now=Date.now(); sec().left -= (now-last)/1000; last=now;
    const el=document.getElementById('timer');
    if(el){ el.textContent=fmtTime(sec().left); el.classList.toggle('low', sec().left<300); }
    if(sec().left<=0){ sec().left=0; saveT(); alert('Time is up for this section.'); endSection(); }
    else if(Math.round(sec().left)%5===0) saveT();
  }, 500);
}
function stopTimer(){ if(timerId) clearInterval(timerId); timerId=null; }

function endSection(){
  const s=sec(); s.done=true; s.correct = s.items.filter(it=>isCorrect(it,s.resp[it.k+':'+it.id])).length;
  markSeen(s.items);
  if(T.kind!=='set' && T.cur < T.plan.length-1){
    const nextCode = T.plan[T.cur+1];
    let level='mid';
    if(SPEC[nextCode].stage===2){
      const first = T.sections.find(x=>SPEC[x.code].measure===SPEC[nextCode].measure && SPEC[x.code].stage===1);
      level = first && first.correct >= 7 ? 'hard' : 'easy';
    }
    T.sections.push(makeSection(nextCode, level));
    T.cur++; T.idx=0; T.view='break'; saveT(); renderTest(); return;
  }
  finishTest();
}
function finishTest(){
  stopTimer(); hideCalc();
  T.view='done'; T.finished=Date.now();
  const res = summarize(T);
  const hist = store.get('history',[]);
  hist.unshift({id:T.id, title:T.title, date:T.finished, mode:T.mode, scores:res.scores, raw:res.raw, total:res.total, sections:T.sections.map(s=>({code:s.code,name:s.name,items:s.items,resp:s.resp,level:s.level}))});
  store.set('history', hist.slice(0,60));
  // mistakes notebook
  const mist = store.get('mistakes',{});
  T.sections.forEach(s=>s.items.forEach(it=>{ const key=it.k+':'+it.id; if(isCorrect(it,s.resp[key])) { if(mist[key]) mist[key].right=(mist[key].right||0)+1; } else mist[key]={k:it.k,id:it.id,t:Date.now(),right:0}; }));
  store.set('mistakes', mist);
  // practice-set progress
  if(T.setKey){ const prog=store.get('progress',{}); prog[T.setKey]={c:res.raw.all,n:res.total,t:Date.now()}; store.set('progress',prog); }
  store.del('current');
  location.hash='#result/'+T.id;
}
function estScore(c1,n1,c2,n2,level){
  const p=(c1+c2)/(n1+n2);
  if(level==='hard') return Math.round(150 + 20*Math.pow(p,1.15));
  return Math.min(158, Math.round(130 + 30*p));
}
function summarize(t){
  const scores={}, raw={all:0}; let total=0;
  ['Verbal','Quant'].forEach(m=>{
    const ss=t.sections.filter(s=>s.measure===m && s.code!=='S');
    if(ss.length===2){
      const c=ss.map(s=>s.items.filter(it=>isCorrect(it,s.resp[it.k+':'+it.id])).length);
      scores[m]=estScore(c[0],ss[0].items.length,c[1],ss[1].items.length,ss[1].level);
    }
  });
  t.sections.forEach(s=>{ const c=s.items.filter(it=>isCorrect(it,s.resp[it.k+':'+it.id])).length; raw[s.code]=c; raw.all+=c; total+=s.items.length; });
  return {scores, raw, total};
}

/* ---------------- rendering: test ---------------- */
function curItem(){ return sec().items[T.idx]; }
function rkey(it){ return it.k+':'+it.id; }

function renderWriting(){
  if(T.view==='done') return renderWritingDone();
  $app.innerHTML=`<div class="shell">
    <div class="bar"><div class="ttl">${esc(T.title)}</div>
      <button id="w-finish">Finish writing</button><button id="w-quit" title="Save and exit to home">Exit</button>
    </div>
    <div class="sub"><span>Analytical Writing · Issue task</span>
      <span>Time left: <span id="timer" class="timer ${T.left<300?'low':''}">${fmtTime(T.left)}</span></span></div>
    <main class="writing-stage">
      <div class="writing-prompt"><div class="dir">${esc(T.instruction)}</div>
        <h2>${esc(T.prompt)}</h2>
        <p class="small muted">Plan your response, develop your position, and address possible objections. This practice is not graded.</p>
      </div>
      <label class="sr-only" for="writing-answer">Your essay</label>
      <textarea id="writing-answer" class="writing-answer" spellcheck="true" placeholder="Begin writing here..."></textarea>
      <div class="writing-meta"><span id="word-count">0 words</span><span class="muted small">Your response is saved automatically.</span></div>
    </main>
  </div>`;
  const answer=document.getElementById('writing-answer');
  answer.value=T.writingText||'';
  const update=()=>{ T.writingText=answer.value; document.getElementById('word-count').textContent=wordCount(answer.value)+' words'; saveT(); };
  answer.oninput=update; update(); answer.focus();
  document.getElementById('w-finish').onclick=()=>{ if(confirm('Finish this writing practice? You can copy your response on the next screen.')) finishWriting(); };
  document.getElementById('w-quit').onclick=()=>{ saveT(); stopTimer(); location.hash='#home'; render(); };
}
function wordCount(text){ const trimmed=String(text||'').trim(); return trimmed?trimmed.split(/\s+/).length:0; }
function renderWritingDone(){
  $app.innerHTML=`<div class="wrap"><div class="top"><div class="logo">GRE Mock Lab</div><button class="btn sec sm" id="w-home">← Home</button></div>
    <h2 style="margin-top:12px">Writing practice complete</h2>
    <p class="muted">No score or marking is provided. Copy your response and submit it wherever you want feedback.</p>
    <div class="writing-prompt"><b>Prompt:</b> ${esc(T.prompt)}</div>
    <textarea id="writing-final" class="writing-answer writing-final" readonly></textarea>
    <div class="writing-meta"><span>${wordCount(T.writingText)} words</span><button class="btn" id="w-copy">Copy response</button></div>
  </div>`;
  const final=document.getElementById('writing-final');
  final.value=T.writingText||'';
  document.getElementById('w-home').onclick=()=>{ location.hash='#home'; render(); };
  document.getElementById('w-copy').onclick=async()=>{
    const text=T.writingText||'';
    try{
      if(navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else { final.focus(); final.select(); if(!document.execCommand('copy')) throw new Error('Copy command failed'); }
      alert('Response copied to clipboard.');
    }catch(err){ alert('Could not copy automatically. Select the response and copy it manually.'); }
  };
}
function finishWriting(){
  stopTimer(); T.left=Math.max(0,T.left); T.view='done'; store.del('current'); renderWritingDone();
}

function renderTest(){
  const s=sec();
  if(T.view==='break'){
    $app.innerHTML = `<div class="shell"><div class="bar"><div class="ttl">${esc(T.title)}</div></div>
      <div class="review"><div class="card"><h3>Section complete</h3>
      <p>Next: <b>${esc(s.name)}</b> — ${s.items.length} questions, ${Math.round(s.time/60)} minutes.</p>
      <p class="small muted">On the real GRE the second section of each measure adapts to how you did on the first. This mock does the same: your next ${s.measure} section is set to <b>${s.level==='hard'?'harder':'easier'}</b> difficulty based on your first ${s.measure} section${s.level===undefined?'':''}.</p>
      <button class="btn" id="go">Begin section</button></div></div></div>`;
    if(SPEC[s.code].stage===1){ $app.querySelector('p.small').textContent='Take a short breather if you need one.'; }
    document.getElementById('go').onclick=()=>{ T.view='q'; s._start=Date.now(); saveT(); renderTest(); startTimer(); };
    return;
  }

  if(T.view==='review') return renderReview();
  const it=curItem(); const info=itemInfo(it); const r=s.resp[rkey(it)];
  const learn = T.mode==='learn'; const checked = learn && s.checked && s.checked[rkey(it)];
  const isQuant = it.k==='qt';
  const split = it.k==='rc';
  const secLabel = T.kind==='set' ? '' : `Section ${T.cur+1} of ${T.plan.length} · `;
  $app.innerHTML = `<div class="shell">
    <div class="bar">
      <div class="ttl">${esc(T.title)}</div>
      ${!learn?`<button id="b-mark" class="${s.marked[rkey(it)]?'on':''}">${s.marked[rkey(it)]?'✓ Marked':'Mark'}</button>
      <button id="b-rev">Review</button>`:''}
      ${isQuant?'<button id="b-calc">Calculator</button>':''}
      <button id="b-back" ${T.idx===0?'disabled':''}>Back</button>
      <button id="b-next">${T.idx===s.items.length-1? (learn?'Finish':'Next') :'Next'}</button>
      <button id="b-quit" title="Save & exit to home">Exit</button>
    </div>
    <div class="sub"><span>${secLabel}Question ${T.idx+1} of ${s.items.length} · <span class="muted">${esc(info.type)}</span></span>
      ${s.time?`<span>Time left: <span id="timer" class="timer ${s.left<300?'low':''}">${fmtTime(s.left)}</span></span>`:'<span class="muted">Untimed</span>'}</div>
    <div class="stage ${split?'split':'single'}">${renderItem(it, r, checked)}</div>
  </div>`;
  bindItem(it);
  const g=id=>document.getElementById(id);
  if(g('b-mark')) g('b-mark').onclick=()=>{ s.marked[rkey(it)]=!s.marked[rkey(it)]; saveT(); renderTest(); };
  if(g('b-rev')) g('b-rev').onclick=()=>{ T.view='review'; renderTest(); };
  if(g('b-calc')) g('b-calc').onclick=toggleCalc;
  g('b-back').onclick=()=>{ if(T.idx>0){T.idx--; saveT(); renderTest();} };
  g('b-next').onclick=()=>{
    if(T.idx<s.items.length-1){ T.idx++; saveT(); renderTest(); }
    else if(learn){ if(confirm('Finish this practice set and see your results?')) endSection(); }
    else { T.view='review'; renderTest(); }
  };
  g('b-quit').onclick=()=>{ saveT(); stopTimer(); hideCalc(); location.hash='#home'; render(); };
  if(!isQuant) hideCalc();
}

function blanksHTML(stem){
  let i=0; const roman=['i','ii','iii'];
  return esc(stem).replace(/\((i{1,3})\)\s*_{2,}|_{2,}/g, (m,g)=>`<span class="blank">${g?'('+g+')':''}&nbsp;</span>`);
}
function renderItem(it, r, checked){
  const {q,p}=itemInfo(it);
  let html='';
  const fb = checked ? feedbackHTML(it, r) : '';
  if(it.k==='tc'){
    if(q.t==='SE'){
      const sel = String(r||'');
      html = `<div class="pane"><div class="dir">Select the <b>two</b> answer choices that, when used to complete the sentence, fit the meaning of the sentence as a whole and produce completed sentences that are alike in meaning.</div>
        <div class="stem">${blanksHTML(q.s)}</div><div class="opts">${q.o.map((o,i)=>{
          const c=L(i); let cls='opt sq'+(sel.includes(c)?' sel':'');
          if(checked){ if(q.a.includes(c)) cls+=' right'; else if(sel.includes(c)) cls+=' wrong'; }
          return `<button class="${cls}" data-c="${c}"><span class="mk"></span><span>${esc(o)}</span></button>`;}).join('')}</div>${fb}</div>`;
    } else if(q.b===1){
      const sel=String(r||'');
      html = `<div class="pane"><div class="dir">For each blank select one entry from the corresponding column of choices. Fill all blanks in the way that best completes the text.</div>
        <div class="stem">${blanksHTML(q.s)}</div><div class="opts">${q.o.map((o,i)=>{
          const c=L(i); let cls='opt'+(sel===c?' sel':'');
          if(checked){ if(q.a===c) cls+=' right'; else if(sel===c) cls+=' wrong'; }
          return `<button class="${cls}" data-c="${c}"><span class="mk"></span><span>${esc(o)}</span></button>`;}).join('')}</div>${fb}</div>`;
    } else {
      const sel=String(r||'');
      const cols=[];
      for(let b=0;b<q.b;b++){
        cols.push(`<div class="bcol"><h4>Blank (${['i','ii','iii'][b]})</h4>${[0,1,2].map(j=>{
          const idx=b*3+j, c=L(idx); let cls='bcell'+(sel.includes(c)?' sel':'');
          if(checked){ if(q.a.includes(c)) cls+=' right'; else if(sel.includes(c)) cls+=' wrong'; }
          return `<button class="${cls}" data-b="${b}" data-c="${c}">${esc(q.o[idx]||'')}</button>`;}).join('')}</div>`);
      }
      html = `<div class="pane"><div class="dir">For each blank select one entry from the corresponding column of choices. Fill all blanks in the way that best completes the text.</div>
        <div class="stem">${blanksHTML(q.s)}</div><div class="blanks">${cols.join('')}</div>${fb}</div>`;
    }
  } else if(it.k==='rc'){
    const isSel = q.t==='select';
    const pg = p.p.map((par,pi)=>`<p><span class="pnum">${p.p.length>1?'¶'+(pi+1):''}</span>${
      isSel ? sentences(par).map((s,si)=>{
        let cls='sent'; if(r && r[0]===pi && r[1]===si) cls+=' sel'; if(checked && q.a[0]===pi && q.a[1]===si) cls+=' right';
        return `<span class="${cls}" data-p="${pi}" data-s="${si}">${esc(s)}</span>`; }).join(' ')
      : esc(par)}</p>`).join('');
    const nQ = p.q.length;
    const dir = isSel ? 'Click on the sentence in the passage that answers the question.'
      : q.t==='multi' ? 'Consider each of the choices separately and select <b>all</b> that apply.'
      : 'Select one answer choice.';
    let opts='';
    if(!isSel){
      const sel=String(r||''); const multi=q.t==='multi';
      opts = `<div class="opts">${q.o.map((o,i)=>{ const c=L(i); let cls='opt'+(multi?' sq':'')+(sel.includes(c)?' sel':'');
        if(checked){ if(q.a.includes(c)) cls+=' right'; else if(sel.includes(c)) cls+=' wrong'; }
        return `<button class="${cls}" data-c="${c}" data-multi="${multi?1:0}"><span class="mk">${multi?'':''}</span><span>${esc(o)}</span></button>`;}).join('')}</div>`;
    } else if(r){ opts = `<div class="muted small">Selected: “${esc(sentences(p.p[r[0]])[r[1]]||'')}”</div>`; }
    html = `<div class="pane left passage ${isSel?'selectable':''}"><div class="dir">Questions ${1}–${nQ} are based on this passage. (Passage ${p.id}${nQ>1?', question '+(RCq[it.id].i+1)+' of '+nQ:''})</div>${pg}
      <div class="small muted">Note: highlighted/boldface portions from the original print are not marked in this text.</div></div>
      <div class="pane right"><div class="dir">${dir}</div><div class="stem">${esc(q.s)}</div>${opts}${fb}</div>`;
  } else {
    const img = `<img class="qimg" src="qimg/${q.id}.webp" width="${q.w}" height="${q.h}" alt="Question">`;
    let body='';
    if(q.t==='qc'){
      const ch=['Quantity A is greater.','Quantity B is greater.','The two quantities are equal.','The relationship cannot be determined from the information given.'];
      const sel=String(r||'');
      body = `<div class="dir">Compare Quantity A and Quantity B, using additional information centered above the two quantities if such information is given.</div>${img}
        <div class="opts">${ch.map((o,i)=>{const c=L(i); let cls='opt'+(sel===c?' sel':''); if(checked){ if(q.a===c) cls+=' right'; else if(sel===c) cls+=' wrong'; }
        return `<button class="${cls}" data-c="${c}"><span class="mk">${c}</span><span>${o}</span></button>`;}).join('')}</div>`;
    } else if(q.t==='mc'||q.t==='multi'){
      const multi=q.t==='multi'; const k=q.k||5; const sel=String(r||'');
      body = `<div class="dir">${multi?'Select <b>all</b> the answer choices that apply.':'Select one answer choice.'}</div>${img}
        <div class="qc-cap">Answer choices in the figure, top to bottom = ${Array.from({length:k},(_,i)=>L(i)).join(', ')}.</div>
        <div class="opts" style="flex-direction:row;flex-wrap:wrap">${Array.from({length:k},(_,i)=>{const c=L(i); let cls='opt'+(multi?' sq':'')+(sel.includes(c)?' sel':'');
          if(checked){ if(q.a.includes(c)) cls+=' right'; else if(sel.includes(c)) cls+=' wrong'; }
          return `<button class="${cls}" style="width:auto" data-c="${c}" data-multi="${multi?1:0}"><span class="mk">${c}</span><span>Choice ${c}</span></button>`;}).join('')}</div>`;
    } else if(q.t==='num'){
      body = `<div class="dir">Enter your answer as an integer or a decimal in the answer box.</div>${img}
        <div class="ne"><input id="ne" class="inp" inputmode="decimal" autocomplete="off" value="${esc(r||'')}" ${checked?'disabled':''}></div>`;
    } else {
      const v=r||{};
      body = `<div class="dir">Enter your answer as a fraction. Fractions do not need to be reduced to lowest terms.</div>${img}
        <div class="ne"><div class="frac"><input id="fn" class="inp" inputmode="numeric" value="${esc(v.n||'')}" ${checked?'disabled':''}><hr><input id="fd" class="inp" inputmode="numeric" value="${esc(v.d||'')}" ${checked?'disabled':''}></div></div>`;
    }
    html = `<div class="pane">${body}${fb}</div>`;
  }
  if(T.mode==='learn' && !checked){
    html = html.replace(/<\/div>$/, `<div style="margin-top:18px"><button class="btn" id="b-check">Check answer</button> <button class="btn sec" id="b-show">Show answer</button></div></div>`);
  }
  return html;
}
function feedbackHTML(it, r){
  const ok=isCorrect(it,r); const {q}=itemInfo(it);
  const exp = q.x ? `<div class="exp"><b>Explanation:</b> ${esc(q.x)}</div>` : (it.k==='qt'?'<div class="exp muted">No written explanation available for this question in the source PDF.</div>':'');
  return `<div class="fb ${ok?'ok':'no'}"><b>${ok?'Correct':'Not quite'}.</b> Correct answer: <b>${esc(correctText(it))}</b>${!ok?` · Your answer: ${esc(answerText(it,r))}`:''}${exp}</div>`;
}
function setResp(it, val){
  const s=sec(); const k=rkey(it);
  if(val===''||val==null) delete s.resp[k]; else s.resp[k]=val;
  saveT();
}
function bindItem(it){
  const s=sec(); const {q}=itemInfo(it); const k=rkey(it);
  const checked = T.mode==='learn' && s.checked && s.checked[k];
  const root=$app;
  if(!checked){
    if(it.k==='tc'){
      if(q.t==='SE'){
        root.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{ let v=String(s.resp[k]||''); const c=b.dataset.c;
          v = v.includes(c) ? v.replace(c,'') : (v.length>=2 ? v : v+c); setResp(it, v.split('').sort().join('')); renderTest(); });
      } else if(q.b===1){
        root.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{ setResp(it,b.dataset.c); renderTest(); });
      } else {
        root.querySelectorAll('.bcell').forEach(b=>b.onclick=()=>{
          let v=String(s.resp[k]||''); const bi=+b.dataset.b; const lo=bi*3;
          v = v.split('').filter(c=>{const x=c.charCodeAt(0)-65; return x<lo||x>=lo+3;}).join('') + b.dataset.c;
          setResp(it, v.split('').sort().join('')); renderTest(); });
      }
    } else if(it.k==='rc'){
      root.querySelectorAll('.sent').forEach(sp=>sp.onclick=()=>{ if(q.t!=='select') return; setResp(it,[+sp.dataset.p,+sp.dataset.s]); renderTest(); });
      root.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
        if(b.dataset.multi==='1'){ let v=String(s.resp[k]||''); const c=b.dataset.c; v=v.includes(c)?v.replace(c,''):v+c; setResp(it,v.split('').sort().join('')); }
        else setResp(it,b.dataset.c);
        renderTest(); });
    } else {
      root.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
        if(b.dataset.multi==='1'){ let v=String(s.resp[k]||''); const c=b.dataset.c; v=v.includes(c)?v.replace(c,''):v+c; setResp(it,v.split('').sort().join('')); }
        else setResp(it,b.dataset.c);
        renderTest(); });
      const ne=document.getElementById('ne');
      if(ne){ lastInput=ne; ne.oninput=()=>{ ne.value=ne.value.replace(/[^0-9.\-]/g,''); setResp(it,ne.value); }; ne.onfocus=()=>{lastInput=ne;}; }
      const fn=document.getElementById('fn'), fd=document.getElementById('fd');
      if(fn){ lastInput=fn; const up=()=>{ fn.value=fn.value.replace(/[^0-9\-]/g,''); fd.value=fd.value.replace(/[^0-9\-]/g,''); setResp(it,(fn.value||fd.value)?{n:fn.value,d:fd.value}:''); };
        fn.oninput=up; fd.oninput=up; fn.onfocus=()=>{lastInput=fn;}; fd.onfocus=()=>{lastInput=fd;}; }
    }
  }
  const bc=document.getElementById('b-check'), bs=document.getElementById('b-show');
  if(bc) bc.onclick=()=>{ s.checked=s.checked||{}; s.checked[k]=true; saveT(); renderTest(); };
  if(bs) bs.onclick=()=>{ s.checked=s.checked||{}; s.checked[k]=true; saveT(); renderTest(); };
}

function renderReview(){
  const s=sec();
  const cells=s.items.map((it,i)=>{ const r=s.resp[rkey(it)]; const a=answered(it,r); const m=s.marked[rkey(it)];
    return `<button class="rq ${a?'':'na'} ${m?'mk':''}" data-i="${i}"><b>Question ${i+1}</b><span class="small ${a?'':'muted'}">${a?'Answered':'Not answered'}${m?' · Marked':''}</span></button>`; }).join('');
  const na=s.items.filter(it=>!answered(it,s.resp[rkey(it)])).length;
  $app.innerHTML=`<div class="shell"><div class="bar"><div class="ttl">${esc(T.title)} — Review</div>
     <button id="r-ret">Return to question</button></div>
    <div class="sub"><span>${esc(s.name)}</span>${s.time?`<span>Time left: <span id="timer" class="timer">${fmtTime(s.left)}</span></span>`:''}</div>
    <div class="review"><p class="muted">Click a question to go to it. ${na?`<b style="color:var(--bad)">${na} not answered.</b>`:'All questions answered.'}</p>
    <div class="rgrid">${cells}</div>
    <button class="btn" id="r-end">End section</button></div></div>`;
  $app.querySelectorAll('.rq').forEach(b=>b.onclick=()=>{ T.idx=+b.dataset.i; T.view='q'; saveT(); renderTest(); });
  document.getElementById('r-ret').onclick=()=>{ T.view='q'; renderTest(); };
  document.getElementById('r-end').onclick=()=>{ if(confirm(na?`You have ${na} unanswered question(s). End this section anyway?`:'End this section? You cannot return to it.')){ T.view='q'; endSection(); } };
}

/* ---------------- calculator ---------------- */
let lastInput=null;
const $calc=document.getElementById('calc');
const C={expr:'',cur:'',disp:'0',mem:0,fresh:false};
function calcHTML(){
  const keys=[['MR','MC','M+','(',')'],['7','8','9','÷','C'],['4','5','6','×','CE'],['1','2','3','−','√'],['0','.','±','+','=']];
  $calc.innerHTML=`<div class="ch" id="ch"><span>Calculator</span><button id="cx" aria-label="Close">×</button></div>
    <div class="disp"><div class="mem">${C.mem?'M':''}</div><div id="cd">${esc(C.disp)}</div></div>
    <div class="keys">${keys.flat().map(k=>`<button class="${/[0-9.]/.test(k)?'':'op'}" data-k="${k}">${k}</button>`).join('')}
    <button class="wide" data-k="T">Transfer Display</button></div>`;
  document.getElementById('cx').onclick=hideCalc;
  $calc.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>calcKey(b.dataset.k));
  drag();
}
function calcEval(e){
  const s=e.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-');
  if(!/^[0-9+\-*/().\s]*$/.test(s)) return NaN;
  try{ const v=Function('"use strict";return ('+(s||'0')+')')(); return v; }catch(err){ return NaN; }
}
function fmtNum(v){ if(!isFinite(v)) return 'Error'; const r=parseFloat(v.toPrecision(8)); return String(r); }
function calcKey(k){
  const show=v=>{ C.disp=v; };
  if(/^[0-9.]$/.test(k)){ if(C.fresh){ C.cur=''; C.fresh=false; } if(k==='.'&&C.cur.includes('.')) return; C.cur=(C.cur==='0'&&k!=='.'?'':C.cur)+k; if(C.cur==='.')C.cur='0.'; show(C.cur); }
  else if(['+','−','×','÷'].includes(k)){ let operand = C.cur!=='' ? C.cur : (C.expr==='' ? C.disp : ''); if(C.expr!=='' && C.cur==='' && /[+−×÷]$/.test(C.expr)) C.expr=C.expr.slice(0,-1);
    if(operand==='Error') operand='0'; C.expr+=operand+k; C.cur=''; C.fresh=false; }
  else if(k==='('){ C.expr+='('; C.cur=''; }
  else if(k===')'){ C.expr+=C.cur+')'; C.cur=''; show(fmtNum(calcEval(lastParen(C.expr)))); }
  else if(k==='='){ const v=calcEval(C.expr+C.cur); show(fmtNum(v)); C.expr=''; C.cur=''; C.fresh=true; }
  else if(k==='C'){ C.expr=''; C.cur=''; show('0'); C.fresh=false; }
  else if(k==='CE'){ C.cur=''; show('0'); }
  else if(k==='±'){ const base=C.cur!==''?C.cur:C.disp; const v=-(parseFloat(base)||0); C.cur=fmtNum(v); show(C.cur); C.fresh=true; }
  else if(k==='√'){ const base=C.cur!==''?C.cur:C.disp; const v=Math.sqrt(parseFloat(base)||0); C.cur=fmtNum(v); show(C.cur); C.fresh=true; }
  else if(k==='MR'){ C.cur=fmtNum(C.mem); show(C.cur); C.fresh=true; }
  else if(k==='MC'){ C.mem=0; }
  else if(k==='M+'){ C.mem+=parseFloat(C.disp)||0; C.fresh=true; }
  else if(k==='T'){ if(lastInput && document.body.contains(lastInput) && !lastInput.disabled){ lastInput.value=C.disp; lastInput.dispatchEvent(new Event('input')); } }
  const d=document.getElementById('cd'); if(d) d.textContent=C.disp.length>16?C.disp.slice(0,16):C.disp;
  const m=$calc.querySelector('.mem'); if(m) m.textContent=C.mem?'M':'';
}
function lastParen(e){ let d=0; for(let i=e.length-1;i>=0;i--){ if(e[i]===')')d++; if(e[i]==='('){d--; if(d===0) return e.slice(i);} } return e; }
function toggleCalc(){ if($calc.classList.contains('hidden')){ calcHTML(); $calc.classList.remove('hidden'); } else hideCalc(); }
function hideCalc(){ $calc.classList.add('hidden'); }
function drag(){
  const h=document.getElementById('ch'); let sx,sy,ox,oy;
  h.onpointerdown=e=>{ if(e.target.id==='cx')return; sx=e.clientX; sy=e.clientY; const r=$calc.getBoundingClientRect(); ox=r.left; oy=r.top; h.setPointerCapture(e.pointerId);
    h.onpointermove=ev=>{ $calc.style.left=Math.max(0,ox+ev.clientX-sx)+'px'; $calc.style.top=Math.max(0,oy+ev.clientY-sy)+'px'; $calc.style.right='auto'; $calc.style.bottom='auto'; };
    h.onpointerup=()=>{ h.onpointermove=null; }; };
}
document.addEventListener('keydown',e=>{
  if($calc.classList.contains('hidden')) return;
  if(document.activeElement && document.activeElement.tagName==='INPUT') return;
  const map={'*':'×','/':'÷','-':'−','+':'+','Enter':'=','=':'=','Escape':'C','Backspace':'CE','(':'(',')':')'};
  if(/^[0-9.]$/.test(e.key)) calcKey(e.key); else if(map[e.key]){ e.preventDefault(); calcKey(map[e.key]); }
});

/* ---------------- results page ---------------- */
function renderResult(id){
  const h=store.get('history',[]).find(x=>String(x.id)===String(id));
  if(!h){ location.hash='#home'; return; }
  const secs=h.sections;
  const byType={};
  secs.forEach(s=>s.items.forEach(it=>{ const t=itemInfo(it).type.replace(/ \(.*\)/,''); byType[t]=byType[t]||{c:0,n:0}; byType[t].n++; if(isCorrect(it,s.resp[rkey(it)])) byType[t].c++; }));
  const sc=Object.entries(h.scores||{});
  $app.innerHTML=`<div class="wrap"><div class="top"><div class="logo">GRE Mock Lab</div><button class="btn sec sm" onclick="location.hash='#home'">← Home</button></div>
    <h2 style="margin-top:12px">${esc(h.title)}</h2><div class="muted small">${new Date(h.date).toLocaleString()}</div>
    <div class="score">${sc.map(([m,v])=>`<div class="card"><div class="muted small">${m} (estimated)</div><div class="big">${v}</div><div class="small muted">scale 130–170</div></div>`).join('')}
      <div class="card"><div class="muted small">Raw score</div><div class="big">${h.raw.all}/${h.total}</div><div class="small muted">${Math.round(100*h.raw.all/Math.max(1,h.total))}% correct</div></div></div>
    ${sc.length?'<p class="small muted">Scaled scores are a rough estimate from your raw score and which second-section difficulty you reached. They are not official ETS conversions.</p>':''}
    <h2>By question type</h2><div class="bars">${Object.entries(byType).map(([t,v])=>`<div class="brow"><span>${esc(t)}</span><div class="btrack"><div class="bfill" style="width:${100*v.c/v.n}%"></div></div><span class="small">${v.c}/${v.n}</span></div>`).join('')}</div>
    ${secs.map(s=>`<h2>${esc(s.name)} <span class="tag">${s.code!=='S'&&SPEC[s.code].stage===2?(s.level==='hard'?'harder':'easier')+' section':''}</span></h2>
      ${s.items.map((it,i)=>{ const r=s.resp[rkey(it)]; const ok=isCorrect(it,r); const info=itemInfo(it); const a=answered(it,r);
        return `<details class="qrow" data-sec="${esc(s.code)}" data-i="${i}"><summary><span class="dot ${ok?'ok':a?'no':'sk'}"></span><b>Q${i+1}</b> <span class="tag">${esc(info.type)}</span>
          <span class="small muted" style="margin-left:auto">${ok?'Correct':a?'Incorrect':'Skipped'}</span></summary><div class="body"></div></details>`; }).join('')}`).join('')}
    <div class="row" style="margin-top:24px"><button class="btn" onclick="location.hash='#home'">Back to home</button></div></div>`;
  $app.querySelectorAll('details.qrow').forEach(d=>d.addEventListener('toggle',()=>{
    if(!d.open || d.dataset.f) return; d.dataset.f=1;
    const s=secs.find(x=>x.code===d.dataset.sec); const it=s.items[+d.dataset.i]; const r=s.resp[rkey(it)];
    d.querySelector('.body').innerHTML = staticItem(it, r);
  }));
}
function staticItem(it, r){
  const {q,p}=itemInfo(it); let top='';
  if(it.k==='rc') top=`<details><summary class="small" style="cursor:pointer;color:var(--brand)">Show passage ${p.id}</summary><div class="passage" style="margin-top:8px">${p.p.map(x=>`<p>${esc(x)}</p>`).join('')}</div></details><div class="stem" style="margin-top:10px">${esc(q.s)}</div>${q.o&&q.o.length?`<ol type="A" class="small">${q.o.map(o=>`<li>${esc(o)}</li>`).join('')}</ol>`:''}`;
  else if(it.k==='tc') top=`<div class="stem">${blanksHTML(q.s)}</div><ol type="A" class="small" style="columns:${q.b>1?q.b:1}">${q.o.map(o=>`<li>${esc(o)}</li>`).join('')}</ol>`;
  else top=`<img class="qimg" src="qimg/${q.id}.webp" loading="lazy" alt="Question">${q.t==='qc'?'<div class="small muted">A: Quantity A greater · B: Quantity B greater · C: equal · D: cannot be determined</div>':''}`;
  return top + feedbackHTML(it,r);
}

/* ---------------- home ---------------- */
let homeTab = 'mock';
function render(){
  const h=location.hash||'#home';
  if(h.startsWith('#result/')) { stopTimer(); return renderResult(h.split('/')[1]); }
  if(h==='#test' && T){ if(T.kind==='writing') renderWriting(); else renderTest(); return; }
  renderHome();
}
window.addEventListener('hashchange', render);

function renderHome(){
  stopTimer(); hideCalc();
  const cur=store.get('current',null);
  const hist=store.get('history',[]);
  const mist=Object.values(store.get('mistakes',{})).filter(m=>!m.right);
  const tabs=[['mock','Mock tests'],['verbal','Verbal practice'],['quant','Quant practice'],['drill','Custom drill'],['mist','Mistakes ('+mist.length+')'],['hist','History']];
  $app.innerHTML=`<div class="wrap">
    <div class="top"><div class="logo">GRE Mock Lab<small>KMF question bank</small></div></div>
    <div class="stat"><div><b>${TC.length}</b><span>TC / SE questions</span></div><div><b>${RC.length}</b><span>RC passages (${Object.keys(RCq).length} Qs)</span></div><div><b>${QT.length}</b><span>Quant questions</span></div><div><b>${hist.length}</b><span>tests taken</span></div></div>
    ${cur?`<div class="note row" style="justify-content:space-between;margin-bottom:12px"><span>You have an unfinished test: <b>${esc(cur.title)}</b></span><span class="row"><button class="btn sm" id="resume">Resume</button><button class="btn danger sm" id="discard">Discard</button></span></div>`:''}
    <div class="tabs">${tabs.map(([k,v])=>`<button class="tab ${homeTab===k?'on':''}" data-t="${k}">${v}</button>`).join('')}</div>
    <div id="tabc"></div></div>`;
  $app.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{ homeTab=b.dataset.t; renderHome(); });
  if(cur){
    document.getElementById('resume').onclick=()=>{ T=cur; location.hash='#test'; if(T.kind==='writing'){ renderWriting(); startTimer(); } else { renderTest(); if(T.view!=='break' && (sec().time)) startTimer(); } };
    document.getElementById('discard').onclick=()=>{ if(confirm('Discard the unfinished test?')){ store.del('current'); renderHome(); } };
  }
  const c=document.getElementById('tabc');
  ({mock:tabMock,verbal:tabVerbal,quant:tabQuant,drill:tabDrill,mist:tabMist,hist:tabHist})[homeTab](c);
}
function guardStart(fn){
  return ()=>{ if(store.get('current',null) && !confirm('Starting a new test will discard your unfinished one. Continue?')) return; store.del('current'); location.hash='#test'; fn(); };
}
function tabMock(c){
  c.innerHTML=`<div class="grid">
    <div class="card"><h3>Full GRE mock</h3><p>4 sections in the current shorter GRE format: Verbal 12 Q / 18 min + 15 Q / 23 min, Quant 12 Q / 21 min + 15 Q / 26 min. The second section of each measure adapts to your first. About 1 h 30 min.</p><button class="btn" id="m-full">Start full mock</button></div>
    <div class="card"><h3>Verbal-only mock</h3><p>Two adaptive Verbal sections (27 questions, 41 minutes) with TC, SE and RC in test proportions.</p><button class="btn" id="m-v">Start Verbal mock</button></div>
    <div class="card"><h3>Quant-only mock</h3><p>Two adaptive Quant sections (27 questions, 47 minutes) with an on-screen calculator.</p><button class="btn" id="m-q">Start Quant mock</button></div>
  <div class="card"><h3>Writing practice</h3><p>One original Issue-style prompt with the real 30-minute writing limit. Your essay is not graded here; copy it afterward for feedback elsewhere.</p><button class="btn" id="m-writing">Start writing practice</button></div>
  </div>
  <h2>How it works</h2>
  <ul class="muted small" style="max-width:760px">
    <li>Mocks prefer questions you haven't seen yet, so repeated mocks keep drawing fresh material.</li>
    <li>Use <b>Mark</b> and <b>Review</b> to flag questions and jump around within a section, like the real test.</li>
    <li>Your progress is saved in this browser. You can close the tab and resume later.</li>
    <li>Writing practice uses original Issue-style prompts and is separate from the scored mock sections.</li>
  </ul>`;
  c.querySelector('#m-full').onclick=guardStart(()=>startMock('full'));
  c.querySelector('#m-v').onclick=guardStart(()=>startMock('verbal'));
  c.querySelector('#m-q').onclick=guardStart(()=>startMock('quant'));
  c.querySelector('#m-writing').onclick=guardStart(startWriting);
}
function setModal(title, items, timeSec, setKey){
  const m=document.createElement('div'); m.className='modal';
  m.innerHTML=`<div class="card"><h3>${esc(title)}</h3><p>${items.length} questions. Choose how to practise:</p>
    <div class="row"><button class="btn" data-m="timed">Timed (${Math.round(timeSec/60)} min)</button><button class="btn sec" data-m="learn">Learn mode (instant answers)</button><button class="btn sec" data-m="x">Cancel</button></div></div>`;
  document.body.appendChild(m);
  m.onclick=e=>{ const b=e.target.closest('button'); if(e.target===m||(b&&b.dataset.m==='x')){ m.remove(); return; } if(!b) return;
    m.remove(); if(store.get('current',null) && !confirm('Starting this will discard your unfinished test. Continue?')) return;
    store.del('current'); location.hash='#test';
    startSet(title, items, {timed:b.dataset.m==='timed', time:timeSec, learn:b.dataset.m==='learn'}); T.setKey=setKey; saveT(); };
}
function tabVerbal(c){
  const prog=store.get('progress',{});
  const sets=[...new Set(TC.map(q=>q.set))];
  const dOf=s=>TC.find(q=>q.set===s).d;
  c.innerHTML=`<h2 style="margin-top:0">Text Completion & Sentence Equivalence — KMF sets</h2>
    <div class="legend"><span><i style="background:#7cc39a"></i>easy</span><span><i style="background:#e3b341"></i>medium</span><span><i style="background:#d9645b"></i>hard</span><span><i style="background:var(--ok-bg);border:1px solid #9fd3b4"></i>completed</span></div>
    <div class="chips">${sets.map(s=>{const p=prog['tc'+s]; return `<button class="chip ${dOf(s)} ${p?'done':''}" data-s="${s}" title="${p?p.c+'/'+p.n:''}">${s}</button>`;}).join('')}</div>
    <h2>Reading Comprehension — KMF passages</h2>
    <div class="row" style="margin-bottom:10px"><button class="btn sm" id="rc-rand">Random set of 10 RC questions</button>
      <label class="small muted">Go to passage # <input class="inp" id="rc-n" type="number" min="1" max="350" style="width:90px"></label><button class="btn sec sm" id="rc-go">Open</button></div>
    <div class="chips">${RC.map(p=>{const k='rc'+p.id; const pr=prog[k]; return `<button class="chip ${pr?'done':''}" data-p="${p.id}" title="${p.q.length} question(s)">${p.id}</button>`;}).join('')}</div>`;
  c.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{ const s=+b.dataset.s; const items=TC.filter(q=>q.set===s).sort((a,b)=>a.n-b.n).map(q=>({k:'tc',id:q.id})); setModal('KMF TC/SE Set '+s, items, items.length*90, 'tc'+s); });
  const openP=id=>{ const p=RCmap[id]; if(!p) return alert('That passage is not available.'); const items=p.q.map(q=>({k:'rc',id:q.id})); setModal('KMF RC Passage '+id, items, Math.max(2,items.length*2)*60, 'rc'+id); };
  c.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>openP(+b.dataset.p));
  c.querySelector('#rc-go').onclick=()=>openP(+c.querySelector('#rc-n').value);
  c.querySelector('#rc-rand').onclick=()=>{ const g=pickRC(10,'mid',seenSet(),new Set()); setModal('Random RC set', g.flat(), 10*105, null); };
}
function tabQuant(c){
  const prog=store.get('progress',{});
  const groups={}; QT.forEach(q=>{ const k=q.part+'|'+q.sec; (groups[k]=groups[k]||{part:q.part,sec:q.sec,lab:q.lab,d:q.d,items:[]}).items.push(q); });
  const G=Object.values(groups);
  const chip=g=>{ const key='qt'+g.part+g.sec; const p=prog[key]; const cls=g.d==='Hard'?'h':g.d==='Medium'?'m':g.d==='Research'?'h':''; return `<button class="chip ${cls} ${p?'done':''}" data-g="${esc(g.part+'|'+g.sec)}" title="${esc(g.lab)} · ${g.items.length} Q">${g.part==='topic'?esc(g.lab):esc(g.sec)}</button>`; };
  c.innerHTML=`<h2 style="margin-top:0">Math Sprint Practice — 20-question KMF sections</h2>
    <div class="legend"><span><i style="background:#e3b341"></i>medium</span><span><i style="background:#d9645b"></i>hard / research</span></div>
    <div class="chips">${G.filter(g=>g.part==='sprint').map(chip).join('')}</div>
    <h2>Latest 170 hard puzzles</h2><div class="chips">${G.filter(g=>g.part==='puzzle').map(chip).join('')}</div>
    <h2>Special exercises by test point</h2><div class="chips" style="flex-direction:column;align-items:stretch">${G.filter(g=>g.part==='topic').map(chip).join('')}</div>`;
  c.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{ const g=groups[b.dataset.g]; const items=g.items.sort((a,b)=>a.n-b.n).map(q=>({k:'qt',id:q.id}));
    const title=g.part==='sprint'?`KMF Quant Sprint Section ${g.sec} (${g.d})`:g.part==='puzzle'?`KMF 170 Puzzles — Section ${g.sec}`:`Quant topic ${g.lab}`;
    setModal(title, items, items.length*105, 'qt'+g.part+g.sec); });
  c.querySelectorAll('.chips[style] .chip').forEach(b=>{b.style.textAlign='left';});
}
function tabDrill(c){
  c.innerHTML=`<div class="card" style="max-width:560px"><h3>Build a custom drill</h3>
    <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin:10px 0 14px">
      <label>Question type</label><select id="d-t">
        <option value="tc1">TC — 1 blank</option><option value="tc2">TC — 2 blanks</option><option value="tc3">TC — 3 blanks</option><option value="se">Sentence Equivalence</option>
        <option value="tcall">All TC + SE mixed</option><option value="rc">Reading Comprehension</option>
        <option value="qc">Quant — Quantitative Comparison</option><option value="mc">Quant — Multiple Choice</option><option value="multi">Quant — Select all that apply</option><option value="num">Quant — Numeric Entry</option><option value="qall">Quant — mixed</option></select>
      <label>Difficulty</label><select id="d-d"><option value="">Any</option><option value="e">Easy</option><option value="m">Medium</option><option value="h">Hard</option></select>
      <label>Questions</label><input id="d-n" class="inp" type="number" value="10" min="1" max="60">
      <label>Unseen only</label><select id="d-u"><option value="1">Prefer unseen</option><option value="0">Any</option></select>
    </div><button class="btn" id="d-go">Start drill</button><p class="small muted" style="margin-top:10px">Quant difficulty uses KMF's Medium/Hard section labels. RC difficulty isn't labelled in the source, so it's ignored.</p></div>`;
  c.querySelector('#d-go').onclick=()=>{
    const t=c.querySelector('#d-t').value, d=c.querySelector('#d-d').value, n=Math.max(1,Math.min(60,+c.querySelector('#d-n').value||10));
    const seen = c.querySelector('#d-u').value==='1' ? seenSet() : new Set();
    let items=[];
    if(t.startsWith('tc')||t==='se'){
      const f={tc1:q=>q.t==='TC'&&q.b===1,tc2:q=>q.t==='TC'&&q.b===2,tc3:q=>q.t==='TC'&&q.b===3,se:q=>q.t==='SE',tcall:q=>true}[t];
      items=pickPreferUnseen(TC.filter(q=>f(q)&&(!d||q.d===d)),n,q=>'tc:'+q.id,seen).map(q=>({k:'tc',id:q.id}));
    } else if(t==='rc'){ items=pickRC(n,'mid',seen,new Set()).flat(); }
    else {
      const dm={e:['Medium'],m:['Medium'],h:['Hard','Research']}[d];
      const f=q=>(t==='qall'||q.t===t||(t==='num'&&q.t==='frac')) && (!dm || dm.includes(q.d) || (d==='h'&&q.part==='puzzle'));
      items=pickPreferUnseen(QT.filter(f),n,q=>'qt:'+q.id,seen).map(q=>({k:'qt',id:q.id}));
    }
    if(!items.length) return alert('No questions match those filters.');
    const per = items[0].k==='rc'?105:items[0].k==='qt'?105:70;
    setModal('Custom drill', items, items.length*per, null);
  };
}
function tabMist(c){
  const mist=Object.values(store.get('mistakes',{})).filter(m=>!m.right && (m.k==='tc'?TCmap[m.id]:m.k==='rc'?RCq[m.id]:QTmap[m.id])).sort((a,b)=>b.t-a.t);
  if(!mist.length){ c.innerHTML='<p class="muted">No mistakes recorded yet. Questions you get wrong in tests and drills show up here so you can redo them. Once you answer one correctly, it drops off the list.</p>'; return; }
  const cnt={Verbal:0,Quant:0}; mist.forEach(m=>cnt[m.k==='qt'?'Quant':'Verbal']++);
  c.innerHTML=`<p>${mist.length} questions to revisit (${cnt.Verbal} Verbal, ${cnt.Quant} Quant).</p>
    <div class="row"><button class="btn" id="mv">Redo Verbal mistakes</button><button class="btn" id="mq">Redo Quant mistakes</button><button class="btn danger sm" id="mc">Clear list</button></div>`;
  const go=k=>{ const it=mist.filter(m=>(m.k==='qt')===(k==='q')).slice(0,40).map(m=>({k:m.k,id:m.id})); if(!it.length) return alert('Nothing to redo here.'); setModal('Mistakes review', it, it.length*90, null); };
  c.querySelector('#mv').onclick=()=>go('v'); c.querySelector('#mq').onclick=()=>go('q');
  c.querySelector('#mc').onclick=()=>{ if(confirm('Clear the mistakes list?')){ store.set('mistakes',{}); renderHome(); } };
}
function tabHist(c){
  const hist=store.get('history',[]);
  if(!hist.length){ c.innerHTML='<p class="muted">No completed tests yet.</p>'; return; }
  c.innerHTML=`<table class="tbl"><thead><tr><th>Date</th><th>Test</th><th>Verbal</th><th>Quant</th><th>Raw</th><th></th></tr></thead><tbody>
    ${hist.map(h=>`<tr><td>${new Date(h.date).toLocaleDateString()}</td><td>${esc(h.title)}</td><td>${h.scores&&h.scores.Verbal||'—'}</td><td>${h.scores&&h.scores.Quant||'—'}</td><td>${h.raw.all}/${h.total}</td><td><a href="#result/${h.id}">Review</a></td></tr>`).join('')}
    </tbody></table>
    <div class="row" style="margin-top:14px"><button class="btn sec sm" id="exp">Export my data</button><label class="btn sec sm">Import data<input type="file" id="imp" accept=".json" hidden></label><button class="btn danger sm" id="reset">Reset all progress</button></div>`;
  c.querySelector('#exp').onclick=()=>{ const o={}; ['history','mistakes','progress','seen'].forEach(k=>o[k]=store.get(k,null)); const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([JSON.stringify(o)],{type:'application/json'})); a.download='gre-mock-progress.json'; a.click(); };
  c.querySelector('#imp').onchange=e=>{ const f=e.target.files[0]; if(!f) return; f.text().then(t=>{ try{ const o=JSON.parse(t); Object.entries(o).forEach(([k,v])=>{ if(v!=null) store.set(k,v); }); alert('Imported.'); renderHome(); }catch(err){ alert('That file could not be read.'); } }); };
  c.querySelector('#reset').onclick=()=>{ if(confirm('Delete all history, mistakes and progress in this browser?')){ ['history','mistakes','progress','seen','current'].forEach(store.del); renderHome(); } };
}

/* ---------------- boot ---------------- */
if(location.hash==='#test'){ const cur=store.get('current',null); if(cur){ T=cur; } else location.hash='#home'; }
if(location.hash==='#test' && T){ if(T.kind==='writing'){ renderWriting(); startTimer(); } else { renderTest(); if(T.view==='q' && sec().time) startTimer(); } }
else render();
})();
