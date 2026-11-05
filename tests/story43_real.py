"""Original-site smoke: new case layer must not shadow 4.0 or the Discover panel."""
from __future__ import annotations
import argparse,http.server,socketserver,threading
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Handler(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
 def log_message(self,*a):pass
class Server(socketserver.ThreadingTCPServer):allow_reuse_address=True

def run(engine_name):
 s=Server(('127.0.0.1',0),Handler);threading.Thread(target=s.serve_forever,daemon=True).start()
 try:
  with sync_playwright() as pw:
   b=getattr(pw,engine_name).launch(headless=True)
   p=b.new_page(viewport={'width':375,'height':760})
   base=f'http://127.0.0.1:{s.server_address[1]}/'
   issues=[];p.on('pageerror',lambda e:issues.append(str(e)))
   p.goto(base+'index.html');p.wait_for_function('Boolean(window.Slop43&&window.Slop42Discovery&&window.Slop40)',timeout=25000)
   assert p.locator('.artifact .s43-card-play').count()>=10
   p.locator('.artifact .s43-card-play').first.click()
   assert p.locator('#s43-dialog').evaluate('(x)=>x.open')
   p.get_by_role('button',name='Label it explicitly fictional').click()
   p.wait_for_function('Object.keys(Slop43.state.items).length === 1')
   p.locator('#s43-close').click()
   p.locator('#s43-launch').click()
   p.locator('[data-s43-command=choose]').first.click()
   p.wait_for_function("Slop43.state.cases['index.html']?.stage === 1")
   p.locator('#s43-close').click()
   p.goto(base+'slopnews.html');p.wait_for_function('Boolean(window.Slop43&&window.Slop42Discovery)')
   assert p.evaluate("Slop43.state.cases['index.html'].stage") == 1
   p.locator('#s43-launch').click()
   p.get_by_role('button',name='44 cases').click()
   assert p.locator('.s43-entry').count()==44
   p.locator('#s43-close').click()
   # The outer s40 shell is a container, not the visible modal. Assert the
   # actual 4.0 dialog and its native close control, then restore the page.
   p.evaluate('window.Slop40.open()')
   p.locator('#s40-dialog').wait_for(state='visible',timeout=10000)
   assert p.get_by_role('button',name='Close Living Internet').is_visible()
   p.get_by_role('button',name='Close Living Internet').click()
   assert p.locator('#s40-dialog').is_hidden()
   assert p.evaluate('document.documentElement.scrollWidth-document.documentElement.clientWidth')<=4
   assert not issues,issues[:4]
   b.close()
   print(f'{engine_name}: original-site cross-page persistence, home cards, 44-case board, original 4.0 access PASS')
 finally:s.shutdown();s.server_close()
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--browser',required=True,choices=('chromium','firefox','webkit'));run(parser.parse_args().browser)