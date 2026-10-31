export {};
import {createPortalStory,createFinishStory} from './motion/scroll-stories';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const ease='cubic-bezier(.22,1,.36,1)';
function choices(root:Element,prefix:string,description:string){
 const buttons=[...root.querySelectorAll<HTMLButtonElement>(`[data-${prefix}-choice]`)];
 const panels=[...root.querySelectorAll<HTMLElement>(`[data-${prefix}-panel]`)];
 const descriptions=[...root.querySelectorAll<HTMLElement>(`[data-${description}]`)];
 let generation=0;
 let animations:Animation[]=[];
 const track=root.querySelector<HTMLElement>('.opening-track');
 const selector=track?.parentElement;
 function moveTrack(instant=false){
  const active=buttons.find(button=>button.getAttribute('aria-pressed')==='true');
  if(!track||!selector||!active)return;
  const box=active.getBoundingClientRect(),parent=selector.getBoundingClientRect(),horizontal=matchMedia('(max-width:700px)').matches;
  track.style.transition=instant||reduced.matches?'none':'';
  track.style.width=horizontal?'1px':'3px';track.style.height=horizontal?'2px':'1px';
  track.style.transform=horizontal?`translate3d(${box.left-parent.left}px,${box.bottom-parent.top-2}px,0) scaleX(${box.width})`:`translate3d(0,${box.top-parent.top+box.height/2-10}px,0) scaleY(20)`;
  selector.dataset.trackReady='true';
  if(instant)requestAnimationFrame(()=>{track.style.transition='';});
 }
 if(selector){moveTrack(true);new ResizeObserver(()=>moveTrack(true)).observe(selector);document.fonts.ready.then(()=>moveTrack(true));}
 const status=document.createElement('p');
 status.className='choice-error';status.hidden=true;status.setAttribute('role','status');
 buttons[0]?.parentElement?.insertAdjacentElement('afterend',status);
 const settle=()=>{
  animations.forEach(a=>a.cancel());animations=[];
  const key=buttons.find(b=>b.getAttribute('aria-pressed')==='true')?.getAttribute(`data-${prefix}-choice`);
  panels.forEach(panel=>{panel.hidden=panel.getAttribute(`data-${prefix}-panel`)!==key;panel.style.removeProperty('z-index');panel.style.removeProperty('position');});
 };
 reduced.addEventListener('change',e=>{if(e.matches)settle();});
 for(const button of buttons)button.addEventListener('click',async event=>{
  if(button.getAttribute('aria-pressed')==='true'){
   ++generation;settle();buttons.forEach(b=>b.removeAttribute('aria-busy'));status.hidden=true;return;
  }
  const token=++generation,key=button.getAttribute(`data-${prefix}-choice`);
  const selected=panels.find(panel=>panel.getAttribute(`data-${prefix}-panel`)===key);
  if(!selected)return;
  const img=selected.querySelector('img');
  button.setAttribute('aria-busy','true');
  const wait=setTimeout(()=>{if(token===generation){status.textContent='Cargando vista…';status.hidden=false;}},300);
  try{
   if(img){img.loading='eager';if(img.dataset.failed){const retry=new URL(img.currentSrc||img.src,location.href);retry.searchParams.set('retry',String(token));img.srcset='';img.src=retry.href;delete img.dataset.failed;}await img.decode();}
  }catch{if(img)img.dataset.failed='true';if(token===generation){status.textContent='No pudimos cargar la imagen. Toca de nuevo para reintentar.';status.hidden=false;}return;}
  finally{clearTimeout(wait);button.removeAttribute('aria-busy');}
  if(token!==generation)return;
  status.hidden=true;settle();
  const previous=panels.find(panel=>!panel.hidden&&panel!==selected);
  panels.forEach(panel=>panel.hidden=panel!==selected);
  buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  moveTrack(event.detail===0);
  descriptions.forEach(item=>item.hidden=item.getAttribute(`data-${description}`)!==key);
  if(event.detail>0&&!reduced.matches){
   if(previous){
    previous.hidden=false;previous.style.zIndex='1';previous.style.position='absolute';selected.style.zIndex='2';selected.style.position='relative';
    const forward=panels.indexOf(selected)>panels.indexOf(previous);
    const reveal=selected.animate([{clipPath:forward?'inset(0 0 0 100%)':'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:280,easing:ease});
    animations.push(reveal);
    reveal.finished.then(()=>{if(token===generation){previous.hidden=true;previous.style.removeProperty('z-index');previous.style.removeProperty('position');selected.style.removeProperty('z-index');selected.style.removeProperty('position');}}).catch(()=>{});
   }else animations.push(selected.animate([{opacity:.6,transform:'translate3d(12px,0,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],{duration:240,easing:ease}));
  }
 });
}
const openings=document.querySelector('[data-opening-showcase]');
const material=document.querySelector('[data-material-theatre]');
if(openings)choices(openings,'opening','opening-description');
if(material){
 const gallery=material.querySelector<HTMLElement>('.material-gallery');
 const buttons=[...material.querySelectorAll<HTMLButtonElement>('[data-material-choice]')];
 const pieces=[...material.querySelectorAll<HTMLElement>('[data-material-panel]')];
 let scrollEnd:ReturnType<typeof setTimeout>;
 const mark=(index:number)=>{buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));pieces.forEach((piece,i)=>piece.toggleAttribute('data-current',i===index));};
 if(gallery){
  mark(0);gallery.dataset.galleryReady='true';
  buttons.forEach((button,index)=>button.addEventListener('click',event=>{
   const piece=pieces[index];if(!piece)return;
   mark(index);
   const image=piece.querySelector('img');if(image)image.loading='eager';
   const offset=piece.getBoundingClientRect().left-gallery.getBoundingClientRect().left+gallery.scrollLeft-parseFloat(getComputedStyle(gallery).paddingLeft);
   gallery.scrollTo({left:offset,behavior:event.detail>0&&!reduced.matches?'smooth':'instant'});
  }));
  gallery.addEventListener('scroll',()=>{
   clearTimeout(scrollEnd);scrollEnd=setTimeout(()=>{
    const left=gallery.getBoundingClientRect().left+parseFloat(getComputedStyle(gallery).paddingLeft);
    const closest=pieces.reduce((best,piece,i)=>Math.abs(piece.getBoundingClientRect().left-left)<best.distance?{index:i,distance:Math.abs(piece.getBoundingClientRect().left-left)}:best,{index:0,distance:Infinity});
    mark(closest.index);
   },100);
  },{passive:true});
  reduced.addEventListener('change',event=>{if(event.matches)gallery.scrollTo({left:gallery.scrollLeft,behavior:'instant'});});
 }
}
const finishRoot=document.querySelector<HTMLElement>('[data-hero-finish]');
if(finishRoot){
 const image=finishRoot.querySelector<HTMLImageElement>('[data-hero-image]');
 const label=finishRoot.querySelector<HTMLElement>('[data-hero-finish-label]');
 const status=finishRoot.querySelector<HTMLElement>('[data-hero-finish-status]');
 const buttons=[...finishRoot.querySelectorAll<HTMLButtonElement>('[data-hero-finish-option]')];
 let revision=0,animation:Animation|undefined,previous:HTMLImageElement|undefined;
 const settle=()=>{animation?.cancel();animation=undefined;previous?.remove();previous=undefined;};
 buttons.forEach(button=>button.addEventListener('click',async event=>{
  if(!image||!label||!status)return;
  if(finishRoot.classList.contains('mobile-finish-scroll')){
   revision++;settle();finishRoot.dataset.finishFocus=button.dataset.heroFinishOption;
   label.textContent=button.dataset.heroFinishName||'';
   image.srcset=[480,600,900].map(width=>`/images/studio-${button.dataset.heroFinishOption}-${width}.webp ${width}w`).join(', ');
   image.src=`/images/studio-${button.dataset.heroFinishOption}-900.webp`;
   image.alt=`Ventana de PVC en acabado ${(button.dataset.heroFinishName||'blanco').toLowerCase()}`;
   buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
   finishRoot.dispatchEvent(new Event('finishfocus'));return;
  }
  if(button.getAttribute('aria-pressed')==='true'){
   revision++;buttons.forEach(item=>item.removeAttribute('aria-busy'));status.hidden=true;return;
  }
  const current=++revision,name=button.dataset.heroFinishName||'',next=new Image();
  buttons.forEach(item=>item.removeAttribute('aria-busy'));button.setAttribute('aria-busy','true');status.hidden=true;
  const color=button.dataset.heroFinishOption;
  next.sizes=image.sizes;
  next.srcset=[480,600,900].map(width=>`/images/studio-${color}-${width}.webp ${width}w`).join(', ');
  next.src=`/images/studio-${color}-900.webp`;
  try{
   await next.decode();if(current!==revision)return;
   settle();
   if(event.detail>0&&!reduced.matches){
    previous=image.cloneNode() as HTMLImageElement;previous.removeAttribute('data-hero-image');previous.className='finish-previous';previous.alt='';previous.setAttribute('aria-hidden','true');
    Object.assign(previous.style,{inset:'auto',top:`${image.offsetTop}px`,left:`${image.offsetLeft}px`,width:`${image.offsetWidth}px`,height:`${image.offsetHeight}px`,transform:getComputedStyle(image).transform});
    image.after(previous);
   }
   image.srcset=next.srcset;image.src=next.src;image.alt=`Ventana de PVC en acabado ${name.toLowerCase()}`;label.textContent=name;
   buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));status.hidden=true;status.textContent='';
   if(previous){
    const outgoing=previous;animation=outgoing.animate([{opacity:1},{opacity:0}],{duration:220,easing:ease});
    animation.finished.then(()=>outgoing.remove()).catch(()=>{});
   }
  }catch{if(current===revision){status.textContent='No pudimos cargar el acabado. Toca de nuevo para reintentar.';status.hidden=false;}}
  finally{button.removeAttribute('aria-busy');}
 }));
 reduced.addEventListener('change',event=>{if(event.matches)settle();});
}

// Native, reversible scroll scenes. No wheel/touch interception or animation library.
const scene=document.querySelector<HTMLElement>('[data-scene="finish"]');
if(scene)createFinishStory(scene);
const portal=document.querySelector<HTMLElement>('[data-portal-story]');
if(portal)createPortalStory(portal);
