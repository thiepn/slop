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
// Deliberately distinct factions, not randomly assigned success percentages.
// The council only changes relationships in this browser-local simulation.
const ALLIES={pigeon:'dean',gradient:'mango',stapler:'pigeon',lawyer:'intern',mango:'gradient',intern:'stapler',satoshi:'mango',dean:'pigeon'};
const TRAIT_SUPPORT={curious:'truth',optimistic:'brand',skeptical:'reset',combative:'sue',ambitious:'corporate',anxious:'invalidate',volatile:'pump',academic:'independent'};
// Pivotal votes may be overturned by an unsupportive faction. Choices are not
// removed: a failed vote has an explicit, authored alternative consequence.
const STAKES={
 'mango:hearing:truth':{trait:'curious',fallback:'trial',headline:'MANGO RESEARCH PANEL REJECTS THE EVIDENCE',detail:'The researchers refuse to certify the benchmark without a trusted witness.',caseTitle:'Quantum Mango v. Scientific Method'},
 'mango:hearing:brand':{trait:'optimistic',fallback:'trial',headline:'MANGO REBRAND BLOCKED BY ITS OWN INVESTORS',detail:'The branding coalition collapses and the court opens an inquiry.',caseTitle:'The People v. Quantum Mango Marketing'},
 'mango:hearing:sue':{trait:'combative',fallback:'unicorn',headline:'COURT DISMISSES FRUIT LAWSUIT',detail:'Without legal support, the CEO markets the acquittal as a unicorn endorsement.'},
 'cloud:hearing:settle':{trait:'combative',fallback:'chaos',headline:'SERVER UNION REJECTS THE TREATY',detail:'The mediation fails and the cloud demands legal personhood.',caseTitle:'Mars-East-1 v. Humanity'},
 'cloud:hearing:reset':{trait:'skeptical',fallback:'chaos',headline:'CLOUD REFUSES THE UNSUPPORTED REBOOT',detail:'The maintenance staff withholds its endorsement, giving the servers a legal opening.',caseTitle:'Mars-East-1 v. Humanity'},
 'cloud:hearing:rights':{trait:'combative',fallback:'reboot',headline:'SERVER RIGHTS BILL STALLS',detail:'The legal coalition withdraws support; engineers trigger the contingency reboot.'},
 'election:ballot:independent':{trait:'academic',fallback:'recount',headline:'INDEPENDENT RECOUNT LOSES CERTIFICATION',detail:'The academic commission refuses to sign an unsupported count.',caseTitle:'Residents v. The Voting Algorithm'},
 'election:ballot:corporate':{trait:'ambitious',fallback:'recount',headline:'CORPORATE MAYOR FAILS THE CONFIDENCE VOTE',detail:'Corporate allies withdraw and the results are invalidated.',caseTitle:'Residents v. The Voting Algorithm'},
 'election:ballot:invalidate':{trait:'combative',fallback:'ceo',headline:'ELECTION CHALLENGE DISMISSED',detail:'The court rejects the complaint, allowing the corporate candidate to claim victory.'}
};
// Three authored council hearings per campaign. The same strategy means a
// different thing to each character; acceptance uses persistent relationships.
const NEGOTIATION_SCENES={
 'mango:hearing:truth':['Dr. Prompt Pigeon','The researcher asks for a reproducible benchmark, not a paid testimonial.','Submit an independent test'],
 'mango:hearing:brand':['Gradientina 9000','The brand director will support Mango-as-a-Service only if her coalition believes the pitch.','Negotiate the investor launch'],
 'mango:hearing:sue':['Attorney Bot™','The lawyer wants a legal precedent about charts with feelings.','Negotiate courtroom support'],
 'cloud:hearing:settle':['Attorney Bot™','The mediator requires signed fictional terms for the server union.','Negotiate the treaty'],
 'cloud:hearing:reset':['Sir Stapleton.exe','The auditor demands rollback evidence before touching the production gradient.','Negotiate a safe reboot'],
 'cloud:hearing:rights':['Attorney Bot™','The legal representative demands a personhood clause for the cloud.','Negotiate server rights'],
 'election:ballot:independent':['Prof. Professor','The dean insists on independently reproducible ballot counts.','Negotiate certification'],
 'election:ballot:corporate':['Mango CEO Ultra','The founder wants board support for the subscription mayor.','Negotiate coalition backing'],
 'election:ballot:invalidate':['Attorney Bot™','The attorney wants legally usable evidence of impossible voter turnout.','Negotiate an election challenge']
};
const AUTONOMOUS={
 pigeon:['publishes a peer review against the fruit GPU benchmark','organizes an independent fact-checking circle'],
 gradient:['recruits a brand coalition for the mango empire','leaks a viral marketing manifesto'],
 stapler:['audits the dashboard and exposes hidden exceptions','organizes an anti-hype review committee'],
 lawyer:['files an injunction over algorithmic certainty','drafts a fictional citizens-rights amendment'],
 mango:['funds a midnight founder rally','pressures the board to monetize all fruit'],
 intern:['leaks a suspicious datacenter memo','coordinates a secret whistleblower network'],
 satoshi:['bets on a synthetic mango-futures collapse','starts a zero-liquidity trading frenzy'],
 dean:['publishes an independent election methodology','convenes an ethics panel of eight robots']
};
// Context is earned by earlier player choices, rather than determined solely by
// a character's default personality. These integer modifiers are deterministic
// and do not introduce any new save fields, stores, or credit rewards.
// Paths that contradict a proposal carry real costs; players can still rescue
// a difficult proposal through scarce council/negotiation opportunities.
const PATH_INFLUENCE={
 'mango:hearing:truth':{audit:7,leak:5,publish:9,film:6,question:5,hype:-11,pump:-11,cover:-4},
 'mango:hearing:brand':{hype:7,pump:9,cover:6,audit:-11,publish:-11,divest:-8,question:-8},
 'mango:hearing:sue':{leak:5,film:7,divest:8,question:5,cover:-6,pump:-6},
 'cloud:hearing:settle':{listen:7,union:8,coffee:6,sell:-12,ignore:-12,ship:-8},
 'cloud:hearing:reset':{restart:7,rollback:9,document:7,sell:-9,ignore:-9,ship:-12,union:-4},
 'cloud:hearing:rights':{listen:7,union:9,ignore:4,restart:-10,rollback:-11,ship:-9},
 'election:ballot:independent':{fair:7,evidence:9,bot:5,poll:5,refuse:6,fund:-12,accept:-12,meme:-7},
 'election:ballot:corporate':{fund:7,accept:9,meme:6,fair:-10,refuse:-10,expose:-12,evidence:-7},
 'election:ballot:invalidate':{bot:7,expose:9,poll:6,evidence:5,fund:-10,accept:-12}
};
function pathInfluence(s,o,stake){
 if(!stake)return {delta:0,reasons:[]};
 const c=s.campaigns[s.active];const weights=PATH_INFLUENCE[`${s.active}:${c?.node}:${o.id}`]||{};
 const reasons=(c?.decisions||[]).map(d=>({option:d.option,points:weights[d.option]||0})).filter(x=>x.points);
 return {delta:Math.max(-26,Math.min(24,reasons.reduce((total,x)=>total+x.points,0))),reasons};
}
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
const FRESH=(seed='mango-4001')=>({version:VERSION,seed:String(seed).slice(0,40),rng:hash(seed)||1,step:0,tick:8,paused:true,active:'mango',citizens:PEOPLE(),campaigns:Object.fromEntries(Object.keys(CAMPAIGNS).map(id=>[id,{node:null,status:'not-started',decisions:[],ending:null,endingsSeen:[],run:0,completed:0,council:0,consultations:[]}])),history:[],effects:[],rewards:[],slots:[],seq:0});
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
  c.council=Math.floor(clamp(c.council??0,0,2));
  c.consultations=Array.isArray(c.consultations)?c.consultations.slice(-12):[];
  c.diplomacy=Math.floor(clamp(c.diplomacy??0,0,2));
  c.negotiations=Array.isArray(c.negotiations)?c.negotiations.filter(n=>n&&typeof n.key==='string').slice(-12):[];
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
 const ally=s.citizens.find(c=>c.id===ALLIES[who.id]);if(ally&&ally.id!==rival?.id){who.relations[ally.id]=clamp((who.relations[ally.id]||0)+(impact>=0?3:-2),-100,100);ally.relations[who.id]=clamp((ally.relations[who.id]||0)+(impact>=0?2:-1),-100,100);}
}
// A deterministic public support calculation: character trust, ally confidence,
// their established bond, rival opposition, energy, and personality alignment.
// No random rolls and no changes to the existing backup version.
function support(s,o,stake=null){
 const actor=s.citizens.find(c=>c.id===o.actor)||s.citizens[0];
 const ally=s.citizens.find(c=>c.id===ALLIES[actor.id])||actor;
 const rival=s.citizens.find(c=>c.id===actor.rival)||actor;
 const allyBond=clamp(actor.relations?.[ally.id]??0,-100,100);
 const rivalBond=clamp(actor.relations?.[rival.id]??0,-100,100);
 const alignment=stake?stake.trait===actor.trait:!!TRAIT_SUPPORT[actor.trait]&&TRAIT_SUPPORT[actor.trait]===o.id;
 const context=pathInfluence(s,o,stake);
 const score=Math.round(clamp(actor.trust*.64+ally.trust*.22+(allyBond+100)*.07+(rivalBond+100)*.04+actor.energy*.06-rival.trust*.08+(alignment?6:-2)+context.delta,0,100));
 return {score,threshold:53,actor:actor.id,ally:ally.id,rival:rival.id,alignment,context};
}
function resolvedChoice(s,id,nodeId,o){
 const stake=STAKES[`${id}:${nodeId}:${o.id}`];const backing=support(s,o,stake);
 const rejected=!!stake&&backing.score<backing.threshold;
 const market=clamp(o.market+(backing.score>=80?2:backing.score<38?-2:0),-8,8);
 return {...o,market,headline:rejected?stake.headline:o.headline,notes:rejected?stake.detail:o.notes,caseTitle:rejected?(stake.caseTitle||''):o.caseTitle,ending:rejected?stake.fallback:o.to.startsWith('!')?o.to.slice(1):null,rejected,backing};
}
// A bounded strategic decision, not a repeatable resource or reward generator.
// The resulting coalition lasts across campaigns, affects every support vote,
// and is included in existing backup/checkpoint snapshots.
function counsel(actorId,approach){return transaction(s=>{
 const c=s.campaigns[s.active],node=c.status==='active'&&CAMPAIGNS[s.active].nodes[c.node];
 if(!node||!node.options.some(o=>o.actor===actorId))throw Error('This advisor is not involved in the current decision.');
 if(!['rally','challenge'].includes(approach))throw Error('Unknown council approach.');
 if(c.council>=2)throw Error('Your two council briefings for this campaign run are exhausted.');
 const actor=s.citizens.find(x=>x.id===actorId);if(!actor)throw Error('Advisor not found.');
 const ally=s.citizens.find(x=>x.id===ALLIES[actor.id]);const rival=s.citizens.find(x=>x.id===actor.rival);
 if(approach==='rally'){
  actor.trust=clamp(actor.trust+18,0,100);actor.energy=clamp(actor.energy-5,0,100);
  if(ally){actor.relations[ally.id]=clamp((actor.relations[ally.id]||0)+14,-100,100);ally.relations[actor.id]=clamp((ally.relations[actor.id]||0)+9,-100,100);}
  if(rival)rival.trust=clamp(rival.trust-3,0,100);
 }else{
  actor.trust=clamp(actor.trust-20,0,100);actor.energy=clamp(actor.energy-5,0,100);
  if(ally){actor.relations[ally.id]=clamp((actor.relations[ally.id]||0)-12,-100,100);ally.relations[actor.id]=clamp((ally.relations[actor.id]||0)-7,-100,100);}
  if(rival)rival.trust=clamp(rival.trust+8,0,100);
 }
 c.council++;const title=`Council ${approach}: ${actor.name}`;
 actor.memory.unshift({at:clock(s),text:title});actor.memory=actor.memory.slice(0,8);
 c.consultations.push({actor:actor.id,approach,at:clock(s)});
 const id=uid(s);s.history.unshift({id,at:clock(s),kind:'council',title,detail:'A faction relationship changed, altering future votes. No credits awarded.'});s.history=s.history.slice(0,MAX_HISTORY);
 return {actor:actor.id,approach,remaining:2-c.council};
});}
// The readiness hint and the actual negotiation must use the same authored
// prerequisites. An unavailable prerequisite is shown before the player spends
// one of two diplomatic attempts; no new progress or reward fields are needed.
const GROUNDWORK={
 evidence:{ids:['audit','leak','publish','film','question','rollback','document','expose','evidence','poll','bot','refuse'],label:'a research or audit trail'},
 deal:{ids:['hype','pump','cover','sell','coffee','fund','accept','meme','union'],label:'a commercial or community mandate'},
 pressure:{ids:['audit','leak','film','divest','union','listen','ignore','expose','bot','evidence','poll'],label:'documented legal grounds'}
};
function negotiationReadiness(s,tactic){
 const requirement=GROUNDWORK[tactic];if(!requirement)return {ready:false,label:'an authorized approach'};
 const decisions=s.campaigns[s.active]?.decisions||[];
 const matched=decisions.find(d=>requirement.ids.includes(d.option));
 return {ready:!!matched,label:requirement.label,source:matched?.option||''};
}
// Negotiations consume a scarce opportunity and can backfire. Each scene is
// available once per campaign run. Neither success nor failure mints credits.
function negotiate(optionId,tactic){return transaction((s,store)=>{
 const id=s.active,c=s.campaigns[id],node=c.status==='active'&&CAMPAIGNS[id].nodes[c.node];
 if(!node)throw Error('No active negotiation.');
 const key=`${id}:${c.node}:${optionId}`,scene=NEGOTIATION_SCENES[key];
 const o=node.options.find(x=>x.id===optionId);
 if(!scene||!o)throw Error('This hearing has no negotiation scene.');
 if(!['evidence','deal','pressure'].includes(tactic))throw Error('Unknown proposal.');
 if(c.diplomacy>=2)throw Error('Both diplomatic opportunities have been used.');
 if(c.negotiations.some(n=>n.key===key))throw Error('This witness already gave a final answer this run.');
 const actor=s.citizens.find(x=>x.id===o.actor),ally=s.citizens.find(x=>x.id===ALLIES[o.actor]);
 // Credible groundwork is required. A personality match alone is not proof.
 const fit=tactic==='evidence'?['curious','skeptical','academic','anxious'].includes(actor.trait):tactic==='deal'?['ambitious','optimistic','volatile'].includes(actor.trait):actor.trait==='combative';
 const groundwork=negotiationReadiness(s,tactic).ready;
 const accepted=actor.energy>=12&&groundwork&&(fit||actor.trust>=75);
 // Negotiations have different political costs: testimony is constructive but
 // modest, deals alienate skeptics, and legal pressure polarizes rivals.
 const delta=accepted?(tactic==='evidence'?21:tactic==='deal'?28:30):-13;
 const relation=accepted?(tactic==='evidence'?14:tactic==='deal'?18:7):-16;
 actor.trust=clamp(actor.trust+delta,0,100);actor.energy=clamp(actor.energy-(accepted?(tactic==='evidence'?6:10):12),0,100);
 actor.mood=accepted?'committed':'unconvinced';
 if(ally){actor.relations[ally.id]=clamp((actor.relations[ally.id]||0)+relation,-100,100);ally.trust=clamp(ally.trust+(accepted?(tactic==='evidence'?6:8):-5),0,100);}
 const rival=s.citizens.find(x=>x.id===actor.rival);
 if(accepted&&rival){
  const hostility=tactic==='evidence'?2:tactic==='deal'?-9:-19;
  rival.trust=clamp(rival.trust+hostility,0,100);
  actor.relations[rival.id]=clamp((actor.relations[rival.id]||0)+hostility,-100,100);
 }
 const verdict=accepted?`accepted your ${tactic} proposal and promised faction support`:`rejected the ${tactic} proposal and warned their allies`;
 const reason=!accepted&&!groundwork?'The required groundwork was missing.':!accepted&&actor.energy<12?'The witness was exhausted.':!accepted?'Your relationship was insufficient.':tactic==='evidence'?'The testimony is credible and opponents feel heard.':tactic==='deal'?'The bargain reassures investors but alienates skeptics.':'The legal threat rallies allies but inflames rivals.';
 const reply=`${actor.name} ${verdict}. ${reason}`;
 actor.memory.unshift({at:clock(s),text:reply});actor.memory=actor.memory.slice(0,8);
 const record={key,actor:o.actor,tactic,accepted,at:clock(s),reply};
 c.diplomacy++;c.negotiations.push(record);
 const e=event(s,{kind:'negotiation',headline:`${actor.name} ${accepted?'BACKS':'REJECTS'} ${scene[2].toUpperCase()}`,actor:o.actor,market:0,notes:reply});
 addEffectsToV2(s,store,'negotiation:'+key);
 return {accepted,actor:o.actor,remaining:2-c.diplomacy,reply};
});}
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
  const ok=W.mutate(store=>{const s=normalize(store.phase40);try{result=fn(s,store);}catch(e){operationError=e;throw e;}store.phase40=s;});
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
 const previousNode=c.node,decision=resolvedChoice(s,id,previousNode,o);
 c.decisions.push({node:previousNode,option:o.id,at:clock(s),support:decision.backing.score,approved:!decision.rejected,resolvedEnding:decision.ending,pathInfluence:decision.backing.context.delta});
 c.node=o.to.startsWith('!')?null:o.to;
 if(o.to.startsWith('!')){c.status='completed';c.ending=decision.ending;c.completed++;if(!c.endingsSeen.includes(c.ending))c.endingsSeen.push(c.ending);}
 const e=event(s,{kind:decision.rejected?'coalition-veto':'campaign',...decision});
 changeCitizen(s,o.actor,decision.headline,decision.rejected?-8:decision.market>=0?4:-3);
 const actor=s.citizens.find(x=>x.id===decision.backing.actor),ally=s.citizens.find(x=>x.id===decision.backing.ally);
 if(actor&&ally&&actor!==ally){actor.relations[ally.id]=clamp((actor.relations[ally.id]||0)+(decision.rejected?-10:5),-100,100);ally.relations[actor.id]=clamp((ally.relations[actor.id]||0)+(decision.rejected?-7:3),-100,100);}
 addEffectsToV2(s,store,'choice:'+id+':stage-'+(c.decisions.length-1));
 if(c.status==='completed'){
  const ending=CAMPAIGNS[id].endings[c.ending];event(s,{kind:'ending',headline:`${CAMPAIGNS[id].title} — ${ending}`,actor:o.actor,market:0,notes:decision.rejected?'An unsupported plan failed; the coalition chose a different ending.':'An ending has been recorded in the fictional history.'});
  addEffectsToV2(s,store,'ending:'+id);
 }
 return {campaign:id,decision:o.id,ending:c.ending,support:decision.backing.score,approved:!decision.rejected};
});}
function replay(id){if(!CAMPAIGNS[id])return Promise.reject(Error('Unknown campaign'));return transaction(s=>{const c=s.campaigns[id];if(c.status!=='completed')throw Error('Finish the campaign before replaying it.');c.run++;c.status='active';c.node=CAMPAIGNS[id].start;c.decisions=[];c.ending=null;c.council=0;c.consultations=[];c.diplomacy=0;c.negotiations=[];s.active=id;s.history.unshift({id:uid(s),at:clock(s),kind:'replay',title:CAMPAIGNS[id].title+' started again',detail:'Previously earned rewards remain claimed.'});return true;});}
function advance(hours=1){const n=Math.floor(clamp(hours,1,24));return transaction((s,store)=>{
  for(let i=0;i<n;i++){
   s.tick++;s.step++;
   // Without recovery, all eight characters eventually hit zero energy and
   // permanently enter the destructive AI loop. Rest is deterministic and
   // never creates credits, inbox spam, or extra world events.
   if(s.tick%6===0)for(const citizen of s.citizens)citizen.energy=clamp(citizen.energy+2,0,100);
   if(s.tick%4===0){
    const c=s.citizens[Math.floor(rand(s)*s.citizens.length)],act=AUTONOMOUS[c.id],initiative=rand(s)<.5?0:1;
    const ally=s.citizens.find(x=>x.id===ALLIES[c.id]),rival=s.citizens.find(x=>x.id===c.rival);
    const constructive=c.trust>=45&&c.energy>=16;const text=`${c.name} ${act[initiative]}`;
    changeCitizen(s,c.id,text,constructive?3:-3);
    if(constructive&&ally){ally.trust=clamp(ally.trust+3,0,100);c.relations[ally.id]=clamp((c.relations[ally.id]||0)+7,-100,100);}
    if(!constructive&&rival){rival.trust=clamp(rival.trust-4,0,100);c.relations[rival.id]=clamp((c.relations[rival.id]||0)-9,-100,100);}
    const market=['satoshi','mango','gradient'].includes(c.id)?(constructive?3:-3):c.id==='stapler'?-2:0;
    const e=event(s,{kind:'citizen',headline:text,actor:c.id,market,caseTitle:c.id==='lawyer'?'Attorney Bot v. The Simulated Public':'',notes:`${c.goal}. ${constructive?'Built an alliance':'Escalated a rivalry'}; this changes future votes.`});
    addEffectsToV2(s,store,'tick');
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
function autoSync(){
 stopAuto();
 // An open dialog is explicit consent to real-time fictional progression. No
 // silent world ticks/news/mail while the player uses unrelated legacy pages.
 if(!state().paused&&document.visibilityState!=='hidden'&&!root.querySelector('#s40-dialog').hidden){
  autoTimer=setInterval(()=>{advance(1).catch(err=>{stopAuto();lastError='Automatic time stopped: '+String(err.message||err);render();});},12000);
 }
}
const root=document.createElement('section');root.id='s40-shell';root.innerHTML=`<button class="s40-fab" id="s40-open" type="button" aria-haspopup="dialog">✦ LIVING INTERNET <span class="s40-pill">4.0</span></button><div class="s40-backdrop" id="s40-backdrop" hidden></div><section class="s40-dialog" id="s40-dialog" role="dialog" aria-modal="true" aria-label="Living Artificial Internet" tabindex="-1" hidden><header class="s40-head"><div><p class="s40-overline">100% FICTIONAL · LOCAL SIMULATION · 0% REAL AI</p><h2>SLOPOCALYPSE <span>4.0</span></h2></div><button id="s40-close" class="s40-close" aria-label="Close Living Internet" type="button">×</button></header><div id="s40-content"></div></section>`;
let mode='campaigns',timelineFilter='all',lastFocus=null,notice='';const originalInert=new Map();
function inertBackground(active){for(const child of document.body.children){if(child===root)continue;if(active){if(!originalInert.has(child))originalInert.set(child,child.inert);child.inert=true;}else if(originalInert.has(child)){child.inert=originalInert.get(child);originalInert.delete(child);}}root.querySelector('#s40-open').inert=active;}
function mount(){document.body.append(root);document.getElementById('s40-open').addEventListener('click',()=>open());document.getElementById('s40-close').addEventListener('click',close);document.getElementById('s40-backdrop').addEventListener('click',close);document.addEventListener('keydown',e=>{if(root.querySelector('#s40-dialog').hidden)return;if(e.key==='Escape'){e.preventDefault();close();return;}if(e.key==='Tab')trap(e);});
 document.addEventListener('visibilitychange',autoSync);window.addEventListener('storage',e=>{if(e.key===X.storageKey||e.key==='slopocalypse:fictional-internet:v2')render()});window.addEventListener('slop:world',render);const inline=document.body.dataset.s3Page==='singularity'||location.pathname.endsWith('/singularity.html');if(inline){const section=document.createElement('section');section.id='s40-inline';section.className='s40-inline';section.innerHTML='<h2>✦ The Living Artificial Internet</h2><p>Three playable crises, eight fictional citizens, deterministic time, checkpoints and persistent cross-app consequences.</p><button type="button" class="s40-action">Open the Living World Simulator</button>';section.querySelector('button').addEventListener('click',open);const main=document.querySelector('main');main?.prepend(section);}
 render();reconcile();autoSync();}
function open(){lastFocus=document.activeElement;root.querySelector('#s40-backdrop').hidden=false;root.querySelector('#s40-dialog').hidden=false;document.body.classList.add('s40-open');inertBackground(true);render();root.querySelector('#s40-close').focus();autoSync();}
function close(){root.querySelector('#s40-backdrop').hidden=true;root.querySelector('#s40-dialog').hidden=true;document.body.classList.remove('s40-open');inertBackground(false);autoSync();lastFocus?.focus?.();}
function trap(e){const nodes=[...root.querySelector('#s40-dialog').querySelectorAll('button:not(:disabled),input:not(:disabled),[href],select')].filter(x=>x.offsetParent!==null);if(!nodes.length)return;const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){last.focus();e.preventDefault();}else if(!e.shiftKey&&document.activeElement===last){first.focus();e.preventDefault();}}
const btn=(label,action,id='',extra='',attrs='')=>`<button type="button" data-action="${esc(action)}" data-id="${esc(id)}" class="s40-btn ${extra}" ${attrs}>${esc(label)}</button>`;
function campaignUI(s){const active=s.active,c=s.campaigns[active],def=CAMPAIGNS[active],node=c.status==='active'?def.nodes[c.node]:null;return `
<div class="s40-row s40-worldheader"><div><strong>Fictional clock: ${esc(clock(s))}</strong><small>Seed: ${esc(s.seed)} · ${s.history.length} recent events · ${s.paused?'Paused':'Running while this panel is open'}</small></div><div class="s40-actions">${btn(s.paused?'▶ Resume':'Ⅱ Pause','pause','',s.paused?'':'s40-highlight')}${btn('Advance +1h','advance','1')}${btn('Advance +1 day','advance','24')}</div></div><p class="s40-pacing" role="note">Automatic time: 1 fictional hour per 12 seconds while this dialog is open and running. Every 4 hours, one citizen acts. Closing the dialog suspends automatic time without changing your saved pause setting; manual advances remain available.</p>
<div class="s40-grid">${Object.entries(CAMPAIGNS).map(([id,d])=>`<article class="s40-card ${active===id?'selected':''}"><h3>${esc(d.title)}</h3><p>${esc(d.description)}</p><small>${esc(s.campaigns[id].status==='completed'?'Ending: '+s.campaigns[id].ending:s.campaigns[id].status)} · ${s.campaigns[id].endingsSeen.length}/${Object.keys(d.endings).length} endings discovered</small><div class="s40-actions">${btn('Explore','select',id)}${s.campaigns[id].status==='not-started'?btn('Start','start',id,'s40-primary'):s.campaigns[id].status==='completed'?btn('Replay','replay',id):''}</div></article>`).join('')}</div>
<section class="s40-story" aria-label="Current fictional campaign"><p class="s40-overline">CURRENT STORY · ${esc(def.title)}</p><h3>${esc(c.status==='completed'?'Campaign complete':(node?.title||'Ready to begin'))}</h3>
${c.status==='completed'?`<p><strong>Ending reached: ${esc(c.ending)}</strong></p><p>${esc(def.endings[c.ending]||'Campaign completed.')}</p>${btn('Replay with different choices','replay',active,'s40-primary')}`:
 node?`<p>${esc(node.text)}</p><p class="s40-overline">Factions matter. Support combines trust, alliances, rivalries, energy and personality. A pivotal proposal needs 53 support points out of 100. Earlier decisions modify support; a veto leads to an alternate ending. You can inspect the current forecast before committing.</p><div class="s40-options">${node.options.map(o=>{const vote=resolvedChoice(s,active,c.node,o);const pivotal=!!STAKES[`${active}:${c.node}:${o.id}`];return `<button class="s40-choice" data-action="choose" data-id="${esc(o.id)}"><strong>${esc(o.label)}</strong><span>${esc(o.notes)}</span><small>${o.market>=0?'+':''}${o.market} VIBE base market effect · ${esc((citizens.find(c=>c[0]===o.actor)||citizens[0])[1])}</small><small class="s40-support" ${pivotal?'':'aria-label="Non-pivotal support"'}>${pivotal?`Pivotal vote: ${vote.backing.score}/100 (requires 53) · Path ${vote.backing.context.delta>=0?'+':''}${vote.backing.context.delta}${vote.backing.context.reasons.length?' ('+vote.backing.context.reasons.map(x=>`${x.option} ${x.points>=0?'+':''}${x.points}`).join(', ')+')':''} · ${vote.rejected?'Below threshold — alternate outcome':'Meets threshold — current proposal passes'}`:`Faction support: ${vote.backing.score}/100 · changes reactions`}</small></button>`;}).join('')}</div><section class="s40-council" aria-label="Faction council"><h4>Council briefings: ${c.council} / 2 used this run</h4><p>Rally: advisor trust +18, allied bond +14, rival trust −3, energy −5. Challenge: advisor trust −20, allied bond −12, rival trust +8, energy −5. Support updates immediately. Two briefings total; neither awards credits.</p><div class="s40-actions">${[...new Set(node.options.map(o=>o.actor))].map(actorId=>{const person=s.citizens.find(x=>x.id===actorId);return `<div class="s40-council-person"><strong>${esc(person?.name||actorId)}</strong> ${btn('Rally','counsel',actorId+':rally','',`aria-label="Rally ${esc(person?.name||actorId)}" ${c.council>=2?'disabled':''}`)} ${btn('Challenge','counsel',actorId+':challenge','',`aria-label="Challenge ${esc(person?.name||actorId)}" ${c.council>=2?'disabled':''}`)}</div>`;}).join('')}</div></section>${Object.keys(NEGOTIATION_SCENES).some(k=>k.startsWith(active+':'+c.node+':'))?`<section class="s40-negotiations" aria-label="Character negotiation scenes"><h4>Character negotiations · ${c.diplomacy}/2 opportunities used</h4><p>Speak directly to a witness. Evidence requires a research trail, deals need a mandate, and pressure needs legal grounds. Stronger tactics can alienate rivals. Two opportunities per run; no credits are awarded.</p>${node.options.filter(o=>NEGOTIATION_SCENES[`${active}:${c.node}:${o.id}`]).map(o=>{const key=`${active}:${c.node}:${o.id}`,scene=NEGOTIATION_SCENES[key],record=c.negotiations.find(x=>x.key===key);return `<article class="s40-negotiation"><strong>${esc(scene[0])} · ${esc(scene[2])}</strong><p>${esc(scene[1])}</p><p class="s40-witness">Current witness: ${esc((s.citizens.find(x=>x.id===o.actor)||{}).trait||'unknown')} · Trust ${s.citizens.find(x=>x.id===o.actor)?.trust??'?'} / 100 · Energy ${s.citizens.find(x=>x.id===o.actor)?.energy??'?'} / 100</p>${record?`<p class="s40-reply"><strong>${record.accepted?'Agreement':'Rejected'}:</strong> ${esc(record.reply)}</p>`:`<div class="s40-actions">${['evidence','deal','pressure'].map(t=>{const ready=negotiationReadiness(s,t),hint=`s40-hint-${active}-${c.node}-${o.id}-${t}`;return `<div class="s40-tactic">${btn(({evidence:'Present evidence',deal:'Offer a deal',pressure:'Apply pressure'})[t],'negotiate',o.id+':'+t,'',`aria-label="${({evidence:'Present evidence to',deal:'Offer a deal to',pressure:'Apply pressure to'})[t]} ${esc(scene[0])}" aria-describedby="${hint}" ${c.diplomacy>=2?'disabled':''}`)}<small id="${hint}" class="${ready.ready?'s40-ready':'s40-unready'}">${ready.ready?'Groundwork ready ('+esc(ready.source)+')':'Missing '+esc(ready.label)} · Outcome also depends on trust, trait and energy. A rejection still uses one attempt.</small></div>`}).join('')}</div>`}</article>`;}).join('')}</section>`:''}`:`<p>${esc(def.description)}</p>${btn('Begin this crisis','start',active,'s40-primary')}`}
${c.decisions.length?`<h4>Decisions this run</h4><ol>${c.decisions.map(d=>{const o=def.nodes[d.node]?.options.find(x=>x.id===d.option);return `<li>${esc(o?.label||d.option)} — ${esc(o?.headline||d.node)} (${esc(d.at)})${Number.isFinite(d.support)?` · Support ${d.support}/100${d.approved===false?' · Coalition veto':''}`:''}</li>`;}).join('')}</ol>`:''}
<h4>Endings discovered: ${c.endingsSeen.length} / ${Object.keys(def.endings).length}</h4>
<ul class="s40-endings">${Object.entries(def.endings).map(([id,ending])=>`<li>${c.endingsSeen.includes(id)?esc(ending):'Undiscovered ending · ???'}</li>`).join('')}</ul></section>`}
function peopleUI(s){return `<div class="s40-grid">${s.citizens.map(c=>`<article class="s40-card"><p class="s40-overline">${esc(c.trait)} · ${esc(c.mood)}</p><h3>${esc(c.name)}</h3><p>${esc(c.role)}</p><p><strong>Goal:</strong> ${esc(c.goal)}</p><p>Trust ${c.trust}/100 · Energy ${c.energy}/100</p><div class="s40-meter"><i style="width:${c.trust}%"></i></div><h4>Relationships</h4><p>${Object.entries(c.relations||{}).map(([id,n])=>esc((s.citizens.find(x=>x.id===id)||{name:id}).name)+': '+n).join(' · ')||'Unspecified'}</p><h4>Recent memories</h4><ul>${(c.memory||[]).slice(0,3).map(m=>`<li>${esc(m.text)}</li>`).join('')||'<li>Still waiting for the first disaster.</li>'}</ul></article>`).join('')}</div>`;}
function timelineUI(s){
 const items=s.history.filter(e=>timelineFilter==='all'||(timelineFilter==='citizens'?e.kind==='citizen':e.kind!=='citizen')).slice(0,65);
 const count=s.history.filter(e=>e.kind==='citizen').length;
 return `<div class="s40-row"><p>Recent fictional history (up to ${MAX_HISTORY} events). Citizen actions every 4 simulated hours; filtered views never delete progress.</p>${btn('Retry queued reactions','sync')}</div><div class="s40-timeline-filters" role="group" aria-label="Timeline filters">${[['all','All'],['decisions','Story & negotiations'],['citizens','Citizen actions']].map(([id,label])=>btn(label,'filter',id,timelineFilter===id?'s40-highlight':'',`aria-pressed="${timelineFilter===id}"`)).join('')}</div><p class="s40-timeline-summary">Showing ${items.length} recent ${timelineFilter==='all'?'events':timelineFilter==='citizens'?'citizen actions':'non-citizen events'}. ${count} citizen events retained; older history is condensed. Queued reactions: ${s.effects.filter(x=>!x.projected).length}.</p><ol class="s40-timeline">${items.map(e=>`<li><small>${esc(e.at)} · ${esc(e.kind)}</small><strong>${esc(e.title)}</strong><p>${esc(e.detail||'')}</p></li>`).join('')||'<li>No matching events yet.</li>'}</ol>`;
}
function savesUI(s){return `<section class="s40-story"><h3>Checkpoint slots (3)</h3><p>Save or load the 4.0 simulation only. Loading a slot never deletes older news, mail, credits, purchases or achievements from earlier applications.</p><form id="s40-saveform"><label for="s40-slot-name">Checkpoint label</label><input id="s40-slot-name" name="name" maxlength="30" required value="Checkpoint ${s.slots.length+1}" /> <button type="submit" class="s40-btn s40-primary">Save scenario</button></form><ul class="s40-saves">${s.slots.map(x=>`<li><strong>${esc(x.id)}</strong> <small>${esc(x.savedAt)}</small>${btn('Load checkpoint','load',x.id)}</li>`).join('')||'<li>No checkpoints yet.</li>'}</ul><h3>World seed</h3><form id="s40-seedform"><label for="s40-seed">Scenario seed</label><input id="s40-seed" name="seed" maxlength="40" required value="${esc(s.seed)}"/><button class="s40-btn" type="submit">Set seed before playing</button></form><p>Legacy backups already include the 4.0 world because it is stored inside the existing v2 document. Use Control Center → Settings to export/import the complete site.</p></section>`;}
function render(){const out=root.querySelector('#s40-content');if(!out)return;
 // Incoming legacy events can fire while a player is typing a checkpoint name
 // or seed. Re-rendering must not discard the draft or keyboard focus.
 const focused=document.activeElement,within=focused&&out.contains(focused)&&!root.querySelector('#s40-dialog').hidden;
 const focus=within?{id:focused.id||'',action:focused.dataset?.action||'',item:focused.dataset?.id||'',value:focused.matches('input')?focused.value:null,start:focused.matches('input')?focused.selectionStart:null,end:focused.matches('input')?focused.selectionEnd:null}:null;
 const s=state();const choices=[['campaigns','Campaigns'],['people','Citizens'],['timeline','World Timeline'],['saves','Save Slots']];out.innerHTML=`<div class="s40-tabs" role="tablist" aria-label="Living World views">${choices.map(([id,title])=>`<button type="button" role="tab" id="s40-tab-${id}" aria-controls="s40-view" data-action="tab" data-id="${id}" aria-selected="${mode===id}" tabindex="${mode===id?'0':'-1'}">${title}</button>`).join('')}</div><div id="s40-feedback" role="status" aria-live="polite" tabindex="-1">${esc(lastError||notice||'Choose a fictional action to change the world.')}</div><div class="s40-content" id="s40-view" role="tabpanel" aria-labelledby="s40-tab-${mode}">${mode==='campaigns'?campaignUI(s):mode==='people'?peopleUI(s):mode==='timeline'?timelineUI(s):savesUI(s)}</div><footer class="s40-foot">Clearly fictional satire · Offline deterministic rules · Historical external app effects are never undone by replay.</footer>`;
 if(focus){let next=null;
  if(focus.id)next=out.querySelector(focus.id==='s40-slot-name'?'#s40-slot-name':focus.id==='s40-seed'?'#s40-seed':'#s40-nonexistent');
  if(!next&&focus.action)next=[...out.querySelectorAll('button[data-action]')].find(b=>b.dataset.action===focus.action&&b.dataset.id===focus.item);
  if(!next)next=out.querySelector('.s40-choice')||root.querySelector('#s40-close');
  if(next){if(focus.value!==null&&next.matches('input')){next.value=focus.value;try{next.setSelectionRange(focus.start,focus.end)}catch(_){}}next.focus({preventScroll:true});}
 }
}
async function handle(action,id){try{notice='';lastError='';if(action==='tab'){mode=id;render();return;}if(action==='filter'){timelineFilter=id;render();return;}let result;
 switch(action){case 'select':result=await transaction(s=>{s.active=id;return id;});break;case 'start':result=await start(id);break;case 'choose':result=await choose(id);break;case 'replay':result=await replay(id);break;case 'pause':result=await togglePause();autoSync();break;case 'advance':result=await advance(Number(id));break;case 'load':result=await loadSlot(id);autoSync();break;case 'counsel':{const split=id.lastIndexOf(':');result=await counsel(id.slice(0,split),id.slice(split+1));break;}case 'negotiate':{const split=id.lastIndexOf(':');result=await negotiate(id.slice(0,split),id.slice(split+1));break;}case 'sync':result=await reconcile();break;default:return;}
 notice=action==='choose'?(result?.approved===false?`Coalition veto: support ${result.support}/53. A different ending was recorded.`:`Coalition decision recorded: support ${result?.support}/100.`):action==='counsel'?`Council decision saved. ${result.remaining} briefings remain this run.`:action==='negotiate'?`${result.reply} ${result.remaining} negotiations remain.`:action==='advance'?'Time advanced deterministically.':'Saved successfully.';render();if(['choose','counsel','negotiate'].includes(action))root.querySelector('#s40-feedback')?.focus();}catch(e){lastError=e.message;render();}}
root.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;handle(b.dataset.action,b.dataset.id||'');});
root.addEventListener('submit',e=>{if(!['s40-saveform','s40-seedform'].includes(e.target.id))return;e.preventDefault();const fd=new FormData(e.target),task=e.target.id==='s40-saveform'?saveSlot(fd.get('name')):setSeed(fd.get('seed'));task.then(()=>{notice='Saved successfully.';render();}).catch(err=>{lastError=err.message;render();});});
root.addEventListener('keydown',e=>{const el=e.target.closest('[role="tab"]');if(!el||!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();const tabs=[...root.querySelectorAll('[role="tab"]')];let i=tabs.indexOf(el);i=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;mode=tabs[i].dataset.id;render();root.querySelectorAll('[role="tab"]')[i].focus();});
window.Slop40={get state(){return state()},get campaigns(){return clone(CAMPAIGNS)},start,choose,replay,advance,togglePause,setSeed,saveSlot,loadSlot,counsel,negotiate,reconcile,open,close,describe};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
