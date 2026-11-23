/* Mobile-only quick-actions visibility.
 * Hide the sticky bar as the student scrolls down; show on upward scroll.
 * Non-destructive: no writing, storage keys, or analytics are accessed.
 */
(function () {
  "use strict";
  const bar=document.getElementById("field-quick-actions");
  if(!bar)return;
  const mobile=window.matchMedia("(max-width: 700px)");
  const share=document.getElementById("field-share-panel");
  const feedback=document.getElementById("field-feedback-panel");
  const MIN_SCROLL=90;
  const MOVE_THRESHOLD=14;
  let previousY=Math.max(0,window.scrollY);
  let accumulated=0;
  let scheduled=false;
  let keyboardNavigating=false;
  function panelOpen(){
    return (!!share&&!share.hidden)||(!!feedback&&!feedback.hidden);
  }
  function show(){
    bar.classList.remove("is-mobile-hidden");
    bar.inert=false;
    bar.removeAttribute("aria-hidden");
  }
  function hide(){
    if(keyboardNavigating&&bar.contains(document.activeElement))return;
    bar.classList.add("is-mobile-hidden");
    bar.inert=true;
    bar.setAttribute("aria-hidden","true");
  }
  function measure(){
    scheduled=false;
    const currentY=Math.max(0,window.scrollY);
    const delta=currentY-previousY;
    previousY=currentY;
    if(!mobile.matches||currentY<MIN_SCROLL||panelOpen()||(keyboardNavigating&&bar.contains(document.activeElement))){
      accumulated=0;
      show();
      return;
    }
    if(delta===0)return;
    if(accumulated!==0&&Math.sign(delta)!==Math.sign(accumulated))accumulated=0;
    accumulated+=delta;
    if(accumulated>=MOVE_THRESHOLD){
      // Don't hide until the controls have reached their sticky position.
      if(bar.getBoundingClientRect().top<=2)hide();
      accumulated=0;
    }else if(accumulated<=-MOVE_THRESHOLD){
      show();
      accumulated=0;
    }
  }
  function requestMeasure(){
    if(scheduled)return;
    scheduled=true;
    window.requestAnimationFrame(measure);
  }
  window.addEventListener("scroll",requestMeasure,{passive:true});
  window.addEventListener("resize",()=>{
    previousY=Math.max(0,window.scrollY);
    accumulated=0;
    if(!mobile.matches)show();
    requestMeasure();
  },{passive:true});
  document.addEventListener("keydown",event=>{
    if(["Tab","ArrowUp","ArrowDown","Home","End"].includes(event.key))keyboardNavigating=true;
  });
  window.addEventListener("pointerdown",()=>{keyboardNavigating=false;},{passive:true});
  document.addEventListener("focusin",event=>{
    if(bar.contains(event.target))show();
  });
  document.getElementById("field-quick-share")?.addEventListener("click",show);
  document.getElementById("field-feedback-open")?.addEventListener("click",show);
  // If the viewport moves to a section programmatically, preserve access.
  window.addEventListener("field:tabchange",()=>{
    accumulated=0;
    show();
    previousY=Math.max(0,window.scrollY);
  });
  requestMeasure();
})();