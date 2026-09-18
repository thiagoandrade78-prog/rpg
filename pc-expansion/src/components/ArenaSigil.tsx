import React,{useId} from 'react';
export const ArenaSigil=({size=72,crown=false}:{size?:number;crown?:boolean})=>{
 const id=useId().replace(/:/g,'');
 return <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
 <defs><linearGradient id={`seal-${id}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff0b4"/><stop offset=".45" stopColor="#d6a749"/><stop offset="1" stopColor="#91602e"/></linearGradient></defs>
 <path d="M48 90C10 83 6 37 27 15M52 90C90 83 94 37 73 15" stroke="#352318" strokeWidth="5"/><path d="M48 90C10 83 6 37 27 15M52 90C90 83 94 37 73 15" stroke="#c99c50" strokeWidth="2"/>
 {[0,1,2,3,4,5].map(i=><g key={i} transform={`translate(${16+i*i*.55} ${24+i*10}) rotate(${-35+i*9})`}><path d="M0 0Q-12-12-8-20Q6-15 0 0Z" fill="#d7b45f" stroke="#4c321b" strokeWidth="1.5"/><path d="M0 0Q9-15 17-14Q17 0 0 0Z" fill="#f0ce7b" stroke="#4c321b" strokeWidth="1.5"/></g>)}
 {[0,1,2,3,4,5].map(i=><g key={i} transform={`translate(${84-i*i*.55} ${24+i*10}) scale(-1 1) rotate(${-35+i*9})`}><path d="M0 0Q-12-12-8-20Q6-15 0 0Z" fill="#d7b45f" stroke="#4c321b" strokeWidth="1.5"/><path d="M0 0Q9-15 17-14Q17 0 0 0Z" fill="#f0ce7b" stroke="#4c321b" strokeWidth="1.5"/></g>)}
 <path d="M26 20Q50 9 75 21L69 69L50 84L31 69Z" fill="#7e3028" stroke="#271b14" strokeWidth="3"/><path d="M30 24Q50 15 71 25L65 67L50 78L35 66Z" stroke="#edbf65" strokeWidth="2"/>
 {crown?<g stroke="#302017" strokeWidth="2"><path d="M34 39L42 47L50 31L59 47L68 39L63 62H39Z" fill={`url(#seal-${id})`}/><path d="M39 61H63V68H39Z" fill="#e1b258"/><circle cx="50" cy="52" r="4" fill="#267f88"/><circle cx="50" cy="30" r="3" fill="#ffe4a1"/><circle cx="33" cy="38" r="3" fill="#ffe4a1"/><circle cx="69" cy="38" r="3" fill="#ffe4a1"/></g>:<g stroke="#302017" strokeWidth="2"><path d="M41 34L38 20Q49 9 63 18L69 29L58 27L48 36Z" fill="#c24630"/><path d="M36 45Q35 28 50 26Q69 27 69 45L61 50V66L52 74L39 66Z" fill={`url(#seal-${id})`}/><path d="M35 44L68 42L70 49L37 51Z" fill="#efcc76"/><path d="M42 51L49 51V64L41 61Z" fill="#26251f"/><path d="M57 51L64 49L62 56L57 56Z" fill="#26251f"/><path d="M51 48L56 48L58 62L53 64Z" fill="#e5b958"/><path d="M40 37Q44 29 51 30" stroke="#fff4be" strokeWidth="2"/></g>}
 <path d="M39 85L51 89L62 85L65 91L52 97L37 91Z" fill="#c7994b" stroke="#412b19" strokeWidth="2"/>
 </svg>;
};
