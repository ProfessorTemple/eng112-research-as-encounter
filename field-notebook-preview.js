/* Living Field Notebook: preview-only navigation and continuous trail.
   Existing Research as Encounter modules remain student-authored and intact. */
(function(){
"use strict";
const get=id=>document.getElementById(id);
const SPACE={
 discover:{name:"Discover",title:"Start with an experience",hint:"Follow the words and questions that grow from your own encounter.",pages:[["begin","Freewrite"],["explore","Explore concepts"]]},
 research:{name:"Research",title:"Follow an inquiry",hint:"Build searches, encounter sources, and revisit your living thesis.",pages:[["search","Build a search"],["read","Find sources"],["journal","Reading Journal"],["return","Living thesis"]]},
 write:{name:"Write",title:"Let the essay emerge",hint:"Bring sources into conversation, draft, check, and revise.",pages:[["biblio","Annotated bibliography"],["writing","Writing Studio"]]}
};
const PAGES=Object.fromEntries(Object.entries(SPACE).flatMap(([space,item])=>item.pages.map(([id,label],i)=>[id,{space,label,index:i}])));
const NEXT={
 begin:["explore","Follow ideas emerging from your freewriting"],
 explore:["search","Turn the concepts you chose into research searches"],
 search:["read","Find sources worth investigating"],
 read:["journal","Take notes on something you actually read, heard, or watched"],
 journal:["return","Return to your living thesis with new evidence"],
 return:["biblio","Carry your changed question into an annotated bibliography"],
 biblio:["writing","Bring your research into the essay draft"],
 writing:["return","Revisit your living thesis as you revise"]
};
const safe=(v,n=160)=>String(v||"").replace(/\s+/g," ").trim().slice(0,n);
const join=(arr,n=3)=>Array.isArray(arr)?arr.filter(x=>typeof x==="string"&&x.trim()).slice(0,n).map(x=>safe(x,70)).join(" · "):"";
const make=(tag,cls,txt)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=String(txt);return el;};
const root=get("field-notebook-compass");if(!root)return;
let activeTab="begin",liveUpdates=0;
function field(){if(!state.fieldNotebook||typeof state.fieldNotebook!=="object")state.fieldNotebook={lastTab:"begin",discoveries:[]};if(!Array.isArray(state.fieldNotebook.discoveries))state.fieldNotebook.discoveries=[];return state.fieldNotebook;}
function navigate(id){if(!PAGES[id])return;tab(id);}
function renderNav(id){
 const p=PAGES[id];if(!p)return;
 activeTab=id;const space=SPACE[p.space];
 for(const button of document.querySelectorAll("[data-field-space]"))button.setAttribute("aria-pressed",String(button.dataset.fieldSpace===p.space));
 get("field-space-caption").textContent=space.name.toUpperCase();
 get("field-section-title").textContent=space.title;
 get("field-section-help").textContent=space.hint;
 const nav=get("field-subnav");nav.replaceChildren();
 for(const [tabId,name] of space.pages){
   const b=make("button",null,name);b.type="button";if(tabId===id)b.setAttribute("aria-current","page");
   b.addEventListener("click",()=>navigate(tabId));nav.append(b);
 }
 const next=NEXT[id];
 get("field-next-text").textContent=next[1]+" whenever it feels useful. You may also return to something earlier.";
 get("field-next-button").textContent=next[1]+" →";
 get("field-next-button").onclick=()=>navigate(next[0]);
 field().lastTab=id;
 try{persist();}catch(err){/* Continue even if browser storage is blocked. */}
}
function trailItem(host,title,txt,page){
 const cell=make("div","field-trail-item");
 cell.append(make("strong",null,title));
 cell.append(make("p",null,txt||"Nothing added yet. That's fine."));
 const b=make("button",null,"Open this part of my notebook");b.type="button";
 b.addEventListener("click",()=>navigate(page));cell.append(b);host.append(cell);
}
function trail(){
 const host=get("field-thread-snapshot");if(!host)return;
 const f=state.fields||{};
 const encounter=safe(get("encounter")?.value||f.encounter,145);
 const concepts=join([...(state.studio?.selectedPhrases||[]),...(state.followed||[]),f.idea1,f.idea2,f.idea3].filter(Boolean),4);
 const searches=join(state.savedSearches,2);
 const savedSources=[...(state.savedBooks||[]),...(state.savedMedia||[]),...(state.customSources||[])];
 const notes=Array.isArray(state.readingNotes)?state.readingNotes.length:0;
 const versions=Array.isArray(state.thesisVersions)?state.thesisVersions.length:0;
 const summary=safe(get("thesis-draft")?.value||f["thesis-draft"]||f.what||"",150);
 const essay=state.writing?.fields?.["ws-essay-body"]||get("ws-essay-body")?.value||"";
 const essayWords=String(essay).trim().split(/\s+/).filter(Boolean).length;
 host.replaceChildren();
 trailItem(host,"My starting encounter",encounter,"begin");
 trailItem(host,"Language I am exploring",concepts,"explore");
 trailItem(host,"Searches I am trying",searches,"search");
 trailItem(host,"Sources and reading","Saved sources: "+savedSources.length+" · Source notes: "+notes,"journal");
 trailItem(host,"My living thesis",summary||("Saved thesis versions: "+versions),"return");
 trailItem(host,"My writing",essayWords?essayWords+" words currently in the essay draft":"An essay may emerge from these encounters.","writing");
 const list=get("field-discovery-list");list.replaceChildren();
 const discoveries=field().discoveries.slice(-12).reverse();
 for(const entry of discoveries){
  const box=make("div","field-discovery-entry");const t=make("time",null,entry.at?new Date(entry.at).toLocaleDateString(): "Saved reflection");
  if(entry.at)t.dateTime=entry.at;
  box.append(t,make("p",null,entry.text));list.append(box);
 }
 if(!discoveries.length)list.append(make("p","field-mini","Your reflections can gather here when you decide to save them."));
}
function showTrail(open){
 get("field-thread-detail").hidden=!open;
 get("field-thread-toggle").setAttribute("aria-expanded",String(open));
 get("field-thread-toggle").textContent=open?"Hide my trail":"Show my trail";
 if(open)trail();
}
function saveDiscovery(){
 const input=get("field-discovery-input"),value=input.value.trim();
 if(!value){get("field-discovery-status").textContent="Write an observation or question first.";input.focus();return;}
 const f=field();f.discoveries.push({at:new Date().toISOString(),text:value.slice(0,3500),from:activeTab});f.discoveries=f.discoveries.slice(-60);
 try{persist();get("field-discovery-status").textContent="Saved to your growing trail.";}catch(err){get("field-discovery-status").textContent="Local saving unavailable. Download your journal.";}
 input.value="";showTrail(true);
}
const EXTENDED_WINDOW=6;
let shown=EXTENDED_WINDOW;
const catalog=()=>Array.isArray(window.RAE_SOURCE_DATA?.sources)?window.RAE_SOURCE_DATA.sources:[];
const normalize=t=>String(t||"").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
const stop=new Set(["what","when","where","how","why","which","and","or","not","with","about","that","this","there","from","into","some","more","they","them","have","has","had","does","did","the","can","could","would","who","were","was","feel","like","know","wonder","whether","something","sometimes","experience"]);
const words=t=>[...new Set(normalize(t).split(/\s+/).filter(w=>w.length>2&&!stop.has(w)))].slice(0,15);
function catalogQuery(s){
 const q=get("field-catalog-query").value.trim(),source=normalize([s.title,s.author,s.topics,s.description,s.path,s.question].join(" "));
 if(!q)return {matches:true,score:0};
 let groups=q.split(/\s+OR\s+/i);
 let hits=groups.some(group=>{
  let chunks=group.split(/\s+NOT\s+/i);
  const positive=chunks[0].split(/\s+AND\s+/i).flatMap(x=>words(x));
  const denied=chunks.slice(1).flatMap(x=>words(x));
  return positive.length&&positive.every(word=>source.includes(word))&&!denied.some(word=>source.includes(word));
 });
 return {matches:hits,score:words(q).reduce((sum,word)=>sum+(normalize(s.title).includes(word)?5:source.includes(word)?2:0),0)};
}
function catalogSources(){
 const all=get("field-catalog-all").checked;
 const data=catalog();let q=get("field-catalog-query").value.trim();
 let leads=data.filter(s=>(all||s.featured)&&(catalogQuery(s).matches));
 if(!q){
   const idea=words([get("idea1")?.value,get("idea2")?.value,get("idea3")?.value,...(state.followed||[])].join(" "));
   if(idea.length){
    const scored=leads.map(s=>({s,score:idea.reduce((sum,w)=>sum+(normalize([s.title,s.topics,s.description,s.path].join(" ")).includes(w)?1:0),0)}));
    scored.sort((a,b)=>b.score-a.score);leads=scored.map(x=>x.s);
   }
 }else leads.sort((a,b)=>catalogQuery(b).score-catalogQuery(a).score);
 return leads;
}
function sourceHref(s){
 const url=s.collection==="PCC Reserve"?(s.url||s.catalogSearchUrl):s.url;
 return typeof url==="string"&&/^https:\/\//.test(url)?url:"";
}
function shelfId(s){
 return "field-catalog-"+s.id;
}
function savedId(s){
 const id=shelfId(s);
 const existing=(state.customSources||[]).find(x=>x.id===id);
 return existing?.id||null;
}
function saveToShelf(s,open){
 const id=shelfId(s);
 if(!Array.isArray(state.customSources))state.customSources=[];
 if(!savedId(s)){
  const source={
   id,title:s.title,author:s.author||"Author to verify",kind:s.collection.includes("E-book")?"book":/article|journal|study|research/i.test(s.kind)?"article":"book",
   url:sourceHref(s),about:s.description||"Source from the extended ENG 112 library; open and verify the original.",
   reason:s.question||"Question to investigate.",access:s.access||"Verify holdings and source details before citing."
  };
  state.customSources.push(source);persist();
 }
 if(open){openReadingJournal(id);get("journal-source").value=id;get("journal-source").dispatchEvent(new Event("change",{bubbles:true}));}
 renderCatalog();
}
function renderCatalog(){
 const items=catalogSources(),host=get("field-catalog-results"),status=get("field-catalog-status");
 host.replaceChildren();
 if(!catalog().length){status.textContent="Extended catalog unavailable. Use the Reading Grove above or open the Research Connections Library.";get("field-catalog-more").hidden=true;return;}
 const subset=items.slice(0,shown);
 status.textContent=(get("field-catalog-query").value.trim()?"Matching leads":"Suggested starting points")+": "+items.length+". Browse the original source before relying on it.";
 if(!items.length)host.append(make("p",null,"No matches yet. Try a broader search or uncheck the catalog filter."));
 for(const s of subset){
  const card=make("article","field-catalog-card");
  card.append(make("strong",null,s.title),make("p","field-meta",(s.author||"Author to verify")+" · "+(s.collection||s.kind||"Research lead")));
  if(s.description)card.append(make("p",null,s.description));
  const controls=make("div","field-actions");
  const url=sourceHref(s);
  if(url){const link=make("a",null,s.collection==="PCC Reserve"?(s.url?"PCC book record ↗":"Find title in PCC catalog ↗"):s.collection==="PCC E-book"?"Open PCC e-book ↗":"Open source ↗");
   link.href=url;link.target="_blank";link.rel="noopener noreferrer";link.setAttribute("aria-label",link.textContent+": "+s.title+" (opens in new tab)");controls.append(link);}
  const saved=!!savedId(s);
  const button=make("button","field-secondary",saved?"✓ Saved to Reading Journal":"Save to Reading Journal");button.type="button";button.disabled=saved;button.addEventListener("click",()=>saveToShelf(s,false));controls.append(button);
  const note=make("button","field-secondary","Take reading notes");note.type="button";note.addEventListener("click",()=>saveToShelf(s,true));controls.append(note);
  card.append(controls);host.append(card);
 }
 get("field-catalog-more").hidden=items.length<=shown;
}
function init(){
 if(typeof tab!=="function"||typeof persist!=="function"||!state){get("field-section-help").textContent="The notebook tools were not able to load. Refresh the page.";return;}
 for(const b of document.querySelectorAll("[data-field-space]"))b.addEventListener("click",()=>{
  const id=b.dataset.fieldSpace;
  const saved=field().lastTab;
  navigate(saved&&PAGES[saved]?.space===id?saved:SPACE[id].pages[0][0]);
 });
 get("field-thread-toggle").addEventListener("click",()=>showTrail(get("field-thread-detail").hidden));
 get("field-save-discovery").addEventListener("click",saveDiscovery);
 const q=get("field-catalog-query"),ck=get("field-catalog-all");
 q.addEventListener("input",()=>{shown=EXTENDED_WINDOW;renderCatalog();});
 ck.addEventListener("change",()=>{shown=EXTENDED_WINDOW;renderCatalog();});
 get("field-catalog-more").addEventListener("click",()=>{shown+=EXTENDED_WINDOW;renderCatalog();});
 window.addEventListener("field:tabchange",event=>{const name=event.detail?.name;if(PAGES[name]){renderNav(name);if(!get("field-thread-detail").hidden)trail();}});
 window.addEventListener("field:save",()=>{if(!get("field-thread-detail").hidden)trail();});
 renderCatalog();
 const last=field().lastTab;
 if(PAGES[last]&&last!=="begin")navigate(last);else renderNav("begin");
 showTrail(false);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();