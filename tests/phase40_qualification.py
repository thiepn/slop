#!/usr/bin/env python3
"""Phase 4.0 real Chromium DOM tests using inline original assets.
The browser sandbox blocks HTTP/data navigation, so this harness intentionally
uses set_content() and a simulated localStorage implementation. It does NOT
qualify native origin, Web Locks, cross-tab or BroadcastChannel durability.
"""
from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import json, hashlib, re, sys
ROOT=Path(__file__).resolve().parent.parent
ERRORS=[]
CHECKS=[]

SHIM=r'''(()=>{
 const slots={};const fake={
  getItem:k=>Object.prototype.hasOwnProperty.call(slots,k)?slots[k]:null,
  setItem:(k,v)=>{if((window.__denySave && (String(k).includes('fictional-internet') || String(k).includes('internet-collapse'))) || (window.__denyV3 && String(k).includes('internet-collapse'))) throw Error('simulated quota');slots[k]=String(v)},
  removeItem:k=>delete slots[k],clear:()=>Object.keys(slots).forEach(k=>delete slots[k]),
  key:i=>Object.keys(slots)[i]||null,get length(){return Object.keys(slots).length}
 };
 Object.defineProperty(window,'localStorage',{configurable:true,value:fake});
 Object.defineProperty(window,'__slopTestStore',{configurable:true,value:slots});
 window.__denySave=false;window.__denyV3=false;window.__SLOP40_INLINE=true;
 // This explicitly simulates locking, not a native Web Locks test.
 Object.defineProperty(navigator,'locks',{configurable:true,value:{request:async(_name,_opts,fn)=>fn()}});
})();'''

def inline_html(page):
 s=BeautifulSoup((ROOT/page).read_text(), 'html.parser')
 for css in list(s.find_all('link',href=True)):
  name=css.get('href','').split('?')[0]
  file=ROOT/name
  if file.is_file() and name.endswith('.css'):
   style=s.new_tag('style');style.string=file.read_text();css.replace_with(style)
 for script in list(s.find_all('script',src=True)):
  name=script.get('src','').split('?')[0];file=ROOT/name
  if file.is_file():
   script.attrs.pop('src',None);script.attrs.pop('defer',None);script.string=file.read_text()
 if (ROOT/'s40.css').exists():
  style=s.new_tag('style');style.string=(ROOT/'s40.css').read_text();s.head.append(style)
 script=s.new_tag('script');script.string=(ROOT/'s40-world.js').read_text();s.body.append(script)
 return str(s)

def check(cond,label):
 CHECKS.append((bool(cond),label))
 if not cond: print('FAIL:', label)

def run():
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  ctx=browser.new_context(viewport={'width':1024,'height':768},reduced_motion='reduce')
  page=ctx.new_page();page.on('pageerror',lambda exc: ERRORS.append(str(exc)))
  page.evaluate(SHIM);page.set_content(inline_html('singularity.html'),wait_until='domcontentloaded',timeout=30000)
  page.wait_for_function('()=>!!window.Slop40 && !!document.querySelector("#s40-open")',timeout=20000)
  check(page.locator('#s40-inline button').count()==1,'World entrypoint on singularity')
  check(page.evaluate('()=>window.Slop40.state.citizens.length')==8,'Eight fictional citizens')
  check(page.evaluate('()=>Object.keys(window.Slop40.campaigns).length')==3,'Three branching campaigns')
  check(page.locator('#s40-open').is_visible(),'Global launcher available')
  page.locator('#s40-open').click()
  check(page.locator('#s40-dialog').is_visible(),'Dialog opens')
  check(page.locator('#s40-dialog [role="tab"]').count()==4,'Four navigable tabs')
  check(page.locator('#s40-dialog button[data-action="start"]').count()>=3,'All campaigns have start controls')
  # Full mango arc; test new cards, effects and saved state.
  page.evaluate('()=>window.Slop40.start("mango")');
  check(page.evaluate('()=>window.Slop40.state.campaigns.mango.node')=='rumor','Mango initial node')
  page.evaluate('()=>window.Slop40.choose("audit")');
  check(page.evaluate('()=>window.Slop40.state.campaigns.mango.node')=='audit','Branch choice enters peer review')
  page.evaluate('()=>window.Slop40.choose("publish")');
  check(page.evaluate('()=>window.Slop40.state.campaigns.mango.node')=='hearing','Intermediate branch progresses')
  page.evaluate('()=>window.Slop40.choose("sue")');
  check(page.evaluate('()=>window.Slop40.state.campaigns.mango.ending')=='trial','Branching ending attained')
  check(page.evaluate('()=>window.Slop40.state.campaigns.mango.decisions.length')==3,'Three recorded decisions')
  check(page.evaluate('()=>window.Slop40.state.citizens.some(c=>c.memory.length>0)'),'Characters remember decisions')
  check(page.evaluate('()=>window.SlopWorld.state.mails.some(m=>m.id.startsWith("living40:"))'),'Cross-app mail generated')
  check(page.evaluate('()=>window.SlopSociety.data.news.some(n=>n.id.startsWith("living40:"))'),'Cross-app fictional news generated')
  check(page.evaluate('()=>window.SlopSociety.data.posts.some(n=>n.id.startsWith("living40:"))'),'Cross-app fictional social posts generated')
  check(page.evaluate('()=>window.SlopSociety.data.cases.some(n=>n.id.startsWith("living40:"))'),'Cross-app court case generated')
  check(page.evaluate('()=>window.SlopWorld.state.prices.vibe')!=7,'Market price responds to story')
  before=page.evaluate('()=>window.SlopWorld.state.credits')
  page.evaluate('()=>window.Slop40.replay("mango")');page.evaluate('()=>window.Slop40.choose("hype")');page.evaluate('()=>window.Slop40.choose("pump")');page.evaluate('()=>window.Slop40.choose("brand")');
  after=page.evaluate('()=>window.SlopWorld.state.credits')
  check(after==before,'Replay cannot mint duplicate credits')
  check(page.evaluate('()=>window.Slop40.state.campaigns.mango.ending')=='unicorn','Alternate ending on replay')
  # Other two full campaigns
  page.evaluate('()=>window.Slop40.start("cloud")');page.evaluate('()=>window.Slop40.choose("restart")');page.evaluate('()=>window.Slop40.choose("rollback")');page.evaluate('()=>window.Slop40.choose("settle")');
  page.evaluate('()=>window.Slop40.start("election")');page.evaluate('()=>window.Slop40.choose("fund")');page.evaluate('()=>window.Slop40.choose("expose")');page.evaluate('()=>window.Slop40.choose("invalidate")');
  check(page.evaluate('()=>Object.values(window.Slop40.state.campaigns).every(c=>c.status==="completed")'),'Three completed campaigns')
  # checkpoint + deterministic steps
  page.evaluate('()=>window.Slop40.saveSlot("Before time jump")');saved_tick=page.evaluate('()=>window.Slop40.state.tick')
  page.evaluate('()=>window.Slop40.advance(24)');
  check(page.evaluate('()=>window.Slop40.state.tick')==saved_tick+24,'Advance 24 fictional hours')
  check(page.evaluate('()=>window.Slop40.state.history.some(e=>e.kind==="citizen")'),'Autonomous simulated citizens produce timed events')
  page.evaluate('()=>window.Slop40.loadSlot("Before time jump")');
  check(page.evaluate('()=>window.Slop40.state.tick')==saved_tick,'Checkpoint restores simulated clock')
  check(page.evaluate('()=>window.Slop40.state.slots.length')==1,'Checkpoint persists without recursive snapshots')
  # old backup behavior without changing its format, tamper detection
  backup=page.evaluate('()=>window.SlopWorld32.exportPayload()')
  check(backup.get('version')==2 and len(backup.get('stores',{}))==4,'Legacy v32 backup format unchanged')
  check('phase40' in backup['stores']['slopocalypse:fictional-internet:v2'],'Phase 4 state included in old backup payload')
  check(page.evaluate('(b)=>!!window.SlopWorld32.validateBackup(b)',backup),'Backup validated')
  # Confirm a real restore of the original 4-key backup format preserves 4.0.
  tick_saved=page.evaluate('()=>window.Slop40.state.tick')
  page.evaluate('()=>window.Slop40.advance(1)')
  restored=page.evaluate('(b)=>window.SlopWorld32.restoreBackup(b)',backup)
  check(bool(restored),'Backup restoration completes')
  check(page.evaluate('()=>window.Slop40.state.tick')==tick_saved,'Phase 4 progress restored from Phase 10 backup schema')
  # A successful v2 write and failed v3 projection must leave an outbox item.
  page.evaluate('()=>{window.__denyV3=true}')
  page.evaluate('()=>window.Slop40.advance(4)')
  check(page.evaluate('()=>window.Slop40.state.effects.some(e=>!e.projected)'),'Cross-store failure retains retryable outbox')
  page.evaluate('()=>{window.__denyV3=false}')
  page.evaluate('()=>window.Slop40.reconcile()')
  check(page.evaluate('()=>window.Slop40.state.effects.every(e=>e.projected)'),'Retry drains pending cross-app effects')
  check(page.evaluate('()=>window.SlopSociety.data.news.some(n=>n.id.startsWith("living40:"))'),'Retried effects arrive in news')
  # Reload the same saved stores into a second in-memory browser document.
  saved=page.evaluate('()=>JSON.stringify(window.__slopTestStore)')
  follow=ctx.new_page();follow.on('pageerror',lambda exc: ERRORS.append('follow-up '+str(exc)))
  follow.evaluate(SHIM);follow.evaluate('(s)=>Object.assign(window.__slopTestStore,JSON.parse(s))',saved)
  follow.set_content(inline_html('portal.html'),wait_until='domcontentloaded',timeout=30000)
  follow.wait_for_function('()=>!!window.Slop40')
  check(follow.evaluate('()=>Object.values(window.Slop40.state.campaigns).every(c=>c.status==="completed")'),'Progress loads on a different original page')
  check(follow.evaluate('()=>window.Slop40.state.slots.length')==1,'Checkpoint survives cross-page rehydration')
  follow.close()
  bad=json.loads(json.dumps(backup));bad['stores']['slopocalypse:fictional-internet:v2']['credits']+=1
  check(page.evaluate('(b)=>{try{window.SlopWorld32.validateBackup(b);return false}catch(e){return true}}',bad),'Tampered backup rejected')
  # fail W.mutate and ensure no false action success or changes
  tick=page.evaluate('()=>window.Slop40.state.tick');credits=page.evaluate('()=>window.SlopWorld.state.credits');
  page.evaluate('()=>{window.__denySave=true}')
  check(page.evaluate('async()=>{try{await window.Slop40.advance(1);return false}catch(e){return true}}'),'Quota failure returns error')
  page.evaluate('()=>{window.__denySave=false}')
  check(page.evaluate('()=>window.Slop40.state.tick')==tick,'Quota failure rolls back tick')
  check(page.evaluate('()=>window.SlopWorld.state.credits')==credits,'Quota failure rolls back credits')
  # Accessibility keyboard and named interactive elements
  page.keyboard.press('Escape');check(page.locator('#s40-dialog').is_hidden(),'Escape closes dialog')
  page.locator('#s40-open').focus();page.keyboard.press('Enter');check(page.locator('#s40-dialog').is_visible(),'Enter opens dialog')
  check(page.evaluate('()=>[...document.querySelectorAll("#s40-shell button")].every(b=>b.textContent.trim()||b.getAttribute("aria-label"))'),'Named buttons')
  page.get_by_role('tab',name='Citizens').click();check(page.locator('#s40-dialog .s40-card').count()==8,'Citizens tab renders all eight')
  page.get_by_role('tab',name='World Timeline').click();check(page.locator('.s40-timeline li').count()>3,'Timeline shows events')
  page.get_by_role('tab',name='Save Slots').click();check(page.locator('#s40-slot-name').count()==1,'Checkpoint form available')
  check(len(ERRORS)==0,'No uncaught JS errors')
  # narrower widths and no overflow, representative all-page sample
  page.keyboard.press('Escape')
  for width in [320,390,768,1440]:
   page.set_viewport_size({'width':width,'height':850})
   check(page.evaluate('()=>document.documentElement.scrollWidth<=window.innerWidth'),f'No overflow {width}px')
   page.locator('#s40-open').click()
   check(page.locator('#s40-dialog').is_visible(),f'Playable dialog {width}px')
   page.keyboard.press('Escape')
  browser.close()
  failed=[k for good,k in CHECKS if not good]
  print(f'PHASE40: {len(CHECKS)-len(failed)}/{len(CHECKS)} passed, browser errors={len(ERRORS)}')
  if ERRORS:print('BROWSER ERRORS',ERRORS[:6])
  if failed:print('FAILED:',failed)
  return not failed and not ERRORS

if __name__=='__main__':sys.exit(0 if run() else 1)
