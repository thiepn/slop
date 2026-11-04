import json,sys,time,traceback
from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'qa_evidence'/'phase10_replay_recovery.json'
LS="""() => {const m=new Map(),failures={};let limit=4000000;const ls={getItem:k=>m.get(k)??null,setItem:(k,v)=>{if(failures[k]>0){failures[k]--;throw new DOMException('Injected write failure','QuotaExceededError');}const value=String(v);let bytes=0;for(const [a,b] of m)if(a!==k)bytes+=new TextEncoder().encode(b).byteLength;if(bytes+new TextEncoder().encode(value).byteLength>limit)throw new DOMException('Local quota','QuotaExceededError');m.set(k,value)},removeItem:k=>m.delete(k),key:i=>[...m.keys()][i]??null,get length(){return m.size}};Object.defineProperty(window,'localStorage',{configurable:true,value:ls});window.__qa={m,failures,setLimit:n=>limit=n};} """

def html(name):
 soup=BeautifulSoup((ROOT/name).read_text(encoding='utf8'),'html.parser')
 for tag in soup.select('script[src]'):
  f=ROOT/tag['src']
  if f.exists():tag.string=f.read_text(encoding='utf8');tag.attrs.pop('src',None);tag.attrs.pop('defer',None)
 for tag in soup.select('link[rel="stylesheet"][href]'):
  f=ROOT/tag['href']
  if f.exists():s=soup.new_tag('style');s.string=f.read_text(encoding='utf8');tag.replace_with(s)
 return str(soup)

checks=[];errors=[]
def check(name,ok,details=None):
 checks.append({'name':name,'pass':bool(ok),'details':details});print(('PASS ' if ok else 'FAIL ')+name,flush=True)

with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 ctx=browser.new_context()
 def page(name='slopsearch.html',snapshot=None,width=1440):
  a=ctx.new_page();a.set_viewport_size({'width':width,'height':850})
  a.on('pageerror',lambda e:errors.append({'page':name,'error':str(e)}))
  a.evaluate(LS)
  if snapshot:a.evaluate('(x)=>{for(const [k,v] of Object.entries(x))window.__qa.m.set(k,v)}',snapshot)
  a.set_content(html(name),wait_until='domcontentloaded',timeout=60000);a.wait_for_timeout(110)
  return a
 a=page()
 first=a.evaluate('''async()=>{const w=SlopWorld32;const origin={id:'ancient-evidence',title:'Ancient evidence',type:'phase10.stress',influence:5};const one=await w.recordExternal(origin);for(let i=0;i<4105;i++)await w.recordExternal({id:'stress-10-'+i,title:'Stress '+i,type:'phase10.load',influence:0});const before=w.state.influence;const two=await w.recordExternal(origin);return {one,two,before,after:w.state.influence,exact:w.state.externalSeen.length,filterBytes:atob(w.state.externalFilter).length,ledger:w.state.events.length};}''')
 check('4105 new events do not replay an evicted old event',first['one'] is True and first['two'] is False and first['before']==first['after'],first)
 check('bounded readable ledger with 64-KiB replay filter',first['exact']==4096 and first['filterBytes']==65536 and first['ledger']<=160,first)
 backup=a.evaluate('SlopWorld32.exportPayload()')
 check('backup with replay filter validates and remains below size cap',bool(a.evaluate('(b)=>SlopWorld32.validateBackup(b).preview',backup)) and len(json.dumps(backup).encode())<3000000,{'backupBytes':len(json.dumps(backup).encode())})
 checkpoint=a.evaluate('Object.fromEntries(window.__qa.m)')
 a.close();b=page(snapshot=checkpoint)
 replay=b.evaluate('''async()=>{const w=SlopWorld32;const result=await w.recordExternal({id:'ancient-evidence',title:'Ancient evidence',type:'phase10.stress',influence:5});return {result,count:w.state.externalSeen.length,influence:w.state.influence};}''')
 check('reload keeps replay protection',replay['result'] is False and replay['influence']==first['after'],replay)
 # Verify failed filter write rolls back both in memory and on disk.
 failure=b.evaluate('''async()=>{const w=SlopWorld32;const key=w.storageKey;window.__qa.failures[key]=1;let failed=false;try{await w.recordExternal({id:'must-fail',title:'Rollback test',type:'phase10.fail'});}catch(e){failed=true;}return {failed,memory:w.state.externalSeen.includes('external:must-fail'),disk:JSON.parse(localStorage.getItem(key)).externalSeen.includes('external:must-fail')};}''')
 check('failed storage write cannot produce phantom replay acknowledgement',failure['failed'] and not failure['memory'] and not failure['disk'],failure)
 recovered=b.evaluate('''async()=>({accepted:await SlopWorld32.recordExternal({id:'must-fail',title:'Rollback test',type:'phase10.fail'}),seen:SlopWorld32.state.externalSeen.includes('external:must-fail')})''')
 check('failed event remains retryable',recovered['accepted'] and recovered['seen'],recovered)
 # Exact backup restore replaces later new event and preserves earlier markers.
 restore=b.evaluate('''async(bak)=>{const w=SlopWorld32;const p=await w.restoreBackup(bak);const duplicate=await w.recordExternal({id:'ancient-evidence',title:'Ancient',type:'phase10.stress'});const retry=await w.recordExternal({id:'must-fail',title:'Rollback test',type:'phase10.fail'});return {preview:p,duplicate,retry};}''',backup)
 check('backup roundtrip retains old event but discards later changes',restore['duplicate'] is False and restore['retry'] is True,restore)
 tamper=b.evaluate('''()=>{const x=SlopWorld32.exportPayload();x.stores[SlopWorld32.storageKey].influence+=1;try{SlopWorld32.validateBackup(x);return false}catch(_){return true}}''')
 check('checksum tampering rejected',tamper)
 # Test old Phase 9 state with no filter, preserving all explicit IDs and rewards.
 oldstate=dict(checkpoint)
 world=json.loads(oldstate['slopocalypse:world-engine:v32']);world.pop('externalFilter',None)
 world['externalSeen']=['external:phase9-old-claim'];world['seen']=['external:phase9-old-claim'];world['influence']=42
 oldstate['slopocalypse:world-engine:v32']=json.dumps(world,separators=(',',':'))
 b.close();c=page(snapshot=oldstate)
 upgrade=c.evaluate('''async()=>{const w=SlopWorld32;const a=await w.recordExternal({id:'phase9-old-claim',title:'Old phase9'});const b=await w.recordExternal({id:'phase10-new-claim',title:'New phase10'});return {old:a,new:b,hasFilter:w.state.externalFilter.length,credits:SlopWorld.state.credits,influence:w.state.influence};}''')
 check('Phase 9 ledger migrates without losing old acknowledgement or credits',upgrade['old'] is False and upgrade['new'] is True and upgrade['hasFilter']>80000 and upgrade['credits']==1200,upgrade)
 # Crash journal after deliberately partial import: simulate only a restart, not live browser rollback.
 pre=c.evaluate('Object.fromEntries(window.__qa.m)')
 k2='slopocalypse:fictional-internet:v2'; k3='slopocalypse:internet-collapse:v3'; k31='slopocalypse:interaction:v31';k32='slopocalypse:world-engine:v32';jk='slopocalypse:restore-transaction:v32'
 journ={'version':1,'before':{k:pre.get(k) for k in (k2,k3,k31,k32)},'created':'phase10-fixture'}
 crashed=dict(pre)
 crashed[jk]=json.dumps(journ)
 crashed[k2]='{"version":2,"credits":999999}'
 c.close();d=page(snapshot=crashed)
 after=d.evaluate('''()=>({credits:SlopWorld.state.credits,journal:localStorage.getItem('slopocalypse:restore-transaction:v32'),recovered:SlopWorld32.restoredJournalRecovered,stored:JSON.parse(localStorage.getItem('slopocalypse:fictional-internet:v2')).credits})''')
 check('interrupted restore journal rolls back on next load',after['recovered'] and after['journal'] is None and after['credits']==1200 and after['stored']==1200,after)
 # Near quota injection: should stop without persistent or in-memory mutation.
 quota=d.evaluate('''async()=>{const w=SlopWorld32;const data=window.__qa.m;let n=0;for(const v of data.values())n+=new TextEncoder().encode(v).byteLength;window.__qa.setLimit(n+4);let failed=false;try{await w.recordExternal({id:'quota-2026',title:'Stress',type:'phase10.fail'});}catch(_){failed=true;}return {failed,phantom:w.state.externalSeen.includes('external:quota-2026'),durable:JSON.parse(localStorage.getItem(w.storageKey)).externalSeen.includes('external:quota-2026'),storageBytes:n};}''')
 check('near-quota new event fails without phantom effects',quota['failed'] and not quota['phantom'] and not quota['durable'],quota)
 # Keyboard and accessibility semantics.
 d.keyboard.press('ControlOrMeta+k');d.wait_for_timeout(100)
 openstate=d.evaluate('''()=>{const p=document.querySelector('#s31-panel');return {visible:!!p&&!p.hidden,role:p?.getAttribute('role'),modal:p?.getAttribute('aria-modal'),focused:p?.contains(document.activeElement)}}''')
 d.keyboard.press('Escape')
 check('keyboard open, focus, and Escape dismissal',openstate['visible'] and openstate['role']=='dialog' and openstate['focused'] and d.evaluate('document.querySelector("#s31-panel").hidden'),openstate)
 client=ctx.new_cdp_session(d)
 ax=client.send('Accessibility.getFullAXTree')['nodes']
 roles={x.get('role',{}).get('value','') for x in ax}
 check('Chromium accessibility tree exposes named interactive elements',all(x in roles for x in ('button','link','heading')) and sum(bool(x.get('name',{}).get('value')) for x in ax)>20,{'roles':sorted(roles)[:20],'named':sum(bool(x.get('name',{}).get('value')) for x in ax)})
 d.close();browser.close()
result={'tests':checks,'passed':sum(i['pass'] for i in checks),'failed':sum(not i['pass'] for i in checks),'pageErrors':errors,'method':'Chromium real DOM + injected in-memory storage; NOT true native browser origin/Web Locks','browser':'/usr/bin/chromium'}
OUT.write_text(json.dumps(result,indent=2,ensure_ascii=False),encoding='utf8')
print('SUMMARY',result['passed'],'/',len(checks),'JS errors',len(errors))
if result['failed'] or errors:sys.exit(1)
