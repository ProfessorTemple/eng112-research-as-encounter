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
