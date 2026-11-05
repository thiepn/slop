#!/usr/bin/env python3
"""Actual SLOPOCALYPSE 4.0 origin, authored story and existing backup smoke.
Only isolated disposable Playwright context, no public deployment/user data.
This complements, does not replace, full original native regression tests.
"""
import argparse, re, os
from pathlib import Path
from threading import Thread
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
    def log_message(self,*a):pass

def run(browser_name):
    server=ThreadingHTTPServer(('127.0.0.1',0),Handler)
    Thread(target=server.serve_forever,daemon=True).start()
    url=f'http://127.0.0.1:{server.server_port}/slopos.html'
    try:
        with sync_playwright() as p:
            engine=getattr(p,browser_name)
            browser=engine.launch(headless=True,executable_path=os.getenv('CHROMIUM_BIN') or None if browser_name=='chromium' else None,args=['--no-sandbox'] if browser_name=='chromium' else [])
            context=browser.new_context(viewport={'width':390,'height':800})
            page=context.new_page(); errors=[]
            page.on('pageerror',lambda e: errors.append(str(e)))
            page.goto(url,wait_until='load',timeout=30000)
            page.wait_for_function('!!(window.Slop41&&window.Slop40&&window.SlopWorld32)',timeout=20000)
            results=page.evaluate('''async () => {
              const routes=[['mango','audit','publish','truth'],['cloud','listen','union','settle'],['election','fair','evidence','independent']];
              const out=[];
              for(const [name,...steps] of routes){
                await Slop40.start(name);
                for(const choice of steps)await Slop40.choose(choice);
                const state=Slop40.state.campaigns[name];
                if(state.status!=='completed'||state.decisions.length!==3)throw Error('Campaign not completed: '+name);
                out.push({name,ending:state.ending,proposal:state.decisions[2].option,approved:state.decisions[2].approved});
              }
              return out;
            }''')
            credits=page.evaluate('SlopWorld.state.credits')
            page.locator('#s41-launch').click()
            assert page.locator('#s41-dialog').is_visible(), 'Story modal failed to open'
            count=0
            while count<95:
                count+=1
                state=page.evaluate('''()=>{const r=Slop41.active;const c=Slop41.content[r.episode-1].scenes[r.step];return {id:c.id,type:c.type,completed:r.completed}}''')
                if state['completed']:break
                id=state['id'];typ=state['type']
                if typ=='campaign':page.get_by_role('button',name='Confirm authentic campaign progress').click()
                elif typ=='operator':page.get_by_role('button',name=re.compile('^Request documented assent')).click()
                elif typ=='final':page.get_by_role('button',name='Submit recorded review').click()
                elif id=='08-test':page.get_by_role('button',name='Decline prospective profiling').click()
                elif id=='08-consent':page.get_by_role('button',name='Decline further personal inference').click()
                elif id=='09-authority':page.get_by_role('button',name='Submit the independently qualified charter records').click()
                elif id=='09-select':page.get_by_role('button',name='Verified Internet').click()
                elif id=='09-qualify':page.get_by_role('button',name='Submit the complete safeguarded proposal').click()
                else:
                    buttons=page.locator('#s41-body button[data-action="commit"]')
                    assert buttons.count(), f'No story choice at {id}'
                    buttons.first.click()
                if count in (9,31,47):
                    page.reload(wait_until='load')
                    page.wait_for_function('!!window.Slop41')
                    page.locator('#s41-launch').click()
            else:raise AssertionError('Exceeded maximum story transitions')
            assert page.evaluate('Slop41.active.outcome')=='verified',page.evaluate('Slop41.active.outcome')
            assert page.evaluate('Slop41.active.consent')=='declined'
            assert page.evaluate('Object.keys(Slop41.active.bindings).length')==3
            assert page.evaluate('SlopWorld.state.credits')==credits,'Authored story must not mint or spend credits'
            assert page.evaluate('document.documentElement.scrollWidth-document.documentElement.clientWidth')<=1,'390px overflow'
            page.get_by_role('tab',name='Evidence journal').click()
            assert page.get_by_text('Bound campaign history').is_visible()
            page.get_by_role('button',name='Close story').click()
            assert not page.locator('#s41-dialog').is_visible()
            backup=page.evaluate('SlopWorld32.exportPayload()')
            key='slopocalypse:fictional-internet:v2'
            assert backup['stores'][key]['phase41']['version']==41
            assert backup['stores'][key]['phase41']['runs'][0]['completed']
            page.evaluate('Slop41.open()')
            page.get_by_role('tab',name='Story histories').click()
            page.get_by_role('button',name='Begin a new story run').click()
            assert page.evaluate('Slop41.active.episode')==1
            page.get_by_role('button',name='Close story').click()
            page.evaluate('async payload => await SlopWorld32.restoreBackup(payload)',backup)
            page.reload(wait_until='load')
            page.wait_for_function('!!window.Slop41')
            assert page.evaluate('Slop41.active.outcome')=='verified','Native existing backup failed to restore the narrative'
            assert page.evaluate('Slop41.active.consent')=='declined','Profiling refusal was lost in backup'
            assert not errors,'Browser JS exceptions: '+repr(errors)
            context.close();browser.close()
            print(f'PASS actual origin {browser_name}: campaigns={results}, story complete, reloads, backup restore, consent, no new credits, 390px')
    finally:
        server.shutdown()

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--browser',choices=['chromium','firefox','webkit'],default='chromium')
    run(parser.parse_args().browser)