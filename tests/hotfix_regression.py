#!/usr/bin/env python3
"""Deterministic in-memory regression for v2 asynchronous earnings and durable mission claim marks.
Native same-origin races MUST be qualified by tests/native_qualification.py in GitHub Actions.
"""
from playwright.sync_api import sync_playwright
from phase40_qualification import SHIM, inline_html
V2='slopocalypse:fictional-internet:v2'; V32='slopocalypse:world-engine:v32'; UI='slopocalypse:interaction:v31'
checks=[]; errors=[]
def check(title, yes):
    checks.append((title, bool(yes)))
    if not yes:print('FAIL',title,flush=True)
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':390,'height':820},reduced_motion='reduce')
    page.on('pageerror',lambda exc:errors.append(str(exc)))
    page.evaluate(SHIM)
    page.set_content(inline_html('slopos.html'),wait_until='domcontentloaded')
    page.wait_for_function('!!window.SlopWorld && !!window.SlopWorld32')
    report=page.evaluate('''async()=>{
      const out={},S2='slopocalypse:fictional-internet:v2',S32='slopocalypse:world-engine:v32',S31='slopocalypse:interaction:v31';
      const W=SlopWorld,X=SlopWorld32;
      const before=W.state.credits;
      const one=await W.earn(7,'hotfix unique A'),two=await W.earn(7,'hotfix unique B');
      out.awards=one&&two&&JSON.parse(localStorage.getItem(S2)).credits===before+14;
      out.asyncPath=typeof W.earn(7,'hotfix unique C')?.then==='function';
      await Promise.resolve();
      const once=await X.claimMission('hotfix-mission',37,()=>true);
      const again=await X.claimMission('hotfix-mission',37,()=>true);
      out.claim=once.ok===true&&again.ok===false&&X.state.rewards.claimed.filter(x=>x==='hotfix-mission').length===1;
      const n=JSON.parse(localStorage.getItem(S2)),beforeDuplicate=n.credits;
      out.marker=n.rewardClaimsV32?.['hotfix-mission']===37;
      // A lost/stale v32 record and stale Control Center must NOT replay a paid claim.
      const ledger=JSON.parse(localStorage.getItem(S32));ledger.rewards.claimed=ledger.rewards.claimed.filter(x=>x!=='hotfix-mission');localStorage.setItem(S32,JSON.stringify(ledger));
      const ui=JSON.parse(localStorage.getItem(S31));ui.claimed=ui.claimed.filter(x=>x!=='hotfix-mission');localStorage.setItem(S31,JSON.stringify(ui));
      const stale=await X.claimMission('hotfix-mission',37,()=>true);
      out.stale=!stale.ok&&JSON.parse(localStorage.getItem(S2)).credits===beforeDuplicate;
      const backup=X.exportPayload();
      out.backup=backup.version===2&&Object.keys(backup.stores).length===4&&X.validateBackup(backup).preview.credits===beforeDuplicate;
      out.backupMarker=backup.stores[S2].rewardClaimsV32['hotfix-mission']===37;
      // A stale tab can have a higher *cached* revision than the durable
      // wallet after another tab has written; rebase must still read disk.
      const disk=JSON.parse(localStorage.getItem(S2));
      W.state.revision=disk.revision+100;
      W.state.credits=1;
      const revived=await W.earn(7,'hotfix stale revision');
      out.durableRebase=revived===true&&JSON.parse(localStorage.getItem(S2)).credits===disk.credits+7;
      const beforeQuota=JSON.parse(localStorage.getItem(S2)).credits;
      const original=Storage.prototype.setItem;
      // In-memory fake localStorage: override its instance method rather than Storage prototype.
      const fake=window.localStorage, prior=fake.setItem;
      fake.setItem=(k,v)=>{if(k===S2)throw new Error('test quota');return prior(k,v)};
      const quota=await W.earn(9,'hotfix quota failure');
      fake.setItem=prior;
      out.quota=quota===false&&JSON.parse(localStorage.getItem(S2)).credits===beforeQuota;
      return out;
    }''')
    for key,val in report.items():check(key,val)
    check('no JS exceptions',not errors)
    browser.close()
print('HOTFIX:',sum(x[1] for x in checks),'/',len(checks),'PASS',flush=True)
if errors:print('JS ERRORS',errors[:4])
raise SystemExit(0 if all(v for _,v in checks) else 1)