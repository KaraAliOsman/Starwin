export {};
// A scene has its own gesture. Content is visible without this enhancement;
// every animation finishes in the document's existing geometry.
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const playing=new Set<Animation>();
const ease='cubic-bezier(.22,1,.36,1)';
const recipes:Record<string,Keyframe[]>={
 opening:[{transform:'translate3d(0,12px,0) scale(1.02)'},{transform:'translate3d(0,0,0) scale(1)'}],
 room:[{clipPath:'inset(0 10% 0 0)'},{clipPath:'inset(0 0 0 0)'}],
 detail:[{clipPath:'inset(0 0 16% 0)'},{clipPath:'inset(0 0 0 0)'}],
 sample:[{clipPath:'inset(0 14% 0 0)'},{clipPath:'inset(0 0 0 0)'}],
 print:[{transform:'translate3d(0,14px,0) scale(1.025)'},{transform:'translate3d(0,0,0) scale(1)'}],
 contact:[{clipPath:'inset(0 8% 0 0)'},{clipPath:'inset(0 0 0 0)'}]
};
const groups:Record<string,string>={
 '.product-photo img':'opening',
 '.catalog-room,.guide-lead figure':'room',
 '.business-hero figure':'detail',
 '.finish-samples figure':'sample',
 '.product-alternatives .opening-links img':'print',
 '.contact-scene':'contact'
};
Object.entries(groups).forEach(([selector,type])=>document.querySelectorAll<HTMLElement>(selector).forEach(el=>el.dataset.motionEntry=type));
if('IntersectionObserver' in window){
 const observer=new IntersectionObserver(entries=>{
  const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
  visible.forEach((entry,index)=>{
   observer.unobserve(entry.target);
   if(reduce.matches||entry.boundingClientRect.top<80||document.hidden)return;
   const el=entry.target as HTMLElement,type=el.dataset.motionEntry||'room';
   const animation=el.animate(recipes[type],{duration:type==='print'?600:800,delay:Math.min(index,3)*60,easing:ease});
   playing.add(animation);animation.finished.then(()=>playing.delete(animation)).catch(()=>playing.delete(animation));
  });
 },{threshold:.12,rootMargin:'0px 0px -5% 0px'});
 document.querySelectorAll<HTMLElement>('[data-motion-entry]').forEach(el=>observer.observe(el));
 const settle=()=>{playing.forEach(animation=>animation.cancel());playing.clear();};
 reduce.addEventListener('change',event=>{if(event.matches)settle();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)settle();});
}
