from pathlib import Path
from playwright.sync_api import sync_playwright
import subprocess,json,re
R=Path(__file__).resolve().parents[1];O=R/'dist';HTML=(O/'ARENA_FILHOS_DA_AREIA_PC.html').read_text();NOW=1789756800000
FIX=json.loads(subprocess.check_output(['node','-e',f"""
const {{Save:V,Expansion:X}}=require('./dist/core-test.cjs'),t={NOW};
let r=X.settle(X.awaken(V.fresh(t-1000,'browser-stage2'),t-1000),t).save;r.cultivation.essence=12000;r.character.gold=1000;
let o=JSON.parse(JSON.stringify(r));o.meta.createdAt=t-14*3600000;o.cultivation.timestamps.createdAt=t-14*3600000;o.cultivation.core.awakenedAt=t-14*3600000;o.cultivation.flow.enabledAt=t-14*3600000;o.cultivation.timestamps.offlineAccrualCursor=t-13*3600000;o.cultivation.timestamps.lastActiveAt=t-13*3600000;o.cultivation.essence=0;
let c=JSON.parse(JSON.stringify(r));c.cultivation.timestamps.offlineAccrualCursor=t+3600000;
console.log(JSON.stringify({{rich:r,code:V.encode(r),offline:o,expected:X.settle(o,t).save.cultivation.essence,clock:c}}));"""],cwd=R,text=True))
results=[];errors=[];requests=[]
def check(n,ok,detail=None):
 results.append({'name':n,'passed':bool(ok),'detail':detail});print(n,bool(ok),flush=True)
 if not ok:raise AssertionError(n+': '+str(detail))
SETUP="""(a)=>{let d=a.store;window.__testStore=d;window.__shift=0;Date.now=()=>a.now+window.__shift;Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>d[k]??null,setItem:(k,v)=>{if(window.__quota)throw Error('quota');d[k]=String(v)},removeItem:k=>delete d[k],clear:()=>{for(let k in d)delete d[k]}}});}"""
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 ctx=browser.new_context(viewport={'width':1440,'height':1040},accept_downloads=True);ctx.set_offline(True);ctx.route('**/*',lambda r:r.abort())
 def boot(store=None,size=None):
  p=ctx.new_page()
  if size:p.set_viewport_size(size)
  p.on('pageerror',lambda e:errors.append(str(e)));p.on('request',lambda r:requests.append(r.url) if r.url.startswith(('http:','https:')) else None)
  p.evaluate(SETUP,{'store':store or {},'now':NOW});p.set_content(HTML,wait_until='load');p.set_default_timeout(7000);p.wait_for_timeout(400);return p
 def game(p):return p.evaluate("JSON.parse(localStorage.getItem('arena-save-v5'))")
 def jump(p,n):p.evaluate('(n)=>window.__shift+=n',n);p.wait_for_timeout(1250)
 def click(p,n):p.get_by_role('button',name=n,exact=True).click()
 def tab(p,n):p.get_by_role('tab',name=n,exact=True).click()
 def cult(p):click(p,'Cultivo')
 def confirm(p):click(p,'CONFIRMAR INVESTIMENTO')
 try:
  p=boot();check('Boot da etapa 2',p.locator('main[data-expansion-stage="2"]').count()==1)
  check('Capa ilustrada original carregada',p.locator('img').first.evaluate('i=>i.complete&&i.naturalWidth>500'))
  click(p,'ENTRAR NO LUDUS');check('Cidade e atalhos preservados',p.get_by_role('button',name='FORJA',exact=True).count()==1)
  cult(p);tab(p,'Meditar');check('Dormência bloqueia meditação',p.get_by_role('button',name='MEDITAR · 30 SEGUNDOS',exact=True).count()==0)
  click(p,'IR AO DESPERTAR');before=game(p);click(p,'DESPERTAR MEU NÚCLEO');click(p,'CONFIRMAR DESPERTAR');p.wait_for_timeout(300)
  check('Despertar mantém personagem e núcleo',game(p)['character']==before['character'] and game(p)['cultivation']['core']['id']==before['cultivation']['core']['id'])
  tab(p,'Meditar');click(p,'MEDITAR · 30 SEGUNDOS');check('Sessão persiste ao iniciar',game(p)['cultivation']['flow']['meditation'] is not None)
  check('Não é possível empilhar sessões',p.get_by_role('button',name='MEDITAR · 30 SEGUNDOS',exact=True).count()==0)
  jump(p,10000);check('Sessão gera essência real',game(p)['cultivation']['essence']>0)
  check('Barra de sessão avança',int(p.get_by_role('progressbar',name='Sessão de meditação').get_attribute('aria-valuenow'))>=33)
  value=game(p)['cultivation']['essence'];click(p,'ENCERRAR SESSÃO');check('Interrupção preserva produção parcial',game(p)['cultivation']['flow']['meditation'] is None and game(p)['cultivation']['essence']>=value)
  click(p,'MEDITAR · 30 SEGUNDOS');jump(p,30000);check('Sessão termina sem continuar multiplicador',game(p)['cultivation']['flow']['sessionsCompleted']==1 and game(p)['cultivation']['flow']['meditation'] is None)
  value=game(p)['cultivation']['essence'];jump(p,60000);check('Fluxo passivo segue funcionando',game(p)['cultivation']['essence']>value)
  click(p,'Voltar ao ludus');click(p,'Ajuda e configurações');p.get_by_role('textbox',name='Código de recuperação').fill(FIX['code']);click(p,'IMPORTAR CÓDIGO');click(p,'CONFIRMAR IMPORTAÇÃO');cult(p);tab(p,'Meditar')
  check('Importação preserva modelo de fluxo',game(p)['cultivation']['flow']['version']==2)
  click(p,'CONDENSAR ESTRELA');value=game(p)['cultivation']['essence'];click(p,'Cancelar');check('Cancelar não gasta essência',game(p)['cultivation']['essence']==value)
  click(p,'CONDENSAR ESTRELA');confirm(p);check('Condensação sobe estrela e debita 90',game(p)['cultivation']['star']==2 and game(p)['cultivation']['essence']==value-90)
  tab(p,'Meridianos');m=next(m for m in game(p)['cultivation']['meridians'] if not m['open']);i=m['id'];value=game(p)['cultivation']['essence'];click(p,f'Abrir meridiano {i+1}');confirm(p)
  check('Abertura tem custo e efeito reais',game(p)['cultivation']['meridians'][i]['open'] and game(p)['cultivation']['essence']==value-(60+i*12))
  value=game(p)['cultivation']['essence'];click(p,f'Refinar meridiano {i+1}');confirm(p);check('Refinamento consome custo próprio',game(p)['cultivation']['meridians'][i]['refined'] and game(p)['cultivation']['essence']==value-(110+i*18))
  check('Canal refinado não pode ser cobrado novamente',p.get_by_role('button',name=f'Refinar meridiano {i+1}',exact=True).is_disabled())
  opened=sum(m['open'] for m in game(p)['cultivation']['meridians'])
  for m in game(p)['cultivation']['meridians']:
   if opened>=4:break
   if not m['open']:click(p,f"Abrir meridiano {m['id']+1}");confirm(p);opened+=1
  p.locator('[class*="_content"]').evaluate('(e)=>e.scrollTop=0');p.screenshot(path=str(O/'stage2-meridians.png'))
  tab(p,'Meditar')
  for _ in range(3):click(p,'CONDENSAR ESTRELA');confirm(p)
  check('Cinco estrelas liberam botão de ruptura',game(p)['cultivation']['star']==5 and p.get_by_role('button',name='ROMPER REINO',exact=True).count()==1)
  pre=game(p);click(p,'ROMPER REINO');confirm(p);post=game(p)
  check('Ruptura muda reino e debita exatamente 480',post['cultivation']['realm']=='Condensado' and post['cultivation']['star']==1 and post['cultivation']['essence']==pre['cultivation']['essence']-480)
  check('Cultivo não altera ficha marcial',post['character']==pre['character'])
  click(p,'MEDITAR · 30 SEGUNDOS');jump(p,6000)
  if p.get_by_role('button',name='Fechar aviso',exact=True).count():click(p,'Fechar aviso')
  p.locator('[class*="_content"]').evaluate('(e)=>e.scrollTop=0');p.screenshot(path=str(O/'stage2-meditation.png'))
  tab(p,'Jornada');check('Roteiro mantém 10 etapas e sinaliza duas concluídas',p.get_by_role('tabpanel').locator('article').count()==10 and 'etapas 1 e 2' in p.get_by_role('tabpanel').inner_text())
  click(p,'Voltar ao ludus');click(p,'FORJA');p.locator('article').filter(has_text='Dente de chacal').first.get_by_role('button',name=re.compile('COMPRAR')).click()
  check('Compra original preserva a sessão de cultivo',game(p)['character']['equipped']['weapon']=='dagger-1' and game(p)['cultivation']['flow']['meditation'] is not None)
  click(p,'Treinar');click(p,'Melhorar Força');check('Treino marcial preserva reino',game(p)['cultivation']['realm']=='Condensado')
  click(p,'Ajuda e configurações')
  with p.expect_download() as d:click(p,'EXPORTAR')
  d.value.save_as(str(O/'browser-stage2-save.json'));exported=json.loads((O/'browser-stage2-save.json').read_text());check('Backup exporta sessão, cursor e núcleo',exported['cultivation']['flow']['version']==2 and exported['cultivation']['core']['id']==FIX['rich']['cultivation']['core']['id'])
  click(p,'IMPORTAR CÓDIGO');click(p,'CONFIRMAR IMPORTAÇÃO');check('Importar mantém sessão de meditação',game(p)['cultivation']['flow']['meditation'] is not None)
  click(p,'Tela inicial');click(p,'LUTA RÁPIDA');p.wait_for_timeout(1500);check('Seis ações de combate preservadas',p.locator('button[data-action]').count()==6)
  p.keyboard.down('KeyD');p.wait_for_timeout(1100);p.keyboard.up('KeyD');hp=int(p.get_by_role('progressbar',name='Vida do rival',exact=True).get_attribute('aria-valuenow'))
  for _ in range(7):p.keyboard.press('KeyJ');p.wait_for_timeout(280)
  hp2=int(p.get_by_role('progressbar',name='Vida do rival',exact=True).get_attribute('aria-valuenow'));check('Ataque com teclado causa dano físico',hp2<hp,{'before':hp,'after':hp2})
  p.keyboard.press('Escape');check('Pausa funciona',p.get_by_role('heading',name='Combate pausado').count()==1);click(p,'ABANDONAR DUELO');check('Saída do duelo mantém reino',game(p)['cultivation']['realm']=='Condensado');p.close()
  p=boot({'arena-save-v5':json.dumps(FIX['offline'])});click(p,'ENTRAR NO LUDUS');cult(p)
  check('Relatório offline explica limite de 12h',p.get_by_role('status').filter(has_text='12 horas aplicado').count()==1)
  check('Crédito offline exato no save',game(p)['cultivation']['essence']==FIX['expected'],{'received':game(p)['cultivation']['essence'],'expected':FIX['expected']})
  p.screenshot(path=str(O/'stage2-offline.png'));value=game(p)['cultivation']['essence'];click(p,'Fechar relatório offline');check('Fechar recibo não repete crédito',game(p)['cultivation']['essence']==value)
  store=p.evaluate('window.__testStore');p.close();p=boot(store);check('Reabrir o mesmo save não duplica crédito',game(p)['cultivation']['essence']==value);p.close()
  p=boot({'arena-save-v5':json.dumps(FIX['clock'])});click(p,'ENTRAR NO LUDUS');cult(p);tab(p,'Meditar');check('Relógio regressivo bloqueia geração e informa',p.get_by_role('alert').filter(has_text='relógio').count()==1 and p.get_by_role('button',name='MEDITAR · 30 SEGUNDOS',exact=True).is_disabled());p.close()
  p=boot({'arena-save-v5':json.dumps(FIX['rich'])});click(p,'ENTRAR NO LUDUS');cult(p);tab(p,'Meditar');p.evaluate('window.__quota=true');click(p,'MEDITAR · 30 SEGUNDOS');check('Quota cheia mantém personagem e avisa',game(p)['character']==FIX['rich']['character'] and p.get_by_role('alert').filter(has_text='armazenamento falhou').count()==1);p.close()
  for w,h in [(1366,768),(1024,768),(390,844),(844,390)]:
   p=boot({'arena-save-v5':json.dumps(FIX['rich'])},{'width':w,'height':h});click(p,'ENTRAR NO LUDUS');cult(p)
   for name in ['Meditar','Meridianos']:
    tab(p,name);p.wait_for_timeout(250)
    bad=p.evaluate("() => document.documentElement.scrollWidth>innerWidth+1 || [...document.querySelectorAll('[role=tabpanel] button')].some(e=>{let r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+2||r.left< -2)})")
    check(f'Layout {w}x{h}: {name}',not bad)
   if w==390:p.screenshot(path=str(O/'stage2-mobile.png'))
   p.close()
  check('Sem erros JavaScript',not errors,errors);check('Zero requisições externas',not requests,requests)
 except Exception:
  try:p.screenshot(path=str(O/'stage2-failure.png'))
  except:pass
  raise
 finally:
  report={'mode':'HTML real em about:blank; rede bloqueada; localStorage e Date.now controlados para testes. file:// bloqueado pelo ambiente.', 'passed':sum(x['passed'] for x in results),'failed':sum(not x['passed'] for x in results),'errors':errors,'externalRequests':requests,'tests':results}
  (O/'stage2-browser-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));browser.close()
