from pathlib import Path
import json
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--allow-file-access-from-files'])
 context=browser.new_context(viewport={'width':1366,'height':900},device_scale_factor=1)
 page=context.new_page();errors=[];network=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('request',lambda r:network.append(r.url[:150]) if r.url.startswith('http') else None)
 context.route('http://**',lambda route:route.abort());context.route('https://**',lambda route:route.abort())
 page.set_content((ROOT/'dist/ARENA_FILHOS_DA_AREIA_PC.html').read_text(),wait_until='load')
 context.set_offline(True)
 page.wait_for_timeout(1000)
 print('ERRORS',errors);print('BODY',page.locator('body').inner_text()[:3500]);print('BUTTONS',page.get_by_role('button').all_text_contents())
 page.screenshot(path=str(ROOT/'dist/pc-home.png'))
 print('IMAGES',page.evaluate('Array.from(document.images).map(i=>({width:i.naturalWidth,height:i.naturalHeight,ok:i.complete}))'))
 (ROOT/'dist/browser-smoke.json').write_text(json.dumps({'errors':errors,'network':network},indent=2))
 browser.close()
