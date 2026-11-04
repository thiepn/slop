import asyncio,json,time,traceback
from pathlib import Path
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'qa_evidence'/'phase10_pages.json'
LS="""() => {const m=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),key:i=>[...m.keys()][i],get length(){return m.size}}});}"""
def make(name):
 soup=BeautifulSoup((ROOT/name).read_text(encoding='utf8'),'html.parser')
 for tag in soup.select('script[src]'):
  f=ROOT/tag['src']
  if f.is_file():tag.string=f.read_text(encoding='utf8');tag.attrs.pop('src',None);tag.attrs.pop('defer',None)
 for tag in soup.select('link[rel="stylesheet"][href]'):
  f=ROOT/tag['href']
  if f.is_file():s=soup.new_tag('style');s.string=f.read_text(encoding='utf8');tag.replace_with(s)
 return str(soup)
async def main():
 pages=sorted(x.name for x in ROOT.glob('*.html'))
 results=[];start=time.monotonic();sem=asyncio.Semaphore(4)
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  async def check_one(name):
   async with sem:
    tab=await browser.new_page(viewport={'width':1440,'height':900});errs=[]
    tab.on('pageerror',lambda e:errs.append(str(e)))
    try:
     await tab.evaluate(LS)
     await tab.set_content(make(name),wait_until='domcontentloaded',timeout=30000)
     await tab.wait_for_timeout(65)
     for width in (320,390,768,1440):
      await tab.set_viewport_size({'width':width,'height':900})
      await tab.wait_for_timeout(35)
      metrics=await tab.evaluate('''() => ({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,world:!!window.SlopWorld32,control:!!document.querySelector('#s31-bar'),title:document.title})''')
      results.append({'page':name,'width':width,'ok':metrics['scroll']<=metrics['client']+2 and metrics['world'] and metrics['control'] and not errs,'metrics':metrics,'errors':errs[:]})
    except Exception as e:
     results.append({'page':name,'width':0,'ok':False,'error':str(e)[:400]})
    finally:
     await tab.close()
  await asyncio.gather(*(check_one(x) for x in pages))
  await browser.close()
 data={'browser':'/usr/bin/chromium','method':'Chromium DOM with in-memory localStorage; NOT native HTTP-origin','pages':len(pages),'widths':[320,390,768,1440],'passed':sum(t['ok'] for t in results),'total':len(results),'errors':[r for r in results if not r['ok']],'durationSeconds':round(time.monotonic()-start,2)}
 OUT.write_text(json.dumps(data,indent=2),encoding='utf8')
 print('RESULT',data['passed'],'/',data['total'],'duration',data['durationSeconds'],'errors',data['errors'][:5],flush=True)
 assert data['passed']==176 and data['total']==176
asyncio.run(main())
