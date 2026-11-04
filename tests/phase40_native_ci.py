#!/usr/bin/env python3
"""PR-only real HTTP origin test. No storage, lock or channel shims."""
import argparse, asyncio, copy, http.server, json, pathlib, threading, traceback
from datetime import datetime, timezone
from playwright.async_api import async_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
V2='slopocalypse:fictional-internet:v2'
class Handler(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
 def log_message(self,*a):pass
async def main():
 ap=argparse.ArgumentParser()
 ap.add_argument('--browser',choices=['chromium','firefox','webkit'],required=True)
 ap.add_argument('--output',required=True)
 a=ap.parse_args()
 server=http.server.ThreadingHTTPServer(('127.0.0.1',0),Handler)
 threading.Thread(target=server.serve_forever,daemon=True).start()
 base=f'http://127.0.0.1:{server.server_address[1]}'
 results=[];errors=[]
 def record(name,ok,details=None,status=None):
  s=status or ('PASS' if ok else 'FAIL')
  results.append({'name':name,'status':s,'details':details})
  print(s,name,str(details)[:180],flush=True)
 async def check(name,fn):
  try:
   valid,detail=await fn()
   record(name,bool(valid),detail)
  except Exception as e:record(name,False,str(e)[:400])
 try:
  async with async_playwright() as pw:
   try:browser=await getattr(pw,a.browser).launch(headless=True,args=['--no-sandbox'] if a.browser=='chromium' else [])
   except Exception as e:
    record('browser launch',False,str(e)[:300],'UNAVAILABLE')
    browser=None
   if browser:
    context=await browser.new_context(viewport={'width':1280,'height':840},reduced_motion='reduce')
    one=await context.new_page();two=await context.new_page()
    one.on('pageerror',lambda e:errors.append(str(e)))
    two.on('pageerror',lambda e:errors.append(str(e)))
    try:
     response=await one.goto(base+'/singularity.html',wait_until='domcontentloaded',timeout=25000)
     await one.wait_for_function('!!window.Slop40 && !!window.SlopWorld32',timeout=15000)
     await two.goto(base+'/slopos.html',wait_until='domcontentloaded',timeout=25000)
     await two.wait_for_function('!!window.Slop40 && !!window.SlopWorld32',timeout=15000)
     record('native 4.0 HTTP entrypoint',bool(response.ok),response.status)
    except Exception as e:
     t='BLOCKED' if 'ERR_BLOCKED_BY_ADMINISTRATOR' in str(e) else 'FAIL'
     record('native 4.0 HTTP entrypoint',False,str(e)[:400],t)
    else:
     async def two_tab_time():
      # A fresh v2 world is initialized lazily by the first 4.0 transaction.
      await one.evaluate('() => Slop40.advance(1)')
      before=await one.evaluate('JSON.parse(localStorage.getItem("'+V2+'")).phase40.tick')
      changes=await asyncio.gather(one.evaluate('() => Slop40.advance(1)'),two.evaluate('() => Slop40.advance(1)'))
      after=await one.evaluate('JSON.parse(localStorage.getItem("'+V2+'")).phase40.tick')
      return after==before+2,{'before':before,'after':after,'actions':changes}
     await check('native two-tab 4.0 clock serialization',two_tab_time)
     async def campaigns():
      report=await one.evaluate("""async () => {
       const data=[];
       for (const id of ['mango','cloud','election']) {
        await Slop40.start(id);
        for(let n=0;n<5 && Slop40.state.campaigns[id].status!=='completed';n++){
         const scene=Slop40.campaigns[id].nodes[Slop40.state.campaigns[id].node];
         await Slop40.choose(scene.options[0].id);
        }
        const c=Slop40.state.campaigns[id];
        data.push({id,status:c.status,ending:c.ending,valid:!!Slop40.campaigns[id].endings[c.ending]});
       }
       return data;
      }""")
      return len(report)==3 and all(r['status']=='completed' and r['valid'] for r in report),report
     await check('all three native campaign storylines',campaigns)
     async def save_and_reload():
      await one.evaluate('() => Slop40.saveSlot("ci-native")')
      before=await one.evaluate('() => ({tick:Slop40.state.tick,slots:Slop40.state.slots.length,credits:SlopWorld.state.credits})')
      await one.reload(wait_until='domcontentloaded')
      await one.wait_for_function('!!window.Slop40',timeout=15000)
      after=await one.evaluate('() => ({tick:Slop40.state.tick,slots:Slop40.state.slots.length,credits:SlopWorld.state.credits})')
      return before==after,{'saved':before,'reloaded':after}
     await check('real native origin reload and checkpoint',save_and_reload)
     async def replay():
      await one.evaluate('() => Slop40.advance(24)')
      first=await one.evaluate("""() => ({tick:Slop40.state.tick,rng:Slop40.state.rng,actions:Slop40.state.history.filter(x=>x.kind==='citizen').slice(0,6).map(x=>x.title)})""")
      await one.evaluate('() => Slop40.loadSlot("ci-native")')
      await one.evaluate('() => Slop40.advance(24)')
      second=await one.evaluate("""() => ({tick:Slop40.state.tick,rng:Slop40.state.rng,actions:Slop40.state.history.filter(x=>x.kind==='citizen').slice(0,6).map(x=>x.title)})""")
      return first==second,{'first':first,'second':second}
     await check('deterministic native replay',replay)
     async def backup():
      payload=await one.evaluate('() => SlopWorld32.exportPayload()')
      changed=copy.deepcopy(payload);changed['stores'][V2]['credits']+=1
      rejects=await one.evaluate("""b=>{try{SlopWorld32.validateBackup(b);return false}catch(e){return true}}""",changed)
      await one.evaluate('() => Slop40.advance(1)')
      restored=await one.evaluate('(b) => SlopWorld32.restoreBackup(b)',payload)
      await one.reload(wait_until='domcontentloaded')
      await one.wait_for_function('!!window.Slop40',timeout=15000)
      current=await one.evaluate('Slop40.state.tick')
      expected=payload['stores'][V2]['phase40']['tick']
      return rejects and restored is not None and current==expected and len(payload['stores'])==4,{'tamperRejected':rejects,'restored':current,'expected':expected}
     await check('real four-store backup restore and tamper refusal',backup)
     async def quota():
      before=await one.evaluate('Slop40.state.tick')
      denied=await one.evaluate("""async()=>{const old=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='slopocalypse:fictional-internet:v2')throw new DOMException('full','QuotaExceededError');return old.call(this,k,v)};try{await Slop40.advance(1);return false}catch(e){return true}finally{Storage.prototype.setItem=old}}""")
      after=await one.evaluate('Slop40.state.tick')
      return denied and before==after,{'rejected':denied,'before':before,'after':after}
     await check('quota-failure atomic rollback',quota)
     async def keyboard():
      await one.locator('#s40-open').focus()
      await one.keyboard.press('Enter')
      await one.locator('#s40-dialog').wait_for(state='visible')
      close_focus=await one.evaluate('document.activeElement.id')
      names=await one.evaluate("""() => [...document.querySelectorAll('#s40-dialog button')].filter(x=>x.getClientRects().length&&!((x.getAttribute('aria-label')||x.innerText||'').trim())).length""")
      tabs=await one.locator('#s40-dialog [role=tab]').count()
      await one.keyboard.press('Escape')
      await one.locator('#s40-dialog').wait_for(state='hidden')
      focus=await one.evaluate('document.activeElement.id')
      return close_focus=='s40-close' and focus=='s40-open' and tabs==4 and names==0,{'focus':focus,'tabs':tabs,'unnamed':names}
     await check('native keyboard and accessible controls',keyboard)
     async def responsive():
      found=[]
      for width in (320,390,768,1440):
       await one.set_viewport_size({'width':width,'height':820})
       for path in ('singularity.html','slopos.html','slopnews.html','slopcoin.html','slopcourt.html'):
        await one.goto(base+'/'+path,wait_until='domcontentloaded')
        await one.wait_for_function('!!window.Slop40',timeout=15000)
        dims=await one.evaluate('() => [document.documentElement.scrollWidth,document.documentElement.clientWidth]')
        if dims[0]>dims[1]+1:found.append({'page':path,'width':width,'dimensions':dims})
      return not found,{'pages':5,'widths':4,'issues':found}
     await check('native original-page responsive smoke',responsive)
     record('uncaught browser exceptions',len(errors)==0,errors[:8])
    await context.close()
    await browser.close()
 except Exception as e:
  record('runner exception',False,traceback.format_exc()[-1000:])
 finally:server.shutdown();server.server_close()
 counts={x:sum(r['status']==x for r in results) for x in ('PASS','FAIL','UNAVAILABLE','BLOCKED')}
 output=pathlib.Path(a.output);output.parent.mkdir(parents=True,exist_ok=True)
 output.write_text(json.dumps({'browser':a.browser,'origin':base,'timestamp':datetime.now(timezone.utc).isoformat(),'counts':counts,'checks':results},indent=2))
 print('FINAL',counts,flush=True)
 return 1 if counts['FAIL'] else 2 if counts['BLOCKED'] or counts['UNAVAILABLE'] else 0
if __name__=='__main__':raise SystemExit(asyncio.run(main()))
