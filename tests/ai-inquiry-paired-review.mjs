import {summarizeReviews} from './ai-inquiry-scorecard.mjs';
// Offline only. Explicit method mapping stays separate from blinded review packets.
export function blindPairs(cases,local,model,chooseSide){
 const ids=cases.map(c=>c.id);
 if(!ids.length||new Set(ids).size!==ids.length)throw Error('Invalid inventory');
 for(const rows of [local,model]){
 if(rows.length!==ids.length||new Set(rows.map(r=>r.id)).size!==ids.length||rows.some(r=>!ids.includes(r.id)||typeof r.output!=='string'||!r.output.trim()))throw Error('Incomplete outputs');
 }
 const mapping=[],packet=[];
 for(const c of cases){
 const side=chooseSide(c.id);if(side!=='A'&&side!=='B')throw Error('Invalid side');
 const a=local.find(r=>r.id===c.id).output,b=model.find(r=>r.id===c.id).output;
 mapping.push({id:c.id,local:side});
 packet.push({id:c.id,passage:c.passage,notes:c.notes??[],A:side==='A'?a:b,B:side==='A'?b:a});
 }
 return {packet,mapping};
}
export function pairedReport(ids,mapping,reviews){
 if(mapping.length!==ids.length||new Set(mapping.map(x=>x.id)).size!==ids.length||mapping.some(x=>!ids.includes(x.id)||!['A','B'].includes(x.local)))throw Error('Invalid mapping');
 const local=[],model=[];const preference={local:0,model:0,tie:0,neither:0};
 let delta=0;
 for(const r of reviews){
 const m=mapping.find(x=>x.id===r.id);if(!m||!['A','B','tie','neither'].includes(r.preference)||!r.A||!r.B)throw Error('Invalid paired review');
 const other=m.local==='A'?'B':'A';
 local.push({...r[m.local],id:r.id});model.push({...r[other],id:r.id});
 preference[r.preference==='tie'||r.preference==='neither'?r.preference:r.preference===m.local?'local':'model']++;
 }
 const l=summarizeReviews(ids,local),m=summarizeReviews(ids,model);
 const dims=['grounding','relevance','openness','culturalSensitivity','developmentalFit'];
 for(let i=0;i<local.length;i++)delta+=dims.reduce((n,d)=>n+model[i].scores[d]-local[i].scores[d],0);
 return {local:l,model:m,preference,meanPairedDifference:local.length?delta/local.length:null,complete:l.missing.length===0,requiresHumanDecision:true};
}
