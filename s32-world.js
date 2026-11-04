/* SLOPOCALYPSE 3.1 Phase 2 — local-only versioned cross-app world ledger.
   The original v2/v3/v31 keys and their data remain supported and authoritative for
   their existing UI. V32 adds idempotent projections, events, inventory and rewards. */
(()=>{'use strict';
 const KEY='slopocalypse:world-engine:v32';
 const S2='slopocalypse:fictional-internet:v2';
 const S3='slopocalypse:internet-collapse:v3';
 const S31='slopocalypse:interaction:v31';
 const JOURNAL='slopocalypse:restore-transaction:v32';
 const CLAIM_JOURNAL='slopocalypse:claim-transaction:v32';
 const KEYS=[S2,S3,S31,KEY];
 const CHANNEL='slopocalypse-world-v32';
 const MAX_EVENTS=160,MAX_SEEN=600,MAX_ITEMS=48,MAX_EXTERNAL=4096;
 // Phase 10: a bounded probabilistic replay filter remembers earlier external
 // events even after they age out of the readable 4096-ID audit window.
 // 64 KiB, seven hashes; false positives are possible, so this is NOT a
 // forever-exactly-once guarantee. Existing backups remain loadable.
 const REPLAY_BYTES=65536,REPLAY_BITS=REPLAY_BYTES*8,REPLAY_HASHES=7;
 const tabId='tab-'+Math.random().toString(36).slice(2);
 const clone=o=>JSON.parse(JSON.stringify(o));
 const obj=o=>o&&typeof o==='object'&&!Array.isArray(o);
 const cap=(v,n=180)=>String(v??'').slice(0,n);
 const int=(x,d=0)=>Number.isSafeInteger(Number(x))?Number(x):d;
 const hash=input=>{let h=2166136261;for(const c of String(input)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;};
 const pick=(seed,choices)=>choices[hash(seed)%choices.length];
 const storageRead=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch(_){return null}};
 const rawRead=k=>{try{return localStorage.getItem(k)}catch(_){return null}};
 const now=()=>new Date().toISOString();
 const fresh=()=>({version:32,revision:0,created:now(),updated:now(),seen:[],events:[],inventory:[],sourceSeen:[],externalSeen:[],rewards:{claimed:[]},influence:0,sourceVersions:{v2:2,v3:3,v31:31},lastEvent:'',lastWriter:'',externalImpact:{},externalFilter:''});
 const expected={[S2]:2,[S3]:3,[S31]:31,[KEY]:32};
 function checkSource(k,v){
  if(v==null)return true;
  if(!obj(v)||v.version!==expected[k])return false;
  if(k===S2)return ['events','facts','achievements','installed','mails','transactions'].every(x=>Array.isArray(v[x]))&&Number.isFinite(Number(v.credits))&&Number(v.credits)>=0;
  if(k===S3)return ['history','agents','news','wiki','posts','cases','modules','achievements'].every(x=>Array.isArray(v[x]));
  if(k===S31)return Array.isArray(v.history)&&Array.isArray(v.claimed)&&obj(v.preferences);
  return Array.isArray(v.events)&&Array.isArray(v.seen)&&Array.isArray(v.inventory)&&obj(v.rewards)&&Array.isArray(v.rewards.claimed);
 }
 function observedIds(v2,v3){
  const out=[];
  for(const f of v2?.facts||[])if(f.id)out.push('fact.discovered:'+f.id);
  for(const e of v3?.history||[])if(e.type==='CASCADE'&&e.id)out.push('cascade.triggered:'+e.id);
  for(const p of v3?.posts||[])if(p.agent==='You, Allegedly'&&p.id)out.push('social.published:'+p.id);
  for(const c of v3?.cases||[])if(c.status==='CLOSED'&&c.id)out.push('court.verdict:'+c.id);
  for(const t of v2?.transactions||[])out.push('market.trade:'+tradeKey(t));
  for(const i of v2?.installed||[])out.push('app.installed:'+i);
  return out;
 }
 const tradeKey=t=>t.id||[t.direction,t.token,t.qty,t.cost,t.time].join('|');
 function normalize(d){
  if(!checkSource(KEY,d))throw Error('Invalid v32 state');
  const s={...fresh(),...d,rewards:{claimed:[...new Set(d.rewards.claimed.filter(x=>typeof x==='string'))]}};
  s.seen=s.seen.filter(x=>typeof x==='string').slice(-MAX_SEEN);
  // Active legacy source IDs must remain acknowledged even when the bounded
  // chronological history overflows during long sessions.
  s.sourceSeen=(Array.isArray(d.sourceSeen)?d.sourceSeen:[]).filter(x=>typeof x==='string').slice(-500);
  // Persist external event acknowledgements independently of the 600-ID display
  // window. Migrating old backups retains whatever external IDs are still seen.
  // The bound limits storage growth; older IDs outside it cannot be guaranteed.
  s.externalSeen=[...new Set([...(Array.isArray(d.externalSeen)?d.externalSeen:[]),...d.seen.filter(x=>typeof x==='string'&&x.startsWith('external:'))])].filter(x=>typeof x==='string'&&x.startsWith('external:')&&x.length<=100).slice(-MAX_EXTERNAL);
  s.events=s.events.filter(obj).slice(0,MAX_EVENTS);
  s.inventory=s.inventory.filter(x=>obj(x)&&typeof x.id==='string').slice(0,MAX_ITEMS);
  s.revision=Math.max(0,int(s.revision));s.influence=Math.max(0,int(s.influence));
  s.externalImpact=obj(s.externalImpact)?s.externalImpact:{};
  // Filter is optional to accept Phase 1–9 states. Invalid filter data is
  // rebuilt from surviving explicit acknowledgements rather than trusted.
  s.externalFilter=typeof d.externalFilter==='string'&&d.externalFilter.length===Math.ceil(REPLAY_BYTES/3)*4&&/^[a-zA-Z0-9+/]*={0,2}$/.test(d.externalFilter)?d.externalFilter:'';
  return s;
 }
 function migrate(v2=storageRead(S2)||window.SlopWorld?.state,v3=storageRead(S3)||window.SlopSociety?.data,v31=storageRead(S31)){
  const s=fresh();s.seen=[...new Set(observedIds(v2,v3))].slice(-MAX_SEEN);
  s.rewards.claimed=[...new Set((v31?.claimed||[]).filter(x=>typeof x==='string'))];
  s.sourceSeen=s.seen.filter(x=>/^(fact\.discovered|cascade\.triggered|social\.published|court\.verdict|market\.trade|app\.installed):/.test(x));
  s.events=[{id:'migration-v32',type:'world.migrated',title:'Your fictional internet survived the upgrade',detail:`Preserved ${s.rewards.claimed.length} claimed missions and ${s.seen.length} observed legacy actions.`,at:now(),effects:['Existing credits, achievements, and progress preserved']}];
  return s;
 }
 // Restore journal is used only for import. Incomplete transactions roll back on next load.
 function recoverRestore(){
  for(const key of [JOURNAL,CLAIM_JOURNAL]){
  const journal=storageRead(key);
  if(!journal)continue;
  if(!obj(journal)||!obj(journal.before)||!KEYS.every(k=>Object.hasOwn(journal.before,k)))throw Error('An invalid restore journal needs manual recovery.');
  for(const k of KEYS){const prior=journal.before[k];if(prior===null)localStorage.removeItem(k);else localStorage.setItem(k,prior);}
  localStorage.removeItem(key);
  }
 }
 let recovered=false,warning='';
 try{
  const interrupted=!!rawRead(JOURNAL)||!!rawRead(CLAIM_JOURNAL);
  recoverRestore();recovered=interrupted;
  if(interrupted){
   // Legacy engines loaded before v32. Refresh their in-memory models after
   // rolling back on-disk data, otherwise the next action could overwrite it.
   for(const k of [S3,S2])window.dispatchEvent(new StorageEvent('storage',{key:k,oldValue:null,newValue:rawRead(k)}));
  }
 }catch(e){warning='Restore recovery blocked: '+e.message;}
 let existing=storageRead(KEY),data;
 try{if(existing!==null)data=normalize(existing);else {data=migrate();localStorage.setItem(KEY,JSON.stringify(data));}}
 catch(e){warning=warning||'Stored world ledger is invalid; it was not overwritten. Export a backup before repair.';data=migrate();}
 let channel=null,applying=false,lastSaved=JSON.stringify(data),timer=0;
 try{if('BroadcastChannel' in window){channel=new BroadcastChannel(CHANNEL);channel.onmessage=e=>{if(e.data?.tab===tabId)return;if(e.data?.type==='restore'){location.reload();return}if(e.data?.type==='update')refresh(true);};}}catch(_){}
 function persist(){
  data.revision=Math.max(data.revision,int(storageRead(KEY)?.revision))+1;
  data.updated=now();data.lastWriter=tabId;
  data.seen=data.seen.slice(-MAX_SEEN);data.events=data.events.slice(0,MAX_EVENTS);data.inventory=data.inventory.slice(0,MAX_ITEMS);data.externalSeen=data.externalSeen.slice(-MAX_EXTERNAL);
  localStorage.setItem(KEY,JSON.stringify(data));lastSaved=JSON.stringify(data);
  channel?.postMessage({type:'update',tab:tabId,revision:data.revision});
  window.dispatchEvent(new CustomEvent('slop32:update',{detail:{revision:data.revision}}));
 }
 function refresh(silent=false){
  const next=storageRead(KEY);if(next&&checkSource(KEY,next)&&next.revision>=data.revision){data=normalize(next);if(!silent)window.dispatchEvent(new CustomEvent('slop32:update',{detail:{revision:data.revision}}));}
 }
 // Cross-tab serialized writes use the browser's Web Locks API. Fallback: rebase
 // immediately before the write, then verify; best effort without Web Locks.
 async function exclusive(task){
  const run=async()=>{refresh(true);const old=clone(data);try{return await task();}catch(e){const disk=storageRead(KEY);data=disk&&checkSource(KEY,disk)?normalize(disk):old;throw e;}};
  if(navigator.locks?.request)return navigator.locks.request('slopocalypse-v32-write',{mode:'exclusive'},run);
  return run();
 }
 // Compact replay tracking is deliberately separate from user-facing history.
 // Cache decoded bytes between events; invalidate after cross-tab rebases,
 // failed writes, backup restores or storage-event refreshes.
 let replayCache='',replayBytes=null;
 function replayPositions(id){
  const h1=hash('slop10-1:'+id),h2=(hash('slop10-2:'+id)|1)>>>0;
  const out=[];
  for(let i=0;i<REPLAY_HASHES;i++)out.push(((h1+Math.imul(i,h2)+Math.imul(i*i,0x9e3779b9))>>>0)%REPLAY_BITS);
  return out;
 }
 function replayMark(bits,id){for(const pos of replayPositions(id))bits[pos>>>3]|=(1<<(pos&7));}
 function replayEncode(bits){let s='';for(let i=0;i<bits.length;i+=8192)s+=String.fromCharCode(...bits.subarray(i,i+8192));return btoa(s);}
 function replayBits(){
  if(replayBytes&&replayCache===data.externalFilter)return replayBytes;
  let bits=null;
  if(data.externalFilter)try{const decoded=atob(data.externalFilter);if(decoded.length===REPLAY_BYTES){bits=new Uint8Array(REPLAY_BYTES);for(let i=0;i<REPLAY_BYTES;i++)bits[i]=decoded.charCodeAt(i);}}catch(_){}
  if(!bits){bits=new Uint8Array(REPLAY_BYTES);for(const id of data.externalSeen)replayMark(bits,id);for(const id of data.seen)if(id.startsWith('external:'))replayMark(bits,id);}
  replayBytes=bits;replayCache=data.externalFilter;return bits;
 }
 function replayHas(id){const bits=replayBits();return replayPositions(id).every(pos=>(bits[pos>>>3]&(1<<(pos&7)))!==0);}
 function replayAdd(id){const bits=replayBits();replayMark(bits,id);data.externalFilter=replayEncode(bits);replayCache=data.externalFilter;}
 function inventoryAdd(id,name,source){const existing=data.inventory.find(x=>x.id===id);if(existing)existing.qty=Math.min(9999,existing.qty+1);else data.inventory.unshift({id,name,source,qty:1});}
 function details(kind,id,subject){
  const seed=kind+':'+id;
  const rule={
   'fact.discovered':{item:'citation-crystal',name:'Unverified Citation Crystal',title:'Fact officially unverified',detail:`${cap(subject,85)} became a cross-app rumor.`,impact:3},
   'cascade.triggered':{item:'scandal-receipt',name:'Global Scandal Receipt',title:'Hallucination cascade propagated',detail:'Fictional media, court cases, and cloud services now have something to overreact to.',impact:9},
   'social.published':{item:'engagement-dust',name:'Synthetic Engagement Dust',title:'Influence amplified',detail:'One human post joined the imaginary bot discussion.',impact:5},
   'court.verdict':{item:'legal-stamp',name:'Legally Questionable Stamp',title:'Fictional verdict archived',detail:`Case ${cap(subject,80)} entered the public record.`,impact:7},
   'market.trade':{item:'market-confetti',name:'Market Volatility Confetti',title:'Paper trade broadcast',detail:'Financial influencers will report this as market sentiment.',impact:4},
   'app.installed':{item:'installation-receipt',name:'Unnecessary Software Receipt',title:'An app invaded SlopOS',detail:`${cap(subject,70)} joined the fictional desktop.`,impact:2}
  }[kind];
  const w=pick(seed,['The board applauded without understanding.','Three bots voted unanimously against math.','One highly qualified gradient resigned.','The intern was promoted to senior intern.']);
  return {...rule,flavor:w};
 }
 function record(kind,id,subject){
  const code=kind+':'+id;
  if(data.seen.includes(code)||data.sourceSeen.includes(code))return null;
  const d=details(kind,id,subject);
  if(!d)return null;
  data.seen.push(code);
  data.sourceSeen.push(code);
  inventoryAdd(d.item,d.name,kind);
  data.influence+=d.impact;
  const event={id:code,type:kind,title:d.title,detail:d.detail,at:now(),effects:[`+1 ${d.name}`,`+${d.impact} fictional influence`,d.flavor]};
  data.events.unshift(event);
  return event;
 }
 function changes(){
  const v2=storageRead(S2)||window.SlopWorld?.state||{};
  const v3=storageRead(S3)||window.SlopSociety?.data||{};
  const entries=[];
  for(const f of (v2.facts||[]).slice(0,24).reverse())if(f.id)entries.push(['fact.discovered',f.id,f.text]);
  for(const h of (v3.history||[]).slice(0,100).reverse())if(h.type==='CASCADE'&&h.id)entries.push(['cascade.triggered',h.id,h.text]);
  for(const p of (v3.posts||[]).slice(0,60).reverse())if(p.agent==='You, Allegedly'&&p.id)entries.push(['social.published',p.id,p.text]);
  for(const c of (v3.cases||[]).slice(0,30).reverse())if(c.status==='CLOSED'&&c.id)entries.push(['court.verdict',c.id,c.title]);
  for(const t of (v2.transactions||[]).slice(0,50).reverse())entries.push(['market.trade',tradeKey(t),`${t.direction} ${t.qty} ${t.token}`]);
  for(const app of v2.installed||[])entries.push(['app.installed',app,app]);
  return entries;
 }
 function processSync(){
  if(applying||warning)return [];
  applying=true;
  try{
   refresh(true);
   const created=[];
   const current=changes();
   const active=new Set(current.map(([kind,id])=>kind+':'+id));
   const priorSource=JSON.stringify(data.sourceSeen);
   // Keep explicit acknowledgements for the currently observable legacy sources.
   // This avoids replaying them when 600 unrelated external events evict the
   // general recent-ID cache, without unbounded growth of backup data.
   data.sourceSeen=data.sourceSeen.filter(id=>active.has(id));
   for(const id of active)if(data.seen.includes(id)&&!data.sourceSeen.includes(id))data.sourceSeen.push(id);
   data.sourceSeen=data.sourceSeen.slice(-500);
   for(const [kind,id,subject] of current){
    const e=record(kind,id,subject);if(e)created.push(e);
   }
   if(created.length||JSON.stringify(data.sourceSeen)!==priorSource)persist();
   // Consequences create only bounded fictional data; do not recursively emit
   // another cascade. Existing 2.0 -> 3.0 fact promotion stays untouched.
   for(const event of created){
    try{
     if(event.type==='market.trade')window.SlopWorld?.addMail('Fictional Market Bureau','Your imaginary trade made the news',`Paper trade: ${event.id.slice(13,130)}. This is a parody, not investing.`);
     if(event.type==='court.verdict')window.SlopWorld?.addMail('Department of Absurd Justice','Your fictional ruling is on record',event.detail);
     if(event.type==='app.installed')window.SlopWorld?.addMail('Unnecessary Software Department','A new app has appeared',`Inventory updated. ${event.detail}`);
     if(event.type==='fact.discovered')window.SlopWorld?.addMail('Citation Verification Office','Your research is highly suspicious',`The following claim was captured in the world ledger: ${event.detail}`);
    }catch(_){}
   }
   return created;
  }finally{applying=false;}
 }
 function schedule(){clearTimeout(timer);timer=setTimeout(()=>{exclusive(processSync).catch(e=>{warning='Cross-tab event update failed: '+e.message;});},25);}
 // Idempotent mission rewards: claim marker and legacy wallet are updated under
 // one Web Lock. The transaction journal enables recovery if storage fails.
 async function claimMission(id,award,eligible){
  if(warning)return {ok:false,reason:warning};
  if(typeof id!=='string'||!/^[a-z-]{1,45}$/.test(id)||!Number.isSafeInteger(award)||award<=0||award>1000)return {ok:false,reason:'Invalid reward request'};
  return exclusive(()=>{
   if(!eligible())return {ok:false,reason:'Complete the mission first'};
   // Check the durable claim marker *inside* the native Web Lock. A tab's
   // in-memory v32 revision can briefly outrun the persisted revision after
   // background work; a second claimant must not report false success.
   const durable=storageRead(KEY);
   if(durable?.rewards?.claimed?.includes(id)){
    data=normalize(durable);
    return {ok:false,reason:'Already claimed'};
   }
   if(data.rewards.claimed.includes(id))return {ok:false,reason:'Already claimed'};
   const v2=storageRead(S2);const ui=storageRead(S31);
   if(!checkSource(S2,v2)||!checkSource(S31,ui))return {ok:false,reason:'Legacy state unavailable'};
   const before={v2:rawRead(S2),ui:rawRead(S31),v32:rawRead(KEY)};
   try{
    localStorage.setItem(CLAIM_JOURNAL,JSON.stringify({version:1,before:{[S2]:before.v2,[S3]:rawRead(S3),[S31]:before.ui,[KEY]:before.v32},created:now()}));
    // Keep the existing SlopWorld instance synchronized, rather than modifying
    // a detached copy of its wallet and risking the next legacy mutation.
    if(!window.SlopWorld.mutate(s=>{s.credits=Math.max(int(v2.credits),int(s.credits))+award;s.reputation=(int(s.reputation)+1)}))throw Error('Legacy wallet write failed');
    data.rewards.claimed.push(id);
    const ui2=storageRead(S31);if(!ui2.claimed.includes(id))ui2.claimed.push(id);
    localStorage.setItem(S31,JSON.stringify(ui2));
    data.events.unshift({id:'mission:'+id,type:'reward.claimed',title:'Mission reward: '+id,detail:`+${award} Synergy Credits. One-time reward.`,at:now(),effects:[`+${award} fictional credits`,'Reward safely registered']});
    persist();
    localStorage.removeItem(CLAIM_JOURNAL);
    return {ok:true,amount:award};
   }catch(e){
    try{if(before.v2!==null)localStorage.setItem(S2,before.v2);if(before.ui!==null)localStorage.setItem(S31,before.ui);if(before.v32!==null)localStorage.setItem(KEY,before.v32);}catch(_){}
    try{localStorage.removeItem(CLAIM_JOURNAL);}catch(_){}
    for(const k of [S2,S31])window.dispatchEvent(new StorageEvent('storage',{key:k,oldValue:null,newValue:rawRead(k)}));
    // A failed persist may have advanced the in-memory revision before throwing.
    // Force the durable rollback snapshot rather than revision-gated refresh.
    const reverted=storageRead(KEY);data=reverted&&checkSource(KEY,reverted)?normalize(reverted):migrate();
    return {ok:false,reason:'Could not save reward: '+e.message};
   }
  });
 }
 function archive(){
  const v2=storageRead(S2)||window.SlopWorld?.state||{};
  const v3=storageRead(S3)||window.SlopSociety?.data||{};
  return {version:data.version,revision:data.revision,influence:data.influence,events:clone(data.events),inventory:clone(data.inventory),claimed:clone(data.rewards.claimed),credits:int(v2.credits,1200),achievements:[...new Set([...(v2.achievements||[]),...(v3.achievements||[])])],modules:[...(v3.modules||[])],warning};
 }
 const checksum=s=>hash(s).toString(16).padStart(8,'0');
 const bytes=s=>new TextEncoder().encode(s).byteLength;
 function storageHealth(){const sizes=Object.fromEntries(KEYS.map(k=>[k,bytes(rawRead(k)||'')]));const total=Object.values(sizes).reduce((n,v)=>n+v,0);let backupBytes=0,backupValid=false,backupError='';try{const b=exportPayload();backupBytes=bytes(JSON.stringify(b));validateBackup(b);backupValid=true;}catch(e){backupError=e.message;}return {sizes,total,backupBytes,backupValid,backupError,limit:3000000};}
 function exportPayload(){
  refresh(true);const stores={};for(const k of KEYS)stores[k]=storageRead(k);
  const payload={format:'slopocalypse-local-backup',version:2,exportedAt:now(),stores};
  payload.checksum='fnv1a32-'+checksum(JSON.stringify({format:payload.format,version:payload.version,exportedAt:payload.exportedAt,stores:payload.stores}));
  if(bytes(JSON.stringify(payload))>3_000_000)throw Error('Backup exceeds 3 MB; archive old content before exporting.');
  return payload;
 }
 function downloadBackup(){const payload=exportPayload();const b=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(b);const a=document.createElement('a');a.href=url;a.download='SLOPOCALYPSE-3.1-PHASE2-PROGRESS.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);return payload;}
 function validateBackup(b){
  if(!obj(b)||b.format!=='slopocalypse-local-backup'||![1,2].includes(b.version)||!obj(b.stores))throw Error('Unsupported or malformed backup.');
  const keys=b.version===1?[S2,S3,S31]:KEYS;
  for(const k of keys){if(!Object.hasOwn(b.stores,k)||!checkSource(k,b.stores[k]))throw Error('Missing or invalid state: '+k);}
  if(b.version===2){if(b.stores[KEY]==null)throw Error('Version 2 backup has no world ledger.');const check='fnv1a32-'+checksum(JSON.stringify({format:b.format,version:b.version,exportedAt:b.exportedAt,stores:b.stores}));if(b.checksum!==check)throw Error('Backup checksum does not match: file was modified or damaged.');}
  // Deep shape and size checks for arbitrary local files. No executable code runs.
  const length=bytes(JSON.stringify(b));
  if(length>3_000_000)throw Error('Backup exceeds 3 MB.');
  const counts=b.stores;
  if((counts[S2]?.events||[]).length>500||(counts[S2]?.mails||[]).length>500||(counts[S2]?.facts||[]).length>500||(counts[S3]?.news||[]).length>500||(counts[S3]?.posts||[]).length>500||(counts[S3]?.history||[]).length>500||(counts[S31]?.history||[]).length>1000||(counts[KEY]?.events||[]).length>1000)throw Error('Unusually large record collection.');
  const restored=b.version===1?{...counts,[KEY]:migrate(counts[S2],counts[S3],counts[S31])}:counts;
  return {stores:restored,fromVersion:b.version,preview:{credits:counts[S2]?.credits||0,cascades:counts[S3]?.cascades||0,claimed:(counts[S31]?.claimed||[]).length,ledger:(restored[KEY]?.events||[]).length}};
 }
 let restoring=false;
 async function restoreBackup(input){
  if(restoring)throw Error('Restore is already in progress');
  const validated=validateBackup(input);
  restoring=true;
  try{return await exclusive(()=>{
   const before=Object.fromEntries(KEYS.map(k=>[k,rawRead(k)]));
   // Crash-safe rollback journal is stored before any original key is changed.
   localStorage.setItem(JOURNAL,JSON.stringify({version:1,before,created:now()}));
   try{
    for(const k of KEYS){const v=validated.stores[k];if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,JSON.stringify(v));}
    for(const k of KEYS){const v=validated.stores[k];if(JSON.stringify(storageRead(k))!==JSON.stringify(v??null))throw Error('Read-back verification failed for '+k);}
    localStorage.removeItem(JOURNAL);
    data=normalize(storageRead(KEY));
    for(const k of [S2,S3,S31])window.dispatchEvent(new StorageEvent('storage',{key:k,oldValue:null,newValue:rawRead(k)}));
    channel?.postMessage({type:'restore',tab:tabId});
    return validated.preview;
   }catch(e){
    let failures=[];
    for(const k of KEYS){try{if(before[k]===null)localStorage.removeItem(k);else localStorage.setItem(k,before[k]);}catch(rollback){failures.push(k);}}
    if(!failures.length)localStorage.removeItem(JOURNAL);
    for(const k of [S2,S3,S31])window.dispatchEvent(new StorageEvent('storage',{key:k,oldValue:null,newValue:rawRead(k)}));
    throw Error('Import rolled back: '+e.message+(failures.length?' (manual recovery needed)':''));
   }
  });}
  finally{restoring=false;}
 }
 function onChange(e){if(e.key===KEY){refresh();}if([S2,S3].includes(e.key)){schedule();}}
 window.addEventListener('storage',onChange);
 window.addEventListener('slop:world',schedule);
 window.addEventListener('slop3:update',schedule);
 // Allow older modules to populate state before the first observation.
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
 // Additive Phase 6 event projection: persistent, idempotent, no phantom currency.
 async function recordExternal(event){
  if(warning)throw Error(warning);
  return exclusive(()=>{
   const id=cap(event?.id,90),title=cap(event?.title,130),type=cap(event?.type||'phase6.action',45);
   if(!id||!title)throw Error('Invalid Phase 6 event');
   const key='external:'+id;
   if(data.seen.includes(key)||data.externalSeen.includes(key)||replayHas(key))return false;
   data.seen.push(key);data.externalSeen.push(key);replayAdd(key);
   const previous=Math.max(0,int(data.externalImpact[type],0));
   const influence=previous<3?Math.min(8,Math.max(0,int(event?.influence,2))):0;
   data.externalImpact[type]=Math.min(3,previous+1);
   data.influence+=influence;
   data.events.unshift({id:key,type,title,detail:cap(event?.detail||'A locally stored fictional event.',230),at:now(),effects:[`+${influence} fictional influence`,'Recorded in the shared World ledger']});
   persist();return true;
  });
 }
 window.SlopWorld32={get state(){return data},get warning(){return warning},get storageKey(){return KEY},get ledger(){return archive()},get backupVersion(){return 2},get restoredJournalRecovered(){return recovered},sync:()=>exclusive(processSync),claimMission,exportPayload,downloadBackup,validateBackup,restoreBackup,exclusive,recordExternal,storageHealth};
})();
