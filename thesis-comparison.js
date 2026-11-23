/* Living Field Notebook: additive thesis comparison, November 2026.
   Reads existing saved versions without modifying or restoring any of them.
   The optional student reflection joins the existing fields and JSON backup. */
(function(){
 'use strict';
 const get=id=>document.getElementById(id);
 const first=get('thesis-compare-earlier'),second=get('thesis-compare-later'),output=get('thesis-compare-output');
 const reflection=get('thesis-compare-reflection'),status=get('thesis-compare-status');
 if(!first||!second||!output||!reflection)return;
 if(!FIELDS.includes('thesis-compare-reflection'))FIELDS.push('thesis-compare-reflection');
 if(typeof state.fields?.['thesis-compare-reflection']==='string')reflection.value=state.fields['thesis-compare-reflection'];
 reflection.addEventListener('input',()=>{persist();status.textContent='Reflection saved in this browser. Download a full backup to keep a portable copy.';});
 const clean=x=>String(x||'').trim();
 const versions=()=>Array.isArray(state.thesisVersions)?state.thesisVersions.filter(v=>v&&typeof v==='object').slice(-12):[];
 function current(){
  const val=id=>get(id)?.value||'';
  return {savedAt:'',question:val('thesis-question'),story1:val('what'),story2:val('soWhat'),story3:val('nowWhat'),draft:val('thesis-draft'),evidence:val('thesis-evidence'),change:val('thesis-change')};
 }
 function options(select,items,defaultValue){
  const existing=select.value;
  select.replaceChildren();
  items.forEach(item=>{const option=document.createElement('option');option.value=item.id;option.textContent=item.label;select.append(option);});
  select.value=items.some(item=>item.id===existing)?existing:defaultValue;
 }
 function refresh(){
  const all=versions(), items=all.map((v,i)=>({id:String(i),label:'Saved version '+(i+1)+' · '+(v.savedAt?new Date(v.savedAt).toLocaleString():'undated')}));
  options(first,items,items.length?items[0].id:'');
  options(second,[...items,{id:'current',label:'My current working thesis (not a saved version)'}],'current');
  const available=items.length>0;
  first.disabled=!available;second.disabled=!available;
  get('thesis-compare-button').disabled=!available;
  get('thesis-compare-empty').hidden=available;
  if(!available)output.replaceChildren();
 }
 function block(parent,label,value){
  const h=document.createElement('h5');h.textContent=label;parent.append(h);
  const p=document.createElement('p');p.className='thesis-compare-text';p.textContent=clean(value)||'Not written at this stage';parent.append(p);
 }
 function render(){
  const all=versions(),a=all[Number(first.value)],b=second.value==='current'?current():all[Number(second.value)];
  if(!a||!b){status.textContent='Choose two stages to compare.';return;}
  if(second.value!=='current'&&first.value===second.value){status.textContent='Choose two different saved versions or compare a saved version with your current draft.';return;}
  output.replaceChildren();
  const columns=document.createElement('div');columns.className='thesis-compare-columns';
  [[a,'Earlier thinking'],[b,second.value==='current'?'Current working thesis':'Later thinking']].forEach(([item,title])=>{
   const section=document.createElement('section');section.className='thesis-compare-card';
   const h=document.createElement('h4');h.textContent=title;section.append(h);
   block(section,'Research question',item.question);
   block(section,'Observation',item.story1);
   block(section,'Interpretation',item.story2);
   block(section,'Significance',item.story3);
   block(section,'Connected thesis',item.draft);
   block(section,'Evidence or tension',item.evidence);
   columns.append(section);
  });
  output.append(columns);
  const prompts=document.createElement('div');prompts.className='thesis-compare-prompts';
  const heading=document.createElement('h4');heading.textContent='Notice the movement, not just the wording';prompts.append(heading);
  const list=document.createElement('ul');
  ['What changed in your observation, interpretation, or sense of significance?',
   'Which encounter, reading, interview, or source made you reconsider something? Name the evidence you can verify.',
   'What uncertainty remains? Is the later thesis more specific, more complicated, or simply different?',
   'What would you want a peer or your instructor to understand about how you arrived here?'].forEach(t=>{const li=document.createElement('li');li.textContent=t;list.append(li);});
  prompts.append(list);output.append(prompts);
  status.textContent='Showing both stages without changing either thesis or its saved history.';
 }
 get('thesis-compare-button').addEventListener('click',render);
 get('thesis-compare-refresh').addEventListener('click',()=>{refresh();status.textContent='Saved-version choices refreshed.';});
 window.addEventListener('field:save',()=>{ /* Keep selection stable; refresh explicitly to avoid disrupting reading. */ });
 const originalTab=tab;
 tab=function(name){originalTab(name);if(name==='return')refresh();};
 window.addEventListener('field:tabchange',e=>{if(e.detail?.name==='return')refresh();});
 get('field-whats-new-go')?.addEventListener('click',()=>{tab('return');get('thesis-comparison-title').focus({preventScroll:true});get('thesis-comparison-title').scrollIntoView({block:'start',behavior:'smooth'});});
 refresh();
})();