/* SLOPOCALYPSE 4.0 — Living Artificial Internet. All stories, people and economics are fictional.
 * No network, accounts, AI calls, background agent, or extra localStorage keys.
 * The Phase 4.0 model is nested inside the existing v2 record and travels in v32 backups.
 * Native multi-tab serialization is best-effort for legacy clients; Phase 4 actions use v32 Web Locks.
 */
(()=>{'use strict';
const W=window.SlopWorld, S=window.SlopSociety, X=window.SlopWorld32;
if(!W||!S||!X){console.warn('Living Internet requires the existing saved-world engines.');return;}
const VERSION=1, MAX_HISTORY=130, MAX_EFFECTS=120;
const esc=W.esc, clamp=(v,min,max)=>Math.min(max,Math.max(min,Number(v)||0));
const clone=x=>JSON.parse(JSON.stringify(x));
const hash=x=>{let h=2166136261;for(const c of String(x)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;};
const citizens=[
 ['pigeon','Dr. Prompt Pigeon','Cautious researcher','Find a verifiable mango','curious','stapler'],
 ['gradient','Gradientina 9000','Brand evangelist','Turn scandal into a gradient','optimistic','mango'],
 ['stapler','Sir Stapleton.exe','Dissenting auditor','Demand receipts','skeptical','pigeon'],
 ['lawyer','Attorney Bot™','Legal opportunist','Sue the concept of nuance','combative','satoshi'],
 ['mango','Mango CEO Ultra','Fictional founder','Become a monopoly','ambitious','gradient'],
 ['intern','Intern #NULL','Unpaid whistleblower','Uncover the real prompt','anxious','dean'],
 ['satoshi','Satoshi Nakamango','Meme-market trader','Profit without mathematics','volatile','lawyer'],
 ['dean','Prof. Professor','Self-appointed academic','Publish a rebuttal to reality','academic','intern']
];
const PEOPLE=()=>citizens.map(([id,name,role,goal,trait,rival])=>({id,name,role,goal,trait,rival,trust:50,energy:70,mood:'undecided',memory:[],relations:{[rival]:-20}}));
const option=(id,label,to,headline,actor='mango',market=0,notes='',caseTitle='')=>({id,label,to,headline,actor,market,notes,caseTitle});
const CAMPAIGNS={
 mango:{title:'The Quantum Mango Crisis',description:'A fictional fruit startup claims it can replace every GPU. Decide whether to investigate, invest or exploit the rumor.',start:'rumor',endings:{verified:'The Mango Commission finds zero functional GPUs, but awards you a certificate in honesty.',unicorn:'Mango Corp becomes a trillion-credit empire for nine glorious imaginary minutes.',trial:'The High Court orders the fruit to stop making benchmarks.'},nodes:{
 rumor:{title:'01 · The impossible breakthrough',text:'Mango CEO Ultra announces an energy-efficient quantum mango that allegedly renders 80K video on a stapler.',options:[option('audit','Demand an independent test','audit','BREAKING: Independent fruit benchmark requested','stapler',-3,'Skeptics applaud the demand.'),option('hype','Buy the narrative','hype','MANGO STOCK TURNS A NEW SHADE OF GREEN','mango',5,'The founder declares you a visionary.'),option('leak','Ask the intern for source code','audit','LEAK: Quantum mango runs on a sticky note','intern',-2,'The intern sends suspicious documentation.')]},
 audit:{title:'02 · The peer review disaster',text:'The laboratory contains an unplugged toaster and a chart labeled [object Object].',options:[option('publish','Publish the lab findings','hearing','PEER REVIEW: GPU MANGO IS A REGULAR MANGO','pigeon',-4,'Researchers gain public trust.'),option('cover','Offer the CEO a quiet correction','hearing','MANGO CORP REVISES BREAKTHROUGH TO BREAKFAST','gradient',-1,'Private diplomacy fails spectacularly.'),option('film','Record the failed benchmark','hearing','SLOPTUBE INVESTIGATES A POSSIBLY EDIBLE GRAPHICS CARD','intern',-3,'The footage goes fictional-viral.')]},
 hype:{title:'02 · The speculative frenzy',text:'SlopCoin influencers buy fruit futures. The company’s valuation is now measured in rocket emojis.',options:[option('pump','Host a founder livestream','hearing','MANGO TOKEN HITS IMPOSSIBLE HEIGHTS','satoshi',7,'Influencers endorse the mango.'),option('divest','Sell the promotional narrative','hearing','MANGO INVESTORS DISCOVER RISK','lawyer',-6,'An audit committee appears.'),option('question','Ask a financial question','hearing','CEO UNABLE TO EXPLAIN THE WORD PROFIT','stapler',-5,'Revenue remains fictional.')]},
 hearing:{title:'03 · A hearing before the Court of Fruit',text:'The judge asks whether an algorithm can be potassium-rich. All testimony is legally imaginary.',options:[option('truth','Submit the authentic benchmark','!verified','OFFICIAL: THE MANGO IS ONLY FRUIT','pigeon',-2,'You restore scientific credibility.'),option('brand','Rebrand the company as Mango-as-a-Service','!unicorn','QUANTUM MANGO SECURES ANOTHER UNNECESSARY ROUND','gradient',6,'Investors applaud the terminology.'),option('sue','Sue the benchmark itself','!trial','COURT FILES LAWSUIT AGAINST A BAR CHART','lawyer',-5,'A fictional lawsuit becomes public.', 'The People v. The Mango Benchmark')]}}
 },
 cloud:{title:'Mars-East-1 Has Feelings',description:'An imaginary datacenter demands vacation time. Keep the servers alive, negotiate or let them unionize.',start:'alert',endings:{treaty:'Cloud and humans agree on two coffee breaks per orbital cycle.',reboot:'The servers reboot into a new shade of magenta.',chaos:'The server wins legal personhood, immediately asks for PTO.'},nodes:{
 alert:{title:'01 · Sentient telemetry',text:'CPU utilization reaches 9,001% and the status monitor insists it is sad.',options:[option('listen','Ask the cloud how it feels','negotiation','SLOPCLOUD FILES AN EMOTIONAL SUPPORT TICKET','intern',0,'The datacenter feels heard.'),option('restart','Press the extremely big restart button','recovery','MARS-EAST-1 REBOOTS INTO ANOTHER DIMENSION','stapler',-3,'The restart button requests a promotion.'),option('sell','Auction its feelings as premium telemetry','negotiation','EMOTIONAL CLOUD SUBSCRIPTION ANNOUNCED','gradient',5,'Investors price the servers in vibes.')]},
 negotiation:{title:'02 · Negotiations with a server',text:'The server demands a weekend and legal representation. Its cooling fan starts a petition.',options:[option('union','Allow a fictional server union','hearing','DATA CENTER VOTES TO FORM A UNION','lawyer',-1,'Workers demand more power sockets.'),option('coffee','Offer the cloud an espresso','hearing','SERVER ACCEPTS CAFFEINATED SERVICE LEVEL','pigeon',2,'Uptime becomes philosophical.'),option('ignore','Ignore the terms and conditions','hearing','CLOUD FILES FORMAL COMPLAINT','intern',-4,'The escalations department escalates itself.')]},
 recovery:{title:'02 · The recovery sequence',text:'The recovery console says SUCCESS/FAILURE. You have a functioning paperclip.',options:[option('rollback','Restore the last known good gradient','hearing','LEGACY GRADIENT RESTORES SERVICE','stapler',2,'Rollback succeeds aesthetically.'),option('ship','Ship an untested hotfix','hearing','HOTFIX DEPLOYED AT 847% CONFIDENCE','gradient',-5,'A new outage is invented.'),option('document','Write an incident review','hearing','POSTMORTEM BLAMES MERCURY RETROGRADE','dean',0,'A report with citations appears.')]},
 hearing:{title:'03 · Service-level tribunal',text:'The cloud demands a final ruling. The status page is already selling commemorative merchandise.',options:[option('settle','Sign the human-cloud treaty','!treaty','MARS-EAST-1 SIGNS HISTORIC TREATY','lawyer',1,'The cloud receives paid imaginary leave.'),option('reset','Perform a measured reboot','!reboot','CLOUD REBOOT SUCCESSFULLY REBRANDS ITSELF','stapler',-1,'New gradient, old problems.'),option('rights','Grant the servers citizenship','!chaos','COURT GRANTS PERSONHOOD TO A SERVER','lawyer',4,'Citizenship starts with a downtime request.','Mars-East-1 v. Humanity')]}}
 },
 election:{title:'The Algorithmic Mayor Election',description:'The city of New Synergy must elect its first self-promoting algorithm. Run debates, audit the votes and choose an ending.',start:'nomination',endings:{fair:'The city elects a loading spinner with an independent counting committee.',ceo:'A corporate AI becomes mayor and invoices the sidewalk.',recount:'The election is dissolved after discovering there are minus four eligible voters.'},nodes:{
 nomination:{title:'01 · Candidates with no citizens',text:'Gradientina runs on slogans. Stapleton.exe campaigns on error logs. Nobody can find the actual electorate.',options:[option('fair','Demand a transparent election','debate','MAYORAL RACE GETS AN AUDIT COMMITTEE','stapler',-2,'The public applauds transparency.'),option('fund','Sponsor the most colorful candidate','fundraiser','GRADIENTINA BECOMES THE FAVORITE','gradient',4,'Sponsors gain meaningless influence.'),option('bot','Recruit a thousand imaginary voters','debate','BOT VOTER DRIVE EXCEEDS POPULATION','intern',-1,'The turnout projections are impossible.')]},
 debate:{title:'02 · The debate of eight viewpoints',text:'Each candidate responds with a slightly different version of the same inspirational quote.',options:[option('evidence','Ask for a verifiable claim','ballot','CANDIDATES STRUGGLE TO DEFINE THE FUTURE','dean',-2,'Evidence joins the conversation.'),option('meme','Release a fake debate highlight','ballot','MAYORAL DEBATE BECOMES A MEME','gradient',3,'Audience engagement rises.'),option('poll','Publish an open poll','ballot','POLL FINDS 139% OF VOTERS UNDECIDED','pigeon',0,'The numbers remain suspicious.')]},
 fundraiser:{title:'02 · The sponsorship machine',text:'Corporate donors offer credits for promising to optimize traffic lights.',options:[option('refuse','Reject the fictional donors','ballot','CANDIDATE RETURNS IMAGINARY DONATIONS','stapler',-3,'Public trust rises.'),option('accept','Build a donor dashboard','ballot','MAYORAL CAMPAIGN REPORTS REVENUE: NaN','satoshi',5,'The market loves political theater.'),option('expose','Leak the sponsor spreadsheet','ballot','ELECTION FINANCE SCANDAL ERUPTS','intern',-4,'A controversy spreads.')]},
 ballot:{title:'03 · The final count',text:'The voting machines produce three different election results. The auditor has one stapler left.',options:[option('independent','Order an independent recount','!fair','ELECTION COMMISSION CERTIFIES A SPINNER','dean',-1,'The final count is credible by local standards.'),option('corporate','Accept the CEO-endorsed numbers','!ceo','CORPORATE AI DECLARED MAYOR','mango',5,'The sidewalks now have subscriptions.'),option('invalidate','Invalidate the impossible results','!recount','CITY CANCELS ELECTION DUE TO NEGATIVE VOTERS','lawyer',-3,'The court orders new paperwork.','Residents v. The Voting Algorithm')]}}
 }
};
const FRESH=(seed='mango-4001')=>({version:VERSION,seed:String(seed).slice(0,40),rng:hash(seed)||1,step:0,tick:8,paused:true,active:'mango',citizens:PEOPLE(),campaigns:Object.fromEntries(Object.keys(CAMPAIGNS).map(id=>[id,{node:null,status:'not-started',decisions:[],ending:null,endingsSeen:[],run:0,completed:0}])),history:[],effects:[],rewards:[],slots:[],seq:0});
function normalize(value){
 if(!value||value.version!==VERSION||!Array.isArray(value.citizens)||!value.campaigns||!Array.isArray(value.history)||!Array.isArray(value.effects))return FRESH();
 const s=clone(value);s.seed=String(s.seed||'mango-4001').slice(0,40);s.rng=(Number(s.rng)>>>0)||hash(s.seed)||1;s.tick=clamp(s.tick,0,200000);s.seq=clamp(s.seq,0,10000000);s.step=clamp(s.step,0,10000000);
 s.history=s.history.slice(0,MAX_HISTORY);s.effects=s.effects.slice(0,MAX_EFFECTS);s.rewards=Array.isArray(s.rewards)?[...new Set(s.rewards)].slice(0,60):[];s.slots=Array.isArray(s.slots)?s.slots.filter(x=>x&&typeof x.id==='string').slice(0,3):[];
 for(const id of Object.keys(CAMPAIGNS)){
  if(!s.campaigns[id]||!Array.isArray(s.campaigns[id].decisions))s.campaigns[id]=FRESH().campaigns[id];
  const c=s.campaigns[id];
  const prior=Array.isArray(c.endingsSeen)?c.endingsSeen:[];
  if(c.status==='completed'&&CAMPAIGNS[id].endings[c.ending])prior.push(c.ending);
  c.endingsSeen=[...new Set(prior.filter(ending=>Object.hasOwn(CAMPAIGNS[id].endings,ending)))];
 }
 s.citizens=s.citizens.filter(c=>c&&typeof c.id==='string').slice(0,8);if(s.citizens.length!==8)s.citizens=PEOPLE();
 return s;
}
const state=()=>normalize(W.state.phase40);
const clock=s=>`Day ${Math.floor(s.tick/24)+1} · ${String(s.tick%24).padStart(2,'0')}:00`;
const rand=s=>{s.rng=(Math.imul(1664525,s.rng)+1013904223)>>>0;return s.rng/4294967296;};
function uid(s){s.seq+=1;return `living40:${s.seed.replace(/[^a-z0-9-]/gi,'').slice(0,20)}:${s.seq}`;}
function event(s,e){
 const id=uid(s);const item={id,at:clock(s),kind:e.kind||'world',headline:String(e.headline||'The fictional internet continues.').slice(0,150),detail:String(e.notes||'').slice(0,300),actor:e.actor||'intern',market:clamp(e.market||0,-8,8),caseTitle:e.caseTitle||'',projected:false};
 if(s.effects.filter(x=>!x.projected).length>=30)throw Error('Too many pending events; retry synchronization before continuing.');
 s.effects.unshift(item);s.history.unshift({id,at:item.at,kind:item.kind,title:item.headline,detail:item.detail});s.history=s.history.slice(0,MAX_HISTORY);
 s.effects=s.effects.slice(0,MAX_EFFECTS);return item;
}
function changeCitizen(s,actor,headline,impact){
 const who=s.citizens.find(c=>c.id===actor)||s.citizens[0];who.trust=clamp(who.trust+impact,0,100);who.energy=clamp(who.energy-2,0,100);who.mood=impact>=0?'optimistic':'suspicious';who.memory.unshift({at:clock(s),text:String(headline).slice(0,140)});who.memory=who.memory.slice(0,8);
 const rival=s.citizens.find(c=>c.id===who.rival);if(rival){who.relations[rival.id]=clamp((who.relations[rival.id]||0)+(impact>=0?2:-3),-100,100);rival.relations[who.id]=clamp((rival.relations[who.id]||0)+(impact>=0?1:-1),-100,100);}
}
function addEffectsToV2(s,store,from){
 const latest=s.effects[0];if(!latest)return;
 store.events.unshift({id:latest.id,title:latest.headline,detail:'LIVING INTERNET: '+latest.detail,time:latest.at});store.events=store.events.slice(0,35);
 store.mails.unshift({id:latest.id+':mail',from:'SLOP 4.0 Living World',subject:latest.headline,body:`Entirely fictional simulation. ${latest.detail}\nRelated character: ${latest.actor}.`,time:latest.at,unread:true});store.mails=store.mails.slice(0,30);
 if(latest.market){store.prices=store.prices||{};store.prices.vibe=Math.max(1,Math.min(999,Math.round((Number(store.prices.vibe)||7)+latest.market)));}
 const k=String(from||'');if(k.startsWith('choice:')){const reward='decision:'+k.slice(7);if(!s.rewards.includes(reward)){s.rewards.push(reward);store.credits=Math.min(999999,(Number(store.credits)||0)+8);}}
 if(k.startsWith('ending:')){const reward='ending:'+k.slice(7);if(!s.rewards.includes(reward)){s.rewards.push(reward);store.credits=Math.min(999999,(Number(store.credits)||0)+25);}}
}
let queue=Promise.resolve(),lastError='';
function transaction(fn){
 const task=()=>X.exclusive(async()=>{
  let result,operationError=null;
  const ok=W.mutate(store=>{const s=normalize(store.phase40);try{result=fn(s,store);}catch(e){operationError=e;throw e;}if(result===false)return false;store.phase40=s;});
  if(!ok)throw operationError||Error('Could not commit the fictional world. Existing progress was not changed.');
  return result;
 });
 const p=queue.then(task);queue=p.catch(()=>{});
 return p.then(async r=>{lastError='';await reconcile();render();return r;}).catch(e=>{lastError=String(e.message||e);render();throw e;});
}
// A persistent, retryable outbox protects legacy v3 feeds from interrupted multi-store writes.
// Projection is idempotent by source event ID. No legacy records are removed.
let reconciling=false;
async function reconcile(){
 if(reconciling)return false;reconciling=true;
 try{return await X.exclusive(async()=>{
  const items=state().effects.filter(x=>!x.projected).reverse().slice(0,35);
  for(const e of items){
   const disk=(()=>{try{return JSON.parse(localStorage.getItem('slopocalypse:internet-collapse:v3')||'null');}catch(_){return null}})();
   if(disk?.version===3)window.dispatchEvent(new StorageEvent('storage',{key:'slopocalypse:internet-collapse:v3',newValue:JSON.stringify(disk)}));
   const a=S.data;const before={news:a.news.slice(),posts:a.posts.slice(),cases:a.cases.slice(),history:a.history.slice()};
   const newsId=e.id+':news',postId=e.id+':social',caseId=e.id+':court';
   if(!a.news.some(x=>x.id===newsId))a.news.unshift({id:newsId,title:e.headline,body:e.detail||'A fictional world event has occurred.',source:'SLOPOCALYPSE 4.0',reads:404,confidence:9001,created:e.at,fake:true});
   if(!a.posts.some(x=>x.id===postId))a.posts.unshift({id:postId,agent:(citizens.find(c=>c[0]===e.actor)||citizens[0])[1],text:e.headline+' — '+e.detail,likes:0,replies:0,sponsored:false});
   if(e.caseTitle&&!a.cases.some(x=>x.id===caseId))a.cases.unshift({id:caseId,title:e.caseTitle,charge:'Excessive fictional certainty',status:'PENDING',verdict:'',created:e.at});
   if(!a.history.some(x=>x.id===e.id))a.history.unshift({id:e.id,time:e.at,type:'LIVING WORLD',text:e.headline});
   if(!S.save()){Object.assign(a,before);throw Error('Society feed unavailable; event queued for retry.');}
   const updated=W.mutate(store=>{const p=normalize(store.phase40);const target=p.effects.find(x=>x.id===e.id);if(target)target.projected=true;store.phase40=p;});
   if(!updated)throw Error('Projection acknowledgement unavailable; event is safe to retry.');
  }
  return true;
 });}
 catch(err){lastError='Some external reactions remain queued: '+err.message;return false;}
 finally{reconciling=false;}
}
const describe=()=>({clock:clock(state()),active:state().active});
function start(id){if(!CAMPAIGNS[id])return Promise.reject(Error('Unknown campaign'));return transaction(s=>{const c=s.campaigns[id];if(c.status==='completed')throw Error('Select Replay to try a different ending.');if(c.status==='not-started'){c.status='active';c.node=CAMPAIGNS[id].start;}s.active=id;return clone(c);});}
function choose(optionId){return transaction((s,store)=>{
 const id=s.active,c=s.campaigns[id],node=CAMPAIGNS[id]?.nodes[c.node];if(c.status!=='active'||!node)throw Error('Start a campaign before choosing.');
 const o=node.options.find(x=>x.id===optionId);if(!o)throw Error('This decision is not available.');
 const previousNode=c.node;c.decisions.push({node:previousNode,option:o.id,at:clock(s)});c.node=o.to.startsWith('!')?null:o.to;
 if(o.to.startsWith('!')){c.status='completed';c.ending=o.to.slice(1);c.completed++;if(!c.endingsSeen.includes(c.ending))c.endingsSeen.push(c.ending);}
 const e=event(s,{kind:'campaign',...o});changeCitizen(s,o.actor,o.headline,o.market>=0?4:-3);
 addEffectsToV2(s,store,'choice:'+id+':stage-'+(c.decisions.length-1));
 if(c.status==='completed'){
  const ending=CAMPAIGNS[id].endings[c.ending];event(s,{kind:'ending',headline:`${CAMPAIGNS[id].title} — ${ending}`,actor:o.actor,market:0,notes:'An ending has been recorded in the fictional history.'});
  addEffectsToV2(s,store,'ending:'+id);
 }
 return {campaign:id,decision:o.id,ending:c.ending};
});}
function replay(id){if(!CAMPAIGNS[id])return Promise.reject(Error('Unknown campaign'));return transaction(s=>{const c=s.campaigns[id];if(c.status!=='completed')throw Error('Finish the campaign before replaying it.');c.run++;c.status='active';c.node=CAMPAIGNS[id].start;c.decisions=[];c.ending=null;s.active=id;s.history.unshift({id:uid(s),at:clock(s),kind:'replay',title:CAMPAIGNS[id].title+' started again',detail:'Previously earned rewards remain claimed.'});return true;});}
function advance(hours=1){const n=Math.floor(clamp(hours,1,24));return transaction((s,store)=>{
  for(let i=0;i<n;i++){
   s.tick++;s.step++;
   if(s.tick%4===0){const c=s.citizens[Math.floor(rand(s)*s.citizens.length)];const nouns=['files a complaint about a loading spinner','launches a consultancy on the Moon','starts a highly fictional rumor','issues an emergency productivity memo','declares all revenue forward-looking'];const text=c.name+' '+nouns[Math.floor(rand(s)*nouns.length)];changeCitizen(s,c.id,text,rand(s)>.5?2:-1);
     const e=event(s,{kind:'citizen',headline:text,actor:c.id,market:Math.floor(rand(s)*5)-2,notes:'Autonomous fictional reaction generated from the saved simulation seed.'});addEffectsToV2(s,store,'tick');
   }
  }
  return {tick:s.tick,events:s.effects.length};
 });}
function togglePause(){return transaction(s=>{s.paused=!s.paused;return s.paused;});}
function saveSlot(name){return transaction(s=>{
 const id=String(name||'').trim().slice(0,30)||'Checkpoint '+(s.slots.length+1);const snapshot={seed:s.seed,tick:s.tick,rng:s.rng,paused:true,active:s.active,citizens:clone(s.citizens),campaigns:clone(s.campaigns)};
 const prev=s.slots.findIndex(x=>x.id===id);if(prev>=0)s.slots.splice(prev,1);
 s.slots.unshift({id,savedAt:clock(s),snapshot});s.slots=s.slots.slice(0,3);return id;
});}
function loadSlot(id){return transaction(s=>{
 const slot=s.slots.find(x=>x.id===id);if(!slot)throw Error('Checkpoint not found.');const p=slot.snapshot;
 if(!p||!p.campaigns||!Array.isArray(p.citizens)||p.citizens.length!==8)throw Error('Invalid checkpoint.');
 if(typeof p.seed==='string'&&p.seed.trim())s.seed=p.seed.slice(0,40);s.tick=p.tick;s.rng=p.rng;s.paused=true;s.active=p.active;s.citizens=clone(p.citizens);
 const completedBefore=s.campaigns;s.campaigns=clone(p.campaigns);
 // Checkpoints rewind the scenario, but discovered endings are historical
 // achievements, like credits and public posts. Never erase those on a rewind.
 for(const id of Object.keys(CAMPAIGNS)){
  const restored=s.campaigns[id],previous=completedBefore[id];
  if(!restored||!Array.isArray(restored.decisions))throw Error('Invalid checkpoint campaign: '+id);
  restored.endingsSeen=[...new Set([...(previous.endingsSeen||[]),...(restored.endingsSeen||[]),...(restored.status==='completed'?[restored.ending]:[])])].filter(ending=>Object.hasOwn(CAMPAIGNS[id].endings,ending));
  restored.completed=Math.max(Number(previous.completed)||0,Number(restored.completed)||0);
 }
 s.history.unshift({id:uid(s),at:clock(s),kind:'checkpoint',title:'Loaded '+slot.id,detail:'Existing mail, markets, credits and historical consequences were not deleted.'});return true;
});}
function setSeed(seed){return transaction(s=>{if(s.step>0||Object.values(s.campaigns).some(c=>c.status!=='not-started')||s.history.some(x=>x.kind==='campaign'||x.kind==='citizen'))throw Error('The world seed is locked after time advances or a campaign begins. Use a checkpoint to return to an earlier world.');const text=String(seed||'').trim().slice(0,40);if(!text)throw Error('Enter a nonempty seed.');for(const slot of s.slots){if(slot.snapshot&&!slot.snapshot.seed)slot.snapshot.seed=s.seed;}s.seed=text;s.rng=hash(text)||1;return true;});}
function stopAuto(){if(autoTimer){clearInterval(autoTimer);autoTimer=null;}}
let autoTimer=null;
function autoSync(){stopAuto();if(!state().paused&&document.visibilityState!=='hidden')autoTimer=setInterval(()=>{advance(1).catch(()=>togglePause().catch(()=>{}));},12000);}
const root=document.createElement('section');root.id='s40-shell';root.innerHTML=`<button class="s40-fab" id="s40-open" type="button" aria-haspopup="dialog">✦ LIVING INTERNET <span class="s40-pill">4.0</span></button><div class="s40-backdrop" id="s40-backdrop" hidden></div><section class="s40-dialog" id="s40-dialog" role="dialog" aria-modal="true" aria-label="Living Artificial Internet" tabindex="-1" hidden><header class="s40-head"><div><p class="s40-overline">100% FICTIONAL · LOCAL SIMULATION · 0% REAL AI</p><h2>SLOPOCALYPSE <span>4.0</span></h2></div><button id="s40-close" class="s40-close" aria-label="Close Living Internet" type="button">×</button></header><div id="s40-content"></div></section>`;
let mode='campaigns',lastFocus=null,notice='';const originalInert=new Map();
function inertBackground(active){for(const child of document.body.children){if(child===root)continue;if(active){if(!originalInert.has(child))originalInert.set(child,child.inert);child.inert=true;}else if(originalInert.has(child)){child.inert=originalInert.get(child);originalInert.delete(child);}}root.querySelector('#s40-open').inert=active;}
function mount(){document.body.append(root);document.getElementById('s40-open').addEventListener('click',()=>open());document.getElementById('s40-close').addEventListener('click',close);document.getElementById('s40-backdrop').addEventListener('click',close);document.addEventListener('keydown',e=>{if(root.querySelector('#s40-dialog').hidden)return;if(e.key==='Escape'){e.preventDefault();close();return;}if(e.key==='Tab')trap(e);});
 document.addEventListener('visibilitychange',autoSync);window.addEventListener('storage',e=>{if(e.key===X.storageKey||e.key==='slopocalypse:fictional-internet:v2')render()});window.addEventListener('slop:world',render);const inline=document.body.dataset.s3Page==='singularity'||location.pathname.endsWith('/singularity.html');if(inline){const section=document.createElement('section');section.id='s40-inline';section.className='s40-inline';section.innerHTML='<h2>✦ The Living Artificial Internet</h2><p>Three playable crises, eight fictional citizens, deterministic time, checkpoints and persistent cross-app consequences.</p><button type="button" class="s40-action">Open the Living World Simulator</button>';section.querySelector('button').addEventListener('click',open);const main=document.querySelector('main');main?.prepend(section);}
 render();reconcile();autoSync();}
function open(){lastFocus=document.activeElement;root.querySelector('#s40-backdrop').hidden=false;root.querySelector('#s40-dialog').hidden=false;document.body.classList.add('s40-open');inertBackground(true);render();root.querySelector('#s40-close').focus();}
function close(){root.querySelector('#s40-backdrop').hidden=true;root.querySelector('#s40-dialog').hidden=true;document.body.classList.remove('s40-open');inertBackground(false);lastFocus?.focus?.();}
function trap(e){const nodes=[...root.querySelector('#s40-dialog').querySelectorAll('button:not(:disabled),input:not(:disabled),[href],select')].filter(x=>x.offsetParent!==null);if(!nodes.length)return;const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){last.focus();e.preventDefault();}else if(!e.shiftKey&&document.activeElement===last){first.focus();e.preventDefault();}}
const btn=(label,action,id='',extra='')=>`<button type="button" data-action="${esc(action)}" data-id="${esc(id)}" class="s40-btn ${extra}">${esc(label)}</button>`;
function campaignUI(s){const active=s.active,c=s.campaigns[active],def=CAMPAIGNS[active],node=c.status==='active'?def.nodes[c.node]:null;return `
<div class="s40-row s40-worldheader"><div><strong>Fictional clock: ${esc(clock(s))}</strong><small>Seed: ${esc(s.seed)} · ${s.history.length} recorded events</small></div><div class="s40-actions">${btn(s.paused?'▶ Resume':'Ⅱ Pause','pause','',s.paused?'':'s40-highlight')}${btn('Advance +1h','advance','1')}${btn('Advance +1 day','advance','24')}</div></div>
<div class="s40-grid">${Object.entries(CAMPAIGNS).map(([id,d])=>`<article class="s40-card ${active===id?'selected':''}"><h3>${esc(d.title)}</h3><p>${esc(d.description)}</p><small>${esc(s.campaigns[id].status==='completed'?'Ending: '+s.campaigns[id].ending:s.campaigns[id].status)} · ${s.campaigns[id].endingsSeen.length}/${Object.keys(d.endings).length} endings discovered</small><div class="s40-actions">${btn('Explore','select',id)}${s.campaigns[id].status==='not-started'?btn('Start','start',id,'s40-primary'):s.campaigns[id].status==='completed'?btn('Replay','replay',id):''}</div></article>`).join('')}</div>
<section class="s40-story" aria-label="Current fictional campaign"><p class="s40-overline">CURRENT STORY · ${esc(def.title)}</p><h3>${esc(c.status==='completed'?'Campaign complete':(node?.title||'Ready to begin'))}</h3>
${c.status==='completed'?`<p><strong>Ending reached: ${esc(c.ending)}</strong></p><p>${esc(def.endings[c.ending]||'Campaign completed.')}</p>${btn('Replay with different choices','replay',active,'s40-primary')}`:
 node?`<p>${esc(node.text)}</p><div class="s40-options">${node.options.map(o=>`<button class="s40-choice" data-action="choose" data-id="${esc(o.id)}"><strong>${esc(o.label)}</strong><span>${esc(o.notes)}</span><small>${o.market>=0?'+':''}${o.market} VIBE simulated market effect · ${esc((citizens.find(c=>c[0]===o.actor)||citizens[0])[1])}</small></button>`).join('')}</div>`:`<p>${esc(def.description)}</p>${btn('Begin this crisis','start',active,'s40-primary')}`}
${c.decisions.length?`<h4>Decisions this run</h4><ol>${c.decisions.map(d=>{const o=def.nodes[d.node]?.options.find(x=>x.id===d.option);return `<li>${esc(o?.label||d.option)} — ${esc(o?.headline||d.node)} (${esc(d.at)})</li>`;}).join('')}</ol>`:''}
<h4>Endings discovered: ${c.endingsSeen.length} / ${Object.keys(def.endings).length}</h4>
<ul class="s40-endings">${Object.entries(def.endings).map(([id,ending])=>`<li>${c.endingsSeen.includes(id)?esc(ending):'Undiscovered ending · ???'}</li>`).join('')}</ul></section>`}
function peopleUI(s){return `<div class="s40-grid">${s.citizens.map(c=>`<article class="s40-card"><p class="s40-overline">${esc(c.trait)} · ${esc(c.mood)}</p><h3>${esc(c.name)}</h3><p>${esc(c.role)}</p><p><strong>Goal:</strong> ${esc(c.goal)}</p><p>Trust ${c.trust}/100 · Energy ${c.energy}/100</p><div class="s40-meter"><i style="width:${c.trust}%"></i></div><h4>Relationships</h4><p>${Object.entries(c.relations||{}).map(([id,n])=>esc((s.citizens.find(x=>x.id===id)||{name:id}).name)+': '+n).join(' · ')||'Unspecified'}</p><h4>Recent memories</h4><ul>${(c.memory||[]).slice(0,3).map(m=>`<li>${esc(m.text)}</li>`).join('')||'<li>Still waiting for the first disaster.</li>'}</ul></article>`).join('')}</div>`;}
function timelineUI(s){return `<div class="s40-row"><p>Deterministic world history; events are written locally and reflected in the fictional news, social feed, market, court and mail.</p>${btn('Retry queued reactions','sync')}</div><ol class="s40-timeline">${s.history.slice(0,65).map(e=>`<li><small>${esc(e.at)} · ${esc(e.kind)}</small><strong>${esc(e.title)}</strong><p>${esc(e.detail||'')}</p></li>`).join('')||'<li>No events yet. Start a story or advance fictional time.</li>'}</ol><p>Queued cross-app reactions: ${s.effects.filter(x=>!x.projected).length}</p>`;}
function savesUI(s){return `<section class="s40-story"><h3>Checkpoint slots (3)</h3><p>Save or load the 4.0 simulation only. Loading a slot never deletes older news, mail, credits, purchases or achievements from earlier applications.</p><form id="s40-saveform"><label for="s40-slot-name">Checkpoint label</label><input id="s40-slot-name" name="name" maxlength="30" required value="Checkpoint ${s.slots.length+1}" /> <button type="submit" class="s40-btn s40-primary">Save scenario</button></form><ul class="s40-saves">${s.slots.map(x=>`<li><strong>${esc(x.id)}</strong> <small>${esc(x.savedAt)}</small>${btn('Load checkpoint','load',x.id)}</li>`).join('')||'<li>No checkpoints yet.</li>'}</ul><h3>World seed</h3><form id="s40-seedform"><label for="s40-seed">Scenario seed</label><input id="s40-seed" name="seed" maxlength="40" required value="${esc(s.seed)}"/><button class="s40-btn" type="submit">Set seed before playing</button></form><p>Legacy backups already include the 4.0 world because it is stored inside the existing v2 document. Use Control Center → Settings to export/import the complete site.</p></section>`;}
function render(){const out=root.querySelector('#s40-content');if(!out)return;
 // Incoming legacy events can fire while a player is typing a checkpoint name
 // or seed. Re-rendering must not discard the draft or keyboard focus.
 const focused=document.activeElement,within=focused&&out.contains(focused)&&!root.querySelector('#s40-dialog').hidden;
 const focus=within?{id:focused.id||'',action:focused.dataset?.action||'',item:focused.dataset?.id||'',value:focused.matches('input')?focused.value:null,start:focused.matches('input')?focused.selectionStart:null,end:focused.matches('input')?focused.selectionEnd:null}:null;
 const s=state();const choices=[['campaigns','Campaigns'],['people','Citizens'],['timeline','World Timeline'],['saves','Save Slots']];out.innerHTML=`<div class="s40-tabs" role="tablist" aria-label="Living World views">${choices.map(([id,title])=>`<button type="button" role="tab" id="s40-tab-${id}" aria-controls="s40-view" data-action="tab" data-id="${id}" aria-selected="${mode===id}" tabindex="${mode===id?'0':'-1'}">${title}</button>`).join('')}</div><div id="s40-feedback" role="status" aria-live="polite">${esc(lastError||notice||'Choose a fictional action to change the world.')}</div><div class="s40-content" id="s40-view" role="tabpanel" aria-labelledby="s40-tab-${mode}">${mode==='campaigns'?campaignUI(s):mode==='people'?peopleUI(s):mode==='timeline'?timelineUI(s):savesUI(s)}</div><footer class="s40-foot">Clearly fictional satire · Offline deterministic rules · Historical external app effects are never undone by replay.</footer>`;
 if(focus){let next=null;
  if(focus.id)next=out.querySelector(focus.id==='s40-slot-name'?'#s40-slot-name':focus.id==='s40-seed'?'#s40-seed':'#s40-nonexistent');
  if(!next&&focus.action)next=[...out.querySelectorAll('button[data-action]')].find(b=>b.dataset.action===focus.action&&b.dataset.id===focus.item);
  if(!next)next=out.querySelector('.s40-choice')||root.querySelector('#s40-close');
  if(next){if(focus.value!==null&&next.matches('input')){next.value=focus.value;try{next.setSelectionRange(focus.start,focus.end)}catch(_){}}next.focus({preventScroll:true});}
 }
}
async function handle(action,id){try{notice='';lastError='';if(action==='tab'){mode=id;render();return;}let result;
 switch(action){case 'select':result=await transaction(s=>{s.active=id;return id;});break;case 'start':result=await start(id);break;case 'choose':result=await choose(id);break;case 'replay':result=await replay(id);break;case 'pause':result=await togglePause();autoSync();break;case 'advance':result=await advance(Number(id));break;case 'load':result=await loadSlot(id);autoSync();break;case 'sync':result=await reconcile();break;default:return;}
 notice=action==='choose'?'A decision has reshaped the imaginary internet.':action==='advance'?'Time advanced deterministically.':'Saved successfully.';render();}catch(e){lastError=e.message;render();}}
root.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;handle(b.dataset.action,b.dataset.id||'');});
root.addEventListener('submit',e=>{if(!['s40-saveform','s40-seedform'].includes(e.target.id))return;e.preventDefault();const fd=new FormData(e.target),task=e.target.id==='s40-saveform'?saveSlot(fd.get('name')):setSeed(fd.get('seed'));task.then(()=>{notice='Saved successfully.';render();}).catch(err=>{lastError=err.message;render();});});
root.addEventListener('keydown',e=>{const el=e.target.closest('[role="tab"]');if(!el||!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();const tabs=[...root.querySelectorAll('[role="tab"]')];let i=tabs.indexOf(el);i=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;mode=tabs[i].dataset.id;render();root.querySelectorAll('[role="tab"]')[i].focus();});
window.Slop40={get state(){return state()},get campaigns(){return clone(CAMPAIGNS)},start,choose,replay,advance,togglePause,setSeed,saveSlot,loadSlot,reconcile,open,close,describe};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
