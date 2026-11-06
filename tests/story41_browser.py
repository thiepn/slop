#!/usr/bin/env python3
"""Native Chromium acceptance for the additive authored-story controls.
The fixture is intentionally isolated from real 4.0 data and cannot establish
native regressions on the actual 44-page site; those need separate acceptance.
"""
from pathlib import Path
from threading import Thread
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
import os
import re
ROOT=Path(__file__).resolve().parents[1]
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
    def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),Handler)
Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/tests/story41_fixture.html'
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path=os.getenv('CHROMIUM_BIN') or None,args=['--no-sandbox'])
  context=browser.new_context(viewport={'width':390,'height':800})
  page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(url);page.locator('#s41-launch').click();assert page.locator('#s41-dialog').is_visible()
  assert 'EP 01' in page.locator('.s41-progress').inner_text()
  count=0
  while count<90:
   count+=1
   state=page.evaluate('''() => {const r=Slop41.active;const c=Slop41.content[r.episode-1].scenes[r.step];return {id:c.id,type:c.type,completed:r.completed,operator:r.review.position,episode:r.episode}}''')
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
    if buttons.count()==0:raise AssertionError('No choice for '+id)
    buttons.first.click()
   page.wait_for_timeout(55)
   if count in (8,28):
    page.reload();page.locator('#s41-launch').click()
  else:raise AssertionError('Story could not complete in bounded steps')
  ending=page.evaluate('Slop41.active.outcome');assert ending=='verified',ending
  assert page.evaluate('Slop41.active.consent')=='declined'
  assert page.evaluate('Object.keys(Slop41.active.bindings).length')==3
  assert page.evaluate('Slop41.active.events.length')>30
  assert not errors,errors
  width=page.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
  assert width<=1,'Mobile horizontal overflow: '+str(width)
  page.get_by_role('tab',name='Evidence journal').click()
  assert page.get_by_text('Bound campaign history').is_visible()
  page.get_by_role('button',name='Close story').click()
  assert not page.locator('#s41-dialog').is_visible()
  context.close();browser.close()
  print('PASS native Chromium: 9 episodes, persistence, consent, final ratification, 390px layout, modal close')
finally:server.shutdown()