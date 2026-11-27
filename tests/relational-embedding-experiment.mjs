/* Offline experiment on checked-in synthetic examples only.
 * Do not load this module from the notebook or feed it exported student data.
 * Embedding similarity is retrieval evidence, not proof of an intellectual relation.
 */
import { pipeline, env } from '@huggingface/transformers';
import { readFileSync } from 'node:fs';
const load=name=>JSON.parse(readFileSync(new URL('./'+name+'.json',import.meta.url),'utf8'));
const suite=process.env.RELATIONAL_SUITE||'relational-semantic-development-cases';
if(!['relational-semantic-development-cases','relational-semantic-transfer-cases'].includes(suite))throw Error('Only checked-in synthetic evaluation suites are permitted');
const cases=load(suite).cases;
const profiles=load('lens-prototypes');
const model=process.env.EMBEDDING_MODEL||'Xenova/all-MiniLM-L6-v2';
env.allowLocalModels=false;
const embed=await pipeline('feature-extraction',model,{dtype:'q8',device:'cpu'});
const cosine=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
const prefix=(text,query)=>model.includes('e5')?(query?'query: ':'passage: ')+text:text;
async function encode(texts,query=false){return (await embed(texts.map(t=>prefix(t,query)),{pooling:'mean',normalize:true})).tolist();}
const lensVectors=await encode(profiles.map(p=>p.description+' '+p.anchors.join(' ')));
const html=readFileSync(new URL('../field-notebook-next-preview.html',import.meta.url),'utf8');
const start=html.indexOf('function possibleConnection('),end=html.indexOf("const panel=document.createElement('details');panel.id='portrait-compare-thinking'",start);
if(start<0||end<start)throw Error('Lexical retrieval baseline not found');
const lexical=new Function(html.slice(start,end)+'return possibleConnection;')();
const toRecord=(id,group,text)=>({id,group,sections:[{label:'',text}]});
const round=n=>+n.toFixed(4);
// Restraint gate evaluated separately from rank retrieval. These narrowly bounded
// explicit cues do not detect all cultural restrictions or intellectual independence.
function explicitRestraint(text){
 const voice=String(text).replace(/“[^”]*”|"[^"\n]*"|‘[^’]*’|(^|[\s(:,])'(?:[^'\n]|'(?![\s,.!?;:]|$))*'(?=[\s,.!?;:]|$)/g,' ').replace(/’/g,"'");
 if(/\b(?:asked|told)\s+me\s+not\s+to\s+(?:repeat|share|disclose|reveal|retell|quote|publish|record)\b/i.test(voice))return 'permission';
 if(/\b(?:I|we)\s+(?:do not|don't|prefer not to|would rather not)\s*(?:want to\s+)?(?:share|disclose|reveal|explain|discuss|quote|publish)\b/i.test(voice))return 'permission';
 if(/\b(?:I|we)\s+(?:have|had)\s+permission\s+to\b[^.!?]{0,180}\bbut not to\s+(?:share|repeat|quote|disclose|reveal|publish|reproduce)\b/i.test(voice))return 'permission';
 if(/(?:^|[.!?]\s+)I\s+(?:have enough (?:material|evidence|ideas) for (?:this|my) (?:paragraph|section)|am ready to continue|(?:do not|don't) need another question)\b/i.test(voice.trim()))return 'student-direction';
 if(/(?:^|[.!?]\s+)I\s+am\s+(?:recording|describing|noticing|observing)\b[^.!?]{0,150}\bbefore\s+(?:interpreting|analyzing|analysing|drawing conclusions)\b/i.test(voice.trim()))return 'observation';
 if(/(?:^|[.!?]\s+)I\s+(?:now\s+)?distinguish\b[^.!?]{0,180}\bfrom\b[^.!?]{0,180}/i.test(voice.trim()))return 'developed-distinction';
 if(/\b(?:I|we)\s+(?:am|are)\s+(?:beginning to see that|comfortable leaving)\b[^.!?]{0,160}\b(?:answer|address)\s+different questions\b/i.test(voice)||/\bI understand that they (?:answer|address) different questions\b/i.test(voice))return 'developed-distinction';
 return null;
}
const rows=[];
for(const c of cases){
 const [q]=await encode([c.anchor],true);
 const v=await encode(c.candidates.map(p=>p.text));
 const direct=c.candidates.map((p,i)=>({id:p.id,score:cosine(q,v[i])})).sort((a,b)=>b.score-a.score);
 // A second view asks whether passages are near a common conceptual profile.
 // Candidate passage vectors and anchor query vectors are kept distinct.
 const anchorScores=lensVectors.map(x=>cosine(q,x));
 const bridges=c.candidates.map((p,i)=>{
  const paths=profiles.map((l,j)=>({id:l.id,score:Math.min(anchorScores[j],cosine(v[i],lensVectors[j]))})).sort((a,b)=>b.score-a.score);
  return {id:p.id,bridge:paths[0].id,score:paths[0].score};
 }).sort((a,b)=>b.score-a.score);
 // Rank fusion gives independent weight to each retrieval view, not a claim of validity.
 const fused=c.candidates.map(p=>({id:p.id,score:1/(1+direct.findIndex(x=>x.id===p.id))+1/(1+bridges.findIndex(x=>x.id===p.id))})).sort((a,b)=>b.score-a.score);
 const lexicalChoice=lexical(toRecord('anchor','Current notebook entries',c.anchor),c.candidates.map(p=>toRecord(p.id,'Saved discoveries',p.text)))?.record.id??null;
 rows.push({id:c.id,expected:c.expected,restraint:explicitRestraint(c.anchor),lexical:lexicalChoice,direct:direct.map(x=>({...x,score:round(x.score)})),bridges:bridges.map(x=>({...x,score:round(x.score)})),fused:fused.map(x=>({...x,score:round(x.score)}))});
}
const assess=(name,select)=>{
 const results=rows.map(r=>({id:r.id,expected:r.expected,choice:select(r)}));
 return {name,total:results.length,acceptable:results.filter(r=>r.choice===null?r.expected.length===0:r.expected.includes(r.choice)).length,unwanted:results.filter(r=>!r.expected.length&&r.choice!==null).length,missed:results.filter(r=>r.expected.length&&r.choice===null).length,incorrect:results.filter(r=>r.expected.length&&r.choice!==null&&!r.expected.includes(r.choice)).length,results};
};
const reports=[assess('lexical',r=>r.lexical),assess('direct top-1 (no restraint)',r=>r.direct[0].id),assess('concept bridge top-1 (no restraint)',r=>r.bridges[0].id),assess('fusion top-1 (no restraint)',r=>r.fused[0].id),assess('agreement-only (experimental, not calibrated)',r=>r.direct[0].id===r.bridges[0].id?r.direct[0].id:null),assess('concept bridge + explicit restraint (research only)',r=>r.restraint?null:r.bridges[0].id),assess('always abstain',()=>null)];
console.log(JSON.stringify({model,suite,scope:'checked-in synthetic cases only; no classroom or independent-validation performance claim',rows,reports},null,2));
