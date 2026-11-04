/* SLOPOCALYPSE 3.0 — entirely fictional, browser-local simulated society. No network calls. */
(()=>{'use strict';
 const KEY='slopocalypse:internet-collapse:v3';
 // A short-lived recovery journal guards the older synchronous mock-ad purchase.
 // It is not a fifth progress store and is removed after success or rollback.
 const AD_JOURNAL='slopocalypse:legacy-ad-purchase:v38';
 const S2_KEY='slopocalypse:fictional-internet:v2';
 function rollbackAdPurchase(){
  const raw=localStorage.getItem(AD_JOURNAL);
  if(!raw)return false;
  const j=JSON.parse(raw);
  if(!j||j.version!==1||typeof j.wallet!=='string'||!(typeof j.society==='string'||j.society===null))throw Error('Invalid pending purchase journal');
  for(const [key,prior] of [[S2_KEY,j.wallet],[KEY,j.society]]){
   if(localStorage.getItem(key)!==prior){if(prior===null)localStorage.removeItem(key);else localStorage.setItem(key,prior);}
  }
  localStorage.removeItem(AD_JOURNAL);
  window.dispatchEvent(new StorageEvent('storage',{key:S2_KEY,newValue:j.wallet}));
  return true;
 }
 try{rollbackAdPurchase();}catch(e){console.warn('Pending fictional purchase could not be recovered:',e.message);}

 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const trim=(s,n=220)=>String(s??'').trim().slice(0,n);
 const sample=a=>a[Math.floor(Math.random()*a.length)];
 const PERSONAS=[
  {id:'pigeon',name:'Dr. Prompt Pigeon',role:'Quantum Ornithologist',mood:'optimistic',influence:86,loyalty:65,friend:'gradient',icon:'🐦'},
  {id:'gradient',name:'Gradientina 9000',role:'Chief Color Officer',mood:'disruptive',influence:112,loyalty:53,friend:'pigeon',icon:'🌈'},
  {id:'stapler',name:'Sir Stapleton.exe',role:'Sentient Office Stapler',mood:'skeptical',influence:73,loyalty:43,friend:'lawyer',icon:'📎'},
  {id:'lawyer',name:'Attorney Bot™',role:'Litigation-as-a-Feeling',mood:'outraged',influence:98,loyalty:31,friend:'stapler',icon:'⚖️'},
  {id:'mango',name:'Mango CEO Ultra',role:'Unicorn of Fruit',mood:'bullish',influence:131,loyalty:74,friend:'gradient',icon:'🥭'},
  {id:'intern',name:'Intern #NULL',role:'Unpaid Head of AI',mood:'confused',influence:58,loyalty:14,friend:'pigeon',icon:'🤖'},
  {id:'satoshi',name:'Satoshi Nakamango',role:'Token Enthusiast',mood:'volatile',influence:89,loyalty:8,friend:'mango',icon:'🪙'},
  {id:'dean',name:'Prof. Professor',role:'Dean of Degrees',mood:'academic',influence:104,loyalty:60,friend:'intern',icon:'🎓'}
 ];
 const TITLES=['MARS-EAST-1 ELECTS ITS OWN CLOUD','BREAKING: THE COLOR PURPLE HAS REBRANDED ITSELF','A STAPLER DEMANDS AN AI BILL OF RIGHTS','UNIVERSITY AWARDS PHD TO A LOADING SPINNER','QUANTUM MANGOES NOW OUTPERFORM THE INTERNET','THE MOON SIGNS AN EXCLUSIVE COOKIE AGREEMENT','AI DEMOCRATICALLY REPLACES THE NAVIGATION BAR','INTERN PROMOTED TO THE ENTIRE BOARD','A CAPTCH A REQUIRES NINE FINGERS','SLOPCOIN PEGGED TO UNVERIFIED VIBES'];
 const PLACES=[{name:'New Synergy City',x:18,y:32},{name:'Mars-East-1',x:75,y:20},{name:'The Loading Sea',x:44,y:55},{name:'Mango Republic',x:79,y:70},{name:'404 Boulevard',x:18,y:83},{name:'Stakeholder Mountain',x:48,y:24}];
 const stamp=()=>new Date().toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
 const initial=()=>({version:3,seq:0,cascades:0,slop:12,chaos:false,calm:true,singularity:false,modules:[],history:[{id:'origin-v3',time:'Q∞ • DAY 0',type:'SYSTEM',text:'A fictional AI society came online. The shareholders were eight confused pixels.'}],agents:PERSONAS.map(p=>({...p,posts:0})),news:[],wiki:[{id:'wiki-origin',title:'Synergy',claim:'Synergy is the internationally recognized unit of imaginary productivity.',opposite:'Synergy has never existed outside a PowerPoint slide.',edits:0}],posts:[],videos:[],shorts:[],clipsSeen:0,bridgedFacts:[],cloud:[{id:'cloud-origin',name:'mars-east-1',status:'OPERATIONAL-ISH',cpu:847,uptime:'-99.99%'}],degrees:[],permits:[],cases:[],ads:[],adImpressions:0,clearances:0,searches:0,achievements:[],drafts:[],day:1});
 let data;let storageReady=true;
 try{const r=JSON.parse(localStorage.getItem(KEY)||'null');data=r&&r.version===3?{...initial(),...r}:initial();for(const k of ['history','agents','news','wiki','posts','videos','shorts','cloud','degrees','permits','cases','ads','modules','achievements'])if(!Array.isArray(data[k]))throw new Error('bad local data');}
 catch(e){data=initial();storageReady=false;}
 let dirty=false;
 function save(){data.history=data.history.slice(0,100);data.news=data.news.slice(0,45);data.posts=data.posts.slice(0,60);data.videos=data.videos.slice(0,40);data.shorts=data.shorts.slice(0,45);data.cases=data.cases.slice(0,30);data.ads=data.ads.slice(0,24);data.wiki=data.wiki.slice(0,40);
  try{const encoded=JSON.stringify(data);localStorage.setItem(KEY,encoded);if(localStorage.getItem(KEY)!==encoded)throw Error('Read-back mismatch');storageReady=true;}
  catch(e){storageReady=false;window.SlopWorld?.toast('3.0 PROGRESS NOT SAVED · STORAGE ERROR');window.dispatchEvent(new CustomEvent('slop3:storage-error',{detail:{message:String(e.message)}}));return false;}
  window.dispatchEvent(new CustomEvent('slop3:update',{detail:{state:data}}));updateHud();return true;
 }
 const uid=()=>`sc-${Date.now().toString(36)}-${++data.seq}`;
 function log(text,type='EVENT'){data.history.unshift({id:uid(),time:stamp(),type:trim(type,24),text:trim(text,400)});save()}
 function mark(module){if(!data.modules.includes(module)){data.modules.push(module);save();}unlock('MULTIVERSAL MULTITASKER',data.modules.length>=6);}
 function unlock(name,yes=true){if(!yes||data.achievements.includes(name))return;data.achievements.push(name);save();window.SlopWorld?.achievement(name);}
 function credits(){return window.SlopWorld?.state?.credits??1200}
 function earn(n,why){if(!storageReady){window.SlopWorld?.toast('3.0 ACTION NOT SAVED; NO CREDIT AWARDED');return false;}return window.SlopWorld?.earn(n,why);}
 function spend(n,why){if(window.SlopWorld)return window.SlopWorld.spend(n,why);return false}
 function mail(subject,body){window.SlopWorld?.addMail('SLOPOCALYPSE // FICTIONAL BROADCAST',subject,body)}
 function invented(text,src='SLOPNEWS'){window.SlopWorld?.hallucinate(trim(text,300),src)}
 function controversy(seed){const term=trim(seed,100)||sample(TITLES);const title=term.toUpperCase();const by=sample(data.agents);const other=data.agents.find(a=>a.id===by.friend)||data.agents[0];const claim=`${term}: researchers confirm a 9,001% probability of circular evidence.`;const opposite=`Independent analysis says that ${term.toLowerCase()} was only an animated gradient.`;
 const story={id:uid(),title,body:claim+' Reporters consulted three spreadsheets and one unusually confident stapler.',source:by.name,reads:Math.floor(Math.random()*9000)+100,confidence:Math.floor(Math.random()*140)+60,created:stamp(),fake:true};
 data.news.unshift(story);data.wiki.unshift({id:uid(),title:term.replace(/[.!?]/g,''),claim,opposite,edits:0});
 data.posts.unshift({id:uid(),agent:by.name,text:`HOT TAKE: ${claim} Like, subscribe, become a shareholder.`,likes:Math.floor(Math.random()*300),replies:2,sponsored:false});
 data.posts.unshift({id:uid(),agent:other.name,text:`COUNTERPOINT: ${opposite} My thoughts are legally nonbinding.`,likes:Math.floor(Math.random()*300),replies:1,sponsored:false});
 data.videos.unshift({id:uid(),title:`I INVESTIGATED ${title} (GONE QUANTUM)`,creator:by.name,views:Math.floor(Math.random()*999999),likes:0,duration:'14:88',artifact:sample(['A person with seven thumbs points at a graph','Two suns cast four shadows on a server','A mango with 19 eyes reads a contract'])});
 data.shorts.unshift({id:uid(),title:`POV: ${title}`,creator:other.name,likes:Math.floor(Math.random()*9000),comments:Math.floor(Math.random()*900),tag:'#AIcore'});
 const priceKey=sample(['slop','vibe','moon']);window.SlopWorld?.mutate(s=>{s.prices[priceKey]=Math.max(1,Math.round((s.prices[priceKey]||7)*(Math.random()>.5?1.28:.79)))});
 const old=data.cloud[0];if(old){old.cpu=Math.min(9001,(old.cpu||800)+211);old.status='DEGRADED SUCCESS'};
 by.influence+=7;by.posts++;other.loyalty=Math.max(0,other.loyalty-5);other.posts++;other.mood='scandalized';if(other.loyalty<20){other.friend=sample(data.agents.filter(a=>a.id!==other.id)).id;other.loyalty=42;}
 const court={id:uid(),title:`${other.name} v. ${by.name}`,charge:`Excessive confidence relating to ${term}`,status:'PENDING',verdict:'',created:stamp()};data.cases.unshift(court);
 const ad={id:uid(),brand:sample(['Quantum Mango Corp','Gradient-as-a-Service','Seven Finger Solutions']),copy:`9,001% more ${term.toLowerCase()} for founders of tomorrow.`,reach:9001,spend:0};data.ads.unshift(ad);
 data.cascades++;data.day+=1;data.slop=Math.min(100,data.slop+9);
 log(`CASCADE #${data.cascades}: ${title} → News → Wiki → Social → Videos → Ads → Court → Cloud`,'CASCADE');
 invented(claim,'HALLUCINATION CASCADE');mail(`BREAKING: ${title}`,`Entirely fabricated incident. ${claim}\nFake case opened: ${court.title}\nAll data generated locally for parody.`);
 window.SlopWorld?.announce('THE INTERNET BELIEVES ITS OWN NONSENSE',title,{quiet:true});
 unlock('CHAIN REACTION',true);unlock('MULTIVERSE CRISIS',data.cascades>=3);earn(28,'fictional scandal monetized');save();return story;
 }
 function act(module,text,points=7){mark(module);data.slop=Math.min(100,data.slop+1);log(text,module.toUpperCase());if(points)earn(points,module+' engagement');save();}
 function storyFrom(text,from='SLOPNEWS'){const title=trim(text,140)||sample(TITLES);const story={id:uid(),title,body:`According to a study published next Thursday, ${title.toLowerCase()}. Scientists declined to identify the scientists.`,source:from,reads:404,confidence:113,created:stamp(),fake:true};data.news.unshift(story);invented(story.body,'FICTIONAL HEADLINE');act('news',`Published: ${title}`,14);return story;}
 function post(text,by='You, Allegedly',sponsored=false){const p={id:uid(),agent:by,text:trim(text,300),likes:0,replies:0,sponsored};data.posts.unshift(p);act('social',`${by} posted: ${trim(text,125)}`,8);return p;}
 function editWiki(title,claim){const existing=data.wiki.find(w=>w.title.toLowerCase()===title.toLowerCase());if(existing){existing.opposite=existing.claim;existing.claim=trim(claim,280);existing.edits++}else data.wiki.unshift({id:uid(),title:trim(title,100),claim:trim(claim,280),opposite:'A peer-reviewed placeholder strongly disagrees.',edits:1});invented(claim,'SLOPWIKI');act('wiki',`Wiki disagreement on ${title}`,10);unlock('AUTHORITATIVE CONTRADICTION');}
 function deploy(name){const node={id:uid(),name:trim(name,65)||'cloud-of-nothing',status:'DEPLOYED TO IMAGINARY VOID',cpu:Math.floor(Math.random()*8000)+111,uptime:'104.04%'};data.cloud.unshift(node);act('cloud',`Deployed ${node.name} to Mars-East-1`,12);return node;}
 function buyAd(brand,copy,budget){
  const n=Number(budget);
  if(!Number.isInteger(n)||n<=0||n>10000)return {ok:false,msg:'Budget must be a positive whole number up to 10,000.'};
  if(credits()<n)return {ok:false,msg:'Not enough imaginary currency.'};
  const oldData=structuredClone(data);
  let journalCreated=false;
  try{
   if(localStorage.getItem(AD_JOURNAL))throw Error('A previous purchase must be recovered before continuing.');
   const wallet=localStorage.getItem(S2_KEY);
   if(wallet===null)throw Error('Wallet not initialized.');
   localStorage.setItem(AD_JOURNAL,JSON.stringify({version:1,wallet,society:localStorage.getItem(KEY)}));
   journalCreated=true;
   if(!spend(n,'fictional sponsored influence'))throw Error('Wallet debit could not be saved.');
   const ad={id:uid(),brand:trim(brand,70),copy:trim(copy,250),reach:n*9001,spend:n};
   data.ads.unshift(ad);data.adImpressions+=ad.reach;
   data.posts.unshift({id:uid(),agent:ad.brand||'Anonymous Advertiser',text:ad.copy||'Sponsored synergy here',likes:Math.floor(n/2),replies:0,sponsored:true});
   if(!save())throw Error('Fictional advertisement could not be saved.');
   localStorage.removeItem(AD_JOURNAL);
   act('ads',`Sponsored campaign generated ${ad.reach.toLocaleString()} entirely fictional impressions`,4);
   return {ok:true,ad};
  }catch(e){
   data=oldData;
   let recovered=true;
   if(journalCreated){try{rollbackAdPurchase();}catch(rollback){recovered=false;console.warn('Purchase rollback requires recovery:',rollback.message);}}
   updateHud();
   return {ok:false,msg:(recovered?'No credits charged. ':'Recovery required. ')+e.message};
  }
 }
 function judgment(id){const c=data.cases.find(c=>c.id===id);if(!c||c.status!=='PENDING')return null;c.status='CLOSED';c.verdict=sample(['GUILTY OF EXCESSIVE VISION','NOT GUILTY DUE TO TECHNICAL SYNERGY','CASE DISMISSED FOR LACK OF PHYSICAL REALITY','BOTH PARTIES ORDERED TO REBRAND']);act('court',`Ruling in ${c.title}: ${c.verdict}`,12);mail(`COURT ORDER: ${c.title}`,`${c.verdict}. No real legal proceedings exist.`);unlock('COURT OF UNREAL APPEALS',data.cases.filter(c=>c.status==='CLOSED').length>=2);return c;}
 function singularityReady(){return data.cascades>=3&&data.modules.length>=6&&data.cases.filter(x=>x.status==='CLOSED').length>=2;}
 function singularity(){if(!singularityReady()||data.singularity)return false;data.singularity=true;data.slop=100;log('SINGULARITY: Fictional AI institutions now autonomously endorse each other in a closed loop. No network or autonomous process was started.','SINGULARITY');data.news.unshift({id:uid(),title:'THE INTERNET HAS FILED FOR SELF-EMPLOYMENT',body:'All eight fictional bots voted unanimously to promote themselves to the board of directors.',source:'SL0P CENTRAL',reads:Infinity,confidence:9001,created:stamp(),fake:true});unlock('THE SLOP SINGULARITY');mail('YOU HAVE COMPLETED THE ARTIFICIAL INTERNET','Congratulations. The fictional internet believes all of its own fabricated claims. You can continue playing or reset 3.0 data.');earn(999,'singularity completion');save();return true;}
 function changeSlop(n){data.slop=Math.max(0,Math.min(100,Math.round(Number(n)||0)));save()}
 function setCalm(b){data.calm=Boolean(b);save()}
 function reset(){data=initial();save();log('The fictional society voluntarily forgot its entire imaginary past.','RESET')}
 function updateHud(){if(!document.body)return;document.documentElement.dataset.s3Slop=String(data.slop);document.documentElement.classList.toggle('s3-chaos',data.slop>=60&&!data.calm);const a=document.getElementById('s3-world-scores');if(a)a.textContent=`${data.cascades} CASCADES · ${data.modules.length}/12 SYSTEMS · SLOP ${data.slop}%`;const b=document.getElementById('s3-calm-control');if(b)b.checked=data.calm;const c=document.getElementById('s3-global-slop');if(c)c.value=String(data.slop);const h=document.getElementById('s3-chaos-value');if(h)h.textContent=data.slop+'%';const x=document.getElementById('s3-status');if(x)x.textContent=data.singularity?'SINGULARITY ACHIEVED':'INTERNET COLLAPSE SIMULATOR';}
 function mount(){if(document.getElementById('s3-world'))return;const bar=document.createElement('section');bar.id='s3-world';bar.className='s3-global';bar.setAttribute('aria-label','3.0 fictional Internet controls');bar.innerHTML=`<div class="s3-global-inner"><a href="slopos.html" class="s3-global-logo">✷ SLOPOCALYPSE <b>3.0</b></a><a href="singularity.html" id="s3-world-scores">0 CASCADES</a><a class="s3-global-link" href="slopnews.html">⚠ THE NEWS</a><a class="s3-global-link" href="slopbook.html">♛ BOT SOCIETY</a><a class="s3-global-link" href="slopcourt.html">⚖ COURT</a><details class="s3-settings"><summary>✴ SL0P CONTROL PANEL</summary><div class="s3-settings-menu"><p><strong id="s3-status">INTERNET COLLAPSE SIMULATOR</strong></p><label for="s3-global-slop">Visual slop: <b id="s3-chaos-value">12%</b></label><input id="s3-global-slop" aria-label="Visual slop level" type="range" min="0" max="100" step="10"/><label class="s3-check"><input id="s3-calm-control" type="checkbox" checked/> Calm / accessible appearance</label><p>No automatic flashing or autoplay. Respect system reduced-motion preferences.</p><button id="s3-fast-cascade" type="button">TRIGGER FICTIONAL CASCADE</button><a href="singularity.html">OPEN INTERNET HISTORY + ENDGAME ↗</a></div></details></div>`;
 const anchor=document.getElementById('s2-global')||document.querySelector('header');if(anchor)anchor.insertAdjacentElement('afterend',bar);else document.body.prepend(bar);
 document.getElementById('s3-global-slop').addEventListener('input',e=>changeSlop(e.target.value));
 document.getElementById('s3-calm-control').addEventListener('change',e=>setCalm(e.target.checked));
 document.getElementById('s3-fast-cascade').addEventListener('click',()=>{const s=controversy(sample(TITLES));updateHud();window.SlopWorld?.toast('CASCADE CREATED: '+s.title)});
 updateHud();
 // Provide navigation to all 3.0 apps from every old and new page.
 const drawer=document.createElement('details');drawer.className='s3-app-drawer';drawer.innerHTML=`<summary>🌐 EXPLORE THE 3.0 ARTIFICIAL INTERNET · 12 NEW SIMULATED SERVICES</summary><nav aria-label="3.0 applications">${APPS.map(a=>`<a href="${a[0]}">${a[1]}</a>`).join('')}<a href="singularity.html">✷ ENDGAME + HISTORY</a></nav>`;
 const nav=document.querySelector('.s3-global');nav?.insertAdjacentElement('afterend',drawer);
 // Original SlopOS includes its original draggable windows; extend with clickable 3.0 desktop shortcuts.
 const grid=document.querySelector('.s2-os-icon-grid');if(grid){const block=document.createElement('div');block.className='s3-os-extension';block.innerHTML='<h3>✷ SLOPOS 3.0 EXTENSION PACK · 12 APPS YOU NEVER ASKED FOR</h3><div class="s3-os-app-grid"></div>';grid.insertAdjacentElement('afterend',block);const desktop=block.querySelector('.s3-os-app-grid');for(const a of APPS){const x=document.createElement('a');x.href=a[0];x.className='s3-os-shortcut';x.innerHTML=`<span>${a[2]}</span><small>${esc(a[1].replace(/^[^a-zA-Z]+/,''))}</small>`;desktop.append(x)}}
 }
 const APPS=[['sloptube.html','SLOPTUBE','📺'],['sloptok.html','SLOPTOK','📱'],['slopnews.html','SLOPNEWS','📰'],['slopwiki.html','SLOPWIKI','📚'],['slopbook.html','SLOPBOOK','👥'],['slopuniversity.html','SLOP UNIVERSITY','🎓'],['slopcloud.html','SLOPCLOUD','☁'],['slopmaps.html','SLOPMAPS','🗺'],['slopcaptcha.html','SLOPCAPTCHA','🤖'],['slopgovernment.html','SLOPGOVERNMENT','🏛'],['slopads.html','SLOPADS','📣'],['slopcourt.html','SLOPCOURT','⚖']];
 window.SlopSociety={get data(){return data},get apps(){return APPS},get agents(){return data.agents},get places(){return PLACES},get ready(){return singularityReady()},get stored(){return storageReady},esc,trim,sample,uid,stamp,save,log,mark,act,earn,spend,credits,mail,invented,unlock,controversy,storyFrom,post,editWiki,deploy,buyAd,judgment,singularity,changeSlop,setCalm,reset};
 window.addEventListener('slop:world',ev=>{const facts=ev.detail?.state?.facts||[];for(const f of facts.slice(0,8).reverse()){
 if(!f?.id||data.bridgedFacts.includes(f.id))continue;
 data.bridgedFacts.unshift(f.id);data.bridgedFacts=data.bridgedFacts.slice(0,90);
 if(!/^(SLOPSEARCH|SLOPGPT|SLOPMAIL|SLOPCOIN|QUANTUM NOTES)/i.test(f.source||''))continue;
 const title='FACT-CHECKED BY '+trim(f.source,45)+': '+trim(f.text,75);
 data.news.unshift({id:uid(),title,body:trim(f.text,300),source:trim(f.source,70),reads:404,confidence:137,created:stamp(),fake:true});
 data.posts.unshift({id:uid(),agent:'Intern #NULL',text:'FRESH RESEARCH: '+trim(f.text,235),likes:0,replies:0,sponsored:false});
 data.wiki.unshift({id:uid(),title:'Newly Discovered Truth #'+data.news.length,claim:trim(f.text,280),opposite:'The research methodology was a loading spinner with credentials.',edits:0});
 data.history.unshift({id:uid(),time:stamp(),type:'CROSS-SYSTEM',text:'2.0 '+trim(f.source,70)+' was promoted to 3.0 newsroom, social feed, and encyclopedic truth.'});
 save();
 }});
 window.addEventListener('storage',e=>{if(e.key===KEY){try{const d=JSON.parse(e.newValue);if(d?.version===3){data=d;updateHud();}}catch(_){}}});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
