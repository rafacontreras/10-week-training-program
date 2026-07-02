const STORE='trainingProgramTracker.v7';
const MS=86400000;
const quotes=[
 {q:'The journey of a thousand miles begins with one step.',a:'Lao Tzu'},
 {q:'Success is the sum of small efforts, repeated day in and day out.',a:'Robert Collier'},
 {q:'It does not matter how slowly you go as long as you do not stop.',a:'Confucius'},
 {q:'Energy and persistence conquer all things.',a:'Benjamin Franklin'},
 {q:'Well done is better than well said.',a:'Benjamin Franklin'},
 {q:'The secret of getting ahead is getting started.',a:'Mark Twain'},
 {q:'Do what you can, with what you have, where you are.',a:'Theodore Roosevelt'},
 {q:'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',a:'Will Durant'},
 {q:'You miss 100 percent of the shots you don’t take.',a:'Wayne Gretzky'},
 {q:'The most effective way to do it, is to do it.',a:'Amelia Earhart'},
 {q:'If there is no struggle, there is no progress.',a:'Frederick Douglass'},
 {q:'Nothing will work unless you do.',a:'Maya Angelou'},
 {q:'The future depends on what you do today.',a:'Mahatma Gandhi'},
 {q:'Act as if what you do makes a difference. It does.',a:'William James'},
 {q:'Start where you are. Use what you have. Do what you can.',a:'Arthur Ashe'},
 {q:'Quality is not an act, it is a habit.',a:'Will Durant'},
 {q:'Perseverance is not a long race; it is many short races one after the other.',a:'Walter Elliot'},
 {q:'What you do today can improve all your tomorrows.',a:'Ralph Marston'},
 {q:'Believe you can and you’re halfway there.',a:'Theodore Roosevelt'},
 {q:'You just can’t beat the person who never gives up.',a:'Babe Ruth'},
 {q:'Great works are performed not by strength but by perseverance.',a:'Samuel Johnson'},
 {q:'The beginning is the most important part of the work.',a:'Plato'},
 {q:'Discipline is the bridge between goals and accomplishment.',a:'Jim Rohn'},
 {q:'A year from now you may wish you had started today.',a:'Karen Lamb'},
 {q:'Either you run the day or the day runs you.',a:'Jim Rohn'}
];
const phases=[
 ['Foundation',1,2,2,'8-10','slow and controlled','Learn clean form, wake up the glutes, and build a simple training rhythm.'],
 ['Build',3,4,2,'10-12','2-second squeeze','Increase quality reps and create more time under tension.'],
 ['Shape',5,6,3,'10-12','pause at the top','Add volume and stronger mind-muscle connection.'],
 ['Strength Endurance',7,8,3,'12-14','smooth full range','Improve stamina while keeping glute-focused control.'],
 ['Peak & Polish',9,10,3,'12-15','clean, controlled burn','Finish with confident, consistent, higher-rep glute work.']
];
const workouts={
 0:{t:'Recovery Walk',y:'Recovery · 10-25 min',m:['Easy walk','Figure-4 stretch','Hip circles','Breathing reset']},
 1:{t:'Glute Bridge + Squat Day',y:'Strength · 15-20 min',m:['Glute bridge','Chair squat','Reverse lunge','Frog pump','Dead bug']},
 2:{t:'Side Glutes + Stability Day',y:'Strength · 15-20 min',m:['Clamshell','Side-lying leg raise','Curtsy step-back','Single-leg glute bridge','Forearm plank']},
 3:{t:'Mobility + Stretch Day',y:'Recovery · 10-15 min',m:['Cat-cow','90/90 hip switches','Hamstring stretch','Pigeon stretch']},
 4:{t:'Hip Hinge + Lift Day',y:'Strength · 15-20 min',m:['Good morning hip hinge','Couch hip thrust','Step-up','Donkey kick','Bird dog']},
 5:{t:'Optional Walk + Core Reset',y:'Recovery · 10-25 min',m:['Easy walk','Glute squeeze holds','Side plank from knees','Gentle stretch']},
 6:{t:'Pilates Glute Flow Day',y:'Strength flow · 15-20 min',m:['Bridge march','Squat pulse','Fire hydrant','Standing kickback','Child pose to pigeon stretch']}
};
const strengthBase=[1,2,4,6], recoveryBase=[0,3,5];
const defaultSchedule=[0,1,2,3,4,5,6];
const autoTemplates=[
 [1,0,2,3,4,6,5],
 [0,1,2,3,4,6,5],
 [1,3,2,0,4,5,6],
 [3,1,0,2,5,4,6]
];
const strengthDays=new Set(strengthBase);
const dayNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
let state=load(); let deferredPrompt=null;
function defaultChoices(){return ['recovery','strength','strength','recovery','strength','recovery','strength']}
function base(){return{start:iso(new Date()),done:{},skipped:{},weekChoices:{},weekSchedule:{},autoIndex:{},exported:false}}
function migrate(x){
 if(x.notes)delete x.notes;if(x.goal)delete x.goal;if(x.completedDates)delete x.completedDates;if(x.replaced)delete x.replaced;if(!x.skipped)x.skipped={};
 if(!x.weekChoices)x.weekChoices={};
 if(!x.weekSchedule)x.weekSchedule={};
 if(x.schedule){for(const w in x.schedule){if(!x.weekSchedule[w])x.weekSchedule[w]=x.schedule[w]} delete x.schedule;}
 for(const w in x.weekChoices){if(!x.weekSchedule[w]){let si=0,ri=0;x.weekSchedule[w]=x.weekChoices[w].map(type=>type==='strength'?strengthBase[si++%strengthBase.length]:recoveryBase[ri++%recoveryBase.length])}}
 if(!x.autoIndex)x.autoIndex={};
 return x
}
function load(){try{return migrate({...base(),...JSON.parse(localStorage.getItem(STORE))})}catch{return base()}}
function save(renderNow=true){localStorage.setItem(STORE,JSON.stringify(state));if(renderNow)render()}
function iso(d){return d.toISOString().slice(0,10)}
function fromIso(s){const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)}
function add(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x}
function fmt(d){return d.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})}
function phase(w){return phases.find(p=>w>=p[1]&&w<=p[2])}
function scheduleFor(w){if(!state.weekSchedule[w])state.weekSchedule[w]=[...defaultSchedule];return state.weekSchedule[w]}
function swapSlots(w,from,to){if(from===to)return;const s=[...scheduleFor(w)];[s[from],s[to]]=[s[to],s[from]];state.weekSchedule[w]=s;save();toast('Week updated')}
function autoArrange(w){const idx=(state.autoIndex[w]||0)%autoTemplates.length;state.weekSchedule[w]=[...autoTemplates[idx]];state.autoIndex[w]=idx+1;save();toast('Balanced week arranged')}
function baseFor(w,slot){return scheduleFor(w)[slot]}
function keyFor(w,slot,baseDay){return strengthDays.has(baseDay)?`w${w}d${baseDay}`:`w${w}s${slot}r${baseDay}`}
function quoteFor(w,d){return quotes[((w-1)*7+d)%quotes.length]}
function itemFor(w,slot){const p=phase(w),baseDay=baseFor(w,slot),raw=workouts[baseDay],isS=strengthDays.has(baseDay);return{week:w,slot,baseDay,key:keyFor(w,slot,baseDay),date:add(fromIso(state.start),(w-1)*7+slot),phase:p,isS,title:raw.t,type:raw.y,moves:raw.m.map(x=>isS?`${x}: ${p[3]} rounds × ${p[4]} reps, ${p[5]}`:x)}}
function program(){const out=[];for(let w=1;w<=10;w++){for(let s=0;s<7;s++)out.push(itemFor(w,s))}return out}
function doneStrength(){return program().filter(x=>x.isS&&state.done[x.key]).length}
function weeklyCredit(w){return program().filter(x=>x.week===w&&x.isS&&state.done[x.key]).length}
function streakDays(){const set=new Set(program().filter(x=>state.done[x.key]).map(x=>state.done[x.key]));let c=fromIso(iso(new Date())),n=0;while(set.has(iso(c))){n++;c.setDate(c.getDate()-1)}return n}
function weekNum(){const diff=Math.floor((fromIso(iso(new Date()))-fromIso(state.start))/MS);return Math.min(10,Math.max(1,Math.floor(diff/7)+1))}
function todayItem(){const diff=Math.floor((fromIso(iso(new Date()))-fromIso(state.start))/MS),w=Math.min(10,Math.max(1,Math.floor(diff/7)+1)),s=Math.min(6,Math.max(0,diff%7));return itemFor(w,s)}
function nextWorkout(after=null){const days=program();let i=after?days.findIndex(d=>d.key===after.key&&d.week===after.week)+1:0;return days.slice(Math.max(0,i)).find(d=>d.isS&&!state.done[d.key])||days.find(d=>d.isS&&!state.done[d.key])}
function nextWorkoutNotice(d){const n=nextWorkout(d);return n?`<div class="next-card"><span>Next workout</span><strong>${n.title}</strong><p>${fmt(n.date)} · Week ${n.week}</p></div>`:''}
function card(d){
 const done=!!state.done[d.key], skipped=!!state.skipped[d.key], q=quoteFor(d.week,d.slot);
 const el=document.createElement('article');el.className=`day-card glass ${d.isS?'strength-card':'recovery-card'}`;
 const skipCtl=!d.isS?`<label class="check skip"><input class="skipbox" type="checkbox" ${skipped?'checked':''}>Skip</label>`:'';
 el.innerHTML=`<div class="day-top"><div><p class="date">Week ${d.week} · ${fmt(d.date)} · ${d.phase[0]}</p><h3 class="title">${!d.isS?'<span class="rest-icon" aria-hidden="true">Zzz</span> ':''}${d.title}</h3></div><div class="checks"><label class="check"><input class="donebox" type="checkbox" ${done?'checked':''}>Done</label>${skipCtl}</div></div><p class="type">${d.type}</p><ol class="moves">${d.moves.map(m=>`<li>${m}</li>`).join('')}</ol>${skipped?nextWorkoutNotice(d):''}<div class="daily-quote"><span>Today’s quote</span><p>“${q.q}”</p><cite>${q.a}</cite></div>`;
 el.querySelector('.donebox').onchange=e=>{state.done[d.key]=e.target.checked?iso(new Date()):false;if(e.target.checked){state.skipped[d.key]=false;party()}save()};
 const sk=el.querySelector('.skipbox'); if(sk)sk.onchange=e=>{state.skipped[d.key]=e.target.checked;if(e.target.checked)state.done[d.key]=false;save()};
 return el;
}
function weekAhead(w){
 const p=phase(w); const wrap=document.createElement('details');wrap.className='week-ahead glass';wrap.open=true;
 wrap.innerHTML=`<summary><span>Week ${w} at a glance</span><small>${weeklyCredit(w)}/4 strength workouts complete</small></summary><p class="planner-note"><strong>${p[0]}:</strong> ${p[6]}</p><p class="planner-note">This is the current weekly plan. To rearrange workout and recovery days, open the Calendar tab and press-and-hold a day bubble.</p><div class="planner-grid"></div>`;
 const grid=wrap.querySelector('.planner-grid');
 for(let s=0;s<7;s++){
  const d=itemFor(w,s), done=state.done[d.key], skipped=state.skipped[d.key];
  const row=document.createElement('div');row.className=`planner-card ${d.isS?'workout':'recovery'} ${done?'done':''} ${skipped?'skipped':''}`;
  row.innerHTML=`<div><b>${dayNames[s]}</b><span>${!d.isS?'<span class="rest-icon mini" aria-hidden="true">Zzz</span> ':''}${d.title}</span><em>${d.isS?'Core workout':'Recovery/optional'}</em></div>`;
  grid.append(row)
 }
 return wrap;
}
function render(){
 const days=program(), w=weekNum();
 const hq=quotes[new Date().getDate()%quotes.length];document.querySelector('#quote').innerHTML=`“${hq.q}” <cite>${hq.a}</cite>`;
 ring('weekRing',weeklyCredit(w)/4*100,`${weeklyCredit(w)}/4`);ring('programRing',doneStrength()/40*100,`${Math.round(doneStrength()/40*100)}%`);ring('streakRing',Math.min(streakDays()*14,100),streakDays());
 const today=document.querySelector('#today');today.innerHTML='';today.append(weekAhead(w));today.append(card(todayItem()));const n=nextWorkout(); if(n){const panel=document.createElement('section');panel.className='panel glass upcoming';panel.innerHTML=`<h2>Next uncompleted workout</h2><p><strong>${n.title}</strong><br>${fmt(n.date)} · Week ${n.week}</p>`;today.append(panel)}
 renderCalendar(days,w);
}
function ring(id,pct,text){const el=document.querySelector('#'+id);el.style.setProperty('--pct',Math.max(0,Math.min(100,pct)));el.querySelector('span').textContent=text}
function renderCalendar(days,current){
 const box=document.querySelector('#calendar');box.innerHTML='';
 for(let w=1;w<=10;w++){
  const p=phase(w);const sec=document.createElement('section');sec.className='week panel glass';
  sec.innerHTML=`<div class="week-head"><div><h3>Week ${w}${w===current?' · Current':''}</h3><p class="week-purpose"><strong>${p[0]}</strong> · ${p[6]}</p></div><button class="auto-btn" type="button">Auto Arrange</button></div><p class="drag-hint">Press and hold any day bubble, then drag it to another day to swap the plan.</p><div class="calendar-grid">${dayNames.map(d=>`<div class="dow">${d}</div>`).join('')}</div>`;
  sec.querySelector('.auto-btn').onclick=()=>autoArrange(w);
  const grid=sec.querySelector('.calendar-grid');
  days.filter(d=>d.week===w).forEach(d=>{
   const b=document.createElement('button');b.className=`cal-day ${d.isS?'workout':'recovery'} ${state.done[d.key]?'done':''} ${state.skipped[d.key]?'skipped':''}`;
   b.dataset.week=d.week; b.dataset.slot=d.slot;
   b.innerHTML=`<b>${d.date.getDate()}${!d.isS?' <i class="rest-icon cal" aria-hidden="true">Zzz</i>':''}</b><span>${state.done[d.key]?'Done':state.skipped[d.key]?'Skipped':d.isS?d.title:'Zzz Recovery'}</span><small class="drag-label">Hold to move</small>`;
   b.onclick=()=>{if(b.dataset.dragged==='1'){b.dataset.dragged='0';return}document.querySelector('[data-tab=today]').click();document.querySelector('#today').innerHTML='';document.querySelector('#today').append(weekAhead(d.week));document.querySelector('#today').append(card(d));};
   attachDrag(b);
   grid.appendChild(b)
  });
  box.append(sec)
 }
}
let dragState=null;
function attachDrag(el){
 let timer=null, startX=0, startY=0;
 el.addEventListener('pointerdown',e=>{
  startX=e.clientX;startY=e.clientY;
  timer=setTimeout(()=>beginDrag(el,e),320);
 });
 el.addEventListener('pointermove',e=>{
  if(timer&&Math.hypot(e.clientX-startX,e.clientY-startY)>8){clearTimeout(timer);timer=null}
  if(dragState)moveDrag(e);
 });
 el.addEventListener('pointerup',e=>{if(timer){clearTimeout(timer);timer=null} if(dragState)endDrag(e,el)});
 el.addEventListener('pointercancel',()=>{if(timer)clearTimeout(timer);cancelDrag()});
}
function beginDrag(el,e){
 if(dragState)return;
 try{navigator.vibrate&&navigator.vibrate(12)}catch{}
 const r=el.getBoundingClientRect();
 const ghost=el.cloneNode(true);ghost.classList.add('drag-ghost');ghost.style.width=r.width+'px';ghost.style.left=r.left+'px';ghost.style.top=r.top+'px';document.body.appendChild(ghost);
 el.classList.add('drag-origin');
 dragState={source:el,ghost,week:Number(el.dataset.week),slot:Number(el.dataset.slot),dx:e.clientX-r.left,dy:e.clientY-r.top,target:null};
 el.setPointerCapture&&el.setPointerCapture(e.pointerId);
 moveDrag(e);
}
function moveDrag(e){
 const d=dragState;if(!d)return;
 d.ghost.style.left=(e.clientX-d.dx)+'px';d.ghost.style.top=(e.clientY-d.dy)+'px';
 d.ghost.style.pointerEvents='none';
 document.querySelectorAll('.cal-day.drop-target').forEach(x=>x.classList.remove('drop-target'));
 const under=document.elementFromPoint(e.clientX,e.clientY)?.closest?.('.cal-day');
 if(under&&under.dataset.week===String(d.week)&&under!==d.source){under.classList.add('drop-target');d.target=under}else d.target=null;
}
function endDrag(e,el){
 const d=dragState;if(!d)return;
 if(d.target){el.dataset.dragged='1';swapSlots(d.week,d.slot,Number(d.target.dataset.slot))}
 cancelDrag();
}
function cancelDrag(){
 if(!dragState)return;
 dragState.source.classList.remove('drag-origin');
 dragState.ghost.remove();
 document.querySelectorAll('.cal-day.drop-target').forEach(x=>x.classList.remove('drop-target'));
 dragState=null;
}
function toast(t){const el=document.querySelector('#toast');el.textContent=t;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1900)}
function party(){toast('Workout complete');const cv=document.querySelector('#confetti'),ctx=cv.getContext('2d');cv.width=innerWidth;cv.height=innerHeight;let ps=Array.from({length:90},()=>({x:innerWidth/2,y:innerHeight*.25,vx:(Math.random()-.5)*8,vy:Math.random()*-6-2,g:.22,s:Math.random()*6+4,r:Math.random()*Math.PI}));let frames=0;(function anim(){ctx.clearRect(0,0,cv.width,cv.height);ps.forEach(p=>{p.vy+=p.g;p.x+=p.vx;p.y+=p.vy;p.r+=.12;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.fillStyle=['#6f4aa8','#d9ccff','#cbb8ff','#f1e8ff','#eadcff'][Math.floor(Math.random()*5)];ctx.fillRect(-p.s/2,-p.s/2,p.s,p.s);ctx.restore()});if(frames++<95)requestAnimationFrame(anim);else ctx.clearRect(0,0,cv.width,cv.height)})()}
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));document.querySelector('#'+t.dataset.tab).classList.remove('hidden')});
document.querySelector('#startToday').onclick=()=>{state.start=iso(new Date());state.weekChoices={};state.weekSchedule={};state.autoIndex={};save();toast('Program reset to today')};
document.querySelector('#exportBtn').onclick=()=>{state.exported=true;save(false);const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`training-program-tracker-backup-${iso(new Date())}.json`;a.click();URL.revokeObjectURL(a.href);render();toast('Backup exported')};
document.querySelector('#importBtn').onclick=()=>document.querySelector('#importFile').click();
document.querySelector('#importFile').onchange=e=>{const f=e.target.files[0];if(!f)return;const reader=new FileReader();reader.onload=()=>{try{state=migrate({...base(),...JSON.parse(reader.result)});save();toast('Backup imported')}catch{toast('Could not import file')}};reader.readAsText(f)};
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;document.querySelector('#installBtn').classList.remove('hidden')});
document.querySelector('#installBtn').onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();deferredPrompt=null}else toast('Use Share > Add to Home Screen')};
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
render();
