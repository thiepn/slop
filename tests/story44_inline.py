"""Inline DOM acceptance for replay-dependent dossiers and searchable case board.
No HTTP navigation: this is an isolated browser test, not original-site acceptance.
"""
import argparse
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT = Path(__file__).resolve().parents[1]
BOOT = """() => {
 const disk = new Map();
 Object.defineProperty(window, 'localStorage', {configurable:true,value:{
  getItem:k=>disk.has(k)?disk.get(k):null,
  setItem:(k,v)=>disk.set(k,String(v)),
  removeItem:k=>disk.delete(k)
 }});
 window.SlopWorld={state:{phase6:{}},mutate(fn){
  let w;try{w=JSON.parse(localStorage.getItem('slopocalypse:fictional-internet:v2')||'null')||this.state;}
  catch(_){w=this.state;}
  fn(w);this.state=w;localStorage.setItem('slopocalypse:fictional-internet:v2',JSON.stringify(w));return true;
 }};
 window.SlopWorld32={exclusive:async fn=>fn()};
 window.Slop42Discovery={catalog:[{id:'local-card',title:'Local exhibit',
  page:'index.html',text:'A fictional assertion requiring independent evidence.'},
  {id:'market-card',title:'Market exhibit',page:'index.html',text:'Another fictional observation.'}],close(){}};
}"""
def run(name):
 with sync_playwright() as pw:
  browser=getattr(pw,name).launch(headless=True)
  page=browser.new_page(viewport={'width':375,'height':800})
  page.set_default_timeout(10000)
  errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content('<!doctype html><html><body><article class="s42-inspectable" data-s42-inspect="local-card"><h3>Fictional exhibit</h3><p>A claim requiring external verification.</p><button>Original inspect</button></article><article class="s42-inspectable" data-s42-inspect="market-card"><h3>Market exhibit</h3><p>Another item with a different purpose.</p></article></body></html>')
  page.evaluate(BOOT)
  page.add_style_tag(content=(ROOT/'s43.css').read_text())
  page.add_script_tag(content=(ROOT/'s43-cases.js').read_text())
  page.add_script_tag(content=(ROOT/'s43-play.js').read_text())
  page.wait_for_function('Boolean(window.Slop43)')
  assert page.locator('.s43-card-play').count()==2
  labels=page.locator('.s43-card-play').evaluate_all("(xs)=>xs.map(x=>x.getAttribute('aria-label'))")
  assert len(set(labels))==2 and 'Local exhibit' in labels[0] and 'Market exhibit' in labels[1],labels
  assert page.get_by_role('button',name='Original inspect').count()==1
  # Previously a delayed redraw after classifying an exhibit could replace a
  # freshly typed annotation before the save handler read its textarea.
  page.evaluate("Slop43.openExhibit({id:'local-card',title:'Local exhibit',text:'A fictional assertion requiring independent evidence.',page:'index.html'})")
  page.get_by_role('button',name='Challenge the claim').click()
  page.wait_for_function("Slop43.state.items['local-card']?.position==='challenge'")
  page.locator('#s43-exhibit-note').fill('Evidence status: not independently corroborated.')
  # A storage update must not erase an unsaved, focused annotation.
  page.evaluate("""() => window.dispatchEvent(new StorageEvent('storage',
    {key:'slopocalypse:fictional-internet:v2'}))""")
  assert page.locator('#s43-exhibit-note').input_value()=='Evidence status: not independently corroborated.'
  assert page.evaluate("document.activeElement.id==='s43-exhibit-note'")
  page.get_by_role('button',name='Save this observation').click()
  page.wait_for_function("Slop43.state.items['local-card']?.note?.startsWith('Evidence status:')")
  assert page.locator('#s43-exhibit-note').input_value().startswith('Evidence status:')
  page.locator('#s43-close').click()
  page.locator('#s43-launch').click()
  page.locator('[data-s43-command=choose]').first.focus()
  page.keyboard.press('Enter')
  assert page.evaluate("document.activeElement.closest('#s43-body') !== null"), "Keyboard focus escaped the case desk after a new scene"
  assert page.evaluate("Slop43.state.cases['index.html']?.stage===1"), "A rapid 1-stage case click was not saved immediately"
  correct=page.evaluate("Slop43.cases.find(c=>c.page==='index.html').correct")
  page.locator(f'[data-s43-command=answer][data-id="{correct}"]').click()
  assert page.evaluate("Slop43.state.cases['index.html']?.stage===2"), "A rapid 2-stage case click was not saved immediately"
  page.locator('[data-s43-command=publish]').click()
  assert page.evaluate("Slop43.state.cases['index.html']?.stage===3"), "A rapid 3-stage case click was not saved immediately"
  page.evaluate("""() => {
   const group=Slop43Cases.groups.find(g=>g.pages.includes('index.html'));
   SlopWorld.mutate(w=>{
    const s=w.phase6.s43;
    for(const p of group.pages)
     if(!s.cases[p])s.cases[p]={stage:3,choice:0,approach:'verify',auditCorrect:true,disposition:'publish',filedAt:'old'};
    s.departments[group.id]={decision:'publish',quality:'Previous review'};
    s.policy='Shared evidence standard';
   });
  }""")
  page.locator('[data-s43-command=replay]').click()
  page.wait_for_function("Slop43.state.cases['index.html']?.stage===0")
  assert page.evaluate("!Slop43Cases.groups.some(g=>g.pages.includes('index.html')&&Boolean(Slop43.state.departments[g.id]))")
  assert page.evaluate("Slop43.state.policy===null")
  page.locator('[data-s43-command=choose]').first.click()
  assert page.evaluate("Slop43.state.cases['index.html']?.stage===1"), "A rapid 1-stage case click was not saved immediately"
  page.locator(f'[data-s43-command=answer][data-id="{correct}"]').click()
  assert page.evaluate("Slop43.state.cases['index.html']?.stage===2"), "A rapid 2-stage case click was not saved immediately"
  page.locator('[data-s43-command=private]').click()
  assert page.evaluate("Slop43.state.cases['index.html']?.stage===3"), "A rapid 3-stage case click was not saved immediately"
  page.get_by_role('button',name='44 cases').click()
  page.locator('[data-s43-command=department]').first.click()
  page.locator('[data-s43-command=dept-choice][data-id$=review]').click()
  page.wait_for_function("Object.keys(Slop43.state.departments).length===1")
  page.locator('[data-s43-command=department]').first.click()
  page.locator('[data-s43-command=dept-choice][data-id$=restrict]').click()
  page.wait_for_function("Object.values(Slop43.state.departments)[0]?.decision==='restrict'")
  assert page.evaluate("Slop43.state.history.some(h=>h.kind==='Dossier revised')")
  page.locator('#s43-board-search').fill('index.html')
  assert page.locator('[data-s43-entry]:not([hidden])').count()>=1
  assert page.locator('[data-s43-entry][hidden]').count()>=1
  # History is prepended newest-first. A capped 180-event journal must keep
  # the newly filed replay event, not silently preserve only its oldest entries.
  page.evaluate("""() => SlopWorld.mutate(w => {
   w.phase6.s43.history=Array.from({length:180},(_,i)=>({
    kind:'Old fixture',title:'old-'+i,detail:'fixture',at:'2026-01-01T00:00:00Z'
   }));
  })""")
  page.locator('#s43-menu [data-s43-command=tab][data-id=mission]').click()
  page.locator('#s43-body [data-s43-command=replay]').click()
  page.wait_for_function("Slop43.state.history[0]?.kind==='Replay'")
  assert page.evaluate("Slop43.state.history.length===180"), 'History cap changed'
  assert page.evaluate("!Slop43.state.history.some(e=>e.title==='old-179')"), 'Newest entry replaced by oldest instead of trimming tail'
  assert page.evaluate('document.documentElement.scrollWidth-document.documentElement.clientWidth')<=4
  assert not errors,errors
  browser.close()
  print(f'{name}: replay invalidation, revised dossiers, search, native button preservation, 375px PASS (inline DOM)')
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--browser',required=True,choices=['chromium','firefox','webkit']);run(p.parse_args().browser)
