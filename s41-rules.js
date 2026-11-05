/* SLOPOCALYPSE 4.1 — pure, deterministic authored-story rules.
 * No storage, network, timers, DOM, wallet or campaign mutation. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.Slop41Rules=api;})(typeof window!=='undefined'?window:this,function(){'use strict';
const CAMPAIGNS=['mango','cloud','election'];
const FALLBACK={mango:{truth:['verified','trial'],brand:['unicorn','trial'],sue:['trial','unicorn']},cloud:{settle:['treaty','chaos'],reset:['reboot','chaos'],rights:['chaos','reboot']},election:{independent:['fair','recount'],corporate:['ceo','recount'],invalidate:['recount','ceo']}};
const OPERATORS=['news','book','ads','coin','cloud','government'];
const ARCHITECTURES=['verified','empire','autonomy','reset'];
const TITLES={verified:'Verified Internet',empire:'Infinite Engagement Empire',autonomy:'Autonomous Civilization',reset:'Great Reset'};
const clone=x=>JSON.parse(JSON.stringify(x));
const own=(obj,key)=>Object.prototype.hasOwnProperty.call(obj||{},key);
const validString=x=>typeof x==='string'&&x.length<=120;
const emptyRun=id=>({id,episode:1,step:0,choices:{},artifacts:{},bindings:{},consent:'unset',testConsent:false,review:{proposal:null,authority:false,qualified:false,assents:{},position:0,attempts:[]},events:[],effectQueue:[],outcome:null,completed:false});
function fresh(){return {version:41,revision:0,nextRun:2,active:'r1',runs:[emptyRun('r1')]};}
function normalize(data){if(!data||data.version!==41||!Array.isArray(data.runs))return fresh();const x=clone(data);x.runs=x.runs.filter(r=>r&&/^r[0-9]{1,6}$/.test(r.id)&&r.choices&&r.bindings).slice(0,8);if(!x.runs.length)return fresh();x.nextRun=Math.max(Number(x.nextRun)||2,2);x.active=x.runs.some(r=>r.id===x.active)?x.active:x.runs[0].id;x.revision=Math.max(0,Number(x.revision)||0);for(const r of x.runs){r.episode=Math.max(1,Math.min(9,Number(r.episode)||1));r.step=Math.max(0,Number(r.step)||0);r.artifacts=r.artifacts||{};r.choices=r.choices||{};r.bindings=r.bindings||{};r.consent=['unset','declined','limited','review_only'].includes(r.consent)?r.consent:'unset';r.review=r.review||{};r.review.assents=r.review.assents||{};r.review.attempts=Array.isArray(r.review.attempts)?r.review.attempts.slice(-8):[];r.review.position=Math.max(0,Math.min(6,Number(r.review.position)||0));r.events=Array.isArray(r.events)?r.events.slice(-180):[];r.effectQueue=Array.isArray(r.effectQueue)?r.effectQueue.slice(-24):[];r.completed=!!r.completed;}return x;}
function active(s){return s.runs.find(r=>r.id===s.active);}
function newRun(s){if(s.runs.length>=8)throw Error('Eight story histories are saved. Export a backup before archiving an older run.');const id='r'+s.nextRun++;s.runs.push(emptyRun(id));s.active=id;return id;}
function selectRun(s,id){if(!s.runs.some(r=>r.id===id))throw Error('Unknown story run');s.active=id;return id;}
function chapter(r,data){return data[r.episode-1];}
function current(r,data){return chapter(r,data)?.scenes[r.step]||null;}
function verifyCampaign(id,c,def){if(!CAMPAIGNS.includes(id))throw Error('Unsupported campaign');if(!c||c.status!=='completed'||!Array.isArray(c.decisions)||c.decisions.length!==3||!def||!def.nodes)throw Error('A complete 4.0 campaign with three verifiable decisions is required.');let node=def.start;for(const d of c.decisions){if(d.node!==node||!validString(d.option))throw Error('Campaign route differs from original source');const option=def.nodes[node]?.options?.find(x=>x.id===d.option);if(!option)throw Error('Unknown campaign decision');node=option.to;}const fin=c.decisions[2];const mapping=FALLBACK[id][fin.option];if(!mapping||!node.startsWith('!')||!Number.isFinite(Number(fin.support))||typeof fin.approved!=='boolean')throw Error('Invalid final coalition record');const approved=fin.support>=53;if(fin.approved!==approved)throw Error('Coalition approval conflicts with support');const expected=mapping[approved?0:1];if(c.ending!==expected||fin.resolvedEnding!==expected)throw Error('Recorded ending conflicts with 4.0 resolver');return {campaign:id,decisions:clone(c.decisions),ending:expected,proposal:fin.option,approved,support:fin.support,sourceRun:c.run??null,verified:true};}
function bind(r,id,c,def){if(own(r.bindings,id))return r.bindings[id];const verified=verifyCampaign(id,c,def);verified.bindingId=r.id+':'+id+':'+Object.keys(r.bindings).length;r.bindings[id]=verified;return verified;}
function grant(r,defs){for(const x of defs||[]){if(!own(r.artifacts,x.id))r.artifacts[x.id]={status:x.status||'obtained',source:x.source||'authored-fiction',privacy:x.privacy||'public'};}}
function event(r,scene){const id=r.id+':'+String(r.episode).padStart(2,'0')+':'+scene.id;if(r.events.some(x=>x.id===id))return;const entry={id,title:scene.title,chapter:r.episode};r.events.push(entry);if(r.events.length>180)r.events=r.events.slice(-180);if(scene.effect)r.effectQueue.push({id,headline:scene.effect,projected:false});}
function advance(r,data){r.step++;if(r.step>=chapter(r,data).scenes.length){if(r.episode===9){r.completed=true;r.step=chapter(r,data).scenes.length-1;}else{r.episode++;r.step=0;}}}
function commit(s,data,choice,world){const r=active(s),scene=current(r,data);if(!scene||r.completed)throw Error('No active story scene');const id=String(choice||'');if(scene.optional&&id==='skip'){r.choices[scene.id]='skipped';event(r,scene);advance(r,data);return 'skipped';}if(scene.type==='campaign'){
 const c=world?.campaigns?.[scene.campaign],def=world?.definitions?.[scene.campaign];if(!c)throw Error('Existing 4.0 world is not ready');if(scene.require==='opening'){if(c.status==='not-started'||(c.status==='active'&&c.decisions.length<1))throw Error('Complete the first authentic 4.0 campaign decision');}else{bind(r,scene.campaign,c,def);}r.choices[scene.id]='campaign';
}else if(scene.type==='operator'){
 if(id==='skip'&&!r.review.authority||id==='skip'&&!r.review.qualified){r.review.position=6;r.choices[scene.id]='unqualified-review';event(r,scene);advance(r,data);return 6;}
 const op=OPERATORS[r.review.position];if(!op)throw Error('All operators have responded');if(!['yes','pending','no'].includes(id))throw Error('Select an operator response');if(id==='yes'&&(!r.review.qualified||!r.review.authority))throw Error('Final assent requires a qualified, authorized proposal');r.review.assents[op]=id;r.review.position++;if(r.review.position===6){r.choices[scene.id]='operators-recorded';event(r,scene);advance(r,data);}return r.review.position;
}else if(scene.type==='final'){
 if(id!=='submit'&&id!=='defer')throw Error('Choose to submit or defer');r.outcome=id==='defer'?'DEFERRED':ratify(r);r.choices[scene.id]=id;if(ARCHITECTURES.includes(r.outcome))r.effectQueue.push({id:r.id+':final:'+r.outcome,headline:'FINAL OBJECTIVE REVIEW: '+TITLES[r.outcome].toUpperCase()+' APPROVED FOR CONSENTING SERVICES',projected:false});
}else{
 const options=scene.options||[];if(options.length&&!options.some(x=>x.id===id))throw Error('Unknown narrative option');if(!options.length&&id!=='continue')throw Error('Expected continue');r.choices[scene.id]=id;
 if(scene.id==='08-test'&&id!=='decline'&&!r.testConsent)throw Error('A separate voluntary test authorization is required');
 if(scene.id==='08-consent')r.consent=id;
 if(scene.id==='09-select')r.review.proposal=id==='defer'?null:id;
 if(scene.id==='09-authority')r.review.authority=id==='verify'&&['CHR-01','CHR-01A','CHR-01B','AUTH-OPS'].every(k=>r.artifacts[k]?.status==='corroborated');
 if(scene.id==='09-qualify')r.review.qualified=id==='qualified'&&r.review.authority&&r.review.proposal!==null&&['DOE-01','DOE-02','FB-01','HUM-REVIEW'].every(k=>!!r.artifacts[k]);
 if(scene.id==='09-plan'&&id==='reset')r.review.proposal='reset';
 if(scene.id==='07-policy')r.artifacts['PILOT-07']={status:id==='reviewed'?'corroborated':'obtained',source:'fictional-local-review',privacy:'public'};
}
 grant(r,scene.grants);event(r,scene);advance(r,data);return r.choices[scene.id];}
function ratify(r){const rev=r.review;if(!rev.authority)return 'AUTHORITY_HOLD';if(!rev.qualified)return 'QUALIFICATION_HOLD';const yes=OPERATORS.filter(o=>rev.assents[o]==='yes').length;if(rev.proposal==='reset')return yes===6?'reset':'NOT_RATIFIED_UNANIMITY';if(ARCHITECTURES.includes(rev.proposal))return yes>=4?rev.proposal:'NOT_RATIFIED';return 'DEFERRED';}
function status(r){return {episode:r.episode,step:r.step,outcome:r.outcome,completed:r.completed,consent:r.consent,artifacts:Object.keys(r.artifacts).length,bindings:Object.keys(r.bindings).length};}
return {CAMPAIGNS,OPERATORS,ARCHITECTURES,TITLES,FALLBACK,fresh,normalize,active,newRun,selectRun,current,verifyCampaign,bind,commit,ratify,status,grant};
});