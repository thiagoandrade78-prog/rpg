from pathlib import Path
from playwright.sync_api import sync_playwright
import json
R=Path(__file__).resolve().parents[1];html=(R/'dist/ARENA_FILHOS_DA_AREIA_PC.html').read_text(); errors=[];requests=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 c=b.new_context(viewport={'width':1440,'height':1000});c.set_offline(True)
 page=c.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:requests.append(r.url))
 try:page.goto((R/'dist/ARENA_FILHOS_DA_AREIA_PC.html').as_uri(),timeout=4000)
 except Exception as e:
  print('file not available',str(e)[:160]);page.close();page=c.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:requests.append(r.url));page.evaluate("() => {const data={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k],clear:()=>{for(const k in data)delete data[k]}}});}")
  page.set_content(html,wait_until='load')
 page.wait_for_timeout(700);print('body',page.locator('body').inner_text()[:300])
 page.get_by_role('button',name='ENTRAR NO LUDUS',exact=True).click();page.get_by_role('button',name='Cultivo',exact=True).click()
 page.get_by_role('button',name='DESPERTAR MEU NÚCLEO').click();page.get_by_role('button',name='CONFIRMAR DESPERTAR').click();page.wait_for_timeout(2300)
 page.get_by_role('tab',name='Meditar',exact=True).click();page.get_by_role('button',name='MEDITAR · 30 SEGUNDOS',exact=True).click();page.wait_for_timeout(3000)
 page.screenshot(path=str(R/'dist/stage2-smoke.png'),full_page=True)
 print('save',page.evaluate("JSON.parse(localStorage.getItem('arena-save-v5')).cultivation"))
 print('errors',errors,'external',len([u for u in requests if u.startswith(('http:','https:'))]))
 b.close()
