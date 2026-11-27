import assert from 'node:assert/strict';
import {createInquiryBridge} from './ai-inquiry-bridge.mjs';
const passage='The oak remembered me.';
const valid={status:'question',question:'What does remembering mean here?',evidence:[passage],rationale_type:'interpretation'};
let calls=0;
const fallback=()=> 'Which detail would you explore?';
const bridge=createInquiryBridge({request:async()=>{calls++;return valid;},fallback});
assert.equal((await bridge.reflect({passage})).kind,'local');
assert.equal(calls,0);
assert.equal((await bridge.reflect({passage,consent:true})).kind,'experimental');
assert.equal(calls,1);
assert.equal((await bridge.reflect({passage:'',consent:true})).kind,'local');
assert.equal(calls,1);
for(const request of [async()=>null,async()=>{throw Error('offline');},async()=>({status:'abstain',question:'',evidence:[],rationale_type:'uncertainty'}),()=>new Promise(()=>{})]){
 const b=createInquiryBridge({request,fallback,timeoutMs:5});
 assert.equal((await b.reflect({passage,consent:true})).kind,'local');
}
let resolve;
const b=createInquiryBridge({request:()=>new Promise(r=>{resolve=r;}),fallback});
const pending=b.reflect({passage,consent:true});
await Promise.resolve();
b.cancel();resolve(valid);
assert.equal((await pending).kind,'stale');
let signal;
const cooperative=createInquiryBridge({fallback,request:({signal:s})=>{signal=s;return new Promise((_,reject)=>s.addEventListener('abort',()=>reject(Error('aborted')),{once:true}));}});
const running=cooperative.reflect({passage,consent:true});
await Promise.resolve();
cooperative.cancel();
assert.equal(signal.aborted,true);
assert.equal((await running).kind,'stale');
let timeoutSignal;
const timed=createInquiryBridge({fallback,timeoutMs:5,request:({signal})=>{timeoutSignal=signal;return new Promise(()=>{});}});
assert.equal((await timed.reflect({passage,consent:true})).kind,'local');
assert.equal(timeoutSignal.aborted,true);
for(const consent of ['false','true',1,{},null]){
 const before=calls;
 assert.equal((await bridge.reflect({passage,consent})).kind,'local');
 assert.equal(calls,before);
}
const unresponsive=createInquiryBridge({fallback,timeoutMs:10000,request:()=>new Promise(()=>{})});
const stuck=unresponsive.reflect({passage,consent:true});
await Promise.resolve();
unresponsive.cancel();
let watchdog;
try {
 const result=await Promise.race([stuck,new Promise((_,reject)=>{watchdog=setTimeout(()=>reject(Error('cancellation did not settle')),250);})]);
 assert.equal(result.kind,'stale');
}finally{clearTimeout(watchdog);}
const selectedNotes=['Original authorized note'];
let received;
const snapshot=createInquiryBridge({fallback,request:async({notes})=>{received=notes;return valid;}});
const inFlight=snapshot.reflect({passage,notes:selectedNotes,consent:true});
selectedNotes.push('Unapproved later note');
assert.equal((await inFlight).kind,'experimental');
assert.deepEqual(received,['Original authorized note']);
const changed=['Original authorized note'];
const grounding=createInquiryBridge({fallback,request:async()=>({...valid,evidence:['Unapproved later note']})});
const checking=grounding.reflect({passage,notes:changed,consent:true});
changed.push('Unapproved later note');
assert.equal((await checking).kind,'local');
console.log('Bridge scenarios passed');
