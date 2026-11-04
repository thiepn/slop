/* SLOPOCALYPSE 3.2 / Phase 7: operational safety without external services. */
(()=>{'use strict';
 const W=window.SlopWorld, X=window.SlopWorld32;
 if(!W||!X)return;
 const get=id=>document.getElementById(id);
 const safeText=(x)=>String(x==null?'':x);
 let opener=null;const inertState=new Map();
 function format(n){return new Intl.NumberFormat(undefined,{maximumFractionDigits:1}).format((n||0)/1024)+' KiB';}
 function metrics(){
  try{return X.storageHealth();}catch(e){return {sizes:{},total:0,backupBytes:0,backupValid:false,backupError:String(e.message),limit:3000000};}
 }
 function render(){const pane=get('s37-body');if(!pane)return;
  const info=metrics(),p=window.SlopWorld?.state||{},rewards=p.rewardBudget||{};
  const capped=Object.entries(rewards).filter(([why,n])=>Number(n)>=(why==='singularity completion'?1:3));
  const overview=document.createElement('div');overview.className='s37-summary';
  const health=document.createElement('p');health.className='s37-health';health.textContent=info.backupValid?'✓ Current progress passes backup validation.':'! Backup cannot be validated: '+info.backupError;
  overview.append(health);
  const stats=document.createElement('div');stats.className='s37-stats';
  for(const [a,b] of [['4-store local data',format(info.total)],['Backup payload',format(info.backupBytes)],['Backup ceiling',format(info.limit)],['Capped legacy awards',String(capped.length)]]){
    const item=document.createElement('div');const label=document.createElement('small');label.textContent=a;const value=document.createElement('strong');value.textContent=b;item.append(label,value);stats.append(item);
  }
  overview.append(stats);
  const list=document.createElement('ul');list.className='s37-stores';
  for(const [k,n] of Object.entries(info.sizes)){const li=document.createElement('li');const name=document.createElement('span');name.textContent=k.split(':').at(-1);const size=document.createElement('strong');size.textContent=format(n);li.append(name,size);list.append(li);}
  const note=document.createElement('p');note.className='s37-note';note.textContent='Legacy credit awards are now limited to three per reward category for the lifetime of this local save. Fictional actions remain playable. Existing balances are unchanged. Native simultaneous legacy-tab writes cannot be made fully atomic by localStorage alone.';
  const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent='View exhausted legacy rewards ('+capped.length+')';details.append(summary);
  const ul=document.createElement('ul');ul.className='s37-cap-list';
  for(const [name,n] of capped.slice(0,36)){const li=document.createElement('li');li.textContent=name+' · '+n+' credited actions';ul.append(li);}
  if(!capped.length){const li=document.createElement('li');li.textContent='None yet';ul.append(li);}details.append(ul);
  pane.replaceChildren(overview,list,note,details);
  const btn=get('s37-export');if(btn)btn.disabled=!info.backupValid;
 }
 function status(s){get('s37-message').textContent=s;}
 function open(){if(!get('s37-modal').hidden)return;opener=document.activeElement;
  get('s37-shade').hidden=false;get('s37-modal').hidden=false;
  for(const sibling of [...document.body.children]){if(sibling===get('s37-shade')||sibling===get('s37-modal'))continue;inertState.set(sibling,sibling.inert);sibling.inert=true;}
  get('s37-open').setAttribute('aria-expanded','true');render();
  get('s37-close').focus();
 }
 function close(){if(get('s37-modal').hidden)return;get('s37-modal').hidden=true;get('s37-shade').hidden=true;
  for(const [el,was] of inertState){if(el.isConnected)el.inert=was;}inertState.clear();
  get('s37-open').setAttribute('aria-expanded','false');if(opener?.isConnected)opener.focus();}
 function mount(){const bar=get('s31-bar');if(!bar||get('s37-open'))return;
  const button=document.createElement('button');button.type='button';button.className='s37-header-action';button.id='s37-open';button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','s37-modal');button.setAttribute('aria-label','Open local data health and backup verification');
  button.innerHTML='<span aria-hidden="true">◇</span><span class="s37-wide-label">Data health</span>';
  const anchor=bar.querySelector('[data-s31-open="settings"]');bar.insertBefore(button,anchor||null);
  const shade=document.createElement('div');shade.id='s37-shade';shade.hidden=true;
  const dialog=document.createElement('section');dialog.id='s37-modal';dialog.hidden=true;dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','s37-title');
  dialog.innerHTML=`<header class="s37-head"><div><span class="s37-eyebrow">SLOP SYSTEM INTEGRITY DEPARTMENT</span><h2 id="s37-title">Saved progress &amp; reward safety</h2><p>Actual controls. Fictional internet. Everything stays in this browser.</p></div><button type="button" id="s37-close" aria-label="Close data health dialog">×</button></header><div id="s37-body"></div><div class="s37-actions"><button type="button" id="s37-refresh">↻ Inspect progress</button><button type="button" id="s37-sync">Reconcile ledger</button><button type="button" id="s37-export">Export verified backup</button></div><p class="s37-message" id="s37-message" role="status" aria-live="polite">No local data leaves your device.</p><p class="s37-foot">To import a saved backup, use the Control Center → Settings. Keep the same local origin for automatic progress retention.</p>`;
  document.body.append(shade,dialog);
  button.addEventListener('click',open);get('s37-close').addEventListener('click',close);shade.addEventListener('click',close);
  get('s37-refresh').addEventListener('click',()=>{render();status('Progress verified from current local storage.');});
  get('s37-sync').addEventListener('click',async()=>{try{await X.sync();render();status('World ledger reconciled. Stored events are not duplicated.');}catch(e){status('Could not reconcile the ledger: '+e.message);}});
  get('s37-export').addEventListener('click',()=>{try{X.downloadBackup();status('Verified JSON backup downloaded. Keep it safe.');}catch(e){status('Export unavailable: '+e.message);render();}});
  document.addEventListener('keydown',e=>{if(get('s37-modal').hidden)return;
   if(e.key==='Escape'){e.preventDefault();close();return;}
   if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();e.stopImmediatePropagation();return;}
   if(e.key!=='Tab')return;
   const focusables=[...get('s37-modal').querySelectorAll('button:not([disabled]),summary,[tabindex="0"]')].filter(x=>x.getClientRects().length>0);
   if(!focusables.length)return;
   if(e.shiftKey&&document.activeElement===focusables[0]){e.preventDefault();focusables.at(-1).focus();}
   else if(!e.shiftKey&&document.activeElement===focusables.at(-1)){e.preventDefault();focusables[0].focus();}
  },true);
  window.addEventListener('storage',e=>{if(!get('s37-modal').hidden&&e.key?.startsWith('slopocalypse:'))render();});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
