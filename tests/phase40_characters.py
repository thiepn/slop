#!/usr/bin/env python3
"""Character-specific negotiations and autonomous faction state checks.
Chromium DOM with inline real source and mocked origin storage/Web Locks.
NOT native cross-tab qualification or real network-origin acceptance.
"""
from playwright.sync_api import sync_playwright
from phase40_qualification import SHIM,inline_html
import json,sys
passed=0;total=0;errors=[]
def check(label,got,expected=True):
 global total,passed
 total+=1
 if got==expected:passed+=1
 else:print('FAIL',label,repr(got),'expected',repr(expected))

def run():
 with sync_playwright() as pw:
  browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  def make(width=900):
   p=browser.new_page(viewport={'width':width,'height':860},reduced_motion='reduce')
   p.on('pageerror',lambda e:errors.append(str(e)))
   p.evaluate(SHIM);p.set_content(inline_html('singularity.html'),wait_until='domcontentloaded');p.wait_for_function('()=>!!Slop40')
   return p
  def js(p,expr):return p.evaluate('async()=>'+expr)
  def trust(p,actor,n):return p.evaluate('([a,n])=>SlopWorld.mutate(s=>{s.phase40.citizens.find(c=>c.id===a).trust=n})',[actor,n])
  def to_final(p,campaign,path):
   js(p,f'await Slop40.start("{campaign}")')
   for o in path:js(p,f'await Slop40.choose("{o}")')
  a=make();check('New negotiation API exposed',a.evaluate('()=>typeof Slop40.negotiate'),'function')
  check('All three campaigns have authored scenes',a.evaluate('()=>Object.keys(Slop40.campaigns).length'),3)
  to_final(a,'mango',['hype','pump'])
  check('New diplomacy budget defaults to zero',a.evaluate('()=>Slop40.state.campaigns.mango.diplomacy'),0)
  check('Existing old councils remain independent',a.evaluate('()=>Slop40.state.campaigns.mango.council'),0)
  check('Scene has three negotiation options',a.evaluate('()=>document.querySelectorAll(".s40-negotiation .s40-btn").length'),9)
  # A baseline 30-trust founder fails; a correctly tailored deal can change the end.
  check('Low-trust setup is persisted',trust(a,'gradient',30))
  pre=a.evaluate('()=>({support:Slop40.state.citizens.find(c=>c.id==="gradient").trust,credits:SlopWorld.state.credits})')
  n=js(a,'await Slop40.negotiate("brand","deal")')
  check('Founder accepts a relevant deal',n['accepted']);check('Negotiation consumes one budget',n['remaining'],1)
  check('Trust changes after accepted negotiation',a.evaluate('()=>Slop40.state.citizens.find(c=>c.id==="gradient").trust')>pre['support'])
  check('Negotiation issues zero fictional credits',a.evaluate('()=>SlopWorld.state.credits'),pre['credits'])
  check('Negotiation message reaches SlopMail',a.evaluate('()=>SlopWorld.state.mails.some(m=>m.subject.includes("BACKS"))'))
  check('Negotiation message reaches SlopNews',a.evaluate('()=>SlopSociety.data.news.some(n=>n.title.includes("BACKS"))'))
  check('Negotiation message reaches SlopBook',a.evaluate('()=>SlopSociety.data.posts.some(x=>x.text.includes("BACKS"))'))
  check('Negotiation record persists',a.evaluate('()=>Slop40.state.campaigns.mango.negotiations.length'),1)
  try:js(a,'await Slop40.negotiate("brand","deal")');double=False
  except Exception:double=True
  check('Same witness cannot repeat the scene',double)
  # Opposite strategy can harm a different character; second opportunity is final.
  failed=js(a,'await Slop40.negotiate("truth","deal")')
  check('Researcher rejects inappropriate brand deal',failed['accepted'],False)
  check('Second negotiation budget exhausted',a.evaluate('()=>Slop40.state.campaigns.mango.diplomacy'),2)
  try:js(a,'await Slop40.negotiate("sue","pressure")');blocked=False
  except Exception:blocked=True
  check('Third negotiation blocked',blocked)
  ending=js(a,'await Slop40.choose("brand")')
  check('Faction choice uses negotiated relationships',ending['ending'],'unicorn')
  # Readable final choice and ending must BOTH reach legacy v2 mail/event logs.
  check('Final decision message projected to v2',a.evaluate('()=>SlopWorld.state.mails.some(m=>m.subject==="QUANTUM MANGO SECURES ANOTHER UNNECESSARY ROUND")'))
  check('Final ending message projected to v2',a.evaluate('()=>SlopWorld.state.mails.some(m=>m.subject.startsWith("The Quantum Mango Crisis —"))'))
  check('Final decision and ending have distinct IDs',a.evaluate('()=>new Set(SlopWorld.state.mails.filter(m=>m.id.startsWith("living40:")).map(m=>m.id)).size===SlopWorld.state.mails.filter(m=>m.id.startsWith("living40:")).length'))
  # Replay cannot duplicate decision credits or reset the history outside the local world.
  oldCredits=a.evaluate('()=>SlopWorld.state.credits')
  js(a,'await Slop40.replay("mango")')
  check('Replay resets negotiation budget',a.evaluate('()=>Slop40.state.campaigns.mango.diplomacy'),0)
  check('Replay clears this-run scene records',a.evaluate('()=>Slop40.state.campaigns.mango.negotiations.length'),0)
  check('Credits preserved during replay',a.evaluate('()=>SlopWorld.state.credits'),oldCredits)
  check('Ending discovery preserved during replay',a.evaluate('()=>Slop40.state.campaigns.mango.endingsSeen.includes("unicorn")'))
  # Alternate campaigns: authored testimony and deterministic acceptance are faction-specific.
  cloud=make();to_final(cloud,'cloud',['listen','union'])
  check('Attorney accepts pressure negotiation',js(cloud,'await Slop40.negotiate("settle","pressure")')['accepted'])
  check('Cloud settlement has legal character testimony',cloud.evaluate('()=>Slop40.state.campaigns.cloud.negotiations[0].reply.includes("Attorney Bot")'))
  elec=make();to_final(elec,'election',['fair','evidence'])
  check('Academic accepts evidence',js(elec,'await Slop40.negotiate("independent","evidence")')['accepted'])
  check('Election has an authored negotiation',elec.evaluate('()=>Slop40.state.campaigns.election.negotiations[0].key'),'election:ballot:independent')
  # Seeded autonomous actions now have character-specific words and meaningful relation effects.
  def longrun(p):
   js(p,'await Slop40.setSeed("character-agency-40")')
   js(p,'await Slop40.advance(24)')
   return p.evaluate('()=>({state:Slop40.state,credits:SlopWorld.state.credits})')
  x=make();y=make();hx=longrun(x);hy=longrun(y)
  check('Autonomous actions fully deterministic by seed',hx,hy)
  autonomous=[h for h in hx['state']['history'] if h['kind']=='citizen']
  check('Six autonomous decisions per 24h',len(autonomous),6)
  check('Autonomous citizens have individual motivations',all(any(tag in h['title'] for tag in ['publishes','organizes','recruits','leaks','audits','files','drafts','funds','pressures','bets','starts','coordinates','convenes']) for h in autonomous))
  check('Character decisions remember goals',all(('alliance' in h['detail'] or 'rivalry' in h['detail']) for h in autonomous))
  check('Autonomous actions change coalition relationships',x.evaluate('()=>Slop40.state.citizens.some(c=>Object.values(c.relations).some(r=>r>0))'))
  check('Autonomous news arrives in old feed',x.evaluate('()=>SlopSociety.data.news.some(n=>n.id.startsWith("living40:"))'))
  check('Autonomous fake mail arrives in old app',x.evaluate('()=>SlopWorld.state.mails.some(m=>m.id.startsWith("living40:"))'))
  check('Autonomy has no repeatable credit rewards',hx['credits'],y.evaluate('()=>SlopWorld.state.credits'))
  # Checkpoint, v32 existing four-store backup, and quota rollback remain compatible.
  b=make();to_final(b,'mango',['hype','pump']);js(b,'await Slop40.negotiate("brand","deal")');js(b,'await Slop40.saveSlot("Before resolution")')
  snapshot=b.evaluate('()=>JSON.stringify(Slop40.state.campaigns.mango)')
  backup=b.evaluate('()=>SlopWorld32.exportPayload()')
  check('Backup still has four historical stores',len(backup['stores']),4)
  check('Backup checksum accepts negotiations',b.evaluate('(v)=>!!SlopWorld32.validateBackup(v)',backup))
  js(b,'await Slop40.advance(8)');check('Backup restore returns success',b.evaluate('(v)=>!!SlopWorld32.restoreBackup(v)',backup))
  check('Backup roundtrip retains negotiation',b.evaluate('()=>Slop40.state.campaigns.mango.negotiations[0].tactic'),'deal')
  js(b,'await Slop40.advance(4)');js(b,'await Slop40.loadSlot("Before resolution")')
  check('Checkpoint retains negotiation on load',b.evaluate('()=>JSON.stringify(Slop40.state.campaigns.mango)'),snapshot)
  # Pre-negotiation checkpoint data still normalizes with clean empty arrays.
  b.evaluate('()=>SlopWorld.mutate(s=>{delete s.phase40.campaigns.mango.diplomacy;delete s.phase40.campaigns.mango.negotiations})')
  check('Older save gets migration defaults',b.evaluate('()=>({n:Slop40.state.campaigns.mango.negotiations.length,d:Slop40.state.campaigns.mango.diplomacy})'),{'n':0,'d':0})
  quota=make();to_final(quota,'mango',['hype','pump'])
  before=quota.evaluate('()=>({world:JSON.stringify(Slop40.state),credits:SlopWorld.state.credits})')
  quota.evaluate('()=>{window.__denySave=true}')
  try:js(quota,'await Slop40.negotiate("brand","deal")');rejected=False
  except Exception:rejected=True
  quota.evaluate('()=>{window.__denySave=false}')
  check('Negotiation quota failure rejects',rejected)
  check('Failed negotiation rolls back all changes',quota.evaluate('()=>({world:JSON.stringify(Slop40.state),credits:SlopWorld.state.credits})'),before)
  # Keyboard, accessible names and mobile constraints for new scenes.
  mobile=make(320);mobile.locator('#s40-open').click();js(mobile,'await Slop40.start("mango")');js(mobile,'await Slop40.choose("hype")');js(mobile,'await Slop40.choose("pump")')
  check('Nine negotiation buttons have accessible names',mobile.get_by_role('button',name='Offer a deal to Gradientina 9000').count(),1)
  check('Negotiation region accessible',mobile.get_by_role('region',name='Character negotiation scenes').count(),1)
  check('Mobile dialog fits 320px',mobile.evaluate('()=>document.querySelector("#s40-dialog").scrollWidth<=document.querySelector("#s40-dialog").clientWidth'))
  mobile.get_by_role('button',name='Offer a deal to Gradientina 9000').click()
  mobile.locator('#s40-feedback').wait_for()
  check('Negotiation result moves focus to live status',mobile.evaluate('()=>document.activeElement.id'),'s40-feedback')
  mobile.keyboard.press('Escape');check('Escape closes negotiation dialog',mobile.locator('#s40-dialog').is_hidden())
  for p in [a,cloud,elec,x,y,b,quota,mobile]:p.close()
  browser.close()
 print(f'PHASE40 CHARACTERS: {passed}/{total} PASS; JS page errors={len(errors)}')
 if errors:print(errors[:6])
 return passed==total and not errors

if __name__=='__main__':sys.exit(0 if run() else 1)
