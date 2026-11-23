/* ENG 112 Living Field Notebook | Private Writing Compass
 * This is a transparent, optional local heuristic, not generative AI, authorship detection,
 * a learning model shared between people, or an assessment of writing quality.
 * Student preferences are kept only in the notebook's existing local JSON state.
 */
(function(root){
 'use strict';
 const $=id=>document.getElementById(id);
 const METHODS=Object.freeze([
  {id:'questioning',name:'Questions and uncertainty',description:'You ask questions or leave something unresolved.',guide:'What have you witnessed for yourself, and what remains uncertain? What could another source illuminate?'},
  {id:'senses',name:'Sensory attention',description:'Your writing includes things seen, heard, felt, or noticed in the body.',guide:'Return to one sensory detail. What does it let you know, and what cannot be known from that detail alone?'},
  {id:'scene',name:'Scenes and memories',description:'You place the reader inside a remembered moment or event.',guide:'Return to a particular moment. What happened immediately before or after it, and why does that change its meaning?'},
  {id:'dialogue',name:'Voices and conversation',description:'Your writing includes dialogue or another person’s words.',guide:'Whose voice do you hear here? What do their actual words add or complicate, and whose perspective is absent?'},
  {id:'reflection',name:'Revision and reconsideration',description:'You compare earlier impressions with later understanding.',guide:'At first you understood one thing. What changed your thinking, and which assumption is still worth testing?'}
 ]);
 const norm=s=>String(s||'').toLocaleLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
 const asString=v=>typeof v==='string'?v:'';
 function documents(state,freewrite){
  const fs=state?.fields||{},w=state?.writing?.fields||{};
  const docs=[
   {place:'freewrite',text:asString(freewrite||fs.encounter)},
   {place:'essay',text:asString(w['ws-essay-body'])},
   {place:'research reflection',text:['found','shift','what','soWhat','nowWhat'].map(k=>asString(fs[k])).join(' ')},
   {place:'research path',text:[w['ws-overview'],w['ws-path-state']].map(asString).join(' ')},
   {place:'reading responses',text:(Array.isArray(state?.readingNotes)?state.readingNotes:[]).slice(-20).map(n=>[n?.authorIdea,n?.connection].map(asString).join(' ')).join(' ')}
  ];
  return docs.filter(d=>d.text.trim().length>=20);
 }
 function methodsIn(text){
  const q=(text.match(/\?/g)||[]).length+ (text.match(/\b(?:wonder|wondering|unsure|uncertain|unknown|cannot know|don't know|do not know|not sure|might|perhaps)\b/gi)||[]).length;
  const sensory=(text.match(/\b(?:see|saw|seen|look|looked|light|color|colors|sound|sounds|heard|hear|listen|listened|smell|scent|touch|touched|skin|warm|cold|wind|taste|bright|dark|rough|smooth)\b/gi)||[]).length;
  const scene=(text.match(/\b(?:one day|that day|when I|I remember|we walked|I walked|then|afterward|before|once|that morning|that evening)\b/gi)||[]).length;
  const dialogue=(text.match(/[“”][^“”]{3,100}[“”]/g)||[]).length+(text.match(/"[^"]{3,100}"/g)||[]).length;
  const reflection=(text.match(/\b(?:at first|now I|however|but then|changed|realize|realized|used to|because|reconsider|assumed|I thought)\b/gi)||[]).length;
  return {questioning:q,senses:sensory,scene,dialogue,reflection};
 }
 function inspect(state,freewrite){
  const docs=documents(state,freewrite),evidence=new Map(),selected=(state?.studio?.selectedPhrases||[]).filter(x=>typeof x==='string');
  for(const d of docs){
   const found=root.FieldStudentLanguage?.extract?.(d.text)||[];
   const unique=new Map();
   for(const hit of found.filter(x=>x.kind==='keyword').slice(0,22)){
     const key=norm(hit.text);if(key.length<4||key.includes(' '))continue;
     if(!unique.has(key))unique.set(key,hit.text);
   }
   for(const [key,word] of unique){
     const x=evidence.get(key)||{name:word,places:[],chosen:false};
     x.places.push(d.place);evidence.set(key,x);
   }
  }
  for(const phrase of selected){
    const key=norm(phrase);if(key.length<4||key.length>100)continue;
    const x=evidence.get(key)||{name:phrase,places:[],chosen:false};
    x.chosen=true;evidence.set(key,x);
  }
  const themes=[...evidence.values()].sort((a,b)=>(b.places.length*3+(b.chosen?4:0))-(a.places.length*3+(a.chosen?4:0))||a.name.length-b.name.length).slice(0,5);
  const scores={questioning:0,senses:0,scene:0,dialogue:0,reflection:0};
  for(const d of docs){
   const counts=methodsIn(d.text);
   for(const id of Object.keys(scores))scores[id]+=Math.min(3,counts[id]);
  }
  const preferred=Array.isArray(state?.studentGuidance?.preferred)?state.studentGuidance.preferred:[];
  const setAside=Array.isArray(state?.studentGuidance?.setAside)?state.studentGuidance.setAside:[];
  let moves=METHODS.filter(x=>!setAside.includes(x.id)).map(x=>({...x,score:scores[x.id]+(preferred.includes(x.id)?5:0)})).sort((a,b)=>b.score-a.score);
  moves=moves.filter(x=>x.score>0).slice(0,3);
  if(!moves.length&&docs.length) moves=[METHODS[0]];
  return {docs:docs.map(x=>x.place),themes,moves,preferred,setAside,hasLongitudinalData:docs.length>=2};
 }
 function render({state,freewrite,persist}){
  const host=$('student-style-content');if(!host)return;
  const profile=inspect(state,freewrite);
  host.replaceChildren();
  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
  if(!profile.docs.length){
   host.append(el('p','hint','Write a little in the Freewriting Studio first. As your research and drafts grow, this space can offer questions better suited to your own writing.'));
   return;
  }
  const tag=profile.hasLongitudinalData?'Across these notebook spaces: '+profile.docs.join(', '):'Based on the writing currently in your freewrite.';
  host.append(el('p','hint',tag));
  const selected=profile.themes.filter(t=>t.chosen).slice(0,3);
  const repeated=profile.themes.filter(t=>t.places.length>=2).slice(0,3);
  const themes=selected.length?selected:repeated.length?repeated:profile.themes.slice(0,3);
  if(themes.length){
   host.append(el('h4','',profile.hasLongitudinalData&&repeated.length?'Words that may connect different parts of your notebook':'Words you have used or selected'));
   const list=el('ul','student-pattern-list');
   for(const t of themes){
    const why=t.chosen?'You selected these words.':t.places.length>=2?'Appears in '+t.places.length+' different writing spaces.':'Appears in your '+(t.places[0]||'current writing')+'.';
    const item=el('li');item.append(el('strong','',t.name+' · '),document.createTextNode(why));list.append(item);
   }
   host.append(list);
  }
  host.append(el('h4','','Possible writing moves to carry forward'));
  for(const move of profile.moves){
   const card=el('div','student-pattern-card');card.append(el('strong','',move.name),el('p','hint',move.description),el('p','',move.guide));
   const controls=el('div','actions');
   const keep=el('button','secondary','This helps my writing'),skip=el('button','secondary','Not my direction');
   keep.type=skip.type='button';
   const chosen=profile.preferred.includes(move.id);if(chosen){keep.textContent='✓ I chose this approach';keep.disabled=true;}
   keep.addEventListener('click',()=>changePreference(move.id,true));
   skip.addEventListener('click',()=>changePreference(move.id,false));
   controls.append(keep,skip);card.append(controls);host.append(card);
  }
  const msg=el('p','hint','These are tentative observations, not a judgment of your ability, identity, or writing quality. They are computed in this browser from your own draft and choices. No text is transmitted to an AI service.');
  host.append(msg);
  const clear=el('button','secondary','Reset only my guidance preferences');clear.type='button';
  clear.addEventListener('click',()=>{
    state.studentGuidance={preferred:[],setAside:[]};persist();render({state,freewrite,persist});
  });
  host.append(clear);
  function changePreference(id,liked){
   const p=state.studentGuidance&&typeof state.studentGuidance==='object'?state.studentGuidance:{};
   p.preferred=Array.isArray(p.preferred)?p.preferred.filter(x=>x!==id):[];
   p.setAside=Array.isArray(p.setAside)?p.setAside.filter(x=>x!==id):[];
   if(liked)p.preferred.push(id);else p.setAside.push(id);
   state.studentGuidance=p;persist();render({state,freewrite,persist});
  }
 }
 root.FieldWritingPatterns=Object.freeze({inspect,render});
})(window);
