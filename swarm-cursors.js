/* Swarm Rebuild — drag-based, fast collaborative intro */
(() => {
'use strict';
const root=document.documentElement;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse=matchMedia('(pointer: coarse)').matches;
if(reduce||coarse){root.classList.remove('swarm-build-pending');return;}

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const names=['LAYOUT','CONTENT','VISUAL','DETAIL'];
const colors=['#c4b5fd','#8b5cf6','#7ee7c0','#f0abfc'];
const agents=[];
const status=document.createElement('div');
status.className='swarm-rebuild-status';
status.innerHTML='<span class="swarm-live-dot"></span><span class="swarm-status-label">PREPARING CANVAS</span><span class="swarm-status-count">0%</span>';
document.body.appendChild(status);

names.forEach((name,i)=>{
  const node=document.createElement('div');
  node.className='swarm-rebuild-agent';
  node.style.setProperty('--agent-color',colors[i]);
  node.dataset.label=name;
  node.setAttribute('aria-hidden','true');
  const ring=document.createElement('span');
  ring.className='swarm-agent-ring';
  node.appendChild(ring);
  document.body.appendChild(node);
  agents.push(node);
});

const label=status.querySelector('.swarm-status-label');
const count=status.querySelector('.swarm-status-count');
let completed=0,total=0;
const selector=[
  'nav .brand','nav .roleswitch','nav .navlinks','nav .navtoggle',
  '.hero-text .rolepick','.hero-text h1','.hero-text .hero-sub',
  '.hero-text .hero-btns','.hero-text .avail','.tagwrap',
  '.wrap > h2','.wrap > .lead','.wrap > .lead-light',
  '.about .wrap > div > p','.rc-card','.facts',
  '.skill-card','.project .p-text','.project .p-visual',
  '.flow .steps','.flow .panels','.dash-title-row','.dash-kpi',
  '.dash-panel','.insight-grid','.dash-insight',
  '.contact-btns','.contact-links','footer .wrap > *'
].join(',');

const isVisible=el=>!!(el&&el.getClientRects().length&&getComputedStyle(el).display!=='none');
function getTargets(scope){
  const found=Array.from(scope.querySelectorAll(selector)).filter(isVisible);
  return found.filter((el,i)=>!found.some((other,j)=>i!==j&&other.contains(el)));
}
function bounds(el){
  const r=el.getBoundingClientRect();
  const left=Math.max(12,Math.min(innerWidth-30,r.left+Math.min(12,r.width*.08)));
  const right=Math.max(12,Math.min(innerWidth-30,r.right-Math.min(12,r.width*.08)));
  const y=Math.max(14,Math.min(innerHeight-44,r.top+Math.min(20,r.height*.22)));
  return {left,right,y};
}
async function move(agent,x,y,duration=150){
  const from=agent._point||{x:innerWidth*.5,y:innerHeight*.35};
  agent.classList.add('is-active');
  agent._point={x,y};
  try{
    await agent.animate([
      {transform:'translate3d('+from.x+'px,'+from.y+'px,0) rotate(-7deg)'},
      {transform:'translate3d('+x+'px,'+y+'px,0) rotate(0deg)'}
    ],{duration,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'}).finished;
  }catch(e){}
}
async function dragBuild(el,agent,index){
  if(!isVisible(el)||el.dataset.swarmDone==='1')return;
  el.dataset.swarmDone='1';
  el.style.visibility='visible';
  const b=bounds(el);
  const start={x:b.left,y:b.y+(index%2?5:0)};
  const end={x:b.right,y:b.y+Math.min(24,Math.max(0,el.getBoundingClientRect().height*.12))};
  el.style.clipPath='inset(0 100% 0 0)';
  el.style.opacity='.72';
  await move(agent,start.x,start.y,135);
  agent.classList.add('is-pressing');
  await sleep(45);
  const drag=move(agent,end.x,end.y,205);
  const reveal=el.animate([
    {clipPath:'inset(0 100% 0 0)',opacity:.72,filter:'brightness(1.25)'},
    {clipPath:'inset(0 0 0 0)',opacity:1,filter:'brightness(1)'}
  ],{duration:235,easing:'cubic-bezier(.18,.72,.2,1)',fill:'forwards'});
  await Promise.all([drag,reveal.finished.catch(()=>{})]);
  agent.classList.remove('is-pressing');
  el.style.clipPath='none';
  el.style.opacity='1';
  el.style.filter='';
  completed++;
  count.textContent=Math.round(completed/Math.max(total,1)*100)+'%';
}
async function scrollToSection(el){
  const r=el.getBoundingClientRect();
  if(r.top<74||r.top>innerHeight*.68){
    window.scrollTo({top:Math.max(0,window.scrollY+r.top-82),behavior:'smooth'});
    await sleep(390);
  }
}
async function buildScope(scope,title,index){
  if(!scope||!isVisible(scope))return;
  scope.style.visibility='visible';
  await scrollToSection(scope);
  const targets=getTargets(scope);
  const batches=[];
  for(let i=0;i<targets.length;i+=4)batches.push(targets.slice(i,i+4));
  for(let b=0;b<batches.length;b++){
    label.textContent=names[(b+index)%names.length]+' · '+title;
    await Promise.all(batches[b].map((el,j)=>dragBuild(el,agents[(j+b+index)%agents.length],j+b)));
    await sleep(35);
  }
}
function prepare(){
  const shells=[document.querySelector('nav'),document.querySelector('.hero'),...document.querySelectorAll('main > section'),document.querySelector('footer')].filter(Boolean).filter(isVisible);
  shells.forEach(el=>{
    el.style.visibility='hidden';
    el.dataset.swarmShell='1';
    getTargets(el).forEach(target=>{
      target.style.visibility='hidden';
      target.dataset.swarmTarget='1';
    });
  });
  return shells;
}
async function run(){
  root.classList.add('swarm-build-active');
  const shells=prepare();
  root.classList.remove('swarm-build-pending');
  await sleep(180);
  total=shells.reduce((sum,el)=>sum+getTargets(el).length,0);
  count.textContent='0%';
  for(let i=0;i<shells.length;i++){
    const el=shells[i];
    const title=(el.id||el.tagName).replace(/-/g,' ').toUpperCase();
    await buildScope(el,title,i);
    await sleep(45);
  }
  label.textContent='BUILD COMPLETE';
  count.textContent='100%';
  window.scrollTo({top:0,behavior:'smooth'});
  await sleep(520);
  agents.forEach(agent=>agent.classList.remove('is-active','is-pressing'));
  await sleep(180);
  agents.forEach(agent=>agent.remove());
  status.classList.add('is-done');
  await sleep(420);
  status.remove();
  root.classList.remove('swarm-build-active');
  document.querySelectorAll('[data-swarm-shell]').forEach(el=>{
    el.style.visibility='';
    delete el.dataset.swarmShell;
  });
  document.querySelectorAll('[data-swarm-target]').forEach(el=>{
    el.style.visibility='';
    delete el.dataset.swarmTarget;
  });
}
run().catch(()=>{
  root.classList.remove('swarm-build-pending','swarm-build-active');
  document.querySelectorAll('[data-swarm-shell],[data-swarm-target]').forEach(el=>{
    el.style.visibility='';
    delete el.dataset.swarmShell;
    delete el.dataset.swarmTarget;
  });
  document.querySelectorAll('[data-swarm-done]').forEach(el=>{
    el.style.clipPath='';
    el.style.opacity='';
    el.style.filter='';
  });
  agents.forEach(agent=>agent.remove());
  status.remove();
});
})();