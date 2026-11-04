#!/usr/bin/env python3
"""Phase 4.0 all-pages Chromium in-memory responsive smoke checks.
Not a substitute for native same-origin, Firefox, WebKit, AT or real hardware.
Usage: python tests/phase40_responsive.py 0 11
"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright
from phase40_qualification import inline_html, SHIM, ROOT
files=sorted(p.name for p in ROOT.glob('*.html'))
first=int(sys.argv[1]) if len(sys.argv)>1 else 0
last=int(sys.argv[2]) if len(sys.argv)>2 else len(files)
checks=0;fail=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for name in files[first:last]:
  source=inline_html(name)
  for width in (320,390,768,1440):
   page=browser.new_page(viewport={'width':width,'height':850},reduced_motion='reduce')
   errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   try:
    page.evaluate(SHIM)
    page.set_content(source,wait_until='domcontentloaded',timeout=25000)
    page.wait_for_function('()=>!!window.Slop40 && !!document.querySelector("#s40-open")',timeout=15000)
    overflow=page.evaluate('()=>document.documentElement.scrollWidth>window.innerWidth')
    if overflow:
     details=page.evaluate("""() => ({width:innerWidth,scroll:document.documentElement.scrollWidth,offenders:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.right>innerWidth+1&&!['SCRIPT','STYLE'].includes(e.tagName)}).sort((a,b)=>b.getBoundingClientRect().right-a.getBoundingClientRect().right).slice(0,8).map(e=>({tag:e.tagName,cls:String(e.className).slice(0,90),text:(e.textContent||'').trim().slice(0,65),right:Math.round(e.getBoundingClientRect().right),width:Math.round(e.getBoundingClientRect().width)}))})""")
     fail.append((name,width,details))
    elif errors:fail.append((name,width,errors[:2]))
    else:checks+=1
   except Exception as exc:fail.append((name,width,str(exc)[:160]))
   finally:page.close()
 browser.close()
print('PASS',checks,'of',4*(last-first),'test viewport rendering checks')
if fail:print('FAIL',fail[:15])
sys.exit(1 if fail else 0)
