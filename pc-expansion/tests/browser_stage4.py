"""Run the exact standalone HTML in Chromium without any external resources.
file:// navigation is prohibited by the hosted browser policy. As in earlier tests,
we write the actual HTML bytes to an isolated document and provide local storage.
Fixture checkpoints are explicit test inputs; normal play exposes no test controls.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import subprocess,json,re,time
R=Path(__file__).resolve().parents[1];O=R/'dist';HTML=(O/'ARENA_FILHOS_DA_AREIA_PC.html').read_text();NOW=1789756800000
FIX=json.loads(subprocess.check_output(['node','-e',f"""
const {{Save:V,Expansion:X,Sanctuary:S,WildWorld:W,WildCombatEngine:E,D,Beasts:B}}=require('./dist/core-test.cjs'),t={NOW};
let rich=X.settle(X.awaken(V.fresh(t-1000,'wild-browser-stage4'),t-1000),t).save;rich.cultivation.essence=12000;rich.character.gold=1000;
rich=S.command(rich,{{type:'adopt',species:'pyrofang'}},t).save;
let r=W.open(rich,'bosque',t).save,ticket=W.state(r).pending,e=new E(r,ticket);
e.player.x=490;e.player.hp=130;e.actor.x=670;e.actor.hp=e.actor.maxHp*.3;e.actor.will=42;e.elapsed=17.25;
let weak=W.update(r,ticket.id,e.checkpoint());e.martial.intro=0;e.command('subdue');let duel=W.update(r,ticket.id,e.checkpoint());
e.phase='combat';e.actor.hp=0;e.step(.03);let dead=W.update(r,ticket.id,e.checkpoint());
let all=JSON.parse(JSON.stringify(rich));all.world.exploration={{...W.empty(),serial:6,successes:6,captures:0,defeats:6}};
let routes={{}};for(const id of ['bosque','rubras','picos','eclipse'])routes[id]=W.open(all,id,t).save;
let retry=JSON.parse(JSON.stringify(duel));retry.world.exploration.pending.checkpoint.rejections=2;
let dry=JSON.parse(JSON.stringify(weak));dry.world.exploration.pending.checkpoint.player.stamina=0;
let ended=new E(weak,W.state(weak).pending);ended.martial.intro=0;ended.command('subdue');for(let i=0;i<3;i++){{ended.needleTime=0;ended.seal();}}
let won=W.update(weak,ended.ticket.id,ended.checkpoint());
console.log(JSON.stringify({{rich,pending:r,weak,duel,retry,dead,all,routes,won,dry}}));"""],cwd=R,text=True))
results=[];errors=[];requests=[];attempts=[]
def check(name,ok,detail=None):
 results.append({'name':name,'passed':bool(ok),'detail':detail});print(name,bool(ok),flush=True)
 if not ok:raise AssertionError(name+': '+str(detail))
SETUP="""a=>{const d=a.store;window.__testStore=d;window.__shift=0;Date.now=()=>a.now+window.__shift;Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>d[k]??null,setItem:(k,v)=>{if(window.__quota)throw Error('quota');d[k]=String(v)},removeItem:k=>delete d[k],clear:()=>{for(const k in d)delete d[k]}}});}"""
def inject(p):
 p.evaluate("window.__arenaHtml=''")
 for i in range(0,len(HTML),65536):p.evaluate('(s)=>{window.__arenaHtml+=s}',HTML[i:i+65536])
 p.evaluate('()=>{document.open();document.write(window.__arenaHtml);document.close();delete window.__arenaHtml;}');p.wait_for_timeout(650)
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 ctx=browser.new_context(viewport={'width':1440,'height':1000},accept_downloads=True);ctx.set_offline(True);ctx.route('**/*',lambda r:r.abort())
 def boot(root=None,size=None):
  p=ctx.new_page();p.set_default_timeout(9000)
  if size:p.set_viewport_size(size)
  p.on('pageerror',lambda e:errors.append(str(e)));p.on('request',lambda r:requests.append(r.url) if r.url.startswith(('http:','https:')) else None)
  p.evaluate(SETUP,{'store':{'arena-save-v5':json.dumps(root)} if root else {},'now':NOW});inject(p);return p
 def game(p):return p.evaluate("JSON.parse(localStorage.getItem('arena-save-v5'))")
 def click(p,n):p.get_by_role('button',name=n,exact=True).click()
 def goto(p):click(p,'ENTRAR NO LUDUS');click(p,'Explorar')
 def resume(p):goto(p);click(p,'RETOMAR EXPEDIÇÃO');p.wait_for_timeout(750)
 def bar(p,label):return float(p.get_by_role('progressbar',name=label,exact=True).get_attribute('aria-valuenow'))
 def notice(p):
  if p.get_by_role('button',name='Fechar aviso',exact=True).count():click(p,'Fechar aviso')
 def seal(p,good=True):
  if good:p.wait_for_function("()=>{let e=document.querySelector('[class*=\"_track\"]>i');return e&&Math.abs(parseFloat(e.style.left)-50)<6}",timeout=5000)
  else:p.wait_for_function("()=>{let e=document.querySelector('[class*=\"_track\"]>i');return e&&parseFloat(e.style.left)>91}",timeout=5000)
  p.keyboard.press('Enter');p.wait_for_timeout(170)
 try:
  p=boot();check('Build atual identifica Etapa 4',p.locator('main[data-expansion-stage="4"]').count()==1)
  goto(p);check('Atlas tem quatro paisagens SVG originais',p.get_by_role('img',name=re.compile('Paisagem de ')).count()==4)
  for name in ['Bosque Viridiano','Terras Rubras','Picos da Tormenta','Ruínas do Eclipse']:
   check('Núcleo adormecido bloqueia '+name,p.get_by_role('button',name='Explorar '+name,exact=True).is_disabled())
  check('Sem expedição ou fera automaticamente concedida',game(p)['world'].get('exploration',{}).get('pending') is None and not game(p)['beasts']['collection'])
  click(p,'VISITAR CULTIVO');click(p,'DESPERTAR MEU NÚCLEO');click(p,'CONFIRMAR DESPERTAR');click(p,'Explorar')
  check('Despertar libera primeiro habitat',not p.get_by_role('button',name='Explorar Bosque Viridiano',exact=True).is_disabled())
  check('Despertar mantém rotas avançadas bloqueadas',p.get_by_role('button',name='Explorar Terras Rubras',exact=True).is_disabled())
  before=game(p);click(p,'Explorar Bosque Viridiano');p.wait_for_timeout(1800)
  check('Entrada inicia combate real',p.locator('[data-wild-battle]').count()==1)
  after=game(p);ticket=after['world']['exploration']['pending'];check('Ticket e genética persistidos antes do combate',ticket is not None and ticket['individual']['potential']>0)
  check('Encontrar revela espécie sem adicionar à coleção',ticket['species'] in after['beasts']['discoveredSpecies'] and len(after['beasts']['collection'])==len(before['beasts']['collection']))
  check('Arena clássica não foi substituída',p.get_by_role('region',name='Combate de gladiadores').count()==0)
  check('Gladiador em Canvas e fera vetorial separada',p.locator('canvas[aria-label="Habitat animado e gladiador articulado"]').count()==1 and p.locator('[data-species-art]').count()==1)
  svg=p.locator('[data-species-art]');check('Desenho da fera possui membros e contornos',svg.locator('path').count()>=12)
  box=svg.bounding_box();a=p.screenshot(clip=box);p.wait_for_timeout(400);b=p.screenshot(clip=box);check('Fera tem movimento visível, não emoji estático',a!=b)
  # Active combat controls; before/after checkpoint provides an observable simulation state.
  p.keyboard.press('Escape');previous_x=game(p)['world']['exploration']['pending']['checkpoint']['player']['x'];click(p,'CONTINUAR EXPEDIÇÃO');p.keyboard.down('KeyA');p.wait_for_timeout(500);p.keyboard.up('KeyA');p.keyboard.press('Escape')
  check('Esc abre pausa com simulação parada',p.get_by_role('heading',name='Expedição pausada',exact=True).count()==1)
  cp=game(p)['world']['exploration']['pending']['checkpoint'];check('Teclado move personagem na expedição',cp['player']['x']<previous_x)
  p.wait_for_timeout(1200);check('Pausa não avança tempo de combate',game(p)['world']['exploration']['pending']['checkpoint']['elapsed']==cp['elapsed'])
  click(p,'CONTINUAR EXPEDIÇÃO');p.keyboard.press('KeyW');p.wait_for_timeout(200);p.keyboard.press('Space');p.wait_for_timeout(120);p.keyboard.down('KeyL');p.wait_for_timeout(200);p.keyboard.up('KeyL');p.keyboard.press('KeyK');p.wait_for_timeout(550);p.keyboard.press('Escape')
  check('Ações com teclado consomem vigor',bar(p,'Seu vigor selvagem')<110)
  cp=game(p)['world']['exploration']['pending']['checkpoint'];saved=game(p);p.close()
  p=boot(saved);goto(p);check('Arquivo reaberto oferece mesmo encontro',p.get_by_role('button',name='RETOMAR EXPEDIÇÃO',exact=True).count()==1)
  check('Nenhuma região pode sortear outro encontro pendente',all(p.get_by_role('button',name='Explorar '+n,exact=True).is_disabled() for n in ['Bosque Viridiano','Terras Rubras','Picos da Tormenta','Ruínas do Eclipse']))
  ticket2=game(p)['world']['exploration']['pending'];check('Reabrir mantém ID e genética',ticket2['id']==ticket['id'] and ticket2['individual']==ticket['individual'])
  click(p,'RETOMAR EXPEDIÇÃO');p.keyboard.press('Escape');check('Vida retomada não se cura ao recarregar',abs(bar(p,'Sua vida selvagem')-cp['player']['hp'])<2)
  click(p,'RECUAR SEM CAPTURA');p.wait_for_timeout(650);check('Recuo produz resultado explícito',p.get_by_role('heading',name='Expedição encerrada',exact=True).count()==1 if p.get_by_role('heading',name='Expedição encerrada',exact=True).count() else 'RETORNO' in p.locator('body').inner_text().upper() or 'RECUO' in p.locator('body').inner_text().upper())
  click(p,'REGISTRAR RESULTADO');check('Recuo limpa ticket sem recompensa',game(p)['world']['exploration']['pending'] is None and game(p)['character']['gold']==saved['character']['gold'])
  click(p,'VOLTAR ÀS EXPEDIÇÕES');check('Recuo registrado no diário',game(p)['world']['exploration']['history'][-1]['outcome']=='retreated');p.close()
  # Capture: the fixture represents an already wounded saved encounter, no auto-win hook.
  p=boot(FIX['weak']);resume(p);check('Vida e vontade baixas liberam subjugação',not p.locator('[data-wild-action="subdue"]').is_disabled())
  initial=game(p);p.keyboard.press('KeyB');check('B inicia confronto com três pulsos',p.get_by_role('heading',name='Três pulsos. Um vínculo.',exact=True).count()==1)
  cp=game(p)['world']['exploration']['pending']['checkpoint'];p.wait_for_timeout(450);check('Confronto espiritual suspende HP físico',bar(p,'Sua vida selvagem')==round(cp['player']['hp']))
  check('Bônus de compatibilidade exibido','enfraquecimento' in p.locator('body').inner_text())
  seal(p);check('Primeiro pulso é persistido',len(game(p)['world']['exploration']['pending']['checkpoint']['seals'])==1)
  seal(p);notice(p);p.screenshot(path=str(O/'stage4-subjugation.png'))
  seal(p);p.wait_for_timeout(700);check('Três bons pulsos estabelecem pacto',p.get_by_role('heading',name='Pacto estabelecido',exact=True).count()==1)
  check('Antes de registrar, não há recompensa antecipada',len(game(p)['beasts']['collection'])==len(initial['beasts']['collection']))
  captured_input=initial['world']['exploration']['pending']['individual'];gold=initial['character']['gold'];ess=initial['cultivation']['essence'];click(p,'REGISTRAR RESULTADO')
  now=game(p);new=next(x for x in now['beasts']['collection'] if x['id']==captured_input['id'])
  check('Indivíduo capturado é o mesmo do encontro',all(new[k]==captured_input[k] for k in ['id','species','potential','bloodline','level','seed']))
  check('Captura mantém companhia anterior e sem assimilação',now['beasts']['sanctuary']['companionId']==initial['beasts']['sanctuary']['companionId'] and now['assimilation']==initial['assimilation'])
  check('Ouro de rota 1 adicionado exatamente uma vez',now['character']['gold']==gold+26)
  check('Essência de rota 1 adicionado exatamente uma vez',now['cultivation']['essence']==ess+18)
  check('Campanha marcial não avança por captura',now['world']['clearedArenaEncounters']==initial['world']['clearedArenaEncounters'] and now['character']['wins']==initial['character']['wins'])
  check('Ticket consumido após transação',now['world']['exploration']['pending'] is None)
  check('Não é possível registrar duas vezes pela interface',p.get_by_role('button',name='REGISTRAR RESULTADO',exact=True).count()==0)
  p.screenshot(path=str(O/'stage4-captured.png'));click(p,'VOLTAR ÀS EXPEDIÇÕES')
  check('Diário informa captura',game(p)['world']['exploration']['captures']==1 and 'PACTO' in p.locator('[class*="_journal"]').first.inner_text())
  click(p,'ABRIR SANTUÁRIO');check('Captura aparece na coleção',p.get_by_role('heading',name='Santuário das Feras',exact=True).count()==1 and len(game(p)['beasts']['collection'])==2)
  click(p,'Ajuda e configurações');click(p,'COPIAR CÓDIGO');code=p.get_by_role('textbox',name='Código de recuperação').input_value();check('Backup inclui feras e histórico selvagem',code.startswith('ARENA5:') and len(code)>100)
  p.close()
  # Durable mid-duel recovery, timeouts and persistent rejection counter.
  d=FIX['duel'];p=boot(d);resume(p);check('Confronto espiritual pode ser retomado',p.get_by_role('heading',name='Três pulsos. Um vínculo.',exact=True).count()==1)
  seal(p);p.keyboard.press('Escape');g=game(p);p.close();p=boot(g);resume(p);check('Pulsos não são apagados ao reabrir',len(game(p)['world']['exploration']['pending']['checkpoint']['seals'])==1)
  p.keyboard.press('Escape');click(p,'RECUAR SEM CAPTURA');p.wait_for_timeout(650);click(p,'REGISTRAR RESULTADO');check('Recuar durante selo é seguro',game(p)['world']['exploration']['captures']==0);p.close()
  p=boot(FIX['retry']);resume(p)
  for _ in range(3):seal(p,False)
  p.wait_for_timeout(700);check('Terceira rejeição termina em fuga',game(p)['world']['exploration']['pending']['checkpoint']['outcome']=='escaped')
  click(p,'REGISTRAR RESULTADO');check('Fuga não concede fera',len(game(p)['beasts']['collection'])==len(FIX['retry']['beasts']['collection']));p.close()
  # Archived terminal result persists until explicitly committed.
  p=boot(FIX['won']);resume(p);check('Resultado capturado pode ser registrado após reabrir',p.get_by_role('button',name='REGISTRAR RESULTADO',exact=True).count()==1)
  p.evaluate('window.__quota=true');click(p,'REGISTRAR RESULTADO');check('Falha no disco não repete botão de coleta',p.get_by_role('button',name='VOLTAR ÀS EXPEDIÇÕES',exact=True).count()==1)
  click(p,'VOLTAR ÀS EXPEDIÇÕES');check('Falha de gravação é avisada','backup' in p.locator('body').inner_text().lower() and p.get_by_role('alert').count()>0)
  p.evaluate('window.__quota=false');click(p,'Ajuda e configurações');click(p,'COPIAR CÓDIGO');newcode=p.get_by_role('textbox',name='Código de recuperação').input_value()
  import base64
  recovered=json.loads(base64.b64decode(newcode[7:]));check('Backup conserva captura mantida em memória',recovered['world']['exploration']['captures']==1 and len(recovered['beasts']['collection'])==2);p.close()
  # Actual focus and keyboard impact have observable state, not simulated clicking rewards.
  p=boot(FIX['weak']);resume(p);hp=bar(p,'Vida da fera');will=bar(p,'Vontade da fera');p.keyboard.press('KeyR');p.wait_for_timeout(1150)
  check('Foco não causa dano físico',bar(p,'Vida da fera')==hp)
  check('Foco reduz vontade ou é interrompido por contra-ataque',bar(p,'Vontade da fera')<will or 'interromp' in p.locator('body').inner_text().lower())
  p.keyboard.press('Escape');p.close()
  p=boot(FIX['pending']);resume(p);hp=bar(p,'Vida da fera');p.keyboard.press('KeyJ');p.wait_for_timeout(350)
  check('Ataque fora de alcance não causa dano remoto',bar(p,'Vida da fera')==hp)
  p.keyboard.down('KeyD');p.wait_for_timeout(800);p.keyboard.up('KeyD')
  for _ in range(4):p.keyboard.press('KeyK');p.wait_for_timeout(1100)
  check('Golpes de teclado acertam fera quando próxima',bar(p,'Vida da fera')<hp)
  notice(p);p.screenshot(path=str(O/'stage4-combat.png'));p.keyboard.press('Escape');p.close()
  # Each biome and desktop/mobile layout, using saved encounters from the same region API.
  for id in ['bosque','rubras','picos','eclipse']:
   p=boot(FIX['routes'][id]);resume(p);check(id+': ambiente e criatura carregam',p.locator('canvas').count()==1 and p.locator('[data-species-art]').count()==1)
   p.keyboard.press('Escape');p.keyboard.press('Escape');p.wait_for_timeout(250);p.screenshot(path=str(O/f'stage4-{id}.png'));p.close()
  for w,h in [(1366,768),(1024,768),(390,844),(844,390)]:
   p=boot(FIX['rich'],{'width':w,'height':h});goto(p);p.wait_for_timeout(350)
   check(f'{w}x{h}: atlas sem overflow horizontal',p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
   click(p,'Explorar Bosque Viridiano');p.wait_for_timeout(1400)
   check(f'{w}x{h}: canvas tem área jogável',p.locator('canvas').bounding_box()['height']>=120)
   check(f'{w}x{h}: controles cabem na tela',p.locator('[data-wild-action]').evaluate_all('(es)=>es.every(e=>{let r=e.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1})'))
   check(f'{w}x{h}: Focar é acionável',not p.locator('[data-wild-action="focus"]').is_disabled())
   click(p,'Pausar expedição');check(f'{w}x{h}: pausa e retorno acessíveis',p.get_by_role('button',name='CONTINUAR EXPEDIÇÃO',exact=True).is_visible())
   p.close()
  p=boot(FIX['all']);goto(p);p.wait_for_timeout(350)
  check('Experiência de expedições abre quatro rotas',all(not p.get_by_role('button',name='Explorar '+n,exact=True).is_disabled() for n in ['Bosque Viridiano','Terras Rubras','Picos da Tormenta','Ruínas do Eclipse']))
  p.locator('[class*="_content"]').evaluate('e=>e.scrollTop=0');p.screenshot(path=str(O/'stage4-atlas.png'));p.close()
  check('Sem erros de execução JavaScript',not errors,errors);check('Sem pedidos HTTP externos',not requests,requests)
 finally:
  report={'suite':'Etapa 4 — Terras Selvagens, UI real em Chromium','passed':sum(x['passed'] for x in results),'failed':sum(not x['passed'] for x in results),'checks':results,'errors':errors,'externalRequests':requests,'method':'Exact HTML document injection, Chromium; simulated localStorage and frozen wall clock, real requestAnimationFrame and keyboard; file:// disallowed by hosted browser policy; no physical Windows/iPhone test.'}
  (O/'stage4-browser-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));browser.close()
