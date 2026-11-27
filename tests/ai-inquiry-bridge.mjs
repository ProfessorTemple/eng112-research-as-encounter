import {validateInquiryResponse} from './ai-inquiry-validator.mjs';

// Isolated prototype. No network transport is provided or enabled.
export function createInquiryBridge({request, fallback, timeoutMs=4000}) {
  let generation=0;
  let active=null;
  return {
    cancel(){generation++;active?.abort();active=null;},
    async reflect({passage,notes=[],consent=false}) {
      const id=++generation;
      active?.abort();active=null;
      const local=reason=>id===generation?{kind:'local',reason,question:fallback(passage)}:{kind:'stale'};
      if(consent!==true)return local('not authorized');
      if(typeof passage!=='string'||!passage.trim()||passage.length>6000||!Array.isArray(notes)||notes.length>3||notes.some(n=>typeof n!=='string'||n.length>1500))return local('input bounds');
      if(typeof request!=='function')return local('unavailable');
      const controller=new AbortController();active=controller;
      let timer,onAbort;
      try {
        const response=await Promise.race([Promise.resolve().then(()=>controller.signal.aborted?Promise.reject(new Error('cancelled')):request({passage,notes:[...notes],signal:controller.signal})),new Promise((_,reject)=>{onAbort=()=>reject(new Error('aborted'));controller.signal.addEventListener('abort',onAbort,{once:true});timer=setTimeout(()=>controller.abort(),timeoutMs);})]);
        if(id!==generation)return {kind:'stale'};
        const checked=validateInquiryResponse(response,[passage,...notes]);
        if(!checked.ok)return local('invalid response');
        if(checked.response.status==='abstain')return local('abstention');
        return {kind:'experimental',question:checked.response.question};
      }catch{return local('unavailable');}finally{clearTimeout(timer);controller.signal.removeEventListener('abort',onAbort);if(active===controller)active=null;}
    }
  };
}
