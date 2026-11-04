#!/usr/bin/env python3
"""Phase 4.0 draft PR hardening regression: real Chromium DOM, in-memory storage/locks.
Not a native same-origin Web Locks/BroadcastChannel, physical-device, or screen-reader test.
"""
from phase40_qualification import inline_html, SHIM
from playwright.sync_api import sync_playwright
import sys

checks=[]
def check(name,got,expected=True):
    ok=got==expected
    checks.append((name,ok))
    if not ok: print('FAIL',name,repr(got),'!=',repr(expected))

def exec_js(page,src):
    return page.evaluate('(src)=>eval(src)',src)

def run():
    errors=[]
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
        page=browser.new_page(viewport={'width':390,'height':820},reduced_motion='reduce')
        page.on('pageerror',lambda exc: errors.append(str(exc)))
        page.evaluate(SHIM)
        page.set_content(inline_html('singularity.html'),wait_until='domcontentloaded')
        page.wait_for_function('()=>Boolean(window.Slop40)')
        orig=page.evaluate('()=>({version:SlopWorld.state.version,credits:SlopWorld.state.credits,mails:SlopWorld.state.mails.length})')
        check('Old world version retained',orig['version'],2)
        page.locator('#s40-open').click()
        check('Launcher opens dialog',page.locator('#s40-dialog').is_visible())
        check('Focus enters dialog',page.evaluate('()=>document.activeElement.id'),'s40-close')
        check('Dialog makes main inert',page.evaluate('()=>document.querySelector("main").inert'))
        check('Launcher inert while dialog open',page.evaluate('()=>document.querySelector("#s40-open").inert'))
        check('Exactly four accessible tabs',page.locator('#s40-dialog [role="tab"]').count(),4)
        check('Tab panel points to selected tab',page.evaluate('()=>{const p=document.querySelector("#s40-view");return p.getAttribute("aria-labelledby")===document.querySelector("#s40-dialog [role=tab][aria-selected=true]").id}'))
        page.get_by_role('tab',name='Save Slots').click()
        page.locator('#s40-slot-name').fill('mid-edit checkpoint label')
        page.locator('#s40-slot-name').focus()
        page.keyboard.press('End')
        page.evaluate('()=>SlopWorld.announce("Legacy application update","External activity",{quiet:true})')
        check('External update preserves checkpoint draft',page.locator('#s40-slot-name').input_value(),'mid-edit checkpoint label')
        check('External update preserves field focus',page.evaluate('()=>document.activeElement.id'),'s40-slot-name')
        check('External update preserves end-of-text caret',page.evaluate('()=>document.activeElement.selectionStart'),len('mid-edit checkpoint label'))
        page.locator('#s40-seed').fill('draft-seed')
        page.evaluate('()=>SlopWorld.announce("Second external update","External activity",{quiet:true})')
        check('External update preserves seed draft',page.locator('#s40-seed').input_value(),'draft-seed')
        check('Seed form remains focused',page.evaluate('()=>document.activeElement.id'),'s40-seed')
        page.keyboard.press('Escape')
        check('Escape closes dialog',page.locator('#s40-dialog').is_hidden())
        check('Escape restores background',not page.evaluate('()=>document.querySelector("main").inert'))
        check('Escape restores launcher focus',page.evaluate('()=>document.activeElement.id'),'s40-open')
        # Save-slot seed restoration (the old runtime saved rng but omitted the seed).
        page.evaluate('()=>Slop40.saveSlot("original seed")')
        original=page.evaluate('()=>({seed:Slop40.state.seed,rng:Slop40.state.rng})')
        page.evaluate('()=>Slop40.setSeed("alternate-seed")')
        check('Seed may change before gameplay',page.evaluate('()=>Slop40.state.seed'),'alternate-seed')
        page.evaluate('()=>Slop40.loadSlot("original seed")')
        check('Checkpoint restores seed label',page.evaluate('()=>Slop40.state.seed'),original['seed'])
        check('Checkpoint restores random state',page.evaluate('()=>Slop40.state.rng'),original['rng'])
        # Old 4.0 snapshots lacked seed. They must continue to load, and a later
        # seed edit records their old seed so they remain reproducible.
        page.evaluate('()=>SlopWorld.mutate(s=>{delete s.phase40.slots[0].snapshot.seed;})')
        page.evaluate('()=>Slop40.setSeed("later-seed")')
        check('Old checkpoint migrated its seed when re-seeding',page.evaluate('()=>Slop40.state.slots[0].snapshot.seed'),original['seed'])
        page.evaluate('()=>Slop40.loadSlot("original seed")')
        check('Migrated checkpoint restores old seed',page.evaluate('()=>Slop40.state.seed'),original['seed'])
        page.evaluate('()=>Slop40.start("mango")')
        check('Changing seed after starting a story is rejected',page.evaluate('async()=>{try{await Slop40.setSeed("illegal");return false}catch(e){return /locked after/.test(e.message)}}'))
        check('Rejected seed does not mutate',page.evaluate('()=>Slop40.state.seed'),original['seed'])
        page.evaluate('()=>Slop40.choose("audit")')
        page.evaluate('()=>Slop40.choose("publish")')
        page.evaluate('()=>Slop40.choose("sue")')
        check('Mango trial reached',page.evaluate('()=>Slop40.state.campaigns.mango.ending'),'trial')
        check('First unique ending recorded',page.evaluate('()=>Slop40.state.campaigns.mango.endingsSeen.join(",")'),'trial')
        credits=page.evaluate('()=>SlopWorld.state.credits')
        page.evaluate('()=>Slop40.replay("mango")')
        page.evaluate('()=>Slop40.choose("hype")')
        page.evaluate('()=>Slop40.choose("pump")')
        page.evaluate('()=>Slop40.choose("brand")')
        check('Alternate ending reached',page.evaluate('()=>Slop40.state.campaigns.mango.ending'),'unicorn')
        check('Two unique endings preserved',page.evaluate('()=>Slop40.state.campaigns.mango.endingsSeen.sort().join(",")'),'trial,unicorn')
        check('Replay awards no repeated campaign credits',page.evaluate('()=>SlopWorld.state.credits'),credits)
        page.locator('#s40-open').click()
        page.get_by_role('tab',name='Campaigns').click()
        check('Discovered endings visible in story',page.locator('#s40-dialog .s40-endings li').count(),3)
        check('Discovered count visible',page.locator('#s40-dialog').inner_text().count('2 / 3')>=1)
        check('Story decisions have readable labels',page.locator('#s40-dialog').get_by_text('Host a founder livestream').count()>=1)
        page.evaluate('()=>Slop40.loadSlot("original seed")')
        check('Checkpoint does not erase earned ending discoveries',page.evaluate('()=>Slop40.state.campaigns.mango.endingsSeen.sort().join(",")'),'trial,unicorn')
        # Keyboard tab navigation and panel relationship.
        page.get_by_role('tab',name='Campaigns').focus()
        page.keyboard.press('ArrowRight')
        check('Tab arrow switches to Citizens',page.evaluate('()=>document.activeElement.id'),'s40-tab-people')
        check('Tabpanel follows selected tab',page.evaluate('()=>document.querySelector("#s40-view").getAttribute("aria-labelledby")'),'s40-tab-people')
        page.keyboard.press('Escape')
        # Persist through original backup and cross-page hydration.
        backup=page.evaluate('()=>SlopWorld32.exportPayload()')
        check('Unchanged 4-store backup format',backup.get('version')==2 and len(backup.get('stores',{}))==4)
        check('Backup validation',page.evaluate('(b)=>!!SlopWorld32.validateBackup(b)',backup))
        serialized=page.evaluate('()=>JSON.stringify(window.__slopTestStore)')
        follow=browser.new_page(viewport={'width':390,'height':820})
        follow.on('pageerror',lambda exc:errors.append('follow-up '+str(exc)))
        follow.evaluate(SHIM)
        follow.evaluate('(value)=>Object.assign(window.__slopTestStore,JSON.parse(value))',serialized)
        follow.set_content(inline_html('portal.html'),wait_until='domcontentloaded')
        follow.wait_for_function('()=>Boolean(window.Slop40)')
        check('Two discovered endings survive page navigation',follow.evaluate('()=>Slop40.state.campaigns.mango.endingsSeen.length'),2)
        check('Checkpoint seed survives page navigation',follow.evaluate('()=>Slop40.state.slots[0].snapshot.seed'),original['seed'])
        # World time cannot re-seed after simulation advances without a campaign.
        blank=browser.new_page();blank.on('pageerror',lambda exc:errors.append('blank '+str(exc)))
        blank.evaluate(SHIM);blank.set_content(inline_html('index.html'),wait_until='domcontentloaded')
        blank.wait_for_function('()=>Boolean(window.Slop40)')
        blank.evaluate('()=>Slop40.advance(1)')
        check('Changing seed after time advances rejected',blank.evaluate('async()=>{try{await Slop40.setSeed("after-tick");return false}catch(e){return /locked after/.test(e.message)}}'))
        check('Failed validation preserves tick',blank.evaluate('()=>Slop40.state.tick'),9)
        # Inject storage error to ensure a no-effect failed save.
        before=blank.evaluate('()=>({seed:Slop40.state.seed,tick:Slop40.state.tick,credits:SlopWorld.state.credits})')
        blank.evaluate('()=>{window.__denySave=true}')
        check('Quota failure rejected',blank.evaluate('async()=>{try{await Slop40.advance(1);return false}catch(e){return true}}'))
        blank.evaluate('()=>{window.__denySave=false}')
        after=blank.evaluate('()=>({seed:Slop40.state.seed,tick:Slop40.state.tick,credits:SlopWorld.state.credits})')
        check('Quota failure preserves state',after,before)
        check('No uncaught Chromium JavaScript errors',errors,[])
        blank.close();follow.close();browser.close()
    passed=sum(ok for _,ok in checks)
    print(f'SLOP4 hardening: {passed}/{len(checks)} PASS, page errors={len(errors)}')
    return passed==len(checks)

if __name__=='__main__':sys.exit(0 if run() else 1)
