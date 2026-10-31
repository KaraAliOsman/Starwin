import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Typed adaptation of the shared taste-skill stage: static first, native scroll,
 * media-query teardown and no pin spacer or wheel interception. */
export async function createFinishScene(root:HTMLElement){
 const images=[...root.querySelectorAll<HTMLImageElement>('.finish-window-motion img,.finish-echo img')];
 try{
  await Promise.all([document.fonts.ready,...images.map(image=>{image.loading='eager';return image.decode();})]);
 }catch{root.dataset.sceneState='rest';return;}
 // A native fragment or the Explore action may still be scrolling when the
 // images finish. ScrollTrigger.refresh must not interrupt that navigation.
 await new Promise<void>(resolve=>{
  const started=performance.now();let previous=scrollY,stable=0;
  const check=(now:number)=>{
   stable=Math.abs(scrollY-previous)<.5?stable+1:0;previous=scrollY;
   if(stable>=8||now-started>1500){resolve();return;}
   requestAnimationFrame(check);
  };
  requestAnimationFrame(check);
 });
 // Do not lengthen a section the reader has already passed while a chunk loaded.
 if(root.getBoundingClientRect().top<0){root.dataset.sceneState='rest';return;}
 const media=gsap.matchMedia();
 media.add({desktop:'(min-width:901px)',motion:'(prefers-reduced-motion:no-preference)'},context=>{
  if(!context.conditions?.desktop||!context.conditions.motion){root.dataset.sceneState='rest';return;}
  root.classList.add('is-live');root.style.setProperty('--hold','.8');root.dataset.sceneState='live';
  const timeline=gsap.timeline({
   defaults:{ease:'none'},
   scrollTrigger:{trigger:root,start:'top top',end:'bottom bottom',scrub:true,invalidateOnRefresh:true,
    onUpdate:trigger=>{root.dataset.sceneProgress=trigger.progress.toFixed(3);root.dataset.scenePhase=trigger.progress<.10?'portrait':trigger.progress<.70?'unfold':trigger.progress<.82?'caption':'compare';}
   }
  });
  const left=root.querySelector('.finish-echo--dark'),right=root.querySelector('.finish-echo--oak');
  // A compact product set opens into an equally sized comparison.
  // No window fades, rotates, or exits. The final comparison stays visible.
  timeline.fromTo(left,
   {x:0,xPercent:-84,y:18,scale:.90,opacity:1},
   {xPercent:-110,y:0,scale:1,duration:.52,ease:'power2.inOut'},.10);
  timeline.fromTo(right,
   {x:0,xPercent:84,y:18,scale:.90,opacity:1},
   {xPercent:110,y:0,scale:1,duration:.52,ease:'power2.inOut'},.18);
  timeline.fromTo(root.querySelector('.finish-window-motion'),
   {scale:.90,y:18},{scale:1,y:0,duration:.62,ease:'power2.inOut'},.08);
  timeline.fromTo(root.querySelector('.finish-lineup-labels'),
   {opacity:0},{opacity:1,duration:.12},.70);
  timeline.to({}, {duration:.18},.82);
  ScrollTrigger.refresh();
  return ()=>{root.classList.remove('is-live');root.style.removeProperty('--hold');delete root.dataset.sceneProgress;delete root.dataset.scenePhase;root.dataset.sceneState='rest';};
 });
 return ()=>media.revert();
}
