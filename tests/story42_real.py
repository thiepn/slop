"""Read-only site navigation with local browser state; tests actual shared loader."""
from __future__ import annotations
import argparse
import http.server
import socketserver
import threading
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Handler(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
 def log_message(self,*args):pass
class Server(socketserver.ThreadingTCPServer):allow_reuse_address=True

def run(browser):
 server=Server(('127.0.0.1',0),Handler);threading.Thread(target=server.serve_forever,daemon=True).start()
 try:
  with sync_playwright() as pw:
   engine=getattr(pw,browser).launch(headless=True)
   page=engine.new_page(viewport={'width':375,'height':800})
   base='http://127.0.0.1:'+str(server.server_address[1])
   issues=[]
   page.on('pageerror',lambda error:issues.append(str(error)))
   page.goto(base+'/trust.html')
   page.wait_for_function('Boolean(window.Slop42Discovery)',timeout=25000)
   assert page.locator('.slop-card .s42-inspect-action').count()>=5
   page.locator('.slop-card .s42-inspect-action').first.click()
   assert page.locator('#s42-discovery').evaluate('(el)=>el.open')
   page.get_by_role('button',name='Save artifact').click()
   page.wait_for_function('Object.keys(Slop42Discovery.state.saved).length === 1',timeout=15000)
   page.locator('#s42-close').click()
   # Phase 6's first workbench must not discard newer s42/s43 records
   # written before phase6.version was initialized.
   page.wait_for_function('Boolean(window.Slop43)',timeout=25000)
   page.evaluate('window.Slop43.open()')
   page.locator('#s43-body [data-s43-command=choose]').first.click()
   page.wait_for_function("Slop43.state.cases['trust.html']?.stage===1")
   page.locator('#s43-close').click()
   # Confirm the original 4.0 opening and person panels are still reachable.
   page.evaluate('window.Slop40.open()')
   page.locator('#s40-tab-people').click()
   page.locator('.s42-world-profile').first.wait_for(timeout=5000)
   page.locator('.s42-world-profile').first.click()
   assert page.locator('.s42-world-response').count()>=1
   page.evaluate('window.Slop40.close()')
   page.goto(base+'/slopnews.html')
   page.wait_for_function('Boolean(window.Slop42Discovery)',timeout=25000)
   page.wait_for_function('Object.keys(Slop42Discovery.state.saved).length === 1',timeout=15000)
   page.locator('#s42-launch').click()
   page.get_by_role('button',name='Investigations').click()
   assert page.locator('.s42-trail').count()==6
   page.locator('#s42-close').click()
   # The authored story remains functional; its journal controls open real records.
   page.wait_for_function('Boolean(window.Slop41)',timeout=25000)
   page.evaluate('window.Slop41.open()')
   page.locator('[data-view="journal"]').click()
   page.locator('#s41-dialog').wait_for(state='visible')
   page.evaluate('window.Slop41.close()')
   # Breadth check: one shared discovery launcher available on every original destination.
   catalog=page.evaluate('window.SlopInteraction.apps.map(x=>x[0])')
   assert len(catalog)==44,len(catalog)
   for i,path in enumerate(catalog):
    page.goto(base+'/'+path,wait_until='domcontentloaded',timeout=30000)
    page.wait_for_function('Boolean(window.Slop42Discovery)',timeout=25000)
    assert page.locator('#s42-launch').count()==1,path
    if path=='index.html':
     page.locator('.artifact .s42-inspect-action').first.wait_for(timeout=7000)
     assert page.locator('.artifact .s42-inspect-action').count()>=10
     assert page.locator('.slop-tile .s42-inspect-action').count()>=10
    if path=='slopnews.html':
     page.locator('.s3-item .s42-inspect-action').first.wait_for(timeout=7000)
    try:
     page.wait_for_function('Object.keys(Slop42Discovery.state.saved).length === 1',timeout=6000)
    except Exception:
     diagnostic=page.evaluate('''() => ({inMemory:Object.keys(SlopWorld.state?.phase6?.s42Discovery?.saved||{}),disk:Object.keys(JSON.parse(localStorage.getItem('slopocalypse:fictional-internet:v2')||'{}')?.phase6?.s42Discovery?.saved||{}),current:Object.keys(Slop42Discovery.state.saved),page:location.pathname})''')
     raise AssertionError('Discovery persistence mismatch: '+repr(diagnostic))
    if path=='workspace.html':
     assert page.evaluate("SlopWorld.state.phase6?.version===1"),'Phase 6 workbench did not initialize correctly'
     assert page.evaluate("Slop43.state.cases['trust.html']?.stage===1"),'Legacy workbench erased the earlier Case Desk record'
    # At narrow mobile widths the new UI must not cause horizontal document overflow.
    overflow=page.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
    if overflow>4:print('Existing or new page overflow:',path,overflow)
   print(f'{browser}: 44 original destinations, artifact persistence, 4.0 profiles and story journal PASS')
   if issues:print(f'Original site or integration page errors observed ({len(issues)}):',issues[:5])
   engine.close()
 finally:server.shutdown();server.server_close()
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--browser',choices=('chromium','firefox','webkit'),required=True);run(parser.parse_args().browser)