// Experimental local context selection. No network or persistence.
const kinds=new Set(['encounter','assumption','observation','interpretation','significance','reading','interview','question','draft']);
export function buildContext(records,selectedIds){
 if(!Array.isArray(records)||!Array.isArray(selectedIds)||selectedIds.length>3||new Set(selectedIds).size!==selectedIds.length)throw Error('Invalid selection');
 const inventory=new Map();
 for(const r of records){
  if(!r||typeof r.id!=='string'||!r.id.trim()||inventory.has(r.id)||!kinds.has(r.kind)||typeof r.text!=='string')throw Error('Invalid record');
  inventory.set(r.id,r);
 }
 return selectedIds.map(id=>{
  const r=inventory.get(id);
  if(!r||!r.text.trim()||r.text.length>1500)throw Error('Unavailable or oversized selection');
  return {id:r.id,kind:r.kind,text:r.text};
 });
}
