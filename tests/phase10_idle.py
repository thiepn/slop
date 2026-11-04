import time,json
from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
soup=BeautifulSoup((root/'slopos.html').read_text(),'html.parser')
for css in soup.select('link[rel=stylesheet][href]'):
 f=root/css['href'];
 if f.is_file():t=soup.new_tag('style');t.string=f.read_text();css.replace_with(t)
for script in soup.select('script[src]'):
 f=root/script['src'];
 if f.is_file():script.string=f.read_text();script.attrs.pop('src',None);script.attrs.pop('defer',None)
ls='''() => {const m=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}});window.__phase10=m;}'''
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage']);tab=browser.new_page()
 err=[];tab.on('pageerror',lambda e:err.append(str(e)));tab.evaluate(ls)
 tab.set_content(str(soup),wait_until='domcontentloaded');tab.wait_for_timeout(200)
 saved=tab.evaluate('''async()=>{let w=SlopWorld32;let ok=await w.recordExternal({id:'idle-check',title:'Idle check',type:'phase10.idle'});return {ok,revision:w.state.revision,encoded:w.state.externalFilter.length}}''')
 t=time.monotonic();tab.wait_for_timeout(30000)
 after=tab.evaluate('''async()=>{const w=SlopWorld32;const duplicate=await w.recordExternal({id:'idle-check',title:'Idle check',type:'phase10.idle'});const next=await w.recordExternal({id:'idle-check-next',title:'After idle',type:'phase10.idle'});return {duplicate,next,revision:w.state.revision}}''')
 seconds=round(time.monotonic()-t,1)
 result={'method':'Chromium DOM in-memory storage, tab remained open during real wait; NOT real HTTP-origin native tabs','idleSeconds':seconds,'before':saved,'after':after,'errors':err,'pass':saved['ok'] and after['duplicate'] is False and after['next'] is True and not err}
 (root/'qa_evidence'/'phase10_idle.json').write_text(json.dumps(result,indent=2))
 print(json.dumps(result,indent=2),flush=True)
 browser.close()
 assert result['pass']
