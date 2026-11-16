'use strict';
const qs=(s,scope=document)=>scope.querySelector(s);const qsa=(s,scope=document)=>Array.from(scope.querySelectorAll(s));
const menu=qs('#menuToggle');if(menu){menu.addEventListener('click',()=>{const open=qs('#nav').classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Fechar menu':'Abrir menu')});qsa('.site-nav a').forEach(a=>a.addEventListener('click',()=>{qs('#nav').classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menu')}));}
const header=qs('#header');if(header){const refreshHeader=()=>header.classList.toggle('scrolled',window.scrollY>35);refreshHeader();window.addEventListener('scroll',refreshHeader,{passive:true});}
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reduced && 'IntersectionObserver' in window){document.documentElement.classList.add('js');const io=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');io.unobserve(entry.target)}})},{threshold:.12,rootMargin:'0px 0px -35px 0px'});qsa('.reveal,.scroll-fade').forEach(el=>io.observe(el));}else{qsa('.reveal,.scroll-fade').forEach(el=>el.classList.add('visible'));}
const hero = qs('.hero-media');
if (!reduced && hero) {
  let queued = false;
  function updateParallax() {
    queued = false;
    const y = window.scrollY;
    const scale = 1.07 + Math.min(y / Math.max(window.innerHeight, 1), 1) * .07;
    hero.style.transform = `translate3d(0,${Math.min(y * .15, 140)}px,0) scale(${scale})`;
  }
  function queueParallax() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(updateParallax);
  }
  window.addEventListener('scroll', queueParallax, {passive: true});
  window.addEventListener('resize', queueParallax);
  updateParallax();
}
