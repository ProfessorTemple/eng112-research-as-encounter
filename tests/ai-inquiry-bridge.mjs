import {validateInquiryResponse} from './ai-inquiry-validator.mjs';

// Isolated prototype. No network transport is provided or enabled.
export function createInquiryBridge({request, fallback, timeoutMs=4000}) {
  let generation=0;
  return {
    cancel(){generation++;},
    async reflect({passage,notes=[],consent=false}) {
      const id=++generation;
      const local=reason=>id===generation?{kind:'local',reason,question:fallback(passage)}:{kind:'stale'};
      if(!consent)return local('not authorized');
      if(typeof passage!=='string'||!passage.trim()||passage.length>6000||!Array.isArray(notes)||notes.length>3||notes.some(n=>typeof n!=='string'||n.length>1500))return local('input bounds');
      if(typeof request!=='function')return local('unavailable');
      let timer;
      try {
        const response=await Promise.race([Promise.resolve().then(()=>request({passage,notes:[...notes]})),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('timeout')),timeoutMs);})]);
        if(id!==generation)return {kind:'stale'};
        const checked=validateInquiryResponse(response,[passage,...notes]);
        if(!checked.ok)return local('invalid response');
        if(checked.response.status==='abstain')return local('abstention');
        return {kind:'experimental',question:checked.response.question};
      }catch{return local('unavailable');}finally{clearTimeout(timer);}
    }
  };
}
