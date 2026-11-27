import { pipeline, env } from '@huggingface/transformers';
import { readFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
env.allowLocalModels=false;
const model=process.env.EMBEDDING_MODEL||'Xenova/all-MiniLM-L6-v2';
console.log('Model',model);
const start=performance.now();
const embed=await pipeline('feature-extraction',model,{dtype:'q8',device:'cpu'});
console.log('Model load milliseconds',Math.round(performance.now()-start));
const cosine=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
for(const name of ['semantic-benchmark','conceptual-heldout','conceptual-validation-2']){
 const cases=JSON.parse(readFileSync(new URL('./'+name+'.json',import.meta.url),'utf8'));
 const rows=[];
 for(const c of cases){
  const t=performance.now();
  const inputs=[c.query,c.related,c.distractor].map((x,i)=>model.includes('e5')?(i===0?'query: ':'passage: ')+x:x);
  const vectors=(await embed(inputs,{pooling:'mean',normalize:true})).tolist();
  const related=cosine(vectors[0],vectors[1]), distractor=cosine(vectors[0],vectors[2]);
  rows.push({id:c.id,related:+related.toFixed(4),distractor:+distractor.toFixed(4),margin:+(related-distractor).toFixed(4),ms:Math.round(performance.now()-t)});
 }
 console.table(rows);
 console.log(name, 'strict wins',rows.filter(r=>r.margin>0).length,'of',rows.length);
}
console.log('Node memory bytes',process.memoryUsage());

const lenses=JSON.parse(readFileSync(new URL('./lens-prototypes.json',import.meta.url),'utf8'));
const fresh=[
 ['The potter adjusted her grip as the wet vessel sagged.','material-agency'],
 ['My grandfather showed me how to mend nets as his parents had.','inheritance'],
 ['Nobody noticed the hours she spent preparing meals for her ill spouse.','care-labor'],
 ['After closing my eyes I became aware of the insects around me.','situated-perception'],
 ['When our neighborhood disappeared I felt estranged from my own history.','place-identity'],
 ['I saw the fox turn away but cannot establish why.','epistemic-restraint'],
 ['The compost feeds the garden that feeds our household.','reciprocity'],
 ['The bat navigated in darkness that left me helpless.','umwelt'],
 ['Her employer dictated every break she could take.','autonomy'],
 ['After years of practice my fingers found the notes without looking.','embodied-skill'],
 ['Once I called the dandelion a nuisance I stopped noticing its flowers.','naming'],
 ['Each spring the same pond revealed a different shoreline.','temporal-change'],
 ['My sorrow was a room with no windows.','metaphor'],
 ['The morning felt strange without the familiar chorus of sparrows.','absence'],
 ['Without the tiny insects the orchard would bear little fruit.','interdependence'],
 ['Growing up on a farm shaped how I understood the documentary.','positionality'],
 ['The article described the harvest without interviewing anyone who picked it.','representation'],
 ['The fence kept the animals safe but prevented them from roaming.','productive-tension'],
 ['Charred trunks revealed a disturbance long before my arrival.','ecological-memory'],
 ['One bird called and the others changed direction.','communication'],
 ['The bus ticket costs five dollars.',null],
 ['The receipt lists three items and a subtotal.',null],
 ['The appointment is scheduled for Tuesday at noon.',null]
];
const prefix=(x,q)=>model.includes('e5')?(q?'query: ':'passage: ')+x:x;
const profiles=lenses.map(l=>l.description+' '+l.anchors.join(' '));
const lv=(await embed(profiles.map(x=>prefix(x,false)),{pooling:'mean',normalize:true})).tolist();
for(const [query,expected] of fresh){
 const q=(await embed([prefix(query,true)],{pooling:'mean',normalize:true})).tolist()[0];
 const ranked=lenses.map((l,i)=>({id:l.id,score:+cosine(q,lv[i]).toFixed(4)})).sort((a,b)=>b.score-a.score);
 const threshold=model.includes('e5')?0.77:0.12;
 const accepted=ranked[0].score>=threshold;
 console.log('LENS',JSON.stringify({query,expected,top:ranked.slice(0,2),top2:expected?ranked.slice(0,2).some(x=>x.id===expected):null,accepted,threshold}));
}

 // Compare separate concept anchors against concatenated profiles.
const anchorTexts=lenses.flatMap(l=>[l.description,...l.anchors].map(x=>({id:l.id,text:x})));
const av=(await embed(anchorTexts.map(a=>prefix(a.text,false)),{pooling:'mean',normalize:true})).tolist();
for(const [query,expected] of fresh){
 const q=(await embed([prefix(query,true)],{pooling:'mean',normalize:true})).tolist()[0];
 const ranked=lenses.map(l=>{
  const scores=anchorTexts.map((a,i)=>a.id===l.id?cosine(q,av[i]):-Infinity).filter(Number.isFinite).sort((a,b)=>b-a);
  return {id:l.id,score:+((scores[0]+scores[1])/2).toFixed(4)};
 }).sort((a,b)=>b.score-a.score);
 console.log('ANCHOR',JSON.stringify({query,expected,top:ranked.slice(0,2),top2:expected?ranked.slice(0,2).some(x=>x.id===expected):null}));
}

 // Independent validation of a conservative two-view consensus gate.
const validation=[
 {q:'The reeds bent under the current and redirected my paddle.',ok:['material-agency','embodied-skill']},
 {q:'My aunt taught me a song her grandmother sang while working.',ok:['inheritance','embodied-skill']},
 {q:'The supervisor refused to let us decide when to rest.',ok:['autonomy']},
 {q:'I cannot know whether the squirrel was warning its companions.',ok:['epistemic-restraint','communication']},
 {q:'The bee detected patterns on petals that I could not see.',ok:['umwelt','situated-perception']},
 {q:'I called the vacant lot worthless until I saw what lived there.',ok:['naming','situated-perception','positionality']},
 {q:'The spreadsheet contains seven columns.',ok:[]},
 {q:'The meeting link is in the email.',ok:[]},
 {q:'I bought a blue notebook yesterday.',ok:[]},
 {q:'The package weighs two pounds.',ok:[]}
];
for(const {q,ok} of validation){
 const v=(await embed([prefix(q,true)],{pooling:'mean',normalize:true})).tolist()[0];
 const p=lenses.map((l,i)=>({id:l.id,score:cosine(v,lv[i])})).sort((a,b)=>b.score-a.score);
 const a=lenses.map(l=>{const t=anchorTexts.map((x,i)=>x.id===l.id?cosine(v,av[i]):-Infinity).filter(Number.isFinite).sort((a,b)=>b-a);return {id:l.id,score:(t[0]+t[1])/2};}).sort((a,b)=>b.score-a.score);
 const threshold=model.includes('e5')?0.78:0.16;
 const chosen=p.slice(0,2).filter(x=>x.score>=threshold&&a.slice(0,2).some(y=>y.id===x.id&&y.score>=threshold)).map(x=>x.id);
 console.log('GATE',JSON.stringify({q,ok,chosen,hit:chosen.some(x=>ok.includes(x)),unlisted:chosen.filter(x=>!ok.includes(x)),abstained:!chosen.length}));
}

 // Explicit evidence cues complement semantic ranking, never infer conclusions.
const cues={
 autonomy:[/\b(supervisor|employer|manager|boss)\b/i,/\b(refused|dictated|forbade|permission|decide|choose)\b/i],
 'epistemic-restraint':[/\b(cannot|can't|could not|uncertain|unsure)\b/i,/\b(know|tell|establish|whether|why|intended)\b/i],
 naming:[/\b(called|named|labelled|labeled|described)\b/i,/\b(worthless|nuisance|weed|pest|valuable|ugly)\b/i]
};
const independent=[
 {q:'Our manager would not give us permission to choose our shifts.',ok:['autonomy']},
 {q:'I am unsure whether the crow intended to alert me.',ok:['epistemic-restraint','communication']},
 {q:'We labeled the marsh worthless before discovering its wildlife.',ok:['naming','situated-perception','positionality']},
 {q:'The manager called to confirm the appointment.',ok:[]},
 {q:'I cannot tell the time without my watch.',ok:[]},
 {q:'The package was labeled with my address.',ok:[]},
 {q:'The river carried my canoe sideways despite my efforts.',ok:['material-agency','embodied-skill']},
 {q:'My grandmother passed down the stories she heard as a child.',ok:['inheritance']},
 {q:'The new calendar has twelve pages.',ok:[]}
];
for(const {q,ok} of independent){
 const v=(await embed([prefix(q,true)],{pooling:'mean',normalize:true})).tolist()[0];
 const p=lenses.map((l,i)=>({id:l.id,score:cosine(v,lv[i])})).sort((a,b)=>b.score-a.score);
 const a=lenses.map(l=>{const t=anchorTexts.map((x,i)=>x.id===l.id?cosine(v,av[i]):-Infinity).filter(Number.isFinite).sort((a,b)=>b-a);return {id:l.id,score:(t[0]+t[1])/2};}).sort((a,b)=>b.score-a.score);
 const threshold=model.includes('e5')?0.78:0.16;
 const base=p.slice(0,2).filter(x=>x.score>=threshold&&a.slice(0,2).some(y=>y.id===x.id&&y.score>=threshold)).map(x=>x.id);
 const supported=Object.entries(cues).filter(([id,patterns])=>patterns.every(t=>t.test(q))&&p.slice(0,5).some(x=>x.id===id)&&a.slice(0,5).some(x=>x.id===id)).map(([id])=>id);
 const chosen=[...new Set([...supported,...base])].slice(0,2);
 console.log('HYBRID',JSON.stringify({q,ok,base,chosen,hit:chosen.some(x=>ok.includes(x)),unlisted:chosen.filter(x=>!ok.includes(x)),abstained:!chosen.length}));
}

 // Test a contrastive relevance gate against neutral administrative profiles.
const neutral=['Scheduling appointments and confirming meeting times.','Counting items, pages, columns, prices and measurements.','Routine purchases and package labels or addresses.','Reading a clock or checking the time.'];
const nv=(await embed(neutral.map(x=>prefix(x,false)),{pooling:'mean',normalize:true})).tolist();
const contrastCases=[
 {q:'The clock says half past three.',ok:[]},
 {q:'Please confirm the delivery address.',ok:[]},
 {q:'The invoice totals forty dollars.',ok:[]},
 {q:'The calendar lists the next meeting.',ok:[]},
 {q:'My shift schedule leaves me no choice about when I see my children.',ok:['autonomy','care-labor']},
 {q:'The price of the seeds made me wonder who can afford to grow food.',ok:['autonomy','reciprocity']},
 {q:'I used to call the creek dirty until I learned what lived in it.',ok:['naming','situated-perception']},
 {q:'The wind forced my bicycle toward the ditch.',ok:['material-agency','embodied-skill']}
];
for(const {q,ok} of contrastCases){
 const v=(await embed([prefix(q,true)],{pooling:'mean',normalize:true})).tolist()[0];
 const neutralMax=Math.max(...nv.map(x=>cosine(v,x)));
 const ranked=lenses.map((l,i)=>({id:l.id,score:cosine(v,lv[i])})).sort((a,b)=>b.score-a.score);
 const anchor=lenses.map(l=>{const t=anchorTexts.map((x,i)=>x.id===l.id?cosine(v,av[i]):-Infinity).filter(Number.isFinite).sort((a,b)=>b-a);return {id:l.id,score:(t[0]+t[1])/2};}).sort((a,b)=>b.score-a.score);
 const threshold=model.includes('e5')?0.78:0.16;
 const margin=model.includes('e5')?0.005:0.025;
 const chosen=ranked.slice(0,2).filter(x=>x.score>=threshold&&x.score>neutralMax+margin&&anchor.slice(0,3).some(y=>y.id===x.id)).slice(0,1).map(x=>x.id);
 console.log('CONTRAST',JSON.stringify({q,ok,neutralMax,top:ranked.slice(0,2),chosen,hit:chosen.some(x=>ok.includes(x)),abstained:!chosen.length}));
}

 // Separate student invitation from automatic intervention: evaluate candidate menus
 // without treating an unselected perspective as an assertion.
const menuCases=[
 {q:'My landlord decides whether I can plant vegetables outside.',ok:['autonomy'],mode:'requested'},
 {q:'I thought the fallen branch was useless until beetles emerged.',ok:['naming','situated-perception','interdependence'],mode:'requested'},
 {q:'The tide pulled my feet out from under me.',ok:['material-agency','embodied-skill'],mode:'requested'},
 {q:'My grandmother taught me to recognize rain by its smell.',ok:['inheritance','situated-perception','embodied-skill'],mode:'requested'},
 {q:'The office opens at nine.',ok:[],mode:'automatic'},
 {q:'The receipt is in my bag.',ok:[],mode:'automatic'},
 {q:'The river carried my canoe sideways despite my efforts.',ok:['material-agency','embodied-skill'],mode:'automatic'}
];
for(const {q,ok,mode} of menuCases){
 const v=(await embed([prefix(q,true)],{pooling:'mean',normalize:true})).tolist()[0];
 const p=lenses.map((l,i)=>({id:l.id,score:cosine(v,lv[i])})).sort((a,b)=>b.score-a.score);
 const a=lenses.map(l=>{const t=anchorTexts.map((x,i)=>x.id===l.id?cosine(v,av[i]):-Infinity).filter(Number.isFinite).sort((a,b)=>b-a);return {id:l.id,score:(t[0]+t[1])/2};}).sort((a,b)=>b.score-a.score);
 const fused=lenses.map(l=>({id:l.id,score:1/(3+p.findIndex(x=>x.id===l.id))+1/(3+a.findIndex(x=>x.id===l.id))})).sort((x,y)=>y.score-x.score);
 const chosen=mode==='requested'?fused.slice(0,2).map(x=>x.id):[];
 console.log('MENU',JSON.stringify({q,ok,mode,chosen,hit:chosen.some(x=>ok.includes(x)),unlisted:chosen.filter(x=>!ok.includes(x)),abstained:!chosen.length}));
}
