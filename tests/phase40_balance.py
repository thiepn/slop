#!/usr/bin/env python3
"""Phase 4.0 route-balance, credible negotiations, pacing, replay, and rollback.
Executes actual source in Chromium DOM with an in-memory storage/Web Locks shim.
Does not qualify real same-origin multi-tab concurrency, Firefox, WebKit or AT.
"""
import sys
from playwright.sync_api import sync_playwright
from phase40_qualification import SHIM, inline_html

checks=[]; page_errors=[]
def check(name,actual,expected=True):
    passed = actual==expected
    checks.append((name,passed))
    if not passed:print('FAIL',name,repr(actual),'expected',repr(expected))

def run():
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  def make(width=900):
   p=browser.new_page(viewport={'width':width,'height':860},reduced_motion='reduce')
   p.on('pageerror',lambda e:page_errors.append(str(e)))
   p.evaluate(SHIM);p.set_content(inline_html('singularity.html'),wait_until='domcontentloaded')
   p.wait_for_function('()=>Boolean(window.Slop40)');return p
  def js(p,code,arg=None):return p.evaluate('async x=>'+code,arg)
  def route(campaign,path,choice):
   p=make()
   result=js(p,'{await Slop40.start(x.id);for(const step of x.path) await Slop40.choose(step);return await Slop40.choose(x.choice)}',{'id':campaign,'path':path,'choice':choice})
   p.close();return result
  # Before the fix, ALL 36 routes from this matrix were approved, even logically
  # contradictory ones. The explicit matrix is intentionally a stable balance contract.
  paths={
   'mango':[['audit','publish'],['hype','pump'],['hype','divest'],['audit','cover']],
   'cloud':[['listen','union'],['sell','ignore'],['restart','rollback'],['restart','ship']],
   'election':[['fair','evidence'],['fund','accept'],['bot','poll'],['fund','expose']]
  }
  endings={'mango':['truth','brand','sue'],'cloud':['settle','reset','rights'],'election':['independent','corporate','invalidate']}
  approvals=[]; outcomes=[]
  for campaign,pp in paths.items():
   for path in pp:
    for choice in endings[campaign]:
     v=route(campaign,path,choice)
     approvals.append(v['approved'])
     outcomes.append((campaign,tuple(path),choice,v['ending'],v['support']))
     check(f'route {campaign}:{"/".join(path)}:{choice} score within bounds',0<=v['support']<=100)
  check('Some pivotal votes now fail unlike baseline',sum(not x for x in approvals)>=10)
  check('Some pivotal votes remain approved',sum(approvals)>=10)
  check('Research path approves proof',next(x for x in outcomes if x[:3]==('mango',('audit','publish'),'truth'))[3],'verified')
  check('Hype path cannot pass truth without coalition',next(x for x in outcomes if x[:3]==('mango',('hype','pump'),'truth'))[3],'trial')
  check('Hype path backs commercial deal',next(x for x in outcomes if x[:3]==('mango',('hype','pump'),'brand'))[3],'unicorn')
  check('Research path vetoes unsupported branding',next(x for x in outcomes if x[:3]==('mango',('audit','publish'),'brand'))[3],'trial')
  check('Cloud rights remain reachable',next(x for x in outcomes if x[:3]==('cloud',('listen','union'),'rights'))[3],'chaos')
  check('Cloud recovery remains reachable',next(x for x in outcomes if x[:3]==('cloud',('restart','rollback'),'reset'))[3],'reboot')
  check('Cloud treaty remains reachable',next(x for x in outcomes if x[:3]==('cloud',('listen','union'),'settle'))[3],'treaty')
  check('Selling then ignoring cloud breaches treaty backing',next(x for x in outcomes if x[:3]==('cloud',('sell','ignore'),'settle'))[3],'chaos')
  check('Independent election remains reachable',next(x for x in outcomes if x[:3]==('election',('fair','evidence'),'independent'))[3],'fair')
  check('CEO election remains reachable',next(x for x in outcomes if x[:3]==('election',('fund','accept'),'corporate'))[3],'ceo')
  check('Recount remains reachable',next(x for x in outcomes if x[:3]==('election',('fair','evidence'),'invalidate'))[3],'recount')
  check('Corporate donor path undermines independent vote',next(x for x in outcomes if x[:3]==('election',('fund','accept'),'independent'))[3],'recount')
  # Contradictory research evidence was accepted in the prior build solely due
  # to a personality match. The same low-quality offer must now fail.
  p=make(320)
  js(p,'{await Slop40.start("mango");await Slop40.choose("hype");await Slop40.choose("pump");return true}')
  credit_before=p.evaluate('()=>SlopWorld.state.credits')
  n=js(p,'{return await Slop40.negotiate("truth","evidence")}')
  check('Evidence without research groundwork rejected',n['accepted'],False)
  check('Rejected testimony records missing groundwork',p.evaluate('()=>Slop40.state.campaigns.mango.negotiations[0].reply.includes("groundwork was missing")'))
  check('Rejection consumes scarce negotiation budget',p.evaluate('()=>Slop40.state.campaigns.mango.diplomacy'),1)
  check('Rejection does not generate credits',p.evaluate('()=>SlopWorld.state.credits'),credit_before)
  check('Rejected testimony persists in legacy mail',p.evaluate('()=>SlopWorld.state.mails.some(m=>m.subject.includes("REJECTS"))'))
  check('Rejected testimony persists in legacy news',p.evaluate('()=>SlopSociety.data.news.some(m=>m.title.includes("REJECTS"))'))
  p.locator('#s40-open').click()
  check('Pivotal UI explains negative path',p.locator('button.s40-choice[data-id="truth"]').inner_text().find('Path -22')>=0)
  check('Pivotal UI identifies causing choices',p.locator('button.s40-choice[data-id="truth"]').inner_text().find('pump -11')>=0)
  check('320px campaign dialog has no horizontal scroll',p.evaluate('()=>document.querySelector("#s40-dialog").scrollWidth<=document.querySelector("#s40-dialog").clientWidth'))
  p.keyboard.press('Escape');check('Escape remains available',p.locator('#s40-dialog').is_hidden())
  # Grounded variants can pass. Deals and threats impose political costs that
  # differ from research-based testimony, without spending fictional credits.
  grounded=make();js(grounded,'{await Slop40.start("mango");await Slop40.choose("audit");await Slop40.choose("publish");return true}')
  before=grounded.evaluate('()=>SlopWorld.state.credits')
  ok=js(grounded,'{return await Slop40.negotiate("truth","evidence")}')
  check('Documented research earns credible testimony',ok['accepted'])
  check('Evidence restores support without credits',grounded.evaluate('()=>SlopWorld.state.credits'),before)
  deal=make();js(deal,'{await Slop40.start("mango");await Slop40.choose("hype");await Slop40.choose("pump");return true}')
  original=deal.evaluate('()=>Slop40.state.citizens.find(c=>c.id==="gradient").relations.mango')
  ok=js(deal,'{return await Slop40.negotiate("brand","deal")}')
  check('Commercial path grants credible mandate',ok['accepted'])
  check('Deal changes distinct alliance relationship',deal.evaluate('()=>Slop40.state.citizens.find(c=>c.id==="gradient").relations.mango')>original)
  check('Deal reports political cost',deal.evaluate('()=>Slop40.state.campaigns.mango.negotiations[0].reply.includes("alienates skeptics")'))
  legal=make();js(legal,'{await Slop40.start("cloud");await Slop40.choose("listen");await Slop40.choose("union");return true}')
  ok=js(legal,'{return await Slop40.negotiate("settle","pressure")}')
  check('Union route establishes legal grounds',ok['accepted'])
  check('Legal pressure inflames rivals',legal.evaluate('()=>Slop40.state.campaigns.cloud.negotiations[0].reply.includes("inflames rivals")'))
  unjustified=make();js(unjustified,'{await Slop40.start("election");await Slop40.choose("fund");await Slop40.choose("accept");return true}')
  ok=js(unjustified,'{return await Slop40.negotiate("invalidate","pressure")}')
  check('Corporate donations do not authorize legal pressure',ok['accepted'],False)
  # Exhausted characters recover on a deterministic clock, instead of being
  # permanently trapped in sabotage mode after a long session.
  fatigue=make();fatigue.evaluate('()=>SlopWorld.mutate(s=>{s.phase40.citizens.forEach(c=>c.energy=0)})')
  starting=fatigue.evaluate('()=>SlopWorld.state.credits')
  js(fatigue,'{return await Slop40.advance(24)}')
  e1=fatigue.evaluate('()=>Slop40.state.citizens.map(c=>c.energy)')
  check('Exhaustion recovers after one day',min(e1)>0)
  js(fatigue,'{return await Slop40.advance(24)}')
  e2=fatigue.evaluate('()=>Slop40.state.citizens.map(c=>c.energy)')
  check('Recovery continues after second day',min(e2)>min(e1))
  check('Rest does not mint credits',fatigue.evaluate('()=>SlopWorld.state.credits'),starting)
  check('Exactly 12 4h initiatives after 48h',fatigue.evaluate('()=>Slop40.state.history.filter(x=>x.kind==="citizen").length'),12)
  # Preserve 4-store backup, checkpoints, old rewards and deterministic paths.
  backup=grounded.evaluate('()=>SlopWorld32.exportPayload()')
  check('Backup remains version 2',backup['version'],2)
  check('Backup still contains exactly four stores',len(backup['stores']),4)
  check('Backward-compatible backup checksum validates',grounded.evaluate('(x)=>!!SlopWorld32.validateBackup(x)',backup))
  js(grounded,'{return await Slop40.saveSlot("Coalition evidence")}')
  snapshot=grounded.evaluate('()=>({seed:Slop40.state.seed,tick:Slop40.state.tick,decisions:Slop40.state.campaigns.mango.decisions,trust:Slop40.state.citizens.find(c=>c.id==="pigeon").trust})')
  js(grounded,'{return await Slop40.advance(24)}')
  js(grounded,'{return await Slop40.loadSlot("Coalition evidence")}')
  check('Checkpoint roundtrip retains scenario and trust',grounded.evaluate('()=>({seed:Slop40.state.seed,tick:Slop40.state.tick,decisions:Slop40.state.campaigns.mango.decisions,trust:Slop40.state.citizens.find(c=>c.id==="pigeon").trust})'),snapshot)
  check('Backup restore remains supported',grounded.evaluate('(x)=>!!SlopWorld32.restoreBackup(x)',backup))
  check('Restored state retains negotiation',grounded.evaluate('()=>Slop40.state.campaigns.mango.negotiations[0].accepted'))
  # Exact same seeded story, decision sequence and fatigue yield identical 4.0
  # state (excluding the older stores' current timestamps).
  def seeded(q):
   js(q,'{await Slop40.setSeed("route-balance-v2");await Slop40.start("mango");await Slop40.choose("audit");await Slop40.choose("publish");await Slop40.advance(24);return true}')
   return q.evaluate('()=>({state:Slop40.state,credits:SlopWorld.state.credits})')
  a,b=make(),make()
  check('Seeded story replay is byte-identical',seeded(a),seeded(b))
  # A failed V2 write must leave every projected record and world value unchanged.
  fail=make();js(fail,'{await Slop40.start("election");await Slop40.choose("fund");await Slop40.choose("accept");return true}')
  prior=fail.evaluate('()=>({world:JSON.stringify(Slop40.state),credits:SlopWorld.state.credits,mail:SlopWorld.state.mails.length})')
  fail.evaluate('()=>{window.__denySave=true}')
  try:js(fail,'{return await Slop40.negotiate("corporate","deal")}');rejected=False
  except Exception:rejected=True
  fail.evaluate('()=>{window.__denySave=false}')
  check('Quota failure rejects decision write',rejected)
  check('Failed write has no phantom credits, trust or mail',fail.evaluate('()=>({world:JSON.stringify(Slop40.state),credits:SlopWorld.state.credits,mail:SlopWorld.state.mails.length})'),prior)
  # One-time reward protection remains after a full replay of the same route.
  reward=make();js(reward,'{await Slop40.start("mango");for(const x of ["audit","publish","truth"])await Slop40.choose(x);return true}')
  credited=reward.evaluate('()=>SlopWorld.state.credits')
  js(reward,'{await Slop40.replay("mango");for(const x of ["audit","publish","truth"])await Slop40.choose(x);return true}')
  check('Replay cannot repeat decision or ending rewards',reward.evaluate('()=>SlopWorld.state.credits'),credited)
  check('Discovery is retained after replay',reward.evaluate('()=>Slop40.state.campaigns.mango.endingsSeen.includes("verified")'))
  for x in [p,grounded,deal,legal,unjustified,fatigue,a,b,fail,reward]:x.close()
  browser.close()
 passed=sum(ok for _,ok in checks)
 print(f'PHASE40 BALANCE: {passed}/{len(checks)} PASS; JS errors={len(page_errors)}; routes approved={sum(approvals)}/36')
 if page_errors:print('JS ERRORS',page_errors[:5])
 return passed==len(checks) and not page_errors
if __name__=='__main__':sys.exit(0 if run() else 1)
