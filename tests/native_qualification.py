#!/usr/bin/env python3
"""SLOPOCALYPSE Phase 10, native HTTP-origin browser qualification.

Optional developer-only test harness: requires Python playwright package and
installed Chromium/Firefox/WebKit binaries. Never needed to run the website.

Run from the extracted site: python tests/native_qualification.py --idle-seconds 5
Use --port 8765 for a fixed origin; the default ephemeral port avoids conflicts
but represents a separate localStorage origin from your production progress.
"""
import argparse, asyncio, contextlib, functools, http.server, json, os
import pathlib, shutil, socketserver, threading, time, traceback
from datetime import datetime, timezone
from playwright.async_api import async_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
class Handler(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
 def log_message(self,*a):pass
class Server(http.server.ThreadingHTTPServer):allow_reuse_address=True

def note(items,name,status,detail=None):
 items.append({'name':name,'status':status,'detail':detail})
 print(f'{status}: {name}: {detail or ""}',flush=True)

async def test_one(browser_type,base,records,idle,stress_pairs,executable_path=None):
 label=browser_type.name
 browser=None
 launch={'headless':True}
 if executable_path:launch['executable_path']=executable_path
 if label=='chromium':launch['args']=['--no-sandbox','--disable-dev-shm-usage']
 try:browser=await browser_type.launch(**launch)
 except Exception as e:
  note(records,label+' launch','UNAVAILABLE',str(e)[:350]);return
 try:
  context=await browser.new_context(viewport={'width':1280,'height':820})
  a=await context.new_page()
  errors=[];a.on('pageerror',lambda e:errors.append(str(e)))
  try:
   response=await a.goto(base+'/slopos.html',wait_until='domcontentloaded',timeout=12000)
   await a.wait_for_function('Boolean(window.SlopWorld32 && window.SlopWorld)',timeout=8000)
   note(records,label+' real HTTP origin','PASS',{'status':response.status,'origin':await a.evaluate('location.origin')})
  except Exception as e:
   detail=str(e)[:400]
   status='BLOCKED' if 'ERR_BLOCKED_BY_ADMINISTRATOR' in detail else 'FAIL'
   note(records,label+' real HTTP origin',status,detail)
   return
  b=await context.new_page()
  await b.goto(base+'/slopos.html',wait_until='domcontentloaded',timeout=12000)
  await b.wait_for_function('Boolean(window.SlopWorld32 && window.SlopWorld)',timeout=8000)
  features=await a.evaluate('''() => ({locks:!!navigator.locks?.request,channel:typeof BroadcastChannel==='function',storage:typeof localStorage.setItem==='function'})''')
  note(records,label+' native capabilities','PASS' if all(features.values()) else 'FAIL',features)
  # Durable storage on the same origin across two *native* pages.
  await a.evaluate("localStorage.setItem('__slop_phase9_native_probe','from-first-tab')")
  try:
   await b.wait_for_function("localStorage.getItem('__slop_phase9_native_probe')==='from-first-tab'",timeout=3000)
   note(records,label+' two-tab same-origin storage','PASS')
  except Exception as e:note(records,label+' two-tab same-origin storage','FAIL',str(e)[:160])
  if features['channel']:
   await b.evaluate('''() => {window.__phase9Received='';window.__phase9Channel=new BroadcastChannel('phase10-native-probe');window.__phase9Channel.onmessage=e=>window.__phase9Received=e.data;}''')
   await a.evaluate("() => {let c=new BroadcastChannel('phase10-native-probe');c.postMessage('message-from-tab-a');c.close()}")
   try:
    await b.wait_for_function("window.__phase9Received==='message-from-tab-a'",timeout=5000)
    note(records,label+' native BroadcastChannel','PASS')
   except Exception as e:note(records,label+' native BroadcastChannel','FAIL',str(e)[:160])
  if features['locks']:
   await a.evaluate('''() => {window.__phase9Entered1=false;window.__phase9Release=undefined;navigator.locks.request('phase10-cross-tab-lock',async()=>{window.__phase9Entered1=true;await new Promise(ok=>{window.__phase9Release=ok})});}''')
   try:
    await a.wait_for_function('window.__phase9Entered1 && !!window.__phase9Release',timeout=5000)
    await b.evaluate('''() => {window.__phase9Entered2=false;navigator.locks.request('phase10-cross-tab-lock',async()=>{window.__phase9Entered2=true});}''')
    await asyncio.sleep(.15)
    was_blocked=not await b.evaluate('window.__phase9Entered2')
    await a.evaluate('window.__phase9Release()')
    await b.wait_for_function('window.__phase9Entered2',timeout=5000)
    note(records,label+' native Web Locks mutual exclusion','PASS' if was_blocked else 'FAIL',{'blocked_until_release':was_blocked})
   except Exception as e:
    note(records,label+' native Web Locks mutual exclusion','FAIL',str(e)[:220])
    with contextlib.suppress(Exception):await a.evaluate('window.__phase9Release?.()')
  # Multiple tabs racing one mission; one credit award and one claim marker.
  try:
   initial=await a.evaluate("JSON.parse(localStorage.getItem('slopocalypse:fictional-internet:v2')).credits")
   mission='phase-ten-native-concurrency'
   attempt=f"async()=>window.SlopWorld32.claimMission('{mission}',37,()=>true)"
   left,right=await asyncio.gather(a.evaluate(attempt),b.evaluate(attempt))
   saved=await a.evaluate("""() => ({credits:JSON.parse(localStorage.getItem('slopocalypse:fictional-internet:v2')).credits,claimed:JSON.parse(localStorage.getItem('slopocalypse:world-engine:v32')).rewards.claimed})""")
   ok=sum([bool(left.get('ok')),bool(right.get('ok'))])==1 and saved['credits']==initial+37 and saved['claimed'].count(mission)==1
   note(records,label+' concurrent claim exactly-once','PASS' if ok else 'FAIL',{'attempts':[left,right],'start':initial,'finish':saved['credits'],'markers':saved['claimed'].count(mission)})
  except Exception as e:note(records,label+' concurrent claim exactly-once','FAIL',str(e)[:300])
  # Legacy synchronous writes are NOT protected by v32 Web Locks. Running
  # this stress on a real origin may reproduce lost updates; a pass here is
  # a sample, never a proof that the legacy path is race-free.
  if stress_pairs:
   try:
    await a.evaluate('window.SlopWorld32.sync()')
    before=await a.evaluate('window.SlopWorld.state.credits')
    attempts=[]
    for i in range(stress_pairs):
     reason=f'phase10-race-{i}'
     expr=f"() => window.SlopWorld.earn(7,'{reason}')"
     x,y=await asyncio.gather(a.evaluate(expr),b.evaluate(expr))
     attempts.append([x,y])
    final=await a.evaluate('JSON.parse(localStorage.getItem("slopocalypse:fictional-internet:v2")).credits')
    expected=before+7*sum(sum(bool(v) for v in pair) for pair in attempts)
    # Earning a legacy reward may be followed by a separate, non-credit
    # achievement write. Only the wallet delta and reported successful calls
    # are compared; the experiment does not certify atomicity.
    ok=final==expected
    note(records,label+' legacy two-tab lost-update stress','PASS' if ok else 'FAIL',{'attempts':stress_pairs,'reportedSuccesses':sum(sum(bool(v) for v in pair) for pair in attempts),'expectedCredits':expected,'actualCredits':final})
   except Exception as e:note(records,label+' legacy two-tab lost-update stress','FAIL',str(e)[:350])
  # Backup, restart and last-mile UI checks.
  try:
   saved=await a.evaluate('window.SlopWorld32.exportPayload()')
   validation=await a.evaluate('(backup)=>window.SlopWorld32.validateBackup(backup).preview',saved)
   await a.reload(wait_until='domcontentloaded')
   await a.wait_for_function('!!window.SlopWorld32')
   await asyncio.sleep(min(max(idle,0),14400))
   credits=await a.evaluate('window.SlopWorld.state.credits')
   was_ok=credits==validation['credits']
   note(records,label+' reload + real idle persistence','PASS' if was_ok else 'FAIL',{'idleSeconds':idle,'expected':validation['credits'],'actual':credits})
  except Exception as e:note(records,label+' reload + real idle persistence','FAIL',str(e)[:300])
  # Read-only verification of real-origin backup structure. Checksum
  # manipulation must fail; a restored backup must preserve ledger contents.
  try:
   snapshot=await a.evaluate('window.SlopWorld32.exportPayload()')
   valid=await a.evaluate('(b) => window.SlopWorld32.validateBackup(b).preview',snapshot)
   tamper=await a.evaluate('''(b)=>{b.stores['slopocalypse:world-engine:v32'].influence+=1;try{SlopWorld32.validateBackup(b);return false}catch(_){return true}}''',json.loads(json.dumps(snapshot)))
   note(records,label+' native backup checksum validation','PASS' if valid and tamper else 'FAIL',{'preview':valid,'tamperRejected':tamper})
  except Exception as e:note(records,label+' native backup checksum validation','FAIL',str(e)[:350])
  try:
   await a.keyboard.press('ControlOrMeta+k')
   await a.wait_for_timeout(150)
   opened=await a.evaluate("!!document.querySelector('#s31-panel:not([hidden])')")
   await a.keyboard.press('Escape')
   closed=await a.evaluate("document.querySelector('#s31-panel')?.hidden")
   note(records,label+' keyboard launcher + dismissal','PASS' if opened and closed else 'FAIL',{'opened':opened,'closed':closed})
  except Exception as e:note(records,label+' keyboard launcher + dismissal','FAIL',str(e)[:250])
  try:
   names=await a.evaluate('''() => {const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'};const controls=[...document.querySelectorAll('button,input,textarea,select,[role=button]')].filter(visible);return {total:controls.length,unnamed:controls.filter(e=>!((e.getAttribute('aria-label')||e.getAttribute('aria-labelledby')||e.getAttribute('title')||e.innerText||e.labels?.length||'').toString().trim())).length}}''')
   note(records,label+' native browser accessible control names','PASS' if names['unnamed']==0 else 'FAIL',names)
  except Exception as e:note(records,label+' native browser accessible control names','FAIL',str(e)[:300])
  note(records,label+' page JS exceptions','PASS' if not errors else 'FAIL',errors[:8])
  for page in (a,b):
   with contextlib.suppress(Exception): await page.close()
  await context.close()
 finally:
  with contextlib.suppress(Exception):await browser.close()

async def main():
 p=argparse.ArgumentParser();p.add_argument('--idle-seconds',type=float,default=5);p.add_argument('--port',type=int,default=0);p.add_argument('--output',default=str(ROOT/'qa_evidence'/'phase10_native_runtime.json'));p.add_argument('--browsers',default='chromium,firefox,webkit');p.add_argument('--stress-pairs',type=int,default=12);a=p.parse_args()
 server=Server(('127.0.0.1',a.port),Handler)
 th=threading.Thread(target=server.serve_forever,daemon=True);th.start()
 base=f'http://127.0.0.1:{server.server_address[1]}'
 results={'started':datetime.now(timezone.utc).isoformat(),'url':base,'originType':'real local HTTP','idleSeconds':a.idle_seconds,'stressPairs':a.stress_pairs,'tests':[],'note':'BLOCKED/UNAVAILABLE are not passes. No UI source changes required to run this optional qualification script.'}
 try:
  async with async_playwright() as browser:
   for label in [x.strip() for x in a.browsers.split(',') if x.strip()]:
    if label not in ('chromium','firefox','webkit'):continue
    exe=shutil.which('chromium') if label=='chromium' else None
    await test_one(getattr(browser,label),base,results['tests'],a.idle_seconds,a.stress_pairs,exe)
 finally:server.shutdown();server.server_close()
 results['finished']=datetime.now(timezone.utc).isoformat()
 results['counts']={s:sum(t['status']==s for t in results['tests']) for s in ('PASS','FAIL','BLOCKED','UNAVAILABLE')}
 out=pathlib.Path(a.output);out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(results,indent=2),encoding='utf-8')
 print('REPORT',out,results['counts'])
 # A blocked environment is an incomplete qualification; mark explicitly.
 if results['counts']['FAIL']:return 1
 if results['counts']['BLOCKED'] or results['counts']['UNAVAILABLE']:return 2
 return 0
if __name__=='__main__':raise SystemExit(asyncio.run(main()))
