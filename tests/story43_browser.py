"""Real-browser deterministic acceptance of original 44-page local micro-adventures.
This fixture deliberately has zero network APIs and no original wallet/test state.
"""
import argparse, http.server, socketserver, tempfile, shutil, pathlib, re, threading
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]
SRC=ROOT/'s43-cases.js'
PAGES=re.findall(r"^C\('([^']+\.html)'",SRC.read_text(),flags=re.M)
HTML='''<!doctype html><meta charset="utf-8"><title>Independent case fixture</title>
<style>body{background:#172525;color:white;font:16px system-ui} .s42-inspectable{padding:15px;border:1px solid green;margin:10px;max-width:400px}</style>
<div class="s42-inspectable" data-s42-inspect="fixture-evidence"><h3>Documented exhibit</h3><p>A fictional document may contain unsupported claims.</p><button class="s42-inspect-action">Inspect</button></div>
<script>
window.SlopWorld={state:{phase6:{}},mutate(fn){try{const disk=JSON.parse(localStorage.getItem('slopocalypse:fictional-internet:v2')||'null');if(disk)this.state=disk;}catch(_){}fn(this.state);localStorage.setItem('slopocalypse:fictional-internet:v2',JSON.stringify(this.state));return true;}};
window.SlopWorld32={exclusive:async(fn)=>fn()};
window.Slop42Discovery={catalog:[{id:'fixture-evidence',title:'Documented exhibit',text:'A fictional document may contain unsupported claims.',page:location.pathname.split('/').pop()}],close(){}};
</script><script src="s43-cases.js"></script><script src="s43-play.js"></script><link rel="stylesheet" href="s43.css">'''
class Quiet(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
 def log_message(self,*args):pass
class Server(socketserver.ThreadingTCPServer):allow_reuse_address=True

def run(browser_name):
 root=ROOT
 # Generate the fixture pages in a temporary standalone subdirectory and serve all assets from ROOT.
 folder=root/'_story43_fixture'
 folder.mkdir(exist_ok=True)
 try:
  for p in PAGES: (folder/p).write_text(HTML.replace('src="s43-', 'src="../s43-').replace('href="s43.css"','href="../s43.css"'))
  server=Server(('127.0.0.1',0),Quiet);threading.Thread(target=server.serve_forever,daemon=True).start()
  try:
   with sync_playwright() as pw:
    launch={'headless':True}
    if browser_name=='chromium' and pathlib.Path('/usr/bin/chromium').exists():
     launch.update(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    browser=getattr(pw,browser_name).launch(**launch)
    page=browser.new_page(viewport={'width':375,'height':760})
    url=f'http://127.0.0.1:{server.server_address[1]}/_story43_fixture/'
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(url+'index.html');page.wait_for_function('Boolean(window.Slop43)')
    assert page.locator('.s43-card-play').count()==1
    page.locator('.s43-card-play').click();assert page.locator('#s43-dialog').evaluate('(x)=>x.open')
    page.get_by_role('button',name='Challenge the claim').click()
    page.wait_for_function("Slop43.state.items['fixture-evidence']?.position === 'challenge'")
    page.locator('#s43-exhibit-note').fill('A fictional source is not independently corroborated.')
    page.get_by_role('button',name='Save this observation').click()
    page.wait_for_function("Slop43.state.items['fixture-evidence']?.note?.startsWith('A fictional source')")
    page.locator('#s43-close').click()
    for idx,p in enumerate(PAGES):
     page.goto(url+p)
     page.wait_for_function('Boolean(window.Slop43)')
     page.locator('#s43-launch').click()
     page.locator('#s43-body [data-s43-command=choose]').first.click()
     page.wait_for_function("Slop43.state.cases[location.pathname.split('/').pop()]?.stage === 1")
     page.locator('#s43-body [data-s43-command=answer]').first.click()
     page.wait_for_function("Slop43.state.cases[location.pathname.split('/').pop()]?.stage === 2")
     page.locator('#s43-body [data-s43-command=publish]').click()
     page.wait_for_function("Slop43.state.cases[location.pathname.split('/').pop()]?.stage === 3")
     page.locator('#s43-close').click()
    page.goto(url+'index.html');page.wait_for_function('Boolean(window.Slop43)')
    assert page.evaluate('Slop43.progress.done')==44
    page.locator('#s43-launch').click();page.locator('[data-s43-command=tab][data-id=board]').click()
    assert page.locator('[data-s43-command=department]').count()==11
    for n in range(11):
     # After filing a dossier, its Review/revise action remains available.
     # Select an *unfiled* department rather than revisiting the first filed one.
     assert page.get_by_role('button',name='Convene department review').count() == 11-n
     page.get_by_role('button',name='Convene department review').first.click()
     page.locator('[data-s43-command=dept-choice]').first.click()
     page.wait_for_function('(n)=>Object.keys(Slop43.state.departments).length === n',arg=n+1)
    assert page.locator('[data-s43-command=policy]').count()==1
    page.locator('[data-s43-command=policy]').click()
    page.get_by_role('button',name='Shared evidence standard').click()
    page.wait_for_function('Slop43.state.policy === "Shared evidence standard"')
    assert not errors,errors[:5]
    assert page.evaluate('document.documentElement.scrollWidth-document.documentElement.clientWidth')<=4
    browser.close()
    print(f'{browser_name}: 44 missions, 11 department dossiers, card interaction, annotations, offline saves, final advisory PASS')
  finally:server.shutdown();server.server_close()
 finally:
  for p in PAGES:(folder/p).unlink(missing_ok=True)
  folder.rmdir()
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--browser',choices=('chromium','firefox','webkit'),required=True);args=p.parse_args();run(args.browser)