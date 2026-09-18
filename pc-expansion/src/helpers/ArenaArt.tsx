const images=new Map<string,HTMLImageElement>();
const assets={
 arenas:['/_cdn/static/a7c9cb85-cad4-4903-bf03-9dcf780ee7fb.png','/_cdn/static/802c63f2-7caf-44c8-9166-7c540ce11958.png','/_cdn/static/e2eda776-2e85-44ba-a900-2cbd8d71227c.png'],
 town:'/_cdn/static/96ba1505-ebc3-4540-b180-beb91e10a003.png',
 cover:'/_cdn/static/d9bfc547-530d-45bf-b40a-c06b509a5e9e.png',
 forge:'/_cdn/static/2aabd9ae-6795-426a-ba49-1050f185884c.png',
 map:'/_cdn/static/3d97d210-6ba0-408b-816a-0b37143f46e7.png',
 trainer:'/_cdn/static/cfe53118-324d-4182-baf0-cac707da1950.png',
 icon:'/_cdn/static/a47a8fa1-31e6-4783-94c8-6616173c090a.png'
};
function image(src:string){
 if(typeof Image==='undefined')return null;
 if(!images.has(src)){const img=new Image();img.decoding='async';images.set(src,img);img.src=src;}
 const img=images.get(src)!;return img.complete&&img.naturalWidth>0?img:null;
}
export const ArenaArt={...assets,image,version:'4.0.0',edition:'EDIÇÃO ILUSTRADA · PC',chapterColors:['#a93428','#686372','#257d81']};
