from pathlib import Path
import json
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];HTML=(ROOT/'dist/ARENA_FILHOS_DA_AREIA_PC.html').read_text();result=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height,dpi in [(1280,720,1),(1920,1080,1),(390,844,2)]:
  ctx=browser.new_context(viewport={'width':width,'height':height},device_scale_factor=dpi);ctx.set_offline(True);pg=ctx.new_page();errors=[];pg.on('pageerror',lambda e:errors.append(str(e)));pg.set_default_timeout(5000)
  pg.evaluate("""()=>{const m={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>m[k]??null,setItem:(k,v)=>m[k]=String(v)},configurable:true});}""")
  pg.set_content(HTML,wait_until='load');pg.wait_for_timeout(200)
  pg.get_by_role('button',name='LUTA RÁPIDA',exact=True).click();pg.wait_for_timeout(400)
  geo=pg.locator('canvas').evaluate('(c)=>({cw:c.width,ch:c.height,width:c.clientWidth,height:c.clientHeight})')
  over=pg.evaluate('document.documentElement.scrollWidth>innerWidth')
  result.append({'width':width,'height':height,'dpi':dpi,'canvas':geo,'horizontalOverflow':over,'errors':errors,'passed':not over and not errors and geo['height']>150 and geo['width']>300})
  pg.screenshot(path=str(ROOT/f'dist/resolution-{width}x{height}.png'));ctx.close()
 browser.close()
(ROOT/'dist/resolution-tests.json').write_text(json.dumps(result,indent=2));print(json.dumps(result,indent=2))
