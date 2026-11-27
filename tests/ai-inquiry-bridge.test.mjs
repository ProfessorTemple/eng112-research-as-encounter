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
console.log('Bridge scenarios passed');
