import React,{useEffect,useRef} from 'react';
import {ArenaTypes as T} from '../helpers/ArenaTypes';
import {ArenaEngine} from '../helpers/ArenaEngine';
import {ArenaRenderer} from '../helpers/ArenaRenderer';
import styles from './ArenaPortrait.module.css';
export const ArenaPortrait=({save,arena=0,className='',enemyId}:{save:T.Save;arena?:number;className?:string;enemyId?:number})=>{
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const canvas=ref.current;if(!canvas)return;
  const engine=new ArenaEngine(save,enemyId??0),renderer=new ArenaRenderer(canvas);renderer.reduced=save.reducedMotion;
  const fighter=enemyId===undefined?engine.player:engine.enemy;fighter.face=1;
  let frame=0,last=0,elapsed=0;
  const size=()=>{const r=canvas.getBoundingClientRect();renderer.resize(r.width,r.height);};
  const observer=new ResizeObserver(size);observer.observe(canvas);size();
  const loop=(t:number)=>{frame=requestAnimationFrame(loop);if(t-last<33)return;elapsed+=Math.min(.1,(t-last)/1000||0);last=t;if(!document.hidden)renderer.portrait(fighter,elapsed,arena);};
  frame=requestAnimationFrame(loop);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();};
 },[save,arena,enemyId]);
 return <canvas ref={ref} className={`${styles.canvas} ${className}`} aria-label="Gladiador articulado com o equipamento selecionado"/>;
};
