/* My Living Field Notebook | optional, non-intrusive student feedback
 * Never reads student writing, files, names, citations, or saved notebook data.
 * Only fixed, predefined rating/dismissal event names may be passed to
 * the separate GoatCounter analytics adapter (which respects opt-outs).
 * Written comments are NOT transmitted: students must copy and share explicitly.
 */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const panel=$("field-feedback-panel"),nudge=$("field-feedback-nudge");
const openButton=$("field-feedback-open"),again=$("field-feedback-again");
const dismissButton=$("field-feedback-dismiss"),nudgeDismiss=$("field-feedback-nudge-dismiss");
const nudgeOpen=$("field-feedback-nudge-open"),send=$("field-feedback-submit");
const comment=$("field-feedback-comment"),copy=$("field-feedback-copy"),status=$("field-feedback-status");
const choices=Array.from(document.querySelectorAll('input[name="field-feedback-rating"]'));
if(!panel||!nudge||!openButton||!dismissButton||!nudgeDismiss||!nudgeOpen||!send||!comment||!copy||!status||choices.length!==3)return;
const STORAGE_KEY="eng112-field-feedback-invitation-v1";
const allowed=new Set(["shown","dismissed","submitted","rating-great","rating-okay","rating-improve","opened-manually"]);
let shownThisTab=false,doneThisTab=false;
function state(){try{return localStorage.getItem(STORAGE_KEY)||"";}catch(e){return doneThisTab?"done":shownThisTab?"shown":"";}}
function remember(value){doneThisTab=(value==="submitted"||value==="dismissed");shownThisTab=true;try{localStorage.setItem(STORAGE_KEY,value);}catch(e){}}
function metric(key){
 if(allowed.has(key))window.dispatchEvent(new CustomEvent("field:feedback-event",{detail:{action:key}}));
}
function visible(value){panel.hidden=!value;openButton.setAttribute("aria-expanded",String(value));}
function scrollToPanel(){
 visible(true);nudge.hidden=true;
 const heading=$("field-feedback-title");
 heading?.focus({preventScroll:true});
 heading?.scrollIntoView({block:"start",behavior:"smooth"});
}
function markAnswered(){
 choices.forEach(x=>x.disabled=true);
 send.disabled=true;
 send.textContent="Rating already provided";
}
function openManual(){
 metric("opened-manually");scrollToPanel();
 if(state()==="submitted"){markAnswered();status.textContent="Thank you. A rating was already recorded from this browser. You can still copy an optional written note.";}
 else status.textContent="";
}
function dismiss(){
 nudge.hidden=true;visible(false);
 if(state()!=="submitted"&&state()!=="dismissed"){remember("dismissed");metric("dismissed");}
 else if(state()!=="submitted")remember("dismissed");
}
function invite(){
 if(state()||shownThisTab||!nudge.hidden||!panel.hidden)return;
 // The student has already requested an export; do not interrupt the export.
 shownThisTab=true;remember("shown");
 nudge.hidden=false;metric("shown");
}
function submitRating(){
 if(state()==="submitted"){markAnswered();status.textContent="Thank you. This browser has already submitted a rating.";return;}
 const selected=choices.find(x=>x.checked)?.value;
 if(!["great","okay","improve"].includes(selected)){status.textContent="Choose one response, or select Not now.";choices[0].focus();return;}
 remember("submitted");nudge.hidden=true;
 metric("rating-"+selected);metric("submitted");
 markAnswered();
 status.textContent="Thank you! Your rating was recorded on this device. A count-only response is sent if anonymous usage statistics are allowed in this browser. Any written comment remains here unless you copy and share it separately.";
}
async function copyComment(){
 const value=comment.value.trim();
 if(!value){status.textContent="Write a comment first, or simply submit a rating.";comment.focus();return;}
 try{
  if(!navigator.clipboard?.writeText)throw Error("Clipboard access unavailable");
  await navigator.clipboard.writeText(value);
  status.textContent="Comment copied. You can paste it into a message to your instructor if you choose. Messages you send yourself may identify you.";
 }catch(e){
  comment.focus();comment.select();
  status.textContent="Select and copy your comment manually, then share it separately if you wish. It has not been transmitted.";
 }
}
openButton.addEventListener("click",openManual);
again?.addEventListener("click",openManual);
nudgeOpen.addEventListener("click",scrollToPanel);
dismissButton.addEventListener("click",dismiss);
nudgeDismiss.addEventListener("click",dismiss);
send.addEventListener("click",submitRating);
copy.addEventListener("click",copyComment);
window.addEventListener("field:document-exported",event=>{
 // Only known successful export request categories; no arbitrary data.
 if(!["bibliography","essay","share-word","share-html"].includes(event.detail?.kind))return;
 invite();
});
if(state()==="submitted")markAnswered();
})();