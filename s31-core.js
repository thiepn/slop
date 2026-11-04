/* SLOPOCALYPSE 3.1 — local, accessible interactive shell / compatibility layer.
   Existing v2 and v3 stores stay authoritative and are never migrated destructively. */
(()=>{'use strict';
 document.documentElement.classList.add('s31-ready');
 const KEY='slopocalypse:interaction:v31', S2='slopocalypse:fictional-internet:v2', S3='slopocalypse:internet-collapse:v3';
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const int=x=>Number.isFinite(Number(x))?Number(x):0;
 const pick=(a)=>a[Math.floor(Math.random()*a.length)];
 const APP_GROUPS=[
  ['Start here',[['index.html','Home','✦','The original visual catastrophe'],['portal.html','Slopverse Directory','▦','All 44 universes'],['slopos.html','SlopOS Desktop','▣','Your imaginary operating system'],['singularity.html','World History','◎','Cascades and the endgame']]],
  ['Core apps',[['slopsearch.html','SlopSearch','⌕','Invent authoritative facts'],['slopgpt.html','SlopGPT Arena','◇','Argument-as-a-service'],['slopmail.html','SlopMail','✉','Inbox of existential spam'],['slopcoin.html','SlopCoin','◈','Imaginary trading floor'],['app-store.html','App Store','▧','Install programs that do nothing'],['workspace.html','AI Workspace','▤','Productivity without productivity'],['agents.html','AI Agent Marketplace','♟','Hire fictional geniuses'],['lab.html','Research Lab','⚗','Fabricated benchmarks']]],
  ['Artificial internet',[['sloptube.html','SlopTube','▶','Imaginary videos'],['sloptok.html','SlopTok','▥','Vertical brainrot'],['slopnews.html','SlopNews','▣','Fabricated headlines'],['slopwiki.html','SlopWiki','▤','Contradictory encyclopedia'],['slopbook.html','SlopBook','♙','Fictional social network'],['slopuniversity.html','SlopUniversity','◉','Degrees beyond 100%'],['slopcloud.html','SlopCloud','☁','Mars-East-1 deployments'],['slopmaps.html','SlopMaps','⌖','Impossible directions'],['slopcaptcha.html','SlopCAPTCHA','▦','Finger recognition puzzles'],['slopgovernment.html','SlopGovernment','▥','Government-as-a-vibe'],['slopads.html','SlopAds','◫','Buy imaginary impressions'],['slopcourt.html','SlopCourt','⚖','Litigate the impossible']]],
  ['Corporate slop',[['get-started.html','Get Started','↗','Three-stage fake onboarding'],['pricing-verse.html','Pricing','＄','Subscription to nothing'],['checkout.html','Checkout','◇','Pay absolutely nothing'],['about.html','About','ℹ','Company that does not exist'],['generator.html','Website Generator','∞','Recursive site inception'],['investors.html','Investors','↗','Unicorn without revenue'],['reviews.html','Testimonials','★','Verified by placeholders'],['careers.html','Careers','♙','Apply to nonexistent jobs'],['status.html','Status','⚠','Uptime exceeding 100%'],['docs.html','API Docs','{ }','Pretend endpoints'],['integrations.html','Integrations','⌁','Connect fictional services'],['support.html','Support','?','Escalate to nobody'],['awards.html','Awards','♛','Self-certify greatness'],['community.html','Community','♧','Social proof feedback loop'],['roadmap.html','Roadmap','♢','Vote on the roadmap'],['trust.html','Trust Center','♜','No real certification'],['newsroom.html','Press Room','▣','Automated press releases'],['merch.html','Merch Store','▨','Items that do not exist'],['legal.html','Legal','§','Terms of emptiness'],['manifesto.html','Manifesto','✎','Visionary nonsense']]]
 ];
 const APPS=APP_GROUPS.flatMap(g=>g[1]);
 const MISSIONS=[
  {id:'search',title:'Discover your first official untruth',desc:'Use SlopSearch to invent a source-backed fact.',page:'slopsearch.html',reward:35,done:(s2)=>int(s2.searches)>0},
  {id:'cascade',title:'Break the internet once',desc:'Start one completely fabricated global scandal.',page:'slopnews.html',reward:60,done:(_,s3)=>int(s3.cascades)>0},
  {id:'post',title:'Become an AI thought leader',desc:'Publish a post on SlopBook.',page:'slopbook.html',reward:40,done:(_,s3)=>s3.posts?.some(p=>p.agent==='You, Allegedly')},
  {id:'app',title:'Download more productivity',desc:'Install a second useless application.',page:'app-store.html',reward:25,done:s2=>(s2.installed||[]).length>=2},
  {id:'court',title:'Win an imaginary legal battle',desc:'Close a case in SlopCourt.',page:'slopcourt.html',reward:75,done:(_,s3)=>s3.cases?.some(c=>c.status==='CLOSED')},
  {id:'founder-factory',title:'Found a company and overmanage it',desc:'Create a Website Factory project and finish a Workspace task.',page:'generator.html',reward:35,done:s2=>!!s2.phase6?.generator?.projects?.length&&s2.phase6?.workspace?.tasks?.some(t=>t.status==='DONE')},
  {id:'support-bureau',title:'Support the support that supports itself',desc:'Resolve a Support ticket and run one fictional integration sync.',page:'support.html',reward:40,done:s2=>s2.phase6?.support?.tickets?.some(t=>t.status==='RESOLVED')&&Object.values(s2.phase6?.integrations?.providers||{}).some(x=>x.syncs>0)},
  {id:'media-empire',title:'Become your own entire press department',desc:'Publish a fictional Newsroom release and start a Community thread.',page:'newsroom.html',reward:45,done:s2=>s2.phase6?.newsroom?.releases?.some(r=>r.status==='PUBLISHED')&&!!s2.phase6?.community?.threads?.length}
 ];
 const fresh=()=>({version:31,history:[],claimed:[],lastSeen:0,preferences:{reduced:false,compact:false},initialized:false});
 function parse(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(_){return null}}
 let state={...fresh(),...(parse(KEY)||{})};
 if(state.version!==31)state=fresh();
 if(!Array.isArray(state.history))state.history=[];
 if(!Array.isArray(state.claimed))state.claimed=[];
 state.preferences={...fresh().preferences,...(state.preferences||{})};
 let persistent=true;
 function persist(){state.history=state.history.slice(0,110);try{localStorage.setItem(KEY,JSON.stringify(state));persistent=true}catch(_){persistent=false}}
 function world2(){return parse(S2)||window.SlopWorld?.state||{}}
 function world3(){return parse(S3)||window.SlopSociety?.data||{}}
 const nameOf=(p)=>p?.split('/').pop()||'';
 let tab='apps',lastFocus=null,alertTimer=0,importData=null,filter='';
 const previousInert=new WeakMap();
 function setBackgroundInert(active){for(const child of document.body.children){if(['s31-panel','s31-backdrop','s31-toast'].includes(child.id))continue;if(active){previousInert.set(child,child.inert);child.inert=true}else if(previousInert.has(child)){child.inert=previousInert.get(child)}}}
 let prior2=null,prior3=null;
 const summary2=d=>({credits:int(d.credits),mails:(d.mails||[]).length,unread:(d.mails||[]).filter(m=>m.unread).length,facts:(d.facts||[]).length,installs:(d.installed||[]).length,achievements:(d.achievements||[]).length,transactions:(d.transactions||[]).length,searches:int(d.searches),events:(d.events||[])[0]?.id||''});
 const summary3=d=>({cascades:int(d.cascades),news:(d.news||[]).length,posts:(d.posts||[]).length,cases:(d.cases||[]).filter(x=>x.status==='CLOSED').length,achievements:(d.achievements||[]).length,history:(d.history||[])[0]?.id||'',singularity:!!d.singularity});
 function record(kind,title,detail){const event={id:'ui-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),when:Date.now(),kind:String(kind).slice(0,30),title:String(title).slice(0,110),detail:String(detail||'').slice(0,200)};state.history.unshift(event);persist();refreshHeader();return event}
 function initializeActivity(){if(state.initialized)return;const a=world2(),b=world3();
  const merged=[...(a.events||[]).slice(0,4).map(e=>({kind:'2.0 EVENT',title:e.title,detail:e.detail})),...(b.history||[]).slice(0,5).map(e=>({kind:e.type,title:e.text,detail:e.time}))];
  for(const e of merged.reverse())record(e.kind,e.title,e.detail);
  state.initialized=true;state.lastSeen=Date.now();persist()}
 function watch(){const a=summary2(world2()),b=summary3(world3());if(prior2){
  if(a.facts>prior2.facts)record('DISCOVERY','SlopSearch declared a new truth','The citations remain gloriously unverifiable.');
  if(a.installs!==prior2.installs)record('APP STORE','App collection changed',`${a.installs} installed imaginary programs.`);
  if(a.transactions>prior2.transactions)record('MARKET','An entirely simulated trade was executed','SlopCoin welcomes your conceptual investment.');
  if(a.events!==prior2.events&&a.events)record('INCIDENT','Another global event was announced',(world2().events||[])[0]?.title);
 }
 if(prior3){
  if(b.cascades>prior3.cascades)record('CASCADE',`Hallucination cascade #${b.cascades}`,'News, social, legal and imaginary finance react.');
  if(b.cases>prior3.cases)record('COURT','A fictional court passed judgment',`${b.cases} completed cases.`);
  if(b.singularity&&!prior3.singularity)record('SINGULARITY','The slop singularity is complete','Artificial confidence has achieved its final form.');
  if(b.posts>prior3.posts&&b.cascades===prior3.cascades)record('SOCIAL','A new AI-social post appeared','Influence has been artificially inflated.');
 }
 prior2=a;prior3=b;refreshHeader();if(isOpen()&&tab!=='apps'&&tab!=='settings')render();}
 function currentUnread(){return state.history.filter(e=>e.when>state.lastSeen).length}
 function refreshHeader(){const a=world2(),b=world3();const by=id=>document.getElementById(id);
  if(by('s31-credits'))by('s31-credits').textContent=int(a.credits).toLocaleString();
  if(by('s31-mail'))by('s31-mail').textContent=(a.mails||[]).filter(m=>m.unread).length;
  if(by('s31-notifications')){by('s31-notifications').textContent=currentUnread();by('s31-notifications').hidden=currentUnread()===0;}
  if(by('s31-badges'))by('s31-badges').textContent=[...new Set([...(a.achievements||[]),...(b.achievements||[])])].length;
 }
 const isOpen=()=>!!document.getElementById('s31-panel')&&!document.getElementById('s31-panel').hidden;
 function open(t='apps',search=false){if(!document.getElementById('s31-panel'))return;lastFocus=document.activeElement;tab=t;filter='';const panel=document.getElementById('s31-panel'),bd=document.getElementById('s31-backdrop');panel.hidden=false;bd.hidden=false;document.body.classList.add('s31-dialog-open');setBackgroundInert(true);document.querySelectorAll('[data-s31-open]').forEach(b=>b.setAttribute('aria-expanded','true'));render();if(t==='activity'){state.lastSeen=Date.now();persist();refreshHeader()}
  const target=search?document.getElementById('s31-filter'):panel.querySelector('[role=tab][aria-selected=true]');(target||document.getElementById('s31-close')).focus();}
 function close(){const p=document.getElementById('s31-panel');if(!p||p.hidden)return;p.hidden=true;document.getElementById('s31-backdrop').hidden=true;document.body.classList.remove('s31-dialog-open');setBackgroundInert(false);document.querySelectorAll('[data-s31-open]').forEach(b=>b.setAttribute('aria-expanded','false'));if(lastFocus?.isConnected)lastFocus.focus();}
 function notify(txt){const e=document.getElementById('s31-toast');if(!e)return;e.textContent=txt;e.hidden=false;clearTimeout(alertTimer);alertTimer=setTimeout(()=>e.hidden=true,3500)}
 function render(){const body=document.getElementById('s31-tabview');if(!body)return;
  document.querySelectorAll('#s31-tabs [role=tab]').forEach(b=>{const on=b.dataset.tab===tab;b.setAttribute('aria-selected',on?'true':'false');b.tabIndex=on?0:-1});
  if(tab==='apps')apps(body);else if(tab==='activity')activity(body);else if(tab==='missions')missions(body);else if(tab==='world')world(body);else settings(body);
 }
 function apps(root){const q=filter.toLowerCase();const matches=APP_GROUPS.map(([name,a])=>[name,a.filter(x=>(x[1]+' '+x[3]+' '+name).toLowerCase().includes(q))]).filter(x=>x[1].length);
  root.innerHTML=`<label class="s31-section-title" for="s31-filter">Search the Artificial Internet</label><input id="s31-filter" class="s31-input" type="search" placeholder="Search 44 fake applications..." autocomplete="off" value="${esc(filter)}"/><p class="s31-count" id="s31-match-count">${matches.reduce((n,g)=>n+g[1].length,0)} / 44 destinations</p><div id="s31-results"></div>`;
  const result=root.querySelector('#s31-results');
  function list(){const query=filter.trim().toLowerCase();const matched=APP_GROUPS.map(([g,a])=>[g,a.filter(x=>(x[1]+' '+x[3]+' '+g).toLowerCase().includes(query))]).filter(v=>v[1].length);const count=matched.reduce((n,x)=>n+x[1].length,0);root.querySelector('#s31-match-count').textContent=`${count} / ${APPS.length} destinations`;
   result.innerHTML=count?matched.map(([g,items])=>`<h3 class="s31-section-title">${esc(g)}</h3><div class="s31-grid">${items.map(([url,name,icon,desc])=>`<a class="s31-link-card" ${nameOf(location.pathname)===url?'aria-current="page"':''} href="${url}"><span class="s31-link-emoji" aria-hidden="true">${esc(icon)}</span><span class="s31-link-copy"><strong>${esc(name)}</strong><small>${esc(desc)}</small></span></a>`).join('')}</div>`).join(''):'<div class="s31-empty">No matching corporate buzzwords. Try a different hallucination.</div>';
  }
  list();root.querySelector('#s31-filter').addEventListener('input',e=>{filter=e.target.value;list()});}
 function activity(root){const a=world2(),b=world3();const events=state.history.slice(0,50);
  root.innerHTML=`<div class="s31-stat-row"><div class="s31-stat"><b>${int(b.cascades)}</b><small>Cascades</small></div><div class="s31-stat"><b>${(b.modules||[]).length}/12</b><small>Modules</small></div><div class="s31-stat"><b>${int(b.slop)}%</b><small>Slop Level</small></div></div><div class="s31-settings-actions"><button class="s31-primary" id="s31-trigger">⚡ Trigger fictional crisis</button><a class="s31-secondary" href="singularity.html">World history ↗</a></div><p class="s31-info">Your interactions are stored only in this browser. The feed combines 2.0 and 3.0 activity without overwriting either world.</p><h3 class="s31-section-title">Your imaginary event feed</h3>${events.length?events.map(e=>`<article class="s31-card"><div class="s31-card-head"><strong>${esc(e.title)}</strong><span class="s31-badge">${esc(e.kind)}</span></div>${e.detail?`<p>${esc(e.detail)}</p>`:''}<div class="s31-meta">${new Date(e.when).toLocaleString()}</div></article>`).join(''):'<div class="s31-empty">The internet is suspiciously quiet.</div>'}`;
  root.querySelector('#s31-trigger').addEventListener('click',()=>{if(!window.SlopSociety)return notify('3.0 world engine unavailable.');const title=pick(['Quantum mangoes achieve sentience','The loading spinner demands voting rights','Mars-East-1 declares itself profitable','A color gradient becomes CEO','The stapler accuses the cloud of tax fraud']);window.SlopSociety.controversy(title);record('PLAYER ACTION','You triggered a global crisis',title);notify('Your fictional crisis has infected the internet.');render()});}
 function world(root){
  const ledger=window.SlopWorld32?.ledger;
  if(!ledger){root.innerHTML='<p class="s31-info">World engine is unavailable. Your old apps are still functional.</p>';return;}
  const original=world2(),v3=world3();
  // Phase 5 collectibles and activities live in the existing v2 backup document.
  // Project them into the Control Center without changing the v32 ledger format.
  const p5=original.phase5&&original.phase5.version===1?original.phase5:null;
  const phase5Items=(Array.isArray(p5?.collectibles)?p5.collectibles:[]).map(x=>({id:x.id,name:x.name,qty:1,source:'3.1 Phase 5'}));
  const phase5Events=(Array.isArray(p5?.activity)?p5.activity:[]).slice(-35).reverse().map(x=>({id:x.id,title:x.text,type:'MINIGAME',detail:'Interactive fictional simulation in '+x.page,at:x.time,effects:['Persistent Phase 5 progress','Cross-app activity']}));
  const p6=original.phase6&&original.phase6.version===1?original.phase6:null;
  const phase6Items=(Array.isArray(p6?.inventory)?p6.inventory:[]).map(x=>({id:x.id,name:x.name,qty:1,source:'3.1 Phase 6'}));
  const inv=[...(ledger.inventory||[]),...phase5Items,...phase6Items],events=[...phase5Events,...(ledger.events||[])];
  root.innerHTML=`<div class="s31-stat-row"><div class="s31-stat"><b>${ledger.revision}</b><small>World revision</small></div><div class="s31-stat"><b>${ledger.influence}</b><small>Fictional influence</small></div><div class="s31-stat"><b>${inv.reduce((n,x)=>n+Number(x.qty||0),0)}</b><small>Collectibles</small></div></div>
    <p class="s31-info">Actions in SlopSearch, SlopBook, SlopCoin, the social network, Phase 5 simulations and Phase 6 legacy workbenches create fictional consequences here. Original 2.0 and 3.0 progress is preserved; the world ledger is additional, versioned local data.</p>
    ${ledger.warning?`<p class="s31-world-warning">${esc(ledger.warning)}</p>`:''}
    <div class="s31-settings-actions"><button class="s31-primary" id="s32-sync" type="button">↻ Reconcile world events</button><a class="s31-secondary" href="slopsearch.html">Invent an untruth ↗</a><a class="s31-secondary" href="slopcourt.html">Rule on a case ↗</a></div>
    <h3 class="s31-section-title">Inventory · ${inv.length} unique artifacts</h3><div class="s31-world-inventory">${inv.length?inv.map(i=>`<article class="s31-world-item"><strong>${esc(i.name)}</strong><span>×${Number(i.qty)||0}</span><small>${esc(i.source)}</small></article>`).join(''):'<div class="s31-empty">Your inventory is empty. The economy is depending on you.</div>'}</div>
    <h3 class="s31-section-title">World consequences · ${events.length} logged</h3><div class="s31-world-events">${events.slice(0,40).map(e=>`<article class="s31-card"><div class="s31-card-head"><strong>${esc(e.title)}</strong><span class="s31-badge">${esc(e.type)}</span></div><p>${esc(e.detail||'')}</p><ul>${(e.effects||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul><div class="s31-meta">${esc(e.at||'')}</div></article>`).join('')}</div>
    <p class="s31-info">Current legacy world: ${int(original.credits)} credits, ${int(v3.cascades)} cascades, ${ledger.claimed.length} redeemed missions. Fictional state only; no network activity.</p>`;
  root.querySelector('#s32-sync').addEventListener('click',async()=>{await window.SlopWorld32.sync();render();notify('World ledger reconciled against the original apps.');});
 }
 function missions(root){const a=world2(),b=world3(),claimedIds=window.SlopWorld32?.ledger?.claimed||state.claimed,completed=MISSIONS.filter(m=>m.done(a,b)).length,claimed=claimedIds.length;
  root.innerHTML=`<div class="s31-stat-row"><div class="s31-stat"><b>${completed}/${MISSIONS.length}</b><small>Completed</small></div><div class="s31-stat"><b>${claimed}/${MISSIONS.length}</b><small>Claimed</small></div><div class="s31-stat"><b>${MISSIONS.reduce((n,m)=>n+(claimedIds.includes(m.id)?m.reward:0),0)}</b><small>Credits earned</small></div></div><h3 class="s31-section-title">Make the internet objectively worse</h3>${MISSIONS.map(m=>{const done=!!m.done(a,b),got=claimedIds.includes(m.id);return `<article class="s31-card"><div class="s31-card-head"><strong>${esc(m.title)}</strong><span class="s31-badge ${done?'done':''}">${got?'REWARDED':done?'READY':'TO DO'}</span></div><p>${esc(m.desc)}</p><div class="s31-settings-actions">${done&&!got?`<button type="button" class="s31-primary" data-s31-claim="${m.id}">Claim +${m.reward} credits</button>`:done?'<span class="s31-meta">✓ Mission completed</span>':`<a class="s31-secondary" href="${m.page}">Go to activity ↗</a>`}</div></article>`}).join('')}<h3 class="s31-section-title">Achievements</h3><p class="s31-info">${[...new Set([...(a.achievements||[]),...(b.achievements||[])])].length} unique badges earned across the original universes. Rewards are added to your existing Synergy balance, not a separate wallet.</p><div class="s31-grid">${[...new Set([...(a.achievements||[]),...(b.achievements||[])])].slice(0,24).map(x=>`<div class="s31-card">🏆 ${esc(x)}</div>`).join('')||'<div class="s31-empty">No badges. A scandalous lack of success.</div>'}</div>`;
  root.querySelectorAll('[data-s31-claim]').forEach(el=>el.addEventListener('click',()=>claim(el.dataset.s31Claim)));}
 async function claim(id){
  const m=MISSIONS.find(x=>x.id===id);if(!m)return;
  if(!window.SlopWorld32){notify('The shared world engine is not available.');return;}
  const outcome=await window.SlopWorld32.claimMission(id,m.reward,()=>m.done(world2(),world3()));
  if(!outcome.ok){notify(outcome.reason);render();return;}
  const latest=parse(KEY);if(latest?.version===31)state=latest;
  record('MISSION',m.title,`+${m.reward} fictional Synergy Credits`);
  notify(`+${m.reward} credits deposited into your imaginary wallet.`);
  render();
 }
 function settings(root){const b=world3(),p=state.preferences;
  root.innerHTML=`<h3 class="s31-section-title">Appearance and accessibility</h3><label class="s31-settings-row"><span>Calm appearance<small>Disable contagious chaos. The world remains fictional.</small></span><input id="s31-calm" type="checkbox" ${b.calm!==false?'checked':''}/></label><label class="s31-settings-row"><span>Reduce all motion<small>Also respects your operating system preference.</small></span><input id="s31-motion" type="checkbox" ${p.reduced?'checked':''}/></label><label class="s31-settings-row"><span>Visual slop level<small>0% subtle satire; 100% maximum corporate nonsense.</small></span><input id="s31-slop" type="range" min="0" max="100" step="10" value="${int(b.slop)}" aria-label="Visual slop level"/></label><p class="s31-info" id="s31-slop-text">${int(b.slop)}% slop · ${b.calm!==false?'Calm appearance enabled':'Full visual contagion enabled'}</p><h3 class="s31-section-title">Back up your fictional progress</h3><p class="s31-info">Export/import includes all FOUR local stores: legacy 2.0 and 3.0, interface preferences and mission claims, and the versioned world ledger. Both current backups and previous Phase 1 backups can be restored. Import is validated and rollback-protected.</p><div class="s31-settings-actions"><button type="button" class="s31-primary" id="s31-export">↓ Export JSON backup</button><label class="s31-secondary" style="cursor:pointer">↑ Select backup<input id="s31-import-file" type="file" accept=".json,application/json" hidden/></label></div><div id="s31-import-preview" role="status" aria-live="polite"></div><h3 class="s31-section-title">Storage and provenance</h3><p class="s31-info">Original storage keys stay intact. The 3.1 world engine uses its own v32 ledger and recovers interrupted imports and claims. ${persistent?'Local progress storage is available.':'Local progress storage may be blocked.'} No cloud sync, live financial data, or AI endpoints exist.</p><p class="s31-info">Keyboard shortcut: <strong>Ctrl/⌘ + K</strong> opens the app finder. <strong>Escape</strong> closes the launcher.</p>`;
  root.querySelector('#s31-calm').addEventListener('change',e=>{window.SlopSociety?.setCalm(e.target.checked);render()});
  root.querySelector('#s31-motion').addEventListener('change',e=>{state.preferences.reduced=e.target.checked;persist();document.documentElement.classList.toggle('s31-reduced',e.target.checked)});
  root.querySelector('#s31-slop').addEventListener('input',e=>{window.SlopSociety?.changeSlop(e.target.value);root.querySelector('#s31-slop-text').textContent=e.target.value+'% slop · '+(world3().calm!==false?'Calm appearance enabled':'Full visual contagion enabled')});
  root.querySelector('#s31-export').addEventListener('click',exportBackup);
  root.querySelector('#s31-import-file').addEventListener('change',e=>{const file=e.target.files?.[0];if(file)importBackup(file)});}
 function exportBackup(){
  try{window.SlopWorld32.downloadBackup();notify('Version 2 backup saved locally, including your world ledger.');}
  catch(e){notify('Backup failed: '+e.message);}
 }
 async function importBackup(file){
  const out=document.getElementById('s31-import-preview');
  if(file.size>3_000_000){out.textContent='Selected file exceeds 3 MB.';return;}
  try{
   const parsed=JSON.parse(await file.text());
   const validated=window.SlopWorld32.validateBackup(parsed);
   importData=parsed;out.replaceChildren();
   const msg=document.createElement('p');msg.className='s31-info';
   msg.textContent=`Verified backup v${validated.fromVersion} · ${validated.preview.credits} fictional credits · ${validated.preview.cascades} cascades · ${validated.preview.claimed} missions. This REPLACES local progress after confirmation; a failed restore is rolled back.`;
   const button=document.createElement('button');button.type='button';button.className='s31-danger';button.textContent='Confirm replacing local progress';button.addEventListener('click',confirmImport);
   out.append(msg,button);
  }catch(e){importData=null;out.textContent='Import rejected: '+e.message;}
 }
 async function confirmImport(){
  if(!importData)return;
  const payload=importData;importData=null;
  try{
   await window.SlopWorld32.restoreBackup(payload);
   notify('Backup restored and verified. Reloading local applications.');
   location.reload();
  }catch(e){const out=document.getElementById('s31-import-preview');if(out)out.textContent='Restore failed. Original progress retained where storage permitted: '+e.message;notify('Restore failed without partial import.');}
 }
 function onKey(e){if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();open('apps',true);return}if(!isOpen())return;if(e.key==='Escape'){e.preventDefault();close();return}if(e.key!=='Tab')return;const panel=document.getElementById('s31-panel');const nodes=[...panel.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),[tabindex="0"]')].filter(n=>n.getClientRects().length>0&&!n.hidden);if(!nodes.length)return;const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}
 function mount(){if(document.getElementById('s31-bar'))return;
  const bar=document.createElement('header');bar.id='s31-bar';bar.innerHTML=`<button class="s31-menu-btn" type="button" data-s31-open="apps" aria-controls="s31-panel" aria-expanded="false" aria-label="Open app launcher">☰ <span class="s31-short-label">Apps</span></button><a class="s31-brand" href="slopos.html"><span class="s31-brand-icon" aria-hidden="true">✦</span><span class="s31-brand-text">slopocalypse</span><span class="s31-edition">3.1</span></a><button class="s31-search-btn" type="button" data-s31-open="apps" data-s31-search="1" aria-label="Search all 44 applications" aria-controls="s31-panel" aria-expanded="false"><span>⌕ <span class="s31-search-word">Search 44 apps...</span></span><span class="s31-key">Ctrl K</span></button><span class="s31-grow"></span><button class="s31-chip" type="button" data-s31-open="missions" aria-controls="s31-panel" aria-expanded="false" title="Credits and missions">✧ <strong id="s31-credits">0</strong><span class="s31-short-label"> credits</span></button><button class="s31-icon-btn" id="s31-badges-button" type="button" data-s31-open="missions" aria-controls="s31-panel" aria-expanded="false" title="Mission board and achievements">🏆 <strong id="s31-badges">0</strong></button><button class="s31-icon-btn" type="button" data-s31-open="activity" aria-controls="s31-panel" aria-expanded="false" title="Notifications and event history" aria-label="Open activity feed">♧ <span id="s31-notifications" class="s31-unread" hidden>0</span><span class="s31-short-label"> <span id="s31-mail">0</span> mail</span></button><button class="s31-icon-btn" type="button" data-s31-open="settings" aria-controls="s31-panel" aria-expanded="false" aria-label="Open settings">⚙</button>`;
  const backdrop=document.createElement('div');backdrop.id='s31-backdrop';backdrop.hidden=true;
  const panel=document.createElement('aside');panel.id='s31-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','s31-panel-title');panel.hidden=true;
  panel.innerHTML=`<div class="s31-panel-head"><div><h2 id="s31-panel-title">Slop Control Center™</h2><p>Actual UI controls. Absolutely fictional products.</p></div><button class="s31-close" type="button" id="s31-close" aria-label="Close control center">×</button></div><div class="s31-tabs" id="s31-tabs" role="tablist" aria-label="Control center sections"><button role="tab" data-tab="apps" aria-selected="true">⌘ Apps</button><button role="tab" data-tab="activity" aria-selected="false">⚡ Activity</button><button role="tab" data-tab="missions" aria-selected="false">🏆 Missions</button><button role="tab" data-tab="world" aria-selected="false">🌐 World</button><button role="tab" data-tab="settings" aria-selected="false">⚙ Settings</button></div><div id="s31-tabview" class="s31-tabview" role="tabpanel"></div>`;
  const toast=document.createElement('div');toast.id='s31-toast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');toast.hidden=true;
  document.body.prepend(bar);document.body.append(backdrop,panel,toast);
  document.querySelectorAll('[data-s31-open]').forEach(b=>b.addEventListener('click',()=>open(b.dataset.s31Open,b.hasAttribute('data-s31-search'))));
  panel.querySelector('#s31-close').addEventListener('click',close);backdrop.addEventListener('click',close);
  panel.querySelectorAll('[data-tab]').forEach(b=>{
  b.setAttribute('aria-controls','s31-tabview');
  b.addEventListener('click',()=>{tab=b.dataset.tab;if(tab==='activity'){state.lastSeen=Date.now();persist()}render();refreshHeader()});
  b.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const tabs=[...panel.querySelectorAll('[data-tab]')];let i=tabs.indexOf(b);i=e.key==='Home'?0:e.key==='End'?tabs.length-1:e.key==='ArrowLeft'?(i+tabs.length-1)%tabs.length:(i+1)%tabs.length;tabs[i].click();tabs[i].focus()});
 });
  document.addEventListener('keydown',onKey);
  document.documentElement.classList.toggle('s31-reduced',!!state.preferences.reduced);
  // Restore the legacy toast outside the hidden legacy HUD, preserving existing feedback.
  const legacyToast=document.getElementById('s2-toast');if(legacyToast)document.body.append(legacyToast);
  initializeActivity();watch();
  window.addEventListener('slop:world',watch);window.addEventListener('slop3:update',watch);window.addEventListener('slop32:update',()=>{refreshHeader();if(isOpen()&&['world','missions'].includes(tab))render()});
  window.addEventListener('storage',e=>{if([S2,S3,KEY,'slopocalypse:world-engine:v32'].includes(e.key)){if(e.key===KEY){const freshState=parse(KEY);if(freshState?.version===31)state=freshState;}watch();if(isOpen())render()}});
  window.SlopInteraction={get snapshot(){return {version:31,v2:world2(),v3:world3(),ui:state}},open,close,record,get apps(){return APPS},get missions(){return MISSIONS},get storageReady(){return persistent}};
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
