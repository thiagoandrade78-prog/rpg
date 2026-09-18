from pathlib import Path
from playwright.sync_api import sync_playwright
import subprocess,json,hashlib,re,time
R=Path(__file__).resolve().parents[1];O=R/'dist';HTML=(O/'ARENA_FILHOS_DA_AREIA_PC.html').read_text();NOW=1789756800000
FIX=json.loads(subprocess.check_output(['node','-e',f"""
const {{Save:V,Expansion:X,Sanctuary:S,D}}=require('./dist/core-test.cjs'),t={NOW};
let r=X.settle(X.awaken(V.fresh(t-1000,'browser-stage3'),t-1000),t).save;r.cultivation.essence=12000;r.character.gold=1000;
let a=S.command(r,{{type:'adopt',species:'pyrofang'}},t).save;
let legacy=D.fresh();legacy.name='Legado — Ç';legacy.gold=732;legacy.level=4;legacy.cleared=[0,1,2];
let u=JSON.parse(JSON.stringify(a));u.beasts.collection[0].species='unknown-future';u.beasts.collection[0].name='Preservado';
console.log(JSON.stringify({{rich:r,adopted:a,legacy,unknown:u}}));"""],cwd=R,text=True))
results=[];errors=[];requests=[]
def check(name,ok,detail=None):
 results.append({'name':name,'passed':bool(ok),'detail':detail});print(name,bool(ok),flush=True)
 if not ok:raise AssertionError(name+': '+str(detail))
SETUP="""a=>{let d=a.store;window.__testStore=d;window.__shift=0;Date.now=()=>a.now+window.__shift;Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>d[k]??null,setItem:(k,v)=>{if(window.__quota)throw Error('quota');d[k]=String(v)},removeItem:k=>delete d[k],clear:()=>{for(let k in d)delete d[k]}}});}"""
# Transfer the self-contained HTML in chunks to avoid the environment's large-expression
# instrumentation bottleneck. The browser receives the exact, unmodified build bytes.
def inject(p):
 p.evaluate("window.__arenaHtml=''")
 for i in range(0,len(HTML),65536):p.evaluate('(s)=>{window.__arenaHtml+=s}',HTML[i:i+65536])
 p.evaluate('() => {document.open();document.write(window.__arenaHtml);document.close();delete window.__arenaHtml;}')
 p.wait_for_timeout(450)
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 ctx=browser.new_context(viewport={'width':1440,'height':1024},accept_downloads=True);ctx.set_offline(True);ctx.route('**/*',lambda r:r.abort())
 def boot(root=None,size=None,raw=False):
  p=ctx.new_page();p.set_default_timeout(7000)
  if size:p.set_viewport_size(size)
  p.on('pageerror',lambda e:errors.append(str(e)));p.on('request',lambda r:requests.append(r.url) if r.url.startswith(('http:','https:')) else None)
  store=root if raw else {'arena-save-v5':json.dumps(root)} if root else {}
  p.evaluate(SETUP,{'store':store,'now':NOW});inject(p);return p
 def game(p):return p.evaluate("JSON.parse(localStorage.getItem('arena-save-v5'))")
 def click(p,n):p.get_by_role('button',name=n,exact=True).click()
 def tab(p,n):p.get_by_role('tab',name=n,exact=True).click()
 def beasts(p):click(p,'Feras')
 def jump(p,ms):p.evaluate('(n)=>{window.__shift+=n}',ms);p.wait_for_timeout(1250)
 def close_notice(p):
  if p.get_by_role('button',name='Fechar aviso',exact=True).count():click(p,'Fechar aviso')
 def top(p):p.locator('[class*="_content"]').evaluate('e=>e.scrollTop=0')
 def stable(b):return {k:b.get(k) for k in ['id','species','potential','bloodline','seed','mastery','evolution']}
 try:
  p=boot();check('Build identifica etapa 3',p.locator('main[data-expansion-stage="3"]').count()==1)
  check('Capa ilustrada preservada',p.locator('img').first.evaluate('i=>i.complete&&i.naturalWidth>500'))
  click(p,'ENTRAR NO LUDUS');check('Cidade original preservada',p.locator('img[alt^="Velaria"]').evaluate('i=>i.complete&&i.naturalWidth>500'))
  beasts(p);check('Santuário aparece na navegação',p.get_by_role('heading',name='Santuário das Feras',exact=True).count()==1)
  check('Três candidatas desenhadas em SVG',p.locator('[data-species-art]').count()==4)
  check('Dormência bloqueia acolhimento',p.get_by_role('button',name='ACOLHER PYROFANG',exact=True).is_disabled())
  before=game(p);click(p,'DESPERTAR PARA ACOLHER');click(p,'DESPERTAR MEU NÚCLEO');click(p,'CONFIRMAR DESPERTAR');beasts(p)
  check('Despertar não altera personagem',game(p)['character']==before['character'])
  check('Núcleo do personagem não é sorteado novamente',game(p)['cultivation']['core']['id']==before['cultivation']['core']['id'])
  check('Acolhimento liberado após despertar',not p.get_by_role('button',name='ACOLHER PYROFANG',exact=True).is_disabled())
  click(p,'ACOLHER PYROFANG');click(p,'Cancelar');check('Cancelar não concede fera',len(game(p)['beasts']['collection'])==0)
  click(p,'ACOLHER PYROFANG');click(p,'CONFIRMAR ACOLHIMENTO');check('Uma única fera acolhida',len(game(p)['beasts']['collection'])==1)
  pet=game(p)['beasts']['collection'][0];identity=stable(pet)
  check('Linhagem soma 100%',pet['bloodline']['base']+pet['bloodline']['primordial']==100)
  check('Afinidade inicial 10 e domínio zero',pet['affinity']==10 and pet['mastery']==0)
  check('Sem segunda oferta de acolhimento',p.get_by_role('button',name='ACOLHER PYROFANG',exact=True).count()==0)
  check('Fera é companheira de pátio, não assimilada',game(p)['beasts']['sanctuary']['companionId']==pet['id'] and game(p)['assimilation']['activeBeastId'] is None)
  close_notice(p);top(p);p.screenshot(path=str(O/'stage3-sanctuary.png'))
  before=game(p);click(p,'CUIDAR · 15 OURO');click(p,'Cancelar');check('Cancelar cuidado não cobra ouro',game(p)['character']['gold']==before['character']['gold'])
  click(p,'CUIDAR · 15 OURO');click(p,'CONFIRMAR CUIDADO OU TREINO');check('Cuidado debita ouro e aumenta afinidade',game(p)['character']['gold']==before['character']['gold']-15 and game(p)['beasts']['collection'][0]['affinity']==16)
  check('Cooldown bloqueia repetição',p.get_by_role('button',name='CUIDAR · 15 OURO',exact=True).is_disabled())
  click(p,'RENOMEAR');p.get_by_role('textbox',name='Nome da fera').fill('Ígneo — Ç');click(p,'SALVAR NOME');check('Nome Unicode salvo sem perder genética',game(p)['beasts']['collection'][0]['name']=='Ígneo — Ç' and stable(game(p)['beasts']['collection'][0])==identity)
  click(p,'RECOLHER DO PÁTIO');check('Recolher mantém coleção',game(p)['beasts']['sanctuary']['companionId'] is None and len(game(p)['beasts']['collection'])==1)
  click(p,'ACOMPANHAR NO PÁTIO');check('Selecionar companheiro não altera assimilação',game(p)['beasts']['sanctuary']['companionId']==pet['id'] and game(p)['assimilation']['activeBeastId'] is None)
  # Import an awakened fixture with resources, exercising the exact player import flow.
  click(p,'Ajuda e configurações');p.get_by_role('textbox',name='Código de recuperação').fill(json.dumps(FIX['adopted']));click(p,'IMPORTAR CÓDIGO');click(p,'CONFIRMAR IMPORTAÇÃO');beasts(p)
  before=game(p);click(p,'TREINAR · 28 ESSÊNCIA');click(p,'CONFIRMAR CUIDADO OU TREINO');check('Treino custa 28 essência, sem gasto de ouro',game(p)['cultivation']['essence']==before['cultivation']['essence']-28 and game(p)['character']['gold']==before['character']['gold'])
  check('Uma sessão persistida, sem XP antecipado',game(p)['beasts']['sanctuary']['training'] is not None and game(p)['beasts']['collection'][0]['level']==1)
  check('Coleta antes do prazo bloqueada',p.get_by_role('button',name='CONCLUIR TREINO',exact=True).is_disabled())
  check('Segundo treino bloqueado',p.get_by_role('button',name='TREINAR · 28 ESSÊNCIA',exact=True).is_disabled())
  jump(p,30000);check('Prazo libera conclusão',not p.get_by_role('button',name='CONCLUIR TREINO',exact=True).is_disabled())
  close_notice(p);p.get_by_role('status',name='Treino de vínculo').scroll_into_view_if_needed();p.screenshot(path=str(O/'stage3-training.png'))
  click(p,'CONCLUIR TREINO');check('XP real sobe nível e afinidade',game(p)['beasts']['collection'][0]['level']==2 and game(p)['beasts']['collection'][0]['xp']==0 and game(p)['beasts']['collection'][0]['affinity']==13)
  check('Recompensa não pode ser coletada novamente',p.get_by_role('button',name='CONCLUIR TREINO',exact=True).count()==0 and game(p)['beasts']['sanctuary']['training'] is None)
  check('Nível da fera não sobe domínio',game(p)['beasts']['collection'][0]['mastery']==0)
  tab(p,'Compêndio');check('Oito registros no bestiário',p.get_by_role('button',name=re.compile('Abrir registro')).count()==8)
  check('Silhueta de espécie não estudada',p.get_by_role('button',name='Abrir registro 02').locator('svg[data-species-art]').count()==1)
  anatomies=[]
  for i in range(1,9):
   click(p,f'Abrir registro {i:02d}')
   if p.get_by_role('button',name='ESTUDAR REGISTRO',exact=True).count():click(p,'ESTUDAR REGISTRO')
   check(f'Registro {i:02d} estudado sem conceder fera',len(game(p)['beasts']['collection'])==1 and len(game(p)['beasts']['discoveredSpecies'])>=i)
   stage=p.locator('[class*="_creatureStage"] [data-species-art]');anatomies.append(stage.get_attribute('data-anatomy'))
   # inspect full species view and reduced glyph structure; no emoji node is used
   check(f'Espécie {i:02d}: contornos desenhados',stage.locator('path').count()>=12)
  check('Oito anatomias diferentes no renderer',len(set(anatomies))==8,anatomies)
  p.get_by_role('textbox',name='Pesquisar bestiário').fill('Raio');check('Pesquisa encontra Stormhawk',p.get_by_role('button',name=re.compile('Abrir registro')).count()==1)
  p.get_by_role('textbox',name='Pesquisar bestiário').fill('inexistente');check('Pesquisa vazia informa corretamente','Nenhum registro' in p.locator('body').inner_text())
  p.get_by_role('textbox',name='Pesquisar bestiário').fill('');click(p,'Acolhidos');check('Filtro acolhidos só mostra espécie própria',p.get_by_role('button',name=re.compile('Abrir registro')).count()==1)
  click(p,'Estudados');check('Filtro estudados mostra oito consultadas',p.get_by_role('button',name=re.compile('Abrir registro')).count()==8)
  click(p,'Todos');click(p,'Abrir registro 05');close_notice(p);top(p);p.screenshot(path=str(O/'stage3-bestiary.png'))
  click(p,'MOVIMENTAR');stage=p.locator('[class*="_creatureStage"] [data-species-art]');a=stage.screenshot();p.wait_for_timeout(380);b=stage.screenshot();check('Animação altera pixels entre frames',hashlib.sha256(a).digest()!=hashlib.sha256(b).digest())
  check('Movimento não depende de ataques ou cliques repetidos',stage.evaluate("e=>[...e.querySelectorAll('*')].some(x=>getComputedStyle(x).animationName.includes('step'))"))
  click(p,'Ajuda e configurações');p.get_by_role('button',name=re.compile('Efeitos reduzidos:')).click();beasts(p);tab(p,'Compêndio');click(p,'Abrir registro 02');click(p,'MOVIMENTAR');stage=p.locator('[class*="_creatureStage"] [data-species-art]');check('Efeitos reduzidos suspendem animações',stage.evaluate("e=>[...e.querySelectorAll('*')].every(x=>getComputedStyle(x).animationName==='none')"))
  click(p,'Ajuda e configurações')
  with p.expect_download() as dl:click(p,'EXPORTAR')
  dl.value.save_as(str(O/'stage3-ui-backup.json'));exported=json.loads((O/'stage3-ui-backup.json').read_text());check('Exportação inclui coleção e registros novos',len(exported['beasts']['collection'])==1 and len(exported['beasts']['discoveredSpecies'])==8)
  check('Backup preserva companhia e semente',bool(exported['beasts']['collection'][0]['seed']) and exported['beasts']['sanctuary']['companionId']==exported['beasts']['collection'][0]['id'])
  click(p,'Tela inicial');click(p,'LUTA RÁPIDA');p.wait_for_timeout(1600);check('Seis ações originais de combate',p.locator('button[data-action]').count()==6)
  p.keyboard.down('KeyD');p.wait_for_timeout(1050);p.keyboard.up('KeyD');hp=int(p.get_by_role('progressbar',name='Vida do rival',exact=True).get_attribute('aria-valuenow'))
  for _ in range(8):p.keyboard.press('KeyJ');p.wait_for_timeout(270)
  check('Teclado causa dano com arma articulada',int(p.get_by_role('progressbar',name='Vida do rival',exact=True).get_attribute('aria-valuenow'))<hp)
  p.keyboard.press('Escape');check('Pausa preservada',p.get_by_role('heading',name='Combate pausado').count()==1);click(p,'ABANDONAR DUELO');check('Combate não apaga feras ou bestiário',game(p)['beasts']==exported['beasts']);p.close()
  p=boot(exported);click(p,'ENTRAR NO LUDUS');beasts(p);check('Reabrir backup mantém fera nível 2 e registros',game(p)['beasts']==exported['beasts']);p.close()
  p=boot({'arena-save-v3':json.dumps(FIX['legacy'])},raw=True);check('Importação automática de v3 mantém progresso',game(p)['character']['name']==FIX['legacy']['name'] and game(p)['character']['gold']==732 and game(p)['world']['clearedArenaEncounters']==[0,1,2]);p.close()
  p=boot(FIX['unknown']);click(p,'ENTRAR NO LUDUS');beasts(p);check('Espécie futura preservada sem travar a ficha',game(p)['beasts']['collection'][0]['species']=='unknown-future' and 'registro anterior' in p.locator('[role=img]').last.get_attribute('aria-label'));p.close()
  p=boot(FIX['adopted']);click(p,'ENTRAR NO LUDUS');beasts(p);p.evaluate('window.__quota=true');click(p,'CUIDAR · 15 OURO');click(p,'CONFIRMAR CUIDADO OU TREINO');check('Quota indisponível mostra aviso e preserva sessão',p.get_by_role('alert').count()==1 and '16%' in p.locator('[data-testid="beast-detail"]').inner_text().replace('\n',''))
  click(p,'Ajuda e configurações')
  with p.expect_download() as dl:click(p,'EXPORTAR')
  dl.value.save_as(str(O/'stage3-quota-backup.json'));check('Backup recupera ação retida em memória',json.loads((O/'stage3-quota-backup.json').read_text())['beasts']['collection'][0]['affinity']==16);p.close()
  p=boot(FIX['adopted']);click(p,'ENTRAR NO LUDUS');beasts(p);raw=game(p);p.evaluate("window.dispatchEvent(new StorageEvent('storage',{key:'arena-save-v5',newValue:'{}'}))");click(p,'CUIDAR · 15 OURO');click(p,'CONFIRMAR CUIDADO OU TREINO');check('Conflito de outra aba bloqueia gasto',game(p)['character']['gold']==raw['character']['gold'] and game(p)['beasts']==raw['beasts']);p.close()
  for w,h in [(1366,768),(1024,768),(390,844),(844,390)]:
   p=boot(exported,{'width':w,'height':h});click(p,'ENTRAR NO LUDUS');beasts(p)
   for name in ['Minhas feras','Compêndio']:
    tab(p,name);p.wait_for_timeout(250)
    bad=p.evaluate("() => document.documentElement.scrollWidth>innerWidth+1 || [...document.querySelectorAll('[data-beast-stage] button')].some(e=>{let r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+2||r.left< -2)})")
    check(f'Layout {w}x{h}: {name}',not bad)
   if w==390:top(p);p.screenshot(path=str(O/'stage3-mobile.png'))
   p.close()
  check('Sem erros JavaScript',not errors,errors);check('Zero solicitações externas',not requests,requests)
 except Exception:
  try:p.screenshot(path=str(O/'stage3-failure.png'))
  except:pass
  raise
 finally:
  report={'mode':'HTML autocontido real carregado em blocos em about:blank; rede bloqueada; localStorage/Date.now controlados. Navegação file:// bloqueada pelo ambiente. Sem teste em Windows físico.','passed':sum(x['passed'] for x in results),'failed':sum(not x['passed'] for x in results),'errors':errors,'externalRequests':requests,'tests':results}
  (O/'stage3-browser-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));browser.close()
