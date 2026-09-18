/* Builds one HTML with the original illustrated assets, all runtime JS and CSS embedded. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const esbuild=require('esbuild'),postcss=require('postcss'),modules=require('postcss-modules');
const root=path.resolve(__dirname,'..'),src=path.join(root,'src'),out=path.join(root,'dist'),cache=path.join(root,'assets');
fs.mkdirSync(out,{recursive:true});fs.mkdirSync(cache,{recursive:true});
const sourceArt=fs.readFileSync(path.join(src,'helpers/ArenaArt.tsx'),'utf8');
const assetPaths=[...new Set(sourceArt.match(/\/_cdn\/static\/[\w-]+\.png/g)||[])];
async function main(){
 let assets={},assetReport=[];
 for(const asset of assetPaths){
  const filename=path.join(cache,path.basename(asset));
  if(!fs.existsSync(filename)){const response=await fetch('https://arena-filhos-da-areia.floot.app'+asset);if(!response.ok)throw new Error('Ilustração indisponível '+asset+' HTTP '+response.status);const buffer=Buffer.from(await response.arrayBuffer());if(buffer.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw new Error('Imagem não é PNG: '+asset);fs.writeFileSync(filename,buffer);}
  const buffer=fs.readFileSync(filename);assets[asset]='data:image/png;base64,'+buffer.toString('base64');assetReport.push({file:path.basename(asset),bytes:buffer.length,sha256:crypto.createHash('sha256').update(buffer).digest('hex')});
 }
 const styles=new Map();const bundle=await esbuild.build({absWorkingDir:root,entryPoints:[path.join(src,'main.tsx')],bundle:true,write:false,format:'iife',platform:'browser',target:['chrome100','edge100','safari16'],jsx:'automatic',minify:true,legalComments:'inline',define:{'process.env.NODE_ENV':'"production"'},plugins:[
  {name:'embedded-original-art',setup(b){b.onLoad({filter:/ArenaArt\.tsx$/},()=>({contents:sourceArt.replace(/(['"])(\/_cdn\/static\/[\w-]+\.png)\1/g,(_,q,a)=>JSON.stringify(assets[a])),loader:'tsx'}));}},
  {name:'css-modules-inline',setup(b){b.onLoad({filter:/\.module\.css$/},async args=>{let json={};const result=await postcss([modules({generateScopedName:(name,filename)=>'au_'+path.basename(filename).replace(/\W/g,'_')+'_'+name,getJSON:(_,map)=>{json=map;}})]).process(fs.readFileSync(args.path,'utf8'),{from:args.path});styles.set(args.path,result.css);return {contents:'export default '+JSON.stringify(json),loader:'js'};});}}
 ]});
 let code=bundle.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
 const css=fs.readFileSync(path.join(src,'base.css'),'utf8')+'\n'+[...styles.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([,v])=>v).join('\n');
 const html='<!doctype html>\n<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="theme-color" content="#362318"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\'; style-src \'unsafe-inline\'; img-src data: blob:; media-src data: blob:; connect-src \'none\'; font-src \'none\'; base-uri \'none\'; form-action \'none\'"><title>ARENA — Filhos da Areia · O Fluxo Interior</title><link rel="icon" href="'+assets[assetPaths[assetPaths.length-1]]+'"><style>'+css+'</style></head><body><div id="root"><div id="boot" style="display:grid;place-items:center;min-height:100vh;color:#f5d59a;font:24px Georgia">Abrindo ARENA — Filhos da Areia…</div></div><noscript>Ative o JavaScript para jogar. Este arquivo contém o jogo e as ilustrações; não é necessário um servidor.</noscript><script>'+code+'</script></body></html>';
 fs.writeFileSync(path.join(out,'ARENA_FILHOS_DA_AREIA_PC.html'),html);
 await esbuild.build({absWorkingDir:root,entryPoints:[path.join(src,'test-exports.ts')],bundle:true,outfile:path.join(out,'core-test.cjs'),format:'cjs',platform:'node',target:'node20'});
 const report={title:'ARENA — Filhos da Areia · O Fluxo Interior',sourceProject:'99acc7d3-ea06-4526-be68-86475e56cd5b',sourceVersion:1789690036364,edition:'Illustrated 4.0 + Expansion 5.0 stage 2',expansionVersion:'5.0.0-alpha.2',expansionStage:2,assets:assetReport,htmlBytes:Buffer.byteLength(html),htmlSha256:crypto.createHash('sha256').update(html).digest('hex'),jsBytes:Buffer.byteLength(code),cssBytes:Buffer.byteLength(css),networkRequired:false,fontsBundled:false};
 fs.writeFileSync(path.join(out,'build-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
