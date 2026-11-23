/* Living Field Notebook pilot: privacy-conscious, aggregate GoatCounter counts.
   Existing GoatCounter site code reused from the original Research as Encounter.
   No names, notes, essays, terms, URLs with query strings, or visitor identifiers are sent.
   Sends count-only pixel GETs; no third-party JavaScript is loaded. */
(function(){
"use strict";
const SITE_CODE="research-as-encounter";
const OPT_OUT_KEY="rae-anonymous-usage-optout-v1"; // Shared with original Research as Encounter.
const CANONICAL_PATH="/eng112/living-field-notebook-preview";
const VALID_STAGES=new Set(["begin","explore","search","read","journal","return","biblio","writing"]);
const VALID_SPACES=new Set(["discover","research","write"]);
const ACTIONS=Object.freeze({
 "field-quick-save":["backup-requested","Requested notebook backup"],
 "field-quick-share":["share-opened","Opened selective sharing"],
 "field-share-preview-button":["share-preview-requested","Previewed selected journey report"],
 "field-share-word":["share-word-requested","Requested Word journey report"],
 "field-share-html":["share-html-requested","Requested HTML journey report"],
 "field-share-print":["share-pdf-requested","Requested print/PDF journey report"],
 "field-quick-return":["return-used","Returned to previous notebook page"]
});
const validSite=/^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$/.test(SITE_CODE);
const privacySignal=()=>navigator.doNotTrack==="1"||window.doNotTrack==="1"||navigator.globalPrivacyControl===true;
const $=id=>document.getElementById(id);
let pageRecorded=false,initDone=false;
const requests=new Set();
function isOptedOut(){try{return localStorage.getItem(OPT_OUT_KEY)==="yes";}catch(e){return true}}
function active(){return validSite&&!privacySignal()&&!isOptedOut();}
function announce(){
 const pref=$("analytics-optout"),message=$("analytics-status"),check=$("analytics-test");
 if(pref){pref.checked=isOptedOut();pref.disabled=privacySignal();}
 if(check)check.disabled=!active();
 if(!message)return;
 message.textContent=!validSite?"Usage counting is not configured. No analytics are sent.":
 privacySignal()?"Your browser's Do Not Track or Global Privacy Control preference is respected. No usage counts are sent.":
 isOptedOut()?"Anonymous usage counting is off in this browser.":
 "Anonymous visit and broad tool-use counts are enabled. No writing, searches, source titles, or personal details are sent.";
}
function count(path,title,event,callback){
 if(!active()){callback?.(false);return;}
 // Paths, events and titles are fixed and controlled here, never derived from student text.
 if(!/^(?:\/[a-z0-9/-]+|[a-z0-9-]+)$/.test(path)||path.length>100)return;
 const qs=new URLSearchParams({p:path,t:title,e:event?"1":"0",r:"",rnd:Math.random().toString(36).slice(2)});
 const img=new Image(1,1);img.referrerPolicy="no-referrer";
 requests.add(img);
 img.onload=()=>{requests.delete(img);callback?.(true)};
 img.onerror=()=>{requests.delete(img);callback?.(false)};
 img.src="https://"+SITE_CODE+".goatcounter.com/count?"+qs.toString();
}
function event(action,title){count("field-notebook-"+action,title,true);}
function page(){
 if(pageRecorded||!active())return;
 pageRecorded=true;
 count(CANONICAL_PATH,"ENG 112 · Living Field Notebook Preview",false);
}
function onClick(e){
 if(!active()||!(e.target instanceof Element))return;
 const b=e.target.closest("button");if(!b)return;
 const item=ACTIONS[b.id];if(item){if(b.id==="field-quick-share"&&b.getAttribute("aria-expanded")==="true")return;event(item[0],item[1]);return;}
 // Track only the three fixed notebook areas; no question or search text.
 if(b.dataset.fieldSpace&&VALID_SPACES.has(b.dataset.fieldSpace))
  event("space-"+b.dataset.fieldSpace,"Opened "+b.dataset.fieldSpace+" notebook space");
}
function onTab(e){
 const name=e.detail?.name;
 if(active()&&VALID_STAGES.has(name))event("stage-"+name,"Opened "+name+" notebook section");
}
const FEEDBACK=Object.freeze({
 "shown":"Feedback invitation displayed",
 "dismissed":"Feedback invitation dismissed",
 "submitted":"Notebook rating submitted",
 "rating-great":"Notebook rating: worked great",
 "rating-okay":"Notebook rating: okay",
 "rating-improve":"Notebook rating: needs improvement",
 "opened-manually":"Manual feedback panel opened"
});
function onFeedback(e){
 const kind=e.detail?.action;
 // Use only fixed categories. Never send comments or any student-generated text.
 if(active()&&Object.hasOwn(FEEDBACK,kind))event("feedback-"+kind,FEEDBACK[kind]);
}
function init(){
 if(initDone)return;initDone=true;
 const pref=$("analytics-optout"),test=$("analytics-test"),out=$("analytics-test-result");
 if(pref)pref.addEventListener("change",()=>{
   try{localStorage.setItem(OPT_OUT_KEY,pref.checked?"yes":"no");}
   catch(e){pref.checked=true;if(out)out.textContent="Unable to save your preference. Counting remains disabled where storage is blocked.";}
   if(!pref.checked)page();
   if(out&&!pref.checked)out.textContent="Usage counting is on. Your personal notebook content is not transmitted.";
   if(out&&pref.checked)out.textContent="Usage counting is off in this browser.";
   announce();
 });
 if(test)test.addEventListener("click",()=>{
   if(!active()){if(out)out.textContent="Usage counting is off or blocked by a privacy preference.";return;}
   if(out)out.textContent="Checking the GoatCounter connection…";
   count("field-notebook-diagnostic","Field Notebook analytics connection check",true,ok=>{
     if(out)out.textContent=ok?"A count-only request was delivered. Confirm it appears in your GoatCounter dashboard.":"The request failed or was blocked. Check the site code, connection, or content blockers.";
   });
 });
 document.addEventListener("click",onClick,true);
 window.addEventListener("field:tabchange",onTab);
 window.addEventListener("field:feedback-event",onFeedback);
 announce();
 page();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();