#!/usr/bin/env python3
"""Phase 4.0 consequential factions and council regression.
Chromium DOM with an in-memory storage/lock harness. Not native browser concurrency.
"""
from playwright.sync_api import sync_playwright
from phase40_qualification import SHIM, inline_html
import json, sys

checks=[];errors=[]
def check(label, got, expected=True):
 ok=got==expected;checks.append((label,ok));
 if not ok:print('FAIL:',label,'got=',repr(got),'expected=',repr(expected))

def run():
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  def make(width=900):
   page=browser.new_page(viewport={'width':width,'height':860},reduced_motion='reduce')
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.evaluate(SHIM);page.set_content(inline_html('singularity.html'),wait_until='domcontentloaded');page.wait_for_function('()=>!!Slop40');return page
  def js(p,code):return p.evaluate('async ()=>'+code)
  def settrust(p,name,n):return p.evaluate('(x)=>SlopWorld.mutate(s=>{s.phase40.citizens.find(c=>c.id===x[0]).trust=x[1]})',[name,n])
  def play(p,id,choices):
   js(p,f'await Slop40.start("{id}")')
   for choice in choices:out=js(p,f'await Slop40.choose("{choice}")')
   return out
  low=make();js(low,'await Slop40.start("mango")');check('Low-trust intervention saved',settrust(low,'gradient',5))
  js(low,'await Slop40.choose("hype")');js(low,'await Slop40.choose("pump")')
  low.open_dummy=0 if False else None
  out=js(low,'await Slop40.choose("brand")')
  check('Unsupported unicorn bid is vetoed',out['approved'],False)
  check('Unsupported unicorn changes to trial',out['ending'],'trial')
  check('Rejection gives readable story consequence',low.evaluate('()=>SlopWorld.state.mails.some(m=>m.subject==="MANGO REBRAND BLOCKED BY ITS OWN INVESTORS")'))
  check('Rejected coalition opens court case',low.evaluate('()=>SlopSociety.data.cases.some(c=>c.title.includes("Marketing"))'))
  check('Veto recorded in campaign history',low.evaluate('()=>Slop40.state.history.some(x=>x.kind==="coalition-veto")'))
  high=make();js(high,'await Slop40.start("mango")');check('High-trust intervention saved',settrust(high,'gradient',95))
  for a in ['hype','pump']:js(high,f'await Slop40.choose("{a}")')
  out=js(high,'await Slop40.choose("brand")')
  check('Supported brand vote passes',out['approved'])
  check('Supported brand ends unicorn',out['ending'],'unicorn')
  check('High and low trust produce different endings',high.evaluate('()=>Slop40.state.campaigns.mango.ending')!=low.evaluate('()=>Slop40.state.campaigns.mango.ending'))
  check('Different stakes generate different fictional headlines',high.evaluate('()=>SlopSociety.data.news.some(n=>n.title.includes("SECURES ANOTHER"))'))
  mid=make();js(mid,'await Slop40.start("mango")');check('Moderate-trust intervention saved',settrust(mid,'gradient',30));
  for a in ['hype','pump']:js(mid,f'await Slop40.choose("{a}")')
  before=mid.evaluate('()=>({credits:SlopWorld.state.credits,old:Slop40.state.citizens.find(x=>x.id==="gradient").trust})')
  js(mid,'await Slop40.counsel("gradient","rally")');js(mid,'await Slop40.counsel("gradient","rally")')
  after=mid.evaluate('()=>({credits:SlopWorld.state.credits,newTrust:Slop40.state.citizens.find(x=>x.id==="gradient").trust,council:Slop40.state.campaigns.mango.council})')
  check('Council uses two budgeted briefings',after['council'],2)
  check('Council boosts trust',after['newTrust']>before['old'])
  check('Council does not mint credits',after['credits'],before['credits'])
  try:js(mid,'await Slop40.counsel("gradient","rally")');limit=False
  except Exception:limit=True
  check('Third council briefing is rejected',limit)
  check('Rejected briefing unchanged',mid.evaluate('()=>Slop40.state.campaigns.mango.council'),2)
  out=js(mid,'await Slop40.choose("brand")')
  check('Rallied coalition changes outcome',out['ending'],'unicorn')
  check('Trust-backed approval reported',out['support']>=53)
  # Use two challenges to reduce support in an otherwise normal campaign.
  challenge=make();js(challenge,'await Slop40.start("mango")')
  for a in ['hype','pump']:js(challenge,f'await Slop40.choose("{a}")')
  js(challenge,'await Slop40.counsel("gradient","challenge")');js(challenge,'await Slop40.counsel("gradient","challenge")')
  out=js(challenge,'await Slop40.choose("brand")')
  check('Deliberate opposition can overturn default bid',out['ending'],'trial')
  check('Opposition changes historical faction memories',challenge.evaluate('()=>Slop40.state.citizens.find(c=>c.id==="gradient").memory.some(m=>m.text.includes("challenge"))'))
  # All three campaigns have state-dependent final negotiations.
  cloud=make();js(cloud,'await Slop40.start("cloud")');check('Cloud lawyer trust changed',settrust(cloud,'lawyer',4))
  for a in ['listen','union']:js(cloud,f'await Slop40.choose("{a}")')
  out=js(cloud,'await Slop40.choose("settle")')
  check('Cloud settlement can fail',out['ending'],'chaos')
  check('Cloud legal fallout published',cloud.evaluate('()=>SlopSociety.data.cases.some(c=>c.title.includes("Mars-East-1"))'))
  election=make();js(election,'await Slop40.start("election")');check('Election founder trust changed',settrust(election,'mango',3))
  for a in ['fund','accept']:js(election,f'await Slop40.choose("{a}")')
  out=js(election,'await Slop40.choose("corporate")')
  check('Election corporate coalition can fail',out['ending'],'recount')
  check('Election failure has distinct new headline',election.evaluate('()=>SlopSociety.data.news.some(n=>n.title.includes("CONFIDENCE VOTE"))'))
  # Successful plain campaign paths still produce original authored endings.
  default=make();out=play(default,'cloud',['restart','rollback','settle']);check('Unchanged cloud path still works',out['ending'],'treaty')
  out=play(default,'election',['fair','evidence','independent']);check('Unchanged election path still works',out['ending'],'fair')
  # User-facing guidance and keyboard naming, including lost focus after rerender.
  ui=make(390);ui.locator('#s40-open').click();js(ui,'await Slop40.start("mango")')
  check('Campaign UI explains deterministic threshold',ui.locator('#s40-dialog').get_by_text('needs 53 support',exact=False).count()>0)
  check('Council buttons named for accessible users',ui.get_by_role('button',name='Rally Mango CEO Ultra').count(),1)
  ui.get_by_role('button',name='Rally Mango CEO Ultra').click();ui.locator('#s40-feedback').wait_for()
  check('Council result puts focus on status',ui.evaluate('()=>document.activeElement.id'),'s40-feedback')
  check('Council announces remaining budget',ui.locator('#s40-feedback').inner_text().find('1 briefings remain')>=0)
  check('Mobile modal no horizontal overflow',ui.evaluate('()=>document.querySelector("#s40-dialog").scrollWidth<=document.querySelector("#s40-dialog").clientWidth'))
  ui.keyboard.press('Escape');check('Escape dismisses modal',ui.locator('#s40-dialog').is_hidden())
  # Replays do not reset accumulated rewards or discovered endings; council
  # opportunities reset only for the new campaign run.
  old_credits=mid.evaluate('()=>SlopWorld.state.credits')
  js(mid,'await Slop40.replay("mango")')
  check('Replay resets only council budget',mid.evaluate('()=>Slop40.state.campaigns.mango.council'),0)
  for a in ['hype','pump','brand']:js(mid,f'await Slop40.choose("{a}")')
  check('Replay cannot mint old stage rewards',mid.evaluate('()=>SlopWorld.state.credits'),old_credits)
  check('Ending discovery remains across replay',mid.evaluate('()=>Slop40.state.campaigns.mango.endingsSeen.includes("unicorn")'))
  # Checkpoints and v32 four-store backup include faction relationships and
  # results, while legacy checkpoint objects without council remain loadable.
  js(challenge,'await Slop40.saveSlot("Before rewind")')
  saved=challenge.evaluate('()=>JSON.stringify(Slop40.state.citizens)')
  backup=challenge.evaluate('()=>SlopWorld32.exportPayload()')
  check('Backup schema preserved',backup['version']==2 and len(backup['stores'])==4)
  check('Backup checksum validates',challenge.evaluate('(b)=>!!SlopWorld32.validateBackup(b)',backup))
  # Restore the backup after further council-independent world changes.
  original_snapshot=challenge.evaluate('()=>({tick:Slop40.state.tick,relations:Slop40.state.citizens.find(c=>c.id==="gradient").relations,ending:Slop40.state.campaigns.mango.ending})')
  js(challenge,'await Slop40.advance(8)')
  check('Existing backup restore accepts 4.0 factions',challenge.evaluate('(b)=>!!SlopWorld32.restoreBackup(b)',backup))
  check('Existing backup restores faction world exactly',challenge.evaluate('()=>({tick:Slop40.state.tick,relations:Slop40.state.citizens.find(c=>c.id==="gradient").relations,ending:Slop40.state.campaigns.mango.ending})'),original_snapshot)
  forged=json.loads(json.dumps(backup));forged['stores']['slopocalypse:fictional-internet:v2']['credits']+=9
  check('Tampered faction backup rejected',challenge.evaluate('(b)=>{try{SlopWorld32.validateBackup(b);return false}catch(_){return true}}',forged))
  js(challenge,'await Slop40.advance(8)');js(challenge,'await Slop40.loadSlot("Before rewind")')
  check('Checkpoint restores coalition state',challenge.evaluate('()=>JSON.stringify(Slop40.state.citizens)'),saved)
  check('Checkpoint retains archived endings',challenge.evaluate('()=>Slop40.state.campaigns.mango.endingsSeen.includes("trial")'))
  # Migrating old saved campaign data that predates council counters.
  js(challenge,'await SlopWorld.mutate(s=>{delete s.phase40.campaigns.mango.council;delete s.phase40.campaigns.mango.consultations;})')
  check('Old campaign state normalized without reset',challenge.evaluate('()=>Slop40.state.campaigns.mango.council'),0)
  check('Old campaign decisions retained',challenge.evaluate('()=>Slop40.state.campaigns.mango.decisions.length'),3)
  # Test deterministic run of identical scripted actions in fresh browsers.
  def script(p):
   js(p,'await Slop40.setSeed("meaningful-allies")');js(p,'await Slop40.start("mango")');js(p,'await Slop40.counsel("mango","rally")');js(p,'await Slop40.choose("audit")');js(p,'await Slop40.choose("publish")');js(p,'await Slop40.advance(8)');return p.evaluate('()=>({world:Slop40.state,credits:SlopWorld.state.credits})')
  a=make();b=make();check('Deterministic story plus faction intervention',script(a),script(b))
  # Simulate a failing storage write for the new council operation.
  fail=make();js(fail,'await Slop40.start("mango")');prior=fail.evaluate('()=>({state:JSON.stringify(Slop40.state),credits:SlopWorld.state.credits})');fail.evaluate('()=>{window.__denySave=true}')
  try:js(fail,'await Slop40.counsel("mango","rally")');rejected=False
  except Exception:rejected=True
  fail.evaluate('()=>{window.__denySave=false}')
  check('Failed council write rejects',rejected)
  check('Failed council write never changes history or credits',fail.evaluate('()=>({state:JSON.stringify(Slop40.state),credits:SlopWorld.state.credits})'),prior)
  for p in [low,high,mid,challenge,cloud,election,default,ui,a,b,fail]:p.close()
  browser.close()
 passed=sum(o for _,o in checks);print(f'PHASE40 FACTIONS: {passed}/{len(checks)} PASS; uncaught JS errors={len(errors)}')
 if errors:print('ERRORS:',errors[:6])
 return len(errors)==0 and passed==len(checks)

if __name__=='__main__':sys.exit(0 if run() else 1)
