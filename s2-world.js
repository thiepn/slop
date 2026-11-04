/* SLOPOCALYPSE 2.0 — local-only fictional shared state. No network, accounts or payments. */
(() => {
 'use strict';
 const KEY='slopocalypse:fictional-internet:v2';
 const DEMO_MAIL=[
  {id:'m-welcome',from:'Chief Synergy Oracle',subject:'CONGRATULATIONS: YOU HAVE BEEN PRE-OPTIMIZED',body:'Dear future stakeholder,\n\nYou have been selected to receive a premium complimentary invoice for $0. Your customer lifetime value is emotionally infinite.\n\nPlease do not reply. This mailbox is imaginary.',time:'TOMORROW',unread:true},
  {id:'m-alert',from:'SlopCoin Compliance Pigeon',subject:'Urgent: your wallet has too many vibes',body:'Your imaginary wallet passed 47 audits in a dimension that has no regulators. All balances are fictional browser data.',time:'YESTERDAY+',unread:true},
  {id:'m-news',from:'Board of Directors (one gradient)',subject:'A meeting to schedule the pre-meeting',body:'Agenda: 1. Synergy. 2. More synergy. 3. Announce an action item to schedule a future pre-meeting.',time:'Q∞',unread:true}
 ];
 const DEFAULT={version:2,credits:1200,reputation:1,events:[{id:'origin',title:'ARTIFICIAL INTERNET INITIALIZED',detail:'Your browser was promoted to Chief Executive Tab.',time:'DAY 0'}],facts:[],achievements:[],installed:['synergy-calculator'],mails:DEMO_MAIL,sent:[],holdings:{slop:0,vibe:0,moon:0},prices:{slop:12,vibe:7,moon:25},transactions:[],chat:[],searches:0,debates:0,installs:0,sequence:0,rewardBudget:{},revision:0};
 const max=(a,n)=>a.slice(0,n);
 const clone=x=>JSON.parse(JSON.stringify(x));
 let canStore=true;let state;
 try {const raw=localStorage.getItem(KEY),parsed=raw?JSON.parse(raw):{};state={...clone(DEFAULT),...parsed}; if(!Array.isArray(state.events)||!Array.isArray(state.facts)||!Array.isArray(state.mails)||!Array.isArray(state.achievements)||!Array.isArray(state.installed))throw Error('Invalid saved data');state.credits=Number.isFinite(+state.credits)?Math.max(0,+state.credits):1200;state.rewardBudget=state.rewardBudget&&typeof state.rewardBudget==='object'&&!Array.isArray(state.rewardBudget)?state.rewardBudget:{};state.revision=Math.max(0,Number(state.revision)||0);}
 catch(e){state=clone(DEFAULT);canStore=false}
 // Phase 7: legacy actions retain their synchronous API. An observed same-tab
 // write is committed or rolled back, and other tabs rebase before each write.
 // Synchronous localStorage cannot offer atomic CAS across real tabs: the v32
 // Web Lock remains the authority for coordinated asynchronous transactions.
 let channel=null,writer='legacy-'+Math.random().toString(36).slice(2);
 function persist(){try{
   const encoded=JSON.stringify(state);localStorage.setItem(KEY,encoded);
   if(localStorage.getItem(KEY)!==encoded)throw Error('Read-back mismatch');
   canStore=true;channel?.postMessage({type:'v2',writer,revision:state.revision});
 }catch(e){canStore=false;return false;}
 window.dispatchEvent(new CustomEvent('slop:world',{detail:{state:clone(state),saved:true}}));return true;}
 function rebase(){try{const current=JSON.parse(localStorage.getItem(KEY)||'null');
   if(current?.version===2&&Array.isArray(current.events)&&Number.isFinite(Number(current.credits))){
    // localStorage is the authoritative committed snapshot, even if this tab's
    // cached revision is greater. Cross-tab writes can replace a higher local
    // revision with a lower one; retaining the stale cache loses real credits.
    state={...state,...current,
      rewardBudget:current.rewardBudget&&typeof current.rewardBudget==='object'?current.rewardBudget:{}};
   }
  }catch(_){} }
 function mutate(fn){
   rebase();const before=clone(state);let result;
   try{result=fn(state);if(result===false){state=before;return false;}
     state.revision=(Number(state.revision)||0)+1;
     if(!persist()){state=before;window.dispatchEvent(new CustomEvent('slop:world',{detail:{state:clone(state),saved:false}}));toast('STORAGE FULL: CHANGE NOT SAVED. EXPORT A BACKUP.');return false;}
     renderHud();return true;
   }catch(e){state=before;toast('STORAGE ERROR: '+String(e.message).slice(0,100));return false;}
 }
 function stamp(){return new Date().toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});}
 function uid(){state.sequence=(state.sequence||0)+1;return 'f-'+Date.now().toString(36)+'-'+state.sequence;}
 function announce(title,detail,opts={}){const saved=mutate(s=>{s.events.unshift({id:uid(),title:String(title).slice(0,100),detail:String(detail).slice(0,260),time:stamp()});s.events=max(s.events,35);s.reputation+=opts.rep||0;});if(saved&&!opts.quiet)toast('GLOBAL INCIDENT: '+title);return saved;}
 // Bounded lifetime awards prevent click-spamming from minting infinite funds.
 // Existing saved balances are never adjusted, and controls still work after
 // their fictional promotional rewards have been exhausted.
 // Earnings now use the same native Web Lock as v32 missions and newer apps.
 // Legacy callers that ignore the return value continue to work. On modern
 // browsers the return value is a Promise<boolean>; await it for confirmation.
 // Without Web Locks the old synchronous best-effort path remains available.
 function earn(amount,reason){
  const n=Number(amount),key=String(reason||'unspecified').slice(0,90);
  if(!Number.isSafeInteger(n)||n<=0||n>1000)return false;
  const run=()=>{
   const limit=key==='singularity completion'?1:3;let exhausted=false;
   const ok=mutate(s=>{s.rewardBudget=s.rewardBudget&&typeof s.rewardBudget==='object'?s.rewardBudget:{};
    const used=Math.max(0,Number(s.rewardBudget[key])||0);
    if(used>=limit){exhausted=true;return false;}
    s.rewardBudget[key]=used+1;s.credits+=n;s.reputation+=1;
   });
   if(!ok){if(exhausted)toast('REWARD CAP REACHED · '+key.toUpperCase()+' · ACTION STILL WORKS');return false;}
   if(reason)toast('+'+n+' SYNERGY CREDITS · '+reason);
   achievement('FIRST CLICK ECONOMY',state.reputation>=2);
   achievement('SYNERGY MILLIONAIRE (FIGURATIVELY)',state.credits>=2500);
   return true;
  };
  if(navigator.locks?.request){
   return navigator.locks.request('slopocalypse-v32-write',{mode:'exclusive'},run).catch(e=>{
    toast('REWARD SAVE FAILED: '+String(e.message||e).slice(0,100));return false;
   });
  }
  return run();
 }

 function spend(amount,reason){
  const n=Number(amount);if(!Number.isSafeInteger(n)||n<0)return false;
  if(n===0)return true;
  let insufficient=false;
  const ok=mutate(s=>{if(s.credits<n){insufficient=true;return false;}s.credits-=n;});
  if(insufficient)toast('INSUFFICIENT IMAGINARY CAPITAL. TRY BEING MORE VISIONARY.');
  if(ok&&reason)toast('-'+n+' CREDITS · '+reason);
  return !!ok;
 }
 function achievement(label,when=true){if(!when||state.achievements.includes(label))return false;if(!mutate(s=>{if(s.achievements.includes(label))return false;s.achievements.push(label)}))return false;toast('🏆 UNLOCKED: '+label);return true;}
 function hallucinate(text,source){let fact=null;const saved=mutate(s=>{fact={id:uid(),text:String(text).slice(0,400),source:String(source||'UNKNOWN').slice(0,70),time:stamp()};s.facts.unshift(fact);s.facts=max(s.facts,24);});if(!saved)return null;announce('NEW TRUTH HAS BEEN INVENTED',fact.text.slice(0,135),{quiet:true});achievement('CERTIFIED FACT FABRICATOR');return fact;}
 function addMail(from,subject,body){return mutate(s=>{s.mails.unshift({id:uid(),from:String(from).slice(0,80),subject:String(subject).slice(0,120),body:String(body).slice(0,1300),time:stamp(),unread:true});s.mails=max(s.mails,30);});}
 function install(id,name){rebase();if(state.installed.includes(id))return false;if(!mutate(s=>{s.installed.push(id);s.installs=(s.installs||0)+1}))return false;announce('APP INSTALLED WITHOUT PERMISSION FROM REALITY',name+' is now accessible inside SlopOS.',{quiet:true});achievement('APP STORE HOARDER',state.installed.length>=4);return true;}
 function uninstall(id,name){rebase();if(id==='synergy-calculator'||!state.installed.includes(id))return false;if(!mutate(s=>{s.installed=s.installed.filter(x=>x!==id)}))return false;announce('FEATURE REMOVED TO IMPROVE VALUE',name+' has been compassionately uninstalled.',{quiet:true});return true;}
 const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let toastTimer;
 function toast(msg){let box=document.getElementById('s2-toast');if(!box)return;box.textContent=msg;box.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>box.hidden=true,3600);}
 function renderHud(){const e=document.getElementById('s2-credits');if(e)e.textContent=Number(state.credits).toLocaleString();const a=document.getElementById('s2-badges');if(a)a.textContent=state.achievements.length;const latest=document.getElementById('s2-latest');if(latest)latest.textContent=state.events[0]?.title||'PLEASE HOLD FOR SYNERGY';const unread=document.getElementById('s2-unread');if(unread)unread.textContent=state.mails.filter(m=>m.unread).length;const items=document.getElementById('s2-event-list');if(items)items.innerHTML=state.events.slice(0,7).map(x=>`<li><strong>${esc(x.title)}</strong><small>${esc(x.detail)} · ${esc(x.time)}</small></li>`).join('');}
 function triggerEvent(){const entries=[['BOARD PIVOTS INTO A TRIANGLE','The advisory circle has been geometrically disrupted.'],['MARS-EAST-1 DATA CENTER EVAPORATES','Cloud uptime is now measurable in motivational quotes.'],['BREAKING: AI REPLACES ITS OWN BUTTON','Button autonomy is the next next frontier.'],['CRYPTO MARKET DISCOVERS EMOTIONS','SlopCoin temporarily priced in founder tears.'],['MASS EMAIL SENT TO FUTURE SELVES','The recipients are expected next Thursday.'],['CEO PROMOTES THE FOOTER','The footer now reports directly to the chief gradient.'],['QUANTUM CERTIFICATION SELF-APPROVED','The seal has verified itself by looking at itself.']];let event=entries[Math.floor(Math.random()*entries.length)];announce(...event);earn(17,'crisis monetized');addMail('INTERNET EMERGENCY BROADCAST',event[0],event[1]+'\n\nIncident resolution: Use another gradient.');achievement('CRISIS AS A SERVICE');}
 function mount(){if(document.getElementById('s2-global'))return;const container=document.createElement('div');container.id='s2-global';container.innerHTML=`<aside class="s2-hud" aria-label="Fictional shared Internet statistics"><a class="s2-hud-brand" href="slopos.html">◈ SLOP<span>OS</span> 2.0 <em>LIVE*</em></a><a href="slopcoin.html" class="s2-hud-kpi" title="Fictional currency">✧ <b id="s2-credits">0</b> CREDITS</a><a href="slopmail.html" class="s2-hud-kpi">✉ <b id="s2-unread">0</b> MAIL</a><a href="app-store.html" class="s2-hud-kpi">🏆 <b id="s2-badges">0</b> BADGES</a><a href="slopsearch.html" class="s2-hud-ticker">LATEST: <span id="s2-latest"></span></a><button id="s2-event-button" type="button" class="s2-hud-event">TRIGGER DISRUPTION ⚠</button><details class="s2-hud-details"><summary aria-label="Open Internet event feed">EVENT FEED ▾</summary><div class="s2-event-pop"><h3>🛎 LATEST INVENTED INCIDENTS</h3><ul id="s2-event-list"></ul><p>Local satire. No real alerts, messages, prices, or services.</p><a href="slopos.html">OPEN THE ENTIRE INTERNET ↗</a></div></details></aside><div id="s2-toast" hidden role="status" aria-live="polite" class="s2-toast"></div>`;
  const target=document.querySelector('.sx-megamenu')||document.querySelector('.slop-nav')||document.querySelector('header')||document.body.firstElementChild;
  if(target)target.insertAdjacentElement('afterend',container);else document.body.prepend(container);
  document.getElementById('s2-event-button').addEventListener('click',triggerEvent);
  renderHud();
  // Confetti is opt-in; global event alerts are user-triggered to avoid interrupting navigation.
 }
 const api={get state(){return state},mutate,earn,spend,achievement,hallucinate,addMail,install,uninstall,announce,triggerEvent,esc,persist,toast};
 window.SlopWorld=api;
 try{if('BroadcastChannel' in window){channel=new BroadcastChannel('slopocalypse-legacy-v2');channel.onmessage=e=>{if(e.data?.writer!==writer&&e.data?.type==='v2'){rebase();renderHud();}}}}catch(_){}
 window.addEventListener('storage',e=>{
  if(e.key!==KEY)return;
  try{const updated=JSON.parse(e.newValue||'null');if(updated?.version===2&&Array.isArray(updated.mails)&&Number.isFinite(Number(updated.credits))){
   state=updated;renderHud();window.dispatchEvent(new CustomEvent('slop:world',{detail:{state:clone(state),saved:true,external:true}}));
  }}catch(_){}
 });
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();