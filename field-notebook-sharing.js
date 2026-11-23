/* Living Field Notebook · accessible student-controlled share and export pilot.
 * No network requests, tracking, or automatic submission.
 * Sections are chosen by the student; the full JSON backup is kept separate.
 */
(function(){
"use strict";
const get=id=>document.getElementById(id);
const panel=get("field-share-panel"); if(!panel)return;
const partNames={
  encounter:"My opening experience and question",
  keywords:"Concepts, keywords, research questions, and searches",
  sources:"Sources and reading reflections",
  thesis:"My developing living thesis",
  discoveries:"What changed in my thinking",
  essay:"My current essay draft",
  "draft-history":"Earlier saved essay drafts"
};
const who={peer:"A peer or writing partner",instructor:"My instructor",personal:"My personal records"};
let report=null, history=[], returning=false;
const plain=v=>String(v??"").trim();
const fld=id=>plain(get(id)?.value??state?.fields?.[id]??"");
const item=(label,text)=>({label,text:plain(text)});
const section=(id)=>({id,title:partNames[id],items:[]});
const short=(text,n=150)=>String(text||"").trim().replace(/\s+/g," ").slice(0,n);
function notify(text){
 get("field-share-status").textContent=text;
 get("field-action-status").textContent=text;
}
function selection(){
 return [...panel.querySelectorAll('input[name="field-share-part"]:checked')].map(x=>x.value).filter(x=>Object.hasOwn(partNames,x));
}
function audience(){return panel.querySelector('input[name="field-share-audience"]:checked')?.value||"peer";}
function sourceInfo(id){
 try{if(typeof lookupSource==="function"){const val=lookupSource(id);if(val)return val;}}catch(e){}
 return (state.customSources||[]).find(s=>s.id===id)||null;
}
function gather(){
 const ids=selection();
 if(!ids.length){notify("Select at least one section before previewing.");return null;}
 const all=[], add=(group,label,text)=>{if(plain(text))group.items.push(item(label,text));};
 const strarr=(arr,n=100)=>Array.isArray(arr)?arr.filter(x=>typeof x==="string"&&x.trim()).slice(0,n):[];
 if(ids.includes("encounter")){
  const c=section("encounter");
  add(c,"Original encounter or freewriting",fld("encounter"));
  add(c,"My early assumption or uncertainty",fld("assumption"));
  add(c,"My developing research question",fld("thesis-question"));
  all.push(c);
 }
 if(ids.includes("keywords")){
  const c=section("keywords");
  add(c,"Words and images chosen from my writing",strarr(state.studio?.selectedPhrases,40).join(" · "));
  add(c,"Starting concepts",[fld("idea1"),fld("idea2"),fld("idea3")].filter(Boolean).join(" · "));
  add(c,"My chosen research vocabulary",strarr(state.keywordBank,40).join(" · "));
  add(c,"Concepts followed",strarr(state.followed,100).join(" · "));
  add(c,"Saved research questions",strarr(state.savedQuestions).map((x,i)=>(i+1)+". "+x).join("\n"));
  add(c,"Search combinations to try",strarr(state.savedSearches).map((x,i)=>(i+1)+". "+x).join("\n"));
  all.push(c);
 }
 if(ids.includes("sources")){
  const c=section("sources");
  const uniqueIds=[...new Set([...(state.savedBooks||[]),...(state.savedMedia||[]),...(state.customSources||[]).map(x=>x.id),...(state.readingNotes||[]).map(x=>x.sourceId)])];
  for(const id of uniqueIds.slice(0,200)){
   const s=sourceInfo(id);if(!s)continue;
   let info=(s.title||"Source")+(s.author?" · "+s.author:"");
   if(s.url)info+="\nSource link: "+s.url;
   else if(s.access)info+="\nAccess: "+s.access;
   add(c,"Source to investigate",info);
  }
  for(const n of (state.readingNotes||[]).slice(0,150)){
   const s=sourceInfo(n.sourceId);
   const title=(s?.title||"Source to verify")+(n.locator?" · "+n.locator:"");
   let note=["Kind: "+(n.kind||"idea"),"Conversation: "+(n.relationship||"not specified")];
   if(n.excerpt)note.push("Passage or observation: "+n.excerpt);
   if(n.authorIdea)note.push("What the source is saying, in my words: "+n.authorIdea);
   if(n.connection)note.push("My response: "+n.connection);
   if(n.link)note.push("Connected to: "+n.link);
   add(c,"Reading response: "+title,note.join("\n"));
  }
  all.push(c);
 }
 if(ids.includes("thesis")){
  const c=section("thesis");
  add(c,"My current research question",fld("thesis-question"));
  add(c,"Story One · Observation",fld("what"));
  add(c,"Story Two · Interpretation",fld("soWhat"));
  add(c,"Story Three · Significance",fld("nowWhat"));
  add(c,"Evidence or tension I need to investigate",fld("thesis-evidence"));
  add(c,"My working thesis",fld("thesis-draft"));
  for(const [i,v] of (Array.isArray(state.thesisVersions)?state.thesisVersions:[]).slice(-12).entries()){
   if(!v||typeof v!=="object")continue;
   const lines=[];
   if(v.question)lines.push("Question: "+v.question);
   if(v.story1)lines.push("Observation: "+v.story1);
   if(v.story2)lines.push("Interpretation: "+v.story2);
   if(v.story3)lines.push("Significance: "+v.story3);
   if(v.draft)lines.push("Working thesis: "+v.draft);
   if(v.change)lines.push("Reflection: "+v.change);
   if(lines.length)add(c,"Saved thesis version "+(i+1)+(v.savedAt?" · "+date(v.savedAt):""),lines.join("\n"));
  }
  all.push(c);
 }
 if(ids.includes("discoveries")){
  const c=section("discoveries");
  add(c,"What new research complicated",fld("found"));
  add(c,"My reflection on changed understanding",fld("shift"));
  add(c,"Thesis reflection",fld("thesis-change"));
  for(const d of (Array.isArray(state.fieldNotebook?.discoveries)?state.fieldNotebook.discoveries:[]).slice(-60)){
   if(d&&d.text)add(c,"Discovery reflection"+(d.at?" · "+date(d.at):""),d.text);
  }
  all.push(c);
 }
 if(ids.includes("draft-history")){
  const c=section("draft-history");
  for(const [i,s] of (Array.isArray(state.writing?.snapshots)?state.writing.snapshots:[]).slice(-8).entries()){
   if(!s||typeof s!=="object")continue;
   let parts=[];
   if(s.title)parts.push("Title: "+s.title);
   if(s.abstract)parts.push("Abstract: "+s.abstract);
   if(s.body)parts.push("Essay draft: "+s.body);
   if(s.references)parts.push("References: "+s.references);
   add(c,"Saved essay draft "+(i+1)+(s.date?" · "+date(s.date):""),parts.join("\n\n"));
  }
  all.push(c);
 }
 if(ids.includes("essay")){
  const c=section("essay"),f=state.writing?.fields||{};
  const v=id=>plain(get(id)?.value||f[id]||"");
  add(c,"Essay title",v("ws-essay-title"));
  add(c,"Abstract",v("ws-abstract"));
  add(c,"Current essay draft",v("ws-essay-body"));
  add(c,"References",v("ws-references"));
  all.push(c);
 }
 const result={title:"ENG 112 · My Research and Writing Journey",created:new Date().toISOString(),audience:audience(),request:plain(get("field-share-request").value).slice(0,2500),sections:all,choices:ids};
 return result;
}
function date(value){const d=new Date(value);return Number.isNaN(d.valueOf())?"Date not available":d.toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"});}
function addText(parent,tag,text,cls){
 const e=document.createElement(tag);e.textContent=String(text);if(cls)e.className=cls;parent.append(e);return e;
}
function render(){
 const current=gather();if(!current)return null;
 report=current;
 const host=get("field-share-report-content");host.replaceChildren();
 addText(host,"h2",report.title,"field-report-title");
 addText(host,"p","Prepared for: "+(who[report.audience]||who.peer)+" · "+date(report.created),"field-report-subtitle");
 addText(host,"p","Student-selected record of inquiry. Saved versions and dates are not independently verified evidence of authorship.","field-report-subtitle");
 if(report.request){
  const s=addText(host,"section","","field-report-section");
  addText(s,"h4","Feedback I am hoping for");
  addText(s,"p",report.request);
 }
 for(const data of report.sections){
  const region=document.createElement("section");region.className="field-report-section";
  addText(region,"h4",data.title);
  if(!data.items.length)addText(region,"p","No entries in this section yet.","field-report-empty");
  for(const a of data.items){addText(region,"h5",a.label);addText(region,"p",a.text);}
  host.append(region);
 }
 get("field-share-report").hidden=false;
 for(const id of ["field-share-word","field-share-html","field-share-print"])get(id).disabled=false;
 notify("Report preview ready. Review the material below before sharing it.");
 get("field-share-report-heading").focus({preventScroll:true});
 get("field-share-report-heading").scrollIntoView({block:"start"});
 return current;
}
function escapeHTML(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function toHTML(obj){
 const lines=['<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">','<title>'+escapeHTML(obj.title)+'</title>',
 '<style>body{color:#202c23;background:white;max-width:54rem;margin:0 auto;padding:2rem 1rem;font:1rem/1.65 system-ui,-apple-system,Segoe UI,sans-serif}h1,h2,h3{line-height:1.3;color:#1f4935}h1{font-size:1.8rem}h2{font-size:1.35rem}h3{font-size:1.06rem}main{display:block}section{margin:1.4rem 0}p{white-space:pre-wrap;overflow-wrap:anywhere}a:focus-visible,button:focus-visible{outline:3px solid #a26219;outline-offset:3px}button{min-height:44px;border:2px solid #315a45;border-radius:8px;padding:.55rem .8rem;background:#e9f3eb;color:#164b32;font:inherit;font-weight:bold}header{border-bottom:2px solid #a7c8af;margin-bottom:1.1rem}.meta{color:#455d4b}.notice{border-left:3px solid #8aa994;padding:.4rem .7rem}@media print{body{max-width:none;padding:0}.no-print{display:none!important}h2,h3{break-after:avoid}section{break-inside:auto}}</style></head><body>',
 '<a class="no-print" href="#report">Skip to the report</a><p class="no-print"><button type="button" onclick="window.print()">Print or save as PDF</button></p><main id="report">',
 '<header><h1>'+escapeHTML(obj.title)+'</h1><p class="meta">Prepared for: '+escapeHTML(who[obj.audience]||who.peer)+' · '+escapeHTML(date(obj.created))+'</p></header>',
 '<p class="notice">This is a student-selected report, not a verified activity record. Confirm that personal information is appropriate to share.</p>'];
 if(obj.request)lines.push('<section><h2>Feedback I am hoping for</h2><p>'+escapeHTML(obj.request)+'</p></section>');
 for(const sec of obj.sections){
  lines.push('<section><h2>'+escapeHTML(sec.title)+'</h2>');
  if(!sec.items.length)lines.push('<p>No entries in this section yet.</p>');
  for(const a of sec.items)lines.push('<h3>'+escapeHTML(a.label)+'</h3><p>'+escapeHTML(a.text)+'</p>');
  lines.push('</section>');
 }
 lines.push('</main></body></html>');return lines.join("\n");
}
function blobSave(blob,filename){
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();
 window.setTimeout(()=>URL.revokeObjectURL(url),15000);
}
function fileName(obj,ext){
 const audience={peer:"Peer",instructor:"Instructor",personal:"Personal"}[obj.audience]||"Personal";
 return "ENG112_Journey_"+audience+"_"+new Date(obj.created).toISOString().slice(0,10)+"."+ext;
}
function xml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]));}
function wordParagraph(text,style="Normal"){
 const val=String(text??"");const lines=val.split(/\r?\n/);
 return lines.map(part=>'<w:p><w:pPr><w:pStyle w:val="'+style+'"/></w:pPr><w:r><w:t xml:space="preserve">'+xml(part)+'</w:t></w:r></w:p>').join("");
}
function wordXML(obj){
 const body=[wordParagraph(obj.title,"Title"),wordParagraph("Prepared for: "+(who[obj.audience]||who.peer)+" · "+date(obj.created),"Subtitle"),
 wordParagraph("Student-selected learning record. Dates and versions are not independently verified proof of authorship.","Normal")];
 if(obj.request){body.push(wordParagraph("Feedback I am hoping for","Heading1"),wordParagraph(obj.request));}
 for(const sec of obj.sections){
  body.push(wordParagraph(sec.title,"Heading1"));
  if(!sec.items.length)body.push(wordParagraph("No entries in this section yet."));
  for(const entry of sec.items){body.push(wordParagraph(entry.label,"Heading2"),wordParagraph(entry.text));}
 }
 return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+body.join("")+'<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080"/></w:sectPr></w:body></w:document>';
}
const stylesXML='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:lang w:val="en-US"/><w:sz w:val="22"/></w:rPr></w:rPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="34"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:rPr><w:sz w:val="20"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:sz w:val="28"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:sz w:val="23"/></w:rPr></w:style></w:styles>';
function makeDocx(obj){
 const enc=new TextEncoder(),utf=s=>enc.encode(s),data=[],central=[];let offset=0;
 let table=null;
 function crc32(bytes){
  if(!table){table=new Uint32Array(256);for(let n=0;n<256;n++){let v=n;for(let k=0;k<8;k++)v=(v&1)?(0xedb88320^(v>>>1)):(v>>>1);table[n]=v>>>0;}}
  let c=0xffffffff;for(const b of bytes)c=table[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;
 }
 function u16(v,p,n){v.setUint16(p,n,true)}function u32(v,p,n){v.setUint32(p,n>>>0,true)}
 function add(name,contents){
  const filename=utf(name),bytes=utf(contents),checksum=crc32(bytes);
  const header=new Uint8Array(30+filename.length),a=new DataView(header.buffer);
  u32(a,0,0x04034b50);u16(a,4,20);u16(a,6,0x0800);u16(a,8,0);u16(a,10,0);u16(a,12,0);u32(a,14,checksum);u32(a,18,bytes.length);u32(a,22,bytes.length);u16(a,26,filename.length);u16(a,28,0);header.set(filename,30);
  const ch=new Uint8Array(46+filename.length),b=new DataView(ch.buffer);
  u32(b,0,0x02014b50);u16(b,4,20);u16(b,6,20);u16(b,8,0x0800);u16(b,10,0);u16(b,12,0);u16(b,14,0);u32(b,16,checksum);u32(b,20,bytes.length);u32(b,24,bytes.length);u16(b,28,filename.length);u16(b,30,0);u16(b,32,0);u16(b,34,0);u16(b,36,0);u32(b,38,0);u32(b,42,offset);ch.set(filename,46);
  data.push(header,bytes);central.push(ch);offset+=header.length+bytes.length;
 }
 add("[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>');
 add("_rels/.rels",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
 add("word/_rels/document.xml.rels",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
 add("word/styles.xml",stylesXML);
 add("word/document.xml",wordXML(obj));
 const cSize=central.reduce((n,b)=>n+b.length,0),end=new Uint8Array(22),e=new DataView(end.buffer);
 u32(e,0,0x06054b50);u16(e,4,0);u16(e,6,0);u16(e,8,central.length);u16(e,10,central.length);u32(e,12,cSize);u32(e,16,offset);u16(e,20,0);
 return new Blob([...data,...central,end],{type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"});
}
function download(kind){
 const obj=render();if(!obj)return;
 if(kind==="word"){blobSave(makeDocx(obj),fileName(obj,"docx"));notify("Word report downloaded. Open it in Word and run Accessibility Checker before sharing.");}
 if(kind==="html"){blobSave(new Blob([toHTML(obj)],{type:"text/html;charset=utf-8"}),fileName(obj,"html"));notify("Readable HTML report downloaded. It can be opened in a browser or shared as an attachment.");}
}
function printReport(){
 const obj=render();if(!obj)return;
 document.body.classList.add("field-share-printing");
 const cleanup=()=>{document.body.classList.remove("field-share-printing");window.removeEventListener("afterprint",cleanup);};
 window.addEventListener("afterprint",cleanup);
 notify("Use your browser print dialog to save as PDF. Check PDF reading order and tags before sharing.");
 window.print();
 window.setTimeout(cleanup,60000);
}
function openSharing(){
 panel.hidden=false;
 get("field-quick-share").setAttribute("aria-expanded","true");
 get("field-share-heading").focus({preventScroll:true});
 get("field-share-heading").scrollIntoView({block:"start"});
}
function closeSharing(){
 panel.hidden=true;get("field-quick-share").setAttribute("aria-expanded","false");
 get("field-quick-share").focus();
}
function invalidate(){
 report=null;get("field-share-report").hidden=true;
 for(const id of ["field-share-word","field-share-html","field-share-print"])get(id).disabled=true;
 get("field-share-status").textContent="Selection updated. Preview your report to review it before exporting.";
}
function init(){
 get("field-quick-save").addEventListener("click",()=>{
  const backup=get("download-json");if(!backup){notify("The backup tool is unavailable. Use the existing export controls in the notebook.");return;}
  backup.click();notify("A full editable notebook backup was requested. Check your downloads.");
 });
 get("field-quick-share").addEventListener("click",()=>panel.hidden?openSharing():closeSharing());
 get("field-share-close").addEventListener("click",closeSharing);
 get("field-share-preview-button").addEventListener("click",render);
 get("field-share-word").addEventListener("click",()=>download("word"));
 get("field-share-html").addEventListener("click",()=>download("html"));
 get("field-share-print").addEventListener("click",printReport);
 for(const el of panel.querySelectorAll('input[name="field-share-part"],input[name="field-share-audience"],#field-share-request')){
  el.addEventListener(el.tagName==="TEXTAREA"?"input":"change",invalidate);
 }
 window.addEventListener("keydown",e=>{if(e.key==="Escape"&&!panel.hidden&&panel.contains(document.activeElement)){e.preventDefault();closeSharing();}});
 window.addEventListener("field:tabchange",e=>{
  const name=e.detail?.name;if(!name)return;
  if(!returning&&name!==history.at(-1))history.push(name);
  const b=get("field-quick-return");b.disabled=history.length<2;
  b.title=b.disabled?"Visit another notebook page to enable Return":"Return to "+(history.at(-2)||"the previous page");
 });
 get("field-quick-return").addEventListener("click",()=>{
  if(history.length<2)return;
  history.pop();returning=true;
  const previous=history.at(-1);
  try{if(typeof tab==="function")tab(previous);}finally{returning=false;}
  get("field-quick-return").disabled=history.length<2;
  get("field-action-status").textContent="Returned to the previous notebook page.";
 });
 // Original tab('begin') ran before the preview scripts loaded. Its state is our first history item.
 const startTab=state.fieldNotebook?.lastTab;
 history=[["begin","explore","search","read","journal","return","biblio","writing"].includes(startTab)?startTab:"begin"];
 get("field-quick-return").disabled=true;
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();