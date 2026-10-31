import type { EstimateItem } from './model';
import { COLORS, isSliding, itemTree } from './model';
import { DIVIDER_MM, FRAME_MM, panelLayout } from './panels';
import type { WindowPanel } from './pricing/types';
import type { IntentNode, Opening } from '../src/features/canvas/intentEditing';
import { declareSlidingTravel, SLIDING_PRESETS } from '../src/features/canvas/intentEditing';
import { wrapTreeAsProduct } from '../src/features/canvas/productEditing';
import { resolveMembers, withFinishMembers } from '../src/features/canvas/members';
import type { FinishColor, ResolvedFinish } from '../src/contracts/models';

export function productFor(item:EstimateItem) {
  if(!isSliding(item)) {
    const root=itemTree(item),layout=panelLayout(root,item.widthMm,item.heightMm);
    const convert=(panel:WindowPanel,isRoot=false):IntentNode=>{
      const l=layout.find(l=>l.panel.id===panel.id)!;
      if(panel.splitType!=='none')return {id:panel.id,type:panel.splitType==='horizontal'?'SPLIT_H':'SPLIT_V',split_offset_mm:String(l.axis!-(isRoot?0:panel.splitType==='horizontal'?l.aperture.y:l.aperture.x)),children:panel.children.map(p=>convert(p))};
      const opening:Opening=panel.type==='fixed'?'FIXED':panel.type==='awning'?'AWNING':panel.type==='casement-left'?'TURN_LEFT':panel.type==='casement-right'?'TURN_RIGHT':panel.type==='tilt-turn-left'?'TILT_TURN_LEFT':'TILT_TURN_RIGHT';
      return {id:panel.id,type:'BAY',opening_type:opening,opening_use:'WINDOW',glass_thickness_mm:item.glass==='SIMPLE'?'4':item.glass==='TRIPLE'?'36':'24',glass_spec:item.glass,...(panel.type.startsWith('casement')||panel.type.startsWith('tilt-turn')?{handle_height_mm:String(item.heightMm-l.aperture.y-l.aperture.h/2)}:{})};
    };
    return wrapTreeAsProduct({id:'root',type:'ROOT',children:[convert(root,true)]},String(item.widthMm),String(item.heightMm));
  }
  let opening:Opening = item.preset==='fixed'?'FIXED':item.preset==='awning'?'AWNING':item.preset==='casement'?(item.side==='left'?'TURN_LEFT':'TURN_RIGHT'):item.preset==='tilt'?(item.side==='left'?'TILT_TURN_LEFT':'TILT_TURN_RIGHT'):item.preset==='sliding3'?'SLIDING_3L':'SLIDING_2L';
  const bay:IntentNode={id:'b1',type:'BAY',opening_type:opening,opening_use:'WINDOW',glass_thickness_mm:item.glass==='SIMPLE'?'4':item.glass==='TRIPLE'?'36':'24',glass_spec:item.glass};
  // Presentation placement shared by 2D and 3D, independent of the price tree.
  if(item.preset==='casement'||item.preset==='tilt')bay.handle_height_mm=String(item.heightMm/2);
  if(item.preset==='sliding2'||item.preset==='sliding3') bay.sliding_layout=declareSlidingTravel(SLIDING_PRESETS[opening]!);
  if(item.preset==='mono') {bay.opening_type='SLIDING';bay.sliding_layout={tracks:2,panels:[{slot:'S1',kind:'FIXED',track:null,travel:null},{slot:'S2',kind:'MOVING',track:1,travel:'LEFT'}]};}
  return wrapTreeAsProduct({id:'root',type:'ROOT',children:[bay]},String(item.widthMm),String(item.heightMm));
}
const base=resolveMembers(undefined);
// Neutral presentation widths, shared with panelLayout. These are not
// manufacturer-certified profile sections and never alter the price engine.
base.frame={...base.frame,faceWidthMm:FRAME_MM};
base.mullionV={...base.frame,faceWidthMm:DIVIDER_MM};
base.mullionH={...base.frame,faceWidthMm:DIVIDER_MM};
export function membersFor(item:EstimateItem) {
  const c=COLORS.find(c=>c.id===item.color)!;
  const linear=c.hex.slice(1).match(/.{2}/g)!.map(v=>{const n=parseInt(v,16)/255;return String(n<=.04045?n/12.92:((n+.055)/1.055)**2.4);});
  const color:FinishColor={code:c.id,manufacturer_code:c.id,name:c.name,kind:c.wood?'WOOD_EFFECT':'SOLID',linear_rgb:linear,gloss:'0.2',texture_path:null,approximate:true,source:'Starwin: acabado orientativo',synthetic:true};
  const finish:ResolvedFinish={combination:{code:c.id,interior:c.id,exterior:c.id,base:null,reinforcement_required:false,reinforcement_stock_code:'',glass_clearance_mm:'0',max_position_width_mm:null,max_position_height_mm:null,max_leaf_width_mm:null,max_leaf_height_mm:null,extra_lead_days:null,allowed_handle_colors:[],source:'Starwin',synthetic:true},interior:color,exterior:color,base:null,profile_skus:{}};
  return withFinishMembers(base,finish);
}
