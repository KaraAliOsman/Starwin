/** Create a small, oriented JPEG without metadata before any upload. */
export async function preparePhoto(file:File,maxEdge=480):Promise<Blob>{
 const bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});
 try{
  if(bitmap.width*bitmap.height>40_000_000)throw Error('La foto supera los 40 megapíxeles. Elige una más pequeña.');
  const scale=Math.min(1,maxEdge/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
  const context=canvas.getContext('2d');if(!context)throw Error('No se pudo preparar la foto.');
  context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(bitmap,0,0,canvas.width,canvas.height);
  return await new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('No se pudo preparar la foto.')),'image/jpeg',.88));
 }finally{bitmap.close();}
}
