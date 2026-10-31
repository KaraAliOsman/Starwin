// Native scrolling is the clock. Each scene can stop or reverse at any point.
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const mobile=matchMedia('(max-width:900px)');
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const phase=(p:number,start:number,end:number)=>clamp((p-start)/(end-start));
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const smooth=(t:number)=>t*t*(3-2*t);
const position=(el:HTMLElement,stage:DOMRect)=>{const r=el.getBoundingClientRect();return {x:r.left-stage.left,y:r.top-stage.top,w:r.width,h:r.height};};

/** Reads only on resize/asset readiness; scroll frames only write transforms. */
function scrollClock(root:HTMLElement,measure:()=>void,paint:(p:number)=>void,reset:()=>void){
 let start=0,run=1,frame=0,enabled=false,last=-1;
 const draw=()=>{frame=0;if(!enabled||document.hidden)return;const p=clamp((scrollY-start)/run);if(p===last)return;last=p;paint(p);};
 const queue=()=>{if(!frame)frame=requestAnimationFrame(draw);};
 const refresh=()=>{
  enabled=!reduced.matches;
  if(!enabled){reset();last=-1;return;}
  measure();start=root.getBoundingClientRect().top+scrollY;
  // svh remains stable while a phone's address bar expands or retracts.
  const stage=root.firstElementChild as HTMLElement;
  const viewport=stage.offsetHeight+parseFloat(getComputedStyle(root).getPropertyValue('--story-nav'));
  run=Math.max(1,root.offsetHeight-viewport);
  root.dataset.scrollStart=String(start);root.dataset.scrollRun=String(run);last=-1;queue();
 };
 addEventListener('scroll',queue,{passive:true});addEventListener('resize',refresh,{passive:true});
 reduced.addEventListener('change',refresh);mobile.addEventListener('change',refresh);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){last=-1;queue();}});
 document.fonts.ready.then(refresh);
 return {refresh,redraw:()=>{last=-1;queue();}};
}

export function createPortalStory(root:HTMLElement){
 const stage=root.querySelector<HTMLElement>('.portal-story-stage')!;
 const plane=root.querySelector<HTMLElement>('.hero-portal')!;
 const originalPhoto=root.querySelector<HTMLElement>('.architectural-hero-photo')!;
 const frame=root.querySelector<HTMLElement>('.hero-product-depth')!;
 const frameImage=root.querySelector<HTMLElement>('.architectural-hero-object')!;
 const room=root.querySelector<HTMLElement>('.portal-room')!;
 const photo=room.querySelector<HTMLImageElement>('img')!;
 const intro=root.querySelector<HTMLElement>('.hero-intro')!;
 const arrival=root.querySelector<HTMLElement>('.portal-arrival')!;
 let ready=false;
 let geometry:{w:number;h:number;px:number;py:number;fx:number;fy:number;zoom:number;imageW:number;imageH:number;initialScale:number;ix:number;iy:number;ex:number;ey:number;points:number[][]}|undefined;
 const reset=()=>{
  root.classList.remove('story-live');delete root.dataset.storyProgress;
  for(const el of [plane,frameImage,intro,room,photo,arrival]){el.style.removeProperty('transform');el.style.removeProperty('opacity');el.style.removeProperty('clip-path');}
  arrival.setAttribute('aria-hidden','true');
 };
 const clock=scrollClock(root,()=>{
  if(!ready)return;
  plane.style.removeProperty('transform');
  const bounds=stage.getBoundingClientRect(),p=position(originalPhoto,bounds),f=position(frame,bounds),planeBox=position(plane,bounds);
  const h=Math.min(f.h,f.w*1.25),w=h*.8,left=f.x+(f.w-w)/2,top=f.y+(f.h-h)/2;
  // The camera travels through the left pane; it never flies into the centre post.
  const fx=left+w*.32,fy=top+h*.49;
  const aspect=photo.naturalWidth/photo.naturalHeight;
  const imageW=Math.max(bounds.width,bounds.height*aspect),imageH=imageW/aspect;
  const initialW=Math.max(p.w,p.h*aspect);
  geometry={w:bounds.width,h:bounds.height,px:planeBox.x,py:planeBox.y,fx,fy,zoom:Math.max(bounds.width/(w*.30),bounds.height/(h*.64))*1.1,
   imageW,imageH,initialScale:initialW/imageW,ix:p.x+(p.w-initialW)*.70,iy:p.y+(p.h-initialW/aspect)*(innerWidth<=700?.55:.5),ex:(bounds.width-imageW)*.70,ey:(bounds.height-imageH)*.5,
   points:[[p.x,p.y],[p.x+w*.76,p.y+h*.035],[p.x+p.w,p.y+h*.035],[p.x+p.w,p.y+h*.80],[p.x+w*.76,p.y+h*.80],[p.x,p.y+p.h]]};
  photo.style.width=`${imageW}px`;photo.style.height=`${imageH}px`;
  root.classList.add('story-live');
 },p=>{
  if(!geometry||!ready)return;
  const g=geometry,t=smooth(phase(p,.04,.78)),scale=Math.pow(g.zoom,t);
  const x=(g.w/2-g.fx)*t+g.fx*(1-scale),y=(g.h/2-g.fy)*t+g.fy*(1-scale);
  plane.style.transform=`translate3d(${x+g.px*(scale-1)}px,${y+g.py*(scale-1)}px,0) scale(${scale})`;
  const aperture=g.points.map(([a,b])=>[a*scale+x,b*scale+y]);
  room.style.clipPath=`polygon(${aperture.map(([a,b])=>`${a.toFixed(2)}px ${b.toFixed(2)}px`).join(',')})`;
  // Keep the photographic world behind every newly exposed part of the opening.
  const minX=Math.max(0,Math.min(...aperture.map(p=>p[0]))),maxX=Math.min(g.w,Math.max(...aperture.map(p=>p[0])));
  const minY=Math.max(0,Math.min(...aperture.map(p=>p[1]))),maxY=Math.min(g.h,Math.max(...aperture.map(p=>p[1])));
  const imageScale=Math.max(mix(g.initialScale,1,t),(maxX-minX)/g.imageW,(maxY-minY)/g.imageH);
  const imageX=Math.min(minX,Math.max(maxX-g.imageW*imageScale,mix(g.ix,g.ex,t)));
  const imageY=Math.min(minY,Math.max(maxY-g.imageH*imageScale,mix(g.iy,g.ey,t)));
  photo.style.transform=`translate3d(${imageX}px,${imageY}px,0) scale(${imageScale})`;
  const leaving=smooth(phase(p,.04,.25)),entering=smooth(phase(p,.81,.95));
  intro.style.opacity=String(1-leaving);
  frameImage.style.opacity=String(1-smooth(phase(p,.80,.91)));
  arrival.style.transform=`translate3d(0,${24*(1-entering)}px,0)`;arrival.style.opacity=String(entering);
  arrival.setAttribute('aria-hidden',String(entering<.5));
  root.dataset.storyProgress=p.toFixed(4);root.dataset.storyPhase=p<.25?'product':p<.81?'crossing':'room';
 },reset);
 Promise.all([photo.decode(),...Array.from(root.querySelectorAll<HTMLImageElement>('.hero-portal img')).map(img=>img.decode())]).then(()=>{ready=true;clock.refresh();}).catch(()=>{root.classList.add('story-unavailable');reset();});
 photo.addEventListener('load',()=>{if(ready)clock.refresh();});
}

export function createFinishStory(root:HTMLElement){
 const plane=root.querySelector<HTMLElement>('.finish-object-plane')!;
 const main=root.querySelector<HTMLElement>('.finish-window-motion')!;
 const left=root.querySelector<HTMLElement>('.finish-echo--dark')!;
 const right=root.querySelector<HTMLElement>('.finish-echo--oak')!;
 const labels=root.querySelector<HTMLElement>('.finish-lineup-labels')!;
 const layers=[left,main,right];
 let width=0,targetScale=1,distance=0;
 const reset=()=>{
  root.classList.remove('is-live','mobile-finish-scroll');root.classList.add('is-rest');root.dataset.sceneState='rest';
  delete root.dataset.sceneProgress;delete root.dataset.scenePhase;
  for(const el of [...layers,labels]){el.style.removeProperty('transform');el.style.removeProperty('opacity');el.style.removeProperty('z-index');}
 };
 const clock=scrollClock(root,()=>{
  root.classList.add('is-live');root.classList.remove('is-rest');root.classList.toggle('mobile-finish-scroll',mobile.matches);root.dataset.sceneState='live';
  root.dataset.finishFocus=root.querySelector<HTMLElement>('[data-hero-finish-option][aria-pressed="true"]')?.dataset.heroFinishOption||'white';
  width=plane.offsetWidth;
  targetScale=mobile.matches?Math.min(.55,(innerWidth-40)/(width*3.3)):1;
  distance=mobile.matches?innerWidth*.32:width*1.10;
 },p=>{
  const t=smooth(phase(p,.08,.76)),focus=root.dataset.finishFocus||'white';
  const scale=mix(mobile.matches?1:.9,targetScale,t);
  const offset=mobile.matches?distance*t:mix(width*.84,distance,t);
  for(const [index,el]of layers.entries()){
   const selected=mobile.matches&&focus===['anthracite','white','oak'][index];
   const emphasis=selected?t*.035:0;
   el.style.transform=`translate3d(${(index-1)*offset}px,${mobile.matches?(selected?-14*t:0):18*(1-t)}px,0) scale(${scale+emphasis})`;
   el.style.opacity='1';el.style.zIndex=String(selected?4:index===1?3:1);
  }
  labels.style.opacity=String(smooth(phase(p,.76,.88)));
  root.dataset.sceneProgress=p.toFixed(4);root.dataset.scenePhase=p<.08?'portrait':p<.76?'unfold':'compare';
 },reset);
 root.addEventListener('finishfocus',clock.redraw);
 const warm=new IntersectionObserver(entries=>{
  if(!entries.some(entry=>entry.isIntersecting))return;
  warm.disconnect();
  const images=[...root.querySelectorAll<HTMLImageElement>('.finish-window-motion img,.finish-echo img')];
  images.forEach(image=>image.loading='eager');
  Promise.all(images.map(image=>image.decode().catch(()=>{}))).then(clock.refresh);
 },{rootMargin:'150% 0px'});
 warm.observe(root);
 clock.refresh();
}
