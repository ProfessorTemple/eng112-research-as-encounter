import { pipeline, env } from '@huggingface/transformers';
import { readFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
env.allowLocalModels=false;
const model='Xenova/all-MiniLM-L6-v2';
const start=performance.now();
const embed=await pipeline('feature-extraction',model,{dtype:'q8',device:'cpu'});
console.log('Model load milliseconds',Math.round(performance.now()-start));
const cosine=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
for(const name of ['semantic-benchmark','conceptual-heldout','conceptual-validation-2']){
 const cases=JSON.parse(readFileSync(new URL('./'+name+'.json',import.meta.url),'utf8'));
 const rows=[];
 for(const c of cases){
  const t=performance.now();
  const vectors=(await embed([c.query,c.related,c.distractor],{pooling:'mean',normalize:true})).tolist();
  const related=cosine(vectors[0],vectors[1]), distractor=cosine(vectors[0],vectors[2]);
  rows.push({id:c.id,related:+related.toFixed(4),distractor:+distractor.toFixed(4),margin:+(related-distractor).toFixed(4),ms:Math.round(performance.now()-t)});
 }
 console.table(rows);
 console.log(name, 'strict wins',rows.filter(r=>r.margin>0).length,'of',rows.length);
}
console.log('Node memory bytes',process.memoryUsage());
