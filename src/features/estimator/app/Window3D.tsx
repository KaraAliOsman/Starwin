import { Component, useCallback, useMemo, useState, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { buildScene3D } from '../src/features/canvas/Product3DScene';
import { Model3DStage } from '../src/features/canvas/Model3DStage';
import { STUDIO_TONE_MAPPING } from '../src/features/canvas/studioRig3d';
import { webglAvailable } from '../src/features/canvas/webglAvailable';
import type { LeafPoseState } from '../src/features/canvas/poses3d';
import { productFor, membersFor } from './visual';
import type { EstimateItem } from './model';
class Boundary extends Component<{children:ReactNode;onError:()=>void},{failed:boolean}> {
  state={failed:false};static getDerivedStateFromError(){return {failed:true};}componentDidCatch(){this.props.onError();}render(){return this.state.failed?null:this.props.children;}
}
const noop=()=>{};
export default function Window3D({item}:{item:EstimateItem}) {
  const product=useMemo(()=>productFor(item),[item.preset,item.side,item.widthMm,item.heightMm,item.glass,item.panelTree]);
  const members=useMemo(()=>membersFor(item),[item.color]);
  const scene=useMemo(()=>buildScene3D(product,members),[product,members]);
  const [open,setOpen]=useState(false),[tilt,setTilt]=useState(false),[rotate,setRotate]=useState(false),[exterior,setExterior]=useState(false),[error,setError]=useState(false),[ready,setReady]=useState(false);
  const onError=useCallback(()=>setError(true),[]);
  const onExport=useCallback(()=>setReady(true),[]);
  const states=useMemo(()=>Object.fromEntries(scene.modules.map(m=>{
    // A sliding opening stacks one moving leaf over its neighbour. Moving
    // every leaf in opposite directions merely swaps their closed positions.
    const slidingLeaf=m.leaves.find(l=>l.kind==='slide'&&l.travel>0)?.leafId;
    return [m.moduleId,Object.fromEntries(m.leaves.map(l=>[l.leafId,{
      amount:open&&(!tilt||l.kind==='tilt_turn')&&(l.kind!=='slide'||l.leafId===slidingLeaf)?1:0,
      mode:tilt&&l.kind==='tilt_turn'?'tilt':'open',
    } as LeafPoseState]))];
  })),[scene,open,tilt]);
  if(error||!webglAvailable()) return <div className="fallback" role="status">El 3D no está disponible en este equipo. Puedes seguir con el dibujo y descargar tu PDF.</div>;
  const hasLeaves=scene.modules.some(m=>m.leaves.length>0);
  return <div className="consumer-3d">
    <div className="scene-wrap">
      <Boundary onError={onError}><Canvas shadows="percentage" frameloop="demand" dpr={[1.5,2]} gl={{antialias:true,toneMapping:STUDIO_TONE_MAPPING}} camera={{position:[0,0,scene.radius*4],fov:38,near:1,far:scene.radius*30}}>
        <Model3DStage scene={scene} states={states} selection={null} theme="light" mode="commercial" preset={exterior?'exterior':'interior'} consumer interactive={rotate} clip={false} explode={false} wall={false} onPick={noop} onExport={onExport} onError={onError}/>
      </Canvas></Boundary>
      {!rotate&&<button className="rotate-cover" onClick={()=>setRotate(true)} aria-label="Activar giro del modelo 3D"><span>↻ Toca para girar</span></button>}
      {rotate&&<button className="finish-rotate" onClick={()=>setRotate(false)}>Terminar de girar ✓</button>}
      {!ready&&<span className="scene-loading" role="status">Preparando tu ventana…</span>}
    </div>
    <div className="scene-actions">
      {hasLeaves&&<button className="soft" disabled={!ready} onClick={()=>{setTilt(false);setOpen(!open);}} aria-pressed={open&&!tilt}>{open&&!tilt?'Cerrar ventana':'Abrir ventana'}</button>}
      {scene.modules.some(m=>m.leaves.some(l=>l.kind==='tilt_turn'))&&<button className="soft" disabled={!ready} onClick={()=>{setOpen(!(open&&tilt));setTilt(true);}} aria-pressed={open&&tilt}>Ventilar</button>}
      <button className="soft" disabled={!ready} onClick={()=>setExterior(!exterior)}>{exterior?'Ver interior':'Ver exterior'}</button>
    </div>
  </div>;
}
