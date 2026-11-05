"""PR-only read-only audit of inspectable-card actions on the original 44 pages.
Runs on a local HTTP origin in CI; never files gameplay decisions or spends credits.
"""
import argparse
import http.server
import socketserver
import threading
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

ROOT=Path(__file__).resolve().parents[1]
class Handler(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
 def log_message(self,*a):pass
class Server(socketserver.ThreadingTCPServer):
 allow_reuse_address=True

def run(name):
 server=Server(('127.0.0.1',0),Handler)
 threading.Thread(target=server.serve_forever,daemon=True).start()
 try:
  with sync_playwright() as pw:
   browser=getattr(pw,name).launch(headless=True)
   page=browser.new_page(viewport={'width':375,'height':800})
   page.set_default_timeout(12000)
   errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   base=f'http://127.0.0.1:{server.server_address[1]}/'
   page.goto(base+'portal.html')
   page.wait_for_function('Boolean(window.Slop42Discovery && window.Slop43 && window.SlopInteraction)',timeout=25000)
   routes=page.evaluate('window.SlopInteraction.apps.map(x=>x[0])')
   assert len(routes)==44 and len(set(routes))==44,routes
   opened=0;no_cards=[];keyboard_fallbacks=[]
   for route in routes:
    response=page.goto(base+route,wait_until='domcontentloaded',timeout=30000)
    assert response and response.status==200,route
    page.wait_for_function('Boolean(window.Slop42Discovery && window.Slop43)',timeout=25000)
    page.wait_for_function("""() => [...document.querySelectorAll('.s42-inspectable')]
      .every(c => c.querySelector(':scope > .s42-inspect-action') &&
       c.querySelector(':scope > .s43-card-play'))""",timeout=12000)
    counts=page.evaluate("""() => {
      const cards=[...document.querySelectorAll('.s42-inspectable')];
      return {cards:cards.length,
       inspect:document.querySelectorAll('.s42-inspect-action').length,
       play:document.querySelectorAll('.s43-card-play').length,
       unnamed:[...document.querySelectorAll('.s42-inspect-action,.s43-card-play')]
        .filter(b=>!(b.getAttribute('aria-label')||b.textContent.trim())).length};
    }""")
    assert counts['cards']==counts['inspect']==counts['play'],(route,counts)
    assert counts['unnamed']==0,(route,counts)
    # Prevent a false pass when dynamic s42/s43 enhancement has not hydrated.
    minima={'index.html':10,'portal.html':40,'trust.html':5,'slopnews.html':1}
    if route in minima:
     assert counts['cards']>=minima[route],(route,counts,'Missing expected inspectable content')
    if not counts['cards']:
     no_cards.append(route);continue
    inspect=page.locator('.s42-inspect-action:visible').first
    assert inspect.count(),(route,'No visible Inspect control')
    try:
     inspect.click(timeout=2500)
    except PWTimeout:
     diag=inspect.evaluate("e=>({animation:getComputedStyle(e).animationName,parentAnimation:getComputedStyle(e.parentElement).animationName,transform:getComputedStyle(e.parentElement).transform})")
     keyboard_fallbacks.append((route,'Inspect',diag))
     inspect.focus();page.keyboard.press('Enter')
    assert page.locator('#s42-discovery').evaluate('(d)=>d.open'),route
    assert page.locator('#s42-main').is_visible(),route
    page.locator('#s42-close').click()
    play=page.locator('.s43-card-play:visible').first
    assert play.count(),(route,'No visible Play case control')
    try:
     play.click(timeout=2500)
    except PWTimeout:
     diag=play.evaluate("e=>({animation:getComputedStyle(e).animationName,parentAnimation:getComputedStyle(e.parentElement).animationName,transform:getComputedStyle(e.parentElement).transform})")
     keyboard_fallbacks.append((route,'Play case',diag))
     play.focus();page.keyboard.press('Enter')
    assert page.locator('#s43-dialog').evaluate('(d)=>d.open'),route
    assert page.locator('#s43-body').is_visible(),route
    page.locator('#s43-close').click()
    opened+=1
   assert not errors,errors[:10]
   browser.close()
   print(f'{name}: PASS 44 original pages, {opened} working Inspect/Play pairs, no-card pages={no_cards}; keyboard alternatives on animated controls={keyboard_fallbacks}',flush=True)
 finally:
  server.shutdown();server.server_close()

if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--browser',choices=('chromium','firefox','webkit'),required=True)
 run(p.parse_args().browser)
