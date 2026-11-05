"""Cross-browser interactive card, artifact, story journal and native-action acceptance."""
from __future__ import annotations
import argparse
import shutil
import tempfile
import http.server
import socketserver
import threading
from pathlib import Path
from playwright.sync_api import sync_playwright

SOURCE=Path(__file__).resolve().parents[1]
ROOT=None
PAGE='''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/s42.css"></head><body>
<main><article class="slop-card" id="exhibit"><h3>Experimental claim</h3><p>A fictional exhibit makes an unsupported claim about synthetic progress.</p></article>
<article class="slop-card" id="native"><h3>Native link and action</h3><p>Controls must continue working.</p><button onclick="window.nativeClicks++">Original action</button><a href="/trust.html">Original link</a></article>
<article class="slop-card" id="second"><h3>Second observation</h3><p>Another claim is presented in the same fictional publication.</p></article></main>
<script>window.nativeClicks=0;let internal=JSON.parse(localStorage.getItem('slopocalypse:fictional-internet:v2')||'{"version":2,"phase6":{}}');window.SlopWorld={get state(){return internal},mutate(fn){fn(internal);localStorage.setItem('slopocalypse:fictional-internet:v2',JSON.stringify(internal));window.dispatchEvent(new CustomEvent('slop:world'));return true}};window.SlopWorld32={exclusive:async fn=>fn()};window.SlopInteraction={get apps(){return [['slopnews.html','SlopNews','','Fictional headlines'],['lab.html','Research Lab','','Fictional science'],['slopwiki.html','SlopWiki','','Fictional consensus'],['trust.html','Trust Center','','Fictional assurance']]}};window.Slop41={get active(){return {artifacts:{'DOE-01':{source:'fictional',status:'obtained',privacy:'public'}},bindings:{},choices:{'03-method':'records'},review:{attempts:[],assents:{}}}}};</script><script src="/s42-discovery.js"></script>
</body></html>'''

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,directory=str(ROOT),**kwargs)
    def log_message(self,*args):pass

class Server(socketserver.ThreadingTCPServer):allow_reuse_address=True

def run(browser_name=None):
    global ROOT
    temp=tempfile.TemporaryDirectory(prefix='s42-fixture-')
    ROOT=Path(temp.name)
    for name in ('s42-discovery.js','s42.css'):
        shutil.copyfile(SOURCE/name, ROOT/name)
    for path in ('slopnews.html','lab.html','slopwiki.html','trust.html'):
        (ROOT/path).write_text(PAGE)
    server=Server(('127.0.0.1',0),Handler)
    t=threading.Thread(target=server.serve_forever,daemon=True);t.start()
    try:
        with sync_playwright() as playwright:
            for kind in ([browser_name] if browser_name else ['chromium','firefox','webkit']):
                browser=getattr(playwright,kind).launch(headless=True)
                page=browser.new_page(viewport={'width':375,'height':800})
                exceptions=[]
                page.on('pageerror',lambda err: exceptions.append(str(err)))
                base=f'http://127.0.0.1:{server.server_address[1]}'
                page.goto(base+'/slopnews.html')
                assert page.locator('.s42-inspect-action').count()==3
                page.get_by_role('button',name='Original action').click()
                assert page.evaluate('nativeClicks')==1
                assert page.locator('#s42-discovery').evaluate('(el)=>el.open') is False
                page.locator('#exhibit').click(position={'x':25,'y':35})
                assert page.locator('#s42-discovery').evaluate('(el)=>el.open')
                page.locator('#s42-main').get_by_role('button',name='Save artifact').click()
                assert page.evaluate('Object.keys(Slop42Discovery.state.saved).length')==1
                page.locator('#s42-note').fill('Needs independent replication')
                page.get_by_role('button',name='Save annotation').click()
                assert page.evaluate('Object.values(Slop42Discovery.state.saved)[0].note')=='Needs independent replication'
                page.get_by_role('button',name='Add to comparison').click()
                assert page.evaluate('Slop42Discovery.state.compare.length')==1
                page.locator('#s42-close').click()
                page.locator('#second .s42-inspect-action').click()
                page.get_by_role('button',name='Save artifact').click()
                page.get_by_role('button',name='Add to comparison').click()
                page.get_by_role('button',name='Compare (2)').click()
                assert page.locator('.s42-compare article').count()==2
                page.get_by_role('button',name='Investigations').click()
                assert page.locator('.s42-trail').count()==6
                page.get_by_role('button',name='All apps').click()
                assert page.get_by_role('link',name='Open').count()==4
                page.locator('#s42-close').click()
                # A saved artifact must survive normal navigation to another app.
                for dest in ('lab.html','slopwiki.html','trust.html'):
                    page.goto(base+'/'+dest)
                    page.locator('#exhibit .s42-inspect-action').click()
                    page.get_by_role('button',name='Save artifact').click()
                    page.locator('#s42-close').click()
                page.locator('#s42-launch').click()
                page.get_by_role('button',name='Investigations').click()
                section=page.locator('.s42-trail').filter(has=page.get_by_role('heading',name='Follow the evidence'))
                assert section.get_by_role('button',name='File documented finding').count()==1
                section.get_by_role('button',name='File documented finding').click()
                assert page.evaluate('Boolean(Slop42Discovery.state.reports.evidence)')
                assert not exceptions,exceptions
                print(f'{kind}: all card, native-action, shelf, comparison, cross-app and report checks PASS')
                browser.close()
    finally:
        server.shutdown();server.server_close()
        temp.cleanup()
if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--browser',choices=('chromium','firefox','webkit'))
    run(parser.parse_args().browser)